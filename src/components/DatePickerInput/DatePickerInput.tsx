import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CalendarBlank } from '@phosphor-icons/react';
import Calendar from '../Calendar/Calendar';
import { cn } from '../../utils/utils';

/**
 * DatePickerInput component props
 */
export interface DatePickerInputProps {
  /** Currently selected date value */
  value?: Date;
  /** Callback when date is selected */
  onChange?: (date: Date) => void;
  /** Input label */
  label?: string;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Error message to display */
  error?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * Formats a date to DD/MM/YYYY format
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * DatePickerInput component
 *
 * A date picker input that displays a Calendar in a popover when clicked.
 * Shows the selected date in DD/MM/YYYY format.
 */
const DatePickerInput = ({
  value,
  onChange,
  label,
  placeholder = 'DD/MM/AAAA',
  error,
  disabled = false,
  className,
  testId = 'date-picker-input',
}: DatePickerInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Handles click outside to close the popover
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Handles keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      } else if (event.key === 'Enter' || event.key === ' ') {
        if (!disabled) {
          setIsOpen((prev) => !prev);
        }
      }
    },
    [disabled]
  );

  /**
   * Handles date selection from Calendar
   */
  const handleDateSelect = useCallback(
    (date: Date) => {
      onChange?.(date);
      setIsOpen(false);
    },
    [onChange]
  );

  /**
   * Toggles the popover open/closed
   */
  const togglePopover = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label
          className="block text-sm font-medium text-text-700 mb-1"
          htmlFor={testId}
        >
          {label}
        </label>
      )}

      <button
        type="button"
        id={testId}
        data-testid={testId}
        onClick={togglePopover}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={label || 'Selecionar data'}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'px-3 py-2.5 rounded-md border text-left',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-1',
          disabled
            ? 'bg-background-100 text-text-400 cursor-not-allowed border-border-200'
            : 'bg-background text-text-950 cursor-pointer border-border-300 hover:border-primary-600',
          error && !disabled && 'border-error-500 focus:ring-error-500'
        )}
      >
        <span
          className={cn('text-sm', value ? 'text-text-950' : 'text-text-400')}
        >
          {value ? formatDate(value) : placeholder}
        </span>
        <CalendarBlank
          size={20}
          className={cn(
            'flex-shrink-0',
            disabled ? 'text-text-400' : 'text-text-600'
          )}
          aria-hidden="true"
        />
      </button>

      {error && (
        <p
          className="mt-1 text-xs text-error-600"
          role="alert"
          data-testid={`${testId}-error`}
        >
          {error}
        </p>
      )}

      {isOpen && !disabled && (
        <div
          className={cn(
            'absolute z-50 mt-1',
            'bg-background rounded-lg shadow-lg border border-border-200',
            'w-[300px]'
          )}
          role="dialog"
          aria-label="Calendário para seleção de data"
          data-testid={`${testId}-calendar`}
        >
          <Calendar
            variant="selection"
            selectedDate={value}
            onDateSelect={handleDateSelect}
          />
        </div>
      )}
    </div>
  );
};

export default DatePickerInput;
