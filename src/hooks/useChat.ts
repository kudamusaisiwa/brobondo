import { useState, useEffect } from 'react';
import { ref, onValue, update, get, set, serverTimestamp } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import type { Message } from '../types/chat';

export function useChat() {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!user?.uid) return;

    const initializeChat = async () => {
      try {
        // Initialize messages node if it doesn't exist
        const messagesRef = ref(rtdb, 'messages');
        const snapshot = await get(messagesRef);
        
        if (!snapshot.exists()) {
          await set(messagesRef, {
            _initialized: {
              timestamp: Date.now(),
              message: 'Chat initialized'
            }
          });
        }

        // Set user presence
        const userPresenceRef = ref(rtdb, `presence/${user.uid}`);
        await set(userPresenceRef, {
          status: 'online',
          lastOnline: serverTimestamp()
        });

        // Subscribe to messages
        const unsubscribe = onValue(messagesRef, 
          (snapshot) => {
            try {
              const data = snapshot.val();
              if (!data) {
                setMessages([]);
                return;
              }

              const messageList = Object.entries(data)
                .filter(([key]) => key !== '_initialized')
                .map(([id, message]: [string, any]) => ({
                  id,
                  text: message.text || '',
                  userId: message.userId || '',
                  userName: message.userName || '',
                  timestamp: message.timestamp || Date.now(),
                  mentions: message.mentions || {},
                  reactions: message.reactions || {},
                  attachment: message.attachment || undefined
                }))
                .sort((a, b) => {
                  const aTime = a.timestamp || Date.now();
                  const bTime = b.timestamp || Date.now();
                  return aTime - bTime;
                });
              
              // Get previous messages for comparison
              const prevMessages = new Set(messages.map(m => m.id));
              
              // Find new messages
              const newMessages = messageList.filter(msg => !prevMessages.has(msg.id));
              
              setMessages(messageList);

              // Check all new messages for mentions
              if (user) {
                newMessages.forEach(message => {
                  if (message.userId !== user.uid && message.mentions && message.mentions[user.uid]) {
                    addNotification({
                      message: `${message.userName} mentioned you: "${message.text}"`,
                      type: 'mention',
                      metadata: {
                        messageId: message.id,
                        userId: message.userId,
                        userName: message.userName,
                        mentionedBy: message.userName
                      }
                    });
                  }
                });
              }
            } catch (error) {
              console.error('Error processing messages:', error);
              setMessages([]);
            } finally {
              setIsLoading(false);
            }
          },
          (error) => {
            console.error('Error fetching messages:', error);
            setIsLoading(false);
            setMessages([]);
          }
        );

        // Set offline status on disconnect
        const onDisconnectRef = ref(rtdb, `presence/${user.uid}`);
        await update(onDisconnectRef, {
          status: 'offline',
          lastOnline: serverTimestamp()
        });

        return () => {
          unsubscribe();
          // Update status to offline on cleanup
          if (user?.uid) {
            const userRef = ref(rtdb, `presence/${user.uid}`);
            set(userRef, {
              status: 'offline',
              lastOnline: serverTimestamp()
            }).catch(error => {
              console.error('Error updating offline status:', error);
            });
          }
        };
      } catch (error) {
        console.error('Error initializing chat:', error);
        setIsLoading(false);
        setMessages([]);
        return () => {};
      }
    };

    initializeChat();
  }, [user, addNotification]);

  const handleEdit = async (messageId: string, newText: string) => {
    try {
      const messageRef = ref(rtdb, `messages/${messageId}`);
      await update(messageRef, {
        text: newText,
        editedAt: Date.now()
      });
      setToastMessage('Message updated successfully');
      setToastType('success');
    } catch (error) {
      console.error('Error updating message:', error);
      setToastMessage('Failed to update message');
      setToastType('error');
    } finally {
      setShowToast(true);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user?.uid) return;

    try {
      const messageRef = ref(rtdb, `messages/${messageId}/reactions/${emoji}`);
      const snapshot = await get(messageRef);
      let currentReactions = [];
      
      // Ensure reactions are in array format
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (Array.isArray(val)) {
          currentReactions = val;
        } else if (typeof val === 'string') {
          currentReactions = [val];
        }
      }
      
      // Toggle reaction
      const userIndex = currentReactions.indexOf(user.uid);
      if (userIndex === -1) {
        // Add reaction
        await set(messageRef, [...currentReactions, user.uid]);
        setToastMessage('Reaction added');
        setToastType('success');
      } else {
        // Remove reaction
        currentReactions.splice(userIndex, 1);
        if (currentReactions.length === 0) {
          // Remove the emoji key if no reactions left
          await set(messageRef, null);
        } else {
          await set(messageRef, currentReactions);
        }
        setToastMessage('Reaction removed');
        setToastType('success');
      }
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating reaction:', error);
      setToastMessage('Failed to update reaction');
      setToastType('error');
      setShowToast(true);
    }
  };

  return {
    messages,
    isLoading,
    handleEdit,
    handleReaction,
    showToast,
    toastMessage,
    toastType,
    setShowToast
  };
}