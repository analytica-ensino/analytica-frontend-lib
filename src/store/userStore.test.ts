import { createUserStore, type UserStoreApiClient } from './userStore';
import type { MyDataResponse } from '../types/user';
import { useAuthStore } from './authStore';

// Mock authStore
jest.mock('./authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({ user: null })),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('createUserStore', () => {
  const mockUserData: MyDataResponse = {
    message: 'Success',
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      active: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    userInfos: {
      id: '1',
      userId: 'user-1',
      urlProfilePicture: null,
      genre: null,
      facebook: null,
      instagram: null,
      studentNumber: null,
      street: null,
      streetNumber: null,
      neighborhood: null,
      complement: null,
      city: null,
      state: null,
      zipCode: null,
      timeSpent: 0,
      lastInteraction: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    userInstitutions: [
      {
        profile: {
          id: '1',
          name: 'Student',
          description: 'Student',
          position: 1,
        },
        institution: { id: '1', name: 'Test School', type: 'school' },
        school: { id: '1', name: 'Test School' },
        schoolYear: { id: '1', name: '2023' },
        class: { id: '1', name: '3A' },
      },
    ],
    subTeacherTopicClasses: [],
  };

  const mockUserData2: MyDataResponse = {
    ...mockUserData,
    message: 'Success User 2',
    user: {
      ...mockUserData.user,
      id: 'user-2',
      email: 'user2@example.com',
      name: 'User Two',
    },
  };

  let mockApiClient: UserStoreApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    jest.useFakeTimers();

    // Default: user-1 logged in
    (useAuthStore.getState as jest.Mock).mockReturnValue({ user: { id: 'user-1' } });

    mockApiClient = {
      get: jest.fn(),
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial state', () => {
    it('should have correct initial state', () => {
      const useUserStore = createUserStore({ apiClient: mockApiClient });
      const state = useUserStore.getState();

      expect(state.data).toBeNull();
      expect(state.cachedUserId).toBeNull();
      expect(state.lastFetched).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should use default storage key', () => {
      createUserStore({ apiClient: mockApiClient });

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'user-data-storage'
      );
    });

    it('should use custom storage key', () => {
      createUserStore({
        apiClient: mockApiClient,
        storageKey: 'custom-storage-key',
      });

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'custom-storage-key'
      );
    });
  });

  describe('fetchUserData', () => {
    it('should fetch user data successfully', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockUserData,
      });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      await useUserStore.getState().fetchUserData();

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(useUserStore.getState().data).toEqual(mockUserData);
      expect(useUserStore.getState().cachedUserId).toBe('user-1');
      expect(useUserStore.getState().isLoading).toBe(false);
      expect(useUserStore.getState().error).toBeNull();
      expect(useUserStore.getState().lastFetched).toBeGreaterThan(0);
    });

    it('should set loading state during fetch', async () => {
      (mockApiClient.get as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: mockUserData }), 100)
          )
      );

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      const fetchPromise = useUserStore.getState().fetchUserData();

      expect(useUserStore.getState().isLoading).toBe(true);
      expect(useUserStore.getState().error).toBeNull();

      jest.advanceTimersByTime(100);
      await fetchPromise;

      expect(useUserStore.getState().isLoading).toBe(false);
      expect(useUserStore.getState().data).toEqual(mockUserData);
    });

    it('should handle fetch error', async () => {
      const errorMessage = 'Network Error';
      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      await expect(useUserStore.getState().fetchUserData()).rejects.toThrow(
        errorMessage
      );

      expect(useUserStore.getState().isLoading).toBe(false);
      expect(useUserStore.getState().error).toBe(errorMessage);
      expect(useUserStore.getState().data).toBeNull();
    });

    it('should handle non-Error exception', async () => {
      (mockApiClient.get as jest.Mock).mockRejectedValueOnce('String error');

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      await expect(useUserStore.getState().fetchUserData()).rejects.toBe(
        'String error'
      );

      expect(useUserStore.getState().error).toBe('Failed to fetch user data');
    });

    it('should use cache when valid', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockUserData,
      });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // First fetch
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);

      // Second fetch (should use cache)
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should ignore cache when force = true', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: mockUserData,
      });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // First fetch
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);

      // Second fetch with force = true
      await useUserStore.getState().fetchUserData(true);
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });

    it('should ignore cache when expired (default TTL)', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: mockUserData,
      });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // First fetch
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);

      // Advance time beyond default TTL (5 minutes)
      jest.advanceTimersByTime(6 * 60 * 1000);

      // Second fetch (cache expired)
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });

    it('should respect custom cacheTTL', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: mockUserData,
      });

      // Custom TTL of 1 minute
      const useUserStore = createUserStore({
        apiClient: mockApiClient,
        cacheTTL: 60 * 1000,
      });

      // First fetch
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);

      // Advance time within custom TTL (30 seconds)
      jest.advanceTimersByTime(30 * 1000);

      // Second fetch (should use cache)
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);

      // Advance time beyond custom TTL
      jest.advanceTimersByTime(31 * 1000);

      // Third fetch (cache expired)
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });

    it('should avoid multiple simultaneous requests', async () => {
      (mockApiClient.get as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: mockUserData }), 100)
          )
      );

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // Start multiple requests simultaneously
      const promise1 = useUserStore.getState().fetchUserData();
      const promise2 = useUserStore.getState().fetchUserData();
      const promise3 = useUserStore.getState().fetchUserData();

      jest.advanceTimersByTime(100);
      await Promise.all([promise1, promise2, promise3]);

      // Only one request should be made
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Session validation (useAuthStore)', () => {
    it('should invalidate cache when auth user changes', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ user: { id: 'user-1' } });

      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockUserData })
        .mockResolvedValueOnce({ data: mockUserData2 });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // First fetch as user-1
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(useUserStore.getState().cachedUserId).toBe('user-1');

      // Simulate user switch
      (useAuthStore.getState as jest.Mock).mockReturnValue({ user: { id: 'user-2' } });

      // Second fetch (should invalidate cache and fetch new data)
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      expect(useUserStore.getState().cachedUserId).toBe('user-2');
      expect(useUserStore.getState().data).toEqual(mockUserData2);
    });

    it('should use cache when auth user is the same', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ user: { id: 'user-1' } });

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockUserData,
      });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // First fetch
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);

      // Second fetch (should use cache since same user)
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache when auth user is null (logged out)', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ user: { id: 'user-1' } });

      (mockApiClient.get as jest.Mock).mockResolvedValue({
        data: mockUserData,
      });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // First fetch as user-1
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);

      // Simulate logout (no current user)
      (useAuthStore.getState as jest.Mock).mockReturnValue({ user: null });

      // Second fetch (should invalidate cache)
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });

    it('should clear cached data when user changes', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ user: { id: 'user-1' } });

      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockUserData })
        .mockResolvedValueOnce({ data: mockUserData2 });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // Fetch as user-1
      await useUserStore.getState().fetchUserData();
      expect(useUserStore.getState().data?.user.id).toBe('user-1');

      // Switch user
      (useAuthStore.getState as jest.Mock).mockReturnValue({ user: { id: 'user-2' } });

      // Fetch should clear old data and get new data
      await useUserStore.getState().fetchUserData();
      expect(useUserStore.getState().data?.user.id).toBe('user-2');
    });
  });

  describe('clearUserData', () => {
    it('should clear all user data including cachedUserId', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockUserData,
      });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // First fetch data
      await useUserStore.getState().fetchUserData();
      expect(useUserStore.getState().data).toEqual(mockUserData);
      expect(useUserStore.getState().cachedUserId).toBe('user-1');

      // Clear data
      useUserStore.getState().clearUserData();

      expect(useUserStore.getState().data).toBeNull();
      expect(useUserStore.getState().cachedUserId).toBeNull();
      expect(useUserStore.getState().lastFetched).toBeNull();
      expect(useUserStore.getState().isLoading).toBe(false);
      expect(useUserStore.getState().error).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      const useUserStore = createUserStore({ apiClient: mockApiClient });

      useUserStore.getState().setLoading(true);
      expect(useUserStore.getState().isLoading).toBe(true);

      useUserStore.getState().setLoading(false);
      expect(useUserStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error state', () => {
      const useUserStore = createUserStore({ apiClient: mockApiClient });

      const errorMessage = 'Test error';

      useUserStore.getState().setError(errorMessage);
      expect(useUserStore.getState().error).toBe(errorMessage);

      useUserStore.getState().setError(null);
      expect(useUserStore.getState().error).toBeNull();
    });
  });

  describe('Cache validation', () => {
    it('should consider cache invalid when lastFetched is null', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockUserData,
      });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // Initial state should have lastFetched null
      expect(useUserStore.getState().lastFetched).toBeNull();

      await useUserStore.getState().fetchUserData();

      // Should make request since lastFetched was null
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should consider cache valid within TTL', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockUserData,
      });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // First fetch
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);

      // Advance time within TTL (3 minutes)
      jest.advanceTimersByTime(3 * 60 * 1000);

      // Second fetch (should use cache)
      await useUserStore.getState().fetchUserData();
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Factory isolation', () => {
    it('should create independent store instances', async () => {
      const mockApiClient1: UserStoreApiClient = {
        get: jest.fn().mockResolvedValue({ data: mockUserData }),
      };

      const mockApiClient2: UserStoreApiClient = {
        get: jest.fn().mockResolvedValue({
          data: { ...mockUserData, message: 'Different' },
        }),
      };

      const useUserStore1 = createUserStore({
        apiClient: mockApiClient1,
        storageKey: 'store-1',
      });

      const useUserStore2 = createUserStore({
        apiClient: mockApiClient2,
        storageKey: 'store-2',
      });

      await useUserStore1.getState().fetchUserData();
      await useUserStore2.getState().fetchUserData();

      expect(useUserStore1.getState().data?.message).toBe('Success');
      expect(useUserStore2.getState().data?.message).toBe('Different');

      // Clear one store should not affect the other
      useUserStore1.getState().clearUserData();

      expect(useUserStore1.getState().data).toBeNull();
      expect(useUserStore2.getState().data?.message).toBe('Different');
    });
  });

  describe('Integration', () => {
    it('should execute complete flow: fetch -> clear', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockUserData,
      });

      const useUserStore = createUserStore({ apiClient: mockApiClient });

      // 1. Initial fetch
      await useUserStore.getState().fetchUserData();
      expect(useUserStore.getState().data).toEqual(mockUserData);
      expect(useUserStore.getState().cachedUserId).toBe('user-1');
      expect(useUserStore.getState().error).toBeNull();

      // 2. Clear
      useUserStore.getState().clearUserData();
      expect(useUserStore.getState().data).toBeNull();
      expect(useUserStore.getState().cachedUserId).toBeNull();
      expect(useUserStore.getState().lastFetched).toBeNull();
    });
  });
});
