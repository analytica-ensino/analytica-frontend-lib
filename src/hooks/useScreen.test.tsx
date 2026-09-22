import { renderHook, act } from '@testing-library/react';
import {
  useScreenSize,
  useScreenWidth,
  useScreenHeight,
  useFullScreenSize,
  useMobile,
  useTabletScreen,
} from '../../src/hooks/useScreen';

const setInnerWidth = (value: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value,
  });
};

describe('useScreen hooks', () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  describe('useScreenSize', () => {
    it('should return screen size with default options', () => {
      const { result } = renderHook(() => useScreenSize());
      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);
      expect(result.current.screenSize).toEqual({ width: 1024, height: 768 });
    });

    it('should return only width when height is disabled', () => {
      const { result } = renderHook(() =>
        useScreenSize({ width: true, height: false })
      );
      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBeUndefined();
      expect(result.current.screenSize).toEqual({ width: 1024, height: 768 });
    });

    it('should return only height when width is disabled', () => {
      const { result } = renderHook(() =>
        useScreenSize({ width: false, height: true })
      );
      expect(result.current.width).toBeUndefined();
      expect(result.current.height).toBe(768);
      expect(result.current.screenSize).toEqual({ width: 1024, height: 768 });
    });

    it('should update when window resizes', () => {
      const { result } = renderHook(() => useScreenSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 1080,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(1920);
      expect(result.current.height).toBe(1080);
      expect(result.current.screenSize).toEqual({ width: 1920, height: 1080 });
    });
  });

  describe('useScreenWidth', () => {
    it('should return only screen width', () => {
      const { result } = renderHook(() => useScreenWidth());
      expect(result.current).toBe(1024);
    });

    it('should update when window resizes', () => {
      const { result } = renderHook(() => useScreenWidth());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(1920);
    });
  });

  describe('useScreenHeight', () => {
    it('should return only screen height', () => {
      const { result } = renderHook(() => useScreenHeight());
      expect(result.current).toBe(768);
    });

    it('should update when window resizes', () => {
      const { result } = renderHook(() => useScreenHeight());

      act(() => {
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 1080,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(1080);
    });
  });

  describe('useFullScreenSize', () => {
    it('should return full screen size object', () => {
      const { result } = renderHook(() => useFullScreenSize());
      expect(result.current).toEqual({ width: 1024, height: 768 });
    });

    it('should update when window resizes', () => {
      const { result } = renderHook(() => useFullScreenSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 1080,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toEqual({ width: 1920, height: 1080 });
    });
  });

  describe('useMobile', () => {
    it('should return false for desktop screen', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      const { result } = renderHook(() => useMobile());
      expect(result.current).toBe(false);
    });

    it('should return true for mobile screen', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });
      const { result } = renderHook(() => useMobile());
      expect(result.current).toBe(true);
    });

    it('should return true for tablet screen', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 930,
      });
      const { result } = renderHook(() => useMobile());
      expect(result.current).toBe(true);
    });

    it('should update when window resizes to mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      const { result } = renderHook(() => useMobile());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 800,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(true);
    });

    it('should update when window resizes to desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });
      const { result } = renderHook(() => useMobile());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(false);
    });
  });

  describe('useTabletScreen', () => {
    /*
      Reads the value the hook returned on each render pass, not just the
      settled one. The point of the synchronous initial state is that the very
      first render is already correct — an assertion on `result.current` alone
      would pass even if the value only landed after the effect.
    */
    const renderCapturingEveryPass = () => {
      const passes: boolean[] = [];
      const view = renderHook(() => {
        const value = useTabletScreen();
        passes.push(value);
        return value;
      });
      return { ...view, passes };
    };

    it('should be true on the first render pass below the breakpoint', () => {
      setInnerWidth(430);

      const { passes, result } = renderCapturingEveryPass();

      expect(passes[0]).toBe(true);
      expect(result.current).toBe(true);
    });

    it('should be false on the first render pass above the breakpoint', () => {
      setInnerWidth(1440);

      const { passes, result } = renderCapturingEveryPass();

      expect(passes[0]).toBe(false);
      expect(result.current).toBe(false);
    });

    it('should treat exactly 1200px as a small screen', () => {
      setInnerWidth(1200);

      const { result } = renderHook(() => useTabletScreen());

      expect(result.current).toBe(true);
    });

    it('should treat 1201px as a large screen', () => {
      setInnerWidth(1201);

      const { result } = renderHook(() => useTabletScreen());

      expect(result.current).toBe(false);
    });

    it('should update when window resizes to a small screen', () => {
      setInnerWidth(1440);
      const { result } = renderHook(() => useTabletScreen());

      act(() => {
        setInnerWidth(900);
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(true);
    });

    it('should update when window resizes to a large screen', () => {
      setInnerWidth(900);
      const { result } = renderHook(() => useTabletScreen());

      act(() => {
        setInnerWidth(1440);
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(false);
    });

    it('should stop listening after unmount', () => {
      setInnerWidth(1440);
      const { result, unmount } = renderHook(() => useTabletScreen());

      unmount();

      act(() => {
        setInnerWidth(430);
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(false);
    });
  });
});
