const mongoose = require('mongoose');

const TransferLineSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true }
});

const VanTransferSchema = new mongoose.Schema({
  transferNumber: { type: String, required: true, unique: true },
  fromVanId: { type: String, required: true },
  toVanId: { type: String },
  toWarehouse: { type: String },
  transferType: {
    type: String,
    enum: ['van_to_van', 'van_to_warehouse'],
    required: true
  },
  transferDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'received', 'cancelled'],
    default: 'pending'
  },
  lines: [TransferLineSchema],
  totalValue: { type: Number, required: true },
  requestedBy: { type: String, required: true },
  approvedBy: { type: String },
  receivedBy: { type: String },
  notes: { type: String },
  companyId: { type: String, required: true },
  divisionId: { type: String, required: true }
}, {
  timestamps: true
});

VanTransferSchema.index({ fromVanId: 1 });
VanTransferSchema.index({ toVanId: 1 });
VanTransferSchema.index({ status: 1 });

module.exports = mongoose.model('VanTransfer', VanTransferSchema);