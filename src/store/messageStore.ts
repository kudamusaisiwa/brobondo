import { create } from 'zustand';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  Timestamp, 
  updateDoc, 
  where, 
  setDoc, 
  arrayUnion,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { manyContactApi } from '../services/manycontact';
import { useNotificationStore } from './notificationStore';

export interface MessageAttachment {
  url: string;
  type: 'image' | 'file';
  name: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  direction: 'incoming' | 'outgoing';
  type: string;
  sender: {
    id: string;
    name?: string;
  };
  recipient: {
    id: string;
    name?: string;
  };
  read?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  attachments?: MessageAttachment[];
}

interface MessageStore {
  messages: Record<string, Message[]>;
  filteredMessages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  lastChecked: Record<string, number>;
  unreadCount: Record<string, number>;
  searchQuery: string;
  filters: MessageFilters;
  initialize: () => Promise<void>;
  getMessages: (contactId: string) => Promise<Message[]>;
  markAsRead: (contactId: string, messageIds: string[]) => Promise<void>;
  startRealTimeUpdates: (contactId: string) => () => void;
  checkNewMessages: () => Promise<void>;
  sendMessage: (contactId: string, text: string, attachments?: File[]) => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: MessageFilters) => void;
}

export interface MessageFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  messageType?: 'text' | 'image' | 'file' | 'all';
  direction?: 'incoming' | 'outgoing' | 'all';
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: {},
  filteredMessages: {},
  loading: false,
  error: null,
  lastChecked: {},
  unreadCount: {},
  searchQuery: '',
  filters: {
    messageType: 'all',
    direction: 'all'
  },

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      
      // Get all leads with ManyContact IDs
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, where('manyContactId', '!=', null));
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const lead = change.doc.data();
            if (lead.manyContactId) {
              // Start real-time updates for this contact
              get().startRealTimeUpdates(lead.manyContactId);
            }
          }
        });
      });

      // Initial message check
      await get().checkNewMessages();
      
      set({ loading: false });
      return unsubscribe;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize messages',
        loading: false 
      });
    }
  },

  uploadFile: async (file: File) => {
    const fileRef = ref(storage, `messages/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  },

  getMessages: async (contactId: string) => {
    try {
      const messages = await manyContactApi.getContactMessages(contactId);
      set(state => ({
        messages: {
          ...state.messages,
          [contactId]: messages
        }
      }));
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  markAsRead: async (contactId: string, messageIds: string[]) => {
    try {
      const messagesRef = doc(collection(db, 'messages'), contactId);
      await updateDoc(messagesRef, {
        'messages': messageIds.map(id => ({
          id,
          read: true,
          readAt: Timestamp.now()
        }))
      });

      // Update local state
      set(state => {
        const updatedMessages = state.messages[contactId]?.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        ) || [];

        return {
          messages: {
            ...state.messages,
            [contactId]: updatedMessages
          },
          unreadCount: {
            ...state.unreadCount,
            [contactId]: (state.unreadCount[contactId] || 0) - messageIds.length
          }
        };
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  startRealTimeUpdates: (contactId: string) => {
    // Fetch initial messages from ManyContact
    const fetchInitialMessages = async () => {
      try {
        // Fetch messages from ManyContact
        const manyContactMessages = await manyContactApi.getContactMessages(contactId);
        
        // Fetch attachments separately
        const attachments = await manyContactApi.getContactAttachments(contactId);

        // Merge attachments with messages
        const messagesWithAttachments = manyContactMessages.map(message => {
          const messageAttachments = attachments.filter(
            attachment => new Date(attachment.createdAt).getTime() === message.timestamp
          ).map(attachment => ({
            url: attachment.url,
            type: attachment.mimetype.startsWith('image/') ? 'image' : 'file',
            name: attachment.filename
          }));

          return {
            ...message,
            attachments: messageAttachments
          };
        });

        // Update messages in Firestore
        const batch = writeBatch(db);
        const threadRef = collection(db, `messages/${contactId}/thread`);

        messagesWithAttachments.forEach(async (message) => {
          const messageDocRef = doc(threadRef);
          batch.set(messageDocRef, message);
        });

        await batch.commit();

        // Update lead's lastMessageAt
        if (messagesWithAttachments.length > 0) {
          const leadsRef = collection(db, 'leads');
          const leadQuery = query(leadsRef, where('manyContactId', '==', contactId));
          const leadSnapshot = await getDocs(leadQuery);

          if (!leadSnapshot.empty) {
            const leadDoc = leadSnapshot.docs[0];
            await updateDoc(doc(db, 'leads', leadDoc.id), {
              lastMessageAt: Timestamp.fromMillis(
                Math.max(...messagesWithAttachments.map(m => m.timestamp))
              )
            });
          }
        }

        // Set up real-time listener for new messages
        const messagesRef = collection(db, `messages/${contactId}/thread`);
        const q = query(messagesRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const messages: Message[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as Message;
            messages.push({ ...data, id: doc.id });
          });

          set((state) => ({
            messages: {
              ...state.messages,
              [contactId]: messages,
            },
          }));

          // Apply filters
          get().applyFilters();
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching initial messages:', error);
        
        // Fallback to existing real-time listener if ManyContact fetch fails
        const messagesRef = collection(db, `messages/${contactId}/thread`);
        const q = query(messagesRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const messages: Message[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as Message;
            messages.push({ ...data, id: doc.id });
          });

          set((state) => ({
            messages: {
              ...state.messages,
              [contactId]: messages,
            },
          }));

          // Apply filters
          get().applyFilters();
        });

        return unsubscribe;
      }
    };

    // Call and return the initial fetch function
    return fetchInitialMessages();
  },

  checkNewMessages: async () => {
    try {
      // Get all leads with ManyContact IDs
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, where('manyContactId', '!=', null));
      
      const querySnapshot = await getDocs(q);

      // Fetch messages for each lead
      const messagePromises = querySnapshot.docs.map(async (doc) => {
        const lead = doc.data();
        if (lead) {
          try {
            if (lead.manyContactId) {
              console.log(`Fetching messages for contact ${lead.manyContactId}`);
              const messages = await manyContactApi.getContactMessages(lead.manyContactId);
              
              // Update messages in store
              set(state => ({
                messages: {
                  ...state.messages,
                  [lead.manyContactId]: messages
                },
                lastChecked: {
                  ...state.lastChecked,
                  [lead.manyContactId]: Date.now()
                }
              }));

              // Calculate unread count
              const unreadCount = messages.filter(
                msg => !msg.read && msg.direction === 'incoming'
              ).length;

              // Update unread count
              set(state => ({
                unreadCount: {
                  ...state.unreadCount,
                  [lead.manyContactId]: unreadCount
                }
              }));

              // Store messages in Firestore
              const messagesRef = doc(collection(db, 'messages'), lead.manyContactId);
              await setDoc(messagesRef, { messages }, { merge: true });

            }
          } catch (error) {
            console.error(`Error fetching messages for contact ${lead.manyContactId}:`, error);
          }
        }
      });

      await Promise.all(messagePromises);
    } catch (error) {
      console.error('Error checking new messages:', error);
      throw error;
    }
  },

  sendMessage: async (contactId: string, text: string, attachments: File[] = []) => {
    try {
      set({ loading: true, error: null });

      // Upload attachments if any
      const uploadedAttachments: MessageAttachment[] = [];
      for (const file of attachments) {
        const url = await get().uploadFile(file);
        uploadedAttachments.push({
          url,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name
        });
      }

      // Create message object
      const message: Omit<Message, 'id'> = {
        text,
        timestamp: Date.now(),
        direction: 'outgoing',
        type: 'text',
        sender: {
          id: 'system',
          name: 'System'
        },
        recipient: {
          id: contactId
        },
        status: 'sending',
        attachments: uploadedAttachments
      };

      // Add message to Firestore
      const messageRef = doc(collection(db, `messages/${contactId}/thread`));
      await setDoc(messageRef, message);

      // Send message through ManyContact
      await manyContactApi.sendMessage({ contactId, message: text });

      // Update message status to sent
      await updateDoc(messageRef, { status: 'sent' });

      // Update lastMessageAt in leads collection
      try {
        const leadsRef = collection(db, 'leads');
        const leadQuery = query(leadsRef, where('manyContactId', '==', contactId));
        const leadSnapshot = await getDocs(leadQuery);

        if (!leadSnapshot.empty) {
          const leadDoc = leadSnapshot.docs[0];
          await updateDoc(doc(db, 'leads', leadDoc.id), {
            lastMessageAt: Timestamp.fromMillis(message.timestamp)
          });
        }
      } catch (error) {
        console.error('Error updating lastMessageAt:', error);
      }

      set({ loading: false });
    } catch (error) {
      console.error('Error sending message:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to send message', loading: false });
      throw error;
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setFilters: (filters: MessageFilters) => {
    set({ filters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { messages, searchQuery, filters } = get();
    
    const filteredMessages: Record<string, Message[]> = {};

    Object.entries(messages).forEach(([contactId, contactMessages]) => {
      filteredMessages[contactId] = contactMessages.filter(message => {
        // Text search
        if (searchQuery && !message.text.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Message type filter
        if (filters.messageType !== 'all') {
          if (filters.messageType === 'image' && !message.attachments?.some(a => a.type === 'image')) {
            return false;
          }
          if (filters.messageType === 'file' && !message.attachments?.some(a => a.type === 'file')) {
            return false;
          }
        }

        // Direction filter
        if (filters.direction !== 'all' && message.direction !== filters.direction) {
          return false;
        }

        // Date range filter
        if (filters.dateRange) {
          const messageDate = new Date(message.timestamp);
          if (messageDate < filters.dateRange.start || messageDate > filters.dateRange.end) {
            return false;
          }
        }

        return true;
      });
    });

    set({ filteredMessages });
  }
}));
