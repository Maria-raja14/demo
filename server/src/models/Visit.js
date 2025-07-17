const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  salespersonId: { type: String, required: true },
  vanId: { type: String, required: true },
  plannedDate: { type: Date, required: true },
  actualDate: { type: Date },
  status: { 
    type: String, 
    enum: ['planned', 'completed', 'missed', 'cancelled', 'unplanned'],
    default: 'planned'
  },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  checkInLocation: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  checkOutLocation: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  notes: { type: String },
  ordersCreated: [{ type: String }],
  invoicesCreated: [{ type: String }],
  paymentsCollected: [{ type: String }],
  companyId: { type: String, required: true },
  divisionId: { type: String, required: true },
  visitType: {
    type: String,
    enum: ['scheduled', 'unplanned', 'follow_up'],
    default: 'scheduled'
  },
  duration: { type: Number }, // in minutes
  objectives: [{ type: String }],
  outcomes: [{ type: String }],
  nextVisitDate: { type: Date },
  customerFeedback: {
    satisfaction: { type: Number, min: 1, max: 5 },
    comments: { type: String }
  }
}, {
  timestamps: true
});

VisitSchema.index({ salespersonId: 1, plannedDate: 1 });
VisitSchema.index({ customerId: 1 });
VisitSchema.index({ companyId: 1, divisionId: 1 });

module.exports = mongoose.model('Visit', VisitSchema);