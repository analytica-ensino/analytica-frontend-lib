import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosInstance } from 'axios';
import { useAuthStore, type SessionInfo } from '../store/authStore';
import { useModulesStore } from '../store/modulesStore';
import { useApiConfig, useUrlAuthentication, useTheme, useAuth } from '..';

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
  /**
   * Pergunta antes de trocar a sessão de outro usuário pela do link. Recebe o
   * nome de quem está logado e de quem o link abre; padrão: window.confirm.
   */
  confirmAccountSwitch?: (accounts: {
    current: string;
    incoming: string;
  }) => boolean | Promise<boolean>;
}

/**
 * Pergunta padrão antes de trocar de conta
 *
 * @param {object} accounts - Quem está logado e quem o link abre
 * @returns {boolean} Se a pessoa aceitou trocar
 */
const defaultConfirmAccountSwitch = ({
  current,
  incoming,
}: {
  current: string;
  incoming: string;
}): boolean =>
  globalThis.confirm(
    `Você está conectado como ${current}. Este link entra na conta de ${incoming}. Deseja sair da sua conta e continuar?`
  );

/**
 * Nome de uma conta para a pergunta de troca
 *
 * @param {Partial<SessionInfo>} session - Sessão
 * @returns {string} Nome e e-mail, o que houver
 */
const describeAccount = (session: Partial<SessionInfo>): string => {
  const email = typeof session.email === 'string' ? session.email : undefined;
  if (session.userName && email) return `${session.userName} (${email})`;
  return session.userName || email || 'outro usuário';
};

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
    confirmAccountSwitch = defaultConfirmAccountSwitch,
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
    // Strip ONLY the auth params injected by the login redirect, preserving any
    // other query the deep link carried (e.g. ?id=... on an edit page). Dropping
    // the whole query here used to lose those params after hydration.
    const params = new URLSearchParams(globalThis.location.search);
    params.delete('authCode');
    params.delete('token');
    params.delete('refreshToken');
    params.delete('sessionId');
    const query = params.toString();
    navigate(`${globalThis.location.pathname}${query ? `?${query}` : ''}`, {
      replace: true,
    });
  }, [onClearParamsFromURL, navigate]);

  const handleError = useCallback(
    (error: unknown) => {
      if (onError) {
        onError(error);
      } else {
        console.error('Erro ao obter informações da sessão:', error);
        navigate('/', { replace: true });
      }
    },
    [navigate, onError]
  );

  // A link that opens another user's session asks before swapping the account
  // in use: anyone could send a link to their own account and have the victim
  // type into it (AE-3246). Same user, or nobody logged in: no question.
  const handleConfirmSessionReplace = useCallback(
    async (incoming: SessionInfo) => {
      const { tokens, sessionInfo: current } = useAuthStore.getState();
      if (!tokens?.token || !current?.userId) return true;
      if (current.userId === incoming?.userId) return true;
      return confirmAccountSwitch({
        current: describeAccount(current),
        incoming: describeAccount(incoming ?? {}),
      });
    },
    [confirmAccountSwitch]
  );

  // Re-runs the AuthProvider check after tokens are written into the store,
  // so guards re-evaluate before URL params are cleared (fixes first-login race).
  const handleAuthHydrated = useCallback(async () => {
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
      clearParamsFromURL: handleClearParamsFromURL,
      maxRetries,
      retryDelay,
      onError: handleError,
      onAuthHydrated: handleAuthHydrated,
      confirmSessionReplace: handleConfirmSessionReplace,
    }),
    [
      setTokens,
      setSessionInfo,
      handleSetSelectedProfile,
      apiConfig,
      endpoint,
      handleClearParamsFromURL,
      maxRetries,
      retryDelay,
      handleError,
      handleAuthHydrated,
      handleConfirmSessionReplace,
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
