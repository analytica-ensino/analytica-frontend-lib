import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEYS } from '../utils/keys';

/**
 * Largura das colunas laterais (filtros e prévia) enquanto o usuário nunca
 * arrastou um divisor. É também a largura **mínima**: os divisores só permitem
 * alargar, e encolher devolve no máximo até este valor.
 */
export const SIDE_PANEL_DEFAULT_WIDTH = 400;

/** Tela que possui o layout redimensionável. */
export type LayoutScope = 'activity' | 'lesson';

/** Coluna lateral controlada por um divisor. */
export type LayoutPanel = 'filters' | 'preview';

/** Largura de cada coluna lateral de uma tela. */
export interface PanelWidths {
  filters: number;
  preview: number;
}

export interface LayoutPreferencesState {
  /** Larguras salvas por tela */
  widths: Record<LayoutScope, PanelWidths>;
  setPanelWidth: (
    scope: LayoutScope,
    panel: LayoutPanel,
    width: number
  ) => void;
  resetPanelWidth: (scope: LayoutScope, panel: LayoutPanel) => void;
}

/**
 * Mantém a largura acima do mínimo e descarta valores inválidos vindos de um
 * storage corrompido (`NaN`, negativo, string) — um `width` inválido no style
 * inline colapsaria a coluna.
 *
 * Não há teto aqui de propósito: o limite superior depende da largura da tela
 * em runtime e é aplicado por `useResizableColumns`, não pelo storage.
 *
 * @param value - Largura candidata
 * @returns Largura válida, nunca menor que `SIDE_PANEL_DEFAULT_WIDTH`
 */
export const clampPanelWidth = (value: unknown): number => {
  const width = Number(value);
  if (!Number.isFinite(width)) return SIDE_PANEL_DEFAULT_WIDTH;
  return Math.max(SIDE_PANEL_DEFAULT_WIDTH, Math.round(width));
};

/**
 * Larguras iniciais de todas as telas.
 *
 * @returns Mapa de larguras no valor padrão
 */
const createDefaultWidths = (): Record<LayoutScope, PanelWidths> => ({
  activity: {
    filters: SIDE_PANEL_DEFAULT_WIDTH,
    preview: SIDE_PANEL_DEFAULT_WIDTH,
  },
  lesson: {
    filters: SIDE_PANEL_DEFAULT_WIDTH,
    preview: SIDE_PANEL_DEFAULT_WIDTH,
  },
});

/**
 * Revalida as larguras de uma tela vindas do `localStorage`.
 *
 * @param persisted - Valor cru lido do storage
 * @returns Larguras válidas para a tela
 */
const mergeScopeWidths = (persisted: unknown): PanelWidths => {
  const saved = (persisted ?? {}) as Partial<Record<LayoutPanel, unknown>>;
  return {
    filters: clampPanelWidth(saved.filters),
    preview: clampPanelWidth(saved.preview),
  };
};

/**
 * Aplica uma largura a uma coluna sem mutar o restante do mapa.
 *
 * @param widths - Mapa atual
 * @param scope - Tela alvo
 * @param panel - Coluna alvo
 * @param width - Nova largura, já validada
 * @returns Novo mapa de larguras
 */
const withPanelWidth = (
  widths: Record<LayoutScope, PanelWidths>,
  scope: LayoutScope,
  panel: LayoutPanel,
  width: number
): Record<LayoutScope, PanelWidths> => ({
  ...widths,
  [scope]: { ...widths[scope], [panel]: width },
});

/**
 * Store das larguras das colunas redimensionáveis das telas de criação.
 *
 * É uma preferência do aparelho (como o zoom do navegador), não da conta: a
 * largura que serve num monitor ultrawide não serve num notebook, então a
 * chave não é escopada por usuário e o valor nunca viaja junto do conteúdo
 * salvo. `activity` e `lesson` são independentes — o professor pode querer a
 * prévia larga ao montar uma atividade e estreita ao montar uma aula.
 */
export const useLayoutPreferencesStore = create<LayoutPreferencesState>()(
  persist(
    (set) => ({
      widths: createDefaultWidths(),

      /**
       * Salva a largura escolhida pelo usuário para uma coluna
       * @param scope - Tela alvo
       * @param panel - Coluna alvo
       * @param width - Largura em px
       * @returns {void}
       */
      setPanelWidth: (
        scope: LayoutScope,
        panel: LayoutPanel,
        width: number
      ): void => {
        set((state) => ({
          widths: withPanelWidth(
            state.widths,
            scope,
            panel,
            clampPanelWidth(width)
          ),
        }));
      },

      /**
       * Devolve uma coluna à largura padrão
       * @param scope - Tela alvo
       * @param panel - Coluna alvo
       * @returns {void}
       */
      resetPanelWidth: (scope: LayoutScope, panel: LayoutPanel): void => {
        set((state) => ({
          widths: withPanelWidth(
            state.widths,
            scope,
            panel,
            SIDE_PANEL_DEFAULT_WIDTH
          ),
        }));
      },
    }),
    {
      name: KEYS.LAYOUT_PREFERENCES_STORAGE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ widths: state.widths }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<LayoutPreferencesState>;
        const savedWidths = (saved.widths ?? {}) as Partial<
          Record<LayoutScope, unknown>
        >;
        return {
          ...current,
          widths: {
            activity: mergeScopeWidths(savedWidths.activity),
            lesson: mergeScopeWidths(savedWidths.lesson),
          },
        };
      },
    }
  )
);

/**
 * Lê as larguras de uma tela com seletores primitivos, evitando o re-render
 * extra que um seletor de objeto causaria a cada `set` do store.
 *
 * @param scope - Tela cujas larguras devem ser lidas
 * @returns Larguras salvas e os setters
 */
export const usePanelWidthPreference = (scope: LayoutScope) => {
  const filtersWidth = useLayoutPreferencesStore(
    (state) => state.widths[scope].filters
  );
  const previewWidth = useLayoutPreferencesStore(
    (state) => state.widths[scope].preview
  );
  const setPanelWidth = useLayoutPreferencesStore(
    (state) => state.setPanelWidth
  );
  const resetPanelWidth = useLayoutPreferencesStore(
    (state) => state.resetPanelWidth
  );

  return { filtersWidth, previewWidth, setPanelWidth, resetPanelWidth };
};
