import { create } from 'zustand';
import { 
  collection, 
  doc,
  addDoc,
  query, 
  orderBy,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
  setDoc,
  deleteDoc,
  limit,
  getDoc
} from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import { useNotificationStore } from './notificationStore';
import { usePaymentStore } from './paymentStore';
import { useActivityStore } from './activityStore';
import { useAuthStore } from './authStore';
import { useProductStore } from './productStore';
import { generateOrderNumber } from '../utils/orderNumber';
import type { Order } from '../types';

// Helper functions
const groupBy = <T>(array: T[], key: (item: T) => string): { [key: string]: T[] } => {
  return array.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as { [key: string]: T[] });
};

const validateOrder = (orderData: any) => {
  if (!orderData.customerId) throw new Error('Customer ID is required');
  if (!orderData.products || !Array.isArray(orderData.products)) throw new Error('Products must be an array');
  if (!orderData.totalAmount) throw new Error('Total amount is required');
  
  // Validate each product in the array
  orderData.products.forEach((product: any, index: number) => {
    if (!product.productId) throw new Error(`Product ID is required for product at index ${index}`);
    if (typeof product.quantity !== 'number') throw new Error(`Quantity must be a number for product at index ${index}`);
    if (typeof product.unitPrice !== 'number') throw new Error(`Unit price must be a number for product at index ${index}`);
  });
};

const handleFirestoreError = (error: any) => {
  if (error.code === 'permission-denied') {
    return 'Permission denied. Please check your Firebase rules.';
  } else if (error.code === 'unavailable') {
    return 'Firebase is currently unavailable. Please try again later.';
  } else {
    return error.message || 'An unknown error occurred. Please check the console for more information.';
  }
};

const isFirebaseInitialized = () => {
  return !!db;
};

const getDateRange = (timeRange: string, customStartDate?: Date | null, customEndDate?: Date | null) => {
  const now = new Date();
  let startDate = new Date(now);
  let endDate = new Date(now);
  let previousStartDate = new Date(now);
  let previousEndDate = new Date(now);

  // Set end date to end of current day
  endDate.setHours(23, 59, 59, 999);

  if (timeRange === 'custom' && customStartDate && customEndDate) {
    startDate = new Date(customStartDate);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(customEndDate);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // Set start date based on time range
    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        endDate = new Date(startDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setDate(now.getDate() - 7); // Default to 7 days
        startDate.setHours(0, 0, 0, 0);
    }
  }

  // Calculate previous period
  const periodLength = endDate.getTime() - startDate.getTime();
  previousStartDate = new Date(startDate.getTime() - periodLength);
  previousEndDate = new Date(startDate.getTime() - 1);

  return { startDate, endDate, previousStartDate, previousEndDate };
};

const calculatePeriodStats = (orders: Order[]) => {
  const totalOrders = orders.length;
  const activeCustomers = new Set(orders.map(o => o.customerId)).size;
  const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  // Get the payment store to calculate actual paid amounts
  const { getTotalPaidForOrder } = usePaymentStore.getState();
  
  // Calculate outstanding balance using actual payments
  const outstanding = orders.reduce((sum, order) => {
    const totalPaid = getTotalPaidForOrder(order.id);
    return sum + ((order.totalAmount || 0) - totalPaid);
  }, 0);

  return {
    totalOrders,
    activeCustomers,
    revenue,
    outstanding
  };
};

const calculatePercentageChange = (previous: number, current: number) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

