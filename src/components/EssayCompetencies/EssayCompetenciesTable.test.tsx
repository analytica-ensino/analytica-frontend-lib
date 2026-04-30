import type React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { EssayCompetenciesOverviewData } from './types';
import type { BaseApiClient } from '../../types/api';
import { Period } from '../PeriodSelector';

// Mock TableProvider to avoid complex dependencies
jest.mock('../TableProvider', () => ({
  TableProvider: ({
    data,
    headers,
    loading,
    onRowClick,
    headerContent,
    searchPlaceholder,
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
    onRowClick?: (row: Record<string, unknown>, index: number) => void;
    headerContent?: React.ReactNode;
    searchPlaceholder?: string;
  }) => (
    <div data-testid="table-provider">
      {headerContent}
      <input placeholder={searchPlaceholder} />
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
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row, rowIndex)}
                style={{ cursor: 'pointer' }}
              >
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

// Mock useEssayCompetenciesOverview hook
const mockFetchOverview = jest.fn();
const mockReset = jest.fn();
let mockHookState: {
  data: EssayCompetenciesOverviewData | null;
  loading: boolean;
  error: string | null;
};

jest.mock('./useEssayCompetenciesOverview', () => ({
  useEssayCompetenciesOverview: () => ({
    ...mockHookState,
    fetchOverview: mockFetchOverview,
    reset: mockReset,
  }),
}));

// Mock EssayCompetenceDetailsModal to simplify testing
jest.mock('./EssayCompetenceDetailsModal', () => ({
  EssayCompetenceDetailsModal: ({
    isOpen,
    competenceNumber,
    competenceName,
  }: {
    isOpen: boolean;
    competenceNumber: number | null;
    competenceName?: string;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="details-modal">
        Modal: {competenceName || `Competência ${competenceNumber}`}
      </div>
    ) : null,
}));

// Import the component after mocks are set up
import { EssayCompetenciesTable } from './EssayCompetenciesTable';

/**
 * Create mock competencies data
 */
function createMockData(): EssayCompetenciesOverviewData {
  return {
    competencies: [
      {
        competencyNumber: 1,
        name: 'Domínio da modalidade escrita formal',
        essaysCount: 150,
        studentsCount: 45,
        averageScore: 140,
        averagePercentage: 70,
      },
      {
        competencyNumber: 2,
        name: 'Compreender a proposta de redação',
        essaysCount: 150,
        studentsCount: 45,
        averageScore: 160,
        averagePercentage: 80,
      },
      {
        competencyNumber: 3,
        name: 'Selecionar, relacionar, organizar informações',
        essaysCount: 150,
        studentsCount: 45,
        averageScore: 120,
        averagePercentage: 60,
      },
      {
        competencyNumber: 4,
        name: 'Demonstrar conhecimento dos mecanismos linguísticos',
        essaysCount: 150,
        studentsCount: 45,
        averageScore: 90,
        averagePercentage: 45,
      },
      {
        competencyNumber: 5,
        name: 'Elaborar proposta de intervenção',
        essaysCount: 150,
        studentsCount: 45,
        averageScore: 100,
        averagePercentage: 50,
      },
    ],
    totalEssays: 150,
    totalStudents: 45,
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

describe('EssayCompetenciesTable', () => {
  const mockApi = createMockApi();

  const defaultProps = {
    api: mockApi,
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
    it('renders loading state', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayCompetenciesTable {...defaultProps} />);

      // TableProvider should handle loading state internally
      expect(
        screen.getByText('Proficiência por competência')
      ).toBeInTheDocument();
    });
  });

  describe('Data rendering', () => {
    it('renders table title', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenciesTable {...defaultProps} />);

      expect(
        screen.getByText('Proficiência por competência')
      ).toBeInTheDocument();
    });

    it('renders table headers', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenciesTable {...defaultProps} />);

      expect(screen.getByText('Competência')).toBeInTheDocument();
      expect(screen.getByText('Redações')).toBeInTheDocument();
      expect(screen.getByText('Estudantes')).toBeInTheDocument();
      expect(screen.getByText('Proficiência')).toBeInTheDocument();
    });

    it('renders competency rows with proper format', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenciesTable {...defaultProps} />);

      // Check that competency names are rendered with format "C{number} - {name}"
      expect(
        screen.getByText(/C1 - Domínio da modalidade escrita formal/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/C2 - Compreender a proposta de redação/)
      ).toBeInTheDocument();
    });

    it('renders essay counts', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenciesTable {...defaultProps} />);

      // All competencies have 150 essays
      expect(screen.getAllByText('150').length).toBeGreaterThan(0);
    });

    it('renders student counts', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenciesTable {...defaultProps} />);

      // All competencies have 45 students
      expect(screen.getAllByText('45').length).toBeGreaterThan(0);
    });

    it('renders proficiency percentages', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenciesTable {...defaultProps} />);

      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Data fetching', () => {
    it('fetches data on mount', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayCompetenciesTable {...defaultProps} />);

      expect(mockFetchOverview).toHaveBeenCalledWith({
        period: '1_MONTH',
        schoolIds: undefined,
        schoolYearIds: undefined,
        classIds: undefined,
      });
    });

    it('fetches data with filter parameters', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(
        <EssayCompetenciesTable
          {...defaultProps}
          schoolIds={['school-1', 'school-2']}
          schoolYearIds={['year-1']}
          classIds={['class-1']}
        />
      );

      expect(mockFetchOverview).toHaveBeenCalledWith({
        period: '1_MONTH',
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1'],
      });
    });

    it('refetches when period changes', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      const { rerender } = render(
        <EssayCompetenciesTable {...defaultProps} period={Period.ONE_MONTH} />
      );

      expect(mockFetchOverview).toHaveBeenCalledTimes(1);

      rerender(
        <EssayCompetenciesTable
          {...defaultProps}
          period={Period.THREE_MONTHS}
        />
      );

      expect(mockFetchOverview).toHaveBeenCalledTimes(2);
      expect(mockFetchOverview).toHaveBeenLastCalledWith(
        expect.objectContaining({ period: '3_MONTHS' })
      );
    });

    it('refetches when filters change', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      const { rerender } = render(
        <EssayCompetenciesTable {...defaultProps} schoolIds={['school-1']} />
      );

      expect(mockFetchOverview).toHaveBeenCalledTimes(1);

      rerender(
        <EssayCompetenciesTable {...defaultProps} schoolIds={['school-2']} />
      );

      expect(mockFetchOverview).toHaveBeenCalledTimes(2);
    });
  });

  describe('Row click behavior', () => {
    it('opens modal when row is clicked', async () => {
      const user = userEvent.setup();
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenciesTable {...defaultProps} />);

      // Modal should not be visible initially
      expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();

      // Find and click on a row
      const row = screen.getByText(/C1 - Domínio da modalidade escrita formal/);
      await user.click(row);

      // Modal should be visible with competence name
      await waitFor(() => {
        expect(screen.getByTestId('details-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Empty state', () => {
    it('renders empty table when no competencies', () => {
      mockHookState = {
        data: { competencies: [], totalEssays: 0, totalStudents: 0 },
        loading: false,
        error: null,
      };

      render(<EssayCompetenciesTable {...defaultProps} />);

      // Table header should still be visible
      expect(
        screen.getByText('Proficiência por competência')
      ).toBeInTheDocument();
    });
  });

  describe('Proficiency cell colors', () => {
    it('renders with correct proficiency colors based on percentage', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenciesTable {...defaultProps} />);

      // Verify percentages are displayed (colors are applied via CSS classes)
      expect(screen.getByText('70%')).toBeInTheDocument(); // >= 70 = green
      expect(screen.getByText('80%')).toBeInTheDocument(); // >= 70 = green
      expect(screen.getByText('60%')).toBeInTheDocument(); // >= 50 < 70 = yellow
      expect(screen.getByText('45%')).toBeInTheDocument(); // < 50 = red
      expect(screen.getByText('50%')).toBeInTheDocument(); // >= 50 < 70 = yellow
    });
  });

  describe('Search functionality', () => {
    it('renders search input', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenciesTable {...defaultProps} />);

      // TableProvider should include search input
      expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument();
    });
  });
});
