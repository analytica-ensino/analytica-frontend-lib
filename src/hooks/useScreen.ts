import { useState, useEffect } from 'react';

type ScreenSize = {
  width: number;
  height: number;
};

type UseScreenSizeOptions = {
  width?: boolean;
  height?: boolean;
};

type UseScreenSizeReturn = {
  width?: number;
  height?: number;
  screenSize: ScreenSize;
};

// Mobile width in pixels
const MOBILE_WIDTH = 931;
// Small screen width in pixels (for ActivityCreate and RecommendedLessonCreate)
const SMALL_SCREEN_WIDTH = 1200;

/**
 * Hook para capturar o tamanho da tela do usuário
 * @param options - Opções para escolher quais dimensões capturar
 * @returns Objeto com as dimensões solicitadas e o tamanho completo da tela
 */
export const useScreenSize = (
  options: UseScreenSizeOptions = {}
): UseScreenSizeReturn => {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', handleResize);

    // Cleanup do listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Retornar apenas as dimensões solicitadas
  const result: UseScreenSizeReturn = {
    screenSize,
  };

  if (options.width !== false) {
    result.width = screenSize.width;
  }

  if (options.height !== false) {
    result.height = screenSize.height;
  }

  return result;
};

/**
 * Hook para capturar apenas a largura da tela
 */
export const useScreenWidth = (): number => {
  const { width } = useScreenSize({ width: true, height: false });
  return width!;
};

/**
 * Hook para capturar apenas a altura da tela
 */
export const useScreenHeight = (): number => {
  const { height } = useScreenSize({ width: false, height: true });
  return height!;
};

/**
 * Hook para capturar o tamanho completo da tela
 */
export const useFullScreenSize = (): ScreenSize => {
  const { screenSize } = useScreenSize();
  return screenSize;
};

/**
 * Hook to detect screen size
 * @returns true if the screen is mobile, false otherwise
 */
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_WIDTH);
    };

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile;
};

/**
 * Hook to detect small screen size (width <= 1200px)
 * Used by ActivityCreate and RecommendedLessonCreate components
 * @returns true if the screen width is <= 1200px, false otherwise
 */
export const useTabletScreen = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= SMALL_SCREEN_WIDTH);
    };

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isSmallScreen;
};
