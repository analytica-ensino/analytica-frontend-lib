import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MyDataResponse } from '../types/user';
import { useAuthStore } from './authStore';

/**
 * API client interface for user store
 */
export interface UserStoreApiClient {
  get: <T>(url: string) => Promise<{ data: T }>;
}

/**
 * Configuration for creating a user store
 */
export interface CreateUserStoreConfig {
  apiClient: UserStoreApiClient;
  storageKey?: string;
  cacheTTL?: number;
}

/**
 * Cache state for user data
 */
interface UserDataCache {
  data: MyDataResponse | null;
  cachedUserId: string | null;
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * User store state interface
 */
export interface UserStoreState extends UserDataCache {
  fetchUserData: (force?: boolean) => Promise<void>;
  clearUserData: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Default cache TTL in milliseconds (5 minutes)
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Check if cache is still valid
 */
const isCacheValid = (
  lastFetched: number | null,
  cacheTTL: number
): boolean => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < cacheTTL;
};

/**
 * Factory function to create a user store with dependency injection
 */
export function createUserStore(config: CreateUserStoreConfig) {
  const {
    apiClient,
    storageKey = 'user-data-storage',
    cacheTTL = DEFAULT_CACHE_TTL,
  } = config;

  /**
   * Get current user data from the backend
   */
  const getMyData = async (): Promise<MyDataResponse> => {
    const response = await apiClient.get<MyDataResponse>('/auth/me');
    return response.data;
  };

  /**
   * Get current user ID from auth store
   */
  const getCurrentUserId = (): string | null => {
    return useAuthStore.getState().user?.id ?? null;
  };

  /**
   * Check if cached data belongs to current user
   */
  const isCacheForCurrentUser = (cachedUserId: string | null): boolean => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      // No current user, cache is invalid
      return false;
    }

    if (!cachedUserId) {
      // No cached user ID, cache is invalid
      return false;
    }

    return cachedUserId === currentUserId;
  };

  return create<UserStoreState>()(
    persist(
      (set, get) => ({
        // Initial state
        data: null,
        cachedUserId: null,
        lastFetched: null,
        isLoading: false,
        error: null,

        /**
         * Fetch user data from API with caching
         */
        fetchUserData: async (force = false): Promise<void> => {
          const { data, cachedUserId, lastFetched, isLoading } = get();

          // Avoid multiple simultaneous requests
          if (isLoading) return;

          // Validate cache belongs to current user
          const cacheValidForUser = isCacheForCurrentUser(cachedUserId);

          // Use cache if valid, belongs to current user, and not forcing refresh
          if (
            !force &&
            data &&
            cacheValidForUser &&
            isCacheValid(lastFetched, cacheTTL)
          ) {
            return;
          }

          // If cache doesn't belong to current user, clear it
          if (!cacheValidForUser && data) {
            set({ data: null, cachedUserId: null, lastFetched: null });
          }

          try {
            set({ isLoading: true, error: null });

            const userData = await getMyData();

            set({
              data: userData,
              cachedUserId: userData.user?.id ?? null,
              lastFetched: Date.now(),
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to fetch user data';

            set({
              isLoading: false,
              error: errorMessage,
            });

            throw error;
          }
        },

        /**
         * Clear all user data from store
         */
        clearUserData: (): void => {
          set({
            data: null,
            cachedUserId: null,
            lastFetched: null,
            isLoading: false,
            error: null,
          });
        },

        /**
         * Set loading state
         */
        setLoading: (loading: boolean): void => {
          set({ isLoading: loading });
        },

        /**
         * Set error state
         */
        setError: (error: string | null): void => {
          set({ error });
        },
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => localStorage),
        // Persist data, cachedUserId and lastFetched (not loading/error states)
        partialize: (state) => ({
          data: state.data,
          cachedUserId: state.cachedUserId,
          lastFetched: state.lastFetched,
        }),
      }
    )
  );
}
