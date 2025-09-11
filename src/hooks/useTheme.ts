import { useEffect, useState, useCallback, useRef } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Hook para gerenciar temas com suporte a alternância manual e detecção automática do sistema
 * Este hook permite alternar entre temas light, dark e automático baseado nas preferências do sistema
 */
export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);

  // Ref para manter o estado atual do tema de forma síncrona
  const themeModeRef = useRef<ThemeMode>('system');

  // Função para aplicar o tema baseado no modo selecionado
  const applyTheme = useCallback((mode: ThemeMode) => {
    const htmlElement = document.documentElement;
    const originalTheme = htmlElement.getAttribute('data-original-theme');

    if (mode === 'dark') {
      htmlElement.setAttribute('data-theme', 'dark');
      setIsDark(true);
    } else if (mode === 'light') {
      if (originalTheme) {
        htmlElement.setAttribute('data-theme', originalTheme);
      }
      setIsDark(false);
    } else if (mode === 'system') {
      const isSystemDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      if (isSystemDark) {
        htmlElement.setAttribute('data-theme', 'dark');
        setIsDark(true);
      } else if (originalTheme) {
        htmlElement.setAttribute('data-theme', originalTheme);
        setIsDark(false);
      }
    }
  }, []);

  // Função para alternar entre os temas
  const toggleTheme = useCallback(() => {
    let newMode: ThemeMode;
    if (themeMode === 'light') {
      newMode = 'dark';
    } else if (themeMode === 'dark') {
      newMode = 'light';
    } else {
      // Se estiver em 'system', vai para 'dark'
      newMode = 'dark';
    }
    setThemeMode(newMode);
    themeModeRef.current = newMode;
    applyTheme(newMode);
    localStorage.setItem('theme-mode', newMode);
  }, [themeMode, applyTheme]);

  // Função para definir um tema específico
  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeMode(mode);
      themeModeRef.current = mode;
      applyTheme(mode);
      localStorage.setItem('theme-mode', mode);
    },
    [applyTheme]
  );

  useEffect(() => {
    const htmlElement = document.documentElement;

    // Salva o theme original do white label na primeira execução
    const currentTheme = htmlElement.getAttribute('data-theme');
    if (currentTheme && !htmlElement.getAttribute('data-original-theme')) {
      htmlElement.setAttribute('data-original-theme', currentTheme);
    }

    // Carrega o tema salvo no localStorage ou usa 'system' como padrão
    const savedThemeMode = localStorage.getItem('theme-mode') as ThemeMode;
    const initialMode = savedThemeMode || 'system';

    // Se não há tema salvo, persiste 'system' como padrão
    if (!savedThemeMode) {
      localStorage.setItem('theme-mode', 'system');
    }

    setThemeMode(initialMode);
    themeModeRef.current = initialMode;
    applyTheme(initialMode);

    // Listener para mudanças nas preferências do sistema (apenas quando mode é 'system')
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      // Usa o ref para ter acesso ao estado atual de forma síncrona
      if (themeModeRef.current === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [applyTheme]);

  return {
    themeMode,
    isDark,
    toggleTheme,
    setTheme,
  };
};
