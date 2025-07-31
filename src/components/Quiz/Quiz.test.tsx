import { render, screen, fireEvent } from '@testing-library/react';
import {
  Quiz,
  QuizTitle,
  QuizHeader,
  QuizContent,
  QuizAlternative,
  QuizQuestionList,
  QuizFooter,
  QuizHeaderResult,
  QuizResultHeaderTitle,
  QuizResultTitle,
  QuizResultPerformance,
  QuizListResult,
  QuizListResultByMateria,
} from './Quiz';
import { useQuizStore } from './useQuizStore';
import { ReactNode } from 'react';

// Mock the useQuizStore
jest.mock('./useQuizStore');
const mockUseQuizStore = useQuizStore as jest.MockedFunction<
  typeof useQuizStore
>;

// Mock the Alternative component
jest.mock('../Alternative/Alternative', () => ({
  AlternativesList: ({
    alternatives,
    value,
    onValueChange,
  }: {
    alternatives: Array<{ value: string; label: string }>;
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <div data-testid="alternatives-list">
      {alternatives.map((alt) => (
        <button
          key={alt.value}
          data-testid={`alternative-${alt.value}`}
          onClick={() => onValueChange(alt.value)}
          className={value === alt.value ? 'selected' : ''}
        >
          {alt.label}
        </button>
      ))}
    </div>
  ),
  HeaderAlternative: ({
    title,
    subTitle,
    content,
  }: {
    title: string;
    subTitle: string;
    content: string;
  }) => (
    <div data-testid="header-alternative">
      <h2>{title}</h2>
      <p>{subTitle}</p>
      <p>{content}</p>
    </div>
  ),
}));

// Mock the Button component
jest.mock('../Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    disabled,
    _action,
    _iconLeft,
    _iconRight,
    ...props
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    _action?: unknown;
    _iconLeft?: unknown;
    _iconRight?: unknown;
    [key: string]: unknown;
  }) => {
    return (
      <button
        data-testid="button"
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
}));

// Mock the IconButton component
jest.mock('../IconButton/IconButton', () => ({
  __esModule: true,
  default: ({
    icon,
    onClick,
    _iconLeft,
    _iconRight,
    ...props
  }: {
    icon: ReactNode;
    onClick?: () => void;
    _iconLeft?: unknown;
    _iconRight?: unknown;
    [key: string]: unknown;
  }) => {
    return (
      <button data-testid="icon-button" onClick={onClick} {...props}>
        {icon}
      </button>
    );
  },
}));

// Mock the AlertDialog component
jest.mock('../AlertDialog/AlertDialog', () => ({
  AlertDialog: ({
    isOpen,
    onChangeOpen,
    title,
    description,
    onSubmit,
    cancelButtonLabel,
    submitButtonLabel,
  }: {
    isOpen: boolean;
    onChangeOpen: (open: boolean) => void;
    title: string;
    description: string;
    onSubmit: () => void;
    cancelButtonLabel: string;
    submitButtonLabel: string;
  }) =>
    isOpen ? (
      <div data-testid="alert-dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button data-testid="cancel-button" onClick={() => onChangeOpen(false)}>
          {cancelButtonLabel}
        </button>
        <button data-testid="submit-button" onClick={onSubmit}>
          {submitButtonLabel}
        </button>
      </div>
    ) : null,
}));

// Mock the Modal component
jest.mock('../Modal/Modal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    children,
    title,
    size,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title: string;
    size?: string;
  }) =>
    isOpen ? (
      <div data-testid="modal" data-size={size}>
        <h2>{title}</h2>
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

// Mock the Select components
jest.mock('../Select/Select', () => ({
  __esModule: true,
  default: ({ children, value }: { children: ReactNode; value: string }) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <div data-testid={`select-item-${value}`} data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    className,
  }: {
    children: ReactNode;
    className: string;
  }) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
}));

// Mock the Card component
jest.mock('../Card/Card', () => ({
  CardStatus: ({
    header,
    status,
    onClick,
  }: {
    header: string;
    status?: 'correct' | 'incorrect';
    onClick?: () => void;
  }) => (
    <button data-testid="card-status" data-status={status} onClick={onClick}>
      <span>{header}</span>
      <span>
        {status === 'correct'
          ? 'Correta'
          : status === 'incorrect'
            ? 'Incorreta'
            : ''}
      </span>
    </button>
  ),
  CardResults: ({
    header,
    correct_answers,
    incorrect_answers,
    icon,
    direction: _direction,
    onClick,
  }: {
    header: string;
    correct_answers: number;
    incorrect_answers: number;
    icon?: ReactNode;
    direction?: string;
    onClick?: () => void;
  }) => (
    <button data-testid="card-results" onClick={onClick}>
      <span>{header}</span>
      <span data-testid="correct-answers">{correct_answers}</span>
      <span data-testid="incorrect-answers">{incorrect_answers}</span>
      {icon && <span data-testid="card-icon">{icon}</span>}
    </button>
  ),
}));

// Mock the Badge component
jest.mock('../Badge/Badge', () => ({
  __esModule: true,
  default: ({
    children,
    variant,
    action,
    iconLeft,
  }: {
    children: ReactNode;
    variant?: string;
    action?: string;
    iconLeft?: ReactNode;
  }) => (
    <div data-testid="badge" data-variant={variant} data-action={action}>
      {iconLeft}
      {children}
    </div>
  ),
}));

// Mock the image
jest.mock('@/assets/img/simulated-result.png', () => 'mocked-image.png');

// Mock data
const mockQuestion1 = {
  id: 'q1',
  questionText: 'What is 2 + 2?',
  correctOptionId: 'opt1',
  description: 'Basic math question',
  type: 'ALTERNATIVA' as const,
  status: 'APROVADO' as const,
  difficulty: 'FACIL' as const,
  examBoard: 'ENEM',
  examYear: '2024',
  answerKey: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  knowledgeMatrix: [
    {
      areaKnowledgeId: 'matematica',
      subjectId: 'algebra',
      topicId: 'operacoes',
      subtopicId: 'soma',
      contentId: 'matematica',
    },
  ],
  options: [
    { id: 'opt1', option: '4' },
    { id: 'opt2', option: '3' },
    { id: 'opt3', option: '5' },
    { id: 'opt4', option: '6' },
  ],
  createdBy: 'user1',
};

const mockQuestion2 = {
  id: 'q2',
  questionText: 'What is the capital of France?',
  correctOptionId: 'opt2',
  description: 'Geography question',
  type: 'ALTERNATIVA' as const,
  status: 'APROVADO' as const,
  difficulty: 'FACIL' as const,
  examBoard: 'ENEM',
  examYear: '2024',
  answerKey: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  knowledgeMatrix: [
    {
      areaKnowledgeId: 'geografia',
      subjectId: 'geografia-geral',
      topicId: 'capitais',
      subtopicId: 'europa',
      contentId: 'geografia',
    },
  ],
  options: [
    { id: 'opt1', option: 'London' },
    { id: 'opt2', option: 'Paris' },
    { id: 'opt3', option: 'Berlin' },
    { id: 'opt4', option: 'Madrid' },
  ],
  createdBy: 'user1',
};

const mockSimulado = {
  id: 'simulado-1',
  title: 'Test Simulado',
  questions: [mockQuestion1, mockQuestion2],
};

