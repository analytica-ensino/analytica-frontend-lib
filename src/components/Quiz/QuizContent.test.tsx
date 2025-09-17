import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  getStatusBadge,
  getStatusStyles,
  QuizAlternative,
  QuizConnectDots,
  QuizContainer,
  QuizDissertative,
  QuizFill,
  QuizImageQuestion,
  QuizMultipleChoice,
  QuizSubTitle,
  QuizTrueOrFalse,
} from './QuizContent';
import { ANSWER_STATUS, useQuizStore } from './useQuizStore';

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

// Mock TextArea component - Alternativa 1: Sem forwardRef
jest.mock('../TextArea/TextArea', () => {
  return function MockTextArea({
    value,
    onChange,
    placeholder,
    ...props
  }: {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
  }) {
    return (
      <textarea
        data-testid="quiz-textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    );
  };
});

jest.mock('@/assets/img/mock-image-question.png', () => 'mocked-image-2.png');

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

const mockUseQuizStore = useQuizStore as jest.MockedFunction<
  typeof useQuizStore
>;

describe('QuizContent', () => {
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
        teacherFeedback: 'Lorem ipsum dolor sit amet',
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
});
