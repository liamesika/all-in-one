import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType =
  | 'project_update'
  | 'task_assigned'
  | 'task_completed'
  | 'file_uploaded'
  | 'comment_added'
  | 'mention'
  | 'lead_created'
  | 'property_inquiry'
  | 'campaign_alert'
  | 'system'
  | 'warning'
  | 'error';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export type NotificationVertical = 'productions' | 'real-estate' | 'ecommerce' | 'law' | 'platform';

export interface Notification {
  id: string;
  type: NotificationType;
  vertical: NotificationVertical;
  priority: NotificationPriority;
  title: string;
  message: string;
  link?: string; // Deep link to related resource
  metadata?: Record<string, any>; // Additional context
  read: boolean;
  archived: boolean;
  createdAt: string;
  expiresAt?: string; // Optional expiration
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  filter: NotificationVertical | 'all';

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'archived' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  setOpen: (isOpen: boolean) => void;
  setFilter: (filter: NotificationVertical | 'all') => void;

  // Computed
  getFilteredNotifications: () => Notification[];
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isOpen: false,
      filter: 'all',

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          read: false,
          archived: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));

        // Auto-expire notifications if expiration is set
        if (notification.expiresAt) {
          const expiresIn = new Date(notification.expiresAt).getTime() - Date.now();
          if (expiresIn > 0) {
            setTimeout(() => {
              get().deleteNotification(newNotification.id);
            }, expiresIn);
          }
        }
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
          unreadCount: 0,
        }));
      },

      archiveNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;

          return {
            notifications: state.notifications.map((notif) =>
              notif.id === id ? { ...notif, archived: true, read: true } : notif
            ),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      },

      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;

          return {
            notifications: state.notifications.filter((notif) => notif.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      setOpen: (isOpen) => {
        set({ isOpen });
      },

      setFilter: (filter) => {
        set({ filter });
      },

      getFilteredNotifications: () => {
        const { notifications, filter } = get();

        // Filter out archived notifications
        const activeNotifications = notifications.filter((n) => !n.archived);

        if (filter === 'all') {
          return activeNotifications;
        }

        return activeNotifications.filter((n) => n.vertical === filter);
      },

      getUnreadCount: () => {
        const { notifications } = get();
        return notifications.filter((n) => !n.read && !n.archived).length;
      },
    }),
    {
      name: 'effinity-notifications',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 100), // Keep only last 100 notifications
        filter: state.filter,
      }),
    }
  )
);

// Helper function to create notifications from various sources
export const createNotification = {
  projectUpdate: (projectName: string, link: string): Omit<Notification, 'id' | 'read' | 'archived' | 'createdAt'> => ({
    type: 'project_update',
    vertical: 'productions',
    priority: 'medium',
    title: 'Project Updated',
    message: `${projectName} has been updated`,
    link,
  }),

  taskAssigned: (taskName: string, assignedBy: string, link: string): Omit<Notification, 'id' | 'read' | 'archived' | 'createdAt'> => ({
    type: 'task_assigned',
    vertical: 'productions',
    priority: 'high',
    title: 'New Task Assigned',
    message: `${assignedBy} assigned you to "${taskName}"`,
    link,
  }),

  propertyInquiry: (propertyAddress: string, leadName: string, link: string): Omit<Notification, 'id' | 'read' | 'archived' | 'createdAt'> => ({
    type: 'property_inquiry',
    vertical: 'real-estate',
    priority: 'high',
    title: 'New Property Inquiry',
    message: `${leadName} inquired about ${propertyAddress}`,
    link,
  }),

  campaignAlert: (campaignName: string, message: string, priority: NotificationPriority = 'medium'): Omit<Notification, 'id' | 'read' | 'archived' | 'createdAt'> => ({
    type: 'campaign_alert',
    vertical: 'ecommerce',
    priority,
    title: `Campaign Alert: ${campaignName}`,
    message,
  }),

  system: (message: string, priority: NotificationPriority = 'low'): Omit<Notification, 'id' | 'read' | 'archived' | 'createdAt'> => ({
    type: 'system',
    vertical: 'platform',
    priority,
    title: 'System Notification',
    message,
  }),

  error: (message: string): Omit<Notification, 'id' | 'read' | 'archived' | 'createdAt'> => ({
    type: 'error',
    vertical: 'platform',
    priority: 'critical',
    title: 'Error',
    message,
  }),
};
