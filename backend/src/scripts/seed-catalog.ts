/// <reference types="node" />
declare const process: any;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getResolvedServices } from '../services/serviceResolver';
import ServicePricingConstructor from '../models/ServicePricing';
import logger from '../utils/logger';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/irepairme';

async function seedCatalog() {
  logger.info('STARTING PRICING CATALOG SYNCHRONIZATION');

  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB.');

    // 1. Fetch relational data resolved into flat entries (in-memory resolution)
    logger.info('Resolving relational Airtable schema in-memory...');
    const resolved = await getResolvedServices();

    if (!resolved || resolved.length === 0) {
      logger.error('No catalog entries resolved from Airtable. Aborting synchronization.');
      process.exit(1);
    }
    logger.info('Resolved pricing entries from Airtable.', { count: resolved.length });

    const cleanEntries = resolved.map(item => {
      const { id, ...data } = item;
      return {
        ...data,
      };
    });

    // 2. Delete old database records
    logger.info('Purging old catalog records from MongoDB...');
    const deleteResult = await ServicePricingConstructor.deleteMany({});
    logger.info('Successfully purged old catalog records.', { deletedCount: deleteResult.deletedCount });

    // 3. Insert new records
    logger.info('Inserting fresh catalog records into MongoDB...');
    const insertResult = await ServicePricingConstructor.insertMany(cleanEntries);
    logger.info('Catalog synchronization completed successfully.', { insertedCount: insertResult.length });

    process.exit(0);
  } catch (err: any) {
    logger.error('Critical Error: Catalog synchronization failed', { error: err.message });
    process.exit(1);
  }
}

seedCatalog();
