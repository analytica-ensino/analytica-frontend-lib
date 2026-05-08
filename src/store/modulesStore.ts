import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEYS } from '../utils/keys';
import { useAuthStore } from './authStore';
import type { AxiosInstance } from 'axios';

/**
 * Default modules configuration - all enabled
 */
const defaultModules: ModulesConfig = {
  simulator: true,
  essay: true,
  forum: true,
  support: true,
};

/**
 * Interface for modules configuration
 * All modules that can be controlled via feature flags
 */
export interface ModulesConfig {
  simulator: boolean;
  essay: boolean;
  forum: boolean;
  support: boolean;
}

/**
 * Interface defining the modules state
 */
export interface ModulesState {
  modules: ModulesConfig;
  loading: boolean;
  ownerInstitutionId: string | null;

  fetchModules: (institutionId: string, api: AxiosInstance) => Promise<void>;
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
      version: Partial<ModulesConfig>;
    };
  } | null;
}

// Guard against stale async responses
let latestRequestId = 0;

/**
 * Zustand store for managing modules visibility with persistence
 * Works with both student and professor frontends
 */
export const useModulesStore = create<ModulesState>()(
  persist(
    (set) => ({
      modules: defaultModules,
      loading: false,
      ownerInstitutionId: null,

      /**
       * Fetch modules configuration from the API
       * Only fetches if:
       * 1. No modules data exists in localStorage
       * 2. User made a new login (data cleared by auth subscriber)
       */
      fetchModules: async (
        institutionId: string,
        api: AxiosInstance
      ): Promise<void> => {
        // Skip if modules already cached in localStorage
        const cached = localStorage.getItem(KEYS.MODULES_STORAGE);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.state?.ownerInstitutionId) {
              return;
            }
          } catch {
            // Invalid JSON, continue with fetch
          }
        }

        const requestId = ++latestRequestId;
        set({ loading: true });

        try {
          const response = await api.get<ModulesFeatureFlagResponse>(
            `/featureFlags/institution/${institutionId}/page/MODULES`
          );

          if (requestId !== latestRequestId) return;

          const version = response.data?.data?.featureFlags?.version;
          if (version) {
            set({
              modules: { ...defaultModules, ...version },
              ownerInstitutionId: institutionId,
            });
          } else {
            set({ modules: defaultModules, ownerInstitutionId: institutionId });
          }
        } catch {
          if (requestId !== latestRequestId) return;
          set({ modules: defaultModules, ownerInstitutionId: institutionId });
        } finally {
          if (requestId === latestRequestId) {
            set({ loading: false });
          }
        }
      },

      /**
       * Clear modules data (useful when user/institution changes)
       */
      clearModules: (): void => {
        set({
          modules: defaultModules,
          ownerInstitutionId: null,
        });
      },
    }),
    {
      name: KEYS.MODULES_STORAGE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        modules: state.modules,
        ownerInstitutionId: state.ownerInstitutionId,
      }),
      onRehydrateStorage: () => (rehydrated) => {
        if (!rehydrated) return;

        const currentInstitutionId =
          useAuthStore.getState().sessionInfo?.institutionId ?? null;
        if (
          rehydrated.ownerInstitutionId &&
          rehydrated.ownerInstitutionId !== currentInstitutionId
        ) {
          useModulesStore.getState().clearModules();
        }
      },
    }
  )
);

// Clear modules whenever institution changes (same-tab user switch)
let lastInstitutionId: string | null =
  useAuthStore.getState().sessionInfo?.institutionId ?? null;
useAuthStore.subscribe((state) => {
  const nextId = state.sessionInfo?.institutionId ?? null;
  if (nextId !== lastInstitutionId) {
    useModulesStore.getState().clearModules();
    if (nextId) {
      useModulesStore.setState({ ownerInstitutionId: nextId });
    }
    lastInstitutionId = nextId;
  }
});
