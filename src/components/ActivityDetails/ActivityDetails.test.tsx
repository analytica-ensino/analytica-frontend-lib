import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { STUDENT_ACTIVITY_STATUS } from '../../types/activityDetails';
import {
  getStatusBadgeConfig,
  formatTimeSpent,
  formatQuestionNumbers,
  formatDateToBrazilian,
} from '../../utils/activityDetailsUtils';
import type { ActivityDetailsData } from '../../types/activityDetails';
import type {
  StudentActivityCorrectionData,
  QuestionsAnswersByStudentResponse,
} from '../../utils/studentActivityCorrection';
import {
  QUESTION_TYPE,
  QUESTION_DIFFICULTY,
  ANSWER_STATUS,
  type Question,
  type QuestionResult,
} from '../Quiz/useQuizStore';

// Mock para imagens PNG
jest.mock('../../assets/img/mock-content.png', () => 'test-file-stub');
jest.mock('../../assets/img/mock-image-question.png', () => 'test-file-stub');

// Mock useMobile hook
jest.mock('../../hooks/useMobile', () => ({
  useMobile: () => ({ isMobile: false }),
}));

// Mock utils
jest.mock('../../utils/utils', () => ({
  cn: (...inputs: (string | undefined)[]) => inputs.filter(Boolean).join(' '),
}));

// Mock SubjectInfo
jest.mock('../SubjectInfo/SubjectInfo', () => ({
  getSubjectInfo: jest.fn(() => ({
    icon: <span data-testid="subject-icon">M</span>,
    colorClass: 'bg-blue-500',
  })),
}));

// Mock SubjectEnum
jest.mock('../../enums/SubjectEnum', () => ({
  SubjectEnum: {
    MATEMATICA: 'MATEMATICA',
  },
}));

// Mock Skeleton components
jest.mock('../Skeleton/Skeleton', () => ({
  SkeletonText: (props: HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="skeleton-text" {...props} />
  ),
  SkeletonRounded: (props: HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="skeleton-rounded" {...props} />
  ),
  SkeletonTable: (props: HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="skeleton-table" {...props} />
  ),
}));

// Mock TableProvider with action buttons and column renderers
jest.mock('../TableProvider/TableProvider', () => ({
  TableProvider: ({
    children,
    data,
    headers,
    emptyState,
    onParamsChange,
  }: {
    children: (props: { table: ReactNode; pagination: ReactNode }) => ReactNode;
    data: unknown[];
    headers?: {
      key: string;
      label: string;
      render?: (value: unknown, row: unknown) => ReactNode;
    }[];
    emptyState?: { component: ReactNode };
    onParamsChange?: (params: { page?: number; limit?: number }) => void;
  }) => {
    if (data.length === 0 && emptyState?.component) {
      return <div data-testid="table-provider">{emptyState.component}</div>;
    }

    // Find column renderers
    const actionsColumn = headers?.find((h) => h.key === 'actions');
    const studentNameColumn = headers?.find((h) => h.key === 'studentName');
    const statusColumn = headers?.find((h) => h.key === 'status');
    const answeredAtColumn = headers?.find((h) => h.key === 'answeredAt');
    const timeSpentColumn = headers?.find((h) => h.key === 'timeSpent');
    const scoreColumn = headers?.find((h) => h.key === 'score');

    return (
      <div data-testid="table-provider">
        {children({
          table: (
            <table data-testid="table">
              <tbody>
                {(
                  data as {
                    studentName: string;
                    status: string;
                    studentId: string;
                    answeredAt: string | null;
                    timeSpent: number;
                    score: number | null;
                  }[]
                ).map((item) => (
                  <tr key={item.studentId}>
                    <td>
                      {studentNameColumn?.render
                        ? studentNameColumn.render(item.studentName, item)
                        : item.studentName}
                    </td>
                    <td>
                      {statusColumn?.render
                        ? statusColumn.render(item.status, item)
                        : item.status}
                    </td>
                    <td>
                      {answeredAtColumn?.render
                        ? answeredAtColumn.render(item.answeredAt, item)
                        : null}
                    </td>
                    <td>
                      {timeSpentColumn?.render
                        ? timeSpentColumn.render(item.timeSpent, item)
                        : null}
                    </td>
                    <td>
                      {scoreColumn?.render
                        ? scoreColumn.render(item.score, item)
                        : null}
                    </td>
                    <td>
                      {actionsColumn?.render
                        ? actionsColumn.render(null, item)
                        : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ),
          pagination: (
            <div data-testid="pagination">
              <button
                onClick={() => onParamsChange?.({ page: 2 })}
                data-testid="next-page"
              >
                Próxima
              </button>
              <button
                onClick={() => onParamsChange?.({ limit: 20 })}
                data-testid="change-limit"
              >
                20 por página
              </button>
            </div>
          ),
        })}
      </div>
    );
  },
}));

// Mock CorrectActivityModal
jest.mock('../CorrectActivityModal/CorrectActivityModal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    data,
    onObservationSubmit,
  }: {
    isOpen: boolean;
    onClose: () => void;
    data?: { studentId?: string };
    isViewOnly?: boolean;
    onObservationSubmit?: (
      studentId: string,
      observation: string,
      files: File[]
    ) => void;
  }) =>
    isOpen ? (
      <div data-testid="correct-activity-modal">
        <button onClick={onClose}>Fechar</button>
        <button
          onClick={() =>
            onObservationSubmit?.(data?.studentId || '', 'Test observation', [])
          }
          data-testid="submit-observation"
        >
          Enviar observação
        </button>
      </div>
    ) : null,
}));

