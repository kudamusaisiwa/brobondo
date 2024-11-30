import { create } from 'zustand';
import { collection, query, getDocs, doc, setDoc, updateDoc, onSnapshot, Timestamp, where, orderBy, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { manychatApi } from '../services/manychat';

export interface Note {
  id?: string;
  text: string;
  createdAt: Timestamp;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface Lead {
  id: string;
  name: string;
  number?: string;
  email?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  lastSync: Timestamp;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: Note[] | string | null;
  hidden?: boolean;
  convertedToCustomer?: boolean;
  convertedAt?: Timestamp;
  manyChatId?: string;
  statusHistory?: {
    status: Lead['status'];
    changedAt: Timestamp;
  }[];
  firstContactedAt?: Timestamp;
  locallyModified?: boolean;
}

interface LeadStore {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  syncWithManyChat: () => Promise<void>;
  updateLeadStatus: (leadId: string, status: Lead['status']) => Promise<void>;
  addLeadNote: (leadId: string, note: Note) => Promise<void>;
  hideLead: (leadId: string) => Promise<void>;
  convertToCustomer: (leadId: string) => Promise<void>;
}

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  loading: false,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const leadsRef = collection(db, 'leads');
      const q = query(
        leadsRef,
        where('hidden', '==', false),
        orderBy('lastSync', 'desc')
      );
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const leadsList: Lead[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Lead;
          leadsList.push({ ...data, id: doc.id });
        });
        set({ leads: leadsList, loading: false });
      }, (error) => {
        console.error('Error fetching leads:', error);
        set({ error: error.message, loading: false });
      });

      return unsubscribe;
    } catch (error) {
      console.error('Initialization error:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  syncWithManyChat: async () => {
    try {
      // Check if a sync has been performed recently
      const lastSyncKey = 'lastManyChatSync';
      const lastSync = localStorage.getItem(lastSyncKey);
      const currentTime = Date.now();

      // Only sync if more than 5 minutes have passed since last sync
      if (lastSync && (currentTime - parseInt(lastSync, 10) < 5 * 60 * 1000)) {
        console.log('Sync skipped: Recently synced');
        return;
      }

      set({ loading: true, error: null });
      
      // Perform ManyChat sync
      const response = await manychatApi.syncLeads();
      
      if (response.success && response.leads && Array.isArray(response.leads)) {
        // Fetch all leads from Firestore
        const leadsRef = collection(db, 'leads');
        const leadsSnapshot = await getDocs(leadsRef);
        
        const updatePromises = leadsSnapshot.docs
          .filter(doc => {
            const leadData = doc.data() as Lead;
            // Skip leads that have been locally modified
            return !leadData.locallyModified;
          })
          .map(async (doc) => {
            const leadData = doc.data() as Lead;
            
            // If the lead is from ManyChat and not locally modified, update
            if (leadData.manyChatId) {
              const updatedLeadData = response.leads.find(
                (apiLead) => apiLead.id === leadData.manyChatId
              );
              
              if (updatedLeadData) {
                // Update lead with latest data from ManyChat
                return updateDoc(doc.ref, {
                  ...updatedLeadData,
                  lastSync: Timestamp.now()
                });
              }
            }
            return Promise.resolve(); // Return a resolved promise for leads not updated
          });
        
        // Wait for all updates to complete
        await Promise.all(updatePromises);
        
        // Update last sync time
        localStorage.setItem(lastSyncKey, currentTime.toString());
        
        console.log('ManyChat sync successful:', response.message);
        set({ loading: false });
      } else {
        // Log detailed error information
        console.error('Sync response:', response);
        throw new Error(response.message || 'Sync failed: Invalid response');
      }
    } catch (error) {
      console.error('Sync error:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown sync error' 
      });
      
      // Rethrow the error to allow caller to handle it
      throw error;
    }
  },

  updateLeadStatus: async (leadId: string, status: Lead['status']) => {
    try {
      console.log(`Attempting to update lead ${leadId} status to ${status}`);
      
      const leadRef = doc(db, 'leads', leadId);
      
      // Fetch current lead data before updating
      const currentLeadSnap = await getDoc(leadRef);
      const currentLeadData = currentLeadSnap.data() as Lead;
      
      // Prepare update object
      const updateData: Partial<Lead> = {
        status: status,
        hidden: false, // Ensure the lead is not hidden
        lastSync: Timestamp.now(), // Update lastSync to trigger real-time listener
        locallyModified: true, // Mark as locally modified
        
        // Preserve important metadata when status changes
        ...(currentLeadData.manyChatId && { manyChatId: currentLeadData.manyChatId }),
        ...(currentLeadData.email && { email: currentLeadData.email }),
        ...(currentLeadData.number && { number: currentLeadData.number }),
        ...(currentLeadData.name && { name: currentLeadData.name }),
        
        // Add status change history
        statusHistory: arrayUnion({
          status: status,
          changedAt: Timestamp.now(),
        })
      };
      
      // If moving to 'contacted', add additional metadata
      if (status === 'contacted') {
        updateData.firstContactedAt = Timestamp.now();
      }
      
      // Update the document
      await updateDoc(leadRef, updateData);
      
      console.log(`Lead ${leadId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  },

  addLeadNote: async (leadId: string, note: Note) => {
    try {
      console.log('Adding lead note - LeadID:', leadId);
      console.log('Note:', note);
      
      const leadRef = doc(db, 'leads', leadId);
      
      // Fetch current lead data
      const currentLeadSnap = await getDoc(leadRef);
      const currentLeadData = currentLeadSnap.data() as Lead;
      
      // Prepare notes array
      let updatedNotes: Note[] = [];
      
      // Handle existing notes
      if (Array.isArray(currentLeadData.notes)) {
        updatedNotes = [...currentLeadData.notes, note];
      } else if (typeof currentLeadData.notes === 'string') {
        // If notes is a string, convert to array
        updatedNotes = [
          {
            text: currentLeadData.notes,
            createdAt: Timestamp.now(),
            createdBy: {
              id: 'system',
              name: 'System'
            }
          },
          note
        ];
      } else {
        // If no notes exist, create new array
        updatedNotes = [note];
      }
      
      // Update the document
      await updateDoc(leadRef, { 
        notes: updatedNotes,
        lastSync: Timestamp.now() // Update lastSync to trigger real-time listener
      });
      
      console.log('Note added successfully');
      console.log('Updated notes:', updatedNotes);
    } catch (error) {
      console.error('Error adding lead note:', error);
      throw error;
    }
  },

  hideLead: async (leadId: string) => {
    try {
      console.log('Hiding lead in store:', leadId);
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, { 
        hidden: true,
        status: 'lost',
        locallyModified: true // Mark as locally modified
      });
      console.log('Lead hidden in Firestore:', leadId);
    } catch (error) {
      console.error('Error hiding lead:', error);
      throw error;
    }
  },

  convertToCustomer: async (leadId: string) => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, { 
        convertedToCustomer: true,
        convertedAt: Timestamp.now(),
        status: 'converted'
      });
      // TODO: Add logic to create a new customer record
    } catch (error) {
      console.error('Error converting lead to customer:', error);
      throw error;
    }
  }
}));
