import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  ComponentType,
  useCallback,
  useMemo,
} from 'react';
import { useLocation, Navigate } from 'react-router-dom';

/**
 * Interface for basic authentication tokens
 *
 * @interface AuthTokens
 * @property {string} token - Main authentication token
 * @property {string} refreshToken - Token used to refresh the main token
 * @property {unknown} [key] - Additional properties that can be included
 */
export interface AuthTokens {
  token: string;
  refreshToken: string;
  [key: string]: unknown;
}

/**
 * Interface for basic user information
 *
 * @interface AuthUser
 * @property {string} id - Unique user identifier
 * @property {string} [name] - Optional user name
 * @property {string} [email] - Optional user email
 * @property {unknown} [key] - Additional user properties
 */
export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Interface for basic session information
 *
 * @interface SessionInfo
 * @property {string} [institutionId] - Optional institution identifier
 * @property {string} [profileId] - Optional profile identifier
 * @property {string} [schoolId] - Optional school identifier
 * @property {string} [schoolYearId] - Optional school year identifier
 * @property {string} [classId] - Optional class identifier
 * @property {unknown} [key] - Additional session properties
 */
export interface SessionInfo {
  institutionId?: string;
  profileId?: string;
  schoolId?: string;
  schoolYearId?: string;
  classId?: string;
  [key: string]: unknown;
}

/**
 * Interface for authentication state
 *
 * @interface AuthState
 * @property {boolean} isAuthenticated - Whether the user is authenticated
 * @property {boolean} isLoading - Whether authentication is being checked
 * @property {AuthUser | null} [user] - Current user information
 * @property {SessionInfo | null} [sessionInfo] - Current session information
 * @property {AuthTokens | null} [tokens] - Current authentication tokens
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: AuthUser | null;
  sessionInfo?: SessionInfo | null;
  tokens?: AuthTokens | null;
}

/**
 * Interface for authentication context functions and state
 *
 * @interface AuthContextType
 * @extends {AuthState}
 * @property {() => Promise<boolean>} checkAuth - Function to check authentication status
 * @property {() => void} signOut - Function to sign out the user
 */
export interface AuthContextType extends AuthState {
  checkAuth: () => Promise<boolean>;
  signOut: () => void;
}

/**
 * Authentication context for React components
 *
 * @private
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props for the AuthProvider component
 *
 * @interface AuthProviderProps
 * @property {ReactNode} children - Child components
 * @property {() => Promise<boolean> | boolean} [checkAuthFn] - Function to check if user is authenticated
 * @property {() => void} [signOutFn] - Function to handle logout
 * @property {Partial<AuthState>} [initialAuthState] - Initial authentication state
 * @property {() => AuthUser | null | undefined} [getUserFn] - Function to get user data
 * @property {() => SessionInfo | null | undefined} [getSessionFn] - Function to get session info
 * @property {() => AuthTokens | null | undefined} [getTokensFn] - Function to get tokens
 */
export interface AuthProviderProps {
  children: ReactNode;
  /**
   * Função para verificar se o usuário está autenticado
   * Deve retornar uma Promise<boolean>
   */
  checkAuthFn?: () => Promise<boolean> | boolean;
  /**
   * Função para fazer logout
   */
  signOutFn?: () => void;
  /**
   * Estado de autenticação inicial
   */
  initialAuthState?: Partial<AuthState>;
  /**
   * Função para obter dados do usuário (opcional)
   */
  getUserFn?: () => AuthUser | null | undefined;
  /**
   * Função para obter informações da sessão (opcional)
   */
  getSessionFn?: () => SessionInfo | null | undefined;
  /**
   * Função para obter tokens (opcional)
   */
  getTokensFn?: () => AuthTokens | null | undefined;
}

