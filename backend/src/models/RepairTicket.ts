import mongoose, { Document, Schema } from 'mongoose';
import { AirtableRepository, HybridQuery, HybridSingleQuery } from './airtable.repository';

export enum RepairStatus {
  PENDING = 'PENDING',
  DIAGNOSING = 'DIAGNOSING',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_PARTS = 'WAITING_FOR_PARTS',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
}

export interface IRepairTicket extends Document {
  ticketId: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceType: string;
  brand: string;
  deviceModel: string;
  issueDescription: string;
  status: RepairStatus;
  estimatedCost?: number;
  serviceMode: 'walkin' | 'courier';
  scheduledDate?: string;
  scheduledSlot?: string;
  address?: string;
  deliveryFee: number;
  borzoOrderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  repairshoprTicketId?: string;
  repairshoprCustomerId?: string;
  source: 'website_booking' | 'admin_manual' | 'query_widget' | 'repairshopr_import' | 'repairshopr_pull';
  forceCreated?: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RepairTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    userId: { type: String }, // Store as string reference for hybrid simplicity
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    deviceType: { type: String, required: true },
    brand: { type: String, required: true },
    deviceModel: { type: String, required: true },
    issueDescription: { type: String, required: true },
    status: { type: String, enum: Object.values(RepairStatus), default: RepairStatus.PENDING },
    estimatedCost: { type: Number, default: 0 },
    serviceMode: { type: String, enum: ['walkin', 'courier'], default: 'walkin' },
    scheduledDate: { type: String },
    scheduledSlot: { type: String },
    address: { type: String },
    deliveryFee: { type: Number, default: 0 },
    borzoOrderId: { type: String },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    repairshoprTicketId: { type: String },
    repairshoprCustomerId: { type: String },
    source: { type: String, enum: ['website_booking', 'admin_manual', 'query_widget', 'repairshopr_import', 'repairshopr_pull'], default: 'website_booking' },
    forceCreated: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const MongooseRepairTicketModel = mongoose.models.RepairTicket || mongoose.model<IRepairTicket>('RepairTicket', RepairTicketSchema);

const tableName = process.env.AIRTABLE_TABLE_REPAIR_TICKETS || 'tickets';
const airtableRepairRepo = new AirtableRepository<IRepairTicket>(tableName);

const MONGO_ONLY_FIELDS = [
  'repairshoprTicketId',
  'repairshoprCustomerId',
  'source',
  'forceCreated',
  'createdBy',
  'razorpayOrderId',
  'razorpayPaymentId',
  'razorpaySignature',
  'borzoOrderId'
];

function hasMongoOnlyFields(query: any): boolean {
  if (!query) return false;
  return Object.keys(query).some(key => MONGO_ONLY_FIELDS.includes(key));
}

function isMongoQuery(query: any): boolean {
  if (!query) return false;
  return Object.values(query).some(value => value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date));
}

function sanitizeAirtablePayload(data: any): any {
  const sanitized = { ...data };
  MONGO_ONLY_FIELDS.forEach(field => delete (sanitized as any)[field]);
  return sanitized;
}

class HybridRepairTicket {
  id?: string;
  _id?: string;
  ticketId!: string;
  userId?: string;
  customerName!: string;
  customerPhone!: string;
  customerEmail!: string;
  deviceType!: string;
  brand!: string;
  deviceModel!: string;
  issueDescription!: string;
  status!: RepairStatus;
  estimatedCost?: number;
  serviceMode!: 'walkin' | 'courier';
  scheduledDate?: string;
  scheduledSlot?: string;
  address?: string;
  deliveryFee!: number;
  borzoOrderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  repairshoprTicketId?: string;
  repairshoprCustomerId?: string;
  source!: 'website_booking' | 'admin_manual' | 'query_widget' | 'repairshopr_import' | 'repairshopr_pull';
  forceCreated?: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: any) {
    Object.assign(this, data);
  }

  async save(): Promise<this> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    const cleanData = { ...this };
    delete (cleanData as any).save;

    if (useAirtable) {
      const airtablePayload = sanitizeAirtablePayload(cleanData);
      if (this.id && this.id.startsWith('rec')) {
        const updated = await airtableRepairRepo.findByIdAndUpdate(this.id, airtablePayload);
        Object.assign(this, updated);
      } else {
        const created = await airtableRepairRepo.create(airtablePayload);
        Object.assign(this, created);
      }

      // Background dual-write
      MongooseRepairTicketModel.findOne({ ticketId: this.ticketId }).exec().then(existing => {
        const payload = {
          ticketId: this.ticketId,
          userId: this.userId,
          customerName: this.customerName,
          customerPhone: this.customerPhone,
          customerEmail: this.customerEmail,
          deviceType: this.deviceType,
          brand: this.brand,
          deviceModel: this.deviceModel,
          issueDescription: this.issueDescription,
          status: this.status,
          estimatedCost: this.estimatedCost,
          serviceMode: this.serviceMode,
          scheduledDate: this.scheduledDate,
          scheduledSlot: this.scheduledSlot,
          address: this.address,
          deliveryFee: this.deliveryFee,
          borzoOrderId: this.borzoOrderId,
          razorpayOrderId: this.razorpayOrderId,
          razorpayPaymentId: this.razorpayPaymentId,
          razorpaySignature: this.razorpaySignature,
          repairshoprTicketId: this.repairshoprTicketId,
          repairshoprCustomerId: this.repairshoprCustomerId,
          source: this.source,
          forceCreated: this.forceCreated,
          createdBy: this.createdBy
        };
        if (existing) {
          MongooseRepairTicketModel.findByIdAndUpdate(existing.id, payload).exec().catch(() => { });
        } else {
          new MongooseRepairTicketModel(payload).save().catch(() => { });
        }
      }).catch(() => { });
    } else {
      let mongoDoc;
      if (this._id && !String(this._id).startsWith('rec')) {
        mongoDoc = await MongooseRepairTicketModel.findByIdAndUpdate(this._id, cleanData, { new: true });
      } else {
        const newDoc = new MongooseRepairTicketModel(cleanData);
        mongoDoc = await newDoc.save();
      }
      Object.assign(this, mongoDoc.toObject());
    }
    return this;
  }
}

