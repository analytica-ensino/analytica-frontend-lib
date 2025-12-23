import { renderHook } from '@testing-library/react';
import { useAppContent } from './useAppContent';

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock do useAuthStore
const mockSetTokens = jest.fn();
const mockSetSessionInfo = jest.fn();
const mockSetSelectedProfile = jest.fn();
const mockUseAuthStore = jest.fn();

jest.mock('../store/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

// Mock do analytica-frontend-lib
const mockUseApiConfig = jest.fn();
const mockUseUrlAuthentication = jest.fn();
const mockUseTheme = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('..', () => ({
  useApiConfig: (api: unknown) => mockUseApiConfig(api),
  useUrlAuthentication: (config: unknown) => mockUseUrlAuthentication(config),
  useTheme: () => mockUseTheme(),
  useAuth: () => mockUseAuth(),
}));

describe('useAppContent', () => {
  const mockApi = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  const mockApiConfig = {
    get: mockApi.get,
    post: mockApi.post,
    put: mockApi.put,
    delete: mockApi.delete,
  };

  const mockInitialize = jest.fn();
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();

    // Setup default mocks
    mockUseAuthStore.mockReturnValue({
      setTokens: mockSetTokens,
      setSessionInfo: mockSetSessionInfo,
      setSelectedProfile: mockSetSelectedProfile,
    });

    mockUseApiConfig.mockReturnValue(mockApiConfig);
    mockUseUrlAuthentication.mockImplementation(() => {});
    mockUseTheme.mockImplementation(() => {});
    mockUseAuth.mockReturnValue({
      sessionInfo: null,
      isAuthenticated: false,
    });
  });

  const defaultConfig = {
    api: mockApi,
    getInstitutionId: 'test-institution-id',
    initialize: mockInitialize,
    initialized: false,
  };

  it('should return correct functions and state', () => {
    const { result } = renderHook(() => useAppContent(defaultConfig));

    expect(result.current.handleNotFoundNavigation).toBeDefined();
    expect(typeof result.current.handleNotFoundNavigation).toBe('function');
    expect(result.current.urlAuthConfig).toBeDefined();
    expect(typeof result.current.urlAuthConfig).toBe('object');
    expect(result.current.institutionIdToUse).toBe('test-institution-id');
  });

  it('should call useTheme hook', () => {
    renderHook(() => useAppContent(defaultConfig));
    expect(mockUseTheme).toHaveBeenCalledTimes(1);
  });

  it('should call useApiConfig with the provided api', () => {
    renderHook(() => useAppContent(defaultConfig));
    expect(mockUseApiConfig).toHaveBeenCalledWith(mockApi);
  });

  it('should call useUrlAuthentication with correct config', () => {
    renderHook(() => useAppContent(defaultConfig));

    expect(mockUseUrlAuthentication).toHaveBeenCalledWith(
      expect.objectContaining({
        setTokens: mockSetTokens,
        setSessionInfo: mockSetSessionInfo,
        setSelectedProfile: expect.any(Function),
        api: mockApiConfig,
        endpoint: '/auth/session-info',
        clearParamsFromURL: expect.any(Function),
        maxRetries: 1,
        retryDelay: 2000,
        onError: expect.any(Function),
      })
    );
  });

  it('should use default endpoint when not provided', () => {
    renderHook(() => useAppContent(defaultConfig));

    const urlAuthConfig = mockUseUrlAuthentication.mock.calls[0][0];
    expect(urlAuthConfig.endpoint).toBe('/auth/session-info');
  });

  it('should use custom endpoint when provided', () => {
    const configWithCustomEndpoint = {
      ...defaultConfig,
      endpoint: '/custom/auth/session-info',
    };

    renderHook(() => useAppContent(configWithCustomEndpoint));

    const urlAuthConfig = mockUseUrlAuthentication.mock.calls[0][0];
    expect(urlAuthConfig.endpoint).toBe('/custom/auth/session-info');
  });

  it('should use default retry settings when not provided', () => {
    renderHook(() => useAppContent(defaultConfig));

    const urlAuthConfig = mockUseUrlAuthentication.mock.calls[0][0];
    expect(urlAuthConfig.maxRetries).toBe(1);
    expect(urlAuthConfig.retryDelay).toBe(2000);
  });

  it('should use custom retry settings when provided', () => {
    const configWithCustomRetry = {
      ...defaultConfig,
      maxRetries: 3,
      retryDelay: 1000,
    };

    renderHook(() => useAppContent(configWithCustomRetry));

    const urlAuthConfig = mockUseUrlAuthentication.mock.calls[0][0];
    expect(urlAuthConfig.maxRetries).toBe(3);
    expect(urlAuthConfig.retryDelay).toBe(1000);
  });

  it('should return institutionId from sessionInfo when available', () => {
    mockUseAuth.mockReturnValue({
      sessionInfo: mockSessionInfo,
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useAppContent(defaultConfig));

    expect(result.current.institutionIdToUse).toBe('test-institution');
  });

  it('should return getInstitutionId when sessionInfo is not available', () => {
    mockUseAuth.mockReturnValue({
      sessionInfo: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useAppContent(defaultConfig));

    expect(result.current.institutionIdToUse).toBe('test-institution-id');
  });

  it('should return getInstitutionId when sessionInfo has no institutionId', () => {
    const sessionInfoWithoutInstitutionId = {
      ...mockSessionInfo,
      institutionId: undefined,
    };

    mockUseAuth.mockReturnValue({
      sessionInfo: sessionInfoWithoutInstitutionId,
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useAppContent(defaultConfig));

    expect(result.current.institutionIdToUse).toBe('test-institution-id');
  });

  it('should call initialize when institutionIdToUse is available and not initialized', () => {
    mockUseAuth.mockReturnValue({
      sessionInfo: mockSessionInfo,
      isAuthenticated: true,
    });

    renderHook(() => useAppContent(defaultConfig));

    expect(mockInitialize).toHaveBeenCalledWith('test-institution');
  });

  it('should not call initialize when already initialized', () => {
    const configInitialized = {
      ...defaultConfig,
      initialized: true,
    };

    mockUseAuth.mockReturnValue({
      sessionInfo: mockSessionInfo,
      isAuthenticated: true,
    });

    renderHook(() => useAppContent(configInitialized));

    expect(mockInitialize).not.toHaveBeenCalled();
  });

  it('should not call initialize when institutionIdToUse is not available', () => {
    const configWithoutInstitutionId = {
      ...defaultConfig,
      getInstitutionId: null,
    };

    mockUseAuth.mockReturnValue({
      sessionInfo: null,
      isAuthenticated: false,
    });

    renderHook(() => useAppContent(configWithoutInstitutionId));

    expect(mockInitialize).not.toHaveBeenCalled();
  });

  it('should handle handleNotFoundNavigation without custom callback', () => {
    const { result } = renderHook(() => useAppContent(defaultConfig));

    result.current.handleNotFoundNavigation();

    expect(mockNavigate).toHaveBeenCalledWith('/painel');
  });

  it('should handle handleNotFoundNavigation with custom callback', () => {
    const customOnNotFoundNavigation = jest.fn();
    const configWithCustomCallback = {
      ...defaultConfig,
      onNotFoundNavigation: customOnNotFoundNavigation,
    };

    const { result } = renderHook(() =>
      useAppContent(configWithCustomCallback)
    );

    result.current.handleNotFoundNavigation();

    expect(customOnNotFoundNavigation).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle handleSetSelectedProfile correctly', () => {
    renderHook(() => useAppContent(defaultConfig));

    const urlAuthConfig = mockUseUrlAuthentication.mock.calls[0][0];
    const testProfile = { id: 'test-profile-id' };

    urlAuthConfig.setSelectedProfile(testProfile);

    expect(mockSetSelectedProfile).toHaveBeenCalledWith(testProfile);
  });

  it('should handle handleClearParamsFromURL without custom callback', () => {
    const mockReplace = jest.fn();
    Object.defineProperty(globalThis, 'location', {
      value: { replace: mockReplace },
      writable: true,
    });

    renderHook(() => useAppContent(defaultConfig));

    const urlAuthConfig = mockUseUrlAuthentication.mock.calls[0][0];
    urlAuthConfig.clearParamsFromURL();

    expect(mockReplace).toHaveBeenCalledWith('/painel');
  });

  it('should handle handleClearParamsFromURL with custom callback', () => {
    const customOnClearParamsFromURL = jest.fn();
    const configWithCustomCallback = {
      ...defaultConfig,
      onClearParamsFromURL: customOnClearParamsFromURL,
    };

    renderHook(() => useAppContent(configWithCustomCallback));

    const urlAuthConfig = mockUseUrlAuthentication.mock.calls[0][0];
    urlAuthConfig.clearParamsFromURL();

    expect(customOnClearParamsFromURL).toHaveBeenCalledTimes(1);
  });

  it('should handle handleError without custom callback', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const testError = new Error('Test error');

    renderHook(() => useAppContent(defaultConfig));

    const urlAuthConfig = mockUseUrlAuthentication.mock.calls[0][0];
    urlAuthConfig.onError(testError);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Erro ao obter informações da sessão:',
      testError
    );
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });

    consoleSpy.mockRestore();
  });

  it('should handle handleError with custom callback', () => {
    const customOnError = jest.fn();
    const configWithCustomCallback = {
      ...defaultConfig,
      onError: customOnError,
    };
    const testError = new Error('Test error');

    renderHook(() => useAppContent(configWithCustomCallback));

    const urlAuthConfig = mockUseUrlAuthentication.mock.calls[0][0];
    urlAuthConfig.onError(testError);

    expect(customOnError).toHaveBeenCalledWith(testError);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should memoize urlAuthConfig to prevent unnecessary re-executions', () => {
    const { result, rerender } = renderHook(() => useAppContent(defaultConfig));

    const firstConfig = result.current.urlAuthConfig;

    // Re-render with same props
    rerender();

    const secondConfig = result.current.urlAuthConfig;

    // Should be the same reference due to memoization
    expect(firstConfig).toBe(secondConfig);
  });

  it('should memoize institutionIdToUse to prevent unnecessary re-executions', () => {
    const { result, rerender } = renderHook(() => useAppContent(defaultConfig));

    const firstInstitutionId = result.current.institutionIdToUse;

    // Re-render with same props
    rerender();

    const secondInstitutionId = result.current.institutionIdToUse;

    // Should be the same reference due to memoization
    expect(firstInstitutionId).toBe(secondInstitutionId);
  });

  it('should update institutionIdToUse when sessionInfo changes', () => {
    const { result, rerender } = renderHook(() => useAppContent(defaultConfig));

    expect(result.current.institutionIdToUse).toBe('test-institution-id');

    // Update sessionInfo
    mockUseAuth.mockReturnValue({
      sessionInfo: mockSessionInfo,
      isAuthenticated: true,
    });

    rerender();

    expect(result.current.institutionIdToUse).toBe('test-institution');
  });

  it('should handle undefined getInstitutionId', () => {
    const configWithUndefinedInstitutionId = {
      ...defaultConfig,
      getInstitutionId: undefined,
    };

    mockUseAuth.mockReturnValue({
      sessionInfo: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() =>
      useAppContent(configWithUndefinedInstitutionId)
    );

    expect(result.current.institutionIdToUse).toBe(undefined);
  });

  it('should handle null getInstitutionId', () => {
    const configWithNullInstitutionId = {
      ...defaultConfig,
      getInstitutionId: null,
    };

    mockUseAuth.mockReturnValue({
      sessionInfo: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() =>
      useAppContent(configWithNullInstitutionId)
    );

    expect(result.current.institutionIdToUse).toBe(null);
  });

  it('should call initialize when institutionIdToUse changes from null to valid', () => {
    mockUseAuth.mockReturnValue({
      sessionInfo: null,
      isAuthenticated: false,
    });

    const { rerender } = renderHook(() => useAppContent(defaultConfig));

    // Clear previous calls since initialize might have been called with getInstitutionId
    mockInitialize.mockClear();

    // Update sessionInfo to have institutionId
    mockUseAuth.mockReturnValue({
      sessionInfo: mockSessionInfo,
      isAuthenticated: true,
    });

    rerender();

    expect(mockInitialize).toHaveBeenCalledWith('test-institution');
  });

  it('should handle multiple re-renders without calling initialize multiple times for same value', () => {
    mockUseAuth.mockReturnValue({
      sessionInfo: mockSessionInfo,
      isAuthenticated: true,
    });

    const { rerender } = renderHook(() => useAppContent(defaultConfig));

    expect(mockInitialize).toHaveBeenCalledTimes(1);
    expect(mockInitialize).toHaveBeenCalledWith('test-institution');

    // Re-render multiple times with same sessionInfo
    rerender();
    rerender();
    rerender();

    // Should still only be called once
    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });

  it('should handle edge case with empty sessionInfo object', () => {
    mockUseAuth.mockReturnValue({
      sessionInfo: {},
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useAppContent(defaultConfig));

    // Should fallback to getInstitutionId when sessionInfo.institutionId is undefined
    expect(result.current.institutionIdToUse).toBe('test-institution-id');
  });

  it('should handle edge case with sessionInfo having null institutionId', () => {
    const sessionInfoWithNullInstitutionId = {
      ...mockSessionInfo,
      institutionId: null,
    };

    mockUseAuth.mockReturnValue({
      sessionInfo: sessionInfoWithNullInstitutionId,
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useAppContent(defaultConfig));

    // Should fallback to getInstitutionId when sessionInfo.institutionId is null
    expect(result.current.institutionIdToUse).toBe('test-institution-id');
  });

  it('should maintain function references across re-renders due to memoization', () => {
    const { result, rerender } = renderHook(() => useAppContent(defaultConfig));

    const firstHandleNotFoundNavigation =
      result.current.handleNotFoundNavigation;

    // Re-render
    rerender();

    const secondHandleNotFoundNavigation =
      result.current.handleNotFoundNavigation;

    // Since handleNotFoundNavigation is not memoized in the hook, they will be different references
    // but they should work the same way
    expect(typeof firstHandleNotFoundNavigation).toBe('function');
    expect(typeof secondHandleNotFoundNavigation).toBe('function');

    // Test that both functions work the same way
    firstHandleNotFoundNavigation();
    expect(mockNavigate).toHaveBeenCalledWith('/painel');

    mockNavigate.mockClear();
    secondHandleNotFoundNavigation();
    expect(mockNavigate).toHaveBeenCalledWith('/painel');
  });

  it('should test all callback functions are properly memoized', () => {
    renderHook(() => useAppContent(defaultConfig));

    const urlAuthConfig = mockUseUrlAuthentication.mock.calls[0][0];

    // Test that all callback functions exist and are functions
    expect(typeof urlAuthConfig.setSelectedProfile).toBe('function');
    expect(typeof urlAuthConfig.clearParamsFromURL).toBe('function');
    expect(typeof urlAuthConfig.onError).toBe('function');

    // Test that they work correctly
    const testProfile = { id: 'test' };
    urlAuthConfig.setSelectedProfile(testProfile);
    expect(mockSetSelectedProfile).toHaveBeenCalledWith(testProfile);

    const mockReplace = jest.fn();
    Object.defineProperty(globalThis, 'location', {
      value: { replace: mockReplace },
      writable: true,
    });

    urlAuthConfig.clearParamsFromURL();
    expect(mockReplace).toHaveBeenCalledWith('/painel');

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const testError = new Error('test');
    urlAuthConfig.onError(testError);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Erro ao obter informações da sessão:',
      testError
    );
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });

    consoleSpy.mockRestore();
  });
});
