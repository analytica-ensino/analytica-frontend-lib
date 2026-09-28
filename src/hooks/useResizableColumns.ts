import {
  PointerEvent as ReactPointerEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  LayoutPanel,
  LayoutScope,
  SIDE_PANEL_DEFAULT_WIDTH,
  usePanelWidthPreference,
} from '../store/layoutPreferencesStore';

/**
 * Largura mínima da coluna central (banco de questões/aulas) — o quanto os
 * divisores deixam de espaço antes de travar.
 *
 * O valor é ditado pela menor tela que ainda usa o layout desktop: em 1201px,
 * com as duas laterais no padrão de 400px, sobram 279px para o banco. Um
 * mínimo maior que isso já estaria violado antes de qualquer arraste.
 */
export const BANK_MIN_WIDTH = 240;

/** Ajuste por seta do teclado, em px. */
export const RESIZE_KEYBOARD_STEP = 16;

/** Ajuste por seta com Shift, em px. */
export const RESIZE_KEYBOARD_STEP_LARGE = 48;

/** `gap-5` entre os 5 filhos do flex row: 4 intervalos de 20px. */
const COLUMN_GAP = 20;
const GAP_COUNT = 4;

/** Os dois divisores ocupam 1px cada. */
const DIVIDERS_WIDTH = 2;

/** Espaço consumido pelo layout antes de sobrar largura para as colunas. */
const LAYOUT_OVERHEAD = COLUMN_GAP * GAP_COUNT + DIVIDERS_WIDTH;

/**
 * Sentido em que cada coluna cresce: arrastar para a direita alarga os
 * filtros, arrastar para a esquerda alarga a prévia.
 */
const GROW_DIRECTION: Record<LayoutPanel, number> = {
  filters: 1,
  preview: -1,
};

/**
 * Maior largura que uma coluna lateral pode assumir sem empurrar o banco
 * abaixo de `BANK_MIN_WIDTH`.
 *
 * @param containerWidth - Largura medida do container das colunas
 * @param otherPanelWidth - Largura da outra coluna lateral
 * @returns Largura máxima; nunca menor que o padrão
 */
export const getMaxPanelWidth = (
  containerWidth: number,
  otherPanelWidth: number
): number => {
  if (containerWidth <= 0) return SIDE_PANEL_DEFAULT_WIDTH;
  const budget =
    containerWidth - LAYOUT_OVERHEAD - BANK_MIN_WIDTH - otherPanelWidth;
  return Math.max(SIDE_PANEL_DEFAULT_WIDTH, Math.floor(budget));
};

/**
 * Mantém uma largura entre o padrão e o máximo que cabe na tela.
 *
 * @param width - Largura desejada
 * @param containerWidth - Largura medida do container
 * @param otherPanelWidth - Largura da outra coluna lateral
 * @returns Largura aplicável
 */
export const clampPanelToContainer = (
  width: number,
  containerWidth: number,
  otherPanelWidth: number
): number => {
  const max = getMaxPanelWidth(containerWidth, otherPanelWidth);
  return Math.min(Math.max(width, SIDE_PANEL_DEFAULT_WIDTH), max);
};

/**
 * Resolve as larguras que serão realmente aplicadas.
 *
 * As duas laterais disputam o mesmo espaço, então não basta clampar uma de
 * cada vez. Quando a soma não cabe — janela encolhida, ou larguras salvas num
 * monitor maior — o excesso é devolvido proporcionalmente ao quanto cada
 * coluna está **acima** do padrão, e nenhuma desce abaixo dele.
 *
 * O resultado é derivado a cada render em vez de sobrescrever o valor salvo:
 * alargar a janela de volta restaura a largura que o usuário escolheu.
 *
 * @param containerWidth - Largura medida do container (0 se ainda não medido)
 * @param preferredFilters - Largura desejada da coluna de filtros
 * @param preferredPreview - Largura desejada da coluna de prévia
 * @returns Larguras aplicáveis das duas colunas
 */
