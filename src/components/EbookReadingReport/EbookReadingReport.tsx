import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import Button from '../Button/Button';
import Text from '../Text/Text';
import { PerformanceDistributionChart } from '../PerformanceDistributionChart/PerformanceDistributionChart';
import type { SimulatedPerformanceCounters } from '../PerformanceDistributionChart/types';
import type { BaseApiClient } from '../../types/api';
import type { RankingVariant } from '../shared/RankingShared';
import { EbookReadingSummary } from './EbookReadingSummary';
import { EbookReadingPeriodChart } from './EbookReadingPeriodChart';
import { EbookReadingPreferences } from './EbookReadingPreferences';
import { EbookReadingSubjects } from './EbookReadingSubjects';
import { EbookReadingMunicipalities } from './EbookReadingMunicipalities';
import { EbookReadingStudentModal } from './EbookReadingStudentModal';
import { ReadingTable } from './ReadingTable';
import { STUDENT_COLUMNS, buildGroupColumns } from './readingColumns';
import {
  EBOOK_READING_ROUTE,
  GROUP_LABEL,
  GROUP_ROUTE,
  PERIOD_LABEL,
  fetchEveryRow,
} from './readingReport';
import { useEbookReadingRequest } from './useEbookReadingRequest';
import {
  EBOOK_RANKING_DIMENSION,
  EBOOK_RANKING_METRIC,
  EBOOK_READING_GROUP,
  type EbookRankingDimension,
  type EbookRankings,
  type EbookReadingBySubject,
  type EbookReadingDistribution,
  type EbookReadingFilters,
  type EbookReadingGroup,
  type EbookReadingGroupRow,
  type EbookReadingPage,
  type EbookReadingStudentDetail,
  type EbookReadingStudentRow,
  type EbookReadingSummaryData,
  type EbookReadingTableParams,
  type EbookReadingTimeline,
} from './types';

/** Items in each card of "Preferências de leitura". */
export const RANKING_SIZE = 3;

/** First page of a table, before it reports its own. */
const FIRST_PAGE: EbookReadingTableParams = { page: 1, limit: 10 };

export interface EbookReadingReportProps {
  /** The app's API client */
  api: BaseApiClient;
  /**
   * The filters. To list the students (`groupBy` student) they must carry
   * the classes or the schools: the API lists no whole network.
   */
  filters: EbookReadingFilters;
  /**
   * What the breakdown table lists: schools in the network view, which also
   * shows the municipalities; school years or classes in a school, classes
   * opening their students; or the students themselves, in a school or for
   * a teacher.
   */
  groupBy: EbookReadingGroup;
  /** A school row was chosen: the app opens that school's page */
  onSchoolSelect?: (school: EbookReadingGroupRow) => void;
  /**
   * Beside the icon of "Municípios em destaque" and "Municípios precisando
   * de atenção" — "Criar plano", say (AE-3367)
   */
  renderMunicipalityAction?: (variant: RankingVariant) => ReactNode;
}

/**
 * The tiers of the distribution as the pie counts them.
 * @param {EbookReadingDistribution} distribution - The students per tier
 * @returns {SimulatedPerformanceCounters} The pie's counters
 */
export const tierCounters = (
  distribution: EbookReadingDistribution
): SimulatedPerformanceCounters => ({
  highlight: distribution.tiers.highlight,
  aboveAverage: distribution.tiers.aboveAverage,
  belowAverage: distribution.tiers.belowAverage,
  attentionPoint: distribution.tiers.attention,
  notParticipated: distribution.tiers.none,
});

/**
 * A failed part of the report, with a way to ask again.
 * @param {object} props - The props
 * @param {string} props.message - What failed
 * @param {() => void} props.onRetry - Asks again
 * @returns {JSX.Element} The message
 */
const ReportError = ({
  message,
  onRetry,
}: Readonly<{ message: string; onRetry: () => void }>) => (
  <div
    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-50 bg-background p-4"
    role="alert"
  >
    <Text size="sm" className="text-text-700">
      {message}
    </Text>
    <Button variant="outline" size="small" onClick={onRetry}>
      Tentar novamente
    </Button>
  </div>
);

/**
 * A part of the report, or what failed in it.
 * @param {object} props - The props
 * @param {{ error: boolean; retry: () => void }} props.request - The part's request
 * @param {string} props.failure - What to say when it fails
 * @param {ReactNode} props.children - The part
 * @returns {JSX.Element} The part, or its error
 */
