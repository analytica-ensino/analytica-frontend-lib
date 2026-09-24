import { ChangeEvent, useCallback, useId, useRef, useState } from 'react';
import { CalendarBlankIcon } from '@phosphor-icons/react/dist/csr/CalendarBlank';
import Input from '../Input/Input';
import Calendar from '../Calendar/Calendar';
import DropdownMenu, {
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
 * Teto do popover, em px.
 *
 * O padrão do `DropdownMenu` são 320px, pensado para uma lista de opções que
 * pode rolar à vontade. Aqui o conteúdo é um bloco só — calendário compacto
 * (290px) mais o rodapé da hora (59px) — e 320px cortava justamente o rodapé,
 * em qualquer tamanho de tela. Este valor deixa o calendário inteiro caber
 * quando existe espaço; quando não existe, quem manda é a folga real entre o
 * campo e a borda da janela, e o rodapé `sticky` garante a hora visível.
 */
const POPOVER_MAX_HEIGHT = 420;

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
  const triggerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const timeInputId = `datetime-time-${generatedId}`;

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
      const dateValue = value.includes('T') ? value : `${value}T12:00:00`;
      const dateObj = new Date(dateValue);
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

  /**
   * Mirrors the menu state (outside click, Escape) back to the field. Stable
   * on purpose: DropdownMenu re-notifies whenever this callback changes, and
   * a new function per render would echo its stale state right after the
   * field opens the calendar, closing it again in a loop.
   */
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!disabled) {
        setIsCalendarOpen(open);
      }
    },
    [disabled]
  );

  return (
    <DropdownMenu
      open={!disabled && isCalendarOpen}
      onOpenChange={handleOpenChange}
    >
      {/* The field itself is the entry point. It used to sit inside a
          <button>, nesting two interactive controls (invalid, and read twice
          by screen readers). Keyboard users type the date straight into the
          field; the calendar popup is a pointer shortcut that opens without
          taking the focus away from it. */}
      <div
        ref={triggerRef}
        className={className}
        onClick={() => {
          if (!disabled) setIsCalendarOpen((open) => !open);
        }}
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
          iconRight={<CalendarBlankIcon size={14} />}
          className="[&::-webkit-calendar-picker-indicator]:hidden"
        />
      </div>
      <DropdownMenuContent
        role="dialog"
        aria-label={label}
        align="start"
        className="p-0 z-[100]"
        portal
        triggerRef={triggerRef}
        maxHeight={POPOVER_MAX_HEIGHT}
      >
        <Calendar
          variant="selection"
          density="compact"
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          showActivities={false}
        />
        {/* Rodapé da hora, ancorado no fim do popover.

            O popover é `position: fixed` e só tem a altura que sobra entre o
            campo e a borda da janela, então em tela baixa ele rola. Fora do
            fluxo rolável, a hora continua à vista em qualquer altura — antes
            ela caía abaixo do corte e o usuário precisava descobrir que dava
            para rolar ali dentro. O `bg-background` é o que impede os dias de
            aparecerem por baixo ao rolar. */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border-200 bg-background px-3 py-2">
          <label
            htmlFor={timeInputId}
            className="text-sm font-bold text-text-900"
          >
            {timeLabel}
          </label>
          <Input
            id={timeInputId}
            type="time"
            value={time || defaultTime}
            onChange={handleTimeChange}
            variant="rounded"
            containerClassName="w-32 shrink-0"
            data-testid={testId ? `${testId}-time` : undefined}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DateTimeInput;
