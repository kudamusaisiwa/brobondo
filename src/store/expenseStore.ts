import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import { useActivityStore } from './activityStore';
import { useAuthStore } from './authStore';
import type { Expense, ExpenseCategory } from '../types';

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<(() => void) | undefined>;
  addExpense: (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  updateExpense: (id: string, expenseData: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpenseById: (id: string) => Expense | undefined;
  getExpensesByCategory: (category: ExpenseCategory) => Expense[];
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Promise<Expense[]>;
  getTotalExpenses: (startDate?: Date | null, endDate?: Date | null, timeRange?: string) => number;
}

export const useExpenseStore = create<ExpenseState>(
  createProtectedStore((set, get) => ({
    expenses: [],
    loading: false,
    error: null,

    initialize: async () => {
      set({ loading: true });
      
      try {
        const q = query(
          collection(db, 'expenses'),
          orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const expenses = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              date: doc.data().date.toDate(),
              createdAt: doc.data().createdAt.toDate(),
              updatedAt: doc.data().updatedAt.toDate()
            })) as Expense[];

            set({ expenses, loading: false, error: null });
          },
          (error) => {
            console.error('Error fetching expenses:', error);
            set({ error: error.message, loading: false });
          }
        );

        return unsubscribe;
      } catch (error: any) {
        console.error('Error initializing expenses:', error);
        set({ error: error.message, loading: false });
        return undefined;
      }
    },

    addExpense: async (expenseData) => {
      try {
        set({ loading: true });
        const { user } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();

        if (!user) {
          throw new Error('User not authenticated');
        }

        const docRef = await addDoc(collection(db, 'expenses'), {
          ...expenseData,
          createdBy: user.id,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          date: Timestamp.fromDate(expenseData.date)
        });

        // Log activity
        await logActivity({
          type: 'expense_created',
          message: `New expense added: ${expenseData.description}`,
          userId: user.id,
          userName: user.name,
          entityId: docRef.id,
          entityType: 'expense',
          metadata: {
            amount: expenseData.amount,
            category: expenseData.category,
            paymentMethod: expenseData.paymentMethod
          }
        });

        set({ loading: false, error: null });
        return docRef.id;
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    updateExpense: async (id, expenseData) => {
      try {
        set({ loading: true });
        const expenseRef = doc(db, 'expenses', id);
        const { user } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();
        const currentExpense = get().expenses.find(e => e.id === id);

        if (!user) {
          throw new Error('User not authenticated');
        }

        if (!currentExpense) {
          throw new Error('Expense not found');
        }

        const updateData = {
          ...expenseData,
          updatedAt: Timestamp.now(),
          ...(expenseData.date && { date: Timestamp.fromDate(expenseData.date) })
        };

        await updateDoc(expenseRef, updateData);

        // Log activity
        await logActivity({
          type: 'expense_updated',
          message: `Expense updated: ${currentExpense.description}`,
          userId: user.id,
          userName: user.name,
          entityId: id,
          entityType: 'expense',
          metadata: {
            previousAmount: currentExpense.amount,
            newAmount: expenseData.amount,
            category: expenseData.category
          }
        });

        set({ loading: false, error: null });
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    deleteExpense: async (id) => {
      try {
        set({ loading: true });
        const { user } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();
        const expense = get().expenses.find(e => e.id === id);

        if (!user) {
          throw new Error('User not authenticated');
        }

        if (!expense) {
          throw new Error('Expense not found');
        }

        await deleteDoc(doc(db, 'expenses', id));

        // Log activity
        await logActivity({
          type: 'expense_deleted',
          message: `Expense deleted: ${expense.description}`,
          userId: user.id,
          userName: user.name,
          entityId: id,
          entityType: 'expense',
          metadata: {
            amount: expense.amount,
            category: expense.category,
            description: expense.description
          }
        });

        set({ loading: false, error: null });
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    getExpenseById: (id) => {
      return get().expenses.find(expense => expense.id === id);
    },

    getExpensesByCategory: (category) => {
      return get().expenses.filter(expense => expense.category === category);
    },

    getExpensesByDateRange: async (startDate: Date, endDate: Date) => {
      try {
        const q = query(
          collection(db, 'expenses'),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as Expense[];
      } catch (error: any) {
        console.error('Error fetching expenses by date range:', error);
        throw error;
      }
    },

    getTotalExpenses: (startDate?: Date | null, endDate?: Date | null, timeRange?: string) => {
      const expenses = get().expenses;
      if (!expenses.length) return 0;

      return expenses.filter(expense => {
        if (!expense?.date) return false;
        const expenseDate = new Date(expense.date);

        // If custom date range is provided
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return expenseDate >= start && expenseDate <= end;
        }

        // If time range is provided
        if (timeRange) {
          const now = new Date();
          now.setHours(23, 59, 59, 999);
          
          switch (timeRange) {
            case 'today': {
              const start = new Date(now);
              start.setHours(0, 0, 0, 0);
              return expenseDate >= start && expenseDate <= now;
            }
            case 'yesterday': {
              const start = new Date(now);
              start.setDate(now.getDate() - 1);
              start.setHours(0, 0, 0, 0);
              const end = new Date(start);
              end.setHours(23, 59, 59, 999);
              return expenseDate >= start && expenseDate <= end;
            }
            case '7d': {
              const start = new Date(now);
              start.setDate(now.getDate() - 7);
              start.setHours(0, 0, 0, 0);
              return expenseDate >= start && expenseDate <= now;
            }
            case '30d': {
              const start = new Date(now);
              start.setDate(now.getDate() - 30);
              start.setHours(0, 0, 0, 0);
              return expenseDate >= start && expenseDate <= now;
            }
            case '3m': {
              const start = new Date(now);
              start.setMonth(now.getMonth() - 3);
              start.setHours(0, 0, 0, 0);
              return expenseDate >= start && expenseDate <= now;
            }
            case '12m': {
              const start = new Date(now);
              start.setFullYear(now.getFullYear() - 1);
              start.setHours(0, 0, 0, 0);
              return expenseDate >= start && expenseDate <= now;
            }
            default:
              return true;
          }
        }

        // If no filters provided, include all expenses
        return true;
      }).reduce((total, expense) => total + (expense.amount || 0), 0);
    }
  }))
);