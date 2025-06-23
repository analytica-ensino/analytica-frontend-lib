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

// Interactive navigation calendar component
const InteractiveNavigationCalendar = ({
  activities = {},
  showActivities = true,
}: {
  activities?: Record<string, CalendarActivity[]>;
  showActivities?: boolean;
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  return (
    <div>
      <Calendar
        variant="navigation"
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        activities={activities}
        showActivities={showActivities}
      />
      {selectedDate && (
        <div className="mt-4 p-3 bg-background-50 rounded-lg">
          <p className="text-sm text-text-600">
            Data selecionada: {selectedDate.toLocaleDateString('pt-BR')}
          </p>
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

    {/* Calendário de navegação (compacto) */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">
        Calendário de Navegação (Compacto)
      </h3>
      <InteractiveNavigationCalendar />
    </div>

    {/* Calendário de seleção (completo) */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">
        Calendário de Seleção (Completo)
      </h3>
      <Calendar variant="selection" showActivities={true} />
    </div>

    {/* Com data selecionada */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">
        Com Data Selecionada
      </h3>
      <Calendar selectedDate={new Date(2025, 0, 15)} showActivities={true} />
    </div>

    {/* Com atividades */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">Com Atividades</h3>
      <Calendar
        selectedDate={new Date(2025, 0, 15)}
        activities={sampleActivities}
        showActivities={true}
      />
    </div>

    {/* Sem indicadores de atividades */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">
        Sem Indicadores de Atividades
      </h3>
      <Calendar
        selectedDate={new Date(2025, 0, 15)}
        activities={sampleActivities}
        showActivities={false}
      />
    </div>

    {/* Estados das atividades */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">
        Estados das Atividades
      </h3>
      <div className="space-y-6">
        <Calendar
          selectedDate={new Date(2025, 0, 15)}
          activities={{
            ...sampleActivities,
            '2025-01-01': [
              { id: '8', status: 'in-deadline', title: 'No prazo' },
            ],
            '2025-01-02': [
              {
                id: '9',
                status: 'near-deadline',
                title: 'Próximo do vencimento',
              },
            ],
            '2025-01-03': [{ id: '10', status: 'overdue', title: 'Atrasada' }],
            '2025-01-04': [
              { id: '11', status: 'in-deadline', title: 'Concluída' },
            ],
          }}
          showActivities={true}
        />
        <div className="p-4 bg-background-50 rounded-lg">
          <h4 className="font-semibold mb-3">Legenda dos estados:</h4>
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
    </div>
  </div>
);

// Stories individuais para referência rápida
export const NavigationCalendar: Story = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  return (
    <div>
      <Calendar
        variant="navigation"
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        showActivities={true}
      />
      {selectedDate && (
        <div className="mt-4 p-3 bg-background-50 rounded-lg">
          <p className="text-sm text-text-600">
            Data selecionada: {selectedDate.toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
};

export const SelectionCalendar: Story = () => (
  <Calendar variant="selection" showActivities={true} />
);

export const Default: Story = () => (
  <Calendar variant="selection" showActivities={true} />
);

export const WithSelectedDate: Story = () => (
  <Calendar selectedDate={new Date(2025, 0, 15)} showActivities={true} />
);

export const WithActivities: Story = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(2025, 0, 15)
  );

  return (
    <div>
      <Calendar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        activities={sampleActivities}
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
    </div>
  );
};

export const WithoutActivities: Story = () => (
  <Calendar
    selectedDate={new Date(2025, 0, 15)}
    activities={sampleActivities}
    showActivities={false}
  />
);

export const Interactive: Story = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  return (
    <div className="p-4">
      <Calendar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        activities={sampleActivities}
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
    </div>
  );
};

export const ActivityStates: Story = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(2025, 0, 15)
  );

  const activitiesForDemo: Record<string, CalendarActivity[]> = {
    ...sampleActivities,
    '2025-01-01': [{ id: '8', status: 'in-deadline', title: 'No prazo' }],
    '2025-01-02': [
      { id: '9', status: 'near-deadline', title: 'Próximo do vencimento' },
    ],
    '2025-01-03': [{ id: '10', status: 'overdue', title: 'Atrasada' }],
    '2025-01-04': [{ id: '11', status: 'in-deadline', title: 'Concluída' }],
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
