import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosInstance } from 'axios';
import { useAuthStore, type AuthState } from '../store/authStore';
import { useModulesStore } from '../store/modulesStore';
import { useApiConfig, useUrlAuthentication, useTheme, useAuth } from '..';
import { useTokenInUrl } from '../components/Auth/useTokenInUrl';

/**
 * Interface para as configurações do hook useAppContent
 */
interface UseAppContentConfig {
  /** API instance para configuração (post troca o código de acesso da URL) */
  api: {
    get: (endpoint: string, config: unknown) => Promise<unknown>;
    post?: (
      endpoint: string,
      data?: unknown,
      config?: unknown
    ) => Promise<unknown>;
  };
  /** ID da instituição obtido externamente */
  getInstitutionId: string | null | undefined;
  /** Função de inicialização obtida externamente */
  initialize: (institutionId: string) => void;
  /** Estado de inicialização obtido externamente */
  initialized: boolean;
  /** Endpoint para autenticação via URL */
  endpoint?: string;
  /** Número máximo de tentativas em caso de erro */
  maxRetries?: number;
  /** Delay entre tentativas em ms */
  retryDelay?: number;
  /** Callback para limpeza de parâmetros da URL */
  onClearParamsFromURL?: () => void;
  /** Callback para tratamento de erro */
  onError?: (error: unknown) => void;
  /** Callback para navegação quando página não encontrada */
  onNotFoundNavigation?: () => void;
}

/**
 * What signOut clears: the session a login hand-off set aside
 */
type StoredSession = Pick<
  AuthState,
  | 'user'
  | 'tokens'
  | 'isAuthenticated'
  | 'profiles'
  | 'selectedProfile'
  | 'sessionInfo'
>;

/**
 * Hook que encapsula toda a lógica do componente AppContent
 * Centraliza a configuração de autenticação, tema, navegação e inicialização
 *
 * @param {UseAppContentConfig} config - Configurações do hook
 * @returns {object} Funções e estado necessários para o AppContent
 */
