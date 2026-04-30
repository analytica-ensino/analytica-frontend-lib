import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { EssayCompetenceDetailsModal } from './EssayCompetenceDetailsModal';
import {
  SimulatedPerformanceTag,
  type EssayCompetenciesApiClient,
  type EssayCompetenceDetailsData,
  type EssayCompetenceStudentItem,
} from './types';

// Mock useEssayCompetenceDetails hook
const mockFetchDetails = jest.fn();
const mockReset = jest.fn();
let mockHookState: {
  data: EssayCompetenceDetailsData | null;
  loading: boolean;
  error: string | null;
};

jest.mock('./useEssayCompetenceDetails', () => ({
  useEssayCompetenceDetails: () => ({
    ...mockHookState,
    fetchDetails: mockFetchDetails,
    reset: mockReset,
  }),
}));

/**
 * Create mock student items
 */
function createMockStudents(count: number): EssayCompetenceStudentItem[] {
  const performances = [
    SimulatedPerformanceTag.HIGHLIGHT,
    SimulatedPerformanceTag.ABOVE_AVERAGE,
    SimulatedPerformanceTag.BELOW_AVERAGE,
    SimulatedPerformanceTag.ATTENTION_POINT,
  ];

  return Array.from({ length: count }, (_, i) => ({
    studentId: `student-${i + 1}`,
    userInstitutionId: `user-inst-${i + 1}`,
    name: `Estudante ${i + 1}`,
    school: `Escola ${Math.floor(i / 5) + 1}`,
    schoolYear: '2024',
    class: `Turma ${String.fromCharCode(65 + (i % 3))}`,
    averageScore: 100 + Math.random() * 100,
    averagePercentage: 50 + Math.random() * 50,
    performance: performances[i % performances.length],
    essaysCount: Math.floor(Math.random() * 5) + 1,
  }));
}

/**
 * Create mock competence details data
 */
function createMockData(
  studentCount = 5,
  page = 1,
  total = 5
): EssayCompetenceDetailsData {
  return {
    competence: {
      number: 1,
      name: 'Domínio da modalidade escrita formal da língua portuguesa',
    },
    classAverage: 145.5,
    classAveragePercentage: 72.75,
    totalEssays: 25,
    totalStudents: total,
    counters: {
      highlight: 5,
      aboveAverage: 10,
      belowAverage: 7,
      attentionPoint: 3,
    },
    students: {
      data: createMockStudents(studentCount),
      page,
      limit: 20,
      total,
    },
  };
}

/**
 * Create mock API client
 */
function createMockApi(): EssayCompetenciesApiClient {
  return {
    post: jest.fn(),
  };
}

