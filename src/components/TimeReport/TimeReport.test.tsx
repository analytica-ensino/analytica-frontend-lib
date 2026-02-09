import { render, screen, fireEvent } from '@testing-library/react';
import {
  TimeReport,
  TimeCard,
  formatHoursToTime,
  getTrendDirection,
  formatVariation,
} from './TimeReport';
import type { TimeCardData, TimeReportTab } from './TimeReport';

/**
 * Mock icon component for testing
 */
const MockIcon = () => <svg data-testid="mock-icon" />;
const MockTabIcon = () => <svg data-testid="mock-tab-icon" />;

/**
 * Mock card data
 */
const mockPlatformCard: TimeCardData = {
  id: 'platform',
  label: 'TEMPO NA PLATAFORMA',
  value: '12h 20min',
  icon: <MockIcon />,
  trendValue: '+10%',
  trendDirection: 'up',
};

const mockActivityCard: TimeCardData = {
  id: 'activity',
  label: 'TEMPO EM ATIVIDADES',
  value: '12h 20min',
  icon: <MockIcon />,
  trendValue: '+10%',
  trendDirection: 'up',
};

const mockLessonsCard: TimeCardData = {
  id: 'lessons',
  label: 'TEMPO EM AULAS RECOMENDADAS',
  value: '1209h 20min',
  icon: <MockIcon />,
  trendValue: '-10%',
  trendDirection: 'down',
};

const mockNoTrendCard: TimeCardData = {
  id: 'no-trend',
  label: 'TEMPO EM SIMULADOS',
  value: '200h 0min',
  icon: <MockIcon />,
};

/**
 * Mock tabs
 */
const mockTabs: TimeReportTab[] = [
  {
    value: 'STUDENT',
    label: 'Estudante',
    icon: <MockTabIcon />,
    cards: [mockPlatformCard, mockActivityCard, mockLessonsCard],
  },
  {
    value: 'TEACHER',
    label: 'Professor',
    icon: <MockTabIcon />,
    cards: [mockPlatformCard, mockActivityCard],
  },
];

