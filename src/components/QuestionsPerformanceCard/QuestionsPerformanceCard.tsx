import { useMemo, useState, type ReactNode } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { CaretUpIcon } from '@phosphor-icons/react/dist/csr/CaretUp';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import ProgressBar from '../ProgressBar/ProgressBar';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { TableProvider } from '../TableProvider/TableProvider';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import { calculateYAxisTicks } from '../shared/ChartComponents';
import { cn } from '../../utils/utils';
import type { ActivitiesQuestionsData, SubtopicPerformanceItem } from './types';

/**
 * The four bars, in the order, colours and wording of the design: `label`
 * sits under the bar, `legendLabel` heads the card on the right.
 */
const BARS = [
  {
    key: 'total',
    label: 'Total',
    legendLabel: 'Total de questões respondidas',
    color: 'bg-info-600',
  },
  {
    key: 'corretas',
    label: 'Corretas',
    legendLabel: 'Questões corretas',
    color: 'bg-success-200',
  },
  {
    key: 'incorretas',
    label: 'Incorretas',
    legendLabel: 'Questões incorretas',
    color: 'bg-warning-400',
  },
  {
    key: 'emBranco',
    label: 'Em branco',
    legendLabel: 'Questões em branco',
    color: 'bg-background-200',
  },
] as const;

type BarKey = (typeof BARS)[number]['key'];

/** What each of the four bars counts. */
export type QuestionsBarsValues = Record<BarKey, number>;

const CHART_HEIGHT = 235;

/** Sentinel of the tema select meaning "every tema of the subject". */
const ALL_TOPICS = 'all';

/** Subtemas shown before "Mostrar todos". */
const COLLAPSED_ROWS = 4;

/**
 * Share of `value` in `total`, as the whole percentage the cards print.
 * A total of zero reads as 0% rather than NaN.
 */
