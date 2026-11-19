import type { REPORT_PERIOD } from '../../types/common';

/**
 * Contract of the ebook reading report (AE-3328, backend
 * `routes/accessReport/ebookReading`): every route is a POST under
 * `/access-report/ebook-reading`, scoped by the caller's profile.
 */

/**
 * The filters every route accepts: the period and school selection of the
 * other access reports, plus the book's segment and category.
 */
export interface EbookReadingFilters {
  period: REPORT_PERIOD;
  schoolGroupIds?: string[];
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
  allSchoolGroupsSelected?: boolean;
  allSchoolsSelected?: boolean;
  segments?: string[];
  categories?: string[];
}

/** API envelope: `{ message, data }`. */
export interface EbookReadingResponse<T> {
  message: string;
  data: T;
}

/**
 * The reading of a group of students in the period. `totalStudents` have at
 * least one book released to them; `readers` opened one. Rates and progress
 * are 0–100.
 */
export type EbookReadingMetrics = {
  totalStudents: number;
  readers: number;
  readerRate: number;
  accesses: number;
  effectiveReadings: number;
  totalTimeSeconds: number;
  averageTimeSeconds: number;
  averageProgress: number;
};

/**
 * The summary: the measures, and how many municipalities (city and state)
 * and schools the students counted are in.
 */
export type EbookReadingSummaryData = EbookReadingMetrics & {
  municipalities: number;
  schools: number;
};

/** Page of a table route. */
export interface EbookReadingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** One page of rows. */
export interface EbookReadingPage<T> {
  rows: T[];
  pagination: EbookReadingPagination;
}

/** Pagination and name search of the table routes. */
export interface EbookReadingTableParams {
  page: number;
  limit: number;
  search?: string;
}

/**
 * What the breakdown table lists: the students grouped by school, school
 * year or class, or the students themselves.
 */
export const EBOOK_READING_GROUP = {
  SCHOOL: 'school',
  SCHOOL_YEAR: 'schoolYear',
  CLASS: 'class',
  STUDENT: 'student',
} as const;

export type EbookReadingGroup =
  (typeof EBOOK_READING_GROUP)[keyof typeof EBOOK_READING_GROUP];

/**
 * A municipality, school, school year or class. `schoolYearName` is set only
 * on a class, `municipality` only on a school, `state` on a school and a
 * municipality. A municipality's `id` is `UF:Cidade`.
 */
export type EbookReadingGroupRow = EbookReadingMetrics & {
  id: string;
  name: string;
  schoolYearName: string | null;
  municipality: string | null;
  state: string | null;
};

/** What the most and least read rank. */
export const EBOOK_RANKING_DIMENSION = {
  EBOOK: 'EBOOK',
  CONTENT: 'CONTENT',
  CATEGORY: 'CATEGORY',
  SECTION: 'SECTION',
} as const;

export type EbookRankingDimension =
  (typeof EBOOK_RANKING_DIMENSION)[keyof typeof EBOOK_RANKING_DIMENSION];

/** The measure the ranking orders by. */
export const EBOOK_RANKING_METRIC = {
  TIME: 'TIME',
  READERS: 'READERS',
} as const;

export type EbookRankingMetric =
  (typeof EBOOK_RANKING_METRIC)[keyof typeof EBOOK_RANKING_METRIC];

/** A ranked book, subject, category or section. */
export interface EbookRankingItem {
  id: string;
  name: string;
  /** Set only for a section: the book it belongs to */
  ebookTitle: string | null;
  readers: number;
  totalTimeSeconds: number;
}

/** The most and least read. */
export interface EbookRankings {
  mostRead: EbookRankingItem[];
  leastRead: EbookRankingItem[];
}

/** A student, with where they are enrolled. */
export type EbookReadingStudentRow = {
  userInstitutionId: string;
  studentName: string;
  avatarUrl: string | null;
  schoolName: string;
  schoolYearName: string | null;
  className: string | null;
  ebooksOpened: number;
  accesses: number;
  effectiveReadings: number;
  totalTimeSeconds: number;
  averageProgress: number;
  lastReadAt: string | null;
};

/** A book a student opened in the period. */
export interface EbookReadingStudentBook {
  ebookId: string;
  code: string | null;
  title: string;
  coverUrl: string | null;
  category: string | null;
  /** 0–100 */
  percent: number;
  timeSpentSeconds: number;
  accesses: number;
  lastReadAt: string | null;
  /** When the book's reading rule was met, or `null` */
  effectiveReadAt: string | null;
  sectionsSeen: { sectionKey: string; title: string; seenAt: string | null }[];
}

/**
 * A book released to the student that they had not read to the end by the
 * end of the period, and did not open in it.
 */
export interface EbookReadingUnreadBook {
  ebookId: string;
  code: string | null;
  title: string;
  coverUrl: string | null;
  category: string | null;
}

/** One student's reading, book by book. */
export interface EbookReadingStudentDetail {
  userInstitutionId: string;
  studentName: string;
  avatarUrl: string | null;
  schoolName: string;
  className: string | null;
  schoolYearName: string | null;
  /** The books opened in the period */
  ebooks: EbookReadingStudentBook[];
  /** The books released and neither read nor opened */
  notRead: EbookReadingUnreadBook[];
}

/** Where a student is with a book. */
export const EBOOK_STUDENT_BOOK_STATUS = {
  /** The reading rule was met */
  READ: 'read',
  /** Pages seen, rule not met yet */
  READING: 'reading',
  /** Opened, nothing seen */
  OPENED: 'opened',
  /** Released, never read to the end, not opened in the period */
  NOT_READ: 'notRead',
} as const;

export type EbookStudentBookStatus =
  (typeof EBOOK_STUDENT_BOOK_STATUS)[keyof typeof EBOOK_STUDENT_BOOK_STATUS];

/** Reading tier of a group or a student, on the access report's bands. */
export const READING_TIER = {
  HIGHLIGHT: 'highlight',
  ABOVE_AVERAGE: 'aboveAverage',
  BELOW_AVERAGE: 'belowAverage',
  ATTENTION: 'attention',
  NONE: 'none',
} as const;

export type ReadingTier = (typeof READING_TIER)[keyof typeof READING_TIER];

/** The effective readings of one bucket of the period chart. */
export interface EbookReadingPeriod {
  /** Weekday, week or month, as the access charts bucket the period */
  label: string;
  effectiveReadings: number;
}

/** The period chart. */
export interface EbookReadingTimeline {
  periods: EbookReadingPeriod[];
}

/**
 * The students in each reading tier, by their average progress in the books
 * of the period.
 */
export interface EbookReadingDistribution {
  totalStudents: number;
  tiers: Record<ReadingTier, number>;
}

/**
 * Books counted once per student they reach: read to the end by the end of
 * the period, only opened in it, and not read. `readRate` is 0–100.
 */
export type EbookReadingBookCounts = {
  books: number;
  read: number;
  opened: number;
  notRead: number;
  readRate: number;
};

/** The book counts of a subject of the matrix. */
export type EbookReadingSubjectRow = EbookReadingBookCounts & {
  id: string;
  name: string;
  /** Name in the icon map of `IconRender` */
  icon: string;
  color: string;
  areaKnowledgeId: string;
  areaKnowledgeName: string;
};

/** "Dados por componente curricular": every book, and each subject's. */
export interface EbookReadingBySubject {
  total: EbookReadingBookCounts;
  rows: EbookReadingSubjectRow[];
}
