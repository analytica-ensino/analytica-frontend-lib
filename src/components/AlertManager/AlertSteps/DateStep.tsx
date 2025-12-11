import { CheckBox, Text, DateTimeInput } from '../../..';
import { useAlertFormStore } from '../useAlertForm';
import { LabelsConfig } from '../types';

interface DateStepProps {
  labels?: LabelsConfig;
  allowScheduling?: boolean;
  allowEmailCopy?: boolean;
}

/**
 * DateStep component for AlertManager
 * Handles scheduling configuration for alerts
 */
export const DateStep = ({
  labels,
  allowScheduling = true,
  allowEmailCopy = true,
}: DateStepProps) => {
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
        <DateTimeInput
          label={labels?.dateLabel || 'Data de envio'}
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
          disabled={sendToday}
          timeLabel={labels?.timeLabel || 'Hora de envio'}
          testId="alert-datetime"
        />
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
