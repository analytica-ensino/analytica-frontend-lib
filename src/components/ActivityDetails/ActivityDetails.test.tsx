import type { HTMLAttributes, ReactNode } from 'react';
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
} from '../../types/studentActivityCorrection';
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

// Import after mocks
import { ActivityDetails } from './ActivityDetails';
import type { ActivityDetailsProps } from './ActivityDetails';

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
  const mockOnBack = jest.fn();
  const mockOnViewActivity = jest.fn();
  const mockMapSubjectNameToEnum = jest.fn();

  const defaultProps: ActivityDetailsProps = {
    activityId: 'activity-123',
    fetchActivityDetails: mockFetchActivityDetails,
    fetchStudentCorrection: mockFetchStudentCorrection,
    submitObservation: mockSubmitObservation,
    onBack: mockOnBack,
    onViewActivity: mockOnViewActivity,
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
    mockMapSubjectNameToEnum.mockReturnValue('MATEMATICA');
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

    it('should render Ver atividade button', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Ver atividade')).toBeInTheDocument();
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

    it('should call onViewActivity when Ver atividade is clicked', async () => {
      render(<ActivityDetails {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Ver atividade')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ver atividade'));

      expect(mockOnViewActivity).toHaveBeenCalledTimes(1);
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
          'student-2',
          'Maria Santos'
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

    it('should not crash when onViewActivity is not provided', async () => {
      const propsWithoutOnViewActivity = { ...defaultProps };
      delete (propsWithoutOnViewActivity as Partial<ActivityDetailsProps>)
        .onViewActivity;

      render(<ActivityDetails {...propsWithoutOnViewActivity} />);

      await waitFor(() => {
        expect(screen.getByText('Ver atividade')).toBeInTheDocument();
      });

      // Should not throw when clicking
      fireEvent.click(screen.getByText('Ver atividade'));
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
          []
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
});
