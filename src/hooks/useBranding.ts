import { useEffect } from 'react';
import { useBrandingStore, BrandingData } from '../store/brandingStore';
import { useThemeStore } from '../store/themeStore';

/**
 * Apply favicon to the document dynamically
 */
const applyFavicon = (faviconUrl: string | null) => {
  if (!faviconUrl) return;

  // Remove existing favicon
  const existingFavicon = document.querySelector('link[rel="icon"]');
  if (existingFavicon) {
    existingFavicon.remove();
  }

  // Create and append new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = faviconUrl;
  document.head.appendChild(link);
};

/**
 * Apply apple touch icon to the document dynamically
 */
const applyAppleTouchIcon = (iconUrl: string | null) => {
  if (!iconUrl) return;

  // Remove existing apple touch icon
  const existingIcon = document.querySelector('link[rel="apple-touch-icon"]');
  if (existingIcon) {
    existingIcon.remove();
  }

  // Create and append new apple touch icon
  const link = document.createElement('link');
  link.rel = 'apple-touch-icon';
  link.href = iconUrl;
  document.head.appendChild(link);
};

/**
 * Hook for managing institution branding
 * Provides access to branding data and applies favicon/icons dynamically
 */
export const useBranding = () => {
  const { branding, setBranding, getBranding, clearBranding } =
    useBrandingStore();
  const { setWhiteLabelTheme } = useThemeStore();

  /**
   * Initialize branding from sessionInfo
   * This should be called when sessionInfo is available
   */
  const initializeBranding = (brandingData: BrandingData) => {
    setBranding(brandingData);

    // Apply theme
    if (brandingData.theme) {
      setWhiteLabelTheme(brandingData.theme);
    }

    // Apply favicon and icons
    applyFavicon(brandingData.favicon);
    applyAppleTouchIcon(brandingData.icon);
  };

  /**
   * Apply stored branding on mount
   */
  useEffect(() => {
    if (branding) {
      applyFavicon(branding.favicon);
      applyAppleTouchIcon(branding.icon);
    }
  }, [branding]);

  return {
    branding,
    initializeBranding,
    clearBranding,
    getBranding,
    theme: branding?.theme || null,
    favicon: branding?.favicon || null,
    icon: branding?.icon || null,
    mainLogo: branding?.mainLogo || null,
    internalLogo: branding?.internalLogo || null,
    loginImage: branding?.loginImage || null,
  };
};
