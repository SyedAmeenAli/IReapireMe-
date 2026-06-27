import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import repairRoutes from './routes/repair.routes';
import serviceRoutes from './routes/service.routes';
import shopRoutes from './routes/shop.routes';
import paymentRoutes from './routes/payment.routes';
import deliveryRoutes from './routes/delivery.routes';
import { getResolvedServices, getCacheHealth } from './services/serviceResolver';
import { getPendingFailedWritesCount } from './models/airtable.repository';
import { startSyncCron } from './services/repairshopr.sync';

const app = express();

// Middleware
app.use(cors());

// Mount payment routes before express.json() to keep raw body hook parser active
app.use('/api/payment', paymentRoutes);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/delivery', deliveryRoutes);

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const useAirtable = process.env.USE_AIRTABLE === 'true';
    const mongoConnected = mongoose.connection.readyState === 1;
    
    let airtableStats = {};
    if (useAirtable) {
      const pendingWrites = await getPendingFailedWritesCount();
      const cacheHealth = getCacheHealth();
      airtableStats = {
        useAirtable: true,
        pendingFailedWrites: pendingWrites,
        cache: cacheHealth
      };
    } else {
      airtableStats = {
        useAirtable: false
      };
    }

    res.status(200).json({
      status: 'ok',
      message: 'iRepairMe Backend is running!',
      database: {
        mongoConnected,
        mode: useAirtable ? 'Airtable + MongoDB Parallel' : 'MongoDB Only'
      },
      airtable: airtableStats
    });
  } catch (err: any) {
    console.error('Health Check Error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/irepairme';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      
      // Start RepairShopr Sync Cron Job
      startSyncCron();

      if (process.env.USE_AIRTABLE === 'true') {
        console.log('[Startup] Warming service catalog cache...');
        getResolvedServices()
          .then(() => console.log('[Startup] Service catalog cache warmed successfully.'))
          .catch(err => console.error('[Startup] Failed to warm service catalog cache on boot:', err));
      }
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  });
// Trigger nodemon reload 4