export const resolveColumnWidths = (
  containerWidth: number,
  preferredFilters: number,
  preferredPreview: number
): { filters: number; preview: number } => {
  const filters = Math.max(preferredFilters, SIDE_PANEL_DEFAULT_WIDTH);
  const preview = Math.max(preferredPreview, SIDE_PANEL_DEFAULT_WIDTH);

  // Antes da primeira medição não há como saber o que cabe.
  if (containerWidth <= 0) return { filters, preview };

  const budget = containerWidth - LAYOUT_OVERHEAD - BANK_MIN_WIDTH;
  const excess = filters + preview - budget;
  if (excess <= 0) return { filters, preview };

  const filtersSlack = filters - SIDE_PANEL_DEFAULT_WIDTH;
  const previewSlack = preview - SIDE_PANEL_DEFAULT_WIDTH;
  const totalSlack = filtersSlack + previewSlack;

  // Ambas já estão no mínimo: a tela é estreita demais e o banco cede. Encolher
  // mais deixaria as colunas menores que o conteúdo que elas precisam mostrar.
  if (totalSlack <= 0) return { filters, preview };

  const reduction = Math.min(excess, totalSlack);
  const filtersCut = Math.round((reduction * filtersSlack) / totalSlack);

  return {
    filters: filters - filtersCut,
    preview: preview - (reduction - filtersCut),
  };
};

/**
 * Traduz a tecla pressionada em variação de largura, no eixo horizontal.
 *
 * @param key - Tecla do evento
 * @param step - Passo em px
 * @returns Variação em px, ou `null` quando a tecla não redimensiona
 */
const getHorizontalKeyDelta = (key: string, step: number): number | null => {
  if (key === 'ArrowRight') return step;
  if (key === 'ArrowLeft') return -step;
  return null;
};

/** Props prontas para o `ResizableDivider` de uma coluna. */
export interface ResizableDividerHandlers {
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  isDragging: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  onDoubleClick: () => void;
}

export interface UseResizableColumnsResult {
  containerRef: (node: HTMLDivElement | null) => void;
  filtersWidth: number;
  previewWidth: number;
  filtersDividerProps: ResizableDividerHandlers;
  previewDividerProps: ResizableDividerHandlers;
}

/**
 * Controla as duas colunas laterais redimensionáveis das telas de criação.
 *
 * Um hook só para os dois divisores porque os limites são acoplados: o quanto
 * a prévia pode crescer depende de quanto os filtros já ocuparam.
 *
 * @param scope - Tela cujas larguras devem ser lidas e salvas
 * @returns Larguras aplicáveis e as props de cada divisor
 */
