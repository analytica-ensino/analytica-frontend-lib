import { HTMLAttributes } from 'react';
import { cn } from '../../utils/utils';

/** The prosody scale is always four levels ("Nível N de 4"). */
const SEGMENTS = 4;

export interface LevelBarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** Reached level, 1-based. Values outside `0..4` are clamped. */
  value: number;
  /** Tailwind background class for the reached segments. */
  colorClass?: string;
  /** Tailwind background class for the remaining segments. */
  trackColorClass?: string;
}

/**
 * Four-segment level meter: the first `value` segments are filled, the rest
 * stay muted. Used by the reading-fluency results for prosody.
 *
 * The colour is supplied by the consumer because it encodes the reading
 * profile: `bg-indicator-positive` → pré-leitor, `bg-warning-400` → leitor
 * iniciante, `bg-success-400` → leitor fluente.
 *
 * @example
 * ```tsx
 * <LevelBar value={2} colorClass="bg-warning-400" />
 * ```
 */
export const LevelBar = ({
  value,
  colorClass = 'bg-success-400',
  trackColorClass = 'bg-background-400',
  className = '',
  ...props
}: LevelBarProps) => {
  const filled = Math.min(Math.max(Math.trunc(value), 0), SEGMENTS);

  return (
    // Decorative: the level is always rendered as adjacent text ("Nível 2 de
    // 4"), so announcing the bar too would just repeat it. Wrap it with your
    // own label if you render it without that text.
    <div
      data-component="LevelBar"
      className={cn('flex w-full items-center gap-1', className)}
      aria-hidden="true"
      {...props}
    >
      {Array.from({ length: SEGMENTS }, (_, index) => (
        <span
          key={index}
          data-testid={index < filled ? 'level-bar-filled' : 'level-bar-empty'}
          className={cn(
            'flex-1 h-1.5 rounded-full',
            index < filled ? colorClass : trackColorClass
          )}
        />
      ))}
    </div>
  );
};

export default LevelBar;
