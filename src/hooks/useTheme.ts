import { useEffect } from 'react';
import { useThemeStore, ThemeMode } from '../store/themeStore';

export type { ThemeMode };

/**
 * Hook para gerenciar temas com suporte a alternância manual e detecção automática do sistema
 * Este hook permite alternar entre temas light, dark e automático baseado nas preferências do sistema
 * Utiliza Zustand para persistir o estado entre múltiplos arquivos e sessões
 */
export const useTheme = () => {
  const {
    themeMode,
    isDark,
    toggleTheme,
    setTheme,
    initializeTheme,
    handleSystemThemeChange,
  } = useThemeStore();

  useEffect(() => {
    // Initialize theme on first render
    initializeTheme();

    // Listener para mudanças nas preferências do sistema (apenas quando mode é 'system')
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [initializeTheme, handleSystemThemeChange]);

  return {
    themeMode,
    isDark,
    toggleTheme,
    setTheme,
  };
};
