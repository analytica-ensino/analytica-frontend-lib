import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import {
  createUseRecommendedLessonsHistory,
  createRecommendedLessonsHistoryHook,
  determineRecommendedClassStatus,
  transformRecommendedClassToTableItem,
  handleRecommendedClassFetchError,
  recommendedClasssHistoryApiResponseSchema,
} from './useRecommendedLessons';
import { RecommendedClassDisplayStatus } from '../types/recommendedLessons';
import type {
  RecommendedClassHistoryItem,
  RecommendedClassHistoryApiResponse,
  RecommendedClassHistoryFilters,
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
  describe('determineRecommendedClassStatus', () => {
    it('should return CONCLUIDA when completion is 100%', () => {
      const result = determineRecommendedClassStatus('2024-12-31', 100);
      expect(result).toBe(RecommendedClassDisplayStatus.CONCLUIDA);
    });

    it('should return CONCLUIDA when completion is 100% even with past deadline', () => {
      const result = determineRecommendedClassStatus('2024-01-01', 100);
      expect(result).toBe(RecommendedClassDisplayStatus.CONCLUIDA);
    });

    it('should return VENCIDA when deadline has passed and not completed', () => {
      const result = determineRecommendedClassStatus('2024-01-01', 50);
      expect(result).toBe(RecommendedClassDisplayStatus.VENCIDA);
    });

    it('should return ATIVA when deadline is in the future', () => {
      const result = determineRecommendedClassStatus('2024-12-31', 50);
      expect(result).toBe(RecommendedClassDisplayStatus.ATIVA);
    });

    it('should return ATIVA when finalDate is null', () => {
      const result = determineRecommendedClassStatus(null, 50);
      expect(result).toBe(RecommendedClassDisplayStatus.ATIVA);
    });

    it('should return ATIVA when finalDate is null and 0% completion', () => {
      const result = determineRecommendedClassStatus(null, 0);
      expect(result).toBe(RecommendedClassDisplayStatus.ATIVA);
    });
  });

  describe('transformRecommendedClassToTableItem', () => {
    const baseRecommendedClassHistoryItem: RecommendedClassHistoryItem = {
      recommendedClass: {
        id: 'recommendedClass-123',
        title: 'Test RecommendedClass',
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

    it('should transform recommendedClass item correctly', () => {
      const result = transformRecommendedClassToTableItem(
        baseRecommendedClassHistoryItem
      );

      expect(result.id).toBe('recommendedClass-123');
      expect(result.title).toBe('Test RecommendedClass');
      expect(result.startDate).toBe('01/06');
      expect(result.deadline).toBe('31/12');
      expect(result.school).toBe('Escola Exemplo');
      expect(result.subject).toBe('Matemática');
      expect(result.class).toBe('Turma A');
      expect(result.completionPercentage).toBe(50);
      expect(result.status).toBe(RecommendedClassDisplayStatus.ATIVA);
    });

    it('should handle null startDate', () => {
      const item: RecommendedClassHistoryItem = {
        ...baseRecommendedClassHistoryItem,
        recommendedClass: {
          ...baseRecommendedClassHistoryItem.recommendedClass,
          startDate: null,
        },
      };

      const result = transformRecommendedClassToTableItem(item);
      expect(result.startDate).toBe('-');
    });

    it('should handle null finalDate', () => {
      const item: RecommendedClassHistoryItem = {
        ...baseRecommendedClassHistoryItem,
        recommendedClass: {
          ...baseRecommendedClassHistoryItem.recommendedClass,
          finalDate: null,
        },
      };

      const result = transformRecommendedClassToTableItem(item);
      expect(result.deadline).toBe('-');
    });

    it('should handle null subject', () => {
      const item: RecommendedClassHistoryItem = {
        ...baseRecommendedClassHistoryItem,
        subject: null,
      };

      const result = transformRecommendedClassToTableItem(item);
      expect(result.subject).toBe('-');
    });

    it('should show class count when multiple breakdowns exist', () => {
      const item: RecommendedClassHistoryItem = {
        ...baseRecommendedClassHistoryItem,
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

      const result = transformRecommendedClassToTableItem(item);
      expect(result.class).toBe('3 turmas');
    });

    it('should handle empty breakdown array', () => {
      const item: RecommendedClassHistoryItem = {
        ...baseRecommendedClassHistoryItem,
        breakdown: [],
      };

      const result = transformRecommendedClassToTableItem(item);
      expect(result.school).toBe('-');
      expect(result.class).toBe('-');
    });

    it('should always set year to "-"', () => {
      const result = transformRecommendedClassToTableItem(
        baseRecommendedClassHistoryItem
      );
      expect(result.year).toBe('-');
    });
  });

  describe('handleRecommendedClassFetchError', () => {
    it('should return specific message for Zod errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['data', 'recommendedClasss'],
          message: 'Expected string, received number',
        },
      ]);

      const result = handleRecommendedClassFetchError(zodError);
      expect(result).toBe('Erro ao validar dados de histórico de aulas');

      consoleErrorSpy.mockRestore();
    });

    it('should return generic message for other errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const genericError = new Error('Network error');
      const result = handleRecommendedClassFetchError(genericError);
      expect(result).toBe('Erro ao carregar histórico de aulas');

      consoleErrorSpy.mockRestore();
    });

    it('should return generic message for unknown error types', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = handleRecommendedClassFetchError('string error');
      expect(result).toBe('Erro ao carregar histórico de aulas');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('recommendedClasssHistoryApiResponseSchema', () => {
    it('should validate a valid API response', () => {
      const validResponse = {
        message: 'Success',
        data: {
          recommendedClass: [
            {
              recommendedClass: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Test RecommendedClass',
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

      const result =
        recommendedClasssHistoryApiResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate response with null subject and creator', () => {
      const responseWithNulls = {
        message: 'Success',
        data: {
          recommendedClass: [
            {
              recommendedClass: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Test RecommendedClass',
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

      const result =
        recommendedClasssHistoryApiResponseSchema.safeParse(responseWithNulls);
      expect(result.success).toBe(true);
    });

    it('should reject invalid recommendedClass id format', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          recommendedClass: [
            {
              recommendedClass: {
                id: 'not-a-uuid',
                title: 'Test RecommendedClass',
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

      const result =
        recommendedClasssHistoryApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const missingFields = {
        message: 'Success',
        data: {
          recommendedClass: [],
          // missing total
        },
      };

      const result =
        recommendedClasssHistoryApiResponseSchema.safeParse(missingFields);
      expect(result.success).toBe(false);
    });
  });

  describe('createUseRecommendedLessonsHistory', () => {
    const mockFetchRecommendedClassHistory = jest.fn<
      Promise<RecommendedClassHistoryApiResponse>,
      [RecommendedClassHistoryFilters?]
    >();

    const validApiResponse: RecommendedClassHistoryApiResponse = {
      message: 'Success',
      data: {
        recommendedClass: [
          {
            recommendedClass: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Test RecommendedClass',
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
      const useRecommendedClassHistory = createUseRecommendedLessonsHistory(
        mockFetchRecommendedClassHistory
      );
      const { result } = renderHook(() => useRecommendedClassHistory());

      expect(result.current.recommendedClass).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
      expect(result.current.fetchRecommendedClass).toBeInstanceOf(Function);
    });

    it('should fetch recommendedClasss successfully', async () => {
      mockFetchRecommendedClassHistory.mockResolvedValueOnce(validApiResponse);

      const useRecommendedClassHistory = createUseRecommendedLessonsHistory(
        mockFetchRecommendedClassHistory
      );
      const { result } = renderHook(() => useRecommendedClassHistory());

      await act(async () => {
        await result.current.fetchRecommendedClass({ page: 1, limit: 10 });
      });

      expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result.current.recommendedClass).toHaveLength(1);
      expect(result.current.recommendedClass[0].title).toBe(
        'Test RecommendedClass'
      );
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
      let resolvePromise: (value: RecommendedClassHistoryApiResponse) => void;
      const promise = new Promise<RecommendedClassHistoryApiResponse>(
        (resolve) => {
          resolvePromise = resolve;
        }
      );

      mockFetchRecommendedClassHistory.mockReturnValueOnce(promise);

      const useRecommendedClassHistory = createUseRecommendedLessonsHistory(
        mockFetchRecommendedClassHistory
      );
      const { result } = renderHook(() => useRecommendedClassHistory());

      act(() => {
        result.current.fetchRecommendedClass();
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

      mockFetchRecommendedClassHistory.mockRejectedValueOnce(
        new Error('Network error')
      );

      const useRecommendedClassHistory = createUseRecommendedLessonsHistory(
        mockFetchRecommendedClassHistory
      );
      const { result } = renderHook(() => useRecommendedClassHistory());

      await act(async () => {
        await result.current.fetchRecommendedClass();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao carregar histórico de aulas');
      expect(result.current.recommendedClass).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('should handle validation error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const invalidResponse = {
        message: 'Success',
        data: {
          recommendedClass: 'invalid',
          total: 1,
        },
      };

      mockFetchRecommendedClassHistory.mockResolvedValueOnce(
        invalidResponse as unknown as RecommendedClassHistoryApiResponse
      );

      const useRecommendedClassHistory = createUseRecommendedLessonsHistory(
        mockFetchRecommendedClassHistory
      );
      const { result } = renderHook(() => useRecommendedClassHistory());

      await act(async () => {
        await result.current.fetchRecommendedClass();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao validar dados de histórico de aulas'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should calculate pagination correctly', async () => {
      const responseWith25Items: RecommendedClassHistoryApiResponse = {
        message: 'Success',
        data: {
          recommendedClass: [],
          total: 25,
        },
      };

      mockFetchRecommendedClassHistory.mockResolvedValueOnce(
        responseWith25Items
      );

      const useRecommendedClassHistory = createUseRecommendedLessonsHistory(
        mockFetchRecommendedClassHistory
      );
      const { result } = renderHook(() => useRecommendedClassHistory());

      await act(async () => {
        await result.current.fetchRecommendedClass({ page: 2, limit: 10 });
      });

      expect(result.current.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });

    it('should use default pagination values when not provided', async () => {
      mockFetchRecommendedClassHistory.mockResolvedValueOnce(validApiResponse);

      const useRecommendedClassHistory = createUseRecommendedLessonsHistory(
        mockFetchRecommendedClassHistory
      );
      const { result } = renderHook(() => useRecommendedClassHistory());

      await act(async () => {
        await result.current.fetchRecommendedClass();
      });

      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.limit).toBe(10);
    });

    it('should clear error on new fetch', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetchRecommendedClassHistory.mockRejectedValueOnce(
        new Error('Network error')
      );

      const useRecommendedClassHistory = createUseRecommendedLessonsHistory(
        mockFetchRecommendedClassHistory
      );
      const { result } = renderHook(() => useRecommendedClassHistory());

      // First fetch - should fail
      await act(async () => {
        await result.current.fetchRecommendedClass();
      });

      expect(result.current.error).toBe('Erro ao carregar histórico de aulas');

      // Second fetch - should clear error
      mockFetchRecommendedClassHistory.mockResolvedValueOnce(validApiResponse);

      await act(async () => {
        await result.current.fetchRecommendedClass();
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
        data: { recommendedClass: [], total: 0 },
      });

      const useHook = createRecommendedLessonsHistoryHook(mockFetch);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchRecommendedClass).toBeInstanceOf(Function);
      expect(result.current.recommendedClass).toEqual([]);
    });
  });
});
