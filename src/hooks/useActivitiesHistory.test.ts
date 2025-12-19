import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import {
  createUseActivitiesHistory,
  createActivitiesHistoryHook,
  transformActivityToTableItem,
  handleActivityFetchError,
  activitiesHistoryApiResponseSchema,
  DEFAULT_ACTIVITIES_PAGINATION,
} from './useActivitiesHistory';
import {
  ActivityApiStatus,
  ActivityDisplayStatus,
} from '../types/activitiesHistory';
import type {
  ActivityHistoryResponse,
  ActivitiesHistoryApiResponse,
  ActivityHistoryFilters,
} from '../types/activitiesHistory';

// Mock dayjs
jest.mock('dayjs', () => {
  const actual = jest.requireActual('dayjs');
  return Object.assign((date?: string | Date) => {
    if (date) return actual(date);
    // Return a fixed "now" date for testing
    return actual('2024-06-15');
  }, actual);
});

describe('useActivitiesHistory', () => {
  describe('DEFAULT_ACTIVITIES_PAGINATION', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_ACTIVITIES_PAGINATION).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('transformActivityToTableItem', () => {
    const baseActivity: ActivityHistoryResponse = {
      id: 'activity-123',
      title: 'Test Activity',
      startDate: '2024-06-01',
      finalDate: '2024-12-31',
      status: ActivityApiStatus.A_VENCER,
      completionPercentage: 75,
      subjectId: 'subject-1',
      schoolId: 'school-1',
      schoolName: 'Escola Exemplo',
      year: '2024',
      className: 'Turma A',
      subjectName: 'Matemática',
    };

    it('should transform activity correctly with all fields', () => {
      const result = transformActivityToTableItem(baseActivity);

      expect(result.id).toBe('activity-123');
      expect(result.title).toBe('Test Activity');
      expect(result.startDate).toBe('01/06');
      expect(result.deadline).toBe('31/12');
      expect(result.school).toBe('Escola Exemplo');
      expect(result.year).toBe('2024');
      expect(result.subject).toBe('Matemática');
      expect(result.class).toBe('Turma A');
      expect(result.completionPercentage).toBe(75);
      expect(result.status).toBe(ActivityDisplayStatus.ATIVA);
    });

    it('should handle null startDate', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        startDate: null,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.startDate).toBe('-');
    });

    it('should handle null finalDate', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        finalDate: null,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.deadline).toBe('-');
    });

    it('should handle missing schoolName', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        schoolName: undefined,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.school).toBe('-');
    });

    it('should handle missing className', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        className: undefined,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.class).toBe('-');
    });

    it('should handle missing subjectName', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        subjectName: undefined,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.subject).toBe('-');
    });

    it('should handle missing year', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        year: undefined,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.year).toBe('-');
    });

    it('should map A_VENCER status to ATIVA', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        status: ActivityApiStatus.A_VENCER,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.status).toBe(ActivityDisplayStatus.ATIVA);
    });

    it('should map VENCIDA status to VENCIDA', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        status: ActivityApiStatus.VENCIDA,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.status).toBe(ActivityDisplayStatus.VENCIDA);
    });

    it('should map CONCLUIDA status to CONCLUÍDA', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        status: ActivityApiStatus.CONCLUIDA,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.status).toBe(ActivityDisplayStatus.CONCLUIDA);
    });
  });

  describe('handleActivityFetchError', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should return specific message for Zod errors', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['data', 'activities'],
          message: 'Expected string, received number',
        },
      ]);

      const result = handleActivityFetchError(zodError);
      expect(result).toBe('Erro ao validar dados de histórico de atividades');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for other errors', () => {
      const genericError = new Error('Network error');
      const result = handleActivityFetchError(genericError);
      expect(result).toBe('Erro ao carregar histórico de atividades');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for unknown error types', () => {
      const result = handleActivityFetchError('string error');
      expect(result).toBe('Erro ao carregar histórico de atividades');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('activitiesHistoryApiResponseSchema', () => {
    it('should validate a valid API response', () => {
      const validResponse = {
        message: 'Success',
        data: {
          activities: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Test Activity',
              startDate: '2024-06-01',
              finalDate: '2024-12-31',
              status: ActivityApiStatus.A_VENCER,
              completionPercentage: 75,
              subjectId: '123e4567-e89b-12d3-a456-426614174001',
              schoolId: 'school-1',
              schoolName: 'School A',
              year: '2024',
              className: 'Class A',
              subjectName: 'Math',
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      };

      const result =
        activitiesHistoryApiResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate response with optional fields missing', () => {
      const responseWithOptionals = {
        message: 'Success',
        data: {
          activities: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Test Activity',
              startDate: null,
              finalDate: null,
              status: ActivityApiStatus.A_VENCER,
              completionPercentage: 0,
              subjectId: '123e4567-e89b-12d3-a456-426614174001',
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      };

      const result = activitiesHistoryApiResponseSchema.safeParse(
        responseWithOptionals
      );
      expect(result.success).toBe(true);
    });

    it('should reject invalid activity id format', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          activities: [
            {
              id: 'not-a-uuid',
              title: 'Test Activity',
              startDate: null,
              finalDate: null,
              status: ActivityApiStatus.A_VENCER,
              completionPercentage: 0,
              subjectId: '123e4567-e89b-12d3-a456-426614174001',
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      };

      const result =
        activitiesHistoryApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const missingFields = {
        message: 'Success',
        data: {
          activities: [],
          // missing pagination
        },
      };

      const result =
        activitiesHistoryApiResponseSchema.safeParse(missingFields);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status value', () => {
      const invalidStatus = {
        message: 'Success',
        data: {
          activities: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Test Activity',
              startDate: null,
              finalDate: null,
              status: 'INVALID_STATUS',
              completionPercentage: 0,
              subjectId: '123e4567-e89b-12d3-a456-426614174001',
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      };

      const result =
        activitiesHistoryApiResponseSchema.safeParse(invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should reject completion percentage out of range', () => {
      const outOfRange = {
        message: 'Success',
        data: {
          activities: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Test Activity',
              startDate: null,
              finalDate: null,
              status: ActivityApiStatus.A_VENCER,
              completionPercentage: 150,
              subjectId: '123e4567-e89b-12d3-a456-426614174001',
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      };

      const result = activitiesHistoryApiResponseSchema.safeParse(outOfRange);
      expect(result.success).toBe(false);
    });
  });

  describe('createUseActivitiesHistory', () => {
    const mockFetchActivitiesHistory = jest.fn<
      Promise<ActivitiesHistoryApiResponse>,
      [ActivityHistoryFilters?]
    >();

    const validApiResponse: ActivitiesHistoryApiResponse = {
      message: 'Success',
      data: {
        activities: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Activity',
            startDate: '2024-06-01',
            finalDate: '2024-12-31',
            status: ActivityApiStatus.A_VENCER,
            completionPercentage: 75,
            subjectId: '123e4567-e89b-12d3-a456-426614174001',
            schoolId: 'school-1',
            schoolName: 'Escola Exemplo',
            year: '2024',
            className: 'Turma A',
            subjectName: 'Matemática',
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return initial state', () => {
      const useActivitiesHistory = createUseActivitiesHistory(
        mockFetchActivitiesHistory
      );
      const { result } = renderHook(() => useActivitiesHistory());

      expect(result.current.activities).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual(DEFAULT_ACTIVITIES_PAGINATION);
      expect(result.current.fetchActivities).toBeInstanceOf(Function);
    });

    it('should fetch activities successfully', async () => {
      mockFetchActivitiesHistory.mockResolvedValueOnce(validApiResponse);

      const useActivitiesHistory = createUseActivitiesHistory(
        mockFetchActivitiesHistory
      );
      const { result } = renderHook(() => useActivitiesHistory());

      await act(async () => {
        await result.current.fetchActivities({ page: 1, limit: 10 });
      });

      expect(mockFetchActivitiesHistory).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result.current.activities).toHaveLength(1);
      expect(result.current.activities[0].title).toBe('Test Activity');
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
      let resolvePromise: (value: ActivitiesHistoryApiResponse) => void;
      const promise = new Promise<ActivitiesHistoryApiResponse>((resolve) => {
        resolvePromise = resolve;
      });

      mockFetchActivitiesHistory.mockReturnValueOnce(promise);

      const useActivitiesHistory = createUseActivitiesHistory(
        mockFetchActivitiesHistory
      );
      const { result } = renderHook(() => useActivitiesHistory());

      act(() => {
        result.current.fetchActivities();
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

      mockFetchActivitiesHistory.mockRejectedValueOnce(
        new Error('Network error')
      );

      const useActivitiesHistory = createUseActivitiesHistory(
        mockFetchActivitiesHistory
      );
      const { result } = renderHook(() => useActivitiesHistory());

      await act(async () => {
        await result.current.fetchActivities();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao carregar histórico de atividades'
      );
      expect(result.current.activities).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('should handle validation error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const invalidResponse = {
        message: 'Success',
        data: {
          activities: 'invalid',
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
      };

      mockFetchActivitiesHistory.mockResolvedValueOnce(
        invalidResponse as unknown as ActivitiesHistoryApiResponse
      );

      const useActivitiesHistory = createUseActivitiesHistory(
        mockFetchActivitiesHistory
      );
      const { result } = renderHook(() => useActivitiesHistory());

      await act(async () => {
        await result.current.fetchActivities();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao validar dados de histórico de atividades'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should clear error on new fetch', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetchActivitiesHistory.mockRejectedValueOnce(
        new Error('Network error')
      );

      const useActivitiesHistory = createUseActivitiesHistory(
        mockFetchActivitiesHistory
      );
      const { result } = renderHook(() => useActivitiesHistory());

      // First fetch - should fail
      await act(async () => {
        await result.current.fetchActivities();
      });

      expect(result.current.error).toBe(
        'Erro ao carregar histórico de atividades'
      );

      // Second fetch - should clear error
      mockFetchActivitiesHistory.mockResolvedValueOnce(validApiResponse);

      await act(async () => {
        await result.current.fetchActivities();
      });

      expect(result.current.error).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should fetch activities without filters', async () => {
      mockFetchActivitiesHistory.mockResolvedValueOnce(validApiResponse);

      const useActivitiesHistory = createUseActivitiesHistory(
        mockFetchActivitiesHistory
      );
      const { result } = renderHook(() => useActivitiesHistory());

      await act(async () => {
        await result.current.fetchActivities();
      });

      expect(mockFetchActivitiesHistory).toHaveBeenCalledWith(undefined);
      expect(result.current.activities).toHaveLength(1);
    });
  });

  describe('createActivitiesHistoryHook', () => {
    it('should be an alias for createUseActivitiesHistory', () => {
      expect(createActivitiesHistoryHook).toBe(createUseActivitiesHistory);
    });

    it('should create a functional hook', () => {
      const mockFetch = jest.fn().mockResolvedValue({
        message: 'Success',
        data: {
          activities: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },
      });

      const useHook = createActivitiesHistoryHook(mockFetch);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchActivities).toBeInstanceOf(Function);
      expect(result.current.activities).toEqual([]);
    });
  });
});
