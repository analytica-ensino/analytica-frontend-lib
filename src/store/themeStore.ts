import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { themeCookieStorage } from './themeStorage';

export type ThemeMode = 'light' | 'dark' | 'system';

export type LockableThemeMode = Exclude<ThemeMode, 'system'>;

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
  /**
   * Modo imposto pelo produto, que se sobrepõe ao `themeMode` sem sobrescrevê-lo.
   * `null` = sem trava (o usuário manda).
   *
   * Existe para variantes cujo visual só foi desenhado em um dos modos — hoje a
   * Fluência Leitora, que tem arte própria só em light. NÃO é persistido
   * (fica de fora do `partialize`): a preferência do usuário continua no cookie
   * e volta a valer sozinha quando a trava sai.
   */
  lockedMode: LockableThemeMode | null;
  /**
   * `true` quando o tema aplicado não tem variante dark (ver
   * `LIGHT_ONLY_THEMES`). Quem renderiza seletor de tema deve escondê-lo — não
   * há escolha a oferecer.
   */
  lightOnly: boolean;
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
   * Trava o tema num modo, ignorando o `themeMode` do usuário até ser liberado
   * com `lockTheme(null)`. Idempotente.
   */
  lockTheme: (mode: LockableThemeMode | null) => void;
  /**
   * Troca o tema recebido da instituição pelo tema próprio deste app, quando
   * houver (ver `APP_THEME_MAP`). Chamar no boot, ANTES do primeiro render —
   * senão a tela pisca com a paleta da instituição antes de trocar.
   */
  setAppTheme: (app: string) => void;
  /**
   * Set the white-label theme from institution branding
   */
  setWhiteLabelTheme: (theme: string | null) => void;
  /**
   * Clear the white-label theme and revert to default
   */
  clearWhiteLabelTheme: () => void;
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
 * Mapa de tema light institucional → tema dark correspondente.
 * Adicionar entradas aqui ao introduzir novas instituições.
 */
const DARK_THEME_MAP: Record<string, string> = {
  'base-light': 'base-dark',
  'enem-parana-light': 'enem-parana-dark',
  'enem-paraiba-light': 'enem-paraiba-dark',
  'analytica-light': 'analytica-dark',
  'papole-light': 'papole-dark',
};

/**
 * Temas que existem SÓ em light — a arte não tem versão escura e não é pra ter.
 * Sem isso o modo dark cairia no fallback `base-dark`, que é o dark neutro
 * (azulado) e não tem nada a ver com a paleta do produto.
 */
const LIGHT_ONLY_THEMES = new Set<string>(['papole-aluno-light']);

/**
 * Mapa de app → (tema da instituição → tema daquele app).
 *
 * A entrega injeta UMA string de tema por instituição no `<!--THEME_COLOR-->`
 * de todos os apps. Quando um produto tem arte própria — o aluno do Papolê, que
 * é a Fluência Leitora e tem um Figma inteiro separado — o app troca o tema
 * recebido pelo seu no boot, via `setAppTheme`.
 *
 * Instituição sem entrada aqui não muda nada: continua com o tema recebido.
 */
const APP_THEME_MAP: Record<string, Record<string, string>> = {
  aluno: {
    'papole-light': 'papole-aluno-light',
  },
};

/**
 * Resolve o seletor CSS dark concreto com base no tema institucional (light)
 * salvo em `data-original-theme`. Temas light-only devolvem eles mesmos.
 * Fallback: 'base-dark', que também responde ao seletor legado
 * [data-theme='dark'] preservando compat com apps antigos.
 */
const resolveDarkTheme = (originalTheme: string | undefined): string => {
  if (!originalTheme) return 'base-dark';
  if (LIGHT_ONLY_THEMES.has(originalTheme)) return originalTheme;
  return DARK_THEME_MAP[originalTheme] ?? 'base-dark';
};

/**
 * Apply theme to DOM based on mode.
 *
 * Devolve `isDark` já resolvido: num tema light-only o dark não acontece, então
 * `isDark` é falso mesmo com o modo em 'dark'. Isso importa porque componentes
 * trocam imagem e cor de matéria por esse booleano — se ele mentir, a tela sai
 * clara com asset escuro em cima.
 */
