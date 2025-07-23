import { useMemo } from 'react';

/**
 * Type definition for API client with get method
 *
 * @template T - Type extending object with get method
 */
type ApiClient<T = unknown> = {
  get: (endpoint: string, config?: T) => Promise<unknown>;
};

/**
 * Creates a memoized API configuration object compatible with useUrlAuthentication
 *
 * This hook wraps an API client instance to create a consistent interface
 * for the useUrlAuthentication hook, ensuring proper memoization to prevent
 * unnecessary re-renders.
 *
 * @template T - Generic type for API client configuration
 * @param {ApiClient<T>} api - Axios instance or any API client with a get method
 * @returns {object} Memoized API configuration object with get method
 *
 * @example
 * ```typescript
 * import { useApiConfig } from 'analytica-frontend-lib';
 * import { useApi } from './services/apiService';
 *
 * function App() {
 *   const api = useApi();
 *   const apiConfig = useApiConfig(api);
 *
 *   useUrlAuthentication({
 *     setTokens,
 *     setSessionInfo,
 *     setSelectedProfile,
 *     api: apiConfig,
 *     endpoint: '/auth/session-info',
 *   });
 * }
 * ```
 */
export function useApiConfig<T = unknown>(api: ApiClient<T>) {
  return useMemo(
    () => ({
      get: (endpoint: string, config: unknown) =>
        api.get(endpoint, config as T),
    }),
    [api]
  );
}
