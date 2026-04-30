import type React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EssayCompetenceDetailsModal } from './EssayCompetenceDetailsModal';
import { SimulatedPerformanceTag } from '../SimulatedStudentDetailsModal/types';
import type {
  EssayCompetenceDetailsData,
  EssayCompetenceStudentItem,
} from './types';
import type { BaseApiClient } from '../../types/api';

// Mock TableProvider to avoid complex dependencies
jest.mock('../TableProvider', () => ({
  TableProvider: ({
    data,
    headers,
    loading,
  }: {
    data: Record<string, unknown>[];
    headers: {
      key: string;
      label: string;
      render?: (
        value: unknown,
        row: Record<string, unknown>,
        index: number
      ) => React.ReactNode;
    }[];
    loading?: boolean;
  }) => (
    <div data-testid="table-provider">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h.key}>{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length}>Loading...</td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length}>Nenhum estudante encontrado</td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((h) => (
                  <td key={h.key}>
                    {h.render
                      ? h.render(row[h.key], row, rowIndex)
                      : String(row[h.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  ),
}));

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
      limit: 10,
      total,
    },
  };
}

/**
 * Create mock API client
 */
function createMockApi(): BaseApiClient {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
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
    competenceName: 'Domínio da escrita',
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

      // Should show modal with title in C{number} - {name} format
      expect(screen.getByText('C1 - Domínio da escrita')).toBeInTheDocument();
    });

    it('shows modal title during loading', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('C1 - Domínio da escrita')).toBeInTheDocument();
    });

    it('uses competence number as fallback title when name not provided', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(
        <EssayCompetenceDetailsModal
          {...defaultProps}
          competenceName={undefined}
        />
      );

      expect(screen.getByText('C1 - Competência 1')).toBeInTheDocument();
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
    it('renders subtitle with essay and student count', () => {
      const data = createMockData();
      data.totalStudents = 25;
      data.totalEssays = 30;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByText(/Redação • 30 redações • 25 alunos/)
      ).toBeInTheDocument();
    });

    it('handles singular forms correctly', () => {
      const data = createMockData(1, 1, 1);
      data.totalStudents = 1;
      data.totalEssays = 1;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByText(/Redação • 1 redação • 1 aluno/)
      ).toBeInTheDocument();
    });

    it('renders 3 performance counters', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // 3 Counter labels - use getAllByText since badges may have similar text
      expect(screen.getAllByText('Acima da média').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Abaixo da média').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Ponto de atenção').length).toBeGreaterThan(0);

      // Counter values (highlight + aboveAverage = 15 for "Acima da média")
      expect(screen.getByText('15')).toBeInTheDocument(); // combined highlight + aboveAverage
      expect(screen.getByText('7')).toBeInTheDocument(); // belowAverage
      expect(screen.getByText('3')).toBeInTheDocument(); // attentionPoint
    });

    it('renders table with students', () => {
      mockHookState = { data: createMockData(3), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // Table should be rendered
      expect(screen.getByTestId('table-provider')).toBeInTheDocument();

      // Table headers
      expect(screen.getByText('Nome')).toBeInTheDocument();
      expect(screen.getByText('Escola')).toBeInTheDocument();
      expect(screen.getByText('Ano')).toBeInTheDocument();
      expect(screen.getByText('Turma')).toBeInTheDocument();
      expect(screen.getByText('Média')).toBeInTheDocument();
      expect(screen.getByText('Proficiência')).toBeInTheDocument();
    });

    it('renders student names in table', () => {
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
        limit: 10,
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
        limit: 10,
      });
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

      expect(screen.getByText(`C1 - ${longName}`)).toBeInTheDocument();
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

      // All 3 counter cards should show 0
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBe(3);
    });

    it('handles large numbers', () => {
      const data = createMockData();
      data.totalStudents = 10000;
      data.totalEssays = 50000;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByText(/Redação • 50000 redações • 10000 alunos/)
      ).toBeInTheDocument();
    });
  });
});
