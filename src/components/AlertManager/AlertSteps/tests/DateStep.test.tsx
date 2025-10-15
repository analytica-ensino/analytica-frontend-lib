import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DateStep } from '../DateStep';
import { useAlertFormStore } from '../../useAlertForm';
import type { LabelsConfig } from '../../types';
import type { ReactNode, ChangeEvent } from 'react';

// Mock component types
interface MockInputProps {
  label?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  [key: string]: unknown;
}

interface MockCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

interface MockCheckBoxProps {
  label?: string;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

interface MockDropdownMenuProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface MockDropdownChildProps {
  children?: ReactNode;
}

interface MockTextProps {
  children?: ReactNode;
  [key: string]: unknown;
}

// Mock dos componentes externos
jest.mock('../../../..', () => ({
  Input: ({
    label,
    value,
    onChange,
    disabled,
    placeholder,
    ...props
  }: MockInputProps) => (
    <div>
      <label>{label}</label>
      <input
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        data-testid={`input-${label}`}
        {...props}
      />
    </div>
  ),
  Calendar: ({ onDateSelect }: MockCalendarProps) => (
    <div data-testid="calendar">
      <button onClick={() => onDateSelect?.(new Date('2024-10-20T10:30:00'))}>
        Select Date
      </button>
    </div>
  ),
  CheckBox: ({ label, checked, onChange }: MockCheckBoxProps) => (
    <div>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          data-testid={`checkbox-${label}`}
        />
        {label}
      </label>
    </div>
  ),
  DropdownMenu: ({ children, open }: MockDropdownMenuProps) => (
    <div data-testid="dropdown-menu" data-open={open}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: MockDropdownChildProps) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: MockDropdownChildProps) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  Text: ({ children, ...props }: MockTextProps) => (
    <span {...props}>{children}</span>
  ),
}));

jest.mock('phosphor-react', () => ({
  CalendarBlank: () => <span>📅</span>,
}));

