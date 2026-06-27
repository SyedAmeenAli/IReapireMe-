import dotenv from 'dotenv';
dotenv.config();

import { getResolvedServices, updateCatalogPrice } from '../services/serviceResolver';

async function test() {
  try {
    console.log('Fetching resolved services...');
    const services = await getResolvedServices();
    console.log(`Fetched ${services.length} services.`);
    if (services.length === 0) {
      console.log('No services found.');
      return;
    }
    
    const target = services[0];
    console.log(`Attempting to update price for service:`, target);
    
    const success = await updateCatalogPrice(target.id, target.price + 10);
    console.log(`Update status:`, success);
  } catch (error: any) {
    console.error('Test update failed with error:', error);
  }
}

test().then(() => process.exit(0));
