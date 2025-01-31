import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Lead, Customer } from '../../types';
import { manyContactApi } from '../../services/manycontact';
import { Toaster, toast } from 'react-hot-toast';
import { useActivityStore } from '../../store/activityStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useNavigate } from 'react-router-dom';

interface SendMessageModalProps {
  isOpen?: boolean;
  onClose: () => void;
  recipient: Lead | Customer;
  messageTemplate?: string;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ 
  isOpen = true, 
  onClose, 
  recipient,
  messageTemplate 
}) => {
  const [message, setMessage] = useState(messageTemplate || '');
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuthStore();
  const { logActivity } = useActivityStore();

  // Helper to determine if recipient is a Lead
  const isLead = (recipient: Lead | Customer): recipient is Lead => {
    // Check if it's a customer by looking for customer-specific fields
    const isCustomer = 'firstName' in recipient && 'lastName' in recipient;
    console.log('Is recipient a customer?', isCustomer);
    return !isCustomer;
  };

  // Get recipient name based on type
  const getRecipientName = () => {
    if (isLead(recipient)) {
      return recipient.name;
    }
    return `${recipient.firstName} ${recipient.lastName}`.trim();
  };

  // Get recipient phone based on type
  const getRecipientPhone = () => {
    console.log('Full recipient data:', JSON.stringify(recipient, null, 2));
    if (isLead(recipient)) {
      console.log('Recipient is a lead, using number field:', recipient.number);
      return recipient.number;
    }
    // For customers, use the phone field
    console.log('Recipient is a customer, using phone field:', recipient.phone);
    return recipient.phone;
  };

  const handleSendMessage = async () => {
    console.log('Starting send message process...');
    
    if (!message.trim()) {
      console.log('Message is empty');
      toast.error('Please enter a message');
      return;
    }

    const phone = getRecipientPhone();
    console.log('Got recipient phone:', phone);
    
    if (!phone) {
      console.log('No phone number available');
      toast.error(`No phone number available for ${isLead(recipient) ? 'this lead' : 'this customer'}. Please add a phone number first.`);
      return;
    }

    if (!user) {
      console.log('No user found');
      toast.error('You must be logged in to send messages');
      return;
    }

    try {
      setIsSending(true);
      console.log('Setting isSending to true');
      
      // Format phone number - remove all non-digits
      const formattedPhone = phone.replace(/\D/g, '');
      console.log('Formatted phone:', formattedPhone);
      
      if (!formattedPhone) {
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

      console.log('Sending WhatsApp message:', { 
        baseURL: import.meta.env.VITE_MANYCONTACT_API_URL,
        number: formattedPhone,
        text: message.trim(),
        fromNumber: import.meta.env.VITE_MANYCONTACT_WHATSAPP_NUMBER
      });

      // Send message through ManyContact
      const response = await manyContactApi.sendMessage({
        number: formattedPhone,
        text: message.trim()
      });

      console.log('ManyContact API response:', response);

      // Log message sent activity
      await logActivity({
        type: 'message_sent',
        message: `Sent message to ${getRecipientName()}`,
        userId: user.id,
        userName: user.name || user.email || 'Unknown User',
        entityId: recipient.id,
        entityType: isLead(recipient) ? 'lead' : 'customer',
        metadata: {
          messageContent: message.trim(),
          recipientPhone: formattedPhone
        }
      });

      console.log('Activity logged successfully');
      toast.success('Message sent successfully');
      setMessage('');
      onClose();
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      console.error('Error stack:', error.stack);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      console.log('Setting isSending to false');
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Send Message to {getRecipientName()}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-32 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
        </div>
        
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('Send button clicked');
              handleSendMessage();
            }}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSending}
          >
            {isSending ? (
              <>
                <span className="mr-2">Sending...</span>
                <Send className="h-4 w-4 animate-pulse" />
              </>
            ) : (
              <>
                <span className="mr-2">Send Message</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;
