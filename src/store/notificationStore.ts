import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Notification,
  NotificationGroup,
  FetchNotificationsParams,
  BackendNotificationsResponse,
  BackendNotification,
  NotificationEntityType,
  NotificationType,
  NotificationApiClient,
} from '../types/notifications';

/**
 * Notification store state interface
 */
export interface NotificationState {
  /**
   * List of all notifications
   */
  notifications: Notification[];
  /**
   * Number of unread notifications
   */
  unreadCount: number;
  /**
   * Loading state
   */
  loading: boolean;
  /**
   * Error state
   */
  error: string | null;
  /**
   * Whether there are more notifications to load
   */
  hasMore: boolean;
  /**
   * Current page for pagination
   */
  currentPage: number;
}

/**
 * Notification store actions interface
 */
export interface NotificationActions {
  /**
   * Fetch notifications from API
   */
  fetchNotifications: (params?: FetchNotificationsParams) => Promise<void>;
  /**
   * Mark a specific notification as read
   */
  markAsRead: (id: string) => Promise<void>;
  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => Promise<void>;
  /**
   * Delete a notification
   */
  deleteNotification: (id: string) => Promise<void>;
  /**
   * Clear all notifications
   */
  clearNotifications: () => void;
  /**
   * Reset error state
   */
  resetError: () => void;
  /**
   * Group notifications by time periods
   */
  getGroupedNotifications: () => NotificationGroup[];
}

export type NotificationStore = NotificationState & NotificationActions;

/**
 * Convert backend notification to frontend format
 */
const mapBackendNotification = (
  backendNotification: BackendNotification
): Notification => {
  let type: NotificationType = 'GENERAL';
  let entityType: NotificationEntityType | null = null;

  if (backendNotification.entityType) {
    // Convert to uppercase for comparison since backend returns lowercase
    const backendEntityType = backendNotification.entityType.toUpperCase();

    switch (backendEntityType) {
      case NotificationEntityType.ACTIVITY:
        type = 'ACTIVITY';
        entityType = NotificationEntityType.ACTIVITY;
        break;
      case NotificationEntityType.TRAIL:
        type = 'TRAIL';
        entityType = NotificationEntityType.TRAIL;
        break;
      case NotificationEntityType.GOAL:
        type = 'GOAL';
        entityType = NotificationEntityType.GOAL;
        break;
      default:
        break;
    }
  }

  return {
    id: backendNotification.id,
    title: backendNotification.title,
    message: backendNotification.description,
    type,
    isRead: backendNotification.read,
    createdAt: new Date(backendNotification.createdAt),
    entityType,
    entityId: backendNotification.entityId,
    sender: backendNotification.sender,
    activity: backendNotification.activity,
    goal: backendNotification.goal,
    actionLink: backendNotification.actionLink ?? null,
  };
};

/**
 * Group notifications by time periods
 */
const groupNotificationsByTime = (
  notifications: Notification[]
): NotificationGroup[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sortDesc = (a: Notification, b: Notification) =>
    +new Date(b.createdAt) - +new Date(a.createdAt);

  const todayNotifications = notifications
    .filter((notification) => new Date(notification.createdAt) >= today)
    .sort(sortDesc);

  const lastWeekNotifications = notifications
    .filter(
      (notification) =>
        new Date(notification.createdAt) >= lastWeek &&
        new Date(notification.createdAt) < today
    )
    .sort(sortDesc);

  const olderNotifications = notifications
    .filter((notification) => new Date(notification.createdAt) < lastWeek)
    .sort(sortDesc);

  const groups: NotificationGroup[] = [];

  if (todayNotifications.length > 0) {
    groups.push({
      label: 'Hoje',
      notifications: todayNotifications,
    });
  }

  if (lastWeekNotifications.length > 0) {
    groups.push({
      label: 'Última semana',
      notifications: lastWeekNotifications,
    });
  }

  if (olderNotifications.length > 0) {
    groups.push({
      label: 'Mais antigas',
      notifications: olderNotifications,
    });
  }

  return groups;
};