export function useAppContent(config: UseAppContentConfig) {
  const navigate = useNavigate();
  const { setTokens, setSessionInfo, setSelectedProfile } = useAuthStore();

  const {
    api,
    getInstitutionId,
    initialize,
    initialized,
    endpoint = '/auth/session-info',
    maxRetries = 1,
    retryDelay = 2000,
    onClearParamsFromURL,
    onError,
    onNotFoundNavigation,
  } = config;

  const apiConfig = useApiConfig(api);
  const { checkAuth } = useAuth();

  // Aplica o sistema de dark mode baseado nas preferências do sistema
  useTheme();

  // Helper function to handle NotFound navigation
  const handleNotFoundNavigation = () => {
    if (onNotFoundNavigation) {
      onNotFoundNavigation();
    } else {
      navigate('/painel');
    }
  };

  // Memoize all functions to prevent useEffect re-execution
  const handleSetSelectedProfile = useCallback(
    (profile: { id: string }) => {
      setSelectedProfile(profile);
    },
    [setSelectedProfile]
  );

  const handleClearParamsFromURL = useCallback(() => {
    if (onClearParamsFromURL) {
      onClearParamsFromURL();
      return;
    }
    // Strip ONLY the auth param injected by the login redirect, preserving any
    // other query the deep link carried (e.g. ?id=... on an edit page). Dropping
    // the whole query here used to lose those params after hydration.
    const params = new URLSearchParams(globalThis.location.search);
    params.delete('authCode');
    const query = params.toString();
    navigate(`${globalThis.location.pathname}${query ? `?${query}` : ''}`, {
      replace: true,
    });
  }, [onClearParamsFromURL, navigate]);

  // A login hand-off in the URL always wins over the session this browser
  // still holds (someone who never clicked "Sair": a shared school computer, or
  // a session expired since yesterday). Set it aside before any request goes
  // out: left in place, the app booted with it and its requests 401ed, the
  // refresh failed and sent the user back to login mid-exchange (logging in
  // twice). Layout effect, so it runs before every passive effect that fetches.
  // The exchange hands it to the backend, which revokes it only once the code
  // is traded; if the code fails (an old link), it comes back.
  const { hasTokenInUrl } = useTokenInUrl();
  const setAsideRef = useRef<StoredSession | null>(null);
  useLayoutEffect(() => {
    if (!hasTokenInUrl) return;
    const state = useAuthStore.getState();
    if (!state.tokens && !state.sessionInfo) return;
    setAsideRef.current = {
      user: state.user,
      tokens: state.tokens,
      isAuthenticated: state.isAuthenticated,
      profiles: state.profiles,
      selectedProfile: state.selectedProfile,
      sessionInfo: state.sessionInfo,
    };
    state.signOut();
  }, [hasTokenInUrl]);

  const getPreviousSession = useCallback(() => {
    const { tokens, sessionInfo } = setAsideRef.current ?? {};
    if (!tokens?.refreshToken || !sessionInfo?.sessionId) return undefined;
    return {
      sessionId: sessionInfo.sessionId,
      refreshToken: tokens.refreshToken,
    };
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      // The hand-off failed: the session set aside is still valid
      if (setAsideRef.current) {
        useAuthStore.setState(setAsideRef.current);
        setAsideRef.current = null;
        void checkAuth();
      }
      if (onError) {
        onError(error);
      } else {
        console.error('Erro ao obter informações da sessão:', error);
        navigate('/', { replace: true });
      }
    },
    [navigate, onError, checkAuth]
  );

  // Re-runs the AuthProvider check after tokens are written into the store,
  // so guards re-evaluate before URL params are cleared (fixes first-login race).
  const handleAuthHydrated = useCallback(async () => {
    // Revoked by the exchange
    setAsideRef.current = null;
    await checkAuth();
  }, [checkAuth]);

  // Memoize the entire configuration object to prevent re-execution
  const urlAuthConfig = useMemo(
    () => ({
      setTokens,
      setSessionInfo,
      setSelectedProfile: handleSetSelectedProfile,
      api: apiConfig,
      endpoint,
      getPreviousSession,
      clearParamsFromURL: handleClearParamsFromURL,
      maxRetries,
      retryDelay,
      onError: handleError,
      onAuthHydrated: handleAuthHydrated,
    }),
    [
      setTokens,
      setSessionInfo,
      handleSetSelectedProfile,
      apiConfig,
      endpoint,
      getPreviousSession,
      handleClearParamsFromURL,
      maxRetries,
      retryDelay,
      handleError,
      handleAuthHydrated,
    ]
  );

  // Enhanced URL authentication with retry logic and better error handling
  useUrlAuthentication(urlAuthConfig);

  const { sessionInfo } = useAuth();

  // Memoize the institutionId to use to prevent unnecessary re-executions
  const institutionIdToUse = useMemo(() => {
    return sessionInfo?.institutionId || getInstitutionId;
  }, [sessionInfo?.institutionId, getInstitutionId]);

  // Get the profile type from session info (e.g., STUDENT, TEACHER, UNIT_MANAGER)
  const profileType = useMemo(() => {
    return (sessionInfo as { profileName?: string })?.profileName ?? undefined;
  }, [sessionInfo]);

  useEffect(() => {
    if (institutionIdToUse && !initialized) {
      initialize(institutionIdToUse);
    }
  }, [institutionIdToUse, initialize, initialized]);

  // Fetch modules configuration when institutionId is available
  // Includes profileType for profile-specific feature flags
  useEffect(() => {
    if (institutionIdToUse) {
      useModulesStore
        .getState()
        .fetchModules(
          institutionIdToUse,
          apiConfig as AxiosInstance,
          profileType
        );
    }
  }, [institutionIdToUse, apiConfig, profileType]);

  return {
    handleNotFoundNavigation,
    urlAuthConfig,
    institutionIdToUse,
  };
}
