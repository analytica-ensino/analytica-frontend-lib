import { useMemo, type ReactNode } from 'react';
import {
  LightbulbFilament,
  WarningCircle,
  User,
  CheckCircle,
  XCircle,
} from 'phosphor-react';
import Modal from '../../Modal/Modal';
import Text from '../../Text/Text';
import Badge from '../../Badge/Badge';
import ProgressBar from '../../ProgressBar/ProgressBar';
import { CardAccordation } from '../../Accordation/Accordation';
import {
  AlternativesList,
  type Alternative,
} from '../../Alternative/Alternative';
import type {
  StudentPerformanceData,
  StudentPerformanceLabels,
  LessonProgress,
  LessonQuestion,
} from '../types';
import { DEFAULT_PERFORMANCE_LABELS } from '../types';

/**
 * Props for StudentPerformanceModal component
 */
export interface StudentPerformanceModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Student performance data */
  data: StudentPerformanceData | null;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Custom labels */
  labels?: Partial<StudentPerformanceLabels>;
}

/**
 * Performance card with colored header and white footer section
 * Matches the Figma design with icon, label, value on top and secondary info below
 */
const PerformanceCard = ({
  icon,
  label,
  value,
  secondaryLabel,
  secondaryValue,
  variant,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  secondaryLabel: string;
  secondaryValue: string | null;
  variant: 'success' | 'error';
}) => {
  const headerBgColor = {
    success: 'bg-success-200',
    error: 'bg-error-100',
  }[variant];

  const valueColor = {
    success: 'text-success-700',
    error: 'text-error-700',
  }[variant];

  const iconBgColor = {
    success: 'bg-warning-300',
    error: 'bg-error-300',
  }[variant];

  const secondaryLabelColor = {
    success: 'text-success-600',
    error: 'text-error-600',
  }[variant];

  return (
    <div className="flex flex-col rounded-xl border border-border-50 bg-background overflow-hidden">
      {/* Header section with colored background */}
      <div
        className={`flex flex-col items-center justify-center p-4 gap-1 ${headerBgColor}`}
      >
        <Text
          as="span"
          className={`size-8 rounded-full flex items-center justify-center ${iconBgColor}`}
        >
          {icon}
        </Text>
        <Text
          size="2xs"
          weight="medium"
          className="text-text-800 uppercase text-center leading-none"
        >
          {label}
        </Text>
        <Text size="xl" weight="bold" className={`${valueColor} text-center`}>
          {value}
        </Text>
      </div>

      {/* Footer section with white background */}
      <div className="flex flex-col items-center gap-2 px-4 py-3">
        <Text
          size="2xs"
          weight="medium"
          className={`${secondaryLabelColor} uppercase text-center`}
        >
          {secondaryLabel}
        </Text>
        <Badge size="large" action="info">
          {secondaryValue || '-'}
        </Badge>
      </div>
    </div>
  );
};

/**
 * Determine the status of an alternative based on correctness and selection
 */
const getAlternativeStatus = (
  isCorrect: boolean,
  isSelected: boolean
): 'correct' | 'incorrect' | undefined => {
  if (isCorrect) {
    return 'correct';
  }
  if (isSelected) {
    return 'incorrect';
  }
  return undefined;
};

/**
 * Convert question alternatives to AlternativesList format
 */
const mapAlternatives = (question: LessonQuestion): Alternative[] => {
  return question.alternatives.map((alt) => ({
    value: alt.id,
    label: alt.text,
    status: getAlternativeStatus(alt.isCorrect, alt.isSelected),
  }));
};

/**
 * Get selected alternative value from question
 */
const getSelectedValue = (question: LessonQuestion): string | undefined => {
  const selected = question.alternatives.find((alt) => alt.isSelected);
  return selected?.id;
};

/**
 * Question accordion item inside a lesson
 */
const QuestionAccordionItem = ({
  question,
  index,
}: {
  question: LessonQuestion;
  index: number;
}) => (
  <CardAccordation
    value={question.id}
    className="bg-background rounded-xl border border-border-50"
    triggerClassName="py-5 px-5"
    contentClassName="px-5 pb-5"
    trigger={
      <div className="flex items-center justify-between flex-1">
        <Text size="sm" weight="semibold" className="text-text-950">
          Questão {index + 1}
        </Text>
        <Badge
          size="small"
          action={question.isCorrect ? 'success' : 'error'}
          variant="solid"
          iconLeft={question.isCorrect ? <CheckCircle /> : <XCircle />}
        >
          {question.isCorrect ? 'Correta' : 'Incorreta'}
        </Badge>
      </div>
    }
  >
    <div className="flex flex-col gap-3">
      {/* Question statement */}
      <Text size="sm" className="text-text-700">
        {question.statement}
      </Text>

      {/* Alternatives accordion */}
      <CardAccordation
        value={`${question.id}-alternatives`}
        className="bg-background rounded-lg border border-border-50"
        triggerClassName="py-5 px-5"
        contentClassName="px-5 py-5"
        trigger={
          <Text size="sm" weight="medium" className="text-text-800">
            Alternativas
          </Text>
        }
      >
        <AlternativesList
          mode="readonly"
          alternatives={mapAlternatives(question)}
          selectedValue={getSelectedValue(question)}
          layout="default"
        />
      </CardAccordation>
    </div>
  </CardAccordation>
);

