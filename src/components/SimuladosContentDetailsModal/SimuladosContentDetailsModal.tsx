import { useEffect, useCallback, useState } from 'react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import { TablePagination } from '../Table/Table';
import { ArrowLeft } from 'phosphor-react';
import { useSimulatedContentDetails } from './useSimulatedContentDetails';
import type {
  SimuladosContentDetailsModalProps,
  ContentStudentItem,
} from './types';

const DEFAULT_LABELS = {
  title: 'Desempenho competência',
  loading: 'Carregando...',
  noData: 'Nenhum dado encontrado',
  noStudents: 'Nenhum estudante encontrado',
  questions: 'questões',
  students: 'alunos',
  aboveAverage: 'Acima da média',
  atAverage: 'Na média',
  belowAverage: 'Abaixo da média',
};

/**
 * Format percentage rounded
 */
function formatPercentageRounded(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Modal for displaying content (habilidade) performance details in simulated exams
 * Shows list of students with their individual performance for the selected content
 */
export function SimuladosContentDetailsModal({
  api,
  isOpen,
  onClose,
  activityFilters,
  contentId,
  contentName,
  period,
  filters,
  labels: customLabels,
}: SimuladosContentDetailsModalProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };
  const { data, loading, error, fetchDetails, reset } =
    useSimulatedContentDetails(api);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch content details when modal opens
  useEffect(() => {
    if (isOpen && contentId) {
      fetchDetails({
        activityFilters,
        contentId,
        period,
        schoolIds: filters?.schoolIds,
        schoolYearIds: filters?.schoolYearIds,
        classIds: filters?.classIds,
        page: currentPage,
        limit: pageSize,
      });
    }
  }, [
    isOpen,
    contentId,
    activityFilters,
    period,
    filters,
    currentPage,
    fetchDetails,
  ]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setCurrentPage(1);
    }
  }, [isOpen, reset]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Build modal title
  const modalTitle = (
    <span className="flex items-center gap-2">
      <button
        onClick={onClose}
        className="p-1 hover:bg-background-100 rounded-md transition-colors"
        aria-label="Fechar modal"
      >
        <ArrowLeft size={20} className="text-text-600" />
      </button>
      <span>{labels.title}</span>
    </span>
  );

  // Render loading state
  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
        <div className="flex items-center justify-center py-8">
          <Text size="sm" className="text-text-500">
            {labels.loading}
          </Text>
        </div>
      </Modal>
    );
  }

  // Render error state
  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
        <div className="flex items-center justify-center py-8">
          <Text size="sm" className="text-error-500">
            {error}
          </Text>
        </div>
      </Modal>
    );
  }

  // Render empty state
  if (!data) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
        <div className="flex items-center justify-center py-8">
          <Text size="sm" className="text-text-500">
            {labels.noData}
          </Text>
        </div>
      </Modal>
    );
  }

  const totalPages = Math.ceil(data.students.total / pageSize);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <div className="flex flex-col gap-4">
        {/* Content header */}
        <div className="flex flex-col gap-1 p-4 bg-background-50 rounded-xl">
          <Text size="md" weight="semibold" className="text-text-950">
            {data.content.name || contentName}
          </Text>
          <div className="flex items-center gap-2">
            {data.content.bnccCode && (
              <Text size="sm" className="text-primary-600">
                {data.content.bnccCode}
              </Text>
            )}
            <Text size="sm" className="text-text-500">
              {data.content.subject.name} • {data.content.questionsCount}{' '}
              {labels.questions} • {data.content.studentsCount}{' '}
              {labels.students}
            </Text>
          </div>
        </div>

        {/* Performance counters */}
        <div className="grid grid-cols-3 gap-4">
          <CounterCard
            label={labels.aboveAverage}
            value={data.counters.aboveAverage}
            colorClass="bg-success-100 text-success-700"
          />
          <CounterCard
            label={labels.atAverage}
            value={data.counters.atAverage}
            colorClass="bg-primary-100 text-primary-700"
          />
          <CounterCard
            label={labels.belowAverage}
            value={data.counters.belowAverage}
            colorClass="bg-error-100 text-error-700"
          />
        </div>

        {/* Students table */}
        <div className="flex flex-col gap-2">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-background-100 rounded-lg">
            <div className="col-span-3">
              <Text size="xs" weight="semibold" className="text-text-600">
                Nome
              </Text>
            </div>
            <div className="col-span-2">
              <Text size="xs" weight="semibold" className="text-text-600">
                Escola
              </Text>
            </div>
            <div className="col-span-1">
              <Text size="xs" weight="semibold" className="text-text-600">
                Ano
              </Text>
            </div>
            <div className="col-span-1">
              <Text size="xs" weight="semibold" className="text-text-600">
                Turma
              </Text>
            </div>
            <div className="col-span-2 text-center">
              <Text size="xs" weight="semibold" className="text-text-600">
                Média
              </Text>
            </div>
            <div className="col-span-3 text-center">
              <Text size="xs" weight="semibold" className="text-text-600">
                Desempenho
              </Text>
            </div>
          </div>

          {/* Table body */}
          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
            {data.students.data.length > 0 ? (
              data.students.data.map((student) => (
                <StudentRow key={student.userInstitutionId} student={student} />
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <Text size="sm" className="text-text-500">
                  {labels.noStudents}
                </Text>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={data.students.total}
                itemsPerPage={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Counter card component for performance counters
 */
function CounterCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 p-4 rounded-xl ${colorClass}`}
    >
      <Text size="2xl" weight="bold">
        {value}
      </Text>
      <Text size="xs" weight="medium">
        {label}
      </Text>
    </div>
  );
}

/**
 * Student row component for the table
 */
function StudentRow({ student }: { student: ContentStudentItem }) {
  return (
    <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-background border border-border-50 rounded-lg hover:bg-background-50 transition-colors">
      <div className="col-span-3 flex items-center">
        <Text size="sm" weight="medium" className="text-text-950 truncate">
          {student.name}
        </Text>
      </div>
      <div className="col-span-2 flex items-center">
        <Text size="sm" className="text-text-600 truncate">
          {student.school}
        </Text>
      </div>
      <div className="col-span-1 flex items-center">
        <Text size="sm" className="text-text-600">
          {student.schoolYear}
        </Text>
      </div>
      <div className="col-span-1 flex items-center">
        <Text size="sm" className="text-text-600">
          {student.class}
        </Text>
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <Text size="sm" weight="semibold" className="text-text-950">
          {Math.round(student.average)}
        </Text>
      </div>
      <div className="col-span-3 flex items-center justify-center gap-2">
        <div className="w-20 shrink-0">
          <ProgressBar
            value={student.performance}
            variant="green"
            size="small"
          />
        </div>
        <Text size="sm" weight="semibold" className="text-text-600 w-10">
          {formatPercentageRounded(student.performance)}
        </Text>
      </div>
    </div>
  );
}
