import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExamDetailsPage } from './ExamDetailsPage';
import type {
  ExamDetailsData,
  ExamDetailsPagination,
} from '../../types/examDetails';
import { StudentAnswerStatus } from '../../types/examDetails';

// Mock child components
jest.mock('./ExamDetailsHeader', () => ({
  ExamDetailsHeader: ({
    examTitle,
    onBack,
    onDownloadExam,
  }: {
    examTitle: string;
    onBack: () => void;
    onDownloadExam: () => void;
  }) => (
    <div data-testid="exam-details-header">
      <span data-testid="exam-title">{examTitle}</span>
      <button data-testid="back-button" onClick={onBack}>
        Back
      </button>
      <button data-testid="download-exam-button" onClick={onDownloadExam}>
        Download Exam
      </button>
    </div>
  ),
}));

jest.mock('./ExamStatsCards', () => ({
  ExamStatsCards: ({ averageScore }: { averageScore: number }) => (
    <div data-testid="exam-stats-cards">
      <span data-testid="average-score">{averageScore}</span>
    </div>
  ),
}));

jest.mock('./ExamStudentsTable', () => ({
  ExamStudentsTable: ({
    onDownloadAnswerSheet,
    onViewAnswers,
    onDownloadAllAnswerSheets,
    onParamsChange,
    loadingStudentId,
    batchLoading,
  }: {
    onDownloadAnswerSheet: (id: string) => void;
    onViewAnswers: (id: string) => void;
    onDownloadAllAnswerSheets: () => void;
    onParamsChange: (params: { page?: number }) => void;
    loadingStudentId: string | null;
    batchLoading: boolean;
  }) => (
    <div data-testid="exam-students-table">
      <button
        data-testid="download-answer-sheet-btn"
        onClick={() => onDownloadAnswerSheet('student-1')}
      >
        Download Answer Sheet
      </button>
      <button
        data-testid="view-answers-btn"
        onClick={() => onViewAnswers('student-1')}
      >
        View Answers
      </button>
      <button
        data-testid="download-all-btn"
        onClick={onDownloadAllAnswerSheets}
      >
        Download All
      </button>
      <button
        data-testid="change-page-btn"
        onClick={() => onParamsChange({ page: 2 })}
      >
        Change Page
      </button>
      <span data-testid="loading-student-id">{loadingStudentId || 'none'}</span>
      <span data-testid="batch-loading">{batchLoading.toString()}</span>
    </div>
  ),
}));

jest.mock('../ExamPageLayout/GabaritoPreview', () => ({
  GabaritoPreview: ({
    nomeAluno,
    onComplete,
  }: {
    nomeAluno: string;
    onComplete?: () => void;
  }) => (
    <div data-testid="gabarito-preview">
      <span data-testid="gabarito-nome">{nomeAluno}</span>
      <button data-testid="complete-preview" onClick={onComplete}>
        Complete
      </button>
    </div>
  ),
}));

jest.mock('../ExamPageLayout/GabaritosBatchPreview', () => ({
  GabaritosBatchPreview: ({
    gabaritos,
    onComplete,
  }: {
    gabaritos: { nomeAluno: string }[];
    onComplete?: () => void;
  }) => (
    <div data-testid="gabaritos-batch-preview">
      <span data-testid="batch-count">{gabaritos.length}</span>
      <button data-testid="complete-batch-preview" onClick={onComplete}>
        Complete Batch
      </button>
    </div>
  ),
  GabaritoData: {},
}));

jest.mock('../CorrectActivityModal/CorrectActivityModal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    onViewScannedAnswerSheet,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onViewScannedAnswerSheet?: () => void;
  }) =>
    isOpen ? (
      <div data-testid="correction-modal">
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
        <button
          data-testid="view-scanned-btn"
          onClick={onViewScannedAnswerSheet}
        >
          View Scanned
        </button>
      </div>
    ) : null,
}));

const mockHandlePrintExam = jest.fn();
jest.mock('../QuestionsPdfGenerator/QuestionsPdfGenerator', () => ({
  useQuestionsPdfPrint: () => ({
    contentRef: { current: document.createElement('div') },
    handlePrint: mockHandlePrintExam,
  }),
  QuestionsPdfContent: () => <div data-testid="questions-pdf-content" />,
}));