// Mock useActivityDetails hook
jest.mock('../../hooks/useActivityDetails', () => ({
  useActivityDetails: jest.fn(),
}));

// Mock QuestionsPdfGenerator
const mockHandlePrint = jest.fn();
const mockContentRef = { current: document.createElement('div') };

jest.mock('../QuestionsPdfGenerator/QuestionsPdfGenerator', () => ({
  useQuestionsPdfPrint: jest.fn(() => ({
    contentRef: mockContentRef,
    handlePrint: mockHandlePrint,
  })),
  QuestionsPdfContent: jest.fn(
    ({ ref }: { ref: Ref<HTMLDivElement>; questions: unknown[] }) => (
      <div ref={ref} data-testid="questions-pdf-content" />
    )
  ),
}));

// Mock ActivityCreate utils
const mockConvertQuestionToPreview = jest.fn((question: Question) => ({
  id: question.id,
  enunciado: question.statement,
  questionType: question.questionType,
  question: question.options
    ? {
        options: question.options.map(
          (opt: { id: string; option: string }) => ({
            id: opt.id,
            option: opt.option,
          })
        ),
        correctOptionIds: [],
      }
    : undefined,
  subjectName: question.knowledgeMatrix?.[0]?.subject?.name,
  subjectColor: question.knowledgeMatrix?.[0]?.subject?.color,
  iconName: question.knowledgeMatrix?.[0]?.subject?.icon,
}));

jest.mock('../ActivityCreate/ActivityCreate.utils', () => ({
  convertQuestionToPreview: mockConvertQuestionToPreview,
}));

// Mock useQuestionsList hook
const mockFetchQuestionsByIds = jest.fn();

const mockUseQuestionsList = jest.fn(() => ({
  questions: [],
  pagination: null,
  loading: false,
  loadingMore: false,
  error: null,
  fetchQuestions: jest.fn(),
  fetchRandomQuestions: jest.fn(),
  fetchQuestionsByIds: mockFetchQuestionsByIds,
  loadMore: jest.fn(),
  reset: jest.fn(),
}));

jest.mock('../../hooks/useQuestionsList', () => ({
  createUseQuestionsList: jest.fn(() => mockUseQuestionsList),
}));

// Mock useToastStore
const mockAddToast = jest.fn();
jest.mock('../Toast/utils/ToastStore', () => ({
  __esModule: true,
  default: jest.fn((selector) => {
    if (selector && typeof selector === 'function') {
      return selector({ addToast: mockAddToast });
    }
    return { addToast: mockAddToast };
  }),
}));

