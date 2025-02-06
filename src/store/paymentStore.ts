import { create } from 'zustand';
import { 
  collection, 
  addDoc,
  doc,
  query, 
  where, 
  onSnapshot,
  Timestamp,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import { useActivityStore } from './activityStore';
import { useAuthStore } from './authStore';
import type { Payment, PaymentMethod } from '../types';

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<(() => void) | undefined>;
  addPayment: (payment: {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    notes?: string;
    reference?: string;
    soldBy?: string;
    date?: Date;
    createdBy: string;
  }) => Promise<string>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  getPaymentsByOrder: (orderId: string) => Payment[];
  getTotalPaidForOrder: (orderId: string) => number;
  getPaymentsByDateRange: (startDate: Date, endDate: Date) => Promise<Payment[]>;
}

export const usePaymentStore = create<PaymentState>(
  createProtectedStore((set, get) => ({
    payments: [],
    loading: false,
    error: null,

    initialize: async () => {
      set({ loading: true });
      
      try {
        const q = query(
          collection(db, 'payments'),
          orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const payments = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              date: doc.data().date?.toDate() || doc.data().createdAt?.toDate() || new Date(),
              createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as Payment[];

            set({ payments, loading: false, error: null });
          },
          (error) => {
            console.error('Error fetching payments:', error);
            set({ error: error.message, loading: false });
          }
        );

        return unsubscribe;
      } catch (error: any) {
        console.error('Error initializing payments:', error);
        set({ error: error.message, loading: false });
        return undefined;
      }
    },

    addPayment: async (paymentData) => {
      try {
        set({ loading: true });
        const { logActivity } = useActivityStore.getState();

        if (!paymentData.createdBy) {
          throw new Error('User ID required');
        }

        const paymentDate = paymentData.date || new Date();

        // Clean up data by removing undefined values
        const cleanPaymentData = {
          ...paymentData,
          notes: paymentData.notes || null,
          reference: paymentData.reference || null,
          soldBy: paymentData.soldBy || null,
          status: 'completed' as const,
          createdBy: paymentData.createdBy,
          date: Timestamp.fromDate(paymentDate),
          createdAt: Timestamp.now()
        };

        // Add payment to payments collection
        const docRef = await addDoc(collection(db, 'payments'), cleanPaymentData);

        // Update rental schedule with payment
        const scheduleRef = doc(db, 'rental_schedules', paymentData.orderId);
        const scheduleSnap = await getDoc(scheduleRef);
        
        if (scheduleSnap.exists()) {
          const schedule = scheduleSnap.data();
          const payments = [...(schedule.payments || [])];
          
          // Find payment with closest due date
          const paymentDueDate = paymentDate;
          const paymentIndex = payments.findIndex(p => {
            const dueDate = p.dueDate?.toDate() || new Date();
            return Math.abs(dueDate.getTime() - paymentDueDate.getTime()) < 24 * 60 * 60 * 1000; // Within 24 hours
          });

          const newPayment = {
            id: docRef.id,
            amount: paymentData.amount,
            dueDate: Timestamp.fromDate(paymentDueDate),
            paidDate: Timestamp.fromDate(paymentDate),
            status: 'paid',
            type: 'rent',
            description: paymentData.notes || 'Rent Payment',
            reference: paymentData.reference
          };

          if (paymentIndex === -1) {
            payments.push(newPayment);
          } else {
            payments[paymentIndex] = {
              ...payments[paymentIndex],
              ...newPayment
            };
          }

          // Sort payments by due date
          payments.sort((a, b) => {
            const dateA = a.dueDate?.toDate() || new Date();
            const dateB = b.dueDate?.toDate() || new Date();
            return dateA.getTime() - dateB.getTime();
          });

          await updateDoc(scheduleRef, {
            payments,
            updatedAt: Timestamp.now()
          });
        }

        // Log activity
        await logActivity({
          type: 'payment',
          message: `Payment of $${paymentData.amount} added for Order #${paymentData.orderId}`,
          userId: paymentData.createdBy,
          userName: 'User', // We can fetch the name separately if needed
          entityId: paymentData.orderId,
          entityType: 'order',
          metadata: {
            amount: paymentData.amount,
            method: paymentData.method,
            paymentId: docRef.id,
            reference: paymentData.reference,
            soldBy: paymentData.soldBy,
            date: paymentData.date
          }
        });

        set({ loading: false, error: null });
        return docRef.id;
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    updatePayment: async (id, paymentData) => {
      try {
        set({ loading: true });
        const { user } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();
        const currentPayment = get().payments.find(p => p.id === id);

        if (!user) {
          throw new Error('User not authenticated');
        }

        if (!currentPayment) {
          throw new Error('Payment not found');
        }

        // Clean up data by removing undefined values
        const cleanPaymentData = Object.entries(paymentData).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            if (key === 'date') {
              acc[key] = Timestamp.fromDate(value as Date);
            } else if (value === '') {
              acc[key] = null;
            } else {
              acc[key] = value;
            }
          }
          return acc;
        }, {} as Record<string, any>);

        // Add updatedAt timestamp
        cleanPaymentData.updatedAt = Timestamp.now();

        const paymentRef = doc(db, 'payments', id);
        await updateDoc(paymentRef, cleanPaymentData);

        // Log activity
        await logActivity({
          type: 'payment_updated',
          message: `Payment updated for Order #${currentPayment.orderId}`,
          userId: user.id,
          userName: user.name,
          entityId: currentPayment.orderId,
          entityType: 'order',
          metadata: {
            paymentId: id,
            previousAmount: currentPayment.amount,
            newAmount: paymentData.amount,
            method: paymentData.method
          }
        });

        set({ loading: false, error: null });
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    deletePayment: async (id) => {
      try {
        set({ loading: true });
        const { logActivity } = useActivityStore.getState();
        const payment = get().payments.find(p => p.id === id);

        if (!payment) {
          throw new Error('Payment not found');
        }

        await deleteDoc(doc(db, 'payments', id));

        // Log activity
        await logActivity({
          type: 'payment_deleted',
          message: `Payment deleted for Order #${payment.orderId}`,
          userId: payment.createdBy,
          userName: 'User', // We can enhance this later to fetch the actual username
          entityId: payment.orderId,
          entityType: 'order',
          metadata: {
            amount: payment.amount,
            method: payment.method,
            reference: payment.reference
          }
        });

        set({ loading: false, error: null });
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    getPaymentsByOrder: (orderId) => {
      return get().payments.filter(payment => 
        payment.orderId === orderId && payment.status !== 'voided' && payment.status !== 'refunded'
      );
    },

    getTotalPaidForOrder: (orderId) => {
      return get().payments
        .filter(payment => payment.orderId === orderId && payment.status !== 'voided' && payment.status !== 'refunded')
        .reduce((sum, payment) => sum + payment.amount, 0);
    },

    getPaymentsByDateRange: async (startDate: Date, endDate: Date) => {
      try {
        const q = query(
          collection(db, 'payments'),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate()
        })) as Payment[];
      } catch (error: any) {
        console.error('Error fetching payments by date range:', error);
        throw error;
      }
    }
  }))
);