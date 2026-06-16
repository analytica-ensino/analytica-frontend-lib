import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEYS } from '../utils/keys';
import { useAuthStore } from './authStore';
import type { AxiosInstance } from 'axios';
import {
  type ModulesConfig,
  DEFAULT_MODULES,
  mergeModulesConfig,
} from '../types/modulesConfig';

/**
 * Default modules configuration - all enabled
 */
const defaultModules = DEFAULT_MODULES;

/**
 * Interface defining the modules state
 */
export interface ModulesState {
  modules: ModulesConfig;
  loading: boolean;
  ownerInstitutionId: string | null;
  ownerProfileType: string | null;

  /**
   * Fetch modules configuration from the API
   * @param institutionId - The institution UUID
   * @param api - Axios instance for API calls
   * @param profileType - Optional profile type (STUDENT, TEACHER, UNIT_MANAGER, etc.)
   */
  fetchModules: (
    institutionId: string,
    api: AxiosInstance,
    profileType?: string
  ) => Promise<void>;
  clearModules: () => void;
}

/**
 * API response structure for modules feature flag
 */
interface ModulesFeatureFlagResponse {
  data: {
    featureFlags: {
      institutionId: string;
      page: string;
      profileType?: string | null;
      version: Partial<ModulesConfig>;
      isDefault?: boolean;
      isProfileSpecific?: boolean;
    };
  } | null;
}

// Guard against stale async responses
let latestRequestId = 0;

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Delay helper for retry backoff
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if modules are already cached in localStorage for the given profile
 */
const hasCachedModules = (profileType?: string): boolean => {
  const cached = localStorage.getItem(KEYS.MODULES_STORAGE);
  if (!cached) return false;

  try {
    const parsed = JSON.parse(cached);
    // Check both institution and profile match
    const hasInstitution = Boolean(parsed.state?.ownerInstitutionId);
    const profileMatches =
      !profileType || parsed.state?.ownerProfileType === profileType;
    return hasInstitution && profileMatches;
  } catch {
    return false;
  }
};

/**
 * Check if this request has been superseded by a newer one
 */
const isStaleRequest = (requestId: number): boolean =>
  requestId !== latestRequestId;

/**
 * Attempt to fetch modules from API with retry logic
 * Returns the modules config on success, null on failure
 */
const fetchWithRetry = async (
  institutionId: string,
  api: AxiosInstance,
  requestId: number,
  profileType?: string
): Promise<Partial<ModulesConfig> | null> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await delay(INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1));
    }

    if (isStaleRequest(requestId)) return null;

    try {
      // Use the new profile-specific endpoint if profileType is provided
      const endpoint = profileType
        ? `/featureFlags/institution/${institutionId}/page/MODULES/profile/${profileType}`
        : `/featureFlags/institution/${institutionId}/page/MODULES`;

      const response = await api.get<ModulesFeatureFlagResponse>(endpoint);

      if (isStaleRequest(requestId)) return null;

      return response.data?.data?.featureFlags?.version ?? {};
    } catch {
      // Continue to next retry attempt
    }
  }

  console.warn('[modulesStore] Failed to fetch modules after retries');
  return null;
};

/**
 * Zustand store for managing modules visibility with persistence
 * Works with all frontends (student, professor, gestor)
 * Supports profile-specific feature flags
 */
export const useModulesStore = create<ModulesState>()(
  persist(
    (set) => ({
      modules: defaultModules,
      loading: false,
      ownerInstitutionId: null,
      ownerProfileType: null,

      /**
       * Fetch modules configuration from the API
       * Only fetches if:
       * 1. No modules data exists in localStorage for this profile
       * 2. User made a new login (data cleared by auth subscriber)
       * Implements retry with exponential backoff on failure
       *
       * @param institutionId - The institution UUID
       * @param api - Axios instance for API calls
       * @param profileType - Optional profile type (STUDENT, TEACHER, etc.)
       */
      fetchModules: async (
        institutionId: string,
        api: AxiosInstance,
        profileType?: string
      ): Promise<void> => {
        if (hasCachedModules(profileType)) return;

        const requestId = ++latestRequestId;
        set({ loading: true });

        const version = await fetchWithRetry(
          institutionId,
          api,
          requestId,
          profileType
        );

        if (isStaleRequest(requestId)) return;

        if (version === null) {
          set({ modules: defaultModules, loading: false });
        } else {
          set({
            modules: mergeModulesConfig(version),
            ownerInstitutionId: institutionId,
            ownerProfileType: profileType ?? null,
            loading: false,
          });
        }
      },

      /**
       * Clear modules data (useful when user/institution/profile changes)
       * Also invalidates any in-flight requests to prevent stale data overwriting cleared state
       */
      clearModules: (): void => {
        latestRequestId++;
        set({
          modules: defaultModules,
          loading: false,
          ownerInstitutionId: null,
          ownerProfileType: null,
        });
      },
    }),
    {
      name: KEYS.MODULES_STORAGE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        modules: state.modules,
        ownerInstitutionId: state.ownerInstitutionId,
        ownerProfileType: state.ownerProfileType,
      }),
      onRehydrateStorage: () => (rehydrated) => {
        if (!rehydrated) return;

        // Merge with defaultModules to ensure new fields have proper defaults
        // when loading old localStorage data that may be missing new fields
        const mergedModules = mergeModulesConfig(rehydrated.modules);
        useModulesStore.setState({ modules: mergedModules });

        const currentInstitutionId =
          useAuthStore.getState().sessionInfo?.institutionId ?? null;
        // Use sessionInfo.profileName to match what useAppContent passes to fetchModules
        const currentProfile =
          (useAuthStore.getState().sessionInfo as { profileName?: string })
            ?.profileName ?? null;

        // Clear if institution or profile changed
        if (
          (rehydrated.ownerInstitutionId &&
            rehydrated.ownerInstitutionId !== currentInstitutionId) ||
          (rehydrated.ownerProfileType &&
            rehydrated.ownerProfileType !== currentProfile)
        ) {
          useModulesStore.getState().clearModules();
        }
      },
    }
  )
);

// Clear modules whenever institution or profile changes (same-tab user switch)
// Only clear when institution/profile actually CHANGES (not on initial hydration)
// Use sessionInfo.profileName to match what useAppContent passes to fetchModules
let lastInstitutionId: string | null =
  useAuthStore.getState().sessionInfo?.institutionId ?? null;
let lastProfileType: string | null =
  (useAuthStore.getState().sessionInfo as { profileName?: string })
    ?.profileName ?? null;

useAuthStore.subscribe((state) => {
  const nextInstitutionId = state.sessionInfo?.institutionId ?? null;
  const nextProfileType =
    (state.sessionInfo as { profileName?: string })?.profileName ?? null;

  if (
    nextInstitutionId !== lastInstitutionId ||
    nextProfileType !== lastProfileType
  ) {
    // Only clear modules if there was a previous value (actual change, not initial load)
    // NOTE: Don't set ownerInstitutionId/ownerProfileType here - let fetchModules set them
    // after a successful fetch. Setting them here would cause hasCachedModules to return
    // true even though we only have DEFAULT_MODULES, skipping the necessary fetch.
    if (lastInstitutionId !== null || lastProfileType !== null) {
      useModulesStore.getState().clearModules();
    }
    lastInstitutionId = nextInstitutionId;
    lastProfileType = nextProfileType;
  }
});
