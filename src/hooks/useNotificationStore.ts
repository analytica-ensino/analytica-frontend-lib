import { createNotificationStore } from '../store/notificationStore';
import { NotificationApiClient } from '../types/notifications';

/**
 * Create a notification store hook with injected API client
 * This allows different applications to provide their own API implementation
 *
 * @param apiClient - API client instance that implements NotificationApiClient interface
 * @returns Zustand hook for notification store
 *
 * @example
 * ```typescript
 * import { createUseNotificationStore } from 'analytica-frontend-lib';
 * import api from './services/apiService';
 *
 * const useNotificationStore = createUseNotificationStore(api);
 * ```
 */
export const createUseNotificationStore = (
  apiClient: NotificationApiClient
) => {
  return createNotificationStore(apiClient);
};
