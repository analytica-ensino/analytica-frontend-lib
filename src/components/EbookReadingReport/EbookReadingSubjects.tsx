import { useMemo, useState } from 'react';
import { GridFourIcon } from '@phosphor-icons/react/dist/csr/GridFour';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import ProgressBar from '../ProgressBar/ProgressBar';
import IconRender from '../IconRender/IconRender';
import { MenuItem, MenuOverflow } from '../Menu/Menu';
import { SkeletonCard } from '../Skeleton/Skeleton';
import TableProvider, {
  type ColumnConfig,
  type TableParams,
} from '../TableProvider/TableProvider';
import { useTheme } from '../../hooks/useTheme';
import { formatCount } from '../../utils/reportFormat';
import { cn, getSubjectColorWithOpacity } from '../../utils/utils';
import { formatPercent } from './readingReport';
import type {
  EbookReadingBookCounts,
  EbookReadingBySubject,
  EbookReadingSubjectRow,
} from './types';

/** The tab of every subject. */
export const ALL_SUBJECTS = 'all';

/** Subjects the table shows before "Mostrar todos". */
export const SUBJECTS_PREVIEW_SIZE = 4;

/** A bar or a figure of "Dados de leitura". */
interface ReadingMeasure {
  key: keyof Omit<EbookReadingBookCounts, 'readRate'>;
  bar: string;
  figure: string;
  colorClass: string;
}

/** The measures, in the order of the bars. */
export const READING_MEASURES: ReadingMeasure[] = [
  {
    key: 'books',
    bar: 'Total',
    figure: 'Total de livros',
    colorClass: 'bg-info-600',
  },
  {
    key: 'read',
    bar: 'Lidos',
    figure: 'Livros lidos',
    colorClass: 'bg-success-300',
  },
  {
    key: 'opened',
    bar: 'Não finalizados',
    figure: 'Abertos',
    colorClass: 'bg-warning-400',
  },
  {
    key: 'notRead',
    bar: 'Não lidos',
    figure: 'Não lidos',
    colorClass: 'bg-background-300',
  },
];

/**
 * A part of the books as a share of all of them: "61% do total".
 * @param {number} part - Some of the books
 * @param {number} total - All of them
 * @returns {string} The text
 */
export const shareOfTotal = (part: number, total: number): string =>
  `${formatPercent(total > 0 ? Math.round((part / total) * 100) : 0)} do total`;

/**
 * The square with a subject's icon on its color; "Todos" has the grid.
 * @param {object} props - The props
 * @param {Pick<EbookReadingSubjectRow, 'icon' | 'color'> | null} props.subject - The subject, or `null` for every subject
 * @returns {JSX.Element} The icon
 */
const SubjectIcon = ({
  subject,
}: Readonly<{
  subject: Pick<EbookReadingSubjectRow, 'icon' | 'color'> | null;
}>) => {
  const { isDark } = useTheme();
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-sm text-text-950 [&>svg]:h-[17px] [&>svg]:w-[17px]',
        !subject && 'bg-border-200'
      )}
      style={
        subject
          ? {
              backgroundColor: getSubjectColorWithOpacity(
                subject.color,
                isDark
              ),
            }
          : undefined
      }
    >
      {subject ? (
        <IconRender iconName={subject.icon} size={17} color="currentColor" />
      ) : (
        <GridFourIcon size={17} weight="bold" />
      )}
    </span>
  );
};

/**
 * The bars of "Dados de leitura". Decorative: the figures beside them say
 * the same numbers.
 * @param {object} props - The props
 * @param {EbookReadingBookCounts} props.counts - What the bars measure
 * @returns {JSX.Element} The bars
 */
const ReadingBars = ({
  counts,
}: Readonly<{ counts: EbookReadingBookCounts }>) => {
  const max = Math.max(counts.books, 1);
  return (
    <div className="flex h-[200px] items-end gap-4" aria-hidden="true">
      {READING_MEASURES.map((measure) => (
        <div
          key={measure.key}
          className="flex h-full flex-1 flex-col items-center justify-end gap-2"
        >
          <div
            className={cn('w-full max-w-16 rounded-t-md', measure.colorClass)}
            style={{ height: `${(counts[measure.key] / max) * 100}%` }}
            data-testid={`reading-bar-${measure.key}`}
          />
          <Text as="span" size="xs" className="text-center text-text-600">
            {measure.bar}
          </Text>
        </div>
      ))}
    </div>
  );
};

/**
 * "Dados de leitura": the books of the tab, read, only opened and not read.
 * @param {object} props - The props
 * @param {EbookReadingBookCounts} props.counts - The tab's counts
 * @returns {JSX.Element} The card
 */
