const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['text', 'number', 'rating', 'multiple_choice', 'yes_no'],
    required: true
  },
  response: { type: mongoose.Schema.Types.Mixed, required: true }
});

const SurveySchema = new mongoose.Schema({
  surveyType: {
    type: String,
    enum: ['customer_satisfaction', 'competitor_analysis', 'stock_check'],
    required: true
  },
  customerId: { type: String, required: true },
  salespersonId: { type: String, required: true },
  visitId: { type: String },
  surveyDate: { type: Date, required: true },
  responses: [SurveyResponseSchema],
  overallScore: { type: Number },
  notes: { type: String },
  companyId: { type: String, required: true },
  divisionId: { type: String, required: true },
  
  // Competitor Analysis specific fields
  competitorProducts: [{
    competitorName: { type: String },
    productName: { type: String },
    price: { type: Number },
    availability: { type: String },
    promotions: { type: String }
  }],
  
  // Stock Check specific fields
  shelfStock: [{
    itemId: { type: String },
    shelfQuantity: { type: Number },
    expiryDate: { type: Date },
    condition: { type: String }
  }]
}, {
  timestamps: true
});

SurveySchema.index({ customerId: 1 });
SurveySchema.index({ salespersonId: 1 });
SurveySchema.index({ surveyType: 1 });

module.exports = mongoose.model('Survey', SurveySchema);