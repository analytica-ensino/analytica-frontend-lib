import { useMemo } from 'react';
import { useInstitutionId } from './useInstitution';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

/**
 * Hook que gerencia a inicialização da aplicação e funções de autenticação
 * Combina a lógica de obtenção do institutionId, inicialização do app store e funções de auth
 *
 * @param {UseAppInitializationProps} props - Propriedades do hook
 * @returns {object} Estado da inicialização, funções relacionadas e funções de autenticação
 */
export function useAppInitialization() {
  const getInstitutionId = useInstitutionId();
  const { initialize, initialized, institutionId } = useAppStore();

  // Create memoized auth functions for the AuthProvider to prevent unnecessary re-renders
  const authFunctions = useMemo(
    () => ({
      checkAuth: async () => {
        const { sessionInfo, tokens } = useAuthStore.getState();
        return Boolean(sessionInfo && tokens);
      },
      signOut: () => {
        const { signOut } = useAuthStore.getState();
        signOut();
      },
      getUser: () => {
        const { user } = useAuthStore.getState();
        return user;
      },
      getSessionInfo: () => {
        const { sessionInfo } = useAuthStore.getState();
        return sessionInfo;
      },
      getTokens: () => {
        const { tokens } = useAuthStore.getState();
        return tokens;
      },
    }),
    []
  );

  return {
    // Estado da inicialização
    getInstitutionId,
    initialize,
    initialized,
    institutionId,

    // Funções de autenticação
    authFunctions,
  };
}
