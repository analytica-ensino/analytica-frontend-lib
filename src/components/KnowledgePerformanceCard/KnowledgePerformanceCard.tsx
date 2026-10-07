import { useMemo, useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { CaretUpIcon } from '@phosphor-icons/react/dist/csr/CaretUp';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import Select, {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Select/Select';
import {
  QuestionsBars,
  RateCell,
  type QuestionsBarsValues,
} from '../QuestionsPerformanceCard';
import { StatCard } from '../StatisticsCard/StatisticsCard';
import {
  TableProvider,
  type ColumnConfig,
  type TableParams,
} from '../TableProvider/TableProvider';
import { renderSubjectsCell } from '../../utils/renderSubjectCell';
import {
  formatCount,
  formatReportScore,
  MISSING_VALUE,
} from '../../utils/reportFormat';
import type { KnowledgePerformanceData, KnowledgeSubjectRow } from './types';

/** Value of the select meaning every área. */
const ALL_AREAS = 'all';

/** Componentes shown before "Mostrar todos". */
const COLLAPSED_SUBJECT_ROWS = 4;

type SubjectRow = {
  rowId: string;
  name: string;
  /** What `renderSubjectsCell` draws: the chip and the name. */
  subject: Array<{ id: string; name: string; color: string; icon: string }>;
  areaName: string;
  total: number;
  correct: number;
  incorrect: number;
  blank: number;
  /** `null` when nobody answered its questions. */
  rate: number | null;
};

type SubjectSortKey =
  | 'name'
  | 'areaName'
  | 'correct'
  | 'incorrect'
  | 'blank'
  | 'rate';

const SORT_KEYS: ReadonlySet<string> = new Set<SubjectSortKey>([
  'name',
  'areaName',
  'correct',
  'incorrect',
  'blank',
  'rate',
]);

const SUBJECT_COLUMNS: ColumnConfig<SubjectRow>[] = [
  {
    key: 'name',
    label: 'Componente curricular',
    sortable: true,
    className: 'min-w-[200px]',
    render: (_value, row) => renderSubjectsCell(row.subject),
  },
  {
    key: 'areaName',
    label: 'Área do conhecimento',
    sortable: true,
    className: 'min-w-[240px]',
  },
  {
    key: 'total',
    label: 'Total',
    sortable: false,
    render: (_value, row) => formatCount(row.total),
  },
  {
    key: 'correct',
    label: 'Corretas',
    sortable: true,
    render: (_value, row) => formatCount(row.correct),
  },
  {
    key: 'incorrect',
    label: 'Incorretas',
    sortable: true,
    render: (_value, row) => formatCount(row.incorrect),
  },
  {
    key: 'blank',
    label: 'Em branco',
    sortable: true,
    render: (_value, row) => formatCount(row.blank),
  },
  {
    key: 'rate',
    label: 'Taxa de acerto',
    sortable: true,
    render: (_value, row) =>
      row.rate === null ? MISSING_VALUE : <RateCell rate={row.rate} />,
  },
];

/** Sort rows by one column; names in pt-BR order. */
function sortRows(
  rows: SubjectRow[],
  key: SubjectSortKey,
  order: 'asc' | 'desc'
): SubjectRow[] {
  const direction = order === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const result =
      key === 'name' || key === 'areaName'
        ? a[key].localeCompare(b[key], 'pt-BR')
        : (a[key] ?? -1) - (b[key] ?? -1);
    return result * direction;
  });
}

/**
 * "Desempenho por componente curricular": searchable (by componente or área)
 * and sortable, collapsed to the first rows behind "Mostrar todos". Until a
 * column is sorted, the componentes keep the API's order: worst hit rate
 * first.
 */
