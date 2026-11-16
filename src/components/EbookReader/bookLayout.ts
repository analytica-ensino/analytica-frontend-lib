/** Book pages are portrait, 2:3. */
export const PAGE_RATIO = 1.5;

/** Shortest and tallest page, in pixels. */
export const PAGE_MIN_HEIGHT = 320;
export const PAGE_MAX_HEIGHT = 900;

/** Space kept around the book inside the reader, in pixels. */
export const BOOK_GUTTER = 32;

export interface BookSize {
  /** Width of one page, in pixels */
  pageWidth: number;
  /** Height of one page, in pixels */
  pageHeight: number;
  /** Two pages side by side (computer and landscape tablet) or one (phone) */
  spread: boolean;
}

/**
 * Size of the pages for the space the reader has: as tall as it fits, and two
 * pages side by side when both fit the width. Sizes round down, so the book
 * never overflows the space by a pixel.
 * @param width - Width available for the book, in pixels
 * @param height - Height available for the book, in pixels
 * @returns Page size and whether to show a spread
 */
export const measureBook = (width: number, height: number): BookSize => {
  const available = width - BOOK_GUTTER;
  const tallest = Math.max(PAGE_MIN_HEIGHT, Math.min(height, PAGE_MAX_HEIGHT));
  const pageWidth = Math.floor(tallest / PAGE_RATIO);
  if (available >= 2 * pageWidth) {
    return {
      pageWidth,
      pageHeight: Math.floor(pageWidth * PAGE_RATIO),
      spread: true,
    };
  }
  const narrow = Math.max(1, Math.min(available, pageWidth));
  return {
    pageWidth: narrow,
    pageHeight: Math.floor(narrow * PAGE_RATIO),
    spread: false,
  };
};

/**
 * Indexes of the pages on screen. A spread shows two pages, except for the
 * covers, which are shown alone.
 * @param index - Index of the current page (page-flip's `getCurrentPageIndex`)
 * @param count - Number of pages, covers included
 * @param spread - Two pages side by side
 */
export const visiblePages = (
  index: number,
  count: number,
  spread: boolean
): number[] => {
  const showsTwo =
    spread && index > 0 && index < count - 1 && index + 1 < count - 1;
  return showsTwo ? [index, index + 1] : [index];
};

/**
 * Counter shown between the arrows: "Capa", "1–2 de 24", "3 de 24",
 * "Contracapa". Covers are not counted.
 * @param index - Index of the current page
 * @param count - Number of pages, covers included
 * @param spread - Two pages side by side
 */
export const pageLabel = (
  index: number,
  count: number,
  spread: boolean
): string => {
  if (index === 0) return 'Capa';
  if (index === count - 1) return 'Contracapa';
  const inner = count - 2;
  const pages = visiblePages(index, count, spread);
  return pages.length === 2
    ? `${pages[0]}–${pages[1]} de ${inner}`
    : `${index} de ${inner}`;
};

/**
 * Reading progress for the bar under the controls, from the first to the
 * last page.
 * @param index - Index of the current page
 * @param count - Number of pages
 * @returns Percentage, 0–100
 */
export const readingProgress = (index: number, count: number): number =>
  count > 1 ? Math.round((100 * index) / (count - 1)) : 0;
