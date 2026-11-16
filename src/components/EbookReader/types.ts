/**
 * Data the ebook reader works with, as AE-3318 stores a processed version
 * (backend `docs/EBOOKS-FORMATO.md`). The package's narration map
 * (`window.NARRACAO`) comes in Portuguese; the upload hands it over in these
 * English fields.
 */

/** One clip of the recorded narration, tied to an element by `data-trecho`. */
export interface EbookNarrationClip {
  /** `data-trecho` of the element read in this clip (the package's `trecho`) */
  id: string;
  /** Start, in seconds from the start of the page (`ini`) */
  start: number;
  /** End, in seconds from the start of the page (`fim`) */
  end: number;
  /** Describes an image: skipped when audio description is off (`ad`) */
  audioDescription?: boolean;
}

/** Narration of one page: where it sits in the mp3 and its clips. */
export interface EbookNarrationPage {
  /** `data-secao` of the page (`secao`) */
  section: string;
  /** Path of the mp3 inside the package, e.g. `audio/narracao.mp3` (`arquivo`) */
  file: string;
  /** Start of the page, in seconds from the start of the mp3 (`ini`) */
  start: number;
  /** End of the page, in seconds from the start of the mp3 (`fim`) */
  end: number;
  /** Clips in reading order (`trechos`) */
  clips: EbookNarrationClip[];
}

/** A processed ebook version, ready to display. */
export interface EbookContent {
  /** The book's `<main>`, as stored by the upload (sanitized again on display) */
  html: string;
  /** The book's CSS, already scoped to `.ebook-leitor` by the upload */
  css: string;
  /** Recorded narration, page by page, when the book has one */
  narration?: EbookNarrationPage[] | null;
  /** Where the package files live; relative `src` and audio paths resolve against it */
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
