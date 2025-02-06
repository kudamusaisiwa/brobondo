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
  manyContactId?: string;
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

export type LeadType = 'tenant' | 'buyer';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: LeadType;
  description: string;
  status: LeadStatus;
  notes?: string;
  tags?: string[];
  source?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  statusHistory?: {
    status: LeadStatus;
    changedAt: Date;
  }[];
}

export type CommunicationType = 'phone' | 'whatsapp' | 'call' | 'walk-in' | 'email';

export interface Communication {
  id: string;
  customerId: string;
  type: CommunicationType;
  summary: string;
  createdBy: string;
  createdAt: Date;
}



export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'agent' | 'user';
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AppUser {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  displayName?: string;
  role: 'admin' | 'agent' | 'user';
  createdAt: Date;
  updatedAt?: Date;
}