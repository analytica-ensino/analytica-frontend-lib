import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import { formatHoursMinutes } from '../EnemMoment/utils';
import { formatTimeSpent } from '../../utils/activityDetailsUtils';
import { MISSING_VALUE, formatCount } from '../../utils/reportFormat';
import { ReadingTierBadge } from './ReadingTierBadge';
import {
  GROUP_LABEL,
  formatPercent,
  formatReadingDate,
  readingTier,
} from './readingReport';
import {
  EBOOK_READING_GROUP,
  type EbookReadingGroup,
  type EbookReadingGroupRow,
  type EbookReadingStudentRow,
} from './types';

/**
 * A count cell.
 * @param {unknown} value - The count
 * @returns {string} The count, pt-BR
 */
const countCell = (value: unknown): string => formatCount(Number(value));

/**
 * "% de leitura": the share of students who read, as a bar and a number.
 * @param {number} readerRate - Readers over students, 0–100
 * @returns {JSX.Element} The cell
 */
const ReaderRateCell = ({ readerRate }: Readonly<{ readerRate: number }>) => (
  <div className="flex min-w-[120px] flex-col gap-1">
    <Text as="span" size="xs" weight="medium" className="text-text-950">
      {formatPercent(readerRate)}
    </Text>
    <ProgressBar value={readerRate} variant="blue" size="small" />
  </div>
);

/**
 * A text cell that may be empty: "—" then.
 * @param {unknown} value - The text, or `null`
 * @returns {string} The cell
 */
const textCell = (value: unknown): string =>
  (value as string | null) ?? MISSING_VALUE;

/**
 * Columns of the schools, school years or classes table. A school also
 * shows its municipality, and a class its school year; the tier and the bar
 * follow the share of readers.
 * @param {EbookReadingGroup} group - What the rows are
 * @returns {ColumnConfig<EbookReadingGroupRow>[]} The columns
 */
export const buildGroupColumns = (
  group: EbookReadingGroup
): ColumnConfig<EbookReadingGroupRow>[] => [
  { key: 'name', label: GROUP_LABEL[group].one },
  ...(group === EBOOK_READING_GROUP.SCHOOL
    ? [{ key: 'municipality', label: 'Município', render: textCell }]
    : []),
  ...(group === EBOOK_READING_GROUP.CLASS
    ? [
        {
          key: 'schoolYearName',
          label: 'Série',
          render: textCell,
        },
      ]
    : []),
  { key: 'totalStudents', label: 'Estudantes', render: countCell },
  { key: 'readers', label: 'Leitores', render: countCell },
  { key: 'effectiveReadings', label: 'Leituras realizadas', render: countCell },
  {
    key: 'totalTimeSeconds',
    label: 'Tempo total',
    render: (value: unknown) => formatHoursMinutes(Number(value)),
  },
  {
    key: 'averageProgress',
    label: 'Progresso médio',
    render: (value: unknown) => formatPercent(Number(value)),
  },
  {
    key: 'status',
    label: 'Status',
    render: (_value: unknown, row: EbookReadingGroupRow) => (
      <ReadingTierBadge tier={readingTier(row.readerRate)} />
    ),
  },
  {
    key: 'readerRate',
    label: '% de leitura',
    render: (_value: unknown, row: EbookReadingGroupRow) => (
      <ReaderRateCell readerRate={row.readerRate} />
    ),
  },
];

/**
 * Columns of the students, with where each one is enrolled. The tier follows
 * the student's average progress in the books they opened.
 */
export const STUDENT_COLUMNS: ColumnConfig<EbookReadingStudentRow>[] = [
  { key: 'studentName', label: 'Nome' },
  { key: 'schoolName', label: 'Escola' },
  { key: 'schoolYearName', label: 'Ano', render: textCell },
  { key: 'className', label: 'Turma', render: textCell },
  { key: 'ebooksOpened', label: 'Livros abertos', render: countCell },
  { key: 'effectiveReadings', label: 'Livros lidos', render: countCell },
  { key: 'accesses', label: 'Acessos', render: countCell },
  {
    key: 'totalTimeSeconds',
    label: 'Tempo total',
    render: (value: unknown) => formatTimeSpent(Number(value)),
  },
  {
    key: 'averageProgress',
    label: 'Progresso médio',
    render: (value: unknown) => formatPercent(Number(value)),
  },
  {
    key: 'lastReadAt',
    label: 'Última leitura',
    render: (value: unknown) => formatReadingDate(value as string | null),
  },
  {
    key: 'tier',
    label: 'Desempenho',
    render: (_value: unknown, row: EbookReadingStudentRow) => (
      <ReadingTierBadge tier={readingTier(row.averageProgress)} />
    ),
  },
];
