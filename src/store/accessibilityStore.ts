import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Modos de contraste suportados pelo widget de acessibilidade
 */
export type ContrastMode = 'normal' | 'high' | 'inverted';

/**
 * Modos de saturação para usuários com sensibilidade visual
 */
export type SaturationMode = 'normal' | 'grayscale' | 'low';

/**
 * Níveis discretos para tamanho de fonte (0 = padrão da página)
 */
export type FontSizeLevel = 0 | 1 | 2 | 3;

/**
 * Níveis discretos para espaçamento entre letras e linhas
 */
export type SpacingLevel = 0 | 1 | 2 | 3;

/**
 * Conjunto completo de preferências persistidas
 */
export interface AccessibilityPreferences {
  contrastMode: ContrastMode;
  saturationMode: SaturationMode;
  fontSize: FontSizeLevel;
  letterSpacing: SpacingLevel;
  lineSpacing: SpacingLevel;
  highlightLinks: boolean;
  pauseAnimations: boolean;
  bigCursor: boolean;
}

export interface AccessibilityState extends AccessibilityPreferences {
  /** Indica se o painel de acessibilidade está aberto */
  isPanelOpen: boolean;
}

export interface AccessibilityActions {
  setContrastMode: (mode: ContrastMode) => void;
  setSaturationMode: (mode: SaturationMode) => void;
  setFontSize: (level: FontSizeLevel) => void;
  setLetterSpacing: (level: SpacingLevel) => void;
  setLineSpacing: (level: SpacingLevel) => void;
  setHighlightLinks: (value: boolean) => void;
  setPauseAnimations: (value: boolean) => void;
  setBigCursor: (value: boolean) => void;
  /** Restaura todas as preferências para o estado padrão */
  resetPreferences: () => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

export type AccessibilityStore = AccessibilityState & AccessibilityActions;

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  contrastMode: 'normal',
  saturationMode: 'normal',
  fontSize: 0,
  letterSpacing: 0,
  lineSpacing: 0,
  highlightLinks: false,
  pauseAnimations: false,
  bigCursor: false,
};

/**
 * Store Zustand com persistência em localStorage para preferências
 * de acessibilidade. As preferências são aplicadas ao DOM pelo hook
 * `useA11yPreferences` — este store apenas guarda o estado.
 */
export const useAccessibilityStore = create<AccessibilityStore>()(
  devtools(
    persist(
      (set) => ({
        ...DEFAULT_ACCESSIBILITY_PREFERENCES,
        isPanelOpen: false,

        setContrastMode: (contrastMode) => set({ contrastMode }),
        setSaturationMode: (saturationMode) => set({ saturationMode }),
        setFontSize: (fontSize) => set({ fontSize }),
        setLetterSpacing: (letterSpacing) => set({ letterSpacing }),
        setLineSpacing: (lineSpacing) => set({ lineSpacing }),
        setHighlightLinks: (highlightLinks) => set({ highlightLinks }),
        setPauseAnimations: (pauseAnimations) => set({ pauseAnimations }),
        setBigCursor: (bigCursor) => set({ bigCursor }),

        resetPreferences: () => set({ ...DEFAULT_ACCESSIBILITY_PREFERENCES }),

        openPanel: () => set({ isPanelOpen: true }),
        closePanel: () => set({ isPanelOpen: false }),
        togglePanel: () =>
          set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      }),
      {
        name: 'accessibility-store',
        partialize: (state) => ({
          contrastMode: state.contrastMode,
          saturationMode: state.saturationMode,
          fontSize: state.fontSize,
          letterSpacing: state.letterSpacing,
          lineSpacing: state.lineSpacing,
          highlightLinks: state.highlightLinks,
          pauseAnimations: state.pauseAnimations,
          bigCursor: state.bigCursor,
        }),
      }
    ),
    { name: 'accessibility-store' }
  )
);
