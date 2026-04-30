import type React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EssayStudentDetailsModal } from './EssayStudentDetailsModal';
import {
  SimulatedPerformanceTag,
  type EssayStudentDetailsData,
  type EssayCompetencyPerformance,
} from './types';
import type { BaseApiClient } from '../../types/api';

// Mock useEssayStudentDetails hook
const mockFetchDetails = jest.fn();
const mockReset = jest.fn();
let mockHookState: {
  data: EssayStudentDetailsData | null;
  loading: boolean;
  error: string | null;
};

jest.mock('./useEssayStudentDetails', () => ({
  useEssayStudentDetails: () => ({
    ...mockHookState,
    fetchDetails: mockFetchDetails,
    reset: mockReset,
  }),
}));

/**
 * Create mock competencies (5 ENEM competencies)
 */
function createMockCompetencies(): EssayCompetencyPerformance[] {
  const names = [
    'Domínio da modalidade escrita formal da língua portuguesa',
    'Compreender a proposta de redação e aplicar conceitos',
    'Selecionar, relacionar, organizar e interpretar informações',
    'Demonstrar conhecimento dos mecanismos linguísticos',
    'Elaborar proposta de intervenção para o problema abordado',
  ];

  return names.map((name, i) => ({
    number: i + 1,
    name,
    averageScore: 120 + i * 15,
    averagePercentage: 60 + i * 8,
    essaysCount: 3,
  }));
}

/**
 * Create mock student details data
 */