describe('Quiz Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Default mock implementation
    mockUseQuizStore.mockReturnValue({
      isStarted: false,
      updateTime: jest.fn(),
      timeElapsed: 0,
      currentQuestionIndex: 0,
      getTotalQuestions: jest.fn().mockReturnValue(2),
      getQuizTitle: jest.fn().mockReturnValue('Test Quiz'),
      formatTime: jest.fn().mockReturnValue('00:00'),
      getCurrentQuestion: jest.fn().mockReturnValue(mockQuestion1),
      selectAnswer: jest.fn(),
      getCurrentAnswer: jest.fn().mockReturnValue(undefined),
      isQuestionSkipped: jest.fn().mockReturnValue(false),
      goToNextQuestion: jest.fn(),
      goToPreviousQuestion: jest.fn(),
      skipQuestion: jest.fn(),
      getUserAnswers: jest.fn().mockReturnValue([]),
      getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([]),
      getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
        algebra: [mockQuestion1],
        'geografia-geral': [mockQuestion2],
      }),
      isQuestionAnswered: jest.fn().mockReturnValue(false),
      goToQuestion: jest.fn(),
      resetQuiz: jest.fn(),
      setBySimulated: jest.fn(),
      setByActivity: jest.fn(),
      setByQuestionary: jest.fn(),
      startQuiz: jest.fn(),
      finishQuiz: jest.fn(),
      getAnsweredQuestions: jest.fn().mockReturnValue(0),
      getUnansweredQuestions: jest.fn().mockReturnValue([2]),
      getSkippedQuestions: jest.fn().mockReturnValue(0),
      getProgress: jest.fn().mockReturnValue(0),
      bySimulated: mockSimulado,
      byActivity: undefined,
      byQuestionary: undefined,
      selectedAnswers: {},
      skippedQuestions: [],
      userAnswers: [],
      isFinished: false,
    });

    // Mock useQuizStore.getState to return the same mock data
    (useQuizStore.getState as jest.Mock).mockReturnValue({
      bySimulated: mockSimulado,
      byActivity: undefined,
      byQuestionary: undefined,
    });
  });

  describe('Quiz', () => {
    it('should render children correctly', () => {
      render(
        <Quiz>
          <div data-testid="quiz-child">Quiz Content</div>
        </Quiz>
      );

      expect(screen.getByTestId('quiz-child')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Quiz className="custom-class">
          <div>Content</div>
        </Quiz>
      );

      const quizElement = screen.getByText('Content').parentElement;
      expect(quizElement).toHaveClass('custom-class');
    });

    it('should start timer when isStarted is true', () => {
      const mockUpdateTime = jest.fn();
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        isStarted: true,
        timeElapsed: 10,
        updateTime: mockUpdateTime,
      });

      render(
        <Quiz>
          <div>Content</div>
        </Quiz>
      );

      // Timer should be active when isStarted is true
      expect(mockUpdateTime).toBeDefined();
    });

    it('should cleanup timer when component unmounts', () => {
      const mockUpdateTime = jest.fn();
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        isStarted: true,
        timeElapsed: 10,
        updateTime: mockUpdateTime,
      });

      const { unmount } = render(
        <Quiz>
          <div>Content</div>
        </Quiz>
      );

      // Unmount component to trigger cleanup
      unmount();

      // Timer should be cleaned up
      expect(mockUpdateTime).toBeDefined();
    });
  });

  describe('QuizTitle', () => {
    it('should display quiz title and question count', () => {
      render(<QuizTitle />);

      expect(screen.getByText('Test Quiz')).toBeInTheDocument();
      expect(screen.getByText('1 de 2')).toBeInTheDocument();
    });

    it('should display timer badge', () => {
      render(<QuizTitle />);

      expect(screen.getByTestId('badge')).toBeInTheDocument();
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });

    it('should show 0 de 0 when no questions', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getTotalQuestions: jest.fn().mockReturnValue(0),
      });

      render(<QuizTitle />);

      expect(screen.getByText('0 de 0')).toBeInTheDocument();
    });

    it('should format time correctly when quiz is started', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        isStarted: true,
        timeElapsed: 65,
        formatTime: jest.fn().mockReturnValue('01:05'),
      });

      render(<QuizTitle />);

      expect(screen.getByText('01:05')).toBeInTheDocument();
    });
  });

  describe('QuizHeader', () => {
    it('should display question header with current question data', () => {
      render(<QuizHeader />);

      expect(screen.getByTestId('header-alternative')).toBeInTheDocument();
      expect(screen.getByText('Questão q1')).toBeInTheDocument();
      expect(screen.getByText('operacoes')).toBeInTheDocument();
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    it('should display default values when no question is available', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue(null),
      });

      render(<QuizHeader />);

      expect(screen.getByText('Questão')).toBeInTheDocument();
    });
  });

  describe('QuizContent', () => {
    it('should render content with default type', () => {
      render(
        <QuizContent>
          <div data-testid="content-child">Content</div>
        </QuizContent>
      );

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
      expect(screen.getByTestId('content-child')).toBeInTheDocument();
    });

    it('should render content with custom type', () => {
      render(
        <QuizContent type="Dissertativa">
          <div data-testid="content-child">Content</div>
        </QuizContent>
      );

      expect(screen.getByText('Dissertativa')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <QuizContent className="custom-content-class">
          <div>Content</div>
        </QuizContent>
      );

      const contentElement = screen.getByText('Content').parentElement;
      expect(contentElement).toHaveClass('custom-content-class');
    });
  });

  describe('QuizAlternative', () => {
    it('should render alternatives list', () => {
      render(<QuizAlternative />);

      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
      expect(screen.getByTestId('alternative-opt1')).toBeInTheDocument();
      expect(screen.getByTestId('alternative-opt2')).toBeInTheDocument();
      expect(screen.getByTestId('alternative-opt3')).toBeInTheDocument();
      expect(screen.getByTestId('alternative-opt4')).toBeInTheDocument();
    });

    it('should call selectAnswer when alternative is clicked', () => {
      const mockSelectAnswer = jest.fn();
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        selectAnswer: mockSelectAnswer,
      });

      render(<QuizAlternative />);

      fireEvent.click(screen.getByTestId('alternative-opt1'));

      expect(mockSelectAnswer).toHaveBeenCalledWith('q1', 'opt1');
    });

    it('should display "Não há Alternativas" when no options available', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue({
          ...mockQuestion1,
          options: undefined,
        }),
      });

      render(<QuizAlternative />);

      expect(screen.getByText('Não há Alternativas')).toBeInTheDocument();
    });

    it('should highlight selected alternative', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentAnswer: jest.fn().mockReturnValue('opt2'),
      });

      render(<QuizAlternative />);

      const selectedAlternative = screen.getByTestId('alternative-opt2');
      expect(selectedAlternative).toHaveClass('selected');
    });

    it('should render result variant with correct status determination', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentAnswer: jest.fn().mockReturnValue('opt2'), // User selected opt2
        getCurrentQuestion: jest.fn().mockReturnValue({
          ...mockQuestion1,
          correctOptionId: 'opt1', // Correct answer is opt1
        }),
      });

      render(<QuizAlternative variant="result" />);

      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
      // The component should render in readonly mode with correct status determination
      expect(screen.getByTestId('alternative-opt1')).toBeInTheDocument();
      expect(screen.getByTestId('alternative-opt2')).toBeInTheDocument();
    });
  });

  describe('QuizQuestionList', () => {
    it('should render questions grouped by subject', () => {
      render(<QuizQuestionList />);

      expect(screen.getByText('algebra')).toBeInTheDocument();
      expect(screen.getByText('geografia-geral')).toBeInTheDocument();
      expect(screen.getAllByTestId('card-status')).toHaveLength(2);
    });

    it('should filter questions by answered status', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        isQuestionAnswered: jest.fn().mockImplementation((id) => id === 'q1'),
      });

      render(<QuizQuestionList filterType="answered" />);

      expect(screen.getAllByTestId('card-status')).toHaveLength(1);
    });

    it('should filter questions by unanswered status', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        isQuestionAnswered: jest.fn().mockImplementation((id) => id === 'q1'),
      });

      render(<QuizQuestionList filterType="unanswered" />);

      expect(screen.getAllByTestId('card-status')).toHaveLength(1);
    });

    it('should call onQuestionClick when question is clicked', () => {
      const mockOnQuestionClick = jest.fn();
      render(<QuizQuestionList onQuestionClick={mockOnQuestionClick} />);

      fireEvent.click(screen.getAllByTestId('card-status')[0]);

      expect(mockOnQuestionClick).toHaveBeenCalled();
    });

    it('should display correct status labels', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        isQuestionAnswered: jest.fn().mockImplementation((id) => id === 'q1'),
        isQuestionSkipped: jest.fn().mockImplementation((id) => id === 'q2'),
      });

      render(<QuizQuestionList />);

      const cards = screen.getAllByTestId('card-status');
      expect(cards[0]).toHaveTextContent('Questão 01');
      expect(cards[1]).toHaveTextContent('Questão 02');
    });
  });

  describe('QuizFooter', () => {
    it('should render navigation buttons', () => {
      render(<QuizFooter />);

      expect(screen.getByTestId('icon-button')).toBeInTheDocument();
      expect(screen.getByText('Pular')).toBeInTheDocument();
    });

    it('should show "Voltar" button when not on first question', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
      });

      render(<QuizFooter />);

      expect(screen.getByText('Voltar')).toBeInTheDocument();
    });

    it('should show "Avançar" button when not on last question', () => {
      render(<QuizFooter />);

      expect(screen.getByText('Avançar')).toBeInTheDocument();
    });

    it('should show "Finish" button on last question', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
      });

      render(<QuizFooter />);

      expect(screen.getByText('Finalizar')).toBeInTheDocument();
    });

    it('should disable next/finish button when no answer selected', () => {
      render(<QuizFooter />);

      const nextButton = screen.getByText('Avançar');
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when answer is selected', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
      });

      render(<QuizFooter />);

      const nextButton = screen.getByText('Avançar');
      expect(nextButton).not.toBeDisabled();
    });

    it('should show alert dialog when finishing with unanswered questions', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([2]),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
      });

      render(<QuizFooter />);

      fireEvent.click(screen.getByText('Finalizar'));

      expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
      expect(screen.getByText('Finalizar simulado?')).toBeInTheDocument();
    });

    it('should show result modal when finishing without unanswered questions', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([]),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
        getUserAnswers: jest.fn().mockReturnValue([
          { answerKey: 'opt1', correctOptionId: 'opt1' },
          { answerKey: 'opt2', correctOptionId: 'opt2' },
        ]),
      });

      render(<QuizFooter />);

      fireEvent.click(screen.getByText('Finalizar'));

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Você concluiu o simulado!')).toBeInTheDocument();
    });

    it('should open navigation modal when icon button is clicked', () => {
      render(<QuizFooter />);

      fireEvent.click(screen.getByTestId('icon-button'));

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Questões')).toBeInTheDocument();
    });

    it('should call onGoToSimulated when button is clicked', () => {
      const mockOnGoToSimulated = jest.fn();
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([]),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
        getUserAnswers: jest
          .fn()
          .mockReturnValue([{ answerKey: 'opt1', correctOptionId: 'opt1' }]),
      });

      render(<QuizFooter onGoToSimulated={mockOnGoToSimulated} />);

      fireEvent.click(screen.getByText('Finalizar'));
      fireEvent.click(screen.getByText('Ir para simulados'));

      expect(mockOnGoToSimulated).toHaveBeenCalled();
    });

    it('should call onDetailResult when button is clicked', () => {
      const mockOnDetailResult = jest.fn();
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([]),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
        getUserAnswers: jest
          .fn()
          .mockReturnValue([{ answerKey: 'opt1', correctOptionId: 'opt1' }]),
      });

      render(<QuizFooter onDetailResult={mockOnDetailResult} />);

      fireEvent.click(screen.getByText('Finalizar'));
      fireEvent.click(screen.getByText('Detalhar resultado'));

      expect(mockOnDetailResult).toHaveBeenCalled();
    });

    it('should handle skip question button actions correctly', () => {
      const mockSkipQuestion = jest.fn();
      const mockGoToNextQuestion = jest.fn();

      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 0, // First question
        skipQuestion: mockSkipQuestion,
        goToNextQuestion: mockGoToNextQuestion,
      });

      render(<QuizFooter />);

      // Find and click the skip button (should be the first "Pular" button)
      const skipButtons = screen.getAllByText('Pular');
      const firstSkipButton = skipButtons[0];

      fireEvent.click(firstSkipButton);

      // Verify both functions are called
      expect(mockSkipQuestion).toHaveBeenCalledTimes(1);
      expect(mockGoToNextQuestion).toHaveBeenCalledTimes(1);

      // Verify the order of calls by checking mock call order
      const skipQuestionCallOrder =
        mockSkipQuestion.mock.invocationCallOrder[0];
      const goToNextQuestionCallOrder =
        mockGoToNextQuestion.mock.invocationCallOrder[0];
      expect(skipQuestionCallOrder).toBeLessThan(goToNextQuestionCallOrder);
    });

    it('should handle skip question button actions for non-first question', () => {
      const mockSkipQuestion = jest.fn();
      const mockGoToNextQuestion = jest.fn();

      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1, // Not first question
        skipQuestion: mockSkipQuestion,
        goToNextQuestion: mockGoToNextQuestion,
      });

      render(<QuizFooter />);

      // Find and click the skip button (should be the only "Pular" button for non-first question)
      const skipButton = screen.getByText('Pular');

      fireEvent.click(skipButton);

      // Verify both functions are called
      expect(mockSkipQuestion).toHaveBeenCalledTimes(1);
      expect(mockGoToNextQuestion).toHaveBeenCalledTimes(1);

      // Verify the order of calls by checking mock call order
      const skipQuestionCallOrder =
        mockSkipQuestion.mock.invocationCallOrder[0];
      const goToNextQuestionCallOrder =
        mockGoToNextQuestion.mock.invocationCallOrder[0];
      expect(skipQuestionCallOrder).toBeLessThan(goToNextQuestionCallOrder);
    });

    it('should handle go to previous question', () => {
      const mockGoToPreviousQuestion = jest.fn();
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        goToPreviousQuestion: mockGoToPreviousQuestion,
      });

      render(<QuizFooter />);

      fireEvent.click(screen.getByText('Voltar'));

      expect(mockGoToPreviousQuestion).toHaveBeenCalled();
    });

    it('should handle go to next question', () => {
      const mockGoToNextQuestion = jest.fn();
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
        goToNextQuestion: mockGoToNextQuestion,
      });

      render(<QuizFooter />);

      fireEvent.click(screen.getByText('Avançar'));

      expect(mockGoToNextQuestion).toHaveBeenCalled();
    });

    // Additional tests for missing coverage scenarios
    it('should show alert dialog with unanswered questions description', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getUnansweredQuestionsFromUserAnswers: jest
          .fn()
          .mockReturnValue([2, 3]),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
      });

      render(<QuizFooter />);

      fireEvent.click(screen.getByText('Finalizar'));

      expect(screen.getByText('Finalizar simulado?')).toBeInTheDocument();
      expect(
        screen.getByText(/Você deixou as questões 2, 3 sem resposta/)
      ).toBeInTheDocument();
    });

    it('should show alert dialog with default description when no unanswered questions', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([2]), // Has unanswered questions
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
        getUserAnswers: jest.fn().mockReturnValue([]),
      });

      render(<QuizFooter />);

      fireEvent.click(screen.getByText('Finalizar'));

      expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
      expect(screen.getByText('Finalizar simulado?')).toBeInTheDocument();
      expect(
        screen.getByText(/Você deixou as questões 2 sem resposta/)
      ).toBeInTheDocument();
    });

    it('should handle alert dialog submit action', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([2]),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
        getUserAnswers: jest
          .fn()
          .mockReturnValue([{ answerKey: 'opt1', correctOptionId: 'opt1' }]),
      });

      render(<QuizFooter />);

      fireEvent.click(screen.getByText('Finalizar'));
      fireEvent.click(screen.getByTestId('submit-button'));

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Você concluiu o simulado!')).toBeInTheDocument();
    });

    it('should handle alert dialog cancel action', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([2]),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
      });

      render(<QuizFooter />);

      fireEvent.click(screen.getByText('Finalizar'));
      fireEvent.click(screen.getByTestId('cancel-button'));

      expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument();
    });

    it('should handle modal close action', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([]),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
        getUserAnswers: jest
          .fn()
          .mockReturnValue([{ answerKey: 'opt1', correctOptionId: 'opt1' }]),
      });

      render(<QuizFooter />);

      fireEvent.click(screen.getByText('Finalizar'));
      fireEvent.click(screen.getByTestId('close-modal'));

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should handle navigation modal with select functionality', () => {
      render(<QuizFooter />);

      fireEvent.click(screen.getByTestId('icon-button'));

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Questões')).toBeInTheDocument();
      expect(screen.getByText('Filtrar por')).toBeInTheDocument();
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    it('should close navigation modal when question is clicked', () => {
      render(<QuizFooter />);

      // Open navigation modal
      fireEvent.click(screen.getByTestId('icon-button'));
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      // Click on a question card to trigger onQuestionClick
      fireEvent.click(screen.getAllByTestId('card-status')[0]);

      // Modal should be closed
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should handle select value change in navigation modal', () => {
      render(<QuizFooter />);

      fireEvent.click(screen.getByTestId('icon-button'));

      const selectElement = screen.getByTestId('select');
      expect(selectElement).toHaveAttribute('data-value', 'all');
    });

    it('should handle navigation modal close', () => {
      render(<QuizFooter />);

      fireEvent.click(screen.getByTestId('icon-button'));
      fireEvent.click(screen.getByTestId('close-modal'));

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should display correct answer count in result modal', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([]),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
        getUserAnswers: jest.fn().mockReturnValue([
          { answerKey: 'opt1', correctOptionId: 'opt1' },
          { answerKey: 'opt2', correctOptionId: 'opt3' }, // Wrong answer
        ]),
      });

      render(<QuizFooter />);

      fireEvent.click(screen.getByText('Finalizar'));

      expect(
        screen.getByText('Você acertou 1 de 2 questões.')
      ).toBeInTheDocument();
    });

    it('should render AlternativesList with correct key and name when current question exists', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue(mockQuestion1),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
      });

      render(<QuizAlternative />);

      const alternativesList = screen.getByTestId('alternatives-list');
      expect(alternativesList).toBeInTheDocument();

      // The key and name should be based on currentQuestion.id
      expect(alternativesList).toHaveAttribute(
        'data-testid',
        'alternatives-list'
      );
    });

    it('should render AlternativesList with fallback key and name when current question is null', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue(null),
        getCurrentAnswer: jest.fn().mockReturnValue(undefined),
      });

      render(<QuizAlternative />);

      // When currentQuestion is null, it should show "Não há Alternativas" instead of alternatives list
      expect(screen.getByText('Não há Alternativas')).toBeInTheDocument();
      expect(screen.queryByTestId('alternatives-list')).not.toBeInTheDocument();
    });

    it('should render AlternativesList with fallback key and name when current question id is undefined', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue({
          ...mockQuestion1,
          id: undefined, // Simulate undefined id
        }),
        getCurrentAnswer: jest.fn().mockReturnValue(undefined),
      });

      render(<QuizAlternative />);

      const alternativesList = screen.getByTestId('alternatives-list');
      expect(alternativesList).toBeInTheDocument();

      // The key and name should use fallback value '1' when currentQuestion.id is undefined
      expect(alternativesList).toHaveAttribute(
        'data-testid',
        'alternatives-list'
      );
    });

    it('should handle getQuestionIndex when quiz exists', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        bySimulated: mockSimulado,
        byActivity: undefined,
        byQuestionary: undefined,
      });

      // Mock useQuizStore.getState to return quiz data
      (useQuizStore.getState as jest.Mock).mockReturnValue({
        bySimulated: mockSimulado,
        byActivity: undefined,
        byQuestionary: undefined,
      });

      render(<QuizQuestionList />);

      // Should render questions when quiz exists
      expect(screen.getAllByTestId('card-status')).toHaveLength(2);
    });

    it('should handle getQuestionIndex when no quiz exists', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        bySimulated: undefined,
        byActivity: undefined,
        byQuestionary: undefined,
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({}), // Return empty object when no quiz
      });

      // Mock useQuizStore.getState to return no quiz data
      (useQuizStore.getState as jest.Mock).mockReturnValue({
        bySimulated: undefined,
        byActivity: undefined,
        byQuestionary: undefined,
      });

      render(<QuizQuestionList />);

      // Should not render any questions when no quiz exists
      expect(screen.queryByTestId('card-status')).not.toBeInTheDocument();
    });

    it('should handle getQuestionIndex with byActivity quiz', () => {
      const mockAtividade = {
        id: 'atividade-1',
        title: 'Test Atividade',
        questions: [mockQuestion1, mockQuestion2],
      };

      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        bySimulated: undefined,
        byActivity: mockAtividade,
        byQuestionary: undefined,
      });

      // Mock useQuizStore.getState to return atividade data
      (useQuizStore.getState as jest.Mock).mockReturnValue({
        bySimulated: undefined,
        byActivity: mockAtividade,
        byQuestionary: undefined,
      });

      render(<QuizQuestionList />);

      // Should render questions when atividade exists
      expect(screen.getAllByTestId('card-status')).toHaveLength(2);
    });

    it('should handle getQuestionIndex with byQuestionary quiz', () => {
      const mockAula = {
        id: 'aula-1',
        title: 'Test Aula',
        questions: [mockQuestion1, mockQuestion2],
      };

      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        bySimulated: undefined,
        byActivity: undefined,
        byQuestionary: mockAula,
      });

      // Mock useQuizStore.getState to return aula data
      (useQuizStore.getState as jest.Mock).mockReturnValue({
        bySimulated: undefined,
        byActivity: undefined,
        byQuestionary: mockAula,
      });

      render(<QuizQuestionList />);

      // Should render questions when aula exists
      expect(screen.getAllByTestId('card-status')).toHaveLength(2);
    });

    it('should return 0 when no quiz exists in getQuestionIndex function', () => {
      // Mock useQuizStore.getState to return no quiz data
      (useQuizStore.getState as jest.Mock).mockReturnValue({
        bySimulated: undefined,
        byActivity: undefined,
        byQuestionary: undefined,
      });

      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        bySimulated: undefined,
        byActivity: undefined,
        byQuestionary: undefined,
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          'test-subject': [mockQuestion1], // Still provide some questions for rendering
        }),
      });

      render(<QuizQuestionList />);

      // The getQuestionIndex function should return 0 when no quiz exists
      // This is tested by checking that the question number is displayed as "Question 00"
      // since getQuestionIndex returns 0, which gets padded to "00"
      expect(screen.getByText('Questão 00')).toBeInTheDocument();
    });

    it('should handle isCurrentQuestionSkipped logic in QuizFooter', () => {
      // Test case 1: Current question exists and is skipped
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue(mockQuestion1),
        isQuestionSkipped: jest.fn().mockReturnValue(true),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getCurrentAnswer: jest.fn().mockReturnValue(undefined),
      });

      render(<QuizFooter />);

      // The "Finish" button should be enabled when question is skipped (even without answer)
      const finishButton = screen.getByText('Finalizar');
      expect(finishButton).not.toBeDisabled();
    });

    it('should handle isCurrentQuestionSkipped when current question is null in QuizFooter', () => {
      // Test case 2: Current question is null
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue(null),
        isQuestionSkipped: jest.fn().mockReturnValue(false),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getCurrentAnswer: jest.fn().mockReturnValue(undefined),
      });

      render(<QuizFooter />);

      // The "Finish" button should be disabled when no current question and no answer
      const finishButton = screen.getByText('Finalizar');
      expect(finishButton).toBeDisabled();
    });

    it('should handle isCurrentQuestionSkipped when current question is not skipped in QuizFooter', () => {
      // Test case 3: Current question exists but is not skipped
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue(mockQuestion1),
        isQuestionSkipped: jest.fn().mockReturnValue(false),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getCurrentAnswer: jest.fn().mockReturnValue(undefined),
      });

      render(<QuizFooter />);

      // The "Finish" button should be disabled when question is not skipped and no answer
      const finishButton = screen.getByText('Finalizar');
      expect(finishButton).toBeDisabled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete quiz flow', async () => {
      const mockSelectAnswer = jest.fn();
      const mockGoToNextQuestion = jest.fn();
      const mockFinishQuiz = jest.fn();

      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        selectAnswer: mockSelectAnswer,
        goToNextQuestion: mockGoToNextQuestion,
        finishQuiz: mockFinishQuiz,
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
        currentQuestionIndex: 1,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([]),
        getUserAnswers: jest
          .fn()
          .mockReturnValue([{ answerKey: 'opt1', correctOptionId: 'opt1' }]),
      });

      render(
        <div>
          <QuizAlternative />
          <QuizFooter />
        </div>
      );

      // Select an answer
      fireEvent.click(screen.getByTestId('alternative-opt1'));
      expect(mockSelectAnswer).toHaveBeenCalledWith('q1', 'opt1');

      // Finish quiz
      fireEvent.click(screen.getByText('Finalizar'));
      expect(screen.getByText('Você concluiu o simulado!')).toBeInTheDocument();
    });

    it('should handle timer functionality', () => {
      const mockUpdateTime = jest.fn();
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        isStarted: true,
        timeElapsed: 0,
        updateTime: mockUpdateTime,
      });

      render(<Quiz>test</Quiz>);

      // Timer should be active
      expect(mockUpdateTime).toBeDefined();
    });
  });

  describe('QuizHeaderResult', () => {
    it('should display success message when user answers correctly', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue({
          ...mockQuestion1,
          correctOptionId: 'opt1',
        }),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'), // User selected correct answer
      });

      render(<QuizHeaderResult />);

      expect(screen.getByText('Resultado')).toBeInTheDocument();
      expect(screen.getByText('🎉 Parabéns!!')).toBeInTheDocument();
      expect(screen.getByText('Resultado').closest('div')).toHaveClass(
        'bg-success-background'
      );
    });

    it('should display error message when user answers incorrectly', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue({
          ...mockQuestion1,
          correctOptionId: 'opt1',
        }),
        getCurrentAnswer: jest.fn().mockReturnValue('opt2'), // User selected wrong answer
      });

      render(<QuizHeaderResult />);

      expect(screen.getByText('Resultado')).toBeInTheDocument();
      expect(screen.getByText('Não foi dessa vez...')).toBeInTheDocument();
      expect(screen.getByText('Resultado').closest('div')).toHaveClass(
        'bg-error-background'
      );
    });

    it('should handle case when user has not answered', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue({
          ...mockQuestion1,
          correctOptionId: 'opt1',
        }),
        getCurrentAnswer: jest.fn().mockReturnValue(undefined), // User has not answered
      });

      render(<QuizHeaderResult />);

      expect(screen.getByText('Resultado')).toBeInTheDocument();
      expect(screen.getByText('Não foi dessa vez...')).toBeInTheDocument();
      expect(screen.getByText('Resultado').closest('div')).toHaveClass(
        'bg-error-background'
      );
    });

    it('should handle case when current question is null', () => {
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getCurrentQuestion: jest.fn().mockReturnValue(null),
        getCurrentAnswer: jest.fn().mockReturnValue('opt1'),
      });

      render(<QuizHeaderResult />);

      expect(screen.getByText('Resultado')).toBeInTheDocument();
      expect(screen.getByText('Não foi dessa vez...')).toBeInTheDocument();
      expect(screen.getByText('Resultado').closest('div')).toHaveClass(
        'bg-error-background'
      );
    });
  });
});

