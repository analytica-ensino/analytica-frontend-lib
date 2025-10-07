import { renderHook, act } from '@testing-library/react';
import {
  useScreenSize,
  useScreenWidth,
  useScreenHeight,
  useFullScreenSize,
  useMobile,
} from '../../src/hooks/useScreen';

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
});
