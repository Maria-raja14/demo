import mongoose, { Schema, Document } from 'mongoose';

export interface IVisit extends Document {
  customerId: string;
  salespersonId: string;
  vanId: string;
  plannedDate: Date;
  actualDate?: Date;
  status: 'planned' | 'completed' | 'missed' | 'cancelled';
  checkInTime?: Date;
  checkOutTime?: Date;
  checkInLocation?: {
    latitude: number;
    longitude: number;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  ordersCreated: string[];
  invoicesCreated: string[];
  paymentsCollected: string[];
  companyId: string;
  divisionId: string;
}

const VisitSchema = new Schema<IVisit>({
  customerId: { type: String, required: true },
  salespersonId: { type: String, required: true },
  vanId: { type: String, required: true },
  plannedDate: { type: Date, required: true },
  actualDate: { type: Date },
  status: { 
    type: String, 
    enum: ['planned', 'completed', 'missed', 'cancelled'],
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
  divisionId: { type: String, required: true }
}, {
  timestamps: true
});

VisitSchema.index({ salespersonId: 1, plannedDate: 1 });
VisitSchema.index({ customerId: 1 });

export default mongoose.model<IVisit>('Visit', VisitSchema);