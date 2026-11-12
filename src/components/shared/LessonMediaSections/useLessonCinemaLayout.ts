import { useLayoutEffect, useState, type CSSProperties } from 'react';
import { useMediaPreferencesStore } from '../../../store/mediaPreferencesStore';

/** Below `lg` the list already sits under the player and the mode does not apply. */
const CINEMA_MIN_WIDTH = 1024;
/**
 * Space above the player with the page scrolled to the top: `AppLayout`
 * header and menu (120px), breadcrumb (~90px) and title strip (~77px), plus
 * slack. Measured at 287px on the student app; below that the controls went
 * off screen.
 */
const PLAYER_TOP_OFFSET = '300px';

/**
 * Layout of the lesson pages with cinema mode (Figma AE-3309).
 *
 * In cinema mode, the title strip and the player take the full width; below,
 * the lesson content sits in the left column and the lesson list in the right.
 *
 * The page always renders the same tree:
 *
 * ```
 * grid (gridClassName)
 * ├─ section (mainClassName)
 * │  ├─ div (stageClassName + stageStyle): title strip and player
 * │  │  └─ player frame (playerFrameStyle)
 * │  └─ div (contentClassName): podcast, quiz, boards
 * └─ section (listClassName): lesson list
 * ```
 *
 * Only classes and styles change: moving the player in the React tree would
 * remount the `<video>` and restart playback. In cinema mode the main
 * `section` becomes `display: contents`, and its children become grid items.
 * The width comes from the measured `<main>`, not `100vw`, which includes the
 * scrollbar and would cause horizontal scrolling.
 *
 * @returns Mode state and the classes and styles for each part of the layout
 */
export const useLessonCinemaLayout = () => {
  const isCinemaMode = useMediaPreferencesStore((s) => s.cinemaMode);
  const setCinemaMode = useMediaPreferencesStore((s) => s.setCinemaMode);
  const [mainWidth, setMainWidth] = useState(0);

  useLayoutEffect(() => {
    if (!isCinemaMode) return;
    const main = document.querySelector('main');
    if (!main) return;

    const measure = () => setMainWidth(main.clientWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(main);
    return () => observer.disconnect();
  }, [isCinemaMode]);

  const isActive = isCinemaMode && mainWidth >= CINEMA_MIN_WIDTH;

  return {
    isCinemaMode,
    toggleCinemaMode: () => setCinemaMode(!isCinemaMode),
    gridClassName:
      'w-full h-full grid grid-cols-[1fr_430px] not-lg:grid-cols-1 gap-3',
    mainClassName: isActive ? 'contents' : undefined,
    stageClassName: isActive ? 'col-span-full' : undefined,
    stageStyle: isActive
      ? ({
          width: mainWidth,
          marginLeft: `calc(50% - ${mainWidth / 2}px)`,
        } satisfies CSSProperties)
      : undefined,
    // Pins the list to the right column even when the page has no content
    // below the player.
    listClassName: isActive ? 'col-start-2' : undefined,
    contentClassName: isActive
      ? 'bg-background rounded-xl pb-2 self-start'
      : undefined,
    playerFrameStyle: isActive
      ? ({
          height: `min(calc(100dvh - ${PLAYER_TOP_OFFSET}), ${(mainWidth * 9) / 16}px)`,
          backgroundColor: 'black',
        } satisfies CSSProperties)
      : undefined,
  };
};
