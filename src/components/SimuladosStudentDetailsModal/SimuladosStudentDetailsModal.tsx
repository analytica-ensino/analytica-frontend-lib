import { useEffect, useState, useCallback } from 'react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import Badge from '../Badge/Badge';
import { ArrowLeft, CaretRight } from 'phosphor-react';
import { useSimuladosStudentDetails } from './useSimuladosStudentDetails';
import {
  isStudentSubjectsData,
  SIMULATED_PERFORMANCE_TAG_CONFIG,
  SimulatedPerformanceTag,
  type SimuladosStudentDetailsModalProps,
  type SubjectPerformanceItem,
  type StudentContentPerformanceItem,
} from './types';

/**
 * Map performance tag to Badge action type
 */
const PERFORMANCE_TAG_TO_BADGE_ACTION: Record<
  SimulatedPerformanceTag,
  'success' | 'info' | 'warning' | 'error'
> = {
  [SimulatedPerformanceTag.HIGHLIGHT]: 'success',
  [SimulatedPerformanceTag.ABOVE_AVERAGE]: 'info',
  [SimulatedPerformanceTag.BELOW_AVERAGE]: 'warning',
  [SimulatedPerformanceTag.ATTENTION_POINT]: 'error',
};

/**
 * Format percentage with 1 decimal and round
 */
function formatPercentageRounded(value: number): string {
  return `${Math.round(value)}%`;
}

const DEFAULT_LABELS = {
  loading: 'Carregando...',
  noData: 'Nenhum dado encontrado',
  noSubjects: 'Nenhuma matéria encontrada',
  noContents: 'Nenhuma habilidade encontrada',
  backButton: 'Voltar para lista de matérias',
  questions: 'questões',
  of: 'de',
};

/**
 * Modal for displaying student performance details in simulated exams
 * Supports cascading navigation: Subjects (level 1) -> Contents (level 2)
 */