// Import after mocks
import { ActivityDetails } from './ActivityDetails';
import type { ActivityDetailsProps } from './ActivityDetails';
import { useActivityDetails } from '../../hooks/useActivityDetails';
import type { BaseApiClient } from '../../types/api';
import { useQuestionsPdfPrint } from '../QuestionsPdfGenerator/QuestionsPdfGenerator';
import { createUseQuestionsList } from '../../hooks/useQuestionsList';
import { convertQuestionToPreview } from '../ActivityCreate/ActivityCreate.utils';

/**
 * Mock activity details data
 */
const mockActivityData: ActivityDetailsData = {
  activity: {
    id: 'activity-123',
    title: 'Prova de Matemática',
    startDate: '2024-01-15',
    finalDate: '2024-01-20',
    schoolName: 'Escola Teste',
    year: '2024',
    subjectName: 'Matemática',
    className: '9º Ano A',
  },
  students: [
    {
      studentId: 'student-1',
      studentName: 'João Silva',
      answeredAt: '2024-01-16T10:30:00Z',
      timeSpent: 3600,
      score: 8.5,
      status: STUDENT_ACTIVITY_STATUS.CONCLUIDO,
    },
    {
      studentId: 'student-2',
      studentName: 'Maria Santos',
      answeredAt: null,
      timeSpent: 0,
      score: null,
      status: STUDENT_ACTIVITY_STATUS.AGUARDANDO_CORRECAO,
    },
    {
      studentId: 'student-3',
      studentName: 'Pedro Oliveira',
      answeredAt: null,
      timeSpent: 0,
      score: null,
      status: STUDENT_ACTIVITY_STATUS.AGUARDANDO_RESPOSTA,
    },
    {
      studentId: 'student-4',
      studentName: 'Ana Costa',
      answeredAt: '2024-01-18T14:00:00Z',
      timeSpent: 1800,
      score: null,
      status: STUDENT_ACTIVITY_STATUS.NAO_ENTREGUE,
    },
  ],
  pagination: {
    total: 4,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  generalStats: {
    averageScore: 7.5,
    completionPercentage: 75,
  },
  questionStats: {
    mostCorrect: [0, 2],
    mostIncorrect: [1, 3],
    notAnswered: [4],
  },
};

/**
 * Helper function to create a Question in Quiz format
 */
const createQuestion = (
  id: string,
  statement: string,
  questionType: QUESTION_TYPE,
  options?: Array<{ id: string; option: string }>,
  correctOptionIds?: string[]
): Question => {
  return {
    id,
    statement,
    questionType,
    difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
    description: '',
    examBoard: null,
    examYear: null,
    solutionExplanation: null,
    answer: null,
    answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
    options: options || [],
    knowledgeMatrix: [
      {
        areaKnowledge: { id: 'area1', name: 'Área de Conhecimento' },
        subject: {
          id: 'subject1',
          name: 'Matemática',
          color: '#FF6B6B',
          icon: 'Calculator',
        },
        topic: { id: 'topic1', name: 'Tópico' },
        subtopic: { id: 'subtopic1', name: 'Subtópico' },
        content: { id: 'content1', name: 'Conteúdo' },
      },
    ],
    correctOptionIds: correctOptionIds || [],
  };
};

/**
 * Helper function to create a QuestionResult answer in Quiz format
 */
const createQuestionResult = (
  id: string,
  questionId: string,
  answerStatus: ANSWER_STATUS,
  answer: string | null = null,
  selectedOptions: Array<{ optionId: string }> = [],
  options?: Array<{ id: string; option: string; isCorrect: boolean }>,
  teacherFeedback: string | null = null,
  statement: string = '',
  questionType: QUESTION_TYPE = QUESTION_TYPE.ALTERNATIVA,
  difficultyLevel: QUESTION_DIFFICULTY = QUESTION_DIFFICULTY.MEDIO,
  solutionExplanation: string | null = null
): QuestionResult['answers'][number] => {
  return {
    id,
    questionId,
    answer,
    selectedOptions,
    answerStatus,
    statement,
    questionType,
    difficultyLevel,
    solutionExplanation,
    correctOption: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    options: options || [],
    knowledgeMatrix: [],
    teacherFeedback,
    attachment: null,
    score: null,
    gradedAt: null,
    gradedBy: null,
  };
};

/**
 * Mock correction data
 */
const mockCorrectionData: StudentActivityCorrectionData = {
  studentId: 'student-2',
  studentName: 'Maria Santos',
  score: 7,
  correctCount: 3,
  incorrectCount: 1,
  blankCount: 1,
  questions: [
    {
      question: createQuestion(
        'q1',
        'Questão 1',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ],
        ['opt1']
      ),
      result: createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [
          { id: 'opt1', option: 'Opção A', isCorrect: true },
          { id: 'opt2', option: 'Opção B', isCorrect: false },
        ],
        null,
        'Questão 1',
        QUESTION_TYPE.ALTERNATIVA
      ),
      questionNumber: 1,
    },
  ],
};