const applyThemeToDOM = (mode: ThemeMode): boolean => {
  const htmlElement = document.documentElement;
  const originalTheme = htmlElement.dataset.originalTheme;

  if (mode === 'dark') {
    const darkTheme = resolveDarkTheme(originalTheme);
    htmlElement.dataset.theme = darkTheme;
    return darkTheme !== originalTheme;
  } else if (mode === 'light') {
    if (originalTheme) {
      htmlElement.dataset.theme = originalTheme;
    }
    return false;
  } else if (mode === 'system') {
    const isSystemDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    if (isSystemDark) {
      const darkTheme = resolveDarkTheme(originalTheme);
      htmlElement.dataset.theme = darkTheme;
      return darkTheme !== originalTheme;
    } else if (originalTheme) {
      htmlElement.dataset.theme = originalTheme;
      return false;
    }
  }
  return false;
};

/**
 * Save original theme from white label (reads from HTML meta tag or data-theme attribute)
 */
const saveOriginalTheme = () => {
  const htmlElement = document.documentElement;
  const currentTheme =
    htmlElement.dataset.theme ||
    document.querySelector('meta[name="theme"]')?.getAttribute('content');

  if (currentTheme && !htmlElement.dataset.originalTheme) {
    htmlElement.dataset.originalTheme = currentTheme;
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
        lockedMode: null,
        lightOnly: false,

        // Actions
        applyTheme: (mode: ThemeMode) => {
          // A trava vence o modo pedido: é o produto dizendo que aquela tela só
          // existe num dos modos. O `themeMode` continua intacto no store.
          const { lockedMode } = get();
          const isDark = applyThemeToDOM(lockedMode ?? mode);
          const originalTheme = document.documentElement.dataset.originalTheme;
          set({
            isDark,
            lightOnly: originalTheme
              ? LIGHT_ONLY_THEMES.has(originalTheme)
              : false,
          });
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

        lockTheme: (mode: LockableThemeMode | null) => {
          const { lockedMode, themeMode, applyTheme } = get();
          if (lockedMode === mode) return;

          set({ lockedMode: mode });
          // Reaplica: com trava vai para `mode`; ao liberar, volta para a
          // preferência do usuário que estava guardada em `themeMode`.
          applyTheme(themeMode);
        },

        setAppTheme: (app: string) => {
          const htmlElement = document.documentElement;
          // No boot o `data-original-theme` ainda não existe — o tema que a
          // entrega injetou está no `data-theme` do index.html.
          const received =
            htmlElement.dataset.originalTheme ?? htmlElement.dataset.theme;
          const appTheme = received
            ? APP_THEME_MAP[app]?.[received]
            : undefined;

          // Instituição sem tema próprio para este app: nada a fazer.
          if (!appTheme) return;

          htmlElement.dataset.originalTheme = appTheme;
          htmlElement.dataset.theme = appTheme;
          get().applyTheme(get().themeMode);
        },

        setWhiteLabelTheme: (theme: string | null) => {
          const htmlElement = document.documentElement;

          if (theme) {
            // Set the white-label theme as the original theme
            htmlElement.dataset.originalTheme = theme;

            // Apply theme based on current mode
            const { themeMode, applyTheme } = get();
            if (themeMode === 'light' || themeMode === 'system') {
              htmlElement.dataset.theme = theme;
            }

            applyTheme(themeMode);
          }
        },

        clearWhiteLabelTheme: () => {
          const htmlElement = document.documentElement;

          // Remove white-label theme attributes
          delete htmlElement.dataset.originalTheme;
          delete htmlElement.dataset.theme;

          // Restore original theme from page metadata
          saveOriginalTheme();

          // Re-apply current theme mode to use defaults
          const { themeMode, applyTheme } = get();
          applyTheme(themeMode);
        },

        initializeTheme: () => {
          const { themeMode, applyTheme } = get();

          // Save original theme from white label
          saveOriginalTheme();

          // Apply the current theme mode
          applyTheme(themeMode);
        },

        handleSystemThemeChange: () => {
          const { themeMode, applyTheme, lockedMode } = get();
          // Com trava, o SO não manda: a tela fica no modo imposto.
          if (lockedMode) return;
          // Only respond to system changes when in system mode
          if (themeMode === 'system') {
            applyTheme('system');
          }
        },
      }),
      {
        name: 'theme-store', // Storage key (cookie + localStorage)
        // Root-domain cookie so login and app subdomains share the theme
        storage: createJSONStorage(() => themeCookieStorage),
        partialize: (state) => ({
          themeMode: state.themeMode,
        }), // Só persiste o themeMode — nem o isDark, nem o lockedMode. A trava
        // é decisão de runtime do produto (feature flag), não preferência do
        // usuário, e o cookie é compartilhado entre login e todos os apps.
      }
    ),
    {
      name: 'theme-store',
    }
  )
);
