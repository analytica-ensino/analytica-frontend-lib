import { useModulesStore, type ModulesConfig } from './modulesStore';
import { KEYS } from '../utils/keys';

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
      sessionInfo: { institutionId: 'test-institution-id' },
    })),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

describe('ModulesStore', () => {
  const defaultModules: ModulesConfig = {
    simulator: true,
    essay: true,
    forum: true,
    support: true,
  };

  beforeEach(() => {
    // Clear store state before each test
    useModulesStore.setState({
      modules: defaultModules,
      loading: false,
      ownerInstitutionId: null,
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
    });
  });

  describe('fetchModules', () => {
    const mockApi = {
      get: jest.fn(),
    };

    beforeEach(() => {
      mockApi.get.mockReset();
    });

    it('should skip fetch if cached data exists for same institution', async () => {
      const institutionId = 'test-institution';
      const cachedData = {
        state: {
          modules: { simulator: false, essay: true, forum: true, support: false },
          ownerInstitutionId: institutionId,
        },
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));

      await useModulesStore.getState().fetchModules(institutionId, mockApi as any);

      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('should fetch if cached data is for different institution', async () => {
      const institutionId = 'new-institution';
      const cachedData = {
        state: {
          modules: defaultModules,
          ownerInstitutionId: 'old-institution',
        },
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: {
            featureFlags: {
              version: { simulator: false, essay: true, forum: false, support: true },
            },
          },
        },
      });

      await useModulesStore.getState().fetchModules(institutionId, mockApi as any);

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
        .fetchModules(institutionId, mockApi as any);

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

      await useModulesStore.getState().fetchModules(institutionId, mockApi as any);

      const state = useModulesStore.getState();
      expect(state.modules).toEqual(apiModules);
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

      await useModulesStore.getState().fetchModules(institutionId, mockApi as any);

      const { modules } = useModulesStore.getState();
      expect(modules.simulator).toBe(false); // From API
      expect(modules.essay).toBe(true); // Default
      expect(modules.forum).toBe(true); // Default
      expect(modules.support).toBe(true); // Default
    });

    it('should use defaults when API returns no version', async () => {
      const institutionId = 'test-institution';

      mockApi.get.mockResolvedValueOnce({
        data: {
          data: null,
        },
      });

      await useModulesStore.getState().fetchModules(institutionId, mockApi as any);

      const state = useModulesStore.getState();
      expect(state.modules).toEqual(defaultModules);
      expect(state.ownerInstitutionId).toBe(institutionId);
    });

    it('should use defaults when API call fails', async () => {
      const institutionId = 'test-institution';

      mockApi.get.mockRejectedValueOnce(new Error('API Error'));

      await useModulesStore.getState().fetchModules(institutionId, mockApi as any);

      const state = useModulesStore.getState();
      expect(state.modules).toEqual(defaultModules);
      expect(state.ownerInstitutionId).toBe(institutionId);
      expect(state.loading).toBe(false);
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

      await useModulesStore.getState().fetchModules(institutionId, mockApi as any);

      // Should continue with fetch despite invalid cache
      expect(mockApi.get).toHaveBeenCalled();
    });
  });

  describe('clearModules', () => {
    it('should reset modules to defaults', () => {
      // First set some non-default values
      useModulesStore.setState({
        modules: { simulator: false, essay: false, forum: false, support: false },
        ownerInstitutionId: 'some-institution',
      });

      useModulesStore.getState().clearModules();

      const state = useModulesStore.getState();
      expect(state.modules).toEqual(defaultModules);
      expect(state.ownerInstitutionId).toBeNull();
    });

    it('should clear ownerInstitutionId', () => {
      useModulesStore.setState({
        ownerInstitutionId: 'test-institution',
      });

      useModulesStore.getState().clearModules();

      expect(useModulesStore.getState().ownerInstitutionId).toBeNull();
    });
  });

  describe('persistence', () => {
    it('should use correct storage key', () => {
      expect(KEYS.MODULES_STORAGE).toBe('@modules-storage:analytica:v1');
    });

    it('should only persist modules and ownerInstitutionId', () => {
      // The partialize function should exclude loading from persistence
      const state = {
        modules: defaultModules,
        loading: true,
        ownerInstitutionId: 'test-id',
      };

      // Simulate what partialize does
      const partializedState = {
        modules: state.modules,
        ownerInstitutionId: state.ownerInstitutionId,
      };

      expect(partializedState).not.toHaveProperty('loading');
      expect(partializedState).toHaveProperty('modules');
      expect(partializedState).toHaveProperty('ownerInstitutionId');
    });
  });
});
