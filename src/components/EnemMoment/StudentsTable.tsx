import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Text from '../Text/Text';
import { UserIcon } from '../UserIcon/UserIcon';
import { cn } from '../../utils/utils';
import {
  TableProvider,
  type ColumnConfig,
  type TableComponents,
  type TableParams,
} from '../TableProvider/TableProvider';
import { RateCell } from '../QuestionsPerformanceCard';
import { SectionContent } from './SectionContent';
import { StudentsTableDownload } from './StudentsDownload';
import {
  ENEM_MOMENT_PERFORMANCE_LABELS,
  ENEM_MOMENT_PERFORMANCE_ORDER,
  EnemMomentPerformanceBadge,
  ParticipationBadge,
  type EnemMomentStudentParticipation,
} from './PerformanceBadge';
import type {
  EnemMomentFilterOptions,
  EnemMomentPagination,
  EnemMomentParticipationFilter,
  EnemMomentPerformance,
  EnemMomentStudentRow,
  EnemMomentStudentsExport,
  EnemMomentStudentsOrderBy,
  EnemMomentStudentsQuery,
} from './types';
import { classOptionLabel, listFilter, pickedValue } from './tableFilters';
import { formatClock, formatCount, formatScore, MISSING_VALUE } from './utils';

export function participationOf(
  row: EnemMomentStudentRow
): EnemMomentStudentParticipation {
  if (row.participatedExams === 0) return 'NOT_PARTICIPATED';
  return row.partialParticipation ? 'PARTIAL' : 'PARTICIPATED';
}

/**
 * The last column: whether the student took the exams (a school's page) or
 * the tier they scored in (the unit report), each with its filter.
 */
export type StudentStatusColumn = 'participation' | 'performance';

const PARTICIPATION_COLUMN: ColumnConfig<EnemMomentStudentRow> = {
  key: 'participatedExams',
  label: 'Participação',
  filter: {
    paramKey: 'participation',
    allLabel: 'Todos',
    options: [
      {
        value: 'PARTICIPATED',
        label: <ParticipationBadge participation="PARTICIPATED" />,
        searchText: 'Participou',
      },
      {
        value: 'NOT_PARTICIPATED',
        label: <ParticipationBadge participation="NOT_PARTICIPATED" />,
        searchText: 'Não participou',
      },
    ],
  },
  render: (_value, row) => (
    <ParticipationBadge participation={participationOf(row)} />
  ),
};

const PERFORMANCE_COLUMN: ColumnConfig<EnemMomentStudentRow> = {
  key: 'performance',
  label: 'Desempenho',
  filter: {
    paramKey: 'performances',
    multiple: true,
    allLabel: 'Todos',
    options: ENEM_MOMENT_PERFORMANCE_ORDER.map((performance) => ({
      value: performance,
      label: <EnemMomentPerformanceBadge performance={performance} />,
      searchText: ENEM_MOMENT_PERFORMANCE_LABELS[performance],
    })),
  },
  // Started, with no score yet: in no tier — the same "—" as the Nota column.
  render: (_value, row) =>
    row.performance === null ? (
      MISSING_VALUE
    ) : (
      <EnemMomentPerformanceBadge performance={row.performance} />
    ),
};

/** Whether the student took any exam of the cut — only then is there a modal. */
export const tookAnyExam = (row: EnemMomentStudentRow) =>
  row.participatedExams > 0;

/** An answer count — "—" for a student who took nothing, not a zero. */
const count = (row: EnemMomentStudentRow, value: number) =>
  row.participatedExams === 0 ? MISSING_VALUE : formatCount(value);

/**
 * The columns the API orders by, by the table's key — the name is `name`
 * there. Every column but Turma and the last one.
 */
const ORDER_BY: Readonly<Record<string, EnemMomentStudentsOrderBy>> = {
  studentName: 'name',
  totalElapsedSeconds: 'totalElapsedSeconds',
  correct: 'correct',
  incorrect: 'incorrect',
  blank: 'blank',
  hitRate: 'hitRate',
  averageScore: 'averageScore',
};

const PARTICIPATION_FILTERS: ReadonlySet<string> =
  new Set<EnemMomentParticipationFilter>(['PARTICIPATED', 'NOT_PARTICIPATED']);

