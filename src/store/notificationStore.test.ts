import { renderHook, act } from '@testing-library/react';
import { createNotificationStore, formatTimeAgo } from './notificationStore';
import {
  NotificationApiClient,
  BackendNotificationsResponse,
  NotificationEntityType,
} from '../types/notifications';

// Mock console.error to avoid noise in tests
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

describe('notificationStore', () => {
  let mockApiClient: NotificationApiClient;
  let useNotificationStore: ReturnType<typeof createNotificationStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient = {
      get: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };
    useNotificationStore = createNotificationStore(mockApiClient);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    mockConsoleError.mockClear();
  });

  const setupTestNotifications = () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      useNotificationStore.setState({
        notifications: [
          {
            id: '1',
            title: 'Test 1',
            message: 'Message 1',
            type: 'ACTIVITY',
            isRead: false,
            createdAt: new Date(),
            entityType: NotificationEntityType.ACTIVITY,
            entityId: 'activity-1',
            sender: null,
            activity: null,
            recommendedClass: null,
          },
          {
            id: '2',
            title: 'Test 2',
            message: 'Message 2',
            type: 'GENERAL',
            isRead: true,
            createdAt: new Date(),
            entityType: null,
            entityId: null,
            sender: null,
            activity: null,
            recommendedClass: null,
          },
        ],
        unreadCount: 1,
      });
    });

    return result;
  };

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useNotificationStore());

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('fetchNotifications', () => {
    const mockBackendResponse: BackendNotificationsResponse = {
      notifications: [
        {
          id: '1',
          senderUserInstitutionId: 'sender-1',
          receiverUserInstitutionId: 'receiver-1',
          title: 'Test Notification',
          description: 'Test Description',
          entityType: NotificationEntityType.ACTIVITY,
          entityId: 'activity-1',
          read: false,
          createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
          updatedAt: new Date('2024-01-15T10:00:00Z').toISOString(),
          sender: {
            id: 'sender-1',
            user: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
            },
          },
          activity: {
            id: 'activity-1',
            title: 'Test Activity',
            type: 'quiz',
          },
          recommendedClass: null,
        },
        {
          id: '2',
          senderUserInstitutionId: null,
          receiverUserInstitutionId: 'receiver-1',
          title: 'Another Notification',
          description: 'Another Description',
          entityType: 'unknown',
          entityId: null,
          read: true,
          createdAt: new Date('2024-01-15T09:00:00Z').toISOString(),
          updatedAt: new Date('2024-01-15T09:00:00Z').toISOString(),
          sender: null,
          activity: null,
          recommendedClass: null,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    };

    it('should fetch notifications successfully', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: mockBackendResponse,
      });

      const { result } = renderHook(() => useNotificationStore());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/notifications', {
        params: {},
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.unreadCount).toBe(1);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.error).toBe(null);
    });

    it('should handle fetch with parameters', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: mockBackendResponse,
      });

      const { result } = renderHook(() => useNotificationStore());
      const params = { page: 2, limit: 5, read: false };

      await act(async () => {
        await result.current.fetchNotifications(params);
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/notifications', {
        params,
      });
    });

    it('should handle pagination correctly when hasMore is true', async () => {
      const responseWithMorePages = {
        ...mockBackendResponse,
        pagination: {
          page: 1,
          limit: 10,
          total: 20,
          totalPages: 2,
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: responseWithMorePages,
      });

      const { result } = renderHook(() => useNotificationStore());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.hasMore).toBe(true);
      expect(result.current.currentPage).toBe(1);
    });

    it('should handle fetch error gracefully', async () => {
      const error = new Error('Network Error');
      (mockApiClient.get as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useNotificationStore());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao carregar notificações');
      expect(result.current.notifications).toEqual([]);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error fetching notifications:',
        error
      );
    });

    it('should set loading state correctly during fetch', async () => {
      let resolvePromise: (value: {
        data: BackendNotificationsResponse;
      }) => void;
      const promise = new Promise<{ data: BackendNotificationsResponse }>(
        (resolve) => {
          resolvePromise = resolve;
        }
      );
      (mockApiClient.get as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.fetchNotifications();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);

      await act(async () => {
        resolvePromise!({ data: mockBackendResponse });
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      (mockApiClient.patch as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const { current: store } = setupTestNotifications();

      await act(async () => {
        await store.markAsRead('1');
      });

      expect(mockApiClient.patch).toHaveBeenCalledWith('/notifications/1', {
        read: true,
      });

      const updatedStore = useNotificationStore.getState();
      expect(updatedStore.notifications[0].isRead).toBe(true);
      expect(updatedStore.unreadCount).toBe(0);
    });

    it('should handle mark as read error gracefully', async () => {
      const error = new Error('Network Error');
      (mockApiClient.patch as jest.Mock).mockRejectedValue(error);

      const { current: store } = setupTestNotifications();

      await act(async () => {
        await store.markAsRead('1');
      });

      const updatedStore = useNotificationStore.getState();
      expect(updatedStore.error).toBe('Erro ao marcar notificação como lida');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error marking notification as read:',
        error
      );
    });

    it('should not affect other notifications when marking one as read', async () => {
      (mockApiClient.patch as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const { current: store } = setupTestNotifications();

      await act(async () => {
        await store.markAsRead('1');
      });

      const updatedStore = useNotificationStore.getState();
      expect(updatedStore.notifications[0].isRead).toBe(true);
      expect(updatedStore.notifications[1].isRead).toBe(true); // Should remain unchanged
      expect(updatedStore.notifications[1].id).toBe('2');
    });
  });

  describe('markAllAsRead', () => {
    const setupMixedNotifications = () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        useNotificationStore.setState({
          notifications: [
            {
              id: '1',
              title: 'Test 1',
              message: 'Message 1',
              type: 'ACTIVITY',
              isRead: false,
              createdAt: new Date(),
              entityType: NotificationEntityType.ACTIVITY,
              entityId: 'activity-1',
              sender: null,
              activity: null,
              recommendedClass: null,
            },
            {
              id: '2',
              title: 'Test 2',
              message: 'Message 2',
              type: 'GENERAL',
              isRead: false,
              createdAt: new Date(),
              entityType: null,
              entityId: null,
              sender: null,
              activity: null,
              recommendedClass: null,
            },
            {
              id: '3',
              title: 'Test 3',
              message: 'Message 3',
              type: 'TRAIL',
              isRead: true,
              createdAt: new Date(),
              entityType: NotificationEntityType.TRAIL,
              entityId: 'trail-1',
              sender: null,
              activity: null,
              recommendedClass: null,
            },
          ],
          unreadCount: 2,
        });
      });

      return result;
    };

    it('should mark all unread notifications as read', async () => {
      (mockApiClient.patch as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const { current: store } = setupMixedNotifications();

      await act(async () => {
        await store.markAllAsRead();
      });

      expect(mockApiClient.patch).toHaveBeenCalledTimes(2);
      expect(mockApiClient.patch).toHaveBeenCalledWith('/notifications/1', {
        read: true,
      });
      expect(mockApiClient.patch).toHaveBeenCalledWith('/notifications/2', {
        read: true,
      });

      const updatedStore = useNotificationStore.getState();
      expect(updatedStore.notifications.every((n) => n.isRead)).toBe(true);
      expect(updatedStore.unreadCount).toBe(0);
    });

    it('should handle mark all as read error gracefully', async () => {
      const error = new Error('Network Error');
      (mockApiClient.patch as jest.Mock).mockRejectedValue(error);

      const { current: store } = setupMixedNotifications();

      await act(async () => {
        await store.markAllAsRead();
      });

      const updatedStore = useNotificationStore.getState();
      expect(updatedStore.error).toBe(
        'Erro ao marcar todas as notificações como lidas'
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error marking all notifications as read:',
        error
      );
    });

    it('should not make API call when notification is already read', async () => {
      const { result } = renderHook(() => useNotificationStore());

      // Setup with notification already read
      act(() => {
        useNotificationStore.setState({
          notifications: [
            {
              id: '1',
              title: 'Test',
              message: 'Message',
              type: 'ACTIVITY',
              isRead: true, // Already read
              createdAt: new Date(),
              entityType: NotificationEntityType.ACTIVITY,
              entityId: 'activity-1',
              sender: null,
              activity: null,
              recommendedClass: null,
            },
          ],
          unreadCount: 0,
        });
      });

      await act(async () => {
        await result.current.markAsRead('1');
      });

      // Should not make API call for already read notification
      expect(mockApiClient.patch).not.toHaveBeenCalled();
    });

    it('should work when no unread notifications exist', async () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        useNotificationStore.setState({
          notifications: [
            {
              id: '1',
              title: 'Test 1',
              message: 'Message 1',
              type: 'ACTIVITY',
              isRead: true,
              createdAt: new Date(),
              entityType: NotificationEntityType.ACTIVITY,
              entityId: 'activity-1',
              sender: null,
              activity: null,
              recommendedClass: null,
            },
          ],
          unreadCount: 0,
        });
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(mockApiClient.patch).not.toHaveBeenCalled();

      const updatedStore = useNotificationStore.getState();
      expect(updatedStore.unreadCount).toBe(0);
      expect(updatedStore.notifications[0].isRead).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      (mockApiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const { current: store } = setupTestNotifications();

      await act(async () => {
        await store.deleteNotification('1');
      });

      expect(mockApiClient.delete).toHaveBeenCalledWith('/notifications/1');

      const updatedStore = useNotificationStore.getState();
      expect(updatedStore.notifications).toHaveLength(1);
      expect(updatedStore.notifications[0].id).toBe('2');
      expect(updatedStore.unreadCount).toBe(0);
    });

    it('should handle delete error gracefully', async () => {
      const error = new Error('Network Error');
      (mockApiClient.delete as jest.Mock).mockRejectedValue(error);

      const { current: store } = setupTestNotifications();

      await act(async () => {
        await store.deleteNotification('1');
      });

      const updatedStore = useNotificationStore.getState();
      expect(updatedStore.error).toBe('Erro ao deletar notificação');
      expect(updatedStore.notifications).toHaveLength(2); // Should remain unchanged
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error deleting notification:',
        error
      );
    });

    it('should update unread count when deleting unread notification', async () => {
      (mockApiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const { current: store } = setupTestNotifications();

      await act(async () => {
        await store.deleteNotification('1'); // Unread notification
      });

      const updatedStore = useNotificationStore.getState();
      expect(updatedStore.unreadCount).toBe(0);
    });
  });

  describe('clearNotifications', () => {
    it('should clear all notifications and reset state', () => {
      const { result } = renderHook(() => useNotificationStore());

      // Setup some notifications first
      act(() => {
        useNotificationStore.setState({
          notifications: [
            {
              id: '1',
              title: 'Test',
              message: 'Message',
              type: 'ACTIVITY',
              isRead: false,
              createdAt: new Date(),
              entityType: null,
              entityId: null,
              sender: null,
              activity: null,
              recommendedClass: null,
            },
          ],
          unreadCount: 1,
          hasMore: true,
          currentPage: 2,
        });
      });

      act(() => {
        result.current.clearNotifications();
      });

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('resetError', () => {
    it('should reset error state to null', () => {
      const { result } = renderHook(() => useNotificationStore());

      // Set error state
      act(() => {
        useNotificationStore.setState({
          error: 'Some error occurred',
        });
      });

      expect(result.current.error).toBe('Some error occurred');

      act(() => {
        result.current.resetError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('formatTimeAgo', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should format time for hours ago (less than 24h)', () => {
      const date = new Date('2024-01-15T08:00:00Z'); // 4 hours ago
      const result = formatTimeAgo(date);
      expect(result).toBe('Há 4h');
    });

    it('should format time for days ago (less than 30 days)', () => {
      const date = new Date('2024-01-10T08:00:00Z'); // 5 days ago
      const result = formatTimeAgo(date);
      expect(result).toBe('10 Jan');
    });

    it('should format time for months ago (30+ days)', () => {
      const date = new Date('2023-11-15T08:00:00Z'); // More than 30 days ago
      const result = formatTimeAgo(date);
      expect(result).toBe('15/11/2023');
    });

    it('should handle different months correctly', () => {
      // Set current time to 2024-01-15T12:00:00Z for consistent testing
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));

      // Test dates within 30 days to ensure proper month formatting
      const testCases = [
        { date: new Date('2024-01-05T08:00:00Z'), expected: '5 Jan' },
        { date: new Date('2024-01-10T08:00:00Z'), expected: '10 Jan' },
      ];

      testCases.forEach(({ date, expected }) => {
        const result = formatTimeAgo(date);
        expect(result).toBe(expected);
      });

      // Test different months by setting specific system times
      jest.setSystemTime(new Date('2024-03-05T12:00:00Z'));
      let result = formatTimeAgo(new Date('2024-02-20T08:00:00Z'));
      expect(result).toBe('20 Fev');

      jest.setSystemTime(new Date('2024-05-05T12:00:00Z'));
      result = formatTimeAgo(new Date('2024-04-20T08:00:00Z'));
      expect(result).toBe('20 Abr');

      jest.setSystemTime(new Date('2024-06-05T12:00:00Z'));
      result = formatTimeAgo(new Date('2024-05-20T08:00:00Z'));
      expect(result).toBe('20 Mai');

      jest.setSystemTime(new Date('2024-12-05T12:00:00Z'));
      result = formatTimeAgo(new Date('2024-11-20T08:00:00Z'));
      expect(result).toBe('20 Nov');
    });
  });

  describe('getGroupedNotifications', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    it('should group notifications correctly', () => {
      const { result } = renderHook(() => useNotificationStore());

      const todayNotification = {
        id: '1',
        title: 'Today',
        message: 'Message',
        type: 'ACTIVITY' as const,
        isRead: false,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        entityType: null,
        entityId: null,
        sender: null,
        activity: null,
        recommendedClass: null,
      };

      const lastWeekNotification = {
        id: '2',
        title: 'Last Week',
        message: 'Message',
        type: 'TRAIL' as const,
        isRead: true,
        createdAt: new Date('2024-01-10T10:00:00Z'),
        entityType: null,
        entityId: null,
        sender: null,
        activity: null,
        recommendedClass: null,
      };

      act(() => {
        useNotificationStore.setState({
          notifications: [todayNotification, lastWeekNotification],
        });
      });

      const grouped = result.current.getGroupedNotifications();

      expect(grouped).toHaveLength(2);
      expect(grouped[0].label).toBe('Hoje');
      expect(grouped[0].notifications).toHaveLength(1);
      expect(grouped[0].notifications[0].id).toBe('1');
      expect(grouped[1].label).toBe('Última semana');
      expect(grouped[1].notifications).toHaveLength(1);
      expect(grouped[1].notifications[0].id).toBe('2');
    });

    it('should return empty array when no notifications exist', () => {
      const { result } = renderHook(() => useNotificationStore());

      const grouped = result.current.getGroupedNotifications();
      expect(grouped).toEqual([]);
    });
  });
});

describe('formatTimeAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should format hours ago correctly', () => {
    const date = new Date('2024-01-15T09:00:00Z'); // 3 hours ago
    expect(formatTimeAgo(date)).toBe('Há 3h');
  });

  it('should format same hour as 0h', () => {
    const date = new Date('2024-01-15T12:00:00Z'); // Same time
    expect(formatTimeAgo(date)).toBe('Há 0h');
  });

  it('should format 1 hour ago correctly', () => {
    const date = new Date('2024-01-15T11:00:00Z'); // 1 hour ago
    expect(formatTimeAgo(date)).toBe('Há 1h');
  });

  it('should format 23 hours ago correctly', () => {
    const date = new Date('2024-01-14T13:00:00Z'); // 23 hours ago
    expect(formatTimeAgo(date)).toBe('Há 23h');
  });

  it('should format day and month for dates within 30 days', () => {
    const date = new Date('2024-01-10T12:00:00Z'); // 5 days ago
    expect(formatTimeAgo(date)).toBe('10 Jan');
  });

  it('should format day and month for exactly 24 hours ago', () => {
    const date = new Date('2024-01-14T12:00:00Z'); // 1 day ago
    expect(formatTimeAgo(date)).toBe('14 Jan');
  });

  it('should format all months correctly', () => {
    // Set current time to a date that makes all test dates within 30 days
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));

    const months = [
      { date: '2024-01-01T12:00:00Z', expected: '1 Jan' },
      { date: '2024-01-02T12:00:00Z', expected: '2 Jan' },
      { date: '2024-01-03T12:00:00Z', expected: '3 Jan' },
      { date: '2024-01-04T12:00:00Z', expected: '4 Jan' },
      { date: '2024-01-05T12:00:00Z', expected: '5 Jan' },
      { date: '2024-01-06T12:00:00Z', expected: '6 Jan' },
      { date: '2024-01-07T12:00:00Z', expected: '7 Jan' },
      { date: '2024-01-08T12:00:00Z', expected: '8 Jan' },
      { date: '2024-01-09T12:00:00Z', expected: '9 Jan' },
      { date: '2024-01-10T12:00:00Z', expected: '10 Jan' },
      { date: '2024-01-11T12:00:00Z', expected: '11 Jan' },
      { date: '2024-01-12T12:00:00Z', expected: '12 Jan' },
    ];

    months.forEach(({ date, expected }) => {
      expect(formatTimeAgo(new Date(date))).toBe(expected);
    });
  });

  it('should format old dates with full date', () => {
    const date = new Date('2023-12-15T12:00:00Z'); // More than 30 days ago
    expect(formatTimeAgo(date)).toBe('15/12/2023');
  });

  it('should format exactly 30 days ago with full date', () => {
    const date = new Date('2023-12-16T12:00:00Z'); // 30 days ago
    expect(formatTimeAgo(date)).toBe('16/12/2023');
  });

  it('should handle date objects created from strings', () => {
    const dateString = '2024-01-15T09:00:00Z';
    const date = new Date(dateString);
    expect(formatTimeAgo(date)).toBe('Há 3h');
  });
});

