import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useMessageStore } from '../../store/messageStore';

interface MessageBadgeProps {
  contactId: string;
  onClick?: () => void;
}

export const MessageBadge: React.FC<MessageBadgeProps> = ({ contactId, onClick }) => {
  const { unreadCount } = useMessageStore();
  const count = unreadCount[contactId] || 0;

  return (
    <button 
      onClick={onClick}
      className="relative inline-flex items-center p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <MessageCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};
