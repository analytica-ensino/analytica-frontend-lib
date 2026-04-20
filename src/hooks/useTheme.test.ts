import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';

// Mock do window.matchMedia
const mockMatchMedia = jest.fn();

// Mock do document.documentElement with dataset
const mockDataset: Record<string, string | undefined> = {};
const mockSetAttribute = jest.fn();
const mockGetAttribute = jest.fn();
const mockRemoveAttribute = jest.fn();

const mockDocumentElement = {
  getAttribute: mockGetAttribute,
  setAttribute: mockSetAttribute,
  removeAttribute: mockRemoveAttribute,
  dataset: new Proxy(mockDataset, {
    get: (target, prop: string) => {
      return target[prop];
    },
    set: (target, prop: string, value: string) => {
      target[prop] = value;
      // Sync with setAttribute mock for test compatibility
      const kebabProp = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      mockSetAttribute(`data-${kebabProp}`, value);
      return true;
    },
    deleteProperty: (target, prop: string) => {
      delete target[prop];
      // Sync with removeAttribute mock for test compatibility
      const kebabProp = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      mockRemoveAttribute(`data-${kebabProp}`);
      return true;
    },
  }),
};

// Mock do MediaQueryList
const mockMediaQueryList = {
  matches: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

describe('useTheme', () => {
  beforeEach(() => {
    // Setup window.matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    // Setup document.documentElement mock
    Object.defineProperty(document, 'documentElement', {
      writable: true,
      value: mockDocumentElement,
    });

    // Reset all mocks
    jest.clearAllMocks();
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    // Clear mockDataset
    Object.keys(mockDataset).forEach((key) => delete mockDataset[key]);
    mockDataset.theme = 'enem-parana-light';
    mockDataset.originalTheme = 'enem-parana-light';

    // Setup getAttribute to return values from mockDataset
    mockGetAttribute.mockImplementation((attr: string) => {
      if (attr === 'data-theme') return mockDataset.theme;
      if (attr === 'data-original-theme') return mockDataset.originalTheme;
      return undefined;
    });

    // Reset Zustand store to initial state
    useThemeStore.setState({ themeMode: 'system', isDark: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize theme on mount', () => {
      mockDataset.theme = 'enem-parana-light';
      delete mockDataset.originalTheme;

      mockMediaQueryList.matches = false;

      renderHook(() => useTheme());

      expect(mockSetAttribute).toHaveBeenCalledWith(
        'data-original-theme',
        'enem-parana-light'
      );
      expect(mockSetAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-light'
      );
    });

    it('should setup system theme listener', () => {
      renderHook(() => useTheme());

      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should cleanup system theme listener on unmount', () => {
      const { unmount } = renderHook(() => useTheme());

      unmount();

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });
  });

  describe('hook integration', () => {
    it('should return current theme state from store', () => {
      useThemeStore.setState({ themeMode: 'dark', isDark: true });

      const { result } = renderHook(() => useTheme());

      expect(result.current.themeMode).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should provide theme functions from store', () => {
      const { result } = renderHook(() => useTheme());

      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.setTheme).toBe('function');
    });
  });

  describe('theme functionality', () => {
    it('should toggle theme through hook', () => {
      mockDataset.theme = 'enem-parana-light';
      mockDataset.originalTheme = 'enem-parana-light';

      const { result } = renderHook(() => useTheme());

      // Toggle to dark theme (from system to dark)
      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('dark');
      expect(result.current.isDark).toBe(true);

      // Toggle back to light theme
      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('should set specific theme mode through hook', () => {
      mockDataset.theme = 'enem-parana-light';
      mockDataset.originalTheme = 'enem-parana-light';

      const { result } = renderHook(() => useTheme());

      // Set to dark theme
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.themeMode).toBe('dark');
      expect(result.current.isDark).toBe(true);

      // Set to system theme
      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.themeMode).toBe('system');
    });

    it('should handle system theme changes when in system mode', () => {
      useThemeStore.setState({ themeMode: 'system' });

      const { result } = renderHook(() => useTheme());

      expect(result.current.themeMode).toBe('system');

      // Clear mocks before testing the change handler
      mockSetAttribute.mockClear();

      // Simulate system theme change
      const changeHandler =
        mockMediaQueryList.addEventListener.mock.calls[0][1];
      act(() => {
        changeHandler();
      });

      // Should call setAttribute when system theme changes
      expect(mockSetAttribute).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid theme changes', () => {
      mockDataset.theme = 'enem-parana-light';
      mockDataset.originalTheme = 'enem-parana-light';

      const { result } = renderHook(() => useTheme());

      // Perform multiple rapid changes
      act(() => {
        result.current.setTheme('dark');
        result.current.setTheme('light');
        result.current.setTheme('system');
      });

      // Should end up in system mode
      expect(result.current.themeMode).toBe('system');
      // Should have applied themes for each change
      expect(mockSetAttribute).toHaveBeenCalledWith(
        'data-theme',
        expect.any(String)
      );
    });
  });
});
