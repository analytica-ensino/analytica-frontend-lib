// Mocks need to be defined before importing the component (barrel imports).
jest.mock('../../hooks/useActivityFiltersData', () => ({
  createUseActivityFiltersData: () => () => ({}),
}));
jest.mock('../../components/ActivityFilters/ActivityFilters', () => ({
  ActivityFilters: () => null,
}));
jest.mock(
  '../../components/NotificationCard/NotificationCard',
  () => () => null
);
jest.mock('../../assets/img/mock-content.png', () => 'mock-content.png');
jest.mock('../../components/Quiz/Quiz', () => () => null);
jest.mock('../../components/Quiz/QuizContent', () => ({}));
jest.mock(
  '../../assets/img/mock-image-question.png',
  () => 'mock-image-question.png'
);
jest.mock('../../components/Support/Support', () => () => null);
jest.mock('../../components/Support', () => ({}));
jest.mock('../../assets/img/suporthistory.png', () => 'supporthistory.png');

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActivityListQuestions } from './ActivityListQuestions';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type { BaseApiClient } from '../../types/api';
import type { Question } from '../../types/questions';

// Mock useTheme
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

// Mock useQuestionFiltersStore
const mockAppliedFilters = jest.fn<unknown, []>(() => null);
const mockSetAppliedFilters = jest.fn();
const mockSetCachedQuestions = jest.fn();
const mockClearCachedQuestions = jest.fn();

jest.mock('../../store/questionFiltersStore', () => ({
  useQuestionFiltersStore: (selector: (state: unknown) => unknown) => {
    const mockState = {
      appliedFilters: mockAppliedFilters(),
      draftFilters: null,
      applyFilters: mockSetAppliedFilters,
      clearFilters: jest.fn(),
      cachedQuestions: [],
      cachedPagination: null,
      cachedFilters: null,
      setCachedQuestions: mockSetCachedQuestions,
      clearCachedQuestions: mockClearCachedQuestions,
    };
    return selector(mockState);
  },
}));

// Mock createUseQuestionsList
const mockFetchQuestions = jest.fn();
const mockFetchRandomQuestions = jest.fn();
const mockLoadMore = jest.fn();
const mockReset = jest.fn();

const mockUseQuestionsListReturn = {
  questions: [],
  pagination: null,
  loading: false,
  loadingMore: false,
  error: null,
  fetchQuestions: mockFetchQuestions,
  fetchRandomQuestions: mockFetchRandomQuestions,
  loadMore: mockLoadMore,
  reset: mockReset,
};

jest.mock('../../hooks/useQuestionsList', () => ({
  createUseQuestionsList: () => () => mockUseQuestionsListReturn,
}));

// Mock convertActivityFiltersToQuestionsFilter
jest.mock('../../utils/questionFiltersConverter', () => ({
  convertActivityFiltersToQuestionsFilter: (filters: unknown) => filters,
}));

// Mock areFiltersEqual
jest.mock('../../utils/activityFilters', () => ({
  areFiltersEqual: jest.fn((a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return JSON.stringify(a) === JSON.stringify(b);
  }),
}));

// Mock ActivityCardQuestionBanks
jest.mock('../ActivityCardQuestionBanks/ActivityCardQuestionBanks', () => ({
  __esModule: true,
  ActivityCardQuestionBanks: ({
    question,
    questionType,
    assunto,
    enunciado,
    onAddToActivity,
    subjectColor,
    isDark,
    iconName,
  }: {
    question?: unknown;
    questionType: QUESTION_TYPE;
    assunto: string;
    enunciado: string;
    onAddToActivity?: () => void;
    subjectColor: string;
    isDark: boolean;
    iconName: string;
  }) => (
    <div
      data-testid="activity-card-question-banks"
      data-question-type={questionType}
      data-assunto={assunto}
      data-enunciado={enunciado}
      data-subject-color={subjectColor}
      data-is-dark={isDark}
      data-icon-name={iconName}
    >
      <button data-testid="add-to-activity-button" onClick={onAddToActivity}>
        Adicionar à atividade
      </button>
      {question ? (
        <div data-testid="question-options">
          {String(JSON.stringify(question))}
        </div>
      ) : null}
    </div>
  ),
}));

