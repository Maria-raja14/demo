import express from 'express';
import Customer from '../models/Customer';
import Item from '../models/Item';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get customers
router.get('/customers', authenticate, async (req: any, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query: any = {
      companyId: req.user.companyId,
      divisionId: req.user.divisionId
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Customer.countDocuments(query);

    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get customer by ID
router.get('/customers/:id', authenticate, async (req: any, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
      divisionId: req.user.divisionId
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get items
router.get('/items', authenticate, async (req: any, res) => {
  try {
    const { page = 1, limit = 50, search, vanOnly = false } = req.query;
    const query: any = {
      companyId: req.user.companyId,
      isActive: true
    };

    if (vanOnly === 'true') {
      query.isVanAllowed = true;
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ description: 1 });

    const total = await Item.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get item by ID
router.get('/items/:id', authenticate, async (req: any, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
      isActive: true
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;