function SubjectsTable({
  subjects,
  tableId,
}: Readonly<{ subjects: KnowledgeSubjectRow[]; tableId: string }>) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{
    key: SubjectSortKey;
    order: 'asc' | 'desc';
  } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const all: SubjectRow[] = subjects.map((subject) => ({
      rowId: subject.subjectId,
      name: subject.subjectName,
      subject: [
        {
          id: subject.subjectId,
          name: subject.subjectName,
          color: subject.color,
          icon: subject.icon,
        },
      ],
      areaName: subject.areaKnowledgeName,
      total: subject.answered,
      correct: subject.correct,
      incorrect: subject.incorrect,
      blank: subject.blank,
      rate: subject.correctPercentage,
    }));
    const matching = term
      ? all.filter((row) =>
          `${row.name} ${row.areaName}`
            .toLocaleLowerCase('pt-BR')
            .includes(term)
        )
      : all;
    return sort ? sortRows(matching, sort.key, sort.order) : matching;
  }, [subjects, search, sort]);

  const visibleRows = expanded ? rows : rows.slice(0, COLLAPSED_SUBJECT_ROWS);
  const hasMore = rows.length > COLLAPSED_SUBJECT_ROWS;

  // Server mode: the table only reports search and sort, and they are applied
  // here to every componente before the collapse cut.
  const handleParamsChange = (params: TableParams) => {
    setSearch(params.search ?? '');
    const key = params.sortBy;
    setSort(
      key && SORT_KEYS.has(key)
        ? {
            key: key as SubjectSortKey,
            order: params.sortOrder === 'desc' ? 'desc' : 'asc',
          }
        : null
    );
  };

  const noun = (count: number) =>
    count === 1 ? 'componente curricular' : 'componentes curriculares';

  return (
    <div className="flex flex-col items-center gap-4">
      <TableProvider<SubjectRow>
        tableId={tableId}
        data={visibleRows}
        headers={SUBJECT_COLUMNS}
        rowKey="rowId"
        variant="borderless"
        enableSearch
        enableTableSort
        sortMode="server"
        onParamsChange={handleParamsChange}
        searchPlaceholder="Buscar"
        headerContent={
          <div className="flex flex-col gap-2">
            <Text as="h3" size="lg" weight="bold" className="text-text-950">
              Desempenho por componente curricular
            </Text>
            <Badge
              variant="solid"
              action="info"
              size="small"
              className="self-start uppercase"
            >
              {`${subjects.length} ${noun(subjects.length)} ${
                subjects.length === 1 ? 'total' : 'totais'
              }`}
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
            : `Mostrar todos os ${rows.length} ${noun(rows.length)}`}
          {expanded ? <CaretUpIcon size={18} /> : <CaretDownIcon size={18} />}
        </Button>
      )}
    </div>
  );
}

export interface KnowledgePerformanceCardProps {
  readonly data: KnowledgePerformanceData;
  /** Card heading; "Dados de questões" unless the report names it otherwise. */
  readonly title?: string;
  /**
   * Table identity for the persisted search and sort. Reports that show this
   * card side by side must pass distinct ids, or they share one state.
   */
  readonly tableId?: string;
}

/**
 * "Desempenho por área de conhecimento" — the questions of the cut split by
 * área, and every componente curricular with its own counts.
 *
 * The área select narrows the bars, the score and the table together.
 *
 * The counts are the API's, never summed from the table: a question mapped to
 * two componentes counts in both rows but once in its área and in the totals.
 * The score is the one derived from the hit rate, for every área and for all of
 * them — a corrected score would jump against the áreas'.
 *
 * Drawn from the Momento ENEM report and from the Simulados and Atividades
 * reports of the NRE and SEED profiles, which answer the same shape.
 *
 * @example
 * ```tsx
 * <KnowledgePerformanceCard data={questions} tableId="reportKnowledge" />
 * ```
 */
export function KnowledgePerformanceCard({
  data,
  title = 'Dados de questões',
  tableId = 'knowledgePerformanceSubjects',
}: KnowledgePerformanceCardProps) {
  const [areaId, setAreaId] = useState(ALL_AREAS);

  // The select lists them in pt-BR order; the API sends worst first.
  const areas = useMemo(
    () =>
      [...data.areas].sort((a, b) =>
        a.areaKnowledgeName.localeCompare(b.areaKnowledgeName, 'pt-BR')
      ),
    [data.areas]
  );
  // An área that vanished with a new cut falls back to "all" on read.
  const area = areas.find((item) => item.areaKnowledgeId === areaId) ?? null;

  const subjects = useMemo(
    () =>
      area
        ? data.subjects.filter(
            (subject) => subject.areaKnowledgeId === area.areaKnowledgeId
          )
        : data.subjects,
    [data.subjects, area]
  );

  const shown = area ?? data.totals;
  const values: QuestionsBarsValues = {
    total: shown.answered,
    corretas: shown.correct,
    incorretas: shown.incorrect,
    emBranco: shown.blank,
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-50 bg-background p-5">
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        <Text as="h3" size="lg" weight="bold" className="text-text-950">
          {title}
        </Text>
        <Select
          value={area ? area.areaKnowledgeId : ALL_AREAS}
          onValueChange={setAreaId}
          className="w-[380px] max-w-full"
        >
          <SelectTrigger className="w-full" aria-label="Área do conhecimento">
            <SelectValue placeholder="Todas as áreas do conhecimento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_AREAS}>
              Todas as áreas do conhecimento
            </SelectItem>
            {areas.map((item) => (
              <SelectItem
                key={item.areaKnowledgeId}
                value={item.areaKnowledgeId}
              >
                {item.areaKnowledgeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <QuestionsBars
        values={values}
        aside={
          <StatCard
            item={{
              label: 'Nota média',
              value:
                shown.averageScore === null
                  ? MISSING_VALUE
                  : formatReportScore(shown.averageScore),
              variant: 'total',
            }}
          />
        }
      />

      <div aria-hidden="true" className="h-px w-full bg-border-200" />

      <SubjectsTable subjects={subjects} tableId={tableId} />
    </div>
  );
}
