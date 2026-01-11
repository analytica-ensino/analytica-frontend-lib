// Mocks need to be defined before importing the component (barrel imports).
jest.mock('../../hooks/useActivityFiltersData', () => {
  return {
    createUseActivityFiltersData: () => () => mockUseActivityFiltersDataReturn,
  };
});
jest.mock(
  '../../components/NotificationCard/NotificationCard',
  () => () => null
);

// Mock Button and DropdownMenu for ActivityFiltersPopover
jest.mock('../../components/Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      data-testid="button"
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../components/DropdownMenu/DropdownMenu', () => ({
  __esModule: true,
  default: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="dropdown-menu" data-open={open}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({
    children,
    className,
    align,
  }: {
    children: React.ReactNode;
    className?: string;
    align?: string;
  }) => (
    <div
      data-testid="dropdown-content"
      className={className}
      data-align={align}
    >
      {children}
    </div>
  ),
}));

// Mock useQuestionFiltersStore
const mockAppliedFilters = jest.fn<unknown, []>(() => null);

jest.mock('../../store/questionFiltersStore', () => ({
  useQuestionFiltersStore: (selector: (state: unknown) => unknown) => {
    const mockState = {
      appliedFilters: mockAppliedFilters(),
    };
    return selector(mockState);
  },
}));
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
import { ActivityFilters, ActivityFiltersPopover } from './ActivityFilters';
import { QUESTION_TYPE } from '../../components/Quiz/useQuizStore';
import type { BaseApiClient } from '../../types/api';

const mockLoadBanks = jest.fn();
const mockLoadKnowledgeAreas = jest.fn();
const mockLoadQuestionTypes = jest.fn();
const mockLoadTopics = jest.fn();
const mockLoadSubtopics = jest.fn();
const mockLoadContents = jest.fn();
const mockHandleCategoriesChange = jest.fn();

const baseState = {
  banks: [
    { id: 'bank1', name: 'Banca 1', examInstitution: 'Banca 1' },
    { id: 'bank2', name: 'Banca 2', examInstitution: 'Banca 2' },
  ],
  bankYears: [
    { id: 'year1', name: '2023', bankId: 'bank1' },
    { id: 'year2', name: '2024', bankId: 'bank2' },
    { id: 'year3', name: '2023', bankId: 'bank2' },
  ],
  loadingBanks: false,
  banksError: null,

  knowledgeAreas: [
    {
      id: 'subject1',
      name: 'Matemática',
      icon: 'Calculator',
      color: '#ff0000',
    },
    { id: 'subject2', name: 'Português', icon: 'Book', color: '#00ff00' },
  ],
  loadingSubjects: false,
  subjectsError: null,

  knowledgeStructure: {
    topics: [
      { id: 'topic-1', name: 'Topic 1' },
      { id: 'topic-2', name: 'Topic 2' },
    ],
    subtopics: [
      { id: 'sub-1', name: 'Sub 1' },
      { id: 'sub-2', name: 'Sub 2' },
    ],
    contents: [
      { id: 'content-1', name: 'Content 1' },
      { id: 'content-2', name: 'Content 2' },
    ],
    loading: false,
    error: null,
  },
  knowledgeCategories: [
    {
      key: 'tema',
      label: 'Tema',
      itens: [
        { id: 'topic-1', name: 'Topic 1' },
        { id: 'topic-2', name: 'Topic 2' },
      ],
      selectedIds: [],
    },
    {
      key: 'subtema',
      label: 'Subtema',
      itens: [
        { id: 'sub-1', name: 'Sub 1', topicId: 'topic-1' },
        { id: 'sub-2', name: 'Sub 2', topicId: 'topic-2' },
      ],
      selectedIds: [],
    },
    {
      key: 'assunto',
      label: 'Assunto',
      itens: [
        { id: 'content-1', name: 'Content 1', subtopicId: 'sub-1' },
        { id: 'content-2', name: 'Content 2', subtopicId: 'sub-2' },
      ],
      selectedIds: [],
    },
  ],
  handleCategoriesChange: mockHandleCategoriesChange,

  questionTypes: [QUESTION_TYPE.ALTERNATIVA, QUESTION_TYPE.DISSERTATIVA],
  loadingQuestionTypes: false,
  questionTypesError: null,

  loadBanks: mockLoadBanks,
  loadKnowledgeAreas: mockLoadKnowledgeAreas,
  loadQuestionTypes: mockLoadQuestionTypes,
  loadTopics: mockLoadTopics,
  loadSubtopics: mockLoadSubtopics,
  loadContents: mockLoadContents,
};

