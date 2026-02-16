import { render, screen, fireEvent } from '@testing-library/react';
import { PerformanceReport, PerformanceCard } from './PerformanceReport';
import type {
  PerformanceCardData,
  PerformanceReportTab,
} from './PerformanceReport';

/**
 * Mock icon component for testing
 */
const MockIcon = () => <svg data-testid="mock-icon" />;
const MockTabIcon = () => <svg data-testid="mock-tab-icon" />;

/**
 * Mock card data
 */
const mockCitiesCard: PerformanceCardData = {
  id: 'cities',
  label: 'CIDADES',
  value: 42,
  icon: <MockIcon />,
};

const mockSchoolsCard: PerformanceCardData = {
  id: 'schools',
  label: 'ESCOLAS',
  value: 150,
  icon: <MockIcon />,
};

const mockClassesCard: PerformanceCardData = {
  id: 'classes',
  label: 'TURMAS',
  value: '1.200',
  icon: <MockIcon />,
};

const mockStudentsCard: PerformanceCardData = {
  id: 'students',
  label: 'ESTUDANTES',
  value: 5000,
  icon: <MockIcon />,
};

const mockTeachersCard: PerformanceCardData = {
  id: 'teachers',
  label: 'PROFESSORES',
  value: 320,
  icon: <MockIcon />,
};

/**
 * Mock tabs
 */
const mockTabs: PerformanceReportTab[] = [
  {
    value: 'STUDENT',
    label: 'Estudante',
    icon: <MockTabIcon />,
    cards: [
      mockCitiesCard,
      mockSchoolsCard,
      mockClassesCard,
      mockStudentsCard,
      mockTeachersCard,
    ],
  },
  {
    value: 'TEACHER',
    label: 'Professor',
    icon: <MockTabIcon />,
    cards: [
      { id: 'activities', label: 'ATIVIDADES', value: 80, icon: <MockIcon /> },
      {
        id: 'lessons',
        label: 'AULAS RECOMENDADAS',
        value: 45,
        icon: <MockIcon />,
      },
    ],
  },
];

