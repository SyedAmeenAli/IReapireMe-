import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

async function list() {
  const baseId = process.env.AIRTABLE_BASE_ID || '';
  const apiKey = process.env.AIRTABLE_API_KEY || '';
  console.log(`Base ID: ${baseId}`);
  console.log(`API Key prefix: ${apiKey.substring(0, 10)}...`);

  try {
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    const tables = response.data.tables.map((t: any) => ({ id: t.id, name: t.name }));
    console.log('✅ Success! Found tables:');
    console.log(tables);
  } catch (err: any) {
    if (err.response) {
      console.error(`❌ Failed: status=${err.response.status}, message=`, err.response.data);
    } else {
      console.error(`❌ Failed:`, err.message);
    }
  }
}

list().then(() => process.exit(0));
