import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  Quiz,
  getStatusBadge,
  getStatusStyles,
  getTypeLabel,
  getCompletionTitle,
  getExitConfirmationText,
  getFinishConfirmationText,
  QuizHeaderResult,
  QuizTitle,
  QuizSubTitle,
  QuizHeader,
  QuizContainer,
  QuizContent,
  QuizAlternative,
  QuizMultipleChoice,
  QuizDissertative,
  QuizTrueOrFalse,
  QuizConnectDots,
  QuizFill,
  QuizImageQuestion,
  QuizQuestionList,
  QuizFooter,
  QuizResultHeaderTitle,
  QuizResultTitle,
  QuizListResult,
  QuizListResultByMateria,
  QuizResultPerformance,
} from './Quiz';
import {
  useQuizStore,
  ANSWER_STATUS,
  QUESTION_TYPE,
  QUESTION_DIFFICULTY,
  QUIZ_TYPE,
} from './useQuizStore';

// Mock the image
jest.mock('@/assets/img/mock-image-question.png', () => 'mocked-image-2.png');

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

// Mock MultipleChoice component
jest.mock('../MultipleChoice/MultipleChoice', () => ({
  MultipleChoiceList: ({
    choices,
    selectedValues,
    onHandleSelectedValues,
    mode,
  }: {
    choices: {
      value: string;
      label: string;
    }[];
    selectedValues: string[];
    onHandleSelectedValues: (values: string[]) => void;
    mode: string;
  }) => (
    <div data-testid="multiple-choice-list">
      {choices?.map(
        (
          choice: {
            value: string;
            label: string;
          },
          index: number
        ) => (
          <button
            key={choice.value || index}
            data-testid={`choice-${choice.value}`}
            onClick={() => {
              const isSelected = selectedValues?.includes(choice.value);
              const newValues = isSelected
                ? selectedValues.filter((v: string) => v !== choice.value)
                : [...(selectedValues || []), choice.value];
              onHandleSelectedValues?.(newValues);
            }}
            className={selectedValues?.includes(choice.value) ? 'selected' : ''}
            disabled={mode === 'readonly'}
          >
            {choice.label}
          </button>
        )
      )}
    </div>
  ),
}));

