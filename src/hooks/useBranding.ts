import { useEffect, useCallback } from 'react';
import { useBrandingStore, BrandingData } from '../store/brandingStore';
import { useThemeStore } from '../store/themeStore';

/**
 * Upsert a branding icon link element with a specific ID
 * This manages only the branded icon, leaving default app icons intact
 */
const upsertBrandingIcon = (
  id: string,
  rel: 'icon' | 'apple-touch-icon',
  href: string | null
) => {
  const existingLink = document.getElementById(id);

  if (!href) {
    existingLink?.remove();
    return;
  }

  const link =
    existingLink instanceof HTMLLinkElement
      ? existingLink
      : document.createElement('link');

  link.id = id;
  link.rel = rel;
  link.href = href;

  if (!existingLink) {
    document.head.appendChild(link);
  }
};

/**
 * Apply favicon to the document dynamically
 * Uses a managed link element to avoid removing app defaults
 */
const applyFavicon = (faviconUrl: string | null) => {
  upsertBrandingIcon('branding-favicon', 'icon', faviconUrl);
};

/**
 * Hook for managing institution branding
 * Provides access to branding data and applies favicon/icons dynamically
 */
export const useBranding = () => {
  const { branding, setBranding, getBranding, clearBranding } =
    useBrandingStore();
  const { setWhiteLabelTheme, clearWhiteLabelTheme } = useThemeStore();

  /**
   * Initialize branding from sessionInfo
   * This should be called when sessionInfo is available
   */
  const initializeBranding = useCallback(
    (brandingData: BrandingData) => {
      setBranding(brandingData);

      // Apply theme
      if (brandingData.theme) {
        setWhiteLabelTheme(brandingData.theme);
      }

      // Apply favicon
      applyFavicon(brandingData.favicon);
    },
    [setBranding, setWhiteLabelTheme]
  );

  /**
   * Apply stored branding on mount (when loaded from localStorage)
   */
  useEffect(() => {
    if (branding) {
      // Apply theme
      if (branding.theme) {
        setWhiteLabelTheme(branding.theme);
      }
      // Apply favicon
      applyFavicon(branding.favicon);
    }
  }, [branding, setWhiteLabelTheme]);

  /**
   * Clear all branding including theme and managed favicon
   */
  const handleClearBranding = useCallback(() => {
    // Clear branding data from store
    clearBranding();

    // Remove managed favicon
    applyFavicon(null);

    // Clear white-label theme
    clearWhiteLabelTheme();
  }, [clearBranding, clearWhiteLabelTheme]);

  return {
    branding,
    initializeBranding,
    clearBranding: handleClearBranding,
    getBranding,
    theme: branding?.theme || null,
    favicon: branding?.favicon || null,
    icon: branding?.icon || null,
    mainLogo: branding?.mainLogo || null,
    internalLogo: branding?.internalLogo || null,
    loginImage: branding?.loginImage || null,
  };
};