/**
 * Columns of the table. The Turma filter offers the school's classes; until
 * they arrive there is nothing to offer, and it waits.
 */
export function createStudentColumns(
  classes: EnemMomentFilterOptions['classes'],
  statusColumn: StudentStatusColumn = 'participation'
): ColumnConfig<EnemMomentStudentRow>[] {
  return [
    {
      key: 'studentName',
      label: 'Nome',
      className: 'min-w-[220px] max-w-[320px]',
      render: (_value, row) => (
        <div className="flex items-center gap-2 min-w-0">
          <UserIcon size={24} className="shrink-0" />
          <Text size="sm" className="text-text-950 truncate">
            {row.studentName}
          </Text>
        </div>
      ),
    },
    {
      key: 'className',
      label: 'Turma',
      filter: listFilter(
        'classIds',
        'Todas as turmas',
        'Buscar turma...',
        classes.map((option) => ({
          value: option.classId,
          label: classOptionLabel(option),
        }))
      ),
      render: (_value, row) => row.className ?? MISSING_VALUE,
    },
    {
      key: 'totalElapsedSeconds',
      label: 'Tempo',
      render: (_value, row) => formatClock(row.totalElapsedSeconds),
    },
    {
      key: 'correct',
      label: 'Corretas',
      render: (_value, row) => count(row, row.correct),
    },
    {
      key: 'incorrect',
      label: 'Incorretas',
      render: (_value, row) => count(row, row.incorrect),
    },
    {
      key: 'blank',
      label: 'Em branco',
      render: (_value, row) => count(row, row.blank),
    },
    {
      key: 'hitRate',
      label: 'Taxa de acerto',
      className: 'min-w-[160px]',
      render: (_value, row) =>
        row.hitRate === null ? MISSING_VALUE : <RateCell rate={row.hitRate} />,
    },
    {
      key: 'averageScore',
      label: 'Nota',
      render: (_value, row) =>
        row.averageScore === null
          ? MISSING_VALUE
          : formatScore(row.averageScore),
    },
    statusColumn === 'performance' ? PERFORMANCE_COLUMN : PARTICIPATION_COLUMN,
  ];
}

/** The tiers picked in the Desempenho filter — none is every one. */
const pickedPerformances = (value: unknown) =>
  Array.isArray(value) && value.length > 0
    ? (value as EnemMomentPerformance[])
    : undefined;

/**
 * What the table asks the API for: its page, search, order and filters — the
 * app adds the cut and fetches.
 */
export type EnemMomentStudentsTableQuery = Pick<
  EnemMomentStudentsQuery,
  | 'page'
  | 'limit'
  | 'search'
  | 'classIds'
  | 'participation'
  | 'performances'
  | 'orderBy'
  | 'order'
>;

/** The table's params as the students list reads them. */
export function toStudentsTableQuery(
  params: TableParams
): EnemMomentStudentsTableQuery {
  const orderBy = params.sortBy ? ORDER_BY[params.sortBy] : undefined;
  const classId = pickedValue(params.classIds);
  const participation = pickedValue(params.participation);
  return {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    classIds: classId ? [classId] : undefined,
    participation:
      participation && PARTICIPATION_FILTERS.has(participation)
        ? (participation as EnemMomentParticipationFilter)
        : undefined,
    performances: pickedPerformances(params.performances),
    orderBy,
    order: orderBy ? params.sortOrder : undefined,
  };
}

/**
 * Whether the table has already finished one request. A remount (the app keys
 * the table on the cut) starts it over: the rows in memory are then another
 * cut's.
 */
function useHasSettled(loading: boolean): boolean {
  const wasLoadingRef = useRef(false);
  const [hasSettled, setHasSettled] = useState(false);

  useEffect(() => {
    if (wasLoadingRef.current && !loading) setHasSettled(true);
    wasLoadingRef.current = loading;
  }, [loading]);

  return hasSettled;
}

/**
 * "Desempenho por estudante": every student the exams were sent to — how they
 * did, or that they did not take it — paged, searched, ordered and filtered
 * by the API. A student who took the exam opens their modal; one who took
 * nothing has nothing to open.
 *
 * The app fetches: the table reports what it asks for through `onQueryChange`
 * and draws the rows it is handed. Key it on the cut, so a new tab or pick
 * starts it over from page 1. While a page loads the previous rows stay on
 * screen, dimmed: swapping them for a skeleton would collapse the page and
 * throw the scroll back to the top.
 *
 * With `loadExport` the header offers "Baixar tabela", left of the search:
 * the whole list of the caller's students, whatever the table is showing.
 */