const getLastOrderNumber = async () => {
  if (!isFirebaseInitialized()) return null;

  try {
    const today = new Date();
    const datePrefix = format(today, 'yyMMdd');
    
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('orderNumber', '>=', datePrefix),
      where('orderNumber', '<', datePrefix + '\uf8ff'),
      orderBy('orderNumber', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    return snapshot.docs[0].data().orderNumber as string;
  } catch (error) {
    console.error('Error getting last order number:', error);
    return null;
  }
};

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  initialize: () => Promise<(() => void) | undefined>;
  getOrderStats: (timeRange: string, customStartDate?: Date | null, customEndDate?: Date | null) => {
    totalOrders: number;
    activeCustomers: number;
    revenue: number;
    outstanding: number;
    orderChange: number;
    customerChange: number;
    revenueChange: number;
  };
  totalOrders: number;
  activeCustomers: number;
  revenue: number;
  outstanding: number;
  orderChange: number;
  customerChange: number;
  revenueChange: number;
  getOrderTrends: (timeRange: string, customStartDate?: Date | null, customEndDate?: Date | null) => any[];
  getOrderById: (id: string) => Order | null;
  addOrder: (orderData: any) => Promise<string>;
  updateOrder: (orderId: string, orderData: any) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

const addOrderToFirebase = async (orderData: any) => {
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase is not initialized');
  }

  try {
    validateOrder(orderData);
    
    // Generate order number
    const orderNumber = await generateOrderNumber(getLastOrderNumber);
    
    const orderRef = collection(db, 'orders');
    const timestamp = Timestamp.now();
    
    const order = {
      ...orderData,
      orderNumber,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const docRef = await addDoc(orderRef, order);
    return docRef.id;
  } catch (error) {
    const errorMessage = handleFirestoreError(error);
    throw new Error(errorMessage);
  }
};

const updateOrderInFirebase = async (orderId: string, orderData: any) => {
  try {
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase is not initialized');
    }

    // Get existing order data first
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }

    const existingOrder = orderDoc.data();

    // Merge the existing data with the updates
    const mergedData = {
      ...existingOrder,
      ...orderData,
      updatedAt: Timestamp.fromDate(new Date())
    };

    // Log the merged data
    console.log('Merged order data:', mergedData);

    await setDoc(orderRef, mergedData, { merge: true });
    console.log('Order updated successfully in Firestore');
  } catch (error: any) {
    console.error('Error updating order in Firestore:', error);
    throw new Error(handleFirestoreError(error));
  }
};

