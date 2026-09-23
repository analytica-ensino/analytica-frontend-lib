import type { Story } from '@ladle/react';
import { useState } from 'react';
import DateTimeInput from './DateTimeInput';

/**
 * Default DateTimeInput
 */
export const Default: Story = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  return (
    <div className="w-80">
      <DateTimeInput
        label="Data e hora"
        date={date}
        time={time}
        onDateChange={setDate}
        onTimeChange={setTime}
      />
      <p className="mt-4 text-sm text-text-600">
        Valor: {date} {time}
      </p>
    </div>
  );
};

/**
 * With initial values
 */
export const WithValues: Story = () => {
  const [date, setDate] = useState('2025-01-15');
  const [time, setTime] = useState('14:30');

  return (
    <div className="w-80">
      <DateTimeInput
        label="Iniciar em"
        date={date}
        time={time}
        onDateChange={setDate}
        onTimeChange={setTime}
      />
    </div>
  );
};

/**
 * With error message
 */
export const WithError: Story = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  return (
    <div className="w-80">
      <DateTimeInput
        label="Data obrigatória"
        date={date}
        time={time}
        onDateChange={setDate}
        onTimeChange={setTime}
        errorMessage="Por favor, selecione uma data"
      />
    </div>
  );
};

/**
 * Disabled state
 */
export const Disabled: Story = () => {
  return (
    <div className="w-80">
      <DateTimeInput
        label="Data desabilitada"
        date="2025-01-15"
        time="10:00"
        onDateChange={() => {}}
        onTimeChange={() => {}}
        disabled
      />
    </div>
  );
};

/**
 * With custom default time
 */
export const WithDefaultTime: Story = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  return (
    <div className="w-80">
      <DateTimeInput
        label="Finalizar até"
        date={date}
        time={time}
        onDateChange={setDate}
        onTimeChange={setTime}
        defaultTime="23:59"
      />
      <p className="mt-2 text-xs text-text-500">
        Hora padrão definida como 23:59
      </p>
    </div>
  );
};

/**
 * Pouco espaço abaixo do campo — o caso que motivou o rodapé ancorado.
 *
 * Reproduz o que acontece no passo "Prazo" do SendActivityModal numa janela
 * baixa: o popover é `position: fixed` e só recebe a altura que sobra até a
 * borda da tela, então o calendário rola. Encolha a janela até o campo ficar
 * perto do rodapé — o bloco "Hora" continua visível, sem precisar rolar
 * dentro do popover para descobrir que ele existe.
 */
export const LowViewport: Story = () => {
  const [date, setDate] = useState('2026-09-23');
  const [time, setTime] = useState('00:00');

  return (
    // 55% da altura acima do campo deixa abaixo dele menos do que os 363px que
    // o popover pede, sem chegar ao ponto em que ele vira para cima.
    <div className="h-[calc(100dvh-2rem)] pt-[55dvh]">
      <div className="w-80">
        <DateTimeInput
          label="Iniciar em*"
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
          defaultTime="00:00"
        />
      </div>
    </div>
  );
};

/**
 * Date range example (two DateTimeInputs)
 */
export const DateRange: Story = () => {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  return (
    <div className="grid grid-cols-2 gap-4 w-[600px]">
      <DateTimeInput
        label="Iniciar em"
        date={startDate}
        time={startTime}
        onDateChange={setStartDate}
        onTimeChange={setStartTime}
        defaultTime="00:00"
      />
      <DateTimeInput
        label="Finalizar até"
        date={endDate}
        time={endTime}
        onDateChange={setEndDate}
        onTimeChange={setEndTime}
        defaultTime="23:59"
      />
    </div>
  );
};
