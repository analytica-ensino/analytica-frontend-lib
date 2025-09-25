import { renderHook, act } from '@testing-library/react';
import { useMobile, getDeviceType } from './useMobile';

/**
 * Mock window.innerWidth for testing
 */
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

/**
 * Trigger window resize event
 */
const triggerResize = () => {
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

describe('useMobile', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  describe('hook behavior', () => {
    it('should initialize with correct mobile state for mobile screen', () => {
      mockInnerWidth(400);

      const { result } = renderHook(() => useMobile());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(true);
    });

    it('should initialize with correct tablet state', () => {
      mockInnerWidth(700);

      const { result } = renderHook(() => useMobile());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
    });

    it('should initialize with correct desktop state', () => {
      mockInnerWidth(1200);

      const { result } = renderHook(() => useMobile());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
    });

    it('should update states when window resizes', () => {
      mockInnerWidth(1200);

      const { result } = renderHook(() => useMobile());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);

      // Resize to mobile
      mockInnerWidth(400);
      triggerResize();

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(true);
    });
  });

  describe('getFormContainerClasses', () => {
    it('should return mobile classes for mobile screen', () => {
      mockInnerWidth(400);

      const { result } = renderHook(() => useMobile());

      expect(result.current.getFormContainerClasses()).toBe('w-full px-4');
    });

    it('should return tablet classes for tablet screen', () => {
      mockInnerWidth(700);

      const { result } = renderHook(() => useMobile());

      expect(result.current.getFormContainerClasses()).toBe('w-full px-6');
    });

    it('should return desktop classes for desktop screen', () => {
      mockInnerWidth(1200);

      const { result } = renderHook(() => useMobile());

      expect(result.current.getFormContainerClasses()).toBe(
        'w-full max-w-[992px] mx-auto px-0'
      );
    });
  });

  describe('getHeaderClasses', () => {
    it('should return mobile header classes for mobile screen', () => {
      mockInnerWidth(400);

      const { result } = renderHook(() => useMobile());

      expect(result.current.getHeaderClasses()).toBe(
        'flex flex-col items-start gap-4 mb-6'
      );
    });

    it('should return desktop header classes for desktop screen', () => {
      mockInnerWidth(1200);

      const { result } = renderHook(() => useMobile());

      expect(result.current.getHeaderClasses()).toBe(
        'flex flex-row justify-between items-center gap-6 mb-8'
      );
    });
  });

  describe('getMobileHeaderClasses', () => {
    it('should return mobile header classes', () => {
      const { result } = renderHook(() => useMobile());

      expect(result.current.getMobileHeaderClasses()).toBe(
        'flex flex-col items-start gap-4 mb-6'
      );
    });
  });

  describe('getDesktopHeaderClasses', () => {
    it('should return desktop header classes', () => {
      const { result } = renderHook(() => useMobile());

      expect(result.current.getDesktopHeaderClasses()).toBe(
        'flex flex-row justify-between items-center gap-6 mb-8'
      );
    });
  });

  describe('getDeviceType from hook', () => {
    it('should return getDeviceType function', () => {
      const { result } = renderHook(() => useMobile());

      expect(typeof result.current.getDeviceType).toBe('function');
    });
  });

  describe('cleanup', () => {
    it('should cleanup event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useMobile());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});

describe('getDeviceType', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('should return "responsive" for mobile width (< 931px)', () => {
    mockInnerWidth(500);

    expect(getDeviceType()).toBe('responsive');
  });

  it('should return "responsive" for tablet width (< 931px)', () => {
    mockInnerWidth(930);

    expect(getDeviceType()).toBe('responsive');
  });

  it('should return "desktop" for desktop width (>= 931px)', () => {
    mockInnerWidth(1200);

    expect(getDeviceType()).toBe('desktop');
  });

  it('should return "desktop" for exactly 931px width', () => {
    mockInnerWidth(931);

    expect(getDeviceType()).toBe('desktop');
  });

  it('should return "desktop" when window is undefined (SSR)', () => {
    const originalWindow = globalThis.window;

    // @ts-expect-error - Intentionally setting window to undefined for testing
    delete globalThis.window;

    expect(getDeviceType()).toBe('desktop');

    // Restore window
    globalThis.window = originalWindow;
  });
});

describe('getVideoContainerClasses', () => {
  it('should return aspect-square for tiny mobile screens (< 320px)', () => {
    mockInnerWidth(300);

    const { result } = renderHook(() => useMobile());

    expect(result.current.getVideoContainerClasses()).toBe('aspect-square');
  });

  it('should return aspect-[4/3] for extra small mobile screens (< 375px)', () => {
    mockInnerWidth(350);

    const { result } = renderHook(() => useMobile());

    expect(result.current.getVideoContainerClasses()).toBe('aspect-[4/3]');
  });

  it('should return aspect-[16/12] for small mobile screens (< 425px)', () => {
    mockInnerWidth(400);

    const { result } = renderHook(() => useMobile());

    expect(result.current.getVideoContainerClasses()).toBe('aspect-[16/12]');
  });

  it('should return aspect-video for larger screens (>= 425px)', () => {
    mockInnerWidth(500);

    const { result } = renderHook(() => useMobile());

    expect(result.current.getVideoContainerClasses()).toBe('aspect-video');
  });
});
