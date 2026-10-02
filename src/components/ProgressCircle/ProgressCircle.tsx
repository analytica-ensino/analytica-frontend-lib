import { ReactNode } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

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
    container: 'w-[107px] h-[107px]', // 107px circle to fit labels like "CONCLUÍDO"
    strokeWidth: 4, // 4px stroke width - matches ProgressBar small (h-1)
    textSize: '2xl', // 24px for percentage (font-size: 24px)
    textWeight: 'medium', // font-weight: 500
    labelSize: '2xs' as const, // 10px for status label
    labelWeight: 'bold', // font-weight: 700
    spacing: 'gap-0', // Reduced gap between percentage and label for better spacing
    contentWidth: 'max-w-[85px]', // Width to fit labels like "CONCLUÍDO" inside circle
  },
  medium: {
    container: 'w-[152px] h-[152px]', // 151.67px ≈ 152px circle from design specs
    strokeWidth: 8, // 8px stroke width - matches ProgressBar medium (h-2)
    textSize: '2xl', // 24px for percentage (font-size: 24px)
    textWeight: 'medium', // font-weight: 500
    labelSize: 'xs' as const, // 12px for status label (font-size: 12px)
    labelWeight: 'medium', // font-weight: 500 (changed from bold)
    spacing: 'gap-1', // 4px gap between percentage and label
    contentWidth: 'max-w-[90px]', // Reduced width to fit text inside circle
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
  /**
   * Overrides the variant's arc colour with a raw CSS value, e.g.
   * `var(--color-success-400)` or `#489766`. Use this — not a `stroke-*` class
   * — when the colour encodes data (a score band): consumer apps only ship the
   * colour utilities the lib itself compiles, so `stroke-*` classes for
   * arbitrary tokens simply do not exist there and the arc renders invisible.
   */
  fillColor?: string;
  /** Same as `fillColor`, for the track behind the arc. */
  trackColor?: string;
  /** Optional label to display below percentage */
  label?: ReactNode;
  /**
   * Nome acessível do círculo, anunciado antes do valor (ex.: "Progresso em
   * História, 0%"). Sem ele, o leitor de tela lê o percentual solto e não há
   * como saber de que matéria/assunto ele é — o `label` abaixo é texto VISÍVEL
   * dentro do círculo (curto por caber em ~85px) e nem sempre serve de nome.
   *
   * Default: `Progresso` — ou `Progresso: <label>` quando `label` é string.
   */
  accessibleLabel?: string;
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
  fillColor,
  trackColor,
  label,
  accessibleLabel,
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
  // A cor por valor vence a da variante; quando ausente, mantém a classe.
  const trackClass = trackColor ? undefined : variantClasses.background;
  const fillClass = fillColor ? undefined : variantClasses.fill;

  // Calculate SVG dimensions and stroke properties
  // small: 107px container, radius = (107 - strokeWidth*2) / 2 ≈ 49.5, center = 53.5
  // medium: 152px container, radius = 64, center = 76
  const radius = size === 'small' ? 49 : 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const center = size === 'small' ? 53.5 : 76;
  const svgSize = size === 'small' ? 107 : 152;

  /**
   * Nome acessível: o do consumidor vence; senão, o texto visível do `label`
   * (quando é string) em português; senão, só "Progresso".
   */
  const resolveAccessibleLabel = () => {
    if (accessibleLabel) return accessibleLabel;
    if (typeof label === 'string' && label.trim()) {
      return `Progresso: ${label.trim()}`;
    }
    return 'Progresso';
  };

  return (
    // A semântica vive no wrapper, não num `<progress>` escondido: assim o
    // leitor de tela anuncia nome + valor numa única parada, em vez de ler o
    // "0%" do centro do círculo solto, sem dizer de que progresso se trata.
    // Mesma forma que o `ScoreCircle` usa.
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuenow={clampedValue}
      aria-valuemax={max}
      aria-label={resolveAccessibleLabel()}
      className={cn(
        'relative flex flex-col items-center justify-center',
        sizeClasses.container,
        'rounded-lg',
        className
      )}
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
          className={cn(trackClass, 'rounded-lg')}
          style={trackColor ? { stroke: trackColor } : undefined}
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
          className={cn(
            fillClass,
            'transition-all duration-500 ease-out shadow-soft-shadow-3 rounded-lg'
          )}
          style={fillColor ? { stroke: fillColor } : undefined}
        />
      </svg>

      {/* Content overlay - centered content */}
      <div
        // Duplicata visual do que o `progressbar` acima já anuncia (valor e
        // nome). Sem isto, o leitor lia o percentual uma segunda vez, solto.
        aria-hidden="true"
        className={cn(
          'relative z-10 flex flex-col items-center justify-center',
          sizeClasses.spacing,
          sizeClasses.contentWidth
        )}
      >
        {/* Percentage text */}
        {showPercentage && (
          <Text
            size={sizeClasses.textSize}
            weight={sizeClasses.textWeight}
            className={cn(
              'text-center w-full',
              variantClasses.textColor,
              percentageClassName
            )}
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
            className={cn(
              variantClasses.labelColor,
              'text-center uppercase tracking-wide truncate w-full',
              labelClassName
            )}
          >
            {label}
          </Text>
        )}
      </div>
    </div>
  );
};

export default ProgressCircle;
