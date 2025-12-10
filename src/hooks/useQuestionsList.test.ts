import { renderHook, act, waitFor } from '@testing-library/react';
import { createUseQuestionsList } from './useQuestionsList';
import type { BaseApiClient } from '../types/api';
import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';
import type {
  QuestionsListResponse,
  Question,
  Pagination,
} from '../types/questions';
import {
  DIFFICULTY_LEVEL_ENUM,
  QUESTION_STATUS_ENUM,
} from '../types/questions';

describe('useQuestionsList', () => {
  const mockApiClient: BaseApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const useQuestionsList = createUseQuestionsList(mockApiClient);

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state with empty data', () => {
      const { result } = renderHook(() => useQuestionsList());

      expect(result.current).toMatchObject({
        questions: [],
        pagination: null,
        loading: false,
        loadingMore: false,
        error: null,
        currentFilters: null,
      });

      expect(result.current.fetchQuestions).toBeInstanceOf(Function);
      expect(result.current.loadMore).toBeInstanceOf(Function);
      expect(result.current.reset).toBeInstanceOf(Function);
    });
  });

  describe('fetchQuestions', () => {
    it('should fetch questions successfully', async () => {
      const mockQuestions: Question[] = [
        buildQuestion({
          id: 'question-1',
          statement: 'What is 2 + 2?',
          questionType: QUESTION_TYPE.ALTERNATIVA,
        }),
        buildQuestion({
          id: 'question-2',
          statement: 'What is the capital of Brazil?',
          questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        }),
      ];

      const mockPagination: Pagination = {
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

      const mockResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: mockQuestions,
          pagination: mockPagination,
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
      });

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.questions).toEqual(mockQuestions);
      expect(result.current.pagination).toEqual(mockPagination);
      expect(result.current.error).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.loadingMore).toBe(false);
      expect(mockApiClient.post).toHaveBeenCalledWith('/questions/list', {});
    });

    it('should fetch questions with filters', async () => {
      const mockQuestions: Question[] = [
        buildQuestion({
          id: 'question-1',
          statement: 'Test question',
          questionType: QUESTION_TYPE.ALTERNATIVA,
        }),
      ];

      const mockPagination: Pagination = {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

      const mockResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: mockQuestions,
          pagination: mockPagination,
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
      });

      const filters = {
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: ['bank-1'],
        page: 1,
        pageSize: 10,
      };

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions(filters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.questions).toEqual(mockQuestions);
      expect(result.current.currentFilters).toEqual(filters);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/questions/list',
        filters
      );
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (mockApiClient.post as jest.Mock).mockReturnValueOnce(promise);

      const { result } = renderHook(() => useQuestionsList());

      act(() => {
        result.current.fetchQuestions();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.questions).toEqual([]);

      const mockResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          },
        },
      };

      await act(async () => {
        resolvePromise!({ data: mockResponse });
        await promise;
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should append questions when append is true', async () => {
      const firstPageQuestions: Question[] = [
        buildQuestion({
          id: 'question-1',
          statement: 'Question 1',
          questionType: QUESTION_TYPE.ALTERNATIVA,
        }),
      ];

      const secondPageQuestions: Question[] = [
        buildQuestion({
          id: 'question-2',
          statement: 'Question 2',
          questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        }),
      ];

      const firstPageResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: firstPageQuestions,
          pagination: {
            page: 1,
            pageSize: 1,
            total: 2,
            totalPages: 2,
            hasNext: true,
            hasPrevious: false,
          },
        },
      };

      const secondPageResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: secondPageQuestions,
          pagination: {
            page: 2,
            pageSize: 1,
            total: 2,
            totalPages: 2,
            hasNext: false,
            hasPrevious: true,
          },
        },
      };

      (mockApiClient.post as jest.Mock)
        .mockResolvedValueOnce({ data: firstPageResponse })
        .mockResolvedValueOnce({ data: secondPageResponse });

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions({ page: 1 });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.questions).toEqual(firstPageQuestions);

      await act(async () => {
        await result.current.fetchQuestions({ page: 2 }, true);
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      });

      expect(result.current.questions).toEqual([
        ...firstPageQuestions,
        ...secondPageQuestions,
      ]);
      expect(result.current.loadingMore).toBe(false);
    });

    it('should handle API error', async () => {
      const errorMessage = 'Network error';
      const mockError = new Error(errorMessage);

      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.questions).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.loadingMore).toBe(false);
    });

    it('should handle API error with response data', async () => {
      const errorMessage = 'Custom error message';
      const mockError = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      };

      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle API error with message property', async () => {
      const errorMessage = 'Error message';
      const mockError = new Error(errorMessage);

      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear questions when fetching without append', async () => {
      const firstQuestions: Question[] = [
        buildQuestion({
          id: 'question-1',
          statement: 'Question 1',
          questionType: QUESTION_TYPE.ALTERNATIVA,
        }),
      ];

      const secondQuestions: Question[] = [
        buildQuestion({
          id: 'question-2',
          statement: 'Question 2',
          questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        }),
      ];

      (mockApiClient.post as jest.Mock)
        .mockResolvedValueOnce({
          data: {
            message: 'Success',
            data: {
              questions: firstQuestions,
              pagination: {
                page: 1,
                pageSize: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false,
              },
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            message: 'Success',
            data: {
              questions: secondQuestions,
              pagination: {
                page: 1,
                pageSize: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false,
              },
            },
          },
        });

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.questions).toEqual(firstQuestions);

      await act(async () => {
        await result.current.fetchQuestions({
          types: [QUESTION_TYPE.MULTIPLA_ESCOLHA],
        });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.questions).toEqual(secondQuestions);
      expect(result.current.questions).not.toContainEqual(firstQuestions[0]);
    });
  });

  describe('loadMore', () => {
    it('should load more questions when pagination has next page', async () => {
      const firstPageQuestions: Question[] = [
        buildQuestion({
          id: 'question-1',
          statement: 'Question 1',
          questionType: QUESTION_TYPE.ALTERNATIVA,
        }),
      ];

      const secondPageQuestions: Question[] = [
        buildQuestion({
          id: 'question-2',
          statement: 'Question 2',
          questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        }),
      ];

      const firstPageResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: firstPageQuestions,
          pagination: {
            page: 1,
            pageSize: 1,
            total: 2,
            totalPages: 2,
            hasNext: true,
            hasPrevious: false,
          },
        },
      };

      const secondPageResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: secondPageQuestions,
          pagination: {
            page: 2,
            pageSize: 1,
            total: 2,
            totalPages: 2,
            hasNext: false,
            hasPrevious: true,
          },
        },
      };

      (mockApiClient.post as jest.Mock)
        .mockResolvedValueOnce({ data: firstPageResponse })
        .mockResolvedValueOnce({ data: secondPageResponse });

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions({ page: 1 });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.pagination?.hasNext).toBe(true);

      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      });

      expect(result.current.questions).toEqual([
        ...firstPageQuestions,
        ...secondPageQuestions,
      ]);
      expect(result.current.pagination?.page).toBe(2);
      expect(mockApiClient.post).toHaveBeenCalledTimes(2);
      expect(mockApiClient.post).toHaveBeenLastCalledWith('/questions/list', {
        page: 2,
      });
    });

    it('should not load more if already loading', async () => {
      const mockResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0,
            hasNext: true,
            hasPrevious: false,
          },
        },
      };

      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (mockApiClient.post as jest.Mock)
        .mockResolvedValueOnce({ data: mockResponse })
        .mockReturnValueOnce(promise);

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.loadMore();
      });

      expect(result.current.loadingMore).toBe(true);

      act(() => {
        result.current.loadMore();
      });

      expect(mockApiClient.post).toHaveBeenCalledTimes(2);

      await act(async () => {
        resolvePromise!({ data: mockResponse });
        await promise;
      });
    });

    it('should not load more if no pagination', () => {
      const { result } = renderHook(() => useQuestionsList());

      act(() => {
        result.current.loadMore();
      });

      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('should not load more if no current filters', async () => {
      const mockResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          },
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
      });

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.reset();
      });

      act(() => {
        result.current.loadMore();
      });

      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    it('should not load more if hasNext is false', async () => {
      const mockResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
      });

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.loadMore();
      });

      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    it('should set loadingMore state during load more', async () => {
      const firstPageResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: [
            buildQuestion({
              id: 'question-1',
              statement: 'Question 1',
              questionType: QUESTION_TYPE.ALTERNATIVA,
            }),
          ],
          pagination: {
            page: 1,
            pageSize: 1,
            total: 2,
            totalPages: 2,
            hasNext: true,
            hasPrevious: false,
          },
        },
      };

      const secondPageResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: [
            buildQuestion({
              id: 'question-2',
              statement: 'Question 2',
              questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
            }),
          ],
          pagination: {
            page: 2,
            pageSize: 1,
            total: 2,
            totalPages: 2,
            hasNext: false,
            hasPrevious: true,
          },
        },
      };

      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (mockApiClient.post as jest.Mock)
        .mockResolvedValueOnce({ data: firstPageResponse })
        .mockReturnValueOnce(promise);

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.loadMore();
      });

      expect(result.current.loadingMore).toBe(true);

      await act(async () => {
        resolvePromise!({ data: secondPageResponse });
        await promise;
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      });
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const mockResponse: QuestionsListResponse = {
        message: 'Success',
        data: {
          questions: [
            buildQuestion({
              id: 'question-1',
              statement: 'Question 1',
              questionType: QUESTION_TYPE.ALTERNATIVA,
            }),
          ],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        },
      };

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
      });

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions({
          types: [QUESTION_TYPE.ALTERNATIVA],
        });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.questions.length).toBeGreaterThan(0);
      expect(result.current.pagination).not.toBe(null);
      expect(result.current.currentFilters).not.toBe(null);

      act(() => {
        result.current.reset();
      });

      expect(result.current.questions).toEqual([]);
      expect(result.current.pagination).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.loadingMore).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.currentFilters).toBe(null);
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown error format', async () => {
      const mockError = { unknown: 'error' };

      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Erro ao carregar questões');
    });

    it('should log error to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Test error');

      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useQuestionsList());

      await act(async () => {
        await result.current.fetchQuestions();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro ao carregar questões:',
        mockError
      );

      consoleSpy.mockRestore();
    });
  });
});
