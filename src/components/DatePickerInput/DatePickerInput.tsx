import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import { CalendarBlankIcon } from '@phosphor-icons/react';
import Calendar from '../Calendar/Calendar';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Input from '../Input/Input';
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
  /** Whether to show time selection */
  showTime?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * Formats a date to DD/MM/YYYY format or DD/MM/YYYY HH:MM when showTime is true
 * @param date - Date to format
 * @param showTime - Whether to include time in the format
 * @returns Formatted date string
 */
function formatDate(date: Date, showTime?: boolean): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  if (showTime) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return `${day}/${month}/${year}`;
}

/**
 * Parses a time string (HH or MM) ensuring it stays within bounds
 * @param value - The string value to parse
 * @param max - Maximum allowed value
 * @returns Parsed and bounded number as string
 */
function parseTimeValue(value: string, max: number): string {
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) return '00';
  if (num < 0) return '00';
  if (num > max) return max.toString().padStart(2, '0');
  return num.toString().padStart(2, '0');
}

/**
 * DatePickerInput component
 *
 * A date picker input that displays a Calendar in a popover when clicked.
 * Shows the selected date in DD/MM/YYYY format or DD/MM/YYYY HH:MM when showTime is enabled.
 */
const DatePickerInput = ({
  value,
  onChange,
  label,
  placeholder = 'DD/MM/AAAA',
  error,
  disabled = false,
  showTime = false,
  className,
  testId = 'date-picker-input',
}: DatePickerInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalDate, setInternalDate] = useState<Date | undefined>(value);
  const [selectedHour, setSelectedHour] = useState<string>(
    value ? value.getHours().toString().padStart(2, '0') : '00'
  );
  const [selectedMinute, setSelectedMinute] = useState<string>(
    value ? value.getMinutes().toString().padStart(2, '0') : '00'
  );
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Sync internal state with value prop changes
   */
  useEffect(() => {
    if (value) {
      setInternalDate(value);
      setSelectedHour(value.getHours().toString().padStart(2, '0'));
      setSelectedMinute(value.getMinutes().toString().padStart(2, '0'));
    } else {
      setInternalDate(undefined);
      setSelectedHour('00');
      setSelectedMinute('00');
    }
  }, [value]);

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
   * Handles keyboard navigation (Escape to close)
   * Note: Enter/Space are handled natively by the button element
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    },
    []
  );

  /**
   * Handles date selection from Calendar
   */
  const handleDateSelect = useCallback(
    (date: Date) => {
      if (showTime) {
        // When showTime is enabled, just update internal date
        setInternalDate(date);
      } else {
        // When showTime is disabled, close immediately
        onChange?.(date);
        setIsOpen(false);
      }
    },
    [onChange, showTime]
  );

  /**
   * Handles confirm button click when showTime is enabled
   */
  const handleConfirm = useCallback(() => {
    if (internalDate) {
      const finalDate = new Date(internalDate);
      finalDate.setHours(Number.parseInt(selectedHour, 10));
      finalDate.setMinutes(Number.parseInt(selectedMinute, 10));
      onChange?.(finalDate);
    }
    setIsOpen(false);
  }, [internalDate, selectedHour, selectedMinute, onChange]);

  /**
   * Handles hour input change
   */
  const handleHourChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newValue = parseTimeValue(e.target.value, 23);
    setSelectedHour(newValue);
  }, []);

  /**
   * Handles minute input change
   */
  const handleMinuteChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newValue = parseTimeValue(e.target.value, 59);
    setSelectedMinute(newValue);
  }, []);

  /**
   * Toggles the popover open/closed
   */
  const togglePopover = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const displayPlaceholder = showTime ? 'DD/MM/AAAA HH:MM' : placeholder;

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <Text
          as="label"
          size="sm"
          weight="medium"
          color="text-text-700"
          className="block mb-1"
          htmlFor={testId}
        >
          {label}
        </Text>
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
        <Text
          as="span"
          size="sm"
          color={value ? 'text-text-950' : 'text-text-400'}
        >
          {value ? formatDate(value, showTime) : displayPlaceholder}
        </Text>
        <CalendarBlankIcon
          size={20}
          className={cn(
            'flex-shrink-0',
            disabled ? 'text-text-400' : 'text-text-600'
          )}
          aria-hidden="true"
        />
      </button>

      {error && (
        <Text
          as="p"
          size="xs"
          color="text-error-600"
          className="mt-1"
          role="alert"
          data-testid={`${testId}-error`}
        >
          {error}
        </Text>
      )}

      {isOpen && !disabled && (
        <dialog
          open
          className={cn(
            'absolute z-50 mt-1',
            'bg-background rounded-lg shadow-lg border border-border-200',
            'w-[300px]'
          )}
          aria-label="Calendário para seleção de data"
          data-testid={`${testId}-calendar`}
        >
          <Calendar
            variant="selection"
            selectedDate={internalDate}
            onDateSelect={handleDateSelect}
          />

          {showTime && (
            <>
              <div
                className="flex items-center justify-center gap-2 px-4 py-3 border-t border-border-200"
                data-testid={`${testId}-time-selector`}
              >
                <Text size="sm" color="text-text-700">
                  Hora:
                </Text>
                <Input
                  type="number"
                  value={selectedHour}
                  onChange={handleHourChange}
                  className="w-14 text-center"
                  size="small"
                  data-testid={`${testId}-hour-input`}
                />
                <Text size="sm" color="text-text-700">
                  :
                </Text>
                <Input
                  type="number"
                  value={selectedMinute}
                  onChange={handleMinuteChange}
                  className="w-14 text-center"
                  size="small"
                  data-testid={`${testId}-minute-input`}
                />
              </div>

              <div className="px-4 py-3 border-t border-border-200">
                <Button
                  variant="solid"
                  action="primary"
                  size="small"
                  onClick={handleConfirm}
                  className="w-full"
                  data-testid={`${testId}-confirm-button`}
                >
                  Confirmar
                </Button>
              </div>
            </>
          )}
        </dialog>
      )}
    </div>
  );
};

export default DatePickerInput;
