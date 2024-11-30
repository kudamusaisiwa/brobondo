import { create } from 'zustand';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import type { Customer, Order } from '../types';

interface PortalState {
  customer: Customer | null;
  order: Order | null;
  loading: boolean;
  error: string | null;
  authenticate: (email: string, passportNumber: string) => Promise<void>;
  clearError: () => void;
}

export const usePortalStore = create<PortalState>(
  createProtectedStore((set) => ({
    customer: null,
    order: null,
    loading: false,
    error: null,

    authenticate: async (email, passportNumber) => {
      set({ loading: true, error: null });
      
      try {
        // Query customer by email and passport
        const customersRef = collection(db, 'customers');
        const q = query(
          customersRef,
          where('email', '==', email.toLowerCase()),
          where('passportNumber', '==', passportNumber.toUpperCase()),
          limit(1)
        );

        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          throw new Error('Invalid credentials');
        }

        const customerDoc = snapshot.docs[0];
        const customerData = customerDoc.data();

        // Get latest order
        const ordersRef = collection(db, 'orders');
        const orderQuery = query(
          ordersRef,
          where('customerId', '==', customerDoc.id),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const orderSnapshot = await getDocs(orderQuery);
        const orderData = orderSnapshot.empty ? null : {
          id: orderSnapshot.docs[0].id,
          ...orderSnapshot.docs[0].data()
        };

        set({
          customer: {
            id: customerDoc.id,
            ...customerData,
            createdAt: customerData.createdAt.toDate(),
            updatedAt: customerData.updatedAt.toDate()
          },
          order: orderData ? {
            ...orderData,
            createdAt: orderData.createdAt.toDate(),
            updatedAt: orderData.updatedAt.toDate(),
            orderDate: orderData.orderDate?.toDate() || orderData.createdAt.toDate()
          } : null,
          loading: false,
          error: null
        });
      } catch (error: any) {
        set({ 
          error: error.message || 'Authentication failed',
          loading: false 
        });
        throw error;
      }
    },

    clearError: () => set({ error: null })
  }))
);