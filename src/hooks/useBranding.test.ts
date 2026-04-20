import { renderHook, act } from '@testing-library/react';
import { useBranding } from './useBranding';
import { useBrandingStore } from '../store/brandingStore';
import { useThemeStore } from '../store/themeStore';
import type { BrandingData } from '../store/brandingStore';

// Mock the stores
jest.mock('../store/brandingStore');
jest.mock('../store/themeStore');

describe('useBranding', () => {
  let mockSetBranding: jest.Mock;
  let mockGetBranding: jest.Mock;
  let mockClearBranding: jest.Mock;
  let mockSetWhiteLabelTheme: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    mockSetBranding = jest.fn();
    mockGetBranding = jest.fn();
    mockClearBranding = jest.fn();
    mockSetWhiteLabelTheme = jest.fn();

    // Mock store methods - return null branding by default to prevent useEffect from running
    (useBrandingStore as unknown as jest.Mock).mockReturnValue({
      branding: null,
      setBranding: mockSetBranding,
      getBranding: mockGetBranding,
      clearBranding: mockClearBranding,
    });

    (useThemeStore as unknown as jest.Mock).mockReturnValue({
      setWhiteLabelTheme: mockSetWhiteLabelTheme,
    });

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
    it('should call store clearBranding', () => {
      const { result } = renderHook(() => useBranding());

      act(() => {
        result.current.clearBranding();
      });

      expect(mockClearBranding).toHaveBeenCalled();
    });
  });

  describe('getBranding', () => {
    it('should call store getBranding', () => {
      const brandingData: BrandingData = {
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
  });
});
