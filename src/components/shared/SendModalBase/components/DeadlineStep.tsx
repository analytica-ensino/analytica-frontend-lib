import type { FC, ReactNode } from 'react';
import DateTimeInput from '../../../DateTimeInput/DateTimeInput';
import type { DateTimeChangeHandler, BaseDateTimeErrors } from '../types';

/**
 * Props for DeadlineStep component
 */
export interface DeadlineStepProps {
  /** Start date value */
  startDate: string;
  /** Start time value */
  startTime: string;
  /** Final date value */
  finalDate: string;
  /** Final time value */
  finalTime: string;
  /** Handler for start date changes */
  onStartDateChange: DateTimeChangeHandler;
  /** Handler for start time changes */
  onStartTimeChange: DateTimeChangeHandler;
  /** Handler for final date changes */
  onFinalDateChange: DateTimeChangeHandler;
  /** Handler for final time changes */
  onFinalTimeChange: DateTimeChangeHandler;
  /** Validation errors */
  errors: BaseDateTimeErrors;
  /** Optional test ID prefix */
  testIdPrefix?: string;
  /** Optional additional content to render after date/time inputs */
  children?: ReactNode;
}

/**
 * Deadline configuration step component for SendModal
 * Displays date/time inputs for start and end dates
 * Can render additional content via children prop (e.g., retry option)
 */
export const DeadlineStep: FC<DeadlineStepProps> = ({
  startDate,
  startTime,
  finalDate,
  finalTime,
  onStartDateChange,
  onStartTimeChange,
  onFinalDateChange,
  onFinalTimeChange,
  errors,
  testIdPrefix,
  children,
}) => {
  return (
    <div
      className="flex flex-col gap-4 sm:gap-6 pt-6"
      data-testid={testIdPrefix ? `${testIdPrefix}-deadline-step` : undefined}
    >
      {/* Date/Time Row - Side by Side */}
      <div className="grid grid-cols-2 gap-2">
        <DateTimeInput
          label="Iniciar em*"
          date={startDate}
          time={startTime}
          onDateChange={onStartDateChange}
          onTimeChange={onStartTimeChange}
          errorMessage={errors.startDate}
          defaultTime="00:00"
          testId={
            testIdPrefix ? `${testIdPrefix}-start-datetime` : 'start-datetime'
          }
          className="w-full"
        />

        <DateTimeInput
          label="Finalizar até*"
          date={finalDate}
          time={finalTime}
          onDateChange={onFinalDateChange}
          onTimeChange={onFinalTimeChange}
          errorMessage={errors.finalDate}
          defaultTime="23:59"
          testId={
            testIdPrefix ? `${testIdPrefix}-final-datetime` : 'final-datetime'
          }
          className="w-full"
        />
      </div>

      {/* Additional content (e.g., retry option for activities) */}
      {children}
    </div>
  );
};

export default DeadlineStep;
