import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Options interface for the useUrlAuthentication hook
 *
 * @template Tokens - Type for authentication tokens
 * @template Session - Type for session information
 * @template Profile - Type for profile information
 *
 * @interface UseUrlAuthOptions
 * @property {(tokens: Tokens) => void} setTokens - Function to set authentication tokens
 * @property {(session: Session) => void} setSessionInfo - Function to set session information
 * @property {(profile: Profile) => void} [setSelectedProfile] - Optional function to set selected profile
 * @property {object} api - API instance with get method
 * @property {(endpoint: string, config: unknown) => Promise<unknown>} api.get - API get method
 * @property {string} endpoint - API endpoint to fetch session data
 * @property {(searchParams: URLSearchParams) => object} [extractParams] - Custom parameter extraction function
 * @property {() => void} [clearParamsFromURL] - Function to clear URL parameters after processing
 */
export interface UseUrlAuthOptions<
  Tokens = unknown,
  Session = unknown,
  Profile = unknown,
> {
  setTokens: (tokens: Tokens) => void;
  setSessionInfo: (session: Session) => void;
  setSelectedProfile?: (profile: Profile) => void;
  api: { get: (endpoint: string, config: unknown) => Promise<unknown> };
  endpoint: string;
  extractParams?: (searchParams: URLSearchParams) => {
    sessionId: string;
    token: string;
    refreshToken: string;
  };
  clearParamsFromURL?: () => void;
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
 * Hook for handling URL-based authentication
 * Extracts authentication parameters from URL and processes them
 *
 * @template Tokens - Type for authentication tokens
 * @template Session - Type for session information
 * @template Profile - Type for profile information
 *
 * @param {UseUrlAuthOptions<Tokens, Session, Profile>} options - Configuration options
 * @returns {void}
 *
 * @example
 * ```typescript
 * useUrlAuthentication({
 *   setTokens: (tokens) => authStore.setTokens(tokens),
 *   setSessionInfo: (session) => authStore.setSessionInfo(session),
 *   setSelectedProfile: (profile) => authStore.setProfile(profile),
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
>(options: UseUrlAuthOptions<Tokens, Session, Profile>) {
  const location = useLocation();

  useEffect(() => {
    /**
     * Main authentication handler that processes URL parameters
     *
     * @returns {Promise<void>}
     * @private
     */
    const handleAuthentication = async () => {
      const authParams = getAuthParams(location, options.extractParams);

      if (!hasValidAuthParams(authParams)) {
        return;
      }

      try {
        options.setTokens({
          token: authParams.token,
          refreshToken: authParams.refreshToken,
        } as Tokens);

        const response = (await options.api.get(options.endpoint, {
          headers: {
            Authorization: `Bearer ${authParams.token}`,
          },
        })) as { data: { data: unknown; [key: string]: unknown } };

        options.setSessionInfo(response.data.data as Session);
        handleProfileSelection(response.data.data, options.setSelectedProfile);
        options.clearParamsFromURL?.();
      } catch (error) {
        console.error('Erro ao obter informações da sessão:', error);
      }
    };

    handleAuthentication();
  }, [
    location.search,
    options.setSessionInfo,
    options.setSelectedProfile,
    options.setTokens,
    options.api,
    options.endpoint,
    options.extractParams,
    options.clearParamsFromURL,
  ]);
}