describe('TimeCard', () => {
  it('renders label, value, and icon', () => {
    render(<TimeCard data={mockPlatformCard} />);

    expect(screen.getByText('TEMPO NA PLATAFORMA')).toBeInTheDocument();
    expect(screen.getByText('12h 20min')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders trend indicator when provided', () => {
    render(<TimeCard data={mockPlatformCard} />);

    expect(screen.getByTestId('trend-platform')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
  });

  it('renders down trend with correct styling', () => {
    render(<TimeCard data={mockLessonsCard} />);

    const trend = screen.getByTestId('trend-lessons');
    expect(trend).toHaveClass('text-error-500');
    expect(screen.getByText('-10%')).toBeInTheDocument();
  });

  it('renders up trend with correct styling', () => {
    render(<TimeCard data={mockPlatformCard} />);

    const trend = screen.getByTestId('trend-platform');
    expect(trend).toHaveClass('text-success-500');
  });

  it('does not render trend when not provided', () => {
    render(<TimeCard data={mockNoTrendCard} />);

    expect(screen.queryByTestId('trend-no-trend')).not.toBeInTheDocument();
  });

  it('renders icon with correct styling', () => {
    render(<TimeCard data={mockPlatformCard} />);

    const iconContainer = screen.getByTestId('mock-icon').closest('span');
    expect(iconContainer).toHaveClass('text-text-600');
    expect(iconContainer).not.toHaveClass('bg-primary-100');
    expect(iconContainer).not.toHaveClass('rounded-md');
  });

  it('applies custom className', () => {
    const { container } = render(
      <TimeCard data={mockPlatformCard} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('TimeReport', () => {
  it('renders tabs with correct labels', () => {
    render(<TimeReport tabs={mockTabs} />);

    expect(screen.getByText('Estudante')).toBeInTheDocument();
    expect(screen.getByText('Professor')).toBeInTheDocument();
  });

  it('renders cards for the first tab by default', () => {
    render(<TimeReport tabs={mockTabs} />);

    const cardsGrid = screen.getByTestId('time-report-cards');
    expect(cardsGrid.children).toHaveLength(3);
  });

  it('renders cards for the default tab when specified', () => {
    render(<TimeReport tabs={mockTabs} defaultTab="TEACHER" />);

    const cardsGrid = screen.getByTestId('time-report-cards');
    expect(cardsGrid.children).toHaveLength(2);
  });

  it('switches cards when clicking a different tab', () => {
    render(<TimeReport tabs={mockTabs} />);

    // Initially 3 cards (student tab)
    expect(screen.getByTestId('time-report-cards').children).toHaveLength(3);

    // Click professor tab
    const professorTab = screen.getByText('Professor');
    fireEvent.click(professorTab);

    // Now 2 cards
    expect(screen.getByTestId('time-report-cards').children).toHaveLength(2);
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = jest.fn();
    render(<TimeReport tabs={mockTabs} onTabChange={onTabChange} />);

    const professorTab = screen.getByText('Professor');
    fireEvent.click(professorTab);

    expect(onTabChange).toHaveBeenCalledWith('TEACHER');
  });

  it('supports controlled tab via activeTab', () => {
    render(<TimeReport tabs={mockTabs} activeTab="TEACHER" />);

    const cardsGrid = screen.getByTestId('time-report-cards');
    expect(cardsGrid.children).toHaveLength(2);
  });

  it('does not show tabs when only one tab exists', () => {
    const singleTab: TimeReportTab[] = [
      {
        value: 'only',
        label: 'Only Tab',
        cards: [mockPlatformCard],
      },
    ];

    render(<TimeReport tabs={singleTab} />);

    expect(screen.queryByText('Only Tab')).not.toBeInTheDocument();
    expect(screen.getByTestId('time-report-cards').children).toHaveLength(1);
  });

  it('renders null when tabs array is empty', () => {
    const { container } = render(<TimeReport tabs={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders tab icons when provided', () => {
    render(<TimeReport tabs={mockTabs} />);

    const tabIcons = screen.getAllByTestId('mock-tab-icon');
    expect(tabIcons.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <TimeReport tabs={mockTabs} className="custom-report" />
    );

    expect(container.firstChild).toHaveClass('custom-report');
  });

  it('uses correct grid columns for 3 cards', () => {
    render(<TimeReport tabs={mockTabs} />);

    const grid = screen.getByTestId('time-report-cards');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('uses correct grid columns for 5 cards', () => {
    const fiveCardTabs: TimeReportTab[] = [
      {
        value: 'STUDENT',
        label: 'Estudante',
        cards: [
          mockPlatformCard,
          mockActivityCard,
          mockLessonsCard,
          mockNoTrendCard,
          { ...mockPlatformCard, id: 'extra' },
        ],
      },
    ];

    render(<TimeReport tabs={fiveCardTabs} />);

    const grid = screen.getByTestId('time-report-cards');
    expect(grid).toHaveClass('lg:grid-cols-5');
  });

  it('renders card values correctly', () => {
    render(<TimeReport tabs={mockTabs} />);

    expect(screen.getByText('TEMPO NA PLATAFORMA')).toBeInTheDocument();
    expect(screen.getByText('TEMPO EM ATIVIDADES')).toBeInTheDocument();
    expect(screen.getByText('TEMPO EM AULAS RECOMENDADAS')).toBeInTheDocument();
  });
});

describe('formatHoursToTime', () => {
  it('formats whole hours', () => {
    expect(formatHoursToTime(10)).toBe('10h 0min');
  });

  it('formats hours with decimal to minutes', () => {
    expect(formatHoursToTime(150.5)).toBe('150h 30min');
  });

  it('formats zero hours', () => {
    expect(formatHoursToTime(0)).toBe('0h 0min');
  });

  it('rounds minutes correctly', () => {
    expect(formatHoursToTime(1.75)).toBe('1h 45min');
  });
});

describe('getTrendDirection', () => {
  it('returns "up" for positive values', () => {
    expect(getTrendDirection(12.3)).toBe('up');
  });

  it('returns "down" for negative values', () => {
    expect(getTrendDirection(-5.2)).toBe('down');
  });

  it('returns "up" for zero', () => {
    expect(getTrendDirection(0)).toBe('up');
  });

  it('returns undefined for null', () => {
    expect(getTrendDirection(null)).toBeUndefined();
  });
});

describe('formatVariation', () => {
  it('formats positive variation with + sign', () => {
    expect(formatVariation(12.3)).toBe('+12.3%');
  });

  it('formats negative variation', () => {
    expect(formatVariation(-5.2)).toBe('-5.2%');
  });

  it('formats zero with + sign', () => {
    expect(formatVariation(0)).toBe('+0%');
  });

  it('returns undefined for null', () => {
    expect(formatVariation(null)).toBeUndefined();
  });
});
