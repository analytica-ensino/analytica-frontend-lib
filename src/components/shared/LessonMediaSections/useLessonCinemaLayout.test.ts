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

  it('keeps the two-column grid outside cinema mode', () => {
    addMain(1600);
    const { result } = renderHook(() => useLessonCinemaLayout());

    expect(result.current.gridClassName).toContain('grid-cols-[1fr_430px]');
    expect(result.current.mainClassName).toBeUndefined();
    expect(result.current.stageClassName).toBeUndefined();
    expect(result.current.stageStyle).toBeUndefined();
    expect(result.current.contentClassName).toBeUndefined();
    expect(result.current.listClassName).toBeUndefined();
    expect(result.current.playerFrameStyle).toBeUndefined();
  });

  it('stretches the strip and player across main and keeps two columns below', () => {
    addMain(1600);
    const { result } = renderHook(() => useLessonCinemaLayout());

    act(() => result.current.toggleCinemaMode());

    expect(useMediaPreferencesStore.getState().cinemaMode).toBe(true);
    expect(result.current.gridClassName).toContain('grid-cols-[1fr_430px]');
    expect(result.current.mainClassName).toBe('contents');
    expect(result.current.listClassName).toBe('col-start-2');
    expect(result.current.stageClassName).toBe('col-span-full');
    expect(result.current.stageStyle).toEqual({
      width: 1600,
      marginLeft: 'calc(50% - 800px)',
    });
    expect(result.current.contentClassName).toContain('bg-background');
    expect(result.current.playerFrameStyle).toEqual({
      height: 'min(calc(100dvh - 300px), 900px)',
      backgroundColor: 'black',
    });
  });

  it('does not change the frame below lg', () => {
    addMain(800);
    useMediaPreferencesStore.setState({ cinemaMode: true });

    const { result } = renderHook(() => useLessonCinemaLayout());

    expect(result.current.playerFrameStyle).toBeUndefined();
    expect(result.current.mainClassName).toBeUndefined();
  });

  it('does not fail without main and stops observing on unmount', () => {
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
