import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Customer } from '../../types';
import { manyContactApi } from '../../services/manycontact';
import { Toaster, toast } from 'react-hot-toast';
import { useCustomerStore } from '../../store/customerStore';
import { useAuthStore } from '../../store/authStore';
import { useActivityStore } from '../../store/activityStore';

interface SendCustomerMessageModalProps {
  isOpen?: boolean;
  onClose: () => void;
  customer: Customer;
  messageTemplate?: string;
  onMessageSent?: () => void;
  onMessageSending?: (sending: boolean) => void;
}

const SendCustomerMessageModal: React.FC<SendCustomerMessageModalProps> = ({ 
  isOpen = true, 
  onClose, 
  customer,
  messageTemplate,
  onMessageSent,
  onMessageSending
}) => {
  const [message, setMessage] = useState(messageTemplate || '');
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuthStore();
  const { logActivity } = useActivityStore();

  const handleSendMessage = async () => {
    console.log('Starting send message process...');
    
    if (!message.trim()) {
      console.log('Message is empty');
      toast.error('Please enter a message');
      return;
    }

    if (!customer.phone) {
      console.log('No phone number available');
      toast.error('No phone number available for this customer. Please add a phone number first.');
      return;
    }

    if (!user) {
      console.log('No user found');
      toast.error('You must be logged in to send messages');
      return;
    }

    try {
      setIsSending(true);
      onMessageSending?.(true);
      console.log('Setting isSending to true');
      
      // Format phone number - remove all non-digits
      const phone = customer.phone.replace(/\D/g, '');
      console.log('Formatted phone:', phone);
      
      if (!phone) {
        console.log('Invalid phone number format');
        throw new Error('Invalid phone number format');
      }

      // Check environment variables
      if (!import.meta.env.VITE_MANYCONTACT_API_KEY) {
        console.error('ManyContact API key is missing');
        throw new Error('ManyContact API key is not configured');
      }

      if (!import.meta.env.VITE_MANYCONTACT_WHATSAPP_NUMBER) {
        console.error('ManyContact WhatsApp number is missing');
        throw new Error('ManyContact WhatsApp number is not configured');
      }

      // Send message through ManyContact
      await manyContactApi.sendMessage({
        number: phone,
        text: message.trim()
      });

      // Log message sent activity
      await logActivity({
        type: 'message_sent',
        message: `Sent message to ${customer.firstName} ${customer.lastName}`,
        userId: user.id,
        userName: user.name || user.email || 'Unknown User',
        entityId: customer.id,
        entityType: 'customer',
        metadata: {
          messageContent: message.trim(),
          customerPhone: phone
        }
      });

      console.log('Message sent successfully');
      toast.success('Message sent successfully');
      onMessageSent?.();
      onClose();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
      onMessageSending?.(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Send Message to {customer.firstName} {customer.lastName}
            </h3>
            <div className="mt-2">
              <textarea
                rows={4}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendMessage}
              className="btn-primary flex items-center"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendCustomerMessageModal;
