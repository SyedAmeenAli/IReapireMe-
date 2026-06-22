/// <reference types="node" />
import Airtable from 'airtable';
import mongoose from 'mongoose';
import { enqueueRequest } from '../models/airtable.repository';
import logger from '../utils/logger';

// Base instances for read and write path isolation
let readBaseInstance: any = null;
let writeBaseInstance: any = null;

function getCatalogBase(isWrite = false) {
  const apiKey = isWrite
    ? (process.env.AIRTABLE_API_KEY_WRITE || process.env.AIRTABLE_API_KEY)
    : (process.env.AIRTABLE_API_KEY_READ || process.env.AIRTABLE_API_KEY);
  const catalogBaseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !catalogBaseId) return null;

  if (isWrite) {
    if (writeBaseInstance) return writeBaseInstance;
    writeBaseInstance = new Airtable({ apiKey }).base(catalogBaseId);
    return writeBaseInstance;
  } else {
    if (readBaseInstance) return readBaseInstance;
    readBaseInstance = new Airtable({ apiKey }).base(catalogBaseId);
    return readBaseInstance;
  }
}

// Environment Configurable Whitelists
const DEFAULT_TABLE_KEYS = [
  'iphone-service',
  'macbook-services',
  'android-services',
  'display',
  'battery',
  'charging-port',
  'back-glass',
  'earspeaker',
  'loudspeaker',
  'rear-camera',
  'front-camera',
  'camera-glass',
  'housing',
  'proximity-sensor',
  'macbook-display',
  'android-display',
  'android-battery',
  'android-charging-port',
  'android-back-glass'
];

/**
 * tableKeys whitelist block comment:
 * - This array specifies the exact names of Airtable tables that the backend is allowed to fetch or modify.
 * - Format: Standard Airtable table names as lowercased string slugs matching the base schema exactly.
 * - Any new parts tables (e.g. "face-id") must be added to this configuration array to be parsed or updated.
 * - Permission: Only backend engineers should modify this config list.
 */
export const tableKeys: string[] = process.env.AIRTABLE_TABLE_KEYS
  ? process.env.AIRTABLE_TABLE_KEYS.split(',').map(s => s.trim())
  : DEFAULT_TABLE_KEYS;

const DEFAULT_DEVICE_SERVICE_TABLES = ['iphone-service', 'macbook-services', 'android-services'];
const DEVICE_SERVICE_TABLES = process.env.AIRTABLE_DEVICE_SERVICE_TABLES
  ? process.env.AIRTABLE_DEVICE_SERVICE_TABLES.split(',').map(s => s.trim())
  : DEFAULT_DEVICE_SERVICE_TABLES;

// SWR Cache Structure
interface PricingMetadata {
  tableName: string;
  recordId: string;
  fieldName: string;
}

interface ResolvedPricingEntry {
  id: string;
  deviceType: string;
  brand: string;
  deviceModel: string;
  service: string;
  price: number;
  estimatedTime: string;
  warrantyDays: number;
  inStock: boolean;
}

interface CachedCatalog {
  data: ResolvedPricingEntry[];
  metadata: Map<string, PricingMetadata>;
  fetchedAt: number;
}

let catalogCache: CachedCatalog | null = null;
let activeRefreshPromise: Promise<CachedCatalog> | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes SWR cache window

// Explicit override mapping for well-known columns to keep names stable
const SERVICE_NAME_OVERRIDES: Record<string, string> = {
  "iphone display": "Screen Replacement",
  "macbook display": "Screen Replacement",
  "android display": "Screen Replacement",
  "iphone battery": "Battery Replacement",
  "android battery": "Battery Replacement",
  "iphone charging port": "Charging Port Repair",
  "android charging port": "Charging Port Repair",
  "iphone back glass": "Back Glass Replacement",
  "android back glass": "Back Glass Replacement",
  "iphone earspeaker": "Earspeaker Replacement",
  "iphone loudspeaker": "Loudspeaker Replacement",
  "iphone rear camera": "Rear Camera Repair",
  "iphone front camera": "Front Camera Repair",
  "iphone camera glass": "Camera Glass Replacement",
  "iphone housing / side frame": "Housing / Side Frame Repair",
  "iphone proximity flex": "Proximity Sensor Repair",
  "iphone proximity sensor flex": "Proximity Sensor Repair"
};

// Health stats exporter
export function getCacheHealth() {
  return {
    isWarmed: catalogCache !== null,
    ageSeconds: catalogCache ? Math.floor((Date.now() - catalogCache.fetchedAt) / 1000) : null,
    isRefreshing: activeRefreshPromise !== null
  };
}