jest.mock('../../hooks/useQuestionsList', () => ({
  createUseQuestionsList: () => () => ({
    fetchQuestionsByIds: jest.fn().mockResolvedValue([]),
  }),
}));

jest.mock('../Skeleton/Skeleton', () => ({
  SkeletonCard: ({ className }: { className: string }) => (
    <div data-testid="skeleton-card" className={className} />
  ),
}));

// Mock globalThis.open
const mockOpen = jest.fn();
Object.defineProperty(globalThis, 'open', {
  value: mockOpen,
  writable: true,
});

describe('ExamDetailsPage', () => {
  const mockApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const mockExamData: ExamDetailsData = {
    id: 'exam-123',
    title: 'Prova de Matemática',
    startDate: '01/01/2024',
    school: 'Escola Municipal',
    className: '3º Ano A',
    createdAt: '01/01/2024',
    stats: {
      averageScore: 7.5,
      mostCorrectQuestions: [1, 3],
      mostIncorrectQuestions: [2],
      unansweredQuestions: [5],
    },
    students: [
      {
        id: 'student-1',
        studentId: 'student-1',
        studentName: 'João Silva',
        status: StudentAnswerStatus.GABARITO_RECEBIDO,
        answerReceivedAt: '01 Jan 2024',
        score: 8.5,
      },
    ],
  };

  const mockPagination: ExamDetailsPagination = {
    total: 10,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const defaultProps = {
    examId: 'exam-123',
    institutionId: 'inst-123',
    apiClient: mockApiClient,
    examData: mockExamData,
    loading: false,
    error: null,
    pagination: mockPagination,
    fetchExamDetails: jest.fn(),
    onBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows skeleton on initial load when examId is empty', () => {
      // When examId is empty, the effect doesn't run and isInitialLoad stays true
      render(
        <ExamDetailsPage
          {...defaultProps}
          examId=""
          loading={true}
          examData={null}
        />
      );
      expect(screen.getAllByTestId('skeleton-card')).toHaveLength(3);
    });

    it('does not show skeleton when examId is provided (effect sets isInitialLoad to false)', () => {
      render(
        <ExamDetailsPage {...defaultProps} loading={true} examData={null} />
      );
      // When examId is provided, the effect runs and sets isInitialLoad to false
      // So it falls through to the error state
      expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
    });

    it('does not show skeleton after data is loaded', () => {
      render(
        <ExamDetailsPage
          {...defaultProps}
          loading={false}
          examData={mockExamData}
        />
      );
      expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message when error is present', () => {
      render(
        <ExamDetailsPage
          {...defaultProps}
          error="Failed to load exam"
          examData={null}
        />
      );
      expect(screen.getByText('Failed to load exam')).toBeInTheDocument();
    });

    it('shows default error when examData is null', () => {
      render(<ExamDetailsPage {...defaultProps} examData={null} />);
      expect(screen.getByText('Prova não encontrada')).toBeInTheDocument();
    });

    it('shows back link in error state', () => {
      render(
        <ExamDetailsPage {...defaultProps} error="Error" examData={null} />
      );
      expect(screen.getByText('Voltar para provas')).toBeInTheDocument();
    });

    it('calls onBack when back link clicked in error state', () => {
      render(
        <ExamDetailsPage {...defaultProps} error="Error" examData={null} />
      );
      fireEvent.click(screen.getByText('Voltar para provas'));
      expect(defaultProps.onBack).toHaveBeenCalled();
    });
  });

  describe('successful render', () => {
    it('renders header with exam title', () => {
      render(<ExamDetailsPage {...defaultProps} />);
      expect(screen.getByTestId('exam-title')).toHaveTextContent(
        'Prova de Matemática'
      );
    });

    it('renders stats cards', () => {
      render(<ExamDetailsPage {...defaultProps} />);
      expect(screen.getByTestId('exam-stats-cards')).toBeInTheDocument();
      expect(screen.getByTestId('average-score')).toHaveTextContent('7.5');
    });

    it('renders students table', () => {
      render(<ExamDetailsPage {...defaultProps} />);
      expect(screen.getByTestId('exam-students-table')).toBeInTheDocument();
    });
  });

  describe('fetchExamDetails', () => {
    it('fetches exam details on mount', () => {
      render(<ExamDetailsPage {...defaultProps} />);
      expect(defaultProps.fetchExamDetails).toHaveBeenCalledWith('exam-123', {
        page: 1,
        limit: 10,
      });
    });

    it('refetches when page changes', async () => {
      render(<ExamDetailsPage {...defaultProps} />);

      fireEvent.click(screen.getByTestId('change-page-btn'));

      await waitFor(() => {
        expect(defaultProps.fetchExamDetails).toHaveBeenCalledWith('exam-123', {
          page: 2,
          limit: 10,
        });
      });
    });

    it('uses custom studentsPerPage', () => {
      render(<ExamDetailsPage {...defaultProps} studentsPerPage={20} />);
      expect(defaultProps.fetchExamDetails).toHaveBeenCalledWith('exam-123', {
        page: 1,
        limit: 20,
      });
    });
  });

  describe('onBack', () => {
    it('calls onBack when back button clicked', () => {
      render(<ExamDetailsPage {...defaultProps} />);
      fireEvent.click(screen.getByTestId('back-button'));
      expect(defaultProps.onBack).toHaveBeenCalled();
    });
  });

  describe('download answer sheet', () => {
    it('calls API and shows gabarito preview', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            student: { id: 'student-1', name: 'João Silva' },
            activity: { id: 'exam-123', title: 'Prova', totalQuestions: 50 },
            qrCodeUrl: 'https://example.com/qr',
            schoolClass: 'Escola A - Turma 1',
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-answer-sheet-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('gabarito-preview')).toBeInTheDocument();
        expect(screen.getByTestId('gabarito-nome')).toHaveTextContent(
          'João Silva'
        );
      });
    });

    it('handles API error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockApiClient.get.mockRejectedValueOnce(new Error('API Error'));

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-answer-sheet-btn'));
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('handles schoolClass without separator', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            student: { id: 'student-1', name: 'Test' },
            activity: { id: 'exam-123', title: 'Prova', totalQuestions: 10 },
            qrCodeUrl: 'https://example.com/qr',
            schoolClass: null,
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-answer-sheet-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('gabarito-preview')).toBeInTheDocument();
      });
    });

    it('clears gabarito preview on complete', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            student: { id: 'student-1', name: 'Test' },
            activity: { id: 'exam-123', title: 'Prova', totalQuestions: 10 },
            qrCodeUrl: 'https://example.com/qr',
            schoolClass: null,
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-answer-sheet-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('gabarito-preview')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('complete-preview'));

      await waitFor(() => {
        expect(
          screen.queryByTestId('gabarito-preview')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('download all answer sheets', () => {
    it('calls API and shows batch preview', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            exam: { id: 'exam-123', title: 'Prova', totalQuestions: 50 },
            students: [
              {
                student: { id: 's1', name: 'Student 1' },
                qrCodeUrl: 'https://example.com/qr1',
                schoolClass: 'Escola - Turma',
              },
              {
                student: { id: 's2', name: 'Student 2' },
                qrCodeUrl: 'https://example.com/qr2',
                schoolClass: null,
              },
            ],
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-all-btn'));
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('gabaritos-batch-preview')
        ).toBeInTheDocument();
        expect(screen.getByTestId('batch-count')).toHaveTextContent('2');
      });
    });

    it('handles API error on batch download', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockApiClient.get.mockRejectedValueOnce(new Error('API Error'));

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-all-btn'));
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('clears batch preview on complete', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            exam: { id: 'exam-123', title: 'Prova', totalQuestions: 10 },
            students: [
              {
                student: { id: 's1', name: 'Student 1' },
                qrCodeUrl: 'https://example.com/qr1',
                schoolClass: null,
              },
            ],
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-all-btn'));
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('gabaritos-batch-preview')
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('complete-batch-preview'));

      await waitFor(() => {
        expect(
          screen.queryByTestId('gabaritos-batch-preview')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('view answers / correction modal', () => {
    it('opens correction modal on view answers', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            studentId: 'student-1',
            studentName: 'João Silva',
            observation: 'Good work',
            attachment: null,
            answerSheetImageUrl: 'https://example.com/image.jpg',
            answers: [],
            statistics: {},
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('view-answers-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('correction-modal')).toBeInTheDocument();
      });
    });

    it('closes correction modal', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            studentId: 'student-1',
            studentName: 'João Silva',
            observation: null,
            attachment: null,
            answerSheetImageUrl: null,
            answers: [],
            statistics: {},
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('view-answers-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('correction-modal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('close-modal'));

      await waitFor(() => {
        expect(
          screen.queryByTestId('correction-modal')
        ).not.toBeInTheDocument();
      });
    });

    it('opens scanned answer sheet in new tab', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            studentId: 'student-1',
            studentName: 'João Silva',
            observation: null,
            attachment: null,
            answerSheetImageUrl: 'https://example.com/scan.jpg',
            answers: [],
            statistics: {},
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('view-answers-btn'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('correction-modal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('view-scanned-btn'));

      expect(mockOpen).toHaveBeenCalledWith(
        'https://example.com/scan.jpg',
        '_blank'
      );
    });

    it('handles API error on view answers', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockApiClient.get.mockRejectedValueOnce(new Error('API Error'));

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('view-answers-btn'));
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('download exam PDF', () => {
    it('fetches questions from quiz endpoint', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            questions: [
              {
                id: 'q1',
                questionType: 'MULTIPLE_CHOICE',
                statement: 'Question 1',
                options: [
                  { id: 'o1', option: 'A', isCorrect: true },
                  { id: 'o2', option: 'B', isCorrect: false },
                ],
              },
            ],
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-exam-button'));
      });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/activities/exam-123/quiz'
        );
      });
    });

    it('falls back to activity endpoint when quiz fails', async () => {
      mockApiClient.get
        .mockRejectedValueOnce(new Error('Quiz not found'))
        .mockResolvedValueOnce({
          data: {
            data: {
              questionIds: ['q1', 'q2'],
            },
          },
        });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-exam-button'));
      });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith('/activities/exam-123');
      });
    });

    it('logs error when no questions found', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            questions: [],
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-exam-button'));
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Nenhuma questão encontrada para esta prova'
        );
      });

      consoleError.mockRestore();
    });

    it('handles error in exam download', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockApiClient.get
        .mockRejectedValueOnce(new Error('Quiz error'))
        .mockRejectedValueOnce(new Error('Activity error'));

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-exam-button'));
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('fetches questions by IDs when quiz returns questionIds', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            questionIds: ['q1', 'q2'],
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-exam-button'));
      });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/activities/exam-123/quiz'
        );
      });
    });

    it('uses questions from activity fallback when available', async () => {
      mockApiClient.get
        .mockRejectedValueOnce(new Error('Quiz not found'))
        .mockResolvedValueOnce({
          data: {
            data: {
              questions: [
                {
                  id: 'q1',
                  questionType: 'MULTIPLE_CHOICE',
                  statement: 'Question 1',
                  options: [{ id: 'o1', option: 'A', isCorrect: true }],
                },
              ],
            },
          },
        });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-exam-button'));
      });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith('/activities/exam-123');
      });
    });

    it('triggers print after questions are loaded', async () => {
      jest.useFakeTimers();
      mockHandlePrintExam.mockClear();

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            questions: [
              {
                id: 'q1',
                questionType: 'MULTIPLE_CHOICE',
                statement: 'Question 1',
                options: [{ id: 'o1', option: 'A', isCorrect: true }],
              },
            ],
          },
        },
      });

      render(<ExamDetailsPage {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-exam-button'));
      });

      // Advance timers to trigger the print timeout
      await act(async () => {
        jest.advanceTimersByTime(150);
      });

      expect(mockHandlePrintExam).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('edge cases', () => {
    it('does not fetch if examId is empty', () => {
      render(<ExamDetailsPage {...defaultProps} examId="" />);
      expect(defaultProps.fetchExamDetails).not.toHaveBeenCalled();
    });

    it('does not download answer sheet if examId is empty', async () => {
      render(<ExamDetailsPage {...defaultProps} examId="" examData={null} />);
      // Component should show error state, no download button available
      expect(
        screen.queryByTestId('download-answer-sheet-btn')
      ).not.toBeInTheDocument();
    });
  });
});
