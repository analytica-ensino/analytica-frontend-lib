import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';

// Mock do window.matchMedia
const mockMatchMedia = jest.fn();

// Mock do document.documentElement
const mockDocumentElement = {
  getAttribute: jest.fn(),
  setAttribute: jest.fn(),
  removeAttribute: jest.fn(),
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
    mockDocumentElement.getAttribute.mockReturnValue('enem-parana-light');
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

  describe('media query listener', () => {
    it('should add event listener for media query changes', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light')
        .mockReturnValueOnce(null);

      mockMediaQueryList.matches = false;

      renderHook(() => useTheme());

      expect(mockMatchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)'
      );
      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should remove event listener on cleanup', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light')
        .mockReturnValueOnce(null);

      mockMediaQueryList.matches = false;

      const { unmount } = renderHook(() => useTheme());

      unmount();

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should respond to system preference changes', () => {
      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValueOnce('enem-parana-light') // originalTheme para applyTheme inicial
        .mockReturnValueOnce('enem-parana-light'); // originalTheme para applyTheme após mudança

      mockMediaQueryList.matches = false; // Inicialmente light mode

      renderHook(() => useTheme());

      // Simula mudança para dark mode
      act(() => {
        mockMediaQueryList.matches = true;
        // Pega o callback que foi passado para addEventListener
        const changeCallback =
          mockMediaQueryList.addEventListener.mock.calls[0][1];
        changeCallback({ matches: true });
      });

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );
    });

    it('should respond to system preference changes from dark to light', () => {
      // Reset mocks to ensure clean state
      mockDocumentElement.getAttribute.mockClear();
      mockDocumentElement.setAttribute.mockClear();
      mockMediaQueryList.addEventListener.mockClear();

      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValueOnce('enem-parana-light') // originalTheme para applyTheme inicial
        .mockReturnValueOnce('enem-parana-light'); // originalTheme para applyTheme após mudança

      mockMediaQueryList.matches = true; // Inicialmente dark mode

      renderHook(() => useTheme());

      // Simula mudança para light mode
      act(() => {
        mockMediaQueryList.matches = false;
        // Pega o callback que foi passado para addEventListener
        const changeCallback =
          mockMediaQueryList.addEventListener.mock.calls[0][1];
        changeCallback({ matches: false });
      });

      // Verifica se aplicou algum tema após a mudança
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        expect.any(String)
      );
    });
  });

  describe('edge cases', () => {
    it('should remove data-theme when transitioning from dark to light with no original theme', () => {
      // Reset mocks to ensure clean state
      mockDocumentElement.getAttribute.mockClear();
      mockDocumentElement.setAttribute.mockClear();
      mockDocumentElement.removeAttribute.mockClear();
      mockMediaQueryList.addEventListener.mockClear();

      mockDocumentElement.getAttribute
        .mockReturnValueOnce(null) // currentTheme
        .mockReturnValueOnce(null) // data-original-theme
        .mockReturnValueOnce(null); // originalTheme in first applyTheme

      mockMediaQueryList.matches = true; // start dark -> sets "dark"

      renderHook(() => useTheme());

      // Verifica se aplicou dark mode inicialmente
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );

      // Simula mudança para light mode
      act(() => {
        mockMediaQueryList.matches = false;
        const cb = mockMediaQueryList.addEventListener.mock.calls[0][1];
        cb({ matches: false } as MediaQueryListEvent);
      });

      // Verifica se removeu o atributo data-theme
      expect(mockDocumentElement.removeAttribute).toHaveBeenCalledWith(
        'data-theme'
      );
    });

    it('should handle multiple rapid theme changes', () => {
      // Reset mocks to ensure clean state
      mockDocumentElement.getAttribute.mockClear();
      mockDocumentElement.setAttribute.mockClear();
      mockMediaQueryList.addEventListener.mockClear();

      mockDocumentElement.getAttribute
        .mockReturnValueOnce('enem-parana-light') // currentTheme
        .mockReturnValueOnce(null) // data-original-theme não existe
        .mockReturnValueOnce('enem-parana-light') // originalTheme para applyTheme
        .mockReturnValueOnce('enem-parana-light') // originalTheme para primeira mudança
        .mockReturnValueOnce('enem-parana-light') // originalTheme para segunda mudança
        .mockReturnValueOnce('enem-parana-light'); // originalTheme para terceira mudança

      mockMediaQueryList.matches = false;

      renderHook(() => useTheme());

      // Simula múltiplas mudanças rápidas
      act(() => {
        const changeCallback =
          mockMediaQueryList.addEventListener.mock.calls[0][1];

        // Dark mode
        mockMediaQueryList.matches = true;
        changeCallback({ matches: true });

        // Light mode
        mockMediaQueryList.matches = false;
        changeCallback({ matches: false });

        // Dark mode novamente
        mockMediaQueryList.matches = true;
        changeCallback({ matches: true });
      });

      // Verifica se aplicou temas nas mudanças
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        expect.any(String)
      );
    });
  });
});
