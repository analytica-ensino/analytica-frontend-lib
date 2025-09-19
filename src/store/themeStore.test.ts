import { useThemeStore } from './themeStore';

// Mock do window.matchMedia
const mockMatchMedia = jest.fn();

// Mock do document.documentElement
const mockDocumentElement = {
  getAttribute: jest.fn(),
  setAttribute: jest.fn(),
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

    // Reset all mocks
    jest.clearAllMocks();
    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    mockDocumentElement.getAttribute.mockReturnValue('enem-parana-light');

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
        'dark'
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
        'dark'
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
        'dark'
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
        'dark'
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
        'dark'
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
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValueOnce('enem-parana-light'); // originalTheme para applyTheme

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
        'dark'
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