export const useResizableColumns = (
  scope: LayoutScope
): UseResizableColumnsResult => {
  const { filtersWidth, previewWidth, setPanelWidth, resetPanelWidth } =
    usePanelWidthPreference(scope);

  const [containerWidth, setContainerWidth] = useState(0);
  const [draft, setDraft] = useState<{
    panel: LayoutPanel;
    width: number;
  } | null>(null);

  // `currentWidth` mora aqui, e não só no estado `draft`, para o `pointerup`
  // ler a última largura sem depender do render que o `pointermove` agendou.
  const dragRef = useRef<{
    panel: LayoutPanel;
    startX: number;
    startWidth: number;
    currentWidth: number;
  } | null>(null);

  const observerRef = useRef<ResizeObserver | null>(null);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) {
      setContainerWidth(0);
      return;
    }

    setContainerWidth(node.getBoundingClientRect().width);

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      setContainerWidth(node.getBoundingClientRect().width);
    });
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const preferredFilters =
    draft?.panel === 'filters' ? draft.width : filtersWidth;
  const preferredPreview =
    draft?.panel === 'preview' ? draft.width : previewWidth;

  const resolved = resolveColumnWidths(
    containerWidth,
    preferredFilters,
    preferredPreview
  );

  // Lido dentro dos handlers de pointer, que não podem depender do valor
  // capturado no render em que o arraste começou.
  const geometryRef = useRef({ containerWidth, resolved });
  geometryRef.current = { containerWidth, resolved };

  const isDragging = draft !== null;

  useEffect(() => {
    if (!isDragging) return;

    // O cursor precisa valer para a janela inteira: durante o arraste o ponteiro
    // sai de cima do divisor e passaria a mostrar o cursor de texto ou de link.
    const { body } = document;
    const previousCursor = body.style.cursor;
    const previousUserSelect = body.style.userSelect;
    body.style.cursor = 'col-resize';
    body.style.userSelect = 'none';

    return () => {
      body.style.cursor = previousCursor;
      body.style.userSelect = previousUserSelect;
    };
  }, [isDragging]);

  const getOtherWidth = useCallback((panel: LayoutPanel): number => {
    const { resolved: current } = geometryRef.current;
    return panel === 'filters' ? current.preview : current.filters;
  }, []);

  const commitWidth = useCallback(
    (panel: LayoutPanel, width: number) => {
      const { containerWidth: measured } = geometryRef.current;
      setPanelWidth(
        scope,
        panel,
        clampPanelToContainer(width, measured, getOtherWidth(panel))
      );
    },
    [getOtherWidth, scope, setPanelWidth]
  );

  const handlePointerDown = useCallback(
    (panel: LayoutPanel) => (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;

      const { containerWidth: measured, resolved: current } =
        geometryRef.current;
      if (
        getMaxPanelWidth(measured, getOtherWidth(panel)) <=
        SIDE_PANEL_DEFAULT_WIDTH
      ) {
        return;
      }

      event.preventDefault();
      // Optional call: o jsdom não implementa a Pointer Capture API.
      event.currentTarget.setPointerCapture?.(event.pointerId);

      const startWidth =
        panel === 'filters' ? current.filters : current.preview;
      dragRef.current = {
        panel,
        startX: event.clientX,
        startWidth,
        currentWidth: startWidth,
      };
      setDraft({ panel, width: startWidth });
    },
    [getOtherWidth]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag) return;

      const delta = (event.clientX - drag.startX) * GROW_DIRECTION[drag.panel];
      const { containerWidth: measured } = geometryRef.current;

      // Clampar já aqui (e não só na renderização) evita o arraste "morto":
      // sem isso o rascunho acumularia 2000px fora do limite e o usuário teria
      // de desfazer todos eles antes da coluna voltar a se mexer.
      const width = clampPanelToContainer(
        drag.startWidth + delta,
        measured,
        getOtherWidth(drag.panel)
      );

      drag.currentWidth = width;
      setDraft({ panel: drag.panel, width });
    },
    [getOtherWidth]
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag) return;

      event.currentTarget.releasePointerCapture?.(event.pointerId);
      dragRef.current = null;

      setDraft(null);
      // Escrito no storage só no fim do arraste, não a cada frame.
      commitWidth(drag.panel, drag.currentWidth);
    },
    [commitWidth]
  );

  const handleKeyDown = useCallback(
    (panel: LayoutPanel) => (event: ReactKeyboardEvent<HTMLElement>) => {
      const { containerWidth: measured, resolved: current } =
        geometryRef.current;
      const otherWidth = getOtherWidth(panel);
      const max = getMaxPanelWidth(measured, otherWidth);
      if (max <= SIDE_PANEL_DEFAULT_WIDTH) return;

      if (event.key === 'Home') {
        event.preventDefault();
        resetPanelWidth(scope, panel);
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        setPanelWidth(scope, panel, max);
        return;
      }

      const step = event.shiftKey
        ? RESIZE_KEYBOARD_STEP_LARGE
        : RESIZE_KEYBOARD_STEP;
      const delta = getHorizontalKeyDelta(event.key, step);
      if (delta === null) return;

      event.preventDefault();
      const currentWidth =
        panel === 'filters' ? current.filters : current.preview;
      commitWidth(panel, currentWidth + delta * GROW_DIRECTION[panel]);
    },
    [commitWidth, getOtherWidth, resetPanelWidth, scope, setPanelWidth]
  );

  const buildDividerProps = (panel: LayoutPanel): ResizableDividerHandlers => {
    const value = panel === 'filters' ? resolved.filters : resolved.preview;
    const otherWidth =
      panel === 'filters' ? resolved.preview : resolved.filters;
    const max = getMaxPanelWidth(containerWidth, otherWidth);

    return {
      value,
      min: SIDE_PANEL_DEFAULT_WIDTH,
      max,
      disabled: max <= SIDE_PANEL_DEFAULT_WIDTH,
      isDragging: draft?.panel === panel,
      onPointerDown: handlePointerDown(panel),
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onKeyDown: handleKeyDown(panel),
      onDoubleClick: () => resetPanelWidth(scope, panel),
    };
  };

  return {
    containerRef,
    filtersWidth: resolved.filters,
    previewWidth: resolved.preview,
    filtersDividerProps: buildDividerProps('filters'),
    previewDividerProps: buildDividerProps('preview'),
  };
};
