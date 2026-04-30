import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimulatedPerformanceView } from './SimulatedPerformanceView';
import { SimulatedViewTab } from './types';
import type { SimulatedPerformanceViewProps } from './types';
import { ScoreType } from '../../types/common';
import type { BaseApiClient } from '../../types/api';
import { ReactNode } from 'react';

// Mock all child components
jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
}));

jest.mock('../TableProvider', () => ({
  TableProvider: ({
    headerContent,
    loading,
    data,
  }: {
    headerContent: ReactNode;
    loading: boolean;
    data: unknown[];
  }) => (
    <div data-testid="table-provider">
      {headerContent}
      {loading && <span>Carregando tabela...</span>}
      <span data-testid="table-data-count">{data?.length ?? 0} itens</span>
    </div>
  ),
}));

jest.mock('../Menu/Menu', () => ({
  __esModule: true,
  default: ({
    children,
    onValueChange,
    value,
  }: {
    children: ReactNode;
    onValueChange: (v: string) => void;
    value: string;
  }) => (
    <div data-testid="menu" data-value={value}>
      {children}
      <button
        data-testid="menu-students"
        onClick={() => onValueChange('students')}
      >
        Students
      </button>
      <button data-testid="menu-skills" onClick={() => onValueChange('skills')}>
        Skills
      </button>
    </div>
  ),
  MenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  MenuItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <div data-value={value}>{children}</div>
  ),
}));

jest.mock('../Skeleton/Skeleton', () => ({
  SkeletonCard: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-card" className={className}>
      Loading...
    </div>
  ),
}));

jest.mock('../PeriodSelector', () => ({
  PeriodSelector: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div data-testid="period-selector" data-value={value}>
      <button onClick={() => onChange('7_DAYS')}>7 dias</button>
      <button onClick={() => onChange('1_MONTH')}>1 mês</button>
    </div>
  ),
}));

jest.mock('../GeneralOverviewSection', () => ({
  GeneralOverviewSection: ({
    loading,
    error,
  }: {
    loading: boolean;
    error: string | null;
  }) => (
    <div data-testid="general-overview">
      {loading && <span>Carregando overview...</span>}
      {error && <span>Erro: {error}</span>}
    </div>
  ),
}));

jest.mock('../AreaKnowledgeSelector', () => ({
  AreaKnowledgeSelector: ({
    selectedAreaId,
    onAreaChange,
  }: {
    selectedAreaId: string | null;
    onAreaChange: (id: string | null) => void;
  }) => (
    <div data-testid="area-selector" data-selected={selectedAreaId}>
      <button onClick={() => onAreaChange('area-1')}>Area 1</button>
      <button onClick={() => onAreaChange('essay-area-id')}>Redação</button>
    </div>
  ),
  ESSAY_AREA_ID: 'essay-area-id',
}));

jest.mock('../SimulatedSubjectMenu', () => ({
  SimulatedSubjectMenu: ({
    selectedSubjectId,
    onSubjectChange,
  }: {
    selectedSubjectId: string | null;
    onSubjectChange: (id: string) => void;
  }) => (
    <div data-testid="subject-menu" data-selected={selectedSubjectId}>
      <button onClick={() => onSubjectChange('subject-1')}>Subject 1</button>
    </div>
  ),
}));

jest.mock('../SimulatedStudentRanking', () => ({
  SimulatedStudentRanking: ({
    highlightStudents,
    attentionStudents,
  }: {
    highlightStudents: unknown[];
    attentionStudents: unknown[];
  }) => (
    <div data-testid="student-ranking">
      <span>Destaques: {highlightStudents?.length ?? 0}</span>
      <span>Atenção: {attentionStudents?.length ?? 0}</span>
    </div>
  ),
}));

jest.mock('../PerformanceDistributionChart', () => ({
  PerformanceDistributionChart: ({ loading }: { loading: boolean }) => (
    <div data-testid="distribution-chart">
      {loading ? 'Carregando gráfico...' : 'Gráfico carregado'}
    </div>
  ),
}));

jest.mock('../SimulatedStudentDetailsModal', () => ({
  SimulatedStudentDetailsModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="student-modal">
        <button onClick={onClose}>Fechar</button>
      </div>
    ) : null,
}));

jest.mock('../SimulatedContentDetailsModal', () => ({
  SimulatedContentDetailsModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="content-modal">
        <button onClick={onClose}>Fechar</button>
      </div>
    ) : null,
}));

jest.mock('../EssayCompetencies', () => ({
  EssayCompetenciesTable: () => (
    <div data-testid="essay-competencies-table">
      Tabela de Competências de Redação
    </div>
  ),
}));

