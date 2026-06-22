import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RepairTicket from '../models/RepairTicket';
import Order from '../models/Order';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/irepairme';

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Querying Repair Tickets (Airtable table: ' + (process.env.AIRTABLE_TABLE_REPAIR_TICKETS || 'tickets') + ')...');
    try {
      const tickets = await RepairTicket.find({});
      console.log(`✅ Success! Found ${tickets.length} tickets:`, tickets);
    } catch (err: any) {
      console.error('❌ Failed querying Repair Tickets:', err.message);
    }

    console.log('\nQuerying Orders (Airtable table: ' + (process.env.AIRTABLE_TABLE_ORDERS || 'orders') + ')...');
    try {
      const orders = await Order.find({});
      console.log(`✅ Success! Found ${orders.length} orders:`, orders);
    } catch (err: any) {
      console.error('❌ Failed querying Orders:', err.message);
    }

  } catch (error: any) {
    console.error('Testing query failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

test().then(() => process.exit(0));
