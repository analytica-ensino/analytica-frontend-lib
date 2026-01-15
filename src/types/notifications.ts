import type { BaseApiClient } from './api';

/**
 * Types for notification system
 */

/**
 * Notification type enum
 */
export type NotificationType =
  | 'ACTIVITY'
  | 'TRAIL'
  | 'GENERAL'
  | 'ANNOUNCEMENT'
  | 'RECOMMENDED_CLASS';

/**
 * Entity type for navigation
 */
export enum NotificationEntityType {
  ACTIVITY = 'ACTIVITY',
  TRAIL = 'TRAIL',
  RECOMMENDED_CLASS = 'RECOMMENDED_CLASS',
}

/**
 * Notification interface
 */
export interface Notification {
  /**
   * Unique identifier for the notification
   */
  id: string;
  /**
   * Notification title
   */
  title: string;
  /**
   * Notification message content
   */
  message: string;
  /**
   * Type of notification
   */
  type: NotificationType;
  /**
   * Whether the notification has been read
   */
  isRead: boolean;
  /**
   * When the notification was created
   */
  createdAt: Date;
  /**
   * Type of entity this notification refers to (optional)
   */
  entityType?: NotificationEntityType | null;
  /**
   * ID of the entity this notification refers to (optional)
   */
  entityId?: string | null;
  /**
   * Action link for global notifications (optional)
   */
  actionLink?: string | null;
  /**
   * Sender information (optional)
   */
  sender?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  /**
   * Activity information (optional)
   */
  activity?: {
    id: string;
    title: string;
    type: string;
  } | null;
  /**
   * RecommendedClass information (optional)
   */
  recommendedClass?: {
    id: string;
    title: string;
  } | null;
}

/**
 * Backend notification response from API
 */
export interface BackendNotification {
  id: string;
  senderUserInstitutionId: string | null;
  receiverUserInstitutionId: string;
  title: string;
  description: string;
  entityType: string | null;
  entityId: string | null;
  actionLink?: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  activity?: {
    id: string;
    title: string;
    type: string;
  } | null;
  recommendedClass?: {
    id: string;
    title: string;
  } | null;
}

/**
 * API response for fetching notifications from backend
 */
export interface BackendNotificationsResponse {
  notifications: BackendNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API response for fetching notifications (frontend format)
 */
export interface NotificationsResponse {
  /**
   * List of notifications
   */
  notifications: Notification[];
  /**
   * Total count of notifications
   */
  totalCount: number;
  /**
   * Count of unread notifications
   */
  unreadCount: number;
  /**
   * Whether there are more notifications to load
   */
  hasMore: boolean;
}

/**
 * Parameters for fetching notifications
 */
export interface FetchNotificationsParams {
  /**
   * Page number for pagination
   */
  page?: number;
  /**
   * Number of items per page
   */
  limit?: number;
  /**
   * Filter by read status
   */
  read?: boolean;
  /**
   * Filter by entity type
   */
  entityType?: string;
}

/**
 * Notification grouped by time period
 */
export interface NotificationGroup {
  /**
   * Group label (e.g., "Hoje", "Última semana")
   */
  label: string;
  /**
   * Notifications in this group
   */
  notifications: Notification[];
}

/**
 * API client interface for dependency injection
 * Uses Pick from BaseApiClient to select only the methods needed for notifications
 */
export type NotificationApiClient = Pick<
  BaseApiClient,
  'get' | 'patch' | 'delete'
>;