jest.mock('../EssayStudentDetailsModal', () => ({
  EssayStudentDetailsModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="essay-student-modal">
        <button onClick={onClose}>Fechar</button>
      </div>
    ) : null,
}));

jest.mock('../SimulatedFilters', () => ({
  SimulatedFiltersModal: ({
    isOpen,
    onClose,
    onApply,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: unknown) => void;
  }) =>
    isOpen ? (
      <div data-testid="filters-modal">
        <button onClick={onClose}>Fechar</button>
        <button onClick={() => onApply({ schoolIds: ['school-1'] })}>
          Aplicar
        </button>
      </div>
    ) : null,
}));

const createMockApi = (): BaseApiClient => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
});

const createDefaultProps = (
  overrides: Partial<SimulatedPerformanceViewProps> = {}
): SimulatedPerformanceViewProps => ({
  api: createMockApi(),
  period: '1_MONTH',
  scoreType: ScoreType.PERCENTAGE,
  selectedAreaKnowledgeId: null,
  selectedSubjectId: null,
  simulatedViewTab: SimulatedViewTab.STUDENTS,
  isEssaySelected: false,
  filters: {
    schoolIds: [],
    schoolYearIds: [],
    classIds: [],
    studentsIds: [],
  },
  activeFiltersCount: 0,
  generalOverview: {
    data: null,
    loading: false,
    error: null,
  },
  studentsOverview: {
    data: null,
    loading: false,
    isRefreshing: false,
    error: null,
  },
  contentsPerformance: {
    data: null,
    loading: false,
    isRefreshing: false,
    error: null,
  },
  handlePeriodChange: jest.fn(),
  handleScoreTypeChange: jest.fn(),
  handleAreaKnowledgeChange: jest.fn(),
  handleSubjectChange: jest.fn(),
  handleViewTabChange: jest.fn(),
  handleFiltersApply: jest.fn(),
  handleContentsParamsChange: jest.fn(),
  handleStudentRowClick: jest.fn(),
  handleContentRowClick: jest.fn(),
  studentModal: {
    isOpen: false,
    student: null,
    close: jest.fn(),
  },
  contentModal: {
    isOpen: false,
    content: null,
    close: jest.fn(),
  },
  filtersModal: {
    isOpen: false,
    open: jest.fn(),
    close: jest.fn(),
  },
  studentsTableColumns: [
    { key: 'name', label: 'Nome' },
    { key: 'average', label: 'Média' },
  ],
  contentsTableColumns: [
    { key: 'contentName', label: 'Habilidade' },
    { key: 'performance', label: 'Desempenho' },
  ],
  ...overrides,
});

