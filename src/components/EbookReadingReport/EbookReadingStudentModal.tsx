import { BookOpenIcon } from '@phosphor-icons/react/dist/csr/BookOpen';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import ProgressBar from '../ProgressBar/ProgressBar';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { UserIcon } from '../UserIcon/UserIcon';
import { formatTimeSpent } from '../../utils/activityDetailsUtils';
import { formatCount } from '../../utils/reportFormat';
import { ReadingTierBadge } from './ReadingTierBadge';
import {
  STUDENT_BOOK_STATUS_LABEL,
  formatPercent,
  formatReadingDate,
  readingTier,
  studentBookStatus,
} from './readingReport';
import {
  EBOOK_STUDENT_BOOK_STATUS,
  type EbookReadingStudentBook,
  type EbookReadingStudentDetail,
  type EbookReadingUnreadBook,
  type EbookStudentBookStatus,
} from './types';

/** Badge color of each status of a book. */
const STATUS_ACTION: Record<
  EbookStudentBookStatus,
  'success' | 'info' | 'warning' | 'muted'
> = {
  [EBOOK_STUDENT_BOOK_STATUS.READ]: 'success',
  [EBOOK_STUDENT_BOOK_STATUS.READING]: 'info',
  [EBOOK_STUDENT_BOOK_STATUS.OPENED]: 'warning',
  [EBOOK_STUDENT_BOOK_STATUS.NOT_READ]: 'muted',
};

/** The student's totals in the period. */
export interface StudentTotals {
  /** Read to the end */
  read: number;
  /** Opened in the period and not read to the end */
  opened: number;
  /** Released, neither read nor opened */
  notRead: number;
  seconds: number;
  /** Average progress in the books opened, 0–100 */
  progress: number;
}

/**
 * The student's totals: books read, only opened and not read, and the time.
 * Read, opened and not read add up to the books, as in "Dados por
 * componente curricular".
 * @param {EbookReadingStudentBook[]} books - The books opened in the period
 * @param {EbookReadingUnreadBook[]} unread - The books released and not read
 * @returns {StudentTotals} The totals and the average progress
 */
export const studentTotals = (
  books: EbookReadingStudentBook[],
  unread: EbookReadingUnreadBook[] = []
): StudentTotals => {
  const read = books.filter(
    (book) => studentBookStatus(book) === EBOOK_STUDENT_BOOK_STATUS.READ
  ).length;
  const seconds = books.reduce((sum, book) => sum + book.timeSpentSeconds, 0);
  const progress = books.length
    ? books.reduce((sum, book) => sum + book.percent, 0) / books.length
    : 0;
  return {
    read,
    opened: books.length - read,
    notRead: unread.length,
    seconds,
    progress,
  };
};

/**
 * A figure of "Dados de leitura".
 * @param {object} props - The figure
 * @param {string} props.label - What it counts
 * @param {string} props.value - The value
 * @returns {JSX.Element} The figure
 */
const ReadingFigure = ({
  label,
  value,
}: Readonly<{ label: string; value: string }>) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-border-50 bg-background p-4">
    <Text
      as="span"
      weight="bold"
      className="text-center text-[8px] uppercase leading-[100%] text-text-600"
    >
      {label}
    </Text>
    <Text as="span" size="md" weight="bold" className="text-primary-800">
      {value}
    </Text>
  </div>
);

/**
 * A book's cover, or a placeholder without one.
 * @param {object} props - The props
 * @param {string | null} props.coverUrl - The cover
 * @returns {JSX.Element} The cover
 */
const BookCover = ({ coverUrl }: Readonly<{ coverUrl: string | null }>) =>
  coverUrl ? (
    <img
      src={coverUrl}
      alt=""
      className="h-[72px] w-[48px] shrink-0 rounded object-cover"
    />
  ) : (
    <div className="flex h-[72px] w-[48px] shrink-0 items-center justify-center rounded bg-background-100 text-text-400">
      <BookOpenIcon size={20} aria-hidden="true" />
    </div>
  );

/**
 * A book's code and theme, title and status.
 * @param {object} props - The props
 * @param {EbookReadingUnreadBook} props.book - The book
 * @param {EbookStudentBookStatus} props.status - Where the student is with it
 * @returns {JSX.Element} The heading
 */
const BookHeading = ({
  book,
  status,
}: Readonly<{
  book: EbookReadingUnreadBook;
  status: EbookStudentBookStatus;
}>) => {
  const kicker = [book.code, book.category].filter(Boolean).join(' • ');
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        {kicker && (
          <Text
            as="span"
            size="2xs"
            weight="medium"
            className="block truncate uppercase text-text-500"
          >
            {kicker}
          </Text>
        )}
        <Text
          as="span"
          size="md"
          weight="bold"
          className="block truncate text-text-950"
        >
          {book.title}
        </Text>
      </div>
      <Badge
        variant="solid"
        action={STATUS_ACTION[status]}
        size="small"
        className="shrink-0 uppercase"
      >
        {STUDENT_BOOK_STATUS_LABEL[status]}
      </Badge>
    </div>
  );
};

/**
 * A progress bar with its percentage.
 * @param {object} props - The props
 * @param {number} props.percent - 0–100
 * @returns {JSX.Element} The bar
 */