// Mock components
jest.mock('../../components/Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    size,
    variant,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    size?: string;
    variant?: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      data-testid="button"
      data-size={size}
      data-variant={variant}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../components/Input/Input', () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    placeholder,
    type,
    min,
    variant,
    ...props
  }: {
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    min?: number;
    variant?: string;
  }) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      min={min}
      data-variant={variant}
      {...props}
    />
  ),
}));

jest.mock('../../components/Modal/Modal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size,
    contentClassName,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: string;
    hideCloseButton?: boolean;
    contentClassName?: string;
  }) =>
    isOpen ? (
      <div data-testid="modal" data-size={size} className={contentClassName}>
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        {footer && <div data-testid="modal-footer">{footer}</div>}
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

jest.mock('../../components/Text/Text', () => ({
  __esModule: true,
  default: ({
    children,
    size,
    weight,
    className,
    ...props
  }: {
    children: React.ReactNode;
    size?: string;
    weight?: string;
    className?: string;
  }) => (
    <span
      data-testid="text"
      data-size={size}
      data-weight={weight}
      className={className}
      {...props}
    >
      {children}
    </span>
  ),
}));

jest.mock('../../components/Skeleton/Skeleton', () => ({
  __esModule: true,
  SkeletonText: ({ lines, ...props }: { lines: number }) => (
    <div data-testid="skeleton-text" data-lines={lines} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} data-testid={`skeleton-line-${i}`} />
      ))}
    </div>
  ),
}));

jest.mock('phosphor-react', () => ({
  Notebook: ({ size }: { size?: number }) => (
    <span data-testid="notebook-icon" data-size={size}>
      Notebook
    </span>
  ),
}));

// Mock IntersectionObserver
(globalThis as { IntersectionObserver: unknown }).IntersectionObserver = jest
  .fn()
  .mockImplementation((callback) => {
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      trigger: (entries: IntersectionObserverEntry[]) => {
        callback(entries, {} as IntersectionObserver);
      },
    };
  }) as unknown as typeof IntersectionObserver;

