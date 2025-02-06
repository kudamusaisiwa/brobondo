import { create } from 'zustand';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTenantStore } from './tenantStore';

export interface RentalPayment {
  id: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  type: 'rent' | 'security_deposit' | 'other';
  description: string;
  reference?: string;
}

import { Property as BaseProperty } from './propertyStore';

export interface Property extends BaseProperty {
  rentedTo?: string[];
}

export interface RentalSchedule {
  id: string;
  tenantId: string;
  propertyId: string;
  leaseStartDate: Date;
  leaseEndDate: Date;
  monthlyRent: number;
  depositAmount: number;
  paymentDay: number; // Day of month when rent is due
  status: 'draft' | 'active' | 'completed' | 'terminated';
  payments: RentalPayment[];
  createdAt: Date;
  updatedAt: Date;
}

interface RentalStore {
  properties: Property[];
  draftSchedules: RentalSchedule[];
  schedules: RentalSchedule[];
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<() => void>;
  initializeProperties: () => Promise<() => void>;
  createSchedule: (data: Omit<RentalSchedule, 'id' | 'payments' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSchedule: (id: string, data: Partial<RentalSchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  recordPayment: (scheduleId: string, payment: Omit<RentalPayment, 'id' | 'status'>) => Promise<void>;
  generatePayments: (schedule: RentalSchedule) => RentalPayment[];
}

export const useRentalStore = create<RentalStore>((set, get) => ({
  properties: [],
  draftSchedules: [],
  schedules: [],
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      // Get tenants store
      const tenantStore = useTenantStore.getState();
      
      // Initialize rental schedules
      const scheduleQuery = collection(db, 'rental_schedules');
      const scheduleUnsubscribe = onSnapshot(scheduleQuery, (snapshot) => {
        console.log('Raw schedule data:', snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        
        const schedules = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Processing schedule:', doc.id, 'Raw payments:', data.payments);
          
          const processedSchedule = {
            id: doc.id,
            ...data,
            leaseStartDate: data.leaseStartDate?.toDate() || new Date(),
            leaseEndDate: data.leaseEndDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            payments: (data.payments || []).map((payment: any) => {
              console.log('Processing payment:', payment);
              const dueDate = payment.dueDate?.toDate() || new Date();
              const paidDate = payment.paidDate?.toDate();
              const now = new Date();

              // Calculate payment status
              let status = payment.status || 'pending';
              if (status !== 'paid') {
                if (dueDate < now) {
                  status = 'overdue';
                } else {
                  status = 'pending';
                }
              }

              return {
                id: payment.id || Math.random().toString(36).substr(2, 9),
                amount: payment.amount || 0,
                dueDate,
                paidDate,
                status,
                type: payment.type || 'rent',
                description: payment.description || '',
                reference: payment.reference
              };
            })
          };
          
          console.log('Processed schedule:', doc.id, 'Processed payments:', processedSchedule.payments);
          return processedSchedule;
        }) as RentalSchedule[];
        set(state => ({ ...state, schedules }));
      });

      // Initialize properties - get all rental properties
      const propertyQuery = query(
        collection(db, 'properties'),
        where('listingType', '==', 'rental')
      );
      console.log('Querying for rental properties...');
      console.log('Setting up property listener...');
      console.log('Setting up property listener...');
      const propertyUnsubscribe = onSnapshot(propertyQuery, async (snapshot) => {
        console.log('Property snapshot received:', snapshot.docs.length, 'documents');
        // Get current tenants first
        const tenants = useTenantStore.getState().tenants;
        console.log('Current tenants:', tenants.map(t => ({
          id: t.id,
          name: `${t.firstName} ${t.lastName}`,
          rentedProperties: t.rentedProperties || []
        })));

        // Get all properties
        const allProperties = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            rentedTo: data.rentedTo || [],
            listedAt: data.listedAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          };
        }) as Property[];
        console.log('All properties:', allProperties.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          rentedTo: p.rentedTo || []
        })));

        // Filter and update properties that are rented or have tenants
        const properties = allProperties.map(property => {
          const hasTenants = tenants.some(tenant => 
            tenant.rentedProperties?.includes(property.id)
          );

          // If property has tenants but status is not 'rented', update it
          if (hasTenants && property.status !== 'rented') {
            console.log('Updating property status to rented:', {
              propertyId: property.id,
              title: property.title,
              oldStatus: property.status
            });
            
            // Update Firestore in the background
            updateDoc(doc(db, 'properties', property.id), {
              status: 'rented'
            }).catch(error => {
              console.error('Error updating property status:', error);
            });
            
            return {
              ...property,
              status: 'rented'
            };
          }

          return property;
        });

        // Filter to only include properties that are rented or have tenants
        const rentedProperties = properties.filter(property => {
          const hasTenants = tenants.some(tenant => 
            tenant.rentedProperties?.includes(property.id)
          );
          return property.status === 'rented' || hasTenants;
        });
        
        console.log('Loaded properties:', rentedProperties.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          listingType: p.listingType,
          rentedTo: p.rentedTo
        })));

        // Create draft schedules for properties with tenants but no rental schedule
        const existingSchedules = get().schedules;
        
        console.log('Current state:', {
          propertiesCount: properties.length,
          tenantsCount: tenants.length,
          existingSchedulesCount: existingSchedules.length,
          tenants: tenants.map(t => ({
            id: t.id,
            rentedProperties: t.rentedProperties
          })),
          properties: properties.map(p => ({
            id: p.id,
            title: p.title,
            status: p.status,
            rentedTo: p.rentedTo
          }))
        });
        
        console.log('Checking tenant-property relationships:', {
          tenants: tenants.map(t => ({
            id: t.id,
            name: `${t.firstName} ${t.lastName}`,
            rentedProperties: t.rentedProperties || []
          })),
          properties: properties.map(p => ({
            id: p.id,
            title: p.title,
            status: p.status,
            rentedTo: p.rentedTo || []
          }))
        });

        // Update store with filtered properties
        set(state => ({ ...state, properties: rentedProperties }));

        const draftSchedules = rentedProperties.flatMap(property => {
          // Find tenants who have this property in their rentedProperties array
          const propertyTenants = tenants.filter(tenant => {
            const hasProperty = tenant.rentedProperties?.includes(property.id);
            console.log('Tenant property check:', {
              tenantId: tenant.id,
              tenantName: `${tenant.firstName} ${tenant.lastName}`,
              propertyId: property.id,
              propertyTitle: property.title,
              hasProperty,
              rentedProperties: tenant.rentedProperties || []
            });
            return hasProperty;
          });
          
          console.log('Processing property:', {
            id: property.id,
            title: property.title,
            status: property.status,
            tenants: propertyTenants.map(t => t.id)
          });

          if (!propertyTenants.length) {
            console.log('No tenants for property:', property.id);
            return [];
          }

          return propertyTenants.map(tenant => {
            const hasExistingSchedule = existingSchedules.some(schedule =>
              schedule.propertyId === property.id && schedule.tenantId === tenant.id
            );

            if (hasExistingSchedule) {
              console.log('Schedule already exists for:', { propertyId: property.id, tenantId: tenant.id });
              return null;
            }

            console.log('Creating draft schedule for:', { propertyId: property.id, tenantId: tenant.id });
            return {
            id: `draft_${property.id}_${tenant.id}`,
            propertyId: property.id,
            tenantId: tenant.id,
            leaseStartDate: new Date(),
            leaseEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            monthlyRent: property.price || 0,
            depositAmount: property.leaseTerms?.deposit || 0,
            paymentDay: 1,
            status: 'draft' as const,
            payments: [],
            createdAt: new Date(),
            updatedAt: new Date()
            };
          }).filter(Boolean) as RentalSchedule[];
        });

        console.log('Draft schedules created:', draftSchedules);
        set(state => {
          console.log('Setting state:', {
            propertiesCount: properties.length,
            draftSchedulesCount: draftSchedules.length,
            schedulesCount: state.schedules.length
          });
          return {
            ...state,
            properties,
            draftSchedules,
            loading: false
          };
        });
      });

      return () => {
        scheduleUnsubscribe();
        propertyUnsubscribe();
      };
    } catch (error) {
      console.error('Error initializing rental schedules:', error);
      set({ error: error as Error, loading: false });
      return () => {};
    }
  },

  initializeProperties: async () => {
    // This is now handled in initialize()
    return () => {};
  },



  createSchedule: async (data) => {
    try {
      // If no payments are provided, create initial payments
      const payments = data.payments || [
        // Security deposit
        {
          amount: data.depositAmount,
          dueDate: data.leaseStartDate,
          status: 'pending',
          type: 'security_deposit',
          description: 'Security Deposit'
        },
        // First month's rent
        {
          amount: data.monthlyRent,
          dueDate: data.leaseStartDate,
          status: 'pending',
          type: 'rent',
          description: 'First Month Rent'
        }
      ];

      const scheduleData = {
        ...data,
        payments,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'rental_schedules'), scheduleData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating rental schedule:', error);
      throw error;
    }
  },

  updateSchedule: async (id, data) => {
    try {
      const docRef = doc(db, 'rental_schedules', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating rental schedule:', error);
      throw error;
    }
  },

  deleteSchedule: async (id) => {
    try {
      const docRef = doc(db, 'rental_schedules', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting rental schedule:', error);
      throw error;
    }
  },

  recordPayment: async (scheduleId, payment) => {
    try {
      console.log('Recording payment for schedule:', scheduleId, 'Payment:', payment);
      
      const schedule = get().schedules.find(s => s.id === scheduleId);
      if (!schedule) throw new Error('Schedule not found');

      console.log('Found schedule:', schedule);
      const payments = [...schedule.payments];
      console.log('Current payments:', payments);
      
      // Convert dates to comparable format
      const paymentDueDate = payment.dueDate instanceof Date ? payment.dueDate : new Date(payment.dueDate);
      const paymentIndex = payments.findIndex(p => {
        const existingDueDate = p.dueDate instanceof Date ? p.dueDate : new Date(p.dueDate);
        return existingDueDate.getTime() === paymentDueDate.getTime();
      });

      console.log('Payment index:', paymentIndex);

      const newPayment = {
        ...payment,
        id: Math.random().toString(36).substr(2, 9),
        status: 'paid',
        dueDate: paymentDueDate,
        paidDate: new Date(),
        type: payment.type || 'rent',
        description: payment.description || 'Rent Payment'
      };

      console.log('New payment:', newPayment);

      if (paymentIndex === -1) {
        payments.push(newPayment);
      } else {
        payments[paymentIndex] = {
          ...payments[paymentIndex],
          ...newPayment
        };
      }

      console.log('Updated payments array:', payments);

      // Sort payments by due date
      payments.sort((a, b) => {
        const dateA = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
        const dateB = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      });

      const updatedPayments = payments.map(p => ({
        ...p,
        dueDate: p.dueDate instanceof Date ? p.dueDate : new Date(p.dueDate),
        paidDate: p.paidDate instanceof Date ? p.paidDate : p.paidDate ? new Date(p.paidDate) : null
      }));

      console.log('Final payments to save:', updatedPayments);

      await updateDoc(doc(db, 'rental_schedules', scheduleId), {
        payments: updatedPayments,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },

  generatePayments: (schedule) => {
    const payments: RentalPayment[] = [];
    const startDate = schedule.leaseStartDate;
    const endDate = schedule.leaseEndDate;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Set the day of the month for the payment
      currentDate.setDate(schedule.paymentDay);
      
      // If we've gone past the end date, break
      if (currentDate > endDate) break;

      // Create the payment
      payments.push({
        id: Math.random().toString(36).substr(2, 9),
        amount: schedule.monthlyRent,
        dueDate: new Date(currentDate),
        status: 'pending'
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return payments;
  }
}));
