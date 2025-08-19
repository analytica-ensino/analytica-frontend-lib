import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  AuthProvider,
  ProtectedRoute,
  PublicRoute,
  useAuth,
  useAuthGuard,
  useRouteAuth,
  withAuth,
  getRootDomain,
} from './Auth';

// Componentes separados para testar hooks (evita uso condicional)
const TestAuthComponent = () => {
  const { isAuthenticated, isLoading, signOut, user, sessionInfo, tokens } =
    useAuth();
  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="session">
        {sessionInfo ? JSON.stringify(sessionInfo) : 'null'}
      </div>
      <div data-testid="tokens">{tokens ? JSON.stringify(tokens) : 'null'}</div>
      <button data-testid="signout-btn" onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
};

const TestAuthGuardComponent = () => {
  const { canAccess, isLoading } = useAuthGuard({
    requireAuth: true,
    customCheck: (authState) => authState.user?.role === 'admin',
  });
  return (
    <div>
      <div data-testid="can-access">{canAccess.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
    </div>
  );
};

const TestAuthGuardNoAuthComponent = () => {
  const { canAccess, isLoading } = useAuthGuard({
    requireAuth: false,
    customCheck: (authState) => !authState.isAuthenticated,
  });
  return (
    <div>
      <div data-testid="can-access">{canAccess.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
    </div>
  );
};

const TestRouteAuthComponent = () => {
  const { isAuthenticated, isLoading } = useRouteAuth('/custom-login');
  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
    </div>
  );
};

const TestComponent = () => (
  <div data-testid="test-component">Test Component</div>
);

// Componente para testar withAuth HOC
const SimpleComponent = ({ title }: { title: string }) => (
  <div data-testid="simple-component">{title}</div>
);

// Helper functions to reduce nesting
const createDelayedPromise = (value: boolean, delay = 100) =>
  new Promise<boolean>((resolve) => setTimeout(() => resolve(value), delay));

const createNeverResolvingPromise = () => new Promise<boolean>(() => {});

// Additional test components to reduce nesting
const TestAuthGuardRequiredComponent = () => {
  const { canAccess, isLoading } = useAuthGuard({ requireAuth: true });
  return (
    <div>
      <div data-testid="can-access">{canAccess.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
    </div>
  );
};

const TestAuthGuardNotRequiredComponent = () => {
  const { canAccess, isLoading } = useAuthGuard({ requireAuth: false });
  return (
    <div>
      <div data-testid="can-access">{canAccess.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
    </div>
  );
};

const TestFailingCustomCheckComponent = () => {
  const { canAccess, isLoading } = useAuthGuard({
    requireAuth: false,
    customCheck: () => false, // Always fails
  });
  return (
    <div>
      <div data-testid="can-access">{canAccess.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
    </div>
  );
};

const TestDefaultOptionsComponent = () => {
  const { canAccess, isLoading } = useAuthGuard(); // No options, should use defaults
  return (
    <div>
      <div data-testid="can-access">{canAccess.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
    </div>
  );
};

const TestRedirectComponent = () => {
  const { redirectToLogin } = useRouteAuth('/login');
  // Call the function to test redirectToLogin
  redirectToLogin();
  return (
    <div data-testid="redirect-test">
      {typeof redirectToLogin === 'function' ? 'function' : 'not-function'}
    </div>
  );
};

const TestDefaultPathComponent = () => {
  const { isAuthenticated, isLoading, redirectToLogin } = useRouteAuth(); // No fallbackPath provided, should default to '/'
  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="redirect-type">
        {typeof redirectToLogin === 'function' ? 'function' : 'not-function'}
      </div>
    </div>
  );
};

const TestLoadingRouteComponent = () => {
  const { isAuthenticated, isLoading } = useRouteAuth('/test');
  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
    </div>
  );
};

// Helper para renderizar com AuthProvider
const renderWithAuth = (
  component: React.ReactNode,
  authProps: {
    checkAuthFn?: () => Promise<boolean> | boolean;
    signOutFn?: () => void;
    initialAuthState?: Record<string, unknown>;
    getUserFn?: () => { id: string; name?: string; role?: string } | null;
    getSessionFn?: () => { institutionId?: string } | null;
    getTokensFn?: () => { token: string; refreshToken: string } | null;
  }
) => {
  return render(
    <MemoryRouter>
      <AuthProvider {...authProps}>{component}</AuthProvider>
    </MemoryRouter>
  );
};

describe('Auth Components', () => {
  describe('AuthProvider', () => {
    it('should initialize with loading state', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestAuthComponent />, { checkAuthFn });

      // Initially should be loading
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });

    it('should call checkAuthFn on mount', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestAuthComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(checkAuthFn).toHaveBeenCalled();
      });
    });

    it('should set authenticated state correctly', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestAuthComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should handle authentication failure', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      renderWithAuth(<TestAuthComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should handle checkAuth error', async () => {
      const checkAuthFn = jest.fn().mockRejectedValue(new Error('Auth failed'));
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderWithAuth(<TestAuthComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erro ao verificar autenticação:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle user, session and tokens data', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);
      const getUserFn = jest.fn().mockReturnValue({ id: '1', name: 'John' });
      const getSessionFn = jest
        .fn()
        .mockReturnValue({ institutionId: 'inst1' });
      const getTokensFn = jest
        .fn()
        .mockReturnValue({ token: 'abc123', refreshToken: 'refresh123' });

      renderWithAuth(<TestAuthComponent />, {
        checkAuthFn,
        getUserFn,
        getSessionFn,
        getTokensFn,
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(
          '{"id":"1","name":"John"}'
        );
        expect(screen.getByTestId('session')).toHaveTextContent(
          '{"institutionId":"inst1"}'
        );
        expect(screen.getByTestId('tokens')).toHaveTextContent(
          '{"token":"abc123","refreshToken":"refresh123"}'
        );
      });
    });

    it('should handle signOut with signOutFn', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);
      const signOutFn = jest.fn();

      renderWithAuth(<TestAuthComponent />, {
        checkAuthFn,
        signOutFn,
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      act(() => {
        screen.getByTestId('signout-btn').click();
      });

      expect(signOutFn).toHaveBeenCalled();
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    it('should handle signOut without signOutFn', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestAuthComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      act(() => {
        screen.getByTestId('signout-btn').click();
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    it('should handle undefined checkAuthFn', async () => {
      renderWithAuth(<TestAuthComponent />, {});

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });
  });

  describe('ProtectedRoute', () => {
    let originalLocation: Location;

    beforeEach(() => {
      // Save original window.location
      originalLocation = window.location;
    });

    afterEach(() => {
      // Restore original window.location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    });
    it('should render children when authenticated', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        { checkAuthFn }
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('should show loading component while checking auth', () => {
      const checkAuthFn = jest
        .fn()
        .mockImplementation(() => createDelayedPromise(true));

      renderWithAuth(
        <ProtectedRoute
          loadingComponent={<div data-testid="custom-loading">Loading...</div>}
        >
          <TestComponent />
        </ProtectedRoute>,
        { checkAuthFn }
      );

      expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
    });

    it('should redirect when not authenticated', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <ProtectedRoute redirectTo="/login">
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });
    });

    it('should respect additional check function', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);
      const additionalCheck = jest.fn().mockReturnValue(false);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <ProtectedRoute
              additionalCheck={additionalCheck}
              redirectTo="/unauthorized"
            >
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(additionalCheck).toHaveBeenCalled();
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });
    });

    it('should redirect to root domain for subdomain', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      // Mock window.location with subdomain
      const mockLocation = {
        hostname: 'aluno.example.com',
        protocol: 'https:',
        port: '',
        href: '',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <ProtectedRoute redirectTo="/login">
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockLocation.href).toBe('https://example.com');
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });
    });

    it('should not redirect for single domain when already on root', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      // Mock window.location with single domain (not localhost)
      const mockLocation = {
        hostname: 'example',
        protocol: 'https:',
        port: '',
        href: '',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <ProtectedRoute redirectTo="/login">
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        // Should not set href because current location is same as root domain
        expect(mockLocation.href).toBe('');
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });
    });

    it('should handle localhost domain without redirecting to root domain', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      // Mock window.location with localhost
      const mockLocation = {
        hostname: 'localhost',
        protocol: 'http:',
        port: '3000',
        href: '',
        assign: jest.fn(),
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <ProtectedRoute redirectTo="/login">
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        // Should not modify href for localhost
        expect(mockLocation.href).toBe('');
        expect(mockLocation.assign).not.toHaveBeenCalled();
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });
    });

    it('should handle localhost subdomain without redirecting to root domain', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      // Mock window.location with localhost subdomain
      const mockLocation = {
        hostname: 'app.localhost',
        protocol: 'http:',
        port: '3000',
        href: '',
        assign: jest.fn(),
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <ProtectedRoute redirectTo="/login">
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        // Should not modify href for localhost subdomain
        expect(mockLocation.href).toBe('');
        expect(mockLocation.assign).not.toHaveBeenCalled();
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });
    });

    it('should handle authentication check error gracefully', async () => {
      const checkAuthFn = jest
        .fn()
        .mockRejectedValue(new Error('Auth check failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock window.location
      const mockLocation = {
        hostname: 'example.com',
        protocol: 'https:',
        port: '',
        href: '',
        assign: jest.fn(),
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <ProtectedRoute redirectTo="/login">
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(checkAuthFn).toHaveBeenCalled();
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('should verify window.location assignment is called with correct domain', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      // Mock window.location with a spy to track assignment
      const mockLocation = {
        hostname: 'subdomain.example.com',
        protocol: 'https:',
        port: '',
        href: '',
        _internalHref: '',
      };

      const hrefSetter = jest.fn();
      Object.defineProperty(mockLocation, 'href', {
        get: () => mockLocation._internalHref,
        set: hrefSetter,
      });

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <ProtectedRoute redirectTo="/login">
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(hrefSetter).toHaveBeenCalledWith('https://example.com');
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });
    });

    it('should not redirect for two-part domain (example.com)', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      // Mock window.location with standard two-part domain
      const mockLocation = {
        hostname: 'example.com',
        protocol: 'https:',
        port: '',
        href: '',
        _internalHref: '',
      };

      const hrefSetter = jest.fn();
      Object.defineProperty(mockLocation, 'href', {
        get: () => mockLocation._internalHref,
        set: hrefSetter,
      });

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <ProtectedRoute redirectTo="/login">
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        // Should not redirect because example.com is already the root domain
        expect(hrefSetter).not.toHaveBeenCalled();
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });
    });

    it('should redirect multi-level subdomain to root domain', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      // Mock window.location with multi-level subdomain
      const mockLocation = {
        hostname: 'deep.subdomain.example.com',
        protocol: 'https:',
        port: '',
        href: '',
        _internalHref: '',
      };

      const hrefSetter = jest.fn();
      Object.defineProperty(mockLocation, 'href', {
        get: () => mockLocation._internalHref,
        set: hrefSetter,
      });

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <ProtectedRoute redirectTo="/login">
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(hrefSetter).toHaveBeenCalledWith('https://example.com');
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });
    });
  });

  describe('PublicRoute', () => {
    it('should render children when not authenticated', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      renderWithAuth(
        <PublicRoute>
          <TestComponent />
        </PublicRoute>,
        { checkAuthFn }
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('should redirect when authenticated and redirectIfAuthenticated is set', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <PublicRoute redirectTo="/dashboard" redirectIfAuthenticated={true}>
              <TestComponent />
            </PublicRoute>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      });
    });

    it('should render children when authenticated but no redirect configured', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(
        <PublicRoute>
          <TestComponent />
        </PublicRoute>,
        { checkAuthFn }
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });
    });

    it('should show loading when checkAuthBeforeRender is true', () => {
      const checkAuthFn = jest
        .fn()
        .mockImplementation(() => createDelayedPromise(false));

      renderWithAuth(
        <PublicRoute checkAuthBeforeRender={true}>
          <TestComponent />
        </PublicRoute>,
        { checkAuthFn }
      );

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });
  });

  describe('withAuth HOC', () => {
    it('should wrap component with ProtectedRoute', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);
      const WrappedComponent = withAuth(SimpleComponent, {
        redirectTo: '/login',
      });

      renderWithAuth(<WrappedComponent title="Protected Content" />, {
        checkAuthFn,
      });

      await waitFor(() => {
        expect(screen.getByTestId('simple-component')).toBeInTheDocument();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should redirect when not authenticated', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);
      const WrappedComponent = withAuth(SimpleComponent, {
        redirectTo: '/login',
      });

      render(
        <MemoryRouter>
          <AuthProvider checkAuthFn={checkAuthFn}>
            <WrappedComponent title="Protected Content" />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId('simple-component')
        ).not.toBeInTheDocument();
      });
    });

    it('should work with no options provided (use default)', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);
      // Test the default options branch
      const WrappedComponent = withAuth(SimpleComponent); // No options provided

      renderWithAuth(<WrappedComponent title="Default Options" />, {
        checkAuthFn,
      });

      await waitFor(() => {
        expect(screen.getByTestId('simple-component')).toBeInTheDocument();
        expect(screen.getByText('Default Options')).toBeInTheDocument();
      });
    });
  });

  describe('useAuthGuard', () => {
    it('should return correct access state for authenticated user', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestAuthGuardComponent />, {
        checkAuthFn,
      });

      await waitFor(() => {
        expect(screen.getByTestId('can-access')).toHaveTextContent('false'); // because customCheck requires admin role
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should return correct access state for unauthenticated user', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      renderWithAuth(<TestAuthGuardComponent />, {
        checkAuthFn,
      });

      await waitFor(() => {
        expect(screen.getByTestId('can-access')).toHaveTextContent('false');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should work with requireAuth false', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      renderWithAuth(<TestAuthGuardNoAuthComponent />, {
        checkAuthFn,
      });

      await waitFor(() => {
        expect(screen.getByTestId('can-access')).toHaveTextContent('true'); // requireAuth false + customCheck passes for non-auth
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should handle custom check with authenticated user having admin role', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);
      const getUserFn = jest.fn().mockReturnValue({ id: '1', role: 'admin' });

      renderWithAuth(<TestAuthGuardComponent />, {
        checkAuthFn,
        getUserFn,
      });

      await waitFor(() => {
        expect(screen.getByTestId('can-access')).toHaveTextContent('true'); // admin role should pass
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should return false when loading', async () => {
      const checkAuthFn = jest.fn(createNeverResolvingPromise); // Never resolves to keep loading state

      renderWithAuth(<TestAuthGuardRequiredComponent />, { checkAuthFn });

      // Should be loading and canAccess should be false
      expect(screen.getByTestId('can-access')).toHaveTextContent('false');
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });

    it('should work with requireAuth true and no customCheck', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestAuthGuardRequiredComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('can-access')).toHaveTextContent('true');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should work with requireAuth false and no customCheck', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      renderWithAuth(<TestAuthGuardNotRequiredComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('can-access')).toHaveTextContent('true'); // not authenticated and requireAuth false = true
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should work with requireAuth false and authenticated user', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestAuthGuardNotRequiredComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('can-access')).toHaveTextContent('true'); // authenticated user with requireAuth false = true
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should work with requireAuth false and customCheck that fails for authenticated user', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestFailingCustomCheckComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('can-access')).toHaveTextContent('false'); // customCheck fails
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should work with default options (empty object)', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestDefaultOptionsComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('can-access')).toHaveTextContent('true'); // requireAuth defaults to true, user is authenticated
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });
  });

  describe('useRouteAuth', () => {
    it('should provide auth state', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestRouteAuthComponent />, {
        checkAuthFn,
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should provide redirectToLogin function', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(false);

      renderWithAuth(<TestRedirectComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('redirect-test')).toHaveTextContent(
          'function'
        );
      });
    });

    it('should use default fallbackPath when none provided', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestDefaultPathComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('redirect-type')).toHaveTextContent(
          'function'
        );
      });
    });

    it('should handle loading state correctly', async () => {
      const checkAuthFn = jest.fn(createNeverResolvingPromise); // Never resolves

      renderWithAuth(<TestLoadingRouteComponent />, { checkAuthFn });

      // Should be in loading state
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false'); // initial state
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });
  });

  describe('getRootDomain', () => {
    let originalLocation: Location;

    beforeEach(() => {
      originalLocation = window.location;
    });

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    });

    it('should handle Brazilian .com.br domains correctly', () => {
      const mockLocation = {
        hostname: 'aluno.analiticaensino.com.br',
        protocol: 'https:',
        port: '',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const result = getRootDomain();

      expect(result).toBe('https://analiticaensino.com.br');
    });

    it('should handle multi-level .com.br domains', () => {
      const mockLocation = {
        hostname: 'portal.admin.analiticaensino.com.br',
        protocol: 'https:',
        port: '',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const result = getRootDomain();

      expect(result).toBe('https://analiticaensino.com.br');
    });

    it('should handle regular .com domains', () => {
      const mockLocation = {
        hostname: 'aluno.example.com',
        protocol: 'https:',
        port: '',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const result = getRootDomain();

      expect(result).toBe('https://example.com');
    });

    it('should handle localhost correctly', () => {
      const mockLocation = {
        hostname: 'localhost',
        protocol: 'http:',
        port: '3000',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const result = getRootDomain();

      expect(result).toBe('http://localhost:3000');
    });

    it('should handle two-part domain without subdomain', () => {
      const mockLocation = {
        hostname: 'example.com',
        protocol: 'https:',
        port: '',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const result = getRootDomain();

      expect(result).toBe('https://example.com');
    });

    it('should handle .com.br without subdomain', () => {
      const mockLocation = {
        hostname: 'analiticaensino.com.br',
        protocol: 'https:',
        port: '',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const result = getRootDomain();

      expect(result).toBe('https://analiticaensino.com.br');
    });

    it('should handle port numbers correctly', () => {
      const mockLocation = {
        hostname: 'aluno.analiticaensino.com.br',
        protocol: 'https:',
        port: '8080',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const result = getRootDomain();

      expect(result).toBe('https://analiticaensino.com.br:8080');
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestAuthComponent />);
      }).toThrow('useAuth deve ser usado dentro de um AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should provide auth context when used within AuthProvider', async () => {
      const checkAuthFn = jest.fn().mockResolvedValue(true);

      renderWithAuth(<TestAuthComponent />, { checkAuthFn });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toBeInTheDocument();
        expect(screen.getByTestId('loading')).toBeInTheDocument();
      });
    });
  });
});
