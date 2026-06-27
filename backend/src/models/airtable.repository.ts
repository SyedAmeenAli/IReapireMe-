import Airtable from 'airtable';
import mongoose, { Schema, Document } from 'mongoose';
import { assertCatalogWriteAllowed } from '../config/airtable.config';

const baseInstances = new Map<string, any>();
export function getBaseInstance(baseId: string) {
  if (!baseId) return null;
  if (baseInstances.has(baseId)) return baseInstances.get(baseId);

  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!apiKey) return null;
  const airtable = new Airtable({ apiKey });
  const instance = airtable.base(baseId);
  baseInstances.set(baseId, instance);
  return instance;
}

function getTransactionalBase() {
  const transBaseId = process.env.AIRTABLE_BASE_ID || '';
  return getBaseInstance(transBaseId);
}

// MongoDB Schema for capturing failed Airtable writes during the parallel evaluation window
export interface IFailedWrite extends Document {
  tableName: string;
  action: 'create' | 'update' | 'delete';
  payload: string;
  recordId?: string;
  error: string;
  createdAt: Date;
}

const FailedWriteSchema = new Schema({
  tableName: { type: String, required: true },
  action: { type: String, required: true, enum: ['create', 'update', 'delete'] },
  payload: { type: String, required: true },
  recordId: { type: String },
  error: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const FailedWriteModel = mongoose.models.FailedAirtableWrite || mongoose.model<IFailedWrite>('FailedAirtableWrite', FailedWriteSchema);

// Throttler Queue (Unified for all reads & writes to Transactional Base)
interface QueueItem {
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

const requestQueue: QueueItem[] = [];
let isProcessingQueue = false;
const QUEUE_MAX_LIMIT = 100;
const RATE_LIMIT_SPACING_MS = 250; // 4 req/sec maximum (leaves budget for other calls)

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const item = requestQueue.shift();
    if (item) {
      try {
        const result = await item.fn();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
      // Wait to respect the 250ms rate limit spacing
      await new Promise(res => setTimeout(res, RATE_LIMIT_SPACING_MS));
    }
  }

  isProcessingQueue = false;
}

// Queue execution helper with backpressure
export function enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
  if (requestQueue.length >= QUEUE_MAX_LIMIT) {
    return Promise.reject(new Error('503: Service Unavailable - Airtable request queue is full. Please try again.'));
  }

  return new Promise<T>((resolve, reject) => {
    requestQueue.push({ fn, resolve, reject });
    processQueue();
  });
}

// Global count of pending writes in MongoDB failed-write log
export async function getPendingFailedWritesCount(): Promise<number> {
  try {
    return await FailedWriteModel.countDocuments();
  } catch (err) {
    console.error('Failed to query FailedAirtableWrite collection count:', err);
    return 0;
  }
}

// Transient Error Retry Policy with Exponential Backoff
async function executeWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error.statusCode;
    const isTransient = status === 429 || status === 502 || status === 503 || status === 504 ||
      error.message?.includes('timeout') || error.message?.includes('Network Error');

    if (retries > 0 && isTransient) {
      console.warn(`[Airtable Retry] Transient error encountered: ${error.message}. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return executeWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Log writes that ultimately fail Airtable insertion to MongoDB
async function logFailedWrite(tableName: string, action: 'create' | 'update' | 'delete', payload: any, recordId?: string, errorMsg?: string) {
  try {
    const failedWrite = new FailedWriteModel({
      tableName,
      action,
      payload: JSON.stringify(payload),
      recordId,
      error: errorMsg || 'Unknown Airtable write failure'
    });
    await failedWrite.save();
    console.log(`[Airtable Queue] Write failure logged to MongoDB for table ${tableName}`);
  } catch (err) {
    console.error('[Airtable Queue] CRITICAL: Failed to write to FailedAirtableWrite collection in MongoDB:', err);
  }
}

// Helper to construct Airtable formulas from simple query objects
export function buildFormula(query: any): string {
  const keys = Object.keys(query);
  if (keys.length === 0) return '';

  const formulas = keys.map(key => {
    const value = query[key];
    if (typeof value === 'string') {
      return `{${key}} = '${value.replace(/'/g, "\\'")}'`;
    } else if (typeof value === 'boolean') {
      return `{${key}} = ${value ? '1' : '0'}`;
    } else if (value === null || value === undefined) {
      return `{${key}} = ''`;
    } else {
      return `{${key}} = ${value}`;
    }
  });

  return formulas.length === 1 ? formulas[0] : `AND(${formulas.join(', ')})`;
}

// Define chainable single-query wrapper for findById and findOne
export class HybridSingleQuery<T> implements PromiseLike<T | null> {
  private promise: Promise<T | null>;
  private mongooseQuery: any = null;
  private transform?: (doc: any) => any;

  constructor(promise: Promise<T | null>, mongooseQuery?: any, transform?: (doc: any) => any) {
    this.promise = promise;
    this.mongooseQuery = mongooseQuery;
    this.transform = transform;
  }