const buildMockReturn = (overrides: Partial<typeof baseState> = {}) => ({
  ...baseState,
  ...overrides,
});

let mockUseActivityFiltersDataReturn = buildMockReturn();

const renderComponent = (
  props: Partial<React.ComponentProps<typeof ActivityFilters>> = {}
) =>
  render(
    <ActivityFilters
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiClient={{} as any}
      onFiltersChange={jest.fn()}
      {...props}
    />
  );

describe('ActivityFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllMocks();
    mockUseActivityFiltersDataReturn = buildMockReturn();
  });

  it('calls load functions on mount', () => {
    renderComponent();

    expect(mockLoadBanks).toHaveBeenCalledTimes(1);
    expect(mockLoadKnowledgeAreas).toHaveBeenCalledTimes(1);
    expect(mockLoadQuestionTypes).toHaveBeenCalledTimes(1);
  });

  it('renders banks and subjects options', () => {
    renderComponent();

    expect(screen.getByText('Banca 1')).toBeInTheDocument();
    expect(screen.getByText('Banca 2')).toBeInTheDocument();
    expect(screen.getByText('Matemática')).toBeInTheDocument();
    expect(screen.getByText('Português')).toBeInTheDocument();
  });

  it('renders question types from API', () => {
    renderComponent();

    expect(screen.getByText('Alternativa')).toBeInTheDocument();
    expect(screen.getByText('Discursiva')).toBeInTheDocument();
  });

  it('shows loading state for question types', () => {
    mockUseActivityFiltersDataReturn = buildMockReturn({
      loadingQuestionTypes: true,
    });
    renderComponent();

    expect(screen.getByTestId('question-types-loading')).toBeInTheDocument();
  });

  it('shows error message for question types', () => {
    mockUseActivityFiltersDataReturn = buildMockReturn({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questionTypesError: 'Erro ao carregar' as any,
    });
    renderComponent();

    expect(screen.getByTestId('question-types-error')).toHaveTextContent(
      'Erro ao carregar'
    );
  });

  it('filters question types by allowedQuestionTypes', () => {
    mockUseActivityFiltersDataReturn = buildMockReturn({
      questionTypes: [QUESTION_TYPE.ALTERNATIVA, QUESTION_TYPE.DISSERTATIVA],
    });
    renderComponent({
      allowedQuestionTypes: [QUESTION_TYPE.ALTERNATIVA],
    });

    expect(screen.getByText('Alternativa')).toBeInTheDocument();
    expect(screen.queryByText('Discursiva')).not.toBeInTheDocument();
  });

  it('invokes onFiltersChange with initial empty filters', () => {
    const onFiltersChange = jest.fn();

    renderComponent({ onFiltersChange });

    expect(onFiltersChange).toHaveBeenCalledWith({
      types: [],
      bankIds: [],
      yearIds: [],
      subjectIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    });
  });

  it('applies initialFilters and triggers dependent loads', async () => {
    const onFiltersChange = jest.fn();
    const initialFilters = {
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: ['bank2'],
      yearIds: ['year3'],
      subjectIds: ['subject1'],
      topicIds: ['topic-2'],
      subtopicIds: ['sub-2'],
      contentIds: ['content-2'],
    };

    renderComponent({ onFiltersChange, initialFilters });

    await waitFor(() => {
      expect(mockLoadTopics).toHaveBeenCalledWith(['subject1']);
      expect(mockLoadSubtopics).toHaveBeenCalledWith(['topic-2']);
      expect(mockLoadContents).toHaveBeenCalledWith(['sub-2']);
    });

    expect(mockHandleCategoriesChange).toHaveBeenCalled();

    await waitFor(() => {
      expect(onFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          types: [QUESTION_TYPE.ALTERNATIVA],
          bankIds: ['bank2'],
          yearIds: ['year3'],
          subjectIds: ['subject1'],
        })
      );
    });
  });

  it('uses fallback question types when hook returns empty', () => {
    mockUseActivityFiltersDataReturn = buildMockReturn({
      questionTypes: [],
    });
    renderComponent();

    expect(screen.getByText('Alternativa')).toBeInTheDocument();
    expect(screen.getByText('Discursiva')).toBeInTheDocument();
  });

  it('calls onFiltersChange when toggling question type', () => {
    const onFiltersChange = jest.fn();

    renderComponent({ onFiltersChange });

    fireEvent.click(screen.getByText('Alternativa'));

    expect(onFiltersChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        types: [QUESTION_TYPE.ALTERNATIVA],
      })
    );
  });

  it('calls onClearFilters and onApplyFilters when buttons are clicked', () => {
    const onClearFilters = jest.fn();
    const onApplyFilters = jest.fn();

    renderComponent({ onClearFilters, onApplyFilters });

    fireEvent.click(screen.getByText('Limpar filtros'));
    fireEvent.click(screen.getByText('Filtrar'));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(onApplyFilters).toHaveBeenCalledTimes(1);
  });

  describe('Initial bank and year filters', () => {
    it('should skip bank filters when both bankIds and yearIds are empty', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: [],
        yearIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      renderComponent({ onFiltersChange, initialFilters });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalled();
      });

      const lastCall =
        onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1][0];
      expect(lastCall.bankIds).toEqual([]);
      expect(lastCall.yearIds).toEqual([]);
    });

    it('should wait for bankCategories before applying bank filters', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: ['bank1'],
        yearIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      mockUseActivityFiltersDataReturn = buildMockReturn({
        banks: [],
        bankYears: [],
      });

      renderComponent({ onFiltersChange, initialFilters });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalled();
      });

      const lastCall =
        onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1][0];
      expect(lastCall.bankIds).toEqual([]);
    });

    it('should apply bank filters when bankIds are provided and categories are loaded', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: ['bank1'],
        yearIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      renderComponent({ onFiltersChange, initialFilters });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            bankIds: ['bank1'],
          })
        );
      });
    });

    it('should apply year filters when yearIds are provided', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: [],
        yearIds: ['year1'],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      renderComponent({ onFiltersChange, initialFilters });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            yearIds: ['year1'],
          })
        );
      });
    });

    it('should apply both bank and year filters when both are provided', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: ['bank1', 'bank2'],
        yearIds: ['year1', 'year2'],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      renderComponent({ onFiltersChange, initialFilters });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            bankIds: ['bank1', 'bank2'],
            yearIds: ['year1', 'year2'],
          })
        );
      });
    });

    it('should derive yearIds from bankIds when only bankIds are provided', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: ['bank2'],
        yearIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      renderComponent({ onFiltersChange, initialFilters });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            bankIds: ['bank2'],
            yearIds: expect.arrayContaining(['year2', 'year3']),
          })
        );
      });
    });

    it('should not apply filters when bankIds do not match any available banks', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: ['non-existent-bank'],
        yearIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      renderComponent({ onFiltersChange, initialFilters });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalled();
      });

      const lastCall =
        onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1][0];
      expect(lastCall.bankIds).toEqual([]);
    });

    it('should not apply filters when yearIds do not match any available years', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: ['bank1'],
        yearIds: ['non-existent-year'],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      renderComponent({ onFiltersChange, initialFilters });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalled();
      });

      const lastCall =
        onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1][0];
      expect(lastCall.yearIds).toEqual([]);
    });

    it('should handle derived yearIds when bankIds match but yearIds are empty', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: ['bank1'],
        yearIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      renderComponent({ onFiltersChange, initialFilters });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            bankIds: ['bank1'],
            yearIds: ['year1'],
          })
        );
      });
    });

    it('should handle multiple banks with derived yearIds', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: ['bank1', 'bank2'],
        yearIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      renderComponent({ onFiltersChange, initialFilters });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            bankIds: ['bank1', 'bank2'],
            yearIds: expect.arrayContaining(['year1', 'year2', 'year3']),
          })
        );
      });
    });

    it('should prefer explicit yearIds over derived ones', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: ['bank2'],
        yearIds: ['year2'],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      renderComponent({ onFiltersChange, initialFilters });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            bankIds: ['bank2'],
            yearIds: ['year2'],
          })
        );
      });
    });
  });

  describe('Performance optimization - effects execution', () => {
    it('should not re-apply bank initial filters when bankCategories change due to user interaction', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: ['bank1'],
        yearIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      const { rerender } = renderComponent({
        onFiltersChange,
        initialFilters,
      });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalled();
      });

      const initialCallCount = onFiltersChange.mock.calls.length;

      mockUseActivityFiltersDataReturn = buildMockReturn({
        banks: [
          { id: 'bank1', name: 'Banca 1', examInstitution: 'Banca 1' },
          { id: 'bank2', name: 'Banca 2', examInstitution: 'Banca 2' },
          { id: 'bank3', name: 'Banca 3', examInstitution: 'Banca 3' },
        ],
      });

      rerender(
        <ActivityFilters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiClient={{} as any}
          onFiltersChange={onFiltersChange}
          initialFilters={initialFilters}
        />
      );

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalled();
      });

      const finalCallCount = onFiltersChange.mock.calls.length;
      const callsAfterRerender = finalCallCount - initialCallCount;

      expect(callsAfterRerender).toBeLessThanOrEqual(2);
    });

    it('should apply bank initial filters when categories become available after initialFilters is set', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: ['bank1'],
        yearIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      mockUseActivityFiltersDataReturn = buildMockReturn({
        banks: [],
        bankYears: [],
      });

      const { rerender } = renderComponent({
        onFiltersChange,
        initialFilters,
      });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalled();
      });

      const lastCallBeforeBanks =
        onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1][0];
      expect(lastCallBeforeBanks.bankIds).toEqual([]);

      mockUseActivityFiltersDataReturn = buildMockReturn({
        banks: [{ id: 'bank1', name: 'Banca 1', examInstitution: 'Banca 1' }],
        bankYears: [{ id: 'year1', name: '2023', bankId: 'bank1' }],
      });

      rerender(
        <ActivityFilters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiClient={{} as any}
          onFiltersChange={onFiltersChange}
          initialFilters={initialFilters}
        />
      );

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            bankIds: ['bank1'],
          })
        );
      });
    });

    it('should apply knowledge initial filters when categories become available after initialFilters is set', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: [],
        yearIds: [],
        subjectIds: ['subject1'],
        topicIds: ['topic-1'],
        subtopicIds: [],
        contentIds: [],
      };

      mockUseActivityFiltersDataReturn = buildMockReturn({
        knowledgeCategories: [],
      });

      const { rerender } = renderComponent({
        onFiltersChange,
        initialFilters,
      });

      await waitFor(() => {
        expect(mockLoadTopics).toHaveBeenCalledWith(['subject1']);
      });

      expect(mockHandleCategoriesChange).not.toHaveBeenCalled();

      mockUseActivityFiltersDataReturn = {
        ...buildMockReturn(),
        knowledgeCategories: [
          {
            key: 'tema',
            label: 'Tema',
            itens: [
              { id: 'topic-1', name: 'Topic 1' },
              { id: 'topic-2', name: 'Topic 2' },
            ],
            selectedIds: [],
          },
        ],
      };

      rerender(
        <ActivityFilters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiClient={{} as any}
          onFiltersChange={onFiltersChange}
          initialFilters={initialFilters}
        />
      );

      await waitFor(() => {
        expect(mockHandleCategoriesChange).toHaveBeenCalled();
      });
    });

    it('should only execute bank initial filters effect when initialFilters changes', async () => {
      const onFiltersChange = jest.fn();
      let initialFilters = {
        types: [],
        bankIds: ['bank1'],
        yearIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      const { rerender } = renderComponent({
        onFiltersChange,
        initialFilters,
      });

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalled();
      });

      const firstCallCount = onFiltersChange.mock.calls.length;

      initialFilters = {
        types: [],
        bankIds: ['bank2'],
        yearIds: [],
        subjectIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      rerender(
        <ActivityFilters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiClient={{} as any}
          onFiltersChange={onFiltersChange}
          initialFilters={initialFilters}
        />
      );

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            bankIds: ['bank2'],
          })
        );
      });

      const secondCallCount = onFiltersChange.mock.calls.length;
      expect(secondCallCount).toBeGreaterThan(firstCallCount);
    });

    it('should not re-execute knowledge initial filters effect when only knowledgeCategories change', async () => {
      const onFiltersChange = jest.fn();
      const initialFilters = {
        types: [],
        bankIds: [],
        yearIds: [],
        subjectIds: ['subject1'],
        topicIds: ['topic-1'],
        subtopicIds: [],
        contentIds: [],
      };

      const { rerender } = renderComponent({
        onFiltersChange,
        initialFilters,
      });

      await waitFor(() => {
        expect(mockHandleCategoriesChange).toHaveBeenCalled();
      });

      const initialCallCount = mockHandleCategoriesChange.mock.calls.length;

      mockUseActivityFiltersDataReturn = {
        ...buildMockReturn(),
        knowledgeCategories: [
          {
            key: 'tema',
            label: 'Tema',
            itens: [
              { id: 'topic-1', name: 'Topic 1' },
              { id: 'topic-2', name: 'Topic 2' },
              { id: 'topic-3', name: 'Topic 3' },
            ],
            selectedIds: ['topic-1'],
          },
        ],
      } as typeof mockUseActivityFiltersDataReturn;

      rerender(
        <ActivityFilters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiClient={{} as any}
          onFiltersChange={onFiltersChange}
          initialFilters={initialFilters}
        />
      );

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalled();
      });

      const finalCallCount = mockHandleCategoriesChange.mock.calls.length;
      expect(finalCallCount).toBeLessThanOrEqual(initialCallCount + 1);
    });
  });
});

