const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  bcItemId: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  unitOfMeasure: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  vatRate: { type: Number, default: 0 },
  exciseRate: { type: Number, default: 0 },
  isVanAllowed: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  companyId: { type: String, required: true },
  barcode: { type: String },
  weight: { type: Number },
  volume: { type: Number },
  minOrderQuantity: { type: Number, default: 1 },
  maxOrderQuantity: { type: Number },
  promotions: [{
    type: { type: String, enum: ['bundle', 'discount', 'freebie'] },
    description: { type: String },
    buyQuantity: { type: Number },
    getQuantity: { type: Number },
    discountPercent: { type: Number },
    validFrom: { type: Date },
    validTo: { type: Date },
    isActive: { type: Boolean, default: true }
  }]
}, {
  timestamps: true
});

ItemSchema.index({ companyId: 1 });
ItemSchema.index({ isVanAllowed: 1 });
ItemSchema.index({ category: 1 });

module.exports = mongoose.model('Item', ItemSchema);