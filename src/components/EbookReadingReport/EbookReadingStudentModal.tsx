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
  type EbookStudentBookStatus,
} from './types';

/** Badge color of each status of a book. */
const STATUS_ACTION: Record<
  EbookStudentBookStatus,
  'success' | 'info' | 'warning'
> = {
  [EBOOK_STUDENT_BOOK_STATUS.READ]: 'success',
  [EBOOK_STUDENT_BOOK_STATUS.READING]: 'info',
  [EBOOK_STUDENT_BOOK_STATUS.OPENED]: 'warning',
};

/**
 * The student's totals: books read and opened, and the time.
 * @param {EbookReadingStudentBook[]} books - The books opened in the period
 * @returns {{ read: number; opened: number; seconds: number; progress: number }} The totals and the average progress
 */
export const studentTotals = (books: EbookReadingStudentBook[]) => {
  const read = books.filter(
    (book) => studentBookStatus(book) === EBOOK_STUDENT_BOOK_STATUS.READ
  ).length;
  const seconds = books.reduce((sum, book) => sum + book.timeSpentSeconds, 0);
  const progress = books.length
    ? books.reduce((sum, book) => sum + book.percent, 0) / books.length
    : 0;
  return { read, opened: books.length, seconds, progress };
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
 * A book of "Histórico completo": cover, code and theme, title, status and
 * progress.
 * @param {object} props - The props
 * @param {EbookReadingStudentBook} props.book - The book
 * @returns {JSX.Element} The row
 */
const StudentBookRow = ({
  book,
}: Readonly<{ book: EbookReadingStudentBook }>) => {
  const status = studentBookStatus(book);
  const kicker = [book.code, book.category].filter(Boolean).join(' • ');
  return (
    <li
      className="flex gap-3 rounded-xl border border-border-50 bg-background p-3"
      data-testid={`student-book-${book.ebookId}`}
    >
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt=""
          className="h-[72px] w-[48px] shrink-0 rounded object-cover"
        />
      ) : (
        <div className="flex h-[72px] w-[48px] shrink-0 items-center justify-center rounded bg-background-100 text-text-400">
          <BookOpenIcon size={20} aria-hidden="true" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
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
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ProgressBar value={book.percent} variant="blue" size="small" />
          </div>
          <Text as="span" size="xs" className="shrink-0 text-text-600">
            {formatPercent(book.percent)}
          </Text>
        </div>
        <Text as="span" size="xs" className="text-text-500">
          {`Última leitura: ${formatReadingDate(book.lastReadAt)} • ${formatTimeSpent(book.timeSpentSeconds)} • ${formatCount(book.sectionsSeen.length)} seções vistas`}
        </Text>
      </div>
    </li>
  );
};

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
 * opened with where they are in it.
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
    const totals = studentTotals(data.ebooks);
    const subtitle = [data.className, data.schoolYearName]
      .filter(Boolean)
      .join(' • ');
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ReadingFigure
              label="Livros lidos"
              value={formatCount(totals.read)}
            />
            <ReadingFigure
              label="Livros abertos"
              value={formatCount(totals.opened)}
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
          {data.ebooks.length ? (
            <ul className="flex flex-col gap-2">
              {data.ebooks.map((book) => (
                <StudentBookRow key={book.ebookId} book={book} />
              ))}
            </ul>
          ) : (
            <Text size="sm" className="text-text-600">
              O estudante não abriu nenhum livro no período.
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
