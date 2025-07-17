const mongoose = require('mongoose');

const ReplenishmentItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  requestedQuantity: { type: Number, required: true },
  approvedQuantity: { type: Number, default: 0 },
  fulfilledQuantity: { type: Number, default: 0 },
  unitCost: { type: Number, default: 0 }
});

const ReplenishmentRequestSchema = new mongoose.Schema({
  requestNumber: { type: String, required: true, unique: true },
  vanId: { type: String, required: true },
  salespersonId: { type: String, required: true },
  requestDate: { type: Date, required: true },
  requiredDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'partially_fulfilled', 'fulfilled'],
    default: 'pending'
  },
  items: [ReplenishmentItemSchema],
  totalValue: { type: Number, default: 0 },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  fulfilledBy: { type: String },
  fulfilledAt: { type: Date },
  notes: { type: String },
  rejectionReason: { type: String },
  companyId: { type: String, required: true },
  divisionId: { type: String, required: true },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

ReplenishmentRequestSchema.index({ vanId: 1 });
ReplenishmentRequestSchema.index({ salespersonId: 1 });
ReplenishmentRequestSchema.index({ status: 1 });

module.exports = mongoose.model('ReplenishmentRequest', ReplenishmentRequestSchema);