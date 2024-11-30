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
  where,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import { useActivityStore } from './activityStore';
import { useAuthStore } from './authStore';
import type { User } from '../types';

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
      
      try {
        // Only fetch active users by default
        const q = query(
          collection(db, 'users'),
          orderBy('name')
        );

        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const users = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              lastLogin: doc.data().lastLogin ? doc.data().lastLogin.toDate() : null
            })) as User[];

            set({ users, loading: false, error: null });
          },
          (error) => {
            console.error('Error fetching users:', error);
            set({ error: error.message, loading: false });
          }
        );

        return unsubscribe;
      } catch (error: any) {
        console.error('Error initializing users:', error);
        set({ error: error.message, loading: false });
        return undefined;
      }
    },

    updateUser: async (id, userData) => {
      try {
        set({ loading: true });
        const userRef = doc(db, 'users', id);
        const { user: currentUser } = useAuthStore.getState();

        if (!currentUser) {
          throw new Error('Not authenticated');
        }

        // Remove undefined values from userData
        const cleanUserData = Object.fromEntries(
          Object.entries(userData).filter(([_, value]) => value !== undefined)
        );

        await updateDoc(userRef, {
          ...cleanUserData,
          updatedAt: Timestamp.now()
        });

        // Log activity
        const { logActivity } = useActivityStore.getState();
        
        await logActivity({
          type: 'user_updated',
          message: `User ${userData.name || id} updated`,
          userId: currentUser.id,
          userName: currentUser.name,
          entityId: id,
          entityType: 'user',
          metadata: {
            updatedFields: Object.keys(cleanUserData)
          }
        });

        set({ loading: false, error: null });
      } catch (error: any) {
        console.error('Error updating user:', error);
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    deleteUser: async (id) => {
      try {
        set({ loading: true });
        const userToDelete = get().users.find(u => u.id === id);
        
        if (!userToDelete) {
          throw new Error('User not found');
        }

        // Check if trying to delete the last admin
        const adminUsers = get().users.filter(u => u.role === 'admin');
        if (userToDelete.role === 'admin' && adminUsers.length <= 1) {
          throw new Error('Cannot delete the last admin user');
        }

        // Delete user document from Firestore
        await deleteDoc(doc(db, 'users', id));

        // Log activity
        const { logActivity } = useActivityStore.getState();
        const { user } = useAuthStore.getState();
        
        if (user) {
          await logActivity({
            type: 'user_deleted',
            message: `User ${userToDelete.name} deleted`,
            userId: user.id,
            userName: user.name,
            entityId: id,
            entityType: 'user',
            metadata: {
              deletedUser: {
                name: userToDelete.name,
                email: userToDelete.email,
                role: userToDelete.role
              }
            }
          });
        }

        set({ loading: false, error: null });
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    getUserById: (id) => {
      return get().users.find(user => user.id === id);
    }
  }))
);