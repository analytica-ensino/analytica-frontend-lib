import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
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
      globalThis.location.replace('/painel');
    }
  }, [onClearParamsFromURL]);

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
    ]
  );

  // Enhanced URL authentication with retry logic and better error handling
  useUrlAuthentication(urlAuthConfig);

  const { sessionInfo } = useAuth();

  // Memoize the institutionId to use to prevent unnecessary re-executions
  const institutionIdToUse = useMemo(() => {
    return sessionInfo?.institutionId || getInstitutionId;
  }, [sessionInfo?.institutionId, getInstitutionId]);

  useEffect(() => {
    if (institutionIdToUse && !initialized) {
      initialize(institutionIdToUse);
    }
  }, [institutionIdToUse, initialize, initialized]);

  return {
    handleNotFoundNavigation,
    urlAuthConfig,
    institutionIdToUse,
  };
}
