/**
 * Generic adapter for integrating AuthProvider with Zustand stores
 * Users should import this file and pass their store instance
 *
 * @template S - Zustand store type that contains auth-related state
 * @param {object} useAuthStore - Zustand store hook with getState method
 * @param {() => S} useAuthStore.getState - Function to get current store state
 * @returns {object} Adapter object with auth functions
 *
 * @example
 * ```typescript
 * // Define your Zustand store type
 * interface AuthStore {
 *   sessionInfo?: SessionInfo;
 *   tokens?: AuthTokens;
 *   user?: AuthUser;
 *   signOut: () => void;
 * }
 *
 * // Create the adapter
 * const authAdapter = createZustandAuthAdapter(useAuthStore);
 *
 * // Use with AuthProvider
 * <AuthProvider
 *   checkAuthFn={authAdapter.checkAuth}
 *   signOutFn={authAdapter.signOut}
 *   getUserFn={authAdapter.getUser}
 *   getSessionFn={authAdapter.getSessionInfo}
 *   getTokensFn={authAdapter.getTokens}
 * >
 *   <App />
 * </AuthProvider>
 * ```
 */
export function createZustandAuthAdapter<
  S extends {
    sessionInfo?: unknown;
    tokens?: unknown;
    user?: unknown;
    signOut?: () => void;
  },
>(useAuthStore: { getState: () => S }) {
  return {
    /**
     * Check if the user is authenticated based on sessionInfo and tokens
     *
     * @returns {Promise<boolean>} Promise that resolves to authentication status
     */
    checkAuth: async (): Promise<boolean> => {
      const { sessionInfo, tokens } = useAuthStore.getState();
      return Boolean(sessionInfo && tokens);
    },
    /**
     * Get the current user from the store
     *
     * @returns {unknown} Current user data from the store
     */
    getUser: () => useAuthStore.getState().user,
    /**
     * Get the current session information from the store
     *
     * @returns {unknown} Current session info from the store
     */
    getSessionInfo: () => useAuthStore.getState().sessionInfo,
    /**
     * Get the current authentication tokens from the store
     *
     * @returns {unknown} Current tokens from the store
     */
    getTokens: () => useAuthStore.getState().tokens,
    /**
     * Sign out the user by calling the store's signOut function if available
     *
     * @returns {void}
     */
    signOut: () => {
      const signOutFn = useAuthStore.getState().signOut;
      if (typeof signOutFn === 'function') signOutFn();
    },
  };
}
