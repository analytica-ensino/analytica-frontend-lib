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
  // Ensure value is within bounds and handle NaN/Infinity
  const safeValue = isNaN(value) ? 0 : value;
  const clampedValue = Math.max(0, Math.min(safeValue, max));
  const percentage = max === 0 ? 0 : (clampedValue / max) * 100;

  // Get size and variant classes
  const sizeClasses = SIZE_CLASSES[size];
  const variantClasses = VARIANT_CLASSES[variant];

  // Stacked layout variant (based on provided design)
  if (layout === 'stacked') {
    return (
      <div
        className={`flex flex-col items-start gap-2 w-[380px] h-[35px] ${className}`}
      >
        {/* Header with label and percentage/hitcount */}
        {(label || showPercentage || showHitCount) && (
          <div className="flex flex-row justify-between items-center w-full h-[19px]">
            {/* Label */}
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

            {/* Hit Count or Percentage */}
            {(showHitCount || showPercentage) && (
              <Text
                size="xs"
                weight="medium"
                className={`text-success-200 leading-[14px] text-right ${percentageClassName}`}
              >
                {showHitCount
                  ? `${Math.round(clampedValue)} de ${max}`
                  : `${Math.round(percentage)}%`}
              </Text>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div
          className={`w-full h-2 ${variantClasses.background} rounded-lg overflow-hidden relative`}
        >
          {/* Native progress element for accessibility */}
          <progress
            value={clampedValue}
            max={max}
            aria-label={typeof label === 'string' ? label : 'Progress'}
            className="absolute inset-0 w-full h-full opacity-0"
          />

          {/* Progress bar fill */}
          <div
            className={`h-2 ${variantClasses.fill} rounded-lg transition-all duration-300 ease-out shadow-hard-shadow-3`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // Compact layout variant (based on provided design)
  if (layout === 'compact') {
    return (
      <div
        className={`flex flex-col items-start gap-1 w-[131px] h-[24px] ${className}`}
      >
        {/* Label */}
        {label && (
          <Text
            as="div"
            size="sm"
            weight="medium"
            className={`text-primary-700 leading-4 w-full ${labelClassName}`}
          >
            {label}
          </Text>
        )}

        {/* Progress bar */}
        <div
          className={`w-full h-1 ${variantClasses.background} rounded-full overflow-hidden relative`}
        >
          {/* Native progress element for accessibility */}
          <progress
            value={clampedValue}
            max={max}
            aria-label={typeof label === 'string' ? label : 'Progress'}
            className="absolute inset-0 w-full h-full opacity-0"
          />

          {/* Progress bar fill */}
          <div
            className={`h-1 ${variantClasses.fill} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // Default layout (existing behavior)
  return (
    <div
      className={`flex ${sizeClasses.layout} ${size === 'medium' ? 'gap-2' : sizeClasses.spacing} ${className}`}
    >
      {/* For small size: vertical layout with label/percentage on top */}
      {size === 'small' && (label || showPercentage) && (
        <div className="flex flex-row items-center justify-between w-full">
          {/* Label */}
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

          {/* Percentage */}
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

      {/* Progress bar container */}
      <div
        className={`${size === 'medium' ? 'flex-grow' : 'w-full'} ${sizeClasses.container} ${variantClasses.background} ${sizeClasses.borderRadius} overflow-hidden relative`}
      >
        {/* Native progress element for accessibility */}
        <progress
          value={clampedValue}
          max={max}
          aria-label={typeof label === 'string' ? label : 'Progress'}
          className="absolute inset-0 w-full h-full opacity-0"
        />

        {/* Progress bar fill */}
        <div
          className={`${sizeClasses.bar} ${variantClasses.fill} ${sizeClasses.borderRadius} transition-all duration-300 ease-out shadow-hard-shadow-3`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* For medium size: horizontal layout with percentage on the right */}
      {size === 'medium' && showPercentage && (
        <Text
          size="xs"
          weight="medium"
          className={`text-text-950 leading-none tracking-normal text-center flex-none ${percentageClassName}`}
        >
          {Math.round(percentage)}%
        </Text>
      )}

      {/* For medium size: label below if provided */}
      {size === 'medium' && label && !showPercentage && (
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

export default ProgressBar;
