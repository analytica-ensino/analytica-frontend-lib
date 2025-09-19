import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme store state interface
 */
export interface ThemeState {
  /**
   * Current theme mode
   */
  themeMode: ThemeMode;
  /**
   * Whether the current theme is dark
   */
  isDark: boolean;
}

/**
 * Theme store actions interface
 */
export interface ThemeActions {
  /**
   * Apply theme based on the mode selected
   */
  applyTheme: (mode: ThemeMode) => void;
  /**
   * Toggle between themes
   */
  toggleTheme: () => void;
  /**
   * Set a specific theme mode
   */
  setTheme: (mode: ThemeMode) => void;
  /**
   * Initialize theme on app start
   */
  initializeTheme: () => void;
  /**
   * Handle system theme change
   */
  handleSystemThemeChange: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

/**
 * Apply theme to DOM based on mode
 */
const applyThemeToDOM = (mode: ThemeMode): boolean => {
  const htmlElement = document.documentElement;
  const originalTheme = htmlElement.getAttribute('data-original-theme');

  if (mode === 'dark') {
    htmlElement.setAttribute('data-theme', 'dark');
    return true;
  } else if (mode === 'light') {
    if (originalTheme) {
      htmlElement.setAttribute('data-theme', originalTheme);
    }
    return false;
  } else if (mode === 'system') {
    const isSystemDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    if (isSystemDark) {
      htmlElement.setAttribute('data-theme', 'dark');
      return true;
    } else if (originalTheme) {
      htmlElement.setAttribute('data-theme', originalTheme);
      return false;
    }
  }
  return false;
};

/**
 * Save original theme from white label
 */
const saveOriginalTheme = () => {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-theme');
  if (currentTheme && !htmlElement.getAttribute('data-original-theme')) {
    htmlElement.setAttribute('data-original-theme', currentTheme);
  }
};

/**
 * Theme store using Zustand with persistence
 */
export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        themeMode: 'system',
        isDark: false,

        // Actions
        applyTheme: (mode: ThemeMode) => {
          const isDark = applyThemeToDOM(mode);
          set({ isDark });
        },

        toggleTheme: () => {
          const { themeMode, applyTheme } = get();
          let newMode: ThemeMode;

          if (themeMode === 'light') {
            newMode = 'dark';
          } else if (themeMode === 'dark') {
            newMode = 'light';
          } else {
            // Se estiver em 'system', vai para 'dark'
            newMode = 'dark';
          }

          set({ themeMode: newMode });
          applyTheme(newMode);
        },

        setTheme: (mode: ThemeMode) => {
          const { applyTheme } = get();
          set({ themeMode: mode });
          applyTheme(mode);
        },

        initializeTheme: () => {
          const { themeMode, applyTheme } = get();

          // Save original theme from white label
          saveOriginalTheme();

          // Apply the current theme mode
          applyTheme(themeMode);
        },

        handleSystemThemeChange: () => {
          const { themeMode, applyTheme } = get();
          // Only respond to system changes when in system mode
          if (themeMode === 'system') {
            applyTheme('system');
          }
        },
      }),
      {
        name: 'theme-store', // Nome da chave no localStorage
        partialize: (state) => ({
          themeMode: state.themeMode,
        }), // Só persiste o themeMode, não o isDark
      }
    ),
    {
      name: 'theme-store',
    }
  )
);
