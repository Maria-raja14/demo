const mongoose = require('mongoose');

const SyncLogSchema = new mongoose.Schema({
  entityType: { type: String, required: true },
  operation: { 
    type: String, 
    enum: ['create', 'update', 'delete'], 
    required: true 
  },
  entityId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    required: true 
  },
  errorMessage: { type: String },
  attempts: { type: Number, default: 1 },
  lastAttempt: { type: Date, required: true }
}, {
  timestamps: true
});

SyncLogSchema.index({ entityType: 1, entityId: 1 });
SyncLogSchema.index({ status: 1 });

module.exports = mongoose.model('SyncLog', SyncLogSchema);