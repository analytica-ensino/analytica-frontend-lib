import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import { forwardRef } from 'react';
import { useQuizStore } from '../Quiz/useQuizStore';
import { formatTimeSpent } from '../../utils/activityDetailsUtils';
import { cn } from '../../utils/utils';
import Text from '../Text/Text';

export interface QuizTimerProps {
  className?: string;
}

/**
 * Progressive exam stopwatch, driven entirely by the quiz store.
 *
 * Presentational only: the counting, the pausing and the resume seed all live
 * in `useQuizStore`. Once the configured warning threshold is passed the
 * display turns red and keeps going — going over time is reported, never
 * enforced.
 */
const QuizTimer = forwardRef<HTMLDivElement, QuizTimerProps>(
  ({ className, ...props }, ref) => {
    const { timeElapsed, isTimeExceeded } = useQuizStore();
    const exceeded = isTimeExceeded();
    const formatted = formatTimeSpent(timeElapsed);

    return (
      <div
        ref={ref}
        role="timer"
        aria-live="off"
        aria-label={`Tempo de prova: ${formatted}${exceeded ? ' — tempo excedido' : ''}`}
        className={cn(
          'inline-flex flex-row items-center gap-1 tabular-nums',
          'rounded-md border px-2 py-1',
          exceeded
            ? 'bg-error-background border-error-300 text-error-700'
            : 'bg-info border-info-300 text-info-800',
          className
        )}
        {...props}
      >
        <ClockIcon size={16} weight={exceeded ? 'fill' : 'regular'} />
        <Text as="span" size="sm" weight="medium" color="">
          {formatted}
        </Text>
      </div>
    );
  }
);

QuizTimer.displayName = 'QuizTimer';

export default QuizTimer;
