/// <reference types="node" />
declare const process: any;

import dotenv from 'dotenv';
dotenv.config();

// Force Airtable mode in-process to ensure we fetch from Airtable Products table
process.env.USE_AIRTABLE = 'true';

import mongoose from 'mongoose';
import Product from '../models/Product';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/irepairme';

async function seedProducts() {
  console.log('====================================================');
  console.log('🌱 STARTING SPARE PARTS (PRODUCTS) CATALOG SYNCHRONIZATION');
  console.log('====================================================');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔄 Fetching products from Airtable...');
    const airtableProducts = await Product.find();

    if (!airtableProducts || airtableProducts.length === 0) {
      console.error('❌ Error: No products retrieved from Airtable. Check credentials.');
      process.exit(1);
    }
    console.log(`ℹ️ Retrieved ${airtableProducts.length} product entries from Airtable.`);

    const syncSessionId = new Date().toISOString();
    console.log(`🔑 Synchronization Session ID: ${syncSessionId}`);

    const cleanEntries = airtableProducts.map((item: any) => {
      // Strip out ID properties and timestamps so MongoDB will assign clean ObjectIds
      const { id, _id, createdAt, updatedAt, ...data } = item;
      return {
        ...data,
        syncSessionId
      };
    });

    console.log('📥 Inserting fresh product records into MongoDB...');
    await Product.insertMany(cleanEntries);

    console.log('🧹 Purging outdated product records...');
    const deleteResult = await Product.deleteMany({
      syncSessionId: { $ne: syncSessionId }
    });
    console.log(`✅ Purged ${deleteResult.deletedCount} stale product records.`);

    console.log('====================================================');
    console.log('🎉 SPARE PARTS CATALOG SYNCHRONIZATION COMPLETED SUCCESSFULLY');
    console.log('====================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Critical Error: Spare parts synchronization failed:', err.message);
    process.exit(1);
  }
}

seedProducts();
