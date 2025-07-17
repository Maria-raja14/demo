const mongoose = require('mongoose');

const ReturnLineSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineAmount: { type: Number, required: true },
  reason: { type: String, required: true }
});

const SalesReturnSchema = new mongoose.Schema({
  bcReturnId: { type: String },
  returnNumber: { type: String, required: true, unique: true },
  originalInvoiceId: { type: String },
  customerId: { type: String, required: true },
  salespersonId: { type: String, required: true },
  vanId: { type: String, required: true },
  returnDate: { type: Date, required: true },
  returnType: {
    type: String,
    enum: ['warehouse_collection', 'immediate_return'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'collected', 'processed', 'cancelled'],
    default: 'pending'
  },
  lines: [ReturnLineSchema],
  totalAmount: { type: Number, required: true },
  refundMethod: {
    type: String,
    enum: ['cash', 'credit_note', 'exchange']
  },
  notes: { type: String },
  companyId: { type: String, required: true },
  divisionId: { type: String, required: true },
  syncStatus: {
    type: String,
    enum: ['pending', 'synced', 'failed'],
    default: 'pending'
  },
  visitId: { type: String },
  approvedBy: { type: String },
  approvedAt: { type: Date }
}, {
  timestamps: true
});

SalesReturnSchema.index({ companyId: 1, divisionId: 1 });
SalesReturnSchema.index({ salespersonId: 1 });
SalesReturnSchema.index({ customerId: 1 });

module.exports = mongoose.model('SalesReturn', SalesReturnSchema);