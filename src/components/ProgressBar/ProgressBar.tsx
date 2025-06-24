import { ReactNode } from 'react';
import Text from '../Text/Text';

/**
 * Progress bar size variants
 */
type ProgressBarSize = 'small' | 'medium';

/**
 * Progress bar color variants
 */
type ProgressBarVariant = 'blue' | 'green';

/**
 * Progress bar layout variants
 */
type ProgressBarLayout = 'default' | 'stacked' | 'compact';

/**
 * Size configurations using Tailwind classes
 */
const SIZE_CLASSES = {
  small: {
    container: 'h-1', // 4px height (h-1 = 4px in Tailwind)
    bar: 'h-1', // 4px height for the fill bar
    spacing: 'gap-2', // 8px gap between label and progress bar
    layout: 'flex-col', // vertical layout for small
    borderRadius: 'rounded-full', // 9999px border radius
  },
  medium: {
    container: 'h-2', // 8px height (h-2 = 8px in Tailwind)
    bar: 'h-2', // 8px height for the fill bar
    spacing: 'gap-2', // 8px gap between progress bar and label
    layout: 'flex-row items-center', // horizontal layout for medium
    borderRadius: 'rounded-lg', // 8px border radius
  },
} as const;

/**
 * Color configurations using design system colors
 */
const VARIANT_CLASSES = {
  blue: {
    background: 'bg-background-300', // Background track color (#D5D4D4)
    fill: 'bg-primary-700', // Blue for activity progress (#2271C4)
  },
  green: {
    background: 'bg-background-300', // Background track color (#D5D4D4)
    fill: 'bg-success-200', // Green for performance (#84D3A2)
  },
} as const;

/**
 * Type for size classes
 */
type SizeClassType = (typeof SIZE_CLASSES)[keyof typeof SIZE_CLASSES];

/**
 * Type for variant classes
 */
type VariantClassType = (typeof VARIANT_CLASSES)[keyof typeof VARIANT_CLASSES];

/**
 * ProgressBar component props interface
 */
export type ProgressBarProps = {
  /** Progress value between 0 and 100 */
  value: number;
  /** Maximum value (defaults to 100) */
  max?: number;
  /** Size variant of the progress bar */
  size?: ProgressBarSize;
  /** Color variant of the progress bar */
  variant?: ProgressBarVariant;
  /** Layout variant of the progress bar */
  layout?: ProgressBarLayout;
  /** Optional label to display */
  label?: ReactNode;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show hit count (e.g., "28 de 30") instead of percentage */
  showHitCount?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Label CSS classes */
  labelClassName?: string;
  /** Percentage text CSS classes */
  percentageClassName?: string;
  /** Custom width for stacked layout (defaults to w-[380px]) */
  stackedWidth?: string;
  /** Custom height for stacked layout (defaults to h-[35px]) */
  stackedHeight?: string;
  /** Custom width for compact layout (defaults to w-[131px]) */
  compactWidth?: string;
  /** Custom height for compact layout (defaults to h-[24px]) */
  compactHeight?: string;
};

/**
 * Helper function to calculate safe progress values
 */
const calculateProgressValues = (value: number, max: number) => {
  const safeValue = isNaN(value) ? 0 : value;
  const clampedValue = Math.max(0, Math.min(safeValue, max));
  const percentage = max === 0 ? 0 : (clampedValue / max) * 100;

  return { clampedValue, percentage };
};

/**
 * Helper function to determine if header content should be shown
 */
const shouldShowHeader = (
  label: ReactNode,
  showPercentage: boolean,
  showHitCount: boolean
): boolean => {
  return !!(label || showPercentage || showHitCount);
};

/**
 * Helper function to get compact layout configuration
 */
const getCompactLayoutConfig = (
  showPercentage: boolean,
  showHitCount: boolean,
  percentage: number,
  clampedValue: number,
  max: number,
  label: ReactNode,
  percentageClassName: string,
  labelClassName: string
) => {
  const hasMetrics = showPercentage || showHitCount;

  return {
    color: hasMetrics ? 'text-primary-600' : 'text-primary-700',
    className: hasMetrics ? percentageClassName : labelClassName,
    content: showPercentage
      ? `${Math.round(percentage)}%`
      : showHitCount
        ? `${Math.round(clampedValue)} de ${max}`
        : label,
  };
};

/**
 * Helper function to get default layout display configuration
 */
const getDefaultLayoutDisplayConfig = (
  size: ProgressBarSize,
  label: ReactNode,
  showPercentage: boolean
) => ({
  showHeader: size === 'small' && !!(label || showPercentage),
  showPercentage: size === 'medium' && showPercentage,
  showLabel: size === 'medium' && !!label && !showPercentage,
});

/**
 * Helper function to render hit count or percentage display for stacked layout
 */
