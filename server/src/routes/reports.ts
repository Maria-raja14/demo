import express from 'express';
import SalesOrder from '../models/SalesOrder';
import Visit from '../models/Visit';
import Customer from '../models/Customer';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Sales summary report
router.get('/sales-summary', authenticate, async (req: any, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const pipeline = [
      {
        $match: {
          salespersonId: req.user._id,
          companyId: req.user.companyId,
          divisionId: req.user.divisionId,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalVat: { $sum: '$vatAmount' },
          totalExcise: { $sum: '$exciseAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ];

    const summary = await SalesOrder.aggregate(pipeline);
    
    // Get status breakdown
    const statusBreakdown = await SalesOrder.aggregate([
      {
        $match: {
          salespersonId: req.user._id,
          companyId: req.user.companyId,
          divisionId: req.user.divisionId,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      summary: summary[0] || {
        totalOrders: 0,
        totalAmount: 0,
        totalVat: 0,
        totalExcise: 0,
        avgOrderValue: 0
      },
      statusBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Visit compliance report
router.get('/visit-compliance', authenticate, async (req: any, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.plannedDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const visitStats = await Visit.aggregate([
      {
        $match: {
          salespersonId: req.user._id,
          companyId: req.user.companyId,
          divisionId: req.user.divisionId,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalPlanned = await Visit.countDocuments({
      salespersonId: req.user._id,
      companyId: req.user.companyId,
      divisionId: req.user.divisionId,
      ...dateFilter
    });

    res.json({
      totalPlanned,
      visitStats,
      complianceRate: totalPlanned > 0 ? 
        ((visitStats.find(s => s._id === 'completed')?.count || 0) / totalPlanned * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Customer aging report
router.get('/customer-aging/:customerId', authenticate, async (req: any, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.customerId,
      companyId: req.user.companyId,
      divisionId: req.user.divisionId
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // This would typically fetch from D365 BC customer ledger entries
    // For now, we'll simulate aging buckets
    const agingBuckets = {
      current: 0,      // 0-30 days
      bucket30: 0,     // 31-60 days
      bucket60: 0,     // 61-90 days
      bucket90: 0,     // >90 days
      total: customer.currentBalance
    };

    // In a real implementation, this would calculate based on invoice dates
    // and payment history from D365 BC

    res.json({
      customer: {
        id: customer._id,
        name: customer.name,
        code: customer.code,
        creditLimit: customer.creditLimit,
        currentBalance: customer.currentBalance
      },
      agingBuckets
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;