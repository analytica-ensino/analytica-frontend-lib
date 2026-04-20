import { ReactNode } from 'react';
import Text from '../Text/Text';

export type ScoreCircleVariant = 'green' | 'blue' | 'warning';

const VARIANT_CLASSES: Record<
  ScoreCircleVariant,
  { track: string; fill: string; score: string }
> = {
  green: {
    track: 'stroke-background-300',
    fill: 'stroke-success-200',
    score: 'text-success-300',
  },
  blue: {
    track: 'stroke-primary-100',
    fill: 'stroke-primary-700',
    score: 'text-primary-700',
  },
  warning: {
    track: 'stroke-background-300',
    fill: 'stroke-warning-300',
    score: 'text-warning-600',
  },
};

export interface ScoreCircleProps {
  /** Valor atual do score */
  value: number;
  /** Valor máximo (default: 1000) */
  max?: number;
  /** Variante de cor do anel. Default: 'green' */
  variant?: ScoreCircleVariant;
  /** Tamanho total do círculo em pixels. Default: 180 */
  size?: number;
  /** Largura do traço do anel. Default: 10 */
  strokeWidth?: number;
  /** Label exibido acima do valor (ex: "Nota final") */
  label?: string;
  /** Ícone exibido à esquerda do label */
  labelIcon?: ReactNode;
  /** Classes adicionais pro container */
  className?: string;
}

/**
 * Círculo com anel de progresso exibindo um score e seu valor máximo.
 *
 * Diferente de `ProgressCircle` (que mostra "%" no centro), o `ScoreCircle`
 * mostra o valor absoluto (ex: "800") com "de {max}" abaixo — ideal pra notas
 * e scores onde o usuário precisa ver o número real.
 *
 * @example
 * ```tsx
 * <ScoreCircle
 *   value={800}
 *   max={1000}
 *   label="Nota final"
 *   labelIcon={<LightbulbIcon size={14} />}
 * />
 * ```
 */
const ScoreCircle = ({
  value,
  max = 1000,
  variant = 'green',
  size = 180,
  strokeWidth = 10,
  label,
  labelIcon,
  className = '',
}: ScoreCircleProps) => {
  const clamped = Math.max(0, Math.min(value, max));
  const percentage = max === 0 ? 0 : clamped / max;
  const radius = size / 2 - strokeWidth;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentage * circumference;
  const styles = VARIANT_CLASSES[variant];

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ? `${label}: ${value} de ${max}` : `${value} de ${max}`}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={styles.track}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${styles.fill} transition-all duration-500 ease-out`}
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-1">
        {(label || labelIcon) && (
          <div className="flex flex-row items-center gap-1 text-text-700">
            {labelIcon}
            {label && (
              <Text size="xs" className="text-text-700">
                {label}
              </Text>
            )}
          </div>
        )}
        <Text
          size="xl"
          weight="bold"
          className={`${styles.score} leading-none text-4xl`}
        >
          {value}
        </Text>
        <Text size="xs" className="text-text-700">
          de {max}
        </Text>
      </div>
    </div>
  );
};

export default ScoreCircle;