export const useOrderStore = create<OrderState>(
  createProtectedStore((set, get) => ({
    orders: [],
    loading: false,
    error: null,
    clearError: () => set({ error: null }),

    initialize: async () => {
      if (!isFirebaseInitialized()) {
        const error = 'Firebase is not properly initialized';
        console.error(error);
        set({ error, loading: false });
        return;
      }

      set({ loading: true, error: null });
      
      try {
        const q = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            try {
              const orders = snapshot.docs.map(doc => {
                const data = doc.data();
                
                // Handle numeric fields with proper type checking
                const getNumericValue = (value: any, defaultValue: number = 0) => {
                  if (typeof value === 'number') return value;
                  if (typeof value === 'string') {
                    const parsed = parseFloat(value);
                    return isNaN(parsed) ? defaultValue : parsed;
                  }
                  return defaultValue;
                };

                const totalAmount = getNumericValue(data.totalAmount);
                const paidAmount = getNumericValue(data.paidAmount);
                const totalCost = getNumericValue(data.totalCost);
                
                // Handle dates with proper error handling
                const processDate = (dateField: any) => {
                  try {
                    if (!dateField) return null;
                    if (typeof dateField.toDate === 'function') return dateField.toDate();
                    if (dateField instanceof Date) return dateField;
                    if (typeof dateField === 'string') return new Date(dateField);
                    return null;
                  } catch (error) {
                    console.warn(`Error processing date:`, error);
                    return null;
                  }
                };

                const createdAt = processDate(data.createdAt) || new Date();
                const updatedAt = processDate(data.updatedAt) || createdAt;
                const orderDate = processDate(data.orderDate) || createdAt;
                const deliveryDate = processDate(data.deliveryDate);
                const collectionDate = processDate(data.collectionDate);

                // Ensure orderNumber is loaded from data
                const orderNumber = data.orderNumber || '';

                // Ensure products have costPrice
                const { products } = useProductStore.getState();
                const processedProducts = (data.products || []).map((product: any) => {
                  // If costPrice is missing, try to fetch from current product data
                  const currentProduct = products.find(p => p.id === product.productId);
                  
                  const costPrice = getNumericValue(
                    product.costPrice,  // First, try the existing costPrice
                    currentProduct?.costPrice ?? (  // Then, try current product's cost price
                      getNumericValue(product.unitPrice) * 0.2  // Fallback to 20% of selling price if absolutely no other data exists
                    )
                  );

                  return {
                    ...product,
                    costPrice
                  };
                });

                return {
                  id: doc.id,
                  ...data,
                  orderNumber,
                  totalAmount,
                  paidAmount,
                  totalCost,
                  createdAt,
                  updatedAt,
                  orderDate,
                  deliveryDate,
                  collectionDate,
                  status: data.status || 'quotation',
                  products: processedProducts,
                  partPayments: Array.isArray(data.partPayments) ? data.partPayments : []
                } as Order;
              });

              console.log(`Loaded ${orders.length} orders`);
              set({ orders, loading: false, error: null });
            } catch (error) {
              const errorMessage = handleFirestoreError(error);
              console.error('Error processing orders:', error);
              set({ error: errorMessage, loading: false });
            }
          },
          (error) => {
            const errorMessage = handleFirestoreError(error);
            console.error('Error in orders snapshot:', error);
            set({ error: errorMessage, loading: false });
          }
        );

        return unsubscribe;
      } catch (error) {
        const errorMessage = handleFirestoreError(error);
        console.error('Error initializing orders:', error);
        set({ error: errorMessage, loading: false });
      }
    },

    getOrderStats: (timeRange: string, customStartDate?: Date | null, customEndDate?: Date | null) => {
      const orders = get().orders;
      if (!orders.length) return {
        totalOrders: 0,
        activeCustomers: 0,
        revenue: 0,
        outstanding: 0,
        orderChange: 0,
        customerChange: 0,
        revenueChange: 0
      };

      const { startDate, endDate, previousStartDate, previousEndDate } = getDateRange(timeRange, customStartDate, customEndDate);
      
      // Current period orders
      const currentPeriodOrders = orders.filter(order => {
        const orderDate = order.orderDate || order.createdAt;
        return orderDate >= startDate && orderDate <= endDate;
      });

      // Previous period orders
      const previousPeriodOrders = orders.filter(order => {
        const orderDate = order.orderDate || order.createdAt;
        return orderDate >= previousStartDate && orderDate <= previousEndDate;
      });

      // Calculate current period stats
      const currentStats = calculatePeriodStats(currentPeriodOrders);
      const previousStats = calculatePeriodStats(previousPeriodOrders);

      // Calculate changes
      const orderChange = calculatePercentageChange(previousStats.totalOrders, currentStats.totalOrders);
      const customerChange = calculatePercentageChange(previousStats.activeCustomers, currentStats.activeCustomers);
      const revenueChange = calculatePercentageChange(previousStats.revenue, currentStats.revenue);

      return {
        ...currentStats,
        orderChange,
        customerChange,
        revenueChange
      };
    },

    getOrderById: (id: string) => {
      const orders = get().orders;
      return orders.find(order => order.id === id) || null;
    },

    getOrderTrends: (timeRange: string, customStartDate?: Date | null, customEndDate?: Date | null) => {
      const orders = get().orders;
      const { startDate, endDate } = getDateRange(timeRange, customStartDate, customEndDate);
      
      // Filter orders within the date range
      const periodOrders = orders.filter(order => {
        const orderDate = order.orderDate || order.createdAt;
        return orderDate >= startDate && orderDate <= endDate;
      });

      // Group orders by date
      const ordersByDate = groupBy(periodOrders, order => 
        format(order.orderDate || order.createdAt, 'yyyy-MM-dd')
      );

      // Calculate daily stats
      const dailyStats = Object.entries(ordersByDate).map(([date, orders]) => {
        const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const outstanding = orders.reduce((sum, order) => {
          const totalPaid = order.paidAmount || 0;
          return sum + ((order.totalAmount || 0) - totalPaid);
        }, 0);

        return {
          date,
          revenue,
          outstanding
        };
      });

      // Sort by date
      return dailyStats.sort((a, b) => a.date.localeCompare(b.date));
    },

    addOrder: async (orderData: any) => {
      try {
        const notificationStore = useNotificationStore.getState();
        const orderId = await addOrderToFirebase(orderData);
        
        // Send notification for new order
        notificationStore.sendNotification('New Order Created', {
          body: `Order #${orderId} has been created successfully`,
          tag: 'order-created',
        });

        return orderId;
      } catch (error) {
        console.error('Error adding order:', error);
        throw error;
      }
    },

    updateOrder: async (orderId: string, orderData: any) => {
      try {
        await updateOrderInFirebase(orderId, orderData);
        return Promise.resolve();
      } catch (error: any) {
        const errorMessage = handleFirestoreError(error);
        set({ error: errorMessage });
        return Promise.reject(error);
      }
    },

    updateOrderStatus: async (orderId: string, status: string) => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await setDoc(orderRef, { status }, { merge: true });
        return Promise.resolve();
      } catch (error: any) {
        const errorMessage = handleFirestoreError(error);
        set({ error: errorMessage });
        return Promise.reject(error);
      }
    },

    deleteOrder: async (orderId: string) => {
      try {
        const order = get().orders.find(o => o.id === orderId);
        
        if (!order) {
          throw new Error('Order not found');
        }

        const orderRef = doc(db, 'orders', orderId);
        await deleteDoc(orderRef);
        
        // Log activity
        const { logActivity } = useActivityStore.getState();
        const { user } = useAuthStore.getState();
        
        if (user) {
          await logActivity({
            type: 'order_deleted',
            message: `Order #${order.orderNumber} deleted`,
            userId: user.id,
            userName: user.name,
            entityId: orderId,
            entityType: 'order',
            metadata: {
              deletedOrder: {
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                status: order.status
              }
            }
          });
        }
        
        // Update local state
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId)
        }));
      } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
      }
    },
  }))
);