const renderStackedHitCountDisplay = (
  showHitCount: boolean,
  showPercentage: boolean,
  clampedValue: number,
  max: number,
  percentage: number,
  percentageClassName: string
): ReactNode => {
  if (!showHitCount && !showPercentage) return null;

  return (
    <div
      className={`text-xs font-medium leading-[14px] text-right ${percentageClassName}`}
    >
      {showHitCount ? (
        <>
          <span className="text-success-200">{Math.round(clampedValue)}</span>
          <span className="text-text-600"> de {max}</span>
        </>
      ) : (
        <Text size="xs" weight="medium" className="text-success-200">
          {Math.round(percentage)}%
        </Text>
      )}
    </div>
  );
};

/**
 * Base progress bar component with common rendering logic
 */
const ProgressBarBase = ({
  clampedValue,
  max,
  percentage,
  label,
  variantClasses,
  containerClassName,
  fillClassName,
}: {
  clampedValue: number;
  max: number;
  percentage: number;
  label: ReactNode;
  variantClasses: VariantClassType;
  containerClassName: string;
  fillClassName: string;
}) => (
  <div
    className={`${containerClassName} ${variantClasses.background} overflow-hidden relative`}
  >
    <progress
      value={clampedValue}
      max={max}
      aria-label={typeof label === 'string' ? label : 'Progress'}
      className="absolute inset-0 w-full h-full opacity-0"
    />
    <div
      className={`${fillClassName} ${variantClasses.fill} transition-all duration-300 ease-out`}
      style={{ width: `${percentage}%` }}
    />
  </div>
);

/**
 * Stacked layout component
 */
const StackedLayout = ({
  className,
  label,
  showPercentage,
  showHitCount,
  labelClassName,
  percentageClassName,
  clampedValue,
  max,
  percentage,
  variantClasses,
  stackedWidth = 'w-[380px]',
  stackedHeight = 'h-[35px]',
}: {
  className: string;
  label: ReactNode;
  showPercentage: boolean;
  showHitCount: boolean;
  labelClassName: string;
  percentageClassName: string;
  clampedValue: number;
  max: number;
  percentage: number;
  variantClasses: VariantClassType;
  stackedWidth?: string;
  stackedHeight?: string;
}) => (
  <div
    className={`flex flex-col items-start gap-2 ${stackedWidth} ${stackedHeight} ${className}`}
  >
    {shouldShowHeader(label, showPercentage, showHitCount) && (
      <div className="flex flex-row justify-between items-center w-full h-[19px]">
        {label && (
          <Text
            as="div"
            size="md"
            weight="medium"
            className={`text-text-600 leading-[19px] ${labelClassName}`}
          >
            {label}
          </Text>
        )}

        {renderStackedHitCountDisplay(
          showHitCount,
          showPercentage,
          clampedValue,
          max,
          percentage,
          percentageClassName
        )}
      </div>
    )}

    <ProgressBarBase
      clampedValue={clampedValue}
      max={max}
      percentage={percentage}
      label={label}
      variantClasses={variantClasses}
      containerClassName="w-full h-2 rounded-lg"
      fillClassName="h-2 rounded-lg shadow-hard-shadow-3"
    />
  </div>
);

/**
 * Compact layout component
 */
const CompactLayout = ({
  className,
  label,
  showPercentage,
  showHitCount,
  labelClassName,
  percentageClassName,
  clampedValue,
  max,
  percentage,
  variantClasses,
  compactWidth = 'w-[131px]',
  compactHeight = 'h-[24px]',
}: {
  className: string;
  label: ReactNode;
  showPercentage: boolean;
  showHitCount: boolean;
  labelClassName: string;
  percentageClassName: string;
  clampedValue: number;
  max: number;
  percentage: number;
  variantClasses: VariantClassType;
  compactWidth?: string;
  compactHeight?: string;
}) => {
  const {
    color,
    className: compactClassName,
    content,
  } = getCompactLayoutConfig(
    showPercentage,
    showHitCount,
    percentage,
    clampedValue,
    max,
    label,
    percentageClassName,
    labelClassName
  );

  return (
    <div
      className={`flex flex-col items-start gap-1 ${compactWidth} ${compactHeight} ${className}`}
    >
      {shouldShowHeader(label, showPercentage, showHitCount) && (
        <Text
          as="div"
          size="sm"
          weight="medium"
          color={color}
          className={`leading-4 w-full ${compactClassName}`}
        >
          {content}
        </Text>
      )}

      <ProgressBarBase
        clampedValue={clampedValue}
        max={max}
        percentage={percentage}
        label={label}
        variantClasses={variantClasses}
        containerClassName="w-full h-1 rounded-full"
        fillClassName="h-1 rounded-full"
      />
    </div>
  );
};

/**
 * Default layout component
 */
