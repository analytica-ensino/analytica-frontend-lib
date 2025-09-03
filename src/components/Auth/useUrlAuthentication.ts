import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Options interface for the useUrlAuthentication hook
 *
 * @template Tokens - Type for authentication tokens
 * @template Session - Type for session information
 * @template Profile - Type for profile information
 * @template User - Type for user information
 *
 * @interface UseUrlAuthOptions
 * @property {(tokens: Tokens) => void} setTokens - Function to set authentication tokens
 * @property {(session: Session) => void} setSessionInfo - Function to set session information
 * @property {(profile: Profile) => void} [setSelectedProfile] - Optional function to set selected profile
 * @property {(user: User) => void} [setUser] - Optional function to set user data
 * @property {object} api - API instance with get method
 * @property {(endpoint: string, config: unknown) => Promise<unknown>} api.get - API get method
 * @property {string} endpoint - API endpoint to fetch session data
 * @property {(searchParams: URLSearchParams) => object} [extractParams] - Custom parameter extraction function
 * @property {() => void} [clearParamsFromURL] - Function to clear URL parameters after processing
 * @property {number} [maxRetries] - Maximum number of retry attempts (default: 3)
 * @property {number} [retryDelay] - Base delay between retries in milliseconds (default: 1000)
 * @property {(error: unknown) => void} [onError] - Error handler callback
 */
export interface UseUrlAuthOptions<
  Tokens = unknown,
  Session = unknown,
  Profile = unknown,
  User = unknown,
> {
  setTokens: (tokens: Tokens) => void;
  setSessionInfo: (session: Session) => void;
  setSelectedProfile?: (profile: Profile) => void;
  setUser?: (user: User) => void;
  api: { get: (endpoint: string, config: unknown) => Promise<unknown> };
  endpoint: string;
  extractParams?: (searchParams: URLSearchParams) => {
    sessionId: string;
    token: string;
    refreshToken: string;
  };
  clearParamsFromURL?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: unknown) => void;
}

/**
 * Helper function to extract authentication parameters from URL
 *
 * @param {object} location - Location object with search property
 * @param {string} location.search - URL search string
 * @param {function} [extractParams] - Custom parameter extraction function
 * @returns {object} Object with sessionId, token, and refreshToken
 *
 * @private
 */
const getAuthParams = (
  location: { search: string },
  extractParams?: (searchParams: URLSearchParams) => {
    sessionId: string;
    token: string;
    refreshToken: string;
  }
) => {
  const searchParams = new URLSearchParams(location.search);
  return extractParams
    ? extractParams(searchParams)
    : {
        sessionId: searchParams.get('sessionId'),
        token: searchParams.get('token'),
        refreshToken: searchParams.get('refreshToken'),
      };
};

/**
 * Helper function to validate authentication parameters
 *
 * @param {object} authParams - Authentication parameters object
 * @param {string | null} authParams.sessionId - Session ID from URL
 * @param {string | null} authParams.token - Authentication token from URL
 * @param {string | null} authParams.refreshToken - Refresh token from URL
 * @returns {boolean} True if all required parameters are present
 *
 * @private
 */
const hasValidAuthParams = (authParams: {
  sessionId: string | null;
  token: string | null;
  refreshToken: string | null;
}) => {
  return !!(
    authParams?.sessionId &&
    authParams?.token &&
    authParams?.refreshToken
  );
};

/**
 * Helper function to check if response has valid profile data
 *
 * @param {unknown} data - Response data to validate
 * @returns {data is Record<string, unknown>} Type guard for valid profile data
 *
 * @private
 */
const hasValidProfileData = (
  data: unknown
): data is Record<string, unknown> => {
  return data !== null && typeof data === 'object' && data !== undefined;
};

/**
 * Helper function to handle profile selection from response data
 *
 * @template Profile - Profile type
 * @param {unknown} responseData - Response data from API
 * @param {(profile: Profile) => void} [setSelectedProfile] - Optional function to set selected profile
 * @returns {void}
 *
 * @private
 */
const handleProfileSelection = <Profile>(
  responseData: unknown,
  setSelectedProfile?: (profile: Profile) => void
) => {
  if (!setSelectedProfile) return;
  if (!hasValidProfileData(responseData)) return;

  const profileId = responseData.profileId;
  const isValidProfileId = profileId !== null && profileId !== undefined;

  if (isValidProfileId) {
    setSelectedProfile({
      id: profileId,
    } as Profile);
  }
};

