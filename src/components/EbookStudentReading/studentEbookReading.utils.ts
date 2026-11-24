import type {
  EbookStudentReading,
  StudentAttachedEbook,
  StudentEbookProgress,
} from '../../types/ebookAttachment';

/** Where a student is in an attached book. */
export const STUDENT_READING_STATUS = {
  /** The reading became effective (the book's completion rule) */
  FINISHED: 'finished',
  /** Opened, not effective yet */
  READING: 'reading',
  /** Never opened */
  NOT_STARTED: 'notStarted',
} as const;

export type StudentReadingStatus =
  (typeof STUDENT_READING_STATUS)[keyof typeof STUDENT_READING_STATUS];

/** The chip of each status: its text and the badge's colour. */
export const STUDENT_READING_STATUS_BADGE: Record<
  StudentReadingStatus,
  { label: string; action: 'success' | 'warning' | 'muted' }
> = {
  [STUDENT_READING_STATUS.FINISHED]: {
    label: 'Leitura finalizada',
    action: 'success',
  },
  [STUDENT_READING_STATUS.READING]: {
    label: 'Leitura em andamento',
    action: 'warning',
  },
  [STUDENT_READING_STATUS.NOT_STARTED]: {
    label: 'Leitura não iniciada',
    action: 'muted',
  },
};

/**
 * Where a student is in a book: finished once the reading is effective, in
 * progress once opened, not started before.
 *
 * @param progress - The student's progress, or null when never opened
 * @returns The status
 */
export const studentReadingStatus = (
  progress: EbookStudentReading['progress']
): StudentReadingStatus => {
  if (!progress) return STUDENT_READING_STATUS.NOT_STARTED;
  return progress.effectiveReadAt
    ? STUDENT_READING_STATUS.FINISHED
    : STUDENT_READING_STATUS.READING;
};

/**
 * The title of the section the student stopped at.
 *
 * @param reading - The student's reading
 * @returns The title, or null when the student never opened the book or the
 * section is no longer in the version
 */
export const stoppedAtTitle = (reading: EbookStudentReading): string | null => {
  const key = reading.progress?.lastSection;
  if (!key) return null;
  return reading.sections.find((entry) => entry.section === key)?.title ?? null;
};

/**
 * "1 de 6 capítulos" / "3 de 6 capítulos".
 *
 * @param seen - How many sections the student saw
 * @param total - How many sections the book has
 * @returns The label
 */
export const chaptersSeenLabel = (seen: number, total: number): string =>
  `${seen} de ${total} ${total === 1 ? 'capítulo' : 'capítulos'}`;

/**
 * The attached books with one student's reading, in the order the books were
 * attached. A book the student's row has no reading for counts as never
 * opened.
 *
 * @param ebooks - The books attached to the activity or the class
 * @param progress - The student's reading of each, by book
 * @returns The books with the student's reading
 */
export const withStudentProgress = (
  ebooks: readonly Omit<StudentAttachedEbook, 'percent' | 'effectiveReadAt'>[],
  progress: readonly StudentEbookProgress[] | undefined
): StudentAttachedEbook[] =>
  ebooks.map((ebook) => {
    const reading = progress?.find((entry) => entry.ebookId === ebook.id);
    return {
      ...ebook,
      percent: reading?.percent ?? 0,
      effectiveReadAt: reading?.effectiveReadAt ?? null,
    };
  });
