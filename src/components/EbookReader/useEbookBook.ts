import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { FlipCorner, PageFlip, SizeType } from 'page-flip';
import { measureBook, visiblePages, type BookSize } from './bookLayout';
import type { EbookPageChange } from './types';
import { createManagedPageFlip, type ManagedPageFlip } from './pageFlipLoop';

/** `book` turns pages (page-flip); `scroll` shows them one under the other. */
export type EbookLayout = 'book' | 'scroll';

/** Pages of the book layout: the `.pg` children of `#livro`. */
const PAGE_SELECTOR = ':scope > .pg';

/** The book is rebuilt only when the page width changes by this much, or the spread changes. */
const RESIZE_TOLERANCE_PX = 12;
const RESIZE_DEBOUNCE_MS = 250;
const FLIP_TIME_MS = 800;

/** page-flip's state when no page is turning. */
const IDLE_FLIP_STATE = 'read';

/** Share of a page that must be on screen, in scroll, to count it as seen. */
const PAGE_SEEN_THRESHOLD = 0.4;

/** Label of the "ver resposta" buttons once the answer is open. */
const HIDE_ANSWER_LABEL = 'Esconder';

/** An entry of the book's contents. */
export interface EbookTocEntry {
  /** Text of the link in the book's contents */
  label: string;
  /** Element id or section the link points to */
  target: string;
}

/** Parsed book, kept apart from the screen so every layout starts from a clean copy. */
interface BookTemplate {
  main: HTMLElement;
  pages: HTMLElement[];
  /** Every `data-secao`, in reading order */
  sections: string[];
  toc: EbookTocEntry[];
}

export interface UseEbookBookOptions {
  /** Element the book is drawn into (inside the `.ebook-leitor` container) */
  contentRef: RefObject<HTMLDivElement | null>;
  /** The book's `<main>`, already sanitized */
  html: string;
  /** Section (`data-secao`) or element id to open at */
  initialSection?: string;
  /** Called with every section (`data-secao`) the first time it comes into view */
  onSectionsSeen?: (sections: string[]) => void;
  /** Called whenever the pages on screen change: on a page turn, a scroll or a new section of a scroll-only material */
  onPageChange?: (page: EbookPageChange) => void;
}

export interface UseEbookBookReturn {
  /** Current layout */
  layout: EbookLayout;
  /** False for materials without book pages (the Guia do Professor), which only scroll */
  hasBookLayout: boolean;
  /** Index of the current page (covers included) */
  pageIndex: number;
  /** Number of pages (covers included); zero for scroll-only materials */
  pageCount: number;
  /** Two pages side by side */
  spread: boolean;
  next: () => void;
  previous: () => void;
  /** Opens the page that holds a section or element id */
  goTo: (target: string) => void;
  /** The book's own contents (the `#` links of its `<nav>`) */
  toc: EbookTocEntry[];
  /** Target of the contents entry being read, if any */
  activeTocTarget?: string;
  toggleLayout: () => void;
  /** Elements of the pages on screen, for the narration */
  getVisiblePages: () => HTMLElement[];
}

const prefersReducedMotion = (): boolean =>
  typeof globalThis.matchMedia === 'function' &&
  globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** `data-secao` of an element and of the sections inside it (the end marker sits inside the last page). */
const sectionsOf = (element: Element): string[] =>
  [element, ...Array.from(element.querySelectorAll('[data-secao]'))]
    .map((el) => el.getAttribute('data-secao'))
    .filter((section): section is string => !!section);

/**
 * The book's contents: the `#` links of the first `<nav>` (or of the older
 * `.indice` list) that has any.
 */
const tocOf = (main: HTMLElement): EbookTocEntry[] => {
  const list = Array.from(main.querySelectorAll('nav, .indice')).find(
    (element) => element.querySelector('a[href^="#"]')
  );
  if (!list) return [];
  return Array.from(list.querySelectorAll('a[href^="#"]'))
    .map((link) => ({
      label: (link.textContent ?? '').replace(/\s+/g, ' ').trim(),
      target: (link.getAttribute('href') ?? '').slice(1),
    }))
    .filter((entry) => entry.label && entry.target);
};

