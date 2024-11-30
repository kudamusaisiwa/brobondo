import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { manychatApi } from '../../services/manychat';
import { Lead } from '../../types';
import Spinner from '../ui/Spinner';

interface LeadMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

const LeadMessagesModal: React.FC<LeadMessagesModalProps> = ({ 
  isOpen, 
  onClose, 
  lead 
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!isOpen || !lead.manyChatId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Log the attempt to fetch messages
        console.log('Attempting to fetch messages for lead:', {
          leadId: lead.id,
          manyChatId: lead.manyChatId,
          phoneNumber: lead.phoneNumber
        });

        const fetchedMessages = await manychatApi.getContactMessages(lead.manyChatId);
        
        // Log successful message retrieval
        console.log('Messages retrieved successfully:', fetchedMessages.length);
        
        setMessages(fetchedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        
        // More detailed error handling
        setError(
          err instanceof Error 
            ? `Failed to fetch messages: ${err.message}. 
               This could be due to API limitations, invalid contact ID, 
               or the contact not having any messages.
               Please check the contact's details in ManyContacts.` 
            : 'Failed to fetch messages'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [isOpen, lead.manyChatId]);

  if (!isOpen) return null;

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="mr-2 h-6 w-6" />
            Messages for {lead.name}
          </h2>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center p-4">
              {error}
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="text-gray-500 text-center p-4">
              No messages found for this lead.
            </div>
          )}

          {!loading && messages.length > 0 && (
            <div className="max-h-[500px] overflow-y-auto">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-3 my-2 rounded-lg ${
                    message.direction === 'incoming' 
                      ? 'bg-blue-100 text-blue-800 self-start' 
                      : 'bg-green-100 text-green-800 self-end text-right'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <small className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadMessagesModal;
