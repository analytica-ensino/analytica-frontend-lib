import { useState, useMemo } from 'react';

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
const WEEK_DAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

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
  showActivities: _showActivities = true,
  className = '',
}: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  // Get today's date for comparison
  const today = new Date();

  // Calculate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const _lastDay = new Date(year, month + 1, 0);

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

  // Date selection handler
  const handleDateSelect = (day: CalendarDay) => {
    onDateSelect?.(day.date);
  };

  // Navigation variant (compact)
  if (variant === 'navigation') {
    return (
      <div className={`bg-background rounded-xl p-3 ${className}`}>
        {/* Compact header */}
        <div className="flex items-center justify-between mb-4 px-6">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-text-600">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <svg
              className="w-4 h-4 text-primary-950"
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
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => (
            <div
              key={index}
              className="h-9 flex items-center justify-center text-xs font-normal text-text-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Compact calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day) => {
            // Determinar o estilo baseado no status do dia
            let dayStyle = '';
            let textStyle = '';

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

            if (day.isToday) {
              textStyle = 'text-[#1c61b2]';
            } else if (day.activities && day.activities.length > 0) {
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
              // Dias normais
              textStyle = 'text-text-950 hover:bg-background-100';
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
                >
                  <span
                    className={` ${
                      day.isSelected &&
                      'h-6 w-6 rounded-full bg-primary-950 text-text'
                    } ${
                      day.isSelected &&
                      day.isToday &&
                      'h-6 w-6 rounded-full bg-[#1c61b2] text-text'
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
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
        <h2 className="text-lg font-semibold text-text-950">
          {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
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
      <div className="grid grid-cols-7 gap-1 mb-2">
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
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((day) => {
          // Determinar o estilo baseado no status do dia
          let dayStyle = '';
          let textStyle = '';

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

          if (day.isSelected) {
            dayStyle = 'bg-primary-800';
            textStyle = 'text-white';
          } else if (day.isToday) {
            textStyle = 'text-[#1c61b2]';
          } else {
            // Dias normais
            textStyle = 'text-text-950 hover:bg-background-100';
          }

          return (
            <div
              key={day.date.getTime()}
              className="flex items-center justify-center"
            >
              <button
                className={`
                  w-10 h-10 
                  flex items-center justify-center 
                  text-xl font-normal 
                  cursor-pointer 
                  rounded-full
                  ${dayStyle} 
                  ${textStyle}
                `}
                onClick={() => handleDateSelect(day)}
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
