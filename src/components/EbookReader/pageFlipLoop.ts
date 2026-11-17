import { PageFlip } from 'page-flip';
import type { FlipSetting } from 'page-flip';

/** A page-flip instance whose drawing loop the reader owns. */
export interface ManagedPageFlip {
  flip: PageFlip;
  /** Stops the drawing loop and removes the book page-flip built */
  destroy: () => void;
}

/** Shape of page-flip's renderer at runtime: `render` is private in the types. */
interface RenderWithFrame {
  render: (timer: number) => void;
}

/**
 * Creates a page-flip instance over the given pages, with a drawing loop that
 * stops on `destroy`.
 *
 * page-flip 2.0.7 draws on a `requestAnimationFrame` loop started inside
 * `loadFromHTML` that nothing ever stops: its `destroy` removes the elements
 * and leaves the loop running on them forever, so every book opened (and every
 * switch between book and scroll) would keep one more loop alive. The first
 * frame request is swallowed while `loadFromHTML` runs, so that loop never
 * starts, and an equivalent loop is run here instead.
 *
 * @param book - Element that becomes the book (`#book`)
 * @param pages - The pages, in order
 * @param settings - page-flip settings
 * @param onReady - Registers event listeners before the pages load
 * @returns The instance and how to tear it down
 */
export const createManagedPageFlip = (
  book: HTMLElement,
  pages: HTMLElement[],
  settings: Partial<FlipSetting>,
  onReady: (flip: PageFlip) => void
): ManagedPageFlip => {
  const flip = new PageFlip(book, settings);
  onReady(flip);

  const requestFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 0;
  try {
    flip.loadFromHTML(pages);
  } finally {
    globalThis.requestAnimationFrame = requestFrame;
  }

  const renderer = flip.getRender() as unknown as RenderWithFrame;
  let frame = 0;
  let stopped = false;
  const loop = (timer: number) => {
    if (stopped) return;
    renderer.render(timer);
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);

  return {
    flip,
    destroy: () => {
      stopped = true;
      cancelAnimationFrame(frame);
      flip.destroy();
    },
  };
};
