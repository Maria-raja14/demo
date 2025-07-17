const mongoose = require('mongoose');

const PaymentAllocationSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true },
  allocatedAmount: { type: Number, required: true }
});

const PaymentSchema = new mongoose.Schema({
  bcPaymentId: { type: String },
  paymentNumber: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  salespersonId: { type: String, required: true },
  vanId: { type: String, required: true },
  paymentDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'cheque'],
    required: true 
  },
  chequeNumber: { type: String },
  chequeDate: { type: Date },
  bankName: { type: String },
  allocations: [PaymentAllocationSchema],
  status: { 
    type: String, 
    enum: ['pending', 'cleared', 'bounced'],
    default: 'pending'
  },
  companyId: { type: String, required: true },
  divisionId: { type: String, required: true },
  syncStatus: { 
    type: String, 
    enum: ['pending', 'synced', 'failed'],
    default: 'pending'
  },
  visitId: { type: String },
  receiptPrinted: { type: Boolean, default: false },
  notes: { type: String }
}, {
  timestamps: true
});

PaymentSchema.index({ companyId: 1, divisionId: 1 });
PaymentSchema.index({ salespersonId: 1 });
PaymentSchema.index({ customerId: 1 });
PaymentSchema.index({ paymentDate: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);