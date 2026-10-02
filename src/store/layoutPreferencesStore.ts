import { create } from 'zustand';
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
  /** Larguras atuais por tela */
  widths: Record<LayoutScope, PanelWidths>;
  setPanelWidth: (
    scope: LayoutScope,
    panel: LayoutPanel,
    width: number
  ) => void;
  resetPanelWidth: (scope: LayoutScope, panel: LayoutPanel) => void;
}

/**
 * Apaga a chave em que as larguras já foram persistidas.
 *
 * As larguras deixaram de ser salvas, então a entrada gravada pelas versões
 * anteriores ficaria para sempre no aparelho de quem usou as telas de criação:
 * lixo que ninguém mais lê e que engana quem for depurar o storage.
 *
 * @returns {void}
 */
const dropLegacyPersistedWidths = (): void => {
  localStorage.removeItem(KEYS.LAYOUT_PREFERENCES_STORAGE);
};

dropLegacyPersistedWidths();

/**
 * Mantém a largura acima do mínimo e descarta valores inválidos (`NaN`,
 * negativo, string) — um `width` inválido no style inline colapsaria a coluna.
 *
 * Não há teto aqui de propósito: o limite superior depende da largura da tela
 * em runtime e é aplicado por `useResizableColumns`, não pelo store.
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
 * As larguras valem só enquanto a tela está aberta: nada é persistido, e
 * `useResizableColumns` devolve as duas colunas ao padrão ao desmontar. Toda
 * visita começa no layout de 400px, independente de como a anterior terminou.
 *
 * `activity` e `lesson` continuam independentes — o professor pode alargar a
 * prévia ao montar uma atividade sem mexer na tela de aula da mesma sessão.
 */
export const useLayoutPreferencesStore = create<LayoutPreferencesState>()(
  (set) => ({
    widths: createDefaultWidths(),

    /**
     * Aplica a largura escolhida pelo usuário para uma coluna
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
  })
);

/**
 * Lê as larguras de uma tela com seletores primitivos, evitando o re-render
 * extra que um seletor de objeto causaria a cada `set` do store.
 *
 * @param scope - Tela cujas larguras devem ser lidas
 * @returns Larguras atuais e os setters
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