describe('ActivityListQuestions', () => {
  const mockApiClient = {
    post: jest.fn(),
  } as unknown as BaseApiClient;

  const mockOnAddQuestion = jest.fn();

  const defaultProps = {
    apiClient: mockApiClient,
    onAddQuestion: mockOnAddQuestion,
    addedQuestionIds: [],
  };

  const mockQuestion: Question = {
    id: 'question-1',
    statement: 'Test question statement',
    description: null,
    questionType: QUESTION_TYPE.ALTERNATIVA,
    status: 'APROVADO' as never,
    difficultyLevel: 'MEDIO' as never,
    questionBankYearId: 'year-1',
    solutionExplanation: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    options: [
      { id: 'opt-1', option: 'Option 1' },
      { id: 'opt-2', option: 'Option 2' },
    ],
    knowledgeMatrix: [
      {
        subject: {
          id: 'subject-1',
          name: 'Matemática',
          color: '#FF0000',
          icon: 'Calculator',
        },
        topic: {
          id: 'topic-1',
          name: 'Álgebra',
        },
        subtopic: {
          id: 'subtopic-1',
          name: 'Equações',
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAppliedFilters.mockReturnValue(null);
    mockSetCachedQuestions.mockClear();
    mockClearCachedQuestions.mockClear();
    Object.assign(mockUseQuestionsListReturn, {
      questions: [],
      pagination: null,
      loading: false,
      loadingMore: false,
      error: null,
    });
  });

  describe('Basic Rendering', () => {
    it('should render component with header', () => {
      render(<ActivityListQuestions {...defaultProps} />);

      expect(screen.getByTestId('notebook-icon')).toBeInTheDocument();
      expect(screen.getByText('Banco de questões')).toBeInTheDocument();
    });

    it('should render "Adicionar automaticamente" button', () => {
      render(<ActivityListQuestions {...defaultProps} />);

      const button = screen.getByText('Adicionar automaticamente');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-size', 'small');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ActivityListQuestions {...defaultProps} className="custom-class" />
      );

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toContain('custom-class');
    });

    it('should display total questions count when not loading', () => {
      Object.assign(mockUseQuestionsListReturn, {
        pagination: { total: 5, hasNext: false },
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      expect(screen.getByText('5 questões total')).toBeInTheDocument();
    });

    it('should display singular form for 1 question', () => {
      Object.assign(mockUseQuestionsListReturn, {
        pagination: { total: 1, hasNext: false },
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      expect(screen.getByText('1 questão total')).toBeInTheDocument();
    });

    it('should display "Carregando..." when loading', () => {
      Object.assign(mockUseQuestionsListReturn, {
        loading: true,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render skeleton loaders when loading and no questions', () => {
      Object.assign(mockUseQuestionsListReturn, {
        loading: true,
        questions: [],
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const skeletons = screen.getAllByTestId('skeleton-text');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not render skeleton when questions exist', () => {
      Object.assign(mockUseQuestionsListReturn, {
        loading: true,
        questions: [mockQuestion],
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const skeletons = screen.queryAllByTestId('skeleton-text');
      expect(skeletons.length).toBe(0);
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      Object.assign(mockUseQuestionsListReturn, {
        error: 'Erro ao carregar questões',
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      expect(
        screen.getByText('Erro ao carregar questões: Erro ao carregar questões')
      ).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state message when no questions', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [],
        loading: false,
        error: null,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      expect(
        screen.getByText(
          'Nenhuma questão encontrada. Aplique os filtros para buscar questões.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Questions Rendering', () => {
    it('should render questions when available', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      expect(
        screen.getByTestId('activity-card-question-banks')
      ).toBeInTheDocument();
    });

    it('should filter out already added questions', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion, { ...mockQuestion, id: 'question-2' }],
        loading: false,
      });

      render(
        <ActivityListQuestions
          {...defaultProps}
          addedQuestionIds={['question-1']}
        />
      );

      const cards = screen.getAllByTestId('activity-card-question-banks');
      expect(cards).toHaveLength(1);
      expect(cards[0]).toHaveAttribute(
        'data-enunciado',
        'Test question statement'
      );
    });

    it('should render question with correct props', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const card = screen.getByTestId('activity-card-question-banks');
      expect(card).toHaveAttribute(
        'data-question-type',
        String(QUESTION_TYPE.ALTERNATIVA)
      );
      expect(card).toHaveAttribute(
        'data-assunto',
        'Matemática - Álgebra - Equações'
      );
      expect(card).toHaveAttribute('data-enunciado', 'Test question statement');
      expect(card).toHaveAttribute('data-subject-color', '#FF0000');
      expect(card).toHaveAttribute('data-icon-name', 'Atom');
    });

    it('should format question options correctly', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const optionsDiv = screen.getByTestId('question-options');
      expect(optionsDiv).toBeInTheDocument();
      const options = JSON.parse(optionsDiv.textContent || '{}');
      expect(options.options).toHaveLength(2);
      expect(options.options[0]).toEqual({ id: 'opt-1', option: 'Option 1' });
    });

    it('should handle question without options', () => {
      const questionWithoutOptions = {
        ...mockQuestion,
        options: undefined,
      };

      Object.assign(mockUseQuestionsListReturn, {
        questions: [questionWithoutOptions],
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      expect(screen.queryByTestId('question-options')).not.toBeInTheDocument();
    });

    it('should handle question without knowledge matrix', () => {
      const questionWithoutMatrix = {
        ...mockQuestion,
        knowledgeMatrix: [],
      };

      Object.assign(mockUseQuestionsListReturn, {
        questions: [questionWithoutMatrix],
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const card = screen.getByTestId('activity-card-question-banks');
      expect(card).toHaveAttribute('data-assunto', 'Sem assunto');
      expect(card).toHaveAttribute('data-subject-color', '#6B7280');
    });

    it('should handle question with subject but no topic', () => {
      const questionWithSubjectOnly = {
        ...mockQuestion,
        knowledgeMatrix: [
          {
            subject: {
              id: 'subject-1',
              name: 'Matemática',
              color: '#FF0000',
              icon: 'Calculator',
            },
            topic: null,
            subtopic: null,
          },
        ],
      };

      Object.assign(mockUseQuestionsListReturn, {
        questions: [questionWithSubjectOnly],
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const card = screen.getByTestId('activity-card-question-banks');
      expect(card).toHaveAttribute('data-assunto', 'Matemática');
    });

    it('should map all question types correctly', () => {
      const questionTypes = [
        QUESTION_TYPE.ALTERNATIVA,
        QUESTION_TYPE.DISSERTATIVA,
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        QUESTION_TYPE.VERDADEIRO_FALSO,
        QUESTION_TYPE.IMAGEM,
        QUESTION_TYPE.LIGAR_PONTOS,
        QUESTION_TYPE.PREENCHER,
      ];

      questionTypes.forEach((type) => {
        const question = {
          ...mockQuestion,
          questionType: type,
        };

        Object.assign(mockUseQuestionsListReturn, {
          questions: [question],
          loading: false,
        });

        const { unmount } = render(<ActivityListQuestions {...defaultProps} />);

        const card = screen.getByTestId('activity-card-question-banks');
        expect(card).toHaveAttribute('data-question-type', String(type));
        unmount();
      });
    });

    it('should default to ALTERNATIVA for unknown question type', () => {
      const question = {
        ...mockQuestion,
        questionType: 'UNKNOWN_TYPE' as QUESTION_TYPE,
      };

      Object.assign(mockUseQuestionsListReturn, {
        questions: [question],
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const card = screen.getByTestId('activity-card-question-banks');
      expect(card).toHaveAttribute(
        'data-question-type',
        String(QUESTION_TYPE.ALTERNATIVA)
      );
    });
  });

  describe('Add Question Interaction', () => {
    it('should call onAddQuestion when add button is clicked', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const addButton = screen.getByTestId('add-to-activity-button');
      fireEvent.click(addButton);

      expect(mockOnAddQuestion).toHaveBeenCalledWith(mockQuestion);
    });

    it('should not crash when onAddQuestion is not provided', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        loading: false,
      });

      render(
        <ActivityListQuestions {...defaultProps} onAddQuestion={undefined} />
      );

      const addButton = screen.getByTestId('add-to-activity-button');
      expect(() => fireEvent.click(addButton)).not.toThrow();
    });
  });

  describe('Filters Integration', () => {
    it('should call fetchQuestions when filters are applied', async () => {
      const filters = {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        yearIds: [],
        knowledgeIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      mockAppliedFilters.mockReturnValue(filters as never);

      render(<ActivityListQuestions {...defaultProps} />);

      await waitFor(() => {
        expect(mockFetchQuestions).toHaveBeenCalled();
      });
    });

    it('should call reset when filters are cleared', async () => {
      mockAppliedFilters.mockReturnValue(null);

      render(<ActivityListQuestions {...defaultProps} />);

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalled();
      });
    });

    it('should include addedQuestionIds in filters when provided', async () => {
      const filters = {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        yearIds: [],
        knowledgeIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      mockAppliedFilters.mockReturnValue(filters as never);

      render(
        <ActivityListQuestions
          {...defaultProps}
          addedQuestionIds={['question-1', 'question-2']}
        />
      );

      await waitFor(() => {
        expect(mockFetchQuestions).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedQuestionsIds: ['question-1', 'question-2'],
          }),
          false
        );
      });
    });

    it('should not include selectedQuestionsIds when addedQuestionIds is empty', async () => {
      const filters = {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        yearIds: [],
        knowledgeIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      mockAppliedFilters.mockReturnValue(filters as never);

      render(<ActivityListQuestions {...defaultProps} addedQuestionIds={[]} />);

      await waitFor(() => {
        expect(mockFetchQuestions).toHaveBeenCalledWith(
          expect.not.objectContaining({
            selectedQuestionsIds: expect.anything(),
          }),
          false
        );
      });
    });
  });

  describe('Infinite Scroll', () => {
    it('should setup IntersectionObserver', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        pagination: { total: 10, hasNext: true },
        loading: false,
        loadingMore: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      expect(IntersectionObserver).toHaveBeenCalled();
    });

    it('should call loadMore when intersection occurs', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        pagination: { total: 10, hasNext: true },
        loading: false,
        loadingMore: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const observerInstance = (IntersectionObserver as jest.Mock).mock
        .results[0].value;

      const mockEntry = {
        isIntersecting: true,
      } as IntersectionObserverEntry;

      observerInstance.trigger([mockEntry]);

      expect(mockLoadMore).toHaveBeenCalled();
    });

    it('should not call loadMore when already loading', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        pagination: { total: 10, hasNext: true },
        loading: false,
        loadingMore: true,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const observerInstance = (IntersectionObserver as jest.Mock).mock
        .results[0].value;

      const mockEntry = {
        isIntersecting: true,
      } as IntersectionObserverEntry;

      observerInstance.trigger([mockEntry]);

      expect(mockLoadMore).not.toHaveBeenCalled();
    });

    it('should not call loadMore when no next page', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        pagination: { total: 10, hasNext: false },
        loading: false,
        loadingMore: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const observerInstance = (IntersectionObserver as jest.Mock).mock
        .results[0].value;

      const mockEntry = {
        isIntersecting: true,
      } as IntersectionObserverEntry;

      observerInstance.trigger([mockEntry]);

      expect(mockLoadMore).not.toHaveBeenCalled();
    });

    it('should render loading skeleton when loadingMore is true', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        pagination: { total: 10, hasNext: true },
        loading: false,
        loadingMore: true,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const skeletons = screen.getAllByTestId('skeleton-text');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render observer target div when hasNext is true', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        pagination: { total: 10, hasNext: true },
        loading: false,
        loadingMore: false,
      });

      const { container } = render(<ActivityListQuestions {...defaultProps} />);

      const observerTarget = container.querySelector('div.h-4.w-full');
      expect(observerTarget).toBeInTheDocument();
    });
  });

  describe('Add Automatically Modal', () => {
    it('should open modal when button is clicked', () => {
      render(<ActivityListQuestions {...defaultProps} />);

      const button = screen.getByText('Adicionar automaticamente');
      fireEvent.click(button);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Adicionar automaticamente'
      );
    });

    it('should close modal when close button is clicked', () => {
      render(<ActivityListQuestions {...defaultProps} />);

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      expect(screen.getByTestId('modal')).toBeInTheDocument();

      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should reset question count when modal closes', () => {
      render(<ActivityListQuestions {...defaultProps} />);

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: '5' } });

      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      fireEvent.click(openButton);

      const newInput = screen.getByTestId('input');
      expect(newInput).toHaveValue(1);
    });

    it('should update question count when input changes', () => {
      render(<ActivityListQuestions {...defaultProps} />);

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: '5' } });

      expect(input).toHaveValue(5);
    });

    it('should handle empty input', () => {
      render(<ActivityListQuestions {...defaultProps} />);

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '' } });

      // When input is empty, component sets questionCount to 0, so input value becomes empty string
      expect(input.value).toBe('');
    });

    it('should not allow negative numbers', () => {
      render(<ActivityListQuestions {...defaultProps} />);

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: '-5' } });

      expect(input).toHaveValue(1);
    });

    it('should disable add button when questionCount is 0', () => {
      render(<ActivityListQuestions {...defaultProps} />);

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: '' } });

      const addButton = screen
        .getByTestId('modal-footer')
        .querySelector('button[data-variant="solid"]');

      expect(addButton).toBeDisabled();
    });

    it('should disable add button when no filters are applied', () => {
      mockAppliedFilters.mockReturnValue(null);

      render(<ActivityListQuestions {...defaultProps} />);

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      const addButton = screen
        .getByTestId('modal-footer')
        .querySelector('button[data-variant="solid"]');

      expect(addButton).toBeDisabled();
    });

    it('should call fetchRandomQuestions and onAddQuestion when add is clicked', async () => {
      const filters = {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        yearIds: [],
        knowledgeIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      mockAppliedFilters.mockReturnValue(filters as never);
      mockFetchRandomQuestions.mockResolvedValue([mockQuestion]);

      render(<ActivityListQuestions {...defaultProps} />);

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: '2' } });

      const addButton = screen
        .getByTestId('modal-footer')
        .querySelector('button[data-variant="solid"]') as HTMLButtonElement;

      fireEvent.click(addButton);

      await waitFor(
        () => {
          expect(mockFetchRandomQuestions).toHaveBeenCalledWith(
            2,
            expect.objectContaining({
              types: [QUESTION_TYPE.ALTERNATIVA],
            })
          );
        },
        { timeout: 3000 }
      );

      await waitFor(
        () => {
          expect(mockOnAddQuestion).toHaveBeenCalledWith(mockQuestion);
        },
        { timeout: 3000 }
      );
    });

    it('should handle error when fetchRandomQuestions fails', async () => {
      const filters = {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        yearIds: [],
        knowledgeIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      mockAppliedFilters.mockReturnValue(filters as never);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockFetchRandomQuestions.mockRejectedValue(new Error('API Error'));

      render(<ActivityListQuestions {...defaultProps} />);

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: '2' } });

      const addButton = screen
        .getByTestId('modal-footer')
        .querySelector('button[data-variant="solid"]') as HTMLButtonElement;

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should not call fetchRandomQuestions when questionCount is 0', async () => {
      const filters = {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        yearIds: [],
        knowledgeIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      mockAppliedFilters.mockReturnValue(filters as never);

      render(<ActivityListQuestions {...defaultProps} />);

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: '' } });

      const addButton = screen
        .getByTestId('modal-footer')
        .querySelector('button[data-variant="solid"]') as HTMLButtonElement;

      // Button should be disabled when questionCount is 0
      expect(addButton).toBeDisabled();

      // Even if we force click, it should not call fetchRandomQuestions
      fireEvent.click(addButton);

      await waitFor(
        () => {
          expect(mockFetchRandomQuestions).not.toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });

    it('should include addedQuestionIds in random questions filter', async () => {
      const filters = {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        yearIds: [],
        knowledgeIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      mockAppliedFilters.mockReturnValue(filters as never);
      mockFetchRandomQuestions.mockResolvedValue([mockQuestion]);

      render(
        <ActivityListQuestions
          {...defaultProps}
          addedQuestionIds={['existing-1']}
        />
      );

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: '1' } });

      const addButton = screen
        .getByTestId('modal-footer')
        .querySelector('button[data-variant="solid"]') as HTMLButtonElement;

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockFetchRandomQuestions).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            selectedQuestionsIds: ['existing-1'],
          })
        );
      });
    });

    it('should close modal after successful add', async () => {
      const filters = {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        yearIds: [],
        knowledgeIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      mockAppliedFilters.mockReturnValue(filters as never);
      mockFetchRandomQuestions.mockResolvedValue([mockQuestion]);

      render(<ActivityListQuestions {...defaultProps} />);

      const openButton = screen.getByText('Adicionar automaticamente');
      fireEvent.click(openButton);

      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: '1' } });

      const addButton = screen
        .getByTestId('modal-footer')
        .querySelector('button[data-variant="solid"]') as HTMLButtonElement;

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle question with null subject', () => {
      const questionWithNullSubject = {
        ...mockQuestion,
        knowledgeMatrix: [
          {
            subject: null,
            topic: null,
            subtopic: null,
          },
        ],
      };

      Object.assign(mockUseQuestionsListReturn, {
        questions: [questionWithNullSubject],
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const card = screen.getByTestId('activity-card-question-banks');
      expect(card).toHaveAttribute('data-assunto', 'Sem assunto');
    });

    it('should handle question with subject but no color', () => {
      const questionWithoutColor = {
        ...mockQuestion,
        knowledgeMatrix: [
          {
            subject: {
              id: 'subject-1',
              name: 'Matemática',
              color: null,
              icon: 'Calculator',
            },
            topic: null,
            subtopic: null,
          },
        ],
      };

      Object.assign(mockUseQuestionsListReturn, {
        questions: [questionWithoutColor],
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const card = screen.getByTestId('activity-card-question-banks');
      expect(card).toHaveAttribute('data-subject-color', '#6B7280');
    });

    it('should handle multiple questions correctly', () => {
      const questions = [
        mockQuestion,
        { ...mockQuestion, id: 'question-2' },
        { ...mockQuestion, id: 'question-3' },
      ];

      Object.assign(mockUseQuestionsListReturn, {
        questions,
        loading: false,
      });

      render(<ActivityListQuestions {...defaultProps} />);

      const cards = screen.getAllByTestId('activity-card-question-banks');
      expect(cards).toHaveLength(3);
    });

    it('should handle cleanup of IntersectionObserver', () => {
      Object.assign(mockUseQuestionsListReturn, {
        questions: [mockQuestion],
        pagination: { total: 10, hasNext: true },
        loading: false,
        loadingMore: false,
      });

      const { unmount } = render(<ActivityListQuestions {...defaultProps} />);

      const observerInstance = (IntersectionObserver as jest.Mock).mock
        .results[0].value;

      unmount();

      expect(observerInstance.unobserve).toHaveBeenCalled();
    });
  });
});
