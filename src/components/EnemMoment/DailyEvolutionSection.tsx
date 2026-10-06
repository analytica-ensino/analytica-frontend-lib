import { useId, useMemo, useState } from 'react';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import { Tooltip } from '../Tooltip/Tooltip';
import {
  YAxis,
  GridLines,
  calculateYAxisTicks,
} from '../shared/ChartComponents';
import { ChartDataTable } from '../shared/ChartDataTable';
import {
  TableProvider,
  type ColumnConfig,
  type TableParams,
} from '../TableProvider/TableProvider';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { CaretUpIcon } from '@phosphor-icons/react/dist/csr/CaretUp';
import { SectionContent } from './SectionContent';
import { COLLAPSED_DAY_ROWS, MOMENT_COLORS } from './constants';
import type {
  EnemMomentDailyEvolution,
  EnemMomentDay,
  EnemMomentMoment,
  EnemMomentSectionState,
} from './types';
import { formatCount, formatScore, MISSING_VALUE } from './utils';

const CHART_HEIGHT = 180;

/** `YYYY-MM-DD` → `DD/MM`. */
const shortDate = (date: string) => {
  const [, month, day] = date.slice(0, 10).split('-');
  return `${day}/${month}`;
};

const simulados = (count: number) =>
  `${formatCount(count)} ${count === 1 ? 'simulado' : 'simulados'}`;

/** A moment's color and name, and a fallback for an exam the tabs lack. */
function useMomentLookup(moments: EnemMomentMoment[]) {
  return useMemo(() => {
    const byExam = new Map(
      moments.map((moment, index) => [
        moment.examId,
        { ...moment, color: MOMENT_COLORS[index % MOMENT_COLORS.length] },
      ])
    );
    return (examId: string) =>
      byExam.get(examId) ?? {
        examId,
        label: 'Momento',
        color: MOMENT_COLORS[0],
      };
  }, [moments]);
}

/**
 * "Simulados realizados por dia": one bar per day with submissions, split in
 * the color of each moment submitted that day, with the total and each
 * moment's share above.
 */
