const mongoose = require('mongoose');

const InvoiceLineSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  vatRate: { type: Number, default: 0 },
  exciseRate: { type: Number, default: 0 },
  lineAmount: { type: Number, required: true }
});

const InvoiceSchema = new mongoose.Schema({
  bcInvoiceId: { type: String },
  invoiceNumber: { type: String, required: true, unique: true },
  orderId: { type: String },
  customerId: { type: String, required: true },
  salespersonId: { type: String, required: true },
  vanId: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'posted', 'paid', 'cancelled'],
    default: 'draft'
  },
  lines: [InvoiceLineSchema],
  subtotal: { type: Number, required: true },
  vatAmount: { type: Number, default: 0 },
  exciseAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'credit', 'cheque']
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
  printCount: { type: Number, default: 0 },
  lastPrintedAt: { type: Date }
}, {
  timestamps: true
});

InvoiceSchema.index({ companyId: 1, divisionId: 1 });
InvoiceSchema.index({ salespersonId: 1 });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);