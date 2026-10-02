import { useState, useEffect } from 'react';
import { DESKTOP_MIN_WIDTH } from './useResizableColumns';

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
/**
 * Largest width that still gets the stacked layout on the creation screens.
 *
 * Derived from the three-column geometry instead of a number of its own: one
 * pixel above it the two side panels and the question bank all fit at their
 * minimum. It used to be a loose 1200, which let the desktop layout render in
 * a width where the bank was already below its floor.
 */
const SMALL_SCREEN_WIDTH = DESKTOP_MIN_WIDTH - 1;

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
 * Hook to detect the width below which the creation screens stack their
 * columns instead of showing the three resizable ones.
 *
 * Used by ActivityCreate and RecommendedLessonCreate components.
 *
 * @returns true when the three-column layout would not fit at its minimums
 */
export const useTabletScreen = () => {
  /*
    Resolved synchronously on the first render. Starting at `false` meant the
    first paint on a phone was always the desktop three-column layout, which
    then jumped to the narrow one as soon as the effect ran.
  */
  const [isSmallScreen, setIsSmallScreen] = useState(
    () => window.innerWidth <= SMALL_SCREEN_WIDTH
  );

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