/**
 * Authentication provider that manages global auth state
 * Compatible with any store (Zustand, Redux, Context, etc.)
 *
 * @param {AuthProviderProps} props - The provider props
 * @returns {JSX.Element} The provider component
 *
 * @example
 * ```tsx
 * <AuthProvider
 *   checkAuthFn={checkAuthFunction}
 *   signOutFn={signOutFunction}
 *   getUserFn={getUserFunction}
 * >
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider = ({
  children,
  checkAuthFn,
  signOutFn,
  initialAuthState = {},
  getUserFn,
  getSessionFn,
  getTokensFn,
}: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    ...initialAuthState,
  });

  /**
   * Check authentication status and update state accordingly
   *
   * @returns {Promise<boolean>} Promise that resolves to authentication status
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      // Se não há função de verificação, assume como não autenticado
      if (!checkAuthFn) {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
        }));
        return false;
      }

      const isAuth = await checkAuthFn();

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: isAuth,
        isLoading: false,
        user: getUserFn ? getUserFn() : prev.user,
        sessionInfo: getSessionFn ? getSessionFn() : prev.sessionInfo,
        tokens: getTokensFn ? getTokensFn() : prev.tokens,
      }));

      return isAuth;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
      }));
      return false;
    }
  }, [checkAuthFn, getUserFn, getSessionFn, getTokensFn]);

  /**
   * Sign out the current user and clear auth state
   *
   * @returns {void}
   */
  const signOut = useCallback(() => {
    if (signOutFn) {
      signOutFn();
    }
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: false,
      user: undefined,
      sessionInfo: undefined,
      tokens: undefined,
    }));
  }, [signOutFn]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const contextValue = useMemo(
    (): AuthContextType => ({
      ...authState,
      checkAuth,
      signOut,
    }),
    [authState, checkAuth, signOut]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * Hook to use the authentication context
 *
 * @throws {Error} When used outside of AuthProvider
 * @returns {AuthContextType} The authentication context
 *
 * @example
 * ```tsx
 * const { isAuthenticated, user, signOut } = useAuth();
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

/**
 * Props for the ProtectedRoute component
 *
 * @interface ProtectedRouteProps
 * @property {ReactNode} children - Components to render when authenticated
 * @property {string} [redirectTo] - Path to redirect when not authenticated (default: '/')
 * @property {ReactNode} [loadingComponent] - Custom loading component
 * @property {(authState: AuthState) => boolean} [additionalCheck] - Additional authentication check
 */
export interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Path para redirecionamento quando não autenticado
   */
  redirectTo?: string;
  /**
   * Componente de loading personalizado
   */
  loadingComponent?: ReactNode;
  /**
   * Função adicional de verificação (ex: verificar permissões específicas)
   */
  additionalCheck?: (authState: AuthState) => boolean;
}

/**
 * Componente para proteger rotas que requerem autenticação
 *
 * @example
 * ```tsx
 * <ProtectedRoute redirectTo="/login">
 *   <PainelPage />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute = ({
  children,
  redirectTo = '/',
  loadingComponent,
  additionalCheck,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, ...authState } = useAuth();

  // Componente de loading padrão
  const defaultLoadingComponent = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-text-950 text-lg">Carregando...</div>
    </div>
  );

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <>{loadingComponent || defaultLoadingComponent}</>;
  }

  // Verificar autenticação básica
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      const rootDomain = getRootDomain();
      // Only redirect if the root domain is different from current location
      const currentLocation = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
      if (rootDomain !== currentLocation) {
        window.location.href = rootDomain;
        return null;
      }
    }
    return <Navigate to={redirectTo} replace />;
  }

  // Verificação adicional (ex: permissões)
  if (
    additionalCheck &&
    !additionalCheck({ isAuthenticated, isLoading, ...authState })
  ) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * Props for the PublicRoute component
 *
 * @interface PublicRouteProps
 * @property {ReactNode} children - Components to render
 * @property {string} [redirectTo] - Path to redirect to (default: '/painel')
 * @property {boolean} [redirectIfAuthenticated] - Whether to redirect if authenticated
 * @property {boolean} [checkAuthBeforeRender] - Whether to check auth before rendering
 */
export interface PublicRouteProps {
  children: ReactNode;
  /**
   * Path para redirecionamento
   */
  redirectTo?: string;
  /**
   * Se deve redirecionar quando usuário estiver autenticado
   */
  redirectIfAuthenticated?: boolean;
  /**
   * Se deve verificar autenticação antes de renderizar
   */
  checkAuthBeforeRender?: boolean;
}

/**
 * Componente para rotas públicas (login, recuperação de senha, etc.)
 * Opcionalmente redireciona se o usuário já estiver autenticado
 *
 * @example
 * ```tsx
 * <PublicRoute redirectTo="/painel" redirectIfAuthenticated={true}>
 *   <LoginPage />
 * </PublicRoute>
 * ```
 */
