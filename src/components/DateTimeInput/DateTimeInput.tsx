import { ChangeEvent, useRef, useState } from 'react';
import { CalendarBlank } from 'phosphor-react';
import Input from '../Input/Input';
import Calendar from '../Calendar/Calendar';
import DropdownMenu, {
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '../DropdownMenu/DropdownMenu';

export interface DateTimeInputProps {
  /** Label for the input field */
  label: string;
  /** Date value in YYYY-MM-DD format */
  date: string;
  /** Time value in HH:MM format */
  time: string;
  /** Callback when date changes */
  onDateChange: (date: string) => void;
  /** Callback when time changes */
  onTimeChange: (time: string) => void;
  /** Error message to display */
  errorMessage?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Default time when not set */
  defaultTime?: string;
  /** data-testid for testing */
  testId?: string;
  /** Label for time input */
  timeLabel?: string;
  /** Additional className for container */
  className?: string;
}

/**
 * Format Date object to YYYY-MM-DD string
 */
const formatDateToInput = (dateObj: Date): string => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * DateTimeInput component that combines date and time selection
 * with a dropdown calendar picker
 */
const DateTimeInput = ({
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  errorMessage,
  disabled = false,
  defaultTime = '00:00',
  testId,
  timeLabel = 'Hora',
  className,
}: DateTimeInputProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    date ? new Date(`${date}T12:00:00`) : undefined
  );
  const triggerRef = useRef<HTMLButtonElement>(null);

  /**
   * Handle date selection from calendar
   */
  const handleDateSelect = (dateObj: Date) => {
    setSelectedDate(dateObj);
    onDateChange(formatDateToInput(dateObj));

    if (!time) {
      onTimeChange(defaultTime);
    }
  };

  /**
   * Handle manual date input change
   */
  const handleDateInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.includes('T')) {
      const [datePart, timePart] = value.split('T');
      onDateChange(datePart);
      if (timePart) {
        onTimeChange(timePart);
      }
    } else {
      onDateChange(value);
    }

    if (value) {
      const dateObj = new Date(value);
      if (!Number.isNaN(dateObj.getTime())) {
        setSelectedDate(dateObj);
      }
    }
  };

  /**
   * Handle time input change
   */
  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    onTimeChange(e.target.value);
  };

  const inputValue = date ? `${date}T${time || defaultTime}` : '';

  return (
    <DropdownMenu
      open={!disabled && isCalendarOpen}
      onOpenChange={(open) => {
        if (!disabled) {
          setIsCalendarOpen(open);
        }
      }}
    >
      <DropdownMenuTrigger
        className={className}
        ref={triggerRef}
        disabled={disabled}
      >
        <Input
          label={label}
          type="datetime-local"
          placeholder="00/00/0000"
          value={inputValue}
          onChange={handleDateInputChange}
          variant="rounded"
          errorMessage={errorMessage}
          disabled={disabled}
          data-testid={testId ? `${testId}-input` : undefined}
          iconRight={<CalendarBlank size={14} />}
          className="[&::-webkit-calendar-picker-indicator]:hidden"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="p-0 z-[100]"
        portal
        triggerRef={triggerRef}
      >
        <Calendar
          variant="selection"
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          showActivities={false}
        />
        <div className="p-3 border-t border-border-200">
          <Input
            label={timeLabel}
            type="time"
            value={time || defaultTime}
            onChange={handleTimeChange}
            variant="rounded"
            data-testid={testId ? `${testId}-time` : undefined}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DateTimeInput;
