import { create } from 'zustand';
import { 
  collection, 
  doc,
  addDoc,
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  updateDoc,
  deleteDoc,
  writeBatch,
  where,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import { useActivityStore } from './activityStore';
import { useAuthStore } from './authStore';
import { useOrderStore } from './orderStore';
import type { Customer } from '../types';

interface Customer {
  id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  number?: string;
  email?: string;
  address?: string;
  notes?: string[];
  leadSource?: string;
  createdAt: Date;
  convertedFromLeadId?: string;
  
  // Additional fields
  passportNumber?: string;
  dateOfBirth?: Date;
  homeAddress?: string;
  companyNames?: string[];
  cardDeliveryAddress?: string;
  companyName?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  status?: string;
  type?: string;
}

interface CustomerState {
  customers: (Customer & {
    totalOrders?: number;
    totalRevenue?: number;
  })[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isInitialized: boolean;
  initialize: () => Promise<(() => void) | undefined>;
  addCustomer: (customer: Omit<Customer, 'createdAt'>) => Promise<Customer>;
  findCustomerByNumber: (number: string) => Promise<Customer | null>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  importCustomers: (customers: Array<Partial<Customer>>) => Promise<void>;
  convertLeadToCustomer: (leadId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'convertedFromLeadId'>) => Promise<string>;
}

export const useCustomerStore = create<CustomerState>(
  createProtectedStore((set, get) => ({
    customers: [],
    loading: false,
    error: null,
    clearError: () => set({ error: null }),
    isInitialized: false,

    initialize: async () => {
      set({ loading: true, error: null });
      
      try {
        console.log('Initializing customer store...');
        
        // Ensure orders are loaded
        const { orders } = useOrderStore.getState();
        if (orders.length === 0) {
          await useOrderStore.getState().initialize();
        }
        
        const baseQuery = query(
          collection(db, 'customers'),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(baseQuery);
        const customers = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Raw customer data:', data); // Debug log
          
          // Handle date fields
          let dateOfBirth = null;
          if (data.dateOfBirth) {
            if (data.dateOfBirth instanceof Timestamp) {
              dateOfBirth = data.dateOfBirth.toDate();
            } else if (typeof data.dateOfBirth === 'string') {
              dateOfBirth = new Date(data.dateOfBirth);
            }
          }

          // Calculate total orders and revenue
          const customerOrders = useOrderStore.getState().orders.filter(order => 
            order.customerId === doc.id || 
            order.customerPhone === data.phone
          );

          const totalOrders = customerOrders.length;
          const totalRevenue = customerOrders.reduce((total, order) => 
            total + Number(order.totalAmount || 0), 
            0
          );

          return {
            id: doc.id,
            ...data,
            dateOfBirth,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            totalOrders,
            totalRevenue
          } as Customer & { totalOrders: number; totalRevenue: number };
        });
        
        console.log('Processed customers:', customers);
        
        set({ 
          customers, 
          loading: false, 
          error: null,
          isInitialized: true 
        });
      } catch (error) {
        console.error('Error initializing customer store:', error);
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to initialize customers',
          isInitialized: false 
        });
      }
    },

    addCustomer: async (customerData) => {
      try {
        // Add customer to Firestore
        const customerRef = await addDoc(collection(db, 'customers'), {
          ...customerData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        // Create a new customer object with default values
        const newCustomer = {
          id: customerRef.id,
          ...customerData,
          createdAt: new Date(),
          totalOrders: 0,
          totalRevenue: 0
        } as Customer & { totalOrders: number; totalRevenue: number };

        // Update local state
        const { customers } = get();
        set({ 
          customers: [...customers, newCustomer],
          loading: false 
        });

        return newCustomer;
      } catch (error) {
        console.error('Error adding customer:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to add customer',
          loading: false 
        });
        throw error;
      }
    },

    findCustomerByNumber: async (number: string) => {
      try {
        if (!number) return null;

        const customersRef = collection(db, 'customers');
        const q = query(customersRef, where('number', '==', number));

        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const customerDoc = querySnapshot.docs[0];
          return { ...customerDoc.data(), id: customerDoc.id } as Customer;
        }

        return null;
      } catch (error) {
        console.error('Error finding customer:', error);
        return null;
      }
    },

    updateCustomer: async (id, customerData) => {
      try {
        const customerRef = doc(db, 'customers', id);

        // Update Firestore
        await updateDoc(customerRef, {
          ...customerData,
          updatedAt: Timestamp.now()
        });

        // Recalculate total orders and revenue
        const { orders } = useOrderStore.getState();
        const customerOrders = orders.filter(order => 
          order.customerId === id || 
          order.customerPhone === customerData.phone
        );

        const totalOrders = customerOrders.length;
        const totalRevenue = customerOrders.reduce((total, order) => 
          total + Number(order.totalAmount || 0), 
          0
        );

        // Update local state
        const { customers } = get();
        const updatedCustomers = customers.map(customer => 
          customer.id === id 
            ? { 
                ...customer, 
                ...customerData, 
                totalOrders, 
                totalRevenue 
              } 
            : customer
        );

        set({ 
          customers: updatedCustomers,
          loading: false 
        });

        // Log activity
        const activityStore = useActivityStore.getState();
        const currentUser = useAuthStore.getState().user;
        
        if (!currentUser) {
          throw new Error('User must be logged in to update customer');
        }

        await activityStore.logActivity({
          type: 'CUSTOMER_UPDATE',
          message: `Updated customer ${customerData.firstName || customerData.lastName || id}`,
          userId: currentUser.id,
          userName: currentUser.name || currentUser.email || 'Unknown User',
          entityId: id,
          entityType: 'customer',
          metadata: {
            customerId: id,
            updatedFields: Object.keys(customerData)
          }
        });
      } catch (error) {
        console.error('Error updating customer:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to update customer',
          loading: false 
        });
        throw error;
      }
    },

    deleteCustomer: async (id) => {
      try {
        set({ loading: true });
        const customer = get().customers.find(c => c.id === id);
        
        if (!customer) {
          throw new Error('Customer not found');
        }

        await deleteDoc(doc(db, 'customers', id));

        // Log activity
        const { logActivity } = useActivityStore.getState();
        const { user } = useAuthStore.getState();
        
        if (user) {
          await logActivity({
            type: 'customer_deleted',
            message: `Customer deleted: ${customer.firstName} ${customer.lastName}`,
            userId: user.id,
            userName: user.name,
            entityId: id,
            entityType: 'customer',
            metadata: {
              deletedCustomer: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.number
              }
            }
          });
        }

        set({ loading: false, error: null });
      } catch (error: any) {
        console.error('Error deleting customer:', error);
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    getCustomerById: (id: string) => {
      if (!id) {
        console.warn('getCustomerById called with no ID');
        return undefined;
      }

      const allCustomerIds = get().customers.map(c => c.id);
      console.log('GET CUSTOMER BY ID CALLED', { id, customersCount: get().customers.length });
      console.log('ALL CUSTOMER IDS', allCustomerIds);

      // Try exact match first
      const exactMatchCustomer = get().customers.find(c => c.id === id);
      if (exactMatchCustomer) {
        console.log('EXACT MATCH FOUND', exactMatchCustomer);
        return exactMatchCustomer;
      }

      // If no exact match, try case-insensitive or partial match
      const partialMatchCustomer = get().customers.find(c => {
        if (!c.id) return false;
        return c.id.toLowerCase() === id.toLowerCase() || c.id.includes(id);
      });

      if (partialMatchCustomer) {
        console.log('PARTIAL MATCH FOUND', partialMatchCustomer);
        return partialMatchCustomer;
      }

      console.warn('NO CUSTOMER FOUND', { 
        searchId: id, 
        availableIds: allCustomerIds 
      });
      return undefined;
    },

    importCustomers: async (customers) => {
      try {
        set({ loading: true });
        const batch = writeBatch(db);
        const existingCustomers = get().customers;
        const emailMap = new Map(existingCustomers.map(c => [c.email.toLowerCase(), c]));
        
        for (const customerData of customers) {
          // Clean the customer data by removing undefined values
          const cleanedData = Object.entries(customerData).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, any>);

          const email = cleanedData.email.toLowerCase();
          const existingCustomer = emailMap.get(email);
          
          if (existingCustomer) {
            // Update existing customer
            const customerRef = doc(db, 'customers', existingCustomer.id);
            batch.update(customerRef, {
              ...cleanedData,
              email: email,
              updatedAt: Timestamp.now(),
              dateOfBirth: cleanedData.dateOfBirth ? Timestamp.fromDate(new Date(cleanedData.dateOfBirth)) : null,
              companyNames: Array.isArray(cleanedData.companyNames) ? cleanedData.companyNames : []
            });
          } else {
            // Create new customer
            const customerRef = doc(collection(db, 'customers'));
            batch.set(customerRef, {
              ...cleanedData,
              email: email,
              rating: 0,
              totalOrders: 0,
              totalRevenue: 0,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              dateOfBirth: cleanedData.dateOfBirth ? Timestamp.fromDate(new Date(cleanedData.dateOfBirth)) : null,
              companyNames: Array.isArray(cleanedData.companyNames) ? cleanedData.companyNames : []
            });
          }
        }

        await batch.commit();

        // Log activity
        const { logActivity } = useActivityStore.getState();
        const { user } = useAuthStore.getState();
        
        if (user) {
          await logActivity({
            type: 'customers_imported',
            message: `Imported ${customers.length} customers`,
            userId: user.id,
            userName: user.name,
            entityType: 'customer',
            metadata: {
              count: customers.length,
              updatedCount: customers.filter(c => emailMap.has(c.email.toLowerCase())).length,
              newCount: customers.filter(c => !emailMap.has(c.email.toLowerCase())).length
            }
          });
        }

        set({ loading: false, error: null });
      } catch (error: any) {
        console.error('Error importing customers:', error);
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    convertLeadToCustomer: async (leadId, customerData) => {
      try {
        set({ loading: true });
        
        // Clean the data before saving
        const cleanedData = Object.entries(customerData).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        const newCustomer = {
          ...cleanedData,
          rating: 0,
          totalOrders: 0,
          totalRevenue: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          dateOfBirth: cleanedData.dateOfBirth ? Timestamp.fromDate(new Date(cleanedData.dateOfBirth)) : null,
          companyNames: Array.isArray(cleanedData.companyNames) ? cleanedData.companyNames : [],
          convertedFromLeadId: leadId
        };

        const docRef = await addDoc(collection(db, 'customers'), newCustomer);

        // Log activity
        const { logActivity } = useActivityStore.getState();
        const { user } = useAuthStore.getState();
        
        if (user) {
          await logActivity({
            type: 'customer_created',
            message: `New customer added: ${customerData.firstName} ${customerData.lastName}`,
            userId: user.id,
            userName: user.name,
            entityId: docRef.id,
            entityType: 'customer',
            metadata: {
              firstName: customerData.firstName,
              lastName: customerData.lastName,
              email: customerData.email,
              phone: customerData.number
            }
          });
        }

        set({ loading: false, error: null });
        return docRef.id;
      } catch (error: any) {
        console.error('Error converting lead to customer:', error);
        set({ error: error.message, loading: false });
        throw error;
      }
    }
  }))
);