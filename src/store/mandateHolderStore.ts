import { create } from 'zustand';
import { collection, doc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface MandateHolder {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  properties: string[];
  role: 'mandateHolder';
  createdAt: Date;
  updatedAt: Date;
}

interface MandateHolderStore {
  mandateHolders: MandateHolder[];
  loading: boolean;
  error: Error | null;
  initialize: () => Promise<() => void>;
  getMandateHolderById: (id: string) => MandateHolder | undefined;
}

export const useMandateHolderStore = create<MandateHolderStore>((set, get) => ({
  mandateHolders: [],
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      // Set up real-time listener for mandate holders
      console.log('Initializing mandate holders store...');
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'mandateHolder')
      );
      console.log('Created Firestore query:', q);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('Received Firestore snapshot, docs:', snapshot.docs.length);
        const mandateHolders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as MandateHolder[];
        console.log('Processed mandate holders:', mandateHolders);

        set({ mandateHolders, loading: false });
      }, (error) => {
        console.error('Error fetching mandate holders:', error);
        set({ error: error as Error, loading: false });
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error initializing mandate holders:', error);
      set({ error: error as Error, loading: false });
      return () => {}; // Return empty cleanup function if initialization fails
    }
  },

  getMandateHolderById: (id: string) => {
    return get().mandateHolders.find(holder => holder.id === id);
  },
}));
