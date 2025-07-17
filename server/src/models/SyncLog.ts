import mongoose, { Schema, Document } from 'mongoose';

export interface ISyncLog extends Document {
  entityType: string;
  operation: 'create' | 'update' | 'delete';
  entityId: string;
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string;
  attempts: number;
  lastAttempt: Date;
}

const SyncLogSchema = new Schema<ISyncLog>({
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

export default mongoose.model<ISyncLog>('SyncLog', SyncLogSchema);