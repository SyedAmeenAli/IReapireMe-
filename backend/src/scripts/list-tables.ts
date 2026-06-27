import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function listTables(baseId: string, apiKey: string, label: string) {
  console.log(`\n--- Listing tables for ${label} (${baseId}) ---`);
  try {
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    const tables = response.data.tables.map((t: any) => t.name);
    console.log(`✅ Success! Tables:`, tables);
  } catch (err: any) {
    if (err.response) {
      console.error(`❌ Failed: status=${err.response.status}, message=`, err.response.data);
    } else {
      console.error(`❌ Failed:`, err.message);
    }
  }
}

async function run() {
  const apiKeyCatalog = process.env.AIRTABLE_API_KEY_CATALOG || process.env.AIRTABLE_API_KEY || '';
  const catalogBaseId = process.env.AIRTABLE_CATALOG_BASE_ID || '';

  const apiKeyTrans = process.env.AIRTABLE_API_KEY_TRANSACTIONAL || process.env.AIRTABLE_API_KEY || '';
  const transBaseId = process.env.AIRTABLE_TRANSACTIONAL_BASE_ID || '';

  console.log(`DEBUG: apiKeyCatalog="${apiKeyCatalog}" (len=${apiKeyCatalog.length})`);
  console.log(`DEBUG: catalogBaseId="${catalogBaseId}" (len=${catalogBaseId.length})`);
  console.log(`DEBUG: apiKeyTrans="${apiKeyTrans}" (len=${apiKeyTrans.length})`);
  console.log(`DEBUG: transBaseId="${transBaseId}" (len=${transBaseId.length})`);

  console.log('--- COMBINATION 1: Catalog Key on Catalog Base ---');
  await listTables(catalogBaseId, apiKeyCatalog, 'Catalog Base');

  console.log('--- COMBINATION 2: Catalog Key on Transactional Base ---');
  await listTables(transBaseId, apiKeyCatalog, 'Transactional Base');

  console.log('--- COMBINATION 3: Transactional Key on Catalog Base ---');
  await listTables(catalogBaseId, apiKeyTrans, 'Catalog Base');

  console.log('--- COMBINATION 4: Transactional Key on Transactional Base ---');
  await listTables(transBaseId, apiKeyTrans, 'Transactional Base');
}

run();
