import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEYS } from '@/utils/keys';

/**
 * Interface representing user authentication tokens.
 */
export interface AuthTokens {
  token: string;
  refreshToken: string;
  [key: string]: unknown;
}

/**
 * Interface representing a user profile.
 */
export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Interface representing a user.
 */
export interface User {
  id: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Interface representing session information from the API.
 */
export interface SessionInfo {
  sessionId: string;
  userId: string;
  profileId: string;
  institutionId: string;
  schoolId: string;
  schoolYearId: string;
  classId: string;
  subjects: string[];
  schools: string[];
  [key: string]: unknown;
}

/**
 * Interface defining the authentication state.
 */
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  profiles: UserProfile[];
  selectedProfile: UserProfile | null;
  sessionInfo: SessionInfo | null;

  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setProfiles: (profiles: UserProfile[]) => void;
  setSelectedProfile: (profile: UserProfile | null) => void;
  setSessionInfo: (sessionInfo: SessionInfo | null) => void;
  signIn: (user: User, tokens: AuthTokens, profiles: UserProfile[]) => void;
  signOut: () => void;
  updateUserSession: (sessionData: Partial<User>) => void;
}

/**
 * Zustand store for managing authentication state with persistence.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      profiles: [],
      selectedProfile: null,
      sessionInfo: null,

      /**
       * Set the current user
       * @param {User | null} user - The user object or null to clear
       * @returns {void}
       */
      setUser: (user: User | null): void => {
        set({ user, isAuthenticated: !!user });
      },

      /**
       * Set the authentication tokens
       * @param {AuthTokens | null} tokens - The authentication tokens or null to clear
       * @returns {void}
       */
      setTokens: (tokens: AuthTokens | null): void => {
        set({ tokens });
      },

      /**
       * Set user profiles
       * @param {UserProfile[]} profiles - Array of user profiles
       * @returns {void}
       */
      setProfiles: (profiles: UserProfile[]): void => {
        set({ profiles });
      },

      /**
       * Set the selected profile
       * @param {UserProfile | null} profile - The selected profile or null to clear
       * @returns {void}
       */
      setSelectedProfile: (profile: UserProfile | null): void => {
        set({ selectedProfile: profile });
      },

      /**
       * Set the session info
       * @param {SessionInfo | null} sessionInfo - The session info or null to clear
       * @returns {void}
       */
      setSessionInfo: (sessionInfo: SessionInfo | null): void => {
        set({ sessionInfo });
      },

      /**
       * Sign in user with complete auth data
       * @param {User} user - The user object
       * @param {AuthTokens} tokens - The authentication tokens
       * @param {UserProfile[]} profiles - Array of user profiles
       * @returns {void}
       */
      signIn: (
        user: User,
        tokens: AuthTokens,
        profiles: UserProfile[]
      ): void => {
        set({
          user,
          tokens,
          profiles,
          isAuthenticated: true,
        });
      },

      /**
       * Sign out user and clear all auth data
       * @returns {void}
       */
      signOut: (): void => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          profiles: [],
          selectedProfile: null,
          sessionInfo: null,
        });
      },

      /**
       * Update user session data (after login completion)
       * @param {Partial<User>} sessionData - Partial user data to update
       * @returns {void}
       */
      updateUserSession: (sessionData: Partial<User>): void => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...sessionData };
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: KEYS.AUTH_STORAGE,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