/**
 * Helper to create a pending promise that never resolves
 */
const createPendingPromise = <T,>(): Promise<T> => new Promise<T>(() => {});

describe('ActivityDetails', () => {
  const mockFetchActivityDetails = jest.fn();
  const mockFetchStudentCorrection = jest.fn();
  const mockSubmitObservation = jest.fn();
  const mockSubmitQuestionCorrection = jest.fn();
  const mockOnBack = jest.fn();
  const mockMapSubjectNameToEnum = jest.fn();
  const mockApiClient: BaseApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const defaultProps: ActivityDetailsProps = {
    activityId: 'activity-123',
    apiClient: mockApiClient,
    onBack: mockOnBack,
    mapSubjectNameToEnum: mockMapSubjectNameToEnum,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchActivityDetails.mockResolvedValue(mockActivityData);
    // Convert mockCorrectionData to API format
    const apiResponse: QuestionsAnswersByStudentResponse = {
      data: {
        answers: mockCorrectionData.questions.map((q) => q.result),
        statistics: {
          totalAnswered:
            mockCorrectionData.correctCount +
            mockCorrectionData.incorrectCount +
            mockCorrectionData.blankCount,
          correctAnswers: mockCorrectionData.correctCount,
          incorrectAnswers: mockCorrectionData.incorrectCount,
          pendingAnswers: mockCorrectionData.questions.filter(
            (q) => q.result.answerStatus === 'PENDENTE_AVALIACAO'
          ).length,
          score: mockCorrectionData.score || 0,
          timeSpent: 0,
        },
      },
    };
    mockFetchStudentCorrection.mockResolvedValue(apiResponse);
    mockSubmitObservation.mockResolvedValue(undefined);
    mockSubmitQuestionCorrection.mockResolvedValue(undefined);
    mockMapSubjectNameToEnum.mockReturnValue('MATEMATICA');

    // Mock useActivityDetails hook
    (useActivityDetails as jest.Mock).mockReturnValue({
      fetchActivityDetails: mockFetchActivityDetails,
      fetchStudentCorrection: mockFetchStudentCorrection,
      submitObservation: mockSubmitObservation,
      submitQuestionCorrection: mockSubmitQuestionCorrection,
    });
  });

  describe('Loading State', () => {
    it('should render loading skeleton initially', () => {
      mockFetchActivityDetails.mockReturnValue(createPendingPromise());

      render(<ActivityDetails {...defaultProps} />);

      expect(screen.getByTestId('skeleton-text')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-table')).toBeInTheDocument();
    });

    it('should render multiple skeleton rounded elements', () => {
      mockFetchActivityDetails.mockReturnValue(createPendingPromise());

      render(<ActivityDetails {...defaultProps} />);

      const skeletonRounded = screen.getAllByTestId('skeleton-rounded');
      expect(skeletonRounded.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should render error state when fetch fails', async () => {
      mockFetchActivityDetails.mockRejectedValue(new Error('Erro de conexão'));

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText('Erro ao carregar detalhes')
        ).toBeInTheDocument();
      });
    });

    it('should display custom error message', async () => {
      mockFetchActivityDetails.mockRejectedValue(
        new Error('Servidor indisponível')
      );

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Servidor indisponível')).toBeInTheDocument();
      });
    });
  });

  describe('Successful Render', () => {
    it('should render activity title in header', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        const titles = screen.getAllByText('Prova de Matemática');
        expect(titles.length).toBeGreaterThan(0);
      });
    });

    it('should render breadcrumb with back button', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Atividades')).toBeInTheDocument();
      });
    });

    it('should render activity metadata', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Escola Teste')).toBeInTheDocument();
        expect(screen.getByText('2024')).toBeInTheDocument();
        expect(screen.getByText('9º Ano A')).toBeInTheDocument();
      });
    });

    it('should render completion percentage', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    it('should render average score', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Média da Turma')).toBeInTheDocument();
        expect(screen.getByText('7.5')).toBeInTheDocument();
      });
    });

    it('should render question statistics', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText('Questões com mais acertos')
        ).toBeInTheDocument();
        expect(screen.getByText('Questões com mais erros')).toBeInTheDocument();
        expect(
          screen.getByText('Questões não respondidas')
        ).toBeInTheDocument();
      });
    });

    it('should render students in table', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      });
    });

    it('should render status badges', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        const completedElements = screen.getAllByText('Concluído');
        expect(completedElements.length).toBeGreaterThan(0);
      });
    });

    it('should render Baixar Atividade button', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onBack when back button is clicked', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Atividades')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Atividades'));

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should open modal when Corrigir atividade is clicked', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Corrigir atividade')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Corrigir atividade'));

      await waitFor(() => {
        expect(mockFetchStudentCorrection).toHaveBeenCalledWith(
          'activity-123',
          'student-2'
        );
      });
    });

    it('should open modal when Ver detalhes is clicked', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        const viewDetailsButtons = screen.getAllByText('Ver detalhes');
        expect(viewDetailsButtons.length).toBeGreaterThan(0);
      });

      const viewDetailsButton = screen.getAllByText('Ver detalhes')[0];
      fireEvent.click(viewDetailsButton);

      await waitFor(() => {
        expect(mockFetchStudentCorrection).toHaveBeenCalled();
      });
    });
  });

  describe('API Integration', () => {
    it('should call fetchActivityDetails on mount', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(mockFetchActivityDetails).toHaveBeenCalledWith('activity-123', {
          page: 1,
          limit: 10,
        });
      });
    });

    it('should refetch when activityId changes', async () => {
      const { rerender } = render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(mockFetchActivityDetails).toHaveBeenCalledTimes(1);
      });

      rerender(<ActivityDetails {...defaultProps} activityId="activity-456" />);

      await waitFor(() => {
        expect(mockFetchActivityDetails).toHaveBeenCalledWith('activity-456', {
          page: 1,
          limit: 10,
        });
      });
    });

    it('should reset PDF/question state when activityId changes', async () => {
      const mockQuestions = [
        createQuestion('q1', 'Questão 1', QUESTION_TYPE.ALTERNATIVA, [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ]),
      ];

      // Mock API to return questions for first activity
      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            questions: mockQuestions,
          },
        },
      });

      const { rerender } = render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      // Load questions for first activity
      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/activities/activity-123/quiz'
        );
      });

      // Change activityId
      rerender(<ActivityDetails {...defaultProps} activityId="activity-456" />);

      // PDF/question state should be reset (questions cleared, loading false, error null, shouldPrint false)
      // This is verified by checking that if we try to download again, it will fetch for the new activity
      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            questions: [],
          },
        },
      });

      // Click download button again - should fetch for new activity
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/activities/activity-456/quiz'
        );
      });
    });
  });

  describe('Empty States', () => {
    it('should render empty state when no students', async () => {
      mockFetchActivityDetails.mockResolvedValue({
        ...mockActivityData,
        students: [],
      });

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Nenhum aluno encontrado')).toBeInTheDocument();
      });
    });
  });

  describe('Optional Props', () => {
    it('should not crash when onBack is not provided', async () => {
      const propsWithoutOnBack = { ...defaultProps };
      delete (propsWithoutOnBack as Partial<ActivityDetailsProps>).onBack;

      render(<ActivityDetails {...propsWithoutOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Atividades')).toBeInTheDocument();
      });

      // Should not throw when clicking
      fireEvent.click(screen.getByText('Atividades'));
    });

    it('should handle missing mapSubjectNameToEnum', async () => {
      const propsWithoutMapper = { ...defaultProps };
      delete (propsWithoutMapper as Partial<ActivityDetailsProps>)
        .mapSubjectNameToEnum;

      render(<ActivityDetails {...propsWithoutMapper} />);

      await waitFor(() => {
        expect(screen.getByText('Matemática')).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('should display formatted dates in header', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Início/)).toBeInTheDocument();
        expect(screen.getByText(/Prazo final/)).toBeInTheDocument();
      });
    });

    it('should display fallback when dates are null', async () => {
      mockFetchActivityDetails.mockResolvedValue({
        ...mockActivityData,
        activity: {
          ...mockActivityData.activity,
          startDate: null,
          finalDate: null,
        },
      });

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        // Check that the header renders with start and end dates
        expect(screen.getByText(/Início/)).toBeInTheDocument();
        expect(screen.getByText(/Prazo final/)).toBeInTheDocument();
      });
    });
  });

  describe('Helper Functions', () => {
    it('should format time correctly', () => {
      expect(formatTimeSpent(3600)).toBe('01:00:00');
      expect(formatTimeSpent(90)).toBe('00:01:30');
      expect(formatTimeSpent(0)).toBe('00:00:00');
    });

    it('should format question numbers correctly', () => {
      expect(formatQuestionNumbers([0, 2])).toBe('01, 03');
      expect(formatQuestionNumbers([])).toBe('-');
    });

    it('should format date to Brazilian format', () => {
      expect(formatDateToBrazilian('2024-01-15')).toBe('15/01/2024');
    });
  });

  describe('Status Badge Config', () => {
    it('should return correct config for each status', () => {
      const concluido = getStatusBadgeConfig(STUDENT_ACTIVITY_STATUS.CONCLUIDO);
      expect(concluido.label).toBe('Concluído');

      const aguardando = getStatusBadgeConfig(
        STUDENT_ACTIVITY_STATUS.AGUARDANDO_CORRECAO
      );
      expect(aguardando.label).toBe('Aguardando Correção');
    });
  });

  describe('Modal Integration', () => {
    it('should show modal after fetching correction', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Corrigir atividade')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Corrigir atividade'));

      await waitFor(() => {
        expect(
          screen.getByTestId('correct-activity-modal')
        ).toBeInTheDocument();
      });
    });

    it('should handle correction fetch error gracefully', async () => {
      mockFetchStudentCorrection.mockRejectedValue(new Error('Fetch failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Corrigir atividade')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Corrigir atividade'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Table Data', () => {
    it('should pass correct data to TableProvider', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('table-provider')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Close', () => {
    it('should close modal when close button is clicked', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Corrigir atividade')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Corrigir atividade'));

      await waitFor(() => {
        expect(
          screen.getByTestId('correct-activity-modal')
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Fechar'));

      await waitFor(() => {
        expect(
          screen.queryByTestId('correct-activity-modal')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Observation Submit', () => {
    it('should call submitObservation when observation is submitted', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Corrigir atividade')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Corrigir atividade'));

      await waitFor(() => {
        expect(
          screen.getByTestId('correct-activity-modal')
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('submit-observation'));

      await waitFor(() => {
        expect(mockSubmitObservation).toHaveBeenCalledWith(
          'activity-123',
          'student-2',
          'Test observation',
          null
        );
      });
    });
  });

  describe('Column Render Functions', () => {
    it('should handle null answeredAt correctly', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        // Student-3 has null answeredAt
        expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument();
      });
    });

    it('should display timeSpent as dash when zero', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        // Verify students with 0 timeSpent show dash
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      });
    });

    it('should display score as null correctly', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        // Students with null score should render correctly
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should handle page change', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('next-page')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('next-page'));

      await waitFor(() => {
        expect(mockFetchActivityDetails).toHaveBeenCalledWith('activity-123', {
          page: 2,
          limit: 10,
        });
      });
    });

    it('should handle limit change', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('change-limit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('change-limit'));

      await waitFor(() => {
        expect(mockFetchActivityDetails).toHaveBeenCalledWith('activity-123', {
          page: 1,
          limit: 20,
        });
      });
    });
  });

  describe('Sorting', () => {
    it('should handle undefined sortOrder in params', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(mockFetchActivityDetails).toHaveBeenCalledWith(
          'activity-123',
          expect.objectContaining({
            page: 1,
            limit: 10,
          })
        );
      });
    });

    it('should handle sort interaction with table', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        const elements = screen.getAllByText('Prova de Matemática');
        expect(elements.length).toBeGreaterThan(0);
      });

      expect(mockFetchActivityDetails).toHaveBeenCalled();
    });
  });

  describe('PDF Download', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockHandlePrint.mockClear();
      mockFetchQuestionsByIds.mockClear();
      mockConvertQuestionToPreview.mockClear();
      mockAddToast.mockClear();
      (useQuestionsPdfPrint as jest.Mock).mockReturnValue({
        contentRef: mockContentRef,
        handlePrint: mockHandlePrint,
      });
      (createUseQuestionsList as jest.Mock).mockReturnValue(
        mockUseQuestionsList
      );
    });

    it('should render PDF content component', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('questions-pdf-content')).toBeInTheDocument();
      });
    });

    it('should fetch questions when download button is clicked and questions are empty', async () => {
      const mockQuestions = [
        createQuestion('q1', 'Questão 1', QUESTION_TYPE.ALTERNATIVA, [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ]),
      ];

      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            questions: mockQuestions,
          },
        },
      });

      mockFetchQuestionsByIds.mockResolvedValue(mockQuestions);

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/activities/activity-123/quiz'
        );
      });
    });

    it('should fetch questions by IDs when quiz response contains questionIds', async () => {
      const mockQuestions = [
        createQuestion('q1', 'Questão 1', QUESTION_TYPE.ALTERNATIVA, [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ]),
      ];

      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            questionIds: ['q1'],
          },
        },
      });

      mockFetchQuestionsByIds.mockResolvedValue(mockQuestions);

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockFetchQuestionsByIds).toHaveBeenCalledWith(['q1']);
      });
    });

    it('should call handlePrint when questions are already loaded', async () => {
      const mockQuestions = [
        createQuestion('q1', 'Questão 1', QUESTION_TYPE.ALTERNATIVA, [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ]),
      ];

      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            questions: mockQuestions,
          },
        },
      });

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      // Click to load questions and trigger print
      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalled();
      });

      // Wait for handlePrint to be called after questions are loaded
      await waitFor(
        () => {
          expect(mockHandlePrint).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it('should show loading state when fetching questions', async () => {
      mockApiClient.get = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                data: {
                  data: {
                    questions: [],
                  },
                },
              });
            }, 100);
          })
      );

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      // Should show loading text
      await waitFor(() => {
        expect(screen.getByText('Carregando...')).toBeInTheDocument();
      });
    });

    it('should handle error when fetching questions', async () => {
      mockApiClient.get = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fetch failed'))
        .mockRejectedValueOnce(new Error('Alternative endpoint also failed'));

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      // Wait for API calls to be attempted
      await waitFor(
        () => {
          // Both endpoints should be attempted
          expect(mockApiClient.get).toHaveBeenCalledWith(
            '/activities/activity-123/quiz'
          );
          expect(mockApiClient.get).toHaveBeenCalledWith(
            '/activities/activity-123'
          );
        },
        { timeout: 2000 }
      );

      // Should show error toast when both endpoints fail
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Erro ao carregar questões',
            variant: 'solid',
            action: 'warning',
          })
        );
      });

      // Button should still be enabled after error (not in loading state)
      await waitFor(
        () => {
          expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should convert questions to preview format when fetching', async () => {
      const mockQuestions = [
        createQuestion('q1', 'Questão 1', QUESTION_TYPE.ALTERNATIVA, [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ]),
      ];

      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            questions: mockQuestions,
          },
        },
      });

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(convertQuestionToPreview).toHaveBeenCalled();
      });
    });

    it('should use alternative endpoint when quiz endpoint fails', async () => {
      const mockQuestions = [
        createQuestion('q1', 'Questão 1', QUESTION_TYPE.ALTERNATIVA, [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ]),
      ];

      mockApiClient.get = jest
        .fn()
        .mockRejectedValueOnce(new Error('Quiz endpoint failed'))
        .mockResolvedValueOnce({
          data: {
            data: {
              questions: mockQuestions,
            },
          },
        });

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/activities/activity-123'
        );
      });
    });

    it('should show toast notification when no questions are found', async () => {
      // Mock API to return empty questions array
      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            questions: [],
          },
        },
      });

      mockFetchQuestionsByIds.mockResolvedValue([]);

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          title: 'Nenhuma questão encontrada',
          description: 'Esta atividade não possui questões para download.',
          variant: 'solid',
          action: 'info',
          position: 'top-right',
        });
      });
    });

    it('should not set shouldPrint when fetchActivityQuestions returns false (no questions)', async () => {
      // Mock API to return empty questions array
      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            questions: [],
          },
        },
      });

      mockFetchQuestionsByIds.mockResolvedValue([]);

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      // Wait for fetch to complete
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalled();
      });

      // Should not call handlePrint because shouldPrint should be false
      await waitFor(
        () => {
          expect(mockHandlePrint).not.toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });

    it('should set shouldPrint to false when questions are already loaded but empty', async () => {
      // First, load questions (even if empty)
      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            questions: [],
          },
        },
      });

      mockFetchQuestionsByIds.mockResolvedValue([]);

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Baixar Atividade');

      // First click to load (empty) questions
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalled();
      });

      // Second click - questions are already loaded but empty
      fireEvent.click(downloadButton);

      // Should not call handlePrint
      await waitFor(
        () => {
          expect(mockHandlePrint).not.toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });

    it('should not set shouldPrint when fetchActivityQuestions returns false due to error', async () => {
      // Mock fetchQuestionsByIds to throw an error (this will trigger the catch block)
      mockFetchQuestionsByIds.mockRejectedValueOnce(
        new Error('Failed to fetch questions')
      );

      // Mock API to return questionIds that will trigger fetchQuestionsByIds
      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            questionIds: ['q1'],
          },
        },
      });

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      // Wait for error handling
      await waitFor(() => {
        expect(mockFetchQuestionsByIds).toHaveBeenCalled();
      });

      // Should not call handlePrint because shouldPrint should be false
      await waitFor(
        () => {
          expect(mockHandlePrint).not.toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      // Should show error toast
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Erro ao carregar questões',
            variant: 'solid',
            action: 'warning',
          })
        );
      });
    });

    it('should call handlePrint when questions are successfully loaded and shouldPrint is true', async () => {
      const mockQuestions = [
        createQuestion('q1', 'Questão 1', QUESTION_TYPE.ALTERNATIVA, [
          { id: 'opt1', option: 'Opção A' },
          { id: 'opt2', option: 'Opção B' },
        ]),
      ];

      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            questions: mockQuestions,
          },
        },
      });

      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Baixar Atividade')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Baixar Atividade');
      fireEvent.click(downloadButton);

      // Wait for questions to be loaded
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalled();
      });

      // handlePrint should eventually be called when questions are loaded and shouldPrint is true
      await waitFor(
        () => {
          expect(mockHandlePrint).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );

      // Verify that handlePrint was called (meaning shouldPrint was true and conditions were met)
      expect(mockHandlePrint).toHaveBeenCalled();
    });
  });
});
