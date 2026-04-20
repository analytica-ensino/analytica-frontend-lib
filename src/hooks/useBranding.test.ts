import { renderHook, act } from '@testing-library/react';
import { useBranding } from './useBranding';
import { useBrandingStore } from '../store/brandingStore';
import { useThemeStore } from '../store/themeStore';
import type { BrandingData } from '../types/branding';

// Mock the stores
jest.mock('../store/brandingStore');
jest.mock('../store/themeStore');

describe('useBranding', () => {
  let mockSetBranding: jest.Mock;
  let mockGetBranding: jest.Mock;
  let mockClearBranding: jest.Mock;
  let mockSetWhiteLabelTheme: jest.Mock;
  let mockClearWhiteLabelTheme: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    mockSetBranding = jest.fn();
    mockGetBranding = jest.fn();
    mockClearBranding = jest.fn();
    mockSetWhiteLabelTheme = jest.fn();
    mockClearWhiteLabelTheme = jest.fn();

    // Mock store methods - return null branding by default to prevent useEffect from running
    (useBrandingStore as unknown as jest.Mock).mockReturnValue({
      branding: null,
      setBranding: mockSetBranding,
      getBranding: mockGetBranding,
      clearBranding: mockClearBranding,
    });

    (useThemeStore as unknown as jest.Mock).mockReturnValue({
      setWhiteLabelTheme: mockSetWhiteLabelTheme,
      clearWhiteLabelTheme: mockClearWhiteLabelTheme,
    });

    // Clear document head before each test
    document.head.innerHTML = '';

    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should return correct initial values when branding is null', () => {
      const { result } = renderHook(() => useBranding());

      expect(result.current.branding).toBeNull();
      expect(result.current.theme).toBeNull();
      expect(result.current.favicon).toBeNull();
      expect(result.current.icon).toBeNull();
      expect(result.current.mainLogo).toBeNull();
      expect(result.current.internalLogo).toBeNull();
      expect(result.current.loginImage).toBeNull();
    });

    it('should return branding methods', () => {
      const { result } = renderHook(() => useBranding());

      expect(typeof result.current.initializeBranding).toBe('function');
      expect(typeof result.current.clearBranding).toBe('function');
      expect(typeof result.current.getBranding).toBe('function');
    });
  });

  describe('initializeBranding', () => {
    it('should call setBranding and setWhiteLabelTheme', () => {
      const { result } = renderHook(() => useBranding());

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: 'https://example.com/internal-logo.png',
        loginImage: 'https://example.com/login.jpg',
      };

      act(() => {
        result.current.initializeBranding(brandingData);
      });

      expect(mockSetBranding).toHaveBeenCalledWith(brandingData);
      expect(mockSetWhiteLabelTheme).toHaveBeenCalledWith('enem-paraiba-light');
    });

    it('should not set theme when theme is null', () => {
      const { result } = renderHook(() => useBranding());

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: null,
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      act(() => {
        result.current.initializeBranding(brandingData);
      });

      expect(mockSetBranding).toHaveBeenCalledWith(brandingData);
      expect(mockSetWhiteLabelTheme).not.toHaveBeenCalled();
    });

    it('should handle branding with all null values', () => {
      const { result } = renderHook(() => useBranding());

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: null,
        favicon: null,
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      act(() => {
        result.current.initializeBranding(brandingData);
      });

      expect(mockSetBranding).toHaveBeenCalledWith(brandingData);
      expect(mockSetWhiteLabelTheme).not.toHaveBeenCalled();
    });
  });

  describe('branding state', () => {
    it('should return individual branding properties when branding is set', () => {
      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: 'https://example.com/internal-logo.png',
        loginImage: 'https://example.com/login.jpg',
      };

      (useBrandingStore as unknown as jest.Mock).mockReturnValue({
        branding: brandingData,
        setBranding: mockSetBranding,
        getBranding: mockGetBranding,
        clearBranding: mockClearBranding,
      });

      const { result } = renderHook(() => useBranding());

      expect(result.current.theme).toBe('enem-paraiba-light');
      expect(result.current.favicon).toBe('https://example.com/favicon.ico');
      expect(result.current.icon).toBe('https://example.com/icon.png');
      expect(result.current.mainLogo).toBe('https://example.com/main-logo.png');
      expect(result.current.internalLogo).toBe(
        'https://example.com/internal-logo.png'
      );
      expect(result.current.loginImage).toBe('https://example.com/login.jpg');
    });

    it('should return null values when branding has null properties', () => {
      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: null,
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      (useBrandingStore as unknown as jest.Mock).mockReturnValue({
        branding: brandingData,
        setBranding: mockSetBranding,
        getBranding: mockGetBranding,
        clearBranding: mockClearBranding,
      });

      const { result } = renderHook(() => useBranding());

      expect(result.current.theme).toBe('enem-paraiba-light');
      expect(result.current.favicon).toBeNull();
      expect(result.current.icon).toBeNull();
      expect(result.current.mainLogo).toBeNull();
      expect(result.current.internalLogo).toBeNull();
      expect(result.current.loginImage).toBeNull();
    });
  });

  describe('clearBranding', () => {
    it('should call store clearBranding and clearWhiteLabelTheme', () => {
      const { result } = renderHook(() => useBranding());

      act(() => {
        result.current.clearBranding();
      });

      expect(mockClearBranding).toHaveBeenCalled();
      expect(mockClearWhiteLabelTheme).toHaveBeenCalled();
    });

    it('should remove managed favicon when clearing branding', () => {
      const { result } = renderHook(() => useBranding());

      // First set a favicon
      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: null,
        favicon: 'https://example.com/favicon.ico',
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      act(() => {
        result.current.initializeBranding(brandingData);
      });

      // Verify favicon was added
      const favicon = document.getElementById('branding-favicon');
      expect(favicon).toBeTruthy();
      expect(favicon?.getAttribute('href')).toBe(
        'https://example.com/favicon.ico'
      );

      // Clear branding
      act(() => {
        result.current.clearBranding();
      });

      // Verify favicon was removed
      const clearedFavicon = document.getElementById('branding-favicon');
      expect(clearedFavicon).toBeNull();
    });
  });

  describe('getBranding', () => {
    it('should call store getBranding', () => {
      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      mockGetBranding.mockReturnValue(brandingData);

      const { result } = renderHook(() => useBranding());

      act(() => {
        const branding = result.current.getBranding();
        expect(branding).toEqual(brandingData);
      });

      expect(mockGetBranding).toHaveBeenCalled();
    });

    it('should return null when no branding is set', () => {
      mockGetBranding.mockReturnValue(null);

      const { result } = renderHook(() => useBranding());

      act(() => {
        const branding = result.current.getBranding();
        expect(branding).toBeNull();
      });

      expect(mockGetBranding).toHaveBeenCalled();
    });
  });

  describe('memoization', () => {
    it('should memoize initializeBranding function', () => {
      const { result, rerender } = renderHook(() => useBranding());

      const firstInit = result.current.initializeBranding;
      rerender();
      const secondInit = result.current.initializeBranding;

      expect(firstInit).toBe(secondInit);
    });

    it('should memoize clearBranding function', () => {
      const { result, rerender } = renderHook(() => useBranding());

      const firstClear = result.current.clearBranding;
      rerender();
      const secondClear = result.current.clearBranding;

      expect(firstClear).toBe(secondClear);
    });
  });

  describe('managed favicon', () => {
    it('should create a managed favicon with correct ID', () => {
      const { result } = renderHook(() => useBranding());

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: null,
        favicon: 'https://example.com/favicon.ico',
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      act(() => {
        result.current.initializeBranding(brandingData);
      });

      const favicon = document.getElementById('branding-favicon');
      expect(favicon).toBeTruthy();
      expect(favicon?.tagName).toBe('LINK');
      expect(favicon?.getAttribute('rel')).toBe('icon');
      expect(favicon?.getAttribute('href')).toBe(
        'https://example.com/favicon.ico'
      );
    });

    it('should update existing managed favicon when branding changes', () => {
      const { result } = renderHook(() => useBranding());

      // First branding
      const firstBranding: BrandingData = {
        institutionId: 'institution-123',
        theme: null,
        favicon: 'https://example.com/favicon1.ico',
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      act(() => {
        result.current.initializeBranding(firstBranding);
      });

      const favicon1 = document.getElementById('branding-favicon');
      expect(favicon1?.getAttribute('href')).toBe(
        'https://example.com/favicon1.ico'
      );

      // Second branding
      const secondBranding: BrandingData = {
        institutionId: 'institution-123',
        theme: null,
        favicon: 'https://example.com/favicon2.ico',
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      act(() => {
        result.current.initializeBranding(secondBranding);
      });

      const favicon2 = document.getElementById('branding-favicon');
      expect(favicon2?.getAttribute('href')).toBe(
        'https://example.com/favicon2.ico'
      );
      // Should be the same element, just updated
      expect(favicon2).toBe(favicon1);
    });

    it('should not create favicon when favicon is null', () => {
      const { result } = renderHook(() => useBranding());

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: null,
        favicon: null,
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      act(() => {
        result.current.initializeBranding(brandingData);
      });

      const favicon = document.getElementById('branding-favicon');
      expect(favicon).toBeNull();
    });

    it('should not remove default app favicons when applying branding', () => {
      // Add a default app favicon (without branding- prefix)
      const defaultFavicon = document.createElement('link');
      defaultFavicon.rel = 'icon';
      defaultFavicon.href = '/default-favicon.ico';
      document.head.appendChild(defaultFavicon);

      const { result } = renderHook(() => useBranding());

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: null,
        favicon: 'https://example.com/branded-favicon.ico',
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      act(() => {
        result.current.initializeBranding(brandingData);
      });

      // Default favicon should still exist
      const defaultStillExists = document.querySelector(
        'link[rel="icon"][href="/default-favicon.ico"]'
      );
      expect(defaultStillExists).toBeTruthy();

      // Branded favicon should also exist
      const brandedFavicon = document.getElementById('branding-favicon');
      expect(brandedFavicon).toBeTruthy();
      expect(brandedFavicon?.getAttribute('href')).toBe(
        'https://example.com/branded-favicon.ico'
      );
    });
  });
});
