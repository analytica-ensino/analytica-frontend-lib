import { render, screen, fireEvent } from '@testing-library/react';
import DatePickerInput from './DatePickerInput';

describe('DatePickerInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render with placeholder when no value is provided', () => {
      render(<DatePickerInput />);

      expect(screen.getByText('DD/MM/AAAA')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(<DatePickerInput placeholder="Selecione uma data" />);

      expect(screen.getByText('Selecione uma data')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<DatePickerInput label="Data de início" />);

      expect(screen.getByText('Data de início')).toBeInTheDocument();
    });

    it('should render formatted date when value is provided', () => {
      // Use local date constructor to avoid timezone issues
      const date = new Date(2025, 2, 20); // March 20, 2025
      render(<DatePickerInput value={date} />);

      expect(screen.getByText('20/03/2025')).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(<DatePickerInput error="Campo obrigatório" />);

      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render with custom testId', () => {
      render(<DatePickerInput testId="custom-date-picker" />);

      expect(screen.getByTestId('custom-date-picker')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <DatePickerInput className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('disabled state', () => {
    it('should render as disabled when disabled prop is true', () => {
      render(<DatePickerInput disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not open calendar when disabled', async () => {
      render(<DatePickerInput disabled />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(
        screen.queryByTestId('date-picker-input-calendar')
      ).not.toBeInTheDocument();
    });

    it('should have disabled styles when disabled', () => {
      render(<DatePickerInput disabled />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('cursor-not-allowed');
    });
  });

  describe('calendar popover', () => {
    it('should open calendar when button is clicked', async () => {
      render(<DatePickerInput />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(
        screen.getByTestId('date-picker-input-calendar')
      ).toBeInTheDocument();
    });

    it('should close calendar when button is clicked again', async () => {
      render(<DatePickerInput />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);

      expect(
        screen.queryByTestId('date-picker-input-calendar')
      ).not.toBeInTheDocument();
    });

    it('should close calendar when clicking outside', async () => {
      render(
        <div>
          <DatePickerInput />
          <div data-testid="outside">Outside</div>
        </div>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(
        screen.getByTestId('date-picker-input-calendar')
      ).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByTestId('outside'));

      expect(
        screen.queryByTestId('date-picker-input-calendar')
      ).not.toBeInTheDocument();
    });

    it('should not close calendar when clicking inside', async () => {
      render(<DatePickerInput />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const calendar = screen.getByTestId('date-picker-input-calendar');
      fireEvent.mouseDown(calendar);

      expect(
        screen.getByTestId('date-picker-input-calendar')
      ).toBeInTheDocument();
    });

    it('should have correct aria attributes when closed', () => {
      render(<DatePickerInput />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have correct aria attributes when open', () => {
      render(<DatePickerInput />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('keyboard navigation', () => {
    /**
     * Note: Native button elements automatically fire click events on Enter/Space.
     * We test this via click() since fireEvent.keyDown doesn't simulate native behavior.
     */
    it('should open calendar with Enter key (via native button click)', async () => {
      render(<DatePickerInput />);

      const button = screen.getByRole('button');
      // Native buttons fire click on Enter - simulated via click
      fireEvent.click(button);

      expect(
        screen.getByTestId('date-picker-input-calendar')
      ).toBeInTheDocument();
    });

    it('should open calendar with Space key (via native button click)', async () => {
      render(<DatePickerInput />);

      const button = screen.getByRole('button');
      // Native buttons fire click on Space - simulated via click
      fireEvent.click(button);

      expect(
        screen.getByTestId('date-picker-input-calendar')
      ).toBeInTheDocument();
    });

    it('should close calendar with Escape key', async () => {
      render(<DatePickerInput />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(
        screen.getByTestId('date-picker-input-calendar')
      ).toBeInTheDocument();

      fireEvent.keyDown(button, { key: 'Escape' });

      expect(
        screen.queryByTestId('date-picker-input-calendar')
      ).not.toBeInTheDocument();
    });

    it('should not open calendar with Enter when disabled', async () => {
      render(<DatePickerInput disabled />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(
        screen.queryByTestId('date-picker-input-calendar')
      ).not.toBeInTheDocument();
    });
  });

  describe('date selection', () => {
    it('should call onChange when date is selected', async () => {
      const onChange = jest.fn();
      render(<DatePickerInput onChange={onChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const dayButton = screen.getByLabelText('20 de Janeiro');
      fireEvent.click(dayButton);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should close calendar after date selection', async () => {
      const onChange = jest.fn();
      render(<DatePickerInput onChange={onChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const dayButton = screen.getByLabelText('20 de Janeiro');
      fireEvent.click(dayButton);

      expect(
        screen.queryByTestId('date-picker-input-calendar')
      ).not.toBeInTheDocument();
    });

    it('should show selected date in the calendar', () => {
      // Use local date constructor to avoid timezone issues
      const date = new Date(2025, 0, 20); // January 20, 2025
      render(<DatePickerInput value={date} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const dayButton = screen.getByLabelText('20 de Janeiro');
      expect(dayButton).toHaveClass('bg-primary-800');
    });
  });

  describe('date formatting', () => {
    it('should format single digit day with leading zero', () => {
      // Use local date constructor to avoid timezone issues
      const date = new Date(2025, 0, 5); // January 5, 2025
      render(<DatePickerInput value={date} />);

      expect(screen.getByText('05/01/2025')).toBeInTheDocument();
    });

    it('should format single digit month with leading zero', () => {
      // Use local date constructor to avoid timezone issues
      const date = new Date(2025, 2, 15); // March 15, 2025
      render(<DatePickerInput value={date} />);

      expect(screen.getByText('15/03/2025')).toBeInTheDocument();
    });

    it('should format double digit day and month correctly', () => {
      // Use local date constructor to avoid timezone issues
      const date = new Date(2025, 11, 25); // December 25, 2025
      render(<DatePickerInput value={date} />);

      expect(screen.getByText('25/12/2025')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should apply error styles to button when error is present', () => {
      render(<DatePickerInput error="Erro" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-error-500');
    });

    it('should not apply error styles when disabled', () => {
      render(<DatePickerInput error="Erro" disabled />);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('border-error-500');
    });

    it('should render error with correct testId', () => {
      render(<DatePickerInput testId="my-picker" error="Erro" />);

      expect(screen.getByTestId('my-picker-error')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible label from label prop', () => {
      render(<DatePickerInput label="Data de nascimento" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName('Data de nascimento');
    });

    it('should have default accessible label when no label prop', () => {
      render(<DatePickerInput />);

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName('Selecionar data');
    });

    it('should have dialog role for calendar', () => {
      render(<DatePickerInput />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener'
      );

      const { unmount } = render(<DatePickerInput />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'mousedown',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('showTime mode', () => {
    it('should render with time placeholder when showTime is true', () => {
      render(<DatePickerInput showTime />);

      expect(screen.getByText('DD/MM/AAAA HH:MM')).toBeInTheDocument();
    });

    it('should render time selector when calendar is open with showTime', () => {
      render(<DatePickerInput showTime />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(
        screen.getByTestId('date-picker-input-time-selector')
      ).toBeInTheDocument();
      expect(screen.getByText('Hora:')).toBeInTheDocument();
    });

    it('should render confirm button when showTime is enabled', () => {
      render(<DatePickerInput showTime />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(
        screen.getByTestId('date-picker-input-confirm-button')
      ).toBeInTheDocument();
      expect(screen.getByText('Confirmar')).toBeInTheDocument();
    });

    it('should not close calendar when date is selected with showTime', () => {
      render(<DatePickerInput showTime />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const dayButton = screen.getByLabelText('20 de Janeiro');
      fireEvent.click(dayButton);

      expect(
        screen.getByTestId('date-picker-input-calendar')
      ).toBeInTheDocument();
    });

    it('should call onChange with date and time when confirm is clicked', () => {
      const onChange = jest.fn();
      render(<DatePickerInput showTime onChange={onChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Select a date
      const dayButton = screen.getByLabelText('20 de Janeiro');
      fireEvent.click(dayButton);

      // Set hour
      const hourInput = screen.getByTestId('date-picker-input-hour-input');
      fireEvent.change(hourInput, { target: { value: '14' } });

      // Set minute
      const minuteInput = screen.getByTestId('date-picker-input-minute-input');
      fireEvent.change(minuteInput, { target: { value: '30' } });

      // Click confirm
      fireEvent.click(screen.getByTestId('date-picker-input-confirm-button'));

      expect(onChange).toHaveBeenCalledTimes(1);
      const calledDate = onChange.mock.calls[0][0];
      expect(calledDate.getHours()).toBe(14);
      expect(calledDate.getMinutes()).toBe(30);
      expect(calledDate.getDate()).toBe(20);
    });

    it('should close calendar after clicking confirm', () => {
      render(<DatePickerInput showTime />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Select a date
      const dayButton = screen.getByLabelText('20 de Janeiro');
      fireEvent.click(dayButton);

      // Click confirm
      fireEvent.click(screen.getByTestId('date-picker-input-confirm-button'));

      expect(
        screen.queryByTestId('date-picker-input-calendar')
      ).not.toBeInTheDocument();
    });

    it('should format date with time when showTime is enabled', () => {
      const date = new Date(2025, 0, 20, 14, 30); // January 20, 2025 14:30
      render(<DatePickerInput value={date} showTime />);

      expect(screen.getByText('20/01/2025 14:30')).toBeInTheDocument();
    });

    it('should initialize time inputs with value hours and minutes', () => {
      const date = new Date(2025, 0, 20, 9, 5); // January 20, 2025 09:05
      render(<DatePickerInput value={date} showTime />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const hourInput = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-hour-input'
      );
      const minuteInput = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-minute-input'
      );

      // Input type="number" returns numeric values
      expect(hourInput.value).toBe('09');
      expect(minuteInput.value).toBe('05');
    });

    it('should handle hour input boundary values', () => {
      render(<DatePickerInput showTime />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const hourInput = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-hour-input'
      );

      // Test max boundary (23)
      fireEvent.change(hourInput, { target: { value: '25' } });
      expect(hourInput.value).toBe('23');

      // Test negative becomes 00
      fireEvent.change(hourInput, { target: { value: '-5' } });
      expect(hourInput.value).toBe('00');
    });

    it('should handle minute input boundary values', () => {
      render(<DatePickerInput showTime />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const minuteInput = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-minute-input'
      );

      // Test max boundary (59)
      fireEvent.change(minuteInput, { target: { value: '65' } });
      expect(minuteInput.value).toBe('59');

      // Test negative becomes 00
      fireEvent.change(minuteInput, { target: { value: '-10' } });
      expect(minuteInput.value).toBe('00');
    });

    it('should handle non-numeric input gracefully', () => {
      render(<DatePickerInput showTime />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const hourInput = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-hour-input'
      );
      fireEvent.change(hourInput, { target: { value: 'abc' } });
      expect(hourInput.value).toBe('00');
    });

    it('should sync time state when value prop changes', () => {
      const { rerender } = render(
        <DatePickerInput value={new Date(2025, 0, 15, 10, 20)} showTime />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const hourInput = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-hour-input'
      );
      const minuteInput = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-minute-input'
      );

      expect(hourInput.value).toBe('10');
      expect(minuteInput.value).toBe('20');

      // Close and rerender with new value
      fireEvent.click(button);
      rerender(
        <DatePickerInput value={new Date(2025, 0, 20, 16, 45)} showTime />
      );
      fireEvent.click(screen.getByRole('button'));

      const hourInput2 = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-hour-input'
      );
      const minuteInput2 = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-minute-input'
      );

      expect(hourInput2.value).toBe('16');
      expect(minuteInput2.value).toBe('45');
    });

    it('should not render time selector when showTime is false', () => {
      render(<DatePickerInput />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(
        screen.queryByTestId('date-picker-input-time-selector')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('date-picker-input-confirm-button')
      ).not.toBeInTheDocument();
    });

    it('should reset internal state when value is cleared', () => {
      const { rerender } = render(
        <DatePickerInput value={new Date(2025, 0, 15, 14, 30)} showTime />
      );

      // Open calendar and verify initial state
      const button = screen.getByRole('button');
      fireEvent.click(button);

      const hourInput = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-hour-input'
      );
      const minuteInput = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-minute-input'
      );

      expect(hourInput.value).toBe('14');
      expect(minuteInput.value).toBe('30');

      // Close calendar
      fireEvent.click(button);

      // Clear value (simulate controlled component reset)
      rerender(<DatePickerInput value={undefined} showTime />);

      // Open calendar again and verify state was reset
      fireEvent.click(screen.getByRole('button'));

      const hourInput2 = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-hour-input'
      );
      const minuteInput2 = screen.getByTestId<HTMLInputElement>(
        'date-picker-input-minute-input'
      );

      expect(hourInput2.value).toBe('00');
      expect(minuteInput2.value).toBe('00');
    });
  });
});
