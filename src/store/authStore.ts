import { create } from 'zustand';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

type UserRole = 'admin' | 'agent' | 'user';

interface UserData {
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  active: boolean;
  password: string;
}

interface AuthState {
  user: User | null;
  userRole: UserRole | null;
  userName: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  createUser: (userData: UserData) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userRole: null,
  userName: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  initialize: async () => {
    console.log('Initializing auth store...');
    set({ loading: true });
    try {
      console.log('Setting up auth state listener...');
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed:', { user: user?.email, uid: user?.uid });
        if (user) {
          // Fetch user data from Firestore
          console.log('Fetching user data from Firestore...');
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          console.log('User data from Firestore:', userDoc.data());
          const userData = userDoc.data();
          
          const newState = { 
            user,
            userRole: userData?.role || 'user',
            userName: userData?.name || null,
            loading: false,
            isAuthenticated: true
          };
          console.log('Setting new auth state:', newState);
          set(newState);
        } else {
          set({ 
            user: null,
            userRole: null,
            userName: null,
            loading: false,
            isAuthenticated: false
          });
        }
      });
      return unsubscribe;
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        loading: false,
        isAuthenticated: false
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      set({ 
        user: userCredential.user,
        userRole: userData?.role || 'user',
        userName: userData?.name || null,
        loading: false,
        isAuthenticated: true,
        error: null
      });
    } catch (error: any) {
      let errorMessage = 'Login failed';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      set({ 
        error: errorMessage,
        loading: false,
        isAuthenticated: false,
        user: null,
        userRole: null,
        userName: null
      });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await firebaseSignOut(auth);
      set({ 
        user: null, 
        loading: false,
        isAuthenticated: false,
        error: null
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        loading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  createUser: async (userData: UserData) => {
    set({ loading: true, error: null });
    try {
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const { uid } = userCredential.user;

      // Create the user document in Firestore
      await setDoc(doc(db, 'users', uid), {
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        active: userData.active,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      set({ loading: false, error: null });
    } catch (error: any) {
      let errorMessage = 'Failed to create user';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }
}));