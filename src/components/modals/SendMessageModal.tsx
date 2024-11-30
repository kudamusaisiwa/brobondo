import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Lead } from '../../store/leadStore';
import { manychatApi } from '../../services/manychat';
import { Toaster, toast } from 'react-hot-toast';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ isOpen, onClose, lead }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setIsSending(true);
      
      // Call ManyChat API to send message
      await manychatApi.sendManyChatMessage({
        contactId: lead.manyChatId,
        message: message.trim()
      });

      toast.success('Message sent successfully');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('No phone number')) {
          toast.error('Unable to send message: No phone number found for this lead');
        } else if (error.message.includes('Failed to retrieve contact')) {
          toast.error('Unable to retrieve lead contact information');
        } else {
          toast.error(`Failed to send message: ${error.message}`);
        }
      } else {
        toast.error('An unexpected error occurred while sending the message');
      }
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          success: {
            style: {
              background: '#4CAF50',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#F44336',
              color: 'white',
            },
          },
        }} 
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Send Message to {lead.name}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6">
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write a message to ${lead.name}`}
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSendMessage}
                disabled={isSending}
                className={`flex items-center justify-center px-4 py-2 rounded-lg 
                  ${isSending 
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
              >
                {isSending ? 'Sending...' : 'Send Message'}
                <Send className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SendMessageModal;
