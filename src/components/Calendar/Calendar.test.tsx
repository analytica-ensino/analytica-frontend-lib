import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Calendar, {
  CalendarActivity,
  ActivityStatus,
  WEEK_DAYS,
} from './Calendar';

describe('Calendar', () => {
  const mockOnDateSelect = jest.fn();
  const mockOnMonthChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Selection variant', () => {
    it('should render selection calendar correctly', () => {
      render(<Calendar variant="selection" />);

      // Check if month/year header is present
      expect(
        screen.getByText(
          /Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro/
        )
      ).toBeInTheDocument();

      // Check if weekday headers are present
      WEEK_DAYS.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });

      // Check if navigation buttons are present
      expect(screen.getByLabelText('Mês anterior')).toBeInTheDocument();
      expect(screen.getByLabelText('Próximo mês')).toBeInTheDocument();
    });

    it('should have correct styling for selection variant', () => {
      const { container } = render(<Calendar variant="selection" />);

      // Selection variant should have specific background and styling
      expect(container.firstChild).toHaveClass(
        'bg-background',
        'rounded-xl',
        'p-4'
      );
    });

    it('should not display activity indicators in selection variant', () => {
      const activities: Record<string, CalendarActivity[]> = {
        '2025-01-15': [{ id: '1', status: 'in-deadline', title: 'Task 1' }],
      };

      const selectedDate = new Date(2025, 0, 1); // January 2025
      render(
        <Calendar
          variant="selection"
          selectedDate={selectedDate}
          activities={activities}
          showActivities={true}
        />
      );

      // Selection variant should not show activity indicators
      const dayWithActivities = screen.getByText('15');
      expect(dayWithActivities.parentElement).not.toHaveClass(
        'bg-success-background'
      );
      expect(dayWithActivities.parentElement).not.toHaveClass(
        'bg-warning-background'
      );
      expect(dayWithActivities.parentElement).not.toHaveClass(
        'bg-error-background'
      );
    });

    it('should highlight selected date correctly in selection variant', () => {
      const selectedDate = new Date(2025, 0, 15); // January 15, 2025
      render(<Calendar variant="selection" selectedDate={selectedDate} />);

      const selectedDay = screen.getByText('15');
      expect(selectedDay).toHaveClass('bg-primary-800', 'text-text');
    });

    it('should highlight today correctly in selection variant', () => {
      const today = new Date();
      render(<Calendar variant="selection" />);

      const todayElement = screen.getByText(today.getDate().toString());
      expect(todayElement).toHaveClass('text-primary-800');
    });

    it('should style normal days correctly in selection variant', () => {
      // Use a date from the past to ensure day 10 is not today
      const selectedDate = new Date(2023, 0, 15); // January 15, 2023 (past date)
      render(<Calendar variant="selection" selectedDate={selectedDate} />);

      // Test day 10 which should be a normal day (not selected, not today)
      const normalDay = screen.getByText('10');
      expect(normalDay).toHaveClass('text-text-950', 'hover:bg-background-100');
      expect(normalDay).not.toHaveClass('bg-primary-800');
      expect(normalDay).not.toHaveClass('text-text-800');
    });

    it('should toggle month picker when clicking header in selection variant', () => {
      render(<Calendar variant="selection" />);

      // Find the month header button by looking for the h2 element and getting its parent
      const monthHeader = screen.getByRole('heading', { level: 2 });
      const monthButton = monthHeader.closest('button')!;

      // Initially closed
      expect(screen.queryByText('Selecionar Ano')).not.toBeInTheDocument();

      // Click to open month picker
      fireEvent.click(monthButton);

      // Check if month picker is open
      expect(screen.getByText('Selecionar Ano')).toBeInTheDocument();
      expect(screen.getByText('Selecionar Mês')).toBeInTheDocument();

      // Click again to close
      fireEvent.click(monthButton);

      // Month picker should be hidden
      expect(screen.queryByText('Selecionar Ano')).not.toBeInTheDocument();
      expect(screen.queryByText('Selecionar Mês')).not.toBeInTheDocument();
    });

    it('should navigate to selected month when clicking month in picker', () => {
      render(
        <Calendar variant="selection" onMonthChange={mockOnMonthChange} />
      );

      // Open month picker by finding the h2 element and getting its parent
      const monthHeader = screen.getByRole('heading', { level: 2 });
      const monthButton = monthHeader.closest('button')!;
      fireEvent.click(monthButton);

      // Click on "Mar" (March)
      const marchButton = screen.getByText('Mar');
      fireEvent.click(marchButton);

      // Should call onMonthChange
      expect(mockOnMonthChange).toHaveBeenCalledWith(expect.any(Date));

      // Month picker should be closed
      expect(screen.queryByText('Selecionar Ano')).not.toBeInTheDocument();
    });

    it('should change year when clicking year in picker', () => {
      render(
        <Calendar variant="selection" selectedDate={new Date(2025, 0, 1)} />
      );

      // Open month picker by finding the h2 element and getting its parent
      const monthHeader = screen.getByRole('heading', { level: 2 });
      const monthButton = monthHeader.closest('button')!;
      fireEvent.click(monthButton);

      // Get all year buttons and click on 2024
      const year2024Buttons = screen.getAllByText('2024');
      const year2024Button = year2024Buttons.find(
        (button) =>
          button.tagName === 'BUTTON' && button.closest('.grid-cols-4')
      );

      expect(year2024Button).toBeInTheDocument();
      fireEvent.click(year2024Button!);

      // Check if header contains Janeiro 2024 (not just 2024)
      expect(screen.getByText('Janeiro 2024')).toBeInTheDocument();
    });
  });

  describe('Navigation variant', () => {
    it('should render navigation calendar correctly', () => {
      render(<Calendar variant="navigation" />);

      // Check if month/year header is present
      expect(
        screen.getByText(
          /Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro/
        )
      ).toBeInTheDocument();

      // Check if compact weekday headers are present
      ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].forEach((day) => {
        expect(screen.getAllByText(day)[0]).toBeInTheDocument();
      });

      // Check if navigation buttons are present
      expect(screen.getByLabelText('Mês anterior')).toBeInTheDocument();
      expect(screen.getByLabelText('Próximo mês')).toBeInTheDocument();
    });

    it('should have correct styling for navigation variant', () => {
      const { container } = render(<Calendar variant="navigation" />);

      // Navigation variant should have specific background and styling
      expect(container.firstChild).toHaveClass(
        'bg-background',
        'rounded-xl',
        'p-3'
      );
    });

    it('should display activity indicators in navigation variant', () => {
      const activities: Record<string, CalendarActivity[]> = {
        '2025-01-15': [{ id: '1', status: 'in-deadline', title: 'Task 1' }],
        '2025-01-16': [{ id: '2', status: 'near-deadline', title: 'Task 2' }],
        '2025-01-17': [{ id: '3', status: 'overdue', title: 'Task 3' }],
      };

      const selectedDate = new Date(2025, 0, 1); // January 2025
      render(
        <Calendar
          variant="navigation"
          selectedDate={selectedDate}
          activities={activities}
          showActivities={true}
        />
      );

      // Check for in-deadline (success) styling - test the button element
      const inDeadlineDay = screen.getByText('15');
      expect(inDeadlineDay.parentElement).toHaveClass('bg-success-background');
      expect(inDeadlineDay.parentElement).toHaveClass('border-2');
      expect(inDeadlineDay.parentElement).toHaveClass('border-success-300');

      // Check for near-deadline (warning) styling - test the button element
      const nearDeadlineDay = screen.getByText('16');
      expect(nearDeadlineDay.parentElement).toHaveClass(
        'bg-warning-background'
      );
      expect(nearDeadlineDay.parentElement).toHaveClass('border-2');
      expect(nearDeadlineDay.parentElement).toHaveClass('border-warning-400');

      // Check for overdue (error) styling - test the button element
      const overdueDay = screen.getByText('17');
      expect(overdueDay.parentElement).toHaveClass('bg-error-background');
      expect(overdueDay.parentElement).toHaveClass('border-2');
      expect(overdueDay.parentElement).toHaveClass('border-error-300');
    });

    it('should handle activities with unknown status correctly in navigation variant', () => {
      // This test covers the else block in lines 271-272
      const activities: Record<string, CalendarActivity[]> = {
        '2025-01-15': [
          {
            id: '1',
            status: 'unknown-status' as ActivityStatus,
            title: 'Unknown Task',
          },
        ],
      };

      const selectedDate = new Date(2025, 0, 1); // January 2025
      render(
        <Calendar
          variant="navigation"
          selectedDate={selectedDate}
          activities={activities}
          showActivities={true}
        />
      );

      // Check for unknown status (should use default blue styling)
      const unknownStatusDay = screen.getByText('15');
      expect(unknownStatusDay.parentElement).toHaveClass('border-2');
      expect(unknownStatusDay.parentElement).toHaveClass('border-blue-500');
      expect(unknownStatusDay.parentElement).toHaveClass('text-blue-500');
    });

    it('should highlight today correctly in navigation variant', () => {
      const today = new Date();
      render(<Calendar variant="navigation" />);

      const todayElement = screen.getByText(today.getDate().toString());
      // In navigation variant, today's text should be inside a span with the color class
      expect(todayElement.parentElement).toHaveClass('text-primary-800');
    });

    it('should highlight selected date correctly in navigation variant', () => {
      const selectedDate = new Date(2025, 0, 15); // January 15, 2025
      render(<Calendar variant="navigation" selectedDate={selectedDate} />);

      const selectedDay = screen.getByText('15');
      // Check if the span element has the selected styling
      expect(selectedDay).toHaveClass('bg-primary-950');
      expect(selectedDay).toHaveClass('text-text');
    });

    it('should highlight selected date that is also today correctly', () => {
      const today = new Date();
      render(<Calendar variant="navigation" selectedDate={today} />);

      const todayElement = screen.getByText(today.getDate().toString());
      // Check if the selected today element has the correct styling
      expect(todayElement).toHaveClass('bg-primary-800');
      expect(todayElement).toHaveClass('text-text');
    });

    it('should call onDateSelect when clicking a day in navigation variant', () => {
      const mockCallback = jest.fn();
      render(<Calendar variant="navigation" onDateSelect={mockCallback} />);

      // Click on day 5 in navigation variant
      const day5 = screen.getByText('5');
      fireEvent.click(day5);

      expect(mockCallback).toHaveBeenCalledWith(expect.any(Date));
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should toggle month picker when clicking header in navigation variant', () => {
      render(<Calendar variant="navigation" />);

      // Find the month header button - in navigation variant, we look for span with text
      const monthSpan = screen.getByText(
        /Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro/
      );
      const monthButton = monthSpan.closest('button')!;

      // Click to open month picker
      fireEvent.click(monthButton);

      // Check if month picker is open
      expect(screen.getByText('Selecionar Ano')).toBeInTheDocument();
    });
  });

  describe('Common functionality', () => {
    it('should call onDateSelect when a date is clicked', () => {
      render(<Calendar onDateSelect={mockOnDateSelect} />);

      // Click on a date
      const firstDay = screen.getByText('1');
      fireEvent.click(firstDay);

      expect(mockOnDateSelect).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should navigate to previous month', () => {
      render(<Calendar onMonthChange={mockOnMonthChange} />);

      const prevButton = screen.getByLabelText('Mês anterior');
      fireEvent.click(prevButton);

      expect(mockOnMonthChange).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should navigate to next month', () => {
      render(<Calendar onMonthChange={mockOnMonthChange} />);

      const nextButton = screen.getByLabelText('Próximo mês');
      fireEvent.click(nextButton);

      expect(mockOnMonthChange).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should apply custom className', () => {
      const { container } = render(<Calendar className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should not render days from other months', () => {
      const selectedDate = new Date(2025, 1, 15); // February 15, 2025 (month with fewer days)
      render(<Calendar selectedDate={selectedDate} />);

      // February 2025 has 28 days, so day 30 and 31 should not be visible
      expect(screen.queryByText('30')).not.toBeInTheDocument();
      expect(screen.queryByText('32')).not.toBeInTheDocument();
    });

    it('should handle different activity statuses correctly', () => {
      const activities: Record<string, CalendarActivity[]> = {
        '2025-01-15': [
          { id: '1', status: 'in-deadline', title: 'In deadline task' },
        ],
        '2025-01-16': [
          { id: '2', status: 'near-deadline', title: 'Near deadline task' },
        ],
        '2025-01-17': [{ id: '3', status: 'overdue', title: 'Overdue task' }],
      };

      const selectedDate = new Date(2025, 0, 1); // January 2025
      render(
        <Calendar
          variant="navigation"
          selectedDate={selectedDate}
          activities={activities}
          showActivities={true}
        />
      );

      // All activity statuses should be rendered without errors
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('16')).toBeInTheDocument();
      expect(screen.getByText('17')).toBeInTheDocument();
    });

    it('should handle date selection with onDateSelect callback', () => {
      const mockCallback = jest.fn();
      render(<Calendar variant="selection" onDateSelect={mockCallback} />);

      // Click on day 10
      const day10 = screen.getByText('10');
      fireEvent.click(day10);

      expect(mockCallback).toHaveBeenCalledWith(expect.any(Date));
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should close month picker when clicking outside', () => {
      render(<Calendar variant="selection" />);

      // Open month picker by finding the h2 element and getting its parent
      const monthHeader = screen.getByRole('heading', { level: 2 });
      const monthButton = monthHeader.closest('button')!;
      fireEvent.click(monthButton);

      // Check if month picker is open
      expect(screen.getByText('Selecionar Ano')).toBeInTheDocument();

      // Simulate clicking outside
      fireEvent.mouseDown(document.body);

      // Month picker should be closed
      expect(screen.queryByText('Selecionar Ano')).not.toBeInTheDocument();
    });

    it('should not have aria-current attribute for non-today dates in selection variant', () => {
      // Use a fixed date from the past to ensure we test non-today dates
      const pastDate = new Date(2023, 0, 15); // January 15, 2023
      render(<Calendar variant="selection" selectedDate={pastDate} />);

      // Find a non-today date (day 10 should not be today)
      const nonTodayElement = screen.getByText('10');
      expect(nonTodayElement).not.toHaveAttribute('aria-current');
    });

    it('should not have aria-current attribute for non-today dates in navigation variant', () => {
      // Use a fixed date from the past to ensure we test non-today dates
      const pastDate = new Date(2023, 0, 15); // January 15, 2023
      render(<Calendar variant="navigation" selectedDate={pastDate} />);

      // Find a non-today date (day 10 should not be today)
      const nonTodayElement = screen.getByText('10');
      expect(nonTodayElement).not.toHaveAttribute('aria-current');
    });
  });
});
