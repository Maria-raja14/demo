const mongoose = require('mongoose');

const SalesOrderLineSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  vatRate: { type: Number, default: 0 },
  exciseRate: { type: Number, default: 0 },
  lineAmount: { type: Number, required: true },
  promotionApplied: {
    type: { type: String },
    description: { type: String },
    freeQuantity: { type: Number, default: 0 }
  }
});

const SalesOrderSchema = new mongoose.Schema({
  bcOrderId: { type: String },
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  salespersonId: { type: String, required: true },
  vanId: { type: String, required: true },
  orderDate: { type: Date, required: true },
  deliveryDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'approved', 'cancelled', 'picked', 'invoiced', 'delivered'],
    default: 'draft'
  },
  lines: [SalesOrderLineSchema],
  subtotal: { type: Number, required: true },
  vatAmount: { type: Number, default: 0 },
  exciseAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'credit', 'cheque'],
    required: true 
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
  deliveryAddress: { type: String },
  approvedBy: { type: String },
  approvedAt: { type: Date }
}, {
  timestamps: true
});

SalesOrderSchema.index({ companyId: 1, divisionId: 1 });
SalesOrderSchema.index({ salespersonId: 1 });
SalesOrderSchema.index({ customerId: 1 });
SalesOrderSchema.index({ status: 1 });

module.exports = mongoose.model('SalesOrder', SalesOrderSchema);