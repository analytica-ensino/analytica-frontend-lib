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
 * @property {object} api - API instance with get (and post, for the hand-off code) methods
 * @property {(endpoint: string, config: unknown) => Promise<unknown>} api.get - API get method
 * @property {(endpoint: string, data?: unknown, config?: unknown) => Promise<unknown>} [api.post] - API post method,
 *   needed to trade the ?authCode= hand-off code and to revoke a declined session
 * @property {string} endpoint - API endpoint to fetch session data
 * @property {string} [exchangeEndpoint] - Endpoint that trades the ?authCode= for tokens (default: '/auth/exchange')
 * @property {string} [logoutEndpoint] - Endpoint that revokes a session (default: '/auth/logout')
 * @property {(searchParams: URLSearchParams) => object} [extractParams] - Custom parameter extraction function
 * @property {(incomingSession: Session) => boolean | Promise<boolean>} [confirmSessionReplace] - Called with the
 *   session the URL opens, before anything is stored. Return false to keep the current session: the URL's session
 *   is revoked and dropped. Used to ask before replacing another user's session.
 * @property {() => void} [clearParamsFromURL] - Function to clear URL parameters after processing
 * @property {number} [maxRetries] - Maximum number of retry attempts (default: 3)
 * @property {number} [retryDelay] - Base delay between retries in milliseconds (default: 1000)
 * @property {(error: unknown) => void} [onError] - Error handler callback
 * @property {() => void} [onAuthHydrated] - Called after session is stored, before URL params are cleared.
 *   Use this to re-run the auth context check so guards re-evaluate immediately,
 *   preventing the "Área Restrita" flash on the first login redirect.
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
  api: {
    get: (endpoint: string, config: unknown) => Promise<unknown>;
    post?: (
      endpoint: string,
      data?: unknown,
      config?: unknown
    ) => Promise<unknown>;
  };
  endpoint: string;
  exchangeEndpoint?: string;
  logoutEndpoint?: string;
  extractParams?: (searchParams: URLSearchParams) => UrlAuthParams;
  confirmSessionReplace?: (
    incomingSession: Session
  ) => boolean | Promise<boolean>;
  clearParamsFromURL?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: unknown) => void;
  onAuthHydrated?: () => void | Promise<void>;
}

/**
 * Authentication parameters a URL can carry: the single-use hand-off code
 * (current), or the tokens themselves (apps that were not migrated yet)
 */
export interface UrlAuthParams {
  code?: string | null;
  sessionId?: string | null;
  token?: string | null;
  refreshToken?: string | null;
}

/**
 * Tokens of the session a URL opens
 */
interface UrlSessionTokens {
  sessionId: string;
  token: string;
  refreshToken: string;
}

/**
 * Helper function to extract authentication parameters from URL
 *
 * @param {object} location - Location object with search property
 * @param {string} location.search - URL search string
 * @param {function} [extractParams] - Custom parameter extraction function
 * @returns {object} Object with code, sessionId, token, and refreshToken
 *
 * @private
 */
const getAuthParams = (
  location: { search: string },
  extractParams?: (searchParams: URLSearchParams) => UrlAuthParams
): UrlAuthParams => {
  const searchParams = new URLSearchParams(location.search);
  return extractParams
    ? extractParams(searchParams)
    : {
        code: searchParams.get('authCode'),
        sessionId: searchParams.get('sessionId'),
        token: searchParams.get('token'),
        refreshToken: searchParams.get('refreshToken'),
      };
};

/**
 * Helper function to validate authentication parameters
 *
 * @param {UrlAuthParams} authParams - Authentication parameters object
 * @returns {boolean} True when there is a code, or all three tokens
 *
 * @private
 */
const hasValidAuthParams = (authParams: UrlAuthParams) => {
  return !!(
    authParams?.code ||
    (authParams?.sessionId && authParams?.token && authParams?.refreshToken)
  );
};

/**
 * Get the tokens of the session the URL opens
 *
 * The login app and the backoffice send a single-use code, traded here for the
 * tokens: tokens in the URL stayed in the history and in server logs. Tokens
 * are still read straight from the URL for senders not migrated yet.
 *
 * @param {UrlAuthParams} authParams - Parameters read from the URL
 * @param {object} api - API instance
 * @param {string} exchangeEndpoint - Endpoint that trades the code
 * @returns {Promise<UrlSessionTokens>} The session tokens
 *
 * @private
 */
const resolveSessionTokens = async (
  authParams: UrlAuthParams,
  api: UseUrlAuthOptions['api'],
  exchangeEndpoint: string
): Promise<UrlSessionTokens> => {
  if (!authParams.code) {
    return {
      sessionId: authParams.sessionId!,
      token: authParams.token!,
      refreshToken: authParams.refreshToken!,
    };
  }

  if (!api.post) {
    throw new Error('api.post é necessário para trocar o código de acesso');
  }
  const response = (await api.post(exchangeEndpoint, {
    code: authParams.code,
  })) as { data: { data: UrlSessionTokens } };
  return response.data.data;
};

/**
 * Revoke a session the user chose not to open. Best effort: a failure leaves
 * a session nobody holds the tokens of.
 *
 * @param {object} api - API instance
 * @param {string} logoutEndpoint - Endpoint that revokes a session
 * @param {UrlSessionTokens} tokens - Tokens of the declined session
 *
 * @private
 */
const revokeDeclinedSession = (
  api: UseUrlAuthOptions['api'],
  logoutEndpoint: string,
  tokens: UrlSessionTokens
) => {
  api
    .post?.(logoutEndpoint, {
      sessionId: tokens.sessionId,
      refreshToken: tokens.refreshToken,
    })
    .catch(() => undefined);
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
        const sessionTokens = await resolveSessionTokens(
          authParams,
          options.api,
          options.exchangeEndpoint ?? '/auth/exchange'
        );

        // Session-info runs with the URL's token before anything is stored,
        // so a session the user declines (or one that fails) never replaces
        // the current one
        // Call session-info with proper error handling and retry
        const maxRetries = options.maxRetries || 3;
        const retryDelay = options.retryDelay || 1000;
        let retries = 0;
        let sessionData = null;

        while (retries < maxRetries && !sessionData) {
          try {
            const response = (await options.api.get(options.endpoint, {
              headers: {
                Authorization: `Bearer ${sessionTokens.token}`,
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

        // A link that opens another user's session must not swap the account
        // in use without asking (login CSRF: what the victim types would land
        // in the attacker's account)
        if (
          options.confirmSessionReplace &&
          !(await options.confirmSessionReplace(sessionData as Session))
        ) {
          revokeDeclinedSession(
            options.api,
            options.logoutEndpoint ?? '/auth/logout',
            sessionTokens
          );
          options.clearParamsFromURL?.();
          return;
        }

        options.setTokens({
          token: sessionTokens.token,
          refreshToken: sessionTokens.refreshToken,
        } as Tokens);

        // Always call setSessionInfo with the received data (even if null)
        options.setSessionInfo(sessionData as Session);
        handleProfileSelection(sessionData, options.setSelectedProfile);
        handleUserData(sessionData, options.setUser);
        // Notify caller that auth state is hydrated into the store so any
        // auth context can re-check before URL params are removed.
        if (options.onAuthHydrated) await options.onAuthHydrated();
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
    options.exchangeEndpoint,
    options.logoutEndpoint,
    options.extractParams,
    options.confirmSessionReplace,
    options.clearParamsFromURL,
    options.maxRetries,
    options.retryDelay,
    options.onError,
    options.onAuthHydrated,
  ]);
}
