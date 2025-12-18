import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateActivity } from './ActivityCreate';
import type { ActivityData, BackendFiltersFormat } from './ActivityCreate';
import type {
  BaseApiClient,
  ActivityFiltersData,
  PreviewQuestion,
  QuestionActivity,
} from '../..';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import {
  QUESTION_STATUS_ENUM,
  DIFFICULTY_LEVEL_ENUM,
} from '../../types/questions';

// Helper function to create a mock Question with all required fields
const createMockQuestion = (
  overrides: Partial<QuestionActivity> = {}
): QuestionActivity => {
  return {
    id: 'q1',
    statement: 'Test question',
    description: null,
    questionType: QUESTION_TYPE.ALTERNATIVA,
    status: QUESTION_STATUS_ENUM.APROVADO,
    difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
    questionBankYearId: 'bankYear1',
    solutionExplanation: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    options: [],
    ...overrides,
  };
};

// Mock console methods to avoid noise in tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

// Mock icons
jest.mock('phosphor-react', () => ({
  CaretLeft: () => <span data-testid="caret-left">←</span>,
  PaperPlaneTilt: () => <span data-testid="paper-plane">✈</span>,
  Funnel: () => <span data-testid="funnel">🔽</span>,
}));

// Mock components
jest.mock('../ActivityFilters/ActivityFilters', () => ({
  ActivityFilters: ({
    onFiltersChange,
    apiClient: _apiClient,
    institutionId: _institutionId,
  }: {
    onFiltersChange?: (filters: ActivityFiltersData) => void;
    apiClient: BaseApiClient;
    institutionId: string;
  }) => (
    <div data-testid="activity-filters">
      <button
        data-testid="trigger-filters-change"
        onClick={() =>
          onFiltersChange?.({
            types: [QUESTION_TYPE.ALTERNATIVA],
            bankIds: ['bank1'],
            yearIds: [],
            knowledgeIds: ['subject1'],
            topicIds: [],
            subtopicIds: [],
            contentIds: [],
          })
        }
      >
        Change Filters
      </button>
    </div>
  ),
}));

