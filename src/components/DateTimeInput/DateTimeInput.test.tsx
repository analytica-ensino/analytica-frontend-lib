import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

      const trigger = screen.getByLabelText('Data de início');
      fireEvent.click(trigger);

      expect(screen.getByLabelText('Mês anterior')).toBeInTheDocument();
      expect(screen.getByLabelText('Próximo mês')).toBeInTheDocument();
    });

    it('should not open calendar when disabled', () => {
      render(<DateTimeInput {...defaultProps} disabled />);

      const trigger = screen.getByLabelText('Data de início');
      fireEvent.click(trigger);

      expect(screen.queryByLabelText('Mês anterior')).not.toBeInTheDocument();
    });

    it('should show time input inside dropdown', () => {
      render(<DateTimeInput {...defaultProps} />);

      const trigger = screen.getByLabelText('Data de início');
      fireEvent.click(trigger);

      expect(screen.getByText('Hora')).toBeInTheDocument();
    });

    it('should show custom time label', () => {
      render(<DateTimeInput {...defaultProps} timeLabel="Horário" />);

      const trigger = screen.getByLabelText('Data de início');
      fireEvent.click(trigger);

      expect(screen.getByText('Horário')).toBeInTheDocument();
    });

    it('should call onDateChange when selecting date from calendar', async () => {
      render(
        <DateTimeInput {...defaultProps} date="2025-01-01" time="10:00" />
      );

      const trigger = screen.getByLabelText('Data de início');
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

      const trigger = screen.getByLabelText('Data de início');
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

      const trigger = screen.getByLabelText('Data de início');
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

      const trigger = screen.getByLabelText('Data de início');
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

      fireEvent.click(screen.getByLabelText('Data de início'));

      const footer = screen.getByTestId('test-time').closest('div.sticky');
      expect(footer).toHaveClass('sticky', 'bottom-0', 'bg-background');
    });

    it('should render the calendar in compact density', () => {
      render(<DateTimeInput {...defaultProps} date="2025-01-01" />);

      fireEvent.click(screen.getByLabelText('Data de início'));

      expect(screen.getByText('15')).toHaveClass('w-8', 'h-8');
    });
  });

  describe('accessibility', () => {
    const getCalendarButton = () =>
      screen.getByRole('button', { name: 'Abrir calendário' });

    it('offers a keyboard trigger tied to the dialog', () => {
      render(<DateTimeInput {...defaultProps} />);
      const button = getCalendarButton();

      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).not.toHaveAttribute('aria-controls');

      fireEvent.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('dialog')).toHaveAttribute(
        'id',
        button.getAttribute('aria-controls')
      );
    });

    it('moves the focus into the dialog when opened from the button', async () => {
      render(<DateTimeInput {...defaultProps} />);

      fireEvent.click(getCalendarButton());

      await waitFor(() =>
        expect(
          screen.getByRole('dialog', { name: 'Data de início' })
        ).toHaveFocus()
      );
    });

    it('keeps retrying for a few frames while the dialog mounts', () => {
      const frames: Array<(time: number) => void> = [];
      const rafSpy = jest
        .spyOn(globalThis, 'requestAnimationFrame')
        .mockImplementation((cb) => {
          frames.push(cb);
          return frames.length;
        });
      const cancelSpy = jest
        .spyOn(globalThis, 'cancelAnimationFrame')
        .mockImplementation(() => undefined);
      const { unmount } = render(<DateTimeInput {...defaultProps} />);
      fireEvent.click(getCalendarButton());
      unmount();

      // With the content gone every attempt re-schedules, up to the limit
      for (let i = 0; i < 10 && frames.length > 0; i++) frames.shift()?.(0);

      expect(frames).toHaveLength(0);
      rafSpy.mockRestore();
      cancelSpy.mockRestore();
    });

    it('closing with the button again does not move the focus', () => {
      render(<DateTimeInput {...defaultProps} />);
      const button = getCalendarButton();
      fireEvent.click(button);
      fireEvent.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('returns the focus to the calendar button when Escape closes the dialog', async () => {
      render(<DateTimeInput {...defaultProps} />);
      const button = getCalendarButton();
      fireEvent.click(button);
      const dialog = await screen.findByRole('dialog');
      dialog.focus();

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => expect(button).toHaveFocus());
    });

    it('leaves the focus alone when a click outside closes the dialog', async () => {
      render(
        <>
          <button type="button">fora</button>
          <DateTimeInput {...defaultProps} />
        </>
      );
      fireEvent.click(getCalendarButton());
      await screen.findByRole('dialog');
      const outside = screen.getByRole('button', { name: 'fora' });
      outside.focus();

      fireEvent.pointerDown(outside);

      await waitFor(() =>
        expect(getCalendarButton()).toHaveAttribute('aria-expanded', 'false')
      );
      expect(outside).toHaveFocus();
    });

    it('does not steal the focus on mount', () => {
      render(
        <>
          <input aria-label="antes" />
          <DateTimeInput {...defaultProps} />
        </>
      );
      const before = screen.getByRole('textbox', { name: 'antes' });
      before.focus();

      expect(before).toHaveFocus();
    });

    it('stays closed after being disabled while open and enabled again', () => {
      const { rerender } = render(<DateTimeInput {...defaultProps} />);
      fireEvent.click(getCalendarButton());

      rerender(<DateTimeInput {...defaultProps} disabled />);
      rerender(<DateTimeInput {...defaultProps} />);

      expect(getCalendarButton()).toHaveAttribute('aria-expanded', 'false');
    });

    it('ignores the calendar button while disabled', () => {
      render(<DateTimeInput {...defaultProps} disabled />);
      const button = getCalendarButton();
      expect(button).toBeDisabled();

      fireEvent.click(button);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens the calendar as a named dialog without nesting the field in a button', async () => {
      render(<DateTimeInput {...defaultProps} />);
      const field = screen.getByLabelText('Data de início');

      expect(field.closest('button')).toBeNull();

      field.focus();
      fireEvent.click(field);

      expect(
        screen.getByRole('dialog', { name: 'Data de início' })
      ).toBeInTheDocument();
      // Opening by pointer keeps the focus in the field, where the user types
      await new Promise((resolve) => requestAnimationFrame(resolve));
      expect(field).toHaveFocus();
    });

    it('closes the calendar with Escape and keeps it closed', async () => {
      render(<DateTimeInput {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Data de início'));

      fireEvent.keyDown(document, { key: 'Escape' });

      // The popup fades out for 200ms before unmounting
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );
    });

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

      fireEvent.click(screen.getByLabelText('Data de início'));

      expect(screen.getByLabelText('Hora')).toBe(
        screen.getByTestId('test-time')
      );
    });
  });
});
