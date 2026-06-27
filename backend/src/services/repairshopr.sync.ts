import cron from 'node-cron';
import RepairTicket, { RepairStatus } from '../models/RepairTicket';
import Config from '../models/Config';
import { repairShoprService, REVERSE_STATUS_MAP } from './repairshopr.service';
import crypto from 'crypto';
import logger from '../utils/logger';

export async function runSync() {
  const subdomain = process.env.REPAIRSHOPR_SUBDOMAIN;
  const apiKey = process.env.REPAIRSHOPR_API_KEY;

  if (!subdomain || !apiKey || subdomain.includes('YOUR_') || apiKey.includes('YOUR_')) {
    logger.warn('[RepairShopr Sync] Cron execution skipped: Missing or placeholder environment variables.');
    return;
  }

  logger.info('[RepairShopr Sync] Starting periodic synchronization run...');

  try {
    // 1. Get last sync time
    let lastSyncedAt: Date;
    const configDoc = await Config.findOne({ key: 'repairshopr_last_sync' });

    if (configDoc && configDoc.value) {
      lastSyncedAt = new Date(configDoc.value);
    } else {
      // Default to 30 days ago
      lastSyncedAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      logger.info(`[RepairShopr Sync] No previous sync timestamp found. Defaulting to 30 days ago: ${lastSyncedAt.toISOString()}`);
    }

    const currentRunTime = new Date();

    // 2. Fetch tickets updated since last sync
    const rsTickets = await repairShoprService.fetchTicketsSince(lastSyncedAt);
    logger.info(`[RepairShopr Sync] Retrieved ${rsTickets.length} updated tickets from RepairShopr.`);

    let importedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const rsTkt of rsTickets) {
      try {
        const rsTicketIdStr = String(rsTkt.id);

        // Check if ticket already exists
        const existing = await RepairTicket.findOne({ repairshoprTicketId: rsTicketIdStr });
        if (existing) {
          skippedCount++;
          continue;
        }

        // Map status
        const localStatusStr = REVERSE_STATUS_MAP[rsTkt.status] || 'PENDING';
        const localStatus = localStatusStr as RepairStatus;

        // Generate local ticket ID
        const ticketId = 'TKT-' + crypto.randomBytes(3).toString('hex').toUpperCase();

        const customerName = rsTkt.customer?.fullname || 
                             `${rsTkt.customer?.firstname || ''} ${rsTkt.customer?.lastname || ''}`.trim() || 
                             'Imported Customer';

        const phoneRegex = /^[6789]\d{9}$/;
        let customerPhone = rsTkt.customer?.phone ? String(rsTkt.customer.phone).replace(/\D/g, '').slice(-10) : '9999999999';
        if (!phoneRegex.test(customerPhone)) {
          customerPhone = '9999999999'; // fallback to standard valid format
        }

        const newTicket = new RepairTicket({
          ticketId,
          customerName,
          customerPhone,
          customerEmail: rsTkt.customer?.email || 'no-email@provided.com',
          deviceType: rsTkt.problem_type || 'Unknown',
          brand: 'Unknown',
          deviceModel: rsTkt.subject || 'Unknown',
          issueDescription: rsTkt.subject || 'No Subject',
          status: localStatus,
          estimatedCost: 0,
          serviceMode: 'walkin',
          source: 'repairshopr_pull',
          repairshoprTicketId: rsTicketIdStr,
          repairshoprCustomerId: rsTkt.customer_id ? String(rsTkt.customer_id) : undefined,
          deliveryFee: 0,
          createdAt: rsTkt.created_at ? new Date(rsTkt.created_at) : new Date(),
        });

        await newTicket.save();
        importedCount++;
      } catch (err: any) {
        failedCount++;
        logger.error(`[RepairShopr Sync] Error syncing ticket ID ${rsTkt.id}: ${err.message}`, { error: err });
      }
    }

    // 3. Save sync timestamp
    await Config.findOneAndUpdate(
      { key: 'repairshopr_last_sync' },
      { value: currentRunTime.toISOString() },
      { upsert: true, new: true }
    );

    logger.info('[RepairShopr Sync] Sync run finished successfully.', {
      syncedAt: currentRunTime.toISOString(),
      imported: importedCount,
      skipped: skippedCount,
      failed: failedCount,
    });
  } catch (error: any) {
    logger.warn(`[RepairShopr Sync] Failed to run sync job: ${error.message}`);
  }
}

export function startSyncCron() {
  logger.info('[RepairShopr Sync] Registering 15-minute sync cron job...');
  cron.schedule('*/15 * * * *', async () => {
    try {
      await runSync();
    } catch (err: any) {
      logger.error(`[RepairShopr Sync] Cron callback error: ${err.message}`);
    }
  });
}
