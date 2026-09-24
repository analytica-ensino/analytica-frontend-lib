import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DateTimeInput from './DateTimeInput';

describe('DateTimeInput', () => {
  const mockOnDateChange = jest.fn();
  const mockOnTimeChange = jest.fn();

  const defaultProps = {
    label: 'Data de início',
    date: '',
    time: '',
    onDateChange: mockOnDateChange,
    onTimeChange: mockOnTimeChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with label', () => {
      render(<DateTimeInput {...defaultProps} />);

      expect(screen.getByText('Data de início')).toBeInTheDocument();
    });

    it('should render with date and time values', () => {
      render(
        <DateTimeInput {...defaultProps} date="2025-01-15" time="14:30" />
      );

      const input = screen.getByDisplayValue('2025-01-15T14:30');
      expect(input).toBeInTheDocument();
    });

    it('should render with default time when time is empty', () => {
      render(
        <DateTimeInput
          {...defaultProps}
          date="2025-01-15"
          time=""
          defaultTime="08:00"
        />
      );

      const input = screen.getByDisplayValue('2025-01-15T08:00');
      expect(input).toBeInTheDocument();
    });

    it('should render calendar icon', () => {
      const { container } = render(<DateTimeInput {...defaultProps} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(
        <DateTimeInput {...defaultProps} errorMessage="Data é obrigatória" />
      );

      expect(screen.getByText('Data é obrigatória')).toBeInTheDocument();
    });

    it('should render with custom testId', () => {
      render(<DateTimeInput {...defaultProps} testId="start-datetime" />);

      expect(screen.getByTestId('start-datetime-input')).toBeInTheDocument();
    });

    it('should render disabled state', () => {
      render(<DateTimeInput {...defaultProps} disabled testId="test" />);

      const input = screen.getByTestId('test-input');
      expect(input).toBeDisabled();
    });
  });

  describe('date input changes', () => {
    it('should call onDateChange when date input changes', () => {
      render(<DateTimeInput {...defaultProps} testId="test" />);

      const input = screen.getByTestId('test-input');
      fireEvent.change(input, { target: { value: '2025-01-20T10:00' } });

      expect(mockOnDateChange).toHaveBeenCalledWith('2025-01-20');
      expect(mockOnTimeChange).toHaveBeenCalledWith('10:00');
    });

    it('should handle clearing the input', () => {
      render(
        <DateTimeInput
          {...defaultProps}
          testId="test"
          date="2025-01-20"
          time="10:00"
        />
      );

      const input = screen.getByTestId('test-input');
      fireEvent.change(input, { target: { value: '' } });

      expect(mockOnDateChange).toHaveBeenCalledWith('');
    });
  });

  describe('calendar dropdown', () => {
    it('should open calendar when clicking on trigger', () => {
      render(<DateTimeInput {...defaultProps} />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.getByLabelText('Mês anterior')).toBeInTheDocument();
      expect(screen.getByLabelText('Próximo mês')).toBeInTheDocument();
    });

    it('should not open calendar when disabled', () => {
      render(<DateTimeInput {...defaultProps} disabled />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.queryByLabelText('Mês anterior')).not.toBeInTheDocument();
    });

    it('should show time input inside dropdown', () => {
      render(<DateTimeInput {...defaultProps} />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.getByText('Hora')).toBeInTheDocument();
    });

    it('should show custom time label', () => {
      render(<DateTimeInput {...defaultProps} timeLabel="Horário" />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(screen.getByText('Horário')).toBeInTheDocument();
    });

    it('should call onDateChange when selecting date from calendar', async () => {
      render(
        <DateTimeInput {...defaultProps} date="2025-01-01" time="10:00" />
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      // Find day 15 button in the calendar
      const day15 = screen.getByText('15');
      fireEvent.click(day15);

      // Wait for the callback to be called
      await screen.findByText('Hora');
      expect(mockOnDateChange).toHaveBeenCalledWith('2025-01-15');
    });

    it('should set default time when selecting date without existing time', async () => {
      render(
        <DateTimeInput {...defaultProps} date="" time="" defaultTime="09:00" />
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      const day10 = screen.getByText('10');
      fireEvent.click(day10);

      // Wait for the callback to be called
      await screen.findByText('Hora');
      expect(mockOnTimeChange).toHaveBeenCalledWith('09:00');
    });

    it('should not override existing time when selecting new date', async () => {
      render(
        <DateTimeInput
          {...defaultProps}
          date="2025-01-01"
          time="14:30"
          defaultTime="09:00"
        />
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      const day15 = screen.getByText('15');
      fireEvent.click(day15);

      // Wait for the date change callback
      await screen.findByText('Hora');
      expect(mockOnDateChange).toHaveBeenCalledWith('2025-01-15');
      expect(mockOnTimeChange).not.toHaveBeenCalled();
    });
  });

  describe('time input changes', () => {
    it('should call onTimeChange when time input changes', () => {
      render(<DateTimeInput {...defaultProps} testId="test" />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      const timeInput = screen.getByTestId('test-time');
      fireEvent.change(timeInput, { target: { value: '15:45' } });

      expect(mockOnTimeChange).toHaveBeenCalledWith('15:45');
    });
  });

  describe('time footer layout', () => {
    /**
     * O rodapé fica fora do fluxo rolável do popover. O popover é fixed e só
     * tem a altura que sobra entre o campo e a borda da janela, então em tela
     * baixa ele rola — e antes a hora caía abaixo do corte. jsdom não calcula
     * layout, então o que dá para garantir aqui é a regra que produz o
     * comportamento; a altura em si foi medida no Ladle.
     */
    it('should keep the time footer out of the scrollable flow', () => {
      render(<DateTimeInput {...defaultProps} testId="test" />);

      fireEvent.click(screen.getByRole('button'));

      const footer = screen.getByTestId('test-time').closest('div.sticky');
      expect(footer).toHaveClass('sticky', 'bottom-0', 'bg-background');
    });

    it('should render the calendar in compact density', () => {
      render(<DateTimeInput {...defaultProps} date="2025-01-01" />);

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('15')).toHaveClass('w-8', 'h-8');
    });
  });

  describe('accessibility', () => {
    it('should have proper input type', () => {
      render(<DateTimeInput {...defaultProps} testId="test" />);

      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('type', 'datetime-local');
    });

    /**
     * O rótulo virou um `<label>` próprio para caber na mesma linha do campo,
     * em vez da prop `label` do Input. A associação explícita é o que mantém o
     * leitor de tela anunciando "Hora" ao focar no campo.
     */
    it('should associate the time label with the time input', () => {
      render(<DateTimeInput {...defaultProps} testId="test" />);

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByLabelText('Hora')).toBe(
        screen.getByTestId('test-time')
      );
    });
  });
});
