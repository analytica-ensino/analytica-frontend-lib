import { act, renderHook } from '@testing-library/react';
import { useFullscreen } from './useFullscreen';

const setDocument = (property: string, value: unknown) =>
  Object.defineProperty(document, property, { configurable: true, value });

describe('useFullscreen', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('section');
    element.requestFullscreen = jest.fn().mockResolvedValue(undefined);
    document.exitFullscreen = jest.fn().mockResolvedValue(undefined);
    setDocument('fullscreenEnabled', true);
    setDocument('fullscreenElement', null);
  });

  afterEach(() => {
    setDocument('fullscreenEnabled', false);
    setDocument('fullscreenElement', null);
  });

  const renderFullscreen = (target: HTMLElement | null = element) =>
    renderHook(() => useFullscreen({ current: target }));

  it('tells whether the browser lets pages go full screen', () => {
    expect(renderFullscreen().result.current.isSupported).toBe(true);

    setDocument('fullscreenEnabled', false);
    expect(renderFullscreen().result.current.isSupported).toBe(false);
  });

  it('puts the element in full screen', () => {
    const { result } = renderFullscreen();

    act(() => result.current.toggle());

    expect(element.requestFullscreen).toHaveBeenCalled();
  });

  it('leaves full screen when something is in it', () => {
    setDocument('fullscreenElement', element);
    const { result } = renderFullscreen();

    act(() => result.current.toggle());

    expect(document.exitFullscreen).toHaveBeenCalled();
    expect(element.requestFullscreen).not.toHaveBeenCalled();
  });

  it('follows the browser: only the element counts as full screen', () => {
    const { result } = renderFullscreen();

    setDocument('fullscreenElement', element);
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(result.current.isFullscreen).toBe(true);

    setDocument('fullscreenElement', document.createElement('div'));
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(result.current.isFullscreen).toBe(false);
  });

  it('ignores a refused request', async () => {
    element.requestFullscreen = jest
      .fn()
      .mockRejectedValue(new Error('denied'));
    const { result } = renderFullscreen();

    await act(async () => result.current.toggle());

    expect(result.current.isFullscreen).toBe(false);
  });

  it('does nothing without an element', () => {
    const { result } = renderFullscreen(null);

    act(() => result.current.toggle());
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isFullscreen).toBe(false);
  });
});
