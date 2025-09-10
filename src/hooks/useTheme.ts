import { useEffect } from 'react';

/**
 * Hook para detectar preferências do sistema e aplicar dark mode automaticamente
 * Este hook monitora as preferências do sistema (prefers-color-scheme) e aplica
 * o theme correspondente automaticamente.
 */
export const useTheme = () => {
  useEffect(() => {
    const htmlElement = document.documentElement;

    // Salva o theme original do white label na primeira execução
    const currentTheme = htmlElement.getAttribute('data-theme');
    if (currentTheme && !htmlElement.getAttribute('data-original-theme')) {
      htmlElement.setAttribute('data-original-theme', currentTheme);
    }

    // Função para aplicar o theme baseado nas preferências do sistema
    const applyTheme = () => {
      const isDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      const originalTheme = htmlElement.getAttribute('data-original-theme');

      if (isDarkMode) {
        // Aplica o theme dark
        htmlElement.setAttribute('data-theme', 'dark');
      } else if (originalTheme) {
        // Restaura o theme light do white label
        htmlElement.setAttribute('data-theme', originalTheme);
      } else {
        // Remove o atributo data-theme para reverter ao tema padrão/light
        htmlElement.removeAttribute('data-theme');
      }
    };

    // Aplica o theme inicial
    applyTheme();

    // Monitora mudanças nas preferências do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (_event: MediaQueryListEvent) => {
      applyTheme();
    };

    // Feature detection para addEventListener/removeEventListener
    const hasAddEventListener =
      typeof mediaQuery.addEventListener === 'function';

    if (hasAddEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback para navegadores mais antigos
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (hasAddEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback para navegadores mais antigos
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);
};
