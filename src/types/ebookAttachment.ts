/**
 * Ebooks a teacher or manager attaches to an activity or a recommended class
 * (AE-3325), as the backend's staff library and drafts return them.
 */

/** Most ebooks one activity or recommended class may carry (backend limit). */
export const MAX_ATTACHED_EBOOKS = 20;

/**
 * A student book attached, or about to be attached, to an activity or a
 * recommended class: what the "Livro da aula" card shows. `segment` and
 * `schoolYears` may be missing on a draft saved before the backend sent them.
 */
export interface AttachableEbook {
  id: string;
  code: string | null;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  /** e.g. "Educação Financeira", beside the code */
  category: string | null;
  /** e.g. "Ensino Fundamental, Anos Iniciais" */
  segment?: string | null;
  /** e.g. ["4º ano"] */
  schoolYears?: string[];
}

/** One book of the staff library (`GET /ebooks/library`). */
export interface EbookLibraryItem extends AttachableEbook {
  authors: string[];
  theme: { code: string; name: string | null } | null;
  segment: string | null;
  schoolYears: string[];
}

/** How many books fall under each filter option. */
export interface EbookLibraryFacets {
  themes: { code: string; name: string | null; count: number }[];
  segments: { name: string; count: number }[];
}

/** One page of the staff library. */
export interface EbookLibraryPage {
  items: EbookLibraryItem[];
  total: number;
  page: number;
  limit: number;
  facets: EbookLibraryFacets;
}

/** Search and filters of the staff library. */
export interface EbookLibraryFilters {
  search: string;
  /** Edital theme code, or empty for every theme */
  theme: string;
  /** Segment ("Público"), or empty for every segment */
  segment: string;
}

/** A book opened in preview (`GET /ebooks/:id/preview`). */
export interface EbookPreviewData {
  id: string;
  materialType: 'STUDENT' | 'TEACHER';
  /** The teacher guide of a student book, and back */
  pairEbookId: string | null;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  details: {
    code: string | null;
    theme: string | null;
    audience: string[];
    schoolYears: string[];
    authors: string[];
    bncc: string[];
    words: number | null;
    readingMinutes: number | null;
  };
  version: {
    id: string;
    number: number;
    htmlUrl: string | null;
    cssUrl: string | null;
    narrationUrl: string | null;
    assetBaseUrl: string | null;
    fontsUrl: string | null;
  };
}

/** Where the books are being attached: it names the buttons. */
export type EbookAttachmentTarget = 'activity' | 'lesson';
