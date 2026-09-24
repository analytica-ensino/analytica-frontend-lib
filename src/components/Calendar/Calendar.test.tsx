import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  describe('Densidade da variante selection', () => {
    const selectedDate = new Date(2025, 0, 15);

    it('should use comfortable spacing by default', () => {
      const { container } = render(
        <Calendar variant="selection" selectedDate={selectedDate} />
      );

      expect(container.firstChild).toHaveClass('p-4');
      expect(screen.getByText('15')).toHaveClass('w-9', 'h-9', 'text-lg');
    });

    /**
     * `compact` serve ao popover do `DateTimeInput`, onde a altura disponível é
     * o que sobra entre o campo e a borda da tela. A coluna segue com 36px
     * (`w-9`) de propósito: só a altura encolhe, senão o cabeçalho dos dias da
     * semana fica espremido.
     */
    it('should shrink only the vertical rhythm when compact', () => {
      const { container } = render(
        <Calendar
          variant="selection"
          density="compact"
          selectedDate={selectedDate}
        />
      );

      expect(container.firstChild).toHaveClass('p-3');

      const day = screen.getByText('15');
      expect(day).toHaveClass('w-8', 'h-8', 'text-base');
      expect(day.parentElement).toHaveClass('w-9');
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
        'pt-6'
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

    it('shows the activity indicator on today (takes precedence over the today style)', () => {
      const today = new Date();
      const todayKey = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
        .toISOString()
        .split('T')[0];
      const activities: Record<string, CalendarActivity[]> = {
        [todayKey]: [{ id: 't', status: 'near-deadline', title: 'Hoje' }],
      };

      render(
        <Calendar
          variant="navigation"
          activities={activities}
          showActivities={true}
        />
      );

      // A deadline that falls on today must still show its colored dot, not be
      // hidden by the "today" emphasis (regression: isToday short-circuited it).
      const todayCell = screen.getByText(String(today.getDate()));
      expect(todayCell.parentElement).toHaveClass('bg-warning-background');
      expect(todayCell.parentElement).toHaveClass('border-warning-400');
    });

    it('should handle activities with unknown status correctly in navigation variant', () => {
      // This test covers the else block for unknown status
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

  describe('Loading state', () => {
    it('should not render the loading overlay by default', () => {
      render(<Calendar variant="navigation" />);
      expect(screen.queryByTestId('calendar-loading')).not.toBeInTheDocument();
    });

    it('should render the loading overlay when loading is true (navigation)', () => {
      render(<Calendar variant="navigation" loading />);
      const overlay = screen.getByTestId('calendar-loading');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveAttribute('aria-busy', 'true');
    });

    it('should render the loading overlay when loading is true (selection)', () => {
      render(<Calendar variant="selection" loading />);
      expect(screen.getByTestId('calendar-loading')).toBeInTheDocument();
    });

    it('should keep month navigation visible and interactive while loading', () => {
      const selectedDate = new Date(2025, 0, 15); // January 2025
      render(
        <Calendar
          variant="navigation"
          loading
          selectedDate={selectedDate}
          onMonthChange={mockOnMonthChange}
        />
      );

      // The overlay must not hide/replace the calendar header or nav buttons.
      expect(screen.getByText(/Janeiro 2025/)).toBeInTheDocument();
      const nextButton = screen.getByLabelText('Próximo mês');
      fireEvent.click(nextButton);
      expect(mockOnMonthChange).toHaveBeenCalledTimes(1);
    });

    it('stacks the header above the overlay so navigation stays clickable', () => {
      // jsdom does not hit-test, so assert structurally that the header wrapper
      // has a higher stacking order than the z-10 overlay — otherwise the
      // absolute overlay would intercept clicks in a real browser.
      render(<Calendar variant="navigation" loading />);

      const overlay = screen.getByTestId('calendar-loading');
      expect(overlay).toHaveClass('z-10');

      const header = screen
        .getByLabelText('Próximo mês')
        .closest('.z-20') as HTMLElement | null;
      expect(header).not.toBeNull();
      expect(header).toHaveClass('relative', 'z-20');
    });
  });

  describe('Rótulo do dia', () => {
    // A cor do dia é a única pista de que há prazo ali, e ela não chega a quem
    // usa leitor de tela. O rótulo do botão passa a dizer o mesmo que o
    // indicador colorido.
    const JANUARY_2025 = new Date(2025, 0, 1);

    const renderMonth = (
      activities: Record<string, CalendarActivity[]>,
      props: Partial<{
        variant: 'navigation' | 'selection';
        showActivities: boolean;
      }> = {}
    ) =>
      render(
        <Calendar
          variant="navigation"
          selectedDate={JANUARY_2025}
          activities={activities}
          showActivities
          {...props}
        />
      );

    it.each<[ActivityStatus, string]>([
      ['overdue', 'Dia 3 de Janeiro, com atividade atrasada'],
      ['near-deadline', 'Dia 3 de Janeiro, com atividade a vencer'],
      ['in-deadline', 'Dia 3 de Janeiro, com atividade'],
    ])('announces a %s activity on the day button', (status, expected) => {
      renderMonth({ '2025-01-03': [{ id: '1', status, title: 'Tarefa' }] });

      expect(screen.getByLabelText(expected)).toBeInTheDocument();
    });

    it('announces a day without activities', () => {
      renderMonth({ '2025-01-03': [{ id: '1', status: 'overdue' }] });

      expect(
        screen.getByLabelText('Dia 4 de Janeiro, sem atividade')
      ).toBeInTheDocument();
    });

    // O indicador colorido usa a primeira atividade do dia; o rótulo segue a
    // mesma, para o dia não contar duas histórias.
    it('follows the same activity that colors the day', () => {
      renderMonth({
        '2025-01-03': [
          { id: '1', status: 'overdue' },
          { id: '2', status: 'in-deadline' },
        ],
      });

      expect(
        screen.getByLabelText('Dia 3 de Janeiro, com atividade atrasada')
      ).toBeInTheDocument();
    });

    it.each([
      ['selection variant', { variant: 'selection' as const }],
      ['showActivities off', { showActivities: false }],
    ])('says nothing about activities with %s', (_case, props) => {
      renderMonth({ '2025-01-03': [{ id: '1', status: 'overdue' }] }, props);

      expect(screen.getByLabelText('Dia 3 de Janeiro')).toBeInTheDocument();
      expect(
        screen.queryByLabelText(/sem atividade|com atividade/)
      ).not.toBeInTheDocument();
    });
  });
});

describe('Calendar — seletor de mês/ano acessível', () => {
  const openPicker = (variant: 'selection' | 'navigation' = 'selection') => {
    render(<Calendar variant={variant} selectedDate={new Date(2025, 2, 10)} />);
    const trigger = screen.getByRole('button', { name: /Março 2025/ });
    fireEvent.click(trigger);
    return trigger;
  };

  it.each(['selection', 'navigation'] as const)(
    'o gatilho (%s) anuncia o popup e aponta para ele',
    (variant) => {
      const trigger = openPicker(variant);

      expect(trigger).toHaveAttribute('type', 'button');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(
        screen.getByRole('dialog', { name: 'Selecionar mês e ano' })
      ).toHaveAttribute('id', trigger.getAttribute('aria-controls'));
    }
  );

  it('marca o mês e o ano atuais e lê o nome completo do mês', () => {
    openPicker();

    expect(screen.getByRole('button', { name: 'Março' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Abril' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByRole('button', { name: '2025' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('ao abrir, leva o foco ao mês atual', async () => {
    openPicker();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Março' })).toHaveFocus()
    );
  });

  it('Escape fecha, devolve o foco e marca o evento como tratado', () => {
    const trigger = openPicker();

    expect(fireEvent.keyDown(document, { key: 'Escape' })).toBe(false);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('outras teclas não fecham o seletor', () => {
    openPicker();

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('se um popup de fora já tratou o Escape, só fecha sem mexer no foco', () => {
    const outer = (event: KeyboardEvent) => event.preventDefault();
    document.addEventListener('keydown', outer, true);
    const trigger = openPicker();
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).not.toHaveFocus();
    document.removeEventListener('keydown', outer, true);
    outside.remove();
  });

  it('escolher um mês fecha o seletor e devolve o foco ao gatilho', () => {
    const trigger = openPicker();

    fireEvent.click(screen.getByRole('button', { name: 'Maio' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