// Manually flush the cache
export function flushCache(): void {
  catalogCache = null;
  activeRefreshPromise = null;
  logger.info('[SWR Cache] Cache flushed successfully.');
}

// Helper to parse warranty string into numeric days (e.g. "90 Days" -> 90)
function parseWarrantyDays(warrantyStr: any): number {
  if (warrantyStr === null || warrantyStr === undefined) return 90;
  const str = String(warrantyStr).toLowerCase();
  const digits = parseInt(str.replace(/\D/g, ''));
  if (isNaN(digits)) return 90;
  if (str.includes('year')) return digits * 365;
  if (str.includes('month')) return digits * 30;
  return digits;
}

// Request Timeout and Exponential Backoff Retry Runner
async function executeWithRetryAndTimeout<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  timeoutMs = 10000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Airtable request timeout (10s)')), timeoutMs)
  );

  try {
    return await Promise.race([fn(), timeoutPromise]);
  } catch (error: any) {
    if (retries > 0) {
      logger.warn(`[serviceResolver Retry] Attempt failed. Retrying...`, {
        error: error.message,
        retriesRemaining: retries,
        nextDelayMs: delay
      });
      await new Promise(res => setTimeout(res, delay));
      return executeWithRetryAndTimeout(fn, retries - 1, delay * 2, timeoutMs);
    }
    throw error;
  }
}

// Capped Concurrency Promise Runner to respect Airtable Rate limits
async function runCappedPromises<T>(tasks: (() => Promise<T>)[], limit: number): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];
  const executing: Promise<any>[] = [];

  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    const index = results.length;
    results.push(null as any); // placeholder

    const wrap = p.then(
      value => { results[index] = { status: 'fulfilled', value }; },
      reason => { results[index] = { status: 'rejected', reason }; }
    ).then(() => {
      const idx = executing.indexOf(wrap);
      if (idx !== -1) executing.splice(idx, 1);
    });

    executing.push(wrap);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

// Parallel fetch with individual catches for fault isolation
async function fetchTableSafe(tableName: string): Promise<Map<string, any>> {
  try {
    return await enqueueRequest(async () => {
      const base = getCatalogBase(false);
      if (!base) throw new Error('Airtable Catalog Base is not initialized');
      
      const records = await executeWithRetryAndTimeout(async () => {
        return await base(tableName).select().all();
      });

      const map = new Map<string, any>();
      records.forEach((r: any) => map.set(r.id, r.fields));
      return map;
    });
  } catch (err: any) {
    logger.error('Failed to fetch Airtable table safely', { tableName, error: err.message });
    return new Map<string, any>(); // return empty map to allow other tables to resolve
  }
}

// Schema Drift Check
function performSchemaDriftCheck(tables: Map<string, Map<string, any>>) {
  const iphoneTable = tables.get('iphone-service');
  if (iphoneTable && iphoneTable.size > 0) {
    const firstRowFields = Array.from(iphoneTable.values())[0];
    const presentKeys = Object.keys(firstRowFields).map(k => k.toLowerCase().trim());
    const missing = ['devices', 'iphone display', 'iphone battery'].filter(req => !presentKeys.includes(req));
    if (missing.length > 0) {
      logger.error('CRITICAL: Airtable schema column drift detected! Missing expected columns.', { missing });
    }
  }
}

// Service Name Builder with Override Lookup and Inference Suffix rules
export function resolveServiceName(columnName: string, priceKey: string): string {
  const normColumn = columnName.toLowerCase().trim();

  // Try configured overrides first
  if (SERVICE_NAME_OVERRIDES[normColumn]) {
    const baseName = SERVICE_NAME_OVERRIDES[normColumn];
    if (priceKey === 'Original') return `${baseName} (Original)`;
    if (priceKey === 'Compatible') return `${baseName} (Compatible)`;
    if (priceKey === 'Service Pack') return `${baseName} (Service Pack)`;
    if (priceKey === 'OEM') return `${baseName} (OEM)`;
    if (priceKey === 'LCD Only') return `${baseName} (LCD Only)`;
    return `${baseName} (${priceKey})`;
  }

  // Fallback keyword-based suffix inference
  logger.warn('Fallback keyword service name resolution triggered', { columnName, priceKey });

  let cleanName = columnName
    .replace(/^(iphone|macbook|android)\s+/i, '')
    .trim();

  let suffix = 'Replacement';
  const cleanNameLower = cleanName.toLowerCase();
  if (
    cleanNameLower.includes('sensor') ||
    cleanNameLower.includes('port') ||
    cleanNameLower.includes('camera') ||
    cleanNameLower.includes('glass')
  ) {
    if (cleanNameLower.includes('glass') && !cleanNameLower.includes('camera')) {
      suffix = 'Replacement';
    } else {
      suffix = 'Repair';
    }
  }

  if (cleanNameLower.endsWith('repair') || cleanNameLower.endsWith('replacement')) {
    suffix = '';
  }

  const baseName = suffix ? `${cleanName} ${suffix}` : cleanName;

  if (priceKey === 'Original') return `${baseName} (Original)`;
  if (priceKey === 'Compatible') return `${baseName} (Compatible)`;
  if (priceKey === 'Service Pack') return `${baseName} (Service Pack)`;
  if (priceKey === 'OEM') return `${baseName} (OEM)`;
  if (priceKey === 'LCD Only') return `${baseName} (LCD Only)`;
  return `${baseName} (${priceKey})`;
}

