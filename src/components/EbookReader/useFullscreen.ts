import { useCallback, useEffect, useState, type RefObject } from 'react';

export interface UseFullscreenReturn {
  /** The element is the one in full screen */
  isFullscreen: boolean;
  /** The browser lets pages go full screen (an iPhone does not) */
  isSupported: boolean;
  toggle: () => void;
}

/**
 * Puts an element in full screen and tells when it is.
 * @param ref - Element to show in full screen
 * @returns Whether it is in full screen, whether the browser allows it, and the toggle
 */
export const useFullscreen = (
  ref: RefObject<HTMLElement | null>
): UseFullscreenReturn => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isSupported =
    typeof document !== 'undefined' && document.fullscreenEnabled === true;

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(
        !!ref.current && document.fullscreenElement === ref.current
      );
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [ref]);

  const toggle = useCallback(() => {
    // A refused request (no user gesture, a policy) just leaves the page as it is.
    const ignore = () => {};
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(ignore);
      return;
    }
    ref.current?.requestFullscreen().catch(ignore);
  }, [ref]);

  return { isFullscreen, isSupported, toggle };
};
