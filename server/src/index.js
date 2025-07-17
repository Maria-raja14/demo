const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const masterDataRoutes = require('./routes/masterData');
const visitRoutes = require('./routes/visits');
const salesRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');
const invoiceRoutes = require('./routes/invoices');
const paymentRoutes = require('./routes/payments');
const returnRoutes = require('./routes/returns');
const transferRoutes = require('./routes/transfers');
const reportsRoutes = require('./routes/reports');
const syncRoutes = require('./routes/sync');
const surveyRoutes = require('./routes/surveys');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { SyncService } = require('./services/sync/SyncService');

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
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/surveys', surveyRoutes);

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