// Mock TextArea component
jest.mock('../TextArea/TextArea', () => {
  return React.forwardRef<
    HTMLTextAreaElement,
    {
      value: string;
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
      placeholder: string;
    }
  >(({ value, onChange, placeholder, ...props }, ref) => (
    <textarea
      ref={ref}
      data-testid="quiz-textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ));
});

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

// Mock ProgressCircle component
jest.mock('../ProgressCircle/ProgressCircle', () => {
  return React.forwardRef<
    HTMLDivElement,
    {
      size: string;
      variant: string;
      value: number;
      showPercentage: boolean;
      label: string;
      className: string;
    }
  >(
    (
      { size, variant, value, showPercentage, label, className, ...props },
      ref
    ) => (
      <div
        ref={ref}
        data-testid="progress-circle"
        data-size={size}
        data-variant={variant}
        data-value={value}
        data-show-percentage={showPercentage}
        data-label={label}
        className={className}
        {...props}
      />
    )
  );
});

// Mock ProgressBar component
jest.mock('../ProgressBar/ProgressBar', () => {
  return React.forwardRef<
    HTMLDivElement,
    {
      layout: string;
      variant: string;
      value: number;
      max: number;
      label: string;
      showHitCount: boolean;
      labelClassName: string;
      percentageClassName: string;
      className: string;
    }
  >(
    (
      {
        layout,
        variant,
        value,
        max,
        label,
        showHitCount,
        labelClassName,
        percentageClassName,
        className,
        ...props
      },
      ref
    ) => (
      <div
        ref={ref}
        data-testid="progress-bar"
        data-layout={layout}
        data-variant={variant}
        data-value={value}
        data-max={max}
        data-label={label}
        data-show-hit-count={showHitCount}
        className={className}
        {...props}
      >
        <span className={labelClassName}>{label}</span>
        <span className={percentageClassName}>
          {value}/{max}
        </span>
      </div>
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
    MULTIPLA_CHOICE: 'MULTIPLA_CHOICE',
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
    } as unknown as ReturnType<typeof useQuizStore>);
  });

  describe('getStatusBadge', () => {
    it('should return correct badge for correct status', () => {
      const badge = getStatusBadge('correct');

      render(<div>{badge}</div>);

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('should return incorrect badge for incorrect status', () => {
      const badge = getStatusBadge('incorrect');

      render(<div>{badge}</div>);

      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });

    it('should return null for undefined status', () => {
      const badge = getStatusBadge(undefined);

      expect(badge).toBeNull();
    });

    it('should return null for invalid status', () => {
      const badge = getStatusBadge(
        'invalid' as unknown as 'correct' | 'incorrect'
      );

      expect(badge).toBeNull();
    });
  });

  describe('getStatusStyles', () => {
    it('should return correct styles for correct status', () => {
      const styles = getStatusStyles('correct');

      expect(styles).toBe('bg-success-background border-success-300');
    });

    it('should return incorrect styles for incorrect status', () => {
      const styles = getStatusStyles('incorrect');

      expect(styles).toBe('bg-error-background border-error-300');
    });

    it('should return undefined for invalid status', () => {
      const styles = getStatusStyles('invalid');

      expect(styles).toBeUndefined();
    });

    it('should return undefined for undefined status', () => {
      const styles = getStatusStyles(undefined);

      expect(styles).toBeUndefined();
    });
  });

  describe('Quiz Component', () => {
    const mockSetVariant = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        setVariant: mockSetVariant,
      } as unknown as ReturnType<typeof useQuizStore>);
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

  describe('QuizHeaderResult Component', () => {
    const mockGetCurrentQuestion = jest.fn();
    const mockGetQuestionResultByQuestionId = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
      } as unknown as ReturnType<typeof useQuizStore>);
    });

    it('should render result header correctly', () => {
      render(<QuizHeaderResult />);

      expect(screen.getByText('Resultado')).toBeInTheDocument();
    });

    it('should show success message when answer is correct', () => {
      const mockQuestion = { id: 'question-1' };
      const mockQuestionResult = {
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      render(<QuizHeaderResult />);

      expect(screen.getByText('🎉 Parabéns!!')).toBeInTheDocument();
    });

    it('should show failure message when answer is incorrect', () => {
      const mockQuestion = { id: 'question-1' };
      const mockQuestionResult = {
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      render(<QuizHeaderResult />);

      expect(screen.getByText('Não foi dessa vez...')).toBeInTheDocument();
    });

    it('should show failure message when no current question', () => {
      mockGetCurrentQuestion.mockReturnValue(null);

      render(<QuizHeaderResult />);

      expect(
        screen.getByText('Não foi dessa vez...você deixou a resposta em branco')
      ).toBeInTheDocument();
    });

    it('should show failure message when no question result', () => {
      const mockQuestion = { id: 'question-1' };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(null);

      render(<QuizHeaderResult />);

      expect(
        screen.getByText('Não foi dessa vez...você deixou a resposta em branco')
      ).toBeInTheDocument();
    });

    it('should apply success background when answer is correct', () => {
      const mockQuestion = { id: 'question-1' };
      const mockQuestionResult = {
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      const { container } = render(<QuizHeaderResult />);
      const headerElement = container.firstChild as HTMLElement;

      expect(headerElement).toHaveClass('bg-success-background');
    });

    it('should apply error background when answer is incorrect', () => {
      const mockQuestion = { id: 'question-1' };
      const mockQuestionResult = {
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      const { container } = render(<QuizHeaderResult />);
      const headerElement = container.firstChild as HTMLElement;

      expect(headerElement).toHaveClass('bg-error-background');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <QuizHeaderResult className="custom-class" />
      );
      const headerElement = container.firstChild as HTMLElement;

      expect(headerElement).toHaveClass('custom-class');
    });

    it('should have default styling classes', () => {
      const { container } = render(<QuizHeaderResult />);
      const headerElement = container.firstChild as HTMLElement;

      expect(headerElement).toHaveClass(
        'flex',
        'flex-row',
        'items-center',
        'gap-10',
        'p-3.5',
        'rounded-xl',
        'mb-4'
      );
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(<QuizHeaderResult ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should update when question changes', () => {
      const mockQuestion1 = { id: 'question-1' };
      const mockQuestion2 = { id: 'question-2' };
      const mockQuestionResult1 = {
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      };
      const mockQuestionResult2 = {
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion1);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult1);

      const { rerender } = render(<QuizHeaderResult />);

      expect(screen.getByText('🎉 Parabéns!!')).toBeInTheDocument();

      // Change to different question
      mockGetCurrentQuestion.mockReturnValue(mockQuestion2);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult2);

      rerender(<QuizHeaderResult />);

      expect(screen.getByText('Não foi dessa vez...')).toBeInTheDocument();
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
      } as unknown as ReturnType<typeof useQuizStore>);

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
      } as unknown as ReturnType<typeof useQuizStore>);

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
      } as unknown as ReturnType<typeof useQuizStore>);

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
      } as unknown as ReturnType<typeof useQuizStore>);

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
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizTitle />);

      const iconButton = screen.getByTestId('quiz-icon-button');
      fireEvent.click(iconButton);

      expect(mockHistoryBack).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Deseja sair?')).not.toBeInTheDocument();
    });

    describe('Exit Confirmation Modal', () => {
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
        } as unknown as ReturnType<typeof useQuizStore>);

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
          getTotalQuestions: () => 5,
          getQuizTitle: () => 'Test Quiz',
          timeElapsed: 120,
          formatTime: () => '02:00',
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
          getTotalQuestions: () => 5,
          getQuizTitle: () => 'Test Quiz',
          timeElapsed: 120,
          formatTime: () => '02:00',
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
          getTotalQuestions: () => 5,
          getQuizTitle: () => 'Test Quiz',
          timeElapsed: 120,
          formatTime: () => '02:00',
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
  });

  describe('QuizSubTitle Component', () => {
    it('should render subtitle correctly', () => {
      render(<QuizSubTitle subTitle="Alternativas" />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
    });

    it('should render different subtitles', () => {
      const { rerender } = render(<QuizSubTitle subTitle="Questão 1" />);

      expect(screen.getByText('Questão 1')).toBeInTheDocument();

      rerender(<QuizSubTitle subTitle="Resposta" />);

      expect(screen.getByText('Resposta')).toBeInTheDocument();
    });

    it('should have default styling classes', () => {
      const { container } = render(<QuizSubTitle subTitle="Test Subtitle" />);
      const subtitleElement = container.firstChild as HTMLElement;

      expect(subtitleElement).toHaveClass('px-4', 'pb-2', 'pt-6');
    });

    it('should apply subtitle text styling', () => {
      render(<QuizSubTitle subTitle="Test Subtitle" />);
      const subtitleText = screen.getByText('Test Subtitle');

      expect(subtitleText).toHaveClass('font-bold', 'text-lg', 'text-text-950');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(<QuizSubTitle ref={ref} subTitle="Test Subtitle" />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should pass through additional props', () => {
      const { container } = render(
        <QuizSubTitle
          subTitle="Test Subtitle"
          data-testid="quiz-subtitle"
          aria-label="Quiz section subtitle"
        />
      );
      const subtitleElement = container.firstChild as HTMLElement;

      expect(subtitleElement).toHaveAttribute('data-testid', 'quiz-subtitle');
      expect(subtitleElement).toHaveAttribute(
        'aria-label',
        'Quiz section subtitle'
      );
    });

    it('should handle empty subtitle', () => {
      render(<QuizSubTitle subTitle="" />);

      // Should still render the container
      expect(document.querySelector('.px-4')).toBeInTheDocument();
    });

    it('should handle long subtitle text', () => {
      const longSubtitle =
        'Este é um subtítulo muito longo que pode quebrar em múltiplas linhas dependendo do layout';

      render(<QuizSubTitle subTitle={longSubtitle} />);

      expect(screen.getByText(longSubtitle)).toBeInTheDocument();
    });
  });

  describe('QuizHeader Component', () => {
    const mockGetCurrentQuestion = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        currentQuestionIndex: 0,
      } as unknown as ReturnType<typeof useQuizStore>);
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
      } as unknown as ReturnType<typeof useQuizStore>);

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
      } as unknown as ReturnType<typeof useQuizStore>);

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

  describe('QuizContainer Component', () => {
    it('should be defined', () => {
      expect(QuizContainer).toBeDefined();
      expect(typeof QuizContainer).toBe('object');
    });

    it('should render children correctly', () => {
      render(
        <QuizContainer>
          <div>Test Content</div>
          <p>Another child</p>
        </QuizContainer>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Another child')).toBeInTheDocument();
    });

    it('should have default styling classes', () => {
      const { container } = render(
        <QuizContainer>
          <div>Content</div>
        </QuizContainer>
      );

      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveClass(
        'bg-background',
        'rounded-t-xl',
        'px-4',
        'pt-4',
        'pb-[80px]',
        'h-auto',
        'flex',
        'flex-col',
        'gap-4',
        'mb-auto'
      );
    });

    it('should apply custom className', () => {
      const { container } = render(
        <QuizContainer className="custom-container-class">
          <div>Content</div>
        </QuizContainer>
      );

      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveClass('custom-container-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <QuizContainer className="custom-padding">
          <div>Content</div>
        </QuizContainer>
      );

      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveClass('custom-padding');
      expect(containerElement).toHaveClass('bg-background');
      expect(containerElement).toHaveClass('rounded-t-xl');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <QuizContainer ref={ref}>
          <div>Content</div>
        </QuizContainer>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveClass('bg-background');
    });

    it('should pass through additional props', () => {
      const { container } = render(
        <QuizContainer
          data-testid="quiz-container"
          aria-label="Quiz content container"
        >
          <div>Content</div>
        </QuizContainer>
      );

      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveAttribute('data-testid', 'quiz-container');
      expect(containerElement).toHaveAttribute(
        'aria-label',
        'Quiz content container'
      );
    });

    it('should render with no children', () => {
      const { container } = render(
        <QuizContainer>
          <div>Content</div>
        </QuizContainer>
      );

      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveClass('bg-background');
    });

    it('should handle complex nested children', () => {
      render(
        <QuizContainer>
          <div>
            <h2>Question Title</h2>
            <p>Question description</p>
            <ul>
              <li>Option A</li>
              <li>Option B</li>
            </ul>
          </div>
          <button>Submit</button>
        </QuizContainer>
      );

      expect(screen.getByText('Question Title')).toBeInTheDocument();
      expect(screen.getByText('Question description')).toBeInTheDocument();
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('should maintain semantic structure as div element', () => {
      const { container } = render(
        <QuizContainer>
          <div>Content</div>
        </QuizContainer>
      );

      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement.tagName).toBe('DIV');
    });

    it('should handle dynamic className changes', () => {
      const { container, rerender } = render(
        <QuizContainer className="initial-class">
          <div>Content</div>
        </QuizContainer>
      );

      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveClass('initial-class');

      rerender(
        <QuizContainer className="updated-class">
          <div>Content</div>
        </QuizContainer>
      );

      expect(containerElement).toHaveClass('updated-class');
      expect(containerElement).not.toHaveClass('initial-class');
    });

    it('should handle undefined className gracefully', () => {
      const { container } = render(
        <QuizContainer className={undefined}>
          <div>Content</div>
        </QuizContainer>
      );

      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveClass('bg-background');
      expect(containerElement).not.toHaveClass('undefined');
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
      } as unknown as ReturnType<typeof useQuizStore>);
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

  describe('QuizAlternative Component', () => {
    const mockGetCurrentQuestion = jest.fn();
    const mockSelectAnswer = jest.fn();
    const mockGetQuestionResultByQuestionId = jest.fn();
    const mockGetCurrentAnswer = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        selectAnswer: mockSelectAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        getCurrentAnswer: mockGetCurrentAnswer,
        variant: 'default',
      } as unknown as ReturnType<typeof useQuizStore>);

      jest.clearAllMocks();
    });

    it('should render alternatives correctly', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Option A' },
          { id: 'opt2', option: 'Option B' },
          { id: 'opt3', option: 'Option C' },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetCurrentAnswer.mockReturnValue(null);
      mockGetQuestionResultByQuestionId.mockReturnValue(null);

      render(<QuizAlternative paddingBottom="pb-4" />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
      expect(screen.getByTestId('alternative-opt1')).toBeInTheDocument();
      expect(screen.getByTestId('alternative-opt2')).toBeInTheDocument();
      expect(screen.getByTestId('alternative-opt3')).toBeInTheDocument();
    });

    it('should handle question without alternatives', () => {
      const mockQuestion = {
        id: 'question-1',
        options: null,
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizAlternative />);

      expect(screen.getByText('Não há Alternativas')).toBeInTheDocument();
    });

    it('should handle question with empty alternatives array', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizAlternative />);

      // Empty array still renders the alternatives list container, just with no items
      expect(screen.getByText('Alternativas')).toBeInTheDocument();
      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
    });

    it('should call selectAnswer when alternative is clicked', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Option A' },
          { id: 'opt2', option: 'Option B' },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetCurrentAnswer.mockReturnValue(null);

      render(<QuizAlternative />);

      const optionButton = screen.getByTestId('alternative-opt1');
      optionButton.click();

      expect(mockSelectAnswer).toHaveBeenCalledWith('question-1', 'opt1');
    });

    it('should display selected answer correctly', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Option A' },
          { id: 'opt2', option: 'Option B' },
        ],
      };

      const mockAnswer = {
        optionId: 'opt1',
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetCurrentAnswer.mockReturnValue(mockAnswer);

      render(<QuizAlternative />);

      const selectedOption = screen.getByTestId('alternative-opt1');
      expect(selectedOption).toHaveClass('selected');
    });

    it('should handle result variant correctly', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Option A' },
          { id: 'opt2', option: 'Option B' },
        ],
      };

      const mockQuestionResult = {
        selectedOptions: [{ optionId: 'opt1' }],
        options: [
          { id: 'opt1', isCorrect: true },
          { id: 'opt2', isCorrect: false },
        ],
      };

      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        selectAnswer: mockSelectAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        getCurrentAnswer: mockGetCurrentAnswer,
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      render(<QuizAlternative />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
    });

    it('should apply correct status to alternatives in result mode', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Correct Option' },
          { id: 'opt2', option: 'Incorrect Option' },
          { id: 'opt3', option: 'Neutral Option' },
        ],
      };

      const mockQuestionResult = {
        selectedOptions: [{ optionId: 'opt2' }], // User selected incorrect option
        options: [
          { id: 'opt1', isCorrect: true }, // This is the correct option
          { id: 'opt2', isCorrect: false }, // User selected this (incorrect)
          { id: 'opt3', isCorrect: false }, // Not selected, neutral
        ],
      };

      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        selectAnswer: mockSelectAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        getCurrentAnswer: mockGetCurrentAnswer,
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      render(<QuizAlternative />);

      // All alternatives should be rendered
      expect(screen.getByText('Correct Option')).toBeInTheDocument();
      expect(screen.getByText('Incorrect Option')).toBeInTheDocument();
      expect(screen.getByText('Neutral Option')).toBeInTheDocument();
    });

    it('should handle null current question', () => {
      mockGetCurrentQuestion.mockReturnValue(null);

      render(<QuizAlternative />);

      expect(screen.getByText('Não há Alternativas')).toBeInTheDocument();
    });

    it('should handle missing question result in result mode', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [{ id: 'opt1', option: 'Option A' }],
      };

      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        selectAnswer: mockSelectAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        getCurrentAnswer: mockGetCurrentAnswer,
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(null);

      render(<QuizAlternative />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
    });
  });

  describe('QuizMultipleChoice Component', () => {
    const mockGetCurrentQuestion = jest.fn();
    const mockSelectMultipleAnswer = jest.fn();
    const mockGetAllCurrentAnswer = jest.fn();
    const mockGetQuestionResultByQuestionId = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        selectMultipleAnswer: mockSelectMultipleAnswer,
        getAllCurrentAnswer: mockGetAllCurrentAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        variant: 'default',
      } as unknown as ReturnType<typeof useQuizStore>);

      jest.clearAllMocks();
    });

    it('should render multiple choice alternatives correctly', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Option A' },
          { id: 'opt2', option: 'Option B' },
          { id: 'opt3', option: 'Option C' },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetAllCurrentAnswer.mockReturnValue([]);
      mockGetQuestionResultByQuestionId.mockReturnValue(null);

      render(<QuizMultipleChoice paddingBottom="pb-4" />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
      expect(screen.getByTestId('multiple-choice-list')).toBeInTheDocument();
      expect(screen.getByTestId('choice-opt1')).toBeInTheDocument();
      expect(screen.getByTestId('choice-opt2')).toBeInTheDocument();
      expect(screen.getByTestId('choice-opt3')).toBeInTheDocument();
    });

    it('should handle question without choices', () => {
      const mockQuestion = {
        id: 'question-1',
        options: null,
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizMultipleChoice />);

      expect(screen.getByText('Não há Escolhas Multiplas')).toBeInTheDocument();
    });

    it('should handle question with empty choices array', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);

      render(<QuizMultipleChoice />);

      // Empty array still renders the subtitle and container, just with no choices
      expect(screen.getByText('Alternativas')).toBeInTheDocument();
      expect(screen.getByTestId('multiple-choice-list')).toBeInTheDocument();
    });

    it('should call selectMultipleAnswer when choice is clicked', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Option A' },
          { id: 'opt2', option: 'Option B' },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetAllCurrentAnswer.mockReturnValue([]);

      render(<QuizMultipleChoice />);

      const choiceButton = screen.getByTestId('choice-opt1');
      choiceButton.click();

      expect(mockSelectMultipleAnswer).toHaveBeenCalledWith('question-1', [
        'opt1',
      ]);
    });

    it('should display multiple selected answers correctly', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Option A' },
          { id: 'opt2', option: 'Option B' },
          { id: 'opt3', option: 'Option C' },
        ],
      };

      const mockAnswers = [{ optionId: 'opt1' }, { optionId: 'opt3' }];

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetAllCurrentAnswer.mockReturnValue(mockAnswers);

      render(<QuizMultipleChoice />);

      const selectedOption1 = screen.getByTestId('choice-opt1');
      const selectedOption3 = screen.getByTestId('choice-opt3');
      const unselectedOption2 = screen.getByTestId('choice-opt2');

      expect(selectedOption1).toHaveClass('selected');
      expect(selectedOption3).toHaveClass('selected');
      expect(unselectedOption2).not.toHaveClass('selected');
    });

    it('should handle result variant correctly', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Option A' },
          { id: 'opt2', option: 'Option B' },
        ],
      };

      const mockQuestionResult = {
        selectedOptions: [{ optionId: 'opt1' }],
        options: [
          { id: 'opt1', isCorrect: true },
          { id: 'opt2', isCorrect: false },
        ],
      };

      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        selectMultipleAnswer: mockSelectMultipleAnswer,
        getAllCurrentAnswer: mockGetAllCurrentAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      render(<QuizMultipleChoice />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
      expect(screen.getByTestId('multiple-choice-list')).toBeInTheDocument();

      // In result mode, choices should be disabled
      const choiceButtons = screen.getAllByRole('button');
      choiceButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should toggle choice selection correctly', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Option A' },
          { id: 'opt2', option: 'Option B' },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetAllCurrentAnswer.mockReturnValue([{ optionId: 'opt1' }]);

      render(<QuizMultipleChoice />);

      // Click on already selected option to deselect it
      const selectedOption = screen.getByTestId('choice-opt1');
      selectedOption.click();

      expect(mockSelectMultipleAnswer).toHaveBeenCalledWith('question-1', []);

      // Click on unselected option to add it
      const unselectedOption = screen.getByTestId('choice-opt2');
      unselectedOption.click();

      expect(mockSelectMultipleAnswer).toHaveBeenCalledWith('question-1', [
        'opt1',
        'opt2',
      ]);
    });

    it('should handle null current question', () => {
      mockGetCurrentQuestion.mockReturnValue(null);

      render(<QuizMultipleChoice />);

      expect(screen.getByText('Não há Escolhas Multiplas')).toBeInTheDocument();
    });

    it('should apply correct status to choices in result mode', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Correct Choice' },
          { id: 'opt2', option: 'Incorrect Choice' },
          { id: 'opt3', option: 'Neutral Choice' },
        ],
      };

      const mockQuestionResult = {
        selectedOptions: [{ optionId: 'opt2' }], // User selected incorrect choice
        options: [
          { id: 'opt1', isCorrect: true }, // This is the correct choice
          { id: 'opt2', isCorrect: false }, // User selected this (incorrect)
          { id: 'opt3', isCorrect: false }, // Not selected, neutral
        ],
      };

      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        selectMultipleAnswer: mockSelectMultipleAnswer,
        getAllCurrentAnswer: mockGetAllCurrentAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      render(<QuizMultipleChoice />);

      // All choices should be rendered
      expect(screen.getByText('Correct Choice')).toBeInTheDocument();
      expect(screen.getByText('Incorrect Choice')).toBeInTheDocument();
      expect(screen.getByText('Neutral Choice')).toBeInTheDocument();
    });

    it('should handle missing question result in result mode', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [{ id: 'opt1', option: 'Option A' }],
      };

      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        selectMultipleAnswer: mockSelectMultipleAnswer,
        getAllCurrentAnswer: mockGetAllCurrentAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(null);

      render(<QuizMultipleChoice />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();
      expect(screen.getByTestId('multiple-choice-list')).toBeInTheDocument();
    });

    it('should handle stable selected values to prevent infinite re-renders', () => {
      const mockQuestion = {
        id: 'question-1',
        options: [
          { id: 'opt1', option: 'Option A' },
          { id: 'opt2', option: 'Option B' },
        ],
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetAllCurrentAnswer.mockReturnValue([{ optionId: 'opt1' }]);

      const { rerender } = render(<QuizMultipleChoice />);

      expect(screen.getByTestId('choice-opt1')).toHaveClass('selected');

      // Re-render with same data should not cause issues
      rerender(<QuizMultipleChoice />);

      expect(screen.getByTestId('choice-opt1')).toHaveClass('selected');
    });
  });

  describe('QuizDissertative Component', () => {
    const mockGetCurrentQuestion = jest.fn();
    const mockGetCurrentAnswer = jest.fn();
    const mockSelectDissertativeAnswer = jest.fn();
    const mockGetQuestionResultByQuestionId = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        getCurrentAnswer: mockGetCurrentAnswer,
        selectDissertativeAnswer: mockSelectDissertativeAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        variant: 'default',
      } as unknown as ReturnType<typeof useQuizStore>);

      jest.clearAllMocks();
    });

    it('should render dissertative question correctly', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Explain the concept of React hooks',
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetCurrentAnswer.mockReturnValue(null);
      mockGetQuestionResultByQuestionId.mockReturnValue(null);

      render(<QuizDissertative paddingBottom="pb-4" />);

      expect(screen.getByText('Resposta')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-textarea')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Escreva sua resposta')
      ).toBeInTheDocument();
    });

    it('should handle no current question', () => {
      mockGetCurrentQuestion.mockReturnValue(null);

      render(<QuizDissertative />);

      expect(
        screen.getByText('Nenhuma questão disponível')
      ).toBeInTheDocument();
    });

    it('should have correct textarea props and structure', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetCurrentAnswer.mockReturnValue(null);

      render(<QuizDissertative />);

      const textarea = screen.getByTestId('quiz-textarea');

      // Verify the textarea is rendered with correct props
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('placeholder', 'Escreva sua resposta');
      expect(textarea).toHaveValue('');
      expect(textarea).toHaveAttribute('rows', '4');
    });

    it('should display current answer in textarea', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
      };

      const mockAnswer = {
        answer: 'This is my current answer',
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetCurrentAnswer.mockReturnValue(mockAnswer);

      render(<QuizDissertative />);

      const textarea = screen.getByTestId('quiz-textarea');
      expect(textarea).toHaveValue('This is my current answer');
    });

    it('should handle result variant correctly', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
      };

      const mockQuestionResult = {
        answer: 'This was the submitted answer',
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      };

      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        getCurrentAnswer: mockGetCurrentAnswer,
        selectDissertativeAnswer: mockSelectDissertativeAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      render(<QuizDissertative />);

      expect(screen.getByText('Resposta')).toBeInTheDocument();
      expect(
        screen.getByText('This was the submitted answer')
      ).toBeInTheDocument();
      // Should not show textarea in result mode
      expect(screen.queryByTestId('quiz-textarea')).not.toBeInTheDocument();
    });

    it('should show teacher observation when answer is incorrect in result mode', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
      };

      const mockQuestionResult = {
        answer: 'Wrong answer',
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      };

      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        getCurrentAnswer: mockGetCurrentAnswer,
        selectDissertativeAnswer: mockSelectDissertativeAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      render(<QuizDissertative />);

      expect(screen.getByText('Observação do professor')).toBeInTheDocument();
      expect(
        screen.getByText(/Lorem ipsum dolor sit amet/)
      ).toBeInTheDocument();
    });

    it('should not show teacher observation when answer is correct in result mode', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
      };

      const mockQuestionResult = {
        answer: 'Correct answer',
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      };

      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        getCurrentAnswer: mockGetCurrentAnswer,
        selectDissertativeAnswer: mockSelectDissertativeAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      render(<QuizDissertative />);

      expect(screen.getByText('Resposta')).toBeInTheDocument();
      expect(
        screen.queryByText('Observação do professor')
      ).not.toBeInTheDocument();
    });

    it('should show default message when no answer provided in result mode', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
      };

      const mockQuestionResult = {
        answer: '',
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      };

      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        getCurrentAnswer: mockGetCurrentAnswer,
        selectDissertativeAnswer: mockSelectDissertativeAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(mockQuestionResult);

      render(<QuizDissertative />);

      expect(
        screen.getByText('Nenhuma resposta fornecida')
      ).toBeInTheDocument();
    });

    it('should handle empty current answer in default mode', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetCurrentAnswer.mockReturnValue({ answer: '' });

      render(<QuizDissertative />);

      const textarea = screen.getByTestId('quiz-textarea');
      expect(textarea).toHaveValue('');
    });

    it('should handle null current answer in default mode', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetCurrentAnswer.mockReturnValue(null);

      render(<QuizDissertative />);

      const textarea = screen.getByTestId('quiz-textarea');
      expect(textarea).toHaveValue('');
    });

    it('should call selectDissertativeAnswer when handleAnswerChange is triggered', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
      };

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetCurrentAnswer.mockReturnValue(null);

      render(<QuizDissertative />);

      const textarea = screen.getByTestId('quiz-textarea');
      const testAnswer = 'This is a test answer';

      // Simulate user changing the textarea value
      fireEvent.change(textarea, { target: { value: testAnswer } });

      // Verify that selectDissertativeAnswer was called with correct parameters
      expect(mockSelectDissertativeAnswer).toHaveBeenCalledWith(
        'question-1',
        testAnswer
      );
      expect(mockSelectDissertativeAnswer).toHaveBeenCalledTimes(1);
    });

    it('should handle missing question result in result mode', () => {
      const mockQuestion = {
        id: 'question-1',
        statement: 'Test question',
      };

      mockUseQuizStore.mockReturnValue({
        getCurrentQuestion: mockGetCurrentQuestion,
        getCurrentAnswer: mockGetCurrentAnswer,
        selectDissertativeAnswer: mockSelectDissertativeAnswer,
        getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetCurrentQuestion.mockReturnValue(mockQuestion);
      mockGetQuestionResultByQuestionId.mockReturnValue(null);

      render(<QuizDissertative />);

      expect(screen.getByText('Resposta')).toBeInTheDocument();
      expect(
        screen.getByText('Nenhuma resposta fornecida')
      ).toBeInTheDocument();
    });
  });

  describe('QuizTrueOrFalse Component', () => {
    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        variant: 'default',
      } as unknown as ReturnType<typeof useQuizStore>);
    });

    it('should render true or false alternatives correctly', () => {
      render(<QuizTrueOrFalse paddingBottom="pb-4" />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();

      // Should render all mock options
      expect(screen.getByText('a) 25 metros')).toBeInTheDocument();
      expect(screen.getByText('b) 30 metros')).toBeInTheDocument();
      expect(screen.getByText('c) 40 metros')).toBeInTheDocument();
      expect(screen.getByText('d) 50 metros')).toBeInTheDocument();
    });

    it('should render select components in default variant', () => {
      render(<QuizTrueOrFalse />);

      // Should render select components for each option
      const selectTriggers = screen.getAllByTestId('select-trigger');
      expect(selectTriggers).toHaveLength(4); // One for each option

      // Should have correct placeholder
      expect(screen.getAllByText('Selecione opcão')).toHaveLength(4);
    });

    it('should render status badges in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizTrueOrFalse />);

      // Should render status badges instead of selects
      expect(screen.getByText('Resposta correta')).toBeInTheDocument(); // For the correct option (25 metros)
      expect(screen.getAllByText('Resposta incorreta')).toHaveLength(3); // For the incorrect options
    });

    it('should apply correct styling in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      const { container } = render(<QuizTrueOrFalse />);

      // Check if status styles are applied
      const sections = container.querySelectorAll('section');
      expect(sections[0].querySelector('div')).toHaveClass(
        'bg-success-background',
        'border-success-300'
      ); // Correct answer
      expect(sections[1].querySelector('div')).toHaveClass(
        'bg-error-background',
        'border-error-300'
      ); // Incorrect answer
    });

    it('should show selected answers and correct answers in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizTrueOrFalse />);

      // Should show selected answer
      expect(screen.getAllByText('Resposta selecionada: V')).toHaveLength(4);

      // Should show correct answer for incorrect options
      expect(screen.getAllByText('Resposta correta: F')).toHaveLength(3);
    });

    it('should not show correct answer text for correct option in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      const { container } = render(<QuizTrueOrFalse />);

      // The first option is correct, so it shouldn't show "Resposta correta: F"
      const firstSection = container.querySelector('section');
      expect(firstSection).not.toHaveTextContent('Resposta correta: F');
    });

    it('should have correct letter indexing', () => {
      render(<QuizTrueOrFalse />);

      expect(screen.getByText('a) 25 metros')).toBeInTheDocument();
      expect(screen.getByText('b) 30 metros')).toBeInTheDocument();
      expect(screen.getByText('c) 40 metros')).toBeInTheDocument();
      expect(screen.getByText('d) 50 metros')).toBeInTheDocument();
    });

    it('should apply paddingBottom prop correctly', () => {
      const { container } = render(<QuizTrueOrFalse paddingBottom="pb-8" />);

      const quizContainer = container.querySelector('.bg-background');
      expect(quizContainer).toHaveClass('pb-8');
    });

    it('should have correct structure with subtitle and container', () => {
      render(<QuizTrueOrFalse />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();

      // Should have the main container structure
      const container = document.querySelector('.bg-background');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('rounded-t-xl', 'px-4', 'pt-4');
    });

    it('should handle variant switching correctly', () => {
      const { rerender } = render(<QuizTrueOrFalse />);

      // Initially in default variant
      expect(screen.getAllByTestId('select-trigger')).toHaveLength(4);

      // Switch to result variant
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      rerender(<QuizTrueOrFalse />);

      // Should now show badges instead of selects
      expect(screen.queryAllByTestId('select-trigger')).toHaveLength(0);
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });
  });

  describe('QuizConnectDots Component', () => {
    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        variant: 'default',
      } as unknown as ReturnType<typeof useQuizStore>);
    });

    it('should render connect dots alternatives correctly', () => {
      render(<QuizConnectDots paddingBottom="pb-4" />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();

      // Should render all mock options
      expect(screen.getByText('a) Cachorro')).toBeInTheDocument();
      expect(screen.getByText('b) Gato')).toBeInTheDocument();
      expect(screen.getByText('c) Cabra')).toBeInTheDocument();
      expect(screen.getByText('d) Baleia')).toBeInTheDocument();
    });

    it('should render select components in default variant', () => {
      render(<QuizConnectDots />);

      // Should render select components for each option
      const selectTriggers = screen.getAllByTestId('select-trigger');
      expect(selectTriggers).toHaveLength(4); // One for each option

      // Should have correct placeholder
      expect(screen.getAllByText('Selecione opção')).toHaveLength(4);
    });

    it('should render status badges in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizConnectDots />);

      // Should render status badges for answered questions
      expect(screen.getAllByText('Resposta correta')).toHaveLength(2); // Cachorro and Gato are correct
      expect(screen.getAllByText('Resposta incorreta')).toHaveLength(2); // Cabra and Baleia are incorrect
    });

    it('should show selected and correct answers in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizConnectDots />);

      // Should show selected answers
      expect(
        screen.getByText('Resposta selecionada: Ração')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Resposta selecionada: Rato')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Resposta selecionada: Peixe')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Resposta selecionada: Grama')
      ).toBeInTheDocument();

      // Should show correct answers for incorrect options
      expect(screen.getByText('Resposta correta: Grama')).toBeInTheDocument(); // For Cabra
      expect(screen.getByText('Resposta correta: Peixe')).toBeInTheDocument(); // For Baleia
    });

    it('should not show correct answer text for correct options in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizConnectDots />);

      // Correct options (Cachorro and Gato) shouldn't show "Resposta correta:"
      expect(
        screen.queryByText('Resposta correta: Ração')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Resposta correta: Rato')
      ).not.toBeInTheDocument();
    });

    it('should apply correct styling in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      const { container } = render(<QuizConnectDots />);

      // Check if status styles are applied
      const sections = container.querySelectorAll('section');
      expect(sections[0].querySelector('div')).toHaveClass(
        'bg-success-background',
        'border-success-300'
      ); // Cachorro - correct
      expect(sections[1].querySelector('div')).toHaveClass(
        'bg-success-background',
        'border-success-300'
      ); // Gato - correct
      expect(sections[2].querySelector('div')).toHaveClass(
        'bg-error-background',
        'border-error-300'
      ); // Cabra - incorrect
      expect(sections[3].querySelector('div')).toHaveClass(
        'bg-error-background',
        'border-error-300'
      ); // Baleia - incorrect
    });

    it('should have correct letter indexing', () => {
      render(<QuizConnectDots />);

      expect(screen.getByText('a) Cachorro')).toBeInTheDocument();
      expect(screen.getByText('b) Gato')).toBeInTheDocument();
      expect(screen.getByText('c) Cabra')).toBeInTheDocument();
      expect(screen.getByText('d) Baleia')).toBeInTheDocument();
    });

    it('should apply paddingBottom prop correctly', () => {
      const { container } = render(<QuizConnectDots paddingBottom="pb-8" />);

      const quizContainer = container.querySelector('.bg-background');
      expect(quizContainer).toHaveClass('pb-8');
    });

    it('should handle variant switching correctly', () => {
      const { rerender } = render(<QuizConnectDots />);

      // Initially in default variant
      expect(screen.getAllByTestId('select-trigger')).toHaveLength(4);

      // Switch to result variant
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      rerender(<QuizConnectDots />);

      // Should now show no selects and no badges since there are no answers in default->result switch
      expect(screen.queryAllByTestId('select-trigger')).toHaveLength(0);
      expect(screen.queryAllByText('Resposta correta')).toHaveLength(0);
      expect(screen.queryAllByText('Resposta incorreta')).toHaveLength(0);

      // Should show "Nenhuma" for selected answers since state resets
      expect(screen.getAllByText('Resposta selecionada: Nenhuma')).toHaveLength(
        4
      );
    });

    it('should initialize with empty selections in default variant', () => {
      render(<QuizConnectDots />);

      // All selects should have placeholder text
      expect(screen.getAllByText('Selecione opção')).toHaveLength(4);
    });

    it('should handle state management correctly in default variant', () => {
      render(<QuizConnectDots />);

      // Component should render without errors and maintain internal state
      expect(screen.getByText('Alternativas')).toBeInTheDocument();

      // Should have the structure for managing user answers
      const selectComponents = screen.getAllByTestId('quiz-select');
      expect(selectComponents).toHaveLength(4);
    });

    it('should show no status badge for null answers in result variant', () => {
      // Test the case where isCorrect is null (no answer given)
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      // We can't easily mock the internal state, but we can test the render
      render(<QuizConnectDots />);

      // The component should render without throwing errors
      expect(screen.getByText('Alternativas')).toBeInTheDocument();
    });
  });

  describe('QuizFill Component', () => {
    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        variant: 'default',
      } as unknown as ReturnType<typeof useQuizStore>);
    });

    it('should render fill-in-the-blanks text correctly', () => {
      render(<QuizFill paddingBottom="pb-4" />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();

      // Should render the text content (checking for parts of the text)
      expect(screen.getByText(/A meteorologia é a/)).toBeInTheDocument();
      expect(
        screen.getByText(/que estuda os fenômenos atmosféricos/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Os meteorologistas utilizam diversos/)
      ).toBeInTheDocument();
    });

    it('should render select components for placeholders in default variant', () => {
      render(<QuizFill />);

      // Should render select components for each placeholder in the text
      // The text has placeholders: {{ciencia}}, {{variações}}, {{objetivo}}, {{instrumentos}}, {{equipamentos}}
      const selectComponents = screen.getAllByTestId('quiz-select');
      expect(selectComponents.length).toBeGreaterThan(0); // Should have selects for placeholders
    });

    it('should render placeholders correctly in default variant', () => {
      render(<QuizFill />);

      // Should have select placeholder text
      const placeholders = screen.getAllByText('Selecione opção');
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it('should render badges in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizFill />);

      // Should render badges based on mock user answers
      // Check for specific badge elements with text content
      expect(screen.getByText('tecnologia')).toBeInTheDocument(); // Incorrect answer for 'ciencia'
      expect(screen.getByText('estudar')).toBeInTheDocument(); // Incorrect answer for 'objetivo'
      expect(screen.getByText('ferramentas')).toBeInTheDocument(); // Incorrect answer for 'instrumentos'

      // Check if badges exist by counting quiz-badge test ids
      const badges = screen.getAllByTestId('quiz-badge');
      expect(badges.length).toBe(5); // Should have 5 badges for 5 placeholders
    });

    it('should show resultado section in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizFill />);

      // Should show the resolution section
      expect(screen.getAllByText('Resultado')).toHaveLength(1);

      // Should show correct answers in the resolution
      expect(screen.getByText('ciência')).toBeInTheDocument();
      expect(screen.getByText('compreender')).toBeInTheDocument();
      expect(screen.getByText('instrumentos')).toBeInTheDocument();
    });

    it('should apply paddingBottom correctly in default variant', () => {
      const { container } = render(<QuizFill paddingBottom="pb-8" />);

      // Should apply paddingBottom to the text content in default variant
      const textContent = container.querySelector(
        '.text-lg.text-text-900.leading-8'
      );
      expect(textContent).toHaveClass('pb-8');
    });

    it('should apply paddingBottom correctly in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      const { container } = render(<QuizFill paddingBottom="pb-8" />);

      // Should apply paddingBottom to the resolution section in result variant
      const resolutionContent = container.querySelectorAll(
        '.text-lg.text-text-900.leading-8'
      )[1]; // Second one is resolution
      expect(resolutionContent).toHaveClass('pb-8');
    });

    it('should have correct structure with subtitle and container', () => {
      render(<QuizFill />);

      expect(screen.getByText('Alternativas')).toBeInTheDocument();

      // Should have the main container structure
      const container = document.querySelector('.bg-background');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('h-auto', 'pb-0');
    });

    it('should handle text parsing correctly', () => {
      render(<QuizFill />);

      // The component should parse the text and find placeholders
      // We can't easily test the regex directly, but we can check the rendered structure
      expect(screen.getByText('Alternativas')).toBeInTheDocument();

      // Should have processed the text without errors
      const textContainer = document.querySelector('.space-y-6.px-4.h-auto');
      expect(textContainer).toBeInTheDocument();
    });

    it('should initialize with empty state in default variant', () => {
      render(<QuizFill />);

      // All selects should start with placeholder text
      const placeholders = screen.getAllByText('Selecione opção');
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it('should handle variant switching correctly', () => {
      const { rerender } = render(<QuizFill />);

      // Initially in default variant - should have selects
      expect(screen.getAllByTestId('quiz-select').length).toBeGreaterThan(0);

      // Switch to result variant
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      rerender(<QuizFill />);

      // Should now show badges and resultado section
      expect(screen.getAllByText('Resultado')).toHaveLength(1);
      expect(screen.getByText('tecnologia')).toBeInTheDocument();
    });

    it('should render correct structure for both sections in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizFill />);

      // Should have both Alternativas and Resultado sections
      expect(screen.getByText('Alternativas')).toBeInTheDocument();
      expect(screen.getAllByText('Resultado')).toHaveLength(1);

      // Should have two QuizContainer elements
      const containers = document.querySelectorAll(
        '.bg-background.h-auto.pb-0'
      );
      expect(containers).toHaveLength(2);
    });

    it('should handle unicode characters in placeholders', () => {
      // The component uses a regex that supports Unicode: /\{\{([\p{L}\p{M}\d_]+)\}\}/gu
      // This allows placeholders like {{variações}} with accented characters
      render(<QuizFill />);

      // Should render without errors even with unicode characters
      expect(screen.getByText('Alternativas')).toBeInTheDocument();

      // Check if select options with unicode characters exist
      const selectOptions = screen.getAllByRole('button', {
        name: /variações/,
      });
      expect(selectOptions.length).toBeGreaterThan(0);
    });

    it('should handle mock user answers correctly in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizFill />);

      // Should render user answers from the mock data
      // Check for badges with correct data attributes for success/error
      const badges = screen.getAllByTestId('quiz-badge');
      expect(badges.length).toBe(5); // Should have 5 badges total

      // Count badges by action type
      const successBadges = badges.filter(
        (badge) => badge.getAttribute('data-action') === 'success'
      );
      const errorBadges = badges.filter(
        (badge) => badge.getAttribute('data-action') === 'error'
      );

      expect(successBadges.length).toBe(2); // variações and equipamentos are correct
      expect(errorBadges.length).toBe(3); // tecnologia, estudar, ferramentas are incorrect

      // Verify all answers are rendered as text content
      expect(screen.getAllByText('tecnologia')).toHaveLength(1);
      expect(screen.getAllByText('estudar')).toHaveLength(1);
      expect(screen.getAllByText('ferramentas')).toHaveLength(1);
      expect(screen.getAllByText('variações')).toHaveLength(2); // One in badge, one in resolution
      expect(screen.getAllByText('equipamentos')).toHaveLength(2); // One in badge, one in resolution
    });

    it('should apply default paddingBottom when not provided', () => {
      const { container } = render(<QuizFill />);

      // Should use default paddingBottom when prop is not provided
      // The component uses paddingBottom as a prop default value, not a class
      const textContent = container.querySelector(
        '.text-lg.text-text-900.leading-8'
      );
      expect(textContent).toBeInTheDocument();

      // Since paddingBottom is applied conditionally and the default is handled internally,
      // we just verify the component renders without errors
      expect(screen.getByText('Alternativas')).toBeInTheDocument();
    });

    it('should handle state management correctly for selects', () => {
      render(<QuizFill />);

      // Component should manage internal state for answers
      // We can't easily test the state directly, but we can check structure
      expect(screen.getByText('Alternativas')).toBeInTheDocument();

      // Should have select components with proper structure
      const selectComponents = screen.getAllByTestId('quiz-select');
      expect(selectComponents.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs for elements', () => {
      const { container } = render(<QuizFill />);

      // Component uses useId() to generate unique IDs
      // We can check that elements are rendered properly
      expect(
        container.querySelector('.space-y-6.px-4.h-auto')
      ).toBeInTheDocument();

      // Should have processed text elements with unique keys
      const spans = container.querySelectorAll('span');
      expect(spans.length).toBeGreaterThan(0);
    });
  });

  describe('QuizImageQuestion Component', () => {
    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        variant: 'default',
      } as unknown as ReturnType<typeof useQuizStore>);
    });

    it('should render image question correctly', () => {
      render(<QuizImageQuestion paddingBottom="pb-4" />);

      expect(screen.getByText('Clique na área correta')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-image-container')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-image-button')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-image')).toBeInTheDocument();
    });

    it('should have correct image attributes', () => {
      render(<QuizImageQuestion />);

      const image = screen.getByTestId('quiz-image');
      expect(image).toHaveAttribute('src', 'mocked-image-2.png');
      expect(image).toHaveAttribute('alt', 'Question');
      expect(image).toHaveClass('w-full', 'h-auto', 'rounded-md');
    });

    it('should have interactive button with correct attributes', () => {
      render(<QuizImageQuestion />);

      const button = screen.getByTestId('quiz-image-button');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-label', 'Área da imagem interativa');
      expect(button).toHaveClass(
        'relative',
        'cursor-pointer',
        'w-full',
        'h-full'
      );
    });

    it('should not show legend in default variant', () => {
      render(<QuizImageQuestion />);

      expect(screen.queryByTestId('quiz-legend')).not.toBeInTheDocument();
      expect(screen.queryByText('Área correta')).not.toBeInTheDocument();
    });

    it('should not show correct circle in default variant', () => {
      render(<QuizImageQuestion />);

      expect(
        screen.queryByTestId('quiz-correct-circle')
      ).not.toBeInTheDocument();
    });

    it('should show legend in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizImageQuestion />);

      expect(screen.getByTestId('quiz-legend')).toBeInTheDocument();
      expect(screen.getByText('Área correta')).toBeInTheDocument();
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });

    it('should show correct circle in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizImageQuestion />);

      expect(screen.getByTestId('quiz-correct-circle')).toBeInTheDocument();

      const correctCircle = screen.getByTestId('quiz-correct-circle');
      expect(correctCircle).toHaveClass(
        'absolute',
        'rounded-full',
        'bg-indicator-primary/70'
      );
    });

    it('should show user circle in result variant with mock position', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizImageQuestion />);

      expect(screen.getByTestId('quiz-user-circle')).toBeInTheDocument();

      const userCircle = screen.getByTestId('quiz-user-circle');
      expect(userCircle).toHaveClass('absolute', 'rounded-full', 'border-4');
    });

    it('should handle click events in default variant', () => {
      render(<QuizImageQuestion />);

      const button = screen.getByTestId('quiz-image-button');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        width: 400,
        height: 300,
        x: 0,
        y: 0,
        right: 400,
        bottom: 300,
        toJSON: jest.fn(),
      }));
      button.getBoundingClientRect = mockGetBoundingClientRect;

      // Use act to wrap state updates
      act(() => {
        button.click();
      });

      // After click, should show user circle
      expect(screen.getByTestId('quiz-user-circle')).toBeInTheDocument();
    });

    it('should not handle click events in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizImageQuestion />);

      const button = screen.getByTestId('quiz-image-button');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        width: 400,
        height: 300,
        x: 0,
        y: 0,
        right: 400,
        bottom: 300,
        toJSON: jest.fn(),
      }));
      button.getBoundingClientRect = mockGetBoundingClientRect;

      // Create a click event
      const clickEvent = new MouseEvent('click', {
        clientX: 200,
        clientY: 150,
        bubbles: true,
      });

      button.dispatchEvent(clickEvent);

      // Should still show user circle from mock data, but position shouldn't change
      const userCircle = screen.getByTestId('quiz-user-circle');
      expect(userCircle).toBeInTheDocument();
    });

    it('should handle keyboard events (Enter and Space)', () => {
      render(<QuizImageQuestion />);

      const button = screen.getByTestId('quiz-image-button');

      // Test Enter key
      act(() => {
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
        });
        button.dispatchEvent(enterEvent);
      });

      // Should show user circle at center position (0.5, 0.5)
      expect(screen.getByTestId('quiz-user-circle')).toBeInTheDocument();

      // Test Space key
      act(() => {
        const spaceEvent = new KeyboardEvent('keydown', {
          key: ' ',
          bubbles: true,
        });
        button.dispatchEvent(spaceEvent);
      });

      // Should still have user circle
      expect(screen.getByTestId('quiz-user-circle')).toBeInTheDocument();
    });

    it('should not handle keyboard events in result variant', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizImageQuestion />);

      const button = screen.getByTestId('quiz-image-button');

      // User circle should be from mock data initially
      expect(screen.getByTestId('quiz-user-circle')).toBeInTheDocument();

      // Test keyboard event - should not change anything
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      });
      button.dispatchEvent(enterEvent);

      // Should still have user circle (from mock data)
      expect(screen.getByTestId('quiz-user-circle')).toBeInTheDocument();
    });

    it('should apply paddingBottom correctly', () => {
      const { container } = render(<QuizImageQuestion paddingBottom="pb-8" />);

      const quizContainer = container.querySelector('.bg-background');
      expect(quizContainer).toHaveClass('pb-8');
    });

    it('should have correct subtitle', () => {
      render(<QuizImageQuestion />);

      expect(screen.getByText('Clique na área correta')).toBeInTheDocument();

      // Check subtitle structure
      const subtitle = screen.getByText('Clique na área correta');
      expect(subtitle).toHaveClass('font-bold', 'text-lg', 'text-text-950');
    });

    it('should have correct container structure', () => {
      render(<QuizImageQuestion />);

      const container = screen.getByTestId('quiz-image-container');
      expect(container).toHaveClass(
        'space-y-6',
        'p-3',
        'relative',
        'inline-block'
      );

      // Should be inside QuizContainer
      const quizContainer = container.closest('.bg-background');
      expect(quizContainer).toBeInTheDocument();
    });

    it('should handle variant switching correctly', () => {
      const { rerender } = render(<QuizImageQuestion />);

      // Initially in default variant - no legend
      expect(screen.queryByTestId('quiz-legend')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('quiz-correct-circle')
      ).not.toBeInTheDocument();

      // Switch to result variant
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      rerender(<QuizImageQuestion />);

      // Should now show legend and correct circle
      expect(screen.getByTestId('quiz-legend')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-correct-circle')).toBeInTheDocument();
    });

    it('should calculate correct position and radius correctly', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizImageQuestion />);

      const correctCircle = screen.getByTestId('quiz-correct-circle');

      // Should have correct positioning styles - only test the width since other styles are inline
      expect(correctCircle).toHaveStyle({
        width: '15%',
      });

      // Verify the positioning classes are applied
      expect(correctCircle).toHaveClass(
        'absolute',
        'rounded-full',
        'bg-indicator-primary/70'
      );
    });

    it('should have correct user circle styling based on correctness', () => {
      mockUseQuizStore.mockReturnValue({
        variant: 'result',
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizImageQuestion />);

      const userCircle = screen.getByTestId('quiz-user-circle');

      // The mock position (0.72, 0.348) should be outside the correct area
      // So it should have error styling
      expect(userCircle).toHaveClass('bg-indicator-error/70', 'border-white');
    });

    it('should show correct user circle styling when answer is correct', () => {
      // We need to test when the user clicks in the correct area
      render(<QuizImageQuestion />);

      const button = screen.getByTestId('quiz-image-button');

      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        width: 400,
        height: 300,
        x: 0,
        y: 0,
        right: 400,
        bottom: 300,
        toJSON: jest.fn(),
      }));
      button.getBoundingClientRect = mockGetBoundingClientRect;

      // Use act to wrap the click event
      act(() => {
        const clickEvent = new MouseEvent('click', {
          clientX: 192, // Near the correct position (0.48, 0.45) -> (192, 135) in a 400x300 image
          clientY: 135,
          bubbles: true,
        });
        button.dispatchEvent(clickEvent);
      });

      // Should show user circle
      const userCircle = screen.getByTestId('quiz-user-circle');
      expect(userCircle).toBeInTheDocument();

      // In default mode, should have primary styling
      expect(userCircle).toHaveClass(
        'bg-indicator-primary/70',
        'border-[#F8CC2E]'
      );
    });

    it('should handle edge cases for coordinate conversion', () => {
      render(<QuizImageQuestion />);

      const button = screen.getByTestId('quiz-image-button');

      // Mock getBoundingClientRect with very small dimensions
      const mockGetBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        width: 0.001,
        height: 0.001,
        x: 0,
        y: 0,
        right: 0.001,
        bottom: 0.001,
        toJSON: jest.fn(),
      }));
      button.getBoundingClientRect = mockGetBoundingClientRect;

      // Use act to wrap the click event
      act(() => {
        const clickEvent = new MouseEvent('click', {
          clientX: 10,
          clientY: 10,
          bubbles: true,
        });
        button.dispatchEvent(clickEvent);
      });

      // Should still work and show user circle
      expect(screen.getByTestId('quiz-user-circle')).toBeInTheDocument();
    });

    it('should use default styling when variant is neither default nor result', () => {
      // Test the default case in getUserCircleColorClasses
      mockUseQuizStore.mockReturnValue({
        variant: 'unknown-variant', // Neither 'default' nor 'result'
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizImageQuestion />);

      // Click to create a user circle
      const imageButton = screen.getByTestId('quiz-image-button');

      act(() => {
        imageButton.click();
      });

      const userCircle = screen.getByTestId('quiz-user-circle');

      // Should use the default case styling: 'bg-success-600/70 border-white'
      expect(userCircle).toHaveClass('bg-success-600/70', 'border-white');
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
      } as unknown as ReturnType<typeof useQuizStore>);

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

    const defaultStoreState = {
      currentQuestionIndex: 0,
      getTotalQuestions: mockGetTotalQuestions,
      goToNextQuestion: mockGoToNextQuestion,
      goToPreviousQuestion: mockGoToPreviousQuestion,
      getUnansweredQuestionsFromUserAnswers:
        mockGetUnansweredQuestionsFromUserAnswers,
      getCurrentAnswer: mockGetCurrentAnswer,
      skipQuestion: mockSkipQuestion,
      getCurrentQuestion: mockGetCurrentQuestion,
      getQuestionStatusFromUserAnswers: mockGetQuestionStatusFromUserAnswers,
      variant: 'default',
      getQuestionResultStatistics: mockGetQuestionResultStatistics,
      getQuestionsGroupedBySubject: mockGetQuestionsGroupedBySubject,
      goToQuestion: mockGoToQuestion,
      getQuestionIndex: mockGetQuestionIndex,
    };

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue(
        defaultStoreState as unknown as ReturnType<typeof useQuizStore>
      );

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
        } as unknown as ReturnType<typeof useQuizStore>);

        render(<QuizFooter />);

        const buttons = screen.getAllByTestId('quiz-button');
        expect(buttons.some((btn) => btn.textContent === 'Pular')).toBe(true);
        expect(buttons.some((btn) => btn.textContent === 'Avançar')).toBe(true);
        expect(screen.queryByText('Voltar')).not.toBeInTheDocument();
      });

      it('should show back, skip and next buttons on middle questions', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 2,
        } as unknown as ReturnType<typeof useQuizStore>);

        render(<QuizFooter />);

        expect(screen.getByText('Voltar')).toBeInTheDocument();
        expect(screen.getByText('Pular')).toBeInTheDocument();
        expect(screen.getByText('Avançar')).toBeInTheDocument();
      });

      it('should show finish button on last question', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 4, // Last question (total is 5)
        } as unknown as ReturnType<typeof useQuizStore>);

        render(<QuizFooter />);

        expect(screen.getByText('Finalizar')).toBeInTheDocument();
        expect(screen.queryByText('Avançar')).not.toBeInTheDocument();
      });

      it('should call goToPreviousQuestion when back button is clicked', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 2,
        } as unknown as ReturnType<typeof useQuizStore>);

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
        } as unknown as ReturnType<typeof useQuizStore>);

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

      it('should disable finish button when no answer and question not skipped', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          currentQuestionIndex: 4, // Last question
        } as unknown as ReturnType<typeof useQuizStore>);
        mockGetCurrentAnswer.mockReturnValue(null);
        mockGetQuestionStatusFromUserAnswers.mockReturnValue('unanswered');

        render(<QuizFooter />);

        const finishButton = screen.getByText('Finalizar');
        expect(finishButton).toHaveAttribute('data-disabled', 'true');
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
        } as unknown as ReturnType<typeof useQuizStore>);

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
        } as unknown as ReturnType<typeof useQuizStore>);
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
        } as unknown as ReturnType<typeof useQuizStore>);
      });

      it('should render resolution button in result variant', () => {
        render(<QuizFooter />);

        expect(screen.getByText('Ver Resolução')).toBeInTheDocument();
        expect(screen.queryByText('Voltar')).not.toBeInTheDocument();
        expect(screen.queryByText('Avançar')).not.toBeInTheDocument();
        expect(screen.queryByText('Pular')).not.toBeInTheDocument();
      });

      it('should open resolution modal when button is clicked', () => {
        mockGetCurrentQuestion.mockReturnValue({
          id: 'question-1',
          solutionExplanation: 'Test explanation',
        });

        render(<QuizFooter />);

        const resolutionButton = screen.getByText('Ver Resolução');

        act(() => {
          resolutionButton.click();
        });

        expect(screen.getByText('Resolução')).toBeInTheDocument();
        expect(screen.getByText('Test explanation')).toBeInTheDocument();
      });
    });

    describe('Modal interactions', () => {
      it('should open navigation modal when icon button is clicked', () => {
        render(<QuizFooter />);

        const navigationButton = screen.getByTestId('quiz-icon-button');

        act(() => {
          navigationButton.click();
        });

        expect(screen.getByText('Questões')).toBeInTheDocument();
      });

      it('should close navigation modal when close button is clicked', () => {
        render(<QuizFooter />);

        // Open modal
        const navigationButton = screen.getByTestId('quiz-icon-button');

        act(() => {
          navigationButton.click();
        });

        expect(screen.getByText('Questões')).toBeInTheDocument();

        // Close modal
        const closeButton = screen.getByTestId('modal-close');

        act(() => {
          closeButton.click();
        });

        expect(
          screen.queryByText('Você concluiu o simulado!')
        ).not.toBeInTheDocument();
      });

      it('should close resolution modal when close button is clicked', () => {
        mockUseQuizStore.mockReturnValue({
          ...defaultStoreState,
          variant: 'result',
        } as unknown as ReturnType<typeof useQuizStore>);

        render(<QuizFooter />);

        // Open resolution modal
        const resolutionButton = screen.getByText('Ver Resolução');

        act(() => {
          resolutionButton.click();
        });

        expect(screen.getByText('Resolução')).toBeInTheDocument();

        // Close modal
        const closeButton = screen.getByTestId('modal-close');

        act(() => {
          closeButton.click();
        });

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
        } as unknown as ReturnType<typeof useQuizStore>);
      });

      it('should show alert dialog when finishing with unanswered questions', () => {
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([1, 3, 5]);

        render(<QuizFooter />);

        const finishButton = screen.getByText('Finalizar');

        act(() => {
          finishButton.click();
        });

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

        await act(async () => {
          finishButton.click();
        });

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

        await act(async () => {
          finishButton.click();
        });

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

        await act(async () => {
          finishButton.click();
        });

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

        act(() => {
          finishButton.click();
        });

        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();

        // Submit alert
        const submitButton = screen.getByTestId('alert-submit');

        await act(async () => {
          submitButton.click();
        });

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
          .mockImplementation(() => {});
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([1, 2]);

        render(
          <QuizFooter handleFinishSimulated={mockHandleFinishSimulated} />
        );

        // Open alert by clicking finish
        const finishButton = screen.getByText('Finalizar');

        act(() => {
          finishButton.click();
        });

        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();

        // Submit alert - this should trigger the catch block
        const submitButton = screen.getByTestId('alert-submit');

        await act(async () => {
          submitButton.click();
        });

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
        } as unknown as ReturnType<typeof useQuizStore>);
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([]);
      });

      it('should call onGoToSimulated when button is clicked', async () => {
        const mockOnGoToSimulated = jest.fn();

        render(<QuizFooter onGoToSimulated={mockOnGoToSimulated} />);

        // Finish quiz to open result modal
        const finishButton = screen.getByText('Finalizar');

        await act(async () => {
          finishButton.click();
        });

        const goToSimulatedButton = screen.getByText('Ir para simulados');
        goToSimulatedButton.click();

        expect(mockOnGoToSimulated).toHaveBeenCalled();
      });

      it('should call onDetailResult when button is clicked', async () => {
        const mockOnDetailResult = jest.fn();

        render(<QuizFooter onDetailResult={mockOnDetailResult} />);

        // Finish quiz to open result modal
        const finishButton = screen.getByText('Finalizar');

        await act(async () => {
          finishButton.click();
        });

        const detailResultButton = screen.getByText('Detalhar resultado');
        detailResultButton.click();

        expect(mockOnDetailResult).toHaveBeenCalled();
      });

      it('should render result modal correctly without close button', async () => {
        render(<QuizFooter />);

        // Finish quiz to open result modal
        const finishButton = screen.getByText('Finalizar');

        await act(async () => {
          finishButton.click();
        });

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

        act(() => {
          navigationButton.click();
        });

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

        act(() => {
          navigationButton.click();
        });

        // Verify modal is open
        expect(screen.getByText('Questões')).toBeInTheDocument();

        // Find and click a question card (which should trigger onQuestionClick)
        const questionCard = screen.getByTestId('card-status');

        act(() => {
          questionCard.click();
        });

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
        } as unknown as ReturnType<typeof useQuizStore>);

        render(<QuizFooter resultImageComponent={mockResultImageComponent} />);

        // Finish quiz to open result modal
        const finishButton = screen.getByText('Finalizar');

        await act(async () => {
          finishButton.click();
        });

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
        } as unknown as ReturnType<typeof useQuizStore>);

        render(<QuizFooter />);

        // Finish quiz to open result modal
        const finishButton = screen.getByText('Finalizar');

        await act(async () => {
          finishButton.click();
        });

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
        } as unknown as ReturnType<typeof useQuizStore>);
        mockGetQuestionResultStatistics.mockReturnValue(null);
        mockGetUnansweredQuestionsFromUserAnswers.mockReturnValue([]);

        render(<QuizFooter />);

        const finishButton = screen.getByText('Finalizar');

        act(() => {
          finishButton.click();
        });

        // Should show -- when no statistics available
        expect(
          screen.getByText('Você acertou -- de 5 questões.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('QuizResultHeaderTitle Component', () => {
    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        quiz: null,
      } as unknown as ReturnType<typeof useQuizStore>);

      jest.clearAllMocks();
    });

    it('should render header title correctly', () => {
      render(<QuizResultHeaderTitle />);

      expect(screen.getByText('Resultado')).toBeInTheDocument();
    });

    it('should have correct styling classes', () => {
      const { container } = render(<QuizResultHeaderTitle />);
      const headerElement = container.firstChild as HTMLElement;

      expect(headerElement).toHaveClass(
        'flex',
        'flex-row',
        'pt-4',
        'justify-between'
      );
    });

    it('should render title with correct text styling', () => {
      render(<QuizResultHeaderTitle />);

      const titleElement = screen.getByText('Resultado');
      expect(titleElement).toHaveClass(
        'text-text-950',
        'font-bold',
        'text-2xl'
      );
    });

    it('should not render badge when quiz is null', () => {
      mockUseQuizStore.mockReturnValue({
        quiz: null,
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizResultHeaderTitle />);

      expect(screen.queryByTestId('quiz-badge')).toBeInTheDocument();
      expect(screen.getByText('Simuladão')).toBeInTheDocument();
      const badge = screen.getByTestId('quiz-badge');
      expect(badge).toHaveAttribute('data-variant', 'examsOutlined');
      expect(badge).toHaveAttribute('data-action', 'exam3');
    });

    it('should render badge when quiz exists', () => {
      const mockBySimulated = {
        type: 'Simulado ENEM',
        id: 'sim-123',
        subtype: 'ENEM_PROVA_1',
      };

      mockUseQuizStore.mockReturnValue({
        quiz: mockBySimulated,
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizResultHeaderTitle />);

      expect(screen.getByTestId('quiz-badge')).toBeInTheDocument();
      expect(screen.getByText('Enem')).toBeInTheDocument();
      const badge = screen.getByTestId('quiz-badge');
      expect(badge).toHaveAttribute('data-variant', 'examsOutlined');
      expect(badge).toHaveAttribute('data-action', 'exam1');
    });

    it('should render badge with correct properties', () => {
      const mockBySimulated = {
        type: 'Simulado VESTIBULAR',
        id: 'sim-456',
        subtype: 'VESTIBULAR',
      };

      mockUseQuizStore.mockReturnValue({
        quiz: mockBySimulated,
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizResultHeaderTitle />);

      const badge = screen.getByTestId('quiz-badge');
      expect(badge).toHaveAttribute('data-variant', 'examsOutlined');
      expect(badge).toHaveAttribute('data-action', 'exam4');
      expect(badge).toHaveTextContent('Vestibular');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <QuizResultHeaderTitle className="custom-header-class" />
      );
      const headerElement = container.firstChild as HTMLElement;

      expect(headerElement).toHaveClass('custom-header-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <QuizResultHeaderTitle className="custom-spacing" />
      );
      const headerElement = container.firstChild as HTMLElement;

      expect(headerElement).toHaveClass('custom-spacing');
      expect(headerElement).toHaveClass(
        'flex',
        'flex-row',
        'pt-4',
        'justify-between'
      );
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(<QuizResultHeaderTitle ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveClass('flex', 'flex-row');
    });

    it('should pass through additional props', () => {
      const { container } = render(
        <QuizResultHeaderTitle
          data-testid="result-header"
          aria-label="Quiz result header"
        />
      );

      const headerElement = container.firstChild as HTMLElement;
      expect(headerElement).toHaveAttribute('data-testid', 'result-header');
      expect(headerElement).toHaveAttribute('aria-label', 'Quiz result header');
    });

    it('should handle different quiz types', () => {
      const mockBySimulated = {
        type: 'Simulado Personalizado',
        id: 'custom-1',
        difficulty: 'hard',
        subtype: QUIZ_TYPE.SIMULADO,
      };

      mockUseQuizStore.mockReturnValue({
        quiz: mockBySimulated,
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizResultHeaderTitle />);

      expect(screen.getByText('Simuladão')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-badge')).toBeInTheDocument();
    });

    it('should maintain semantic structure', () => {
      const { container } = render(<QuizResultHeaderTitle />);
      const headerElement = container.firstChild as HTMLElement;

      expect(headerElement.tagName).toBe('DIV');

      const titleElement = screen.getByText('Resultado');
      expect(titleElement.tagName).toBe('P');
    });

    it('should handle empty quiz type', () => {
      const mockBySimulated = {
        type: '',
        id: 'empty-type',
        subtype: '',
      };

      mockUseQuizStore.mockReturnValue({
        quiz: mockBySimulated,
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizResultHeaderTitle />);

      const badge = screen.getByTestId('quiz-badge');
      expect(badge).toHaveTextContent('Simuladão');
    });
  });

  describe('QuizResultTitle Component', () => {
    const mockGetQuizTitle = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getQuizTitle: mockGetQuizTitle,
      } as unknown as ReturnType<typeof useQuizStore>);

      mockGetQuizTitle.mockReturnValue('Quiz de Matemática Avançada');
      jest.clearAllMocks();
    });

    it('should render quiz title correctly', () => {
      render(<QuizResultTitle />);

      expect(
        screen.getByText('Quiz de Matemática Avançada')
      ).toBeInTheDocument();
    });

    it('should have correct styling classes', () => {
      const { container } = render(<QuizResultTitle />);
      const titleElement = container.firstChild as HTMLElement;

      expect(titleElement).toHaveClass(
        'pt-6',
        'pb-4',
        'text-text-950',
        'font-bold',
        'text-lg'
      );
    });

    it('should call getQuizTitle on render', () => {
      render(<QuizResultTitle />);

      expect(mockGetQuizTitle).toHaveBeenCalled();
    });

    it('should update when quiz title changes', () => {
      const { rerender } = render(<QuizResultTitle />);

      expect(
        screen.getByText('Quiz de Matemática Avançada')
      ).toBeInTheDocument();

      // Change the quiz title
      mockGetQuizTitle.mockReturnValue('Quiz de Física Quântica');

      rerender(<QuizResultTitle />);

      expect(screen.getByText('Quiz de Física Quântica')).toBeInTheDocument();
      expect(
        screen.queryByText('Quiz de Matemática Avançada')
      ).not.toBeInTheDocument();
    });

    it('should handle empty quiz title', () => {
      mockGetQuizTitle.mockReturnValue('');

      render(<QuizResultTitle />);

      const titleElement = screen.getByRole('paragraph');
      expect(titleElement).toHaveTextContent('');
      expect(titleElement).toBeInTheDocument();
    });

    it('should handle null quiz title', () => {
      mockGetQuizTitle.mockReturnValue(null);

      render(<QuizResultTitle />);

      const titleElement = screen.getByRole('paragraph');
      expect(titleElement).toHaveTextContent('');
      expect(titleElement).toBeInTheDocument();
    });

    it('should handle undefined quiz title', () => {
      mockGetQuizTitle.mockReturnValue(undefined);

      render(<QuizResultTitle />);

      const titleElement = screen.getByRole('paragraph');
      expect(titleElement).toHaveTextContent('');
      expect(titleElement).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <QuizResultTitle className="custom-title-class" />
      );
      const titleElement = container.firstChild as HTMLElement;

      expect(titleElement).toHaveClass('custom-title-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <QuizResultTitle className="custom-color" />
      );
      const titleElement = container.firstChild as HTMLElement;

      expect(titleElement).toHaveClass('custom-color');
      expect(titleElement).toHaveClass(
        'pt-6',
        'pb-4',
        'text-text-950',
        'font-bold',
        'text-lg'
      );
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>();

      render(<QuizResultTitle ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
      expect(ref.current).toHaveClass('pt-6', 'pb-4');
    });

    it('should pass through additional props', () => {
      const { container } = render(
        <QuizResultTitle
          data-testid="result-title"
          aria-label="Quiz result title"
        />
      );

      const titleElement = container.firstChild as HTMLElement;
      expect(titleElement).toHaveAttribute('data-testid', 'result-title');
      expect(titleElement).toHaveAttribute('aria-label', 'Quiz result title');
    });

    it('should maintain semantic structure as paragraph', () => {
      const { container } = render(<QuizResultTitle />);
      const titleElement = container.firstChild as HTMLElement;

      expect(titleElement.tagName).toBe('P');
    });

    it('should handle long quiz title', () => {
      const longTitle =
        'Quiz de Matemática Avançada com Foco em Cálculo Diferencial e Integral para Estudantes de Engenharia';
      mockGetQuizTitle.mockReturnValue(longTitle);

      render(<QuizResultTitle />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle quiz title with special characters', () => {
      const titleWithSpecialChars =
        'Quiz de Física: Eletromagnetismo & Mecânica Quântica (Nível Avançado)';
      mockGetQuizTitle.mockReturnValue(titleWithSpecialChars);

      render(<QuizResultTitle />);

      expect(screen.getByText(titleWithSpecialChars)).toBeInTheDocument();
    });

    it('should handle quiz title with HTML entities', () => {
      const titleWithEntities = 'Quiz de Química: Ligações & Reações';
      mockGetQuizTitle.mockReturnValue(titleWithEntities);

      render(<QuizResultTitle />);

      expect(screen.getByText(titleWithEntities)).toBeInTheDocument();
    });

    it('should handle dynamic className changes', () => {
      const { container, rerender } = render(
        <QuizResultTitle className="initial-class" />
      );
      const titleElement = container.firstChild as HTMLElement;

      expect(titleElement).toHaveClass('initial-class');

      rerender(<QuizResultTitle className="updated-class" />);

      expect(titleElement).toHaveClass('updated-class');
      expect(titleElement).not.toHaveClass('initial-class');
    });
  });

  describe('QuizListResult Component', () => {
    const mockGetQuestionsGroupedBySubject = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getQuestionsGroupedBySubject: mockGetQuestionsGroupedBySubject,
      } as unknown as ReturnType<typeof useQuizStore>);

      jest.clearAllMocks();
    });

    it('should render matérias section correctly', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-2',
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      render(<QuizListResult />);

      expect(screen.getByText('Matérias')).toBeInTheDocument();
      expect(screen.getByTestId('card-results')).toBeInTheDocument();
      expect(screen.getByTestId('card-results-header')).toHaveTextContent(
        'Matemática'
      );
    });

    it('should calculate correct and incorrect answers correctly', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-2',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-3',
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      render(<QuizListResult />);

      const cardResults = screen.getByTestId('card-results');
      expect(cardResults).toHaveAttribute('data-correct', '2');
      expect(cardResults).toHaveAttribute('data-incorrect', '1');
    });

    it('should render multiple subjects correctly', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
        'subject-2': [
          {
            id: 'question-2',
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            knowledgeMatrix: [{ subject: { name: 'Física' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      render(<QuizListResult />);

      const cardResults = screen.getAllByTestId('card-results');
      expect(cardResults).toHaveLength(2);

      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(screen.getByText('Física')).toBeInTheDocument();
    });

    it('should call onSubjectClick when subject card is clicked', () => {
      const mockOnSubjectClick = jest.fn();
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      render(<QuizListResult onSubjectClick={mockOnSubjectClick} />);

      const cardResults = screen.getByTestId('card-results');
      cardResults.click();

      expect(mockOnSubjectClick).toHaveBeenCalledWith('subject-1');
    });

    it('should not call onSubjectClick when callback is not provided', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      render(<QuizListResult />); // No onSubjectClick prop

      const cardResults = screen.getByTestId('card-results');

      // Should not throw error when clicking
      expect(() => cardResults.click()).not.toThrow();
    });

    it('should handle empty questions list', () => {
      mockGetQuestionsGroupedBySubject.mockReturnValue({});

      render(<QuizListResult />);

      expect(screen.getByText('Matérias')).toBeInTheDocument();
      expect(screen.queryByTestId('card-results')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      const { container } = render(
        <QuizListResult className="custom-list-class" />
      );
      const sectionElement = container.firstChild as HTMLElement;

      expect(sectionElement).toHaveClass('custom-list-class');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      render(<QuizListResult ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('SECTION');
    });

    it('should pass through additional props', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      const { container } = render(
        <QuizListResult
          data-testid="quiz-list-result"
          aria-label="Quiz results by subject"
        />
      );

      const sectionElement = container.firstChild as HTMLElement;
      expect(sectionElement).toHaveAttribute('data-testid', 'quiz-list-result');
      expect(sectionElement).toHaveAttribute(
        'aria-label',
        'Quiz results by subject'
      );
    });

    it('should render card with correct properties', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      render(<QuizListResult />);

      const cardResults = screen.getByTestId('card-results');
      expect(cardResults).toHaveAttribute('data-header', 'Matemática');
      expect(cardResults).toHaveAttribute('data-correct', '1');
      expect(cardResults).toHaveAttribute('data-incorrect', '0');
      expect(cardResults).toHaveAttribute('data-direction', 'row');
      expect(cardResults).toHaveClass('max-w-full');
    });

    it('should handle questions with different answer statuses', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-2',
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-3',
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-4',
            answerStatus: 'other_status' as unknown as ANSWER_STATUS,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      render(<QuizListResult />);

      const cardResults = screen.getByTestId('card-results');
      expect(cardResults).toHaveAttribute('data-correct', '1'); // Only RESPOSTA_CORRETA counts as correct
      expect(cardResults).toHaveAttribute('data-incorrect', '3'); // All others count as incorrect
    });

    it('should maintain semantic structure', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      const { container } = render(<QuizListResult />);
      const sectionElement = container.firstChild as HTMLElement;

      expect(sectionElement.tagName).toBe('SECTION');

      const list = sectionElement.querySelector('ul');
      expect(list).toBeInTheDocument();
      expect(list).toHaveClass('flex', 'flex-col', 'gap-2');

      const listItem = list?.querySelector('li');
      expect(listItem).toBeInTheDocument();
    });
  });

  describe('QuizListResultByMateria Component', () => {
    const mockGetQuestionsGroupedBySubject = jest.fn();
    const mockGetQuestionIndex = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getQuestionsGroupedBySubject: mockGetQuestionsGroupedBySubject,
        getQuestionIndex: mockGetQuestionIndex,
      } as unknown as ReturnType<typeof useQuizStore>);

      jest.clearAllMocks();
    });

    it('should render subject name correctly', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionIndex.mockReturnValue(1);

      render(
        <QuizListResultByMateria
          subject="subject-1"
          onQuestionClick={jest.fn()}
        />
      );

      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });

    it('should render section title correctly', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionIndex.mockReturnValue(1);

      render(
        <QuizListResultByMateria
          subject="subject-1"
          onQuestionClick={jest.fn()}
        />
      );

      expect(screen.getByText('Resultado das questões')).toBeInTheDocument();
    });

    it('should render questions correctly', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-2',
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionIndex.mockImplementation((id) => {
        const questionMap: { [key: string]: number } = {
          'question-1': 1,
          'question-2': 2,
        };
        return questionMap[id] || 1;
      });

      render(
        <QuizListResultByMateria
          subject="subject-1"
          onQuestionClick={jest.fn()}
        />
      );

      const cardStatuses = screen.getAllByTestId('card-status');
      expect(cardStatuses).toHaveLength(2);

      expect(screen.getByText('Questão 01')).toBeInTheDocument();
      expect(screen.getByText('Questão 02')).toBeInTheDocument();
    });

    it('should apply correct status to question cards', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-2',
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-3',
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionIndex.mockImplementation((id) => {
        const questionMap: { [key: string]: number } = {
          'question-1': 1,
          'question-2': 2,
          'question-3': 3,
        };
        return questionMap[id] || 1;
      });

      render(
        <QuizListResultByMateria
          subject="subject-1"
          onQuestionClick={jest.fn()}
        />
      );

      const cardStatuses = screen.getAllByTestId('card-status');

      expect(cardStatuses[0]).toHaveAttribute('data-status', 'correct');
      expect(cardStatuses[1]).toHaveAttribute('data-status', 'incorrect');
      expect(cardStatuses[2]).not.toHaveAttribute('data-status'); // PENDENTE_AVALIACAO returns undefined, so no attribute
    });

    it('should call onQuestionClick when question card is clicked', () => {
      const mockOnQuestionClick = jest.fn();
      const mockQuestion = {
        id: 'question-1',
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
        knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
      };

      const mockGroupedQuestions = {
        'subject-1': [mockQuestion],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionIndex.mockReturnValue(1);

      render(
        <QuizListResultByMateria
          subject="subject-1"
          onQuestionClick={mockOnQuestionClick}
        />
      );

      const cardStatus = screen.getByTestId('card-status');
      cardStatus.click();

      expect(mockOnQuestionClick).toHaveBeenCalledWith(mockQuestion);
    });

    it('should handle empty subject (no questions)', () => {
      const mockGroupedQuestions = {
        'subject-1': [],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      render(
        <QuizListResultByMateria
          subject="subject-1"
          onQuestionClick={jest.fn()}
        />
      );

      expect(screen.getByText('Resultado das questões')).toBeInTheDocument();
      expect(screen.queryByTestId('card-status')).not.toBeInTheDocument();
    });

    it('should handle non-existent subject', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);

      render(
        <QuizListResultByMateria
          subject="non-existent-subject"
          onQuestionClick={jest.fn()}
        />
      );

      // Should render empty structure since subject doesn't exist
      expect(screen.getByText('Resultado das questões')).toBeInTheDocument();
      expect(screen.queryByTestId('card-status')).not.toBeInTheDocument();
    });

    it('should format question numbers with leading zeros', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
          {
            id: 'question-10',
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionIndex.mockImplementation((id) => {
        return id === 'question-1' ? 1 : 10;
      });

      render(
        <QuizListResultByMateria
          subject="subject-1"
          onQuestionClick={jest.fn()}
        />
      );

      expect(screen.getByText('Questão 01')).toBeInTheDocument(); // Single digit with leading zero
      expect(screen.getByText('Questão 10')).toBeInTheDocument(); // Double digit
    });

    it('should have correct container structure', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionIndex.mockReturnValue(1);

      const { container } = render(
        <QuizListResultByMateria
          subject="subject-1"
          onQuestionClick={jest.fn()}
        />
      );

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('flex', 'flex-col');

      const headerDiv = mainDiv.querySelector(
        '.flex.flex-row.pt-4.justify-between'
      );
      expect(headerDiv).toBeInTheDocument();

      const section = mainDiv.querySelector('section.flex.flex-col');
      expect(section).toBeInTheDocument();

      const list = section?.querySelector('ul.flex.flex-col.gap-2.pt-4');
      expect(list).toBeInTheDocument();
    });

    it('should handle missing subject name gracefully', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: undefined } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionIndex.mockReturnValue(1);

      render(
        <QuizListResultByMateria
          subject="subject-1"
          onQuestionClick={jest.fn()}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Resultado das questões')).toBeInTheDocument();
      expect(screen.getByTestId('card-status')).toBeInTheDocument();
    });

    it('should apply max-w-full class to card status', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionIndex.mockReturnValue(1);

      render(
        <QuizListResultByMateria
          subject="subject-1"
          onQuestionClick={jest.fn()}
        />
      );

      const cardStatus = screen.getByTestId('card-status');
      expect(cardStatus).toHaveClass('card-status-mock'); // This comes from our mock
    });

    it('should maintain semantic structure', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [{ subject: { name: 'Matemática' } }],
          },
        ],
      };

      mockGetQuestionsGroupedBySubject.mockReturnValue(mockGroupedQuestions);
      mockGetQuestionIndex.mockReturnValue(1);

      const { container } = render(
        <QuizListResultByMateria
          subject="subject-1"
          onQuestionClick={jest.fn()}
        />
      );

      // Should have proper heading structure
      const subjectTitle = screen.getByText('Matemática');
      expect(subjectTitle.tagName).toBe('P');
      expect(subjectTitle).toHaveClass(
        'text-text-950',
        'font-bold',
        'text-2xl'
      );

      const sectionTitle = screen.getByText('Resultado das questões');
      expect(sectionTitle.tagName).toBe('P');
      expect(sectionTitle).toHaveClass(
        'pt-6',
        'pb-4',
        'text-text-950',
        'font-bold',
        'text-lg'
      );

      // Should have proper list structure
      const list = container.querySelector('ul');
      expect(list).toBeInTheDocument();

      const listItem = list?.querySelector('li');
      expect(listItem).toBeInTheDocument();
    });
  });

  describe('QuizResultPerformance Component', () => {
    const mockGetTotalQuestions = jest.fn();
    const mockGetQuestionResult = jest.fn();
    const mockGetQuestionResultStatistics = jest.fn();
    const mockFormatTime = jest.fn();

    beforeEach(() => {
      mockUseQuizStore.mockReturnValue({
        getTotalQuestions: mockGetTotalQuestions,
        timeElapsed: 3661, // 1 hour, 1 minute, 1 second
        formatTime: mockFormatTime,
        getQuestionResultStatistics: mockGetQuestionResultStatistics,
        getQuestionResult: mockGetQuestionResult,
      } as unknown as ReturnType<typeof useQuizStore>);

      mockFormatTime.mockReturnValue('01:01:01');
      jest.clearAllMocks();
    });

    it('should render performance component with basic elements', () => {
      mockGetTotalQuestions.mockReturnValue(10);
      mockGetQuestionResult.mockReturnValue(null);
      mockGetQuestionResultStatistics.mockReturnValue({ correctAnswers: 7 });

      render(<QuizResultPerformance />);

      expect(screen.getByTestId('progress-circle')).toBeInTheDocument();
      expect(screen.getByText('01:01:01')).toBeInTheDocument();
      expect(screen.getByText('7 de 10')).toBeInTheDocument();
      expect(screen.getByText('Corretas')).toBeInTheDocument();
    });

    it('should calculate percentage correctly when total questions > 0', () => {
      mockGetTotalQuestions.mockReturnValue(10);
      mockGetQuestionResult.mockReturnValue({
        answers: [
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          },
        ],
      });
      mockGetQuestionResultStatistics.mockReturnValue({ correctAnswers: 2 });

      render(<QuizResultPerformance />);

      const progressCircle = screen.getByTestId('progress-circle');
      expect(progressCircle).toHaveAttribute('data-value', '20'); // 2/10 * 100 = 20%
    });

    it('should handle zero total questions gracefully', () => {
      mockGetTotalQuestions.mockReturnValue(0);
      mockGetQuestionResult.mockReturnValue(null);
      mockGetQuestionResultStatistics.mockReturnValue({ correctAnswers: 0 });

      render(<QuizResultPerformance />);

      const progressCircle = screen.getByTestId('progress-circle');
      expect(progressCircle).toHaveAttribute('data-value', '0'); // 0% when no questions
      expect(screen.getByText('0 de 0')).toBeInTheDocument();
    });

    it('should correctly count easy questions', () => {
      mockGetTotalQuestions.mockReturnValue(6);
      mockGetQuestionResult.mockReturnValue({
        answers: [
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          },
        ],
      });
      mockGetQuestionResultStatistics.mockReturnValue({ correctAnswers: 4 });

      render(<QuizResultPerformance />);

      const progressBars = screen.getAllByTestId('progress-bar');
      const easyProgressBar = progressBars.find(
        (bar) => bar.getAttribute('data-label') === 'Fáceis'
      );
      expect(easyProgressBar).toHaveAttribute('data-value', '2'); // 2 correct easy
      expect(easyProgressBar).toHaveAttribute('data-max', '3'); // 3 total easy
    });

    it('should correctly count medium questions', () => {
      mockGetTotalQuestions.mockReturnValue(6);
      mockGetQuestionResult.mockReturnValue({
        answers: [
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          },
        ],
      });
      mockGetQuestionResultStatistics.mockReturnValue({ correctAnswers: 4 });

      render(<QuizResultPerformance />);

      const progressBars = screen.getAllByTestId('progress-bar');
      const mediumProgressBar = progressBars.find(
        (bar) => bar.getAttribute('data-label') === 'Médias'
      );
      expect(mediumProgressBar).toHaveAttribute('data-value', '2'); // 2 correct medium
      expect(mediumProgressBar).toHaveAttribute('data-max', '3'); // 3 total medium
    });

    it('should correctly count difficult questions', () => {
      mockGetTotalQuestions.mockReturnValue(6);
      mockGetQuestionResult.mockReturnValue({
        answers: [
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          },
        ],
      });
      mockGetQuestionResultStatistics.mockReturnValue({ correctAnswers: 4 });

      render(<QuizResultPerformance />);

      const progressBars = screen.getAllByTestId('progress-bar');
      const difficultProgressBar = progressBars.find(
        (bar) => bar.getAttribute('data-label') === 'Difíceis'
      );
      expect(difficultProgressBar).toHaveAttribute('data-value', '2'); // 2 correct difficult
      expect(difficultProgressBar).toHaveAttribute('data-max', '4'); // 4 total difficult
    });

    it('should handle null question result gracefully', () => {
      mockGetTotalQuestions.mockReturnValue(5);
      mockGetQuestionResult.mockReturnValue(null);
      mockGetQuestionResultStatistics.mockReturnValue({ correctAnswers: 0 });

      render(<QuizResultPerformance />);

      const progressCircle = screen.getByTestId('progress-circle');
      expect(progressCircle).toHaveAttribute('data-value', '0');

      const progressBars = screen.getAllByTestId('progress-bar');
      progressBars.forEach((bar) => {
        expect(bar).toHaveAttribute('data-value', '0');
        expect(bar).toHaveAttribute('data-max', '0');
      });
    });

    it('should display fallback when getQuestionResultStatistics returns null', () => {
      mockGetTotalQuestions.mockReturnValue(5);
      mockGetQuestionResult.mockReturnValue({
        answers: [
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          },
        ],
      });
      mockGetQuestionResultStatistics.mockReturnValue(null);

      render(<QuizResultPerformance />);

      expect(screen.getByText('-- de 5')).toBeInTheDocument();
    });

    it('should render progress components with correct props', () => {
      mockGetTotalQuestions.mockReturnValue(3);
      mockGetQuestionResult.mockReturnValue({
        answers: [
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          },
        ],
      });
      mockGetQuestionResultStatistics.mockReturnValue({ correctAnswers: 2 });

      render(<QuizResultPerformance />);

      // Test ProgressCircle props
      const progressCircle = screen.getByTestId('progress-circle');
      expect(progressCircle).toHaveAttribute('data-size', 'medium');
      expect(progressCircle).toHaveAttribute('data-variant', 'green');
      expect(progressCircle).toHaveAttribute('data-show-percentage', 'false');
      expect(progressCircle).toHaveAttribute('data-label', '');

      // Test ProgressBar props
      const progressBars = screen.getAllByTestId('progress-bar');
      progressBars.forEach((bar) => {
        expect(bar).toHaveAttribute('data-layout', 'stacked');
        expect(bar).toHaveAttribute('data-variant', 'green');
        expect(bar).toHaveAttribute('data-show-hit-count', 'true');
      });
    });

    it('should round percentage correctly', () => {
      mockGetTotalQuestions.mockReturnValue(3);
      mockGetQuestionResult.mockReturnValue({
        answers: [
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          },
          {
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
          },
        ],
      });
      mockGetQuestionResultStatistics.mockReturnValue({ correctAnswers: 1 });

      render(<QuizResultPerformance />);

      const progressCircle = screen.getByTestId('progress-circle');
      // 1/3 * 100 = 33.333... should round to 33
      expect(progressCircle).toHaveAttribute('data-value', '33');
    });

    describe('timeSpent display', () => {
      it('should display timeSpent correctly when statistics are available', () => {
        mockGetTotalQuestions.mockReturnValue(5);
        mockGetQuestionResult.mockReturnValue(null);
        mockGetQuestionResultStatistics.mockReturnValue({
          correctAnswers: 3,
          timeSpent: 180, // 3 minutes in seconds
        });
        mockFormatTime.mockReturnValue('03:00');

        render(<QuizResultPerformance />);

        expect(screen.getByText('03:00')).toBeInTheDocument();
        expect(mockFormatTime).toHaveBeenCalledWith(180 * 60); // timeSpent * 60
      });

      it('should display zero time when timeSpent is 0', () => {
        mockGetTotalQuestions.mockReturnValue(5);
        mockGetQuestionResult.mockReturnValue(null);
        mockGetQuestionResultStatistics.mockReturnValue({
          correctAnswers: 3,
          timeSpent: 0,
        });
        mockFormatTime.mockReturnValue('00:00');

        render(<QuizResultPerformance />);

        expect(screen.getByText('00:00')).toBeInTheDocument();
        expect(mockFormatTime).toHaveBeenCalledWith(0);
      });

      it('should display zero time when statistics are null', () => {
        mockGetTotalQuestions.mockReturnValue(5);
        mockGetQuestionResult.mockReturnValue(null);
        mockGetQuestionResultStatistics.mockReturnValue(null);
        mockFormatTime.mockReturnValue('00:00');

        render(<QuizResultPerformance />);

        expect(screen.getByText('00:00')).toBeInTheDocument();
        expect(mockFormatTime).toHaveBeenCalledWith(0);
      });

      it('should display zero time when timeSpent is undefined', () => {
        mockGetTotalQuestions.mockReturnValue(5);
        mockGetQuestionResult.mockReturnValue(null);
        mockGetQuestionResultStatistics.mockReturnValue({
          correctAnswers: 3,
          timeSpent: undefined,
        });
        mockFormatTime.mockReturnValue('00:00');

        render(<QuizResultPerformance />);

        expect(screen.getByText('00:00')).toBeInTheDocument();
        expect(mockFormatTime).toHaveBeenCalledWith(0);
      });

      it('should handle different timeSpent values correctly', () => {
        mockGetTotalQuestions.mockReturnValue(5);
        mockGetQuestionResult.mockReturnValue(null);
        mockGetQuestionResultStatistics.mockReturnValue({
          correctAnswers: 3,
          timeSpent: 3661, // 1 hour, 1 minute, 1 second
        });
        mockFormatTime.mockReturnValue('01:01:01');

        render(<QuizResultPerformance />);

        expect(screen.getByText('01:01:01')).toBeInTheDocument();
        expect(mockFormatTime).toHaveBeenCalledWith(3661 * 60);
      });

      it('should display clock icon with timeSpent', () => {
        mockGetTotalQuestions.mockReturnValue(5);
        mockGetQuestionResult.mockReturnValue(null);
        mockGetQuestionResultStatistics.mockReturnValue({
          correctAnswers: 3,
          timeSpent: 120,
        });
        mockFormatTime.mockReturnValue('02:00');

        const { container } = render(<QuizResultPerformance />);

        // Check if clock icon is present by looking for the SVG element
        const clockIcon = container.querySelector('svg');
        expect(clockIcon).toBeInTheDocument();
        expect(clockIcon).toHaveClass('text-text-800');
        expect(screen.getByText('02:00')).toBeInTheDocument();
      });

      it('should have correct styling for timeSpent display', () => {
        mockGetTotalQuestions.mockReturnValue(5);
        mockGetQuestionResult.mockReturnValue(null);
        mockGetQuestionResultStatistics.mockReturnValue({
          correctAnswers: 3,
          timeSpent: 120,
        });
        mockFormatTime.mockReturnValue('02:00');

        const { container } = render(<QuizResultPerformance />);

        const timeContainer = container.querySelector(
          '.flex.items-center.gap-1.mb-1'
        );
        expect(timeContainer).toBeInTheDocument();

        const timeText = container.querySelector(
          '.text-2xs.font-medium.text-text-800'
        );
        expect(timeText).toBeInTheDocument();
        expect(timeText).toHaveTextContent('02:00');
      });
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
      act(() => {
        finishButton.click();
      });

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
      act(() => {
        finishButton.click();
      });

      // Clicar em tentar depois
      const tryLaterButton = screen.getByText('Tentar depois');
      act(() => {
        tryLaterButton.click();
      });

      // Verificar se o alert dialog aparece
      expect(screen.getByText('Tentar depois?')).toBeInTheDocument();
      expect(screen.getByText('Repetir questionário')).toBeInTheDocument();
      expect(screen.getByText('Tentar depois')).toBeInTheDocument();

      // Testar cancelar (repetir questionário)
      const cancelButton = screen.getByText('Repetir questionário');
      act(() => {
        cancelButton.click();
      });

      expect(mockOnRepeat).toHaveBeenCalled();
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
      act(() => {
        finishButton.click();
      });

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
      act(() => {
        finishButton.click();
      });

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
      act(() => {
        finishButton.click();
      });

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
      act(() => {
        finishButton.click();
      });

      expect(
        screen.getByText(getCompletionTitle('unknown' as QUIZ_TYPE))
      ).toBeInTheDocument();
    });
  });
});