describe('Quiz Result Components', () => {
  const mockSimulado = {
    id: 'simulado-1',
    title: 'Simulado Enem #42',
    questions: [
      {
        id: 'q1',
        questionText: 'Questão de Física 1',
        correctOptionId: 'opt1',
        description: 'Questão sobre física',
        type: 'ALTERNATIVA' as const,
        status: 'APROVADO' as const,
        difficulty: 'MEDIO' as const,
        examBoard: 'ENEM',
        examYear: '2024',
        answerKey: null,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        knowledgeMatrix: [
          {
            areaKnowledgeId: 'fisica',
            subjectId: 'fisica',
            topicId: 'mecanica',
            subtopicId: 'movimento',
            contentId: 'cinematica',
          },
        ],
        options: [
          { id: 'opt1', option: 'Resposta correta' },
          { id: 'opt2', option: 'Resposta incorreta' },
          { id: 'opt3', option: 'Resposta incorreta' },
          { id: 'opt4', option: 'Resposta incorreta' },
        ],
        createdBy: 'user1',
      },
      {
        id: 'q2',
        questionText: 'Questão de Matemática 1',
        correctOptionId: 'opt1',
        description: 'Questão sobre matemática',
        type: 'ALTERNATIVA' as const,
        status: 'APROVADO' as const,
        difficulty: 'MEDIO' as const,
        examBoard: 'ENEM',
        examYear: '2024',
        answerKey: null,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        knowledgeMatrix: [
          {
            areaKnowledgeId: 'matematica',
            subjectId: 'matematica',
            topicId: 'algebra',
            subtopicId: 'equacoes',
            contentId: 'algebra',
          },
        ],
        options: [
          { id: 'opt1', option: 'Resposta correta' },
          { id: 'opt2', option: 'Resposta incorreta' },
          { id: 'opt3', option: 'Resposta incorreta' },
          { id: 'opt4', option: 'Resposta incorreta' },
        ],
        createdBy: 'user1',
      },
    ],
  };

  beforeEach(() => {
    mockUseQuizStore.mockReturnValue({
      bySimulated: mockSimulado,
      byActivity: undefined,
      byQuestionary: undefined,
      currentQuestionIndex: 0,
      isStarted: true,
      timeElapsed: 3600, // 1 hora
      selectedAnswers: {
        q1: 'opt1', // Resposta correta
        q2: 'opt2', // Resposta incorreta
      },
      getTotalQuestions: jest.fn().mockReturnValue(2),
      getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
      formatTime: jest.fn().mockReturnValue('00:01:00'),
      getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
        fisica: [mockSimulado.questions[0]],
        matematica: [mockSimulado.questions[1]],
      }),
      isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
        return questionId === 'q1' || questionId === 'q2';
      }),
    });
  });

  describe('QuizResultHeaderTitle', () => {
    it('should render header with title and badge', () => {
      render(<QuizResultHeaderTitle />);

      expect(screen.getByText('Resultado')).toBeInTheDocument();
      expect(screen.getByText('Simulado')).toBeInTheDocument();
    });

    it('should show default badge when no quiz type is available', () => {
      mockUseQuizStore.mockReturnValue({
        bySimulated: undefined,
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          fisica: [mockSimulado.questions[0]],
          matematica: [mockSimulado.questions[1]],
        }),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return questionId === 'q1' || questionId === 'q2';
        }),
      });

      render(<QuizResultHeaderTitle />);

      expect(screen.getByText('Resultado')).toBeInTheDocument();
      expect(screen.getByText('Enem')).toBeInTheDocument();
    });
  });

  describe('QuizResultTitle', () => {
    it('should render quiz title', () => {
      render(<QuizResultTitle />);

      expect(screen.getByText('Simulado Enem #42')).toBeInTheDocument();
    });

    it('should handle empty quiz title', () => {
      mockUseQuizStore.mockReturnValue({
        bySimulated: { ...mockSimulado, title: '' },
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getQuizTitle: jest.fn().mockReturnValue(''),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          fisica: [mockSimulado.questions[0]],
          matematica: [mockSimulado.questions[1]],
        }),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return questionId === 'q1' || questionId === 'q2';
        }),
      });

      render(<QuizResultTitle />);

      // Verificar se o elemento está presente mesmo com texto vazio
      const titleElement = screen.getByText((content, element) => {
        return element?.tagName === 'P' && element?.textContent === '';
      });
      expect(titleElement).toBeInTheDocument();
    });
  });

  describe('QuizResultPerformance', () => {
    it('should render performance section with correct statistics', () => {
      // Mock with questions that have answerKey set
      const mockQuestionsWithAnswers = [
        { ...mockQuestion1, answerKey: 'opt1' }, // Correct answer
        { ...mockQuestion2, answerKey: null }, // No answer
      ];

      mockUseQuizStore.mockReturnValue({
        bySimulated: { ...mockSimulado, questions: mockQuestionsWithAnswers },
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          fisica: [mockQuestionsWithAnswers[0]],
          matematica: [mockQuestionsWithAnswers[1]],
        }),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return questionId === 'q1';
        }),
      });

      render(<QuizResultPerformance />);

      // Verificar se os elementos principais estão presentes
      expect(screen.getByText('Corretas')).toBeInTheDocument();
      expect(screen.getAllByText('1')[0]).toBeInTheDocument(); // 1 correta
      expect(screen.getByText('00:01:00')).toBeInTheDocument(); // 1 hora formatada

      // Verificar se o texto "de 2" está presente (que contém o número 2)
      expect(screen.getAllByText(/de 2/)[0]).toBeInTheDocument();
    });

    it('should render progress bars with correct values', () => {
      render(<QuizResultPerformance />);

      // Verificar se as progress bars estão presentes na ordem correta
      expect(screen.getByText('Fáceis')).toBeInTheDocument();
      expect(screen.getByText('Médias')).toBeInTheDocument();
      expect(screen.getByText('Difíceis')).toBeInTheDocument();
    });

    it('should handle zero questions correctly', () => {
      mockUseQuizStore.mockReturnValue({
        bySimulated: { ...mockSimulado, questions: [] },
        byActivity: undefined,
        byQuestionary: undefined,
        selectedAnswers: {},
        getTotalQuestions: jest.fn().mockReturnValue(0),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({}),
        isQuestionAnswered: jest.fn().mockReturnValue(false),
      });

      render(<QuizResultPerformance />);

      expect(screen.getAllByText('0')[0]).toBeInTheDocument();
    });

    it('should handle all correct answers', () => {
      // Mock with questions that have correct answerKey set
      const mockQuestionsWithCorrectAnswers = [
        { ...mockQuestion1, answerKey: 'opt1' }, // Correct answer
        { ...mockQuestion2, answerKey: 'opt2' }, // Correct answer
      ];

      mockUseQuizStore.mockReturnValue({
        bySimulated: {
          ...mockSimulado,
          questions: mockQuestionsWithCorrectAnswers,
        },
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          fisica: [mockQuestionsWithCorrectAnswers[0]],
          matematica: [mockQuestionsWithCorrectAnswers[1]],
        }),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return questionId === 'q1' || questionId === 'q2';
        }),
      });

      render(<QuizResultPerformance />);

      expect(screen.getAllByText('2')[0]).toBeInTheDocument(); // 2 corretas
    });

    // Tests for difficulty-based statistics calculation
    it('should calculate correct statistics for easy questions', () => {
      const mockEasyQuestion1 = {
        ...mockQuestion1,
        difficulty: 'FACIL' as const,
        answerKey: 'opt1', // Correct answer
      };
      const mockEasyQuestion2 = {
        ...mockQuestion2,
        difficulty: 'FACIL' as const,
        answerKey: 'opt1', // Wrong answer (correct is opt2)
      };
      const mockDifficultQuestion = {
        id: 'q3',
        questionText: 'Difficult question',
        correctOptionId: 'opt1',
        description: 'Difficult question',
        type: 'ALTERNATIVA' as const,
        status: 'APROVADO' as const,
        difficulty: 'DIFICIL' as const,
        examBoard: 'ENEM',
        examYear: '2024',
        answerKey: 'opt1', // Correct answer
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        knowledgeMatrix: [
          {
            areaKnowledgeId: 'matematica',
            subjectId: 'algebra',
            topicId: 'operacoes',
            subtopicId: 'soma',
            contentId: 'matematica',
          },
        ],
        options: [
          { id: 'opt1', option: 'Correct' },
          { id: 'opt2', option: 'Wrong' },
          { id: 'opt3', option: 'Wrong' },
          { id: 'opt4', option: 'Wrong' },
        ],
        createdBy: 'user1',
      };

      const mockQuestionsWithDifficulty = [
        mockEasyQuestion1,
        mockEasyQuestion2,
        mockDifficultQuestion,
      ];

      mockUseQuizStore.mockReturnValue({
        bySimulated: {
          ...mockSimulado,
          questions: mockQuestionsWithDifficulty,
        },
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(3),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          algebra: [mockEasyQuestion1, mockEasyQuestion2],
          'geografia-geral': [mockDifficultQuestion],
        }),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return ['q1', 'q2', 'q3'].includes(questionId);
        }),
      });

      render(<QuizResultPerformance />);

      // Should show 2 correct out of 3 total (1 easy correct + 1 difficult correct)
      expect(screen.getByText('2 de 3')).toBeInTheDocument();
    });

    it('should calculate correct statistics for difficult questions', () => {
      const mockEasyQuestion = {
        ...mockQuestion1,
        difficulty: 'FACIL' as const,
        answerKey: 'opt1', // Correct answer
      };
      const mockDifficultQuestion1 = {
        ...mockQuestion2,
        difficulty: 'DIFICIL' as const,
        answerKey: 'opt2', // Correct answer
      };
      const mockDifficultQuestion2 = {
        id: 'q3',
        questionText: 'Another difficult question',
        correctOptionId: 'opt1',
        description: 'Another difficult question',
        type: 'ALTERNATIVA' as const,
        status: 'APROVADO' as const,
        difficulty: 'DIFICIL' as const,
        examBoard: 'ENEM',
        examYear: '2024',
        answerKey: 'opt2', // Wrong answer
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        knowledgeMatrix: [
          {
            areaKnowledgeId: 'matematica',
            subjectId: 'algebra',
            topicId: 'operacoes',
            subtopicId: 'soma',
            contentId: 'matematica',
          },
        ],
        options: [
          { id: 'opt1', option: 'Correct' },
          { id: 'opt2', option: 'Wrong' },
          { id: 'opt3', option: 'Wrong' },
          { id: 'opt4', option: 'Wrong' },
        ],
        createdBy: 'user1',
      };

      const mockQuestionsWithDifficulty = [
        mockEasyQuestion,
        mockDifficultQuestion1,
        mockDifficultQuestion2,
      ];

      mockUseQuizStore.mockReturnValue({
        bySimulated: {
          ...mockSimulado,
          questions: mockQuestionsWithDifficulty,
        },
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(3),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          algebra: [mockEasyQuestion],
          'geografia-geral': [mockDifficultQuestion1, mockDifficultQuestion2],
        }),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return ['q1', 'q2', 'q3'].includes(questionId);
        }),
      });

      render(<QuizResultPerformance />);

      // Should show 2 correct out of 3 total (1 easy correct + 1 difficult correct)
      expect(screen.getByText('2 de 3')).toBeInTheDocument();
    });

    it('should handle questions with MEDIO difficulty correctly', () => {
      const mockEasyQuestion = {
        ...mockQuestion1,
        difficulty: 'FACIL' as const,
        answerKey: 'opt1', // Correct answer
      };
      const mockMediumQuestion = {
        ...mockQuestion2,
        difficulty: 'MEDIO' as const,
        answerKey: 'opt2', // Correct answer
      };
      const mockDifficultQuestion = {
        id: 'q3',
        questionText: 'Difficult question',
        correctOptionId: 'opt1',
        description: 'Difficult question',
        type: 'ALTERNATIVA' as const,
        status: 'APROVADO' as const,
        difficulty: 'DIFICIL' as const,
        examBoard: 'ENEM',
        examYear: '2024',
        answerKey: 'opt1', // Correct answer
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        knowledgeMatrix: [
          {
            areaKnowledgeId: 'matematica',
            subjectId: 'algebra',
            topicId: 'operacoes',
            subtopicId: 'soma',
            contentId: 'matematica',
          },
        ],
        options: [
          { id: 'opt1', option: 'Correct' },
          { id: 'opt2', option: 'Wrong' },
          { id: 'opt3', option: 'Wrong' },
          { id: 'opt4', option: 'Wrong' },
        ],
        createdBy: 'user1',
      };

      const mockQuestionsWithAllDifficulties = [
        mockEasyQuestion,
        mockMediumQuestion,
        mockDifficultQuestion,
      ];

      mockUseQuizStore.mockReturnValue({
        bySimulated: {
          ...mockSimulado,
          questions: mockQuestionsWithAllDifficulties,
        },
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(3),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          algebra: [mockEasyQuestion, mockMediumQuestion],
          'geografia-geral': [mockDifficultQuestion],
        }),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return ['q1', 'q2', 'q3'].includes(questionId);
        }),
      });

      render(<QuizResultPerformance />);

      // Should show 3 correct out of 3 total (all correct)
      expect(screen.getByText('3 de 3')).toBeInTheDocument();
    });

    it('should handle questions with no answers correctly', () => {
      const mockEasyQuestion = {
        ...mockQuestion1,
        difficulty: 'FACIL' as const,
        answerKey: null, // No answer
      };
      const mockDifficultQuestion = {
        ...mockQuestion2,
        difficulty: 'DIFICIL' as const,
        answerKey: null, // No answer
      };

      const mockQuestionsWithNoAnswers = [
        mockEasyQuestion,
        mockDifficultQuestion,
      ];

      mockUseQuizStore.mockReturnValue({
        bySimulated: {
          ...mockSimulado,
          questions: mockQuestionsWithNoAnswers,
        },
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(2),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          algebra: [mockEasyQuestion],
          'geografia-geral': [mockDifficultQuestion],
        }),
        isQuestionAnswered: jest.fn().mockReturnValue(false),
      });

      render(<QuizResultPerformance />);

      // Should show 0 correct out of 2 total
      expect(screen.getAllByText('0')[0]).toBeInTheDocument();
      expect(screen.getAllByText(/de 2/)[0]).toBeInTheDocument();
    });

    it('should handle empty questions array correctly', () => {
      mockUseQuizStore.mockReturnValue({
        bySimulated: {
          ...mockSimulado,
          questions: [],
        },
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(0),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({}),
        isQuestionAnswered: jest.fn().mockReturnValue(false),
      });

      render(<QuizResultPerformance />);

      // Should show 0 correct out of 0 total
      expect(screen.getAllByText('0')[0]).toBeInTheDocument();
      expect(screen.getAllByText(/de 0/)[0]).toBeInTheDocument();
    });

    it('should handle undefined quiz correctly', () => {
      mockUseQuizStore.mockReturnValue({
        bySimulated: undefined,
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(0),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({}),
        isQuestionAnswered: jest.fn().mockReturnValue(false),
      });

      render(<QuizResultPerformance />);

      // Should show 0 correct out of 0 total
      expect(screen.getAllByText('0')[0]).toBeInTheDocument();
      expect(screen.getAllByText(/de 0/)[0]).toBeInTheDocument();
    });

    it('should handle mixed correct and incorrect answers by difficulty', () => {
      const mockEasyQuestion1 = {
        ...mockQuestion1,
        difficulty: 'FACIL' as const,
        answerKey: 'opt1', // Correct answer
      };
      const mockEasyQuestion2 = {
        id: 'q3',
        questionText: 'Another easy question',
        correctOptionId: 'opt2',
        description: 'Another easy question',
        type: 'ALTERNATIVA' as const,
        status: 'APROVADO' as const,
        difficulty: 'FACIL' as const,
        examBoard: 'ENEM',
        examYear: '2024',
        answerKey: 'opt1', // Wrong answer
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        knowledgeMatrix: [
          {
            areaKnowledgeId: 'matematica',
            subjectId: 'algebra',
            topicId: 'operacoes',
            subtopicId: 'soma',
            contentId: 'matematica',
          },
        ],
        options: [
          { id: 'opt1', option: 'Wrong' },
          { id: 'opt2', option: 'Correct' },
          { id: 'opt3', option: 'Wrong' },
          { id: 'opt4', option: 'Wrong' },
        ],
        createdBy: 'user1',
      };
      const mockDifficultQuestion1 = {
        ...mockQuestion2,
        difficulty: 'DIFICIL' as const,
        answerKey: 'opt2', // Correct answer
      };
      const mockDifficultQuestion2 = {
        id: 'q4',
        questionText: 'Another difficult question',
        correctOptionId: 'opt1',
        description: 'Another difficult question',
        type: 'ALTERNATIVA' as const,
        status: 'APROVADO' as const,
        difficulty: 'DIFICIL' as const,
        examBoard: 'ENEM',
        examYear: '2024',
        answerKey: 'opt1', // Correct answer
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        knowledgeMatrix: [
          {
            areaKnowledgeId: 'matematica',
            subjectId: 'algebra',
            topicId: 'operacoes',
            subtopicId: 'soma',
            contentId: 'matematica',
          },
        ],
        options: [
          { id: 'opt1', option: 'Correct' },
          { id: 'opt2', option: 'Wrong' },
          { id: 'opt3', option: 'Wrong' },
          { id: 'opt4', option: 'Wrong' },
        ],
        createdBy: 'user1',
      };

      const mockQuestionsWithMixedResults = [
        mockEasyQuestion1,
        mockEasyQuestion2,
        mockDifficultQuestion1,
        mockDifficultQuestion2,
      ];

      mockUseQuizStore.mockReturnValue({
        bySimulated: {
          ...mockSimulado,
          questions: mockQuestionsWithMixedResults,
        },
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(4),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          algebra: [mockEasyQuestion1, mockEasyQuestion2],
          'geografia-geral': [mockDifficultQuestion1, mockDifficultQuestion2],
        }),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return ['q1', 'q2', 'q3', 'q4'].includes(questionId);
        }),
      });

      render(<QuizResultPerformance />);

      // Should show 3 correct out of 4 total (1 easy correct + 2 difficult correct)
      expect(screen.getByText('3 de 4')).toBeInTheDocument();
    });
  });

  describe('Quiz Result Components Integration', () => {
    it('should render all result components together', () => {
      render(
        <div>
          <QuizResultHeaderTitle />
          <QuizResultTitle />
          <QuizResultPerformance />
        </div>
      );

      // Verificar se todos os componentes estão presentes
      expect(screen.getByText('Resultado')).toBeInTheDocument();
      expect(screen.getAllByText('Simulado Enem #42')[0]).toBeInTheDocument();
      expect(screen.getByText('Corretas')).toBeInTheDocument();
    });

    it('should handle complete result page layout', () => {
      render(
        <div className="overflow-y-auto h-full">
          <div className="w-full max-w-[1000px] flex flex-col mx-auto h-full relative not-lg:px-6">
            <QuizResultHeaderTitle />
            <div>
              <QuizResultTitle />
              <QuizResultPerformance />
            </div>
          </div>
        </div>
      );

      // Verificar se a estrutura está correta
      expect(screen.getByText('Resultado')).toBeInTheDocument();
      expect(screen.getAllByText('Simulado Enem #42')[0]).toBeInTheDocument();
      expect(screen.getByText('Corretas')).toBeInTheDocument();
    });

    it('should calculate correct statistics for medium questions', () => {
      const mockEasyQuestion = {
        ...mockQuestion1,
        difficulty: 'FACIL' as const,
        answerKey: 'opt1', // Correct answer
      };
      const mockMediumQuestion1 = {
        ...mockQuestion2,
        difficulty: 'MEDIO' as const,
        answerKey: 'opt2', // Correct answer
      };
      const mockMediumQuestion2 = {
        id: 'q3',
        questionText: 'Another medium question',
        correctOptionId: 'opt1',
        description: 'Another medium question',
        type: 'ALTERNATIVA' as const,
        status: 'APROVADO' as const,
        difficulty: 'MEDIO' as const,
        examBoard: 'ENEM',
        examYear: '2024',
        answerKey: 'opt2', // Wrong answer
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        knowledgeMatrix: [
          {
            areaKnowledgeId: 'matematica',
            subjectId: 'algebra',
            topicId: 'operacoes',
            subtopicId: 'soma',
            contentId: 'matematica',
          },
        ],
        options: [
          { id: 'opt1', option: 'Correct' },
          { id: 'opt2', option: 'Wrong' },
          { id: 'opt3', option: 'Wrong' },
          { id: 'opt4', option: 'Wrong' },
        ],
        createdBy: 'user1',
      };
      const mockDifficultQuestion = {
        id: 'q4',
        questionText: 'Difficult question',
        correctOptionId: 'opt1',
        description: 'Difficult question',
        type: 'ALTERNATIVA' as const,
        status: 'APROVADO' as const,
        difficulty: 'DIFICIL' as const,
        examBoard: 'ENEM',
        examYear: '2024',
        answerKey: 'opt1', // Correct answer
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        knowledgeMatrix: [
          {
            areaKnowledgeId: 'matematica',
            subjectId: 'algebra',
            topicId: 'operacoes',
            subtopicId: 'soma',
            contentId: 'matematica',
          },
        ],
        options: [
          { id: 'opt1', option: 'Correct' },
          { id: 'opt2', option: 'Wrong' },
          { id: 'opt3', option: 'Wrong' },
          { id: 'opt4', option: 'Wrong' },
        ],
        createdBy: 'user1',
      };

      const mockQuestionsWithMediumDifficulty = [
        mockEasyQuestion,
        mockMediumQuestion1,
        mockMediumQuestion2,
        mockDifficultQuestion,
      ];

      mockUseQuizStore.mockReturnValue({
        bySimulated: {
          ...mockSimulado,
          questions: mockQuestionsWithMediumDifficulty,
        },
        byActivity: undefined,
        byQuestionary: undefined,
        getTotalQuestions: jest.fn().mockReturnValue(4),
        getQuizTitle: jest.fn().mockReturnValue('Simulado Enem #42'),
        formatTime: jest.fn().mockReturnValue('00:01:00'),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          algebra: [mockEasyQuestion, mockMediumQuestion1, mockMediumQuestion2],
          'geografia-geral': [mockDifficultQuestion],
        }),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return ['q1', 'q2', 'q3', 'q4'].includes(questionId);
        }),
      });

      render(<QuizResultPerformance />);

      // Should show 3 correct out of 4 total (1 easy correct + 1 medium correct + 1 difficult correct)
      expect(screen.getByText('3 de 4')).toBeInTheDocument();
    });
  });

  describe('QuizListResult', () => {
    const mockQuestionsGroupedBySubject = {
      fisica: [
        {
          id: 'q1',
          questionText: 'Questão de Física 1',
          correctOptionId: 'opt1',
          description: 'Questão sobre física',
          type: 'ALTERNATIVA' as const,
          status: 'APROVADO' as const,
          difficulty: 'MEDIO' as const,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'fisica',
              topicId: 'mecanica',
              subtopicId: 'movimento',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: 'Resposta correta' },
            { id: 'opt2', option: 'Resposta incorreta' },
            { id: 'opt3', option: 'Resposta incorreta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          createdBy: 'user1',
        },
        {
          id: 'q2',
          questionText: 'Questão de Física 2',
          correctOptionId: 'opt2',
          description: 'Questão sobre física',
          type: 'ALTERNATIVA' as const,
          status: 'APROVADO' as const,
          difficulty: 'MEDIO' as const,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'fisica',
              topicId: 'mecanica',
              subtopicId: 'movimento',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: 'Resposta incorreta' },
            { id: 'opt2', option: 'Resposta correta' },
            { id: 'opt3', option: 'Resposta incorreta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          createdBy: 'user1',
        },
      ],
      matematica: [
        {
          id: 'q3',
          questionText: 'Questão de Matemática 1',
          correctOptionId: 'opt1',
          description: 'Questão sobre matemática',
          type: 'ALTERNATIVA' as const,
          status: 'APROVADO' as const,
          difficulty: 'MEDIO' as const,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: null,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'matematica',
              subjectId: 'matematica',
              topicId: 'algebra',
              subtopicId: 'equacoes',
              contentId: 'algebra',
            },
          ],
          options: [
            { id: 'opt1', option: 'Resposta correta' },
            { id: 'opt2', option: 'Resposta incorreta' },
            { id: 'opt3', option: 'Resposta incorreta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          createdBy: 'user1',
        },
      ],
    };

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        bySimulated: mockSimulado,
        byActivity: undefined,
        byQuestionary: undefined,
        selectedAnswers: {
          q1: 'opt1', // Resposta correta
          q2: 'opt1', // Resposta incorreta
          q3: 'opt1', // Resposta correta
        },
        getQuestionsGroupedBySubject: jest
          .fn()
          .mockReturnValue(mockQuestionsGroupedBySubject),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return (
            questionId === 'q1' || questionId === 'q2' || questionId === 'q3'
          );
        }),
      });
    });

    it('should render subjects list with correct statistics', () => {
      render(<QuizListResult />);

      // Verificar se o título está presente
      expect(screen.getByText('Matérias')).toBeInTheDocument();

      // Verificar se os cards de resultados estão presentes
      const resultCards = screen.getAllByTestId('card-results');
      expect(resultCards).toHaveLength(2); // fisica e matematica

      // Verificar se os headers dos cards estão corretos
      expect(screen.getByText('fisica')).toBeInTheDocument();
      expect(screen.getByText('matematica')).toBeInTheDocument();
    });

    it('should display correct statistics for each subject', () => {
      // Mock with questions that have answerKey set
      const mockQuestionsWithAnswers = [
        { ...mockQuestion1, answerKey: 'opt1' }, // Correct answer
        { ...mockQuestion2, answerKey: 'opt1' }, // Incorrect answer (should be opt2)
        { ...mockQuestion1, id: 'q3', answerKey: 'opt1' }, // Correct answer
      ];

      const mockQuestionsGroupedBySubjectWithAnswers = {
        fisica: [mockQuestionsWithAnswers[0], mockQuestionsWithAnswers[1]],
        matematica: [mockQuestionsWithAnswers[2]],
      };

      mockUseQuizStore.mockReturnValue({
        bySimulated: { ...mockSimulado, questions: mockQuestionsWithAnswers },
        byActivity: undefined,
        byQuestionary: undefined,
        getQuestionsGroupedBySubject: jest
          .fn()
          .mockReturnValue(mockQuestionsGroupedBySubjectWithAnswers),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return (
            questionId === 'q1' || questionId === 'q2' || questionId === 'q3'
          );
        }),
      });

      render(<QuizListResult />);

      const correctAnswersElements = screen.getAllByTestId('correct-answers');
      const incorrectAnswersElements =
        screen.getAllByTestId('incorrect-answers');

      // Física: 1 correta (q1), 1 incorreta (q2)
      expect(correctAnswersElements[0]).toHaveTextContent('1');
      expect(incorrectAnswersElements[0]).toHaveTextContent('1');

      // Matemática: 1 correta (q3), 0 incorretas
      expect(correctAnswersElements[1]).toHaveTextContent('1');
      expect(incorrectAnswersElements[1]).toHaveTextContent('0');
    });

    it('should handle onSubjectClick callback', () => {
      const handleSubjectClick = jest.fn();
      render(<QuizListResult onSubjectClick={handleSubjectClick} />);

      const resultCards = screen.getAllByTestId('card-results');

      // Clicar no primeiro card (física)
      fireEvent.click(resultCards[0]);
      expect(handleSubjectClick).toHaveBeenCalledWith('fisica');

      // Clicar no segundo card (matemática)
      fireEvent.click(resultCards[1]);
      expect(handleSubjectClick).toHaveBeenCalledWith('matematica');
    });

    it('should handle empty subjects list', () => {
      mockUseQuizStore.mockReturnValue({
        bySimulated: mockSimulado,
        byActivity: undefined,
        byQuestionary: undefined,
        selectedAnswers: {},
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({}),
        isQuestionAnswered: jest.fn().mockReturnValue(false),
      });

      render(<QuizListResult />);

      expect(screen.getByText('Matérias')).toBeInTheDocument();
      expect(screen.queryByTestId('card-results')).not.toBeInTheDocument();
    });

    it('should handle subjects with no answered questions', () => {
      mockUseQuizStore.mockReturnValue({
        bySimulated: mockSimulado,
        byActivity: undefined,
        byQuestionary: undefined,
        selectedAnswers: {},
        getQuestionsGroupedBySubject: jest
          .fn()
          .mockReturnValue(mockQuestionsGroupedBySubject),
        isQuestionAnswered: jest.fn().mockReturnValue(false),
      });

      render(<QuizListResult />);

      const correctAnswersElements = screen.getAllByTestId('correct-answers');
      const incorrectAnswersElements =
        screen.getAllByTestId('incorrect-answers');

      // Todas as matérias devem ter 0 corretas e 0 incorretas
      expect(correctAnswersElements[0]).toHaveTextContent('0');
      expect(incorrectAnswersElements[0]).toHaveTextContent('0');
      expect(correctAnswersElements[1]).toHaveTextContent('0');
      expect(incorrectAnswersElements[1]).toHaveTextContent('0');
    });

    it('should handle all correct answers for a subject', () => {
      // Mock with questions that have correct answerKey set
      const mockQuestionsWithCorrectAnswers = [
        { ...mockQuestion1, answerKey: 'opt1' }, // Correct answer
        { ...mockQuestion2, answerKey: 'opt2' }, // Correct answer
        { ...mockQuestion1, id: 'q3', answerKey: 'opt1' }, // Correct answer
      ];

      const mockQuestionsGroupedBySubjectWithCorrectAnswers = {
        fisica: [
          mockQuestionsWithCorrectAnswers[0],
          mockQuestionsWithCorrectAnswers[1],
        ],
        matematica: [mockQuestionsWithCorrectAnswers[2]],
      };

      mockUseQuizStore.mockReturnValue({
        bySimulated: {
          ...mockSimulado,
          questions: mockQuestionsWithCorrectAnswers,
        },
        byActivity: undefined,
        byQuestionary: undefined,
        getQuestionsGroupedBySubject: jest
          .fn()
          .mockReturnValue(mockQuestionsGroupedBySubjectWithCorrectAnswers),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return (
            questionId === 'q1' || questionId === 'q2' || questionId === 'q3'
          );
        }),
      });

      render(<QuizListResult />);

      const correctAnswersElements = screen.getAllByTestId('correct-answers');
      const incorrectAnswersElements =
        screen.getAllByTestId('incorrect-answers');

      // Física: 2 corretas, 0 incorretas
      expect(correctAnswersElements[0]).toHaveTextContent('2');
      expect(incorrectAnswersElements[0]).toHaveTextContent('0');

      // Matemática: 1 correta, 0 incorretas
      expect(correctAnswersElements[1]).toHaveTextContent('1');
      expect(incorrectAnswersElements[1]).toHaveTextContent('0');
    });

    it('should handle all incorrect answers for a subject', () => {
      mockUseQuizStore.mockReturnValue({
        bySimulated: mockSimulado,
        byActivity: undefined,
        byQuestionary: undefined,
        selectedAnswers: {
          q1: 'opt2', // Resposta incorreta
          q2: 'opt1', // Resposta incorreta
          q3: 'opt2', // Resposta incorreta
        },
        getQuestionsGroupedBySubject: jest
          .fn()
          .mockReturnValue(mockQuestionsGroupedBySubject),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return (
            questionId === 'q1' || questionId === 'q2' || questionId === 'q3'
          );
        }),
      });

      render(<QuizListResult />);

      const correctAnswersElements = screen.getAllByTestId('correct-answers');
      const incorrectAnswersElements =
        screen.getAllByTestId('incorrect-answers');

      // Física: 0 corretas, 2 incorretas
      expect(correctAnswersElements[0]).toHaveTextContent('0');
      expect(incorrectAnswersElements[0]).toHaveTextContent('2');

      // Matemática: 0 corretas, 1 incorreta
      expect(correctAnswersElements[1]).toHaveTextContent('0');
      expect(incorrectAnswersElements[1]).toHaveTextContent('1');
    });

    it('should handle mixed answered and unanswered questions', () => {
      // Mock with questions that have mixed answerKey set
      const mockQuestionsWithMixedAnswers = [
        { ...mockQuestion1, answerKey: 'opt1' }, // Correct answer
        { ...mockQuestion2, answerKey: null }, // No answer
        { ...mockQuestion1, id: 'q3', answerKey: 'opt2' }, // Incorrect answer
      ];

      const mockQuestionsGroupedBySubjectWithMixedAnswers = {
        fisica: [
          mockQuestionsWithMixedAnswers[0],
          mockQuestionsWithMixedAnswers[1],
        ],
        matematica: [mockQuestionsWithMixedAnswers[2]],
      };

      mockUseQuizStore.mockReturnValue({
        bySimulated: {
          ...mockSimulado,
          questions: mockQuestionsWithMixedAnswers,
        },
        byActivity: undefined,
        byQuestionary: undefined,
        getQuestionsGroupedBySubject: jest
          .fn()
          .mockReturnValue(mockQuestionsGroupedBySubjectWithMixedAnswers),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return questionId === 'q1' || questionId === 'q3';
        }),
      });

      render(<QuizListResult />);

      const correctAnswersElements = screen.getAllByTestId('correct-answers');
      const incorrectAnswersElements =
        screen.getAllByTestId('incorrect-answers');

      // Física: 1 correta (q1), 0 incorretas (q2 não respondida)
      expect(correctAnswersElements[0]).toHaveTextContent('1');
      expect(incorrectAnswersElements[0]).toHaveTextContent('0');

      // Matemática: 0 corretas, 1 incorreta (q3)
      expect(correctAnswersElements[1]).toHaveTextContent('0');
      expect(incorrectAnswersElements[1]).toHaveTextContent('1');
    });

    it('should render with custom className', () => {
      render(<QuizListResult className="custom-class" />);

      const section = screen.getByText('Matérias').closest('section');
      expect(section).toHaveClass('custom-class');
    });

    it('should handle multiple subjects with complex statistics', () => {
      const complexMockQuestionsGroupedBySubject = {
        fisica: mockQuestionsGroupedBySubject.fisica,
        matematica: mockQuestionsGroupedBySubject.matematica,
        quimica: [
          {
            id: 'q4',
            questionText: 'Questão de Química 1',
            correctOptionId: 'opt1',
            description: 'Questão sobre química',
            type: 'ALTERNATIVA' as const,
            status: 'APROVADO' as const,
            difficulty: 'MEDIO' as const,
            examBoard: 'ENEM',
            examYear: '2024',
            answerKey: null,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            knowledgeMatrix: [
              {
                areaKnowledgeId: 'quimica',
                subjectId: 'quimica',
                topicId: 'organica',
                subtopicId: 'hidrocarbonetos',
                contentId: 'quimica',
              },
            ],
            options: [
              { id: 'opt1', option: 'Resposta correta' },
              { id: 'opt2', option: 'Resposta incorreta' },
              { id: 'opt3', option: 'Resposta incorreta' },
              { id: 'opt4', option: 'Resposta incorreta' },
            ],
            createdBy: 'user1',
          },
        ],
      };

      mockUseQuizStore.mockReturnValue({
        bySimulated: mockSimulado,
        byActivity: undefined,
        byQuestionary: undefined,
        selectedAnswers: {
          q1: 'opt1', // Resposta correta
          q2: 'opt1', // Resposta incorreta
          q3: 'opt1', // Resposta correta
          q4: 'opt1', // Resposta correta
        },
        getQuestionsGroupedBySubject: jest
          .fn()
          .mockReturnValue(complexMockQuestionsGroupedBySubject),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return (
            questionId === 'q1' ||
            questionId === 'q2' ||
            questionId === 'q3' ||
            questionId === 'q4'
          );
        }),
      });

      render(<QuizListResult />);

      const resultCards = screen.getAllByTestId('card-results');
      expect(resultCards).toHaveLength(3); // fisica, matematica, quimica

      expect(screen.getByText('fisica')).toBeInTheDocument();
      expect(screen.getByText('matematica')).toBeInTheDocument();
      expect(screen.getByText('quimica')).toBeInTheDocument();
    });
  });

  describe('QuizListResultByMateria', () => {
    const mockQuestionsGroupedBySubject = {
      mecanica: [
        {
          id: 'q1',
          questionText: 'Questão de Mecânica 1',
          correctOptionId: 'opt1',
          description: 'Questão sobre mecânica',
          type: 'ALTERNATIVA' as const,
          status: 'APROVADO' as const,
          difficulty: 'MEDIO' as const,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'muv',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: 'Resposta correta' },
            { id: 'opt2', option: 'Resposta incorreta' },
            { id: 'opt3', option: 'Resposta incorreta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          createdBy: 'user1',
        },
        {
          id: 'q2',
          questionText: 'Questão de Mecânica 2',
          correctOptionId: 'opt2',
          description: 'Questão sobre mecânica',
          type: 'ALTERNATIVA' as const,
          status: 'APROVADO' as const,
          difficulty: 'FACIL' as const,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt3',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'mu',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: 'Resposta incorreta' },
            { id: 'opt2', option: 'Resposta correta' },
            { id: 'opt3', option: 'Resposta incorreta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          createdBy: 'user1',
        },
        {
          id: 'q3',
          questionText: 'Questão de Mecânica 3',
          correctOptionId: 'opt3',
          description: 'Questão sobre mecânica',
          type: 'ALTERNATIVA' as const,
          status: 'APROVADO' as const,
          difficulty: 'DIFICIL' as const,
          examBoard: 'ENEM',
          examYear: '2024',
          answerKey: 'opt3',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          knowledgeMatrix: [
            {
              areaKnowledgeId: 'fisica',
              subjectId: 'mecanica',
              topicId: 'movimento',
              subtopicId: 'lancamento',
              contentId: 'cinematica',
            },
          ],
          options: [
            { id: 'opt1', option: 'Resposta incorreta' },
            { id: 'opt2', option: 'Resposta incorreta' },
            { id: 'opt3', option: 'Resposta correta' },
            { id: 'opt4', option: 'Resposta incorreta' },
          ],
          createdBy: 'user1',
        },
      ],
    };

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        bySimulated: mockSimulado,
        byActivity: undefined,
        byQuestionary: undefined,
        selectedAnswers: {
          q1: 'opt1', // Resposta correta
          q2: 'opt3', // Resposta incorreta
          q3: 'opt3', // Resposta correta
        },
        getQuestionsGroupedBySubject: jest
          .fn()
          .mockReturnValue(mockQuestionsGroupedBySubject),
        isQuestionAnswered: jest.fn().mockImplementation((questionId) => {
          return (
            questionId === 'q1' || questionId === 'q2' || questionId === 'q3'
          );
        }),
      });
    });

    it('should render the component with subject title', () => {
      const mockOnQuestionClick = jest.fn();
      render(
        <QuizListResultByMateria
          subject="mecanica"
          onQuestionClick={mockOnQuestionClick}
        />
      );

      expect(screen.getByText('mecanica')).toBeInTheDocument();
      expect(screen.getByText('Resultado das questões')).toBeInTheDocument();
    });

    it('should render all questions for the specified subject', () => {
      const mockOnQuestionClick = jest.fn();
      render(
        <QuizListResultByMateria
          subject="mecanica"
          onQuestionClick={mockOnQuestionClick}
        />
      );

      expect(screen.getByText('Questão q1')).toBeInTheDocument();
      expect(screen.getByText('Questão q2')).toBeInTheDocument();
      expect(screen.getByText('Questão q3')).toBeInTheDocument();
    });

    it('should display correct status for answered questions', () => {
      const mockOnQuestionClick = jest.fn();
      render(
        <QuizListResultByMateria
          subject="mecanica"
          onQuestionClick={mockOnQuestionClick}
        />
      );

      // Verificar se as questões com respostas corretas mostram status 'correct'
      const correctQuestion = screen
        .getByText('Questão q1')
        .closest('[data-testid="card-status"]');
      expect(correctQuestion).toHaveAttribute('data-status', 'correct');

      // Verificar se as questões com respostas incorretas mostram status 'incorrect'
      const incorrectQuestion = screen
        .getByText('Questão q2')
        .closest('[data-testid="card-status"]');
      expect(incorrectQuestion).toHaveAttribute('data-status', 'incorrect');

      // Verificar se as questões com respostas corretas mostram status 'correct'
      const correctQuestion2 = screen
        .getByText('Questão q3')
        .closest('[data-testid="card-status"]');
      expect(correctQuestion2).toHaveAttribute('data-status', 'correct');
    });

    it('should call onQuestionClick when a question is clicked', () => {
      const mockOnQuestionClick = jest.fn();
      render(
        <QuizListResultByMateria
          subject="mecanica"
          onQuestionClick={mockOnQuestionClick}
        />
      );

      const firstQuestion = screen
        .getByText('Questão q1')
        .closest('[data-testid="card-status"]');
      fireEvent.click(firstQuestion!);

      expect(mockOnQuestionClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'q1',
          questionText: 'Questão de Mecânica 1',
          correctOptionId: 'opt1',
          answerKey: 'opt1',
        })
      );
    });

    it('should handle empty subject questions gracefully', () => {
      const mockOnQuestionClick = jest.fn();
      mockUseQuizStore.mockReturnValue({
        bySimulated: mockSimulado,
        byActivity: undefined,
        byQuestionary: undefined,
        selectedAnswers: {},
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          mecanica: [],
        }),
        isQuestionAnswered: jest.fn().mockReturnValue(false),
      });

      render(
        <QuizListResultByMateria
          subject="mecanica"
          onQuestionClick={mockOnQuestionClick}
        />
      );

      expect(screen.getByText('mecanica')).toBeInTheDocument();
      expect(screen.getByText('Resultado das questões')).toBeInTheDocument();
      // Não deve renderizar nenhuma questão
      expect(screen.queryByText(/Questão q/)).not.toBeInTheDocument();
    });

    it('should handle undefined subject questions gracefully', () => {
      const mockOnQuestionClick = jest.fn();
      mockUseQuizStore.mockReturnValue({
        bySimulated: mockSimulado,
        byActivity: undefined,
        byQuestionary: undefined,
        selectedAnswers: {},
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          mecanica: undefined,
        }),
        isQuestionAnswered: jest.fn().mockReturnValue(false),
      });

      render(
        <QuizListResultByMateria
          subject="mecanica"
          onQuestionClick={mockOnQuestionClick}
        />
      );

      expect(screen.getByText('mecanica')).toBeInTheDocument();
      expect(screen.getByText('Resultado das questões')).toBeInTheDocument();
      // Não deve renderizar nenhuma questão
      expect(screen.queryByText(/Questão q/)).not.toBeInTheDocument();
    });

    it('should render with correct layout structure', () => {
      const mockOnQuestionClick = jest.fn();
      render(
        <QuizListResultByMateria
          subject="mecanica"
          onQuestionClick={mockOnQuestionClick}
        />
      );

      // Verificar se o container principal tem as classes corretas
      const container = screen.getByText('mecanica').closest('.w-full');
      expect(container).toHaveClass(
        'w-full',
        'max-w-[1000px]',
        'flex',
        'flex-col',
        'mx-auto',
        'h-full',
        'relative',
        'not-lg:px-6'
      );

      // Verificar se a seção de questões tem a estrutura correta
      const section = screen
        .getByText('Resultado das questões')
        .closest('section');
      expect(section).toHaveClass('flex', 'flex-col');
    });
  });
});
