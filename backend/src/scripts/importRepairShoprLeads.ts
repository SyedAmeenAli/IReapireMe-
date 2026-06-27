import dotenv from 'dotenv';
dotenv.config();

/// <reference types="node" />
declare const process: any;

import mongoose from 'mongoose';
import RepairTicket, { RepairStatus } from '../models/RepairTicket';
import { repairShoprService, REVERSE_STATUS_MAP } from '../services/repairshopr.service';
import crypto from 'crypto';
import logger from '../utils/logger';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/irepairme';

async function runImport() {
  logger.info('[RepairShopr Import] STARTING TICKET IMPORT SCRIPT');

  try {
    await mongoose.connect(MONGO_URI);
    logger.info('[RepairShopr Import] Connected to MongoDB.');

    logger.info('[RepairShopr Import] Fetching all tickets from RepairShopr API...');
    const rsTickets = await repairShoprService.fetchAllTickets();
    logger.info(`[RepairShopr Import] Retrieved ${rsTickets.length} tickets from RepairShopr.`);

    let importedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const rsTkt of rsTickets) {
      try {
        const rsTicketIdStr = String(rsTkt.id);

        // Deduplication Check
        const existing = await RepairTicket.findOne({ repairshoprTicketId: rsTicketIdStr });
        if (existing) {
          skippedCount++;
          continue;
        }

        // Map status using the reverse status map
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
          source: 'repairshopr_import',
          repairshoprTicketId: rsTicketIdStr,
          repairshoprCustomerId: rsTkt.customer_id ? String(rsTkt.customer_id) : undefined,
          deliveryFee: 0,
          createdAt: rsTkt.created_at ? new Date(rsTkt.created_at) : new Date(),
        });

        await newTicket.save();
        importedCount++;
      } catch (err: any) {
        failedCount++;
        logger.error(`[RepairShopr Import] Failed to import ticket ${rsTkt.id}: ${err.message}`, { error: err });
      }
    }

    logger.info('[RepairShopr Import] IMPORT SCRIPT COMPLETED.', {
      imported: importedCount,
      skipped: skippedCount,
      failed: failedCount,
    });

    // Allow background MongoDB dual-writes to finish before exiting
    await new Promise(resolve => setTimeout(resolve, 3000));
    process.exit(0);
  } catch (err: any) {
    logger.error('[RepairShopr Import] Critical Error: Lead import failed', { error: err.message });
    // Allow any pending logging or connections to settle
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(1);
  }
}

runImport();