const parseTemplate = (html: string): BookTemplate => {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const main = holder.querySelector('main') ?? holder;
  const book = main.querySelector<HTMLElement>('#livro');
  const pages = book
    ? Array.from(book.querySelectorAll<HTMLElement>(PAGE_SELECTOR))
    : [];
  pages.forEach((page, index) => page.setAttribute('data-ix', String(index)));
  main.querySelectorAll<HTMLElement>('.ver-resposta').forEach((button) => {
    button.dataset.ebookLabel = button.textContent ?? '';
  });
  const sections = Array.from(main.querySelectorAll('[data-secao]'))
    .map((element) => element.getAttribute('data-secao') ?? '')
    .filter(Boolean);
  return { main, pages, sections, toc: tocOf(main) };
};

const pageIndexOf = (template: BookTemplate, target: string): number =>
  template.pages.findIndex(
    (page) =>
      page.id === target ||
      page.getAttribute('data-secao') === target ||
      !!page.querySelector(
        `#${CSS.escape(target)}, [data-secao="${CSS.escape(target)}"]`
      )
  );

/** Width and height left for the book inside `<main>`, padding excluded. */
const availableSize = (content: HTMLElement, main: HTMLElement): BookSize => {
  const style = getComputedStyle(main);
  const width =
    main.clientWidth -
    (Number.parseFloat(style.paddingLeft) || 0) -
    (Number.parseFloat(style.paddingRight) || 0);
  const height =
    content.clientHeight -
    (Number.parseFloat(style.paddingTop) || 0) -
    (Number.parseFloat(style.paddingBottom) || 0);
  return measureBook(width, height);
};

/**
 * Draws a processed book inside the reader and turns its pages.
 *
 * The book layout follows the package's own reader: `#livro` becomes a
 * page-flip book (two pages when they fit, hard covers, flipped by the
 * buttons, the keyboard, a click on the page corner or a link of the
 * contents). The scroll layout shows the pages one under the other. Both draw
 * from a clean copy of the book and set the classes its CSS expects:
 * `aberto`, `rolagem`, `na-capa` and `na-contracapa` on `#livro`.
 *
 * @param options - Where to draw, what to draw and who to tell about seen sections
 * @returns Layout state and navigation
 */
