import { useEffect, useMemo } from 'react';
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
    lockedMode,
    lightOnly,
    toggleTheme,
    setTheme,
    lockTheme,
    setAppTheme,
    initializeTheme,
    handleSystemThemeChange,
  } = useThemeStore();

  // Read branding data from meta tags
  const branding = useMemo(() => {
    if (typeof document === 'undefined') {
      return {
        theme: null,
        favicon: null,
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };
    }

    return {
      theme:
        document.querySelector('meta[name="theme"]')?.getAttribute('content') ??
        null,
      favicon:
        document.querySelector('link[rel="icon"]')?.getAttribute('href') ??
        null,
      icon:
        document
          .querySelector('link[rel="apple-touch-icon"]')
          ?.getAttribute('href') ?? null,
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
  }, []);

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
    /**
     * Trava o tema num modo (ex.: `lockTheme('light')` na Fluência Leitora) ou
     * libera com `lockTheme(null)`. Não sobrescreve a preferência do usuário.
     */
    lockTheme,
    /**
     * Troca o tema da instituição pelo tema próprio deste app, quando houver.
     * Chamar no boot, antes do primeiro render.
     */
    setAppTheme,
    /**
     * `true` quando não há escolha de tema a oferecer: ou o produto está
     * impondo um modo (`lockTheme`), ou o tema não tem variante dark. Quem
     * renderiza seletor de tema deve esconder o controle — senão o usuário
     * escolhe e nada acontece.
     */
    isThemeLocked: lockedMode !== null || lightOnly,
    branding,
  };
};
