import { create } from 'zustand';
import { collection, query, getDocs, doc, setDoc, updateDoc, onSnapshot, Timestamp, where, orderBy, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { manyContactApi } from '../services/manycontact';

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
  lastMessageAt?: Timestamp;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: Note[] | string | null;
  hidden?: boolean;
  convertedToCustomer?: boolean;
  convertedAt?: Timestamp;
  manyContactId?: string;
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
  syncWithManyContact: () => Promise<void>;
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
      
      // Temporary solution until composite index is created
      const q = query(
        leadsRef,
        where('hidden', '==', false)
      );
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const leadsList: Lead[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Lead;
          leadsList.push({ ...data, id: doc.id });
        });

        // Sort leads with messages first, then by lastSync
        const sortedLeads = leadsList.sort((a, b) => {
          // First, sort by lastMessageAt if available
          const aMessageTime = a.lastMessageAt?.toMillis() || 0;
          const bMessageTime = b.lastMessageAt?.toMillis() || 0;
          
          if (aMessageTime !== bMessageTime) {
            return bMessageTime - aMessageTime;
          }
          
          // If lastMessageAt is the same (or both null), sort by lastSync
          return b.lastSync.toMillis() - a.lastSync.toMillis();
        });

        set({ leads: sortedLeads, loading: false });
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

  syncWithManyContact: async () => {
    try {
      // Check if a sync has been performed recently
      const lastSyncKey = 'lastManyContactSync';
      const lastSync = localStorage.getItem(lastSyncKey);
      const currentTime = Date.now();

      // Only sync if more than 5 minutes have passed since last sync
      if (lastSync && (currentTime - parseInt(lastSync, 10) < 5 * 60 * 1000)) {
        console.log('Sync skipped: Recently synced');
        return;
      }

      set({ loading: true, error: null });
      
      // Perform ManyContact sync
      const response = await manyContactApi.syncLeads();
      
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
            
            // If the lead is from ManyContact and not locally modified, update
            if (leadData.manyContactId) {
              const updatedLeadData = response.leads.find(
                (apiLead) => apiLead.id === leadData.manyContactId
              );
              
              if (updatedLeadData) {
                // Update lead with latest data from ManyContact
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
        
        console.log('ManyContact sync successful:', response.message);
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
        ...(currentLeadData.manyContactId && { manyContactId: currentLeadData.manyContactId }),
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
