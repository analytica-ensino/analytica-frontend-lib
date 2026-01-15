import { renderHook, act } from '@testing-library/react';
import { createUseNotifications } from './useNotifications';
import type { NotificationApiClient } from '../types/notifications';
import { NotificationEntityType } from '../types/notifications';

// Mock formatTimeAgo
jest.mock('../store/notificationStore', () => {
  const actual = jest.requireActual('../store/notificationStore');
  return {
    ...actual,
    formatTimeAgo: jest.fn((date: Date) => `${date.getTime()}ms ago`),
  };
});

// Mock useNotificationStore hook
const mockUseNotificationStore = jest.fn();
jest.mock('./useNotificationStore', () => ({
  createUseNotificationStore: () => mockUseNotificationStore,
}));

describe('useNotifications', () => {
  const mockApiClient: NotificationApiClient = {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const useNotifications = createUseNotifications(mockApiClient);

  const mockStoreReturn = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    hasMore: false,
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
    mockUseNotificationStore.mockReturnValue(mockStoreReturn);
    mockStoreReturn.getGroupedNotifications.mockReturnValue([]);

    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  describe('State and Actions', () => {
    it('should return all store state and actions', () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current).toMatchObject({
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
        hasMore: false,
        currentPage: 1,
        fetchNotifications: expect.any(Function),
        markAsRead: expect.any(Function),
        markAllAsRead: expect.any(Function),
        deleteNotification: expect.any(Function),
        clearNotifications: expect.any(Function),
        resetError: expect.any(Function),
        markAsReadAndNavigate: expect.any(Function),
        refreshNotifications: expect.any(Function),
        handleNavigate: expect.any(Function),
        getActionLabel: expect.any(Function),
        getGroupedNotifications: expect.any(Function),
        getFormattedGroupedNotifications: expect.any(Function),
      });
    });
  });

  describe('handleNavigate', () => {
    it('should navigate to activity page when entityType is ACTIVITY', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.handleNavigate('ACTIVITY', '123');
      });

      expect(window.location.href).toBe('/atividades/123');
    });

    it('should navigate to recommendedClass page when entityType is GOAL', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.handleNavigate('GOAL', '456');
      });

      expect(window.location.href).toBe('/painel/trilhas/456');
    });

    it('should handle lowercase entity types', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.handleNavigate('activity', '789');
      });

      expect(window.location.href).toBe('/atividades/789');
    });

    it('should not navigate when entityType or entityId is missing', () => {
      const { result } = renderHook(() => useNotifications());
      const originalHref = window.location.href;

      act(() => {
        result.current.handleNavigate('ACTIVITY');
      });

      expect(window.location.href).toBe(originalHref);

      act(() => {
        result.current.handleNavigate(undefined, '123');
      });

      expect(window.location.href).toBe(originalHref);
    });

    it('should not navigate for unknown entity types', () => {
      const { result } = renderHook(() => useNotifications());
      const originalHref = window.location.href;

      act(() => {
        result.current.handleNavigate('UNKNOWN', '123');
      });

      expect(window.location.href).toBe(originalHref);
    });

    it('should execute callback after successful navigation', () => {
      const { result } = renderHook(() => useNotifications());
      const mockCallback = jest.fn();

      act(() => {
        result.current.handleNavigate('ACTIVITY', '123', mockCallback);
      });

      expect(window.location.href).toBe('/atividades/123');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should not execute callback when navigation fails', () => {
      const { result } = renderHook(() => useNotifications());
      const mockCallback = jest.fn();

      act(() => {
        result.current.handleNavigate('ACTIVITY', undefined, mockCallback);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should execute callback for unknown entity types if entityType and entityId are provided', () => {
      const { result } = renderHook(() => useNotifications());
      const mockCallback = jest.fn();

      act(() => {
        result.current.handleNavigate('UNKNOWN', '123', mockCallback);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('getActionLabel', () => {
    it('should return correct label for ACTIVITY', () => {
      const { result } = renderHook(() => useNotifications());

      const label = result.current.getActionLabel('ACTIVITY');
      expect(label).toBe('Ver atividade');
    });

    it('should return correct label for GOAL', () => {
      const { result } = renderHook(() => useNotifications());

      const label = result.current.getActionLabel('GOAL');
      expect(label).toBe('Ver meta');
    });

    it('should handle lowercase entity types', () => {
      const { result } = renderHook(() => useNotifications());

      const label = result.current.getActionLabel('activity');
      expect(label).toBe('Ver atividade');
    });

    it('should return undefined for unknown entity types', () => {
      const { result } = renderHook(() => useNotifications());

      const label = result.current.getActionLabel('UNKNOWN');
      expect(label).toBeUndefined();
    });

    it('should return "Ver mais" when entityType is falsy (global notifications)', () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current.getActionLabel()).toBe('Ver mais');
      expect(result.current.getActionLabel('')).toBe('Ver mais');
    });
  });

  describe('markAsReadAndNavigate', () => {
    it('should mark as read and navigate when both entityType and entityId are provided', async () => {
      const { result } = renderHook(() => useNotifications());
      const markAsReadSpy = jest.spyOn(mockStoreReturn, 'markAsRead');

      await act(async () => {
        await result.current.markAsReadAndNavigate('notif1', 'ACTIVITY', '123');
      });

      expect(markAsReadSpy).toHaveBeenCalledWith('notif1');
      expect(window.location.href).toBe('/atividades/123');
    });

    it('should only mark as read when entityType or entityId is missing', async () => {
      const { result } = renderHook(() => useNotifications());
      const markAsReadSpy = jest.spyOn(mockStoreReturn, 'markAsRead');
      const originalHref = window.location.href;

      await act(async () => {
        await result.current.markAsReadAndNavigate('notif1');
      });

      expect(markAsReadSpy).toHaveBeenCalledWith('notif1');
      expect(window.location.href).toBe(originalHref);
    });

    it('should execute callback after marking as read and navigating', async () => {
      const { result } = renderHook(() => useNotifications());
      const markAsReadSpy = jest.spyOn(mockStoreReturn, 'markAsRead');
      const mockCallback = jest.fn();

      await act(async () => {
        await result.current.markAsReadAndNavigate(
          'notif1',
          'ACTIVITY',
          '123',
          mockCallback
        );
      });

      expect(markAsReadSpy).toHaveBeenCalledWith('notif1');
      expect(window.location.href).toBe('/atividades/123');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should not execute callback when navigation is skipped', async () => {
      const { result } = renderHook(() => useNotifications());
      const markAsReadSpy = jest.spyOn(mockStoreReturn, 'markAsRead');
      const mockCallback = jest.fn();

      await act(async () => {
        await result.current.markAsReadAndNavigate(
          'notif1',
          undefined,
          undefined,
          mockCallback
        );
      });

      expect(markAsReadSpy).toHaveBeenCalledWith('notif1');
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('refreshNotifications', () => {
    it('should reset error and fetch notifications', async () => {
      const { result } = renderHook(() => useNotifications());
      const resetErrorSpy = jest.spyOn(mockStoreReturn, 'resetError');
      const fetchNotificationsSpy = jest.spyOn(
        mockStoreReturn,
        'fetchNotifications'
      );

      await act(async () => {
        await result.current.refreshNotifications();
      });

      expect(resetErrorSpy).toHaveBeenCalled();
      expect(fetchNotificationsSpy).toHaveBeenCalled();
    });
  });

  describe('getFormattedGroupedNotifications', () => {
    it('should format grouped notifications with time and entity data', () => {
      const mockGroupedNotifications = [
        {
          title: 'Hoje',
          notifications: [
            {
              id: '1',
              title: 'Test notification',
              message: 'Test message',
              createdAt: new Date('2023-01-01T10:00:00Z'),
              isRead: false,
              type: 'ACTIVITY' as const,
              entityType: NotificationEntityType.ACTIVITY,
              entityId: '123',
            },
          ],
        },
      ];

      mockStoreReturn.getGroupedNotifications.mockReturnValue(
        mockGroupedNotifications
      );

      const { result } = renderHook(() => useNotifications());
      const formatted = result.current.getFormattedGroupedNotifications();

      expect(formatted).toEqual([
        {
          title: 'Hoje',
          notifications: [
            {
              id: '1',
              title: 'Test notification',
              message: 'Test message',
              createdAt: new Date('2023-01-01T10:00:00Z'),
              isRead: false,
              type: 'ACTIVITY',
              entityType: NotificationEntityType.ACTIVITY,
              entityId: '123',
              time: expect.any(String),
            },
          ],
        },
      ]);

      expect(formatted[0].notifications[0].time).toMatch(/\d+ms ago/);
    });

    it('should handle notifications without entityType or entityId', () => {
      const mockGroupedNotifications = [
        {
          title: 'Hoje',
          notifications: [
            {
              id: '1',
              title: 'Test notification',
              message: 'Test message',
              createdAt: new Date('2023-01-01T10:00:00Z'),
              isRead: false,
              type: 'GENERAL' as const,
              entityType: null,
              entityId: null,
            },
          ],
        },
      ];

      mockStoreReturn.getGroupedNotifications.mockReturnValue(
        mockGroupedNotifications
      );

      const { result } = renderHook(() => useNotifications());
      const formatted = result.current.getFormattedGroupedNotifications();

      expect(formatted[0].notifications[0]).toMatchObject({
        entityType: undefined,
        entityId: undefined,
      });
    });

    it('should return empty array when no grouped notifications', () => {
      mockStoreReturn.getGroupedNotifications.mockReturnValue([]);

      const { result } = renderHook(() => useNotifications());
      const formatted = result.current.getFormattedGroupedNotifications();

      expect(formatted).toEqual([]);
    });
  });

  describe('Hook Factory', () => {
    it('should create hook with provided API client', () => {
      const customApiClient: NotificationApiClient = {
        get: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const customUseNotifications = createUseNotifications(customApiClient);

      expect(customUseNotifications).toBeDefined();
      expect(typeof customUseNotifications).toBe('function');
    });
  });
});
