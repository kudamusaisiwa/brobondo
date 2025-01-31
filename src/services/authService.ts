import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface CustomerAuth {
  email: string;
  passportNumber: string;
}

export const customerAuthService = {
  async loginWithEmailAndPassport(email: string, passportNumber: string) {
    try {
      // Validate input
      if (!email || !passportNumber) {
        throw new Error('Email and passport number are required');
      }

      // Normalize input
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedPassport = passportNumber.toUpperCase().trim();

      // Query customers collection
      const customersRef = collection(db, 'customers');
      const q = query(
        customersRef, 
        where('email', '==', normalizedEmail),
        where('passportNumber', '==', normalizedPassport)
      );

      // Execute query
      const querySnapshot = await getDocs(q);

      // Check if customer exists
      if (querySnapshot.empty) {
        throw new Error('Invalid credentials');
      }

      // Get the first matching customer (assuming unique email)
      const customerDoc = querySnapshot.docs[0];
      const customerData = customerDoc.data();

      // Return customer details
      return {
        id: customerDoc.id,
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        passportNumber: customerData.passportNumber,
        isAuthenticated: true
      };
    } catch (error) {
      console.error('Customer authentication error:', error);
      throw error;
    }
  },

  logout() {
    // No need for complex logout since we're not using Firebase Auth
    return Promise.resolve();
  }
};
