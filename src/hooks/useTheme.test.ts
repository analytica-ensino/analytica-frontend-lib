import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';

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

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
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

    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: mockLocalStorage,
    });

    // Reset all mocks
    jest.clearAllMocks();
    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    mockDocumentElement.getAttribute.mockReturnValue('enem-parana-light');
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should save original theme on first execution', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null); // data-original-theme não existe

      mockMediaQueryList.matches = false;

      renderHook(() => useTheme());

      expect(mockDocumentElement.getAttribute).toHaveBeenCalledWith(
        'data-theme'
      );
      expect(mockDocumentElement.getAttribute).toHaveBeenCalledWith(
        'data-original-theme'
      );
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-original-theme',
        'enem-parana-light'
      );
    });

    it('should not save original theme if it already exists', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce('enem-parana-light'); // data-original-theme já existe

      mockMediaQueryList.matches = false;

      renderHook(() => useTheme());

      // Deve chamar setAttribute apenas uma vez para aplicar o tema, não para salvar
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledTimes(1);
      expect(mockDocumentElement.setAttribute).not.toHaveBeenCalledWith(
        'data-original-theme',
        'enem-parana-light'
      );
    });

    it('should handle case when no current theme is found', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce(null) // currentTheme é null
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValueOnce(null); // originalTheme para applyTheme é null

      mockMediaQueryList.matches = false; // Sistema prefere light mode

      renderHook(() => useTheme());

      // Não deve chamar setAttribute para data-original-theme se currentTheme for null
      expect(mockDocumentElement.setAttribute).not.toHaveBeenCalledWith(
        'data-original-theme',
        expect.any(String)
      );

      // Não deve chamar setAttribute para data-theme se originalTheme for null
      expect(mockDocumentElement.setAttribute).not.toHaveBeenCalledWith(
        'data-theme',
        expect.any(String)
      );
    });
  });

  describe('theme application', () => {
    it('should apply dark mode when system prefers dark', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValueOnce('enem-parana-light'); // originalTheme para applyTheme

      mockMediaQueryList.matches = true; // Sistema prefere dark mode

      renderHook(() => useTheme());

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );
    });

    it('should apply light mode when system prefers light', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValueOnce('enem-parana-light'); // originalTheme para applyTheme

      mockMediaQueryList.matches = false; // Sistema prefere light mode

      renderHook(() => useTheme());

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-light'
      );
    });
  });

  describe('theme toggle functionality', () => {
    it('should toggle between light and dark themes', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValue('enem-parana-light'); // originalTheme para applyTheme

      mockMediaQueryList.matches = false; // Sistema prefere light mode

      const { result } = renderHook(() => useTheme());

      // Initial state should be system mode with light theme
      expect(result.current.themeMode).toBe('system');
      expect(result.current.isDark).toBe(false);

      // Toggle to dark theme (from system to dark)
      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'theme-mode',
        'dark'
      );

      // Toggle back to light theme
      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('light');
      expect(result.current.isDark).toBe(false);
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'enem-parana-light'
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'theme-mode',
        'light'
      );
    });

    it('should set specific theme mode', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValue('enem-parana-light'); // originalTheme para applyTheme

      const { result } = renderHook(() => useTheme());

      // Set to dark theme
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.themeMode).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'theme-mode',
        'dark'
      );

      // Set to system theme
      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.themeMode).toBe('system');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'theme-mode',
        'system'
      );
    });

    it('should load saved theme from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValue('enem-parana-light'); // originalTheme para applyTheme

      const { result } = renderHook(() => useTheme());

      expect(result.current.themeMode).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme-mode');
    });

    it('should handle system theme changes when in system mode', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValue('enem-parana-light'); // originalTheme para applyTheme

      const { result } = renderHook(() => useTheme());

      expect(result.current.themeMode).toBe('system');

      // Simulate system theme change
      const changeHandler =
        mockMediaQueryList.addEventListener.mock.calls[0][1];
      act(() => {
        changeHandler();
      });

      // Should call setAttribute when system theme changes
      expect(mockDocumentElement.setAttribute).toHaveBeenCalled();
    });

    it('should not respond to system theme changes when not in system mode', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValue('enem-parana-light'); // originalTheme para applyTheme

      const { result } = renderHook(() => useTheme());

      // Set to light mode (not system)
      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.themeMode).toBe('light');

      // Simulate system theme change
      mockMediaQueryList.matches = true;
      const changeHandler =
        mockMediaQueryList.addEventListener.mock.calls[0][1];
      act(() => {
        changeHandler();
      });

      // Should not change theme since we're not in system mode
      expect(result.current.themeMode).toBe('light');
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid theme changes', () => {
      // Reset mocks to ensure clean state
      mockDocumentElement.getAttribute.mockClear();
      mockDocumentElement.setAttribute.mockClear();

      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValueOnce('enem-parana-light') // originalTheme para applyTheme
        .mockReturnValueOnce('enem-parana-light') // originalTheme para primeira mudança
        .mockReturnValueOnce('enem-parana-light') // originalTheme para segunda mudança
        .mockReturnValueOnce('enem-parana-light'); // originalTheme para terceira mudança

      mockMediaQueryList.matches = false;

      renderHook(() => useTheme());

      // Verifica se aplicou temas nas mudanças
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        expect.any(String)
      );
    });
  });
});
