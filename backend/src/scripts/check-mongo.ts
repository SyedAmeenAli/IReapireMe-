import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/irepairme';

async function checkMongo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) throw new Error('DB is undefined');
    
    const collections = await db.listCollections().toArray();
    console.log('Collections in MongoDB:');
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`- ${coll.name}: ${count} documents`);
      if (count > 0) {
        const sample = await db.collection(coll.name).findOne();
        console.log(`  Sample:`, JSON.stringify(sample, null, 2));
      }
    }
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

checkMongo();
