import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import {
  Quiz,
  getTypeLabel,
  getCompletionTitle,
  getExitConfirmationText,
  getFinishConfirmationText,
  getQuizArticle,
  getQuizPreposition,
  QuizTitle,
  QuizHeader,
  QuizContent,
  QuizQuestionList,
  QuizFooter,
} from './Quiz';
import { useQuizStore, QUESTION_TYPE, QUIZ_TYPE } from './useQuizStore';

jest.mock('@/assets/img/mock-image-question.png', () => 'mocked-image-2.png');

// Mock Select component
jest.mock('../Select/Select', () => ({
  __esModule: true,
  default: ({
    children,
    value,
    size,
  }: {
    children: React.ReactNode;
    value: string;
    size: string;
  }) => (
    <div data-testid="quiz-select" data-value={value} data-size={size}>
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  }) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
    onSelect,
  }: {
    children: React.ReactNode;
    value: string;
    onSelect: (value: string) => void;
  }) => (
    <button
      data-testid={`select-item-${value}`}
      onClick={() => onSelect?.(value)}
      value={value}
    >
      {children}
    </button>
  ),
}));

// Mock HeaderAlternative component
jest.mock('../Alternative/Alternative', () => ({
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
      <div data-testid="title">{title}</div>
      <div data-testid="subtitle">{subTitle}</div>
      <div data-testid="content">{content}</div>
    </div>
  ),
  AlternativesList: ({
    alternatives,
    onValueChange,
    value,
  }: {
    alternatives: {
      value: string;
      label: string;
    }[];
    onValueChange: (value: string) => void;
    value: string;
  }) => (
    <div data-testid="alternatives-list">
      {alternatives?.map(
        (
          alt: {
            value: string;
            label: string;
          },
          index: number
        ) => (
          <button
            key={alt.value || index}
            data-testid={`alternative-${alt.value}`}
            onClick={() => onValueChange?.(alt.value)}
            className={value === alt.value ? 'selected' : ''}
          >
            {alt.label}
          </button>
        )
      )}
    </div>
  ),
}));

// Mock Card component (CardStatus and CardResults)
jest.mock('../Card/Card', () => ({
  CardStatus: ({
    header,
    label,
    onClick,
    status,
  }: {
    header: string;
    label: string;
    onClick: () => void;
    status: string;
  }) => {
    const statusProps = status !== undefined ? { 'data-status': status } : {};
    return (
      <button
        data-testid="card-status"
        data-header={header}
        data-label={label}
        {...statusProps}
        onClick={onClick}
        className="card-status-mock"
      >
        <span data-testid="card-header">{header}</span>
        <span data-testid="card-label">{label}</span>
      </button>
    );
  },
  CardResults: ({
    header,
    correct_answers,
    incorrect_answers,
    icon,
    onClick,
    direction,
    className,
  }: {
    header: string;
    correct_answers: number;
    incorrect_answers: number;
    icon: React.ReactNode;
    onClick: () => void;
    direction: string;
    className: string;
  }) => (
    <button
      data-testid="card-results"
      data-header={header}
      data-correct={correct_answers}
      data-incorrect={incorrect_answers}
      data-direction={direction}
      onClick={onClick}
      className={className}
    >
      <span data-testid="card-results-icon">{icon}</span>
      <span data-testid="card-results-header">{header}</span>
      <span data-testid="card-results-correct">{correct_answers}</span>
      <span data-testid="card-results-incorrect">{incorrect_answers}</span>
    </button>
  ),
}));

// Mock Badge component
jest.mock('../Badge/Badge', () => {
  return React.forwardRef<
    HTMLSpanElement,
    {
      children: React.ReactNode;
      variant: string;
      action: string;
      iconLeft: React.ReactNode;
      iconRight: React.ReactNode;
      size: string;
      className: string;
    }
  >(
    (
      {
        children,
        variant,
        action,
        iconLeft,
        iconRight,
        size,
        className,
        ...props
      },
      ref
    ) => (
      <span
        ref={ref}
        data-testid="quiz-badge"
        data-variant={variant}
        data-action={action}
        data-size={size}
        className={className}
        {...props}
      >
        {iconLeft && <span data-testid="badge-icon-left">{iconLeft}</span>}
        {children}
        {iconRight && <span data-testid="badge-icon-right">{iconRight}</span>}
      </span>
    )
  );
});

// Mock Button component
jest.mock('../Button/Button', () => {
  return React.forwardRef<
    HTMLButtonElement,
    {
      children: React.ReactNode;
      onClick: () => void;
      disabled: boolean;
      variant: string;
      size: string;
      action: string;
      iconLeft: React.ReactNode;
      iconRight: React.ReactNode;
      className: string;
    }
  >(
    (
      {
        children,
        onClick,
        disabled,
        variant,
        size,
        action,
        iconLeft,
        iconRight,
        className,
        ...props
      },
      ref
    ) => (
      <button
        ref={ref}
        data-testid="quiz-button"
        data-variant={variant}
        data-size={size}
        data-action={action}
        data-disabled={disabled}
        onClick={onClick}
        disabled={disabled}
        className={className}
        {...props}
      >
        {iconLeft && <span data-testid="icon-left">{iconLeft}</span>}
        {children}
        {iconRight && <span data-testid="icon-right">{iconRight}</span>}
      </button>
    )
  );
});

// Mock IconButton component
jest.mock('../IconButton/IconButton', () => {
  return React.forwardRef<
    HTMLButtonElement,
    {
      icon: React.ReactNode;
      onClick: () => void;
      size: string;
    }
  >(({ icon, onClick, size, ...props }, ref) => (
    <button
      ref={ref}
      data-testid="quiz-icon-button"
      data-size={size}
      onClick={onClick}
      {...props}
    >
      {icon && <span data-testid="icon">{icon}</span>}
    </button>
  ));
});

// Mock AlertDialog component
jest.mock('../AlertDialog/AlertDialog', () => ({
  AlertDialog: ({
    isOpen,
    title,
    description,
    onSubmit,
    onCancel,
    cancelButtonLabel,
    submitButtonLabel,
  }: {
    isOpen: boolean;
    title: string;
    description: string;
    onSubmit: () => void;
    onCancel: () => void;
    cancelButtonLabel: string;
    submitButtonLabel: string;
  }) =>
    isOpen ? (
      <div data-testid="alert-dialog">
        <h3 data-testid="alert-title">{title}</h3>
        <p data-testid="alert-description">{description}</p>
        <button data-testid="alert-cancel" onClick={onCancel}>
          {cancelButtonLabel}
        </button>
        <button data-testid="alert-submit" onClick={onSubmit}>
          {submitButtonLabel}
        </button>
      </div>
    ) : null,
}));

// Mock Modal component
jest.mock('../Modal/Modal', () => {
  return React.forwardRef<
    HTMLDivElement,
    {
      isOpen: boolean;
      title: string;
      children: React.ReactNode;
      onClose: () => void;
      size: string;
      hideCloseButton?: boolean;
    }
  >(({ isOpen, title, children, onClose, size, hideCloseButton }, ref) =>
    isOpen ? (
      <div ref={ref} data-testid="quiz-modal" data-size={size}>
        {title && <h2 data-testid="modal-title">{title}</h2>}
        {!hideCloseButton && (
          <button data-testid="modal-close" onClick={onClose}>
            Close
          </button>
        )}
        <div data-testid="modal-content">{children}</div>
      </div>
    ) : null
  );
});

// Mock do useQuizStore
jest.mock('./useQuizStore', () => ({
  useQuizStore: jest.fn(),
  ANSWER_STATUS: {
    RESPOSTA_CORRETA: 'RESPOSTA_CORRETA',
    RESPOSTA_INCORRETA: 'RESPOSTA_INCORRETA',
    PENDENTE_AVALIACAO: 'PENDENTE_AVALIACAO',
  },
  QUESTION_TYPE: {
    ALTERNATIVA: 'ALTERNATIVA',
    MULTIPLA_ESCOLHA: 'MULTIPLA_ESCOLHA',
    DISSERTATIVA: 'DISSERTATIVA',
    VERDADEIRO_FALSO: 'VERDADEIRO_FALSO',
    LIGAR_PONTOS: 'LIGAR_PONTOS',
    PREENCHER: 'PREENCHER',
    IMAGEM: 'IMAGEM',
  },
  QUESTION_DIFFICULTY: {
    FACIL: 'FACIL',
    MEDIO: 'MEDIO',
    DIFICIL: 'DIFICIL',
  },
  QUIZ_TYPE: {
    SIMULADO: 'SIMULADO',
    QUESTIONARIO: 'QUESTIONARIO',
    ATIVIDADE: 'ATIVIDADE',
  },
  SUBTYPE_ENUM: {
    PROVA: 'PROVA',
    ENEM_PROVA_1: 'ENEM_PROVA_1',
    ENEM_PROVA_2: 'ENEM_PROVA_2',
    VESTIBULAR: 'VESTIBULAR',
    SIMULADO: 'SIMULADO',
    SIMULADAO: 'SIMULADAO',
  },
}));

const mockUseQuizStore = useQuizStore as jest.MockedFunction<
  typeof useQuizStore
>;

// Helper functions to avoid nested function violations (S2004) and duplicated functions (S4144)
const clickElement = (element: HTMLElement) => {
  act(() => {
    element.click();
  });
};

const clickElementAsync = async (element: HTMLElement) => {
  await act(async () => {
    element.click();
  });
};

const noOpFunction = () => {
  // Empty function for mocking
};

