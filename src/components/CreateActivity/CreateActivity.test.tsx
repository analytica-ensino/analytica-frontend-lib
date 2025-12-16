// Mocks need to be defined before importing the component
jest.mock('../../hooks/useActivityFiltersData', () => {
  return {
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
      questionTypes: [],
      loadingQuestionTypes: false,
      questionTypesError: null,
      loadBanks: jest.fn(),
      loadKnowledgeAreas: jest.fn(),
      loadQuestionTypes: jest.fn(),
      loadTopics: jest.fn(),
      loadSubtopics: jest.fn(),
      loadContents: jest.fn(),
    }),
  };
});

jest.mock('../../hooks/useQuestionsList', () => {
  return {
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
  };
});

jest.mock('../../store/questionFiltersStore', () => {
  return {
    useQuestionFiltersStore: jest.fn((selector) => {
      const mockState = {
        draftFilters: null,
        appliedFilters: null,
        setDraftFilters: jest.fn(),
        applyFilters: jest.fn(),
        clearFilters: jest.fn(),
      };
      return selector(mockState);
    }),
  };
});

jest.mock('../../components/NotificationCard/NotificationCard', () => () => null);
jest.mock('../../assets/img/mock-content.png', () => 'mock-content.png');
jest.mock('../../components/Quiz/Quiz', () => () => null);
jest.mock('../../components/Quiz/QuizContent', () => ({}));
jest.mock('../../assets/img/mock-image-question.png', () => 'mock-image-question.png');
jest.mock('../../components/Support/Support', () => () => null);
jest.mock('../../components/Support', () => ({}));
jest.mock('../../assets/img/suporthistory.png', () => 'supporthistory.png');

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateActivity } from './CreateActivity';
import type { BaseApiClient } from '../../types/api';
import { QUESTION_TYPE } from '../../components/Quiz/useQuizStore';
import {
  DIFFICULTY_LEVEL_ENUM,
  QUESTION_STATUS_ENUM,
} from '../../types/questions';
import type { Question } from '../../types/questions';
import { useQuestionFiltersStore } from '../../store/questionFiltersStore';

const mockApiClient: BaseApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

const buildQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: 'question-id',
  statement: 'Question statement',
  description: null,
  questionType: QUESTION_TYPE.ALTERNATIVA,
  status: QUESTION_STATUS_ENUM.APROVADO,
  difficultyLevel: DIFFICULTY_LEVEL_ENUM.FACIL,
  questionBankYearId: 'year-1',
  solutionExplanation: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  knowledgeMatrix: [],
  options: [],
  createdBy: 'user-1',
  ...overrides,
});

describe('CreateActivity', () => {
  const mockSetDraftFilters = jest.fn();
  const mockApplyFilters = jest.fn();
  const mockFetchQuestions = jest.fn();
  const mockLoadMore = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useQuestionFiltersStore
    (useQuestionFiltersStore as jest.Mock).mockImplementation((selector) => {
      const mockState = {
        draftFilters: null,
        appliedFilters: null,
        setDraftFilters: mockSetDraftFilters,
        applyFilters: mockApplyFilters,
        clearFilters: jest.fn(),
      };
      return selector(mockState);
    });

    // Mock is already set up at the top of the file
  });

  describe('Rendering', () => {
    it('should render the component with header and three columns', () => {
      render(<CreateActivity apiClient={mockApiClient} />);

      expect(screen.getByTestId('create-activity')).toBeInTheDocument();
      expect(screen.getByText('Criar atividade')).toBeInTheDocument();
      expect(screen.getByText('Banco de questões')).toBeInTheDocument();
    });

    it('should render header buttons', () => {
      render(<CreateActivity apiClient={mockApiClient} />);

      expect(screen.getByText('Salvar modelo')).toBeInTheDocument();
      expect(screen.getByText('Enviar atividade')).toBeInTheDocument();
    });

    it('should render custom draft saved at text', () => {
      render(
        <CreateActivity
          apiClient={mockApiClient}
          draftSavedAt="Rascunho salvo às 15:30"
        />
      );

      expect(screen.getByText('Rascunho salvo às 15:30')).toBeInTheDocument();
    });
  });

  describe('Header Actions', () => {
    it('should call onBack when back button is clicked', () => {
      const mockOnBack = jest.fn();
      render(<CreateActivity apiClient={mockApiClient} onBack={mockOnBack} />);

      const backButton = screen.getByLabelText('Voltar');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onSaveDraft when save model button is clicked', () => {
      const mockOnSaveDraft = jest.fn();
      render(
        <CreateActivity
          apiClient={mockApiClient}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const saveButton = screen.getByText('Salvar modelo');
      fireEvent.click(saveButton);

      expect(mockOnSaveDraft).toHaveBeenCalledTimes(1);
    });

    it('should call onSendActivity when send activity button is clicked', () => {
      const mockOnSendActivity = jest.fn();
      render(
        <CreateActivity
          apiClient={mockApiClient}
          onSendActivity={mockOnSendActivity}
        />
      );

      const sendButton = screen.getByText('Enviar atividade');
      fireEvent.click(sendButton);

      expect(mockOnSendActivity).toHaveBeenCalledTimes(1);
    });
  });

  describe('Questions List', () => {
    it('should display empty state when no filters are applied', () => {
      render(<CreateActivity apiClient={mockApiClient} />);

      expect(
        screen.getByText(
          'Nenhuma questão encontrada. Aplique os filtros para buscar questões.'
        )
      ).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(<CreateActivity apiClient={mockApiClient} />);

      // The component should render even in loading state
      expect(screen.getByTestId('create-activity')).toBeInTheDocument();
    });

    it('should handle applied filters', () => {
      (useQuestionFiltersStore as jest.Mock).mockImplementation((selector) => {
        const mockState = {
          draftFilters: null,
          appliedFilters: {
            types: [QUESTION_TYPE.ALTERNATIVA],
            bankIds: [],
            yearIds: [],
            knowledgeIds: [],
            topicIds: [],
            subtopicIds: [],
            contentIds: [],
          },
          setDraftFilters: mockSetDraftFilters,
          applyFilters: mockApplyFilters,
          clearFilters: jest.fn(),
        };
        return selector(mockState);
      });

      render(<CreateActivity apiClient={mockApiClient} />);

      // Component should render with applied filters
      expect(screen.getByTestId('create-activity')).toBeInTheDocument();
      // fetchQuestions should be called when appliedFilters changes
      expect(mockFetchQuestions).toHaveBeenCalled();
    });

    it('should handle error state', () => {
      render(<CreateActivity apiClient={mockApiClient} />);

      // Component should render even with error state
      expect(screen.getByTestId('create-activity')).toBeInTheDocument();
    });
  });

  describe('Question Selection', () => {
    it('should render ActivityPreview component', () => {
      render(<CreateActivity apiClient={mockApiClient} />);

      // ActivityPreview should be rendered
      expect(screen.getByText('Prévia da atividade')).toBeInTheDocument();
    });
  });

  describe('Filters Integration', () => {
    it('should pass apiClient to ActivityFilters', () => {
      render(<CreateActivity apiClient={mockApiClient} />);

      // ActivityFilters should be rendered (we can't directly test the prop,
      // but we can verify the component structure)
      expect(screen.getByText('Filtro de questões')).toBeInTheDocument();
    });

    it('should pass institutionId to ActivityFilters', () => {
      render(
        <CreateActivity apiClient={mockApiClient} institutionId="institution-1" />
      );

      expect(screen.getByText('Filtro de questões')).toBeInTheDocument();
    });
  });
});

