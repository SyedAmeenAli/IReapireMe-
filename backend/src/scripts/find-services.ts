import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/irepairme';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('No database connection');
    return;
  }

  const collection = db.collection('servicepricings');

  const count = await collection.countDocuments();
  console.log('Total documents in MongoDB servicepricings:', count);

  const deviceTypes = await collection.aggregate([
    { $group: { _id: '$deviceType', count: { $sum: 1 } } }
  ]).toArray();
  console.log('Device types in MongoDB:', deviceTypes);

  const brands = await collection.aggregate([
    { $group: { _id: '$brand', count: { $sum: 1 } } }
  ]).toArray();
  console.log('Brands in MongoDB:', brands);

  const sampleAndroid = await collection.find({ deviceType: 'android' }).limit(5).toArray();
  console.log('Sample Android records:', JSON.stringify(sampleAndroid, null, 2));

  const allAndroid = await collection.find({ deviceType: 'android' }).toArray();
  console.log('Total Android records count:', allAndroid.length);

  await mongoose.disconnect();
}

run().then(() => process.exit(0));
