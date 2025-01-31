import { create } from 'zustand';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  limit,
  orderBy,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Customer, Order, Document, Communication, Payment } from '../types';

interface CustomerPortalState {
  customer: Customer | null;
  orders: Order[];
  documents: Document[];
  communications: Communication[];
  payments: Payment[];
  loading: boolean;
  error: string | null;
  authenticate: (email: string, passportNumber: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useCustomerPortalStore = create<CustomerPortalState>((set, get) => ({
  customer: null,
  orders: [],
  documents: [],
  communications: [],
  payments: [],
  loading: false,
  error: null,

  authenticate: async (email: string, passportNumber: string) => {
    set({ loading: true, error: null });
    
    try {
      // Simple validation
      if (!email || !passportNumber) {
        throw new Error('Please provide both email and passport number');
      }

      // Normalize input with extra cleaning
      const normalizedEmail = email.toLowerCase().trim().replace(/\s+/g, '');
      const normalizedPassport = passportNumber.trim().toUpperCase();

      console.log('Attempting login with normalized credentials:', {
        originalEmail: email,
        normalizedEmail,
        normalizedPassport
      });

      // Get all customers to debug email matching
      const customersSnapshot = await getDocs(collection(db, 'customers'));
      const allCustomers = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email,
        normalizedEmail: doc.data().email?.toLowerCase().trim().replace(/\s+/g, ''),
        passportNumber: doc.data().passportNumber
      }));

      console.log('All customer emails in database:', allCustomers.map(c => ({
        original: c.email,
        normalized: c.normalizedEmail
      })));

      // Find potential matches
      const potentialMatches = allCustomers.filter(c => 
        c.normalizedEmail === normalizedEmail ||
        c.email?.toLowerCase() === normalizedEmail ||
        c.email === email
      );

      console.log('Potential email matches:', potentialMatches);

      if (potentialMatches.length === 0) {
        throw new Error('Email not found. Please check your email address.');
      }

      // Check if any of the matches have the correct passport
      const fullMatch = potentialMatches.find(c => c.passportNumber === normalizedPassport);
      
      if (!fullMatch) {
        throw new Error('Invalid passport number for this email address.');
      }

      // Get the full customer data
      const customerDoc = await getDocs(query(
        collection(db, 'customers'),
        where('email', '==', fullMatch.email),
        limit(1)
      ));

      if (customerDoc.empty) {
        throw new Error('Error retrieving customer data');
      }

      const customer = { 
        id: customerDoc.docs[0].id, 
        ...customerDoc.docs[0].data() 
      } as Customer;

      // Log the login activity
      await addDoc(collection(db, 'activities'), {
        type: 'customer_portal_login',
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        timestamp: serverTimestamp(),
        details: {
          email: customer.email,
          ipAddress: window.location.hostname,
          userAgent: navigator.userAgent
        }
      });

      // Fetch all customer data in parallel
      const [ordersSnapshot, docsSnapshot, communicationsSnapshot] = await Promise.all([
        // Fetch customer's orders
        getDocs(query(
          collection(db, 'orders'),
          where('customerId', '==', customer.id),
          orderBy('createdAt', 'desc')
        )),
        // Fetch customer's documents - updated query
        getDocs(query(
          collection(db, 'customerDocuments'),
          where('customerId', '==', customer.id)
        )),
        // Fetch customer's communications
        getDocs(query(
          collection(db, 'communications'),
          where('customerId', '==', customer.id),
          orderBy('createdAt', 'desc')
        ))
      ]);

      console.log('Customer ID:', customer.id);
      console.log('Raw documents snapshot:', docsSnapshot.docs);
      console.log('Documents query:', {
        collection: 'customerDocuments',
        customerId: customer.id,
        numResults: docsSnapshot.size
      });

      const orders = ordersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Order[];

      const documents = docsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Document data before transform:', { id: doc.id, ...data });
        return { 
          id: doc.id, 
          ...data,
          uploadedAt: data.uploadedAt || data.createdAt || null,
          description: data.description || data.name || 'Untitled Document'
        };
      }) as Document[];
      console.log('Transformed documents:', documents);

      // Fetch customer's payments - updated query
      const paymentsSnapshot = await getDocs(query(
        collection(db, 'payments'),
        where('orderId', 'in', ordersSnapshot.docs.map(doc => doc.id))
      ));

      // Transform payments with debug logging
      console.log('Raw payment docs:', paymentsSnapshot.docs);
      const payments = paymentsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Payment data:', { id: doc.id, ...data });
        return { 
          id: doc.id, 
          ...data 
        };
      }) as Payment[];
      console.log('Transformed payments:', payments);

      const communications = communicationsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Communication data before transform:', data);
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt || data.timestamp || null
        } as Communication;
      });
      console.log('Transformed communications:', communications);

      // Set all data at once
      set({ 
        customer,
        orders,
        documents,
        payments,
        communications,
        loading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Authentication failed'
      });
      throw error;
    }
  },

  logout: () => {
    set({
      customer: null,
      orders: [],
      documents: [],
      communications: [],
      payments: [],
      error: null
    });
  },

  clearError: () => set({ error: null })
}));