export function StudentsTableSection({
  rows,
  pagination,
  loading,
  error,
  classes,
  onQueryChange,
  onStudentClick,
  statusColumn = 'participation',
  tableId = 'enemMomentStudents',
  loadExport,
}: Readonly<{
  rows: EnemMomentStudentRow[];
  pagination: EnemMomentPagination | null;
  loading: boolean;
  error: string | null;
  /** The Turma filter's options; empty while they load. */
  classes: EnemMomentFilterOptions['classes'];
  onQueryChange: (query: EnemMomentStudentsTableQuery) => void;
  onStudentClick?: (student: EnemMomentStudentRow) => void;
  /** The last column — Participação unless told otherwise. */
  statusColumn?: StudentStatusColumn;
  /** Namespaces the table's params in the URL. */
  tableId?: string;
  /** Fetches the whole list for "Baixar tabela"; without it, no button. */
  loadExport?: () => Promise<EnemMomentStudentsExport>;
}>) {
  const columns = useMemo(
    () => createStudentColumns(classes, statusColumn),
    [classes, statusColumn]
  );

  const hasSettled = useHasSettled(loading);
  const showSkeleton = loading && (!hasSettled || rows.length === 0);
  const isRefreshing = loading && !showSkeleton;

  const handleRowClick = useCallback(
    (row: EnemMomentStudentRow) => onStudentClick?.(row),
    [onStudentClick]
  );

  const handleParamsChange = useCallback(
    (params: TableParams) => onQueryChange(toStudentsTableQuery(params)),
    [onQueryChange]
  );

  const title = (
    <Text as="h3" size="lg" weight="bold" className="text-text-950">
      Desempenho por estudante
    </Text>
  );

  // The provider's own header has no room for an action by the search, so
  // the download brings its own row: title left, button and search right.
  const renderHeader = (components: TableComponents): ReactNode =>
    loadExport ? (
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {title}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <StudentsTableDownload loadExport={loadExport} />
          <div className="flex-1 lg:flex-none lg:w-[488px] print:hidden">
            {components.search}
          </div>
        </div>
      </div>
    ) : (
      components.controls
    );

  const renderLayout = (components: TableComponents): ReactNode => (
    <div className="bg-background border border-border-50 rounded-xl p-6 space-y-4">
      {renderHeader(components)}
      <div
        aria-busy={isRefreshing}
        className={cn(
          'transition-opacity',
          isRefreshing && 'opacity-50 pointer-events-none'
        )}
      >
        {components.table}
      </div>
      {components.pagination && (
        <div data-print-hide>{components.pagination}</div>
      )}
    </div>
  );

  return (
    <SectionContent loading={false} error={error} minHeight="min-h-[200px]">
      <TableProvider<EnemMomentStudentRow>
        tableId={tableId}
        data={rows}
        headers={columns}
        loading={showSkeleton}
        variant="borderless"
        enableSearch
        enableTableSort
        sortMode="server"
        sortableColumns={Object.keys(ORDER_BY)}
        defaultSort={{ sortBy: 'studentName', sortOrder: 'asc' }}
        enablePagination
        enableRowClick={Boolean(onStudentClick)}
        onRowClick={handleRowClick}
        rowKey="userInstitutionId"
        searchPlaceholder="Buscar"
        searchContainerClassName="print:hidden"
        headerContent={title}
        paginationConfig={{
          itemLabel: 'estudantes',
          itemsPerPageOptions: [10, 20, 50, 100],
          defaultItemsPerPage: 10,
          totalItems: pagination?.total ?? 0,
          totalPages: pagination?.totalPages ?? 0,
        }}
        onParamsChange={handleParamsChange}
        // A student who took nothing has nothing to open.
        isRowClickable={tookAnyExam}
        emptyState={{
          title: 'Nenhum estudante encontrado',
          description:
            'Não há estudantes para o recorte e os filtros aplicados. Ajuste a busca ou os filtros.',
        }}
      >
        {renderLayout}
      </TableProvider>
    </SectionContent>
  );
}
