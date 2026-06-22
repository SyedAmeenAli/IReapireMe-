import dotenv from 'dotenv';
dotenv.config();
import Airtable from 'airtable';

async function run() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  console.log('API KEY:', apiKey ? apiKey.substring(0, 10) + '...' : 'missing');
  console.log('BASE ID:', baseId);

  if (!apiKey || !baseId) {
    console.error('Missing key or base id');
    return;
  }

  const base = new Airtable({ apiKey }).base(baseId);

  try {
    const records = await base('android-services').select().all();
    console.log(`Successfully fetched ${records.length} records from android-services:`);
    records.slice(0, 10).forEach(r => {
      console.log(`ID: ${r.id}, Fields:`, JSON.stringify(r.fields, null, 2));
    });
  } catch (err: any) {
    console.error('Error fetching android-services:', err.message);
  }
}

run().then(() => process.exit(0));
