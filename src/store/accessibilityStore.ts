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
 * Auxiliares de leitura mutuamente exclusivos:
 * - `none`: nenhum auxiliar
 * - `ruler`: linha horizontal acompanha o cursor
 * - `mask`: escurece a tela exceto uma faixa central na altura do cursor
 */
export type ReadingAid = 'none' | 'ruler' | 'mask';

/**
 * Modo do leitor de texto (TTS):
 * - `off`: leitor desligado
 * - `click-to-read`: usuário clica em um elemento e o widget lê o texto dele
 * - `read-selection`: usuário pressiona "Ler seleção" para falar o texto selecionado
 */
export type TTSMode = 'off' | 'click-to-read' | 'read-selection';

/** Status runtime da síntese de voz — não persistido. */
export type TTSStatus = 'idle' | 'speaking' | 'paused';

/**
 * Modos de daltonismo. Aplicam matrizes `<feColorMatrix>` (SVG) que
 * remapeiam cores para ajudar usuários com cada tipo de discromatopsia.
 *
 * Enum (e não union de strings como os outros modos) porque cada valor
 * é também usado como identificador estável em três outros lugares —
 * classes CSS, IDs de filter SVG e seletores no CSS — então centralizar
 * em um enum + helpers evita strings duplicadas e typos silenciosos.
 */
export enum ColorBlindMode {
  None = 'none',
  Protanopia = 'protanopia',
  Deuteranopia = 'deuteranopia',
  Tritanopia = 'tritanopia',
}

/** Prefixo único para todos os identificadores de daltonismo (classe + SVG id) */
const COLOR_BLIND_PREFIX = 'a11y-cb-';

/**
 * Retorna a classe CSS aplicada no `<html>` para o modo informado, ou
 * `null` quando nenhum modo está ativo.
 */
export const getColorBlindClass = (mode: ColorBlindMode): string | null =>
  mode === ColorBlindMode.None ? null : `${COLOR_BLIND_PREFIX}${mode}`;

/** Retorna o id do `<filter>` SVG correspondente ao modo. */
export const getColorBlindFilterId = (
  mode: Exclude<ColorBlindMode, ColorBlindMode.None>
): string => `${COLOR_BLIND_PREFIX}${mode}`;

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
  /** Fonte amigável para dislexia (OpenDyslexic com fallback Comic Sans MS) */
  dyslexiaFont: boolean;
  /** Auxiliar visual de leitura (régua, máscara ou nenhum) */
  readingAid: ReadingAid;
  /** Habilita atalho Alt+A para abrir/fechar o painel */
  keyboardShortcut: boolean;
  /** Modo de daltonismo aplicado (filtro SVG na página inteira) */
  colorBlindMode: ColorBlindMode;
  /** Modo do leitor de texto (TTS) */
  ttsMode: TTSMode;
  /** Velocidade da fala (0.5 a 2.0) */
  ttsRate: number;
  /** Voz selecionada pelo usuário (id retornado pelo provider) ou null para padrão */
  ttsVoiceId: string | null;
}

export interface AccessibilityState extends AccessibilityPreferences {
  /** Indica se o painel de acessibilidade está aberto */
  isPanelOpen: boolean;
  /** Status runtime da síntese de voz — não persistido */
  ttsStatus: TTSStatus;
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
  setDyslexiaFont: (value: boolean) => void;
  setReadingAid: (mode: ReadingAid) => void;
  setKeyboardShortcut: (value: boolean) => void;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  setTTSMode: (mode: TTSMode) => void;
  setTTSRate: (rate: number) => void;
  setTTSVoiceId: (id: string | null) => void;
  setTTSStatus: (status: TTSStatus) => void;
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
  dyslexiaFont: false,
  readingAid: 'none',
  keyboardShortcut: true,
  colorBlindMode: ColorBlindMode.None,
  ttsMode: 'off',
  ttsRate: 1,
  ttsVoiceId: null,
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
        ttsStatus: 'idle',

        setContrastMode: (contrastMode) => set({ contrastMode }),
        setSaturationMode: (saturationMode) => set({ saturationMode }),
        setFontSize: (fontSize) => set({ fontSize }),
        setLetterSpacing: (letterSpacing) => set({ letterSpacing }),
        setLineSpacing: (lineSpacing) => set({ lineSpacing }),
        setHighlightLinks: (highlightLinks) => set({ highlightLinks }),
        setPauseAnimations: (pauseAnimations) => set({ pauseAnimations }),
        setBigCursor: (bigCursor) => set({ bigCursor }),
        setDyslexiaFont: (dyslexiaFont) => set({ dyslexiaFont }),
        setReadingAid: (readingAid) => set({ readingAid }),
        setKeyboardShortcut: (keyboardShortcut) => set({ keyboardShortcut }),
        setColorBlindMode: (colorBlindMode) => set({ colorBlindMode }),
        setTTSMode: (ttsMode) => set({ ttsMode }),
        setTTSRate: (ttsRate) => set({ ttsRate }),
        setTTSVoiceId: (ttsVoiceId) => set({ ttsVoiceId }),
        setTTSStatus: (ttsStatus) => set({ ttsStatus }),

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
          dyslexiaFont: state.dyslexiaFont,
          readingAid: state.readingAid,
          keyboardShortcut: state.keyboardShortcut,
          colorBlindMode: state.colorBlindMode,
          ttsRate: state.ttsRate,
          ttsVoiceId: state.ttsVoiceId,
          // ttsMode NÃO é persistido: o leitor sempre começa desligado
          // ao recarregar a página para evitar comportamento confuso
        }),
      }
    ),
    { name: 'accessibility-store' }
  )
);
