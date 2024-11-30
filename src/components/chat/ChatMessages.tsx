import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import type { Message } from '../../types/chat';

interface ChatMessagesProps {
  messages: Message[];
  onEdit: (messageId: string, newText: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export default function ChatMessages({ messages, onEdit, onReact }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-500 dark:text-gray-400">
          No messages yet. Start a conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-24">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onEdit={onEdit}
          onReact={onReact}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}