describe('PerformanceCard', () => {
  it('renders label, value, and icon', () => {
    render(<PerformanceCard data={mockCitiesCard} />);

    expect(screen.getByText('CIDADES')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders string values', () => {
    render(<PerformanceCard data={mockClassesCard} />);

    expect(screen.getByText('1.200')).toBeInTheDocument();
  });

  it('does not render any trend section', () => {
    const { container } = render(<PerformanceCard data={mockCitiesCard} />);

    expect(container.querySelector('[data-testid^="trend-"]')).toBeNull();
  });

  it('renders icon with correct styling', () => {
    render(<PerformanceCard data={mockCitiesCard} />);

    const iconContainer = screen.getByTestId('mock-icon').closest('span');
    expect(iconContainer).toHaveClass('text-text-600');
  });

  it('applies custom className', () => {
    const { container } = render(
      <PerformanceCard data={mockCitiesCard} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('PerformanceReport', () => {
  it('renders tabs with correct labels', () => {
    render(<PerformanceReport tabs={mockTabs} />);

    expect(screen.getByText('Estudante')).toBeInTheDocument();
    expect(screen.getByText('Professor')).toBeInTheDocument();
  });

  it('renders cards for the first tab by default', () => {
    render(<PerformanceReport tabs={mockTabs} />);

    const cardsGrid = screen.getByTestId('performance-report-cards');
    expect(cardsGrid.children).toHaveLength(5);
  });

  it('renders cards for the default tab when specified', () => {
    render(<PerformanceReport tabs={mockTabs} defaultTab="TEACHER" />);

    const cardsGrid = screen.getByTestId('performance-report-cards');
    expect(cardsGrid.children).toHaveLength(2);
  });

  it('switches cards when clicking a different tab', () => {
    render(<PerformanceReport tabs={mockTabs} />);

    // Initially 5 cards (student tab)
    expect(
      screen.getByTestId('performance-report-cards').children
    ).toHaveLength(5);

    // Click professor tab
    const professorTab = screen.getByText('Professor');
    fireEvent.click(professorTab);

    // Now 2 cards
    expect(
      screen.getByTestId('performance-report-cards').children
    ).toHaveLength(2);
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = jest.fn();
    render(<PerformanceReport tabs={mockTabs} onTabChange={onTabChange} />);

    const professorTab = screen.getByText('Professor');
    fireEvent.click(professorTab);

    expect(onTabChange).toHaveBeenCalledWith('TEACHER');
  });

  it('supports controlled tab via activeTab', () => {
    render(<PerformanceReport tabs={mockTabs} activeTab="TEACHER" />);

    const cardsGrid = screen.getByTestId('performance-report-cards');
    expect(cardsGrid.children).toHaveLength(2);
  });

  it('does not show tabs when only one tab exists', () => {
    const singleTab: PerformanceReportTab[] = [
      {
        value: 'only',
        label: 'Only Tab',
        cards: [mockCitiesCard],
      },
    ];

    render(<PerformanceReport tabs={singleTab} />);

    expect(screen.queryByText('Only Tab')).not.toBeInTheDocument();
    expect(
      screen.getByTestId('performance-report-cards').children
    ).toHaveLength(1);
  });

  it('renders null when tabs array is empty', () => {
    const { container } = render(<PerformanceReport tabs={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders tab icons when provided', () => {
    render(<PerformanceReport tabs={mockTabs} />);

    const tabIcons = screen.getAllByTestId('mock-tab-icon');
    expect(tabIcons.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <PerformanceReport tabs={mockTabs} className="custom-report" />
    );

    expect(container.firstChild).toHaveClass('custom-report');
  });

  it('uses correct grid columns for 5 cards', () => {
    render(<PerformanceReport tabs={mockTabs} />);

    const grid = screen.getByTestId('performance-report-cards');
    expect(grid).toHaveClass('lg:grid-cols-5');
  });

  it('uses correct grid columns for 4 cards', () => {
    const fourCardTabs: PerformanceReportTab[] = [
      {
        value: 'four',
        label: 'Four',
        cards: [
          mockCitiesCard,
          mockSchoolsCard,
          mockClassesCard,
          mockStudentsCard,
        ],
      },
    ];

    render(<PerformanceReport tabs={fourCardTabs} />);

    const grid = screen.getByTestId('performance-report-cards');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('uses correct grid columns for 3 cards', () => {
    const threeCardTabs: PerformanceReportTab[] = [
      {
        value: 'three',
        label: 'Three',
        cards: [mockCitiesCard, mockSchoolsCard, mockClassesCard],
      },
    ];

    render(<PerformanceReport tabs={threeCardTabs} />);

    const grid = screen.getByTestId('performance-report-cards');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('uses correct grid columns for 2 cards', () => {
    render(<PerformanceReport tabs={mockTabs} defaultTab="TEACHER" />);

    const grid = screen.getByTestId('performance-report-cards');
    expect(grid).toHaveClass('lg:grid-cols-2');
  });

  it('uses no extra grid class for 1 card', () => {
    const oneCardTabs: PerformanceReportTab[] = [
      {
        value: 'one',
        label: 'One',
        cards: [mockCitiesCard],
      },
    ];

    render(<PerformanceReport tabs={oneCardTabs} />);

    const grid = screen.getByTestId('performance-report-cards');
    expect(grid).not.toHaveClass('lg:grid-cols-2');
    expect(grid).not.toHaveClass('lg:grid-cols-3');
    expect(grid).not.toHaveClass('lg:grid-cols-4');
    expect(grid).not.toHaveClass('lg:grid-cols-5');
  });

  it('renders card values correctly', () => {
    render(<PerformanceReport tabs={mockTabs} />);

    expect(screen.getByText('CIDADES')).toBeInTheDocument();
    expect(screen.getByText('ESCOLAS')).toBeInTheDocument();
    expect(screen.getByText('TURMAS')).toBeInTheDocument();
    expect(screen.getByText('ESTUDANTES')).toBeInTheDocument();
    expect(screen.getByText('PROFESSORES')).toBeInTheDocument();
  });
});