export const PublicRoute = ({
  children,
  redirectTo = '/painel',
  redirectIfAuthenticated = false,
  checkAuthBeforeRender = false,
}: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Se deve aguardar verificação de auth antes de renderizar
  if (checkAuthBeforeRender && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-950 text-lg">Carregando...</div>
      </div>
    );
  }

  // Redirecionar se já autenticado e configurado para isso
  if (isAuthenticated && redirectIfAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * Higher-Order Component to protect components with authentication
 *
 * @template P - Component props type
 * @param {ComponentType<P>} Component - Component to wrap with authentication
 * @param {Omit<ProtectedRouteProps, 'children'>} [options] - Protection options
 * @returns {(props: P) => JSX.Element} Wrapped component
 *
 * @example
 * ```tsx
 * const ProtectedComponent = withAuth(MyComponent, {
 *   redirectTo: "/login",
 *   loadingComponent: <CustomSpinner />
 * });
 * ```
 */
export const withAuth = <P extends object>(
  Component: ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

/**
 * Hook for authentication guard with custom checks
 *
 * @param {object} [options] - Guard options
 * @param {boolean} [options.requireAuth=true] - Whether authentication is required
 * @param {(authState: AuthState) => boolean} [options.customCheck] - Custom check function
 * @returns {object} Guard result with canAccess, isLoading, and authState
 *
 * @example
 * ```tsx
 * const { canAccess, isLoading } = useAuthGuard({
 *   requireAuth: true,
 *   customCheck: (authState) => authState.user?.role === 'admin'
 * });
 * ```
 */
export const useAuthGuard = (
  options: {
    requireAuth?: boolean;
    customCheck?: (authState: AuthState) => boolean;
  } = {}
) => {
  const authState = useAuth();
  const { requireAuth = true, customCheck } = options;

  const canAccess =
    !authState.isLoading &&
    (requireAuth
      ? authState.isAuthenticated && (!customCheck || customCheck(authState))
      : !authState.isAuthenticated || !customCheck || customCheck(authState));

  return {
    canAccess,
    isLoading: authState.isLoading,
    authState,
  };
};

/**
 * Hook to check authentication on specific routes
 * Useful for conditional checks within components
 *
 * @param {string} [fallbackPath='/'] - Path to redirect when not authenticated
 * @returns {object} Object with isAuthenticated, isLoading, and redirectToLogin function
 *
 * @example
 * ```tsx
 * const { isAuthenticated, redirectToLogin } = useRouteAuth();
 *
 * if (!isAuthenticated) {
 *   return redirectToLogin();
 * }
 * ```
 */
export const useRouteAuth = (fallbackPath = '/') => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const redirectToLogin = () => (
    <Navigate to={fallbackPath} state={{ from: location }} replace />
  );

  return {
    isAuthenticated,
    isLoading,
    redirectToLogin,
  };
};

/**
 * Get the root domain from the current window location
 * Handles localhost, IP addresses, and subdomain cases, including Brazilian .com.br domains
 *
 * @returns {string} The root domain URL
 *
 * @example
 * ```typescript
 * // Domain examples
 * aluno.analiticaensino.com.br -> analiticaensino.com.br
 * subdomain.example.com -> example.com
 *
 * // IP address examples
 * 127.0.0.1:3000 -> 127.0.0.1:3000
 * [::1]:8080 -> [::1]:8080
 *
 * // Localhost examples
 * localhost:3000 -> localhost:3000
 * ```
 */
export const getRootDomain = () => {
  const { hostname, protocol, port } = window.location;
  const portStr = port ? ':' + port : '';

  if (hostname === 'localhost') {
    return `${protocol}//${hostname}${portStr}`;
  }

  // IP literals: return as-is (no subdomain logic)
  const isIPv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
  const isIPv6 = hostname.includes(':'); // simple check is sufficient here
  if (isIPv4 || isIPv6) {
    return `${protocol}//${hostname}${portStr}`;
  }

  const parts = hostname.split('.');

  // Handle Brazilian .com.br domains and similar patterns
  if (
    parts.length >= 3 &&
    parts[parts.length - 2] === 'com' &&
    parts[parts.length - 1] === 'br'
  ) {
    if (parts.length === 3) {
      // Already at root level for .com.br (e.g., analiticaensino.com.br)
      return `${protocol}//${hostname}${portStr}`;
    }
    // For domains like aluno.analiticaensino.com.br, return analiticaensino.com.br
    const base = parts.slice(-3).join('.');
    return `${protocol}//${base}${portStr}`;
  }

  // Only treat as subdomain if there are 3+ parts (e.g., subdomain.example.com)
  if (parts.length > 2) {
    // Return the last 2 parts as the root domain (example.com)
    const base = parts.slice(-2).join('.');
    return `${protocol}//${base}${portStr}`;
  }

  // For 2-part domains (example.com) or single domains, return as-is
  return `${protocol}//${hostname}${portStr}`;
};

export default {
  AuthProvider,
  ProtectedRoute,
  PublicRoute,
  withAuth,
  useAuth,
  useAuthGuard,
  useRouteAuth,
};
