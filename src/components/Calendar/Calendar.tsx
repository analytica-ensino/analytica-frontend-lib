import {
  useState,
  useMemo,
  useEffect,
  useRef,
  MouseEvent,
  RefObject,
} from 'react';

/**
 * Activity status types for calendar days
 */
export type ActivityStatus = 'near-deadline' | 'overdue' | 'in-deadline';

/**
 * Activity data for a specific day
 */
export interface CalendarActivity {
  id: string;
  status: ActivityStatus;
  title?: string;
}

/**
 * Calendar day data
 */
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  activities?: CalendarActivity[];
}

/**
 * Calendar variant types
 */
export type CalendarVariant = 'navigation' | 'selection';

/**
 * Calendar component props
 */
export interface CalendarProps {
  /** Calendar variant - navigation (compact) or selection (full) */
  variant?: CalendarVariant;
  /** Currently selected date */
  selectedDate?: Date;
  /** Function called when a date is selected */
  onDateSelect?: (date: Date) => void;
  /** Function called when month changes */
  onMonthChange?: (date: Date) => void;
  /** Activities data for calendar days */
  activities?: Record<string, CalendarActivity[]>;
  /** Show activities indicators */
  showActivities?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Day names abbreviations
 */
export const WEEK_DAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

/**
 * Day names single-letter abbreviations
 */
const WEEK_DAYS_SHORT = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

/**
 * Month names in Portuguese
 */
const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * Month/Year picker props
 */
interface MonthYearPickerProps {
  monthPickerRef: RefObject<HTMLDivElement | null>;
  availableYears: number[];
  currentDate: Date;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number, year: number) => void;
}

/**
 * Month/Year picker component
 */
