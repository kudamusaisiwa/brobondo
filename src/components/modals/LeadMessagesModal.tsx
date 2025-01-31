import React from 'react';
import { X } from 'lucide-react';
import { Lead } from '../../types';
import { MessageHistory } from '../messages/MessageHistory';
import { MessageBadge } from '../messages/MessageBadge';
import { MessageComposer } from '../messages/MessageComposer';
import { useMessageStore } from '../../store/messageStore';

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
  // Initialize message store if needed
  React.useEffect(() => {
    if (isOpen && lead.manyContactId) {
      useMessageStore.getState().initialize();
    }
  }, [isOpen, lead.manyContactId]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center p-4`}>
      <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Chat with {lead.name}</h2>
            {lead.manyContactId && <MessageBadge contactId={lead.manyContactId} />}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {lead.manyContactId ? (
            <>
              <MessageHistory 
                contactId={lead.manyContactId} 
                contactName={lead.name} 
              />
              <MessageComposer 
                contactId={lead.manyContactId}
                disabled={!lead.manyContactId} 
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No ManyContact ID found for this lead. They may not have messaged through ManyContact yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadMessagesModal;
