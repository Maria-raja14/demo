import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cron from 'node-cron';

import authRoutes from './routes/auth';
import masterDataRoutes from './routes/masterData';
import visitRoutes from './routes/visits';
import salesRoutes from './routes/sales';
import inventoryRoutes from './routes/inventory';
import reportsRoutes from './routes/reports';
import syncRoutes from './routes/sync';

import { errorHandler } from './middleware/errorHandler';
import { SyncService } from './services/sync/SyncService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/van-sales')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/sync', syncRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Scheduled sync with D365 BC (every 30 minutes)
cron.schedule('*/30 * * * *', async () => {
  console.log('Running scheduled sync with D365 BC...');
  try {
    await SyncService.performFullSync();
    console.log('Scheduled sync completed successfully');
  } catch (error) {
    console.error('Scheduled sync failed:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});