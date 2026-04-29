import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { Medal, Warning } from 'phosphor-react';
import type {
  RankingVariant,
  SimuladosStudentRankingItem,
  SimuladosStudentRankingProps,
  SimuladosRankingCardProps,
} from './types';

/**
 * Format score based on score type
 */
function formatScore(value: number, scoreType: 'percentage' | 'tri'): string {
  if (scoreType === 'tri') {
    return Math.round(value).toString();
  }
  return `${value.toFixed(1).replace('.', ',')}%`;
}

/**
 * Position background colors by variant
 */
const POSITION_BACKGROUNDS: Record<RankingVariant, Record<number, string>> = {
  highlight: {
    1: 'bg-success-100',
    2: 'bg-success-50',
    3: 'bg-success-25',
  },
  attention: {
    1: 'bg-error-100',
    2: 'bg-error-50',
    3: 'bg-error-25',
  },
};

/**
 * Badge background colors by variant
 */
const BADGE_BACKGROUNDS: Record<RankingVariant, string> = {
  highlight: 'bg-warning-300',
  attention: 'bg-error-300',
};

/**
 * Score badge classes by variant
 */
const SCORE_BADGE_CLASSES: Record<RankingVariant, string> = {
  highlight: 'bg-success-200 text-success-900',
  attention: 'bg-error-200 text-error-900',
};

/**
 * Individual student card
 */
function StudentCard({
  student,
  variant,
  scoreType = 'percentage',
}: {
  student: SimuladosStudentRankingItem;
  variant: RankingVariant;
  scoreType?: 'percentage' | 'tri';
}) {
  const backgroundClass =
    POSITION_BACKGROUNDS[variant][student.position] || 'bg-background-50';

  return (
    <div
      className={cn(
        'flex flex-row items-center w-full p-4 gap-2 rounded-xl',
        backgroundClass
      )}
    >
      {/* Position badge */}
      <Text
        size="xs"
        weight="bold"
        className={cn(
          'w-5 h-5 rounded-full flex items-center justify-center text-text',
          BADGE_BACKGROUNDS[variant]
        )}
      >
        {student.position}
      </Text>

      {/* Student name */}
      <Text
        size="sm"
        weight="bold"
        className="flex-1 min-w-0 text-text-950 tracking-[0.2px] truncate"
      >
        {student.name}
      </Text>

      {/* Score badge */}
      <Text
        size="xs"
        weight="bold"
        className={cn(
          'flex flex-row items-center h-[22px] px-2 rounded text-text',
          SCORE_BADGE_CLASSES[variant]
        )}
      >
        {formatScore(student.average, scoreType)}
      </Text>
    </div>
  );
}

/**
 * Ranking card component
 */
export function SimuladosRankingCard({
  title,
  variant,
  students,
  icon,
  scoreType = 'percentage',
}: SimuladosRankingCardProps) {
  return (
    <div className="flex flex-col gap-4 p-5 bg-background border border-border-50 rounded-xl flex-1">
      <div className="flex items-center justify-between">
        <Text size="md" weight="semibold" className="text-text-950">
          {title}
        </Text>
        {icon}
      </div>
      <div className="flex flex-col gap-2">
        {students.map((student) => (
          <StudentCard
            key={`${variant}-${student.position}`}
            student={student}
            variant={variant}
            scoreType={scoreType}
          />
        ))}
        {students.length === 0 && (
          <Text size="sm" className="text-text-500 text-center py-4">
            Nenhum estudante encontrado
          </Text>
        )}
      </div>
    </div>
  );
}

/**
 * SimuladosStudentRanking - Student ranking component for simulated exams
 *
 * Displays two cards side by side:
 * - Highlight: Top performing students (with medal icon)
 * - Attention: Students needing attention (with warning icon)
 *
 * Supports both percentage (0-100%) and TRI (0-1000) score display.
 *
 * @example
 * ```tsx
 * <SimuladosStudentRanking
 *   highlightStudents={[
 *     { position: 1, name: 'João', average: 85.5 },
 *     { position: 2, name: 'Maria', average: 82.3 },
 *   ]}
 *   attentionStudents={[
 *     { position: 1, name: 'Pedro', average: 45.2 },
 *     { position: 2, name: 'Ana', average: 48.7 },
 *   ]}
 *   scoreType="percentage"
 * />
 * ```
 */
export function SimuladosStudentRanking({
  highlightTitle = 'Estudantes em destaque',
  attentionTitle = 'Estudantes com maior dificuldade',
  highlightStudents,
  attentionStudents,
  scoreType = 'percentage',
}: SimuladosStudentRankingProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SimuladosRankingCard
        title={highlightTitle}
        variant="highlight"
        students={highlightStudents}
        icon={<Medal size={20} weight="fill" className="text-warning-500" />}
        scoreType={scoreType}
      />
      <SimuladosRankingCard
        title={attentionTitle}
        variant="attention"
        students={attentionStudents}
        icon={<Warning size={20} weight="fill" className="text-error-500" />}
        scoreType={scoreType}
      />
    </div>
  );
}

export default SimuladosStudentRanking;
