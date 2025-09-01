import { useState, useEffect } from 'react';

// Mobile width in pixels
const MOBILE_WIDTH = 500;
// Tablet width in pixels
const TABLET_WIDTH = 931;
// Default desktop width for SSR
const DEFAULT_WIDHT = 1200;

/**
 * Device type based on screen width
 */
export type DeviceType = 'responsive' | 'desktop';

/**
 * Gets the window width safely (SSR compatible)
 * @returns {number} window width or default value for SSR
 */
const getWindowWidth = (): number => {
  if (typeof window === 'undefined') {
    return DEFAULT_WIDHT;
  }
  return window.innerWidth;
};

/**
 * Gets the current device type based on screen width
 * @returns {DeviceType} 'responsive' for mobile/tablet (width < 931px), 'desktop' for larger screens
 */
export const getDeviceType = (): DeviceType => {
  const width = getWindowWidth();
  return width < TABLET_WIDTH ? 'responsive' : 'desktop';
};

/**
 * Hook to detect screen size and get responsive classes
 * @returns object with isMobile, isTablet, responsive class functions and getDeviceType
 */
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = getWindowWidth();
      setIsMobile(width < MOBILE_WIDTH);
      setIsTablet(width < TABLET_WIDTH);
    };

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  /**
   * Get responsive classes for the form container
   * @returns className string for form container based on screen size
   */
  const getFormContainerClasses = (): string => {
    if (isMobile) {
      return 'w-full px-4';
    }
    if (isTablet) {
      return 'w-full px-6';
    }
    return 'w-full max-w-[992px] mx-auto px-0';
  };

  /**
   * Get mobile-specific classes for the header
   * @returns className string for mobile header layout
   */
  const getMobileHeaderClasses = (): string => {
    return 'flex flex-col items-start gap-4 mb-6';
  };

  /**
   * Get desktop-specific classes for the header
   * @returns className string for desktop header layout
   */
  const getDesktopHeaderClasses = (): string => {
    return 'flex flex-row justify-between items-center gap-6 mb-8';
  };

  /**
   * Get responsive classes for the header
   * @returns className string for header based on screen size
   */
  const getHeaderClasses = (): string => {
    return isMobile ? getMobileHeaderClasses() : getDesktopHeaderClasses();
  };

  return {
    isMobile,
    isTablet,
    getFormContainerClasses,
    getHeaderClasses,
    getMobileHeaderClasses,
    getDesktopHeaderClasses,
    getDeviceType,
  };
};
