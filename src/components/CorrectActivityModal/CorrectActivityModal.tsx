import { useState } from 'react';
import { CaretDown, CaretUp } from 'phosphor-react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import { cn } from '../../utils/utils';
import {
  type StudentActivityCorrectionData,
  type StudentQuestion,
  getQuestionStatusBadgeConfig,
} from '../../types/studentActivityCorrection';

/**
 * Props for the CorrectActivityModal component
 */
export interface CorrectActivityModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Student activity correction data */
  data: StudentActivityCorrectionData | null;
  /** Whether the modal is in view-only mode */
  isViewOnly?: boolean;
  /** Callback when observation is submitted */
  onObservationSubmit?: (observation: string) => void;
}

/**
 * Props for the StatCard component
 */
interface StatCardProps {
  label: string;
  value: string | number;
  variant: 'score' | 'correct' | 'incorrect';
}

/**
 * Stat card component for displaying statistics
 * @param props - Component props
 * @returns JSX element
 */
const StatCard = ({ label, value, variant }: StatCardProps) => {
  const variantStyles = {
    score: {
      bg: 'bg-error-100',
      text: 'text-error-700',
    },
    correct: {
      bg: 'bg-success-200',
      text: 'text-success-700',
    },
    incorrect: {
      bg: 'bg-error-100',
      text: 'text-error-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-4 rounded-xl',
        styles.bg
      )}
    >
      <Text className={cn('text-2xs font-bold uppercase', styles.text)}>
        {label}
      </Text>
      <Text className={cn('text-2xl font-bold', styles.text)}>{value}</Text>
    </div>
  );
};

/**
 * Props for the QuestionRow component
 */
interface QuestionRowProps {
  question: StudentQuestion;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Question row component for displaying question details
 * @param props - Component props
 * @returns JSX element
 */
const QuestionRow = ({ question, isExpanded, onToggle }: QuestionRowProps) => {
  const badgeConfig = getQuestionStatusBadgeConfig(question.status);

  return (
    <div className="border border-border-100 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-background-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Text className="text-sm font-medium text-text-950">
            Questão {question.questionNumber}
          </Text>
          <Badge
            className={cn(
              'text-xs px-2 py-1',
              badgeConfig.bgColor,
              badgeConfig.textColor
            )}
          >
            {badgeConfig.label}
          </Badge>
        </div>
        {isExpanded ? (
          <CaretUp size={16} className="text-text-500" />
        ) : (
          <CaretDown size={16} className="text-text-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-border-100 pt-3">
          <div className="flex gap-2">
            <Text className="text-xs text-text-500">Resposta do aluno:</Text>
            <Text className="text-xs text-text-700">
              {question.studentAnswer || 'Não respondeu'}
            </Text>
          </div>
          <div className="flex gap-2">
            <Text className="text-xs text-text-500">Resposta correta:</Text>
            <Text className="text-xs text-success-700">
              {question.correctAnswer || '-'}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Modal component for correcting or viewing student activity details
 *
 * Displays student information, statistics cards, observation section,
 * and a list of questions with their status.
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <CorrectActivityModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   data={studentData}
 *   isViewOnly={false}
 *   onObservationSubmit={(obs) => console.log(obs)}
 * />
 * ```
 */
const CorrectActivityModal = ({
  isOpen,
  onClose,
  data,
  isViewOnly = false,
  onObservationSubmit,
}: CorrectActivityModalProps) => {
  const [observation, setObservation] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );

  /**
   * Toggle question expansion
   * @param questionNumber - Question number to toggle
   */
  const toggleQuestion = (questionNumber: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionNumber)) {
        newSet.delete(questionNumber);
      } else {
        newSet.add(questionNumber);
      }
      return newSet;
    });
  };

  /**
   * Handle observation submit
   */
  const handleIncludeObservation = () => {
    if (observation.trim()) {
      onObservationSubmit?.(observation);
      setObservation('');
    }
  };

  if (!data) return null;

  const title = isViewOnly ? 'Detalhes da atividade' : 'Corrigir atividade';
  const formattedScore = data.score !== null ? data.score.toFixed(1) : '-';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      contentClassName="max-h-[80vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Student Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Text className="text-lg font-semibold text-primary-700">
              {data.studentName.charAt(0).toUpperCase()}
            </Text>
          </div>
          <Text className="text-lg font-medium text-text-950">
            {data.studentName}
          </Text>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Nota" value={formattedScore} variant="score" />
          <StatCard
            label="N° de questões corretas"
            value={data.correctCount}
            variant="correct"
          />
          <StatCard
            label="N° de questões incorretas"
            value={data.incorrectCount}
            variant="incorrect"
          />
        </div>

        {/* Observation Section */}
        {!isViewOnly && (
          <div className="space-y-2">
            <Text className="text-sm font-medium text-text-700">
              Observações
            </Text>
            <div className="flex gap-2">
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Adicionar observação..."
                className="flex-1 min-h-[80px] p-3 border border-border-100 rounded-lg text-sm text-text-700 placeholder:text-text-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                variant="outline"
                size="small"
                onClick={handleIncludeObservation}
                className="self-end"
              >
                Incluir
              </Button>
            </div>
            {data.observation && (
              <div className="p-3 bg-background-50 rounded-lg">
                <Text className="text-xs text-text-500">
                  Observação anterior:
                </Text>
                <Text className="text-sm text-text-700">
                  {data.observation}
                </Text>
              </div>
            )}
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-2">
          <Text className="text-sm font-medium text-text-700">Questões</Text>
          <div className="space-y-2">
            {data.questions.map((question) => (
              <QuestionRow
                key={question.questionNumber}
                question={question}
                isExpanded={expandedQuestions.has(question.questionNumber)}
                onToggle={() => toggleQuestion(question.questionNumber)}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CorrectActivityModal;
