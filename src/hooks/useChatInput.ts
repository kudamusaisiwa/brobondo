import { useState, useEffect, useRef } from 'react';
import { ref, push, serverTimestamp } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import type { Message } from '../types/chat';
import type { User } from '../types';

export function useChatInput() {
  const { user } = useAuthStore();
  const { users } = useUserStore();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<Message['attachment'] | null>(null);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);
  const [mentions, setMentions] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    inputRef.current = e.target;

    // Handle @ mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const matches = textBeforeCursor.match(/@(\w*)$/);

    if (matches) {
      const rect = e.target.getBoundingClientRect();
      setMentionSearch(matches[1]);
      setMentionPosition({
        top: rect.top,
        left: rect.left + 40 // Align with paperclip button
      });
    } else {
      setMentionSearch('');
      setMentionPosition(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMentionSelect = (selectedUser: User) => {
    if (!inputRef.current) return;

    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeMention = newMessage.slice(0, cursorPosition).replace(/@\w*$/, '');
    const textAfterMention = newMessage.slice(cursorPosition);
    
    setNewMessage(`${textBeforeMention}@${selectedUser.name} ${textAfterMention}`);
    setMentions(prev => ({
      ...prev,
      [selectedUser.id]: selectedUser.name
    }));
    
    setMentionSearch('');
    setMentionPosition(null);

    // Focus back on input after selection
    inputRef.current.focus();
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || !user || isSending) return;

    setIsSending(true);
    try {
      const messageData = {
        text: newMessage.trim(),
        userId: user.id,
        userName: user.name,
        timestamp: serverTimestamp(),
        mentions,
        ...(attachment && { attachment })
      };

      const messagesRef = ref(rtdb, 'messages');
      await push(messagesRef, messageData);

      setNewMessage('');
      setAttachment(null);
      setMentions({});
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachmentSelect = (selected: Message['attachment']) => {
    setAttachment(selected);
  };

  return {
    newMessage,
    isSending,
    attachment,
    mentionSearch,
    mentionPosition,
    handleInputChange,
    handleKeyPress,
    handleSendMessage,
    handleAttachmentSelect,
    handleMentionSelect,
    setAttachment,
    inputRef
  };
}