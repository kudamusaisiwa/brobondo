import { create } from 'zustand';
import {
  collection,
  doc,
  onSnapshot,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
  idNumber?: string;
  propertyCount: number;
  status: 'active' | 'inactive';
  leaseStatus: 'active' | 'pending' | 'ended';
  rentedProperties: string[];
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  monthlyRent?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TenantState {
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTenant: (id: string, tenant: Partial<Tenant>) => Promise<void>;
  updateTenantStatus: (id: string, status: 'active' | 'pending' | 'ended') => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenants: [],
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true });
    try {
      const q = query(
        collection(db, 'tenants'),
        orderBy('lastName'),
        orderBy('firstName')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tenants = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            leaseStartDate: data.leaseStartDate?.toDate(),
            leaseEndDate: data.leaseEndDate?.toDate(),
            rentedProperties: data.rentedProperties || []
          } as Tenant;
        });
        
        set({ tenants, loading: false });
      });
      
      return unsubscribe;
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addTenant: async (tenant) => {
    try {
      const now = new Date();
      const tenantData = {
        ...tenant,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        rentedProperties: tenant.rentedProperties || [],
        leaseStartDate: tenant.leaseStartDate ? Timestamp.fromDate(tenant.leaseStartDate) : null,
        leaseEndDate: tenant.leaseEndDate ? Timestamp.fromDate(tenant.leaseEndDate) : null
      };
      await addDoc(collection(db, 'tenants'), tenantData);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTenant: async (id, updates) => {
    try {
      const tenantRef = doc(db, 'tenants', id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Convert Date objects to Firestore Timestamps
      if (updates.leaseStartDate) {
        updateData.leaseStartDate = Timestamp.fromDate(updates.leaseStartDate);
      }
      if (updates.leaseEndDate) {
        updateData.leaseEndDate = Timestamp.fromDate(updates.leaseEndDate);
      }

      await updateDoc(tenantRef, updateData);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTenantStatus: async (id: string, status: 'active' | 'pending' | 'ended') => {
    try {
      const tenantRef = doc(db, 'tenants', id);
      await updateDoc(tenantRef, {
        status: status === 'active' ? 'active' : 'inactive',
        leaseStatus: status,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteTenant: async (id) => {
    try {
      const tenantRef = doc(db, 'tenants', id);
      await deleteDoc(tenantRef);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  }
}));
