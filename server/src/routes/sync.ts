import express from 'express';
import { SyncService } from '../services/sync/SyncService';
import SyncLog from '../models/SyncLog';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Trigger manual sync
router.post('/trigger', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    await SyncService.performFullSync();
    res.json({ message: 'Sync completed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
});

// Get sync status
router.get('/status', authenticate, async (req, res) => {
  try {
    const recentLogs = await SyncLog.find()
      .sort({ createdAt: -1 })
      .limit(50);

    const summary = await SyncLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      recentLogs,
      summary
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sync logs
router.get('/logs', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { page = 1, limit = 20, entityType, status } = req.query;
    const query: any = {};

    if (entityType) {
      query.entityType = entityType;
    }

    if (status) {
      query.status = status;
    }

    const logs = await SyncLog.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await SyncLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;