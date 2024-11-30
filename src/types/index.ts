// Add to existing types

export enum OrderStatus {
  CIPC_NAME = 'cipc_name',
  CIPC_PENDING = 'cipc_pending',
  CIPC_COMPLETE = 'cipc_complete',
  FNB_FORMS = 'fnb_forms',
  ACCOUNT_OPENED = 'account_opened',
  CARD_DELIVERED = 'card_delivered',
  PROCESS_COMPLETE = 'process_complete'
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  products: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;  // Added cost price tracking
    name: string;
  }>;
  totalAmount: number;
  totalCost: number;  // Added total cost tracking
  vatAmount: number;
  paidAmount: number;
  notes?: string;
  reference?: string;
  deliveryMethod?: string;
  deliveryDate?: Date;
  collectionDate?: Date;
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'voided' | 'refunded';
  reference?: string;
  notes?: string;
  soldBy?: string;
  date: Date; // Transaction date
  createdAt: Date; // Record creation date
}

export type PaymentMethod = 'bank_transfer' | 'cash' | 'ecocash' | 'innbucks' | 'online_payment';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  address?: string;
  notes?: string;
  passportNumber?: string;
  manyChatId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  description: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
}

export interface Lead {
  id: string;
  name: string;
  number?: string;
  email?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  lastSync: Timestamp;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: Note[] | string | null;
  hidden?: boolean;
  convertedToCustomer?: boolean;
  convertedAt?: Timestamp;
  manyChatId?: string;
  statusHistory?: {
    status: Lead['status'];
    changedAt: Timestamp;
  }[];
  changedAt: Timestamp;
  firstContactedAt?: Timestamp;
  locallyModified?: boolean; // New flag to prevent overwriting local changes
}