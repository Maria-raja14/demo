const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  bcCustomerId: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  region: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  creditLimit: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  paymentTerms: { type: String, default: 'NET30' },
  priceGroupCode: { type: String },
  vatRegistrationNo: { type: String },
  companyId: { type: String, required: true },
  divisionId: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  lastVisit: { type: Date },
  visitFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    default: 'weekly'
  },
  preferredVisitDay: { type: String },
  route: { type: String },
  territory: { type: String },
  salesPersonId: { type: String }
}, {
  timestamps: true
});

CustomerSchema.index({ companyId: 1, divisionId: 1 });
CustomerSchema.index({ location: '2dsphere' });
CustomerSchema.index({ route: 1 });

module.exports = mongoose.model('Customer', CustomerSchema);