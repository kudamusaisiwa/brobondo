import { create } from 'zustand';
import {
  collection,
  doc,
  onSnapshot,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Buyer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  budget: number;
  preferredLocations: string[];
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land';
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
  interestedProperties?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface BuyerState {
  buyers: Buyer[];
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  addBuyer: (buyer: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBuyer: (id: string, buyer: Partial<Buyer>) => Promise<void>;
  deleteBuyer: (id: string) => Promise<void>;
}

export const useBuyerStore = create<BuyerState>((set) => ({
  buyers: [],
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true });
    try {
      const q = query(collection(db, 'buyers'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const buyers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Buyer[];
        set({ buyers, loading: false });
      });
      return unsubscribe;
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },

  addBuyer: async (buyer) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'buyers'), {
        ...buyer,
        createdAt: now,
        updatedAt: now
      });
    } catch (error) {
      set({ error: error as Error });
    }
  },

  updateBuyer: async (id, buyer) => {
    try {
      const buyerRef = doc(db, 'buyers', id);
      await updateDoc(buyerRef, {
        ...buyer,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      set({ error: error as Error });
    }
  },

  deleteBuyer: async (id) => {
    try {
      const buyerRef = doc(db, 'buyers', id);
      await deleteDoc(buyerRef);
    } catch (error) {
      set({ error: error as Error });
    }
  }
}));
