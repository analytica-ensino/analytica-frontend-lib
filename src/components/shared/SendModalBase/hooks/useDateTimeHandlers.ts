import { useCallback } from 'react';
import type { DateTimeChangeHandler } from '../types';

/**
 * Props for useDateTimeHandlers hook
 */
export interface UseDateTimeHandlersProps<T> {
  /** Function to set form data */
  setFormData: (data: Partial<T>) => void;
}

/**
 * Return type for useDateTimeHandlers hook
 */
export interface UseDateTimeHandlersReturn {
  /** Handler for start date changes */
  handleStartDateChange: DateTimeChangeHandler;
  /** Handler for start time changes */
  handleStartTimeChange: DateTimeChangeHandler;
  /** Handler for final date changes */
  handleFinalDateChange: DateTimeChangeHandler;
  /** Handler for final time changes */
  handleFinalTimeChange: DateTimeChangeHandler;
}

/**
 * Hook that provides memoized date/time change handlers
 * Eliminates code duplication between SendLessonModal and SendActivityModal
 * @param props - Hook properties
 * @returns Object with date/time change handlers
 */
export function useDateTimeHandlers<
  T extends {
    startDate?: string;
    startTime?: string;
    finalDate?: string;
    finalTime?: string;
  },
>({ setFormData }: UseDateTimeHandlersProps<T>): UseDateTimeHandlersReturn {
  const handleStartDateChange = useCallback(
    (value: string) => {
      setFormData({ startDate: value } as Partial<T>);
    },
    [setFormData]
  );

  const handleStartTimeChange = useCallback(
    (value: string) => {
      setFormData({ startTime: value } as Partial<T>);
    },
    [setFormData]
  );

  const handleFinalDateChange = useCallback(
    (value: string) => {
      setFormData({ finalDate: value } as Partial<T>);
    },
    [setFormData]
  );

  const handleFinalTimeChange = useCallback(
    (value: string) => {
      setFormData({ finalTime: value } as Partial<T>);
    },
    [setFormData]
  );

  return {
    handleStartDateChange,
    handleStartTimeChange,
    handleFinalDateChange,
    handleFinalTimeChange,
  };
}
