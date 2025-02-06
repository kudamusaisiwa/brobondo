import axios from 'axios';

const MANYCONTACT_API_URL = import.meta.env.VITE_MANYCONTACT_API_URL || 'https://api.manycontacts.com/v1';
const MANYCONTACT_API_KEY = import.meta.env.VITE_MANYCONTACT_API_KEY;
const MANYCONTACT_WHATSAPP_NUMBER = import.meta.env.VITE_MANYCONTACT_WHATSAPP_NUMBER;

if (!MANYCONTACT_API_KEY) {
  console.error('ManyContact API key is missing');
}

if (!MANYCONTACT_WHATSAPP_NUMBER) {
  console.error('ManyContact WhatsApp number is missing');
}

interface SendMessageParams {
  number: string;
  text: string;
  file?: Blob;
}

interface CreateContactParams {
  number: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tags?: string[];
}

interface Contact {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tags?: string[];
}

class ManyContactApi {
  private baseURL: string;
  private apiKey: string;
  private whatsappNumber: string;

  constructor() {
    this.baseURL = MANYCONTACT_API_URL;
    this.apiKey = MANYCONTACT_API_KEY;
    this.whatsappNumber = MANYCONTACT_WHATSAPP_NUMBER;

    console.log('ManyContactApi initialized:', {
      baseURL: this.baseURL,
      hasApiKey: !!this.apiKey,
      whatsappNumber: this.whatsappNumber
    });
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    try {
      console.log('Converting blob to base64:', { size: blob.size, type: blob.type });
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
            const base64 = reader.result.split(',')[1];
            console.log('Blob converted to base64:', { 
              resultLength: base64.length,
              sample: base64.substring(0, 50) + '...'
            });
            resolve(base64);
          } else {
            reject(new Error('Failed to convert blob to base64'));
          }
        };
        reader.onerror = (error) => {
          console.error('Error reading blob:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error in blobToBase64:', error);
      throw error;
    }
  }

  /**
   * Send a WhatsApp message to a specific number
   * @param {SendMessageParams} params Message parameters including number, text, and optional file
   * @returns {Promise<void>}
   */
  async sendMessage({ number, text, file }: SendMessageParams) {
    try {
      console.log('sendMessage called with:', { 
        number, 
        textLength: text.length,
        hasFile: !!file,
        fileDetails: file ? { size: file.size, type: file.type } : null
      });

      if (!this.apiKey) {
        throw new Error('ManyContact API key is missing');
      }

      if (!this.whatsappNumber) {
        throw new Error('ManyContact WhatsApp number is missing');
      }

      // Format the phone number - ensure it starts with country code
      const formattedNumber = number.replace(/\D/g, ''); // Remove all non-digits
      if (!formattedNumber) {
        throw new Error('Invalid phone number');
      }

      // Validate country code (accepting multiple countries)
      const validCountryCodes = ['27', '263']; // South Africa and Zimbabwe
      const hasValidCountryCode = validCountryCodes.some(code => formattedNumber.startsWith(code));
      if (!hasValidCountryCode) {
        throw new Error(`Phone number must start with a valid country code (${validCountryCodes.join(' or ')})`);
      }

      // Clean the WhatsApp number
      const cleanWhatsAppNumber = this.whatsappNumber.replace(/\D/g, '');

      // If there's a file, send it using FormData through /message/text endpoint
      if (file) {
        console.log('Preparing to send message with file attachment...');
        
        const formData = new FormData();
        formData.append('number', formattedNumber);
        formData.append('text', text);
        formData.append('from', cleanWhatsAppNumber);
        formData.append('file', file, 'invoice.pdf');
        formData.append('type', 'document');
        formData.append('mime_type', file.type || 'application/pdf');

        console.log('FormData entries:');
        for (const [key, value] of formData.entries()) {
          console.log(`${key}:`, value instanceof Blob ? 
            `Blob(${value.type}, ${value.size} bytes)` : 
            value
          );
        }

        const response = await fetch(`${this.baseURL}/message/text`, {
          method: 'POST',
          headers: {
            'apikey': this.apiKey
          },
          body: formData
        });

        // Try to get the error response as text first
        let errorText = '';
        if (!response.ok) {
          try {
            errorText = await response.text();
            console.error('Raw error response:', errorText);
          } catch (e) {
            console.error('Could not read error response text:', e);
          }
        }

        console.log('Response received:', { 
          status: response.status, 
          statusText: response.statusText,
          ok: response.ok,
          errorText: errorText || 'No error text available'
        });

        if (!response.ok) {
          let errorMessage = `Failed to send message: ${response.status}`;
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage += ` - ${errorData?.message || errorData?.error || errorText}`;
            } catch (e) {
              errorMessage += ` - ${errorText}`;
            }
          }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log('Message with file sent successfully:', responseData);
        return responseData;
      }

      // If no file, send as regular text message
      console.log('Sending text-only message...');
      const response = await fetch(`${this.baseURL}/message/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        },
        body: JSON.stringify({
          number: formattedNumber,
          text,
          from: cleanWhatsAppNumber
        })
      });

      console.log('Text message response received:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('ManyContact API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to send message: ${response.status} ${errorData?.message || errorData?.error || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Text message sent successfully:', responseData);
      return responseData;
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Create a new contact in ManyContact
   * @param {CreateContactParams} params Contact parameters including number, firstName, lastName, email, and tags
   * @returns {Promise<Contact>}
   */
  async createContact({ number, firstName, lastName, email, tags }: CreateContactParams) {
    try {
      console.log('createContact called with:', { 
        number, 
        firstName, 
        lastName, 
        email, 
        tags
      });

      const response = await fetch(`${this.baseURL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          phone: number,
          firstName,
          lastName,
          email,
          tags
        })
      });

      console.log('Response received:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('ManyContact API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to create contact: ${response.status} ${errorData?.message || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Contact created successfully:', responseData);
      return responseData;
    } catch (error: any) {
      console.error('Error creating contact:', {
        error: error.message,
        stack: error.stack,
        params: {
          number,
          firstName,
          lastName,
          email,
          tags
        }
      });
      throw error;
    }
  }

  /**
   * Get a contact by phone number
   * @param {string} number Phone number of the contact
   * @returns {Promise<Contact | null>}
   */
  async getContact(number: string): Promise<Contact | null> {
    try {
      console.log('getContact called with:', { number });

      const response = await fetch(`${this.baseURL}/contacts/phone/${number}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      console.log('Response received:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Contact not found:', number);
          return null;
        }
        const errorData = await response.json().catch(() => null);
        console.error('ManyContact API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to get contact: ${response.status} ${errorData?.message || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Contact retrieved successfully:', responseData);
      return responseData;
    } catch (error: any) {
      console.error('Error getting contact:', {
        error: error.message,
        stack: error.stack,
        params: {
          number
        }
      });
      throw error;
    }
  }

  /**
   * Add a tag to a contact
   * @param {string} contactId ID of the contact
   * @param {string} tag Tag to add
   * @returns {Promise<void>}
   */
  async addTag(contactId: string, tag: string) {
    try {
      console.log('addTag called with:', { contactId, tag });

      const response = await fetch(`${this.baseURL}/contacts/${contactId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          tag
        })
      });

      console.log('Response received:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('ManyContact API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to add tag: ${response.status} ${errorData?.message || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Tag added successfully:', responseData);
      return responseData;
    } catch (error: any) {
      console.error('Error adding tag:', {
        error: error.message,
        stack: error.stack,
        params: {
          contactId,
          tag
        }
      });
      throw error;
    }
  }

  /**
   * Remove a tag from a contact
   * @param {string} contactId ID of the contact
   * @param {string} tag Tag to remove
   * @returns {Promise<void>}
   */
  async removeTag(contactId: string, tag: string) {
    try {
      console.log('removeTag called with:', { contactId, tag });

      const response = await fetch(`${this.baseURL}/contacts/${contactId}/tags/${tag}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      console.log('Response received:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('ManyContact API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to remove tag: ${response.status} ${errorData?.message || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Tag removed successfully:', responseData);
      return responseData;
    } catch (error: any) {
      console.error('Error removing tag:', {
        error: error.message,
        stack: error.stack,
        params: {
          contactId,
          tag
        }
      });
      throw error;
    }
  }
}

/**
 * ManyContact API service for WhatsApp business communication
 */
export const manyContactApi = new ManyContactApi();
