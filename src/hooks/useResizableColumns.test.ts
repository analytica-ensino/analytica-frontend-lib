import type { PointerEvent as ReactPointerEvent } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import {
  BANK_MIN_WIDTH,
  RESIZE_KEYBOARD_STEP,
  RESIZE_KEYBOARD_STEP_LARGE,
  clampPanelToContainer,
  getMaxPanelWidth,
  resolveColumnWidths,
  useResizableColumns,
} from './useResizableColumns';
import {
  SIDE_PANEL_DEFAULT_WIDTH,
  useLayoutPreferencesStore,
} from '../store/layoutPreferencesStore';

/** `gap-5` × 4 intervalos + 2 divisores de 1px. */
const LAYOUT_OVERHEAD = 82;

const DEFAULT = SIDE_PANEL_DEFAULT_WIDTH;

const resetStore = () => {
  localStorage.clear();
  useLayoutPreferencesStore.setState({
    widths: {
      activity: { filters: DEFAULT, preview: DEFAULT },
      lesson: { filters: DEFAULT, preview: DEFAULT },
    },
  });
  localStorage.clear();
};

/** Nó com largura medida fixa, já que o jsdom sempre reporta 0. */
const createContainer = (width: number): HTMLDivElement => {
  const node = document.createElement('div');
  node.getBoundingClientRect = () => ({ width }) as DOMRect;
  return node;
};

const setPointerCapture = jest.fn();
const releasePointerCapture = jest.fn();

const pointerEvent = (clientX: number, button = 0) =>
  ({
    button,
    clientX,
    pointerId: 1,
    preventDefault: jest.fn(),
    currentTarget: { setPointerCapture, releasePointerCapture },
  }) as unknown as ReactPointerEvent<HTMLElement>;

const keyEvent = (key: string, shiftKey = false) =>
  ({
    key,
    shiftKey,
    preventDefault: jest.fn(),
  }) as unknown as ReactKeyboardEvent<HTMLElement>;

/** Monta o hook já com o container medido. */
const renderWithContainer = (containerWidth: number) => {
  const rendered = renderHook(() => useResizableColumns('activity'));
  act(() => {
    rendered.result.current.containerRef(createContainer(containerWidth));
  });
  return rendered;
};

