import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import { forwardRef } from 'react';
import { useQuizStore } from '../Quiz/useQuizStore';
import { formatTimeSpent } from '../../utils/activityDetailsUtils';
import { cn } from '../../utils/utils';
import Text from '../Text/Text';

/**
 * How often (in seconds) the elapsed time is announced to screen readers.
 * Announcing every tick would flood the reader and drown the question itself.
 */
export const TIMER_ANNOUNCE_INTERVAL_SECONDS = 5 * 60;

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
 *
 * Accessibility: the badge is focusable and read on demand ("Tempo de prova:
 * 00:53:49"), its icon and digits are hidden from assistive tech so the reader
 * does not announce them as an image plus a number, and a polite live region
 * announces the time every {@link TIMER_ANNOUNCE_INTERVAL_SECONDS} seconds and
 * once more when the time is exceeded.
 */
const QuizTimer = forwardRef<HTMLDivElement, QuizTimerProps>(
  ({ className, ...props }, ref) => {
    const { timeElapsed, isTimeExceeded } = useQuizStore();
    const exceeded = isTimeExceeded();
    const formatted = formatTimeSpent(timeElapsed);
    const exceededSuffix = exceeded ? ' — tempo excedido' : '';

    // Derived from the elapsed time snapped to the announce interval, so the
    // live region text (and therefore the announcement) only changes once per
    // interval, or when the time becomes exceeded.
    const announcedSeconds =
      Math.floor(timeElapsed / TIMER_ANNOUNCE_INTERVAL_SECONDS) *
      TIMER_ANNOUNCE_INTERVAL_SECONDS;
    const announcement =
      announcedSeconds > 0 || exceeded
        ? `Tempo de prova: ${formatTimeSpent(announcedSeconds)}${exceededSuffix}`
        : '';

    return (
      <>
        <div
          ref={ref}
          role="timer"
          aria-live="off"
          tabIndex={0}
          aria-label={`Tempo de prova: ${formatted}${exceededSuffix}`}
          className={cn(
            'inline-flex flex-row items-center gap-1 tabular-nums',
            'rounded-md border px-2 py-1',
            exceeded
              ? 'bg-error-background border-error-300 text-error-700'
              : 'bg-info border-info-300 text-info-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info',
            className
          )}
          {...props}
        >
          <ClockIcon
            size={16}
            weight={exceeded ? 'fill' : 'regular'}
            aria-hidden="true"
          />
          <Text as="span" size="sm" weight="medium" color="" aria-hidden="true">
            {formatted}
          </Text>
        </div>
        <span
          className="sr-only"
          aria-live="polite"
          data-testid="quiz-timer-announcement"
        >
          {announcement}
        </span>
      </>
    );
  }
);

QuizTimer.displayName = 'QuizTimer';

export default QuizTimer;
