import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DateStep } from '../DateStep';
import { useAlertFormStore } from '../../useAlertForm';
import type { LabelsConfig } from '../../types';
import type { ReactNode, ChangeEvent } from 'react';

/**
 * Mock component types
 */
interface MockDateTimeInputProps {
  label?: string;
  date?: string;
  time?: string;
  onDateChange?: (date: string) => void;
  onTimeChange?: (time: string) => void;
  disabled?: boolean;
  timeLabel?: string;
  testId?: string;
}

interface MockCheckBoxProps {
  label?: string;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

interface MockTextProps {
  children?: ReactNode;
  [key: string]: unknown;
}

/**
 * Mock external components
 */
jest.mock('../../../..', () => ({
  DateTimeInput: ({
    label,
    date,
    time,
    onDateChange,
    onTimeChange,
    disabled,
    timeLabel,
    testId,
  }: MockDateTimeInputProps) => (
    <div data-testid={testId || 'datetime-input'}>
      <label>{label}</label>
      {timeLabel && <span>{timeLabel}</span>}
      <input
        type="datetime-local"
        value={date && time ? `${date}T${time}` : ''}
        onChange={(e) => {
          const value = e.target.value;
          if (value.includes('T')) {
            const [datePart, timePart] = value.split('T');
            onDateChange?.(datePart);
            onTimeChange?.(timePart);
          } else {
            onDateChange?.(value);
          }
        }}
        disabled={disabled}
        data-testid={`${testId || 'datetime'}-input`}
      />
      {/* Mock calendar date selection button */}
      <button
        onClick={() => {
          onDateChange?.('2024-10-20');
          if (!time) {
            onTimeChange?.('10:30');
          }
        }}
        data-testid={`${testId || 'datetime'}-calendar-select`}
      >
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
  Text: ({ children, ...props }: MockTextProps) => (
    <span {...props}>{children}</span>
  ),
}));

describe('DateStep', () => {
  beforeEach(() => {
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

    it('should not render DateTimeInput when allowScheduling is false', () => {
      render(<DateStep allowScheduling={false} />);

      expect(screen.queryByText('Data de envio')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('alert-datetime-input')
      ).not.toBeInTheDocument();
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
      expect(state.date).toBeTruthy();
      expect(state.time).toBeTruthy();
    });

    it('should disable DateTimeInput when sendToday is true', () => {
      render(<DateStep />);

      const checkbox = screen.getByTestId('checkbox-Sim');
      fireEvent.click(checkbox);

      const dateTimeInput = screen.getByTestId('alert-datetime-input');
      expect(dateTimeInput).toBeDisabled();
    });

    it('should enable DateTimeInput when sendToday is unchecked', () => {
      useAlertFormStore.getState().resetForm();
      render(<DateStep />);

      const checkbox = screen.getByTestId('checkbox-Sim');

      fireEvent.click(checkbox);
      expect(screen.getByTestId('alert-datetime-input')).toBeDisabled();

      fireEvent.click(checkbox);
      expect(screen.getByTestId('alert-datetime-input')).not.toBeDisabled();
    });
  });

  describe('datetime input', () => {
    it('should update store when datetime input changes', () => {
      render(<DateStep />);

      const dateTimeInput = screen.getByTestId('alert-datetime-input');
      fireEvent.change(dateTimeInput, {
        target: { value: '2024-12-25T14:30' },
      });

      const state = useAlertFormStore.getState();
      expect(state.date).toBe('2024-12-25');
      expect(state.time).toBe('14:30');
    });

    it('should reflect store values', () => {
      useAlertFormStore.getState().setDate('2024-11-15');
      useAlertFormStore.getState().setTime('09:45');

      render(<DateStep />);

      const dateTimeInput = screen.getByTestId('alert-datetime-input');
      expect(dateTimeInput).toHaveValue('2024-11-15T09:45');
    });
  });

  describe('calendar integration', () => {
    it('should update date when selecting from calendar', () => {
      render(<DateStep />);

      const selectButton = screen.getByTestId('alert-datetime-calendar-select');
      fireEvent.click(selectButton);

      const state = useAlertFormStore.getState();
      expect(state.date).toBe('2024-10-20');
    });

    it('should auto-fill time if not set when selecting date from calendar', () => {
      render(<DateStep />);

      expect(useAlertFormStore.getState().time).toBe('');

      const selectButton = screen.getByTestId('alert-datetime-calendar-select');
      fireEvent.click(selectButton);

      const state = useAlertFormStore.getState();
      expect(state.time).toBe('10:30');
    });

    it('should not override time if already set when selecting date from calendar', () => {
      useAlertFormStore.getState().setTime('15:00');

      render(<DateStep />);

      const selectButton = screen.getByTestId('alert-datetime-calendar-select');
      fireEvent.click(selectButton);

      const state = useAlertFormStore.getState();
      expect(state.time).toBe('15:00');
    });
  });

  describe('date and time formatting', () => {
    it('should format date correctly (YYYY-MM-DD)', () => {
      render(<DateStep />);

      const selectButton = screen.getByTestId('alert-datetime-calendar-select');
      fireEvent.click(selectButton);

      const state = useAlertFormStore.getState();
      expect(state.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should format time correctly (HH:MM)', () => {
      render(<DateStep />);

      const selectButton = screen.getByTestId('alert-datetime-calendar-select');
      fireEvent.click(selectButton);

      const state = useAlertFormStore.getState();
      expect(state.time).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('disabled state', () => {
    it('should disable input when sendToday is true', () => {
      useAlertFormStore.getState().setSendToday(true);

      render(<DateStep />);

      const dateTimeInput = screen.getByTestId('alert-datetime-input');
      expect(dateTimeInput).toBeDisabled();
    });

    it('should enable input when sendToday is false', () => {
      useAlertFormStore.getState().resetForm();
      useAlertFormStore.getState().setSendToday(false);

      render(<DateStep />);

      const dateTimeInput = screen.getByTestId('alert-datetime-input');
      expect(dateTimeInput).not.toBeDisabled();
    });
  });

  describe('allowScheduling prop', () => {
    it('should render DateTimeInput when allowScheduling is true', () => {
      render(<DateStep allowScheduling={true} />);

      expect(screen.getByText('Data de envio')).toBeInTheDocument();
      expect(screen.getByTestId('alert-datetime')).toBeInTheDocument();
    });

    it('should hide DateTimeInput when allowScheduling is false', () => {
      render(<DateStep allowScheduling={false} />);

      expect(screen.queryByText('Data de envio')).not.toBeInTheDocument();
      expect(screen.queryByTestId('alert-datetime')).not.toBeInTheDocument();
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

  describe('complete workflow', () => {
    it('should handle complete date selection workflow', () => {
      render(<DateStep />);

      expect(useAlertFormStore.getState().date).toBe('');
      expect(useAlertFormStore.getState().time).toBe('');
      expect(useAlertFormStore.getState().sendToday).toBe(false);

      const selectButton = screen.getByTestId('alert-datetime-calendar-select');
      fireEvent.click(selectButton);

      expect(useAlertFormStore.getState().date).toBe('2024-10-20');
      expect(useAlertFormStore.getState().time).toBe('10:30');

      const dateTimeInput = screen.getByTestId('alert-datetime-input');
      fireEvent.change(dateTimeInput, {
        target: { value: '2024-10-20T15:45' },
      });

      expect(useAlertFormStore.getState().time).toBe('15:45');
    });

    it('should handle sendToday toggle workflow', () => {
      render(<DateStep />);

      const dateTimeInput = screen.getByTestId('alert-datetime-input');
      fireEvent.change(dateTimeInput, {
        target: { value: '2024-12-25T12:00' },
      });

      expect(useAlertFormStore.getState().date).toBe('2024-12-25');

      const checkbox = screen.getByTestId('checkbox-Sim');
      fireEvent.click(checkbox);

      const state = useAlertFormStore.getState();
      expect(state.sendToday).toBe(true);
      expect(state.date).not.toBe('2024-12-25');
      expect(dateTimeInput).toBeDisabled();
    });
  });

  describe('integration with store', () => {
    it('should read initial values from store', () => {
      const mockDate = new Date('2024-10-15T14:30:00');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      useAlertFormStore.getState().resetForm();
      useAlertFormStore.getState().setDate('2024-10-15');
      useAlertFormStore.getState().setTime('14:30');
      useAlertFormStore.getState().setSendToday(false);

      render(<DateStep />);

      const dateTimeInput = screen.getByTestId('alert-datetime-input');
      const checkbox = screen.getByTestId('checkbox-Sim');

      expect(dateTimeInput).toHaveValue('2024-10-15T14:30');
      expect(checkbox).not.toBeChecked();

      jest.useRealTimers();
    });

    it('should update store when input changes', () => {
      render(<DateStep />);

      const dateTimeInput = screen.getByTestId('alert-datetime-input');

      fireEvent.change(dateTimeInput, {
        target: { value: '2024-11-20T16:00' },
      });

      const state = useAlertFormStore.getState();
      expect(state.date).toBe('2024-11-20');
      expect(state.time).toBe('16:00');
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      useAlertFormStore.getState().setDate('2024-10-15');
      useAlertFormStore.getState().setTime('14:30');

      render(<DateStep />);

      const dateTimeInput = screen.getByTestId('alert-datetime-input');
      fireEvent.change(dateTimeInput, { target: { value: '' } });

      expect(useAlertFormStore.getState().date).toBe('');
    });

    it('should handle rapid checkbox toggling', () => {
      useAlertFormStore.getState().resetForm();
      render(<DateStep />);

      const checkbox = screen.getByTestId('checkbox-Sim');

      fireEvent.click(checkbox);
      expect(useAlertFormStore.getState().sendToday).toBe(true);

      fireEvent.click(checkbox);
      expect(useAlertFormStore.getState().sendToday).toBe(false);

      fireEvent.click(checkbox);
      expect(useAlertFormStore.getState().sendToday).toBe(true);
    });
  });

  describe('conditional rendering based on props', () => {
    it('should render only sendToday when both scheduling and email are disabled', () => {
      render(<DateStep allowScheduling={false} allowEmailCopy={false} />);

      expect(screen.getByText('Enviar Hoje?')).toBeInTheDocument();
      expect(screen.queryByText('Data de envio')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Enviar cópia para e-mail')
      ).not.toBeInTheDocument();
    });

    it('should render all fields when all props are true', () => {
      render(<DateStep allowScheduling={true} allowEmailCopy={true} />);

      expect(screen.getByText('Enviar Hoje?')).toBeInTheDocument();
      expect(screen.getByText('Data de envio')).toBeInTheDocument();
      expect(screen.getByText('Enviar cópia para e-mail')).toBeInTheDocument();
    });
  });
});
