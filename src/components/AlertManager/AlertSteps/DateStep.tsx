import { ChangeEvent, useState } from 'react';
import {
  Input,
  Calendar,
  CheckBox,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  Text,
} from '../../..';
import { CalendarBlank } from 'phosphor-react';
import { useAlertFormStore } from '../useAlertForm';
import { LabelsConfig } from '../types';

interface DateStepProps {
  labels?: LabelsConfig;
  allowScheduling?: boolean;
  allowEmailCopy?: boolean;
}

export const DateStep = ({
  labels,
  allowScheduling = true,
  allowEmailCopy = true,
}: DateStepProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const date = useAlertFormStore((state) => state.date);
  const time = useAlertFormStore((state) => state.time);
  const sendToday = useAlertFormStore((state) => state.sendToday);
  const sendCopyToEmail = useAlertFormStore((state) => state.sendCopyToEmail);
  const setDate = useAlertFormStore((state) => state.setDate);
  const setTime = useAlertFormStore((state) => state.setTime);
  const setSendToday = useAlertFormStore((state) => state.setSendToday);
  const setSendCopyToEmail = useAlertFormStore(
    (state) => state.setSendCopyToEmail
  );

  // Formata Date para o formato date (YYYY-MM-DD)
  const formatDateToInput = (dateObj: Date): string => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Formata Date para o formato time (HH:MM)
  const formatTimeToInput = (dateObj: Date): string => {
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Quando seleciona no Calendar
  const handleDateSelect = (dateObj: Date) => {
    setSelectedDate(dateObj);
    setDate(formatDateToInput(dateObj));

    if (!time) {
      setTime(formatTimeToInput(dateObj));
    }

    setIsCalendarOpen(false);
  };

  // Quando digita no input de data
  const handleDateInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDate(value);

    if (value) {
      const dateObj = new Date(value);
      if (!isNaN(dateObj.getTime())) {
        setSelectedDate(dateObj);
      }
    }
  };

  const handleTimeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  return (
    <section className="flex flex-col gap-4">
      <span className="flex flex-row items-center gap-6">
        <Text
          weight="normal"
          className={
            'cursor-pointer select-none leading-[150%] flex items-center font-roboto'
          }
        >
          {labels?.sendTodayLabel || 'Enviar Hoje?'}
        </Text>
        <CheckBox
          label="Sim"
          checked={sendToday}
          onChange={(e) => setSendToday(e.target.checked)}
        />
      </span>

      {allowScheduling && (
        <span className="grid grid-cols-2 gap-2">
          <DropdownMenu
            open={!sendToday && isCalendarOpen}
            onOpenChange={(open) => !sendToday && setIsCalendarOpen(open)}
          >
            <DropdownMenuTrigger>
              <Input
                label={labels?.dateLabel || 'Data de envio'}
                placeholder="Selecione a data de envio"
                variant="rounded"
                type="date"
                iconRight={<CalendarBlank />}
                value={date}
                onChange={handleDateInputChange}
                disabled={sendToday}
                className="text-text-950 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Calendar
                variant="selection"
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                showActivities={false}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            label={labels?.timeLabel || 'Hora de envio'}
            placeholder="Digite a hora de envio"
            variant="rounded"
            type="time"
            value={time}
            onChange={handleTimeInputChange}
            disabled={sendToday}
            className="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden"
          />
        </span>
      )}

      {allowEmailCopy && (
        <CheckBox
          label={labels?.sendCopyToEmailLabel || 'Enviar cópia para e-mail'}
          checked={sendCopyToEmail}
          onChange={(e) => setSendCopyToEmail(e.target.checked)}
        />
      )}
    </section>
  );
};
