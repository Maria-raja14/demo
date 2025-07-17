export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'salesperson' | 'manager' | 'admin';
  companyId: string;
  divisionId: string;
  vanId?: string;
  isActive: boolean;
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  _id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  _id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface VanInventory {
  _id: string;
  vanId: string;
  itemId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: Date;
}

export interface SalesOrder {
  _id: string;
  bcOrderId?: string;
  orderNumber: string;
  customerId: string;
  salespersonId: string;
  vanId: string;
  orderDate: Date;
  deliveryDate: Date;
  status: 'draft' | 'approved' | 'cancelled' | 'picked' | 'invoiced' | 'delivered';
  lines: SalesOrderLine[];
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
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesOrderLine {
  itemId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  vatRate: number;
  exciseRate: number;
  lineAmount: number;
}

export interface Visit {
  _id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  _id: string;
  bcPaymentId?: string;
  paymentNumber: string;
  customerId: string;
  salespersonId: string;
  vanId: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'cheque';
  chequeNumber?: string;
  chequeDate?: Date;
  bankName?: string;
  allocations: PaymentAllocation[];
  status: 'pending' | 'cleared' | 'bounced';
  companyId: string;
  divisionId: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentAllocation {
  invoiceId: string;
  allocatedAmount: number;
}

export interface SyncLog {
  _id: string;
  entityType: string;
  operation: 'create' | 'update' | 'delete';
  entityId: string;
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string;
  attempts: number;
  lastAttempt: Date;
  createdAt: Date;
}

export interface D365Config {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
  scope: string;
}

export interface RegionalTaxConfig {
  region: string;
  vatRate: number;
  exciseRate: number;
  taxAuthority: string;
}