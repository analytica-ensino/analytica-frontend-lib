import { useBrandingStore } from './brandingStore';
import type { BrandingData } from './brandingStore';

describe('brandingStore', () => {
  beforeEach(() => {
    // Clear Zustand store before each test
    useBrandingStore.setState({ branding: null });
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have null branding by default', () => {
      const { branding } = useBrandingStore.getState();
      expect(branding).toBeNull();
    });
  });

  describe('setBranding', () => {
    it('should set branding data', () => {
      const { setBranding } = useBrandingStore.getState();

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: 'https://example.com/internal-logo.png',
        loginImage: 'https://example.com/login.jpg',
      };

      setBranding(brandingData);

      const { branding } = useBrandingStore.getState();
      expect(branding).toEqual(brandingData);
    });

    it('should update existing branding data', () => {
      const { setBranding } = useBrandingStore.getState();

      const initialBranding: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-parana-light',
        favicon: null,
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      setBranding(initialBranding);

      const updatedBranding: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: 'https://example.com/internal-logo.png',
        loginImage: 'https://example.com/login.jpg',
      };

      setBranding(updatedBranding);

      const { branding } = useBrandingStore.getState();
      expect(branding).toEqual(updatedBranding);
      expect(branding).not.toEqual(initialBranding);
    });

    it('should handle branding with null values', () => {
      const { setBranding } = useBrandingStore.getState();

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: null,
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      setBranding(brandingData);

      const { branding } = useBrandingStore.getState();
      expect(branding).toEqual(brandingData);
      expect(branding?.theme).toBe('enem-paraiba-light');
      expect(branding?.favicon).toBeNull();
    });
  });

  describe('getBranding', () => {
    it('should return current branding data', () => {
      const { setBranding, getBranding } = useBrandingStore.getState();

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: 'https://example.com/internal-logo.png',
        loginImage: 'https://example.com/login.jpg',
      };

      setBranding(brandingData);

      const result = getBranding();
      expect(result).toEqual(brandingData);
    });

    it('should return null when no branding is set', () => {
      const { getBranding } = useBrandingStore.getState();

      const result = getBranding();
      expect(result).toBeNull();
    });
  });

  describe('clearBranding', () => {
    it('should clear branding data', () => {
      const { setBranding, clearBranding } = useBrandingStore.getState();

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: 'https://example.com/internal-logo.png',
        loginImage: 'https://example.com/login.jpg',
      };

      setBranding(brandingData);
      expect(useBrandingStore.getState().branding).toEqual(brandingData);

      clearBranding();

      const { branding } = useBrandingStore.getState();
      expect(branding).toBeNull();
    });

    it('should not throw when clearing already null branding', () => {
      const { clearBranding } = useBrandingStore.getState();

      expect(() => clearBranding()).not.toThrow();

      const { branding } = useBrandingStore.getState();
      expect(branding).toBeNull();
    });
  });

  describe('persistence', () => {
    it('should persist branding data to localStorage', () => {
      const { setBranding } = useBrandingStore.getState();

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: 'https://example.com/internal-logo.png',
        loginImage: 'https://example.com/login.jpg',
      };

      setBranding(brandingData);

      // Check if data was saved to localStorage
      const stored = localStorage.getItem('@branding-storage:analytica:v2');
      expect(stored).not.toBeNull();

      const parsedStored = JSON.parse(stored!);
      expect(parsedStored.state.branding).toEqual(brandingData);
    });

    it('should restore branding data from localStorage', () => {
      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/main-logo.png',
        internalLogo: 'https://example.com/internal-logo.png',
        loginImage: 'https://example.com/login.jpg',
      };

      // Set branding first to trigger persistence
      const { setBranding } = useBrandingStore.getState();
      setBranding(brandingData);

      // Verify it was persisted
      const stored = localStorage.getItem('@branding-storage:analytica:v2');
      expect(stored).not.toBeNull();

      const parsedStored = JSON.parse(stored!);
      expect(parsedStored.state.branding).toEqual(brandingData);

      // Verify current state
      const { branding } = useBrandingStore.getState();
      expect(branding).toEqual(brandingData);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid sequential updates', () => {
      const { setBranding } = useBrandingStore.getState();

      const branding1: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-parana-light',
        favicon: null,
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      const branding2: BrandingData = {
        institutionId: 'institution-123',
        theme: 'enem-paraiba-light',
        favicon: 'https://example.com/favicon.ico',
        icon: null,
        mainLogo: null,
        internalLogo: null,
        loginImage: null,
      };

      const branding3: BrandingData = {
        institutionId: 'institution-123',
        theme: 'dark',
        favicon: 'https://example.com/favicon.ico',
        icon: 'https://example.com/icon.png',
        mainLogo: 'https://example.com/logo.png',
        internalLogo: null,
        loginImage: null,
      };

      setBranding(branding1);
      setBranding(branding2);
      setBranding(branding3);

      const { branding } = useBrandingStore.getState();
      expect(branding).toEqual(branding3);
    });

    it('should handle empty strings as valid values', () => {
      const { setBranding } = useBrandingStore.getState();

      const brandingData: BrandingData = {
        institutionId: 'institution-123',
        theme: '',
        favicon: '',
        icon: '',
        mainLogo: '',
        internalLogo: '',
        loginImage: '',
      };

      setBranding(brandingData);

      const { branding } = useBrandingStore.getState();
      expect(branding).toEqual(brandingData);
    });
  });
});
