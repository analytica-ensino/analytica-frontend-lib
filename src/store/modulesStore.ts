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
export interface ActivePlan {
  code: string;
  name: string;
}

export interface ModulesState {
  modules: ModulesConfig;
  loading: boolean;
  ownerInstitutionId: string | null;
  ownerProfileType: string | null;
  /**
   * Commercial plan the modules came from, or `null` when they came from the
   * institution (every non-B2C tenant) or when nothing has been fetched yet.
   */
  plan: ActivePlan | null;

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

/**
 * API response of `GET /me/modules` — the authenticated, per-user answer.
 */
interface MyModulesResponse {
  data: {
    modules: Partial<ModulesConfig>;
    plan: ActivePlan | null;
  } | null;
}

/**
 * What a fetch attempt produced. `plan` is only ever non-null for a B2C tenant.
 */
interface FetchedModules {
  version: Partial<ModulesConfig>;
  plan: ActivePlan | null;
}

// Guard against stale async responses
let latestRequestId = 0;

/**
 * What identifies one fetch, so repeats can be recognised.
 *
 * Keyed rather than global on purpose: switching institution mid-flight must still fetch the
 * new one, or the store would keep serving the previous tenant's modules.
 */
const fetchKey = (institutionId: string, profileType?: string): string =>
  `${institutionId}|${profileType ?? ''}`;

// The fetch currently running, if any. `useAppContent` re-runs its effect whenever the api
// instance identity changes, and a consumer that rebuilds that instance per render would
// otherwise start an identical fetch on every render — each one setting state, causing the
// next render. Before stale-while-revalidate the cache short-circuit hid this; now it does not.
let inFlightKey: string | null = null;

// When each key last revalidated. Serving from cache and revalidating is cheap, but not free:
// without a floor, a re-rendering consumer turns it into a request stream that never lets the
// page go idle — which is exactly how this surfaced, as E2E suites timing out on networkidle.
const lastRevalidationByKey = new Map<string, number>();

// Shortest gap between two background revalidations of the same key. Long enough that a render
// loop cannot become traffic, short enough that a plan change lands on the next navigation.
const REVALIDATE_INTERVAL_MS = 30_000;

/**
 * Clear the in-flight and throttle guards.
 *
 * They are module-level because they must survive component remounts — that is the whole
 * point. Nothing in the app needs to reset them outside an institution or profile change,
 * which `clearModules` already covers; this exists so a test file does not inherit the timing
 * of the test before it.
 */
export const resetModulesFetchGuards = (): void => {
  inFlightKey = null;
  lastRevalidationByKey.clear();
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Delay helper for retry backoff
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Read a key from localStorage, tolerating environments where access is
 * denied. Reading `localStorage` throws `SecurityError` (DOMException 18) in
 * privacy mode, with blocked cookies, or in sandboxed/cross-origin iframes;
 * treat that as "no cached value" instead of letting it crash app boot.
 */
const readLocalStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Check if modules are already cached in localStorage for the given profile
 */
const hasCachedModules = (profileType?: string): boolean => {
  const cached = readLocalStorage(KEYS.MODULES_STORAGE);
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
 * Run `attempt` with exponential backoff, aborting as soon as a newer request
 * supersedes this one. Returns null when every attempt failed.
 */
const withRetry = async <T>(
  requestId: number,
  attemptFn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T | null> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      await delay(INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1));
    }

    if (isStaleRequest(requestId)) return null;

    try {
      const result = await attemptFn();

      if (isStaleRequest(requestId)) return null;

      return result;
    } catch {
      // Continue to next retry attempt
    }
  }

  return null;
};

/**
 * Whether there is a session whose token the API instance can send.
 *
 * `/me/modules` is authenticated; without a token it would only ever answer 401,
 * so the public per-institution endpoint stays the pre-login path.
 */
const hasSession = (): boolean =>
  Boolean(useAuthStore.getState().tokens?.token);

/**
 * Fetch the effective modules of the authenticated user.
 *
 * This is the only call that knows about commercial plans: in a B2C institution
 * it answers with the active plan's modules, and outside B2C it answers with the
 * institution's modules unchanged — which is why it replaces the public endpoint
 * for every product, not just the B2C one.
 */
const fetchMyModules = async (
  api: AxiosInstance,
  requestId: number
): Promise<FetchedModules | null> =>
  withRetry(requestId, async () => {
    const response = await api.get<MyModulesResponse>('/me/modules', {
      // A 401 here means "no authenticated answer for the modules", not "the session died".
      // Without this the app boots, asks for its modules, gets a 401 and the interceptor
      // sends it to the login screen — which boots the app, which asks again. That loop is
      // real: it took a backoffice E2E run to 42 full page loads in 8 seconds.
      skipSessionExpiry: true,
    });

    return {
      version: response.data?.data?.modules ?? {},
      plan: response.data?.data?.plan ?? null,
    };
  });

