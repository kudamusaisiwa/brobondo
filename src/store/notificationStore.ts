import { create } from 'zustand';
import { playPositiveSound, playNegativeSound } from '../utils/audio';

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  type: 'status' | 'payment' | 'customer' | 'order' | 'error' | 'info' | 'mention';
  read: boolean;
  link?: string;
  metadata?: {
    messageId?: string;
    userId?: string;
    userName?: string;
    mentionedBy?: string;
  };
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  initialize: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  addNotification: (notification) => {
    // Play appropriate sound based on notification type
    if (notification.type === 'error') {
      playNegativeSound();
    } else if (notification.type === 'mention') {
      playPositiveSound();
    } else {
      playPositiveSound();
    }

    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          read: false,
        },
        ...state.notifications.slice(0, 19), // Keep only last 20 notifications
      ],
    }));
  },
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  })),
  clearNotifications: () => set({ notifications: [] }),
  permission: 'default',

  initialize: async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }
    
    const permission = await Notification.permission;
    set({ permission });
  },

  requestPermission: async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      set({ permission });
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  },

  sendNotification: (title: string, options?: NotificationOptions) => {
    const { permission } = get();

    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  },
}));