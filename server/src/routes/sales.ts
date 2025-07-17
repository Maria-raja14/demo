import express from 'express';
import SalesOrder from '../models/SalesOrder';
import Item from '../models/Item';
import Customer from '../models/Customer';
import { authenticate } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get sales orders
router.get('/orders', authenticate, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, status, customerId } = req.query;
    const query: any = {
      salespersonId: req.user._id,
      companyId: req.user.companyId,
      divisionId: req.user.divisionId
    };

    if (status) {
      query.status = status;
    }

    if (customerId) {
      query.customerId = customerId;
    }

    const orders = await SalesOrder.find(query)
      .populate('customerId', 'name code')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await SalesOrder.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create sales order
router.post('/orders', authenticate, async (req: any, res) => {
  try {
    const { customerId, lines, deliveryDate, paymentMethod, notes } = req.body;

    // Validate customer
    const customer = await Customer.findOne({
      _id: customerId,
      companyId: req.user.companyId,
      divisionId: req.user.divisionId
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check customer credit limit and blocked status
    if (customer.isBlocked) {
      return res.status(400).json({ message: 'Customer is blocked' });
    }

    // Validate and calculate order lines
    let subtotal = 0;
    let vatAmount = 0;
    let exciseAmount = 0;
    let discountAmount = 0;

    const validatedLines = [];

    for (const line of lines) {
      const item = await Item.findOne({
        _id: line.itemId,
        companyId: req.user.companyId,
        isActive: true
      });

      if (!item) {
        return res.status(400).json({ message: `Item ${line.itemId} not found` });
      }

      const lineAmount = line.quantity * line.unitPrice;
      const lineDiscountAmount = (lineAmount * line.discountPercent) / 100;
      const netAmount = lineAmount - lineDiscountAmount;
      const lineVatAmount = (netAmount * item.vatRate) / 100;
      const lineExciseAmount = (netAmount * item.exciseRate) / 100;

      validatedLines.push({
        itemId: line.itemId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountPercent: line.discountPercent || 0,
        discountAmount: lineDiscountAmount,
        vatRate: item.vatRate,
        exciseRate: item.exciseRate,
        lineAmount: netAmount + lineVatAmount + lineExciseAmount
      });

      subtotal += netAmount;
      vatAmount += lineVatAmount;
      exciseAmount += lineExciseAmount;
      discountAmount += lineDiscountAmount;
    }

    const totalAmount = subtotal + vatAmount + exciseAmount;

    // Check credit limit
    if (customer.currentBalance + totalAmount > customer.creditLimit) {
      return res.status(400).json({ 
        message: 'Order exceeds customer credit limit',
        creditLimit: customer.creditLimit,
        currentBalance: customer.currentBalance,
        orderAmount: totalAmount
      });
    }

    // Generate order number
    const orderNumber = `SO-${Date.now()}-${uuidv4().substr(0, 8)}`;

    const orderData = {
      orderNumber,
      customerId,
      salespersonId: req.user._id,
      vanId: req.user.vanId,
      orderDate: new Date(),
      deliveryDate: new Date(deliveryDate),
      lines: validatedLines,
      subtotal,
      vatAmount,
      exciseAmount,
      discountAmount,
      totalAmount,
      paymentMethod,
      notes,
      companyId: req.user.companyId,
      divisionId: req.user.divisionId
    };

    const order = new SalesOrder(orderData);
    await order.save();

    const populatedOrder = await SalesOrder.findById(order._id)
      .populate('customerId', 'name code');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.patch('/orders/:id/status', authenticate, async (req: any, res) => {
  try {
    const { status } = req.body;
    
    const order = await SalesOrder.findOne({
      _id: req.params.id,
      salespersonId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status transition
    const validTransitions = {
      'draft': ['approved', 'cancelled'],
      'approved': ['picked', 'cancelled'],
      'picked': ['invoiced'],
      'invoiced': ['delivered']
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Cannot change status from ${order.status} to ${status}` 
      });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID
router.get('/orders/:id', authenticate, async (req: any, res) => {
  try {
    const order = await SalesOrder.findOne({
      _id: req.params.id,
      salespersonId: req.user._id
    }).populate('customerId', 'name code address phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Populate item details for each line
    const populatedLines = await Promise.all(
      order.lines.map(async (line) => {
        const item = await Item.findById(line.itemId);
        return {
          ...line.toObject(),
          item: item ? {
            code: item.code,
            description: item.description,
            unitOfMeasure: item.unitOfMeasure
          } : null
        };
      })
    );

    res.json({
      ...order.toObject(),
      lines: populatedLines
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;