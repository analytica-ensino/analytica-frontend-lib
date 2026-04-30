import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { SimulatedStudentDetailsModal } from './SimulatedStudentDetailsModal';
import type {
  SimulatedStudentDetailsModalProps,
  StudentContentsData,
  StudentDetailsData,
  StudentSubjectsData,
} from './types';
import { SimulatedPerformanceTag } from './types';

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
        <div data-testid="modal-content">{children}</div>
      </div>
    ) : null,
}));

jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock('../ProgressBar/ProgressBar', () => ({
  __esModule: true,
  default: ({ value }: { value: number }) => (
    <div data-testid="progress-bar">{value}</div>
  ),
}));

jest.mock('../Badge/Badge', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

jest.mock('../../utils/utils', () => ({
  formatPercentageRounded: (value: number) => `${value}%`,
}));

const mockFetchDetails = jest.fn();
const mockReset = jest.fn();
let mockHookState: {
  data: StudentDetailsData | null;
  loading: boolean;
  error: string | null;
};

jest.mock('./useSimulatedStudentDetails', () => ({
  useSimulatedStudentDetails: () => ({
    ...mockHookState,
    fetchDetails: mockFetchDetails,
    reset: mockReset,
  }),
}));

function createSubjectsData(): StudentSubjectsData {
  return {
    student: {
      studentId: 'student-1',
      institutionId: 'inst-1',
      name: 'Maria Silva',
      school: 'Escola Centro',
      schoolYear: '3 ano',
      class: 'A',
      average: 72,
      performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
    },
    subjects: [
      {
        id: 'subject-1',
        name: 'Matematica',
        color: '#22C55E',
        icon: null,
        questionsCount: 12,
        performance: {
          correct: 9,
          incorrect: 3,
          correctPercentage: 75,
        },
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
  };
}

function createContentsData(): StudentContentsData {
  return {
    student: {
      studentId: 'student-1',
      institutionId: 'inst-1',
      name: 'Maria Silva',
      school: 'Escola Centro',
      schoolYear: '3 ano',
      class: 'A',
      average: 72,
      performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
    },
    subject: {
      id: 'subject-1',
      name: 'Matematica',
    },
    contents: [
      {
        contentId: 'content-1',
        contentName: 'Geometria Plana',
        bnccCode: 'EM13MAT301',
        questionsCount: 4,
        performance: {
          correct: 3,
          incorrect: 1,
          correctPercentage: 75,
        },
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
  };
}

function renderModal(
  overrides: Partial<SimulatedStudentDetailsModalProps> = {}
) {
  const defaultProps: SimulatedStudentDetailsModalProps = {
    api: { post: jest.fn() },
    isOpen: true,
    onClose: jest.fn(),
    simulationType: 'enem-1',
    userInstitutionId: 'user-inst-1',
    studentName: 'Maria Silva',
    period: '1_MONTH',
  };

  return render(
    <SimulatedStudentDetailsModal {...defaultProps} {...overrides} />
  );
}

describe('SimulatedStudentDetailsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHookState = {
      data: null,
      loading: false,
      error: null,
    };
  });

  it('renders loading state', () => {
    mockHookState.loading = true;

    renderModal();

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockHookState.error = 'Erro ao carregar';

    renderModal();

    expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    renderModal();

    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
  });

  it('renders subjects level and fetches subject details on click', () => {
    mockHookState.data = createSubjectsData();

    renderModal();

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('Matematica')).toBeInTheDocument();
    expect(screen.getByText('12 questões')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Matematica'));

    expect(mockFetchDetails).toHaveBeenCalledWith({
      simulationType: 'enem-1',
      userInstitutionId: 'user-inst-1',
      period: '1_MONTH',
      subjectId: 'subject-1',
    });
    expect(
      screen.getByLabelText('Voltar para lista de matérias')
    ).toBeInTheDocument();
  });

  it('renders contents level and empty contents message', () => {
    mockHookState.data = {
      ...createContentsData(),
      contents: [],
    };

    renderModal();

    expect(
      screen.getByText('Nenhuma habilidade encontrada')
    ).toBeInTheDocument();
  });

  it('resets hook state when modal closes', () => {
    mockHookState.data = createSubjectsData();

    const { rerender } = renderModal({ isOpen: true });

    rerender(
      <SimulatedStudentDetailsModal
        api={{ post: jest.fn() }}
        isOpen={false}
        onClose={jest.fn()}
        simulationType="enem-1"
        userInstitutionId="user-inst-1"
        studentName="Maria Silva"
        period="1_MONTH"
      />
    );

    expect(mockReset).toHaveBeenCalled();
  });
});
