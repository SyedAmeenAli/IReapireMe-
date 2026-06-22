import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function testAccess(apiKey: string, baseId: string, label: string) {
  console.log(`\n--- Testing metadata access for ${label} (Base: ${baseId}) ---`);
  try {
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    console.log(`✅ Success! Found tables:`, response.data.tables.map((t: any) => t.name).join(', '));
    return;
  } catch (err: any) {
    console.error(`❌ Metadata failed: ${err.message}`);
  }

  // Fallback: try querying a specific common table like 'Users', 'RepairTickets', 'Products'
  for (const table of ['Users', 'RepairTickets', 'Products']) {
    try {
      const response = await axios.get(`https://api.airtable.com/v0/${baseId}/${table}?maxRecords=1`, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });
      console.log(`✅ Success! Can read from table '${table}'`);
      return;
    } catch (err: any) {
      // ignore individual failures
    }
  }
  console.log(`❌ Failed to read any common tables.`);
}

async function run() {
  const catalogKey = process.env.AIRTABLE_API_KEY_CATALOG || '';
  const transKey = process.env.AIRTABLE_API_KEY_TRANSACTIONAL || '';
  const catalogBase = process.env.AIRTABLE_CATALOG_BASE_ID || '';
  const transBase = process.env.AIRTABLE_TRANSACTIONAL_BASE_ID || '';

  console.log('--- Testing Catalog Base (Account A) ---');
  await testAccess(catalogKey, catalogBase, 'Catalog Key on Catalog Base');
  await testAccess(transKey, catalogBase, 'Transactional Key on Catalog Base');

  console.log('\n--- Testing Transactional Base (Account B) ---');
  await testAccess(catalogKey, transBase, 'Catalog Key on Transactional Base');
  await testAccess(transKey, transBase, 'Transactional Key on Transactional Base');
}

run();
