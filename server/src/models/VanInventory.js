const mongoose = require('mongoose');

const VanInventorySchema = new mongoose.Schema({
  vanId: { type: String, required: true },
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  reservedQuantity: { type: Number, default: 0 },
  availableQuantity: { type: Number, required: true, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  minStockLevel: { type: Number, default: 0 },
  maxStockLevel: { type: Number, default: 1000 },
  reorderLevel: { type: Number, default: 10 },
  lastReplenishmentDate: { type: Date },
  lastSaleDate: { type: Date },
  averageDailySales: { type: Number, default: 0 },
  stockValue: { type: Number, default: 0 }
}, {
  timestamps: true
});

VanInventorySchema.index({ vanId: 1, itemId: 1 }, { unique: true });
VanInventorySchema.index({ vanId: 1 });

module.exports = mongoose.model('VanInventory', VanInventorySchema);