import {
  ChangeEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { CalendarBlankIcon } from '@phosphor-icons/react/dist/csr/CalendarBlank';
import Input from '../Input/Input';
import { cn } from '../../utils/utils';
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
  const calendarButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const timeInputId = `datetime-time-${generatedId}`;
  const dialogId = `datetime-dialog-${generatedId}`;
  const isOpen = !disabled && isCalendarOpen;
  // Read by the stable handleOpenChange without recreating it
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  // Set when the calendar button opens the dialog: keyboard users need the
  // focus inside it to reach the days and the time field
  const focusDialogOnOpenRef = useRef(false);

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
      // Closing is always mirrored: a calendar closed because the field got
      // disabled must not reopen by itself once it is enabled again
      if (!disabled || !open) {
        setIsCalendarOpen(open);
      }
      if (open || !isOpenRef.current) return;
      // Escape closes the dialog from inside it; the focused day/time control
      // goes away with it, so hand the focus to the calendar button. A click
      // outside already put the focus somewhere else and is left alone.
      const active = document.activeElement;
      const focusWasInDialog =
        active === document.body ||
        (active !== null && !!contentRef.current?.contains(active));
      if (focusWasInDialog) calendarButtonRef.current?.focus();
    },
    [disabled]
  );

  /**
   * Keyboard-operable trigger for the dialog (the field itself only opens it
   * on pointer click, since keyboard users type the date into it). A
   * disabled button never fires click, and `isOpen` also honours `disabled`.
   */
  const handleCalendarButtonClick = () => {
    focusDialogOnOpenRef.current = !isCalendarOpen;
    setIsCalendarOpen((open) => !open);
  };

  // Moves the focus into the dialog opened by the calendar button. The
  // content mounts over a couple of renders (portal + fade), so retry for a
  // few frames until it exists.
  useEffect(() => {
    if (!isOpen || !focusDialogOnOpenRef.current) return;
    focusDialogOnOpenRef.current = false;
    let frame = 0;
    let attempts = 0;
    const focusDialog = () => {
      if (contentRef.current) {
        contentRef.current.focus();
      } else if (attempts++ < 5) {
        frame = requestAnimationFrame(focusDialog);
      }
    };
    frame = requestAnimationFrame(focusDialog);
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      {/* The field itself is the entry point. It used to sit inside a
          <button>, nesting two interactive controls (invalid, and read twice
          by screen readers). Keyboard users type the date straight into the
          field, and the calendar icon is a real button that opens the dialog
          from the keyboard too. A pointer click on the field also opens it,
          without taking the focus away (the click lives on the native input:
          the label forwards its click to it). */}
      {/*
        min-w-0 on the wrapper and the input: iOS Safari gives a native
        datetime-local input an intrinsic min width that ignores `w-full`, so
        the field overflowed its parent (e.g. past the modal buttons).
        `appearance-none` drops the native sizing; the value is kept left
        aligned because iOS centers it once the appearance is removed.
      */}
      <div ref={triggerRef} className={cn('min-w-0', className)}>
        <Input
          // A disabled input fires no click; `isOpen` honours `disabled` too
          onClick={() => setIsCalendarOpen((open) => !open)}
          label={label}
          type="datetime-local"
          placeholder="00/00/0000"
          value={inputValue}
          onChange={handleDateInputChange}
          variant="rounded"
          errorMessage={errorMessage}
          disabled={disabled}
          data-testid={testId ? `${testId}-input` : undefined}
          iconRight={
            // The icon slot ignores pointer events; the button opts back in
            <button
              ref={calendarButtonRef}
              type="button"
              aria-label="Abrir calendário"
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              aria-controls={isOpen ? dialogId : undefined}
              disabled={disabled}
              onClick={handleCalendarButtonClick}
              className="pointer-events-auto flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              <CalendarBlankIcon size={14} aria-hidden="true" />
            </button>
          }
          className="min-w-0 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-date-and-time-value]:text-left"
        />
      </div>
      <DropdownMenuContent
        ref={contentRef}
        id={dialogId}
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
