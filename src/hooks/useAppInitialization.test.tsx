import { renderHook, act } from '@testing-library/react';
import { useAppInitialization } from './useAppInitialization';

// Mock do useInstitutionId
const mockUseInstitutionId = jest.fn();
jest.mock('./useInstitution', () => ({
  useInstitutionId: () => mockUseInstitutionId(),
}));

// Mock do useAppStore
const mockInitialize = jest.fn();
const mockUseAppStore = jest.fn();
jest.mock('../store/appStore', () => ({
  useAppStore: () => mockUseAppStore(),
}));

// Mock do useAuthStore
const mockSignOut = jest.fn();
const mockUseAuthStore = jest.fn();

const mockAuthState = {
  sessionInfo: null as Record<string, unknown> | null,
  tokens: null as Record<string, unknown> | null,
  user: null as Record<string, unknown> | null,
  signOut: mockSignOut,
};

jest.mock('../store/authStore', () => {
  const mockUseAuthStoreFn = () => mockUseAuthStore();
  mockUseAuthStoreFn.getState = () => mockAuthState;

  return {
    useAuthStore: mockUseAuthStoreFn,
  };
});

describe('useAppInitialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockUseInstitutionId.mockReturnValue('test-institution-id');
    mockUseAppStore.mockReturnValue({
      initialize: mockInitialize,
      initialized: true,
      institutionId: 'test-institution-id',
    });
    mockUseAuthStore.mockReturnValue({
      sessionInfo: null,
      tokens: null,
      user: null,
    });

    // Reset auth state
    mockAuthState.sessionInfo = null;
    mockAuthState.tokens = null;
    mockAuthState.user = null;
  });

  it('should return correct initialization state', () => {
    const testInstitutionId = 'test-institution-123';
    const testInitialized = true;
    const testInstitutionIdFromStore = 'test-institution-from-store';

    mockUseInstitutionId.mockReturnValue(testInstitutionId);
    mockUseAppStore.mockReturnValue({
      initialize: mockInitialize,
      initialized: testInitialized,
      institutionId: testInstitutionIdFromStore,
    });

    const { result } = renderHook(() => useAppInitialization());

    expect(result.current.getInstitutionId).toBe(testInstitutionId);
    expect(result.current.initialize).toBe(mockInitialize);
    expect(result.current.initialized).toBe(testInitialized);
    expect(result.current.institutionId).toBe(testInstitutionIdFromStore);
  });

  it('should return memoized auth functions', () => {
    const { result } = renderHook(() => useAppInitialization());

    const firstAuthFunctions = result.current.authFunctions;

    // Re-render the hook
    act(() => {
      // Force re-render by changing mock return value
      mockUseInstitutionId.mockReturnValue('different-institution');
    });

    const secondAuthFunctions = result.current.authFunctions;

    // Auth functions should be memoized and be the same reference
    expect(firstAuthFunctions).toBe(secondAuthFunctions);
  });

  it('should return auth functions that work correctly', () => {
    const mockSessionInfo = {
      sessionId: 'test-session',
      userId: 'test-user',
      profileId: 'test-profile',
      institutionId: 'test-institution',
      schoolId: 'test-school',
      schoolYearId: 'test-year',
      classId: 'test-class',
      subjects: ['subject1'],
      schools: ['school1'],
    };

    const mockTokens = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    };

    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    };

    // Set up auth state
    mockAuthState.sessionInfo = mockSessionInfo;
    mockAuthState.tokens = mockTokens;
    mockAuthState.user = mockUser;

    const { result } = renderHook(() => useAppInitialization());

    const { authFunctions } = result.current;

    // Test checkAuth function
    expect(authFunctions.checkAuth).toBeDefined();
    expect(typeof authFunctions.checkAuth).toBe('function');

    // Test signOut function
    expect(authFunctions.signOut).toBeDefined();
    expect(typeof authFunctions.signOut).toBe('function');

    // Test getUser function
    expect(authFunctions.getUser).toBeDefined();
    expect(typeof authFunctions.getUser).toBe('function');

    // Test getSessionInfo function
    expect(authFunctions.getSessionInfo).toBeDefined();
    expect(typeof authFunctions.getSessionInfo).toBe('function');

    // Test getTokens function
    expect(authFunctions.getTokens).toBeDefined();
    expect(typeof authFunctions.getTokens).toBe('function');
  });

  it('should test checkAuth function returns true when sessionInfo and tokens exist', async () => {
    const mockSessionInfo = { sessionId: 'test-session', userId: 'test-user' };
    const mockTokens = {
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
    };

    mockAuthState.sessionInfo = mockSessionInfo;
    mockAuthState.tokens = mockTokens;

    const { result } = renderHook(() => useAppInitialization());

    const checkAuthResult = await result.current.authFunctions.checkAuth();
    expect(checkAuthResult).toBe(true);
  });

  it('should test checkAuth function returns false when sessionInfo is null', async () => {
    const mockTokens = {
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
    };

    mockAuthState.sessionInfo = null;
    mockAuthState.tokens = mockTokens;

    const { result } = renderHook(() => useAppInitialization());

    const checkAuthResult = await result.current.authFunctions.checkAuth();
    expect(checkAuthResult).toBe(false);
  });

  it('should test checkAuth function returns false when tokens is null', async () => {
    const mockSessionInfo = { sessionId: 'test-session', userId: 'test-user' };

    mockAuthState.sessionInfo = mockSessionInfo;
    mockAuthState.tokens = null;

    const { result } = renderHook(() => useAppInitialization());

    const checkAuthResult = await result.current.authFunctions.checkAuth();
    expect(checkAuthResult).toBe(false);
  });

  it('should test checkAuth function returns false when both sessionInfo and tokens are null', async () => {
    mockAuthState.sessionInfo = null;
    mockAuthState.tokens = null;

    const { result } = renderHook(() => useAppInitialization());

    const checkAuthResult = await result.current.authFunctions.checkAuth();
    expect(checkAuthResult).toBe(false);
  });

  it('should test signOut function calls store signOut', () => {
    const { result } = renderHook(() => useAppInitialization());

    result.current.authFunctions.signOut();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('should test getUser function returns user from store', () => {
    const mockUser = { id: 'user-123', name: 'Test User' };
    mockAuthState.user = mockUser;

    const { result } = renderHook(() => useAppInitialization());

    const userResult = result.current.authFunctions.getUser();
    expect(userResult).toBe(mockUser);
  });

  it('should test getUser function returns null when user is null', () => {
    mockAuthState.user = null;

    const { result } = renderHook(() => useAppInitialization());

    const userResult = result.current.authFunctions.getUser();
    expect(userResult).toBe(null);
  });

  it('should test getSessionInfo function returns sessionInfo from store', () => {
    const mockSessionInfo = {
      sessionId: 'test-session',
      userId: 'test-user',
      profileId: 'test-profile',
      institutionId: 'test-institution',
      schoolId: 'test-school',
      schoolYearId: 'test-year',
      classId: 'test-class',
      subjects: ['subject1'],
      schools: ['school1'],
    };

    mockAuthState.sessionInfo = mockSessionInfo;

    const { result } = renderHook(() => useAppInitialization());

    const sessionResult = result.current.authFunctions.getSessionInfo();
    expect(sessionResult).toBe(mockSessionInfo);
  });

  it('should test getSessionInfo function returns null when sessionInfo is null', () => {
    mockAuthState.sessionInfo = null;

    const { result } = renderHook(() => useAppInitialization());

    const sessionResult = result.current.authFunctions.getSessionInfo();
    expect(sessionResult).toBe(null);
  });

  it('should test getTokens function returns tokens from store', () => {
    const mockTokens = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    };

    mockAuthState.tokens = mockTokens;

    const { result } = renderHook(() => useAppInitialization());

    const tokensResult = result.current.authFunctions.getTokens();
    expect(tokensResult).toBe(mockTokens);
  });

  it('should test getTokens function returns null when tokens is null', () => {
    mockAuthState.tokens = null;

    const { result } = renderHook(() => useAppInitialization());

    const tokensResult = result.current.authFunctions.getTokens();
    expect(tokensResult).toBe(null);
  });

  it('should handle null institutionId from useInstitutionId', () => {
    mockUseInstitutionId.mockReturnValue(null);
    mockUseAppStore.mockReturnValue({
      initialize: mockInitialize,
      initialized: false,
      institutionId: null,
    });

    const { result } = renderHook(() => useAppInitialization());

    expect(result.current.getInstitutionId).toBe(null);
    expect(result.current.initialized).toBe(false);
    expect(result.current.institutionId).toBe(null);
  });

  it('should handle undefined institutionId from useInstitutionId', () => {
    mockUseInstitutionId.mockReturnValue(undefined);
    mockUseAppStore.mockReturnValue({
      initialize: mockInitialize,
      initialized: false,
      institutionId: undefined,
    });

    const { result } = renderHook(() => useAppInitialization());

    expect(result.current.getInstitutionId).toBe(undefined);
    expect(result.current.initialized).toBe(false);
    expect(result.current.institutionId).toBe(undefined);
  });

  it('should maintain function references across re-renders due to memoization', () => {
    const { result, rerender } = renderHook(() => useAppInitialization());

    const firstAuthFunctions = result.current.authFunctions;
    const firstInitialize = result.current.initialize;

    // Change mock values to trigger re-render
    mockUseInstitutionId.mockReturnValue('different-institution');
    mockUseAppStore.mockReturnValue({
      initialize: mockInitialize,
      initialized: false,
      institutionId: 'different-institution',
    });

    rerender();

    const secondAuthFunctions = result.current.authFunctions;
    const secondInitialize = result.current.initialize;

    // Auth functions should be memoized (same reference)
    expect(firstAuthFunctions).toBe(secondAuthFunctions);
    // Initialize function should be the same (from store)
    expect(firstInitialize).toBe(secondInitialize);
  });

  it('should work with all auth functions having valid data', () => {
    const mockSessionInfo = {
      sessionId: 'test-session',
      userId: 'test-user',
      profileId: 'test-profile',
      institutionId: 'test-institution',
      schoolId: 'test-school',
      schoolYearId: 'test-year',
      classId: 'test-class',
      subjects: ['subject1'],
      schools: ['school1'],
    };

    const mockTokens = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    };

    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    };

    // Set up complete auth state
    mockAuthState.sessionInfo = mockSessionInfo;
    mockAuthState.tokens = mockTokens;
    mockAuthState.user = mockUser;

    const { result } = renderHook(() => useAppInitialization());

    const { authFunctions } = result.current;

    // Test all functions return expected values
    expect(authFunctions.checkAuth()).resolves.toBe(true);
    expect(authFunctions.getUser()).toBe(mockUser);
    expect(authFunctions.getSessionInfo()).toBe(mockSessionInfo);
    expect(authFunctions.getTokens()).toBe(mockTokens);
  });

  it('should handle edge case with empty sessionInfo object', async () => {
    const mockTokens = {
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
    };

    mockAuthState.sessionInfo = {};
    mockAuthState.tokens = mockTokens;

    const { result } = renderHook(() => useAppInitialization());

    // Empty object should be truthy, so checkAuth should return true
    const checkAuthResult = await result.current.authFunctions.checkAuth();
    expect(checkAuthResult).toBe(true);
  });

  it('should handle edge case with empty tokens object', async () => {
    const mockSessionInfo = { sessionId: 'test-session', userId: 'test-user' };

    mockAuthState.sessionInfo = mockSessionInfo;
    mockAuthState.tokens = {};

    const { result } = renderHook(() => useAppInitialization());

    // Empty object should be truthy, so checkAuth should return true
    const checkAuthResult = await result.current.authFunctions.checkAuth();
    expect(checkAuthResult).toBe(true);
  });

  it('should test Boolean conversion in checkAuth with various falsy values', async () => {
    const { result } = renderHook(() => useAppInitialization());

    // Test with null sessionInfo
    mockAuthState.sessionInfo = null;
    mockAuthState.tokens = { token: 'test' };
    let checkAuthResult = await result.current.authFunctions.checkAuth();
    expect(checkAuthResult).toBe(false);

    // Test with null tokens
    mockAuthState.sessionInfo = { session: 'test' };
    mockAuthState.tokens = null;
    checkAuthResult = await result.current.authFunctions.checkAuth();
    expect(checkAuthResult).toBe(false);

    // Test with both null
    mockAuthState.sessionInfo = null;
    mockAuthState.tokens = null;
    checkAuthResult = await result.current.authFunctions.checkAuth();
    expect(checkAuthResult).toBe(false);

    // Test with both valid
    mockAuthState.sessionInfo = { session: 'test' };
    mockAuthState.tokens = { token: 'test' };
    checkAuthResult = await result.current.authFunctions.checkAuth();
    expect(checkAuthResult).toBe(true);
  });
});
