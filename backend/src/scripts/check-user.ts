import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/irepairme';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOne({ email: 'amanziyan2004@gmail.com' });
    console.log('User found:', user);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

check();
