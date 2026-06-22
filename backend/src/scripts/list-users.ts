import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/irepairme';

async function list() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Fetching users...');
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach((u: any) => {
      console.log(`- ID: ${u.id || u._id}, Email: ${u.email}, Role: ${u.role}, Phone: ${u.phone}`);
    });
  } catch (error: any) {
    console.error('Error listing users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

list().then(() => process.exit(0));
