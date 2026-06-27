import dotenv from 'dotenv';
import { AirtableRepository, getBaseInstance } from '../models/airtable.repository';

dotenv.config();

async function queryProducts() {
  console.log('====================================================');
  console.log('🔍 QUERYING PRODUCTS FROM AIRTABLE');
  console.log('====================================================');
  console.log('Catalog Base ID:', process.env.AIRTABLE_CATALOG_BASE_ID);
  console.log('Transactional Base ID:', process.env.AIRTABLE_TRANSACTIONAL_BASE_ID);

  // 1. Try querying Users from Transactional Base
  console.log('\n[1] Attempting to query Users from Transactional Base...');
  try {
    const base = getBaseInstance(process.env.AIRTABLE_TRANSACTIONAL_BASE_ID!);
    if (!base) throw new Error('Base not initialized');
    const records = await base('Users').select().all();
    console.log(`✅ Success: Found ${records.length} records in Users table.`);
    if (records.length > 0) {
      console.log('Sample User fields:', JSON.stringify(records[0].fields, null, 2));
    }
  } catch (err: any) {
    console.error('❌ Failed to query Users:', err.message);
  }

  // 2. Try querying RepairTickets from Transactional Base
  console.log('\n[2] Attempting to query RepairTickets from Transactional Base...');
  try {
    const base = getBaseInstance(process.env.AIRTABLE_TRANSACTIONAL_BASE_ID!);
    if (!base) throw new Error('Base not initialized');
    const records = await base('RepairTickets').select().all();
    console.log(`✅ Success: Found ${records.length} records in RepairTickets table.`);
    if (records.length > 0) {
      console.log('Sample RepairTicket fields:', JSON.stringify(records[0].fields, null, 2));
    }
  } catch (err: any) {
    console.error('❌ Failed to query RepairTickets:', err.message);
  }
}

queryProducts();