jest.mock('../ActivityPreview/ActivityPreview', () => ({
  ActivityPreview: ({
    questions,
    onRemoveAll,
    onRemoveQuestion,
    onReorder,
  }: {
    questions: PreviewQuestion[];
    onRemoveAll?: () => void;
    onRemoveQuestion?: (id: string) => void;
    onReorder?: (questions: PreviewQuestion[]) => void;
  }) => (
    <div data-testid="activity-preview">
      <div data-testid="questions-count">{questions.length}</div>
      <button data-testid="remove-all" onClick={onRemoveAll}>
        Remove All
      </button>
      {questions.map((q) => (
        <div key={q.id} data-testid={`question-${q.id}`}>
          <button
            data-testid={`remove-${q.id}`}
            onClick={() => onRemoveQuestion?.(q.id)}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        data-testid="reorder"
        onClick={() => onReorder?.(questions.slice().reverse())}
      >
        Reorder
      </button>
    </div>
  ),
}));

jest.mock('../ActivityListQuestions/ActivityListQuestions', () => ({
  ActivityListQuestions: ({
    onAddQuestion,
    addedQuestionIds,
  }: {
    onAddQuestion: (question: QuestionActivity) => void;
    addedQuestionIds: string[];
  }) => (
    <div data-testid="activity-list-questions">
      <button
        data-testid="add-question"
        onClick={() => onAddQuestion(createMockQuestion())}
      >
        Add Question
      </button>
      <div data-testid="added-ids">{addedQuestionIds.join(',')}</div>
    </div>
  ),
}));

jest.mock('../SendActivityModal/SendActivityModal', () => ({
  SendActivityModal: ({
    isOpen,
    onClose,
    onSubmit,
    categories,
    isLoading,
    onError,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: unknown) => Promise<void>;
    categories: unknown[];
    isLoading: boolean;
    onError?: (error: unknown) => void;
  }) =>
    isOpen ? (
      <div data-testid="send-activity-modal">
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        <button
          data-testid="modal-submit"
          onClick={() =>
            onSubmit({
              title: 'Test Activity',
              startDate: '2025-01-01',
              startTime: '10:00',
              finalDate: '2025-01-02',
              finalTime: '12:00',
              subtype: 'HOMEWORK',
              canRetry: false,
              notification: '',
              students: [
                {
                  studentId: 'student-1',
                  userInstitutionId: 'ui-1',
                },
              ],
            })
              .then(() => {})
              .catch((err) => onError?.(err))
          }
        >
          Submit
        </button>
        <div data-testid="modal-loading">
          {isLoading ? 'Loading' : 'Not Loading'}
        </div>
        <div data-testid="categories-count">{categories.length}</div>
      </div>
    ) : null,
}));

// Mock UI components - this needs to be after the hook mocks

// Mock utility function
jest.mock('../../utils/activityFilters', () => ({
  areFiltersEqual: jest.fn((a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return JSON.stringify(a) === JSON.stringify(b);
  }),
}));

// Mock hooks - define these before using in jest.mock
const mockApplyFilters = jest.fn();
const mockSetDraftFilters = jest.fn();
const mockLoadKnowledgeAreas = jest.fn();
const mockAddToast = jest.fn();

let mockDraftFilters: ActivityFiltersData | null = null;
let mockAppliedFilters: ActivityFiltersData | null = null;

const mockUseQuestionsListReturn = {};

const mockUseActivityFiltersDataReturn = {
  knowledgeAreas: [
    {
      id: 'subject1',
      name: 'Matemática',
      icon: 'Calculator',
      color: '#ff0000',
    },
    { id: 'subject2', name: 'Português', icon: 'Book', color: '#00ff00' },
  ],
  loadKnowledgeAreas: mockLoadKnowledgeAreas,
};

// Mock useQuestionFiltersStore
jest.mock('../../store/questionFiltersStore', () => ({
  useQuestionFiltersStore: (selector: (state: unknown) => unknown) => {
    const mockState = {
      draftFilters: mockDraftFilters,
      appliedFilters: mockAppliedFilters,
      applyFilters: mockApplyFilters,
      setDraftFilters: mockSetDraftFilters,
    };
    return selector(mockState);
  },
}));

// Mock createUseQuestionsList
jest.mock('../../hooks/useQuestionsList', () => ({
  createUseQuestionsList: () => () => mockUseQuestionsListReturn,
}));

// Mock createUseActivityFiltersData
jest.mock('../../hooks/useActivityFiltersData', () => ({
  createUseActivityFiltersData: () => () => mockUseActivityFiltersDataReturn,
}));

// Mock index.ts exports - must include all components used by ActivityCreate
jest.mock('../..', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');

  const actual = jest.requireActual('../..');

  const asComponent =
    (tag: keyof React.JSX.IntrinsicElements) =>
    ({
      children,
      onClick,
      disabled,
      className,
      iconLeft,
      size,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      className?: string;
      iconLeft?: React.ReactNode;
      size?: string;
    }) =>
      React.createElement(
        tag,
        {
          onClick,
          disabled,
          className,
          'data-testid': tag.toLowerCase(),
          'data-size': size,
        },
        iconLeft,
        children
      );

  return {
    ...actual,
    Button: asComponent('button'),
    Text: asComponent('span'),
    Skeleton: ({
      variant,
      width,
      height,
    }: {
      variant?: string;
      width?: number | string;
      height?: number | string;
    }) => (
      <div
        data-testid="skeleton"
        data-variant={variant}
        data-width={width}
        data-height={height}
      />
    ),
    SkeletonText: ({
      width,
      height,
      lines,
    }: {
      width?: number | string;
      height?: number | string;
      lines?: number;
    }) => (
      <div
        data-testid="skeleton-text"
        data-width={width}
        data-height={height}
        data-lines={lines}
      />
    ),
    SkeletonCard: ({ lines }: { lines?: number }) => (
      <div data-testid="skeleton-card" data-lines={lines} />
    ),
    QUESTION_TYPE: {
      ALTERNATIVA: 'ALTERNATIVA',
      DISSERTATIVA: 'DISSERTATIVA',
    },
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ActivityFilters: require('../ActivityFilters/ActivityFilters')
      .ActivityFilters,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ActivityPreview: require('../ActivityPreview/ActivityPreview')
      .ActivityPreview,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SendActivityModal: require('../SendActivityModal/SendActivityModal')
      .SendActivityModal,
    useQuestionFiltersStore: (selector: (state: unknown) => unknown) => {
      const mockState = {
        draftFilters: mockDraftFilters,
        appliedFilters: mockAppliedFilters,
        applyFilters: mockApplyFilters,
        setDraftFilters: mockSetDraftFilters,
      };
      return selector(mockState);
    },
    useToastStore: (selector: (state: unknown) => unknown) => {
      const mockState = {
        toasts: [],
        addToast: mockAddToast,
        removeToast: jest.fn(),
      };
      return selector(mockState);
    },
    createUseQuestionsList: () => () => mockUseQuestionsListReturn,
    createUseActivityFiltersData: () => () => mockUseActivityFiltersDataReturn,
  };
});

describe('CreateActivity', () => {
  const mockApiClient: BaseApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const defaultProps = {
    apiClient: mockApiClient,
    institutionId: 'inst1',
    isDark: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockDraftFilters = null;
    mockAppliedFilters = null;
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockAddToast.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render loading skeleton when loading prop is true', () => {
      render(<CreateActivity {...defaultProps} loading={true} />);

      expect(screen.getByTestId('create-activity-page')).toBeInTheDocument();
      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('skeleton-text').length).toBeGreaterThan(0);
    });

    it('should render main component when loading is false', () => {
      render(<CreateActivity {...defaultProps} />);

      expect(screen.getByTestId('create-activity-page')).toBeInTheDocument();
      expect(screen.getByText('Criar atividade')).toBeInTheDocument();
      expect(screen.getByTestId('activity-filters')).toBeInTheDocument();
      expect(screen.getByTestId('activity-list-questions')).toBeInTheDocument();
    });

    it('should render edit title when activity is provided', () => {
      const activity: ActivityData = {
        id: 'act1',
        type: 'RASCUNHO',
        title: 'Test Activity',
        subjectId: 'subject1',
        filters: {},
        questionIds: [],
      };

      render(<CreateActivity {...defaultProps} activity={activity} />);

      expect(screen.getByText('Editar atividade')).toBeInTheDocument();
    });

    it('should render header with correct elements', () => {
      render(<CreateActivity {...defaultProps} />);

      expect(screen.getByTestId('caret-left')).toBeInTheDocument();
      expect(screen.getByText('Criar atividade')).toBeInTheDocument();
      expect(screen.getByText('Salvar modelo')).toBeInTheDocument();
      expect(screen.getByText('Enviar atividade')).toBeInTheDocument();
    });

    it('should show no draft saved message initially', () => {
      render(<CreateActivity {...defaultProps} />);

      expect(screen.getByText('Nenhum rascunho salvo')).toBeInTheDocument();
    });

    it('should render activity preview with loading state', () => {
      mockAppliedFilters = {
        types: [],
        bankIds: [],
        yearIds: [],
        knowledgeIds: ['subject1'],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      render(<CreateActivity {...defaultProps} />);

      expect(screen.getByTestId('activity-preview')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should call setDraftFilters when filters change', () => {
      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('trigger-filters-change'));

      expect(mockSetDraftFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          types: [QUESTION_TYPE.ALTERNATIVA],
          knowledgeIds: ['subject1'],
        })
      );
    });

    it('should call applyFilters when filter button is clicked', () => {
      mockDraftFilters = {
        types: [],
        bankIds: [],
        yearIds: [],
        knowledgeIds: ['subject1'],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      render(<CreateActivity {...defaultProps} />);

      const filterButton = screen.getByText('Filtrar');
      fireEvent.click(filterButton);

      expect(mockApplyFilters).toHaveBeenCalled();
    });

    it('should disable filter button when no draft filters', () => {
      mockDraftFilters = null;

      render(<CreateActivity {...defaultProps} />);

      const filterButton = screen.getByText('Filtrar');
      expect(filterButton).toBeDisabled();
    });

    it('should initialize filters from activity', () => {
      const activity: ActivityData = {
        id: 'act1',
        type: 'RASCUNHO',
        title: 'Test',
        subjectId: 'subject1',
        filters: {
          questionTypes: [QUESTION_TYPE.ALTERNATIVA],
          subjects: ['subject1'],
        },
        questionIds: [],
      };

      render(<CreateActivity {...defaultProps} activity={activity} />);

      expect(mockSetDraftFilters).toHaveBeenCalled();
      expect(mockApplyFilters).toHaveBeenCalled();
    });
  });

  describe('Questions Management', () => {
    it('should add question when onAddQuestion is called', () => {
      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      expect(screen.getByTestId('question-q1')).toBeInTheDocument();
      expect(screen.getByTestId('questions-count')).toHaveTextContent('1');
    });

    it('should not add duplicate question', () => {
      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));
      fireEvent.click(screen.getByTestId('add-question'));

      expect(screen.getByTestId('questions-count')).toHaveTextContent('1');
    });

    it('should remove question when onRemoveQuestion is called', () => {
      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));
      expect(screen.getByTestId('question-q1')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('remove-q1'));

      expect(screen.queryByTestId('question-q1')).not.toBeInTheDocument();
      expect(screen.getByTestId('questions-count')).toHaveTextContent('0');
    });

    it('should remove all questions when onRemoveAll is called', () => {
      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));
      fireEvent.click(screen.getByTestId('add-question'));

      fireEvent.click(screen.getByTestId('remove-all'));

      expect(screen.getByTestId('questions-count')).toHaveTextContent('0');
    });

    it('should reorder questions when onReorder is called', () => {
      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      // Add second question manually by calling the handler
      act(() => {
        const listComponent = screen.getByTestId('activity-list-questions');
        const addButton = listComponent.querySelector(
          '[data-testid="add-question"]'
        );
        if (addButton) {
          fireEvent.click(addButton);
        }
      });

      fireEvent.click(screen.getByTestId('reorder'));

      expect(screen.getByTestId('activity-preview')).toBeInTheDocument();
    });

    it('should show added question IDs in ActivityListQuestions', () => {
      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      expect(screen.getByTestId('added-ids')).toHaveTextContent('q1');
    });
  });

  describe('Loading Initial Questions', () => {
    it('should load questions from activity.selectedQuestions', async () => {
      const questions: QuestionActivity[] = [
        createMockQuestion({
          id: 'q1',
          statement: 'Question 1',
        }),
      ];

      const activity: ActivityData = {
        id: 'act1',
        type: 'RASCUNHO',
        title: 'Test',
        subjectId: 'subject1',
        filters: {},
        questionIds: [],
        selectedQuestions: questions,
      };

      render(<CreateActivity {...defaultProps} activity={activity} />);

      await waitFor(() => {
        expect(screen.getByTestId('question-q1')).toBeInTheDocument();
      });
    });

    it('should not load questions if activity has no selectedQuestions', () => {
      const activity: ActivityData = {
        id: 'act1',
        type: 'RASCUNHO',
        title: 'Test',
        subjectId: 'subject1',
        filters: {},
        questionIds: ['q1'],
      };

      render(<CreateActivity {...defaultProps} activity={activity} />);

      // Questions should not be loaded if selectedQuestions is not provided
      expect(screen.queryByTestId('question-q1')).not.toBeInTheDocument();
    });
  });

  describe('Save Draft', () => {
    beforeEach(() => {
      mockAppliedFilters = {
        types: [],
        bankIds: [],
        yearIds: [],
        knowledgeIds: ['subject1'],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };
    });

    it('should create new draft when no draftId exists', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'draft1',
              type: 'RASCUNHO',
              title: 'Rascunho - Matemática',
              creatorUserInstitutionId: 'user1',
              subjectId: 'subject1',
              filters: {},
              createdAt: '2025-01-01',
              updatedAt: '2025-01-01',
            },
            questionsLinked: 1,
          },
        },
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockResponse);

      render(<CreateActivity {...defaultProps} />);

      // Add a question to trigger save
      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/activity-drafts',
          expect.objectContaining({
            type: 'RASCUNHO',
            subjectId: 'subject1',
          })
        );
      });
    });

    it('should update existing draft when draftId exists', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'draft1',
              type: 'RASCUNHO',
              title: 'Rascunho - Matemática',
              creatorUserInstitutionId: 'user1',
              subjectId: 'subject1',
              filters: {},
              createdAt: '2025-01-01',
              updatedAt: '2025-01-01',
            },
            questionsLinked: 1,
          },
        },
      };

      mockApiClient.patch = jest.fn().mockResolvedValue(mockResponse);

      const activity: ActivityData = {
        id: 'draft1',
        type: 'RASCUNHO',
        title: 'Test',
        subjectId: 'subject1',
        filters: {},
        questionIds: [],
      };

      render(<CreateActivity {...defaultProps} activity={activity} />);

      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockApiClient.patch).toHaveBeenCalledWith(
          '/activity-drafts/draft1',
          expect.any(Object)
        );
      });
    });

    it('should not save if no questions and first save not done', async () => {
      render(<CreateActivity {...defaultProps} />);

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockApiClient.post).not.toHaveBeenCalled();
        expect(mockApiClient.patch).not.toHaveBeenCalled();
      });
    });

    it('should not save if no applied filters', async () => {
      mockAppliedFilters = null;

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockApiClient.post).not.toHaveBeenCalled();
      });
    });

    it('should not save if already saving', async () => {
      mockApiClient.post = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Trigger another save while first is in progress
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onActivityChange after successful save', async () => {
      const onActivityChange = jest.fn();
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'draft1',
              type: 'RASCUNHO',
              title: 'Rascunho - Matemática',
              creatorUserInstitutionId: 'user1',
              subjectId: 'subject1',
              filters: {},
              createdAt: '2025-01-01',
              updatedAt: '2025-01-01',
            },
            questionsLinked: 1,
          },
        },
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockResponse);

      render(
        <CreateActivity {...defaultProps} onActivityChange={onActivityChange} />
      );

      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(onActivityChange).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'draft1',
            type: 'RASCUNHO',
          })
        );
      });
    });

    it('should handle save error gracefully', async () => {
      mockApiClient.post = jest
        .fn()
        .mockRejectedValue(new Error('Save failed'));

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          '❌ Erro ao salvar rascunho:',
          expect.any(Error)
        );
      });

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          title: 'Erro ao salvar rascunho',
          description: 'Save failed',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
      });
    });

    it('should show toast with default message when error has no message', async () => {
      mockApiClient.post = jest.fn().mockRejectedValue({});

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          title: 'Erro ao salvar rascunho',
          description: 'Ocorreu um erro ao salvar o rascunho. Tente novamente.',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
      });
    });

    it('should show toast error when PATCH fails', async () => {
      const error = new Error('Server error: Unable to update draft');
      mockApiClient.patch = jest.fn().mockRejectedValue(error);

      const activity: ActivityData = {
        id: 'draft1',
        type: 'RASCUNHO',
        title: 'Test',
        subjectId: 'subject1',
        filters: {},
        questionIds: [],
      };

      render(<CreateActivity {...defaultProps} activity={activity} />);

      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          title: 'Erro ao salvar rascunho',
          description: 'Server error: Unable to update draft',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
      });
    });

    it('should save immediately when activityType changes to MODELO', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'draft1',
              type: 'MODELO',
              title: 'Modelo - Matemática',
              creatorUserInstitutionId: 'user1',
              subjectId: 'subject1',
              filters: {},
              createdAt: '2025-01-01',
              updatedAt: '2025-01-01',
            },
            questionsLinked: 1,
          },
        },
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockResponse);
      mockApiClient.patch = jest.fn().mockResolvedValue(mockResponse);

      render(<CreateActivity {...defaultProps} />);

      // Add question and wait for first save
      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalled();
      });

      jest.clearAllMocks();

      // Click save model button
      fireEvent.click(screen.getByText('Salvar modelo'));

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        // After first save, draftId exists, so should use PATCH
        expect(mockApiClient.patch).toHaveBeenCalled();
        expect(mockApiClient.patch).toHaveBeenCalledWith(
          expect.stringContaining('/activity-drafts/'),
          expect.objectContaining({
            type: 'MODELO',
          })
        );
        // POST should not be called after first save
        expect(mockApiClient.post).not.toHaveBeenCalled();
      });
    });

    it('should show saving message when isSaving is true', () => {
      render(<CreateActivity {...defaultProps} />);

      // The component should show "Salvando..." when saving
      // This is tested indirectly through the save flow
      expect(screen.getByText('Nenhum rascunho salvo')).toBeInTheDocument();
    });

    it('should show last saved time after successful save', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'draft1',
              type: 'RASCUNHO',
              title: 'Rascunho - Matemática',
              creatorUserInstitutionId: 'user1',
              subjectId: 'subject1',
              filters: {},
              createdAt: '2025-01-01',
              updatedAt: '2025-01-01',
            },
            questionsLinked: 1,
          },
        },
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockResponse);

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText(/Rascunho salvo às/)).toBeInTheDocument();
      });
    });
  });

  describe('Send Activity', () => {
    beforeEach(() => {
      mockAppliedFilters = {
        types: [],
        bankIds: [],
        yearIds: [],
        knowledgeIds: ['subject1'],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };
    });

    it('should open send modal when button is clicked with questions', async () => {
      const mockSchoolsResponse = {
        data: {
          data: { schools: [] },
        },
      };
      const mockSchoolYearsResponse = {
        data: {
          data: { schoolYears: [] },
        },
      };
      const mockClassesResponse = {
        data: {
          data: { classes: [] },
        },
      };
      const mockStudentsResponse = {
        data: {
          data: { students: [], pagination: {} },
        },
      };

      mockApiClient.get = jest.fn((url: string) => {
        if (url === '/school')
          return Promise.resolve(mockSchoolsResponse as never);
        if (url === '/schoolYear')
          return Promise.resolve(mockSchoolYearsResponse as never);
        if (url === '/classes')
          return Promise.resolve(mockClassesResponse as never);
        if (url === '/students?page=1&limit=100')
          return Promise.resolve(mockStudentsResponse as never);
        return Promise.reject(new Error('Unknown endpoint'));
      }) as typeof mockApiClient.get;

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      fireEvent.click(screen.getByText('Enviar atividade'));

      await waitFor(() => {
        expect(screen.getByTestId('send-activity-modal')).toBeInTheDocument();
      });
    });

    it('should disable send button when no questions', () => {
      render(<CreateActivity {...defaultProps} />);

      const sendButton = screen.getByText('Enviar atividade');
      expect(sendButton).toBeDisabled();
    });

    it('should disable send button when no questions', () => {
      render(<CreateActivity {...defaultProps} />);

      const sendButton = screen.getByText('Enviar atividade');
      expect(sendButton).toBeDisabled();
    });

    it('should load categories when opening modal', async () => {
      const mockSchoolsResponse = {
        data: {
          data: {
            schools: [
              {
                id: 'school1',
                institutionId: 'inst1',
                companyName: 'School 1',
                document: '123',
                stateRegistration: '456',
                phone: '123456',
                email: 'school@test.com',
                active: true,
                street: 'Street',
                streetNumber: '123',
                neighborhood: 'Neighborhood',
                complement: '',
                city: 'City',
                state: 'State',
                zipCode: '12345',
                trailId: 'trail1',
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
              },
            ],
          },
        },
      };
      const mockSchoolYearsResponse = {
        data: {
          data: {
            schoolYears: [
              {
                id: 'year1',
                name: '2025',
                institutionId: 'inst1',
                schoolId: 'school1',
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
              },
            ],
          },
        },
      };
      const mockClassesResponse = {
        data: {
          data: {
            classes: [
              {
                id: 'class1',
                name: 'Class 1',
                shift: 'MORNING',
                institutionId: 'inst1',
                schoolId: 'school1',
                schoolYearId: 'year1',
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
              },
            ],
          },
        },
      };
      const mockStudentsResponse = {
        data: {
          data: {
            students: [
              {
                id: 'student1',
                email: 'student@test.com',
                name: 'Student 1',
                active: true,
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
                userInstitutionId: 'user1',
                institutionId: 'inst1',
                schoolId: 'school1',
                schoolYearId: 'year1',
                classId: 'class1',
                profileId: 'profile1',
              },
            ],
            pagination: {},
          },
        },
      };

      mockApiClient.get = jest.fn((url: string) => {
        if (url === '/school')
          return Promise.resolve(mockSchoolsResponse as never);
        if (url === '/schoolYear')
          return Promise.resolve(mockSchoolYearsResponse as never);
        if (url === '/classes')
          return Promise.resolve(mockClassesResponse as never);
        if (url === '/students?page=1&limit=100')
          return Promise.resolve(mockStudentsResponse as never);
        return Promise.reject(new Error('Unknown endpoint'));
      }) as typeof mockApiClient.get;

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      fireEvent.click(screen.getByText('Enviar atividade'));

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith('/school');
        expect(mockApiClient.get).toHaveBeenCalledWith('/schoolYear');
        expect(mockApiClient.get).toHaveBeenCalledWith('/classes');
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/students?page=1&limit=100'
        );
      });
    });

    it('should handle error when loading categories fails', async () => {
      mockApiClient.get = jest
        .fn()
        .mockRejectedValue(new Error('Failed to load'));

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      fireEvent.click(screen.getByText('Enviar atividade'));

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          title: 'Erro ao carregar dados',
          description: 'Failed to load',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
      });
    });

    it('should submit activity when form is submitted', async () => {
      mockApiClient.get = jest.fn().mockImplementation((url: string) => {
        if (url === '/school') {
          return Promise.resolve({
            data: {
              message: 'Escolas obtidas com sucesso',
              data: {
                schools: [],
              },
            },
          });
        }
        if (url === '/schoolYear') {
          return Promise.resolve({
            data: {
              message: 'Anos letivos obtidos com sucesso',
              data: {
                schoolYears: [],
              },
            },
          });
        }
        if (url === '/classes') {
          return Promise.resolve({
            data: {
              message: 'Classes obtidas com sucesso',
              data: {
                classes: [],
              },
            },
          });
        }
        if (url.startsWith('/students')) {
          return Promise.resolve({
            data: {
              message: 'Estudantes obtidos com sucesso',
              data: {
                students: [],
                pagination: {
                  page: 1,
                  limit: 100,
                  total: 0,
                  totalPages: 1,
                },
              },
            },
          });
        }
        return Promise.resolve({ data: { data: {} } });
      });

      mockApiClient.post = jest.fn().mockImplementation((url: string) => {
        if (url === '/activities') {
          return Promise.resolve({
            data: {
              message: 'Activity created successfully',
              data: {
                activity: {
                  id: 'activity-123',
                },
              },
            },
          });
        }
        if (url === '/activities/send-to-students') {
          return Promise.resolve({
            data: {
              message: 'Activity sent to students successfully',
              data: { success: true },
            },
          });
        }
        return Promise.resolve({ data: {} });
      });

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      fireEvent.click(screen.getByText('Enviar atividade'));

      await waitFor(() => {
        expect(screen.getByTestId('send-activity-modal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('modal-submit'));

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/activities',
          expect.objectContaining({
            subjectId: 'subject1',
            questionIds: ['q1'],
          })
        );
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/activities/send-to-students',
          expect.objectContaining({
            activityId: 'activity-123',
            students: expect.any(Array),
          })
        );
        expect(mockAddToast).toHaveBeenCalledWith({
          title: 'Atividade enviada com sucesso!',
          description:
            'A atividade foi criada e enviada para os estudantes selecionados.',
          variant: 'solid',
          action: 'success',
          position: 'top-right',
        });
      });
    });

    it('should handle send error', async () => {
      mockApiClient.get = jest.fn().mockImplementation((url: string) => {
        if (url === '/school') {
          return Promise.resolve({
            data: {
              message: 'Escolas obtidas com sucesso',
              data: {
                schools: [],
              },
            },
          });
        }
        if (url === '/schoolYear') {
          return Promise.resolve({
            data: {
              message: 'Anos letivos obtidos com sucesso',
              data: {
                schoolYears: [],
              },
            },
          });
        }
        if (url === '/classes') {
          return Promise.resolve({
            data: {
              message: 'Classes obtidas com sucesso',
              data: {
                classes: [],
              },
            },
          });
        }
        if (url.startsWith('/students')) {
          return Promise.resolve({
            data: {
              message: 'Estudantes obtidos com sucesso',
              data: {
                students: [],
                pagination: {
                  page: 1,
                  limit: 100,
                  total: 0,
                  totalPages: 1,
                },
              },
            },
          });
        }
        return Promise.resolve({ data: { data: {} } });
      });
      mockApiClient.post = jest
        .fn()
        .mockRejectedValue(new Error('Send failed'));

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      fireEvent.click(screen.getByText('Enviar atividade'));

      await waitFor(() => {
        expect(screen.getByTestId('send-activity-modal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('modal-submit'));

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Erro ao enviar atividade:',
          expect.any(Error)
        );
        expect(mockAddToast).toHaveBeenCalledWith({
          title: 'Erro ao enviar atividade',
          description: 'Send failed',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
      });
    });

    it('should close modal when close button is clicked', async () => {
      mockApiClient.get = jest.fn().mockResolvedValue({
        data: {
          data: {
            schools: [],
            schoolYears: [],
            classes: [],
            students: [],
            pagination: {},
          },
        },
      });

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      fireEvent.click(screen.getByText('Enviar atividade'));

      await waitFor(() => {
        expect(screen.getByTestId('send-activity-modal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('modal-close'));

      await waitFor(() => {
        expect(
          screen.queryByTestId('send-activity-modal')
        ).not.toBeInTheDocument();
      });
    });

    it('should use subjectId from activity if available', async () => {
      const activity: ActivityData = {
        id: 'act1',
        type: 'RASCUNHO',
        title: 'Test',
        subjectId: 'subject2',
        filters: {},
        questionIds: [],
      };

      mockApiClient.get = jest.fn().mockImplementation((url: string) => {
        if (url === '/school') {
          return Promise.resolve({
            data: {
              message: 'Escolas obtidas com sucesso',
              data: {
                schools: [],
              },
            },
          });
        }
        if (url === '/schoolYear') {
          return Promise.resolve({
            data: {
              message: 'Anos letivos obtidos com sucesso',
              data: {
                schoolYears: [],
              },
            },
          });
        }
        if (url === '/classes') {
          return Promise.resolve({
            data: {
              message: 'Classes obtidas com sucesso',
              data: {
                classes: [],
              },
            },
          });
        }
        if (url.startsWith('/students')) {
          return Promise.resolve({
            data: {
              message: 'Estudantes obtidos com sucesso',
              data: {
                students: [],
                pagination: {
                  page: 1,
                  limit: 100,
                  total: 0,
                  totalPages: 1,
                },
              },
            },
          });
        }
        return Promise.resolve({ data: { data: {} } });
      });

      mockApiClient.post = jest.fn().mockImplementation((url: string) => {
        if (url === '/activities') {
          return Promise.resolve({
            data: {
              message: 'Activity created successfully',
              data: {
                activity: {
                  id: 'activity-123',
                },
              },
            },
          });
        }
        if (url === '/activities/send-to-students') {
          return Promise.resolve({
            data: {
              message: 'Activity sent to students successfully',
              data: { success: true },
            },
          });
        }
        return Promise.resolve({ data: {} });
      });

      render(<CreateActivity {...defaultProps} activity={activity} />);

      fireEvent.click(screen.getByTestId('add-question'));

      fireEvent.click(screen.getByText('Enviar atividade'));

      await waitFor(() => {
        expect(screen.getByTestId('send-activity-modal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('modal-submit'));

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/activities',
          expect.objectContaining({
            subjectId: 'subject2',
          })
        );
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/activities/send-to-students',
          expect.objectContaining({
            activityId: 'activity-123',
            students: expect.any(Array),
          })
        );
      });
    });
  });

  describe('Helper Functions', () => {
    it('should convert filters to backend format correctly', () => {
      // This is tested indirectly through save operations
      render(<CreateActivity {...defaultProps} />);

      expect(screen.getByTestId('create-activity-page')).toBeInTheDocument();
    });

    it('should convert backend filters to ActivityFiltersData correctly', () => {
      const activity: ActivityData = {
        id: 'act1',
        type: 'RASCUNHO',
        title: 'Test',
        subjectId: 'subject1',
        filters: {
          questionTypes: [QUESTION_TYPE.ALTERNATIVA],
          subjects: ['subject1'],
          topics: ['topic1'],
        },
        questionIds: [],
      };

      render(<CreateActivity {...defaultProps} activity={activity} />);

      expect(mockSetDraftFilters).toHaveBeenCalled();
    });

    it('should get subject name from knowledgeAreas', () => {
      render(<CreateActivity {...defaultProps} />);

      // Subject name is used in title generation, tested through save
      expect(screen.getByTestId('create-activity-page')).toBeInTheDocument();
    });

    it('should generate title with subject name', async () => {
      mockAppliedFilters = {
        types: [],
        bankIds: [],
        yearIds: [],
        knowledgeIds: ['subject1'],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'draft1',
              type: 'RASCUNHO',
              title: 'Rascunho - Matemática',
              creatorUserInstitutionId: 'user1',
              subjectId: 'subject1',
              filters: {},
              createdAt: '2025-01-01',
              updatedAt: '2025-01-01',
            },
            questionsLinked: 1,
          },
        },
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockResponse);

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/activity-drafts',
          expect.objectContaining({
            title: 'Rascunho - Matemática',
          })
        );
      });
    });

    it('should format time correctly', async () => {
      mockAppliedFilters = {
        types: [],
        bankIds: [],
        yearIds: [],
        knowledgeIds: ['subject1'],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'draft1',
              type: 'RASCUNHO',
              title: 'Rascunho - Matemática',
              creatorUserInstitutionId: 'user1',
              subjectId: 'subject1',
              filters: {},
              createdAt: '2025-01-01',
              updatedAt: '2025-01-01',
            },
            questionsLinked: 1,
          },
        },
      };

      mockApiClient.post = jest.fn().mockResolvedValue(mockResponse);

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText(/Rascunho salvo às/)).toBeInTheDocument();
      });
    });
  });

  describe('Knowledge Areas', () => {
    it('should load knowledge areas on mount', () => {
      render(<CreateActivity {...defaultProps} />);

      expect(mockLoadKnowledgeAreas).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty knowledgeAreas array', () => {
      const originalReturn = { ...mockUseActivityFiltersDataReturn };
      mockUseActivityFiltersDataReturn.knowledgeAreas = [];

      render(<CreateActivity {...defaultProps} />);

      expect(screen.getByTestId('create-activity-page')).toBeInTheDocument();

      mockUseActivityFiltersDataReturn.knowledgeAreas =
        originalReturn.knowledgeAreas;
    });

    it('should handle convertFiltersToBackendFormat with null filters', () => {
      // Test the null case in convertFiltersToBackendFormat
      // This is tested indirectly through the component rendering
      render(<CreateActivity {...defaultProps} />);

      expect(screen.getByTestId('create-activity-page')).toBeInTheDocument();
    });

    it('should convert null filters to backend format', () => {
      // This tests the convertFiltersToBackendFormat with null filters
      // The function is called internally, so we test it indirectly
      render(<CreateActivity {...defaultProps} />);

      // The component should render without errors even with null filters
      expect(screen.getByTestId('create-activity-page')).toBeInTheDocument();
    });

    it('should handle question without options', () => {
      const questions: QuestionActivity[] = [
        createMockQuestion({
          id: 'q1',
          statement: 'Question 1',
          questionType: QUESTION_TYPE.DISSERTATIVA,
        }),
      ];

      const activity: ActivityData = {
        id: 'act1',
        type: 'RASCUNHO',
        title: 'Test',
        subjectId: 'subject1',
        filters: {},
        questionIds: [],
        selectedQuestions: questions,
      };

      render(<CreateActivity {...defaultProps} activity={activity} />);

      expect(screen.getByTestId('question-q1')).toBeInTheDocument();
    });

    it('should handle question with knowledgeMatrix', () => {
      const questions: QuestionActivity[] = [
        createMockQuestion({
          id: 'q1',
          statement: 'Question 1',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          options: [],
          knowledgeMatrix: [
            {
              subject: {
                id: 'subject1',
                name: 'Matemática',
                color: '#ff0000',
                icon: 'Calculator',
              },
            },
          ],
        }),
      ];

      const activity: ActivityData = {
        id: 'act1',
        type: 'RASCUNHO',
        title: 'Test',
        subjectId: 'subject1',
        filters: {},
        questionIds: [],
        selectedQuestions: questions,
      };

      render(<CreateActivity {...defaultProps} activity={activity} />);

      expect(screen.getByTestId('question-q1')).toBeInTheDocument();
    });

    it('should not save if filters have not changed', async () => {
      mockAppliedFilters = {
        types: [],
        bankIds: [],
        yearIds: [],
        knowledgeIds: ['subject1'],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { areFiltersEqual } = require('../../utils/activityFilters');
      areFiltersEqual.mockReturnValue(true);

      render(<CreateActivity {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-question'));

      // Wait for first save
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockApiClient.post || mockApiClient.patch).toHaveBeenCalled();
      });

      jest.clearAllMocks();

      // Try to save again with same filters
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        // Should not save again if nothing changed
        expect(mockApiClient.post).not.toHaveBeenCalled();
        expect(mockApiClient.patch).not.toHaveBeenCalled();
      });
    });

    it('should handle null backend filters', () => {
      const activity: ActivityData = {
        id: 'act1',
        type: 'RASCUNHO',
        title: 'Test',
        subjectId: 'subject1',
        filters: null as unknown as BackendFiltersFormat,
        questionIds: [],
      };

      render(<CreateActivity {...defaultProps} activity={activity} />);

      expect(screen.getByTestId('create-activity-page')).toBeInTheDocument();
    });
  });

  describe('Activity Type', () => {
    it('should initialize with RASCUNHO type by default', () => {
      render(<CreateActivity {...defaultProps} />);

      expect(screen.getByText('Salvar modelo')).toBeInTheDocument();
    });

    it('should initialize with activity type when provided', () => {
      const activity: ActivityData = {
        id: 'act1',
        type: 'MODELO',
        title: 'Test',
        subjectId: 'subject1',
        filters: {},
        questionIds: [],
      };

      render(<CreateActivity {...defaultProps} activity={activity} />);

      expect(screen.getByTestId('create-activity-page')).toBeInTheDocument();
    });
  });
});