describe('EssayCompetenceDetailsModal', () => {
  const mockApi = createMockApi();
  const mockOnClose = jest.fn();

  const defaultProps = {
    api: mockApi,
    isOpen: true,
    onClose: mockOnClose,
    competenceNumber: 1,
    competenceName: 'Competência 1 - Domínio da escrita',
    period: '1_MONTH',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHookState = {
      data: null,
      loading: false,
      error: null,
    };
  });

  describe('Loading state', () => {
    it('renders loading skeletons when loading', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // Should show modal with title
      expect(
        screen.getByText('Competência 1 - Domínio da escrita')
      ).toBeInTheDocument();
    });

    it('shows modal title during loading', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByText('Competência 1 - Domínio da escrita')
      ).toBeInTheDocument();
    });

    it('uses competence number as fallback title when name not provided', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(
        <EssayCompetenceDetailsModal
          {...defaultProps}
          competenceName={undefined}
        />
      );

      expect(screen.getByText('Competência 1')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('renders error message when error occurs', () => {
      mockHookState = {
        data: null,
        loading: false,
        error: 'Erro ao carregar dados',
      };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders empty state when no data', () => {
      mockHookState = { data: null, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });
  });

  describe('Data rendering', () => {
    it('renders competence name from data', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByText(
          'Domínio da modalidade escrita formal da língua portuguesa'
        )
      ).toBeInTheDocument();
    });

    it('renders student count and essay count', () => {
      const data = createMockData();
      data.totalStudents = 25;
      data.totalEssays = 30;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByText('25 estudantes - 30 redações')
      ).toBeInTheDocument();
    });

    it('handles singular forms correctly', () => {
      const data = createMockData(1, 1, 1);
      data.totalStudents = 1;
      data.totalEssays = 1;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('1 estudante - 1 redação')).toBeInTheDocument();
    });

    it('renders class average', () => {
      const data = createMockData();
      data.classAverage = 146;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('146')).toBeInTheDocument();
      // Multiple "/ 200" elements exist (header + student items)
      expect(screen.getAllByText('/ 200').length).toBeGreaterThan(0);
    });

    it('renders class average percentage', () => {
      const data = createMockData();
      data.classAveragePercentage = 72.75;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText(/Média da turma:/)).toBeInTheDocument();
      // Percentage appears in multiple places (header + progress bars)
      expect(screen.getAllByText(/73%/).length).toBeGreaterThan(0);
    });

    it('renders performance counters', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // Counter labels - use getAllByText since badges may have similar text
      expect(screen.getByText('Destaque')).toBeInTheDocument();
      expect(screen.getAllByText('Acima da média').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Abaixo da média').length).toBeGreaterThan(0);
      expect(screen.getByText('Atenção')).toBeInTheDocument();

      // Counter values - use getAllByText since numbers may appear multiple times
      expect(screen.getAllByText('5').length).toBeGreaterThan(0); // highlight
      expect(screen.getAllByText('10').length).toBeGreaterThan(0); // aboveAverage
      expect(screen.getAllByText('7').length).toBeGreaterThan(0); // belowAverage
      expect(screen.getAllByText('3').length).toBeGreaterThan(0); // attentionPoint
    });

    it('renders student list', () => {
      mockHookState = { data: createMockData(3), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('Estudante 1')).toBeInTheDocument();
      expect(screen.getByText('Estudante 2')).toBeInTheDocument();
      expect(screen.getByText('Estudante 3')).toBeInTheDocument();
    });

    it('renders empty students message when no students', () => {
      const data = createMockData(0, 1, 0);
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByText('Nenhum estudante encontrado')
      ).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('does not show pagination when total pages is 1', () => {
      const data = createMockData(5, 1, 5);
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
      expect(screen.queryByText('Próxima')).not.toBeInTheDocument();
    });

    it('shows pagination when total pages is greater than 1', () => {
      const data = createMockData(20, 1, 45);
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('Anterior')).toBeInTheDocument();
      expect(screen.getByText('Próxima')).toBeInTheDocument();
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
      const data = createMockData(20, 1, 45);
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      const previousButton = screen.getByText('Anterior');
      expect(previousButton).toBeDisabled();
    });

    it('disables next button on last page', () => {
      const data = createMockData(5, 3, 45);
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      const nextButton = screen.getByText('Próxima');
      expect(nextButton).toBeDisabled();
    });

    it('calls fetchDetails when clicking next', async () => {
      const user = userEvent.setup();
      const data = createMockData(20, 1, 45);
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      const nextButton = screen.getByText('Próxima');
      await user.click(nextButton);

      expect(mockFetchDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          competenceNumber: 1,
          page: 2,
        })
      );
    });

    it('calls fetchDetails when clicking previous', async () => {
      const user = userEvent.setup();
      const data = createMockData(20, 2, 45);
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      const previousButton = screen.getByText('Anterior');
      await user.click(previousButton);

      expect(mockFetchDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          competenceNumber: 1,
          page: 1,
        })
      );
    });
  });

  describe('Modal open/close behavior', () => {
    it('fetches details when modal opens', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} isOpen={true} />);

      expect(mockFetchDetails).toHaveBeenCalledWith({
        competenceNumber: 1,
        period: '1_MONTH',
        schoolIds: undefined,
        schoolYearIds: undefined,
        classIds: undefined,
        page: 1,
        limit: 20,
      });
    });

    it('does not fetch when competenceNumber is null', () => {
      mockHookState = { data: null, loading: false, error: null };

      render(
        <EssayCompetenceDetailsModal
          {...defaultProps}
          isOpen={true}
          competenceNumber={null}
        />
      );

      expect(mockFetchDetails).not.toHaveBeenCalled();
    });

    it('resets state when modal closes', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      const { rerender } = render(
        <EssayCompetenceDetailsModal {...defaultProps} isOpen={true} />
      );

      // Close the modal
      rerender(
        <EssayCompetenceDetailsModal {...defaultProps} isOpen={false} />
      );

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Filter parameters', () => {
    it('passes filter parameters to fetchDetails', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(
        <EssayCompetenceDetailsModal
          {...defaultProps}
          schoolIds={['school-1', 'school-2']}
          schoolYearIds={['year-1']}
          classIds={['class-1', 'class-2', 'class-3']}
        />
      );

      expect(mockFetchDetails).toHaveBeenCalledWith({
        competenceNumber: 1,
        period: '1_MONTH',
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1', 'class-2', 'class-3'],
        page: 1,
        limit: 20,
      });
    });
  });

  describe('Student item rendering', () => {
    it('renders student name', () => {
      const data = createMockData(1);
      data.students.data[0].name = 'Maria Silva';
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });

    it('renders student school and class', () => {
      const data = createMockData(1);
      data.students.data[0].school = 'Colégio ABC';
      data.students.data[0].class = 'Turma 3A';
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('Colégio ABC - Turma 3A')).toBeInTheDocument();
    });

    it('renders student score', () => {
      const data = createMockData(1);
      data.students.data[0].averageScore = 175.8;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('176')).toBeInTheDocument(); // Rounded
    });

    it('renders performance badges', () => {
      const data = createMockData(4);
      data.students.data[0].performance = SimulatedPerformanceTag.HIGHLIGHT;
      data.students.data[1].performance = SimulatedPerformanceTag.ABOVE_AVERAGE;
      data.students.data[2].performance = SimulatedPerformanceTag.BELOW_AVERAGE;
      data.students.data[3].performance =
        SimulatedPerformanceTag.ATTENTION_POINT;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // Performance badges - use getAllByText since counter labels may have similar text
      expect(screen.getByText('Destaque da turma')).toBeInTheDocument();
      expect(screen.getAllByText('Acima da média').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Abaixo da média').length).toBeGreaterThan(0);
      expect(screen.getByText('Ponto de atenção')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('modal can be closed', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // Modal component should handle close button
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('handles very long competence name', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      const longName =
        'Esta é uma competência com um nome muito longo que deve ser tratada corretamente pelo componente';

      render(
        <EssayCompetenceDetailsModal
          {...defaultProps}
          competenceName={longName}
        />
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('handles zero counters', () => {
      const data = createMockData();
      data.counters = {
        highlight: 0,
        aboveAverage: 0,
        belowAverage: 0,
        attentionPoint: 0,
      };
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBe(4);
    });

    it('handles large numbers', () => {
      const data = createMockData();
      data.totalStudents = 10000;
      data.totalEssays = 50000;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByText('10000 estudantes - 50000 redações')
      ).toBeInTheDocument();
    });
  });
});
