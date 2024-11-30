import { create } from 'zustand';
import { 
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  authenticateCustomer: (email: string, passportNumber: string) => Promise<void>;
  skipLogin: () => Promise<void>;
  logout: () => Promise<void>;
  createUser: (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: UserRole;
    active: boolean;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      await setPersistence(auth, browserLocalPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User account not found');
      }

      const userData = userDoc.data();
      
      if (!userData.active) {
        throw new Error('Account is disabled');
      }

      // Update last login
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: Timestamp.now()
      });

      set({ 
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          active: userData.active,
          lastLogin: new Date()
        },
        isAuthenticated: true,
        loading: false,
        error: null
      });

    } catch (error: any) {
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        default:
          errorMessage = error.message;
      }
      
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  authenticateCustomer: async (email, passportNumber) => {
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

      // Set authenticated customer as user
      set({ 
        user: {
          id: customerDoc.id,
          email: customerData.email,
          name: `${customerData.firstName} ${customerData.lastName}`,
          phone: customerData.phone,
          role: 'customer',
          active: true,
          lastLogin: new Date()
        },
        isAuthenticated: true,
        loading: false,
        error: null
      });

      // Update last login
      await updateDoc(doc(db, 'customers', customerDoc.id), {
        lastLogin: Timestamp.now()
      });

    } catch (error: any) {
      set({ 
        error: error.message || 'Authentication failed',
        loading: false 
      });
      throw error;
    }
  },

  skipLogin: async () => {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Skip login is only available in development mode');
    }

    set({ loading: true, error: null });
    
    try {
      // Create a temporary admin user session
      const tempUser: User = {
        id: 'temp-admin',
        email: 'admin@temp.dev',
        name: 'Temporary Admin',
        phone: '+1234567890',
        role: 'admin',
        active: true,
        lastLogin: new Date()
      };

      set({ 
        user: tempUser,
        isAuthenticated: true,
        loading: false,
        error: null
      });

    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    try {
      const user = get().user;
      // Only call Firebase signOut if we're not using the skip login feature
      if (user?.id !== 'temp-admin') {
        await firebaseSignOut(auth);
      }
      set({ user: null, isAuthenticated: false, error: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      set({ loading: true, error: null });

      // First create the Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Update profile
      await updateProfile(userCredential.user, {
        displayName: userData.name
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        active: userData.active,
        lastLogin: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      set({ loading: false, error: null });
    } catch (error: any) {
      let errorMessage = 'Failed to create user';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = error.message;
      }
      
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  }
}));