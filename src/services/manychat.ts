import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const MANYCHAT_API_KEY = import.meta.env.VITE_MANYCHAT_API_KEY;
const MANYCHAT_API_URL = 'https://api.manycontacts.com/v1';

interface Contact {
  id: string;
  name: string;
  number: string;
  email?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

interface Message {
  id: string;
  text: string;
  timestamp: number;
  direction: 'incoming' | 'outgoing';
  type: string;
  sender?: {
    id: string;
    name?: string;
  };
  recipient?: {
    id: string;
    name?: string;
  };
}

export const manychatApi = {
  async getAllContacts(page = 0, filter = 1): Promise<Contact[]> {
    try {
      const response = await fetch(`${MANYCHAT_API_URL}/contacts?page=${page}&filter=${filter}`, {
        headers: {
          'apikey': MANYCHAT_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },

  async getContactDetails(contactId: string): Promise<Contact> {
    try {
      const response = await fetch(`${MANYCHAT_API_URL}/contact/${contactId}`, {
        headers: {
          'apikey': MANYCHAT_API_KEY
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get contact: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting contact details:', error);
      throw error;
    }
  },

  async createContact(data: { name: string; number: string }): Promise<Contact> {
    try {
      const response = await fetch(`${MANYCHAT_API_URL}/contact`, {
        method: 'POST',
        headers: {
          'apikey': MANYCHAT_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: data.number.replace('+', ''), // Remove + from phone number
          name: data.name
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create contact: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },

  async updateContact(contactId: string, data: Partial<Contact>): Promise<Contact> {
    try {
      const response = await fetch(`${MANYCHAT_API_URL}/contact/${contactId}`, {
        method: 'PUT',
        headers: {
          'apikey': MANYCHAT_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },

  async getContactMessages(contactId: string): Promise<Message[]> {
    try {
      // Get contact details which includes conversation history
      const response = await fetch(`${MANYCHAT_API_URL}/contact/${contactId}`, {
        headers: {
          'apikey': MANYCHAT_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch contact details: ${response.status}`);
      }

      const contactData = await response.json();
      console.log('Contact data received:', contactData); // Debug log

      // Check if there are messages in the response
      const messages: Message[] = [];
      
      if (contactData.messages) {
        contactData.messages.forEach((msg: any) => {
          messages.push({
            id: msg.id || crypto.randomUUID(),
            text: msg.text || '',
            timestamp: msg.timestamp || (msg.metadata?.time ? new Date(msg.metadata.time).getTime() : Date.now()),
            direction: msg.type === 'received' ? 'incoming' : 'outgoing',
            type: msg.type || 'text',
            sender: {
              id: msg.type === 'received' ? contactId : 'system',
              name: msg.type === 'received' ? contactData.name : 'System'
            },
            recipient: {
              id: msg.type === 'received' ? 'system' : contactId,
              name: msg.type === 'received' ? 'System' : contactData.name
            }
          });
        });
      }

      // Store messages in Firestore for persistence
      const messagesCollection = collection(db, 'messages');
      const messageDoc = doc(messagesCollection, contactId);
      await setDoc(messageDoc, {
        messages,
        lastUpdated: Timestamp.now()
      }, { merge: true });

      // Sort messages by timestamp (newest first)
      return messages.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      throw error;
    }
  },

  async getContact(contactId: string): Promise<{
    id: string;
    number: string;
    name?: string;
    email?: string;
  }> {
    try {
      const response = await fetch(`${MANYCHAT_API_URL}/contact/${contactId}`, {
        method: 'GET',
        headers: {
          'apikey': MANYCHAT_API_KEY,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get contact error details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: `${MANYCHAT_API_URL}/contact/${contactId}`
        });

        throw new Error(`Failed to retrieve contact: ${response.status} - ${errorText}`);
      }

      const contactData = await response.json();
      return {
        id: contactData.id,
        number: contactData.number,
        name: contactData.name,
        email: contactData.email
      };
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  },

  async sendMessage({ contactId, message }: { 
    contactId: string, 
    message: string 
  }): Promise<void> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second between retries

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Attempting to send message to contact ID: ${contactId} - Attempt ${attempt}`);

        const response = await fetch(`${MANYCHAT_API_URL}/contact/${contactId}/messages`, {
          method: 'POST',
          headers: {
            'apikey': MANYCHAT_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            message: message,
            type: 'outgoing'
          }),
          signal: AbortSignal.timeout(10000) // 10 seconds timeout
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Message send error details:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            url: `${MANYCHAT_API_URL}/contact/${contactId}/messages`
          });

          // Check if it's a retriable error
          if (response.status === 504 || response.status === 503) {
            if (attempt < MAX_RETRIES) {
              console.log(`Retrying in ${RETRY_DELAY}ms due to ${response.status} error`);
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
              continue;
            }
          }

          throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        console.log('Message sent successfully:', responseData);
        return;
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);

        // If it's the last attempt, throw the error
        if (attempt === MAX_RETRIES) {
          console.error('All retry attempts failed');
          
          if (error instanceof Error) {
            throw new Error(`Failed to send message after ${MAX_RETRIES} attempts: ${error.message}`);
          }
          
          throw error;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }

    throw new Error('Unexpected error in message sending');
  },

  async sendManyChatMessage({ contactId, message }: { 
    contactId: string, 
    message: string 
  }): Promise<void> {
    try {
      // Get contact details to get the phone number
      const contact = await this.getContactDetails(contactId);
      
      if (!contact.number) {
        throw new Error('No phone number found for contact');
      }

      const response = await fetch(`${MANYCHAT_API_URL}/message/text`, {
        method: 'POST',
        headers: {
          'apikey': MANYCHAT_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: contact.number.replace('+', ''), // Remove + from phone number
          text: message
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(`ManyChat API error: ${result.error}`);
      }

      return;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async searchContactByPhone(phoneNumber: string): Promise<Contact | null> {
    try {
      const number = phoneNumber.replace('+', ''); // Remove + from phone number
      const response = await fetch(`${MANYCHAT_API_URL}/contact/phone/${number}`, {
        headers: {
          'apikey': MANYCHAT_API_KEY
        }
      });
      
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to search contact: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching contact by phone:', error);
      throw error;
    }
  },

  async syncLeads(): Promise<{
    success: boolean;
    message: string;
    count: number;
    leads: any[];
  }> {
    try {
      console.log('Starting ManyChat sync process');
      
      // Fetch all contacts from ManyChat
      const contacts = await manychatApi.getAllContacts();
      console.log(`Fetched ${contacts.length} contacts`);

      // Reference to leads collection
      const leadsRef = collection(db, 'leads');

      // Batch update leads
      const syncPromises = contacts.map(async (contact) => {
        const leadRef = doc(leadsRef, contact.id);
        
        const leadData = {
          manyChatId: contact.id,
          name: contact.name,
          number: contact.number,
          email: contact.email,
          tags: contact.tags || [],
          customFields: contact.customFields || {},
          lastSync: Timestamp.now(),
          status: 'new', // Default status
          hidden: false,
          convertedToCustomer: false
        };

        // Use setDoc with merge to update existing documents
        await setDoc(leadRef, leadData, { merge: true });
        return leadData;
      });

      // Wait for all leads to be synced
      const leads = await Promise.all(syncPromises);

      console.log('ManyChat sync completed successfully');
      
      return {
        success: true,
        message: `Synced ${contacts.length} leads`,
        count: contacts.length,
        leads: leads // Return the synced leads
      };
    } catch (error) {
      console.error('Error during ManyChat sync:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown sync error',
        leads: [], // Return empty array to prevent undefined errors
        count: 0
      };
    }
  }
};
