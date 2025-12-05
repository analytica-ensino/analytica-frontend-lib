import type { Story } from '@ladle/react';
import { useState } from 'react';
import DatePickerInput from './DatePickerInput';

/**
 * Showcase principal: todas as variações possíveis do DatePickerInput
 */
export const AllDatePickerInputs: Story = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateWithValue, setDateWithValue] = useState<Date | undefined>(
    new Date('2025-03-15')
  );

  return (
    <div className="flex flex-col gap-8 p-6">
      <h2 className="font-bold text-3xl text-text-900">DatePickerInput</h2>
      <p className="text-text-700">
        Variações possíveis do componente <code>DatePickerInput</code>:
      </p>

      {/* Default */}
      <div className="max-w-xs">
        <h3 className="font-bold text-xl text-text-900 mb-4">Default</h3>
        <DatePickerInput
          label="Data de nascimento"
          value={selectedDate}
          onChange={setSelectedDate}
        />
        {selectedDate && (
          <p className="mt-2 text-sm text-text-600">
            Data selecionada: {selectedDate.toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      {/* With Value */}
      <div className="max-w-xs">
        <h3 className="font-bold text-xl text-text-900 mb-4">Com valor</h3>
        <DatePickerInput
          label="Data do evento"
          value={dateWithValue}
          onChange={setDateWithValue}
        />
      </div>

      {/* With Error */}
      <div className="max-w-xs">
        <h3 className="font-bold text-xl text-text-900 mb-4">Com erro</h3>
        <DatePickerInput
          label="Data de início"
          error="Campo obrigatório"
          placeholder="Selecione uma data"
        />
      </div>

      {/* Disabled */}
      <div className="max-w-xs">
        <h3 className="font-bold text-xl text-text-900 mb-4">Desabilitado</h3>
        <DatePickerInput
          label="Data bloqueada"
          disabled
          value={new Date('2025-01-01')}
        />
      </div>

      {/* Without Label */}
      <div className="max-w-xs">
        <h3 className="font-bold text-xl text-text-900 mb-4">Sem label</h3>
        <DatePickerInput placeholder="Selecione a data..." />
      </div>
    </div>
  );
};

/**
 * DatePickerInput Default
 */
export const Default: Story = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  return (
    <div className="max-w-xs p-6">
      <DatePickerInput
        label="Data de início"
        value={selectedDate}
        onChange={setSelectedDate}
      />
      {selectedDate && (
        <p className="mt-4 text-sm text-text-600">
          Data selecionada: {selectedDate.toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
  );
};

/**
 * DatePickerInput com valor inicial
 */
export const WithValue: Story = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date('2025-06-20')
  );

  return (
    <div className="max-w-xs p-6">
      <DatePickerInput
        label="Data do evento"
        value={selectedDate}
        onChange={setSelectedDate}
      />
    </div>
  );
};

/**
 * DatePickerInput com erro
 */
export const WithError: Story = () => (
  <div className="max-w-xs p-6">
    <DatePickerInput label="Data de entrega" error="Data inválida" />
  </div>
);

/**
 * DatePickerInput desabilitado
 */
export const Disabled: Story = () => (
  <div className="max-w-xs p-6">
    <DatePickerInput
      label="Data bloqueada"
      disabled
      value={new Date('2025-01-15')}
    />
  </div>
);

/**
 * DatePickerInput em um formulário
 */
export const InForm: Story = () => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  return (
    <div className="max-w-md p-6">
      <h3 className="font-bold text-xl text-text-900 mb-4">
        Selecione o período
      </h3>
      <div className="flex flex-col gap-4">
        <DatePickerInput
          label="Data de início"
          value={startDate}
          onChange={setStartDate}
        />
        <DatePickerInput
          label="Data de término"
          value={endDate}
          onChange={setEndDate}
        />
      </div>
      {startDate && endDate && (
        <div className="mt-4 p-3 bg-background-50 rounded-lg">
          <p className="text-sm text-text-600">
            Período: {startDate.toLocaleDateString('pt-BR')} até{' '}
            {endDate.toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
};
