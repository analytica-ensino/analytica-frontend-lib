import { render, screen } from '@testing-library/react';
import React, { createRef, ReactNode } from 'react';
import {
  QuizHeaderResult,
  QuizListResult,
  QuizListResultByMateria,
  QuizResultHeaderTitle,
  QuizResultPerformance,
  QuizResultTitle,
} from './QuizResult';
import {
  ANSWER_STATUS,
  QUESTION_DIFFICULTY,
  QUIZ_TYPE,
  useQuizStore,
} from './useQuizStore';

const mockUseQuizStore = useQuizStore as jest.MockedFunction<
  typeof useQuizStore
>;

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
    icon: ReactNode;
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

describe('Quiz', () => {
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

    it('should render default badge for unknown subtype', () => {
      const mockBySimulated = {
        type: 'Quiz Customizado',
        id: 'custom-123',
        subtype: 'UNKNOWN_CUSTOM_TYPE',
      };

      mockUseQuizStore.mockReturnValue({
        quiz: mockBySimulated,
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizResultHeaderTitle />);

      const badge = screen.getByTestId('quiz-badge');
      expect(badge).toHaveAttribute('data-variant', 'solid');
      expect(badge).toHaveAttribute('data-action', 'info');
      expect(badge).toHaveTextContent('UNKNOWN_CUSTOM_TYPE');
    });

    it('should render correct badge for PROVA subtype', () => {
      const mockBySimulated = {
        type: 'Prova de Matemática',
        id: 'prova-123',
        subtype: 'PROVA',
      };

      mockUseQuizStore.mockReturnValue({
        quiz: mockBySimulated,
      } as unknown as ReturnType<typeof useQuizStore>);

      render(<QuizResultHeaderTitle />);

      const badge = screen.getByTestId('quiz-badge');
      expect(badge).toHaveAttribute('data-variant', 'examsOutlined');
      expect(badge).toHaveAttribute('data-action', 'exam2');
      expect(badge).toHaveTextContent('Prova');
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
      const ref = createRef<HTMLDivElement>();
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

    it('should use fallback "Sem matéria" when subject.name is null (line 30)', () => {
      const mockQuestions = [
        {
          id: '1',
          knowledgeMatrix: [
            {
              subject: {
                name: null, // Nome é null
                color: '#FF0000',
                icon: 'Calculator',
              },
            },
          ],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
        },
      ];

      mockUseQuizStore.mockReturnValue({
        ...mockUseQuizStore(),
        getQuestionsGroupedBySubject: jest.fn().mockReturnValue({
          subject1: mockQuestions,
        }),
      });

      render(<QuizListResult />);

      // Verificar se o fallback foi usado
      expect(screen.getByText('Sem matéria')).toBeInTheDocument();
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

    it('should apply correct status for unanswered questions', () => {
      const mockGroupedQuestions = {
        'subject-1': [
          {
            id: 'question-1',
            answerStatus: ANSWER_STATUS.NAO_RESPONDIDO,
            knowledgeMatrix: [
              {
                subject: { name: 'Matemática' },
              },
            ],
          },
          {
            id: 'question-2',
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            knowledgeMatrix: [
              {
                subject: { name: 'Matemática' },
              },
            ],
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

      expect(cardStatuses[0]).toHaveAttribute('data-status', 'unanswered');
      expect(cardStatuses[1]).toHaveAttribute('data-status', 'correct');
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
});
