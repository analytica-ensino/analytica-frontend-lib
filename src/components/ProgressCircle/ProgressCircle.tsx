import { ReactNode } from 'react';
import Text from '../Text/Text';

/**
 * Progress circle size variants
 */
type ProgressCircleSize = 'small' | 'medium';

/**
 * Progress circle color variants
 */
type ProgressCircleVariant = 'blue' | 'green';

/**
 * Size configurations using Tailwind classes
 */
const SIZE_CLASSES = {
  small: {
    container: 'w-[90px] h-[90px]', // 90px circle from design specs
    strokeWidth: 4, // 4px stroke width - matches ProgressBar small (h-1)
    textSize: '2xl', // 24px for percentage (font-size: 24px)
    textWeight: 'medium', // font-weight: 500
    labelSize: '2xs' as const, // 10px for status label (closest to 8px design spec)
    labelWeight: 'bold', // font-weight: 700
    spacing: 'gap-1', // 4px gap between percentage and label
  },
  medium: {
    container: 'w-[152px] h-[152px]', // 151.67px ≈ 152px circle from design specs
    strokeWidth: 8, // 8px stroke width - matches ProgressBar medium (h-2)
    textSize: '2xl', // 24px for percentage (font-size: 24px)
    textWeight: 'medium', // font-weight: 500
    labelSize: 'xs' as const, // 12px for status label (font-size: 12px)
    labelWeight: 'medium', // font-weight: 500 (changed from bold)
    spacing: 'gap-1', // 4px gap between percentage and label
  },
} as const;

/**
 * Color configurations using design system colors
 */
const VARIANT_CLASSES = {
  blue: {
    background: 'stroke-primary-100', // Light blue background (#BBDCF7)
    fill: 'stroke-primary-700', // Blue for activity progress (#2271C4)
    textColor: 'text-primary-700', // Blue text color (#2271C4)
    labelColor: 'text-text-700', // Gray text for label (#525252)
  },
  green: {
    background: 'stroke-background-300', // Gray background (#D5D4D4 - matches design)
    fill: 'stroke-success-200', // Green for performance (#84D3A2 - matches design)
    textColor: 'text-text-800', // Dark gray text (#404040 - matches design)
    labelColor: 'text-text-600', // Medium gray text for label (#737373 - matches design)
  },
} as const;

/**
 * ProgressCircle component props interface
 */
export type ProgressCircleProps = {
  /** Progress value between 0 and 100 */
  value: number;
  /** Maximum value (defaults to 100) */
  max?: number;
  /** Size variant of the progress circle */
  size?: ProgressCircleSize;
  /** Color variant of the progress circle */
  variant?: ProgressCircleVariant;
  /** Optional label to display below percentage */
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
 * ProgressCircle component for Analytica Ensino platforms
 *
 * A circular progress indicator with size and color variants designed for tracking
 * activity progress (blue) and performance metrics (green).
 * Uses the Analytica Ensino Design System colors from styles.css with automatic
 * light/dark mode support. Includes Text component integration for consistent typography.
 *
 * @example
 * ```tsx
 * // Basic progress circle
 * <ProgressCircle value={65} />
 *
 * // Activity progress (blue)
 * <ProgressCircle variant="blue" value={45} label="CONCLUÍDO" showPercentage />
 *
 * // Performance metrics (green)
 * <ProgressCircle variant="green" size="medium" value={85} label="MÉDIA" />
 *
 * // Small size with custom max value
 * <ProgressCircle size="small" value={3} max={5} showPercentage />
 * ```
 */
const ProgressCircle = ({
  value,
  max = 100,
  size = 'small',
  variant = 'blue',
  label,
  showPercentage = true,
  className = '',
  labelClassName = '',
  percentageClassName = '',
}: ProgressCircleProps) => {
  // Ensure value is within bounds and handle NaN/Infinity
  const safeValue = isNaN(value) ? 0 : value;
  const clampedValue = Math.max(0, Math.min(safeValue, max));
  const percentage = max === 0 ? 0 : (clampedValue / max) * 100;

  // Get size and variant classes
  const sizeClasses = SIZE_CLASSES[size];
  const variantClasses = VARIANT_CLASSES[variant];

  // Calculate SVG dimensions and stroke properties
  const radius = size === 'small' ? 37 : 64; // Radius calculation based on container size
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const center = size === 'small' ? 45 : 76; // Center point of SVG
  const svgSize = size === 'small' ? 90 : 152; // SVG viewBox size

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${sizeClasses.container} rounded-lg ${className}`}
    >
      {/* Progress circle SVG */}
      <svg
        className="absolute inset-0 transform -rotate-90"
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={sizeClasses.strokeWidth}
          className={`${variantClasses.background} rounded-lg`}
        />
        {/* Progress circle - SVG stroke properties require style for animation */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={sizeClasses.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${variantClasses.fill} transition-all duration-500 ease-out shadow-soft-shadow-3 rounded-lg`}
        />
      </svg>

      {/* Native progress element for accessibility */}
      <progress
        value={clampedValue}
        max={max}
        aria-label={typeof label === 'string' ? label : 'Progress'}
        className="absolute opacity-0 w-0 h-0"
      />

      {/* Content overlay - centered content */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center ${sizeClasses.spacing}`}
      >
        {/* Percentage text */}
        {showPercentage && (
          <Text
            size={sizeClasses.textSize}
            weight={sizeClasses.textWeight}
            className={`text-center ${variantClasses.textColor} ${percentageClassName}`}
          >
            {Math.round(percentage)}%
          </Text>
        )}

        {/* Label text */}
        {label && (
          <Text
            as="span"
            size={sizeClasses.labelSize}
            weight={sizeClasses.labelWeight}
            className={`${variantClasses.labelColor} text-center uppercase tracking-wide ${labelClassName}`}
          >
            {label}
          </Text>
        )}
      </div>
    </div>
  );
};

export default ProgressCircle;
