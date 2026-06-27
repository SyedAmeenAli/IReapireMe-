import dotenv from 'dotenv';
dotenv.config();
import Airtable from 'airtable';

const DEFAULT_TABLE_KEYS = [
  'iphone-service',
  'macbook-services',
  'android-services',
  'ipad-services',
  'laptop-services',
  'display',
  'battery',
  'charging-port',
  'back-glass',
  'earspeaker',
  'loudspeaker',
  'rear-camera',
  'front-camera',
  'camera-glass',
  'housing',
  'proximity-sensor',
  'macbook-display',
  'macbook-battery',
  'macbook-keyboard',
  'android-display',
  'android-battery',
  'android-charging-port',
  'android-back-glass',
  'ipad-display',
  'ipad-battery',
  'ipad-charging-port',
  'laptop-display',
  'laptop-battery',
  'laptop-keyboard',
  'laptop-charging-port'
];

const DEVICE_SERVICE_TABLES = [
  'iphone-service',
  'macbook-services',
  'android-services',
  'ipad-services',
  'laptop-services'
];

async function debugCompile() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) {
    console.error('Missing key or base ID');
    return;
  }

  const base = new Airtable({ apiKey }).base(baseId);
  const tables = new Map<string, Map<string, any>>();

  console.log('Fetching all tables from Airtable...');
  for (const tableName of DEFAULT_TABLE_KEYS) {
    try {
      const records = await base(tableName).select().all();
      const map = new Map<string, any>();
      records.forEach((r: any) => map.set(r.id, r.fields));
      tables.set(tableName, map);
      console.log(`- ${tableName}: fetched ${map.size} records`);
    } catch (err: any) {
      console.error(`- Error fetching ${tableName}:`, err.message);
      tables.set(tableName, new Map<string, any>());
    }
  }

  console.log('\n--- Debugging Row Resolution ---');
  for (const tableName of DEVICE_SERVICE_TABLES) {
    const serviceMap = tables.get(tableName);
    if (!serviceMap) {
      console.log(`Table ${tableName} not found in map.`);
      continue;
    }

    console.log(`\nProcessing Table: ${tableName} (has ${serviceMap.size} rows)`);
    const inferredDeviceType = tableName.replace(/-service(s)?/, '').toLowerCase();

    // Print a raw sample record to see all keys in the service table
    if (serviceMap.size > 0) {
      const sampleEntry = Array.from(serviceMap.entries())[0];
      console.log(`  [SAMPLE RAW FIELDS] for ${tableName}:`, JSON.stringify(sampleEntry[1], null, 2));
    }

    for (const [rowId, rowFields] of serviceMap.entries()) {
      const deviceModel = rowFields['Devices'] || rowFields['devices'];
      if (!deviceModel) continue;

      let brand = rowFields['Brand'] || rowFields['brand'];
      if (!brand) {
        if (inferredDeviceType === 'iphone' || inferredDeviceType === 'macbook' || inferredDeviceType === 'ipad') {
          brand = 'Apple';
        } else {
          continue;
        }
      }

      for (const [key, value] of Object.entries(rowFields)) {
        const normKey = key.toLowerCase();
        if (normKey === 'devices' || normKey === 'brand') continue;

        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && value[0].startsWith('rec')) {
          const linkedId = value[0];
          console.log(`> Row ${deviceModel}: Column "${key}" links to "${linkedId}"`);

          let foundPart: { tableName: string; id: string; fields: any } | null = null;
          for (const [tName, tMap] of tables.entries()) {
            if (DEVICE_SERVICE_TABLES.includes(tName)) continue;
            const partFields = tMap.get(linkedId);
            if (partFields) {
              foundPart = { tableName: tName, id: linkedId, fields: partFields };
              break;
            }
          }

          if (!foundPart) {
            console.log(`  ❌ Linked record "${linkedId}" not found in any parts tables!`);
            continue;
          }

          console.log(`  Found Part in: "${foundPart.tableName}"`);
          console.log(`  [RAW FIELDS] of linked part record:`, JSON.stringify(foundPart.fields, null, 2));
        }
      }
    }
  }
}

debugCompile().then(() => process.exit(0));
