import { HTMLAttributes } from 'react';
import { Trophy, Warning, TrendUp, TrendDown } from 'phosphor-react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

/**
 * Student data item for the ranking
 */
export interface StudentRankingItem {
  /** Student position in the ranking */
  position: number;
  /** Student name */
  name: string;
  /** Performance percentage (0-100) */
  percentage: number;
}

/**
 * Card variant type
 */
export type StudentRankingVariant = 'highlight' | 'attention';

/**
 * Props for individual student card
 */
interface StudentCardProps {
  student: StudentRankingItem;
  variant: StudentRankingVariant;
}

/**
 * Lookup table for card background colors by position
 * Position 1 = most intense, Position 3+ = lightest
 */
const CARD_BACKGROUND_CLASSES = {
  highlight: {
    1: 'bg-success-200',
    2: 'bg-success-100',
    3: 'bg-success-background',
  },
  attention: {
    1: 'bg-error-200',
    2: 'bg-error-100',
    3: 'bg-error-background',
  },
} as const;

/**
 * Lookup table for badge background colors
 */
const BADGE_BACKGROUND_CLASSES = {
  highlight: 'bg-indicator-positive',
  attention: 'bg-indicator-negative',
} as const;

/**
 * Lookup table for percentage badge background colors
 */
const PERCENTAGE_BADGE_CLASSES = {
  highlight: 'bg-success-700',
  attention: 'bg-indicator-negative',
} as const;

/**
 * Lookup table for header badge background colors
 */
const HEADER_BADGE_CLASSES = {
  highlight: 'bg-indicator-positive',
  attention: 'bg-indicator-negative',
} as const;

/**
 * Get background class based on position (1, 2, or 3+)
 */
const getPositionBackgroundClass = (
  variant: StudentRankingVariant,
  position: number
): string => {
  const positionKey = Math.max(1, Math.min(position, 3)) as 1 | 2 | 3;
  return CARD_BACKGROUND_CLASSES[variant][positionKey];
};

/**
 * Individual student card component
 */
const StudentCard = ({ student, variant }: StudentCardProps) => {
  const TrendIcon = variant === 'highlight' ? TrendUp : TrendDown;
  const backgroundClass = getPositionBackgroundClass(variant, student.position);

  return (
    <div
      className={cn(
        'flex flex-row items-center w-full p-4 gap-2 rounded-xl',
        backgroundClass
      )}
    >
      {/* Position badge */}
      <span
        aria-label={`Posição ${student.position}`}
        className={cn(
          'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-text',
          BADGE_BACKGROUND_CLASSES[variant]
        )}
      >
        {student.position}
      </span>

      {/* Student name */}
      <Text
        size="sm"
        weight="bold"
        className="flex-1 min-w-0 text-text-950 tracking-[0.2px] truncate"
      >
        {student.name}
      </Text>

      {/* Percentage badge */}
      <span
        aria-label={`Desempenho ${student.percentage}%`}
        className={cn(
          'flex flex-row items-center h-[22px] px-2 gap-1 rounded text-xs font-bold text-text',
          PERCENTAGE_BADGE_CLASSES[variant]
        )}
      >
        <TrendIcon size={16} weight="bold" aria-hidden="true" />
        {student.percentage}%
      </span>
    </div>
  );
};

/**
 * Props for a single ranking card
 */
export interface RankingCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card title */
  title: string;
  /** Card variant: highlight (best students) or attention (needs attention) */
  variant: StudentRankingVariant;
  /** List of students to display */
  students: StudentRankingItem[];
}

/**
 * Single ranking card component (can be used independently)
 */
export const RankingCard = ({
  title,
  variant,
  students,
  className,
  ...props
}: RankingCardProps) => {
  const HeaderIcon = variant === 'highlight' ? Trophy : Warning;

  return (
    <div
      className={cn(
        'flex flex-col flex-1 min-h-[254px] p-5 gap-4 bg-background border border-border-50 rounded-xl',
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex flex-row justify-between items-center h-6 gap-4">
        <Text
          as="h3"
          size="lg"
          weight="bold"
          className="text-text-950 tracking-[0.2px]"
        >
          {title}
        </Text>

        {/* Header badge with icon */}
        <span
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center',
            HEADER_BADGE_CLASSES[variant]
          )}
        >
          <HeaderIcon
            size={14}
            weight="fill"
            className={variant === 'highlight' ? 'text-text-950' : 'text-text'}
          />
        </span>
      </div>

      {/* Students list */}
      <div className="flex flex-col gap-2">
        {students.map((student, index) => (
          <StudentCard
            key={`${variant}-${index}-${student.position}`}
            student={student}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Props for the StudentRanking component
 */
export interface StudentRankingProps extends HTMLAttributes<HTMLDivElement> {
  /** Title for the highlight (best students) card */
  highlightTitle?: string;
  /** Title for the attention (needs attention) card */
  attentionTitle?: string;
  /** List of highlighted (best performing) students */
  highlightStudents: StudentRankingItem[];
  /** List of students needing attention (lowest performing) */
  attentionStudents: StudentRankingItem[];
}

/**
 * StudentRanking component - displays two cards side by side showing
 * the best performing students and students that need attention.
 *
 * @example
 * ```tsx
 * <StudentRanking
 *   highlightTitle="Estudantes em destaque"
 *   attentionTitle="Estudantes precisando de atenção"
 *   highlightStudents={[
 *     { position: 1, name: 'Valentina Ribeiro', percentage: 100 },
 *     { position: 2, name: 'Lucas Almeida', percentage: 100 },
 *     { position: 3, name: 'Fernanda Costa', percentage: 100 },
 *   ]}
 *   attentionStudents={[
 *     { position: 1, name: 'Ricardo Silva', percentage: 80 },
 *     { position: 2, name: 'Juliana Santos', percentage: 50 },
 *     { position: 3, name: 'Gabriel Oliveira', percentage: 40 },
 *   ]}
 * />
 * ```
 */
export const StudentRanking = ({
  highlightTitle = 'Estudantes em destaque',
  attentionTitle = 'Estudantes precisando de atenção',
  highlightStudents,
  attentionStudents,
  className,
  ...props
}: StudentRankingProps) => {
  return (
    <div
      className={cn('flex flex-col md:flex-row w-full gap-4', className)}
      {...props}
    >
      <RankingCard
        title={highlightTitle}
        variant="highlight"
        students={highlightStudents}
      />
      <RankingCard
        title={attentionTitle}
        variant="attention"
        students={attentionStudents}
      />
    </div>
  );
};

export default StudentRanking;
