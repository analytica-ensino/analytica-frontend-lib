import dayjs from 'dayjs';
import { MISSING_VALUE } from '../../utils/reportFormat';
import { REPORT_PERIOD } from '../../types/common';
import {
  EBOOK_READING_GROUP,
  EBOOK_STUDENT_BOOK_STATUS,
  READING_TIER,
  type EbookReadingGroup,
  type EbookReadingStudentBook,
  type EbookStudentBookStatus,
  type ReadingTier,
} from './types';

/** Routes of the ebook reading report. */
export const EBOOK_READING_ROUTE = {
  SUMMARY: '/access-report/ebook-reading/summary',
  BY_SCHOOL: '/access-report/ebook-reading/by-school',
  BY_SCHOOL_YEAR: '/access-report/ebook-reading/by-school-year',
  BY_CLASS: '/access-report/ebook-reading/by-class',
  RANKINGS: '/access-report/ebook-reading/rankings',
  BY_STUDENT: '/access-report/ebook-reading/by-student',
  STUDENT: '/access-report/ebook-reading/student',
} as const;

/** The table route of each grouping. */
export const GROUP_ROUTE: Record<EbookReadingGroup, string> = {
  [EBOOK_READING_GROUP.SCHOOL]: EBOOK_READING_ROUTE.BY_SCHOOL,
  [EBOOK_READING_GROUP.SCHOOL_YEAR]: EBOOK_READING_ROUTE.BY_SCHOOL_YEAR,
  [EBOOK_READING_GROUP.CLASS]: EBOOK_READING_ROUTE.BY_CLASS,
};

/** How each grouping is named on screen, singular and plural. */
export const GROUP_LABEL: Record<
  EbookReadingGroup,
  { one: string; many: string }
> = {
  [EBOOK_READING_GROUP.SCHOOL]: { one: 'Escola', many: 'escolas' },
  [EBOOK_READING_GROUP.SCHOOL_YEAR]: { one: 'Série', many: 'séries' },
  [EBOOK_READING_GROUP.CLASS]: { one: 'Turma', many: 'turmas' },
};

/** The period as the report titles say it: "Desempenho em 7 dias". */
export const PERIOD_LABEL: Record<REPORT_PERIOD, string> = {
  [REPORT_PERIOD.SEVEN_DAYS]: '7 dias',
  [REPORT_PERIOD.ONE_MONTH]: '1 mês',
  [REPORT_PERIOD.THREE_MONTHS]: '3 meses',
  [REPORT_PERIOD.SIX_MONTHS]: '6 meses',
  [REPORT_PERIOD.ONE_YEAR]: '1 ano',
};

/** Caption of each reading tier. */
export const READING_TIER_LABEL: Record<ReadingTier, string> = {
  [READING_TIER.HIGHLIGHT]: 'Destaque',
  [READING_TIER.ABOVE_AVERAGE]: 'Acima da média',
  [READING_TIER.BELOW_AVERAGE]: 'Abaixo da média',
  [READING_TIER.ATTENTION]: 'Ponto de atenção',
  [READING_TIER.NONE]: 'Sem leitura',
};

/**
 * Lowest percentage of each tier above "none". The cuts are the access map's
 * (ChoroplethMap): the reading report reuses its legend, so a different band
 * here would color the same figure two ways.
 */
const TIER_FLOORS: { tier: ReadingTier; min: number }[] = [
  { tier: READING_TIER.HIGHLIGHT, min: 75 },
  { tier: READING_TIER.ABOVE_AVERAGE, min: 50 },
  { tier: READING_TIER.BELOW_AVERAGE, min: 25 },
];

/**
 * The tier of a 0–100 percentage: any reading at all is at least "Ponto de
 * atenção"; none is "Sem leitura".
 * @param percent - Share read, 0–100
 * @returns The tier
 */
export const readingTier = (percent: number): ReadingTier => {
  if (!(percent > 0)) return READING_TIER.NONE;
  return (
    TIER_FLOORS.find(({ min }) => percent >= min)?.tier ??
    READING_TIER.ATTENTION
  );
};

/** Caption of each status of a student's book. */
export const STUDENT_BOOK_STATUS_LABEL: Record<EbookStudentBookStatus, string> =
  {
    [EBOOK_STUDENT_BOOK_STATUS.READ]: 'Lido',
    [EBOOK_STUDENT_BOOK_STATUS.READING]: 'Em leitura',
    [EBOOK_STUDENT_BOOK_STATUS.OPENED]: 'Aberto',
  };

/**
 * Where a student is with a book: read once its reading rule is met, being
 * read while pages are seen, otherwise only opened.
 * @param book - The student's book
 * @returns The status
 */
export const studentBookStatus = (
  book: Pick<EbookReadingStudentBook, 'effectiveReadAt' | 'percent'>
): EbookStudentBookStatus => {
  if (book.effectiveReadAt) return EBOOK_STUDENT_BOOK_STATUS.READ;
  if (book.percent > 0) return EBOOK_STUDENT_BOOK_STATUS.READING;
  return EBOOK_STUDENT_BOOK_STATUS.OPENED;
};

/**
 * A 0–100 percentage as the reports print it, one decimal at most: "60,2%".
 * @param percent - The percentage
 * @returns The text
 */
export const formatPercent = (percent: number): string =>
  `${percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

/**
 * A date of the report, day first: "18/11/2026", or "—" without one.
 * @param iso - ISO date, or `null`
 * @returns The text
 */
export const formatReadingDate = (iso: string | null): string =>
  iso ? dayjs(iso).format('DD/MM/YYYY') : MISSING_VALUE;
