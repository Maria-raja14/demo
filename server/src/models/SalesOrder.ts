import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesOrderLine {
  itemId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  vatRate: number;
  exciseRate: number;
  lineAmount: number;
}

export interface ISalesOrder extends Document {
  bcOrderId?: string;
  orderNumber: string;
  customerId: string;
  salespersonId: string;
  vanId: string;
  orderDate: Date;
  deliveryDate: Date;
  status: 'draft' | 'approved' | 'cancelled' | 'picked' | 'invoiced' | 'delivered';
  lines: ISalesOrderLine[];
  subtotal: number;
  vatAmount: number;
  exciseAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'credit' | 'cheque';
  notes?: string;
  companyId: string;
  divisionId: string;
  syncStatus: 'pending' | 'synced' | 'failed';
}

const SalesOrderLineSchema = new Schema<ISalesOrderLine>({
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  vatRate: { type: Number, default: 0 },
  exciseRate: { type: Number, default: 0 },
  lineAmount: { type: Number, required: true }
});

const SalesOrderSchema = new Schema<ISalesOrder>({
  bcOrderId: { type: String },
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  salespersonId: { type: String, required: true },
  vanId: { type: String, required: true },
  orderDate: { type: Date, required: true },
  deliveryDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'approved', 'cancelled', 'picked', 'invoiced', 'delivered'],
    default: 'draft'
  },
  lines: [SalesOrderLineSchema],
  subtotal: { type: Number, required: true },
  vatAmount: { type: Number, default: 0 },
  exciseAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'credit', 'cheque'],
    required: true 
  },
  notes: { type: String },
  companyId: { type: String, required: true },
  divisionId: { type: String, required: true },
  syncStatus: { 
    type: String, 
    enum: ['pending', 'synced', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

SalesOrderSchema.index({ companyId: 1, divisionId: 1 });
SalesOrderSchema.index({ salespersonId: 1 });
SalesOrderSchema.index({ customerId: 1 });

export default mongoose.model<ISalesOrder>('SalesOrder', SalesOrderSchema);