describe('SimulatedPerformanceView', () => {
  describe('rendering', () => {
    it('renders period selector', () => {
      render(<SimulatedPerformanceView {...createDefaultProps()} />);

      expect(screen.getByTestId('period-selector')).toBeInTheDocument();
    });

    it('renders general overview section', () => {
      render(<SimulatedPerformanceView {...createDefaultProps()} />);

      expect(screen.getByTestId('general-overview')).toBeInTheDocument();
    });

    it('renders area knowledge selector', () => {
      render(<SimulatedPerformanceView {...createDefaultProps()} />);

      expect(screen.getByTestId('area-selector')).toBeInTheDocument();
    });

    it('renders subject menu when not essay', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            selectedAreaKnowledgeId: 'area-1',
            isEssaySelected: false,
          })}
        />
      );

      expect(screen.getByTestId('subject-menu')).toBeInTheDocument();
    });

    it('hides subject menu when essay is selected', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            selectedAreaKnowledgeId: 'essay-area-id',
            isEssaySelected: true,
          })}
        />
      );

      expect(screen.queryByTestId('subject-menu')).not.toBeInTheDocument();
    });

    it('renders view tabs menu', () => {
      render(<SimulatedPerformanceView {...createDefaultProps()} />);

      expect(screen.getByTestId('menu')).toBeInTheDocument();
    });
  });

  describe('students view', () => {
    it('renders student ranking when in students tab', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            simulatedViewTab: SimulatedViewTab.STUDENTS,
          })}
        />
      );

      expect(screen.getByTestId('student-ranking')).toBeInTheDocument();
    });

    it('renders distribution chart in students tab', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            simulatedViewTab: SimulatedViewTab.STUDENTS,
          })}
        />
      );

      expect(screen.getByTestId('distribution-chart')).toBeInTheDocument();
    });

    it('renders students table in students tab', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            simulatedViewTab: SimulatedViewTab.STUDENTS,
          })}
        />
      );

      // Text appears in menu item and table header
      const elements = screen.getAllByText('Desempenho por estudante');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('skills view', () => {
    it('renders contents table in skills tab', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            simulatedViewTab: SimulatedViewTab.SKILLS,
            isEssaySelected: false,
          })}
        />
      );

      // Text appears in menu item and table header
      const elements = screen.getAllByText('Desempenho por habilidade');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders essay competencies table when essay is selected in skills tab', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            simulatedViewTab: SimulatedViewTab.SKILLS,
            isEssaySelected: true,
            selectedAreaKnowledgeId: 'essay-area-id',
          })}
        />
      );

      expect(
        screen.getByTestId('essay-competencies-table')
      ).toBeInTheDocument();
    });

    it('does not render distribution chart in skills tab', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            simulatedViewTab: SimulatedViewTab.SKILLS,
          })}
        />
      );

      expect(
        screen.queryByTestId('distribution-chart')
      ).not.toBeInTheDocument();
    });
  });

  describe('loading states', () => {
    it('shows skeleton when students overview is loading', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            studentsOverview: {
              data: null,
              loading: true,
              isRefreshing: false,
              error: null,
            },
          })}
        />
      );

      expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
    });

    it('shows error message when there is an error', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            studentsOverview: {
              data: null,
              loading: false,
              isRefreshing: false,
              error: 'Erro ao carregar dados',
            },
          })}
        />
      );

      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls handlePeriodChange when period is changed', () => {
      const handlePeriodChange = jest.fn();
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({ handlePeriodChange })}
        />
      );

      fireEvent.click(screen.getByText('7 dias'));

      expect(handlePeriodChange).toHaveBeenCalledWith('7_DAYS');
    });

    it('calls handleViewTabChange when tab is changed', () => {
      const handleViewTabChange = jest.fn();
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({ handleViewTabChange })}
        />
      );

      fireEvent.click(screen.getByTestId('menu-skills'));

      expect(handleViewTabChange).toHaveBeenCalledWith('skills');
    });

    it('calls handleAreaKnowledgeChange when area is selected', () => {
      const handleAreaKnowledgeChange = jest.fn();
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({ handleAreaKnowledgeChange })}
        />
      );

      fireEvent.click(screen.getByText('Area 1'));

      expect(handleAreaKnowledgeChange).toHaveBeenCalledWith('area-1');
    });
  });

  describe('modals', () => {
    it('renders student modal when open', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            studentModal: {
              isOpen: true,
              student: { userInstitutionId: 'user-1', name: 'João' },
              close: jest.fn(),
            },
          })}
        />
      );

      expect(screen.getByTestId('student-modal')).toBeInTheDocument();
    });

    it('renders essay student modal when essay is selected', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            isEssaySelected: true,
            studentModal: {
              isOpen: true,
              student: { userInstitutionId: 'user-1', name: 'João' },
              close: jest.fn(),
            },
          })}
        />
      );

      expect(screen.getByTestId('essay-student-modal')).toBeInTheDocument();
    });

    it('renders content modal when open', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            contentModal: {
              isOpen: true,
              content: { contentId: 'content-1', contentName: 'Geometria' },
              close: jest.fn(),
            },
          })}
        />
      );

      expect(screen.getByTestId('content-modal')).toBeInTheDocument();
    });

    it('renders filters modal when open', () => {
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            filtersModal: {
              isOpen: true,
              open: jest.fn(),
              close: jest.fn(),
            },
          })}
        />
      );

      expect(screen.getByTestId('filters-modal')).toBeInTheDocument();
    });

    it('calls handleFiltersApply when filters are applied', () => {
      const handleFiltersApply = jest.fn();
      render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            handleFiltersApply,
            filtersModal: {
              isOpen: true,
              open: jest.fn(),
              close: jest.fn(),
            },
          })}
        />
      );

      fireEvent.click(screen.getByText('Aplicar'));

      expect(handleFiltersApply).toHaveBeenCalledWith({
        schoolIds: ['school-1'],
      });
    });
  });

  describe('refreshing state', () => {
    it('applies opacity class when students table is refreshing', () => {
      const { container } = render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            simulatedViewTab: SimulatedViewTab.STUDENTS,
            studentsOverview: {
              data: null,
              loading: false,
              isRefreshing: true,
              error: null,
            },
          })}
        />
      );

      const tableWrapper = container.querySelector('.opacity-60');
      expect(tableWrapper).toBeInTheDocument();
    });

    it('applies opacity class when contents table is refreshing', () => {
      const { container } = render(
        <SimulatedPerformanceView
          {...createDefaultProps({
            simulatedViewTab: SimulatedViewTab.SKILLS,
            contentsPerformance: {
              data: null,
              loading: false,
              isRefreshing: true,
              error: null,
            },
          })}
        />
      );

      const tableWrapper = container.querySelector('.opacity-60');
      expect(tableWrapper).toBeInTheDocument();
    });
  });
});
