import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosInstance } from 'axios';
import { useAuthStore } from '../store/authStore';
import { useModulesStore } from '../store/modulesStore';
import { useApiConfig, useUrlAuthentication, useTheme, useAuth } from '..';

/**
 * Interface para as configurações do hook useAppContent
 */
interface UseAppContentConfig {
  /** API instance para configuração */
  api: {
    get: (endpoint: string, config: unknown) => Promise<unknown>;
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
    } else {
      navigate(globalThis.location.pathname, { replace: true });
    }
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
