import type { Story } from '@ladle/react';
import { useEffect } from 'react';
import QuizTimer from './QuizTimer';
import { useQuizStore } from '../Quiz/useQuizStore';

const FIVE_HOURS = 5 * 60 * 60;

/**
 * Drives the store directly so the stories show a fixed, readable value
 * instead of a clock that starts at zero.
 */
const WithElapsed = ({
  seconds,
  threshold,
}: {
  seconds: number;
  threshold: number | null;
}) => {
  const { updateTime, setTimeWarning } = useQuizStore();

  useEffect(() => {
    setTimeWarning(threshold);
    updateTime(seconds);
  }, [seconds, threshold, setTimeWarning, updateTime]);

  return <QuizTimer />;
};

/**
 * Running within the expected exam duration
 */
export const Default: Story = () => (
  <div className="p-8">
    <WithElapsed seconds={4271} threshold={FIVE_HOURS} />
  </div>
);

/**
 * Just started
 */
export const Zeroed: Story = () => (
  <div className="p-8">
    <WithElapsed seconds={0} threshold={FIVE_HOURS} />
  </div>
);

/**
 * Past the 5h threshold — turns red and keeps counting
 */
export const TimeExceeded: Story = () => (
  <div className="p-8">
    <WithElapsed seconds={FIVE_HOURS + 754} threshold={FIVE_HOURS} />
  </div>
);

// No side-by-side story: the quiz store is a singleton, so two timers on the
// same page would always show the same value.