function createMockData(
  performance: SimulatedPerformanceTag = SimulatedPerformanceTag.ABOVE_AVERAGE
): EssayStudentDetailsData {
  return {
    student: {
      id: 'student-1',
      name: 'Maria Silva',
      school: 'Colégio Santa Maria',
      schoolYear: '2024',
      class: '3A',
    },
    overallAverage: 720,
    overallPercentage: 72,
    performance,
    essaysCount: 5,
    competencies: createMockCompetencies(),
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

describe('EssayStudentDetailsModal', () => {
  const mockApi = createMockApi();
  const mockOnClose = jest.fn();

  const defaultProps = {
    api: mockApi,
    isOpen: true,
    onClose: mockOnClose,
    userInstitutionId: 'user-inst-1',
    studentName: 'Maria Silva',
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

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // Should show modal with title
      expect(screen.getByText('Desempenho de Maria Silva')).toBeInTheDocument();
    });

    it('shows 5 competency skeleton items when loading', () => {
      mockHookState = { data: null, loading: true, error: null };

      const { container } = render(
        <EssayStudentDetailsModal {...defaultProps} />
      );

      // Should have 5 skeleton rows for competencies
      const skeletonRows = container.querySelectorAll(
        '.flex.items-center.gap-4.p-4.bg-background.border'
      );
      expect(skeletonRows.length).toBe(5);
    });
  });

  describe('Error state', () => {
    it('renders error message when error occurs', () => {
      mockHookState = {
        data: null,
        loading: false,
        error: 'Erro ao carregar dados',
      };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders empty state when no data', () => {
      mockHookState = { data: null, loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });
  });

  describe('Data rendering', () => {
    it('renders student name in header card', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // Student name appears in header card
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });

    it('renders school and class info', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Colégio Santa Maria - 3A')).toBeInTheDocument();
    });

    it('renders essays count', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText(/5\s+redações/)).toBeInTheDocument();
    });

    it('renders overall average score', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('720')).toBeInTheDocument();
      expect(screen.getByText('/ 1000')).toBeInTheDocument();
    });

    it('renders overall percentage', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('72%')).toBeInTheDocument();
    });

    it('renders performance badge', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // Should show "Acima da média" badge
      expect(screen.getByText('Acima da média')).toBeInTheDocument();
    });

    it('renders all 5 competencies', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // Check competency numbers
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders competency names', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(
        screen.getByText(
          'Domínio da modalidade escrita formal da língua portuguesa'
        )
      ).toBeInTheDocument();
    });

    it('renders competency scores', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // First competency score (120)
      expect(screen.getByText('120')).toBeInTheDocument();
      // All competencies show /200
      expect(screen.getAllByText('/ 200').length).toBe(5);
    });

    it('handles singular essay count', () => {
      const data = createMockData();
      data.essaysCount = 1;
      mockHookState = { data, loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText(/1\s+redação$/)).toBeInTheDocument();
    });
  });

  describe('Performance tags', () => {
    it('renders highlight performance correctly', () => {
      mockHookState = {
        data: createMockData(SimulatedPerformanceTag.HIGHLIGHT),
        loading: false,
        error: null,
      };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Destaque da turma')).toBeInTheDocument();
    });

    it('renders above average performance correctly', () => {
      mockHookState = {
        data: createMockData(SimulatedPerformanceTag.ABOVE_AVERAGE),
        loading: false,
        error: null,
      };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Acima da média')).toBeInTheDocument();
    });

    it('renders below average performance correctly', () => {
      mockHookState = {
        data: createMockData(SimulatedPerformanceTag.BELOW_AVERAGE),
        loading: false,
        error: null,
      };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Abaixo da média')).toBeInTheDocument();
    });

    it('renders attention point performance correctly', () => {
      mockHookState = {
        data: createMockData(SimulatedPerformanceTag.ATTENTION_POINT),
        loading: false,
        error: null,
      };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Ponto de atenção')).toBeInTheDocument();
    });
  });

  describe('Modal open/close behavior', () => {
    it('fetches details when modal opens', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} isOpen={true} />);

      expect(mockFetchDetails).toHaveBeenCalledWith({
        userInstitutionId: 'user-inst-1',
        period: '1_MONTH',
        schoolIds: undefined,
        schoolYearIds: undefined,
        classIds: undefined,
      });
    });

    it('does not fetch when userInstitutionId is null', () => {
      mockHookState = { data: null, loading: false, error: null };

      render(
        <EssayStudentDetailsModal
          {...defaultProps}
          isOpen={true}
          userInstitutionId={null}
        />
      );

      expect(mockFetchDetails).not.toHaveBeenCalled();
    });

    it('resets state when modal closes', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      const { rerender } = render(
        <EssayStudentDetailsModal {...defaultProps} isOpen={true} />
      );

      // Close the modal
      rerender(<EssayStudentDetailsModal {...defaultProps} isOpen={false} />);

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Filter parameters', () => {
    it('passes filter parameters to fetchDetails', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(
        <EssayStudentDetailsModal
          {...defaultProps}
          schoolIds={['school-1', 'school-2']}
          schoolYearIds={['year-1']}
          classIds={['class-1', 'class-2', 'class-3']}
        />
      );

      expect(mockFetchDetails).toHaveBeenCalledWith({
        userInstitutionId: 'user-inst-1',
        period: '1_MONTH',
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1', 'class-2', 'class-3'],
      });
    });
  });

  describe('Custom labels', () => {
    it('uses custom noData label', () => {
      mockHookState = { data: null, loading: false, error: null };

      render(
        <EssayStudentDetailsModal
          {...defaultProps}
          labels={{ noData: 'Sem informações disponíveis' }}
        />
      );

      expect(
        screen.getByText('Sem informações disponíveis')
      ).toBeInTheDocument();
    });

    it('uses custom competencies label', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(
        <EssayStudentDetailsModal
          {...defaultProps}
          labels={{ competencies: 'Habilidades ENEM' }}
        />
      );

      expect(screen.getByText('Habilidades ENEM')).toBeInTheDocument();
    });
  });

  describe('Modal title', () => {
    it('uses student name in title', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(
        <EssayStudentDetailsModal {...defaultProps} studentName="João Pedro" />
      );

      expect(screen.getByText('Desempenho de João Pedro')).toBeInTheDocument();
    });

    it('uses fallback title when student name not provided', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(
        <EssayStudentDetailsModal {...defaultProps} studentName={undefined} />
      );

      expect(screen.getByText('Desempenho de Estudante')).toBeInTheDocument();
    });
  });

  describe('Empty competencies', () => {
    it('shows no competencies message when list is empty', () => {
      const data = createMockData();
      data.competencies = [];
      mockHookState = { data, loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(
        screen.getByText('Nenhuma competência encontrada')
      ).toBeInTheDocument();
    });
  });
});