describe('useResizableColumns', () => {
  // Só no `beforeEach`: um reset no `afterEach` rodaria antes do cleanup do
  // Testing Library, atualizando o store com o hook ainda montado — o que faz
  // o React reclamar de update fora do `act()`.
  beforeEach(() => {
    resetStore();
    setPointerCapture.mockClear();
    releasePointerCapture.mockClear();
  });

  describe('getMaxPanelWidth', () => {
    it('should leave the bank at its minimum width', () => {
      // 1920 - 82 de overhead - 240 do banco - 400 da outra coluna
      expect(getMaxPanelWidth(1920, DEFAULT)).toBe(
        1920 - LAYOUT_OVERHEAD - BANK_MIN_WIDTH - DEFAULT
      );
    });

    it('should shrink the budget when the other panel grows', () => {
      expect(getMaxPanelWidth(1920, 700)).toBe(
        getMaxPanelWidth(1920, DEFAULT) - 300
      );
    });

    it('should never return less than the default width', () => {
      expect(getMaxPanelWidth(900, DEFAULT)).toBe(DEFAULT);
    });

    it('should return the default before the container is measured', () => {
      expect(getMaxPanelWidth(0, DEFAULT)).toBe(DEFAULT);
    });
  });

  describe('clampPanelToContainer', () => {
    it('should keep a width that fits', () => {
      expect(clampPanelToContainer(600, 1920, DEFAULT)).toBe(600);
    });

    it('should raise a width below the default', () => {
      expect(clampPanelToContainer(120, 1920, DEFAULT)).toBe(DEFAULT);
    });

    it('should cap a width that would starve the bank', () => {
      expect(clampPanelToContainer(5000, 1920, DEFAULT)).toBe(
        getMaxPanelWidth(1920, DEFAULT)
      );
    });
  });

  describe('resolveColumnWidths', () => {
    it('should keep widths that fit', () => {
      expect(resolveColumnWidths(1920, 600, 700)).toEqual({
        filters: 600,
        preview: 700,
      });
    });

    it('should raise widths below the default', () => {
      expect(resolveColumnWidths(1920, 100, 50)).toEqual({
        filters: DEFAULT,
        preview: DEFAULT,
      });
    });

    it('should not clamp before the container is measured', () => {
      expect(resolveColumnWidths(0, 900, 800)).toEqual({
        filters: 900,
        preview: 800,
      });
    });

    it('should give back the excess proportionally to each slack', () => {
      // budget = 1920 - 82 - 240 = 1598; pedidos 2000, excesso 402, folga igual
      const resolved = resolveColumnWidths(1920, 1000, 1000);

      expect(resolved.filters).toBe(799);
      expect(resolved.preview).toBe(799);
      expect(resolved.filters + resolved.preview).toBe(
        1920 - LAYOUT_OVERHEAD - BANK_MIN_WIDTH
      );
    });

    it('should take more from the panel that is further above the default', () => {
      const resolved = resolveColumnWidths(1600, 900, 500);

      // budget = 1600 - 82 - 240 = 1278; excesso 122; folgas 500 e 100
      expect(resolved.filters).toBeLessThan(900);
      expect(resolved.preview).toBeLessThan(500);
      expect(900 - resolved.filters).toBeGreaterThan(500 - resolved.preview);
    });

    it('should never push a panel below the default, even on a tiny container', () => {
      const resolved = resolveColumnWidths(700, 900, 900);

      expect(resolved.filters).toBeGreaterThanOrEqual(DEFAULT);
      expect(resolved.preview).toBeGreaterThanOrEqual(DEFAULT);
    });

    it('should leave both panels at the default when there is no slack to give back', () => {
      expect(resolveColumnWidths(700, DEFAULT, DEFAULT)).toEqual({
        filters: DEFAULT,
        preview: DEFAULT,
      });
    });
  });

  describe('initial state', () => {
    it('should start both panels at the default width', () => {
      const { result } = renderWithContainer(1920);

      expect(result.current.filtersWidth).toBe(DEFAULT);
      expect(result.current.previewWidth).toBe(DEFAULT);
    });

    it('should expose the aria bounds of each divider', () => {
      const { result } = renderWithContainer(1920);

      expect(result.current.previewDividerProps.min).toBe(DEFAULT);
      expect(result.current.previewDividerProps.value).toBe(DEFAULT);
      expect(result.current.previewDividerProps.max).toBe(
        getMaxPanelWidth(1920, DEFAULT)
      );
      expect(result.current.previewDividerProps.disabled).toBe(false);
    });

    it('should disable the dividers when there is no room to grow', () => {
      const { result } = renderWithContainer(900);

      expect(result.current.previewDividerProps.disabled).toBe(true);
      expect(result.current.filtersDividerProps.disabled).toBe(true);
    });

    it('should disable the dividers before the container is measured', () => {
      const { result } = renderHook(() => useResizableColumns('activity'));

      expect(result.current.previewDividerProps.disabled).toBe(true);
    });

    it('should reset the measurement when the container is detached', () => {
      const { result } = renderWithContainer(1920);

      act(() => result.current.containerRef(null));

      expect(result.current.previewDividerProps.disabled).toBe(true);
    });
  });

  describe('pointer drag', () => {
    it('should widen the preview when dragged to the left', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onPointerDown(pointerEvent(1000))
      );
      act(() =>
        result.current.previewDividerProps.onPointerMove(pointerEvent(880))
      );

      expect(result.current.previewWidth).toBe(DEFAULT + 120);
    });

    it('should widen the filters when dragged to the right', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.filtersDividerProps.onPointerDown(pointerEvent(400))
      );
      act(() =>
        result.current.filtersDividerProps.onPointerMove(pointerEvent(520))
      );

      expect(result.current.filtersWidth).toBe(DEFAULT + 120);
    });

    it('should not shrink the preview below the default', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onPointerDown(pointerEvent(1000))
      );
      act(() =>
        result.current.previewDividerProps.onPointerMove(pointerEvent(1400))
      );

      expect(result.current.previewWidth).toBe(DEFAULT);
    });

    it('should stop widening once the bank hits its minimum', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onPointerDown(pointerEvent(1000))
      );
      act(() =>
        result.current.previewDividerProps.onPointerMove(pointerEvent(-5000))
      );

      expect(result.current.previewWidth).toBe(getMaxPanelWidth(1920, DEFAULT));
    });

    it('should stay responsive after being dragged past the limit', () => {
      const { result } = renderWithContainer(1920);
      const max = getMaxPanelWidth(1920, DEFAULT);

      act(() =>
        result.current.previewDividerProps.onPointerDown(pointerEvent(1000))
      );
      // Muito além do limite e de volta um passo: sem o clamp no rascunho, o
      // usuário teria de desfazer milhares de pixels antes da coluna reagir.
      act(() =>
        result.current.previewDividerProps.onPointerMove(pointerEvent(-5000))
      );
      act(() =>
        result.current.previewDividerProps.onPointerMove(
          pointerEvent(1000 - (max - DEFAULT) + 50)
        )
      );

      expect(result.current.previewWidth).toBe(max - 50);
    });

    it('should capture and release the pointer', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onPointerDown(pointerEvent(1000))
      );
      expect(setPointerCapture).toHaveBeenCalledWith(1);

      act(() =>
        result.current.previewDividerProps.onPointerUp(pointerEvent(900))
      );
      expect(releasePointerCapture).toHaveBeenCalledWith(1);
    });

    it('should flag the dragged divider only', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onPointerDown(pointerEvent(1000))
      );

      expect(result.current.previewDividerProps.isDragging).toBe(true);
      expect(result.current.filtersDividerProps.isDragging).toBe(false);
    });

    it('should persist the width only when the drag ends', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onPointerDown(pointerEvent(1000))
      );
      act(() =>
        result.current.previewDividerProps.onPointerMove(pointerEvent(880))
      );

      expect(useLayoutPreferencesStore.getState().widths.activity.preview).toBe(
        DEFAULT
      );

      act(() =>
        result.current.previewDividerProps.onPointerUp(pointerEvent(880))
      );

      expect(useLayoutPreferencesStore.getState().widths.activity.preview).toBe(
        DEFAULT + 120
      );
    });

    it('should ignore a non-primary button', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onPointerDown(pointerEvent(1000, 2))
      );

      expect(result.current.previewDividerProps.isDragging).toBe(false);
      expect(setPointerCapture).not.toHaveBeenCalled();
    });

    it('should ignore a drag on a disabled divider', () => {
      const { result } = renderWithContainer(900);

      act(() =>
        result.current.previewDividerProps.onPointerDown(pointerEvent(1000))
      );

      expect(result.current.previewDividerProps.isDragging).toBe(false);
    });

    it('should ignore a move without a drag in progress', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onPointerMove(pointerEvent(500))
      );

      expect(result.current.previewWidth).toBe(DEFAULT);
    });

    it('should ignore an end without a drag in progress', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onPointerUp(pointerEvent(500))
      );

      expect(releasePointerCapture).not.toHaveBeenCalled();
    });

    it('should take the remaining room from the panel that was not dragged', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.filtersDividerProps.onPointerDown(pointerEvent(400))
      );
      act(() =>
        result.current.filtersDividerProps.onPointerMove(pointerEvent(700))
      );
      act(() =>
        result.current.filtersDividerProps.onPointerUp(pointerEvent(700))
      );

      // Com os filtros em 700, a prévia agora tem 300px a menos de teto.
      expect(result.current.filtersWidth).toBe(700);
      expect(result.current.previewDividerProps.max).toBe(
        getMaxPanelWidth(1920, 700)
      );
    });

    it('should lock the page cursor while dragging', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onPointerDown(pointerEvent(1000))
      );
      expect(document.body.style.cursor).toBe('col-resize');
      expect(document.body.style.userSelect).toBe('none');

      act(() =>
        result.current.previewDividerProps.onPointerUp(pointerEvent(1000))
      );
      expect(document.body.style.cursor).toBe('');
      expect(document.body.style.userSelect).toBe('');
    });
  });

  describe('keyboard', () => {
    it('should widen the preview with the left arrow', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onKeyDown(keyEvent('ArrowLeft'))
      );

      expect(result.current.previewWidth).toBe(DEFAULT + RESIZE_KEYBOARD_STEP);
    });

    it('should widen the filters with the right arrow', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.filtersDividerProps.onKeyDown(keyEvent('ArrowRight'))
      );

      expect(result.current.filtersWidth).toBe(DEFAULT + RESIZE_KEYBOARD_STEP);
    });

    it('should use a larger step with Shift', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onKeyDown(
          keyEvent('ArrowLeft', true)
        )
      );

      expect(result.current.previewWidth).toBe(
        DEFAULT + RESIZE_KEYBOARD_STEP_LARGE
      );
    });

    it('should not shrink below the default with the right arrow', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onKeyDown(keyEvent('ArrowRight'))
      );

      expect(result.current.previewWidth).toBe(DEFAULT);
    });

    it('should reset to the default with Home', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onKeyDown(
          keyEvent('ArrowLeft', true)
        )
      );
      act(() => result.current.previewDividerProps.onKeyDown(keyEvent('Home')));

      expect(result.current.previewWidth).toBe(DEFAULT);
    });

    it('should jump to the maximum with End', () => {
      const { result } = renderWithContainer(1920);

      act(() => result.current.previewDividerProps.onKeyDown(keyEvent('End')));

      expect(result.current.previewWidth).toBe(getMaxPanelWidth(1920, DEFAULT));
    });

    it('should ignore keys that do not resize', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onKeyDown(keyEvent('Enter'))
      );

      expect(result.current.previewWidth).toBe(DEFAULT);
    });

    it('should ignore the keyboard on a disabled divider', () => {
      const { result } = renderWithContainer(900);

      act(() =>
        result.current.previewDividerProps.onKeyDown(keyEvent('ArrowLeft'))
      );

      expect(result.current.previewWidth).toBe(DEFAULT);
    });
  });

  describe('double click', () => {
    it('should reset the panel to the default width', () => {
      const { result } = renderWithContainer(1920);

      act(() =>
        result.current.previewDividerProps.onKeyDown(
          keyEvent('ArrowLeft', true)
        )
      );
      expect(result.current.previewWidth).toBeGreaterThan(DEFAULT);

      act(() => result.current.previewDividerProps.onDoubleClick());

      expect(result.current.previewWidth).toBe(DEFAULT);
    });
  });

  describe('container resize', () => {
    it('should shrink the panels without losing the saved width', () => {
      const { result } = renderWithContainer(1920);

      act(() => result.current.previewDividerProps.onKeyDown(keyEvent('End')));
      const chosen = result.current.previewWidth;
      expect(chosen).toBeGreaterThan(DEFAULT);

      // Janela encolhida: a prévia cede espaço...
      act(() => result.current.containerRef(createContainer(1300)));
      expect(result.current.previewWidth).toBeLessThan(chosen);
      expect(result.current.previewWidth).toBeGreaterThanOrEqual(DEFAULT);

      // ...e volta ao que o usuário escolheu quando a janela cresce de novo.
      act(() => result.current.containerRef(createContainer(1920)));
      expect(result.current.previewWidth).toBe(chosen);
    });
  });

  describe('ResizeObserver', () => {
    // O jsdom não implementa ResizeObserver, então o caminho real (observar o
    // container e remedir sozinho quando a janela muda) precisa de um duplo.
    let observe: jest.Mock;
    let disconnect: jest.Mock;
    let notify: (() => void) | null;

    beforeEach(() => {
      observe = jest.fn();
      disconnect = jest.fn();
      notify = null;
      (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe = observe;
        disconnect = disconnect;
        unobserve = jest.fn();
      };
    });

    afterEach(() => {
      delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
    });

    it('should observe the container', () => {
      renderWithContainer(1920);

      expect(observe).toHaveBeenCalledTimes(1);
    });

    it('should re-measure when the container is resized', () => {
      const { result } = renderWithContainer(1920);
      const node = createContainer(1920);
      act(() => result.current.containerRef(node));

      act(() => result.current.previewDividerProps.onKeyDown(keyEvent('End')));
      const chosen = result.current.previewWidth;

      // A janela encolhe sem o ref ser reatribuído: só o observer avisa.
      node.getBoundingClientRect = () => ({ width: 1300 }) as DOMRect;
      act(() => notify?.());

      expect(result.current.previewWidth).toBeLessThan(chosen);
    });

    it('should disconnect the previous observer when the container changes', () => {
      const { result } = renderWithContainer(1920);

      act(() => result.current.containerRef(createContainer(1600)));

      expect(disconnect).toHaveBeenCalled();
    });

    it('should disconnect on unmount', () => {
      const { unmount } = renderWithContainer(1920);

      unmount();

      expect(disconnect).toHaveBeenCalled();
    });
  });

  describe('scopes', () => {
    it('should read and write the widths of its own screen', () => {
      const { result } = renderHook(() => useResizableColumns('lesson'));
      act(() => {
        result.current.containerRef(createContainer(1920));
      });

      act(() =>
        result.current.previewDividerProps.onKeyDown(keyEvent('ArrowLeft'))
      );

      const { widths } = useLayoutPreferencesStore.getState();
      expect(widths.lesson.preview).toBe(DEFAULT + RESIZE_KEYBOARD_STEP);
      expect(widths.activity.preview).toBe(DEFAULT);
    });
  });
});
