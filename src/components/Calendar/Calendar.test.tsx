import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Calendar, { CalendarActivity } from './Calendar';

describe('Calendar', () => {
  const mockOnDateSelect = jest.fn();
  const mockOnMonthChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should highlight selected date', () => {
    const selectedDate = new Date(2025, 0, 15); // January 15, 2025
    render(<Calendar selectedDate={selectedDate} />);

    const selectedDay = screen.getByText('15');
    expect(selectedDay).toHaveClass('bg-primary-500');
  });

  it('should display activity indicators', () => {
    const activities: Record<string, CalendarActivity[]> = {
      '2025-01-15': [
        { id: '1', status: 'in-progress', title: 'Task 1' },
        { id: '2', status: 'overdue', title: 'Task 2' },
      ],
    };

    const selectedDate = new Date(2025, 0, 1); // January 2025
    render(<Calendar selectedDate={selectedDate} activities={activities} />);

    // Should render activity indicators
    const dayWithActivities = screen.getByText('15').parentElement;
    expect(dayWithActivities).toContainHTML('bg-success-500');
    expect(dayWithActivities).toContainHTML('bg-error-500');
  });

  it('should not display activity indicators when showActivities is false', () => {
    const activities: Record<string, CalendarActivity[]> = {
      '2025-01-15': [{ id: '1', status: 'in-progress', title: 'Task 1' }],
    };

    const selectedDate = new Date(2025, 0, 1); // January 2025
    render(
      <Calendar
        selectedDate={selectedDate}
        activities={activities}
        showActivities={false}
      />
    );

    // Should not render activity indicators
    const dayWithActivities = screen.getByText('15').parentElement;
    expect(dayWithActivities).not.toContainHTML('bg-success-500');
  });

  it('should apply custom className', () => {
    const { container } = render(<Calendar className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it("should highlight today's date", () => {
    const today = new Date();
    render(<Calendar />);

    const todayElement = screen.getByText(today.getDate().toString());
    expect(todayElement).toHaveClass('bg-primary-50');
  });
});

const WEEK_DAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