export const useEbookBook = ({
  contentRef,
  html,
  initialSection,
  onSectionsSeen,
  onPageChange,
}: UseEbookBookOptions): UseEbookBookReturn => {
  const template = useMemo(() => parseTemplate(html), [html]);
  const hasBookLayout = template.pages.length > 0;

  const [layout, setLayout] = useState<EbookLayout>(
    hasBookLayout ? 'book' : 'scroll'
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [spread, setSpread] = useState(false);
  /** Last section that came into view, for scroll-only materials */
  const [currentSection, setCurrentSection] = useState<string>();

  const managedRef = useRef<ManagedPageFlip | null>(null);
  const bookRef = useRef<HTMLElement | null>(null);
  const sizeRef = useRef<BookSize | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageIndexRef = useRef(0);
  const seenRef = useRef(new Set<string>());
  const onSectionsSeenRef = useRef(onSectionsSeen);
  onSectionsSeenRef.current = onSectionsSeen;
  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;
  /** Sections last reported as on screen, so a page is reported once per change. */
  const onScreenRef = useRef('');

  /**
   * The sections now on screen: reports the new page and the sections seen
   * for the first time.
   * @param sections - Sections on screen, the page being read first
   */
  const showSections = useCallback((sections: string[]) => {
    const onScreen = sections.join('\n');
    if (onScreen !== onScreenRef.current) {
      onScreenRef.current = onScreen;
      onPageChangeRef.current?.({ section: sections[0] ?? null, sections });
    }
    const fresh = sections.filter((section) => !seenRef.current.has(section));
    if (fresh.length === 0) return;
    fresh.forEach((section) => seenRef.current.add(section));
    onSectionsSeenRef.current?.(fresh);
  }, []);

  const teardown = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    managedRef.current?.destroy();
    managedRef.current = null;
    bookRef.current = null;
  }, []);

  const syncFromFlip = useCallback(
    (flip: PageFlip) => {
      if (managedRef.current?.flip !== flip) return;
      const index = flip.getCurrentPageIndex();
      const count = flip.getPageCount();
      const isSpread = String(flip.getOrientation()) === 'landscape';
      pageIndexRef.current = index;
      setPageIndex(index);
      setSpread(isSpread);
      bookRef.current?.classList.toggle('na-capa', isSpread && index === 0);
      bookRef.current?.classList.toggle(
        'na-contracapa',
        isSpread && index === count - 1
      );
      showSections(
        visiblePages(index, count, isSpread).flatMap((page) =>
          template.pages[page] ? sectionsOf(template.pages[page]) : []
        )
      );
    },
    [showSections, template]
  );

  const mountBook = useCallback(
    (startIndex: number) => {
      const content = contentRef.current;
      if (!content) return;
      teardown();
      const main = template.main.cloneNode(true) as HTMLElement;
      content.replaceChildren(main);
      const book = main.querySelector<HTMLElement>('#livro');
      if (!book) return;
      const size = availableSize(content, main);
      book.style.width = `${size.spread ? 2 * size.pageWidth : size.pageWidth}px`;
      book.style.height = `${size.pageHeight}px`;
      book.classList.add('aberto');
      bookRef.current = book;
      sizeRef.current = size;
      managedRef.current = createManagedPageFlip(
        book,
        Array.from(book.querySelectorAll<HTMLElement>(PAGE_SELECTOR)),
        {
          width: size.pageWidth,
          height: size.pageHeight,
          size: 'fixed' as SizeType,
          showCover: true,
          usePortrait: true,
          drawShadow: true,
          maxShadowOpacity: 0.45,
          flippingTime: prefersReducedMotion() ? 1 : FLIP_TIME_MS,
          mobileScrollSupport: false,
          swipeDistance: 30,
          showPageCorners: true,
          startPage: Math.max(0, startIndex),
          autoSize: false,
        },
        (flip) => {
          const sync = () => syncFromFlip(flip);
          flip.on('init', sync);
          flip.on('flip', sync);
          flip.on('changeOrientation', sync);
        }
      );
    },
    [contentRef, syncFromFlip, teardown, template]
  );

  const mountScroll = useCallback(
    (startIndex: number) => {
      const content = contentRef.current;
      if (!content) return;
      teardown();
      const main = template.main.cloneNode(true) as HTMLElement;
      content.replaceChildren(main);
      const book = main.querySelector<HTMLElement>('#livro');
      book?.classList.add('rolagem');
      book?.removeAttribute('style');
      const pages = book
        ? Array.from(book.querySelectorAll<HTMLElement>(PAGE_SELECTOR))
        : [];
      if (typeof IntersectionObserver === 'function') {
        // Book pages count as seen when 40% of them shows; the sections of a
        // scroll-only material (long chapters) as soon as they reach the
        // upper part of the screen.
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const index = entry.target.getAttribute('data-ix');
              if (index !== null) {
                pageIndexRef.current = Number(index);
                setPageIndex(Number(index));
                showSections(sectionsOf(entry.target));
                return;
              }
              const section = entry.target.getAttribute('data-secao');
              if (!section) return;
              setCurrentSection(section);
              showSections([section]);
            });
          },
          book
            ? { root: content, threshold: PAGE_SEEN_THRESHOLD }
            : { root: content, rootMargin: '0px 0px -40% 0px', threshold: 0 }
        );
        (book
          ? pages
          : Array.from(main.querySelectorAll('[data-secao]'))
        ).forEach((target) => observer.observe(target));
        observerRef.current = observer;
      }
      pages[startIndex]?.scrollIntoView({ block: 'start' });
    },
    [contentRef, showSections, teardown, template]
  );

  // A new book starts over: nothing seen, at the requested section.
  useLayoutEffect(() => {
    seenRef.current = new Set();
    onScreenRef.current = '';
    setCurrentSection(undefined);
    const start = initialSection ? pageIndexOf(template, initialSection) : 0;
    pageIndexRef.current = Math.max(0, start);
    setPageIndex(pageIndexRef.current);
    setLayout(template.pages.length > 0 ? 'book' : 'scroll');
    // initialSection only matters when the book changes, so it is not a dependency.
  }, [template]);

  useLayoutEffect(() => {
    if (layout === 'book' && hasBookLayout) mountBook(pageIndexRef.current);
    else mountScroll(pageIndexRef.current);
    return teardown;
  }, [hasBookLayout, layout, mountBook, mountScroll, teardown]);

  // The book is rebuilt for a new size, at the same page.
  useEffect(() => {
    const content = contentRef.current;
    if (layout !== 'book' || !content || typeof ResizeObserver !== 'function') {
      return undefined;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const rebuild = () => {
      // A page still turning has not reported its new page yet: rebuilding
      // now would snap the book back. Wait for it to land.
      const flip = managedRef.current?.flip;
      if (flip && String(flip.getState()) !== IDLE_FLIP_STATE) {
        timer = setTimeout(rebuild, RESIZE_DEBOUNCE_MS);
        return;
      }
      const main = content.querySelector('main');
      const current = sizeRef.current;
      if (!main || !current) return;
      const next = availableSize(content, main);
      if (
        next.spread === current.spread &&
        Math.abs(next.pageWidth - current.pageWidth) < RESIZE_TOLERANCE_PX
      ) {
        return;
      }
      mountBook(pageIndexRef.current);
    };
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(rebuild, RESIZE_DEBOUNCE_MS);
    });
    observer.observe(content);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [contentRef, layout, mountBook]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index < 0) return;
      const flip = managedRef.current?.flip;
      if (layout === 'book' && flip) {
        flip.flip(index, 'bottom' as FlipCorner);
        return;
      }
      contentRef.current
        ?.querySelector(`[data-ix="${index}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [contentRef, layout]
  );

  const goTo = useCallback(
    (target: string) => {
      if (hasBookLayout) {
        goToIndex(pageIndexOf(template, target));
        return;
      }
      contentRef.current
        ?.querySelector(
          `#${CSS.escape(target)}, [data-secao="${CSS.escape(target)}"]`
        )
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [contentRef, goToIndex, hasBookLayout, template]
  );

  const next = useCallback(() => {
    managedRef.current?.flip.flipNext('bottom' as FlipCorner);
  }, []);

  const previous = useCallback(() => {
    managedRef.current?.flip.flipPrev('bottom' as FlipCorner);
  }, []);

  const toggleLayout = useCallback(() => {
    if (!hasBookLayout) return;
    setLayout((current) => (current === 'book' ? 'scroll' : 'book'));
  }, [hasBookLayout]);

  // "Ver resposta" opens and closes its answer; links of the contents turn to their page.
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return undefined;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const answerButton = target?.closest?.<HTMLElement>('.ver-resposta');
      if (answerButton) {
        event.preventDefault();
        const isOpen = answerButton.getAttribute('aria-expanded') === 'true';
        const answer = answerButton.nextElementSibling as HTMLElement | null;
        if (answer) answer.hidden = isOpen;
        answerButton.setAttribute('aria-expanded', String(!isOpen));
        answerButton.textContent = isOpen
          ? (answerButton.dataset.ebookLabel ?? '')
          : HIDE_ANSWER_LABEL;
        return;
      }
      const link = target?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      if (link) {
        event.preventDefault();
        goTo(link.getAttribute('href')?.slice(1) ?? '');
      }
    };
    content.addEventListener('click', onClick);
    return () => content.removeEventListener('click', onClick);
  }, [contentRef, goTo]);

  // Arrow and page keys turn pages, unless the student is typing somewhere.
  useEffect(() => {
    if (layout !== 'book') return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as Element | null;
      if (
        target?.closest?.('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        previous();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [layout, next, previous]);

  const getVisiblePages = useCallback((): HTMLElement[] => {
    const content = contentRef.current;
    if (!content) return [];
    const flip = managedRef.current?.flip;
    if (layout === 'book' && flip) {
      return visiblePages(
        flip.getCurrentPageIndex(),
        flip.getPageCount(),
        String(flip.getOrientation()) === 'landscape'
      )
        .map((index) =>
          content.querySelector<HTMLElement>(`[data-ix="${index}"]`)
        )
        .filter((page): page is HTMLElement => !!page);
    }
    const current = content.querySelector<HTMLElement>(
      `[data-ix="${pageIndexRef.current}"]`
    );
    return current ? [current] : [];
  }, [contentRef, layout]);

  // The entry being read: the last one that starts at or before the current
  // page (the left one of a spread) or, in a scroll-only material, before the
  // section last seen.
  const activeTocTarget = useMemo(() => {
    const position = (target: string) =>
      hasBookLayout
        ? pageIndexOf(template, target)
        : template.sections.indexOf(target);
    const current = hasBookLayout
      ? pageIndex
      : template.sections.indexOf(currentSection ?? '');
    if (current < 0) return undefined;
    return template.toc
      .filter((entry) => {
        const index = position(entry.target);
        return index >= 0 && index <= current;
      })
      .at(-1)?.target;
  }, [currentSection, hasBookLayout, pageIndex, template]);

  return {
    layout,
    hasBookLayout,
    toc: template.toc,
    activeTocTarget,
    pageIndex,
    pageCount: template.pages.length,
    spread,
    next,
    previous,
    goTo,
    toggleLayout,
    getVisiblePages,
  };
};