  select(fields: string): this {
    if (this.mongooseQuery) {
      this.mongooseQuery.select(fields);
      this.promise = this.mongooseQuery.exec().then((doc: any) => {
        const obj = doc ? doc.toObject() : null;
        return this.transform && obj ? this.transform(obj) : obj;
      });
    } else {
      this.promise = this.promise.then(doc => {
        if (!doc) return null;
        const mapped = { ...doc };
        if (typeof fields === 'string') {
          const excludes = fields.split(' ').filter(f => f.startsWith('-')).map(f => f.substring(1));
          excludes.forEach(f => delete (mapped as any)[f]);
        }
        return mapped;
      });
    }
    return this;
  }

  then<TResult1 = T | null, TResult2 = never>(
    onfulfilled?: ((value: T | null) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }
}

// Define chainable multi-query wrapper for find
export class HybridQuery<T> implements PromiseLike<T[]> {
  private promise: Promise<T[]>;
  private mongooseQuery: any = null;
  private transform?: (doc: any) => any;

  constructor(promise: Promise<T[]>, mongooseQuery?: any, transform?: (doc: any) => any) {
    this.promise = promise;
    this.mongooseQuery = mongooseQuery;
    this.transform = transform;
  }

  sort(sortOptions: any): this {
    if (this.mongooseQuery) {
      this.mongooseQuery.sort(sortOptions);
      this.promise = this.mongooseQuery.exec().then((docs: any[]) => {
        const objects = docs.map(d => d.toObject());
        return this.transform ? objects.map(this.transform) : objects;
      });
    } else {
      this.promise = this.promise.then(docs => {
        const sortKeys = Object.keys(sortOptions);
        if (sortKeys.length > 0) {
          const sortKey = sortKeys[0];
          const direction = sortOptions[sortKey];
          docs.sort((a: any, b: any) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            if (valA === valB) return 0;
            if (valA === undefined || valA === null) return direction === -1 ? 1 : -1;
            if (valB === undefined || valB === null) return direction === -1 ? -1 : 1;
            return direction === -1 ? (valA < valB ? 1 : -1) : (valA > valB ? 1 : -1);
          });
        }
        return docs;
      });
    }
    return this;
  }

  select(fields: string): this {
    if (this.mongooseQuery) {
      this.mongooseQuery.select(fields);
      this.promise = this.mongooseQuery.exec().then((docs: any[]) => {
        const objects = docs.map(d => d.toObject());
        const transformed = this.transform ? objects.map(this.transform) : objects;
        return transformed.map(doc => {
          if (!doc) return doc;
          const mapped = { ...doc };
          if (typeof fields === 'string') {
            const excludes = fields.split(' ').filter(f => f.startsWith('-')).map(f => f.substring(1));
            excludes.forEach(f => delete (mapped as any)[f]);

            const includes = fields.split(' ').filter(f => !f.startsWith('-') && f.trim() !== '');
            if (includes.length > 0) {
              const selected: any = {};
              includes.forEach(f => {
                selected[f] = (mapped as any)[f];
              });
              if ((mapped as any).id !== undefined) selected.id = (mapped as any).id;
              if ((mapped as any)._id !== undefined) selected._id = (mapped as any)._id;
              return selected;
            }
          }
          return mapped;
        });
      });
    } else {
      this.promise = this.promise.then(docs => {
        return docs.map(doc => {
          if (!doc) return doc;
          const mapped = { ...doc };
          if (typeof fields === 'string') {
            const excludes = fields.split(' ').filter(f => f.startsWith('-')).map(f => f.substring(1));
            excludes.forEach(f => delete (mapped as any)[f]);

            const includes = fields.split(' ').filter(f => !f.startsWith('-') && f.trim() !== '');
            if (includes.length > 0) {
              const selected: any = {};
              includes.forEach(f => {
                selected[f] = (mapped as any)[f];
              });
              if ((mapped as any).id !== undefined) selected.id = (mapped as any).id;
              if ((mapped as any)._id !== undefined) selected._id = (mapped as any)._id;
              return selected;
            }
          }
          return mapped;
        });
      });
    }
    return this;
  }

  then<TResult1 = T[], TResult2 = never>(
    onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }
}

// General-purpose transactional repository class
export class AirtableRepository<T> {
  private tableName: string;
  private baseId: string;
  private schemaValidator?: (data: any) => void;

  constructor(tableName: string, validator?: (data: any) => void, baseId?: string) {
    this.tableName = tableName;
    this.baseId = baseId || process.env.AIRTABLE_BASE_ID || '';
    this.schemaValidator = validator;
  }

  // Convert Airtable record to mongoose-like structure
  private mapRecord(record: any): any {
    if (!record) return null;
    const fields = { ...record.fields };

    // Deserialize stringified JSON fields back to arrays/objects
    for (const key of Object.keys(fields)) {
      const val = fields[key];
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try {
          fields[key] = JSON.parse(val);
        } catch (e) { }
      }
    }

