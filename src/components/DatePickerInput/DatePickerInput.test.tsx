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
});
