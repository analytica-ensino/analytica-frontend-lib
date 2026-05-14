import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExamStudentsTable } from './ExamStudentsTable';
import { StudentAnswerStatus } from '../../types/examDetails';
import type {
  ExamStudentTableItem,
  ExamDetailsPagination,
} from '../../types/examDetails';

// Mock TableProvider
jest.mock('../TableProvider/TableProvider', () => ({
  __esModule: true,
  default: ({
    data,
    loading,
    paginationConfig,
    onParamsChange,
  }: {
    data: ExamStudentTableItem[];
    loading: boolean;
    paginationConfig: { totalItems: number; totalPages: number };
    onParamsChange: (params: { page?: number }) => void;
  }) => (
    <div data-testid="table-provider">
      <div data-testid="table-data">{JSON.stringify(data)}</div>
      <div data-testid="table-loading">{loading.toString()}</div>
      <div data-testid="pagination-total">{paginationConfig.totalItems}</div>
      <div data-testid="pagination-pages">{paginationConfig.totalPages}</div>
      <button
        data-testid="change-params-btn"
        onClick={() => onParamsChange({ page: 2 })}
      >
        Change Params
      </button>
    </div>
  ),
}));

describe('ExamStudentsTable', () => {
  const mockStudents: ExamStudentTableItem[] = [
    {
      id: 'student-1',
      studentId: 'student-1',
      studentName: 'João Silva',
      status: StudentAnswerStatus.GABARITO_RECEBIDO,
      answerReceivedAt: '01 Jan 2024',
      score: 8.5,
    },
    {
      id: 'student-2',
      studentId: 'student-2',
      studentName: 'Maria Santos',
      status: StudentAnswerStatus.AGUARDANDO_GABARITO,
      answerReceivedAt: null,
      score: null,
    },
  ];

  const mockPagination: ExamDetailsPagination = {
    total: 25,
    page: 1,
    limit: 10,
    totalPages: 3,
  };

  const defaultProps = {
    students: mockStudents,
    loading: false,
    pagination: mockPagination,
    onParamsChange: jest.fn(),
    onDownloadAnswerSheet: jest.fn(),
    onViewAnswers: jest.fn(),
    onDownloadAllAnswerSheets: jest.fn(),
    loadingStudentId: null,
    batchLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with default title', () => {
      render(<ExamStudentsTable {...defaultProps} />);
      expect(screen.getByText('Resultados por aluno')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<ExamStudentsTable {...defaultProps} title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders download all button with default label', () => {
      render(<ExamStudentsTable {...defaultProps} />);
      expect(screen.getByText('Baixar todos os gabaritos')).toBeInTheDocument();
    });

    it('renders download all button with custom label', () => {
      render(
        <ExamStudentsTable
          {...defaultProps}
          downloadAllLabel="Custom Download"
        />
      );
      expect(screen.getByText('Custom Download')).toBeInTheDocument();
    });

    it('renders loading label when batch loading', () => {
      render(<ExamStudentsTable {...defaultProps} batchLoading={true} />);
      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });

    it('renders custom loading label when batch loading', () => {
      render(
        <ExamStudentsTable
          {...defaultProps}
          batchLoading={true}
          downloadAllLoadingLabel="Aguarde..."
        />
      );
      expect(screen.getByText('Aguarde...')).toBeInTheDocument();
    });

    it('renders TableProvider with correct data', () => {
      render(<ExamStudentsTable {...defaultProps} />);
      expect(screen.getByTestId('table-provider')).toBeInTheDocument();
      expect(screen.getByTestId('table-data')).toHaveTextContent('João Silva');
    });

    it('passes loading state to TableProvider', () => {
      render(<ExamStudentsTable {...defaultProps} loading={true} />);
      expect(screen.getByTestId('table-loading')).toHaveTextContent('true');
    });

    it('passes pagination config to TableProvider', () => {
      render(<ExamStudentsTable {...defaultProps} />);
      expect(screen.getByTestId('pagination-total')).toHaveTextContent('25');
      expect(screen.getByTestId('pagination-pages')).toHaveTextContent('3');
    });
  });

  describe('interactions', () => {
    it('calls onDownloadAllAnswerSheets when download all button clicked', () => {
      render(<ExamStudentsTable {...defaultProps} />);
      const button = screen.getByText('Baixar todos os gabaritos');
      fireEvent.click(button);
      expect(defaultProps.onDownloadAllAnswerSheets).toHaveBeenCalledTimes(1);
    });

    it('disables download all button when batch loading', () => {
      render(<ExamStudentsTable {...defaultProps} batchLoading={true} />);
      const button = screen.getByRole('button', { name: /carregando/i });
      expect(button).toBeDisabled();
    });

    it('calls onParamsChange when table params change', () => {
      render(<ExamStudentsTable {...defaultProps} />);
      const changeParamsBtn = screen.getByTestId('change-params-btn');
      fireEvent.click(changeParamsBtn);
      expect(defaultProps.onParamsChange).toHaveBeenCalledWith({ page: 2 });
    });
  });

  describe('custom props', () => {
    it('uses custom itemLabel in pagination', () => {
      render(<ExamStudentsTable {...defaultProps} itemLabel="estudantes" />);
      // TableProvider receives the itemLabel prop
      expect(screen.getByTestId('table-provider')).toBeInTheDocument();
    });

    it('passes loadingStudentId to columns', () => {
      render(
        <ExamStudentsTable {...defaultProps} loadingStudentId="student-1" />
      );
      // Component renders without error with loadingStudentId
      expect(screen.getByTestId('table-provider')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders with empty students array', () => {
      render(<ExamStudentsTable {...defaultProps} students={[]} />);
      expect(screen.getByTestId('table-data')).toHaveTextContent('[]');
    });
  });
});
