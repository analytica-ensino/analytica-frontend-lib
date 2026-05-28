import type { Story } from '@ladle/react';
import { useState } from 'react';
import CalendarCard from './CalendarCard';
import Calendar from '../Calendar/Calendar';

/**
 * Minimal calendar content used inside `CalendarCard`. In real usage the
 * consumer passes a richer surface (grid + activities list, etc).
 */
const DemoCalendarContent = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  return (
    <div className="w-full max-w-[320px]">
      <Calendar
        className="w-full"
        variant="navigation"
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
      <div className="px-6 py-4 text-sm text-text-600">
        Selecione uma data para ver as atividades.
      </div>
    </div>
  );
};

/**
 * Default (uncontrolled): `CalendarCard` manages its own open state.
 * Click the calendar icon to open the dropdown on tablet/desktop, or the
 * modal on mobile (viewport &lt;500px).
 */
export const Default: Story = () => (
  <div className="bg-primary-800 p-4 flex justify-end">
    <CalendarCard content={<DemoCalendarContent />} />
  </div>
);

/**
 * Controlled: consumer holds the open state. Useful when the surface needs
 * to close in response to external events (e.g. route changes in the app
 * header).
 */
export const Controlled: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-primary-800 p-4 flex justify-end">
        <CalendarCard
          content={<DemoCalendarContent />}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded bg-primary-50 text-primary-950"
          onClick={() => setIsOpen(true)}
        >
          Abrir externamente
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded bg-primary-50 text-primary-950"
          onClick={() => setIsOpen(false)}
        >
          Fechar externamente
        </button>
        <span className="self-center text-sm text-text-600">
          isOpen: {String(isOpen)}
        </span>
      </div>
    </div>
  );
};

/**
 * Mobile: viewport is forced to <500px so the surface renders as a `Modal`
 * instead of a `DropdownMenu`. Resize the viewport above 500px to see the
 * dropdown variant.
 */
export const MobileModal: Story = () => (
  <div className="bg-primary-800 p-4 flex justify-end">
    <CalendarCard content={<DemoCalendarContent />} title="Calendário" />
  </div>
);

MobileModal.meta = {
  iframed: true,
  width: 'mobile',
};

/**
 * Custom title: the modal heading on mobile can be overridden via the
 * `title` prop.
 */
export const CustomTitle: Story = () => (
  <div className="bg-primary-800 p-4 flex justify-end">
    <CalendarCard content={<DemoCalendarContent />} title="Minha agenda" />
  </div>
);
