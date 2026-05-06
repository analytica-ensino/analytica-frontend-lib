import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MyDataResponse, UpdateMyDataRequest } from '../types/user';

/**
 * API client interface for user store
 */
export interface UserStoreApiClient {
  get: <T>(url: string) => Promise<{ data: T }>;
  patch: (url: string, data: unknown) => Promise<unknown>;
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
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * User store state interface
 */
export interface UserStoreState extends UserDataCache {
  fetchUserData: (force?: boolean) => Promise<void>;
  updateUserData: (updateData: UpdateMyDataRequest) => Promise<void>;
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
   * Update user data in the backend
   */
  const updateMyData = async (data: UpdateMyDataRequest): Promise<void> => {
    await apiClient.patch('/user/me', data);
  };

  return create<UserStoreState>()(
    persist(
      (set, get) => ({
        // Initial state
        data: null,
        lastFetched: null,
        isLoading: false,
        error: null,

        /**
         * Fetch user data from API with caching
         */
        fetchUserData: async (force = false): Promise<void> => {
          const { data, lastFetched, isLoading } = get();

          // Avoid multiple simultaneous requests
          if (isLoading) return;

          // Use cache if valid and not forcing refresh
          if (!force && data && isCacheValid(lastFetched, cacheTTL)) {
            return;
          }

          try {
            set({ isLoading: true, error: null });

            const userData = await getMyData();

            set({
              data: userData,
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
         * Update user data and refresh cache
         */
        updateUserData: async (
          updateData: UpdateMyDataRequest
        ): Promise<void> => {
          try {
            set({ isLoading: true, error: null });

            await updateMyData(updateData);

            // Refresh data after successful update
            const userData = await getMyData();

            set({
              data: userData,
              lastFetched: Date.now(),
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to update user data';

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
        // Only persist data and lastFetched, not loading/error states
        partialize: (state) => ({
          data: state.data,
          lastFetched: state.lastFetched,
        }),
      }
    )
  );
}