function shareOfTotal(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

/** Hit rate as the table prints it: one decimal, pt-BR. */
function formatRate(value: number): string {
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

/** One legend card: coloured dot and label, the count, its share of the total. */
function LegendCard({
  color,
  label,
  value,
  percentage,
}: {
  readonly color: string;
  readonly label: string;
  readonly value: number;
  readonly percentage: number;
}) {
  return (
    <div className="flex flex-col justify-center gap-1 rounded-xl px-6 py-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cn('size-2 shrink-0 rounded-full', color)}
        />
        <Text size="sm" weight="medium" className="text-text-600">
          {label}
        </Text>
      </div>
      <Text size="4xl" weight="bold" className="text-info-700">
        {value.toLocaleString('pt-BR')}
      </Text>
      <Text size="xs" weight="medium" className="text-text-800">
        {`${percentage}% do total`}
      </Text>
    </div>
  );
}

export interface QuestionsBarsProps {
  readonly values: QuestionsBarsValues;
  /**
   * Shown under the legend cards — the "Nota média" of a report that has one
   * (the Momento ENEM report of the gestor app).
   */
  readonly aside?: ReactNode;
}

/**
 * The bars with their axes, plus the four legend cards on the right.
 *
 * Exported for the reports that pair the same chart with a select and a
 * table of their own, not a subject's subtemas.
 */
export function QuestionsBars({ values, aside }: QuestionsBarsProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const ticks = calculateYAxisTicks(values.total);
  const chartMax = ticks[0];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
      {/* Chart */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-row">
          {/* Y axis */}
          <div
            className="flex w-12 shrink-0 flex-col items-end justify-between pr-2"
            style={{ height: CHART_HEIGHT }}
          >
            {ticks.map((tick) => (
              <Text key={tick} size="md" className="text-text-700">
                {tick}
              </Text>
            ))}
          </div>

          <div className="relative flex-1">
            {/* Grid lines */}
            <div
              className="pointer-events-none absolute inset-0 flex flex-col justify-between"
              style={{ height: CHART_HEIGHT }}
            >
              {ticks.map((tick) => (
                <div
                  key={tick}
                  className="border-t border-dashed border-border-400"
                />
              ))}
            </div>

            <div
              className="relative z-10 flex flex-row items-end gap-4"
              style={{ height: CHART_HEIGHT }}
            >
              {BARS.map((bar) => {
                const value = values[bar.key];
                const isHovered = hoveredKey === bar.key;
                const anyHovered = hoveredKey !== null;
                const height =
                  chartMax === 0 ? 0 : (value / chartMax) * CHART_HEIGHT;

                return (
                  <div
                    key={bar.key}
                    className="relative flex h-full flex-1 flex-col items-center justify-end"
                    onMouseEnter={() => setHoveredKey(bar.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                  >
                    {isHovered && value > 0 && (
                      <div
                        role="tooltip"
                        className="absolute z-10 whitespace-nowrap rounded bg-text-950 px-2 py-1 text-xs text-white shadow-lg"
                        style={{ bottom: `${height + 8}px` }}
                      >
                        {value.toLocaleString('pt-BR')}
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-text-950" />
                      </div>
                    )}
                    <div
                      data-testid={`questions-bar-${bar.key}`}
                      className={cn(
                        'w-full max-w-20 cursor-pointer rounded transition-all duration-300',
                        bar.color
                      )}
                      style={{
                        height: `${height}px`,
                        minHeight: value > 0 ? '4px' : '0',
                        opacity: !anyHovered || isHovered ? 1 : 0.5,
                      }}
                      aria-label={`${bar.label}: ${value}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X axis labels, aligned to the bars (ml-12 matches the Y axis width) */}
        <div className="ml-12 flex flex-row gap-4">
          {BARS.map((bar) => (
            <div key={bar.key} className="flex flex-1 justify-center">
              <Text size="md" className="text-text-700">
                {bar.label}
              </Text>
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="hidden w-px bg-border-200 lg:block" />

      {/* Legend cards, and whatever the caller adds under them */}
      <div className="flex flex-1 flex-col justify-center gap-2">
        <div
          data-testid="questions-legend"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {BARS.map((bar) => (
            <LegendCard
              key={bar.key}
              color={bar.color}
              label={bar.legendLabel}
              value={values[bar.key]}
              percentage={shareOfTotal(values[bar.key], values.total)}
            />
          ))}
        </div>
        {aside}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subtemas (one subject selected)
// ---------------------------------------------------------------------------

/** Row shape of the subtema table; `rowId` is what `rowKey` addresses. */
interface SubtopicRow {
  rowId: string;
  name: string;
  total: number;
  correct: number;
  incorrect: number;
  blank: number;
  rate: number;
  /** Index signature for TableProvider compatibility */
  [key: string]: unknown;
}

type SubtopicSortKey = 'name' | 'correct' | 'incorrect' | 'blank' | 'rate';

/**
 * Taxa de acerto cell: the rate (0–100) over a green bar. Exported for the
 * other tables that print a rate the same way.
 */
export function RateCell({ rate }: { readonly rate: number }) {
  return (
    <div className="flex w-32 flex-col gap-1">
      <Text size="xs" weight="bold" className="text-success-500">
        {formatRate(rate)}
      </Text>
      <ProgressBar value={rate} variant="green" size="small" />
    </div>
  );
}

const SUBTOPIC_COLUMNS: ColumnConfig<SubtopicRow>[] = [
  {
    key: 'name',
    label: 'Subtema',
    sortable: true,
    className: 'min-w-[240px]',
  },
  { key: 'total', label: 'Total', sortable: false },
  { key: 'correct', label: 'Corretas', sortable: true },
  { key: 'incorrect', label: 'Incorretas', sortable: true },
  { key: 'blank', label: 'Em branco', sortable: true },
  {
    key: 'rate',
    label: 'Taxa de acerto',
    sortable: true,
    render: (_value: unknown, row: SubtopicRow) => <RateCell rate={row.rate} />,
  },
];

/**
 * Map a subtema onto a table row.
 *
 * Every number arrives ready: the endpoint counts the blanks by answer status
 * and computes the rate over the total, so nothing is derived here.
 */
function toSubtopicRow(subtopic: SubtopicPerformanceItem): SubtopicRow {
  return {
    rowId: subtopic.subtopicId,
    name: subtopic.subtopicName,
    total: subtopic.total,
    correct: subtopic.correct,
    incorrect: subtopic.incorrect,
    blank: subtopic.blank,
    rate: subtopic.correctPercentage,
  };
}

/** Sort rows by one column, names in pt-BR order. */
function sortRows(
  rows: SubtopicRow[],
  key: SubtopicSortKey,
  order: 'asc' | 'desc'
): SubtopicRow[] {
  const direction = order === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const result =
      key === 'name'
        ? a.name.localeCompare(b.name, 'pt-BR')
        : Number(a[key]) - Number(b[key]);
    return result * direction;
  });
}

/**
 * "Desempenho por subtema": the subtemas of the selected subject (and tema),
 * searchable and sortable, collapsed to four rows behind "Mostrar todos".
 */
function SubtopicsTable({
  subtopics,
  loading,
  error,
}: {
  readonly subtopics: SubtopicPerformanceItem[];
  readonly loading: boolean;
  readonly error: string | null;
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{
    key: SubtopicSortKey;
    order: 'asc' | 'desc';
  }>({ key: 'rate', order: 'asc' });
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const matching = subtopics
      .map(toSubtopicRow)
      .filter(
        (row) => !term || row.name.toLocaleLowerCase('pt-BR').includes(term)
      );
    return sortRows(matching, sort.key, sort.order);
  }, [subtopics, search, sort]);

  const visibleRows = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);
  const hasMore = rows.length > COLLAPSED_ROWS;

  // Search and sort arrive through the table params; sorting is done here
  // (server mode) so it applies to the whole list before the collapse cut,
  // not only to the four rows on screen.
  const handleParamsChange = (params: Record<string, unknown>) => {
    setSearch((params.search as string) ?? '');
    const sortBy = params.sortBy as SubtopicSortKey | undefined;
    if (sortBy) {
      setSort({
        key: sortBy,
        order: (params.sortOrder as 'asc' | 'desc') ?? 'asc',
      });
    }
  };

  if (loading) {
    return <SkeletonCard className="min-h-[240px]" />;
  }

  if (error) {
    return (
      <Text size="sm" className="text-text-500">
        {error}
      </Text>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <TableProvider<SubtopicRow>
        data={visibleRows}
        headers={SUBTOPIC_COLUMNS}
        rowKey="rowId"
        enableSearch
        enableTableSort
        sortMode="server"
        onParamsChange={handleParamsChange}
        searchPlaceholder="Buscar subtema"
        headerContent={
          <div className="flex flex-col gap-2">
            <Text as="h4" size="lg" weight="bold" className="text-text-950">
              Desempenho por subtema
            </Text>
            <Badge
              variant="solid"
              action="info"
              size="small"
              className="self-start uppercase"
            >
              {`${subtopics.length} subtemas totais`}
            </Badge>
          </div>
        }
      />
      {hasMore && (
        <Button
          variant="outline"
          action="primary"
          size="medium"
          onClick={() => setExpanded((previous) => !previous)}
        >
          {expanded
            ? 'Mostrar menos'
            : `Mostrar todos os ${rows.length} subtemas`}
          {expanded ? <CaretUpIcon size={18} /> : <CaretDownIcon size={18} />}
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

/**
 * "Dados gerais de questões" — the bars on the left, a divider, and one card
 * per bar on the right with the count and its share of the total.
 *
 * With one componente curricular selected the card grows: a tema select joins
 * the title, and the subject's subtemas are listed below the chart. Picking a
 * tema narrows both the table and the bars, which are then summed from the
 * subtemas of that tema (the questions endpoint has no tema cut).
 *
 * Written apart from `QuestionsData` because that card shows the number
 * nowhere: switching componente curricular between two subjects with 15 and 14
 * correct answers moved one bar by ten pixels and nothing else, which read as a
 * frozen screen. The hover tooltip follows `VerticalBarChart` so the two charts
 * of the report behave alike.
 */
export interface QuestionsPerformanceCardProps {
  readonly data: ActivitiesQuestionsData;
  /** Subtemas of the selected subject; null while "Todos" is selected. */
  readonly subtopics?: SubtopicPerformanceItem[] | null;
  readonly subtopicsLoading?: boolean;
  readonly subtopicsError?: string | null;
  /**
   * Card heading. Left out, it follows the cut on screen: "Dados gerais de
   * questões" for the whole report, "Dados de questões" once a componente
   * curricular narrows it — the numbers stop being the report's totals and
   * become that subject's.
   */
  readonly title?: string;
}

export function QuestionsPerformanceCard({
  data,
  subtopics = null,
  subtopicsLoading = false,
  subtopicsError = null,
  title,
}: QuestionsPerformanceCardProps) {
  const [topicId, setTopicId] = useState(ALL_TOPICS);

  const subjectSelected = subtopics !== null;

  const cardTitle =
    title ??
    (subjectSelected ? 'Dados de questões' : 'Dados gerais de questões');

  const topics = useMemo(() => {
    const byId = new Map<string, string>();
    for (const subtopic of subtopics ?? []) {
      byId.set(subtopic.topic.id, subtopic.topic.name);
    }
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [subtopics]);

  // A tema that vanished with a new subject falls back to "all" on read.
  const activeTopicId = topics.some((topic) => topic.id === topicId)
    ? topicId
    : ALL_TOPICS;

  const filteredSubtopics = useMemo(
    () =>
      activeTopicId === ALL_TOPICS
        ? (subtopics ?? [])
        : (subtopics ?? []).filter(
            (subtopic) => subtopic.topic.id === activeTopicId
          ),
    [subtopics, activeTopicId]
  );

  const values = useMemo<QuestionsBarsValues>(() => {
    if (activeTopicId === ALL_TOPICS) {
      return {
        total: data.totalAnswered,
        corretas: data.correctAnswers,
        incorretas: data.incorrectAnswers,
        emBranco: data.blankAnswers,
      };
    }
    const rows = filteredSubtopics.map(toSubtopicRow);
    const sum = (pick: (row: SubtopicRow) => number) =>
      rows.reduce((acc, row) => acc + pick(row), 0);
    return {
      total: sum((row) => row.total),
      corretas: sum((row) => row.correct),
      incorretas: sum((row) => row.incorrect),
      emBranco: sum((row) => row.blank),
    };
  }, [data, filteredSubtopics, activeTopicId]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-50 bg-background p-5">
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        <Text as="h3" size="lg" weight="bold" className="text-text-950">
          {cardTitle}
        </Text>
        {subjectSelected && topics.length > 0 && (
          <Select
            value={activeTopicId}
            onValueChange={setTopicId}
            className="w-[380px] max-w-full"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os temas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TOPICS}>Todos os temas</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <QuestionsBars values={values} />

      {subjectSelected && (
        <>
          <div aria-hidden="true" className="h-px w-full bg-border-200" />
          <SubtopicsTable
            subtopics={filteredSubtopics}
            loading={subtopicsLoading}
            error={subtopicsError}
          />
        </>
      )}
    </div>
  );
}
