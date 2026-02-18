import { type HTMLAttributes } from 'react';
import { TrendUp, TrendDown } from 'phosphor-react';
import { MedalIcon, SealWarningIcon } from '@phosphor-icons/react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import {
  type RankingVariant,
  BADGE_BACKGROUND_CLASSES,
  PERCENTAGE_BADGE_CLASSES,
  getPositionBackgroundClass,
  BaseRankingCard,
  RankingLayout,
} from '../shared/RankingShared';

/**
 * Single item in the performance ranking
 */
export interface PerformanceRankingItem {
  position: number;
  name: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | null;
  /** Only present when groupedBy = 'class' */
  shift?: string;
  /** Only present when groupedBy = 'class' */
  grade?: string;
}

/**
 * How the ranking data is grouped
 */
export type GroupedBy = 'state' | 'municipality' | 'class';

/**
 * Full ranking data from the API
 */
export interface PerformanceRankingData {
  groupedBy: GroupedBy;
  highlighted: (PerformanceRankingItem | null)[];
  needsAttention: (PerformanceRankingItem | null)[];
}

/**
 * Props for the PerformanceRanking component
 */
export interface PerformanceRankingProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Ranking data from the API */
  data: PerformanceRankingData;
  /** Title for the highlight card */
  highlightTitle?: string;
  /** Title for the attention card */
  attentionTitle?: string;
  /** Label displayed next to the count value (e.g. "estudantes") */
  countLabel?: string;
}

/**
 * Position badge text color per variant
 */
const POSITION_TEXT_CLASSES = {
  highlight: 'text-text-950',
  attention: 'text-text',
} as const;

/**
 * Count badge classes — neutral color to distinguish from percentage
 */
const COUNT_BADGE_CLASSES = {
  highlight: 'bg-success-background text-success-800',
  attention: 'bg-error-background text-error-800',
} as const;

/**
 * Render the trend icon based on the item's trend value
 */
function TrendIcon({
  trend,
  variant,
}: Readonly<{
  trend: 'up' | 'down' | null;
  variant: RankingVariant;
}>) {
  if (trend === 'up') {
    return <TrendUp size={16} weight="bold" aria-hidden="true" />;
  }
  if (trend === 'down') {
    return <TrendDown size={16} weight="bold" aria-hidden="true" />;
  }
  // Intentional UX decision: when the API returns null (trend unavailable),
  // we show the variant's default direction (up for highlight, down for attention)
  // so the badge layout stays uniform across all rows — confirmed in Figma.
  const DefaultIcon = variant === 'highlight' ? TrendUp : TrendDown;
  return <DefaultIcon size={16} weight="bold" aria-hidden="true" />;
}

/**
 * Individual performance ranking item card
 */
/**
 * Build the display name including shift/grade inline when present.
 * e.g. "Turma A (Manhã) (3° ano)"
 */
function buildDisplayName(item: PerformanceRankingItem): string {
  const parts = [item.name];
  if (item.shift) parts.push(`(${item.shift})`);
  if (item.grade) parts.push(`(${item.grade})`);
  return parts.join(' ');
}

function PerformanceItemCard({
  item,
  variant,
  countLabel,
}: Readonly<{
  item: PerformanceRankingItem;
  variant: RankingVariant;
  countLabel?: string;
}>) {
  const backgroundClass = getPositionBackgroundClass(variant, item.position);
  const displayName = buildDisplayName(item);
  const countText = countLabel
    ? `${item.count} ${countLabel}`
    : String(item.count);

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
        aria-label={`Position ${item.position}`}
        className={cn(
          'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
          POSITION_TEXT_CLASSES[variant],
          BADGE_BACKGROUND_CLASSES[variant]
        )}
      >
        {item.position}
      </Text>

      {/* Name (with shift/grade inline) */}
      <Text
        size="sm"
        weight="bold"
        className="flex-1 min-w-0 text-text-950 tracking-[0.2px] truncate"
      >
        {displayName}
      </Text>

      {/* Count badge */}
      <Text
        size="xs"
        aria-label={`Count ${item.count}`}
        className={cn(
          'flex-shrink-0 h-[22px] px-2 flex items-center rounded',
          COUNT_BADGE_CLASSES[variant]
        )}
      >
        {countText}
      </Text>

      {/* Percentage badge with trend */}
      <Text
        size="xs"
        weight="bold"
        aria-label={`Performance ${item.percentage}%`}
        className={cn(
          'flex flex-row items-center flex-shrink-0 h-[22px] px-2 gap-1 rounded text-text',
          PERCENTAGE_BADGE_CLASSES[variant]
        )}
      >
        <TrendIcon trend={item.trend} variant={variant} />
        {item.percentage}%
      </Text>
    </div>
  );
}

/**
 * Render a single ranking item (handles null items)
 */
function createRenderPerformanceItem(countLabel?: string) {
  return function renderPerformanceItem(
    item: PerformanceRankingItem | null,
    variant: RankingVariant,
    index: number
  ) {
    if (!item) {
      return (
        <div
          key={`${variant}-empty-${index}`}
          className="flex items-center justify-center w-full p-4 rounded-xl bg-background-50 border border-dashed border-border-100"
        >
          <Text size="xs" className="text-text-400">
            Sem dados
          </Text>
        </div>
      );
    }

    return (
      <PerformanceItemCard
        key={`${variant}-${index}-${item.position}`}
        item={item}
        variant={variant}
        countLabel={countLabel}
      />
    );
  };
}

/**
 * PerformanceRanking component — displays two cards side by side showing
 * highlighted regions/municipalities/classes and those needing attention.
 *
 * Supports nullable items, per-item trend indicators, count badges,
 * and optional shift/grade info for class grouping.
 *
 * @example
 * ```tsx
 * <PerformanceRanking
 *   data={{
 *     groupedBy: 'state',
 *     highlighted: [
 *       { position: 1, name: 'SP', count: 150, percentage: 85, trend: 'up' },
 *       { position: 2, name: 'RJ', count: 120, percentage: 78, trend: 'down' },
 *       { position: 3, name: 'MG', count: 100, percentage: 72, trend: null },
 *     ],
 *     needsAttention: [
 *       { position: 1, name: 'BA', count: 30, percentage: 25, trend: 'down' },
 *       { position: 2, name: 'PE', count: 35, percentage: 28, trend: null },
 *       { position: 3, name: 'CE', count: 40, percentage: 32, trend: 'up' },
 *     ],
 *   }}
 * />
 * ```
 */
export const PerformanceRanking = ({
  data,
  highlightTitle = 'Em destaque',
  attentionTitle = 'Precisando de atenção',
  countLabel,
  className,
  ...props
}: PerformanceRankingProps) => {
  const renderItem = createRenderPerformanceItem(countLabel);

  return (
    <RankingLayout className={className} {...props}>
      <BaseRankingCard
        title={highlightTitle}
        variant="highlight"
        items={data.highlighted}
        renderItem={renderItem}
        headerIcon={<MedalIcon size={14} className="text-text-950" />}
      />
      <BaseRankingCard
        title={attentionTitle}
        variant="attention"
        items={data.needsAttention}
        renderItem={renderItem}
        headerIcon={<SealWarningIcon size={14} className="text-text" />}
      />
    </RankingLayout>
  );
};

export default PerformanceRanking;
