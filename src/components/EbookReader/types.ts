/**
 * Data the ebook reader works with, as AE-3318 stores a processed version
 * (backend `docs/EBOOKS-FORMATO.md`).
 */

/**
 * Names of the package format the reader relies on (backend
 * `docs/EBOOKS-FORMATO.md`).
 */
export const EBOOK_FORMAT = {
  /** Each part of the book, by its stable id: contents, progress and resume go by it */
  SECTION_ATTRIBUTE: 'data-section',
  /** The element a narration clip reads, highlighted while it plays */
  SEGMENT_ATTRIBUTE: 'data-segment',
  /** The book layout: its `.page` children turn; without it the material scrolls */
  BOOK_ID: 'book',
  PAGE_CLASS: 'page',
  /** The stage the upload scopes the book's CSS to (`:root`, `html` and `body` included) */
  STAGE_CLASS: 'ebook-content',
} as const;

/**
 * Classes of the book the reader sets or acts on, which the format doc does
 * not name yet: they keep the names of the packages delivered so far.
 */
export const EBOOK_CLASS = {
  /** On `#book` once the book layout is built */
  OPEN: 'aberto',
  /** On `#book` in the scroll layout */
  SCROLL: 'rolagem',
  /** On `#book` while the cover, or the back cover, is alone on screen */
  ON_COVER: 'na-capa',
  ON_BACK_COVER: 'na-contracapa',
  /** On the element being narrated */
  READING: 'lendo',
  /** A "Ver resposta" button: it opens and closes the answer right after it */
  ANSWER_BUTTON: 'ver-resposta',
  /** The contents list of older packages, when no `<nav>` has links */
  OLD_CONTENTS: 'indice',
} as const;

/** One segment of the recorded narration, tied to an element by `data-segment`. */
export interface EbookNarrationSegment {
  /** `data-segment` of the element read in this segment; without it nothing is highlighted */
  segment?: string | null;
  /** Text of the segment, how older packages tied it to the page (not used by the reader) */
  key?: string | null;
  /** Start, in seconds from the start of the page */
  start: number;
  /** End, in seconds from the start of the page */
  end: number;
  /** Describes an image: skipped when audio description is off */
  ad?: boolean | null;
}

/** Narration of one page: where it sits in the mp3 and its segments. */
export interface EbookNarrationPage {
  /** `data-section` of the page */
  section: string;
  /** Path of the mp3 in the package; NARRATION_FILE when absent */
  file?: string | null;
  /** Start of the page, in seconds from the start of the mp3 */
  start: number;
  /** End of the page, in seconds from the start of the mp3 */
  end: number;
  /** Segments in reading order */
  segments: EbookNarrationSegment[];
}

/**
 * The package's narration map (`window.NARRATION`), as the upload stores it:
 * pages under any key (the reader goes by each page's `section`).
 */
export type EbookNarration = Record<string, EbookNarrationPage>;

/** The mp3 of a page that does not name one: the package's single narration file. */
export const NARRATION_FILE = 'audio/narration.mp3';

/** A processed ebook version, ready to display. */
export interface EbookContent {
  /** The book's `<main>`, as stored by the upload (sanitized again on display) */
  html: string;
  /** The book's CSS, already scoped to `.ebook-content` by the upload */
  css: string;
  /** Recorded narration, when the book has one */
  narration?: EbookNarration | null;
  /** Where the version's files live; package paths resolve against it */
  assetBaseUrl: string;
}

/** `student` records reading; `preview` (teacher, manager, backoffice) records nothing. */
export type EbookReaderMode = 'student' | 'preview';

/** The two materials of a title, with the backend's values. */
export const EBOOK_MATERIAL_TYPE = {
  /** The student book */
  STUDENT: 'STUDENT',
  /** The Guia do Professor */
  TEACHER: 'TEACHER',
} as const;

export type EbookMaterialType =
  (typeof EBOOK_MATERIAL_TYPE)[keyof typeof EBOOK_MATERIAL_TYPE];

/** What the "Ficha do material" panel shows. Rows without a value are left out. */
export interface EbookDetails {
  /** Code of the title (e.g. `EB40`) */
  code?: string;
  /** Theme of the call for proposals (e.g. `Educação 4.0 e 5.0`) */
  theme?: string;
  /** Who the book is for (e.g. `4º ano`) */
  audience?: string;
  authors?: string[];
  /** BNCC skill codes */
  bncc?: string[];
  /** Number of words */
  words?: number;
  /** Estimated reading time, in minutes */
  readingMinutes?: number;
}

/** The pages on screen, as the reader reports them on every change. */
export interface EbookPageChange {
  /** `data-section` of the page being read (the left one of a double page): where to resume */
  section: string | null;
  /** Every section on screen, the ones inside the pages included */
  sections: string[];
}
