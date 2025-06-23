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
    container: 'h-1', // 4px height (h-1 = 4px in Tailwind)
    bar: 'h-1', // 4px height for the fill bar
    labelSize: 'xs' as const,
    spacing: 'gap-2', // 8px gap between label and progress bar
    layout: 'flex-col', // vertical layout for small
    borderRadius: 'rounded-full', // 9999px border radius
  },
  medium: {
    container: 'h-2', // 8px height (h-2 = 8px in Tailwind)
    bar: 'h-2', // 8px height for the fill bar
    labelSize: 'xs' as const, // 12px font size (xs in Tailwind)
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
          size={sizeClasses.labelSize}
          weight="medium"
          className={`text-text-950 flex-none ${percentageClassName}`}
        >
          {Math.round(percentage)}%
        </Text>
      )}

      {/* For medium size: label below if provided */}
      {size === 'medium' && label && !showPercentage && (
        <Text
          as="div"
          size={sizeClasses.labelSize}
          weight="medium"
          className={`text-text-950 flex-none ${labelClassName}`}
        >
          {label}
        </Text>
      )}
    </div>
  );
};

export default ProgressBar;
