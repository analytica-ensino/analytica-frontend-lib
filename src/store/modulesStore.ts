import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEYS } from '../utils/keys';
import { useAuthStore } from './authStore';
import type { AxiosInstance } from 'axios';

/**
 * Visibility state of a single simulado type on the student platform.
 * - ENABLED: shown and clickable
 * - COMING_SOON: shown but disabled, with an "Em breve" badge
 * - HIDDEN: not shown at all
 */
export type SimulationVisibility = 'ENABLED' | 'COMING_SOON' | 'HIDDEN';

/**
 * Per-institution configuration of the Simulados module.
 * `enabled` is the master toggle (gates the whole module/menu); the remaining
 * keys map 1:1 to each simulado type's `backgroundColor` (the card catalog).
 */
export interface SimulationsConfig {
  enabled: boolean;
  enem: SimulationVisibility;
  prova: SimulationVisibility;
  simuladao: SimulationVisibility;
  vestibular: SimulationVisibility;
}

/**
 * Default simulados configuration - module on, all types enabled
 */
export const DEFAULT_SIMULATIONS: SimulationsConfig = {
  enabled: true,
  enem: 'ENABLED',
  prova: 'ENABLED',
  simuladao: 'ENABLED',
  vestibular: 'ENABLED',
};

/**
 * Default modules configuration - all enabled
 */
const defaultModules: ModulesConfig = {
  simulator: true,
  essay: true,
  forum: true,
  support: true,
  simulatedReports: true,
  activitiesReports: true,
  lessonsReports: true,
  exams: true,
  simulatedScoreTri: false,
  simulatedScoreAbsoluto: false,
  simulations: DEFAULT_SIMULATIONS,
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
  simulatedReports: boolean;
  activitiesReports: boolean;
  lessonsReports: boolean;
  exams: boolean;
  /** Whether TRI score type is available in simulated reports */
  simulatedScoreTri: boolean;
  /** Whether ABSOLUTO score type is available in simulated reports */
  simulatedScoreAbsoluto: boolean;
  /** Simulados module: master toggle + per-type visibility */
  simulations: SimulationsConfig;
}

/**
 * Merge a (possibly partial) feature-flag version onto the defaults.
 * Shallow-merges top-level fields and deep-merges the nested `simulations`
 * object so newly added keys keep their defaults when older configs omit them.
 */
const mergeModules = (
  version?: Partial<ModulesConfig> | null
): ModulesConfig => {
  // Guard against malformed/legacy persisted state where `modules` is missing.
  const v = version ?? {};
  return {
    ...defaultModules,
    ...v,
    // Object spread treats `undefined` as a no-op, so no `?? {}` fallback needed.
    simulations: { ...DEFAULT_SIMULATIONS, ...v.simulations },
  };
};

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

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Delay helper for retry backoff
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if modules are already cached in localStorage
 */
const hasCachedModules = (): boolean => {
  const cached = localStorage.getItem(KEYS.MODULES_STORAGE);
  if (!cached) return false;

  try {
    const parsed = JSON.parse(cached);
    return Boolean(parsed.state?.ownerInstitutionId);
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
  requestId: number
): Promise<Partial<ModulesConfig> | null> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await delay(INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1));
    }

    if (isStaleRequest(requestId)) return null;

    try {
      const response = await api.get<ModulesFeatureFlagResponse>(
        `/featureFlags/institution/${institutionId}/page/MODULES`
      );

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
       * Implements retry with exponential backoff on failure
       */
      fetchModules: async (
        institutionId: string,
        api: AxiosInstance
      ): Promise<void> => {
        if (hasCachedModules()) return;

        const requestId = ++latestRequestId;
        set({ loading: true });

        const version = await fetchWithRetry(institutionId, api, requestId);

        if (isStaleRequest(requestId)) return;

        if (version === null) {
          set({ modules: defaultModules, loading: false });
        } else {
          set({
            modules: mergeModules(version),
            ownerInstitutionId: institutionId,
            loading: false,
          });
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

        // Merge with defaultModules to ensure new fields have proper defaults
        // when loading old localStorage data that may be missing new fields
        const mergedModules = mergeModules(rehydrated.modules);
        useModulesStore.setState({ modules: mergedModules });

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
// Only clear when institution actually CHANGES (not on initial hydration)
let lastInstitutionId: string | null =
  useAuthStore.getState().sessionInfo?.institutionId ?? null;
useAuthStore.subscribe((state) => {
  const nextId = state.sessionInfo?.institutionId ?? null;
  if (nextId !== lastInstitutionId) {
    // Only clear modules if there was a previous institution (actual change, not initial load)
    if (lastInstitutionId !== null) {
      useModulesStore.getState().clearModules();
    }
    if (nextId) {
      useModulesStore.setState({ ownerInstitutionId: nextId });
    }
    lastInstitutionId = nextId;
  }
});