// Dynamic relation lookup and resolving catalog compiler
async function fetchAndResolveCatalog(): Promise<CachedCatalog> {
  const base = getCatalogBase(false);
  if (!base) throw new Error('Airtable Catalog Base is not configured');

  logger.info('Starting parallel dynamic resolution of relational Airtable catalog...');

  const fetchTasks = tableKeys.map(tableName => () => fetchTableSafe(tableName));
  const settledResults = await runCappedPromises(fetchTasks, 4);

  const tables = new Map<string, Map<string, any>>();
  tableKeys.forEach((key, index) => {
    const res = settledResults[index];
    if (res.status === 'fulfilled') {
      tables.set(key, res.value);
    } else {
      tables.set(key, new Map<string, any>());
    }
  });

  // Check for schema modifications
  performSchemaDriftCheck(tables);

  const data: ResolvedPricingEntry[] = [];
  const metadata = new Map<string, PricingMetadata>();

  // Process index device rows dynamically
  for (const tableName of DEVICE_SERVICE_TABLES) {
    const serviceMap = tables.get(tableName);
    if (!serviceMap) continue;

    const inferredDeviceType = tableName.replace(/-service(s)?/, '').toLowerCase();

    for (const [rowId, rowFields] of serviceMap.entries()) {
      const deviceModel = rowFields['Devices'] || rowFields['devices'];
      if (!deviceModel) continue;

      let brand = rowFields['Brand'] || rowFields['brand'];
      if (!brand) {
        if (inferredDeviceType === 'iphone' || inferredDeviceType === 'macbook') {
          brand = 'Apple';
        } else {
          logger.error('Android/other service record missing required Brand field. Skipping row.', { deviceModel, tableName });
          continue;
        }
      }

      // Loop through column fields dynamically
      for (const [key, value] of Object.entries(rowFields)) {
        const normKey = key.toLowerCase();
        if (normKey === 'devices' || normKey === 'brand') continue;

        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && value[0].startsWith('rec')) {
          const linkedId = value[0];

          // Lookup matching parts table
          let foundPart: { tableName: string; id: string; fields: any } | null = null;
          for (const [tName, tMap] of tables.entries()) {
            if (DEVICE_SERVICE_TABLES.includes(tName)) continue;
            const partFields = tMap.get(linkedId);
            if (partFields) {
              foundPart = { tableName: tName, id: linkedId, fields: partFields };
              break;
            }
          }

          if (!foundPart) {
            logger.warn('Linked record ID not found in any whitelisted parts tables. Skipping.', {
              deviceModel,
              column: key,
              linkedId
            });
            continue;
          }

          // Scan pricing columns
          const priceFields = ['Original', 'Compatible', 'Service Pack', 'OEM', 'LCD Only'];
          for (const priceKey of priceFields) {
            const priceVal = foundPart.fields[priceKey];
            if (priceVal !== undefined && priceVal !== null) {
              const numericPrice = Number(priceVal);
              if (isNaN(numericPrice) || numericPrice < 0) continue;

              const serviceName = resolveServiceName(key, priceKey);

              // Parse warranty details
              let warrantyDays = 90;
              const warrantyField =
                foundPart.fields[`${priceKey} Warranty`] ||
                foundPart.fields['Original Warranty'] ||
                foundPart.fields['Warranty'];
              if (warrantyField !== undefined) {
                warrantyDays = parseWarrantyDays(warrantyField);
              }

              const serviceId = `${foundPart.tableName}:${foundPart.id}:${priceKey}`;

              data.push({
                id: serviceId,
                deviceType: inferredDeviceType,
                brand,
                deviceModel,
                service: serviceName,
                price: numericPrice,
                estimatedTime: foundPart.tableName.includes('macbook') ? '1-2 days' : '45 min',
                warrantyDays,
                inStock: true
              });

              metadata.set(serviceId, {
                tableName: foundPart.tableName,
                recordId: foundPart.id,
                fieldName: priceKey
              });
            }
          }
        }
      }
    }
  }

  logger.info('Resolved pricing catalog compilation complete.', { compiledCount: data.length });
  return {
    data,
    metadata,
    fetchedAt: Date.now()
  };
}

