import { create } from 'zustand';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import { useActivityStore } from './activityStore';
import { useAuthStore } from './authStore';
import { User } from '../types';

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<(() => void) | undefined>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
}

export const useUserStore = create<UserState>(
  createProtectedStore((set, get) => ({
    users: [],
    loading: false,
    error: null,

    initialize: async () => {
      set({ loading: true });
      console.log('Initializing user store...');
      
      try {
        // Get all users from the users collection
        const q = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc')
        );

        console.log('Setting up user snapshot listener...');
        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const users = snapshot.docs.map(doc => {
              const data = doc.data();
              console.log('Raw user data:', { id: doc.id, ...data });
              
              // Log the raw data for debugging
              console.log('Raw data from Firestore:', data);
              
              // Ensure we have all required fields and handle name consistently
              let name = '';
              if (data.name) {
                name = data.name;
              } else if (data.firstName && data.lastName) {
                name = `${data.firstName} ${data.lastName}`;
              } else if (data.firstName) {
                name = data.firstName;
              } else if (data.lastName) {
                name = data.lastName;
              }
              
              const user: User = {
                id: doc.id,
                email: data.email || '',
                name: name,
                phone: data.phone || '',
                role: data.role || 'user',
                active: data.active ?? true,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : 
                          typeof data.createdAt === 'string' ? new Date(data.createdAt) : new Date(),
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : 
                          typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : new Date()
              };
              
              // Log the processed user object
              console.log('Processed user object:', user);
              
              return user;
            });
            
            console.log('Processed users:', users);
            set({ users, loading: false, error: null });
          },
          (error) => {
            console.error('Error in user snapshot:', error);
            set({ error: error.message, loading: false });
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing user store:', error);
        set({ error: (error as Error).message, loading: false });
      }
    },

    updateUser: async (id: string, userData: Partial<User>) => {
      try {
        const userRef = doc(db, 'users', id);
        
        // Convert dates to Timestamps for Firestore
        const firestoreData = {
          ...userData,
          updatedAt: Timestamp.now()
        };

        await updateDoc(userRef, firestoreData);

        // Log activity
        const activityStore = useActivityStore.getState();
        activityStore.logActivity({
          type: 'user_updated',
          details: {
            userId: id,
            updatedFields: Object.keys(userData)
          },
          timestamp: Timestamp.now()
        });
      } catch (error) {
        console.error('Error updating user:', error);
        set({ error: (error as Error).message });
        throw error;
      }
    },

    deleteUser: async (id: string) => {
      try {
        const userRef = doc(db, 'users', id);
        await deleteDoc(userRef);

        // Log activity
        const activityStore = useActivityStore.getState();
        activityStore.logActivity({
          type: 'user_deleted',
          details: {
            userId: id
          },
          timestamp: Timestamp.now()
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        set({ error: (error as Error).message });
        throw error;
      }
    },

    getUserById: (id: string) => {
      return get().users.find(user => user.id === id);
    }
  }))
);