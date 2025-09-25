import { useState, useEffect } from 'react';

// Mobile width in pixels
const MOBILE_WIDTH = 500;
// Tablet width in pixels
const TABLET_WIDTH = 931;
// Video responsive breakpoints
const SMALL_MOBILE_WIDTH = 425;
const EXTRA_SMALL_MOBILE_WIDTH = 375;
const ULTRA_SMALL_MOBILE_WIDTH = 375; // For video controls
const TINY_MOBILE_WIDTH = 320;
// Default desktop width for SSR
const DEFAULT_WIDTH = 1200;

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
    return DEFAULT_WIDTH;
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
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [isExtraSmallMobile, setIsExtraSmallMobile] = useState(false);
  const [isUltraSmallMobile, setIsUltraSmallMobile] = useState(false);
  const [isTinyMobile, setIsTinyMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = getWindowWidth();
      setIsMobile(width < MOBILE_WIDTH);
      setIsTablet(width < TABLET_WIDTH);
      setIsSmallMobile(width < SMALL_MOBILE_WIDTH);
      setIsExtraSmallMobile(width < EXTRA_SMALL_MOBILE_WIDTH);
      setIsUltraSmallMobile(width < ULTRA_SMALL_MOBILE_WIDTH);
      setIsTinyMobile(width < TINY_MOBILE_WIDTH);
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

  /**
   * Get responsive classes for video container
   * @returns className string for video container aspect ratio based on screen size
   */
  const getVideoContainerClasses = (): string => {
    if (isTinyMobile) return 'aspect-square'; // 1:1 ratio for screens < 320px
    if (isExtraSmallMobile) return 'aspect-[4/3]'; // 4:3 ratio for screens < 375px
    if (isSmallMobile) return 'aspect-[16/12]'; // 16:12 ratio for screens < 425px
    return 'aspect-video'; // 16:9 ratio for larger screens
  };

  return {
    isMobile,
    isTablet,
    isSmallMobile,
    isExtraSmallMobile,
    isUltraSmallMobile,
    isTinyMobile,
    getFormContainerClasses,
    getHeaderClasses,
    getMobileHeaderClasses,
    getDesktopHeaderClasses,
    getVideoContainerClasses,
    getDeviceType,
  };
};
