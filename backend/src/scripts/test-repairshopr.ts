/// <reference types="node" />
declare const process: any;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { repairShoprService, STATUS_MAP, REVERSE_STATUS_MAP } from '../services/repairshopr.service';
import logger from '../utils/logger';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/irepairme';

async function testRepairShopr() {
  logger.info('[Test] STARTING REPAIRSHOPR SERVICE TEST');
  
  try {
    // Connect to database
    await mongoose.connect(MONGO_URI);
    logger.info('[Test] Connected to MongoDB.');

    // 1. Verify Status Map and Reverse status map
    logger.info('[Test] Verifying Status Mappings...');
    if (STATUS_MAP.PENDING !== 'New') {
      throw new Error('STATUS_MAP PENDING mapping is invalid');
    }
    if (REVERSE_STATUS_MAP['New'] !== 'PENDING') {
      throw new Error('REVERSE_STATUS_MAP New mapping is invalid');
    }
    logger.info('[Test] Status mapping verification PASSED.');

    // 2. Search / Create Customer
    logger.info('[Test] Running searchOrCreateCustomer test...');
    const testCustomerData = {
      firstname: 'Alice',
      lastname: 'Test',
      email: 'alice.test@example.com',
      phone: '9876543210'
    };
    const customer = await repairShoprService.searchOrCreateCustomer(testCustomerData);
    logger.info('[Test] Customer searchOrCreate success:', customer);

    if (!customer || !customer.id) {
      throw new Error('Customer ID missing from searchOrCreate response');
    }

    // 3. Create Ticket
    logger.info('[Test] Running createTicket test...');
    const ticket = await repairShoprService.createTicket({
      customerId: customer.id,
      subject: 'Test subject - Broken Screen',
      issueDescription: 'Explain issue: Screen has horizontal lines.',
      status: STATUS_MAP.PENDING,
      problem_type: 'iPhone'
    });
    logger.info('[Test] Ticket creation success:', ticket);

    if (!ticket || !ticket.id) {
      throw new Error('Ticket ID missing from createTicket response');
    }

    // 4. Update Ticket Status
    logger.info('[Test] Running updateTicketStatus test...');
    await repairShoprService.updateTicketStatus(String(ticket.id), 'IN_PROGRESS');
    logger.info('[Test] Status update trigger success.');

    logger.info('[Test] ALL REPAIRSHOPR SERVICE TESTS PASSED SUCCESSFULLY.');
    process.exit(0);
  } catch (error: any) {
    logger.error('[Test] Critical failure during RepairShopr service test', { error: error.message });
    process.exit(1);
  }
}

testRepairShopr();
