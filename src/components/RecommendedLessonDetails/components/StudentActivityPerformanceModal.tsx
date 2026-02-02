import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  Timer,
  Trophy,
  Warning,
  UserIcon,
  WarningCircle,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import Modal from '../../Modal/Modal';
import Text from '../../Text/Text';
import Badge from '../../Badge/Badge';
import Button from '../../Button/Button';
import Radio from '../../Radio/Radio';
import TextArea from '../../TextArea/TextArea';
import ProgressBar from '../../ProgressBar/ProgressBar';
import { CardAccordation, AccordionGroup } from '../../Accordation';
import {
  AlternativesList,
  type Alternative,
} from '../../Alternative/Alternative';
import useToastStore from '../../Toast/utils/ToastStore';
import { StatCard } from '../../shared/StatCard';
import type { BaseApiClient } from '../../../types/api';
import type {
  StudentActivityPerformanceData,
  StudentActivityPerformanceLabels,
  PerformanceActivity,
  PerformanceLesson,
  LessonQuestion,
} from '../types';
import { DEFAULT_ACTIVITY_PERFORMANCE_LABELS } from '../types';
import { cn } from '../../../utils/utils';

/**
 * Essay correction state for a question
 */
interface EssayCorrectionState {
  isCorrect: boolean | null;
  teacherFeedback: string;
  isSaving: boolean;
  isSaved: boolean;
}

/**
 * Props for StudentActivityPerformanceModal component
 */
export interface StudentActivityPerformanceModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Student activity performance data */
  data: StudentActivityPerformanceData | null;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** API client for saving corrections */
  apiClient?: BaseApiClient;
  /** Custom labels */
  labels?: Partial<StudentActivityPerformanceLabels>;
}

/**
 * Configuration for info card variants
 */
type InfoVariant = 'time' | 'best' | 'hardest';

const infoVariantConfig: Record<
  InfoVariant,
  {
    borderColor: string;
    labelColor: string;
    IconComponent: Icon;
    iconColor: string;
  }
> = {
  time: {
    borderColor: 'border-primary-200',
    labelColor: 'text-primary-600',
    IconComponent: Timer,
    iconColor: 'text-primary-600',
  },
  best: {
    borderColor: 'border-success-200',
    labelColor: 'text-success-600',
    IconComponent: Trophy,
    iconColor: 'text-success-600',
  },
  hardest: {
    borderColor: 'border-error-200',
    labelColor: 'text-error-600',
    IconComponent: Warning,
    iconColor: 'text-error-600',
  },
};

/**
 * Info card for time/best result/hardest topic
 */
