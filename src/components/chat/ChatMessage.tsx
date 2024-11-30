import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { Message } from '../../types/chat';
import ChatContextMenu from './ChatContextMenu';
import MessageText from './MessageText';
import EmojiPicker from './EmojiPicker';

interface ChatMessageProps {
  message: Message;
  onEdit: (messageId: string, text: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export default function ChatMessage({ message, onEdit, onReact }: ChatMessageProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();
  const isCurrentUser = user?.id === message.userId;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCurrentUser) return;
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleTouchStart = () => {
    if (!isCurrentUser) return;
    
    const timeout = setTimeout(() => {
      const element = document.elementFromPoint(0, 0);
      if (element) {
        const rect = element.getBoundingClientRect();
        setContextMenu({
          x: rect.left,
          y: rect.top
        });
      }
    }, 500);

    setTouchTimeout(timeout);
  };

  const handleTouchEnd = () => {
    if (touchTimeout) {
      clearTimeout(touchTimeout);
      setTouchTimeout(null);
    }
  };

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <div 
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 relative group`}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className={`max-w-[70%] ${
        isCurrentUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
      } rounded-lg px-4 py-2 relative`}>
        <div className="text-sm font-medium mb-1">
          {message.userName}
        </div>
        <MessageText text={message.text} mentions={message.mentions} />
        {message.attachment && (
          <Link
            to={`/${message.attachment.type}s/${message.attachment.id}`}
            className={`mt-2 block p-3 rounded ${
              isCurrentUser 
                ? 'bg-blue-500 hover:bg-blue-400' 
                : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500'
            }`}
          >
            <div className="font-medium">{message.attachment.title}</div>
            {message.attachment.subtitle && (
              <div className="text-sm opacity-75">{message.attachment.subtitle}</div>
            )}
            {message.attachment.amount && (
              <div className="text-sm font-medium mt-1">
                ${message.attachment.amount.toLocaleString()}
              </div>
            )}
          </Link>
        )}
        <div className="text-xs opacity-75 mt-1">
          {new Date(message.timestamp).toLocaleString()}
        </div>

        {/* Reactions */}
        {message.reactions && Object.entries(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => onReact?.(message.id, emoji)}
                className={`px-2 py-1 rounded-full text-xs ${
                  users.includes(user?.id || '') 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                } hover:opacity-80`}
              >
                <span>{emoji}</span>
                <span className="ml-1">{users.length}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* Add Reaction Button */}
        <div 
          className={`absolute ${isCurrentUser ? 'right-full mr-1' : 'left-full ml-1'} top-0`}
          onMouseLeave={() => setShowEmojiPicker(false)}
        >
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="text-gray-500 dark:text-gray-400">😀</span>
          </button>
          {showEmojiPicker && (
            <div className={`absolute ${isCurrentUser ? 'right-full' : 'left-full'} mr-1 top-0`}>
              <EmojiPicker
                onSelect={(emoji) => {
                  onReact?.(message.id, emoji);
                  setShowEmojiPicker(false);
                }}
                onClose={() => setShowEmojiPicker(false)}
                isCurrentUser={isCurrentUser}
              />
            </div>
          )}
        </div>
      </div>

      {contextMenu && (
        <ChatContextMenu
          position={contextMenu}
          onEdit={() => onEdit(message.id, message.text)}
          onDelete={() => {/* Implement delete functionality */}}
          onClose={() => setContextMenu(null)}
          isOwnMessage={isCurrentUser}
        />
      )}
    </div>
  );
}