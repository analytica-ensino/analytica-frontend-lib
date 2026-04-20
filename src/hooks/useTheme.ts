import { useEffect } from 'react';
import { useThemeStore, ThemeMode } from '../store/themeStore';

export type { ThemeMode };

/**
 * Hook para gerenciar temas e branding institucional
 * Este hook permite alternar entre temas light, dark e automático baseado nas preferências do sistema
 * e fornece acesso aos dados de branding lidos diretamente das meta tags HTML
 * Utiliza Zustand para persistir o estado de tema entre múltiplos arquivos e sessões
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

  // Read branding data from meta tags
  const branding = {
    theme:
      document.querySelector('meta[name="theme"]')?.getAttribute('content') ??
      null,
    favicon:
      document.querySelector('meta[name="favicon"]')?.getAttribute('content') ??
      null,
    icon:
      document.querySelector('meta[name="icon"]')?.getAttribute('content') ??
      null,
    mainLogo:
      document
        .querySelector('meta[name="main-logo"]')
        ?.getAttribute('content') ?? null,
    internalLogo:
      document
        .querySelector('meta[name="internal-logo"]')
        ?.getAttribute('content') ?? null,
    loginImage:
      document
        .querySelector('meta[name="login-image"]')
        ?.getAttribute('content') ?? null,
  };

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
    branding,
  };
};