const DefaultLayout = ({
  className,
  size,
  sizeClasses,
  variantClasses,
  label,
  showPercentage,
  labelClassName,
  percentageClassName,
  clampedValue,
  max,
  percentage,
}: {
  className: string;
  size: ProgressBarSize;
  sizeClasses: SizeClassType;
  variantClasses: VariantClassType;
  label: ReactNode;
  showPercentage: boolean;
  labelClassName: string;
  percentageClassName: string;
  clampedValue: number;
  max: number;
  percentage: number;
}) => {
  const gapClass = size === 'medium' ? 'gap-2' : sizeClasses.spacing;
  const progressBarClass = size === 'medium' ? 'flex-grow' : 'w-full';
  const displayConfig = getDefaultLayoutDisplayConfig(
    size,
    label,
    showPercentage
  );

  return (
    <div className={`flex ${sizeClasses.layout} ${gapClass} ${className}`}>
      {displayConfig.showHeader && (
        <div className="flex flex-row items-center justify-between w-full">
          {label && (
            <Text
              as="div"
              size="xs"
              weight="medium"
              className={`text-text-950 leading-none tracking-normal text-center ${labelClassName}`}
            >
              {label}
            </Text>
          )}

          {showPercentage && (
            <Text
              size="xs"
              weight="medium"
              className={`text-text-950 leading-none tracking-normal text-center ${percentageClassName}`}
            >
              {Math.round(percentage)}%
            </Text>
          )}
        </div>
      )}

      <ProgressBarBase
        clampedValue={clampedValue}
        max={max}
        percentage={percentage}
        label={label}
        variantClasses={variantClasses}
        containerClassName={`${progressBarClass} ${sizeClasses.container} ${sizeClasses.borderRadius}`}
        fillClassName={`${sizeClasses.bar} ${sizeClasses.borderRadius} shadow-hard-shadow-3`}
      />

      {displayConfig.showPercentage && (
        <Text
          size="xs"
          weight="medium"
          className={`text-text-950 leading-none tracking-normal text-center flex-none ${percentageClassName}`}
        >
          {Math.round(percentage)}%
        </Text>
      )}

      {displayConfig.showLabel && (
        <Text
          as="div"
          size="xs"
          weight="medium"
          className={`text-text-950 leading-none tracking-normal text-center flex-none ${labelClassName}`}
        >
          {label}
        </Text>
      )}
    </div>
  );
};

/**
 * ProgressBar component for Analytica Ensino platforms
 *
 * A progress bar component with size and color variants designed for tracking
 * activity progress (blue) and performance metrics (green).
 * Uses the Analytica Ensino Design System colors from styles.css with automatic
 * light/dark mode support. Includes Text component integration for consistent typography.
 *
 * @example
 * ```tsx
 * // Basic progress bar
 * <ProgressBar value={65} />
 *
 * // Activity progress (blue)
 * <ProgressBar variant="blue" value={45} label="Progress" showPercentage />
 *
 * // Performance metrics (green)
 * <ProgressBar variant="green" size="medium" value={85} label="Performance" />
 *
 * // Small size with custom max value
 * <ProgressBar size="small" value={3} max={5} showPercentage />
 *
 * // Stacked layout with fixed width and hit count
 * <ProgressBar layout="stacked" variant="green" value={28} max={30} label="Fáceis" showHitCount />
 *
 * // Compact layout for small cards
 * <ProgressBar layout="compact" variant="blue" value={70} label="Questão 08" />
 * ```
 */
const ProgressBar = ({
  value,
  max = 100,
  size = 'medium',
  variant = 'blue',
  layout = 'default',
  label,
  showPercentage = false,
  showHitCount = false,
  className = '',
  labelClassName = '',
  percentageClassName = '',
  stackedWidth,
  stackedHeight,
  compactWidth,
  compactHeight,
}: ProgressBarProps) => {
  const { clampedValue, percentage } = calculateProgressValues(value, max);
  const sizeClasses = SIZE_CLASSES[size];
  const variantClasses = VARIANT_CLASSES[variant];

  if (layout === 'stacked') {
    return (
      <StackedLayout
        className={className}
        label={label}
        showPercentage={showPercentage}
        showHitCount={showHitCount}
        labelClassName={labelClassName}
        percentageClassName={percentageClassName}
        clampedValue={clampedValue}
        max={max}
        percentage={percentage}
        variantClasses={variantClasses}
        stackedWidth={stackedWidth}
        stackedHeight={stackedHeight}
      />
    );
  }

  if (layout === 'compact') {
    return (
      <CompactLayout
        className={className}
        label={label}
        showPercentage={showPercentage}
        showHitCount={showHitCount}
        labelClassName={labelClassName}
        percentageClassName={percentageClassName}
        clampedValue={clampedValue}
        max={max}
        percentage={percentage}
        variantClasses={variantClasses}
        compactWidth={compactWidth}
        compactHeight={compactHeight}
      />
    );
  }

  return (
    <DefaultLayout
      className={className}
      size={size}
      sizeClasses={sizeClasses}
      variantClasses={variantClasses}
      label={label}
      showPercentage={showPercentage}
      labelClassName={labelClassName}
      percentageClassName={percentageClassName}
      clampedValue={clampedValue}
      max={max}
      percentage={percentage}
    />
  );
};

export default ProgressBar;
