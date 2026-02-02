import { Star, Medal, WarningCircle } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import Text from '../../Text/Text';
import { cn } from '../../../utils/utils';

/**
 * Available variants for the StatCard component
 */
export type StatVariant = 'score' | 'correct' | 'incorrect';

/**
 * Configuration for each stat card variant
 */
export const variantConfig: Record<
  StatVariant,
  {
    bg: string;
    text: string;
    iconBg: string;
    iconColor: string;
    IconComponent: Icon;
  }
> = {
  score: {
    bg: 'bg-warning-background',
    text: 'text-warning-600',
    iconBg: 'bg-warning-300',
    iconColor: 'text-white',
    IconComponent: Star,
  },
  correct: {
    bg: 'bg-success-200',
    text: 'text-success-700',
    iconBg: 'bg-indicator-positive',
    iconColor: 'text-text-950',
    IconComponent: Medal,
  },
  incorrect: {
    bg: 'bg-error-100',
    text: 'text-error-700',
    iconBg: 'bg-indicator-negative',
    iconColor: 'text-white',
    IconComponent: WarningCircle,
  },
};

/**
 * Props for the StatCard component
 */
export interface StatCardProps {
  /** Label text displayed above the value */
  label: string;
  /** Value to display (can be string or number) */
  value: string | number;
  /** Visual variant determining colors and icon */
  variant: StatVariant;
  /** Optional additional className */
  className?: string;
}

/**
 * StatCard component for displaying statistics with an icon
 *
 * Used in activity correction and performance modals to show
 * score, correct answers count, and incorrect answers count.
 *
 * @example
 * ```tsx
 * <StatCard label="NOTA" value="8.5" variant="score" />
 * <StatCard label="CORRETAS" value={10} variant="correct" />
 * <StatCard label="INCORRETAS" value={2} variant="incorrect" />
 * ```
 */
export const StatCard = ({
  label,
  value,
  variant,
  className,
}: StatCardProps) => {
  const config = variantConfig[variant];
  const IconComponent = config.IconComponent;

  return (
    <div
      className={cn(
        'border border-border-50 rounded-xl py-4 px-3 flex flex-col items-center justify-center gap-1',
        config.bg,
        className
      )}
    >
      <div
        className={cn(
          'w-[30px] h-[30px] rounded-2xl flex items-center justify-center',
          config.iconBg
        )}
      >
        <IconComponent
          size={16}
          className={config.iconColor}
          weight="regular"
        />
      </div>
      <Text
        className={cn('text-2xs font-bold uppercase text-center', config.text)}
      >
        {label}
      </Text>
      <Text className={cn('text-xl font-bold', config.text)}>{value}</Text>
    </div>
  );
};

export default StatCard;
