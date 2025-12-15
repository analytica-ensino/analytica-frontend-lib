import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActivityBuilder } from './ActivityBuilder';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { useQuestionFiltersStore } from '../../store/questionFiltersStore';

// Mock dependencies
jest.mock('../ActivityFilters/ActivityFilters', () => ({
  ActivityFilters: ({
    onFiltersChange,
  }: {
    onFiltersChange: (filters: any) => void;
  }) => (
    <div data-testid="activity-filters">
      <button
        onClick={() =>
          onFiltersChange({
            types: [QUESTION_TYPE.ALTERNATIVA],
            bankIds: [],
            yearIds: [],
            knowledgeIds: [],
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

jest.mock('./ActivityQuestionsList', () => ({
  ActivityQuestionsList: ({
    onAddQuestion,
  }: {
    onAddQuestion?: (question: any) => void;
  }) => (
    <div data-testid="activity-questions-list">
      <button
        onClick={() =>
          onAddQuestion?.({
            id: 'question-1',
            statement: 'Test question',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            options: [
              { id: 'opt-1', option: 'Option 1' },
              { id: 'opt-2', option: 'Option 2' },
            ],
            knowledgeMatrix: [
              {
                subject: {
                  id: 'subj-1',
                  name: 'Mathematics',
                  color: '#ff0000',
                  icon: 'Calculator',
                },
              },
            ],
          })
        }
      >
        Add Question
      </button>
    </div>
  ),
}));

jest.mock('../ActivityPreview/ActivityPreview', () => ({
  ActivityPreview: ({
    questions,
    onRemoveAll,
    onRemoveQuestion,
  }: {
    questions: any[];
    onRemoveAll?: () => void;
    onRemoveQuestion?: (id: string) => void;
  }) => (
    <div data-testid="activity-preview">
      <div data-testid="questions-count">{questions.length}</div>
      {onRemoveAll && (
        <button onClick={onRemoveAll} data-testid="remove-all">
          Remove All
        </button>
      )}
    </div>
  ),
}));

jest.mock('../../hooks/useQuestionsList', () => ({
  createUseQuestionsList: () => () => ({
    questions: [],
    pagination: null,
    loading: false,
    loadingMore: false,
    error: null,
    fetchQuestions: jest.fn(),
    loadMore: jest.fn(),
    reset: jest.fn(),
  }),
}));

jest.mock('../../hooks/useActivityFiltersData', () => ({
  createUseActivityFiltersData: () => () => ({
    banks: [],
    bankYears: [],
    loadingBanks: false,
    banksError: null,
    knowledgeAreas: [],
    loadingSubjects: false,
    subjectsError: null,
    knowledgeStructure: {
      topics: [],
      subtopics: [],
      contents: [],
      loading: false,
      error: null,
    },
    knowledgeCategories: [],
    handleCategoriesChange: jest.fn(),
    loadBanks: jest.fn(),
    loadKnowledgeAreas: jest.fn(),
    loadQuestionTypes: jest.fn(),
    questionTypes: [],
    loadingQuestionTypes: false,
    questionTypesError: null,
  }),
}));

jest.mock('../../utils/activityFiltersConverter', () => ({
  convertActivityFiltersToQuestionsFilter: (filters: any) => filters,
}));

const mockApiClient = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
} as any;

describe('ActivityBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuestionFiltersStore.setState({
      draftFilters: null,
      appliedFilters: null,
    });
  });

  it('should render all three columns', () => {
    render(<ActivityBuilder apiClient={mockApiClient} />);

    expect(screen.getByTestId('activity-filters')).toBeInTheDocument();
    expect(screen.getByTestId('activity-questions-list')).toBeInTheDocument();
    expect(screen.getByTestId('activity-preview')).toBeInTheDocument();
  });

  it('should render filter button', () => {
    render(<ActivityBuilder apiClient={mockApiClient} />);

    const filterButton = screen.getByText('Filtrar');
    expect(filterButton).toBeInTheDocument();
  });

  it('should disable filter button when no draft filters', () => {
    render(<ActivityBuilder apiClient={mockApiClient} />);

    const filterButton = screen.getByText('Filtrar');
    expect(filterButton).toBeDisabled();
  });

  it('should enable filter button when draft filters exist', () => {
    useQuestionFiltersStore.setState({
      draftFilters: {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        yearIds: [],
        knowledgeIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      },
    });

    render(<ActivityBuilder apiClient={mockApiClient} />);

    const filterButton = screen.getByText('Filtrar');
    expect(filterButton).not.toBeDisabled();
  });

  it('should apply filters when filter button is clicked', () => {
    const applyFilters = useQuestionFiltersStore.getState().applyFilters;
    const spyApplyFilters = jest.spyOn(
      useQuestionFiltersStore.getState(),
      'applyFilters'
    );

    useQuestionFiltersStore.setState({
      draftFilters: {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: [],
        yearIds: [],
        knowledgeIds: [],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      },
    });

    render(<ActivityBuilder apiClient={mockApiClient} />);

    const filterButton = screen.getByText('Filtrar');
    fireEvent.click(filterButton);

    expect(spyApplyFilters).toHaveBeenCalled();
  });

  it('should add question to preview when onAddQuestion is called', () => {
    render(<ActivityBuilder apiClient={mockApiClient} />);

    const addButton = screen.getByText('Add Question');
    fireEvent.click(addButton);

    waitFor(() => {
      const questionsCount = screen.getByTestId('questions-count');
      expect(questionsCount).toHaveTextContent('1');
    });
  });

  it('should remove all questions when onRemoveAll is called', () => {
    render(<ActivityBuilder apiClient={mockApiClient} />);

    // Add a question first
    const addButton = screen.getByText('Add Question');
    fireEvent.click(addButton);

    waitFor(() => {
      const removeAllButton = screen.getByTestId('remove-all');
      fireEvent.click(removeAllButton);

      const questionsCount = screen.getByTestId('questions-count');
      expect(questionsCount).toHaveTextContent('0');
    });
  });

  it('should call onQuestionsChange when questions are added', () => {
    const onQuestionsChange = jest.fn();
    render(
      <ActivityBuilder
        apiClient={mockApiClient}
        onQuestionsChange={onQuestionsChange}
      />
    );

    const addButton = screen.getByText('Add Question');
    fireEvent.click(addButton);

    waitFor(() => {
      expect(onQuestionsChange).toHaveBeenCalled();
    });
  });

  it('should initialize with initialQuestions', () => {
    const initialQuestions = [
      {
        id: 'initial-1',
        subjectName: 'Math',
        subjectColor: '#ff0000',
        iconName: 'Calculator',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        enunciado: 'Initial question',
      },
    ];

    render(
      <ActivityBuilder
        apiClient={mockApiClient}
        initialQuestions={initialQuestions}
      />
    );

    waitFor(() => {
      const questionsCount = screen.getByTestId('questions-count');
      expect(questionsCount).toHaveTextContent('1');
    });
  });

  it('should pass institutionId to ActivityFilters', () => {
    render(
      <ActivityBuilder apiClient={mockApiClient} institutionId="inst-123" />
    );

    expect(screen.getByTestId('activity-filters')).toBeInTheDocument();
  });

  it('should pass allowedQuestionTypes to ActivityFilters', () => {
    render(
      <ActivityBuilder
        apiClient={mockApiClient}
        allowedQuestionTypes={[QUESTION_TYPE.ALTERNATIVA]}
      />
    );

    expect(screen.getByTestId('activity-filters')).toBeInTheDocument();
  });
});