const MonthYearPicker = ({
  monthPickerRef,
  availableYears,
  currentDate,
  onYearChange,
  onMonthChange,
}: MonthYearPickerProps) => (
  <div
    ref={monthPickerRef}
    className="absolute top-full left-0 z-50 mt-1 bg-white rounded-lg shadow-lg border border-border-200 p-4 min-w-[280px]"
  >
    <div className="mb-4">
      <h3 className="text-sm font-medium text-text-700 mb-2">Selecionar Ano</h3>
      <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => onYearChange(year)}
            className={`
              px-2 py-1 text-xs rounded text-center hover:bg-background-100 transition-colors
              ${
                year === currentDate.getFullYear()
                  ? 'bg-primary-800 text-text font-medium hover:text-text-950'
                  : 'text-text-700'
              }
            `}
          >
            {year}
          </button>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-sm font-medium text-text-700 mb-2">Selecionar Mês</h3>
      <div className="grid grid-cols-3 gap-1">
        {MONTH_NAMES.map((month, index) => (
          <button
            key={month}
            onClick={() => onMonthChange(index, currentDate.getFullYear())}
            className={`
              px-2 py-2 text-xs rounded text-center hover:bg-background-100 transition-colors
              ${
                index === currentDate.getMonth()
                  ? 'bg-primary-800 text-text font-medium hover:text-text-950'
                  : 'text-text-700'
              }
            `}
          >
            {month.substring(0, 3)}
          </button>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Helper function to get day styles based on variant and conditions
 */
const getDayStyles = (
  day: CalendarDay,
  variant: CalendarVariant,
  showActivities: boolean
) => {
  let dayStyle = '';
  let textStyle = '';

  if (variant === 'selection' && day.isSelected) {
    dayStyle = 'bg-primary-800';
    textStyle = 'text-text';
  } else if (day.isToday) {
    textStyle = 'text-primary-800';
  } else if (
    variant === 'navigation' &&
    showActivities &&
    day.activities?.length
  ) {
    const primaryActivity = day.activities[0];
    if (primaryActivity.status === 'near-deadline') {
      dayStyle = 'bg-warning-background border-2 border-warning-400';
      textStyle = 'text-text-950';
    } else if (primaryActivity.status === 'in-deadline') {
      dayStyle = 'bg-success-background border-2 border-success-300';
      textStyle = 'text-text-950';
    } else if (primaryActivity.status === 'overdue') {
      dayStyle = 'bg-error-background border-2 border-error-300';
      textStyle = 'text-text-950';
    } else {
      dayStyle = 'border-2 border-blue-500';
      textStyle = 'text-blue-500';
    }
  } else {
    textStyle = 'text-text-950 hover:bg-background-100';
  }

  return { dayStyle, textStyle };
};

/**
 * Calendar component for Analytica Ensino platforms
 *
 * A comprehensive calendar component with activity indicators,
 * date selection, and navigation capabilities.
 */
const Calendar = ({
  variant = 'selection',
  selectedDate,
  onDateSelect,
  onMonthChange,
  activities = {},
  showActivities = true,
  className = '',
}: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const monthPickerContainerRef = useRef<HTMLDivElement>(null);

  // Close month picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        monthPickerContainerRef.current &&
        !monthPickerContainerRef.current.contains(event.target as Node)
      ) {
        setIsMonthPickerOpen(false);
      }
    };

    if (isMonthPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthPickerOpen]);

  // Get today's date for comparison
  const today = new Date();

  // Generate available years (current year ± 10 years)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  }, []);

  // Calculate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);

    // Get the first Monday of the calendar view
    const startDate = new Date(firstDay);
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    startDate.setDate(startDate.getDate() - firstDayOfWeek);

    const days: CalendarDay[] = [];
    const currentCalendarDate = new Date(startDate);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateKey = currentCalendarDate.toISOString().split('T')[0];
      const dayActivities = activities[dateKey] || [];

      days.push({
        date: new Date(currentCalendarDate),
        isCurrentMonth: currentCalendarDate.getMonth() === month,
        isToday:
          currentCalendarDate.getFullYear() === today.getFullYear() &&
          currentCalendarDate.getMonth() === today.getMonth() &&
          currentCalendarDate.getDate() === today.getDate(),
        isSelected: selectedDate
          ? currentCalendarDate.getFullYear() === selectedDate.getFullYear() &&
            currentCalendarDate.getMonth() === selectedDate.getMonth() &&
            currentCalendarDate.getDate() === selectedDate.getDate()
          : false,
        activities: dayActivities,
      });

      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }

    return days;
  }, [currentDate, selectedDate, activities]);

  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  // Month/Year selection functions
  const goToMonth = (month: number, year: number) => {
    const newDate = new Date(year, month, 1);
    setCurrentDate(newDate);
    setIsMonthPickerOpen(false);
    onMonthChange?.(newDate);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(year, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
  };

  const toggleMonthPicker = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsMonthPickerOpen(!isMonthPickerOpen);
  };

  // Date selection handler
  const handleDateSelect = (day: CalendarDay) => {
    onDateSelect?.(day.date);
  };

  // Navigation variant (compact)
  if (variant === 'navigation') {
    return (
      <div className={`bg-background rounded-xl pt-6 ${className}`}>
        {/* Compact header */}
        <div className="flex items-center justify-between mb-4 px-6">
          <div className="relative" ref={monthPickerContainerRef}>
            <button
              onClick={toggleMonthPicker}
              className="flex items-center group gap-1 rounded transition-colors cursor-pointer"
            >
              <span className="text-sm font-medium text-text-600 group-hover:text-primary-950">
                {MONTH_NAMES[currentDate.getMonth()]}{' '}
                {currentDate.getFullYear()}
              </span>
              <svg
                className={`w-4 h-4 text-primary-950 transition-transform ${
                  isMonthPickerOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isMonthPickerOpen && (
              <MonthYearPicker
                monthPickerRef={monthPickerRef}
                availableYears={availableYears}
                currentDate={currentDate}
                onYearChange={handleYearChange}
                onMonthChange={goToMonth}
              />
            )}
          </div>
          <div className="flex items-center gap-10">
            <button
              onClick={goToPreviousMonth}
              className="p-1 rounded hover:bg-background-100 transition-colors"
              aria-label="Mês anterior"
            >
              <svg
                className="w-6 h-6 text-primary-950"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1 rounded hover:bg-background-100 transition-colors"
              aria-label="Próximo mês"
            >
              <svg
                className="w-6 h-6 text-primary-950"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Compact week days */}
        <div className="grid grid-cols-7 gap-1 mb-2 px-3">
          {WEEK_DAYS_SHORT.map((day, index) => (
            <div
              key={`${day}-${index}`}
              className="h-9 flex items-center justify-center text-xs font-normal text-text-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Compact calendar grid */}
        <div className="grid grid-cols-7 gap-1 px-3">
          {calendarData.map((day) => {
            // Não renderizar dias que não pertencem ao mês atual
            if (!day.isCurrentMonth) {
              return (
                <div
                  key={day.date.getTime()}
                  className="flex items-center justify-center"
                >
                  <div className="w-9 h-9"></div>
                </div>
              );
            }

            const { dayStyle, textStyle } = getDayStyles(
              day,
              variant,
              showActivities
            );

            let spanClass = '';
            if (day.isSelected && day.isToday) {
              spanClass = 'h-6 w-6 rounded-full bg-primary-800 text-text';
            } else if (day.isSelected) {
              spanClass = 'h-6 w-6 rounded-full bg-primary-950 text-text';
            }

            return (
              <div
                key={day.date.getTime()}
                className="flex items-center justify-center"
              >
                <button
                  className={`
                    w-9 h-9
                    flex items-center justify-center
                    text-md font-normal
                    cursor-pointer
                    rounded-full
                    ${dayStyle}
                    ${textStyle}
                  `}
                  onClick={() => handleDateSelect(day)}
                  aria-label={`${day.date.getDate()} de ${MONTH_NAMES[day.date.getMonth()]}`}
                  aria-current={day.isToday ? 'date' : undefined}
                  tabIndex={0}
                >
                  <span className={spanClass}>{day.date.getDate()}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Selection variant (full)
  return (
    <div className={`bg-background rounded-xl p-4 ${className}`}>
      {/* Full header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="relative" ref={monthPickerContainerRef}>
          <button
            onClick={toggleMonthPicker}
            className="flex items-center gap-2 hover:bg-background-100 rounded px-2 py-1 transition-colors"
          >
            <h2 className="text-lg font-semibold text-text-950">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <svg
              className={`w-4 h-4 text-text-400 transition-transform ${
                isMonthPickerOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isMonthPickerOpen && (
            <MonthYearPicker
              monthPickerRef={monthPickerRef}
              availableYears={availableYears}
              currentDate={currentDate}
              onYearChange={handleYearChange}
              onMonthChange={goToMonth}
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousMonth}
            className="p-1 rounded-md hover:bg-background-100 transition-colors"
            aria-label="Mês anterior"
          >
            <svg
              className="w-6 h-6 text-primary-950"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-md hover:bg-background-100 transition-colors"
            aria-label="Próximo mês"
          >
            <svg
              className="w-6 h-6 text-primary-950"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="h-4 flex items-center justify-center text-xs font-semibold text-text-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarData.map((day) => {
          // Não renderizar dias que não pertencem ao mês atual
          if (!day.isCurrentMonth) {
            return (
              <div
                key={day.date.getTime()}
                className="flex items-center justify-center"
              >
                <div className="w-10 h-10"></div>
              </div>
            );
          }

          const { dayStyle, textStyle } = getDayStyles(
            day,
            variant,
            showActivities
          );

          return (
            <div
              key={day.date.getTime()}
              className="flex items-center justify-center"
            >
              <button
                className={`
                  w-9 h-9
                  flex items-center justify-center
                  text-lg font-normal
                  cursor-pointer
                  rounded-full
                  focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-1
                  ${dayStyle}
                  ${textStyle}
                `}
                onClick={() => handleDateSelect(day)}
                aria-label={`${day.date.getDate()} de ${MONTH_NAMES[day.date.getMonth()]}`}
                aria-current={day.isToday ? 'date' : undefined}
                tabIndex={0}
              >
                {day.date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
