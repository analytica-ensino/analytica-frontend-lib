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
      }
    };

    // Aplica o theme inicial
    applyTheme();

    // Monitora mudanças nas preferências do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (_event: MediaQueryListEvent) => {
      applyTheme();
    };

    // Monitora mudanças nas preferências do sistema
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
};
