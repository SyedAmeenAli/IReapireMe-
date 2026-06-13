import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from './models/User';
import bcrypt from 'bcrypt';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/irepairme';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Create default Admin User
    const adminEmail = 'amelio123ali@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
      });
      await admin.save();
      console.log('✅ Created default admin user (amelio123ali@gmail.com / admin123)');
    } else {
      console.log('⚠️ Admin user already exists');
    }

    console.log('🌱 Seeding complete! You can run the backend now.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seed();
