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
 * Helper function to get compact layout color
 */
const getCompactLayoutColor = (
  showPercentage: boolean,
  showHitCount: boolean
): string => {
  if (showPercentage || showHitCount) {
    return 'text-primary-600';
  }
  return 'text-primary-700';
};

/**
 * Helper function to get compact layout className
 */
const getCompactLayoutClassName = (
  showPercentage: boolean,
  showHitCount: boolean,
  percentageClassName: string,
  labelClassName: string
): string => {
  if (showPercentage || showHitCount) {
    return percentageClassName;
  }
  return labelClassName;
};

/**
 * Helper function to get compact layout content
 */
const getCompactLayoutContent = (
  showPercentage: boolean,
  showHitCount: boolean,
  percentage: number,
  clampedValue: number,
  max: number,
  label: ReactNode
): string | ReactNode => {
  if (showPercentage) {
    return `${Math.round(percentage)}%`;
  }
  if (showHitCount) {
    return `${Math.round(clampedValue)} de ${max}`;
  }
  return label;
};

/**
 * Helper function to get default layout gap
 */
const getDefaultLayoutGap = (
  size: ProgressBarSize,
  sizeClasses: SizeClassType
): string => {
  if (size === 'medium') {
    return 'gap-2';
  }
  return sizeClasses.spacing;
};

/**
 * Helper function to get progress bar container className for default layout
 */
const getDefaultProgressBarClassName = (size: ProgressBarSize): string => {
  if (size === 'medium') {
    return 'flex-grow';
  }
  return 'w-full';
};

/**
 * Helper function to get aria label
 */
const getAriaLabel = (label: ReactNode): string => {
  if (typeof label === 'string') {
    return label;
  }
  return 'Progress';
};

/**
 * Helper function to check if small size header should be shown
 */
const shouldShowSmallSizeHeader = (
  size: ProgressBarSize,
  label: ReactNode,
  showPercentage: boolean
): boolean => {
  return size === 'small' && !!(label || showPercentage);
};

/**
 * Helper function to check if medium size percentage should be shown
 */
const shouldShowMediumPercentage = (
  size: ProgressBarSize,
  showPercentage: boolean
): boolean => {
  return size === 'medium' && showPercentage;
};

/**
 * Helper function to check if medium size label should be shown
 */
const shouldShowMediumLabel = (
  size: ProgressBarSize,
  label: ReactNode,
  showPercentage: boolean
): boolean => {
  return size === 'medium' && !!label && !showPercentage;
};

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
}) => (
  <div
    className={`flex flex-col items-start gap-2 w-[380px] h-[35px] ${className}`}
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

        {(showHitCount || showPercentage) && (
          <div
            className={`text-xs font-medium leading-[14px] text-right ${percentageClassName}`}
          >
            {showHitCount ? (
              <>
                <span className="text-success-200">
                  {Math.round(clampedValue)}
                </span>
                <span className="text-text-600"> de {max}</span>
              </>
            ) : (
              <Text size="xs" weight="medium" className="text-success-200">
                {Math.round(percentage)}%
              </Text>
            )}
          </div>
        )}
      </div>
    )}

    <div
      className={`w-full h-2 ${variantClasses.background} rounded-lg overflow-hidden relative`}
    >
      <progress
        value={clampedValue}
        max={max}
        aria-label={getAriaLabel(label)}
        className="absolute inset-0 w-full h-full opacity-0"
      />
      <div
        className={`h-2 ${variantClasses.fill} rounded-lg transition-all duration-300 ease-out shadow-hard-shadow-3`}
        style={{ width: `${percentage}%` }}
      />
    </div>
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
}) => {
  const color = getCompactLayoutColor(showPercentage, showHitCount);
  const compactClassName = getCompactLayoutClassName(
    showPercentage,
    showHitCount,
    percentageClassName,
    labelClassName
  );
  const content = getCompactLayoutContent(
    showPercentage,
    showHitCount,
    percentage,
    clampedValue,
    max,
    label
  );

  return (
    <div
      className={`flex flex-col items-start gap-1 w-[131px] h-[24px] ${className}`}
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

      <div
        className={`w-full h-1 ${variantClasses.background} rounded-full overflow-hidden relative`}
      >
        <progress
          value={clampedValue}
          max={max}
          aria-label={getAriaLabel(label)}
          className="absolute inset-0 w-full h-full opacity-0"
        />
        <div
          className={`h-1 ${variantClasses.fill} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
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
  const gapClass = getDefaultLayoutGap(size, sizeClasses);
  const progressBarClass = getDefaultProgressBarClassName(size);

  return (
    <div className={`flex ${sizeClasses.layout} ${gapClass} ${className}`}>
      {shouldShowSmallSizeHeader(size, label, showPercentage) && (
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

      <div
        className={`${progressBarClass} ${sizeClasses.container} ${variantClasses.background} ${sizeClasses.borderRadius} overflow-hidden relative`}
      >
        <progress
          value={clampedValue}
          max={max}
          aria-label={getAriaLabel(label)}
          className="absolute inset-0 w-full h-full opacity-0"
        />
        <div
          className={`${sizeClasses.bar} ${variantClasses.fill} ${sizeClasses.borderRadius} transition-all duration-300 ease-out shadow-hard-shadow-3`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {shouldShowMediumPercentage(size, showPercentage) && (
        <Text
          size="xs"
          weight="medium"
          className={`text-text-950 leading-none tracking-normal text-center flex-none ${percentageClassName}`}
        >
          {Math.round(percentage)}%
        </Text>
      )}

      {shouldShowMediumLabel(size, label, showPercentage) && (
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