/**
 * Helper function to handle user data extraction from response data
 *
 * @template User - User type
 * @param {unknown} responseData - Response data from API
 * @param {(user: User) => void} [setUser] - Optional function to set user data
 * @returns {void}
 *
 * @private
 */
const handleUserData = <User>(
  responseData: unknown,
  setUser?: (user: User) => void
) => {
  if (!setUser) return;
  if (!hasValidProfileData(responseData)) return;

  // Extrair dados do usuário da resposta da API
  const userId = responseData.userId;
  const userName = responseData.userName;
  const userEmail = responseData.userEmail;

  if (userId) {
    const userData: Record<string, unknown> = {
      id: userId,
    };

    if (userName) {
      userData.name = userName;
    }

    if (userEmail) {
      userData.email = userEmail;
    }

    // Adicionar outros campos conforme necessário
    setUser(userData as User);
  }
};

/**
 * Hook for handling URL-based authentication
 * Extracts authentication parameters from URL and processes them
 *
 * @template Tokens - Type for authentication tokens
 * @template Session - Type for session information
 * @template Profile - Type for profile information
 * @template User - Type for user information
 *
 * @param {UseUrlAuthOptions<Tokens, Session, Profile, User>} options - Configuration options
 * @returns {void}
 *
 * @example
 * ```typescript
 * useUrlAuthentication({
 *   setTokens: (tokens) => authStore.setTokens(tokens),
 *   setSessionInfo: (session) => authStore.setSessionInfo(session),
 *   setSelectedProfile: (profile) => authStore.setProfile(profile),
 *   setUser: (user) => authStore.setUser(user),
 *   api: apiInstance,
 *   endpoint: '/auth/session',
 *   clearParamsFromURL: () => navigate('/', { replace: true })
 * });
 * ```
 */
export function useUrlAuthentication<
  Tokens = unknown,
  Session = unknown,
  Profile = unknown,
  User = unknown,
>(options: UseUrlAuthOptions<Tokens, Session, Profile, User>) {
  const location = useLocation();
  const processedRef = useRef(false);

  useEffect(() => {
    /**
     * Main authentication handler that processes URL parameters
     *
     * @private
     */
    const handleAuthentication = async (): Promise<void> => {
      // Check if we already processed this request
      if (processedRef.current) {
        return;
      }

      const authParams = getAuthParams(location, options.extractParams);

      // Only proceed if we have all required auth parameters
      if (!hasValidAuthParams(authParams)) {
        return;
      }

      // Mark as processed to prevent multiple calls
      processedRef.current = true;

      try {
        // Set tokens first
        options.setTokens({
          token: authParams.token,
          refreshToken: authParams.refreshToken,
        } as Tokens);

        // Call session-info with proper error handling and retry
        const maxRetries = options.maxRetries || 3;
        const retryDelay = options.retryDelay || 1000;
        let retries = 0;
        let sessionData = null;

        while (retries < maxRetries && !sessionData) {
          try {
            const response = (await options.api.get(options.endpoint, {
              headers: {
                Authorization: `Bearer ${authParams.token}`,
              },
            })) as { data: { data: unknown; [key: string]: unknown } };

            sessionData = response.data.data;
            break;
          } catch (error) {
            retries++;
            console.warn(
              `Tentativa ${retries}/${maxRetries} falhou para ${options.endpoint}:`,
              error
            );

            if (retries < maxRetries) {
              // Wait before retry (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, retryDelay * retries)
              );
            } else {
              throw error;
            }
          }
        }

        // Always call setSessionInfo with the received data (even if null)
        options.setSessionInfo(sessionData as Session);
        handleProfileSelection(sessionData, options.setSelectedProfile);
        handleUserData(sessionData, options.setUser);
        options.clearParamsFromURL?.();
      } catch (error) {
        console.error('Erro ao obter informações da sessão:', error);
        // Reset processed flag on error to allow retry
        processedRef.current = false;
        // Call error handler if provided
        options.onError?.(error);
      }
    };

    handleAuthentication();
  }, [
    location.search,
    options.setSessionInfo,
    options.setSelectedProfile,
    options.setUser,
    options.setTokens,
    options.api,
    options.endpoint,
    options.extractParams,
    options.clearParamsFromURL,
    options.maxRetries,
    options.retryDelay,
    options.onError,
  ]);
}
