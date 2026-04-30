import { useEffect, useState, useCallback, type ReactNode } from 'react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import Badge from '../Badge/Badge';
import { ArrowLeft, CaretRight } from 'phosphor-react';
import { useSimulatedStudentDetails } from './useSimulatedStudentDetails';
import { formatPercentageRounded } from '../../utils/utils';
import {
  isStudentSubjectsData,
  SIMULATED_PERFORMANCE_TAG_CONFIG,
  PERFORMANCE_TAG_TO_BADGE_ACTION,
  type SimulatedStudentDetailsModalProps,
  type SubjectPerformanceItem,
  type StudentContentPerformanceItem,
} from './types';
import Button from '../Button/Button';

/**
 * Modal for displaying student performance details in simulated exams
 * Supports cascading navigation: Subjects (level 1) -> Contents (level 2)
 */
export function SimulatedStudentDetailsModal({
  api,
  isOpen,
  onClose,
  simulationType,
  userInstitutionId,
  studentName,
  period,
}: SimulatedStudentDetailsModalProps) {
  const { data, loading, error, fetchDetails, reset } =
    useSimulatedStudentDetails(api);
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
    <div className="flex items-center gap-2">
      <Button
        onClick={handleBack}
        variant="raw"
        className="p-1 hover:bg-background-100 rounded-md transition-colors"
        aria-label="Voltar para lista de matérias"
      >
        <ArrowLeft size={20} className="text-text-600" />
      </Button>
      <Text>{selectedSubject.name}</Text>
    </div>
  ) : (
    `Desempenho de ${studentName || 'Estudante'}`
  );

  // Render loading state
  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
        <div className="flex items-center justify-center py-8">
          <Text size="sm" className="text-text-500">
            Carregando...
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
            Nenhum dado encontrado
          </Text>
        </div>
      </Modal>
    );
  }

  const isSubjectsLevel = isStudentSubjectsData(data);
  const renderDetailsContent = (): ReactNode => {
    if (isSubjectsLevel) {
      if (data.subjects.length > 0) {
        return data.subjects.map((subject) => (
          <SubjectItem
            key={subject.id}
            subject={subject}
            onClick={() => handleSubjectClick(subject)}
            questionsLabel="questões"
          />
        ));
      }

      return (
        <Text size="sm" className="text-text-500 text-center py-4">
          Nenhuma matéria encontrada
        </Text>
      );
    }

    if (data.contents.length > 0) {
      return data.contents.map((content) => (
        <ContentItem
          key={content.contentId}
          content={content}
          questionsLabel="questões"
          ofLabel="de"
        />
      ));
    }

    return (
      <Text size="sm" className="text-text-500 text-center py-4">
        Nenhuma habilidade encontrada
      </Text>
    );
  };

  const detailsContent = renderDetailsContent();

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
          {detailsContent}
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
}: Readonly<{
  subject: SubjectPerformanceItem;
  onClick: () => void;
  questionsLabel: string;
}>) {
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
}: Readonly<{
  content: StudentContentPerformanceItem;
  questionsLabel: string;
  ofLabel: string;
}>) {
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
