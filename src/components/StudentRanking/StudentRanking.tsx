import { type HTMLAttributes } from 'react';
import { TrendUpIcon } from '@phosphor-icons/react/dist/csr/TrendUp';
import { TrendDownIcon } from '@phosphor-icons/react/dist/csr/TrendDown';
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
> & {
  /**
   * Whatever identifies the student to the consumer (an enrollment id, say).
   * Not rendered; it travels back through `onStudentClick`, so a ranking row
   * can open that student's details.
   */
  id?: string;
};

/** Fired when a ranking row is clicked; the variant names which card it was. */
export type StudentRankingClickHandler = (
  student: StudentRankingItem,
  variant: RankingVariant
) => void;

/**
 * Individual student card component
 *
 * Rendered as a button only when the row can be clicked, so a static ranking
 * keeps its plain markup and a clickable one is reachable by keyboard.
 */
const StudentCard = ({
  student,
  variant,
  showPercentage,
  onClick,
}: {
  student: StudentRankingItem;
  variant: RankingVariant;
  showPercentage: boolean;
  onClick?: () => void;
}) => {
  const TrendIcon = variant === 'highlight' ? TrendUpIcon : TrendDownIcon;
  const backgroundClass = getPositionBackgroundClass(variant, student.position);
  const Row = onClick ? 'button' : 'div';

  return (
    <Row
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex flex-row items-center w-full p-4 gap-2 rounded-xl',
        onClick &&
          'text-left cursor-pointer transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
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
      {showPercentage && (
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
      )}
    </Row>
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
  /**
   * Show the percentage badge on the right of each row. Defaults to true.
   *
   * A report whose ranking is not about a percentage — the simulados cut lists
   * students by their band, not by a hit rate — turns it off rather than
   * printing a number the card's title does not promise.
   */
  showPercentage?: boolean;
  /** Makes every row clickable and reports which student was clicked. */
  onStudentClick?: StudentRankingClickHandler;
}

/**
 * Single ranking card component (can be used independently)
 */
export const RankingCard = ({
  title,
  variant,
  students,
  showPercentage = true,
  onStudentClick,
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
        showPercentage={showPercentage}
        onClick={onStudentClick ? () => onStudentClick(student, v) : undefined}
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
  /** Show the percentage badge on each row. Defaults to true. */
  showPercentage?: boolean;
  /**
   * Makes every row of both cards clickable and reports which student was
   * clicked, with the card it sits in. Left out, the rows stay static.
   */
  onStudentClick?: StudentRankingClickHandler;
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
  showPercentage = true,
  onStudentClick,
  className,
  ...props
}: StudentRankingProps) => {
  return (
    <RankingLayout className={className} {...props}>
      <RankingCard
        title={highlightTitle}
        variant="highlight"
        students={highlightStudents}
        showPercentage={showPercentage}
        onStudentClick={onStudentClick}
      />
      <RankingCard
        title={attentionTitle}
        variant="attention"
        students={attentionStudents}
        showPercentage={showPercentage}
        onStudentClick={onStudentClick}
      />
    </RankingLayout>
  );
};

export default StudentRanking;
