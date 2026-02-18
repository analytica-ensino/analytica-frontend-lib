import { type HTMLAttributes } from 'react';
import { TrendUp, TrendDown } from 'phosphor-react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import type { StudentHighlightItem } from '../../hooks/useStudentsHighlight';
import {
  type RankingVariant,
  BADGE_BACKGROUND_CLASSES,
  PERCENTAGE_BADGE_CLASSES,
  getPositionBackgroundClass,
  BaseRankingCard,
  RankingLayout,
} from '../shared/RankingShared';

/**
 * Re-export RankingVariant as StudentRankingVariant for backwards compatibility
 */
export type StudentRankingVariant = RankingVariant;

/**
 * Re-export StudentHighlightItem as StudentRankingItem for backwards compatibility
 * and direct usage with the component
 */
export type StudentRankingItem = Pick<
  StudentHighlightItem,
  'position' | 'name' | 'percentage'
>;

/**
 * Individual student card component
 */
const StudentCard = ({
  student,
  variant,
}: {
  student: StudentRankingItem;
  variant: RankingVariant;
}) => {
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
      <Text
        size="xs"
        weight="bold"
        aria-label={`Posição ${student.position}`}
        className={cn(
          'w-5 h-5 rounded-full flex items-center justify-center text-text',
          BADGE_BACKGROUND_CLASSES[variant]
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

      {/* Percentage badge */}
      <Text
        size="xs"
        weight="bold"
        aria-label={`Desempenho ${student.percentage}%`}
        className={cn(
          'flex flex-row items-center h-[22px] px-2 gap-1 rounded text-text',
          PERCENTAGE_BADGE_CLASSES[variant]
        )}
      >
        <TrendIcon size={16} weight="bold" aria-hidden="true" />
        {student.percentage}%
      </Text>
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
  variant: RankingVariant;
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
}: RankingCardProps) => (
  <BaseRankingCard
    title={title}
    variant={variant}
    items={students}
    renderItem={(student, v, index) => (
      <StudentCard
        key={`${v}-${index}-${student.position}`}
        student={student}
        variant={v}
      />
    )}
    className={className}
    {...props}
  />
);

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
    <RankingLayout className={className} {...props}>
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
    </RankingLayout>
  );
};

export default StudentRanking;
