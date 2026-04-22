import { useThemeStore } from './themeStore';

// Mock do window.matchMedia
const mockMatchMedia = jest.fn();

// Mock do document.querySelector
const mockQuerySelector = jest.fn();

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
      // Convert camelCase to kebab-case for getAttribute mock
      prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
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

describe('themeStore', () => {
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

    // Setup document.querySelector mock
    Object.defineProperty(document, 'querySelector', {
      writable: true,
      value: mockQuerySelector,
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

    // Setup querySelector to return meta tag content
    mockQuerySelector.mockImplementation((selector: string) => {
      if (selector === 'meta[name="theme"]') {
        return {
          getAttribute: () => 'enem-parana-light',
        };
      }
      return null;
    });

    // Clear Zustand store
    useThemeStore.setState({ themeMode: 'system', isDark: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('applyTheme', () => {
    it('should apply dark mode correctly', () => {
      const { applyTheme } = useThemeStore.getState();

      applyTheme('dark');

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-dark'
      );
      expect(useThemeStore.getState().isDark).toBe(true);
    });

    it('should apply light mode correctly', () => {
      mockDocumentElement.getAttribute.mockReturnValue('enem-parana-light');

      const { applyTheme } = useThemeStore.getState();

      applyTheme('light');

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-light'
      );
      expect(useThemeStore.getState().isDark).toBe(false);
    });

    it('should apply system mode with dark preference', () => {
      mockMediaQueryList.matches = true;
      mockDocumentElement.getAttribute.mockReturnValue('enem-parana-light');

      const { applyTheme } = useThemeStore.getState();

      applyTheme('system');

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-dark'
      );
      expect(useThemeStore.getState().isDark).toBe(true);
    });

    it('should apply system mode with light preference', () => {
      mockMediaQueryList.matches = false;
      mockDocumentElement.getAttribute.mockReturnValue('enem-parana-light');

      const { applyTheme } = useThemeStore.getState();

      applyTheme('system');

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-light'
      );
      expect(useThemeStore.getState().isDark).toBe(false);
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      useThemeStore.setState({ themeMode: 'light' });

      const { toggleTheme } = useThemeStore.getState();

      toggleTheme();

      expect(useThemeStore.getState().themeMode).toBe('dark');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-dark'
      );
    });

    it('should toggle from dark to light', () => {
      useThemeStore.setState({ themeMode: 'dark' });
      mockDocumentElement.getAttribute.mockReturnValue('enem-parana-light');

      const { toggleTheme } = useThemeStore.getState();

      toggleTheme();

      expect(useThemeStore.getState().themeMode).toBe('light');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-light'
      );
    });

    it('should toggle from system to dark', () => {
      useThemeStore.setState({ themeMode: 'system' });

      const { toggleTheme } = useThemeStore.getState();

      toggleTheme();

      expect(useThemeStore.getState().themeMode).toBe('dark');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-dark'
      );
    });
  });

  describe('setTheme', () => {
    it('should set specific theme mode', () => {
      const { setTheme } = useThemeStore.getState();

      setTheme('dark');

      expect(useThemeStore.getState().themeMode).toBe('dark');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-dark'
      );
    });

    it('should set system theme mode', () => {
      mockMediaQueryList.matches = false;
      mockDocumentElement.getAttribute.mockReturnValue('enem-parana-light');

      const { setTheme } = useThemeStore.getState();

      setTheme('system');

      expect(useThemeStore.getState().themeMode).toBe('system');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-light'
      );
    });
  });

  describe('initializeTheme', () => {
    it('should save original theme and apply current theme', () => {
      // Setup mockDataset with theme but no originalTheme
      mockDataset.theme = 'enem-parana-light';
      delete mockDataset.originalTheme;

      mockMediaQueryList.matches = false;

      const { initializeTheme } = useThemeStore.getState();

      initializeTheme();

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-original-theme',
        'enem-parana-light'
      );
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-light'
      );
    });

    it('should not save original theme if it already exists', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce('enem-parana-light') // data-original-theme já existe
        .mockReturnValueOnce('enem-parana-light'); // originalTheme para applyTheme

      mockMediaQueryList.matches = false;

      const { initializeTheme } = useThemeStore.getState();

      initializeTheme();

      expect(mockDocumentElement.setAttribute).not.toHaveBeenCalledWith(
        'data-original-theme',
        expect.any(String)
      );
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-light'
      );
    });
  });

  describe('handleSystemThemeChange', () => {
    it('should respond to system theme changes when in system mode', () => {
      useThemeStore.setState({ themeMode: 'system' });
      mockMediaQueryList.matches = true;

      const { handleSystemThemeChange } = useThemeStore.getState();

      handleSystemThemeChange();

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-dark'
      );
      expect(useThemeStore.getState().isDark).toBe(true);
    });

    it('should not respond to system theme changes when not in system mode', () => {
      useThemeStore.setState({ themeMode: 'light' });
      mockMediaQueryList.matches = true;

      const { handleSystemThemeChange } = useThemeStore.getState();

      // Clear previous calls
      mockDocumentElement.setAttribute.mockClear();

      handleSystemThemeChange();

      // Should not call setAttribute since we're not in system mode
      expect(mockDocumentElement.setAttribute).not.toHaveBeenCalled();
      expect(useThemeStore.getState().themeMode).toBe('light');
    });
  });

  describe('setWhiteLabelTheme', () => {
    it('should set white-label theme and apply it in light mode', () => {
      useThemeStore.setState({ themeMode: 'light' });
      const { setWhiteLabelTheme } = useThemeStore.getState();

      setWhiteLabelTheme('custom-theme-light');

      expect(mockDataset.originalTheme).toBe('custom-theme-light');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'custom-theme-light'
      );
    });

    it('should set white-label theme and apply it in system mode', () => {
      useThemeStore.setState({ themeMode: 'system' });
      mockMediaQueryList.matches = false;
      const { setWhiteLabelTheme } = useThemeStore.getState();

      setWhiteLabelTheme('custom-theme-light');

      expect(mockDataset.originalTheme).toBe('custom-theme-light');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'custom-theme-light'
      );
    });

    it('should set white-label theme but not apply it in dark mode', () => {
      useThemeStore.setState({ themeMode: 'dark' });
      const { setWhiteLabelTheme } = useThemeStore.getState();

      mockDocumentElement.setAttribute.mockClear();

      setWhiteLabelTheme('custom-theme-light');

      expect(mockDataset.originalTheme).toBe('custom-theme-light');
      // 'custom-theme-light' não está no DARK_THEME_MAP → fallback 'base-dark'
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'base-dark'
      );
    });

    it('should do nothing when theme is null', () => {
      const { setWhiteLabelTheme } = useThemeStore.getState();

      mockDocumentElement.setAttribute.mockClear();

      setWhiteLabelTheme(null);

      expect(mockDocumentElement.setAttribute).not.toHaveBeenCalled();
    });
  });

  describe('clearWhiteLabelTheme', () => {
    it('should remove white-label theme and restore from meta tag', () => {
      useThemeStore.setState({ themeMode: 'light' });
      mockDataset.originalTheme = 'custom-theme';
      mockDataset.theme = 'custom-theme';

      const { clearWhiteLabelTheme } = useThemeStore.getState();

      clearWhiteLabelTheme();

      expect(mockDocumentElement.removeAttribute).toHaveBeenCalledWith(
        'data-original-theme'
      );
      expect(mockDocumentElement.removeAttribute).toHaveBeenCalledWith(
        'data-theme'
      );
      expect(mockDataset.originalTheme).toBe('enem-parana-light');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-light'
      );
    });

    it('should clear white-label theme in dark mode', () => {
      useThemeStore.setState({ themeMode: 'dark' });
      mockDataset.originalTheme = 'custom-theme';
      mockDataset.theme = 'custom-theme';

      const { clearWhiteLabelTheme } = useThemeStore.getState();

      clearWhiteLabelTheme();

      expect(mockDocumentElement.removeAttribute).toHaveBeenCalledWith(
        'data-original-theme'
      );
      expect(mockDocumentElement.removeAttribute).toHaveBeenCalledWith(
        'data-theme'
      );
      // Após clear, saveOriginalTheme restaura 'enem-parana-light' do meta tag,
      // e applyTheme('dark') resolve para 'enem-parana-dark'.
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-dark'
      );
    });

    it('should clear white-label theme in system mode with light preference', () => {
      useThemeStore.setState({ themeMode: 'system' });
      mockMediaQueryList.matches = false;
      mockDataset.originalTheme = 'custom-theme';
      mockDataset.theme = 'custom-theme';

      const { clearWhiteLabelTheme } = useThemeStore.getState();

      clearWhiteLabelTheme();

      expect(mockDocumentElement.removeAttribute).toHaveBeenCalledWith(
        'data-original-theme'
      );
      expect(mockDocumentElement.removeAttribute).toHaveBeenCalledWith(
        'data-theme'
      );
      expect(mockDataset.originalTheme).toBe('enem-parana-light');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-light'
      );
    });

    it('should restore theme from meta tag when no dataset.theme exists', () => {
      useThemeStore.setState({ themeMode: 'light' });
      delete mockDataset.theme;
      delete mockDataset.originalTheme;

      mockQuerySelector.mockImplementation((selector: string) => {
        if (selector === 'meta[name="theme"]') {
          return {
            getAttribute: () => 'meta-theme-light',
          };
        }
        return null;
      });

      const { clearWhiteLabelTheme } = useThemeStore.getState();

      clearWhiteLabelTheme();

      expect(mockDataset.originalTheme).toBe('meta-theme-light');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'meta-theme-light'
      );
    });
  });

  describe('DARK_THEME_MAP resolution', () => {
    it('should resolve enem-paraiba-light → enem-paraiba-dark on setTheme(dark)', () => {
      mockDataset.originalTheme = 'enem-paraiba-light';

      const { setTheme } = useThemeStore.getState();

      setTheme('dark');

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-paraiba-dark'
      );
      expect(useThemeStore.getState().isDark).toBe(true);
    });

    it('should resolve base-light → base-dark on setTheme(dark)', () => {
      mockDataset.originalTheme = 'base-light';

      const { setTheme } = useThemeStore.getState();

      setTheme('dark');

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'base-dark'
      );
    });

    it('should fall back to base-dark when originalTheme is missing', () => {
      delete mockDataset.originalTheme;

      const { setTheme } = useThemeStore.getState();

      setTheme('dark');

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'base-dark'
      );
    });

    it('should fall back to base-dark when originalTheme is unknown', () => {
      mockDataset.originalTheme = 'foo-light';

      const { setTheme } = useThemeStore.getState();

      setTheme('dark');

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'base-dark'
      );
    });

    it('should complete the paraiba light → dark → light cycle', () => {
      mockDataset.originalTheme = 'enem-paraiba-light';

      const { setTheme } = useThemeStore.getState();

      setTheme('light');
      expect(mockDocumentElement.setAttribute).toHaveBeenLastCalledWith(
        'data-theme',
        'enem-paraiba-light'
      );

      setTheme('dark');
      expect(mockDocumentElement.setAttribute).toHaveBeenLastCalledWith(
        'data-theme',
        'enem-paraiba-dark'
      );

      setTheme('light');
      expect(mockDocumentElement.setAttribute).toHaveBeenLastCalledWith(
        'data-theme',
        'enem-paraiba-light'
      );
    });

    it('should complete the base light → dark → light cycle', () => {
      mockDataset.originalTheme = 'base-light';

      const { setTheme } = useThemeStore.getState();

      setTheme('light');
      expect(mockDocumentElement.setAttribute).toHaveBeenLastCalledWith(
        'data-theme',
        'base-light'
      );

      setTheme('dark');
      expect(mockDocumentElement.setAttribute).toHaveBeenLastCalledWith(
        'data-theme',
        'base-dark'
      );

      setTheme('light');
      expect(mockDocumentElement.setAttribute).toHaveBeenLastCalledWith(
        'data-theme',
        'base-light'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle case when no original theme is found', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce(null) // currentTheme é null
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValueOnce(null); // originalTheme para applyTheme é null

      mockMediaQueryList.matches = false;

      const { initializeTheme } = useThemeStore.getState();

      initializeTheme();

      // Não deve chamar setAttribute para data-original-theme se currentTheme for null
      expect(mockDocumentElement.setAttribute).not.toHaveBeenCalledWith(
        'data-original-theme',
        expect.any(String)
      );
    });

    it('should handle multiple rapid theme changes', () => {
      mockDocumentElement.getAttribute.mockReturnValue('enem-parana-light');

      const { setTheme } = useThemeStore.getState();

      setTheme('dark');
      setTheme('light');
      setTheme('system');

      expect(useThemeStore.getState().themeMode).toBe('system');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledTimes(3);
    });
  });
});
