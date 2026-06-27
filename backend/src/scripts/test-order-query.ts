import dotenv from 'dotenv';
dotenv.config();
process.env.USE_AIRTABLE = 'true';

import Order from '../models/Order';
import { buildFormula } from '../models/airtable.repository';

async function main() {
  // Test 1: Query by customerPhone as number (how Airtable stores it)
  const phoneNumber = 7386446601;
  console.log('\n--- Test 1: Query by customerPhone as number ---');
  console.log('Formula would be:', buildFormula({ customerPhone: phoneNumber }));
  
  try {
    const ordersByPhone = await Order.find({ customerPhone: phoneNumber });
    console.log(`Found ${ordersByPhone.length} orders by phone number ${phoneNumber}`);
    if (ordersByPhone.length > 0) {
      ordersByPhone.forEach((o: any, i: number) => {
        console.log(`  Order ${i+1}: id=${o.id}, customerName=${o.customerName}, status=${o.status}`);
      });
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  }

  // Test 2: Query by customerEmail
  const email = 'amaruziyan2004@gmail.com';
  console.log('\n--- Test 2: Query by customerEmail ---');
  console.log('Formula would be:', buildFormula({ customerEmail: email }));

  try {
    const ordersByEmail = await Order.find({ customerEmail: email });
    console.log(`Found ${ordersByEmail.length} orders by email ${email}`);
  } catch (err: any) {
    console.error('Error:', err.message);
  }

  // Test 3: Query by customerEmail that exists in airtable
  const email2 = 'amanziyan2004@gmail.com';
  console.log('\n--- Test 3: Query by email that exists ---');
  console.log('Formula would be:', buildFormula({ customerEmail: email2 }));
  
  try {
    const ordersByEmail2 = await Order.find({ customerEmail: email2 });
    console.log(`Found ${ordersByEmail2.length} orders by email ${email2}`);
    if (ordersByEmail2.length > 0) {
      ordersByEmail2.forEach((o: any, i: number) => {
        console.log(`  Order ${i+1}: id=${o.id}, customerName=${o.customerName}, status=${o.status}`);
      });
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  }

  // Test 4: Query all orders (no filter)
  console.log('\n--- Test 4: All orders ---');
  try {
    const allOrders = await Order.find({});
    console.log(`Found ${allOrders.length} total orders`);
  } catch (err: any) {
    console.error('Error:', err.message);
  }

  console.log('\nDone!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
