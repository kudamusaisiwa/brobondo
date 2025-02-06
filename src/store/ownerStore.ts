import { create } from 'zustand';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
  propertyCount: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

interface OwnerStore {
  owners: Owner[];
  loading: boolean;
  initialize: () => Promise<() => void>;
  addOwner: (owner: Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOwner: (id: string, updates: Partial<Owner>) => Promise<void>;
  deleteOwner: (id: string) => Promise<void>;
  updatePropertyCount: (id: string) => Promise<void>;
}

export const useOwnerStore = create(
  createProtectedStore<OwnerStore>((set) => ({
    owners: [],
    loading: false,

    initialize: async () => {
      set({ loading: true });
      try {
        const q = query(
          collection(db, 'owners'),
          orderBy('lastName', 'asc'),
          orderBy('firstName', 'asc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const owners = await Promise.all(snapshot.docs.map(async (doc) => {
            // Count properties for this owner
            const propertiesQuery = query(
              collection(db, 'properties'),
              where('ownerId', '==', doc.id)
            );
            const propertiesSnapshot = await getDocs(propertiesQuery);
            const propertyCount = propertiesSnapshot.size;

            // Update the owner document if the property count is different
            if (doc.data().propertyCount !== propertyCount) {
              await updateDoc(doc.ref, { propertyCount });
            }

            return {
              id: doc.id,
              ...doc.data(),
              propertyCount,
              createdAt: doc.data().createdAt?.toDate(),
              updatedAt: doc.data().updatedAt?.toDate(),
            } as Owner;
          }));

          set({ owners, loading: false });
        });

        return unsubscribe;
      } catch (error: any) {
        console.error('Error initializing owner store:', error);
        set({ error: error.message, loading: false });
        return () => {};
      }
    },

    addOwner: async (owner) => {
      try {
        const docRef = await addDoc(collection(db, 'owners'), {
          ...owner,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return docRef.id;
      } catch (error: any) {
        console.error('Error adding owner:', error);
        throw error;
      }
    },

    updateOwner: async (id, updates) => {
      try {
        const ref = doc(db, 'owners', id);
        await updateDoc(ref, {
          ...updates,
          updatedAt: new Date(),
        });
      } catch (error: any) {
        console.error('Error updating owner:', error);
        throw error;
      }
    },

    deleteOwner: async (id) => {
      try {
        await deleteDoc(doc(db, 'owners', id));
      } catch (error: any) {
        console.error('Error deleting owner:', error);
        throw error;
      }
    },
  }))
);
