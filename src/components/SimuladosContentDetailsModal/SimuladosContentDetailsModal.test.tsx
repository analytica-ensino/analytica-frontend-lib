import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { SimuladosContentDetailsModal } from './SimuladosContentDetailsModal';
import type { ContentDetailsApiClient, ContentDetailsData } from './types';

jest.mock('../Modal/Modal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    title,
    children,
  }: {
    isOpen: boolean;
    title: React.ReactNode;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div>{children}</div>
      </div>
    ) : null,
}));

jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
}));

jest.mock('../ProgressBar/ProgressBar', () => ({
  __esModule: true,
  default: ({ value }: { value: number }) => (
    <div data-testid="progress-bar">{value}</div>
  ),
}));

jest.mock('../Skeleton/Skeleton', () => ({
  SkeletonRounded: ({ className }: { className?: string }) => (
    <div data-testid="skeleton-rounded" className={className} />
  ),
}));

jest.mock('../TableProvider', () => ({
  TableProvider: ({
    data,
    onParamsChange,
  }: {
    data: Array<Record<string, unknown>>;
    onParamsChange?: (params: { page: number; limit: number }) => void;
  }) => (
    <div data-testid="table-provider">
      <span data-testid="table-rows">{data.length}</span>
      <button
        type="button"
        onClick={() => onParamsChange?.({ page: 2, limit: 20 })}
      >
        change-params
      </button>
    </div>
  ),
}));

jest.mock('../../utils/utils', () => ({
  formatPercentageRounded: (value: number) => `${Math.round(value)}%`,
}));

const mockFetchDetails = jest.fn();
const mockReset = jest.fn();
let mockHookState: {
  data: ContentDetailsData | null;
  loading: boolean;
  error: string | null;
};

jest.mock('./useSimulatedContentDetails', () => ({
  useSimulatedContentDetails: () => ({
    ...mockHookState,
    fetchDetails: mockFetchDetails,
    reset: mockReset,
  }),
}));

function createMockApi(): ContentDetailsApiClient {
  return {
    post: jest.fn(),
  };
}

function createMockData(): ContentDetailsData {
  return {
    content: {
      id: 'content-1',
      name: 'Leitura e interpretação',
      bnccCode: 'BNCC-001',
      subject: { id: 'sub-1', name: 'Linguagens' },
      questionsCount: 18,
      studentsCount: 12,
    },
    counters: {
      aboveAverage: 4,
      atAverage: 5,
      belowAverage: 3,
    },
    students: {
      data: [
        {
          studentId: 's1',
          institutionId: 'i1',
          userInstitutionId: 'u1',
          name: 'Aluno 1',
          school: 'Escola A',
          schoolYear: '1',
          class: 'A',
          average: 70,
          performance: 70,
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
    },
  };
}

describe('SimuladosContentDetailsModal', () => {
  const mockApi = createMockApi();
  const baseProps = {
    api: mockApi,
    isOpen: true,
    onClose: jest.fn(),
    activityFilters: { types: ['SIMULADO'] },
    contentId: 'content-1',
    contentName: 'Fallback content name',
    period: '1_MONTH',
    filters: {
      schoolIds: ['school-1'],
      schoolYearIds: ['year-1'],
      classIds: ['class-1'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHookState = {
      data: null,
      loading: false,
      error: null,
    };
  });

  it('fetches details on open with default pagination', () => {
    render(<SimuladosContentDetailsModal {...baseProps} />);

    expect(mockFetchDetails).toHaveBeenCalledWith({
      activityFilters: { types: ['SIMULADO'] },
      contentId: 'content-1',
      period: '1_MONTH',
      schoolIds: ['school-1'],
      schoolYearIds: ['year-1'],
      classIds: ['class-1'],
      page: 1,
      limit: 10,
    });
  });

  it('resets state when modal is closed', () => {
    render(<SimuladosContentDetailsModal {...baseProps} isOpen={false} />);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('renders loading skeleton when loading and no data', () => {
    mockHookState = { data: null, loading: true, error: null };

    render(<SimuladosContentDetailsModal {...baseProps} />);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton-rounded').length).toBeGreaterThan(0);
  });

  it('renders error state', () => {
    mockHookState = { data: null, loading: false, error: 'Erro ao carregar' };

    render(<SimuladosContentDetailsModal {...baseProps} />);

    expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<SimuladosContentDetailsModal {...baseProps} />);

    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
  });

  it('renders data state with header, counters and table', () => {
    mockHookState = { data: createMockData(), loading: false, error: null };

    render(<SimuladosContentDetailsModal {...baseProps} />);

    expect(screen.getByText('Leitura e interpretação')).toBeInTheDocument();
    expect(screen.getByText('BNCC-001')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByTestId('table-provider')).toBeInTheDocument();
    expect(screen.getByTestId('table-rows')).toHaveTextContent('1');
  });

  it('uses fallback contentName when API content name is empty', () => {
    const data = createMockData();
    data.content.name = '';
    mockHookState = { data, loading: false, error: null };

    render(<SimuladosContentDetailsModal {...baseProps} />);

    expect(screen.getByText('Fallback content name')).toBeInTheDocument();
  });

  it('refetches with new params when table pagination changes', () => {
    mockHookState = { data: createMockData(), loading: false, error: null };

    render(<SimuladosContentDetailsModal {...baseProps} />);
    fireEvent.click(screen.getByText('change-params'));

    expect(mockFetchDetails).toHaveBeenCalledWith({
      activityFilters: { types: ['SIMULADO'] },
      contentId: 'content-1',
      period: '1_MONTH',
      schoolIds: ['school-1'],
      schoolYearIds: ['year-1'],
      classIds: ['class-1'],
      page: 2,
      limit: 20,
    });
  });
});