// Test helper functions that are used internally
describe('Internal Helper Functions', () => {
  describe('mapBackendNotification', () => {
    // We need to access the internal function through the store behavior
    it('should map ACTIVITY entity type correctly', async () => {
      const mockResponse: BackendNotificationsResponse = {
        notifications: [
          {
            id: '1',
            senderUserInstitutionId: null,
            receiverUserInstitutionId: 'user-1',
            title: 'Activity Notification',
            description: 'Description',
            entityType: NotificationEntityType.ACTIVITY,
            entityId: 'activity-1',
            read: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: null,
            activity: {
              id: 'activity-1',
              title: 'Test Activity',
              type: 'quiz',
            },
            recommendedClass: null,
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      const mockApiClient: NotificationApiClient = {
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const notification = result.current.notifications[0];
      expect(notification.type).toBe('ACTIVITY');
      expect(notification.entityType).toBe(NotificationEntityType.ACTIVITY);
      expect(notification.activity).toEqual({
        id: 'activity-1',
        title: 'Test Activity',
        type: 'quiz',
      });
    });

    it('should map TRAIL entity type correctly', async () => {
      const mockResponse: BackendNotificationsResponse = {
        notifications: [
          {
            id: '1',
            senderUserInstitutionId: null,
            receiverUserInstitutionId: 'user-1',
            title: 'Trail Notification',
            description: 'Description',
            entityType: NotificationEntityType.TRAIL,
            entityId: 'trail-1',
            read: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: null,
            activity: null,
            recommendedClass: null,
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      const mockApiClient: NotificationApiClient = {
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const notification = result.current.notifications[0];
      expect(notification.type).toBe('TRAIL');
      expect(notification.entityType).toBe(NotificationEntityType.TRAIL);
    });

    it('should map GOAL entity type correctly', async () => {
      const mockResponse: BackendNotificationsResponse = {
        notifications: [
          {
            id: '1',
            senderUserInstitutionId: null,
            receiverUserInstitutionId: 'user-1',
            title: 'Goal Notification',
            description: 'Description',
            entityType: NotificationEntityType.GOAL,
            entityId: 'goal-1',
            read: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: null,
            activity: null,
            recommendedClass: {
              id: 'goal-1',
              title: 'Test Goal',
            },
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      const mockApiClient: NotificationApiClient = {
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const notification = result.current.notifications[0];
      expect(notification.type).toBe('GOAL');
      expect(notification.entityType).toBe(NotificationEntityType.GOAL);
      expect(notification.recommendedClass).toEqual({
        id: 'goal-1',
        title: 'Test Goal',
      });
    });

    it('should handle lowercase entity types correctly', async () => {
      const mockResponse: BackendNotificationsResponse = {
        notifications: [
          {
            id: '1',
            senderUserInstitutionId: null,
            receiverUserInstitutionId: 'user-1',
            title: 'Goal Notification',
            description: 'Description',
            entityType: 'goal', // lowercase
            entityId: 'goal-1',
            read: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: null,
            activity: null,
            recommendedClass: null,
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      const mockApiClient: NotificationApiClient = {
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const notification = result.current.notifications[0];
      expect(notification.type).toBe('GOAL');
      expect(notification.entityType).toBe(NotificationEntityType.GOAL);
    });

    it('should handle unknown entity type correctly', async () => {
      const mockResponse: BackendNotificationsResponse = {
        notifications: [
          {
            id: '1',
            senderUserInstitutionId: null,
            receiverUserInstitutionId: 'user-1',
            title: 'General Notification',
            description: 'Description',
            entityType: 'unknown',
            entityId: null,
            read: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: null,
            activity: null,
            recommendedClass: null,
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      const mockApiClient: NotificationApiClient = {
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const notification = result.current.notifications[0];
      expect(notification.type).toBe('GENERAL');
      expect(notification.entityType).toBe(null);
    });

    it('should handle null entity type correctly', async () => {
      const mockResponse: BackendNotificationsResponse = {
        notifications: [
          {
            id: '1',
            senderUserInstitutionId: null,
            receiverUserInstitutionId: 'user-1',
            title: 'General Notification',
            description: 'Description',
            entityType: null,
            entityId: null,
            read: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: null,
            activity: null,
            recommendedClass: null,
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      const mockApiClient: NotificationApiClient = {
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const notification = result.current.notifications[0];
      expect(notification.type).toBe('GENERAL');
      expect(notification.entityType).toBe(null);
    });

    it('should map all notification fields correctly', async () => {
      const createdAt = new Date('2024-01-15T10:00:00Z');
      const mockResponse: BackendNotificationsResponse = {
        notifications: [
          {
            id: 'test-id',
            senderUserInstitutionId: 'sender-1',
            receiverUserInstitutionId: 'receiver-1',
            title: 'Test Title',
            description: 'Test Description',
            entityType: NotificationEntityType.ACTIVITY,
            entityId: 'entity-1',
            read: true,
            createdAt: createdAt.toISOString(),
            updatedAt: new Date().toISOString(),
            sender: {
              id: 'sender-1',
              user: {
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
              },
            },
            activity: {
              id: 'activity-1',
              title: 'Test Activity',
              type: 'quiz',
            },
            recommendedClass: {
              id: 'goal-1',
              title: 'Test Goal',
            },
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      const mockApiClient: NotificationApiClient = {
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const notification = result.current.notifications[0];
      expect(notification.id).toBe('test-id');
      expect(notification.title).toBe('Test Title');
      expect(notification.message).toBe('Test Description');
      expect(notification.type).toBe('ACTIVITY');
      expect(notification.isRead).toBe(true);
      expect(notification.createdAt).toEqual(createdAt);
      expect(notification.entityType).toBe(NotificationEntityType.ACTIVITY);
      expect(notification.entityId).toBe('entity-1');
      expect(notification.sender).toEqual({
        id: 'sender-1',
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
      });
      expect(notification.activity).toEqual({
        id: 'activity-1',
        title: 'Test Activity',
        type: 'quiz',
      });
      expect(notification.recommendedClass).toEqual({
        id: 'goal-1',
        title: 'Test Goal',
      });
    });

    it('should map actionLink field correctly', async () => {
      const mockResponse: BackendNotificationsResponse = {
        notifications: [
          {
            id: '1',
            senderUserInstitutionId: null,
            receiverUserInstitutionId: 'user-1',
            title: 'Global Notification',
            description: 'Global notification with action link',
            entityType: null,
            entityId: null,
            actionLink: 'https://example.com/action',
            read: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: null,
            activity: null,
            recommendedClass: null,
          },
          {
            id: '2',
            senderUserInstitutionId: null,
            receiverUserInstitutionId: 'user-1',
            title: 'Notification without action link',
            description: 'Regular notification',
            entityType: null,
            entityId: null,
            read: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: null,
            activity: null,
            recommendedClass: null,
          },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      const mockApiClient: NotificationApiClient = {
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const notifications = result.current.notifications;

      // Test notification with actionLink
      expect(notifications[0].actionLink).toBe('https://example.com/action');

      // Test notification without actionLink (should be null)
      expect(notifications[1].actionLink).toBe(null);
    });
  });

  describe('groupNotificationsByTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    it('should return empty array for empty notifications', () => {
      const mockApiClient: NotificationApiClient = {
        get: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      const grouped = result.current.getGroupedNotifications();
      expect(grouped).toEqual([]);
    });

    it('should group only today notifications', () => {
      const mockApiClient: NotificationApiClient = {
        get: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      const todayNotifications = [
        {
          id: '1',
          title: 'Today 1',
          message: 'Message',
          type: 'ACTIVITY' as const,
          isRead: false,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          entityType: null,
          entityId: null,
          sender: null,
          activity: null,
          recommendedClass: null,
        },
        {
          id: '2',
          title: 'Today 2',
          message: 'Message',
          type: 'GENERAL' as const,
          isRead: true,
          createdAt: new Date('2024-01-15T08:00:00Z'),
          entityType: null,
          entityId: null,
          sender: null,
          activity: null,
          recommendedClass: null,
        },
      ];

      act(() => {
        useStore.setState({
          notifications: todayNotifications,
        });
      });

      const grouped = result.current.getGroupedNotifications();

      expect(grouped).toHaveLength(1);
      expect(grouped[0].label).toBe('Hoje');
      expect(grouped[0].notifications).toHaveLength(2);
    });

    it('should group only last week notifications', () => {
      const mockApiClient: NotificationApiClient = {
        get: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      const lastWeekNotifications = [
        {
          id: '1',
          title: 'Last Week 1',
          message: 'Message',
          type: 'TRAIL' as const,
          isRead: false,
          createdAt: new Date('2024-01-10T10:00:00Z'),
          entityType: null,
          entityId: null,
          sender: null,
          activity: null,
          recommendedClass: null,
        },
        {
          id: '2',
          title: 'Last Week 2',
          message: 'Message',
          type: 'GOAL' as const,
          isRead: true,
          createdAt: new Date('2024-01-09T08:00:00Z'),
          entityType: null,
          entityId: null,
          sender: null,
          activity: null,
          recommendedClass: null,
        },
      ];

      act(() => {
        useStore.setState({
          notifications: lastWeekNotifications,
        });
      });

      const grouped = result.current.getGroupedNotifications();

      expect(grouped).toHaveLength(1);
      expect(grouped[0].label).toBe('Última semana');
      expect(grouped[0].notifications).toHaveLength(2);
    });

    it('should group very old notifications in "Mais antigas" category', () => {
      const mockApiClient: NotificationApiClient = {
        get: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      const veryOldNotifications = [
        {
          id: '1',
          title: 'Very Old',
          message: 'Message',
          type: 'GENERAL' as const,
          isRead: false,
          createdAt: new Date('2023-12-01T10:00:00Z'), // More than a week ago
          entityType: null,
          entityId: null,
          sender: null,
          activity: null,
          recommendedClass: null,
        },
      ];

      act(() => {
        useStore.setState({
          notifications: veryOldNotifications,
        });
      });

      const grouped = result.current.getGroupedNotifications();
      expect(grouped).toEqual([
        {
          label: 'Mais antigas',
          notifications: veryOldNotifications,
        },
      ]);
    });

    it('should correctly handle edge cases for time boundaries', () => {
      const mockApiClient: NotificationApiClient = {
        get: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useStore = createNotificationStore(mockApiClient);
      const { result } = renderHook(() => useStore());

      const notifications = [
        // Clearly within today (noon)
        {
          id: '1',
          title: 'Beginning of Today',
          message: 'Message',
          type: 'ACTIVITY' as const,
          isRead: false,
          createdAt: new Date('2024-01-15T12:00:00Z'),
          entityType: null,
          entityId: null,
          sender: null,
          activity: null,
          recommendedClass: null,
        },
        // Exactly one week ago
        {
          id: '2',
          title: 'One Week Ago',
          message: 'Message',
          type: 'TRAIL' as const,
          isRead: false,
          createdAt: new Date('2024-01-08T12:00:00Z'),
          entityType: null,
          entityId: null,
          sender: null,
          activity: null,
          recommendedClass: null,
        },
        // Just within the last week range
        {
          id: '3',
          title: 'Just Within Week',
          message: 'Message',
          type: 'GOAL' as const,
          isRead: false,
          createdAt: new Date('2024-01-09T12:00:00Z'),
          entityType: null,
          entityId: null,
          sender: null,
          activity: null,
          recommendedClass: null,
        },
      ];

      act(() => {
        useStore.setState({
          notifications,
        });
      });

      const grouped = result.current.getGroupedNotifications();

      expect(grouped).toHaveLength(2);
      expect(grouped[0].label).toBe('Hoje');
      expect(grouped[0].notifications).toHaveLength(1);
      expect(grouped[0].notifications[0].id).toBe('1');

      expect(grouped[1].label).toBe('Última semana');
      expect(grouped[1].notifications).toHaveLength(2);
      expect(
        grouped[1].notifications
          .map((n) => n.id)
          .sort((a, b) => a.localeCompare(b))
      ).toEqual(['2', '3']);
    });
  });
});