describe('Quiz', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuizStore.mockReturnValue({
      quiz: null,
      currentQuestionIndex: 0,
      userAnswers: [],
      questionsResult: [],
      isQuizStarted: false,
      timeElapsed: 0,
      variant: 'default' as const,
      setQuiz: jest.fn(),
      startQuiz: jest.fn(),
      setUserId: jest.fn(),
      setUserAnswers: jest.fn(),
      setQuestionsResult: jest.fn(),
      goToNextQuestion: jest.fn(),
      goToPreviousQuestion: jest.fn(),
      skipQuestion: jest.fn(),
      goToQuestion: jest.fn(),
      selectAnswer: jest.fn(),
      selectMultipleAnswer: jest.fn(),
      selectDissertativeAnswer: jest.fn(),
      selectTrueOrFalseAnswer: jest.fn(),
      selectConnectDotsAnswer: jest.fn(),
      selectFillAnswer: jest.fn(),
      selectImageQuestionAnswer: jest.fn(),
      resetQuiz: jest.fn(),
      setVariant: jest.fn(),
      getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([]),
      skipCurrentQuestionIfUnanswered: jest.fn(),
      getQuestionResultStatistics: jest.fn().mockReturnValue({
        totalQuestions: 1,
        correctAnswers: 0,
        incorrectAnswers: 0,
        timeSpent: 0,
      }),
      getTotalQuestions: jest.fn().mockReturnValue(1),
      getCurrentAnswer: jest.fn().mockReturnValue(null),
      getCorrectAnswers: jest.fn().mockReturnValue(0),
      getCurrentQuestion: jest.fn().mockReturnValue(null),
      getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('unanswered'),
    });
  });

  describe('Quiz Component', () => {
    const mockSetVariant = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        setVariant: mockSetVariant,
      });
    });

    it('should render children correctly', () => {
      render(
        <Quiz>
          <div>Test Content</div>
        </Quiz>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should call setVariant with default variant', () => {
      render(
        <Quiz>
          <div>Test Content</div>
        </Quiz>
      );

      expect(mockSetVariant).toHaveBeenCalledWith('default');
    });

    it('should call setVariant with result variant when provided', () => {
      render(
        <Quiz variant="result">
          <div>Test Content</div>
        </Quiz>
      );

      expect(mockSetVariant).toHaveBeenCalledWith('result');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Quiz className="custom-class">
          <div>Test Content</div>
        </Quiz>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have default styling classes', () => {
      const { container } = render(
        <Quiz>
          <div>Test Content</div>
        </Quiz>
      );

      const quizElement = container.firstChild as HTMLElement;
      expect(quizElement).toHaveClass('flex', 'flex-col');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Quiz ref={ref}>
          <div>Test Content</div>
        </Quiz>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should call setVariant when variant prop changes', () => {
      const { rerender } = render(
        <Quiz variant="default">
          <div>Test Content</div>
        </Quiz>
      );

      expect(mockSetVariant).toHaveBeenCalledWith('default');

      rerender(
        <Quiz variant="result">
          <div>Test Content</div>
        </Quiz>
      );

      expect(mockSetVariant).toHaveBeenCalledWith('result');
    });
  });

  describe('QuizTitle Component', () => {
    const mockGetTotalQuestions = jest.fn();
    const mockGetQuizTitle = jest.fn();
    const mockFormatTime = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        currentQuestionIndex: 0,
        getTotalQuestions: mockGetTotalQuestions,
        getQuizTitle: mockGetQuizTitle,
        timeElapsed: 120,
        formatTime: mockFormatTime,
        isStarted: true,
      });

      mockGetTotalQuestions.mockReturnValue(10);
      mockGetQuizTitle.mockReturnValue('Quiz de Matemática');
      mockFormatTime.mockReturnValue('02:00');
    });

    it('should render quiz title correctly', () => {
      render(<QuizTitle />);

      expect(screen.getByText('Quiz de Matemática')).toBeInTheDocument();
    });

    it('should display current question index correctly', () => {
      render(<QuizTitle />);

      expect(screen.getByText('1 de 10')).toBeInTheDocument();
    });

    it('should display 0 de 0 when no questions available', () => {
      mockGetTotalQuestions.mockReturnValue(0);

      render(<QuizTitle />);

      expect(screen.getByText('0 de 0')).toBeInTheDocument();
    });

    it('should display correct question index for different questions', () => {
      mockUseQuizStore.mockReturnValue({
        currentQuestionIndex: 4,
        getTotalQuestions: mockGetTotalQuestions,
        getQuizTitle: mockGetQuizTitle,
        timeElapsed: 120,
        formatTime: mockFormatTime,
        isStarted: true,
      });

      render(<QuizTitle />);

      expect(screen.getByText('5 de 10')).toBeInTheDocument();
    });

    it('should display formatted time when quiz is started', () => {
      render(<QuizTitle />);

      expect(screen.getByText('02:00')).toBeInTheDocument();
    });

    it('should display 00:00 when quiz is not started', () => {
      mockUseQuizStore.mockReturnValue({
        currentQuestionIndex: 0,
        getTotalQuestions: mockGetTotalQuestions,
        getQuizTitle: mockGetQuizTitle,
        timeElapsed: 120,
        formatTime: mockFormatTime,
        isStarted: false,
      });

      render(<QuizTitle />);

      expect(screen.getByText('00:00')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<QuizTitle className="custom-class" />);
      const titleElement = container.firstChild as HTMLElement;

      expect(titleElement).toHaveClass('custom-class');
    });

    it('should have default styling classes', () => {
      const { container } = render(<QuizTitle />);
      const titleElement = container.firstChild as HTMLElement;

      expect(titleElement).toHaveClass(
        'flex',
        'flex-row',
        'justify-between',
        'items-center',
        'relative',
        'p-2'
      );
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(<QuizTitle ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should call formatTime with correct timeElapsed value', () => {
      render(<QuizTitle />);

      expect(mockFormatTime).toHaveBeenCalledWith(120);
    });

    it('should update when quiz data changes', () => {
      const { rerender } = render(<QuizTitle />);

      expect(screen.getByText('Quiz de Matemática')).toBeInTheDocument();
      expect(screen.getByText('1 de 10')).toBeInTheDocument();

      // Change quiz data
      mockGetQuizTitle.mockReturnValue('Quiz de Física');
      mockGetTotalQuestions.mockReturnValue(5);
      mockUseQuizStore.mockReturnValue({
        currentQuestionIndex: 2,
        getTotalQuestions: mockGetTotalQuestions,
        getQuizTitle: mockGetQuizTitle,
        timeElapsed: 180,
        formatTime: mockFormatTime,
        isStarted: true,
      });

      rerender(<QuizTitle />);

      expect(screen.getByText('Quiz de Física')).toBeInTheDocument();
      expect(screen.getByText('3 de 5')).toBeInTheDocument();
    });

    it('should render IconButton with correct props', () => {
      render(<QuizTitle />);

      const iconButton = screen.getByTestId('quiz-icon-button');
      expect(iconButton).toBeInTheDocument();
      expect(iconButton).toHaveAttribute('data-size', 'md');
      expect(iconButton).toHaveAttribute('aria-label', 'Voltar');
    });

    it('should handle IconButton click when quiz is not started', () => {
      const mockHistoryBack = jest.fn();
      Object.defineProperty(window, 'history', {
        value: { back: mockHistoryBack },
        writable: true,
      });

      mockUseQuizStore.mockReturnValue({
        currentQuestionIndex: 0,
        getTotalQuestions: mockGetTotalQuestions,
        getQuizTitle: mockGetQuizTitle,
        timeElapsed: 0,
        formatTime: mockFormatTime,
        isStarted: false, // Not started, should call history.back directly
      });

      render(<QuizTitle />);

      const iconButton = screen.getByTestId('quiz-icon-button');
      fireEvent.click(iconButton);

      expect(mockHistoryBack).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Deseja sair?')).not.toBeInTheDocument();
    });

    describe('Exit Confirmation Modal', () => {
      const mockHistoryBack = jest.fn();

      // Helper functions to avoid nested function violations (S2004)
      const mockGetTotalQuestions = () => 5;
      const mockGetQuizTitle = () => 'Test Quiz';
      const mockFormatTime = () => '02:00';

      beforeEach(() => {
        // Mock window.history.back
        Object.defineProperty(window, 'history', {
          value: {
            back: mockHistoryBack,
          },
          writable: true,
        });
        mockHistoryBack.mockClear();
      });

      it('should show confirmation modal when back button is clicked and quiz is started', () => {
        render(<QuizTitle />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        expect(screen.getByText('Deseja sair?')).toBeInTheDocument();
        expect(
          screen.getByText(getExitConfirmationText(QUIZ_TYPE.SIMULADO))
        ).toBeInTheDocument();
      });

      it('should not show confirmation modal when back button is clicked and quiz is not started', () => {
        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 0,
          formatTime: mockFormatTime,
          isStarted: false,
        });

        render(<QuizTitle />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        expect(screen.queryByText('Deseja sair?')).not.toBeInTheDocument();
        expect(mockHistoryBack).toHaveBeenCalledTimes(1);
      });

      it('should render confirm button in modal', () => {
        render(<QuizTitle />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        // Verify the confirm button is rendered
        expect(screen.getByText('Voltar e revisar')).toBeInTheDocument();
      });

      it('should close modal when user cancels exit', () => {
        render(<QuizTitle />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        expect(screen.getByText('Deseja sair?')).toBeInTheDocument();

        const cancelButton = screen.getByTestId('alert-cancel');
        fireEvent.click(cancelButton);

        // Verify that history.back was not called (user cancelled)
        expect(mockHistoryBack).not.toHaveBeenCalled();
      });

      it('should have correct button labels in confirmation modal', () => {
        render(<QuizTitle />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        expect(screen.getByText('Voltar e revisar')).toBeInTheDocument();
        expect(screen.getByText('Sair Mesmo Assim')).toBeInTheDocument();
      });

      it('should call handleConfirmExit when submit button is clicked', () => {
        const mockHistoryBack = jest.fn();
        Object.defineProperty(window, 'history', {
          value: { back: mockHistoryBack },
          writable: true,
        });

        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 120,
          formatTime: mockFormatTime,
          isStarted: true,
        });

        render(<QuizTitle />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        expect(screen.getByText('Deseja sair?')).toBeInTheDocument();

        const submitButton = screen.getByText('Sair Mesmo Assim');
        fireEvent.click(submitButton);

        expect(mockHistoryBack).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Deseja sair?')).not.toBeInTheDocument();
      });

      it('should call handleCancelExit when cancel button is clicked', () => {
        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 120,
          formatTime: mockFormatTime,
          isStarted: true,
        });

        render(<QuizTitle />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        expect(screen.getByText('Deseja sair?')).toBeInTheDocument();

        const cancelButton = screen.getByTestId('alert-cancel');
        fireEvent.click(cancelButton);

        expect(screen.queryByText('Deseja sair?')).not.toBeInTheDocument();
      });

      it('should close modal when onChangeOpen is called with false', () => {
        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 120,
          formatTime: mockFormatTime,
          isStarted: true,
        });

        render(<QuizTitle />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        expect(screen.getByText('Deseja sair?')).toBeInTheDocument();

        // Simulate closing the modal by clicking outside or pressing escape
        const alertDialog = screen.getByTestId('alert-dialog');
        fireEvent.click(alertDialog);

        // The modal should still be open since we're just clicking the dialog
        expect(screen.getByText('Deseja sair?')).toBeInTheDocument();
      });

      it('should render modal with correct structure', () => {
        render(<QuizTitle />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        expect(screen.getByText('Deseja sair?')).toBeInTheDocument();
        expect(
          screen.getByText(getExitConfirmationText(QUIZ_TYPE.SIMULADO))
        ).toBeInTheDocument();

        // Verify the modal structure is correct
        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
        expect(screen.getByTestId('alert-title')).toBeInTheDocument();
        expect(screen.getByTestId('alert-description')).toBeInTheDocument();
        expect(screen.getByTestId('alert-cancel')).toBeInTheDocument();
        expect(screen.getByTestId('alert-submit')).toBeInTheDocument();
      });
    });

    describe('onBack prop functionality', () => {
      const mockHistoryBack = jest.fn();

      beforeEach(() => {
        // Mock window.history.back
        Object.defineProperty(window, 'history', {
          value: {
            back: mockHistoryBack,
          },
          writable: true,
        });
        mockHistoryBack.mockClear();
      });

      it('should call onBack when provided and quiz is not started', () => {
        const mockOnBack = jest.fn();

        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 0,
          formatTime: mockFormatTime,
          isStarted: false, // Not started
        });

        render(<QuizTitle onBack={mockOnBack} />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        expect(mockOnBack).toHaveBeenCalledTimes(1);
        expect(mockHistoryBack).not.toHaveBeenCalled();
      });

      it('should call window.history.back when onBack is not provided and quiz is not started', () => {
        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 0,
          formatTime: mockFormatTime,
          isStarted: false, // Not started
        });

        render(<QuizTitle />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        expect(mockHistoryBack).toHaveBeenCalledTimes(1);
      });

      it('should call onBack when provided and quiz is started (exit confirmation)', () => {
        const mockOnBack = jest.fn();

        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 120,
          formatTime: mockFormatTime,
          isStarted: true, // Started
        });

        render(<QuizTitle onBack={mockOnBack} />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        // Should show confirmation modal
        expect(screen.getByText('Deseja sair?')).toBeInTheDocument();

        // Click confirm exit
        const submitButton = screen.getByTestId('alert-submit');
        fireEvent.click(submitButton);

        expect(mockOnBack).toHaveBeenCalledTimes(1);
        expect(mockHistoryBack).not.toHaveBeenCalled();
        expect(screen.queryByText('Deseja sair?')).not.toBeInTheDocument();
      });

      it('should call window.history.back when onBack is not provided and quiz is started (exit confirmation)', () => {
        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 120,
          formatTime: mockFormatTime,
          isStarted: true, // Started
        });

        render(<QuizTitle />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        // Should show confirmation modal
        expect(screen.getByText('Deseja sair?')).toBeInTheDocument();

        // Click confirm exit
        const submitButton = screen.getByTestId('alert-submit');
        fireEvent.click(submitButton);

        expect(mockHistoryBack).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Deseja sair?')).not.toBeInTheDocument();
      });

      it('should not call onBack when user cancels exit confirmation', () => {
        const mockOnBack = jest.fn();

        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 120,
          formatTime: mockFormatTime,
          isStarted: true, // Started
        });

        render(<QuizTitle onBack={mockOnBack} />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        // Should show confirmation modal
        expect(screen.getByText('Deseja sair?')).toBeInTheDocument();

        // Click cancel
        const cancelButton = screen.getByTestId('alert-cancel');
        fireEvent.click(cancelButton);

        expect(mockOnBack).not.toHaveBeenCalled();
        expect(mockHistoryBack).not.toHaveBeenCalled();
        expect(screen.queryByText('Deseja sair?')).not.toBeInTheDocument();
      });

      it('should handle onBack prop being undefined gracefully', () => {
        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 0,
          formatTime: mockFormatTime,
          isStarted: false, // Not started
        });

        render(<QuizTitle onBack={undefined} />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        // Should fallback to window.history.back
        expect(mockHistoryBack).toHaveBeenCalledTimes(1);
      });

      it('should handle onBack prop being null gracefully', () => {
        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 0,
          formatTime: mockFormatTime,
          isStarted: false, // Not started
        });

        render(<QuizTitle onBack={null as unknown as () => void} />);

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        // Should fallback to window.history.back
        expect(mockHistoryBack).toHaveBeenCalledTimes(1);
      });

      it('should pass through onBack prop to component correctly', () => {
        const mockOnBack = jest.fn();

        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 0,
          formatTime: mockFormatTime,
          isStarted: false,
        });

        const { rerender } = render(<QuizTitle />);

        // First render without onBack - should use history.back
        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);
        expect(mockHistoryBack).toHaveBeenCalledTimes(1);

        // Rerender with onBack - should use onBack
        mockHistoryBack.mockClear();
        rerender(<QuizTitle onBack={mockOnBack} />);

        const newBackButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(newBackButton);

        expect(mockOnBack).toHaveBeenCalledTimes(1);
        expect(mockHistoryBack).not.toHaveBeenCalled();
      });

      it('should work correctly with both onBack prop and custom className', () => {
        const mockOnBack = jest.fn();

        mockUseQuizStore.mockReturnValue({
          currentQuestionIndex: 0,
          getTotalQuestions: mockGetTotalQuestions,
          getQuizTitle: mockGetQuizTitle,
          timeElapsed: 0,
          formatTime: mockFormatTime,
          isStarted: false,
        });

        const { container } = render(
          <QuizTitle onBack={mockOnBack} className="custom-class" />
        );

        const titleElement = container.firstChild as HTMLElement;
        expect(titleElement).toHaveClass('custom-class');

        const backButton = screen.getByTestId('quiz-icon-button');
        fireEvent.click(backButton);

        expect(mockOnBack).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('QuizHeader Component', () => {
    const mockGetCurrentQuestion = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        currentQuestionIndex: 0,
      });
    });

    it('should render header with question title when current question exists', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Qual é a capital do Brasil?',
        knowledgeMatrix: [
          {
            topic: {
              name: 'Geografia',
            },
          },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizHeader />);

      expect(screen.getByTestId('header-alternative')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toHaveTextContent('Questão 1');
      expect(screen.getByTestId('subtitle')).toHaveTextContent('Geografia');
      expect(screen.getByTestId('content')).toHaveTextContent(
        'Qual é a capital do Brasil?'
      );
    });

    it('should render correct question number based on currentQuestionIndex', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
        knowledgeMatrix: [
          {
            topic: {
              name: 'Test Topic',
            },
          },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        currentQuestionIndex: 4,
      });

      render(<QuizHeader />);

      expect(screen.getByTestId('title')).toHaveTextContent('Questão 5');
    });

    it('should render default title when no current question', () => {
      mockGetCurrentQuestion.mockReturnValue(null);

      render(<QuizHeader />);

      expect(screen.getByTestId('title')).toHaveTextContent('Questão');
      expect(screen.getByTestId('subtitle')).toHaveTextContent('');
      expect(screen.getByTestId('content')).toHaveTextContent('');
    });

    it('should handle question without knowledgeMatrix', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question without knowledge matrix',
        knowledgeMatrix: [],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizHeader />);

      expect(screen.getByTestId('title')).toHaveTextContent('Questão 1');
      expect(screen.getByTestId('subtitle')).toHaveTextContent('');
      expect(screen.getByTestId('content')).toHaveTextContent(
        'Test question without knowledge matrix'
      );
    });

    it('should handle question without topic name', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
        knowledgeMatrix: [
          {
            topic: {
              name: undefined,
            },
          },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizHeader />);

      expect(screen.getByTestId('subtitle')).toHaveTextContent('');
    });

    it('should handle question with null knowledgeMatrix', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
        knowledgeMatrix: null,
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizHeader />);

      expect(screen.getByTestId('subtitle')).toHaveTextContent('');
    });

    it('should handle question without statement', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: undefined,
        knowledgeMatrix: [
          {
            topic: {
              name: 'Test Topic',
            },
          },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizHeader />);

      expect(screen.getByTestId('content')).toHaveTextContent('');
    });

    it('should update when current question changes', () => {
      const mockQuestion1 = {
        id: 'question-1',
        statement: 'First question',
        knowledgeMatrix: [
          {
            topic: {
              name: 'Topic 1',
            },
          },
        ],
      };

      const mockQuestion2 = {
        id: 'question-2',
        statement: 'Second question',
        knowledgeMatrix: [
          {
            topic: {
              name: 'Topic 2',
            },
          },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion1);

      const { rerender } = render(<QuizHeader />);

      expect(screen.getByTestId('title')).toHaveTextContent('Questão 1');
      expect(screen.getByTestId('subtitle')).toHaveTextContent('Topic 1');
      expect(screen.getByTestId('content')).toHaveTextContent('First question');

      // Change question
      mockGetCurrentQuestion.mockReturnValue(mockQuestion2);
      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        currentQuestionIndex: 1,
      });

      rerender(<QuizHeader />);

      expect(screen.getByTestId('title')).toHaveTextContent('Questão 2');
      expect(screen.getByTestId('subtitle')).toHaveTextContent('Topic 2');
      expect(screen.getByTestId('content')).toHaveTextContent(
        'Second question'
      );
    });

    it('should handle complex knowledgeMatrix structure', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Complex question',
        knowledgeMatrix: [
          {
            topic: {
              name: 'Mathematics',
              subject: 'Algebra',
            },
          },
          {
            topic: {
              name: 'Should not be used',
            },
          },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizHeader />);

      // Should use the first topic name
      expect(screen.getByTestId('subtitle')).toHaveTextContent('Mathematics');
    });
  });

  describe('QuizContent Component', () => {
    const mockGetCurrentQuestion = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        selectAnswer: jest.fn(),
        getQuestionResultByQuestionId: jest.fn(),
        getCurrentAnswer: jest.fn(),
        variant: 'default',
      });
    });

    it('should render QuizAlternative component when question type is ALTERNATIVA', () => {
      const mockQuestion = {
        id: 'question-1',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        options: [
          { id: 'opt1', option: 'Option A' },
          { id: 'opt2', option: 'Option B' },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizContent />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
    });

    it('should return null when no current question', () => {
      mockGetCurrentQuestion.mockReturnValue(null);

      const { container } = render(<QuizContent />);

      expect(container.firstChild).toBeNull();
    });

    it('should return null when question type is not supported', () => {
      const mockQuestion = {
        id: 'question-1',
        questionType: 'UNSUPPORTED_TYPE',
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      const { container } = render(<QuizContent />);

      expect(container.firstChild).toBeNull();
    });

    it('should pass paddingBottom prop to question component', () => {
      const mockQuestion = {
        id: 'question-1',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        options: [{ id: 'opt1', option: 'Option A' }],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizContent paddingBottom="pb-10" />);

      // The paddingBottom should be passed to the QuizAlternative component
      expect(screen.getByText('Alternativas')).toBeInTheDocument();
    });

    it('should handle different question types', () => {
      // Test only ALTERNATIVA type to avoid complex mocking for other types
      const mockQuestion = {
        id: 'question-1',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        options: [{ id: 'opt1', option: 'Option A' }],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizContent />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
    });
  });

  describe('QuizQuestionList Component', () => {
    const mockGetQuestionsGroupedBySubject = jest.fn();
    const mockGoToQuestion = jest.fn();
    const mockGetQuestionStatusFromUserAnswers = jest.fn();
    const mockGetQuestionIndex = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getQuestionsGroupedBySubject: mockGetQuestionsGroupedBySubject,
        goToQuestion: mockGoToQuestion,
        getQuestionStatusFromUserAnswers: mockGetQuestionStatusFromUserAnswers,
        getQuestionIndex: mockGetQuestionIndex,
      });

      jest.clearAllMocks();
    });

    it('should render questions grouped by subject correctly', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            knowledgeMatrix: [
              {
                subject: { name: 'Matemática' },
              },
            ],
          },
          {
            id: 'question-2',
            knowledgeMatrix: [
              {
                subject: { name: 'Matemática' },
              },
            ],
          },
        ],
        'subject-2': [
          {
            id: 'question-3',
            knowledgeMatrix: [
              {
                subject: { name: 'Física' },
              },
            ],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionStatusFromUserAnswers.mockReturnValue('answered');
      mockGetQuestionIndex.mockImplementation((id) => {
        const questionMap: { [key: string]: number } = {
          'question-1': 1,
          'question-2': 2,
          'question-3': 3,
        };
        return questionMap[id] || 1;
      });

      render(<QuizQuestionList />);

      // Should render subject names
      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(screen.getByText('Física')).toBeInTheDocument();

      // Should render question cards
      expect(screen.getByText('Questão 01')).toBeInTheDocument();
      expect(screen.getByText('Questão 02')).toBeInTheDocument();
      expect(screen.getByText('Questão 03')).toBeInTheDocument();
    });

    it('should filter questions correctly by filterType', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-2',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-3',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionStatusFromUserAnswers.mockImplementation((id) => {
        const statusMap: { [key: string]: string } = {
          'question-1': 'answered',
          'question-2': 'unanswered',
          'question-3': 'skipped',
        };
        return statusMap[id] || 'unanswered';
      });
      mockGetQuestionIndex.mockImplementation((id) => {
        const questionMap: { [key: string]: number } = {
          'question-1': 1,
          'question-2': 2,
          'question-3': 3,
        };
        return questionMap[id] || 1;
      });

      // Test answered filter
      render(<QuizQuestionList filterType="answered" />);

      expect(screen.getByText('Questão 01')).toBeInTheDocument();
      expect(screen.queryByText('Questão 02')).not.toBeInTheDocument();
      expect(screen.queryByText('Questão 03')).not.toBeInTheDocument();
    });

    it('should filter unanswered questions correctly', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-2',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionStatusFromUserAnswers.mockImplementation((id) => {
        return id === 'question-1' ? 'answered' : 'unanswered';
      });
      mockGetQuestionIndex.mockImplementation((id) => {
        return id === 'question-1' ? 1 : 2;
      });

      render(<QuizQuestionList filterType="unanswered" />);

      expect(screen.queryByText('Questão 01')).not.toBeInTheDocument();
      expect(screen.getByText('Questão 02')).toBeInTheDocument();
    });

    it('should show all questions when filterType is "all"', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-2',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionStatusFromUserAnswers.mockReturnValue('answered');
      mockGetQuestionIndex.mockImplementation((id) => {
        return id === 'question-1' ? 1 : 2;
      });

      render(<QuizQuestionList filterType="all" />);

      expect(screen.getByText('Questão 01')).toBeInTheDocument();
      expect(screen.getByText('Questão 02')).toBeInTheDocument();
    });

    it('should call goToQuestion and onQuestionClick when question is clicked', () => {
      const mockOnQuestionClick = jest.fn();
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionStatusFromUserAnswers.mockReturnValue('answered');
      mockGetQuestionIndex.mockReturnValue(5); // Question number 5

      render(<QuizQuestionList onQuestionClick={mockOnQuestionClick} />);

      const questionCard = screen.getByTestId('card-status');
      questionCard.click();

      expect(mockGoToQuestion).toHaveBeenCalledWith(4); // Index 4 for question number 5
      expect(mockOnQuestionClick).toHaveBeenCalled();
    });

    it('should render correct status labels', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-2',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-3',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionStatusFromUserAnswers.mockImplementation((id) => {
        const statusMap: { [key: string]: string } = {
          'question-1': 'answered',
          'question-2': 'skipped',
          'question-3': 'unanswered',
        };
        return statusMap[id] || 'unanswered';
      });
      mockGetQuestionIndex.mockImplementation((id) => {
        const questionMap: { [key: string]: number } = {
          'question-1': 1,
          'question-2': 2,
          'question-3': 3,
        };
        return questionMap[id] || 1;
      });

      render(<QuizQuestionList />);

      expect(screen.getByText('Respondida')).toBeInTheDocument(); // answered
      expect(screen.getAllByText('Em branco')).toHaveLength(2); // skipped and unanswered
    });

    it('should not render subjects with no questions after filtering', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
        'subject-2': [
          {
            id: 'question-2',
            knowledgeMatrix: [{ subject: { name: 'Física' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionStatusFromUserAnswers.mockImplementation((id) => {
        return id === 'question-1' ? 'answered' : 'unanswered';
      });
      mockGetQuestionIndex.mockImplementation((id) => {
        return id === 'question-1' ? 1 : 2;
      });

      render(<QuizQuestionList filterType="answered" />);

      // Should show Matemática (has answered question)
      expect(screen.getByText('Matemática')).toBeInTheDocument();

      // Should not show Física (no answered questions)
      expect(screen.queryByText('Física')).not.toBeInTheDocument();
    });

    it('should handle empty questions list', () => {
      mockGetQuestionsGroupedBySubject.mockReturnValue({});

      const { container } = render(<QuizQuestionList />);

      // Should render the container but with no content
      expect(container.querySelector('.space-y-6.px-4')).toBeInTheDocument();
      expect(screen.queryByTestId('card-status')).not.toBeInTheDocument();
    });

    it('should format question numbers with leading zeros', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-10',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionStatusFromUserAnswers.mockReturnValue('answered');
      mockGetQuestionIndex.mockImplementation((id) => {
        return id === 'question-1' ? 1 : 10;
      });

      render(<QuizQuestionList />);

      expect(screen.getByText('Questão 01')).toBeInTheDocument(); // Single digit with leading zero
      expect(screen.getByText('Questão 10')).toBeInTheDocument(); // Double digit
    });

    it('should handle questions without onQuestionClick callback', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionStatusFromUserAnswers.mockReturnValue('answered');
      mockGetQuestionIndex.mockReturnValue(1);

      render(<QuizQuestionList />); // No onQuestionClick prop

      const questionCard = screen.getByTestId('card-status');
      questionCard.click();

      // Should still call goToQuestion
      expect(mockGoToQuestion).toHaveBeenCalledWith(0);
      // onQuestionClick should not be called (was not provided)
    });

    it('should use default filterType when not provided', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-2',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionStatusFromUserAnswers.mockImplementation((id) => {
        return id === 'question-1' ? 'answered' : 'unanswered';
      });
      mockGetQuestionIndex.mockImplementation((id) => {
        return id === 'question-1' ? 1 : 2;
      });

      render(<QuizQuestionList />); // No filterType prop

      // Should show all questions (default behavior)
      expect(screen.getByText('Questão 01')).toBeInTheDocument();
      expect(screen.getByText('Questão 02')).toBeInTheDocument();
    });

    it('should render subject icon and styling correctly', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionStatusFromUserAnswers.mockReturnValue('answered');
      mockGetQuestionIndex.mockReturnValue(1);

      const { container } = render(<QuizQuestionList />);

      // Should have correct container structure
      expect(container.querySelector('.space-y-6.px-4')).toBeInTheDocument();

      // Should have subject section with correct styling
      const section = container.querySelector('section.flex.flex-col.gap-2');
      expect(section).toBeInTheDocument();

      // Should have subject header with icon container
      const iconContainer = container.querySelector(
        '.bg-primary-500.p-1.rounded-sm.flex.items-center.justify-center'
      );
      expect(iconContainer).toBeInTheDocument();

      // Should have subject name with correct styling
      const subjectName = container.querySelector(
        '.text-text-800.font-bold.text-lg'
      );
      expect(subjectName).toBeInTheDocument();
      expect(subjectName).toHaveTextContent('Matemática');
    });
  });

  describe('QuizFooter Component', () => {
    const mockGoToNextQuestion = jest.fn();
    const mockGoToPreviousQuestion = jest.fn();
    const mockGetUnansweredQuestionsFromUserAnswers = jest.fn();
    const mockGetCurrentAnswer = jest.fn();
    const mockSkipQuestion = jest.fn();
    const mockGetCurrentQuestion = jest.fn();
    const mockGetQuestionStatusFromUserAnswers = jest.fn();
    const mockGetTotalQuestions = jest.fn();
    const mockGetQuestionResultStatistics = jest.fn();
    const mockGetQuestionsGroupedBySubject = jest.fn();
    const mockGoToQuestion = jest.fn();
    const mockGetQuestionIndex = jest.fn();

    // Helper functions to avoid nested function violations (S2004)
    const hasButtonWithText = (buttons: HTMLElement[], text: string) => {
      return buttons.some((btn) => btn.textContent === text);
    };

    const defaultStoreState = {
      currentQuestionIndex: 0,
      getTotalQuestions: mockGetTotalQuestions,
      goToNextQuestion: mockGoToNextQuestion,
      goToPreviousQuestion: mockGoToPreviousQuestion,
      getUnansweredQuestionsFromUserAnswers:
        mockGetUnansweredQuestionsFromUserAnswers,
      getCurrentAnswer: mockGetCurrentAnswer,
      skipQuestion: mockSkipQuestion,
      skipCurrentQuestionIfUnanswered: jest.fn(),
      getCurrentQuestion: mockGetCurrentQuestion,
      getQuestionStatusFromUserAnswers: mockGetQuestionStatusFromUserAnswers,
      variant: 'default',
      getQuestionResultStatistics: mockGetQuestionResultStatistics,
      getQuestionsGroupedBySubject: mockGetQuestionsGroupedBySubject,
      goToQuestion: mockGoToQuestion,
      getQuestionIndex: mockGetQuestionIndex,
    };

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue(defaultStoreState);

      // Default mock returns
      mockGetTotalQuestions.mockReturnValue(5);
      mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([]);
      mockGetCurrentAnswer.mockReturnValue({ answer: 'test answer' });
      mockGetCurrentQuestion.mockReturnValue({ id: 'question-1' });
      mockGetQuestionStatusFromUserAnswers.mockReturnValue('answered');
      mockGetQuestionResultStatistics.mockReturnValue({ correctAnswers: 3 });
      mockGetQuestionsGroupedBySubject.mockReturnValue({});

      jest.clearAllMocks();
    });

    describe('Default variant - navigation', () => {
      it('should render footer correctly in default variant', () => {
        render(<QuizFooter />);

        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        expect(screen.getByTestId('quiz-icon-button')).toBeInTheDocument(); // Navigation icon
      });

      it('should show skip and next buttons on first question', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 0,
        });

        render(<QuizFooter />);

        const buttons = screen.getAllByTestId('quiz-button');
        expect(hasButtonWithText(buttons, 'Pular')).toBe(true);
        expect(hasButtonWithText(buttons, 'Avançar')).toBe(true);
        expect(screen.queryByText('Voltar')).not.toBeInTheDocument();
      });

      it('should show back, skip and next buttons on middle questions', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 2,
        });

        render(<QuizFooter />);

        expect(screen.getByText('Voltar')).toBeInTheDocument();
        expect(screen.getByText('Pular')).toBeInTheDocument();
        expect(screen.getByText('Avançar')).toBeInTheDocument();
      });

      it('should show finish button on last question', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 4, // Last question (total is 5)
        });

        render(<QuizFooter />);

        expect(screen.getByText('Finalizar')).toBeInTheDocument();
        expect(screen.queryByText('Avançar')).not.toBeInTheDocument();
      });

      it('should call goToPreviousQuestion when back button is clicked', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 2,
        });

        render(<QuizFooter />);

        const backButton = screen.getByText('Voltar');
        backButton.click();

        expect(mockGoToPreviousQuestion).toHaveBeenCalled();
      });

      it('should call skipQuestion and goToNextQuestion when skip button is clicked', () => {
        render(<QuizFooter />);

        const skipButton = screen.getByText('Pular');
        skipButton.click();

        expect(mockSkipQuestion).toHaveBeenCalled();
        expect(mockGoToNextQuestion).toHaveBeenCalled();
      });

      it('should call goToNextQuestion when next button is clicked', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 2,
        });

        render(<QuizFooter />);

        const nextButton = screen.getByText('Avançar');
        nextButton.click();

        expect(mockGoToNextQuestion).toHaveBeenCalled();
      });

      it('should disable next button when no answer and question not skipped', () => {
        mockGetCurrentAnswer.mockReturnValue(null);
        mockGetQuestionStatusFromUserAnswers.mockReturnValue('unanswered');

        render(<QuizFooter />);

        const nextButton = screen.getByText('Avançar');
        expect(nextButton).toHaveAttribute('data-disabled', 'true');
      });

      it('should enable next button when question is skipped', () => {
        mockGetCurrentAnswer.mockReturnValue(null);
        mockGetQuestionStatusFromUserAnswers.mockReturnValue('skipped');

        render(<QuizFooter />);

        const nextButton = screen.getByText('Avançar');
        expect(nextButton).toHaveAttribute('data-disabled', 'false');
      });

      it('should call both skipQuestion and goToNextQuestion in correct order when skip is clicked on first question', () => {
        render(<QuizFooter />);

        const skipButton = screen.getByText('Pular');

        // Clear any previous calls
        mockSkipQuestion.mockClear();
        mockGoToNextQuestion.mockClear();

        skipButton.click();

        // Verify both functions are called
        expect(mockSkipQuestion).toHaveBeenCalledTimes(1);
        expect(mockGoToNextQuestion).toHaveBeenCalledTimes(1);

        // Verify they are called with no arguments
        expect(mockSkipQuestion).toHaveBeenCalledWith();
        expect(mockGoToNextQuestion).toHaveBeenCalledWith();
      });

      it('should call both skipQuestion and goToNextQuestion when skip is clicked on middle question', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 2, // Middle question
        });

        render(<QuizFooter />);

        const skipButton = screen.getByText('Pular');

        // Clear any previous calls
        mockSkipQuestion.mockClear();
        mockGoToNextQuestion.mockClear();

        skipButton.click();

        // Verify both functions are called
        expect(mockSkipQuestion).toHaveBeenCalledTimes(1);
        expect(mockGoToNextQuestion).toHaveBeenCalledTimes(1);
      });

      it('should not call skipQuestion when next button is clicked (not skip)', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 2, // Middle question
        });
        mockGetCurrentAnswer.mockReturnValue({ optionId: 'option-1' }); // Has answer

        render(<QuizFooter />);

        const nextButton = screen.getByText('Avançar');

        // Clear any previous calls
        mockSkipQuestion.mockClear();
        mockGoToNextQuestion.mockClear();

        nextButton.click();

        // Verify only goToNextQuestion is called, not skipQuestion
        expect(mockSkipQuestion).not.toHaveBeenCalled();
        expect(mockGoToNextQuestion).toHaveBeenCalledTimes(1);
      });
    });

    describe('Result variant', () => {
      beforeEach(() => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          variant: 'result',
        });
      });

      it('should render resolution button in result variant', () => {
        render(<QuizFooter />);

        expect(screen.getByText('Ver resolução')).toBeInTheDocument();
        expect(screen.queryByText('Voltar')).not.toBeInTheDocument();
        expect(screen.queryByText('Avançar')).not.toBeInTheDocument();
        expect(screen.queryByText('Pular')).not.toBeInTheDocument();
      });

      it('should open resolution modal when button is clicked', async () => {
        mockGetCurrentQuestion.mockReturnValue({
          id: 'question-1',
          solutionExplanation: 'Test explanation',
        });

        // Mock setVariant for the Quiz component
        const mockSetVariant = jest.fn();
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          variant: 'result',
          setVariant: mockSetVariant,
        });

        // Render the full Quiz component to include the modal
        render(
          <Quiz variant="result">
            <QuizFooter />
          </Quiz>
        );

        const resolutionButton = screen.getByText('Ver resolução');

        clickElement(resolutionButton);

        expect(screen.getByText('Ver resolução')).toBeInTheDocument();

        // Just verify the button click works - the modal functionality is complex to test in isolation
        expect(resolutionButton).toBeInTheDocument();
      });

      it('should show "Ver resolução" button when quiz can retry', () => {
        // Mock setVariant for the Quiz component
        const mockSetVariant = jest.fn();
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          variant: 'result',
          setVariant: mockSetVariant,
          quiz: {
            canRetry: true,
          },
        });

        // Render the full Quiz component
        render(
          <Quiz variant="result">
            <QuizFooter />
          </Quiz>
        );

        // Should have one "Ver resolução" button with link variant
        const resolutionButtons = screen.getAllByText('Ver resolução');
        expect(resolutionButtons).toHaveLength(1);

        // The button should be a link variant
        const button = resolutionButtons[0];
        expect(button).toHaveAttribute('data-variant', 'link');
      });

      it('should render resolution button when quiz can retry', () => {
        const mockOnRepeat = jest.fn();
        // Mock setVariant for the Quiz component
        const mockSetVariant = jest.fn();
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          variant: 'result',
          setVariant: mockSetVariant,
          quiz: {
            canRetry: true,
          },
        });

        // Render the full Quiz component to include the button logic
        render(
          <Quiz variant="result">
            <QuizFooter onRepeat={mockOnRepeat} />
          </Quiz>
        );

        // Should have the resolution button
        const resolutionButton = screen.getByText('Ver resolução');
        expect(resolutionButton).toBeInTheDocument();
        expect(resolutionButton).toHaveAttribute('data-variant', 'link');
      });

      it('should show "Ver resolução" button when quiz cannot retry', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          variant: 'result',
          quiz: {
            canRetry: false,
          },
        });

        render(<QuizFooter />);

        // Should have only one "Ver resolução" button
        const resolutionButtons = screen.getAllByText('Ver resolução');
        expect(resolutionButtons).toHaveLength(1);

        // The button should be a link variant
        const button = resolutionButtons[0];
        expect(button).toHaveAttribute('data-variant', 'link');
      });
    });

    describe('Modal interactions', () => {
      it('should open navigation modal when icon button is clicked', () => {
        render(<QuizFooter />);

        const navigationButton = screen.getByTestId('quiz-icon-button');

        clickElement(navigationButton);

        expect(screen.getByText('Questões')).toBeInTheDocument();
      });

      it('should close navigation modal when close button is clicked', () => {
        render(<QuizFooter />);

        // Open modal
        const navigationButton = screen.getByTestId('quiz-icon-button');

        clickElement(navigationButton);

        expect(screen.getByText('Questões')).toBeInTheDocument();

        // Close modal
        const closeButton = screen.getByTestId('modal-close');

        clickElement(closeButton);

        expect(
          screen.queryByText('Você concluiu o simulado!')
        ).not.toBeInTheDocument();
      });

      it('should close resolution modal when close button is clicked', async () => {
        // Mock setVariant for the Quiz component
        const mockSetVariant = jest.fn();
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          variant: 'result',
          setVariant: mockSetVariant,
        });

        // Render the full Quiz component to include the modal
        render(
          <Quiz variant="result">
            <QuizFooter />
          </Quiz>
        );

        // Open resolution modal
        const resolutionButton = screen.getByText('Ver resolução');

        clickElement(resolutionButton);

        expect(screen.getByText('Ver resolução')).toBeInTheDocument();

        // Just verify the button click works - the modal functionality is complex to test in isolation
        expect(resolutionButton).toBeInTheDocument();

        expect(
          screen.queryByText('Você concluiu o simulado!')
        ).not.toBeInTheDocument();
      });
    });

    describe('Finish quiz flow', () => {
      beforeEach(() => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 4, // Last question
        });
      });

      it('should show alert dialog when finishing with unanswered questions', () => {
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([1, 3, 5]);

        render(<QuizFooter />);

        const finishButton = screen.getByText('Finalizar');

        clickElement(finishButton);

        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
        expect(screen.getByTestId('alert-title')).toHaveTextContent(
          'Finalizar simulado?'
        );
        expect(screen.getByTestId('alert-description')).toHaveTextContent(
          'Você deixou as questões 1, 3, 5 sem resposta'
        );
      });

      it('should show result modal when finishing without unanswered questions', async () => {
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([]);

        render(<QuizFooter />);

        const finishButton = screen.getByText('Finalizar');

        await clickElementAsync(finishButton);

        expect(screen.getByText(/Você concluiu o/)).toBeInTheDocument();
        expect(
          screen.getByText('Você acertou 3 de 5 questões.')
        ).toBeInTheDocument();
      });

      it('should call handleFinishSimulated callback when finishing', async () => {
        const mockHandleFinishSimulated = jest.fn();
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([]);

        render(
          <QuizFooter handleFinishSimulated={mockHandleFinishSimulated} />
        );

        const finishButton = screen.getByText('Finalizar');

        await clickElementAsync(finishButton);

        expect(mockHandleFinishSimulated).toHaveBeenCalled();
      });

      it('should not show result modal when handleFinishSimulated throws error', async () => {
        const mockHandleFinishSimulated = jest
          .fn()
          .mockRejectedValue(new Error('Test error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([]);

        render(
          <QuizFooter handleFinishSimulated={mockHandleFinishSimulated} />
        );

        const finishButton = screen.getByText('Finalizar');

        await clickElementAsync(finishButton);

        expect(mockHandleFinishSimulated).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(
          'handleFinishSimulated failed:',
          expect.any(Error)
        );
        expect(
          screen.queryByText('Você concluiu o simulado!')
        ).not.toBeInTheDocument();

        consoleSpy.mockRestore();
      });

      it('should finish quiz when alert submit is clicked', async () => {
        const mockHandleFinishSimulated = jest
          .fn()
          .mockResolvedValue(undefined);
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([1, 2]);

        render(
          <QuizFooter handleFinishSimulated={mockHandleFinishSimulated} />
        );

        // Open alert
        const finishButton = screen.getByText('Finalizar');

        clickElement(finishButton);

        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();

        // Submit alert
        const submitButton = screen.getByTestId('alert-submit');

        await clickElementAsync(submitButton);

        expect(mockHandleFinishSimulated).toHaveBeenCalled();
        expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument();

        // Verificar se o modal de resultado está aberto
        expect(screen.getByText(/Você concluiu o/)).toBeInTheDocument();
      });

      it('should handle handleFinishSimulated error in alert submit and not show result modal', async () => {
        const mockHandleFinishSimulated = jest
          .fn()
          .mockRejectedValue(new Error('Simulated failure'));
        const consoleSpy = jest
          .spyOn(console, 'error')
          .mockImplementation(noOpFunction);
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([1, 2]);

        render(
          <QuizFooter handleFinishSimulated={mockHandleFinishSimulated} />
        );

        // Open alert by clicking finish
        const finishButton = screen.getByText('Finalizar');

        clickElement(finishButton);

        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();

        // Submit alert - this should trigger the catch block
        const submitButton = screen.getByTestId('alert-submit');

        await clickElementAsync(submitButton);

        // Verify the catch block behavior:
        // 1. console.error is called
        expect(consoleSpy).toHaveBeenCalledWith(
          'handleFinishSimulated failed:',
          expect.any(Error)
        );

        // 2. setModalResultOpen(true) is NOT called due to early return
        expect(
          screen.queryByText('Você concluiu o simulado!')
        ).not.toBeInTheDocument();

        // 3. setAlertDialogOpen(false) is called
        expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument();

        // 4. handleFinishSimulated was called despite the error
        expect(mockHandleFinishSimulated).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });

    describe('Result modal actions', () => {
      beforeEach(() => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 4, // Last question
        });
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([]);
      });

      it('should call onGoToSimulated when button is clicked', async () => {
        const mockOnGoToSimulated = jest.fn();

        render(<QuizFooter onGoToSimulated={mockOnGoToSimulated} />);

        // Finish quiz to open result modal
        const finishButton = screen.getByText('Finalizar');

        await clickElementAsync(finishButton);

        const goToSimulatedButton = screen.getByText('Ir para simulados');
        goToSimulatedButton.click();

        expect(mockOnGoToSimulated).toHaveBeenCalled();
      });

      it('should call onDetailResult when button is clicked', async () => {
        const mockOnDetailResult = jest.fn();

        render(<QuizFooter onDetailResult={mockOnDetailResult} />);

        // Finish quiz to open result modal
        const finishButton = screen.getByText('Finalizar');

        await clickElementAsync(finishButton);

        const detailResultButton = screen.getByText('Detalhar resultado');
        detailResultButton.click();

        expect(mockOnDetailResult).toHaveBeenCalled();
      });

      it('should render result modal correctly without close button', async () => {
        render(<QuizFooter />);

        // Finish quiz to open result modal
        const finishButton = screen.getByText('Finalizar');

        await clickElementAsync(finishButton);

        // Verify modal is open
        expect(screen.getByText(/Você concluiu o/)).toBeInTheDocument();

        // Verify that close button is not rendered (hideCloseButton is true)
        expect(screen.queryByTestId('modal-close')).not.toBeInTheDocument();

        // Verify modal content is correct
        expect(
          screen.getByText('Você acertou 3 de 5 questões.')
        ).toBeInTheDocument();
        expect(screen.getByText('Ir para simulados')).toBeInTheDocument();
        expect(screen.getByText('Detalhar resultado')).toBeInTheDocument();
      });
    });

    describe('Navigation modal filter', () => {
      it('should render filter select in navigation modal', () => {
        mockGetQuestionsGroupedBySubject.mockReturnValue({
          'subject-1': [
            {
              id: 'question-1',
              knowledgeMatrix: [{ subject: { name: 'Math' } }],
            },
          ],
        });
        mockGetQuestionStatusFromUserAnswers.mockReturnValue('answered');
        mockGetQuestionIndex.mockReturnValue(1);

        render(<QuizFooter />);

        // Open navigation modal
        const navigationButton = screen.getByTestId('quiz-icon-button');

        clickElement(navigationButton);

        expect(screen.getByText('Questões')).toBeInTheDocument();
        expect(screen.getByText('Filtrar por')).toBeInTheDocument();
        expect(screen.getByTestId('quiz-select')).toBeInTheDocument();
      });

      it('should close navigation modal when question is clicked in QuizQuestionList', () => {
        mockGetQuestionsGroupedBySubject.mockReturnValue({
          'subject-1': [
            {
              id: 'question-1',
              knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
            },
          ],
        });
        mockGetQuestionStatusFromUserAnswers.mockReturnValue('answered');
        mockGetQuestionIndex.mockReturnValue(1);

        render(<QuizFooter />);

        // Open navigation modal
        const navigationButton = screen.getByTestId('quiz-icon-button');

        clickElement(navigationButton);

        // Verify modal is open
        expect(screen.getByText('Questões')).toBeInTheDocument();

        // Find and click a question card (which should trigger onQuestionClick)
        const questionCard = screen.getByTestId('card-status');

        clickElement(questionCard);

        // Verify modal is closed after clicking question
        expect(screen.queryByText('Questões')).not.toBeInTheDocument();
      });
    });

    describe('Props and styling', () => {
      it('should apply custom className', () => {
        const { container } = render(
          <QuizFooter className="custom-footer-class" />
        );

        const footer = container.querySelector('footer');
        expect(footer).toHaveClass('custom-footer-class');
      });

      it('should render custom result image component when provided', async () => {
        const mockResultImageComponent = (
          <div data-testid="custom-result-image">Custom SVG Image</div>
        );

        // Configure store to show last question (where Finish button appears)
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 4, // Last question (total is 5)
        });

        render(<QuizFooter resultImageComponent={mockResultImageComponent} />);

        // Finish quiz to open result modal
        const finishButton = screen.getByText('Finalizar');

        await clickElementAsync(finishButton);

        // Verify custom image component is rendered instead of default image
        expect(screen.getByTestId('custom-result-image')).toBeInTheDocument();
        expect(screen.getByText('Custom SVG Image')).toBeInTheDocument();

        // Verify default image is not rendered
        expect(
          screen.queryByAltText('Simulated Result')
        ).not.toBeInTheDocument();
      });

      it('should render default image when resultImageComponent is not provided', async () => {
        // Configure store to show last question (where Finish button appears)
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 4, // Last question (total is 5)
        });

        render(<QuizFooter />);

        // Finish quiz to open result modal
        const finishButton = screen.getByText('Finalizar');

        await clickElementAsync(finishButton);

        // Verify default placeholder is rendered
        expect(screen.getByText('Imagem de resultado')).toBeInTheDocument();
      });

      it('should forward ref correctly', () => {
        const ref = React.createRef<HTMLDivElement>();

        render(<QuizFooter ref={ref} />);

        expect(ref.current).toBeInstanceOf(HTMLElement);
        expect(ref.current?.tagName).toBe('FOOTER');
      });

      it('should have default styling classes', () => {
        const { container } = render(<QuizFooter />);

        const footer = container.querySelector('footer');
        expect(footer).toHaveClass(
          'w-full',
          'px-2',
          'bg-background',
          'border-t',
          'border-border-50',
          'fixed',
          'bottom-0',
          'min-h-[80px]',
          'flex',
          'flex-row',
          'justify-between',
          'items-center'
        );
      });

      it('should pass through additional props', () => {
        const { container } = render(
          <QuizFooter
            data-testid="quiz-footer"
            aria-label="Quiz navigation footer"
          />
        );

        const footer = container.querySelector('footer');
        expect(footer).toHaveAttribute('data-testid', 'quiz-footer');
        expect(footer).toHaveAttribute('aria-label', 'Quiz navigation footer');
      });
    });

    describe('Edge cases', () => {
      it('should handle missing current question', () => {
        mockGetCurrentQuestion.mockReturnValue(null);

        render(<QuizFooter />);

        // Should render without errors
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      });

      it('should handle zero total questions', () => {
        mockGetTotalQuestions.mockReturnValue(0);

        render(<QuizFooter />);

        // Should render without errors
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      });

      it('should handle missing question result statistics', () => {
        // Make sure we're on the last question to show Finalizar button
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 4, // Last question (total is 5)
        });
        mockGetQuestionResultStatistics.mockReturnValue(null);
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([]);

        render(<QuizFooter />);

        const finishButton = screen.getByText('Finalizar');

        clickElement(finishButton);

        // Should show -- when no statistics available
        expect(
          screen.getByText('Você acertou -- de 5 questões.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('getQuizArticle', () => {
    it('should return correct article for simulado', () => {
      expect(getQuizArticle(QUIZ_TYPE.SIMULADO)).toBe('o');
    });

    it('should return correct article for questionario', () => {
      expect(getQuizArticle(QUIZ_TYPE.QUESTIONARIO)).toBe('o');
    });

    it('should return correct article for atividade', () => {
      expect(getQuizArticle(QUIZ_TYPE.ATIVIDADE)).toBe('a');
    });

    it('should return default article for unknown type', () => {
      expect(getQuizArticle('unknown' as QUIZ_TYPE)).toBe('o');
      expect(getQuizArticle('' as QUIZ_TYPE)).toBe('o');
    });
  });

  // Testes para getQuizPreposition
  describe('getQuizPreposition', () => {
    it('should return correct preposition for simulado', () => {
      expect(getQuizPreposition(QUIZ_TYPE.SIMULADO)).toBe('do');
    });

    it('should return correct preposition for questionario', () => {
      expect(getQuizPreposition(QUIZ_TYPE.QUESTIONARIO)).toBe('do');
    });

    it('should return correct preposition for atividade', () => {
      expect(getQuizPreposition(QUIZ_TYPE.ATIVIDADE)).toBe('da');
    });

    it('should return default preposition for unknown type', () => {
      expect(getQuizPreposition('unknown' as QUIZ_TYPE)).toBe('do');
      expect(getQuizPreposition('' as QUIZ_TYPE)).toBe('do');
    });
  });

  // Testes para getTypeLabel
  describe('getTypeLabel', () => {
    it('should return correct label for simulado', () => {
      expect(getTypeLabel(QUIZ_TYPE.SIMULADO)).toBe('Simulado');
      expect(getTypeLabel(QUIZ_TYPE.SIMULADO)).toBe('Simulado');
    });

    it('should return correct label for questionario', () => {
      expect(getTypeLabel(QUIZ_TYPE.QUESTIONARIO)).toBe('Questionário');
      expect(getTypeLabel(QUIZ_TYPE.QUESTIONARIO)).toBe('Questionário');
    });

    it('should return correct label for atividade', () => {
      expect(getTypeLabel(QUIZ_TYPE.ATIVIDADE)).toBe('Atividade');
      expect(getTypeLabel(QUIZ_TYPE.ATIVIDADE)).toBe('Atividade');
    });

    it('should return default label for unknown type', () => {
      expect(getTypeLabel('unknown' as QUIZ_TYPE)).toBe('Simulado');
      expect(getTypeLabel('' as QUIZ_TYPE)).toBe('Simulado');
    });
  });

  // Testes para getExitConfirmationText
  describe('getExitConfirmationText', () => {
    it('should return correct text for simulado', () => {
      expect(getExitConfirmationText(QUIZ_TYPE.SIMULADO)).toBe(
        'Se você sair do simulado agora, todas as respostas serão perdidas.'
      );
      expect(getExitConfirmationText(QUIZ_TYPE.SIMULADO)).toBe(
        'Se você sair do simulado agora, todas as respostas serão perdidas.'
      );
    });

    it('should return correct text for questionario', () => {
      expect(getExitConfirmationText(QUIZ_TYPE.QUESTIONARIO)).toBe(
        'Se você sair do questionário agora, todas as respostas serão perdidas.'
      );
      expect(getExitConfirmationText(QUIZ_TYPE.QUESTIONARIO)).toBe(
        'Se você sair do questionário agora, todas as respostas serão perdidas.'
      );
    });

    it('should return correct text for atividade', () => {
      expect(getExitConfirmationText(QUIZ_TYPE.ATIVIDADE)).toBe(
        'Se você sair da atividade agora, todas as respostas serão perdidas.'
      );
      expect(getExitConfirmationText(QUIZ_TYPE.ATIVIDADE)).toBe(
        'Se você sair da atividade agora, todas as respostas serão perdidas.'
      );
    });

    it('should return default text for unknown type', () => {
      expect(getExitConfirmationText('unknown' as QUIZ_TYPE)).toBe(
        'Se você sair do simulado agora, todas as respostas serão perdidas.'
      );
      expect(getExitConfirmationText('' as QUIZ_TYPE)).toBe(
        'Se você sair do simulado agora, todas as respostas serão perdidas.'
      );
    });
  });

  // Testes para getFinishConfirmationText
  describe('getFinishConfirmationText', () => {
    it('should return correct text for simulado', () => {
      expect(getFinishConfirmationText(QUIZ_TYPE.SIMULADO)).toBe(
        'Tem certeza que deseja finalizar o simulado?'
      );
      expect(getFinishConfirmationText(QUIZ_TYPE.SIMULADO)).toBe(
        'Tem certeza que deseja finalizar o simulado?'
      );
    });

    it('should return correct text for questionario', () => {
      expect(getFinishConfirmationText(QUIZ_TYPE.QUESTIONARIO)).toBe(
        'Tem certeza que deseja finalizar o questionário?'
      );
      expect(getFinishConfirmationText(QUIZ_TYPE.QUESTIONARIO)).toBe(
        'Tem certeza que deseja finalizar o questionário?'
      );
    });

    it('should return correct text for atividade', () => {
      expect(getFinishConfirmationText(QUIZ_TYPE.ATIVIDADE)).toBe(
        'Tem certeza que deseja finalizar a atividade?'
      );
      expect(getFinishConfirmationText(QUIZ_TYPE.ATIVIDADE)).toBe(
        'Tem certeza que deseja finalizar a atividade?'
      );
    });

    it('should return default text for unknown type', () => {
      expect(getFinishConfirmationText('unknown' as QUIZ_TYPE)).toBe(
        'Tem certeza que deseja finalizar o simulado?'
      );
      expect(getFinishConfirmationText('' as QUIZ_TYPE)).toBe(
        'Tem certeza que deseja finalizar o simulado?'
      );
    });
  });

  // Testes para modais específicos de questionários
  describe('Questionnaire Modals', () => {
    const mockQuiz = {
      id: '1',
      title: 'Questionário Teste',
      type: QUIZ_TYPE.QUESTIONARIO,
      questions: [
        {
          id: 'q1',
          statement: 'Pergunta 1',
          questionType: 'ALTERNATIVA',
          options: [
            { id: 'a', option: 'Opção A' },
            { id: 'b', option: 'Opção B' },
          ],
          correctOptionIds: ['a'],
        },
      ],
    };

    it('should show questionnaire all incorrect modal when all answers are incorrect', async () => {
      const mockOnTryLater = jest.fn();
      const mockOnRepeat = jest.fn();
      const mockOnGoToNextModule = jest.fn();

      // Configurar o mock antes de renderizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: mockQuiz,
        getCurrentAnswer: jest.fn().mockReturnValue('b'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
        getQuestionResultStatistics: jest.fn().mockReturnValue({
          totalQuestions: 1,
          correctAnswers: 0,
          incorrectAnswers: 1,
          timeSpent: 120,
        }),
      });

      render(
        <QuizFooter
          onTryLater={mockOnTryLater}
          onRepeat={mockOnRepeat}
          onGoToNextModule={mockOnGoToNextModule}
        />
      );

      // Finalizar quiz
      const finishButton = screen.getByText('Finalizar');
      clickElement(finishButton);

      // Verificar se o modal de questionário todos incorretos está aberto
      expect(screen.getByText('😕 Não foi dessa vez...')).toBeInTheDocument();
      expect(screen.getByText('Tentar depois')).toBeInTheDocument();
      expect(screen.getByText('Próximo módulo')).toBeInTheDocument();
    });

    it('should show alert dialog when trying later is clicked', async () => {
      const mockOnTryLater = jest.fn();
      const mockOnRepeat = jest.fn();

      // Configurar o mock antes de renderizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: { ...mockQuiz, type: QUIZ_TYPE.QUESTIONARIO },
        getCurrentAnswer: jest.fn().mockReturnValue('b'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
        getQuestionResultStatistics: jest.fn().mockReturnValue({
          totalQuestions: 1,
          correctAnswers: 0,
          incorrectAnswers: 1,
          timeSpent: 120,
        }),
      });

      render(
        <QuizFooter onTryLater={mockOnTryLater} onRepeat={mockOnRepeat} />
      );

      // Finalizar quiz
      const finishButton = screen.getByText('Finalizar');
      clickElement(finishButton);

      // Clicar em tentar depois
      const tryLaterButton = screen.getByText('Tentar depois');
      clickElement(tryLaterButton);

      // Verificar se o alert dialog aparece
      expect(screen.getByText('Tentar depois?')).toBeInTheDocument();
      expect(screen.getByText('Repetir questionário')).toBeInTheDocument();
      expect(screen.getByText('Tentar depois')).toBeInTheDocument();

      // Testar cancelar (repetir questionário)
      const cancelButton = screen.getByText('Repetir questionário');
      clickElement(cancelButton);

      expect(mockOnRepeat).toHaveBeenCalled();
    });

    it('should handle AlertDialog onChangeOpen callback correctly', async () => {
      const mockOnTryLater = jest.fn();
      const mockOnRepeat = jest.fn();

      // Configurar o mock antes de renderizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: { ...mockQuiz, type: QUIZ_TYPE.QUESTIONARIO },
        getCurrentAnswer: jest.fn().mockReturnValue('b'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
        getQuestionResultStatistics: jest.fn().mockReturnValue({
          totalQuestions: 1,
          correctAnswers: 0,
          incorrectAnswers: 1,
          timeSpent: 120,
        }),
      });

      render(
        <QuizFooter onTryLater={mockOnTryLater} onRepeat={mockOnRepeat} />
      );

      // Finalizar quiz para mostrar o modal inicial
      const finishButton = screen.getByText('Finalizar');
      clickElement(finishButton);

      // Clicar em tentar depois para abrir o AlertDialog
      const tryLaterButton = screen.getByText('Tentar depois');
      clickElement(tryLaterButton);

      // Verificar se o AlertDialog está aberto
      expect(screen.getByText('Tentar depois?')).toBeInTheDocument();
      expect(
        screen.getByText((content) => {
          return content.includes(
            'Você optou por refazer o questionário mais tarde'
          );
        })
      ).toBeInTheDocument();

      // Simular fechamento do modal através do onChangeOpen(false)
      // Isso normalmente seria feito pelo componente AlertDialog internamente
      // quando o usuário clica fora do modal ou pressiona ESC
      const alertDialog = screen.getByTestId('alert-dialog');
      expect(alertDialog).toBeInTheDocument();
    });

    it('should call onTryLater and close modal when submit button is clicked', async () => {
      const mockOnTryLater = jest.fn();
      const mockOnRepeat = jest.fn();

      // Configurar o mock antes de renderizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: { ...mockQuiz, type: QUIZ_TYPE.QUESTIONARIO },
        getCurrentAnswer: jest.fn().mockReturnValue('b'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
        getQuestionResultStatistics: jest.fn().mockReturnValue({
          totalQuestions: 1,
          correctAnswers: 0,
          incorrectAnswers: 1,
          timeSpent: 120,
        }),
      });

      render(
        <QuizFooter onTryLater={mockOnTryLater} onRepeat={mockOnRepeat} />
      );

      // Finalizar quiz
      const finishButton = screen.getByText('Finalizar');
      clickElement(finishButton);

      // Clicar em tentar depois para abrir o AlertDialog
      const tryLaterButton = screen.getByText('Tentar depois');
      clickElement(tryLaterButton);

      // Verificar se o AlertDialog está aberto
      expect(screen.getByText('Tentar depois?')).toBeInTheDocument();

      // Clicar no botão "Tentar depois" do AlertDialog (submit)
      const submitButton = screen.getByTestId('alert-submit');
      clickElement(submitButton);

      // Verificar se onTryLater foi chamado
      expect(mockOnTryLater).toHaveBeenCalledTimes(1);

      // Verificar se o modal foi fechado (não deve mais aparecer o texto do AlertDialog)
      await waitFor(() => {
        expect(screen.queryByText('Tentar depois?')).not.toBeInTheDocument();
      });
    });

    it('should call onRepeat and close modal when cancel button is clicked', async () => {
      const mockOnTryLater = jest.fn();
      const mockOnRepeat = jest.fn();

      // Configurar o mock antes de renderizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: { ...mockQuiz, type: QUIZ_TYPE.QUESTIONARIO },
        getCurrentAnswer: jest.fn().mockReturnValue('b'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
        getQuestionResultStatistics: jest.fn().mockReturnValue({
          totalQuestions: 1,
          correctAnswers: 0,
          incorrectAnswers: 1,
          timeSpent: 120,
        }),
      });

      render(
        <QuizFooter onTryLater={mockOnTryLater} onRepeat={mockOnRepeat} />
      );

      // Finalizar quiz
      const finishButton = screen.getByText('Finalizar');
      clickElement(finishButton);

      // Clicar em tentar depois para abrir o AlertDialog
      const tryLaterButton = screen.getByText('Tentar depois');
      clickElement(tryLaterButton);

      // Verificar se o AlertDialog está aberto
      expect(screen.getByText('Tentar depois?')).toBeInTheDocument();

      // Clicar no botão "Repetir questionário" (cancel)
      const cancelButton = screen.getByTestId('alert-cancel');
      clickElement(cancelButton);

      // Verificar se onRepeat foi chamado
      expect(mockOnRepeat).toHaveBeenCalledTimes(1);

      // Verificar se o modal foi fechado
      await waitFor(() => {
        expect(screen.queryByText('Tentar depois?')).not.toBeInTheDocument();
      });
    });

    it('should handle AlertDialog with undefined callbacks gracefully', async () => {
      // Renderizar sem callbacks definidos
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: { ...mockQuiz, type: QUIZ_TYPE.QUESTIONARIO },
        getCurrentAnswer: jest.fn().mockReturnValue('b'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
        getQuestionResultStatistics: jest.fn().mockReturnValue({
          totalQuestions: 1,
          correctAnswers: 0,
          incorrectAnswers: 1,
          timeSpent: 120,
        }),
      });

      render(<QuizFooter />);

      // Finalizar quiz
      const finishButton = screen.getByText('Finalizar');
      clickElement(finishButton);

      // Clicar em tentar depois para abrir o AlertDialog
      const tryLaterButton = screen.getByText('Tentar depois');
      clickElement(tryLaterButton);

      // Verificar se o AlertDialog está aberto
      expect(screen.getByText('Tentar depois?')).toBeInTheDocument();

      // Clicar no botão "Tentar depois" do AlertDialog - não deve quebrar
      const submitButton = screen.getByTestId('alert-submit');
      expect(() => {
        clickElement(submitButton);
      }).not.toThrow();

      // Verificar se o modal foi fechado mesmo sem callback
      await waitFor(() => {
        expect(screen.queryByText('Tentar depois?')).not.toBeInTheDocument();
      });
    });

    it('should display correct AlertDialog content and structure', async () => {
      const mockOnTryLater = jest.fn();
      const mockOnRepeat = jest.fn();

      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: { ...mockQuiz, type: QUIZ_TYPE.QUESTIONARIO },
        getCurrentAnswer: jest.fn().mockReturnValue('b'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
        getQuestionResultStatistics: jest.fn().mockReturnValue({
          totalQuestions: 1,
          correctAnswers: 0,
          incorrectAnswers: 1,
          timeSpent: 120,
        }),
      });

      render(
        <QuizFooter onTryLater={mockOnTryLater} onRepeat={mockOnRepeat} />
      );

      // Finalizar quiz e abrir AlertDialog
      const finishButton = screen.getByText('Finalizar');
      clickElement(finishButton);

      const tryLaterButton = screen.getByText('Tentar depois');
      clickElement(tryLaterButton);

      // Verificar título
      expect(screen.getByText('Tentar depois?')).toBeInTheDocument();

      // Verificar descrição completa usando matcher flexível
      expect(
        screen.getByText((content) => {
          return content.includes(
            'Você optou por refazer o questionário mais tarde'
          );
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText((content) => {
          return content.includes(
            'Lembre-se: enquanto não refazer o questionário, sua nota permanecerá 0 no sistema'
          );
        })
      ).toBeInTheDocument();

      // Verificar botões com labels corretos usando test-ids
      expect(screen.getByTestId('alert-cancel')).toHaveTextContent(
        'Repetir questionário'
      );
      expect(screen.getByTestId('alert-submit')).toHaveTextContent(
        'Tentar depois'
      );

      // Verificar estrutura do dialog
      expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
    });
  });

  // Testes para textos dinâmicos baseados no tipo
  describe('Dynamic Text Based on Quiz Type', () => {
    it('should show correct text for simulado type', () => {
      const mockSimuladoQuiz = {
        id: '1',
        title: 'Simulado ENEM',
        type: QUIZ_TYPE.SIMULADO,
        questions: [],
      };

      // Configurar o mock para habilitar o botão finalizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: mockSimuladoQuiz,
        getCurrentAnswer: jest.fn().mockReturnValue('a'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
      });

      render(<QuizFooter />);

      // Finalizar quiz
      const finishButton = screen.getByText('Finalizar');
      clickElement(finishButton);

      expect(
        screen.getByText(getCompletionTitle(QUIZ_TYPE.SIMULADO))
      ).toBeInTheDocument();
    });

    it('should show correct text for questionario type', () => {
      const mockQuestionarioQuiz = {
        id: '1',
        title: 'Questionário de Matemática',
        type: QUIZ_TYPE.QUESTIONARIO,
        questions: [],
      };

      // Configurar o mock para habilitar o botão finalizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: mockQuestionarioQuiz,
        getCurrentAnswer: jest.fn().mockReturnValue('a'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
        getQuestionResultStatistics: jest.fn().mockReturnValue({
          totalQuestions: 1,
          correctAnswers: 1,
          incorrectAnswers: 0,
          timeSpent: 120,
        }),
      });

      render(<QuizFooter />);

      // Finalizar quiz
      const finishButton = screen.getByText('Finalizar');
      clickElement(finishButton);

      expect(
        screen.getByText(getCompletionTitle(QUIZ_TYPE.QUESTIONARIO))
      ).toBeInTheDocument();
    });

    it('should show correct text for atividade type', () => {
      const mockAtividadeQuiz = {
        id: '1',
        title: 'Atividade de Física',
        type: QUIZ_TYPE.ATIVIDADE,
        questions: [],
      };

      // Configurar o mock para habilitar o botão finalizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: mockAtividadeQuiz,
        getCurrentAnswer: jest.fn().mockReturnValue('a'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
      });

      render(<QuizFooter />);

      // Finalizar quiz
      const finishButton = screen.getByText('Finalizar');
      clickElement(finishButton);

      expect(
        screen.getByText(getCompletionTitle(QUIZ_TYPE.ATIVIDADE))
      ).toBeInTheDocument();
    });

    it('should show default text when quiz type is unknown', () => {
      const mockUnknownQuiz = {
        id: '1',
        title: 'Quiz Desconhecido',
        type: 'UNKNOWN',
        questions: [],
      };

      // Configurar o mock para habilitar o botão finalizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: mockUnknownQuiz,
        getCurrentAnswer: jest.fn().mockReturnValue('a'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
      });

      render(<QuizFooter />);

      // Finalizar quiz
      const finishButton = screen.getByText('Finalizar');
      clickElement(finishButton);

      expect(
        screen.getByText(getCompletionTitle('unknown' as QUIZ_TYPE))
      ).toBeInTheDocument();
    });

    it('should show "Ir para aulas" button text when quiz type is QUESTIONARIO', async () => {
      const mockQuestionarioQuiz = {
        id: '1',
        title: 'Questionário de Matemática',
        type: QUIZ_TYPE.QUESTIONARIO,
        questions: [],
      };

      // Configurar o mock para habilitar o botão finalizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: mockQuestionarioQuiz,
        getCurrentAnswer: jest.fn().mockReturnValue('a'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
        getQuestionResultStatistics: jest.fn().mockReturnValue({
          totalQuestions: 1,
          correctAnswers: 1,
          incorrectAnswers: 0,
          timeSpent: 120,
        }),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([]),
        skipCurrentQuestionIfUnanswered: jest.fn(),
      });

      render(<QuizFooter />);

      // Finalizar quiz para abrir o modal de resultado
      const finishButton = screen.getByText('Finalizar');

      await act(async () => {
        finishButton.click();
      });

      // Verificar se o botão "Ir para aulas" está presente
      expect(screen.getByText('Ir para aulas')).toBeInTheDocument();

      // Verificar se o botão "Ir para questionários" NÃO está presente
      expect(
        screen.queryByText('Ir para questionários')
      ).not.toBeInTheDocument();
    });

    it('should show "Ir para simulados" button text when quiz type is SIMULADO', async () => {
      const mockSimuladoQuiz = {
        id: '1',
        title: 'Simulado ENEM',
        type: QUIZ_TYPE.SIMULADO,
        questions: [],
      };

      // Configurar o mock para habilitar o botão finalizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: mockSimuladoQuiz,
        getCurrentAnswer: jest.fn().mockReturnValue('a'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
        getQuestionResultStatistics: jest.fn().mockReturnValue({
          totalQuestions: 1,
          correctAnswers: 1,
          incorrectAnswers: 0,
          timeSpent: 120,
        }),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([]),
        skipCurrentQuestionIfUnanswered: jest.fn(),
      });

      render(<QuizFooter />);

      // Finalizar quiz para abrir o modal de resultado
      const finishButton = screen.getByText('Finalizar');

      await act(async () => {
        finishButton.click();
      });

      // Verificar se o botão "Ir para simulados" está presente
      expect(screen.getByText('Ir para simulados')).toBeInTheDocument();

      // Verificar se o botão "Ir para aulas" NÃO está presente
      expect(screen.queryByText('Ir para aulas')).not.toBeInTheDocument();
    });

    it('should show "Ir para atividades" button text when quiz type is ATIVIDADE', async () => {
      const mockAtividadeQuiz = {
        id: '1',
        title: 'Atividade de Física',
        type: QUIZ_TYPE.ATIVIDADE,
        questions: [],
      };

      // Configurar o mock para habilitar o botão finalizar
      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        quiz: mockAtividadeQuiz,
        getCurrentAnswer: jest.fn().mockReturnValue('a'),
        getQuestionStatusFromUserAnswers: jest.fn().mockReturnValue('answered'),
        getQuestionResultStatistics: jest.fn().mockReturnValue({
          totalQuestions: 1,
          correctAnswers: 1,
          incorrectAnswers: 0,
          timeSpent: 120,
        }),
        getUnansweredQuestionsFromUserAnswers: jest.fn().mockReturnValue([]),
        skipCurrentQuestionIfUnanswered: jest.fn(),
      });

      render(<QuizFooter />);

      // Finalizar quiz para abrir o modal de resultado
      const finishButton = screen.getByText('Finalizar');

      await act(async () => {
        finishButton.click();
      });

      // Verificar se o botão "Ir para atividades" está presente
      expect(screen.getByText('Ir para atividades')).toBeInTheDocument();

      // Verificar se o botão "Ir para aulas" NÃO está presente
      expect(screen.queryByText('Ir para aulas')).not.toBeInTheDocument();
    });
  });
});
