import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Airtable from 'airtable';
import { FailedWriteModel } from '../models/airtable.repository';

dotenv.config();

const apiKey = process.env.AIRTABLE_API_KEY;
const transBaseId = process.env.AIRTABLE_TRANSACTIONAL_BASE_ID;
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/irepairme';

const airtable = apiKey ? new Airtable({ apiKey }) : null;
const base = airtable && transBaseId ? airtable.base(transBaseId) : null;

const auditLogPath = path.join(__dirname, 'airtable_reconciliation_audit.log');

function logAudit(message: string) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(auditLogPath, logLine);
  console.log(message);
}

// Function to serialize/deserialize payload data
function parsePayload(payloadStr: string) {
  try {
    return JSON.parse(payloadStr);
  } catch (e) {
    return null;
  }
}

// Sanitize fields exactly like AirtableRepository does
function sanitizeFields(data: any): any {
  const fields = { ...data };
  delete fields._id;
  delete fields.id;
  delete fields.createdAt;
  delete fields.updatedAt;
  delete fields.__v;

  for (const key of Object.keys(fields)) {
    const val = fields[key];
    if (val && typeof val === 'object') {
      fields[key] = JSON.stringify(val);
    }
  }
  return fields;
}

async function runReconciliation() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || args.includes('-d');

  console.log(`[Reconciliation] Starting reconciliation runner... (Mode: ${isDryRun ? 'DRY RUN' : 'LIVE REPLAY'})`);

  if (!base) {
    console.error('[Reconciliation] Error: Airtable base client is not configured.');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for reconciliation');

    const pendingWrites = await FailedWriteModel.find().sort({ createdAt: 1 });
    console.log(`[Reconciliation] Found ${pendingWrites.length} pending failed write operations in MongoDB.`);

    if (pendingWrites.length === 0) {
      console.log('[Reconciliation] Parity verified! No pending failed writes. Exiting.');
      process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;

    for (const write of pendingWrites) {
      const { id, tableName, action, payload: payloadStr, recordId } = write;
      const payload = parsePayload(payloadStr);

      if (!payload) {
        console.error(`[Reconciliation] Error: Skipping invalid payload for record ID ${id} in table ${tableName}`);
        continue;
      }

      const cleanPayload = sanitizeFields(payload);

      if (isDryRun) {
        logAudit(`[Dry-Run Preview] Would replay operation: ACTION="${action}", TABLE="${tableName}", RECORD_ID="${recordId || 'NEW'}", FIELDS=${JSON.stringify(cleanPayload)}`);
        successCount++;
        continue;
      }

      console.log(`[Reconciliation] Replaying: ACTION="${action}", TABLE="${tableName}", RECORD_ID="${recordId || 'NEW'}"`);

      try {
        if (action === 'create') {
          // Add createdAt/updatedAt timestamp values matching the original save
          cleanPayload.createdAt = write.createdAt.toISOString();
          cleanPayload.updatedAt = new Date().toISOString();

          await base(tableName).create(cleanPayload, { typecast: false });
          logAudit(`[Reconciliation Success] Replayed create in table "${tableName}"`);
        } else if (action === 'update') {
          if (!recordId) throw new Error('Missing recordId for update action');
          cleanPayload.updatedAt = new Date().toISOString();

          await base(tableName).update(recordId, cleanPayload, { typecast: false });
          logAudit(`[Reconciliation Success] Replayed update on record "${recordId}" in table "${tableName}"`);
        } else if (action === 'delete') {
          if (!recordId) throw new Error('Missing recordId for delete action');
          await base(tableName).destroy(recordId);
          logAudit(`[Reconciliation Success] Replayed delete on record "${recordId}" in table "${tableName}"`);
        }

        // Atomically delete the failed write record from MongoDB ONLY after confirmed Airtable success
        await FailedWriteModel.findByIdAndDelete(id);
        successCount++;

        // Add 250ms spacing to respect Airtable rate limits during bulk replay
        await new Promise(res => setTimeout(res, 250));
      } catch (err: any) {
        failCount++;
        console.error(`❌ [Reconciliation Error] Replay failed for record ID ${id} in table "${tableName}": ${err.message}`);
        // Keep in MongoDB, do NOT delete, so it can be re-run
      }
    }

    console.log(`\n[Reconciliation] Completed! Successes: ${successCount}, Failures: ${failCount}`);
    if (failCount > 0) {
      console.warn(`⚠️ [Reconciliation] ${failCount} operations failed to replay. Check logs and run reconciliation again.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ [Reconciliation] Critical process failure:', error);
    process.exit(1);
  }
}

runReconciliation();
