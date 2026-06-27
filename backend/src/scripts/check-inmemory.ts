import dotenv from 'dotenv';
dotenv.config();
import { getResolvedServices } from '../services/serviceResolver';

async function check() {
  try {
    const services = await getResolvedServices();
    console.log(`Total resolved services: ${services.length}`);
    const counts: Record<string, number> = {};
    services.forEach(s => {
      counts[s.deviceType] = (counts[s.deviceType] || 0) + 1;
    });
    console.log('Record counts by deviceType:', counts);
    console.log('Sample MacBook records:', services.filter(s => s.deviceType === 'macbook').slice(0, 3));
    console.log('Sample iPad records:', services.filter(s => s.deviceType === 'ipad').slice(0, 3));
    console.log('Sample Laptop records:', services.filter(s => s.deviceType === 'laptop').slice(0, 3));
  } catch (err: any) {
    console.error(err);
  }
}

check().then(() => process.exit(0));