    return {
      id: record.id,
      _id: record.id,
      ...fields,
      createdAt: fields.createdAt ? new Date(fields.createdAt) : undefined,
      updatedAt: fields.updatedAt ? new Date(fields.updatedAt) : undefined,
    };
  }

  // Sanitize fields before sending to Airtable
  private sanitizeFields(data: any): any {
    const fields = { ...data };
    delete fields._id;
    delete fields.id;
    delete fields.createdAt;
    delete fields.updatedAt;
    delete fields.__v;

    // Serialize nested objects/arrays to JSON string to fit in Airtable Text fields
    for (const key of Object.keys(fields)) {
      const val = fields[key];
      if (val && typeof val === 'object') {
        if (val.constructor && val.constructor.name === 'ObjectId') {
          fields[key] = val.toString();
        } else {
          fields[key] = JSON.stringify(val);
        }
      }
    }
    return fields;
  }

  async find(query: any = {}): Promise<any[]> {
    const formula = buildFormula(query);
    return enqueueRequest(async () => {
      const base = getBaseInstance(this.baseId);
      if (!base) throw new Error(`Airtable Base ${this.baseId} is not initialized`);
      const selectParams: any = {};
      if (formula) {
        selectParams.filterByFormula = formula;
      }
      const records = (await executeWithRetry(() =>
        base(this.tableName).select(selectParams).all()
      )) as any[];
      return records.map((r: any) => this.mapRecord(r));
    });
  }

  async findOne(query: any = {}): Promise<any | null> {
    const records = await this.find(query);
    return records.length > 0 ? records[0] : null;
  }

  async findById(id: string): Promise<any | null> {
    if (!id || typeof id !== 'string' || !id.startsWith('rec')) return null;
    return enqueueRequest(async () => {
      const base = getBaseInstance(this.baseId);
      if (!base) throw new Error(`Airtable Base ${this.baseId} is not initialized`);
      try {
        const record = await executeWithRetry(() => base(this.tableName).find(id));
        return this.mapRecord(record);
      } catch (err: any) {
        if (err.statusCode === 404) return null;
        throw err;
      }
    });
  }

  async create(data: any): Promise<any> {
    assertCatalogWriteAllowed(this.baseId);
    if (this.schemaValidator) {
      this.schemaValidator(data);
    }
    const fields = this.sanitizeFields(data);
    fields.createdAt = new Date().toISOString();
    fields.updatedAt = new Date().toISOString();

    try {
      const createdRecord = await enqueueRequest(async () => {
        const base = getBaseInstance(this.baseId);
        if (!base) throw new Error(`Airtable Base ${this.baseId} is not initialized`);
        return executeWithRetry(() => base(this.tableName).create(fields, { typecast: true }));
      });
      return this.mapRecord(createdRecord);
    } catch (err: any) {
      console.error(`[Airtable Repository] Create failed in table ${this.tableName}:`, err.message);
      // Log to MongoDB failed writes collection for dual-write parity and reconciliation
      await logFailedWrite(this.tableName, 'create', data, undefined, err.message);
      throw err;
    }
  }

  async findByIdAndUpdate(id: string, updateData: any, options: any = {}): Promise<any | null> {
    if (!id || typeof id !== 'string' || !id.startsWith('rec')) return null;
    assertCatalogWriteAllowed(this.baseId);
    if (this.schemaValidator) {
      this.schemaValidator(updateData);
    }
    const fields = this.sanitizeFields(updateData);
    fields.updatedAt = new Date().toISOString();

    try {
      const updatedRecord = await enqueueRequest(async () => {
        const base = getBaseInstance(this.baseId);
        if (!base) throw new Error(`Airtable Base ${this.baseId} is not initialized`);
        return executeWithRetry(() => base(this.tableName).update(id, fields, { typecast: true }));
      });
      return this.mapRecord(updatedRecord);
    } catch (err: any) {
      console.error(`[Airtable Repository] Update failed for record ${id} in table ${this.tableName}:`, err.message);
      // Log to MongoDB failed writes collection for dual-write parity and reconciliation
      await logFailedWrite(this.tableName, 'update', updateData, id, err.message);
      throw err;
    }
  }

  async findOneAndUpdate(query: any, updateData: any, options: any = {}): Promise<any | null> {
    const record = await this.findOne(query);
    if (!record) return null;
    return this.findByIdAndUpdate(record.id, updateData, options);
  }

  async delete(id: string): Promise<any | null> {
    if (!id || typeof id !== 'string' || !id.startsWith('rec')) return null;
    assertCatalogWriteAllowed(this.baseId);
    try {
      const deletedRecord = (await enqueueRequest(async () => {
        const base = getBaseInstance(this.baseId);
        if (!base) throw new Error(`Airtable Base ${this.baseId} is not initialized`);
        return executeWithRetry(() => base(this.tableName).destroy(id));
      })) as any;
      return { id: deletedRecord.id };
    } catch (err: any) {
      console.error(`[Airtable Repository] Delete failed for record ${id} in table ${this.tableName}:`, err.message);
      await logFailedWrite(this.tableName, 'delete', {}, id, err.message);
      throw err;
    }
  }
}
