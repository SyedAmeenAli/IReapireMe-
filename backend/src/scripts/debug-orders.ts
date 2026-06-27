import dotenv from 'dotenv';
dotenv.config();
process.env.USE_AIRTABLE = 'true';

import Airtable from 'airtable';

const apiKey = process.env.AIRTABLE_API_KEY!;
const baseId = process.env.AIRTABLE_BASE_ID!;
const tableName = process.env.AIRTABLE_TABLE_ORDERS || 'orders';

const airtable = new Airtable({ apiKey });
const base = airtable.base(baseId);

async function main() {
  console.log(`\n📋 Checking Airtable table: "${tableName}" in base: ${baseId}\n`);
  
  try {
    const records = await base(tableName).select({ maxRecords: 10 }).all();
    console.log(`Found ${records.length} records in "${tableName}" table:\n`);
    
    records.forEach((record, i) => {
      console.log(`--- Record ${i + 1} ---`);
      console.log('  ID:', record.id);
      console.log('  Fields:', JSON.stringify(record.fields, null, 2));
      console.log('');
    });
    
    if (records.length === 0) {
      console.log('⚠️  No records found! This means no orders have been saved to this table.');
      console.log('   Check if the table name is correct in your Airtable base.');
      
      // List all tables available
      console.log('\n   Trying to list other possible table names...');
    }
  } catch (err: any) {
    console.error('❌ Error accessing table:', err.message);
    if (err.statusCode === 404 || err.message?.includes('not find')) {
      console.log('\n⚠️  The table might not exist. Make sure you have a table named "' + tableName + '" in your Airtable base.');
    }
  }
}

main().catch(console.error);
