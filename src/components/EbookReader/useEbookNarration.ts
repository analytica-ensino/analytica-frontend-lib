import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  activeSegments,
  audioDescriptionSkipTarget,
  hasAudioDescription as anyAudioDescription,
  isAudioDescriptionOnly,
} from './narration';
import { resolvePackagePath } from './sanitizeEbookHtml';
import {
  EBOOK_CLASS,
  EBOOK_FORMAT,
  NARRATION_FILE,
  type EbookNarration,
  type EbookNarrationPage,
} from './types';
import type { UseEbookBookReturn } from './useEbookBook';

/** How often, in milliseconds, the player checks the time (timeupdate is too coarse to skip on time). */
const TICK_MS = 30;

/** A page ends this many seconds before its `end`, so the next page's first word is never heard. */
const PAGE_END_MARGIN_S = 0.3;

/** A jump lands this far past the end of what it skips. */
const SEEK_PAST_S = 0.02;

/** Attribute that names a page's section. */
const SECTION_ATTRIBUTE = EBOOK_FORMAT.SECTION_ATTRIBUTE;

/** Class the book's CSS gives the block being read. */
const READING_CLASS = EBOOK_CLASS.READING;

/** Where the audio description switch is kept, per browser. */
export const AUDIO_DESCRIPTION_STORAGE_KEY = 'ebook:audio-description';

const readAudioDescriptionChoice = (): boolean => {
  try {
    return (
      globalThis.localStorage?.getItem(AUDIO_DESCRIPTION_STORAGE_KEY) !== 'off'
    );
  } catch {
    return true;
  }
};

const saveAudioDescriptionChoice = (on: boolean) => {
  try {
    globalThis.localStorage?.setItem(
      AUDIO_DESCRIPTION_STORAGE_KEY,
      on ? 'on' : 'off'
    );
  } catch {
    // Without storage the choice lasts while the page does.
  }
};

/** Moves past an audio description without letting it sound. */
const jump = (audio: HTMLAudioElement, to: number) => {
  audio.muted = true;
  audio.addEventListener(
    'seeked',
    () => {
      audio.muted = false;
    },
    { once: true }
  );
  audio.currentTime = to;
};

/** A narrated page whose mp3 is inside the package, with its address. */
interface PlayablePage extends EbookNarrationPage {
  src: string;
}

/**
 * The pages that can play, by section, from the stored map (its keys mean
 * nothing). A page whose mp3 is not a file of the version (an outside URL, a
 * step out of the version's folder) is left out, as images are.
 */
const playablePages = (
  narration: EbookNarration | null | undefined,
  assetBaseUrl: string
): Map<string, PlayablePage> => {
  const pages = new Map<string, PlayablePage>();
  for (const page of Object.values(narration ?? {})) {
    const src = resolvePackagePath(page.file ?? NARRATION_FILE, assetBaseUrl);
    if (src) pages.set(page.section, { ...page, src });
  }
  return pages;
};

export interface UseEbookNarrationOptions {
  /** Narration of the version, when it has one */
  narration?: EbookNarration | null;
  /** Base URL of the version's files; the mp3 path resolves against it */
  assetBaseUrl: string;
  /** Element the book is drawn into */
  contentRef: RefObject<HTMLDivElement | null>;
  /** The book being read */
  book: Pick<
    UseEbookBookReturn,
    'layout' | 'pageIndex' | 'pageCount' | 'next' | 'getVisiblePages'
  >;
}

export interface UseEbookNarrationReturn {
  /** The book has recorded narration: the "Ouvir" button shows */
  hasNarration: boolean;
  /** Some segment describes an image: the audio description switch shows */
  hasAudioDescription: boolean;
  isPlaying: boolean;
  /** Audio description on (the default) reads the image descriptions too */
  withAudioDescription: boolean;
  /** "Ouvir" / "Parar" */
  toggle: () => void;
  toggleAudioDescription: () => void;
}

/**
 * Plays the book's recorded narration, page by page.
 *
 * "Ouvir" plays the segments of the pages on screen, highlighting the element
 * of each segment (`data-segment`) with the class the book's CSS styles, and turns
 * the page when they end. With audio description off, image descriptions
 * (`ad` segments) are skipped before they sound, and pages that only describe
 * images are left out. Turning a page by hand while listening goes on from
 * the new page.
 *
 * One audio element serves the whole book, so once the student starts it,
 * the following pages can play without another tap.
 *
 * @param options - The narration, where its mp3 is and the book being read
 * @returns Whether there is narration and the controls
 */
