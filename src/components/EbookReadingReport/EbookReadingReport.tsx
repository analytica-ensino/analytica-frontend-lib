import { useMemo, useState } from 'react';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import Button from '../Button/Button';
import Text from '../Text/Text';
import type { BaseApiClient } from '../../types/api';
import { EbookReadingSummary } from './EbookReadingSummary';
import { EbookReadingPreferences } from './EbookReadingPreferences';
import { EbookReadingStudentModal } from './EbookReadingStudentModal';
import { ReadingTable } from './ReadingTable';
import { STUDENT_COLUMNS, buildGroupColumns } from './readingColumns';
import {
  EBOOK_READING_ROUTE,
  GROUP_LABEL,
  GROUP_ROUTE,
  PERIOD_LABEL,
} from './readingReport';
import { useEbookReadingRequest } from './useEbookReadingRequest';
import {
  EBOOK_RANKING_DIMENSION,
  EBOOK_RANKING_METRIC,
  EBOOK_READING_GROUP,
  type EbookRankingDimension,
  type EbookRankings,
  type EbookReadingFilters,
  type EbookReadingGroup,
  type EbookReadingGroupRow,
  type EbookReadingMetrics,
  type EbookReadingPage,
  type EbookReadingStudentDetail,
  type EbookReadingStudentRow,
  type EbookReadingTableParams,
} from './types';

/** Items in each card of "Preferências de leitura". */
export const RANKING_SIZE = 3;

/** First page of a table, before it reports its own. */
const FIRST_PAGE: EbookReadingTableParams = { page: 1, limit: 10 };

export interface EbookReadingReportProps {
  /** The app's API client */
  api: BaseApiClient;
  filters: EbookReadingFilters;
  /**
   * What the breakdown table lists: schools in the network view, school
   * years or classes in a school or for a teacher. Classes open their
   * students.
   */
  groupBy: EbookReadingGroup;
  /** A school row was chosen: the app opens that school's page */
  onSchoolSelect?: (school: EbookReadingGroupRow) => void;
}

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
 * The ebook reading report (AE-3329), for the teacher's "Desempenho" and the
 * manager's "Relatórios": readings, the most and least read books and
 * themes, the reading of each school, school year or class, and of each
 * student, book by book. It asks the API itself (`/access-report/ebook-
 * reading`) through the app's client, within `filters`.
 * @param {EbookReadingReportProps} props - The client, the filters and the grouping
 * @returns {JSX.Element} The report
 */
export const EbookReadingReport = ({
  api,
  filters,
  groupBy,
  onSchoolSelect,
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

  const summary = useEbookReadingRequest<EbookReadingMetrics>(
    api,
    EBOOK_READING_ROUTE.SUMMARY,
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
  const groups = useEbookReadingRequest<EbookReadingPage<EbookReadingGroupRow>>(
    api,
    GROUP_ROUTE[groupBy],
    selectedClass ? null : { ...filters, ...groupParams }
  );
  const students = useEbookReadingRequest<
    EbookReadingPage<EbookReadingStudentRow>
  >(
    api,
    EBOOK_READING_ROUTE.BY_STUDENT,
    selectedClass
      ? { ...filters, ...studentParams, classId: selectedClass.id }
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

  /** What a click on a breakdown row opens, if anything. */
  const groupRowClick = (() => {
    if (groupBy === EBOOK_READING_GROUP.CLASS) return setSelectedClass;
    if (groupBy === EBOOK_READING_GROUP.SCHOOL && onSchoolSelect) {
      return onSchoolSelect;
    }
    return undefined;
  })();

  return (
    <div className="flex flex-col gap-8" data-testid="ebook-reading-report">
      {summary.error ? (
        <ReportError
          message="Não foi possível carregar o resumo de leitura."
          onRetry={summary.retry}
        />
      ) : (
        <EbookReadingSummary data={summary.data} loading={summary.loading} />
      )}

      {rankings.error ? (
        <ReportError
          message="Não foi possível carregar as preferências de leitura."
          onRetry={rankings.retry}
        />
      ) : (
        <EbookReadingPreferences
          dimension={dimension}
          onDimensionChange={setDimension}
          data={rankings.data}
          loading={rankings.loading}
        />
      )}

      {selectedClass ? (
        <ReadingTable<EbookReadingStudentRow>
          key={filtersKey}
          tableId="ebookReadingStudents"
          title={`Desempenho por estudante: ${selectedClass.name}`}
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
            <Button
              variant="link"
              size="small"
              iconLeft={<ArrowLeftIcon aria-hidden="true" />}
              onClick={() => setSelectedClass(null)}
            >
              Voltar para as turmas
            </Button>
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
      {(selectedClass ? students.error : groups.error) && (
        <ReportError
          message="Não foi possível carregar a tabela de leitura."
          onRetry={selectedClass ? students.retry : groups.retry}
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
