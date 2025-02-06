import { create } from 'zustand';
import {
  collection,
  query,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Lead } from '../types';
import { createProtectedStore } from './baseStore';

interface LeadState {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<(() => void) | undefined>;
  updateLead: (id: string, leadData: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  getLeadById: (id: string) => Lead | undefined;
  getNewLeadsCount: (startDate: Date, endDate: Date) => number;
}

export const useLeadStore = create<LeadState>(
  createProtectedStore((set, get) => ({
    leads: [],
    loading: false,
    error: null,

    addLead: async (lead) => {
      try {
        const docRef = await addDoc(collection(db, 'leads'), {
          ...lead,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // No need to update state as the onSnapshot listener will handle it
      } catch (error) {
        console.error('Error adding lead:', error);
        throw error;
      }
    },

    initialize: async () => {
      set({ loading: true });
      console.log('Initializing lead store...');
      
      try {
        const q = query(
          collection(db, 'leads'),
          orderBy('createdAt', 'desc')
        );

        console.log('Setting up lead snapshot listener...');
        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const leads = snapshot.docs.map(doc => {
              const data = doc.data();
              console.log('Raw lead data:', { id: doc.id, ...data });
              
              console.log('Raw lead data from Firestore:', data);
              const lead: Lead = {
                id: doc.id,
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                status: data.status || 'new',
                description: data.description || '',
                notes: data.notes || '',
                tags: data.tags || [],
                source: data.source || '',
                assignedTo: data.assignedTo || '',
                convertedToCustomer: data.convertedToCustomer || false,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : 
                          typeof data.createdAt === 'string' ? new Date(data.createdAt) : new Date(),
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : 
                          typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : new Date(),
                statusHistory: data.statusHistory || []
              };
              
              return lead;
            });
            
            console.log('Processed leads:', leads);
            console.log('First lead example:', leads[0]);
            set({ leads, loading: false, error: null });
          },
          (error) => {
            console.error('Error in lead snapshot:', error);
            set({ error: error.message, loading: false });
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing lead store:', error);
        set({ error: (error as Error).message, loading: false });
      }
    },

    updateLead: async (id: string, leadData: Partial<Lead>) => {
      try {
        const leadRef = doc(db, 'leads', id);
        const currentLead = get().leads.find(lead => lead.id === id);
        
        // Handle status history
        let updateData: any = {
          ...leadData,
          updatedAt: serverTimestamp()
        };

        if (leadData.status && currentLead) {
          const statusHistory = currentLead.statusHistory || [];
          updateData.statusHistory = [
            ...statusHistory,
            {
              status: leadData.status,
              changedAt: new Date()
            }
          ];
        }

        await updateDoc(leadRef, updateData);
      } catch (error) {
        console.error('Error updating lead:', error);
        throw error;
      }
    },

    deleteLead: async (id: string) => {
      try {
        const leadRef = doc(db, 'leads', id);
        await deleteDoc(leadRef);
      } catch (error) {
        console.error('Error deleting lead:', error);
        throw error;
      }
    },

    getLeadById: (id: string) => {
      return get().leads.find(lead => lead.id === id);
    },

    getNewLeadsCount: (startDate: Date, endDate: Date) => {
      return get().leads.filter(lead => {
        if (!lead.createdAt) return false;

        try {
          // Convert Firestore Timestamp to Date if needed
          const leadDate = lead.createdAt instanceof Timestamp 
            ? lead.createdAt.toDate() 
            : lead.createdAt;

          // Ensure we're working with a valid Date object
          if (!(leadDate instanceof Date)) return false;

          // Ensure we're comparing Date objects
          const leadTime = leadDate.getTime();
          const startTime = startDate.getTime();
          const endTime = endDate.getTime();

          return (
            lead.status === 'new' &&
            leadTime >= startTime &&
            leadTime <= endTime
          );
        } catch (error) {
          console.error('Error processing lead date:', error);
          return false;
        }
      }).length;
    }
  }))
);
