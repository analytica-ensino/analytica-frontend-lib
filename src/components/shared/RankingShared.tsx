import { Fragment, type HTMLAttributes, type ReactNode } from 'react';
import { Trophy, Warning } from 'phosphor-react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

/**
 * Shared ranking variant type
 */
export type RankingVariant = 'highlight' | 'attention';

/**
 * Card background colors by position (1 = most intense, 3+ = lightest)
 */
export const CARD_BACKGROUND_CLASSES = {
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
 * Position badge background colors
 */
export const BADGE_BACKGROUND_CLASSES = {
  highlight: 'bg-indicator-positive',
  attention: 'bg-indicator-negative',
} as const;

/**
 * Percentage badge background colors
 */
export const PERCENTAGE_BADGE_CLASSES = {
  highlight: 'bg-success-700',
  attention: 'bg-indicator-negative',
} as const;

/**
 * Header badge background colors
 */
export const HEADER_BADGE_CLASSES = {
  highlight: 'bg-indicator-positive',
  attention: 'bg-indicator-negative',
} as const;

/**
 * Get background class based on position (1, 2, or 3+)
 */
export const getPositionBackgroundClass = (
  variant: RankingVariant,
  position: number
): string => {
  const positionKey = Math.max(1, Math.min(position, 3)) as 1 | 2 | 3;
  return CARD_BACKGROUND_CLASSES[variant][positionKey];
};

/**
 * Generic ranking card wrapper — renders a header (title + icon badge)
 * followed by a list of items using the provided render function.
 */
export interface BaseRankingCardProps<T>
  extends HTMLAttributes<HTMLDivElement> {
  title: string;
  variant: RankingVariant;
  items: T[];
  renderItem: (item: T, variant: RankingVariant, index: number) => ReactNode;
  /** Override the default header icon (Trophy/Warning) */
  headerIcon?: ReactNode;
}

export function BaseRankingCard<T>({
  title,
  variant,
  items,
  renderItem,
  headerIcon,
  className,
  ...props
}: Readonly<BaseRankingCardProps<T>>) {
  const DefaultIcon = variant === 'highlight' ? Trophy : Warning;

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

        <span
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center',
            HEADER_BADGE_CLASSES[variant]
          )}
        >
          {headerIcon ?? (
            <DefaultIcon
              size={14}
              weight="fill"
              className={
                variant === 'highlight' ? 'text-text-950' : 'text-text'
              }
            />
          )}
        </span>
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <Fragment key={index}>{renderItem(item, variant, index)}</Fragment>
        ))}
      </div>
    </div>
  );
}

/**
 * Two-card side-by-side responsive layout for ranking components
 */
export interface RankingLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function RankingLayout({
  children,
  className,
  ...props
}: Readonly<RankingLayoutProps>) {
  return (
    <div
      className={cn('flex flex-col md:flex-row w-full gap-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
