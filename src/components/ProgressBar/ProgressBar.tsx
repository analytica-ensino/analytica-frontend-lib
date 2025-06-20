'use client';

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
 * Size configurations using Tailwind classes
 */
const SIZE_CLASSES = {
  small: {
    container: 'h-1', // 4px height
    bar: 'h-1',
    labelSize: 'xs' as const,
    spacing: 'gap-2',
  },
  medium: {
    container: 'h-2', // 8px height
    bar: 'h-2',
    labelSize: 'sm' as const,
    spacing: 'gap-2',
  },
} as const;

/**
 * Color configurations using design system colors
 */
const VARIANT_CLASSES = {
  blue: {
    background: 'bg-background-300', // Background track color
    fill: 'bg-primary-700', // Blue for activity progress
  },
  green: {
    background: 'bg-background-300', // Background track color
    fill: 'bg-success-200', // Green for performance
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
  /** Optional label to display */
  label?: ReactNode;
  /** Show percentage text */
  showPercentage?: boolean;
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
 * ```
 */
const ProgressBar = ({
  value,
  max = 100,
  size = 'medium',
  variant = 'blue',
  label,
  showPercentage = false,
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

  return (
    <div className={`flex flex-col ${sizeClasses.spacing} ${className}`}>
      {/* Label and percentage container */}
      {(label || showPercentage) && (
        <div className="flex flex-row items-center justify-between">
          {/* Label */}
          {label && (
            <Text
              as="div"
              size={sizeClasses.labelSize}
              weight="medium"
              className={`text-text-950 ${labelClassName}`}
            >
              {label}
            </Text>
          )}

          {/* Percentage */}
          {showPercentage && (
            <Text
              size={sizeClasses.labelSize}
              weight="medium"
              className={`text-text-700 text-center ${percentageClassName}`}
            >
              {Math.round(percentage)}%
            </Text>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div
        className={`w-full ${sizeClasses.container} ${variantClasses.background} rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={typeof label === 'string' ? label : 'Progress'}
      >
        {/* Progress bar fill */}
        <div
          className={`${sizeClasses.bar} ${variantClasses.fill} rounded-full transition-all duration-300 ease-out shadow-hard-shadow-3`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
