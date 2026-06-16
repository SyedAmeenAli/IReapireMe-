// Run this script directly via Node to migrate existing orders:
// node scripts/migrate-borzo.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/irepairme';

async function migrate() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB. Starting migration...');

    const db = mongoose.connection.db;

    // Migrate Orders
    const ordersResult = await db.collection('orders').updateMany(
      { porterOrderId: { $exists: true } },
      { 
        $rename: { porterOrderId: "borzoOrderId" } 
      }
    );
    console.log(`Migrated Orders: ${ordersResult.modifiedCount}`);

    // Migrate Repair Tickets
    const repairResult = await db.collection('repairtickets').updateMany(
      { porterOrderId: { $exists: true } },
      { 
        $rename: { porterOrderId: "borzoOrderId" } 
      }
    );
    console.log(`Migrated Repair Tickets: ${repairResult.modifiedCount}`);

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
