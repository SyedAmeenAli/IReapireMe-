import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/irepairme';

async function reset() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const adminEmail = 'amanziyan2004@gmail.com';
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash('admin123', salt);

    const updatedUser = await User.findOneAndUpdate(
      { email: adminEmail },
      { passwordHash: newHash }
    );
    if (!updatedUser) {
      console.log(`User ${adminEmail} not found or update failed.`);
      return;
    }
    console.log(`Successfully reset password for ${adminEmail} to 'admin123'`);
  } catch (error: any) {
    console.error('Error resetting password:', error);
  } finally {
    await mongoose.disconnect();
  }
}

reset().then(() => process.exit(0));
