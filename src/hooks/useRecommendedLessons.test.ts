import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import {
  createUseRecommendedLessonsHistory,
  createRecommendedLessonsHistoryHook,
  determineGoalStatus,
  transformGoalToTableItem,
  handleGoalFetchError,
  goalsHistoryApiResponseSchema,
} from './useRecommendedLessons';
import { GoalDisplayStatus } from '../types/recommendedLessons';
import type {
  GoalHistoryItem,
  GoalsHistoryApiResponse,
  GoalHistoryFilters,
} from '../types/recommendedLessons';

// Mock dayjs
jest.mock('dayjs', () => {
  const actual = jest.requireActual('dayjs');
  return Object.assign((date?: string | Date) => {
    if (date) return actual(date);
    // Return a fixed "now" date for testing
    return actual('2024-06-15');
  }, actual);
});

describe('useRecommendedLessons', () => {
  describe('determineGoalStatus', () => {
    it('should return CONCLUIDA when completion is 100%', () => {
      const result = determineGoalStatus('2024-12-31', 100);
      expect(result).toBe(GoalDisplayStatus.CONCLUIDA);
    });

    it('should return CONCLUIDA when completion is 100% even with past deadline', () => {
      const result = determineGoalStatus('2024-01-01', 100);
      expect(result).toBe(GoalDisplayStatus.CONCLUIDA);
    });

    it('should return VENCIDA when deadline has passed and not completed', () => {
      const result = determineGoalStatus('2024-01-01', 50);
      expect(result).toBe(GoalDisplayStatus.VENCIDA);
    });

    it('should return ATIVA when deadline is in the future', () => {
      const result = determineGoalStatus('2024-12-31', 50);
      expect(result).toBe(GoalDisplayStatus.ATIVA);
    });

    it('should return ATIVA when finalDate is null', () => {
      const result = determineGoalStatus(null, 50);
      expect(result).toBe(GoalDisplayStatus.ATIVA);
    });

    it('should return ATIVA when finalDate is null and 0% completion', () => {
      const result = determineGoalStatus(null, 0);
      expect(result).toBe(GoalDisplayStatus.ATIVA);
    });
  });

  describe('transformGoalToTableItem', () => {
    const baseGoalHistoryItem: GoalHistoryItem = {
      goal: {
        id: 'goal-123',
        title: 'Test Goal',
        startDate: '2024-06-01',
        finalDate: '2024-12-31',
        createdAt: '2024-06-01T10:00:00Z',
        progress: 50,
        totalLessons: 10,
      },
      subject: {
        id: 'subject-1',
        name: 'Matemática',
      },
      creator: {
        id: 'creator-1',
        name: 'Professor João',
      },
      stats: {
        totalStudents: 30,
        completedCount: 15,
        completionPercentage: 50,
      },
      breakdown: [
        {
          classId: 'class-1',
          className: 'Turma A',
          schoolId: 'school-1',
          schoolName: 'Escola Exemplo',
          studentCount: 30,
          completedCount: 15,
        },
      ],
    };

    it('should transform goal item correctly', () => {
      const result = transformGoalToTableItem(baseGoalHistoryItem);

      expect(result.id).toBe('goal-123');
      expect(result.title).toBe('Test Goal');
      expect(result.startDate).toBe('01/06');
      expect(result.deadline).toBe('31/12');
      expect(result.school).toBe('Escola Exemplo');
      expect(result.subject).toBe('Matemática');
      expect(result.class).toBe('Turma A');
      expect(result.completionPercentage).toBe(50);
      expect(result.status).toBe(GoalDisplayStatus.ATIVA);
    });

    it('should handle null startDate', () => {
      const item: GoalHistoryItem = {
        ...baseGoalHistoryItem,
        goal: {
          ...baseGoalHistoryItem.goal,
          startDate: null,
        },
      };

      const result = transformGoalToTableItem(item);
      expect(result.startDate).toBe('-');
    });

    it('should handle null finalDate', () => {
      const item: GoalHistoryItem = {
        ...baseGoalHistoryItem,
        goal: {
          ...baseGoalHistoryItem.goal,
          finalDate: null,
        },
      };

      const result = transformGoalToTableItem(item);
      expect(result.deadline).toBe('-');
    });

    it('should handle null subject', () => {
      const item: GoalHistoryItem = {
        ...baseGoalHistoryItem,
        subject: null,
      };

      const result = transformGoalToTableItem(item);
      expect(result.subject).toBe('-');
    });

    it('should show class count when multiple breakdowns exist', () => {
      const item: GoalHistoryItem = {
        ...baseGoalHistoryItem,
        breakdown: [
          {
            classId: 'class-1',
            className: 'Turma A',
            schoolId: 'school-1',
            schoolName: 'Escola Exemplo',
            studentCount: 15,
            completedCount: 8,
          },
          {
            classId: 'class-2',
            className: 'Turma B',
            schoolId: 'school-1',
            schoolName: 'Escola Exemplo',
            studentCount: 15,
            completedCount: 7,
          },
          {
            classId: 'class-3',
            className: 'Turma C',
            schoolId: 'school-2',
            schoolName: 'Outra Escola',
            studentCount: 10,
            completedCount: 5,
          },
        ],
      };

      const result = transformGoalToTableItem(item);
      expect(result.class).toBe('3 turmas');
    });

    it('should handle empty breakdown array', () => {
      const item: GoalHistoryItem = {
        ...baseGoalHistoryItem,
        breakdown: [],
      };

      const result = transformGoalToTableItem(item);
      expect(result.school).toBe('-');
      expect(result.class).toBe('-');
    });

    it('should always set year to "-"', () => {
      const result = transformGoalToTableItem(baseGoalHistoryItem);
      expect(result.year).toBe('-');
    });
  });

  describe('handleGoalFetchError', () => {
    it('should return specific message for Zod errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['data', 'goals'],
          message: 'Expected string, received number',
        },
      ]);

      const result = handleGoalFetchError(zodError);
      expect(result).toBe('Erro ao validar dados de histórico de aulas');

      consoleErrorSpy.mockRestore();
    });

    it('should return generic message for other errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const genericError = new Error('Network error');
      const result = handleGoalFetchError(genericError);
      expect(result).toBe('Erro ao carregar histórico de aulas');

      consoleErrorSpy.mockRestore();
    });

    it('should return generic message for unknown error types', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = handleGoalFetchError('string error');
      expect(result).toBe('Erro ao carregar histórico de aulas');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('goalsHistoryApiResponseSchema', () => {
    it('should validate a valid API response', () => {
      const validResponse = {
        message: 'Success',
        data: {
          goals: [
            {
              goal: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Test Goal',
                startDate: '2024-06-01',
                finalDate: '2024-12-31',
                createdAt: '2024-06-01T10:00:00Z',
                progress: 50,
                totalLessons: 10,
              },
              subject: {
                id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Math',
              },
              creator: {
                id: '123e4567-e89b-12d3-a456-426614174002',
                name: 'John',
              },
              stats: {
                totalStudents: 30,
                completedCount: 15,
                completionPercentage: 50,
              },
              breakdown: [
                {
                  classId: '123e4567-e89b-12d3-a456-426614174003',
                  className: 'Class A',
                  schoolId: 'school-1',
                  schoolName: 'School A',
                  studentCount: 30,
                  completedCount: 15,
                },
              ],
            },
          ],
          total: 1,
        },
      };

      const result = goalsHistoryApiResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate response with null subject and creator', () => {
      const responseWithNulls = {
        message: 'Success',
        data: {
          goals: [
            {
              goal: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Test Goal',
                startDate: null,
                finalDate: null,
                createdAt: '2024-06-01T10:00:00Z',
                progress: 0,
                totalLessons: 5,
              },
              subject: null,
              creator: null,
              stats: {
                totalStudents: 20,
                completedCount: 0,
                completionPercentage: 0,
              },
              breakdown: [],
            },
          ],
          total: 1,
        },
      };

      const result = goalsHistoryApiResponseSchema.safeParse(responseWithNulls);
      expect(result.success).toBe(true);
    });

    it('should reject invalid goal id format', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          goals: [
            {
              goal: {
                id: 'not-a-uuid',
                title: 'Test Goal',
                startDate: null,
                finalDate: null,
                createdAt: '2024-06-01T10:00:00Z',
                progress: 0,
                totalLessons: 5,
              },
              subject: null,
              creator: null,
              stats: {
                totalStudents: 20,
                completedCount: 0,
                completionPercentage: 0,
              },
              breakdown: [],
            },
          ],
          total: 1,
        },
      };

      const result = goalsHistoryApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const missingFields = {
        message: 'Success',
        data: {
          goals: [],
          // missing total
        },
      };

      const result = goalsHistoryApiResponseSchema.safeParse(missingFields);
      expect(result.success).toBe(false);
    });
  });

  describe('createUseRecommendedLessonsHistory', () => {
    const mockFetchGoalsHistory = jest.fn<
      Promise<GoalsHistoryApiResponse>,
      [GoalHistoryFilters?]
    >();

    const validApiResponse: GoalsHistoryApiResponse = {
      message: 'Success',
      data: {
        goals: [
          {
            goal: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Test Goal',
              startDate: '2024-06-01',
              finalDate: '2024-12-31',
              createdAt: '2024-06-01T10:00:00Z',
              progress: 50,
              totalLessons: 10,
            },
            subject: {
              id: '123e4567-e89b-12d3-a456-426614174001',
              name: 'Matemática',
            },
            creator: {
              id: '123e4567-e89b-12d3-a456-426614174002',
              name: 'Professor',
            },
            stats: {
              totalStudents: 30,
              completedCount: 15,
              completionPercentage: 50,
            },
            breakdown: [
              {
                classId: '123e4567-e89b-12d3-a456-426614174003',
                className: 'Turma A',
                schoolId: 'school-1',
                schoolName: 'Escola Exemplo',
                studentCount: 30,
                completedCount: 15,
              },
            ],
          },
        ],
        total: 1,
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return initial state', () => {
      const useGoalsHistory = createUseRecommendedLessonsHistory(
        mockFetchGoalsHistory
      );
      const { result } = renderHook(() => useGoalsHistory());

      expect(result.current.goals).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
      expect(result.current.fetchGoals).toBeInstanceOf(Function);
    });

    it('should fetch goals successfully', async () => {
      mockFetchGoalsHistory.mockResolvedValueOnce(validApiResponse);

      const useGoalsHistory = createUseRecommendedLessonsHistory(
        mockFetchGoalsHistory
      );
      const { result } = renderHook(() => useGoalsHistory());

      await act(async () => {
        await result.current.fetchGoals({ page: 1, limit: 10 });
      });

      expect(mockFetchGoalsHistory).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result.current.goals).toHaveLength(1);
      expect(result.current.goals[0].title).toBe('Test Goal');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: GoalsHistoryApiResponse) => void;
      const promise = new Promise<GoalsHistoryApiResponse>((resolve) => {
        resolvePromise = resolve;
      });

      mockFetchGoalsHistory.mockReturnValueOnce(promise);

      const useGoalsHistory = createUseRecommendedLessonsHistory(
        mockFetchGoalsHistory
      );
      const { result } = renderHook(() => useGoalsHistory());

      act(() => {
        result.current.fetchGoals();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolvePromise!(validApiResponse);
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetchGoalsHistory.mockRejectedValueOnce(new Error('Network error'));

      const useGoalsHistory = createUseRecommendedLessonsHistory(
        mockFetchGoalsHistory
      );
      const { result } = renderHook(() => useGoalsHistory());

      await act(async () => {
        await result.current.fetchGoals();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao carregar histórico de aulas');
      expect(result.current.goals).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('should handle validation error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const invalidResponse = {
        message: 'Success',
        data: {
          goals: 'invalid',
          total: 1,
        },
      };

      mockFetchGoalsHistory.mockResolvedValueOnce(
        invalidResponse as unknown as GoalsHistoryApiResponse
      );

      const useGoalsHistory = createUseRecommendedLessonsHistory(
        mockFetchGoalsHistory
      );
      const { result } = renderHook(() => useGoalsHistory());

      await act(async () => {
        await result.current.fetchGoals();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao validar dados de histórico de aulas'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should calculate pagination correctly', async () => {
      const responseWith25Items: GoalsHistoryApiResponse = {
        message: 'Success',
        data: {
          goals: [],
          total: 25,
        },
      };

      mockFetchGoalsHistory.mockResolvedValueOnce(responseWith25Items);

      const useGoalsHistory = createUseRecommendedLessonsHistory(
        mockFetchGoalsHistory
      );
      const { result } = renderHook(() => useGoalsHistory());

      await act(async () => {
        await result.current.fetchGoals({ page: 2, limit: 10 });
      });

      expect(result.current.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });

    it('should use default pagination values when not provided', async () => {
      mockFetchGoalsHistory.mockResolvedValueOnce(validApiResponse);

      const useGoalsHistory = createUseRecommendedLessonsHistory(
        mockFetchGoalsHistory
      );
      const { result } = renderHook(() => useGoalsHistory());

      await act(async () => {
        await result.current.fetchGoals();
      });

      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.limit).toBe(10);
    });

    it('should clear error on new fetch', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetchGoalsHistory.mockRejectedValueOnce(new Error('Network error'));

      const useGoalsHistory = createUseRecommendedLessonsHistory(
        mockFetchGoalsHistory
      );
      const { result } = renderHook(() => useGoalsHistory());

      // First fetch - should fail
      await act(async () => {
        await result.current.fetchGoals();
      });

      expect(result.current.error).toBe('Erro ao carregar histórico de aulas');

      // Second fetch - should clear error
      mockFetchGoalsHistory.mockResolvedValueOnce(validApiResponse);

      await act(async () => {
        await result.current.fetchGoals();
      });

      expect(result.current.error).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createRecommendedLessonsHistoryHook', () => {
    it('should be an alias for createUseRecommendedLessonsHistory', () => {
      expect(createRecommendedLessonsHistoryHook).toBe(
        createUseRecommendedLessonsHistory
      );
    });

    it('should create a functional hook', () => {
      const mockFetch = jest.fn().mockResolvedValue({
        message: 'Success',
        data: { goals: [], total: 0 },
      });

      const useHook = createRecommendedLessonsHistoryHook(mockFetch);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchGoals).toBeInstanceOf(Function);
      expect(result.current.goals).toEqual([]);
    });
  });
});