/**
 * Lesson accordion item
 */
const LessonAccordionItem = ({ lesson }: { lesson: LessonProgress }) => (
  <CardAccordation
    value={lesson.id}
    className="bg-background rounded-xl border border-border-50"
    triggerClassName="py-5 px-5"
    contentClassName="px-5 pb-5"
    trigger={
      <div className="flex flex-col gap-1 flex-1">
        <Text size="sm" weight="semibold" className="text-text-950">
          {lesson.title}
        </Text>
        <ProgressBar
          value={lesson.progress}
          variant="blue"
          size="medium"
          showPercentage
          layout="default"
        />
      </div>
    }
  >
    <div className="flex flex-col gap-2">
      {lesson.questions.map((question, index) => (
        <QuestionAccordionItem
          key={question.id}
          question={question}
          index={index}
        />
      ))}
    </div>
  </CardAccordation>
);

/**
 * StudentPerformanceModal component
 *
 * Displays a modal with student performance details including:
 * - Student name with search icon
 * - Two performance cards (correct answers, incorrect answers)
 * - Expandable list of lessons with progress
 *
 * @example
 * ```tsx
 * <StudentPerformanceModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   data={{
 *     studentName: 'Lucas Oliveira',
 *     correctAnswers: 8,
 *     incorrectAnswers: 7,
 *     bestResult: 'Fotossíntese',
 *     hardestTopic: 'Células',
 *     lessons: [
 *       { id: '1', title: 'Categorias Taxonômicas', progress: 50 },
 *     ],
 *   }}
 * />
 * ```
 */
/**
 * Loading skeleton for the modal content
 */
const LoadingSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="h-6 bg-background-200 rounded w-48" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-44 bg-background-200 rounded-xl" />
      <div className="h-44 bg-background-200 rounded-xl" />
    </div>
  </div>
);

/**
 * Error state component
 */
const ErrorContent = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-3">
    <Text
      as="span"
      className="size-12 rounded-full bg-error-100 flex items-center justify-center"
    >
      <WarningCircle size={24} className="text-error-700" />
    </Text>
    <Text size="md" className="text-error-700 text-center">
      {message}
    </Text>
  </div>
);

/**
 * Performance content when data is available
 */
const PerformanceContent = ({
  data,
  labels,
}: {
  data: StudentPerformanceData;
  labels: StudentPerformanceLabels;
}) => (
  <div className="flex flex-col gap-5">
    {/* Student name with icon */}
    <div className="flex items-center gap-2">
      <Text
        as="span"
        className="size-8 rounded-full bg-background-100 flex items-center justify-center"
      >
        <User size={16} className="text-text-500" />
      </Text>
      <Text size="md" weight="medium" className="text-text-950">
        {data.studentName}
      </Text>
    </div>

    {/* Two performance cards in a row */}
    <div className="grid grid-cols-2 gap-3">
      {/* Correct answers card */}
      <PerformanceCard
        icon={
          <LightbulbFilament size={18} weight="fill" className="text-white" />
        }
        label={labels.correctAnswersLabel}
        value={data.correctAnswers}
        secondaryLabel={labels.bestResultLabel}
        secondaryValue={data.bestResult}
        variant="success"
      />

      {/* Incorrect answers card */}
      <PerformanceCard
        icon={
          <WarningCircle size={18} weight="fill" className="text-error-700" />
        }
        label={labels.incorrectAnswersLabel}
        value={data.incorrectAnswers}
        secondaryLabel={labels.hardestTopicLabel}
        secondaryValue={data.hardestTopic}
        variant="error"
      />
    </div>

    {/* Lessons section */}
    {data.lessons.length > 0 && (
      <div className="flex flex-col gap-3">
        <Text size="md" weight="semibold" className="text-text-950">
          {labels.lessonsTitle}
        </Text>
        <div className="flex flex-col gap-2">
          {data.lessons.map((lesson) => (
            <LessonAccordionItem key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </div>
    )}
  </div>
);

/**
 * Renders the modal content based on loading, error, and data state
 */
const renderModalContent = (
  loading: boolean,
  error: string | null | undefined,
  data: StudentPerformanceData | null,
  labels: StudentPerformanceLabels
): ReactNode => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorContent message={error} />;
  }

  if (data) {
    return <PerformanceContent data={data} labels={labels} />;
  }

  return null;
};

export const StudentPerformanceModal = ({
  isOpen,
  onClose,
  data,
  loading = false,
  error = null,
  labels: customLabels,
}: StudentPerformanceModalProps) => {
  const labels = useMemo(
    () => ({ ...DEFAULT_PERFORMANCE_LABELS, ...customLabels }),
    [customLabels]
  );

  if (!data && !loading && !error) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={labels.title}
      size="lg"
      contentClassName="max-h-[70vh] overflow-y-auto"
    >
      {renderModalContent(loading, error, data, labels)}
    </Modal>
  );
};

export default StudentPerformanceModal;
