import { createUseNotificationStore } from './useNotificationStore';
import { createNotificationStore } from '../store/notificationStore';
import { NotificationApiClient } from '../types/notifications';

// Mock the createNotificationStore function
jest.mock('../store/notificationStore', () => ({
  createNotificationStore: jest.fn(),
}));

describe('createUseNotificationStore', () => {
  const mockApiClient: NotificationApiClient = {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const mockStore = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    hasMore: true,
    currentPage: 1,
    fetchNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    clearNotifications: jest.fn(),
    resetError: jest.fn(),
    getGroupedNotifications: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createNotificationStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('should call createNotificationStore with the provided apiClient', () => {
    createUseNotificationStore(mockApiClient);

    expect(createNotificationStore).toHaveBeenCalledTimes(1);
    expect(createNotificationStore).toHaveBeenCalledWith(mockApiClient);
  });

  it('should return the result from createNotificationStore', () => {
    const result = createUseNotificationStore(mockApiClient);

    expect(result).toBe(mockStore);
  });

  it('should create a new store instance for each call with different apiClient', () => {
    const mockApiClient2: NotificationApiClient = {
      get: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    const mockStore2 = {
      ...mockStore,
      unreadCount: 5,
    };

    (createNotificationStore as jest.Mock)
      .mockReturnValueOnce(mockStore)
      .mockReturnValueOnce(mockStore2);

    const result1 = createUseNotificationStore(mockApiClient);
    const result2 = createUseNotificationStore(mockApiClient2);

    expect(createNotificationStore).toHaveBeenCalledTimes(2);
    expect(createNotificationStore).toHaveBeenNthCalledWith(1, mockApiClient);
    expect(createNotificationStore).toHaveBeenNthCalledWith(2, mockApiClient2);
    expect(result1).toBe(mockStore);
    expect(result2).toBe(mockStore2);
  });

  it('should work with any object implementing NotificationApiClient interface', () => {
    const customApiClient: NotificationApiClient = {
      get: async <T>() => ({
        data: {
          notifications: [],
          pagination: { page: 1, totalPages: 1 },
        } as T,
      }),
      patch: async <T>() => ({ data: { success: true } as T }),
      delete: async <T>() => ({ data: { success: true } as T }),
    };

    createUseNotificationStore(customApiClient);

    expect(createNotificationStore).toHaveBeenCalledWith(customApiClient);
  });
});