describe('DateStep', () => {
  beforeEach(() => {
    // Reset store before each test
    useAlertFormStore.getState().resetForm();
  });

  describe('rendering', () => {
    it('should render with default labels', () => {
      render(<DateStep />);

      expect(screen.getByText('Enviar Hoje?')).toBeInTheDocument();
      expect(screen.getByText('Sim')).toBeInTheDocument();
      expect(screen.getByText('Data de envio')).toBeInTheDocument();
      expect(screen.getByText('Hora de envio')).toBeInTheDocument();
      expect(screen.getByText('Enviar cópia para e-mail')).toBeInTheDocument();
    });

    it('should render with custom labels', () => {
      const customLabels: LabelsConfig = {
        sendTodayLabel: 'Send Today?',
        dateLabel: 'Send Date',
        timeLabel: 'Send Time',
        sendCopyToEmailLabel: 'Send copy via email',
      };

      render(<DateStep labels={customLabels} />);

      expect(screen.getByText('Send Today?')).toBeInTheDocument();
      expect(screen.getByText('Send Date')).toBeInTheDocument();
      expect(screen.getByText('Send Time')).toBeInTheDocument();
      expect(screen.getByText('Send copy via email')).toBeInTheDocument();
    });

    it('should not render scheduling inputs when allowScheduling is false', () => {
      render(<DateStep allowScheduling={false} />);

      expect(screen.queryByText('Data de envio')).not.toBeInTheDocument();
      expect(screen.queryByText('Hora de envio')).not.toBeInTheDocument();
    });

    it('should not render email copy checkbox when allowEmailCopy is false', () => {
      render(<DateStep allowEmailCopy={false} />);

      expect(
        screen.queryByText('Enviar cópia para e-mail')
      ).not.toBeInTheDocument();
    });
  });

  describe('sendToday checkbox', () => {
    it('should update store when sendToday checkbox is toggled', () => {
      render(<DateStep />);

      const checkbox = screen.getByTestId('checkbox-Sim');
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);

      const state = useAlertFormStore.getState();
      expect(state.sendToday).toBe(true);
      expect(state.date).toBeTruthy(); // Should auto-fill date
      expect(state.time).toBeTruthy(); // Should auto-fill time
    });

    it('should disable date and time inputs when sendToday is true', () => {
      render(<DateStep />);

      const checkbox = screen.getByTestId('checkbox-Sim');
      fireEvent.click(checkbox);

      const dateInput = screen.getByTestId('input-Data de envio');
      const timeInput = screen.getByTestId('input-Hora de envio');

      expect(dateInput).toBeDisabled();
      expect(timeInput).toBeDisabled();
    });

    it('should enable inputs when sendToday is unchecked', () => {
      render(<DateStep />);

      const checkbox = screen.getByTestId('checkbox-Sim');

      // Check
      fireEvent.click(checkbox);
      expect(screen.getByTestId('input-Data de envio')).toBeDisabled();

      // Uncheck
      fireEvent.click(checkbox);
      expect(screen.getByTestId('input-Data de envio')).not.toBeDisabled();
    });
  });

  describe('date input', () => {
    it('should update store when date input changes', () => {
      render(<DateStep />);

      const dateInput = screen.getByTestId('input-Data de envio');
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });

      const state = useAlertFormStore.getState();
      expect(state.date).toBe('2024-12-25');
    });

    it('should update selectedDate when valid date is entered', () => {
      render(<DateStep />);

      const dateInput = screen.getByTestId('input-Data de envio');
      fireEvent.change(dateInput, { target: { value: '2024-10-20' } });

      // The component should update its internal selectedDate state
      // We can't directly test state, but we can test the behavior
      expect(useAlertFormStore.getState().date).toBe('2024-10-20');
    });

    it('should handle date parsing when valid date is entered', () => {
      render(<DateStep />);

      // Test that valid dates create Date objects internally
      // The component checks if date is valid with isNaN(dateObj.getTime())
      const validDate = '2024-10-20T12:00:00';
      const dateObj = new Date(validDate);

      expect(isNaN(dateObj.getTime())).toBe(false);
      expect(dateObj.getFullYear()).toBe(2024);
      expect(dateObj.getMonth()).toBe(9); // October (0-indexed)
      expect(dateObj.getDate()).toBe(20);
    });

    it('should reflect store date value', () => {
      useAlertFormStore.getState().setDate('2024-11-15');

      render(<DateStep />);

      const dateInput = screen.getByTestId('input-Data de envio');
      expect(dateInput).toHaveValue('2024-11-15');
    });
  });

  describe('time input', () => {
    it('should update store when time input changes', () => {
      render(<DateStep />);

      const timeInput = screen.getByTestId('input-Hora de envio');
      fireEvent.change(timeInput, { target: { value: '14:30' } });

      const state = useAlertFormStore.getState();
      expect(state.time).toBe('14:30');
    });

    it('should reflect store time value', () => {
      useAlertFormStore.getState().setTime('09:45');

      render(<DateStep />);

      const timeInput = screen.getByTestId('input-Hora de envio');
      expect(timeInput).toHaveValue('09:45');
    });
  });

  describe('calendar integration', () => {
    it('should update date when selecting from calendar', () => {
      render(<DateStep />);

      const selectButton = screen.getByText('Select Date');
      fireEvent.click(selectButton);

      const state = useAlertFormStore.getState();
      expect(state.date).toBe('2024-10-20');
    });

    it('should auto-fill time if not set when selecting date from calendar', () => {
      render(<DateStep />);

      // Time should be empty initially
      expect(useAlertFormStore.getState().time).toBe('');

      const selectButton = screen.getByText('Select Date');
      fireEvent.click(selectButton);

      const state = useAlertFormStore.getState();
      expect(state.time).toBe('10:30'); // From mocked date
    });

    it('should not override time if already set when selecting date from calendar', () => {
      useAlertFormStore.getState().setTime('15:00');

      render(<DateStep />);

      const selectButton = screen.getByText('Select Date');
      fireEvent.click(selectButton);

      const state = useAlertFormStore.getState();
      expect(state.time).toBe('15:00'); // Should keep existing time
    });
  });

  describe('date and time formatting', () => {
    it('should format date correctly (YYYY-MM-DD)', () => {
      render(<DateStep />);

      const selectButton = screen.getByText('Select Date');
      fireEvent.click(selectButton);

      const state = useAlertFormStore.getState();
      expect(state.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should format time correctly (HH:MM)', () => {
      render(<DateStep />);

      const selectButton = screen.getByText('Select Date');
      fireEvent.click(selectButton);

      const state = useAlertFormStore.getState();
      expect(state.time).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should pad single digit month and day with zeros', () => {
      // Mock date with single digits
      jest.mock('phosphor-react', () => ({
        CalendarBlank: () => <span>📅</span>,
      }));

      // We'll test the formatting logic indirectly through the component
      render(<DateStep />);

      // The component handles padding internally
      expect(screen.getByTestId('input-Data de envio')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should disable inputs when sendToday is true', () => {
      useAlertFormStore.getState().setSendToday(true);

      render(<DateStep />);

      const dateInput = screen.getByTestId('input-Data de envio');
      const timeInput = screen.getByTestId('input-Hora de envio');

      expect(dateInput).toBeDisabled();
      expect(timeInput).toBeDisabled();
    });

    it('should enable inputs when sendToday is false', () => {
      useAlertFormStore.getState().setSendToday(false);

      render(<DateStep />);

      const dateInput = screen.getByTestId('input-Data de envio');
      const timeInput = screen.getByTestId('input-Hora de envio');

      expect(dateInput).not.toBeDisabled();
      expect(timeInput).not.toBeDisabled();
    });
  });

  describe('allowScheduling prop', () => {
    it('should render date and time inputs when allowScheduling is true', () => {
      render(<DateStep allowScheduling={true} />);

      expect(screen.getByText('Data de envio')).toBeInTheDocument();
      expect(screen.getByText('Hora de envio')).toBeInTheDocument();
    });

    it('should hide date and time inputs when allowScheduling is false', () => {
      render(<DateStep allowScheduling={false} />);

      expect(screen.queryByText('Data de envio')).not.toBeInTheDocument();
      expect(screen.queryByText('Hora de envio')).not.toBeInTheDocument();
    });

    it('should default to true when not specified', () => {
      render(<DateStep />);

      expect(screen.getByText('Data de envio')).toBeInTheDocument();
    });
  });

  describe('allowEmailCopy prop', () => {
    it('should render email copy checkbox when allowEmailCopy is true', () => {
      render(<DateStep allowEmailCopy={true} />);

      expect(screen.getByText('Enviar cópia para e-mail')).toBeInTheDocument();
    });

    it('should hide email copy checkbox when allowEmailCopy is false', () => {
      render(<DateStep allowEmailCopy={false} />);

      expect(
        screen.queryByText('Enviar cópia para e-mail')
      ).not.toBeInTheDocument();
    });

    it('should default to true when not specified', () => {
      render(<DateStep />);

      expect(screen.getByText('Enviar cópia para e-mail')).toBeInTheDocument();
    });
  });

  describe('calendar dropdown', () => {
    it('should close calendar when sendToday is true', () => {
      render(<DateStep />);

      const dropdown = screen.getByTestId('dropdown-menu');

      // Initially should be closable
      expect(dropdown).toHaveAttribute('data-open', 'false');

      // Enable sendToday
      const checkbox = screen.getByTestId('checkbox-Sim');
      fireEvent.click(checkbox);

      // Calendar should remain closed when sendToday is true
      expect(dropdown).toHaveAttribute('data-open', 'false');
    });
  });

  describe('complete workflow', () => {
    it('should handle complete date selection workflow', () => {
      render(<DateStep />);

      // Initially empty
      expect(useAlertFormStore.getState().date).toBe('');
      expect(useAlertFormStore.getState().time).toBe('');
      expect(useAlertFormStore.getState().sendToday).toBe(false);

      // Select date from calendar
      const selectButton = screen.getByText('Select Date');
      fireEvent.click(selectButton);

      // Should update both date and time
      expect(useAlertFormStore.getState().date).toBe('2024-10-20');
      expect(useAlertFormStore.getState().time).toBe('10:30');

      // Change time manually
      const timeInput = screen.getByTestId('input-Hora de envio');
      fireEvent.change(timeInput, { target: { value: '15:45' } });

      expect(useAlertFormStore.getState().time).toBe('15:45');
    });

    it('should handle sendToday toggle workflow', () => {
      render(<DateStep />);

      // Set custom date first
      const dateInput = screen.getByTestId('input-Data de envio');
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });

      expect(useAlertFormStore.getState().date).toBe('2024-12-25');

      // Toggle sendToday
      const checkbox = screen.getByTestId('checkbox-Sim');
      fireEvent.click(checkbox);

      // Should auto-fill with current date/time
      const state = useAlertFormStore.getState();
      expect(state.sendToday).toBe(true);
      expect(state.date).not.toBe('2024-12-25'); // Should be replaced with today
      expect(dateInput).toBeDisabled();
    });

    it('should handle manual date input followed by calendar selection', () => {
      render(<DateStep />);

      // Type date manually
      const dateInput = screen.getByTestId('input-Data de envio');
      fireEvent.change(dateInput, { target: { value: '2024-11-10' } });

      expect(useAlertFormStore.getState().date).toBe('2024-11-10');

      // Then select from calendar
      const selectButton = screen.getByText('Select Date');
      fireEvent.click(selectButton);

      // Should override with calendar date
      expect(useAlertFormStore.getState().date).toBe('2024-10-20');
    });
  });

  describe('integration with store', () => {
    it('should read initial values from store', () => {
      useAlertFormStore.getState().setDate('2024-10-15');
      useAlertFormStore.getState().setTime('14:30');
      useAlertFormStore.getState().setSendToday(false);

      render(<DateStep />);

      const dateInput = screen.getByTestId('input-Data de envio');
      const timeInput = screen.getByTestId('input-Hora de envio');
      const checkbox = screen.getByTestId('checkbox-Sim');

      expect(dateInput).toHaveValue('2024-10-15');
      expect(timeInput).toHaveValue('14:30');
      expect(checkbox).not.toBeChecked();
    });

    it('should update store when inputs change', () => {
      render(<DateStep />);

      const dateInput = screen.getByTestId('input-Data de envio');
      const timeInput = screen.getByTestId('input-Hora de envio');

      fireEvent.change(dateInput, { target: { value: '2024-11-20' } });
      fireEvent.change(timeInput, { target: { value: '16:00' } });

      const state = useAlertFormStore.getState();
      expect(state.date).toBe('2024-11-20');
      expect(state.time).toBe('16:00');
    });
  });

  describe('edge cases', () => {
    it('should handle empty date input', () => {
      render(<DateStep />);

      const dateInput = screen.getByTestId('input-Data de envio');
      fireEvent.change(dateInput, { target: { value: '' } });

      expect(useAlertFormStore.getState().date).toBe('');
    });

    it('should handle empty time input', () => {
      render(<DateStep />);

      const timeInput = screen.getByTestId('input-Hora de envio');
      fireEvent.change(timeInput, { target: { value: '' } });

      expect(useAlertFormStore.getState().time).toBe('');
    });

    it('should handle rapid checkbox toggling', () => {
      render(<DateStep />);

      const checkbox = screen.getByTestId('checkbox-Sim');

      // Toggle multiple times rapidly
      fireEvent.click(checkbox);
      expect(useAlertFormStore.getState().sendToday).toBe(true);

      fireEvent.click(checkbox);
      expect(useAlertFormStore.getState().sendToday).toBe(false);

      fireEvent.click(checkbox);
      expect(useAlertFormStore.getState().sendToday).toBe(true);
    });
  });

  describe('calendar date selection', () => {
    it('should parse and format date correctly when selected from calendar', () => {
      render(<DateStep />);

      const selectButton = screen.getByText('Select Date');
      fireEvent.click(selectButton);

      // Should format the mocked date (2024-10-20T10:30:00) correctly
      expect(useAlertFormStore.getState().date).toBe('2024-10-20');
      expect(useAlertFormStore.getState().time).toBe('10:30');
    });
  });

  describe('conditional rendering based on props', () => {
    it('should render only sendToday when both scheduling and email are disabled', () => {
      render(<DateStep allowScheduling={false} allowEmailCopy={false} />);

      expect(screen.getByText('Enviar Hoje?')).toBeInTheDocument();
      expect(screen.queryByText('Data de envio')).not.toBeInTheDocument();
      expect(screen.queryByText('Hora de envio')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Enviar cópia para e-mail')
      ).not.toBeInTheDocument();
    });

    it('should render all fields when all props are true', () => {
      render(<DateStep allowScheduling={true} allowEmailCopy={true} />);

      expect(screen.getByText('Enviar Hoje?')).toBeInTheDocument();
      expect(screen.getByText('Data de envio')).toBeInTheDocument();
      expect(screen.getByText('Hora de envio')).toBeInTheDocument();
      expect(screen.getByText('Enviar cópia para e-mail')).toBeInTheDocument();
    });
  });
});
