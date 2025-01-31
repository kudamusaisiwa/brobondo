import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import { useActivityStore } from './activityStore';
import { useAuthStore } from './authStore';
import type { Communication, CommunicationType } from '../types';

interface CommunicationState {
  communications: Communication[];
  loading: boolean;
  error: string | null;
  initialize: (customerId: string, queryOptions?: any) => Promise<(() => void) | undefined>;
  addCommunication: (data: {
    customerId: string;
    type: CommunicationType;
    summary: string;
  }) => Promise<string>;
  getCustomerCommunications: (customerId: string) => Communication[];
  clearCommunications: () => void;
}

export const useCommunicationStore = create<CommunicationState>(
  persist(
    createProtectedStore((set, get) => ({
      communications: [],
      loading: false,
      error: null,

      initialize: async (customerId: string, queryOptions?: any) => {
        console.log('Initializing Communications:', { customerId });
        set({ loading: true });
        
        try {
          // If no user is provided, try to get from auth store
          const authState = useAuthStore.getState();
          const user = authState.user;

          if (!user) {
            console.error('No authenticated user found');
            set({ loading: false, error: 'User not authenticated' });
            return undefined;
          }

          const communicationsRef = collection(db, 'communications');
          const q = query(
            communicationsRef,
            where('customerId', '==', customerId),
            orderBy('createdAt', 'desc')
          );

          // Get initial communications with credentials
          const snapshot = await getDocs(q, queryOptions);
          const communications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Communication[];

          set({ communications, error: null, loading: false });

          // Set up real-time listener with credentials
          const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
            const updatedCommunications = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Communication[];
            set({ communications: updatedCommunications });
          }, queryOptions);

          return unsubscribe;
        } catch (error) {
          console.error('Error initializing communications:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to load communications', loading: false });
        }
      },

      addCommunication: async (data) => {
        if (!data.customerId) {
          throw new Error('Customer ID is required');
        }

        try {
          set({ loading: true });
          const { user } = useAuthStore.getState();
          const { logActivity } = useActivityStore.getState();
          
          if (!user) {
            throw new Error('User not authenticated');
          }

          // Prepare communication data
          const communicationData = {
            ...data,
            createdBy: user.id,
            createdAt: Timestamp.now()
          };

          // Add communication to Firestore
          const docRef = await addDoc(collection(db, 'communications'), communicationData);

          // Immediately update local state to reflect new communication
          const newCommunication = {
            id: docRef.id,
            ...communicationData,
            createdAt: communicationData.createdAt.toDate()
          };

          // Update local communications state
          set(state => ({
            communications: [
              newCommunication,
              ...state.communications
            ],
            loading: false,
            error: null
          }));

          // Log activity
          await logActivity({
            type: 'communication_added',
            message: `New ${data.type} communication added`,
            userId: user.id,
            userName: user.name,
            entityId: data.customerId,
            entityType: 'customer',
            metadata: {
              type: data.type,
              summary: data.summary
            }
          });

          return docRef.id;
        } catch (error: any) {
          console.error('Error adding communication:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      getCustomerCommunications: (customerId: string) => {
        return get().communications.filter(comm => comm.customerId === customerId);
      },

      clearCommunications: () => {
        set({ communications: [], loading: false, error: null });
      }
    })),
    {
      name: 'customer-communications-storage', // unique name
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({ 
        communications: state.communications 
      }), // only persist communications
      onRehydrate: (state) => {
        console.log('Rehydrated communications:', state?.communications);
      },
      // Add validation and migration for stored communications
      migrate: (persistedState: any) => {
        // Validate and clean up persisted communications
        if (persistedState?.communications) {
          const validCommunications = persistedState.communications.filter((comm: Communication) => 
            comm.id && comm.customerId && comm.type && comm.summary
          );

          // Limit number of stored communications to prevent localStorage overflow
          const MAX_STORED_COMMUNICATIONS = 100;
          const limitedCommunications = validCommunications.slice(0, MAX_STORED_COMMUNICATIONS);

          return {
            communications: limitedCommunications,
            loading: false,
            error: null
          };
        }
        return {
          communications: [],
          loading: false,
          error: null
        };
      },
      // Add error handling for storage
      onError: (error) => {
        console.error('Communication store persistence error:', error);
      }
    }
  )
);