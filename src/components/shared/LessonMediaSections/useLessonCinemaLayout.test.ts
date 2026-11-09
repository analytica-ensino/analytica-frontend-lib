import { act, renderHook } from '@testing-library/react';
import { useLessonCinemaLayout } from './useLessonCinemaLayout';
import { useMediaPreferencesStore } from '../../../store/mediaPreferencesStore';

const addMain = (width: number) => {
  const main = document.createElement('main');
  Object.defineProperty(main, 'clientWidth', { value: width });
  document.body.appendChild(main);
};

describe('useLessonCinemaLayout', () => {
  const disconnect = jest.fn();

  beforeEach(() => {
    disconnect.mockClear();
    globalThis.ResizeObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect,
    })) as unknown as typeof ResizeObserver;
    useMediaPreferencesStore.setState({ cinemaMode: false });
  });

  afterEach(() => {
    document.querySelector('main')?.remove();
  });

  it('mantém a grade de duas colunas fora do modo cinema', () => {
    addMain(1600);
    const { result } = renderHook(() => useLessonCinemaLayout());

    expect(result.current.gridClassName).toContain('grid-cols-[1fr_430px]');
    expect(result.current.playerFrameStyle).toBeUndefined();
  });

  it('ocupa a largura do main e limita a altura à área visível', () => {
    addMain(1600);
    const { result } = renderHook(() => useLessonCinemaLayout());

    act(() => result.current.toggleCinemaMode());

    expect(useMediaPreferencesStore.getState().cinemaMode).toBe(true);
    expect(result.current.gridClassName).toContain('grid-cols-1');
    expect(result.current.playerFrameStyle).toEqual({
      width: 1600,
      marginLeft: 'calc(50% - 800px)',
      height: 'min(calc(100dvh - 120px), 900px)',
    });
  });

  it('não altera o quadro abaixo de lg', () => {
    addMain(800);
    useMediaPreferencesStore.setState({ cinemaMode: true });

    const { result } = renderHook(() => useLessonCinemaLayout());

    expect(result.current.playerFrameStyle).toBeUndefined();
  });

  it('não falha sem main e para de observar ao desmontar', () => {
    useMediaPreferencesStore.setState({ cinemaMode: true });
    const withoutMain = renderHook(() => useLessonCinemaLayout());
    expect(withoutMain.result.current.playerFrameStyle).toBeUndefined();
    withoutMain.unmount();

    addMain(1600);
    const { unmount } = renderHook(() => useLessonCinemaLayout());
    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
