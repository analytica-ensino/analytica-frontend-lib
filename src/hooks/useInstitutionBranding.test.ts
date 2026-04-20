import { renderHook, waitFor } from '@testing-library/react';
import { useInstitutionBranding } from './useInstitutionBranding';
import { useBranding } from './useBranding';
import type { BrandingData } from '../types/branding';

// Mock useBranding hook
jest.mock('./useBranding');

describe('useInstitutionBranding', () => {
  let mockInitializeBranding: jest.Mock;
  let mockGetBranding: jest.Mock;
  let mockApiGet: jest.Mock;

  beforeEach(() => {
    mockInitializeBranding = jest.fn();
    mockGetBranding = jest.fn();
    mockApiGet = jest.fn();

    (useBranding as jest.Mock).mockReturnValue({
      initializeBranding: mockInitializeBranding,
      getBranding: mockGetBranding,
      branding: null,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start loading when institutionId is provided', async () => {
      mockGetBranding.mockReturnValue(null);
      mockApiGet.mockResolvedValue({
        data: {
          data: {
            theme: null,
            favicon: null,
            icon: null,
            mainLogo: null,
            internalLogo: null,
            loginImage: null,
          },
        },
      });

      const api = { get: mockApiGet };
      const { result } = renderHook(() =>
        useInstitutionBranding(api, 'test-institution-id')
      );

      // Should start loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      // Wait for async operation to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should not fetch when institutionId is null', () => {
      const api = { get: mockApiGet };
      renderHook(() => useInstitutionBranding(api, null));

      expect(mockApiGet).not.toHaveBeenCalled();
    });

    it('should not fetch when api is null', () => {
      renderHook(() =>
        useInstitutionBranding(
          null as unknown as {
            get: (endpoint: string, config?: unknown) => Promise<unknown>;
          },
          'test-institution-id'
        )
      );

      expect(mockApiGet).not.toHaveBeenCalled();
    });
  });

  describe('cached branding', () => {
    it('should use cached branding when available for same institution', async () => {
      const institutionId = 'institution-123';
      const cachedBranding: BrandingData = {
        institutionId,
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: 'https://example.com/internal-logo.png',
        loginImage: 'https://example.com/login.jpg',
      };

      mockGetBranding.mockReturnValue(cachedBranding);

      const api = { get: mockApiGet };
      renderHook(() => useInstitutionBranding(api, institutionId));

      await waitFor(() => {
        expect(mockInitializeBranding).toHaveBeenCalledWith(cachedBranding);
        expect(mockApiGet).not.toHaveBeenCalled();
      });
    });

    it('should not use cached branding when institutionId differs', async () => {
      const cachedBranding: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: 'https://example.com/internal-logo.png',
        loginImage: 'https://example.com/login.jpg',
      };

      mockGetBranding.mockReturnValue(cachedBranding);

      const brandingResponse = {
        data: {
          data: {
            theme: 'enem-parana-light',
            favicon: 'https://different.com/favicon.ico',
            icon: 'https://different.com/icon.png',
            mainLogo: 'https://different.com/logo.png',
            internalLogo: 'https://different.com/internal.png',
            loginImage: 'https://different.com/login.jpg',
          },
        },
      };
      mockApiGet.mockResolvedValue(brandingResponse);

      const api = { get: mockApiGet };
      const differentInstitutionId = 'institution-456';
      renderHook(() => useInstitutionBranding(api, differentInstitutionId));

      // Should fetch new branding instead of using cache
      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith(
          `/institution/filter?filter=${differentInstitutionId}`,
          {}
        );
      });
    });

    it('should not reinitialize cached branding on rerender', async () => {
      const institutionId = 'institution-123';
      const cachedBranding: BrandingData = {
        institutionId,
        theme: 'enem-paraiba-light',
        favicon: null,
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      mockGetBranding.mockReturnValue(cachedBranding);

      const api = { get: mockApiGet };
      const { rerender } = renderHook(() =>
        useInstitutionBranding(api, institutionId)
      );

      await waitFor(() => {
        expect(mockInitializeBranding).toHaveBeenCalledTimes(1);
      });

      rerender();

      await waitFor(() => {
        // Should still be called only once
        expect(mockInitializeBranding).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('API fetch', () => {
    it('should fetch branding from API when not cached', async () => {
      mockGetBranding.mockReturnValue(null);

      const institutionId = 'test-institution-id';
      const brandingResponse = {
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: 'https://example.com/internal-logo.png',
        loginImage: 'https://example.com/login.jpg',
      };

      mockApiGet.mockResolvedValue({
        data: {
          message: 'Success',
          data: brandingResponse,
        },
      });

      const api = { get: mockApiGet };
      const { result } = renderHook(() =>
        useInstitutionBranding(api, institutionId)
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith(
          '/institution/filter?filter=test-institution-id',
          {}
        );
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(mockInitializeBranding).toHaveBeenCalledWith({
          institutionId,
          ...brandingResponse,
        });
      });
    });

    it('should handle Axios response structure correctly', async () => {
      mockGetBranding.mockReturnValue(null);

      const institutionId = 'test-institution-id';
      const brandingData = {
        theme: 'enem-paraiba-light',
        favicon: null,
        icon: null,
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: null,
        loginImage: null,
      };

      // Simulate Axios response structure: response.data.data
      mockApiGet.mockResolvedValue({
        data: {
          message: 'Institution branding retrieved successfully',
          data: brandingData,
        },
        status: 200,
        headers: {},
        config: {},
      });

      const api = { get: mockApiGet };
      renderHook(() => useInstitutionBranding(api, institutionId));

      await waitFor(() => {
        expect(mockInitializeBranding).toHaveBeenCalledWith({
          institutionId,
          ...brandingData,
        });
      });
    });

    it('should handle empty branding response', async () => {
      mockGetBranding.mockReturnValue(null);

      mockApiGet.mockResolvedValue({
        data: {
          message: 'Success',
          data: null,
        },
      });

      const api = { get: mockApiGet };
      renderHook(() => useInstitutionBranding(api, 'test-institution-id'));

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalled();
        expect(mockInitializeBranding).not.toHaveBeenCalled();
      });
    });

    it('should not fetch multiple times', async () => {
      mockGetBranding.mockReturnValue(null);

      const brandingResponse: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: null,
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      mockApiGet.mockResolvedValue({
        data: {
          message: 'Success',
          data: brandingResponse,
        },
      });

      const api = { get: mockApiGet };
      const { rerender } = renderHook(() =>
        useInstitutionBranding(api, 'test-institution-id')
      );

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledTimes(1);
      });

      rerender();

      await waitFor(() => {
        // Should still be called only once due to fetchedRef
        expect(mockApiGet).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockGetBranding.mockReturnValue(null);

      const error = new Error('Network error');
      mockApiGet.mockRejectedValue(error);

      const api = { get: mockApiGet };
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() =>
        useInstitutionBranding(api, 'test-institution-id')
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toEqual(error);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching institution branding:',
        error
      );

      consoleErrorSpy.mockRestore();
    });

    it('should allow retry after error', async () => {
      mockGetBranding.mockReturnValue(null);

      const error = new Error('Network error');
      mockApiGet.mockRejectedValueOnce(error);

      const api = { get: mockApiGet };
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result, rerender } = renderHook(
        ({ instId }) => useInstitutionBranding(api, instId),
        { initialProps: { instId: 'test-institution-id' } }
      );

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });

      // Mock successful response for retry
      const brandingResponse: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: null,
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      mockApiGet.mockResolvedValue({
        data: {
          message: 'Success',
          data: brandingResponse,
        },
      });

      // Change institutionId to trigger new fetch
      rerender({ instId: 'test-institution-id-2' });

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith(
          '/institution/filter?filter=test-institution-id-2',
          {}
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      mockGetBranding.mockReturnValue(null);

      mockApiGet.mockRejectedValue('String error');

      const api = { get: mockApiGet };
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() =>
        useInstitutionBranding(api, 'test-institution-id')
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('Unknown error');
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('institutionId changes', () => {
    it('should fetch when institutionId changes from null to valid', async () => {
      mockGetBranding.mockReturnValue(null);

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: null,
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      mockApiGet.mockResolvedValue({
        data: { message: 'Success', data: brandingData },
      });

      const api = { get: mockApiGet };
      const { rerender } = renderHook(
        ({ instId }) => useInstitutionBranding(api, instId),
        { initialProps: { instId: null as string | null } }
      );

      // Should not fetch when institutionId is null
      expect(mockApiGet).not.toHaveBeenCalled();

      // Change to valid institutionId
      rerender({ instId: 'institution-1' as string | null });

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith(
          '/institution/filter?filter=institution-1',
          {}
        );
      });

      expect(mockApiGet).toHaveBeenCalledTimes(1);
    });
  });
});
