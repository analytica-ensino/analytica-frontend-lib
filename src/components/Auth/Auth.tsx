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
 * Interface básica para tokens de autenticação
 */
export interface AuthTokens {
  token: string;
  refreshToken: string;
  [key: string]: unknown;
}

/**
 * Interface básica para usuário
 */
export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Interface básica para informações de sessão
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
 * Interface para o estado de autenticação
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: AuthUser | null;
  sessionInfo?: SessionInfo | null;
  tokens?: AuthTokens | null;
}

/**
 * Interface para as funções de autenticação
 */
export interface AuthContextType extends AuthState {
  checkAuth: () => Promise<boolean>;
  signOut: () => void;
}

/**
 * Context de autenticação
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props do AuthProvider
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
 * Provider de autenticação que gerencia o estado global de auth
 * Compatível com qualquer store (Zustand, Redux, Context, etc.)
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
 * Hook para usar o contexto de autenticação
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

/**
 * Props do ProtectedRoute
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
 * Props do PublicRoute
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
 * HOC para proteger componentes com autenticação
 *
 * @example
 * ```tsx
 * const ProtectedComponent = withAuth(MyComponent, {
 *   fallback: "/login",
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
 * Hook para guard de autenticação com verificações customizadas
 *
 * @example
 * ```tsx
 * const { canAccess, isLoading } = useAuthGuard({
 *   requireAuth: true,
 *   customCheck: (user) => user?.role === 'admin'
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
 * Hook para verificar autenticação em rotas específicas
 * Útil para verificações condicionais dentro de componentes
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

const getRootDomain = () => {
  const { hostname, protocol, port } = window.location;
  const portStr = port ? ':' + port : '';
  if (hostname === 'localhost') {
    return `${protocol}//${hostname}${portStr}`;
  }
  const parts = hostname.split('.');
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
