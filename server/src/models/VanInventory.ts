import mongoose, { Schema, Document } from 'mongoose';

export interface IVanInventory extends Document {
  vanId: string;
  itemId: string;
  quantity: number;
  reservedQuantory: number;
  availableQuantity: number;
  lastUpdated: Date;
}

const VanInventorySchema = new Schema<IVanInventory>({
  vanId: { type: String, required: true },
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  reservedQuantity: { type: Number, default: 0 },
  availableQuantity: { type: Number, required: true, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

VanInventorySchema.index({ vanId: 1, itemId: 1 }, { unique: true });

export default mongoose.model<IVanInventory>('VanInventory', VanInventorySchema);