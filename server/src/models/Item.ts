import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  bcItemId: string;
  code: string;
  description: string;
  category: string;
  unitOfMeasure: string;
  unitPrice: number;
  vatRate: number;
  exciseRate: number;
  isVanAllowed: boolean;
  isActive: boolean;
  companyId: string;
}

const ItemSchema = new Schema<IItem>({
  bcItemId: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  unitOfMeasure: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  vatRate: { type: Number, default: 0 },
  exciseRate: { type: Number, default: 0 },
  isVanAllowed: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  companyId: { type: String, required: true }
}, {
  timestamps: true
});

ItemSchema.index({ companyId: 1 });
ItemSchema.index({ isVanAllowed: 1 });

export default mongoose.model<IItem>('Item', ItemSchema);