export const useEbookNarration = ({
  narration,
  assetBaseUrl,
  contentRef,
  book,
}: UseEbookNarrationOptions): UseEbookNarrationReturn => {
  const pages = useMemo(
    () => playablePages(narration, assetBaseUrl),
    [narration, assetBaseUrl]
  );
  const hasNarration = pages.size > 0;
  const hasAudioDescription = useMemo(
    () => anyAudioDescription(pages.values()),
    [pages]
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [withAudioDescription, setWithAudioDescription] = useState(
    readAudioDescriptionChoice
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );
  const highlightedRef = useRef<Element[]>([]);
  const playingRef = useRef(false);
  /** Bumped on every start and stop; callbacks of an older run do nothing. */
  const runRef = useRef(0);
  const withAudioDescriptionRef = useRef(withAudioDescription);
  withAudioDescriptionRef.current = withAudioDescription;
  const bookRef = useRef(book);
  bookRef.current = book;

  const clearHighlight = useCallback(() => {
    highlightedRef.current.forEach((element) =>
      element.classList.remove(READING_CLASS)
    );
    highlightedRef.current = [];
  }, []);

  const pauseAudio = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = undefined;
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.pause();
    }
    clearHighlight();
  }, [clearHighlight]);

  const stop = useCallback(() => {
    runRef.current += 1;
    playingRef.current = false;
    setIsPlaying(false);
    pauseAudio();
  }, [pauseAudio]);

  const audioFor = useCallback((page: PlayablePage): HTMLAudioElement => {
    audioRef.current ??= new Audio();
    const audio = audioRef.current;
    if (audio.src !== page.src) audio.src = page.src;
    return audio;
  }, []);

  const playPages = useCallback(
    (queue: HTMLElement[], run: number, onDone: () => void) => {
      if (run !== runRef.current) return;
      const pageElement = queue.shift();
      if (!pageElement) {
        clearHighlight();
        onDone();
        return;
      }
      const page = pages.get(pageElement.getAttribute(SECTION_ATTRIBUTE) ?? '');
      if (
        !page ||
        (!withAudioDescriptionRef.current && isAudioDescriptionOnly(page))
      ) {
        playPages(queue, run, onDone);
        return;
      }

      const audio = audioFor(page);
      let finished = false;
      const finish = () => {
        if (finished || run !== runRef.current) return;
        finished = true;
        clearInterval(timerRef.current);
        audio.onended = null;
        audio.pause();
        playPages(queue, run, onDone);
      };

      const tick = () => {
        if (run !== runRef.current) return;
        if (audio.currentTime >= page.end - PAGE_END_MARGIN_S) {
          finish();
          return;
        }
        if (audio.seeking) return;
        const time = audio.currentTime - page.start;
        const skipTo = audioDescriptionSkipTarget(
          page,
          time,
          withAudioDescriptionRef.current
        );
        if (skipTo >= 0) {
          jump(audio, page.start + skipTo + SEEK_PAST_S);
          return;
        }
        clearHighlight();
        // Looked up on the page as it is now: the book may have been rebuilt
        // (a new size) since this page started. Segment ids are unique in a
        // book; a segment without one has nothing to highlight.
        highlightedRef.current = activeSegments(page, time)
          .map(({ segment }) =>
            segment
              ? contentRef.current?.querySelector(
                  `[${EBOOK_FORMAT.SEGMENT_ATTRIBUTE}="${CSS.escape(segment)}"]`
                )
              : null
          )
          .filter((element): element is Element => !!element);
        highlightedRef.current.forEach((element) =>
          element.classList.add(READING_CLASS)
        );
      };

      const skipAtStart = audioDescriptionSkipTarget(
        page,
        0,
        withAudioDescriptionRef.current
      );
      const start =
        page.start + (skipAtStart >= 0 ? skipAtStart + SEEK_PAST_S : 0);
      const begin = () => {
        if (run !== runRef.current) return;
        audio.currentTime = start;
        audio.onended = finish;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(tick, TICK_MS);
        audio.play().catch(() => {
          // The browser refused to play (no gesture, no file): stop listening.
          if (run === runRef.current) stop();
        });
      };
      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) begin();
      else audio.addEventListener('loadedmetadata', begin, { once: true });
    },
    [audioFor, clearHighlight, contentRef, pages, stop]
  );

  /** Plays the pages on screen and then turns the page (or scrolls on). */
  const readPages = useCallback(
    (onScreen: HTMLElement[]) => {
      const run = ++runRef.current;
      pauseAudio();
      if (
        !onScreen.some((page) =>
          pages.has(page.getAttribute(SECTION_ATTRIBUTE) ?? '')
        )
      ) {
        stop();
        return;
      }
      playPages([...onScreen], run, () => {
        if (run !== runRef.current) return;
        const current = bookRef.current;
        const last = Number(onScreen.at(-1)?.dataset.ix ?? -1);
        if (last < 0 || last >= current.pageCount - 1) {
          stop();
          return;
        }
        if (current.layout === 'book') {
          // The page change brings the reading back (effect below).
          current.next();
          return;
        }
        const following = contentRef.current?.querySelector<HTMLElement>(
          `[data-ix="${last + 1}"]`
        );
        if (!following) {
          stop();
          return;
        }
        following.scrollIntoView({ behavior: 'smooth', block: 'center' });
        readPages([following]);
      });
    },
    [contentRef, pages, pauseAudio, playPages, stop]
  );

  const toggle = useCallback(() => {
    if (playingRef.current) {
      stop();
      return;
    }
    playingRef.current = true;
    setIsPlaying(true);
    readPages(bookRef.current.getVisiblePages());
  }, [readPages, stop]);

  const toggleAudioDescription = useCallback(() => {
    const next = !withAudioDescriptionRef.current;
    saveAudioDescriptionChoice(next);
    setWithAudioDescription(next);
  }, []);

  // A page turned while listening (by hand or after a page ends): read on from it.
  useEffect(() => {
    if (playingRef.current && book.layout === 'book') {
      readPages(bookRef.current.getVisiblePages());
    }
    // Only a new page restarts the reading.
    // readPages is stable for a given book.
  }, [book.pageIndex]);

  // Switching between book and scroll, or showing another book, stops listening.
  useEffect(() => stop, [book.layout, narration, stop]);

  // Leaving the reader lets go of the audio.
  useEffect(
    () => () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
      }
    },
    []
  );

  return {
    hasNarration,
    hasAudioDescription,
    isPlaying,
    withAudioDescription,
    toggle,
    toggleAudioDescription,
  };
};