const ReportPart = ({
  request,
  failure,
  children,
}: Readonly<{
  request: { error: boolean; retry: () => void };
  failure: string;
  children: ReactNode;
}>) =>
  request.error ? (
    <ReportError message={failure} onRetry={request.retry} />
  ) : (
    <>{children}</>
  );

/**
 * The ebook reading report (AE-3329), for the teacher's "Desempenho" and the
 * manager's "Relatórios": readings in the period and by period, the most
 * and least read books and themes, the books of each curricular component,
 * the students in each reading tier, and the reading of each school (with
 * the municipalities in highlight and needing attention), school year,
 * class or student, book by book. It asks the API itself (`/access-report/
 * ebook-reading`) through the app's client, within `filters`.
 * @param {EbookReadingReportProps} props - The client, the filters and the grouping
 * @returns {JSX.Element} The report
 */
export const EbookReadingReport = ({
  api,
  filters,
  groupBy,
  onSchoolSelect,
  renderMunicipalityAction,
}: Readonly<EbookReadingReportProps>) => {
  const [dimension, setDimension] = useState<EbookRankingDimension>(
    EBOOK_RANKING_DIMENSION.EBOOK
  );
  const [groupParams, setGroupParams] = useState(FIRST_PAGE);
  const [selectedClass, setSelectedClass] =
    useState<EbookReadingGroupRow | null>(null);
  const [studentParams, setStudentParams] = useState(FIRST_PAGE);
  const [selectedStudent, setSelectedStudent] =
    useState<EbookReadingStudentRow | null>(null);

  // A new filter starts the tables over, in the same render: page 2 of the
  // old filter is not page 2 of the new one, and the open class may be out
  // of it. The key also remounts the tables, whose page is their own.
  const filtersKey = JSON.stringify(filters);
  const [tablesFiltersKey, setTablesFiltersKey] = useState(filtersKey);
  if (tablesFiltersKey !== filtersKey) {
    setTablesFiltersKey(filtersKey);
    setGroupParams(FIRST_PAGE);
    setStudentParams(FIRST_PAGE);
    setSelectedClass(null);
  }

  const isNetwork = groupBy === EBOOK_READING_GROUP.SCHOOL;
  const listsStudents = groupBy === EBOOK_READING_GROUP.STUDENT;
  const showsStudents = listsStudents || selectedClass !== null;

  const summary = useEbookReadingRequest<EbookReadingSummaryData>(
    api,
    EBOOK_READING_ROUTE.SUMMARY,
    filters
  );
  const timeline = useEbookReadingRequest<EbookReadingTimeline>(
    api,
    EBOOK_READING_ROUTE.TIMELINE,
    filters
  );
  const rankings = useEbookReadingRequest<EbookRankings>(
    api,
    EBOOK_READING_ROUTE.RANKINGS,
    {
      ...filters,
      dimension,
      metric: EBOOK_RANKING_METRIC.READERS,
      limit: RANKING_SIZE,
    }
  );
  const subjects = useEbookReadingRequest<EbookReadingBySubject>(
    api,
    EBOOK_READING_ROUTE.BY_SUBJECT,
    filters
  );
  const municipalities = useEbookReadingRequest<EbookReadingGroupRow[]>(
    api,
    EBOOK_READING_ROUTE.BY_MUNICIPALITY,
    isNetwork ? filters : null,
    fetchEveryRow
  );
  const distribution = useEbookReadingRequest<EbookReadingDistribution>(
    api,
    EBOOK_READING_ROUTE.DISTRIBUTION,
    filters
  );
  const groups = useEbookReadingRequest<EbookReadingPage<EbookReadingGroupRow>>(
    api,
    GROUP_ROUTE[groupBy],
    showsStudents ? null : { ...filters, ...groupParams }
  );
  const students = useEbookReadingRequest<
    EbookReadingPage<EbookReadingStudentRow>
  >(
    api,
    EBOOK_READING_ROUTE.BY_STUDENT,
    showsStudents
      ? {
          ...filters,
          ...studentParams,
          ...(selectedClass ? { classId: selectedClass.id } : {}),
        }
      : null
  );
  const student = useEbookReadingRequest<EbookReadingStudentDetail>(
    api,
    EBOOK_READING_ROUTE.STUDENT,
    selectedStudent
      ? { ...filters, userInstitutionId: selectedStudent.userInstitutionId }
      : null
  );

  const groupColumns = useMemo(() => buildGroupColumns(groupBy), [groupBy]);
  const groupLabel = GROUP_LABEL[groupBy];
  const counters = useMemo(
    () => (distribution.data ? tierCounters(distribution.data) : undefined),
    [distribution.data]
  );

  /** What a click on a breakdown row opens, if anything. */
  const groupRowClick = (() => {
    if (groupBy === EBOOK_READING_GROUP.CLASS) return setSelectedClass;
    if (isNetwork && onSchoolSelect) return onSchoolSelect;
    return undefined;
  })();

  return (
    <div className="flex flex-col gap-8" data-testid="ebook-reading-report">
      <ReportPart
        request={summary}
        failure="Não foi possível carregar o resumo de leitura."
      >
        <EbookReadingSummary
          data={summary.data}
          loading={summary.loading}
          showPlaces={isNetwork}
        />
      </ReportPart>

      <ReportPart
        request={timeline}
        failure="Não foi possível carregar as leituras por período."
      >
        <EbookReadingPeriodChart
          data={timeline.data}
          loading={timeline.loading}
        />
      </ReportPart>

      <ReportPart
        request={rankings}
        failure="Não foi possível carregar as preferências de leitura."
      >
        <EbookReadingPreferences
          dimension={dimension}
          onDimensionChange={setDimension}
          data={rankings.data}
          loading={rankings.loading}
        />
      </ReportPart>

      <ReportPart
        request={subjects}
        failure="Não foi possível carregar os dados por componente curricular."
      >
        <EbookReadingSubjects data={subjects.data} loading={subjects.loading} />
      </ReportPart>

      {isNetwork && (
        <ReportPart
          request={municipalities}
          failure="Não foi possível carregar os municípios."
        >
          <EbookReadingMunicipalities
            rows={municipalities.data}
            loading={municipalities.loading}
            renderHeaderAction={renderMunicipalityAction}
          />
        </ReportPart>
      )}

      <ReportPart
        request={distribution}
        failure="Não foi possível carregar o desempenho por quantidade de estudante."
      >
        <PerformanceDistributionChart
          counters={counters}
          totalStudents={distribution.data?.totalStudents}
          loading={distribution.loading && !distribution.data}
          notParticipatedLabel="Sem leitura"
        />
      </ReportPart>

      {showsStudents ? (
        <ReadingTable<EbookReadingStudentRow>
          key={filtersKey}
          tableId="ebookReadingStudents"
          title={
            selectedClass
              ? `Desempenho por estudante: ${selectedClass.name}`
              : 'Desempenho por estudante'
          }
          rows={students.data?.rows ?? []}
          columns={STUDENT_COLUMNS}
          total={students.data?.pagination.total ?? 0}
          loading={students.loading}
          itemLabel="estudantes"
          searchPlaceholder="Buscar estudante"
          rowKey="userInstitutionId"
          onParamsChange={setStudentParams}
          onRowClick={setSelectedStudent}
          rowActionLabel={(row) => `Ver a leitura de ${row.studentName}`}
          headerContent={
            selectedClass && (
              <Button
                variant="link"
                size="small"
                iconLeft={<ArrowLeftIcon aria-hidden="true" />}
                onClick={() => setSelectedClass(null)}
              >
                Voltar para as turmas
              </Button>
            )
          }
        />
      ) : (
        <ReadingTable<EbookReadingGroupRow>
          key={filtersKey}
          tableId="ebookReadingGroups"
          title={`Desempenho por ${groupLabel.one.toLowerCase()}`}
          rows={groups.data?.rows ?? []}
          columns={groupColumns}
          total={groups.data?.pagination.total ?? 0}
          loading={groups.loading}
          itemLabel={groupLabel.many}
          searchPlaceholder={`Buscar ${groupLabel.one.toLowerCase()}`}
          rowKey="id"
          onParamsChange={setGroupParams}
          onRowClick={groupRowClick}
          rowActionLabel={(row) => `Ver a leitura de ${row.name}`}
        />
      )}
      {(showsStudents ? students.error : groups.error) && (
        <ReportError
          message="Não foi possível carregar a tabela de leitura."
          onRetry={showsStudents ? students.retry : groups.retry}
        />
      )}

      <EbookReadingStudentModal
        isOpen={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        title={`Desempenho em ${PERIOD_LABEL[filters.period]}`}
        data={student.data}
        loading={student.loading}
        error={student.error}
        onRetry={student.retry}
        averageProgress={selectedStudent?.averageProgress}
      />
    </div>
  );
};

export default EbookReadingReport;
