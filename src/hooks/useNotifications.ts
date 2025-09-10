import { useCallback } from 'react';
import { createUseNotificationStore } from './useNotificationStore';
import {
  NotificationEntityType,
  NotificationApiClient,
} from '../types/notifications';
import type { NotificationGroup, Notification } from '../types/notifications';
import { formatTimeAgo } from '../store/notificationStore';

/**
 * Create a comprehensive notifications hook with formatting and navigation
 * This hook provides all notification functionality in a single interface
 *
 * @param apiClient - API client instance for notifications
 * @returns Hook with notification state, actions, and utilities
 */
export const createUseNotifications = (apiClient: NotificationApiClient) => {
  const useNotificationStore = createUseNotificationStore(apiClient);

  return () => {
    const {
      notifications,
      unreadCount,
      loading,
      error,
      hasMore,
      currentPage,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
      resetError,
      getGroupedNotifications,
    } = useNotificationStore();

    /**
     * Handle navigation based on notification entity type and ID
     * Uses window.location.href for cross-framework compatibility
     *
     * @param entityType - Type of entity (ACTIVITY, GOAL)
     * @param entityId - ID of the entity
     * @param onAfterNavigate - Optional callback to execute after navigation
     */
    const handleNavigate = useCallback(
      (
        entityType?: string,
        entityId?: string,
        onAfterNavigate?: () => void
      ) => {
        if (entityType && entityId) {
          switch (entityType.toUpperCase()) {
            case NotificationEntityType.ACTIVITY:
              window.location.href = `/atividades/${entityId}`;
              break;
            case NotificationEntityType.GOAL:
              window.location.href = `/painel/trilhas/${entityId}`;
              break;
            default:
              break;
          }
          // Execute callback after navigation, if provided
          onAfterNavigate?.();
        }
      },
      []
    );

    /**
     * Get action label based on entity type
     *
     * @param entityType - Type of entity (ACTIVITY, GOAL)
     * @returns Action label or undefined
     */
    const getActionLabel = useCallback(
      (entityType?: string): string | undefined => {
        if (!entityType) return undefined;

        switch (entityType.toUpperCase()) {
          case NotificationEntityType.ACTIVITY:
            return 'Ver atividade';
          case NotificationEntityType.GOAL:
            return 'Ver meta';
          default:
            return undefined;
        }
      },
      []
    );

    /**
     * Mark notification as read and handle navigation
     *
     * @param id - Notification ID
     * @param entityType - Optional entity type for navigation
     * @param entityId - Optional entity ID for navigation
     * @param onAfterNavigate - Optional callback to execute after navigation
     */
    const markAsReadAndNavigate = useCallback(
      async (
        id: string,
        entityType?: string,
        entityId?: string,
        onAfterNavigate?: () => void
      ) => {
        await markAsRead(id);
        if (entityType && entityId) {
          handleNavigate(entityType, entityId, onAfterNavigate);
        }
      },
      [markAsRead, handleNavigate]
    );

    /**
     * Refresh notifications and reset error state
     */
    const refreshNotifications = useCallback(async () => {
      resetError();
      await fetchNotifications();
    }, [resetError, fetchNotifications]);

    /**
     * Format a single notification with time and entity data
     *
     * @param notification - The notification to format
     * @returns Formatted notification
     */
    const formatNotification = useCallback(
      (notification: Notification) => ({
        ...notification,
        time: formatTimeAgo(notification.createdAt),
        entityType: notification.entityType || undefined,
        entityId: notification.entityId || undefined,
      }),
      []
    );

    /**
     * Format grouped notifications with time and entity data
     * This provides all the formatting logic needed by components
     *
     * @returns Formatted notifications ready for display
     */
    const getFormattedGroupedNotifications = useCallback(() => {
      const groups = getGroupedNotifications();
      return groups.map((group: NotificationGroup) => ({
        ...group,
        notifications: group.notifications.map(formatNotification),
      }));
    }, [getGroupedNotifications, formatNotification]);

    return {
      // State
      notifications,
      unreadCount,
      loading,
      error,
      hasMore,
      currentPage,

      // Actions
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
      resetError,
      markAsReadAndNavigate,
      refreshNotifications,

      // Navigation
      handleNavigate,

      // Helpers
      getActionLabel,
      getGroupedNotifications,
      getFormattedGroupedNotifications,
    };
  };
};

/**
 * Create a pre-configured notifications hook
 * This is a convenience function that returns a hook ready to use
 *
 * @param apiClient - API client instance for notifications
 * @returns Pre-configured useNotifications hook
 *
 * @example
 * // In your app setup
 * import { createNotificationsHook } from 'analytica-frontend-lib';
 * import api from './services/api';
 *
 * export const useNotifications = createNotificationsHook(api);
 *
 * // Then use directly in components
 * const { unreadCount, fetchNotifications } = useNotifications();
 */
export const createNotificationsHook = (apiClient: NotificationApiClient) => {
  return createUseNotifications(apiClient);
};