const InfoCard = ({
  label,
  value,
  variant,
}: {
  label: string;
  value: string | null;
  variant: InfoVariant;
}) => {
  const config = infoVariantConfig[variant];

  return (
    <div
      className={cn(
        'border rounded-xl py-3 px-4 flex flex-col items-center justify-center gap-2',
        config.borderColor
      )}
    >
      <Text className={cn('text-2xs font-medium uppercase', config.labelColor)}>
        {label}
      </Text>
      <Badge size="large" action="info">
        {value || '-'}
      </Badge>
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
  if (isCorrect) return 'correct';
  if (isSelected) return 'incorrect';
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
 * Get badge action based on isCorrect value
 */
const getBadgeAction = (
  isCorrect: boolean | null
): 'success' | 'error' | 'info' => {
  if (isCorrect === true) return 'success';
  if (isCorrect === false) return 'error';
  return 'info';
};

/**
 * Get badge label based on isCorrect value
 */
const getBadgeLabel = (isCorrect: boolean | null): string => {
  if (isCorrect === true) return 'Correta';
  if (isCorrect === false) return 'Incorreta';
  return 'Pendente';
};

/**
 * Generate a unique key for a question
 * Uses answerId if present, otherwise falls back to activityId-questionId composite
 */
const getQuestionKey = (question: LessonQuestion): string => {
  if (question.answerId) {
    return question.answerId;
  }
  return `${question.activityId}-${question.id}`;
};

/**
 * Lesson item with progress bar
 */
const LessonItem = ({ lesson }: { lesson: PerformanceLesson }) => (
  <div className="bg-background rounded-xl border border-border-50 py-4 px-4 flex flex-col gap-2">
    <Text size="sm" weight="semibold" className="text-text-950">
      {lesson.title}
    </Text>
    <div className="flex items-center gap-2">
      <ProgressBar
        value={lesson.progress}
        size="small"
        variant="blue"
        className="flex-1"
      />
      <Text
        size="xs"
        className="text-primary-700 font-medium min-w-[40px] text-right"
      >
        {lesson.progress}%
      </Text>
    </div>
  </div>
);

/**
 * Loading skeleton
 */
const LoadingSkeleton = () => (
  <div
    data-testid="loading-skeleton"
    className="flex flex-col gap-4 animate-pulse"
  >
    <div className="h-6 bg-background-200 rounded w-48" />
    <div className="grid grid-cols-3 gap-3">
      <div className="h-28 bg-background-200 rounded-xl" />
      <div className="h-28 bg-background-200 rounded-xl" />
      <div className="h-28 bg-background-200 rounded-xl" />
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="h-20 bg-background-200 rounded-xl" />
      <div className="h-20 bg-background-200 rounded-xl" />
      <div className="h-20 bg-background-200 rounded-xl" />
    </div>
  </div>
);

/**
 * Error content
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
 * StudentActivityPerformanceModal component
 *
 * Displays a modal with student activity performance including:
 * - Student name
 * - Result cards (score, correct/incorrect counts, time, best/hardest topics)
 * - Activities list with expandable questions and correction controls
 * - Lessons section with progress bars
 */
export const StudentActivityPerformanceModal = ({
  isOpen,
  onClose,
  data,
  loading = false,
  error = null,
  apiClient,
  labels: customLabels,
}: StudentActivityPerformanceModalProps) => {
  const labels = useMemo(
    () => ({ ...DEFAULT_ACTIVITY_PERFORMANCE_LABELS, ...customLabels }),
    [customLabels]
  );

  // Toast store for notifications
  const addToast = useToastStore((state) => state.addToast);

  // State for essay question corrections (keyed by question id)
  const [essayCorrections, setEssayCorrections] = useState<
    Record<string, EssayCorrectionState>
  >({});

  // Initialize essay corrections from data when modal opens
  useEffect(() => {
    if (isOpen && data) {
      const initialCorrections: Record<string, EssayCorrectionState> = {};

      data.activities.forEach((activity) => {
        activity.questions.forEach((question) => {
          // Initialize all questions with their current state using unique key
          const questionKey = getQuestionKey(question);
          initialCorrections[questionKey] = {
            isCorrect: question.isCorrect,
            teacherFeedback: question.teacherFeedback || '',
            isSaving: false,
            isSaved: question.isCorrect != null,
          };
        });
      });

      setEssayCorrections(initialCorrections);
    }
  }, [isOpen, data]);

  /**
   * Update essay correction state
   * Resets isSaved to false when any field changes so badge only updates after saving
   */
  const updateEssayCorrection = useCallback(
    (
      questionId: string,
      field: 'isCorrect' | 'teacherFeedback',
      value: boolean | string
    ) => {
      setEssayCorrections((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [field]: value,
          // Reset isSaved when any field changes so badge doesn't update until saved
          isSaved: false,
        },
      }));
    },
    []
  );

  /**
   * Handle saving essay question correction
   */
  const handleSaveEssayCorrection = useCallback(
    async (question: LessonQuestion) => {
      if (!apiClient || !data) return;

      const questionKey = getQuestionKey(question);
      const correction = essayCorrections[questionKey];
      if (correction?.isCorrect == null) {
        return;
      }

      setEssayCorrections((prev) => ({
        ...prev,
        [questionKey]: { ...prev[questionKey], isSaving: true },
      }));

      try {
        await apiClient.post(
          `/activities/${question.activityId}/students/${data.userId}/questions/correction`,
          {
            questionId: question.id,
            isCorrect: correction.isCorrect,
            teacherFeedback: correction.teacherFeedback,
          }
        );

        // Mark as saved and show success toast
        setEssayCorrections((prev) => ({
          ...prev,
          [questionKey]: {
            ...prev[questionKey],
            isSaving: false,
            isSaved: true,
          },
        }));

        addToast({
          title: 'Correção salva',
          description: `A correção da questão foi salva com sucesso.`,
          variant: 'solid',
          action: 'success',
          position: 'top-right',
        });
      } catch (err) {
        console.error('Erro ao salvar correção da questão:', err);

        setEssayCorrections((prev) => ({
          ...prev,
          [questionKey]: { ...prev[questionKey], isSaving: false },
        }));

        addToast({
          title: 'Erro ao salvar correção',
          description: 'Não foi possível salvar a correção. Tente novamente.',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
      }
    },
    [apiClient, data, essayCorrections, addToast]
  );

  // Reset corrections when modal closes
  const handleClose = useCallback(() => {
    setEssayCorrections({});
    onClose();
  }, [onClose]);

  /**
   * Render correction fields for a question (radio group, textarea, save button)
   * Same pattern as CorrectActivityModal
   */
  const renderCorrectionFields = (question: LessonQuestion) => {
    const questionKey = getQuestionKey(question);
    const correction = essayCorrections[questionKey] || {
      isCorrect: null,
      teacherFeedback: '',
      isSaving: false,
      isSaved: false,
    };

    let radioValue: string | undefined;
    if (correction.isCorrect === null) {
      radioValue = undefined;
    } else if (correction.isCorrect) {
      radioValue = 'true';
    } else {
      radioValue = 'false';
    }

    return (
      <div className="space-y-4 border-t border-border-100 pt-4 mt-4">
        {/* Is correct radio group */}
        <div className="space-y-2">
          <Text className="text-sm font-semibold text-text-950">
            Resposta está correta?
          </Text>
          <div className="flex gap-4">
            <Radio
              name={`isCorrect-${questionKey}`}
              value="true"
              id={`correct-yes-${questionKey}`}
              label="Sim"
              size="medium"
              checked={radioValue === 'true'}
              onChange={(e) => {
                if (e.target.checked) {
                  updateEssayCorrection(questionKey, 'isCorrect', true);
                }
              }}
            />
            <Radio
              name={`isCorrect-${questionKey}`}
              value="false"
              id={`correct-no-${questionKey}`}
              label="Não"
              size="medium"
              checked={radioValue === 'false'}
              onChange={(e) => {
                if (e.target.checked) {
                  updateEssayCorrection(questionKey, 'isCorrect', false);
                }
              }}
            />
          </div>
        </div>

        {/* Teacher feedback textarea */}
        <div className="space-y-2">
          <Text className="text-sm font-semibold text-text-950">
            Incluir observação
          </Text>
          <TextArea
            value={correction.teacherFeedback}
            onChange={(e) => {
              updateEssayCorrection(
                questionKey,
                'teacherFeedback',
                e.target.value
              );
            }}
            placeholder={labels.feedbackPlaceholder}
            rows={4}
            size="medium"
          />
        </div>

        {/* Save button */}
        <Button
          size="small"
          onClick={() => handleSaveEssayCorrection(question)}
          disabled={correction.isCorrect === null || correction.isSaving}
        >
          {correction.isSaving ? labels.saving : labels.saveCorrection}
        </Button>
      </div>
    );
  };

  /**
   * Render question accordion item inside an activity
   */
  const renderQuestionAccordionItem = (
    question: LessonQuestion,
    index: number
  ) => {
    const questionKey = getQuestionKey(question);

    // Check if we have a local correction
    const localCorrection = essayCorrections[questionKey];
    const hasLocalSavedCorrection =
      localCorrection?.isSaved && localCorrection?.isCorrect != null;

    // Use local correction status if saved, otherwise use original
    const displayIsCorrect = hasLocalSavedCorrection
      ? localCorrection.isCorrect
      : question.isCorrect;

    return (
      <CardAccordation
        key={questionKey}
        value={questionKey}
        className="bg-background rounded-xl border border-border-50"
        triggerClassName="py-4 px-4"
        contentClassName="px-4 pb-4"
        trigger={
          <div className="flex items-center justify-between flex-1">
            <Text size="sm" weight="semibold" className="text-text-950">
              Questão {index + 1}
            </Text>
            <Badge
              size="small"
              action={getBadgeAction(displayIsCorrect)}
              variant="solid"
            >
              {getBadgeLabel(displayIsCorrect)}
            </Badge>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Question statement */}
          <Text size="sm" className="text-text-700">
            {question.statement}
          </Text>

          {/* Alternatives (for multiple choice questions) */}
          {question.alternatives.length > 0 && (
            <CardAccordation
              value={`${questionKey}-alternatives`}
              className="bg-background rounded-lg border border-border-50"
              triggerClassName="py-4 px-4"
              contentClassName="px-4 py-4"
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
          )}

          {/* Correction fields (only for essay questions) */}
          {apiClient &&
            question.questionType === 'DISSERTATIVA' &&
            renderCorrectionFields(question)}
        </div>
      </CardAccordation>
    );
  };

  /**
   * Render activity accordion item
   */
  const renderActivityAccordionItem = (activity: PerformanceActivity) => (
    <CardAccordation
      key={activity.id}
      value={activity.id}
      className="bg-background rounded-xl border border-border-50"
      triggerClassName="py-4 px-4"
      contentClassName="px-4 pb-4"
      trigger={
        <Text size="sm" weight="semibold" className="text-text-950">
          {activity.title}
        </Text>
      }
    >
      <AccordionGroup type="multiple" className="flex flex-col gap-2">
        {activity.questions.map((question, index) =>
          renderQuestionAccordionItem(question, index)
        )}
      </AccordionGroup>
    </CardAccordation>
  );

  if (!data && !loading && !error) {
    return null;
  }

  const renderContent = (): ReactNode => {
    if (loading) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return <ErrorContent message={error} />;
    }

    if (data) {
      const formattedScore = data.score == null ? '-' : data.score.toFixed(1);

      return (
        <div className="flex flex-col gap-5">
          {/* Student name with icon */}
          <div className="flex items-center gap-2">
            <Text
              as="span"
              className="size-8 rounded-full bg-background-100 flex items-center justify-center"
            >
              <UserIcon size={16} className="text-text-500" />
            </Text>
            <Text size="md" weight="medium" className="text-text-950">
              {data.studentName}
            </Text>
          </div>

          {/* Result title */}
          <Text size="md" weight="semibold" className="text-text-950">
            {labels.resultTitle}
          </Text>

          {/* Top row: Score, Correct, Incorrect */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label={labels.scoreLabel}
              value={formattedScore}
              variant="score"
            />
            <StatCard
              label={labels.correctAnswersLabel}
              value={data.correctAnswers}
              variant="correct"
            />
            <StatCard
              label={labels.incorrectAnswersLabel}
              value={data.incorrectAnswers}
              variant="incorrect"
            />
          </div>

          {/* Bottom row: Time, Best Result, Hardest Topic */}
          <div className="grid grid-cols-3 gap-3">
            <InfoCard
              label={labels.completionTimeLabel}
              value={data.completionTime}
              variant="time"
            />
            <InfoCard
              label={labels.bestResultLabel}
              value={data.bestResult}
              variant="best"
            />
            <InfoCard
              label={labels.hardestTopicLabel}
              value={data.hardestTopic}
              variant="hardest"
            />
          </div>

          {/* Activities section */}
          {data.activities.length > 0 && (
            <div className="flex flex-col gap-3">
              <Text size="md" weight="semibold" className="text-text-950">
                {labels.activitiesTitle}
              </Text>
              <AccordionGroup type="single" className="flex flex-col gap-2">
                {data.activities.map((activity) =>
                  renderActivityAccordionItem(activity)
                )}
              </AccordionGroup>
            </div>
          )}

          {/* Lessons section */}
          {data.lessons && data.lessons.length > 0 && (
            <div className="flex flex-col gap-3">
              <Text size="md" weight="semibold" className="text-text-950">
                {labels.lessonsTitle}
              </Text>
              <div className="flex flex-col gap-2">
                {data.lessons.map((lesson) => (
                  <LessonItem key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={labels.title}
      size="lg"
      contentClassName="max-h-[70vh] overflow-y-auto"
    >
      {renderContent()}
    </Modal>
  );
};

export default StudentActivityPerformanceModal;