// Fetch compiled catalog (returns stale cache + spawns background sync)
export async function getResolvedServices(): Promise<ResolvedPricingEntry[]> {
  const now = Date.now();

  // Cold start fallback
  if (!catalogCache) {
    logger.info('Cold start - executing blocking fetch...');
    try {
      catalogCache = await fetchAndResolveCatalog();
    } catch (err: any) {
      logger.error('Failed to resolve catalog on boot. Querying MongoDB snapshot fallback...', { error: err.message });
      
      const MongooseServicePricing = mongoose.models.ServicePricing;
      if (MongooseServicePricing) {
        try {
          const docs = await MongooseServicePricing.find({}).exec();
          if (docs && docs.length > 0) {
            const fallbackData: ResolvedPricingEntry[] = docs.map((d: any) => ({
              id: d._id ? d._id.toString() : String(Math.random()),
              deviceType: d.deviceType || 'unknown',
              brand: d.brand || 'unknown',
              deviceModel: d.deviceModel,
              service: d.service,
              price: d.price,
              estimatedTime: d.estimatedTime || '1 hour',
              warrantyDays: d.warrantyDays || 90,
              inStock: d.inStock !== undefined ? d.inStock : true
            }));
            logger.info('Successfully loaded MongoDB backup cache catalog.');
            return fallbackData;
          }
        } catch (dbErr: any) {
          logger.error('MongoDB backup cache lookup failed.', { error: dbErr.message });
        }
      }
      throw err;
    }
    return catalogCache.data;
  }

  const isExpired = now - catalogCache.fetchedAt > CACHE_TTL_MS;

  if (isExpired) {
    if (!activeRefreshPromise) {
      logger.info('Cache expired - scheduling background refresh...');
      activeRefreshPromise = fetchAndResolveCatalog()
        .then(newCache => {
          catalogCache = newCache;
          activeRefreshPromise = null;
          return newCache;
        })
        .catch(err => {
          logger.error('Background refresh failed. Serving stale cache.', { error: err.message });
          activeRefreshPromise = null;
          return catalogCache!; // serve stale cache on network failure
        });
    }
  }

  return catalogCache.data;
}

// Secure price cell writer with audit logs & boundaries
export async function updateCatalogPrice(
  serviceId: string,
  newPrice: number,
  adminUserId?: string
): Promise<boolean> {
  if (!catalogCache) {
    await getResolvedServices();
  }

  const meta = catalogCache?.metadata.get(serviceId);
  if (!meta) {
    throw new Error(`404: Service item with ID ${serviceId} not found in catalog.`);
  }

  // Bounds checks
  if (typeof newPrice !== 'number' || isNaN(newPrice) || !isFinite(newPrice) || newPrice <= 0 || newPrice >= 1000000) {
    logger.error('Price updates rejected: Out of bounds check failed', { adminUserId, serviceId, attemptedPrice: newPrice });
    throw new Error('400: Price must be a finite positive number less than ₹10,00,000.');
  }

  // Column name checks
  const allowedFields = ['Original', 'Compatible', 'Service Pack', 'OEM', 'LCD Only'];
  if (!allowedFields.includes(meta.fieldName)) {
    throw new Error(`400: Write target field "${meta.fieldName}" is not whitelisted.`);
  }

  // Table whitelisting
  if (!tableKeys.includes(meta.tableName)) {
    throw new Error(`400: Write target table "${meta.tableName}" is not whitelisted.`);
  }

  logger.info('Writing price update securely to Airtable cell', {
    adminUserId: adminUserId || 'unknown',
    tableName: meta.tableName,
    recordId: meta.recordId,
    fieldName: meta.fieldName,
    newPrice
  });

  // Write directly using the global throttler
  await enqueueRequest(async () => {
    const base = getCatalogBase(true);
    if (!base) throw new Error('Airtable Catalog Base is not initialized');
    return base(meta.tableName).update(meta.recordId, {
      [meta.fieldName]: newPrice
    }, { typecast: true });
  });

  // Update catalog cache in place
  if (catalogCache) {
    const entry = catalogCache.data.find(e => e.id === serviceId);
    if (entry) {
      entry.price = newPrice;
      logger.info('Updated cached pricing entry in-place', { serviceId, newPrice });
    }
  }

  return true;
}