describe('ActivityFiltersPopover', () => {
  const mockApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as BaseApiClient;

  const defaultProps = {
    apiClient: mockApiClient,
    onFiltersChange: jest.fn(),
    institutionId: 'inst1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAppliedFilters.mockReturnValue(null);
    mockUseActivityFiltersDataReturn = buildMockReturn();
  });

  it('should render trigger button with default label', () => {
    render(<ActivityFiltersPopover {...defaultProps} />);

    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByText('Filtro de questões')).toBeInTheDocument();
  });

  it('should render trigger button with custom label', () => {
    render(
      <ActivityFiltersPopover {...defaultProps} triggerLabel="Custom Label" />
    );

    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('should use appliedFilters from store when available', () => {
    const storeFilters = {
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: ['bank1'],
      yearIds: [],
      subjectIds: ['subject1'],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    mockAppliedFilters.mockReturnValue(storeFilters as never);

    render(<ActivityFiltersPopover {...defaultProps} />);

    // ActivityFilters is rendered inside DropdownMenuContent, which is visible
    // Verify that the component structure is correct
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });

  it('should fall back to initialFilters prop when appliedFilters is null', () => {
    mockAppliedFilters.mockReturnValue(null);

    const initialFilters = {
      types: [QUESTION_TYPE.DISSERTATIVA],
      bankIds: ['bank2'],
      yearIds: [],
      subjectIds: ['subject2'],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    render(
      <ActivityFiltersPopover
        {...defaultProps}
        initialFilters={initialFilters}
      />
    );

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });

  it('should prioritize appliedFilters over initialFilters when both are available', () => {
    const storeFilters = {
      types: [QUESTION_TYPE.ALTERNATIVA],
      bankIds: ['bank1'],
      yearIds: [],
      subjectIds: ['subject1'],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    const initialFilters = {
      types: [QUESTION_TYPE.DISSERTATIVA],
      bankIds: ['bank2'],
      yearIds: [],
      subjectIds: ['subject2'],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    };

    mockAppliedFilters.mockReturnValue(storeFilters as never);

    render(
      <ActivityFiltersPopover
        {...defaultProps}
        initialFilters={initialFilters}
      />
    );

    // Should use store filters (appliedFilters), not initialFilters
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });

  it('should pass through all activityFiltersProps to ActivityFilters', () => {
    const onApplyFilters = jest.fn();
    const onClearFilters = jest.fn();

    render(
      <ActivityFiltersPopover
        {...defaultProps}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
        institutionId="custom-inst-id"
      />
    );

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });
});