const RepairTicketFacade = {
  find(query: any = {}): HybridQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable && !hasMongoOnlyFields(query) && !isMongoQuery(query)) {
      if (query._id) {
        return new HybridQuery(airtableRepairRepo.findById(query._id).then(r => r ? [r] : []));
      }
      return new HybridQuery(airtableRepairRepo.find(query));
    } else {
      return new HybridQuery(MongooseRepairTicketModel.find(query).exec(), MongooseRepairTicketModel.find(query));
    }
  },

  findOne(query: any = {}): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable && !hasMongoOnlyFields(query) && !isMongoQuery(query)) {
      if (query._id) {
        return new HybridSingleQuery(airtableRepairRepo.findById(query._id));
      }
      return new HybridSingleQuery(airtableRepairRepo.findOne(query));
    } else {
      return new HybridSingleQuery(MongooseRepairTicketModel.findOne(query).exec(), MongooseRepairTicketModel.findOne(query));
    }
  },

  findById(id: string): HybridSingleQuery<any> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      return new HybridSingleQuery(airtableRepairRepo.findById(id));
    } else {
      return new HybridSingleQuery(MongooseRepairTicketModel.findById(id).exec(), MongooseRepairTicketModel.findById(id));
    }
  },

  findByIdAndUpdate(id: string, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      MongooseRepairTicketModel.findByIdAndUpdate(id, update).exec().catch(() => { });
      const airtablePayload = sanitizeAirtablePayload(update);
      return airtableRepairRepo.findByIdAndUpdate(id, airtablePayload);
    } else {
      return MongooseRepairTicketModel.findByIdAndUpdate(id, update, { new: true }).exec().then(doc => doc ? doc.toObject() : null);
    }
  },

  findOneAndUpdate(query: any, update: any, options: any = {}): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      MongooseRepairTicketModel.findOneAndUpdate(query, update).exec().catch(() => { });
      const airtablePayload = sanitizeAirtablePayload(update);
      return airtableRepairRepo.findOneAndUpdate(query, airtablePayload);
    } else {
      return MongooseRepairTicketModel.findOneAndUpdate(query, update, { new: true }).exec().then(doc => doc ? doc.toObject() : null);
    }
  },

  findByIdAndDelete(id: string): Promise<any | null> {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    if (useAirtable) {
      MongooseRepairTicketModel.findByIdAndDelete(id).exec().catch(() => { });
      return airtableRepairRepo.delete(id);
    } else {
      return MongooseRepairTicketModel.findByIdAndDelete(id).exec().then(doc => doc ? doc.toObject() : null);
    }
  }
};

const RepairTicketConstructor = function (this: any, data: any) {
  return new HybridRepairTicket(data);
} as any as {
  new(data: any): HybridRepairTicket;
  find(query?: any): HybridQuery<any>;
  findOne(query?: any): HybridSingleQuery<any>;
  findById(id: string): HybridSingleQuery<any>;
  findByIdAndUpdate(id: string, update: any, options?: any): Promise<any | null>;
  findOneAndUpdate(query: any, update: any, options?: any): Promise<any | null>;
  findByIdAndDelete(id: string): Promise<any | null>;
};

Object.assign(RepairTicketConstructor, RepairTicketFacade);

export default RepairTicketConstructor;
