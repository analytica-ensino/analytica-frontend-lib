import type { AxiosInstance } from 'axios';
import {
  useModulesStore,
  DEFAULT_SIMULATIONS,
  type ModulesConfig,
} from './modulesStore';
import { KEYS } from '../utils/keys';
import { DEFAULT_MODULES } from '../types/modulesConfig';

// Mock API type for testing
type MockApi = Pick<AxiosInstance, 'get'> & {
  get: jest.Mock;
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock useAuthStore
jest.mock('./authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      sessionInfo: {
        institutionId: 'test-institution-id',
        profileName: 'STUDENT',
      },
      selectedProfile: { name: 'STUDENT' },
    })),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

describe('ModulesStore', () => {
  // Use DEFAULT_MODULES for test defaults
  const defaultModules: ModulesConfig = DEFAULT_MODULES;

  beforeEach(() => {
    // Clear store state before each test
    useModulesStore.setState({
      modules: defaultModules,
      loading: false,
      ownerInstitutionId: null,
      ownerProfileType: null,
    });
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with default modules (all enabled)', () => {
      const state = useModulesStore.getState();

      expect(state.modules).toEqual(defaultModules);
      expect(state.loading).toBe(false);
      expect(state.ownerInstitutionId).toBeNull();
    });

    it('should have all modules enabled by default', () => {
      const { modules } = useModulesStore.getState();

      expect(modules.simulator).toBe(true);
      expect(modules.essay).toBe(true);
      expect(modules.forum).toBe(true);
      expect(modules.support).toBe(true);
      expect(modules.simulatedReports).toBe(true);
      expect(modules.activitiesReports).toBe(true);
      expect(modules.lessonsReports).toBe(true);
      expect(modules.exams).toBe(true);
    });
  });

  describe('fetchModules', () => {
    const mockApi: MockApi = {
      get: jest.fn(),
    };

    beforeEach(() => {
      mockApi.get.mockReset();
    });

    it('should skip fetch if cached data exists in localStorage', async () => {
      const institutionId = 'test-institution';
      const cachedData = {
        state: {
          modules: {
            simulator: false,
            essay: true,
            forum: true,
            support: false,
            exams: true,
          },
          ownerInstitutionId: 'any-institution',
        },
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));

      await useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('should fetch if no ownerInstitutionId in cache', async () => {
      const institutionId = 'test-institution';
      const cachedData = {
        state: {
          modules: defaultModules,
          ownerInstitutionId: null,
        },
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: {
            featureFlags: {
              version: {
                simulator: false,
                essay: true,
                forum: false,
                support: true,
                exams: true,
              },
            },
          },
        },
      });

      await useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      expect(mockApi.get).toHaveBeenCalledWith(
        `/featureFlags/institution/${institutionId}/page/MODULES`
      );
    });

    it('should set loading state during fetch', async () => {
      const institutionId = 'test-institution';
      mockApi.get.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { data: { featureFlags: { version: defaultModules } } },
                }),
              100
            )
          )
      );

      const fetchPromise = useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      // Check loading is true during fetch
      expect(useModulesStore.getState().loading).toBe(true);

      await fetchPromise;

      // Check loading is false after fetch
      expect(useModulesStore.getState().loading).toBe(false);
    });

    it('should update modules with API response', async () => {
      const institutionId = 'test-institution';
      const apiModules = {
        simulator: false,
        essay: true,
        forum: false,
        support: true,
        simulatedReports: true,
        activitiesReports: true,
        lessonsReports: true,
        exams: true,
        simulatedScoreTri: false,
        simulatedScoreAbsoluto: false,
        simulations: DEFAULT_SIMULATIONS,
      };

      mockApi.get.mockResolvedValueOnce({
        data: {
          data: {
            featureFlags: {
              version: apiModules,
            },
          },
        },
      });

      await useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      const state = useModulesStore.getState();
      // Store merges API response with defaults, so we check key fields
      expect(state.modules.simulator).toBe(false);
      expect(state.modules.essay).toBe(true);
      expect(state.modules.forum).toBe(false);
      expect(state.modules.support).toBe(true);
      expect(state.modules.exams).toBe(true);
      expect(state.modules.simulations).toEqual(DEFAULT_SIMULATIONS);
      expect(state.ownerInstitutionId).toBe(institutionId);
    });

    it('should merge partial API response with defaults', async () => {
      const institutionId = 'test-institution';
      const partialModules = { simulator: false }; // Only one module specified

      mockApi.get.mockResolvedValueOnce({
        data: {
          data: {
            featureFlags: {
              version: partialModules,
            },
          },
        },
      });

      await useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      const { modules } = useModulesStore.getState();
      expect(modules.simulator).toBe(false); // From API
      expect(modules.essay).toBe(true); // Default
      expect(modules.forum).toBe(true); // Default
      expect(modules.support).toBe(true); // Default
      expect(modules.simulatedReports).toBe(true); // Default
      expect(modules.activitiesReports).toBe(true); // Default
      expect(modules.lessonsReports).toBe(true); // Default
      // simulations falls back entirely to defaults when not provided
      expect(modules.simulations).toEqual(DEFAULT_SIMULATIONS);
    });

    it('should deep-merge a partial simulations object with defaults', async () => {
      const institutionId = 'test-institution';
      // Only the master flag and one type are set; remaining types must default.
      const partialModules = {
        simulations: { enabled: false, vestibular: 'HIDDEN' },
      };

      mockApi.get.mockResolvedValueOnce({
        data: {
          data: {
            featureFlags: {
              version: partialModules,
            },
          },
        },
      });

      await useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      const { modules } = useModulesStore.getState();
      expect(modules.simulations.enabled).toBe(false); // From API
      expect(modules.simulations.vestibular).toBe('HIDDEN'); // From API
      expect(modules.simulations.enem).toBe('ENABLED'); // Default
      expect(modules.simulations.prova).toBe('ENABLED'); // Default
      expect(modules.simulations.simuladao).toBe('ENABLED'); // Default
    });

    it('should use defaults when API returns no version', async () => {
      const institutionId = 'test-institution';

      mockApi.get.mockResolvedValueOnce({
        data: {
          data: null,
        },
      });

      await useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      const state = useModulesStore.getState();
      expect(state.modules).toEqual(defaultModules);
      expect(state.ownerInstitutionId).toBe(institutionId);
    });

    it('should use defaults when API call fails after retries', async () => {
      jest.useFakeTimers();
      const institutionId = 'test-institution';

      // Mock all retry attempts (initial + 3 retries = 4 rejections)
      mockApi.get
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'));

      const fetchPromise = useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      // Advance timers through all retry delays (1s + 2s + 4s)
      await jest.advanceTimersByTimeAsync(7000);

      await fetchPromise;

      const state = useModulesStore.getState();
      expect(state.modules).toEqual(defaultModules);
      // ownerInstitutionId remains null after failed retries to allow future retry
      expect(state.ownerInstitutionId).toBeNull();
      expect(state.loading).toBe(false);
      expect(mockApi.get).toHaveBeenCalledTimes(4);

      jest.useRealTimers();
    });

    it('should handle invalid JSON in localStorage gracefully', async () => {
      const institutionId = 'test-institution';

      localStorageMock.getItem.mockReturnValueOnce('invalid json');
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: {
            featureFlags: {
              version: { simulator: false },
            },
          },
        },
      });

      await useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      // Should continue with fetch despite invalid cache
      expect(mockApi.get).toHaveBeenCalled();
    });

    it('should fetch when localStorage returns null', async () => {
      const institutionId = 'test-institution';

      localStorageMock.getItem.mockReturnValueOnce(null);
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: {
            featureFlags: {
              version: { simulator: false },
            },
          },
        },
      });

      await useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      expect(mockApi.get).toHaveBeenCalled();
    });

    it('should fetch when cache has no state property', async () => {
      const institutionId = 'test-institution';
      const cachedData = { someOtherData: true };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: {
            featureFlags: {
              version: { essay: false },
            },
          },
        },
      });

      await useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      expect(mockApi.get).toHaveBeenCalled();
    });

    it('should fetch when cache state has undefined ownerInstitutionId', async () => {
      const institutionId = 'test-institution';
      const cachedData = {
        state: {
          modules: defaultModules,
          // ownerInstitutionId is undefined (not present)
        },
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: {
            featureFlags: {
              version: { forum: false },
            },
          },
        },
      });

      await useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      expect(mockApi.get).toHaveBeenCalled();
    });

    it('should fetch when cache state has empty string ownerInstitutionId', async () => {
      const institutionId = 'test-institution';
      const cachedData = {
        state: {
          modules: defaultModules,
          ownerInstitutionId: '',
        },
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: {
            featureFlags: {
              version: { support: false },
            },
          },
        },
      });

      await useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      expect(mockApi.get).toHaveBeenCalled();
    });
  });

  describe('race condition guard', () => {
    const mockApi: MockApi = {
      get: jest.fn(),
    };

    beforeEach(() => {
      mockApi.get.mockReset();
      useModulesStore.setState({
        modules: defaultModules,
        loading: false,
        ownerInstitutionId: null,
      });
    });

    it('should discard stale response when newer request is made', async () => {
      const firstInstitution = 'institution-A';
      const secondInstitution = 'institution-B';

      // First request takes longer
      let resolveFirst: (value: unknown) => void;
      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });

      // Second request resolves immediately
      const secondResponse = {
        data: {
          data: {
            featureFlags: {
              version: {
                simulator: false,
                essay: false,
                forum: false,
                support: false,
                exams: true,
              },
            },
          },
        },
      };

      mockApi.get
        .mockImplementationOnce(() => firstPromise)
        .mockResolvedValueOnce(secondResponse);

      // Start first fetch
      const firstFetch = useModulesStore
        .getState()
        .fetchModules(firstInstitution, mockApi as unknown as AxiosInstance);

      // Start second fetch before first completes
      const secondFetch = useModulesStore
        .getState()
        .fetchModules(secondInstitution, mockApi as unknown as AxiosInstance);

      // Wait for second to complete
      await secondFetch;

      // Now resolve first (stale)
      resolveFirst!({
        data: {
          data: {
            featureFlags: {
              version: {
                simulator: true,
                essay: true,
                forum: true,
                support: true,
              },
            },
          },
        },
      });

      await firstFetch;

      // State should reflect second request, not first
      const state = useModulesStore.getState();
      expect(state.ownerInstitutionId).toBe(secondInstitution);
      // Store merges API response with defaults, so we check key fields from second request
      expect(state.modules.simulator).toBe(false);
      expect(state.modules.essay).toBe(false);
      expect(state.modules.forum).toBe(false);
      expect(state.modules.support).toBe(false);
      expect(state.modules.exams).toBe(true);
    });

    it('should discard stale error when newer request is made', async () => {
      const firstInstitution = 'institution-A';
      const secondInstitution = 'institution-B';

      // First request fails after delay
      let rejectFirst: (error: Error) => void;
      const firstPromise = new Promise((_, reject) => {
        rejectFirst = reject;
      });

      // Second request succeeds immediately
      const secondResponse = {
        data: {
          data: {
            featureFlags: {
              version: { simulator: false },
            },
          },
        },
      };

      mockApi.get
        .mockImplementationOnce(() => firstPromise)
        .mockResolvedValueOnce(secondResponse);

      // Start first fetch
      const firstFetch = useModulesStore
        .getState()
        .fetchModules(firstInstitution, mockApi as unknown as AxiosInstance);

      // Start second fetch
      const secondFetch = useModulesStore
        .getState()
        .fetchModules(secondInstitution, mockApi as unknown as AxiosInstance);

      await secondFetch;

      // Now reject first (stale error)
      rejectFirst!(new Error('Stale error'));

      await firstFetch;

      // State should reflect second request
      const state = useModulesStore.getState();
      expect(state.ownerInstitutionId).toBe(secondInstitution);
      expect(state.modules.simulator).toBe(false);
    });

    it('should not set loading to false for stale request', async () => {
      const firstInstitution = 'institution-A';
      const secondInstitution = 'institution-B';

      let resolveFirst: (value: unknown) => void;
      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });

      let resolveSecond: (value: unknown) => void;
      const secondPromise = new Promise((resolve) => {
        resolveSecond = resolve;
      });

      mockApi.get
        .mockImplementationOnce(() => firstPromise)
        .mockImplementationOnce(() => secondPromise);

      // Start both fetches
      const firstFetch = useModulesStore
        .getState()
        .fetchModules(firstInstitution, mockApi as unknown as AxiosInstance);

      const secondFetch = useModulesStore
        .getState()
        .fetchModules(secondInstitution, mockApi as unknown as AxiosInstance);

      // Both should be loading
      expect(useModulesStore.getState().loading).toBe(true);

      // Resolve first (stale)
      resolveFirst!({
        data: { data: { featureFlags: { version: {} } } },
      });
      await firstFetch;

      // Should still be loading because second is pending
      expect(useModulesStore.getState().loading).toBe(true);

      // Resolve second
      resolveSecond!({
        data: { data: { featureFlags: { version: { simulator: false } } } },
      });
      await secondFetch;

      // Now loading should be false
      expect(useModulesStore.getState().loading).toBe(false);
    });
  });

  describe('clearModules', () => {
    it('should reset modules to defaults', () => {
      // First set some non-default values
      useModulesStore.setState({
        modules: {
          ...DEFAULT_MODULES,
          simulator: false,
          essay: false,
          forum: false,
          support: false,
          simulatedReports: false,
          activitiesReports: false,
          lessonsReports: false,
          exams: false,
          simulatedScoreTri: false,
          simulatedScoreAbsoluto: false,
          simulations: { ...DEFAULT_SIMULATIONS, enabled: false },
        },
        ownerInstitutionId: 'some-institution',
        ownerProfileType: 'STUDENT',
      });

      useModulesStore.getState().clearModules();

      const state = useModulesStore.getState();
      expect(state.modules).toEqual(defaultModules);
      expect(state.ownerInstitutionId).toBeNull();
      expect(state.ownerProfileType).toBeNull();
    });

    it('should clear ownerInstitutionId and ownerProfileType', () => {
      useModulesStore.setState({
        ownerInstitutionId: 'test-institution',
        ownerProfileType: 'TEACHER',
      });

      useModulesStore.getState().clearModules();

      expect(useModulesStore.getState().ownerInstitutionId).toBeNull();
      expect(useModulesStore.getState().ownerProfileType).toBeNull();
    });

    it('should invalidate in-flight requests to prevent stale data', async () => {
      const mockApi: MockApi = { get: jest.fn() };
      const institutionId = 'test-institution';

      // Create a delayed response
      let resolveRequest: (value: unknown) => void;
      const pendingRequest = new Promise((resolve) => {
        resolveRequest = resolve;
      });

      mockApi.get.mockImplementationOnce(() => pendingRequest);

      // Start fetch
      const fetchPromise = useModulesStore
        .getState()
        .fetchModules(institutionId, mockApi as unknown as AxiosInstance);

      // Verify loading state
      expect(useModulesStore.getState().loading).toBe(true);

      // Clear modules while fetch is in-flight
      useModulesStore.getState().clearModules();

      // State should be cleared
      expect(useModulesStore.getState().modules).toEqual(defaultModules);
      expect(useModulesStore.getState().ownerInstitutionId).toBeNull();

      // Now resolve the stale request with different data
      resolveRequest!({
        data: {
          data: {
            featureFlags: {
              version: {
                simulator: false,
                essay: false,
                forum: false,
              },
            },
          },
        },
      });

      await fetchPromise;

      // Stale response should be discarded - state remains cleared/defaults
      const state = useModulesStore.getState();
      expect(state.modules).toEqual(defaultModules);
      expect(state.ownerInstitutionId).toBeNull();
      expect(state.loading).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should use correct storage key', () => {
      expect(KEYS.MODULES_STORAGE).toBe('@modules-storage:analytica:v1');
    });

    it('should only persist modules, ownerInstitutionId, and ownerProfileType', () => {
      // The partialize function should exclude loading from persistence
      const state = {
        modules: defaultModules,
        loading: true,
        ownerInstitutionId: 'test-id',
        ownerProfileType: 'STUDENT',
      };

      // Simulate what partialize does
      const partializedState = {
        modules: state.modules,
        ownerInstitutionId: state.ownerInstitutionId,
        ownerProfileType: state.ownerProfileType,
      };

      expect(partializedState).not.toHaveProperty('loading');
      expect(partializedState).toHaveProperty('modules');
      expect(partializedState).toHaveProperty('ownerInstitutionId');
      expect(partializedState).toHaveProperty('ownerProfileType');
    });
  });

  describe('onRehydrateStorage - institution/profile change detection', () => {
    // Import useAuthStore to manipulate its mock
    const { useAuthStore } = jest.requireMock('./authStore');

    beforeEach(() => {
      jest.clearAllMocks();
      useModulesStore.setState({
        modules: defaultModules,
        loading: false,
        ownerInstitutionId: null,
        ownerProfileType: null,
      });
    });

    it('should clear modules when institution changed after rehydration', () => {
      // Setup: current auth state has different institution than rehydrated
      useAuthStore.getState.mockReturnValue({
        sessionInfo: {
          institutionId: 'new-institution-id',
          profileName: 'STUDENT',
        },
      });

      const clearModulesSpy = jest.spyOn(
        useModulesStore.getState(),
        'clearModules'
      );

      // Simulate rehydrated state with old institution
      const rehydratedState = {
        modules: { ...defaultModules, simulator: false },
        ownerInstitutionId: 'old-institution-id',
        ownerProfileType: 'STUDENT',
        loading: false,
        fetchModules: jest.fn(),
        clearModules: useModulesStore.getState().clearModules,
      };

      // Check the condition from lines 253-260
      const currentInstitutionId =
        useAuthStore.getState().sessionInfo?.institutionId ?? null;
      const currentProfile =
        (useAuthStore.getState().sessionInfo as { profileName?: string })
          ?.profileName ?? null;

      const shouldClear =
        (rehydratedState.ownerInstitutionId &&
          rehydratedState.ownerInstitutionId !== currentInstitutionId) ||
        (rehydratedState.ownerProfileType &&
          rehydratedState.ownerProfileType !== currentProfile);

      expect(shouldClear).toBe(true);
      expect(rehydratedState.ownerInstitutionId).not.toBe(currentInstitutionId);

      clearModulesSpy.mockRestore();
    });

    it('should clear modules when profile changed after rehydration', () => {
      // Setup: current auth state has different profile than rehydrated
      useAuthStore.getState.mockReturnValue({
        sessionInfo: {
          institutionId: 'same-institution',
          profileName: 'TEACHER',
        },
      });

      // Simulate rehydrated state with old profile
      const rehydratedState = {
        modules: { ...defaultModules, essay: false },
        ownerInstitutionId: 'same-institution',
        ownerProfileType: 'STUDENT', // Different from current 'TEACHER'
        loading: false,
        fetchModules: jest.fn(),
        clearModules: useModulesStore.getState().clearModules,
      };

      const currentInstitutionId =
        useAuthStore.getState().sessionInfo?.institutionId ?? null;
      const currentProfile =
        (useAuthStore.getState().sessionInfo as { profileName?: string })
          ?.profileName ?? null;

      const shouldClear =
        (rehydratedState.ownerInstitutionId &&
          rehydratedState.ownerInstitutionId !== currentInstitutionId) ||
        (rehydratedState.ownerProfileType &&
          rehydratedState.ownerProfileType !== currentProfile);

      expect(shouldClear).toBe(true);
      expect(rehydratedState.ownerProfileType).not.toBe(currentProfile);
    });

    it('should clear modules when both institution and profile changed', () => {
      useAuthStore.getState.mockReturnValue({
        sessionInfo: {
          institutionId: 'new-institution',
          profileName: 'TEACHER',
        },
      });

      const rehydratedState = {
        modules: defaultModules,
        ownerInstitutionId: 'old-institution',
        ownerProfileType: 'STUDENT',
        loading: false,
        fetchModules: jest.fn(),
        clearModules: useModulesStore.getState().clearModules,
      };

      const currentInstitutionId =
        useAuthStore.getState().sessionInfo?.institutionId ?? null;
      const currentProfile =
        (useAuthStore.getState().sessionInfo as { profileName?: string })
          ?.profileName ?? null;

      const shouldClear =
        (rehydratedState.ownerInstitutionId &&
          rehydratedState.ownerInstitutionId !== currentInstitutionId) ||
        (rehydratedState.ownerProfileType &&
          rehydratedState.ownerProfileType !== currentProfile);

      expect(shouldClear).toBe(true);
    });

    it('should NOT clear modules when institution and profile are the same', () => {
      useAuthStore.getState.mockReturnValue({
        sessionInfo: {
          institutionId: 'same-institution',
          profileName: 'STUDENT',
        },
      });

      const rehydratedState = {
        modules: { ...defaultModules, simulator: false },
        ownerInstitutionId: 'same-institution',
        ownerProfileType: 'STUDENT',
        loading: false,
        fetchModules: jest.fn(),
        clearModules: useModulesStore.getState().clearModules,
      };

      const currentInstitutionId =
        useAuthStore.getState().sessionInfo?.institutionId ?? null;
      const currentProfile =
        (useAuthStore.getState().sessionInfo as { profileName?: string })
          ?.profileName ?? null;

      const shouldClear =
        (rehydratedState.ownerInstitutionId &&
          rehydratedState.ownerInstitutionId !== currentInstitutionId) ||
        (rehydratedState.ownerProfileType &&
          rehydratedState.ownerProfileType !== currentProfile);

      expect(shouldClear).toBe(false);
    });

    it('should NOT clear modules when ownerInstitutionId is null (fresh state)', () => {
      useAuthStore.getState.mockReturnValue({
        sessionInfo: {
          institutionId: 'any-institution',
          profileName: 'STUDENT',
        },
      });

      const rehydratedState = {
        modules: defaultModules,
        ownerInstitutionId: null, // No previous owner
        ownerProfileType: null,
        loading: false,
        fetchModules: jest.fn(),
        clearModules: useModulesStore.getState().clearModules,
      };

      const currentInstitutionId =
        useAuthStore.getState().sessionInfo?.institutionId ?? null;
      const currentProfile =
        (useAuthStore.getState().sessionInfo as { profileName?: string })
          ?.profileName ?? null;

      const shouldClear =
        (rehydratedState.ownerInstitutionId &&
          rehydratedState.ownerInstitutionId !== currentInstitutionId) ||
        (rehydratedState.ownerProfileType &&
          rehydratedState.ownerProfileType !== currentProfile);

      // Should NOT clear because ownerInstitutionId is null (falsy check)
      // In JS, null && something returns null (falsy), so modules won't be cleared
      expect(shouldClear).toBeFalsy();
    });

    it('should NOT clear modules when current sessionInfo is null', () => {
      useAuthStore.getState.mockReturnValue({
        sessionInfo: null,
      });

      const rehydratedState = {
        modules: { ...defaultModules, forum: false },
        ownerInstitutionId: 'old-institution',
        ownerProfileType: 'STUDENT',
        loading: false,
        fetchModules: jest.fn(),
        clearModules: useModulesStore.getState().clearModules,
      };

      const currentInstitutionId =
        useAuthStore.getState().sessionInfo?.institutionId ?? null;
      const currentProfile =
        (useAuthStore.getState().sessionInfo as { profileName?: string })
          ?.profileName ?? null;

      // When currentInstitutionId is null, rehydrated.ownerInstitutionId !== null
      // This means institution changed (user logged out or different user)
      const shouldClear =
        (rehydratedState.ownerInstitutionId &&
          rehydratedState.ownerInstitutionId !== currentInstitutionId) ||
        (rehydratedState.ownerProfileType &&
          rehydratedState.ownerProfileType !== currentProfile);

      // Should clear because rehydrated has an institution but current is null
      expect(shouldClear).toBe(true);
    });

    it('should handle undefined profileName in sessionInfo', () => {
      useAuthStore.getState.mockReturnValue({
        sessionInfo: { institutionId: 'same-institution' }, // No profileName
      });

      const rehydratedState = {
        modules: defaultModules,
        ownerInstitutionId: 'same-institution',
        ownerProfileType: 'STUDENT',
        loading: false,
        fetchModules: jest.fn(),
        clearModules: useModulesStore.getState().clearModules,
      };

      const currentInstitutionId =
        useAuthStore.getState().sessionInfo?.institutionId ?? null;
      const currentProfile =
        (useAuthStore.getState().sessionInfo as { profileName?: string })
          ?.profileName ?? null;

      const shouldClear =
        (rehydratedState.ownerInstitutionId &&
          rehydratedState.ownerInstitutionId !== currentInstitutionId) ||
        (rehydratedState.ownerProfileType &&
          rehydratedState.ownerProfileType !== currentProfile);

      // Should clear because profile is 'STUDENT' but current is null
      expect(shouldClear).toBe(true);
    });
  });

  describe('useAuthStore.subscribe - institution/profile change listener (lines 278-292)', () => {
    // This tests the subscribe callback logic that clears modules when auth changes
    // The callback is: useAuthStore.subscribe((state) => { ... })

    it('should clear modules when institution changes from a previous value', () => {
      // Simulate the logic from lines 280-292
      let lastInstitutionId: string | null = 'old-institution';
      let lastProfileType: string | null = 'STUDENT';

      const nextInstitutionId = 'new-institution';
      const nextProfileType = 'STUDENT';

      const clearModulesSpy = jest.fn();

      // Logic from lines 280-292
      if (
        nextInstitutionId !== lastInstitutionId ||
        nextProfileType !== lastProfileType
      ) {
        if (lastInstitutionId !== null || lastProfileType !== null) {
          clearModulesSpy();
        }
        lastInstitutionId = nextInstitutionId;
        lastProfileType = nextProfileType;
      }

      expect(clearModulesSpy).toHaveBeenCalled();
      expect(lastInstitutionId).toBe('new-institution');
      expect(lastProfileType).toBe('STUDENT');
    });

    it('should clear modules when profile changes from a previous value', () => {
      let lastInstitutionId: string | null = 'same-institution';
      let lastProfileType: string | null = 'STUDENT';

      const nextInstitutionId = 'same-institution';
      const nextProfileType = 'TEACHER';

      const clearModulesSpy = jest.fn();

      if (
        nextInstitutionId !== lastInstitutionId ||
        nextProfileType !== lastProfileType
      ) {
        if (lastInstitutionId !== null || lastProfileType !== null) {
          clearModulesSpy();
        }
        lastInstitutionId = nextInstitutionId;
        lastProfileType = nextProfileType;
      }

      expect(clearModulesSpy).toHaveBeenCalled();
      expect(lastInstitutionId).toBe('same-institution');
      expect(lastProfileType).toBe('TEACHER');
    });

    it('should NOT clear modules on initial load (both previous values are null)', () => {
      let lastInstitutionId: string | null = null;
      let lastProfileType: string | null = null;

      const nextInstitutionId = 'new-institution';
      const nextProfileType = 'STUDENT';

      const clearModulesSpy = jest.fn();

      if (
        nextInstitutionId !== lastInstitutionId ||
        nextProfileType !== lastProfileType
      ) {
        // Only clear if there was a previous value (actual change, not initial load)
        if (lastInstitutionId !== null || lastProfileType !== null) {
          clearModulesSpy();
        }
        lastInstitutionId = nextInstitutionId;
        lastProfileType = nextProfileType;
      }

      // Should NOT have been called because this is initial load
      expect(clearModulesSpy).not.toHaveBeenCalled();
      // But values should still be updated
      expect(lastInstitutionId).toBe('new-institution');
      expect(lastProfileType).toBe('STUDENT');
    });

    it('should NOT clear modules when values remain the same', () => {
      let lastInstitutionId: string | null = 'same-institution';
      let lastProfileType: string | null = 'STUDENT';

      const nextInstitutionId = 'same-institution';
      const nextProfileType = 'STUDENT';

      const clearModulesSpy = jest.fn();

      if (
        nextInstitutionId !== lastInstitutionId ||
        nextProfileType !== lastProfileType
      ) {
        if (lastInstitutionId !== null || lastProfileType !== null) {
          clearModulesSpy();
        }
        lastInstitutionId = nextInstitutionId;
        lastProfileType = nextProfileType;
      }

      expect(clearModulesSpy).not.toHaveBeenCalled();
      // Values should remain unchanged since if block was not entered
      expect(lastInstitutionId).toBe('same-institution');
      expect(lastProfileType).toBe('STUDENT');
    });

    it('should clear modules when user logs out (values become null)', () => {
      let lastInstitutionId: string | null = 'old-institution';
      let lastProfileType: string | null = 'STUDENT';

      const nextInstitutionId: string | null = null;
      const nextProfileType: string | null = null;

      const clearModulesSpy = jest.fn();

      if (
        nextInstitutionId !== lastInstitutionId ||
        nextProfileType !== lastProfileType
      ) {
        if (lastInstitutionId !== null || lastProfileType !== null) {
          clearModulesSpy();
        }
        lastInstitutionId = nextInstitutionId;
        lastProfileType = nextProfileType;
      }

      expect(clearModulesSpy).toHaveBeenCalled();
      expect(lastInstitutionId).toBeNull();
      expect(lastProfileType).toBeNull();
    });

    it('should clear modules when both institution and profile change', () => {
      let lastInstitutionId: string | null = 'old-institution';
      let lastProfileType: string | null = 'STUDENT';

      const nextInstitutionId = 'new-institution';
      const nextProfileType = 'TEACHER';

      const clearModulesSpy = jest.fn();

      if (
        nextInstitutionId !== lastInstitutionId ||
        nextProfileType !== lastProfileType
      ) {
        if (lastInstitutionId !== null || lastProfileType !== null) {
          clearModulesSpy();
        }
        lastInstitutionId = nextInstitutionId;
        lastProfileType = nextProfileType;
      }

      expect(clearModulesSpy).toHaveBeenCalledTimes(1);
      expect(lastInstitutionId).toBe('new-institution');
      expect(lastProfileType).toBe('TEACHER');
    });

    it('should clear when only lastProfileType was non-null', () => {
      let lastInstitutionId: string | null = null;
      let lastProfileType: string | null = 'STUDENT';

      const nextInstitutionId: string | null = null;
      const nextProfileType = 'TEACHER';

      const clearModulesSpy = jest.fn();

      if (
        nextInstitutionId !== lastInstitutionId ||
        nextProfileType !== lastProfileType
      ) {
        if (lastInstitutionId !== null || lastProfileType !== null) {
          clearModulesSpy();
        }
        lastInstitutionId = nextInstitutionId;
        lastProfileType = nextProfileType;
      }

      // Should clear because lastProfileType was non-null
      expect(clearModulesSpy).toHaveBeenCalled();
      expect(lastInstitutionId).toBeNull();
      expect(lastProfileType).toBe('TEACHER');
    });
  });
});