/**
 * Format time relative to now
 */
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInHours < 24) {
    return `Há ${diffInHours}h`;
  } else if (diffInDays < 30) {
    const day = new Date(date).getDate();
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    const month = months[new Date(date).getMonth()];
    return `${day} ${month}`;
  }

  return new Date(date).toLocaleDateString('pt-BR');
};

/**
 * Create notification store with injected API client
 */
export const createNotificationStore = (apiClient: NotificationApiClient) => {
  return create<NotificationStore>()(
    devtools(
      (set, get) => ({
        // Initial state
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
        hasMore: true,
        currentPage: 1,

        // Actions
        fetchNotifications: async (params: FetchNotificationsParams = {}) => {
          set({ loading: true, error: null });

          try {
            const response = await apiClient.get<BackendNotificationsResponse>(
              '/notifications',
              { params: { ...params } }
            );

            const mappedNotifications = response.data.notifications.map(
              mapBackendNotification
            );

            const page = response.data.pagination.page;
            const totalPages = response.data.pagination.totalPages;
            const merged =
              params.page && params.page > 1
                ? [...get().notifications, ...mappedNotifications]
                : mappedNotifications;
            // de-dup by id
            const deduped = Array.from(
              new Map(merged.map((n) => [n.id, n])).values()
            );

            set({
              notifications: deduped,
              unreadCount: deduped.filter((n) => !n.isRead).length,
              hasMore: page < totalPages,
              currentPage: page,
              loading: false,
            });
          } catch (error) {
            console.error('Error fetching notifications:', error);
            set({
              error: 'Erro ao carregar notificações',
              loading: false,
            });
          }
        },

        markAsRead: async (id: string) => {
          const { notifications } = get();

          // Find the notification to check if it's already read
          const notification = notifications.find((n) => n.id === id);

          // If notification is already read, just return without making API call
          if (notification?.isRead) {
            return;
          }

          try {
            await apiClient.patch(`/notifications/${id}`, { read: true });

            const updatedNotifications = notifications.map((notification) =>
              notification.id === id
                ? { ...notification, isRead: true }
                : notification
            );

            const unreadCount = updatedNotifications.filter(
              (n) => !n.isRead
            ).length;

            set({
              notifications: updatedNotifications,
              unreadCount,
            });
          } catch (error) {
            console.error('Error marking notification as read:', error);
            set({ error: 'Erro ao marcar notificação como lida' });
          }
        },

        markAllAsRead: async () => {
          const { notifications } = get();

          try {
            // Mark all unread notifications as read
            const unreadNotifications = notifications.filter((n) => !n.isRead);

            await Promise.all(
              unreadNotifications.map((notification) =>
                apiClient.patch(`/notifications/${notification.id}`, {
                  read: true,
                })
              )
            );

            const updatedNotifications = notifications.map((notification) => ({
              ...notification,
              isRead: true,
            }));

            set({
              notifications: updatedNotifications,
              unreadCount: 0,
            });
          } catch (error) {
            console.error('Error marking all notifications as read:', error);
            set({ error: 'Erro ao marcar todas as notificações como lidas' });
          }
        },

        deleteNotification: async (id: string) => {
          const { notifications } = get();

          try {
            await apiClient.delete(`/notifications/${id}`);

            const updatedNotifications = notifications.filter(
              (notification) => notification.id !== id
            );

            const unreadCount = updatedNotifications.filter(
              (n) => !n.isRead
            ).length;

            set({
              notifications: updatedNotifications,
              unreadCount,
            });
          } catch (error) {
            console.error('Error deleting notification:', error);
            set({ error: 'Erro ao deletar notificação' });
          }
        },

        clearNotifications: () => {
          set({
            notifications: [],
            unreadCount: 0,
            hasMore: false,
            currentPage: 1,
          });
        },

        resetError: () => {
          set({ error: null });
        },

        getGroupedNotifications: () => {
          const { notifications } = get();
          return groupNotificationsByTime(notifications);
        },
      }),
      {
        name: 'notification-store',
      }
    )
  );
};
