import type { Story } from '@ladle/react';
import { useState } from 'react';
import Calendar, { CalendarActivity } from './Calendar';

// Sample activities data
const sampleActivities: Record<string, CalendarActivity[]> = {
  '2025-01-03': [{ id: '1', status: 'overdue', title: 'Atividade atrasada' }],
  '2025-01-05': [
    { id: '2', status: 'in-deadline', title: 'Atividade no prazo' },
  ],
  '2025-01-17': [
    {
      id: '3',
      status: 'near-deadline',
      title: 'Atividade próxima do vencimento',
    },
  ],
  '2025-01-15': [
    { id: '4', status: 'in-deadline', title: 'Atividade 1' },
    { id: '5', status: 'overdue', title: 'Atividade 2' },
    { id: '6', status: 'near-deadline', title: 'Atividade 3' },
  ],
};

// Date picker component example
const DatePickerExample = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="mb-4">
        <label
          htmlFor="date-input"
          className="block text-sm font-medium text-text-700 mb-2"
        >
          Data
        </label>
        <div className="relative">
          <input
            id="date-input"
            type="text"
            value={selectedDate ? selectedDate.toLocaleDateString('pt-BR') : ''}
            placeholder="00/00/0000"
            className="w-full px-3 py-2 border border-border-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            onClick={() => setIsOpen(!isOpen)}
            readOnly
          />
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1">
          <Calendar
            variant="selection"
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            showActivities={false}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Showcase principal: todas as variações possíveis do Calendar
 */
export const AllCalendars: Story = () => (
  <div className="flex flex-col gap-8">
    <h2 className="font-bold text-3xl text-text-900">Calendar</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>Calendar</code>:
    </p>

    <div>
      <Calendar
        activities={sampleActivities}
        showActivities={true}
        variant="navigation"
        className="w-[320px]"
      />
    </div>
    {/* Calendário de navegação */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">
        Calendário de Navegação
      </h3>
      <NavigationCalendar />
    </div>

    {/* Calendário de seleção (completo) */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">
        Calendário de Seleção (Como Popover)
      </h3>
      <div className="max-w-xs">
        <DatePickerExample />
      </div>
    </div>
  </div>
);

export const SelectionCalendar: Story = () => (
  <div className="max-w-xs">
    <DatePickerExample />
  </div>
);

export const NavigationCalendar: Story = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const activitiesForDemo: Record<string, CalendarActivity[]> = {
    ...sampleActivities,
    '2025-06-01': [{ id: '8', status: 'in-deadline', title: 'No prazo' }],
    '2025-06-02': [
      { id: '9', status: 'near-deadline', title: 'Próximo do vencimento' },
    ],
    '2025-06-03': [{ id: '10', status: 'overdue', title: 'Atrasada' }],
    '2025-06-04': [{ id: '11', status: 'in-deadline', title: 'Concluída' }],
  };

  return (
    <div className="space-y-6">
      <Calendar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        activities={activitiesForDemo}
        showActivities={true}
        variant="navigation"
      />
      {selectedDate && (
        <div className="mt-4 p-3 bg-background-50 rounded-lg">
          <p className="text-sm text-text-600">
            Data selecionada: {selectedDate.toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}
      <div className="p-4 bg-background-50 rounded-lg">
        <h3 className="font-semibold mb-3">Estados das atividades:</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success-500"></div>
            <span>Atividade no prazo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning-500"></div>
            <span>Atividade próxima do vencimento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error-500"></div>
            <span>Atividade atrasada</span>
          </div>
        </div>
      </div>
    </div>
  );
};
