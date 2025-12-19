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
import { ActivityFilters } from './ActivityFilters';
import { QUESTION_TYPE } from '../../components/Quiz/useQuizStore';

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
      knowledgeIds: [],
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
      knowledgeIds: ['subject1'],
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
          knowledgeIds: ['subject1'],
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
        knowledgeIds: [],
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
        knowledgeIds: [],
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
        knowledgeIds: [],
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
        knowledgeIds: [],
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
        knowledgeIds: [],
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
        knowledgeIds: [],
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
        knowledgeIds: [],
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
        knowledgeIds: [],
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
        knowledgeIds: [],
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
        knowledgeIds: [],
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
        knowledgeIds: [],
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
});
