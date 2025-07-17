import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  bcCustomerId: string;
  code: string;
  name: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  creditLimit: number;
  currentBalance: number;
  isBlocked: boolean;
  paymentTerms: string;
  priceGroupCode: string;
  vatRegistrationNo: string;
  companyId: string;
  divisionId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  lastVisit?: Date;
}

const CustomerSchema = new Schema<ICustomer>({
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
  lastVisit: { type: Date }
}, {
  timestamps: true
});

CustomerSchema.index({ companyId: 1, divisionId: 1 });
CustomerSchema.index({ location: '2dsphere' });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);