function DailyChart({
  days,
  moments,
}: Readonly<{ days: EnemMomentDay[]; moments: EnemMomentMoment[] }>) {
  const momentOf = useMomentLookup(moments);
  const tableId = useId();

  const totalsByExam = new Map<string, number>();
  for (const day of days) {
    for (const exam of day.byExam) {
      totalsByExam.set(
        exam.examId,
        (totalsByExam.get(exam.examId) ?? 0) + exam.participations
      );
    }
  }
  const total = days.reduce((sum, day) => sum + day.participations, 0);
  // Only the moments of the cut: a Momento tab lists one.
  const legend = moments.filter((moment) => totalsByExam.has(moment.examId));

  const ticks = calculateYAxisTicks(
    Math.max(0, ...days.map((day) => day.participations))
  );
  const max = ticks[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Text as="h3" size="lg" weight="bold" className="text-text-950">
          Simulados realizados por dia
        </Text>
        <Badge
          variant="solid"
          action="info"
          size="small"
          className="self-start uppercase"
        >
          {`${simulados(total)} ${total === 1 ? 'total' : 'totais'}`}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {legend.map((moment) => (
          <div key={moment.examId} className="flex items-center gap-2">
            <Text
              as="span"
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: momentOf(moment.examId).color }}
              aria-hidden="true"
            />
            <Text size="sm" weight="medium" className="text-text-950">
              {moment.label}
            </Text>
            <Text size="sm" className="text-text-600">
              {simulados(totalsByExam.get(moment.examId) ?? 0)}
            </Text>
          </div>
        ))}
      </div>

      {/* As barras empilhadas são divs sem semântica: a área do gráfico vira
          uma imagem nomeada e descrita pela tabela sr-only com os dados. */}
      <div
        role="img"
        aria-label="Simulados realizados por dia"
        aria-describedby={tableId}
        className="flex flex-row min-w-0"
      >
        <YAxis ticks={ticks} chartHeight={CHART_HEIGHT} />
        <div className="flex-1 min-w-0 relative">
          <GridLines ticks={ticks} chartHeight={CHART_HEIGHT} />
          <div className="flex flex-row gap-1 sm:gap-2 relative z-10">
            {days.map((day) => (
              <div
                key={day.day}
                className="flex-1 min-w-0 flex flex-col items-center gap-2"
              >
                <div
                  data-testid={`day-bar-${day.day}`}
                  className="w-full max-w-8 flex flex-col-reverse rounded-md overflow-hidden"
                  style={{ height: CHART_HEIGHT }}
                >
                  {day.byExam
                    .filter((exam) => exam.participations > 0)
                    .map((exam) => {
                      const moment = momentOf(exam.examId);
                      const height =
                        max === 0
                          ? 0
                          : (exam.participations / max) * CHART_HEIGHT;
                      return (
                        <Tooltip
                          key={exam.examId}
                          content={`${moment.label} · ${simulados(exam.participations)}`}
                          position="top"
                          className="w-full flex"
                          // The bar box clips its content to keep the stacked
                          // segments inside one rounded rectangle, and a
                          // balloon rendered in place is clipped with them:
                          // what reached the screen was a sliver of text as
                          // wide as the bar. The portal takes it out of there.
                          usePortal
                        >
                          <div
                            data-testid={`day-bar-${day.day}-${exam.examId}`}
                            className="w-full"
                            style={{
                              height: `${height}px`,
                              backgroundColor: moment.color,
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                </div>
                <Text
                  size="2xs"
                  weight="medium"
                  className="w-full text-text-600 text-center leading-tight sm:text-xs"
                >
                  {`Dia ${shortDate(day.day)}`}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ChartDataTable
        id={tableId}
        caption="Dados do gráfico: Simulados realizados por dia"
        columns={['Dia', ...legend.map((moment) => moment.label), 'Total']}
        rows={days.map((day) => [
          shortDate(day.day),
          ...legend.map((moment) =>
            simulados(
              day.byExam.find((exam) => exam.examId === moment.examId)
                ?.participations ?? 0
            )
          ),
          simulados(day.participations),
        ])}
      />
    </div>
  );
}

type DayRow = {
  rowId: string;
  /** For sorting: the date, `YYYY-MM-DD`. */
  date: string;
  /** "Dia N · DD/MM" — what the search matches. */
  label: string;
  dayNumber: number;
  participations: number;
  accumulatedParticipations: number;
  accumulatedAverageScore: number | null;
};

const DAY_COLUMNS: ColumnConfig<DayRow>[] = [
  {
    key: 'date',
    label: 'Dia',
    sortable: true,
    className: 'min-w-[200px]',
    render: (_value, row) => (
      <Text size="sm" className="text-text-800">
        {`Dia ${row.dayNumber} · `}
        <Text as="span" size="sm" weight="bold" className="text-text-950">
          {shortDate(row.date)}
        </Text>
      </Text>
    ),
  },
  {
    key: 'participations',
    label: 'Provas realizadas',
    sortable: false,
    render: (_value, row) => formatCount(row.participations),
  },
  {
    key: 'accumulatedParticipations',
    label: 'Acumulado',
    sortable: false,
    render: (_value, row) => formatCount(row.accumulatedParticipations),
  },
  {
    key: 'accumulatedAverageScore',
    label: 'Nota média acumulada',
    sortable: false,
    render: (_value, row) =>
      row.accumulatedAverageScore === null
        ? MISSING_VALUE
        : formatScore(row.accumulatedAverageScore),
  },
];

/**
 * "Detalhes por dia": the days with submissions, searchable and sortable by date,
 * collapsed to the first rows behind "Mostrar todos os dias".
 *
 * "Dia N" counts the days of the cut in date order, so it does not change when
 * the table is sorted or searched.
 */
function DaysTable({ days }: Readonly<{ days: EnemMomentDay[] }>) {
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [expanded, setExpanded] = useState(false);

  const allRows = useMemo<DayRow[]>(
    () =>
      days.map((day, index) => ({
        rowId: day.day,
        date: day.day,
        label: `Dia ${index + 1} · ${shortDate(day.day)}`,
        dayNumber: index + 1,
        participations: day.participations,
        accumulatedParticipations: day.accumulatedParticipations,
        accumulatedAverageScore: day.accumulatedAverageScore,
      })),
    [days]
  );

  const rows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const matching = term
      ? allRows.filter((row) =>
          row.label.toLocaleLowerCase('pt-BR').includes(term)
        )
      : allRows;
    return order === 'asc' ? matching : [...matching].reverse();
  }, [allRows, search, order]);

  const visibleRows = expanded ? rows : rows.slice(0, COLLAPSED_DAY_ROWS);
  const hasMore = rows.length > COLLAPSED_DAY_ROWS;

  // Server mode: the table only reports search and sort, and they are applied
  // here to every day before the collapse cut — not to the rows on screen.
  const handleParamsChange = (params: TableParams) => {
    setSearch(params.search ?? '');
    setOrder(params.sortOrder === 'desc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <TableProvider<DayRow>
        tableId="enemMomentDays"
        data={visibleRows}
        headers={DAY_COLUMNS}
        rowKey="rowId"
        variant="borderless"
        enableSearch
        enableTableSort
        sortMode="server"
        defaultSort={{ sortBy: 'date', sortOrder: 'asc' }}
        onParamsChange={handleParamsChange}
        searchPlaceholder="Buscar"
        headerContent={
          <div className="flex flex-col gap-2">
            <Text as="h3" size="lg" weight="bold" className="text-text-950">
              Detalhes por dia
            </Text>
            <Badge
              variant="solid"
              action="info"
              size="small"
              className="self-start uppercase"
            >
              {`${allRows.length} ${allRows.length === 1 ? 'dia total' : 'dias totais'}`}
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
          {expanded ? 'Mostrar menos' : 'Mostrar todos os dias'}
          {expanded ? <CaretUpIcon size={18} /> : <CaretDownIcon size={18} />}
        </Button>
      )}
    </div>
  );
}

/**
 * "Evolução por dia": the exams submitted each day — as bars in the color of
 * their moment, then day by day in a table. Only the days with submissions:
 * the moments run weeks apart, and the days between them would be a row of
 * empty bars.
 */
export function DailyEvolutionSection({
  daily,
  moments,
}: Readonly<{
  daily: EnemMomentSectionState<EnemMomentDailyEvolution>;
  moments: EnemMomentMoment[];
}>) {
  // Date order, whatever order the API sends: the bars read left to right and
  // "Dia N" counts from the first day.
  const days = useMemo(
    () =>
      [...(daily.data?.days ?? [])].sort((a, b) => a.day.localeCompare(b.day)),
    [daily.data]
  );

  return (
    <section className="flex flex-col gap-4">
      <Text as="h2" size="xl" weight="bold" className="text-text-950">
        Evolução por dia
      </Text>
      <SectionContent
        loading={daily.loading}
        error={daily.error}
        minHeight="min-h-[480px]"
      >
        <div className="flex flex-col gap-6 p-5 bg-background border border-border-50 rounded-xl">
          {days.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Text size="sm" className="text-text-500">
                Ainda não há provas entregues neste recorte.
              </Text>
            </div>
          ) : (
            <>
              <DailyChart days={days} moments={moments} />
              <div className="border-t border-border-100" />
              <DaysTable days={days} />
            </>
          )}
        </div>
      </SectionContent>
    </section>
  );
}
