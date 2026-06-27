import dotenv from 'dotenv';
dotenv.config();
import Airtable from 'airtable';

async function diagnose() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  console.log('API Key exists:', !!apiKey);
  console.log('Base ID:', baseId);

  if (!apiKey || !baseId) {
    console.error('Missing API Key or Base ID');
    return;
  }

  const airtable = new Airtable({ apiKey });
  const base = airtable.base(baseId);

  const tablesToCheck = [
    'iphone-service',
    'android-services',
    'macbook-services',
    'ipad-services',
    'laptop-services'
  ];

  for (const tableName of tablesToCheck) {
    try {
      console.log(`\nChecking table: ${tableName}`);
      const records = await base(tableName).select({ maxRecords: 5 }).all();
      console.log(`✅ Table exists! Found ${records.length} records.`);
      if (records.length > 0) {
        console.log('Sample record fields:', JSON.stringify(records[0].fields, null, 2));
      }
    } catch (err: any) {
      console.error(`❌ Table check failed for ${tableName}:`, err.message);
    }
  }
}

diagnose().then(() => process.exit(0));