const BookProgress = ({ percent }: Readonly<{ percent: number }>) => (
  <div className="flex items-center gap-2">
    <div className="flex-1">
      <ProgressBar value={percent} variant="blue" size="small" />
    </div>
    <Text as="span" size="xs" className="shrink-0 text-text-600">
      {formatPercent(percent)}
    </Text>
  </div>
);

/**
 * A book opened in the period, in "Histórico completo": cover, code and
 * theme, title, status, progress and the last reading.
 * @param {object} props - The props
 * @param {EbookReadingStudentBook} props.book - The book
 * @returns {JSX.Element} The row
 */
const StudentBookRow = ({
  book,
}: Readonly<{ book: EbookReadingStudentBook }>) => (
  <li
    className="flex gap-3 rounded-xl border border-border-50 bg-background p-3"
    data-testid={`student-book-${book.ebookId}`}
  >
    <BookCover coverUrl={book.coverUrl} />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <BookHeading book={book} status={studentBookStatus(book)} />
      <BookProgress percent={book.percent} />
      <Text as="span" size="xs" className="text-text-500">
        {`Última leitura: ${formatReadingDate(book.lastReadAt)} • Tempo de leitura: ${formatTimeSpent(book.timeSpentSeconds)} • ${formatCount(book.sectionsSeen.length)} seções vistas`}
      </Text>
    </div>
  </li>
);

/**
 * A book released to the student and not read, in "Histórico completo".
 * @param {object} props - The props
 * @param {EbookReadingUnreadBook} props.book - The book
 * @returns {JSX.Element} The row
 */
const UnreadBookRow = ({
  book,
}: Readonly<{ book: EbookReadingUnreadBook }>) => (
  <li
    className="flex gap-3 rounded-xl border border-border-50 bg-background p-3"
    data-testid={`student-book-${book.ebookId}`}
  >
    <BookCover coverUrl={book.coverUrl} />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <BookHeading book={book} status={EBOOK_STUDENT_BOOK_STATUS.NOT_READ} />
      <BookProgress percent={0} />
    </div>
  </li>
);

export interface EbookReadingStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** "Desempenho em 7 dias" */
  title: string;
  data: EbookReadingStudentDetail | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  /**
   * The student's average progress as their row shows it, so the modal's
   * tier matches the table's. Without it, the books' own average.
   */
  averageProgress?: number;
}

/**
 * The reading of one student in the period: totals, then every book they
 * opened with where they are in it, and the books released they did not
 * read.
 * @param {EbookReadingStudentModalProps} props - The student and the modal's state
 * @returns {JSX.Element} The modal
 */
export const EbookReadingStudentModal = ({
  isOpen,
  onClose,
  title,
  data,
  loading,
  error,
  onRetry,
  averageProgress,
}: Readonly<EbookReadingStudentModalProps>) => {
  /** The modal's body for its current state. */
  const renderBody = () => {
    if (loading && !data) {
      return (
        <div
          className="flex flex-col gap-4"
          data-testid="student-modal-loading"
        >
          <SkeletonCard className="h-[56px]" />
          <SkeletonCard className="h-[88px]" />
          <SkeletonCard className="h-[200px]" />
        </div>
      );
    }
    if (error || !data) {
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <Text size="md" className="text-text-600">
            Não foi possível carregar a leitura do estudante.
          </Text>
          <Button variant="outline" size="small" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      );
    }
    const totals = studentTotals(data.ebooks, data.notRead);
    const subtitle = [data.schoolName, data.className, data.schoolYearName]
      .filter(Boolean)
      .join(' • ');
    const hasBooks = data.ebooks.length + data.notRead.length > 0;
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserIcon size={24} className="shrink-0" />
            <div>
              <Text size="md" weight="medium" className="text-text-950">
                {data.studentName}
              </Text>
              {subtitle && (
                <Text size="xs" className="text-text-500">
                  {subtitle}
                </Text>
              )}
            </div>
          </div>
          <ReadingTierBadge
            tier={readingTier(averageProgress ?? totals.progress)}
          />
        </div>
        <section className="flex flex-col gap-3" aria-label="Dados de leitura">
          <Text as="h3" size="md" weight="bold" className="text-text-950">
            Dados de leitura
          </Text>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <ReadingFigure
              label="Livros lidos"
              value={formatCount(totals.read)}
            />
            <ReadingFigure
              label="Livros abertos"
              value={formatCount(totals.opened)}
            />
            <ReadingFigure
              label="Livros não lidos"
              value={formatCount(totals.notRead)}
            />
            <ReadingFigure
              label="Tempo de leitura"
              value={formatTimeSpent(totals.seconds)}
            />
          </div>
        </section>
        <section
          className="flex flex-col gap-3"
          aria-label="Histórico completo"
        >
          <Text as="h3" size="md" weight="bold" className="text-text-950">
            Histórico completo
          </Text>
          {hasBooks ? (
            <ul className="flex flex-col gap-2">
              {data.ebooks.map((book) => (
                <StudentBookRow key={book.ebookId} book={book} />
              ))}
              {data.notRead.map((book) => (
                <UnreadBookRow key={book.ebookId} book={book} />
              ))}
            </ul>
          ) : (
            <Text size="sm" className="text-text-600">
              O estudante não tem livros no período.
            </Text>
          )}
        </section>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      contentClassName="max-h-[80vh] overflow-y-auto"
    >
      {renderBody()}
    </Modal>
  );
};
