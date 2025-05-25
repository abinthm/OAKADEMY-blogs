import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      
      addNotification: (type, message) => set((state) => ({
        notifications: [
          {
            id: Date.now().toString(),
            type,
            message,
            read: false,
            createdAt: new Date().toISOString(),
          },
          ...state.notifications,
        ],
      })),
      
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        ),
      })),
      
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification.id !== id
        ),
      })),
      
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'notification-store',
    }
  )
); 