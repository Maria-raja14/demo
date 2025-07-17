import express from 'express';
import VanInventory from '../models/VanInventory';
import Item from '../models/Item';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get van inventory
router.get('/', authenticate, async (req: any, res) => {
  try {
    if (!req.user.vanId) {
      return res.status(400).json({ message: 'User not assigned to a van' });
    }

    const inventory = await VanInventory.find({ vanId: req.user.vanId })
      .populate('itemId', 'code description unitOfMeasure unitPrice');

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request stock replenishment
router.post('/replenishment', authenticate, async (req: any, res) => {
  try {
    const { items } = req.body; // Array of { itemId, requestedQuantity }

    if (!req.user.vanId) {
      return res.status(400).json({ message: 'User not assigned to a van' });
    }

    // Validate all items are van-allowed
    for (const requestItem of items) {
      const item = await Item.findOne({
        _id: requestItem.itemId,
        isVanAllowed: true,
        isActive: true
      });

      if (!item) {
        return res.status(400).json({ 
          message: `Item ${requestItem.itemId} is not allowed for van sales` 
        });
      }
    }

    // Create replenishment request (this would integrate with warehouse system)
    const replenishmentRequest = {
      id: Date.now().toString(),
      vanId: req.user.vanId,
      salespersonId: req.user._id,
      items,
      status: 'pending',
      requestDate: new Date(),
      companyId: req.user.companyId,
      divisionId: req.user.divisionId
    };

    // In a real implementation, this would be saved to a ReplenishmentRequest model
    // and trigger workflow notifications to warehouse staff

    res.status(201).json({
      message: 'Replenishment request created successfully',
      request: replenishmentRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update van inventory (for loading/unloading)
router.patch('/items/:itemId', authenticate, async (req: any, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'load' | 'unload' | 'return'

    if (!req.user.vanId) {
      return res.status(400).json({ message: 'User not assigned to a van' });
    }

    let vanInventory = await VanInventory.findOne({
      vanId: req.user.vanId,
      itemId: req.params.itemId
    });

    if (!vanInventory) {
      // Create new inventory record
      vanInventory = new VanInventory({
        vanId: req.user.vanId,
        itemId: req.params.itemId,
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0
      });
    }

    switch (operation) {
      case 'load':
        vanInventory.quantity += quantity;
        vanInventory.availableQuantity += quantity;
        break;
      case 'unload':
        if (vanInventory.availableQuantity < quantity) {
          return res.status(400).json({ message: 'Insufficient available quantity' });
        }
        vanInventory.quantity -= quantity;
        vanInventory.availableQuantity -= quantity;
        break;
      case 'return':
        vanInventory.quantity -= quantity;
        vanInventory.availableQuantity -= quantity;
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    vanInventory.lastUpdated = new Date();
    await vanInventory.save();

    res.json(vanInventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;