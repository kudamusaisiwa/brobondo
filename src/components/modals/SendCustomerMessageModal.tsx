import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Customer } from '../../types';
import { manychatApi } from '../../services/manychat';
import { Toaster, toast } from 'react-hot-toast';
import { useCustomerStore } from '../../store/customerStore';
import { useAuthStore } from '../../store/authStore';
import { useActivityStore } from '../../store/activityStore';

interface SendCustomerMessageModalProps {
  isOpen?: boolean;
  onClose: () => void;
  customer: Customer;
  messageTemplate?: string;
}

const SendCustomerMessageModal: React.FC<SendCustomerMessageModalProps> = ({ 
  isOpen = true, 
  onClose, 
  customer,
  messageTemplate 
}) => {
  const [message, setMessage] = useState(messageTemplate || '');
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuthStore();
  const { logActivity } = useActivityStore();

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!customer.phone) {
      toast.error('No phone number available for this customer');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to send messages');
      return;
    }

    try {
      setIsSending(true);
      
      let contactId = customer.manyChatId;

      // If no ManyChat ID exists, create a new contact
      if (!contactId) {
        const contact = await manychatApi.createContact({
          name: `${customer.firstName} ${customer.lastName}`.trim(),
          number: customer.phone
        });
        contactId = contact.id;

        // Update customer with new ManyChat ID
        await useCustomerStore.getState().updateCustomer(customer.id, {
          manyChatId: contactId
        });

        // Log contact creation
        await logActivity({
          type: 'contact_created',
          message: `Created ManyChat contact for ${customer.firstName} ${customer.lastName}`,
          userId: user.id,
          userName: user.name || user.email || 'Unknown User',
          entityId: customer.id,
          entityType: 'customer',
          metadata: {
            manyChatId: contactId,
            customerPhone: customer.phone
          }
        });
      }

      // Send message through ManyChat
      await manychatApi.sendManyChatMessage({
        contactId,
        message: message.trim()
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
          manyChatId: contactId,
          customerPhone: customer.phone
        }
      });

      toast.success('Message sent successfully');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('No phone number')) {
          toast.error('Unable to send message: No phone number found');
        } else if (error.message.includes('404')) {
          toast.error('Unable to send message: Contact not found');
        } else {
          toast.error(`Failed to send message: ${error.message}`);
        }
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Send Message to {customer.firstName} {customer.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-40 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isSending}
          />
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end">
          <button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim()}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isSending || !message.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            <Send size={16} />
            <span>{isSending ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default SendCustomerMessageModal;