/**
 * Fetch the institution's MODULES feature flag — the anonymous answer.
 *
 * Used before login, and as the fallback when `/me/modules` cannot be reached,
 * so a failure there degrades to the previous behaviour instead of an empty app.
 */
const fetchInstitutionModules = async (
  institutionId: string,
  api: AxiosInstance,
  requestId: number,
  profileType?: string,
  maxRetries: number = MAX_RETRIES
): Promise<FetchedModules | null> =>
  withRetry(
    requestId,
    async () => {
      // Use the new profile-specific endpoint if profileType is provided
      const endpoint = profileType
        ? `/featureFlags/institution/${institutionId}/page/MODULES/profile/${profileType}`
        : `/featureFlags/institution/${institutionId}/page/MODULES`;

      const response = await api.get<ModulesFeatureFlagResponse>(endpoint);

      return {
        version: response.data?.data?.featureFlags?.version ?? {},
        plan: null,
      };
    },
    maxRetries
  );

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
      plan: null,

      /**
       * Fetch the modules configuration from the API.
       *
       * Picks the endpoint by session, not by tenant: with a session it asks
       * `/me/modules`, which resolves the commercial plan when the institution is
       * B2C and returns the institution's own modules otherwise. Without a session
       * — the login screen — it falls back to the public per-institution flag.
       * Branching on "is this tenant B2C?" instead would leave the authenticated
       * path unexercised everywhere else, so it would rot.
       *
       * Caching is stale-while-revalidate. A cached value is served immediately and
       * still revalidated in the background whenever there is a session, because
       * modules can now change server-side (a plan upgrade) with nothing on the
       * client to signal it — no cache key the client builds can detect that. The
       * background pass deliberately leaves `loading` alone: `ModuleProtectedRoute`
       * renders nothing while loading, so raising it on a warm boot would blank
       * every gated route for the length of a request.
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
        const authenticated = hasSession();
        const cached = hasCachedModules(profileType);

        // Nothing to revalidate before login: the public flag is the only answer
        // available, and it is what the cache already holds.
        if (cached && !authenticated) return;

        const key = fetchKey(institutionId, profileType);

        // Never the same fetch twice at once. This is what keeps a consumer whose effect
        // re-runs on every render from turning revalidation into an unbounded stream. A
        // different institution or profile is a different key and still goes through.
        if (inFlightKey === key) return;

        // A cached value is already on screen, so its revalidation can wait. A cold start
        // cannot: there is nothing to render until it answers.
        const lastRevalidation = lastRevalidationByKey.get(key) ?? 0;
        if (cached && Date.now() - lastRevalidation < REVALIDATE_INTERVAL_MS) {
          return;
        }

        const requestId = ++latestRequestId;
        inFlightKey = key;

        if (!cached) {
          set({ loading: true });
        }

        try {
          const result = authenticated
            ? ((await fetchMyModules(api, requestId)) ??
              // Degrade to the previous behaviour rather than to an empty app when
              // the authenticated call cannot be reached — but with a single attempt.
              // The retries belong to `/me/modules`, which is the call that gives the
              // right answer; spending a second full backoff cycle here would double
              // the time gated routes stay blank, and `ModuleProtectedRoute` renders
              // nothing while `loading`. If the authenticated call is simply absent,
              // one request settles it; if the network is down, repeating it is waste.
              (await fetchInstitutionModules(
                institutionId,
                api,
                requestId,
                profileType,
                0
              )))
            : await fetchInstitutionModules(
                institutionId,
                api,
                requestId,
                profileType
              );

          if (isStaleRequest(requestId)) return;

          if (result === null) {
            console.warn(
              '[modulesStore] Failed to fetch modules after retries'
            );
            // Keep whatever is already cached; only a cold start falls back to the
            // permissive defaults, which is the pre-existing behaviour.
            set(
              cached
                ? { loading: false }
                : { modules: defaultModules, loading: false }
            );
            return;
          }

          set({
            modules: mergeModulesConfig(result.version),
            plan: result.plan,
            ownerInstitutionId: institutionId,
            ownerProfileType: profileType ?? null,
            loading: false,
          });
        } finally {
          // In a finally: an early return on a stale request must not leave the guard stuck,
          // or this key would never be fetched again for the life of the page.
          if (inFlightKey === key) inFlightKey = null;
          lastRevalidationByKey.set(key, Date.now());
        }
      },

      /**
       * Clear modules data (useful when user/institution/profile changes)
       * Also invalidates any in-flight requests to prevent stale data overwriting cleared state
       */
      clearModules: (): void => {
        latestRequestId++;
        // The institution or profile changed: the next fetch is for different data and must
        // not be held back by the previous one's throttle.
        inFlightKey = null;
        lastRevalidationByKey.clear();
        set({
          modules: defaultModules,
          loading: false,
          ownerInstitutionId: null,
          ownerProfileType: null,
          plan: null,
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
        plan: state.plan,
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