const ReadingData = ({
  counts,
}: Readonly<{ counts: EbookReadingBookCounts }>) => (
  <div className="flex flex-col gap-4 rounded-xl border border-border-50 bg-background p-5">
    <Text as="h3" size="lg" weight="bold" className="text-text-950">
      Dados de leitura
    </Text>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <ReadingBars counts={counts} />
      <dl className="grid grid-cols-2 content-center gap-6">
        {READING_MEASURES.map((measure) => (
          <div key={measure.key} className="flex flex-col gap-1">
            <dt className="flex items-center gap-2">
              <span
                className={cn('h-2 w-2 rounded-full', measure.colorClass)}
                aria-hidden="true"
              />
              <Text as="span" size="xs" className="text-text-600">
                {measure.figure}
              </Text>
            </dt>
            <dd className="flex flex-col">
              <Text
                as="span"
                size="2xl"
                weight="bold"
                className="text-primary-800"
              >
                {formatCount(counts[measure.key])}
              </Text>
              <Text as="span" size="xs" className="text-text-500">
                {shareOfTotal(counts[measure.key], counts.books)}
              </Text>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </div>
);

/** Columns of "Desempenho por componente curricular". */
export const SUBJECT_COLUMNS: ColumnConfig<EbookReadingSubjectRow>[] = [
  {
    key: 'name',
    label: 'Componente curricular',
    render: (_value: unknown, row: EbookReadingSubjectRow) => (
      <span className="flex items-center gap-2">
        <SubjectIcon subject={row} />
        {row.name}
      </span>
    ),
  },
  { key: 'areaKnowledgeName', label: 'Área do conhecimento' },
  {
    key: 'books',
    label: 'Total de livros',
    render: (value: unknown) => formatCount(Number(value)),
  },
  {
    key: 'read',
    label: 'Lidos',
    render: (value: unknown) => formatCount(Number(value)),
  },
  {
    key: 'opened',
    label: 'Abertos',
    render: (value: unknown) => formatCount(Number(value)),
  },
  {
    key: 'notRead',
    label: 'Não lidos',
    render: (value: unknown) => formatCount(Number(value)),
  },
  {
    key: 'readRate',
    label: 'Taxa de leitura',
    render: (_value: unknown, row: EbookReadingSubjectRow) => (
      <div className="flex min-w-[120px] flex-col gap-1">
        <Text as="span" size="xs" weight="medium" className="text-success-700">
          {formatPercent(row.readRate)}
        </Text>
        <ProgressBar value={row.readRate} variant="green" size="small" />
      </div>
    ),
  },
];

/**
 * The subjects whose name has the search, ignoring case and accents.
 * @param {EbookReadingSubjectRow[]} rows - Every subject
 * @param {string | undefined} search - What was typed
 * @returns {EbookReadingSubjectRow[]} The subjects found
 */
export const searchSubjects = (
  rows: EbookReadingSubjectRow[],
  search: string | undefined
): EbookReadingSubjectRow[] => {
  /** Lowercase, without accents. */
  const fold = (text: string) =>
    text
      .normalize('NFD')
      .replaceAll(/\p{Diacritic}/gu, '')
      .toLowerCase();
  const query = fold(search?.trim() ?? '');
  return query ? rows.filter((row) => fold(row.name).includes(query)) : rows;
};

export interface EbookReadingSubjectsProps {
  data: EbookReadingBySubject | null;
  loading: boolean;
}

/**
 * "Dados por componente curricular": a tab for every subject and one for
 * all of them, the tab's books read, only opened and not read, and the
 * table of the subjects.
 * @param {EbookReadingSubjectsProps} props - The counts and whether they load
 * @returns {JSX.Element} The section
 */
export const EbookReadingSubjects = ({
  data,
  loading,
}: Readonly<EbookReadingSubjectsProps>) => {
  const [subjectId, setSubjectId] = useState<string>(ALL_SUBJECTS);
  const [search, setSearch] = useState<string | undefined>();
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const found = useMemo(() => searchSubjects(rows, search), [rows, search]);
  // A tab whose subject left the answer falls back to every subject
  const selected = rows.find((row) => row.id === subjectId) ?? null;
  const counts = selected ?? data?.total;
  const shown = showAll ? found : found.slice(0, SUBJECTS_PREVIEW_SIZE);

  return (
    <section
      className="flex flex-col gap-4"
      aria-labelledby="ebook-reading-subjects-title"
    >
      <Text
        id="ebook-reading-subjects-title"
        as="h2"
        size="lg"
        weight="bold"
        className="text-text-950"
      >
        Dados por componente curricular
      </Text>
      {loading && !data ? (
        <SkeletonCard className="h-[320px]" />
      ) : (
        <>
          <MenuOverflow
            defaultValue={ALL_SUBJECTS}
            value={selected ? selected.id : ALL_SUBJECTS}
            className="max-w-full min-h-fit"
            semantics="tabs"
            aria-label="Componentes curriculares"
            onValueChange={setSubjectId}
          >
            {[null, ...rows].map((subject) => (
              <MenuItem
                key={subject?.id ?? ALL_SUBJECTS}
                variant="menu-overflow"
                value={subject?.id ?? ALL_SUBJECTS}
                className="whitespace-nowrap"
              >
                <SubjectIcon subject={subject} />
                <span className="whitespace-nowrap">
                  {subject?.name ?? 'Todos'}
                </span>
              </MenuItem>
            ))}
          </MenuOverflow>
          {counts && <ReadingData counts={counts} />}
          <div className="flex flex-col gap-4 rounded-xl border border-border-50 bg-background p-5">
            <div className="flex flex-col gap-1">
              <Text as="h3" size="lg" weight="bold" className="text-text-950">
                Desempenho por componente curricular
              </Text>
              <Badge
                variant="solid"
                action="info"
                size="small"
                className="w-fit uppercase"
              >
                {`${formatCount(rows.length)} ${rows.length === 1 ? 'componente curricular' : 'componentes curriculares'} no total`}
              </Badge>
            </div>
            <TableProvider<EbookReadingSubjectRow>
              tableId="ebookReadingSubjects"
              data={shown}
              headers={SUBJECT_COLUMNS}
              variant="borderless"
              enableSearch
              caption="Desempenho por componente curricular"
              rowKey="id"
              searchPlaceholder="Buscar componente curricular"
              emptyState={{ title: 'Nenhum livro de componente no período.' }}
              onParamsChange={(params: TableParams) => setSearch(params.search)}
            />
            {found.length > SUBJECTS_PREVIEW_SIZE && (
              <Button
                variant="outline"
                size="small"
                className="self-center"
                onClick={() => setShowAll((current) => !current)}
              >
                {showAll
                  ? 'Mostrar menos'
                  : `Mostrar todos os ${formatCount(found.length)} componentes curriculares`}
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
};