export function SimuladosStudentDetailsModal({
  api,
  isOpen,
  onClose,
  simulationType,
  userInstitutionId,
  studentName,
  period,
  labels: customLabels,
}: SimuladosStudentDetailsModalProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };
  const { data, loading, error, fetchDetails, reset } =
    useSimuladosStudentDetails(api);
  const [selectedSubject, setSelectedSubject] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch subjects when modal opens
  useEffect(() => {
    if (isOpen && userInstitutionId) {
      fetchDetails({
        simulationType,
        userInstitutionId,
        period,
        subjectId: null,
      });
    }
  }, [isOpen, userInstitutionId, simulationType, period, fetchDetails]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedSubject(null);
    }
  }, [isOpen, reset]);

  // Handle subject click (navigate to level 2)
  const handleSubjectClick = useCallback(
    (subject: SubjectPerformanceItem) => {
      if (!userInstitutionId) return;

      setSelectedSubject({ id: subject.id, name: subject.name });
      fetchDetails({
        simulationType,
        userInstitutionId,
        period,
        subjectId: subject.id,
      });
    },
    [userInstitutionId, simulationType, period, fetchDetails]
  );

  // Handle back navigation (return to level 1)
  const handleBack = useCallback(() => {
    if (!userInstitutionId) return;

    setSelectedSubject(null);
    fetchDetails({
      simulationType,
      userInstitutionId,
      period,
      subjectId: null,
    });
  }, [userInstitutionId, simulationType, period, fetchDetails]);

  // Build modal title with back button when in level 2
  const modalTitle = selectedSubject ? (
    <span className="flex items-center gap-2">
      <button
        onClick={handleBack}
        className="p-1 hover:bg-background-100 rounded-md transition-colors"
        aria-label={labels.backButton}
      >
        <ArrowLeft size={20} className="text-text-600" />
      </button>
      <span>{selectedSubject.name}</span>
    </span>
  ) : (
    `Desempenho de ${studentName || 'Estudante'}`
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

  const isSubjectsLevel = isStudentSubjectsData(data);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <div className="flex flex-col gap-4">
        {/* Student header card */}
        <div className="flex items-center justify-between p-4 bg-background-50 rounded-xl">
          <div className="flex flex-col gap-1">
            <Text size="md" weight="semibold" className="text-text-950">
              {data.student.name}
            </Text>
            <Text size="sm" className="text-text-500">
              {data.student.school} - {data.student.class}
            </Text>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Text size="lg" weight="bold" className="text-text-950">
              {formatPercentageRounded(data.student.average)}
            </Text>
            <Badge
              variant="solid"
              action={PERFORMANCE_TAG_TO_BADGE_ACTION[data.student.performance]}
              size="small"
            >
              {SIMULATED_PERFORMANCE_TAG_CONFIG[data.student.performance].label}
            </Badge>
          </div>
        </div>

        {/* List of subjects or contents */}
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {isSubjectsLevel ? (
            // Level 1: Subjects list
            data.subjects.length > 0 ? (
              data.subjects.map((subject) => (
                <SubjectItem
                  key={subject.id}
                  subject={subject}
                  onClick={() => handleSubjectClick(subject)}
                  questionsLabel={labels.questions}
                />
              ))
            ) : (
              <Text size="sm" className="text-text-500 text-center py-4">
                {labels.noSubjects}
              </Text>
            )
          ) : // Level 2: Contents list
          data.contents.length > 0 ? (
            data.contents.map((content) => (
              <ContentItem
                key={content.contentId}
                content={content}
                questionsLabel={labels.questions}
                ofLabel={labels.of}
              />
            ))
          ) : (
            <Text size="sm" className="text-text-500 text-center py-4">
              {labels.noContents}
            </Text>
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Subject item component (level 1)
 */
function SubjectItem({
  subject,
  onClick,
  questionsLabel,
}: {
  subject: SubjectPerformanceItem;
  onClick: () => void;
  questionsLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-background border border-border-50 rounded-xl hover:bg-background-50 transition-colors text-left w-full"
    >
      {/* Subject color indicator */}
      {subject.color && (
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: subject.color }}
        />
      )}

      {/* Subject info */}
      <div className="flex-1 min-w-0">
        <Text size="sm" weight="semibold" className="text-text-950 truncate">
          {subject.name}
        </Text>
        <Text size="xs" className="text-text-500">
          {subject.questionsCount} {questionsLabel}
        </Text>
      </div>

      {/* Progress bar */}
      <div className="w-32 flex-shrink-0">
        <ProgressBar
          value={subject.performance.correctPercentage}
          variant="green"
          size="small"
          showPercentage
        />
      </div>

      {/* Arrow indicator */}
      <CaretRight size={16} className="text-text-400 flex-shrink-0" />
    </button>
  );
}

/**
 * Content item component (level 2)
 */
function ContentItem({
  content,
  questionsLabel,
  ofLabel,
}: {
  content: StudentContentPerformanceItem;
  questionsLabel: string;
  ofLabel: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-background border border-border-50 rounded-xl">
      {/* Content info */}
      <div className="flex-1 min-w-0">
        <Text size="sm" weight="semibold" className="text-text-950 truncate">
          {content.contentName}
        </Text>
        <div className="flex items-center gap-2">
          {content.bnccCode && (
            <Text size="xs" className="text-primary-600">
              {content.bnccCode}
            </Text>
          )}
          <Text size="xs" className="text-text-500">
            {content.questionsCount} {questionsLabel}
          </Text>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-32 flex-shrink-0">
        <ProgressBar
          value={content.performance.correctPercentage}
          variant="green"
          size="small"
          showPercentage
        />
      </div>

      {/* Hit count */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Text size="sm" weight="semibold" className="text-success-600">
          {content.performance.correct}
        </Text>
        <Text size="xs" className="text-text-500 whitespace-nowrap">
          {ofLabel} {content.questionsCount}
        </Text>
      </div>
    </div>
  );
}
