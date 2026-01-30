import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import {
  createUseQuestionsData,
  createQuestionsDataHook,
  transformQuestionsData,
  handleQuestionsDataFetchError,
  questionsDataApiResponseSchema,
} from './useQuestionsData';
import type {
  QuestionsDataApiResponse,
  QuestionsDataApiData,
  QuestionsDataFilters,
} from './useQuestionsData';

describe('useQuestionsData', () => {
  describe('transformQuestionsData', () => {
    it('should transform API data to component format', () => {
      const apiData: QuestionsDataApiData = {
        totalQuestions: 100,
        correctQuestions: 70,
        incorrectQuestions: 20,
        blankQuestions: 10,
        correctPercentage: 70,
        incorrectPercentage: 20,
        blankPercentage: 10,
        trend: {
          totalQuestions: 10,
          correctPercentage: 5,
          direction: 'up',
        },
      };

      const result = transformQuestionsData(apiData);

      expect(result).toEqual({
        total: 100,
        corretas: 70,
        incorretas: 20,
        emBranco: 10,
        correctPercentage: 70,
        incorrectPercentage: 20,
        blankPercentage: 10,
        trend: {
          totalQuestions: 10,
          correctPercentage: 5,
          direction: 'up',
        },
      });
    });

    it('should handle null trend', () => {
      const apiData: QuestionsDataApiData = {
        totalQuestions: 50,
        correctQuestions: 30,
        incorrectQuestions: 15,
        blankQuestions: 5,
        correctPercentage: 60,
        incorrectPercentage: 30,
        blankPercentage: 10,
        trend: null,
      };

      const result = transformQuestionsData(apiData);

      expect(result.trend).toBeNull();
    });

    it('should handle zero values', () => {
      const apiData: QuestionsDataApiData = {
        totalQuestions: 0,
        correctQuestions: 0,
        incorrectQuestions: 0,
        blankQuestions: 0,
        correctPercentage: 0,
        incorrectPercentage: 0,
        blankPercentage: 0,
        trend: null,
      };

      const result = transformQuestionsData(apiData);

      expect(result.total).toBe(0);
      expect(result.corretas).toBe(0);
      expect(result.incorretas).toBe(0);
      expect(result.emBranco).toBe(0);
    });
  });

  describe('handleQuestionsDataFetchError', () => {
    it('should return specific message for Zod errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'number',
          received: 'string',
          path: ['data', 'totalQuestions'],
          message: 'Expected number, received string',
        },
      ]);

      const result = handleQuestionsDataFetchError(zodError);
      expect(result).toBe('Erro ao validar dados de questões');

      consoleErrorSpy.mockRestore();
    });

    it('should return generic message for other errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const genericError = new Error('Network error');
      const result = handleQuestionsDataFetchError(genericError);
      expect(result).toBe('Erro ao carregar dados de questões');

      consoleErrorSpy.mockRestore();
    });

    it('should return generic message for unknown error types', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = handleQuestionsDataFetchError('string error');
      expect(result).toBe('Erro ao carregar dados de questões');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('questionsDataApiResponseSchema', () => {
    it('should validate a valid API response with trend', () => {
      const validResponse = {
        message: 'Success',
        data: {
          totalQuestions: 100,
          correctQuestions: 70,
          incorrectQuestions: 20,
          blankQuestions: 10,
          correctPercentage: 70,
          incorrectPercentage: 20,
          blankPercentage: 10,
          trend: {
            totalQuestions: 10,
            correctPercentage: 5,
            direction: 'up',
          },
        },
      };

      const result = questionsDataApiResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate response with null trend', () => {
      const responseWithNullTrend = {
        message: 'Success',
        data: {
          totalQuestions: 50,
          correctQuestions: 30,
          incorrectQuestions: 15,
          blankQuestions: 5,
          correctPercentage: 60,
          incorrectPercentage: 30,
          blankPercentage: 10,
          trend: null,
        },
      };

      const result = questionsDataApiResponseSchema.safeParse(
        responseWithNullTrend
      );
      expect(result.success).toBe(true);
    });

    it('should validate response with down trend direction', () => {
      const responseWithDownTrend = {
        message: 'Success',
        data: {
          totalQuestions: 80,
          correctQuestions: 40,
          incorrectQuestions: 30,
          blankQuestions: 10,
          correctPercentage: 50,
          incorrectPercentage: 37.5,
          blankPercentage: 12.5,
          trend: {
            totalQuestions: -5,
            correctPercentage: -3,
            direction: 'down',
          },
        },
      };

      const result = questionsDataApiResponseSchema.safeParse(
        responseWithDownTrend
      );
      expect(result.success).toBe(true);
    });

    it('should validate response with stable trend direction', () => {
      const responseWithStableTrend = {
        message: 'Success',
        data: {
          totalQuestions: 100,
          correctQuestions: 50,
          incorrectQuestions: 40,
          blankQuestions: 10,
          correctPercentage: 50,
          incorrectPercentage: 40,
          blankPercentage: 10,
          trend: {
            totalQuestions: 0,
            correctPercentage: 0,
            direction: 'stable',
          },
        },
      };

      const result = questionsDataApiResponseSchema.safeParse(
        responseWithStableTrend
      );
      expect(result.success).toBe(true);
    });

    it('should reject negative totalQuestions', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          totalQuestions: -10,
          correctQuestions: 0,
          incorrectQuestions: 0,
          blankQuestions: 0,
          correctPercentage: 0,
          incorrectPercentage: 0,
          blankPercentage: 0,
          trend: null,
        },
      };

      const result = questionsDataApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject percentage greater than 100', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          totalQuestions: 100,
          correctQuestions: 70,
          incorrectQuestions: 20,
          blankQuestions: 10,
          correctPercentage: 150,
          incorrectPercentage: 20,
          blankPercentage: 10,
          trend: null,
        },
      };

      const result = questionsDataApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject invalid trend direction', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          totalQuestions: 100,
          correctQuestions: 70,
          incorrectQuestions: 20,
          blankQuestions: 10,
          correctPercentage: 70,
          incorrectPercentage: 20,
          blankPercentage: 10,
          trend: {
            totalQuestions: 10,
            correctPercentage: 5,
            direction: 'invalid',
          },
        },
      };

      const result = questionsDataApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const missingFields = {
        message: 'Success',
        data: {
          totalQuestions: 100,
          correctQuestions: 70,
          // missing other fields
        },
      };

      const result = questionsDataApiResponseSchema.safeParse(missingFields);
      expect(result.success).toBe(false);
    });
  });

  describe('createUseQuestionsData', () => {
    const mockFetchQuestionsData = jest.fn<
      Promise<QuestionsDataApiResponse>,
      [QuestionsDataFilters?]
    >();

    const validApiResponse: QuestionsDataApiResponse = {
      message: 'Success',
      data: {
        totalQuestions: 100,
        correctQuestions: 70,
        incorrectQuestions: 20,
        blankQuestions: 10,
        correctPercentage: 70,
        incorrectPercentage: 20,
        blankPercentage: 10,
        trend: {
          totalQuestions: 10,
          correctPercentage: 5,
          direction: 'up',
        },
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return initial state', () => {
      const useQuestionsData = createUseQuestionsData(mockFetchQuestionsData);
      const { result } = renderHook(() => useQuestionsData());

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.fetchQuestionsData).toBeInstanceOf(Function);
      expect(result.current.reset).toBeInstanceOf(Function);
    });

    it('should fetch questions data successfully', async () => {
      mockFetchQuestionsData.mockResolvedValueOnce(validApiResponse);

      const useQuestionsData = createUseQuestionsData(mockFetchQuestionsData);
      const { result } = renderHook(() => useQuestionsData());

      await act(async () => {
        await result.current.fetchQuestionsData({ period: '1_MONTH' });
      });

      expect(mockFetchQuestionsData).toHaveBeenCalledWith({
        period: '1_MONTH',
      });
      expect(result.current.data).not.toBeNull();
      expect(result.current.data?.total).toBe(100);
      expect(result.current.data?.corretas).toBe(70);
      expect(result.current.data?.incorretas).toBe(20);
      expect(result.current.data?.emBranco).toBe(10);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should transform data correctly', async () => {
      mockFetchQuestionsData.mockResolvedValueOnce(validApiResponse);

      const useQuestionsData = createUseQuestionsData(mockFetchQuestionsData);
      const { result } = renderHook(() => useQuestionsData());

      await act(async () => {
        await result.current.fetchQuestionsData();
      });

      expect(result.current.data).toEqual({
        total: 100,
        corretas: 70,
        incorretas: 20,
        emBranco: 10,
        correctPercentage: 70,
        incorrectPercentage: 20,
        blankPercentage: 10,
        trend: {
          totalQuestions: 10,
          correctPercentage: 5,
          direction: 'up',
        },
      });
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: QuestionsDataApiResponse) => void;
      const promise = new Promise<QuestionsDataApiResponse>((resolve) => {
        resolvePromise = resolve;
      });

      mockFetchQuestionsData.mockReturnValueOnce(promise);

      const useQuestionsData = createUseQuestionsData(mockFetchQuestionsData);
      const { result } = renderHook(() => useQuestionsData());

      act(() => {
        result.current.fetchQuestionsData();
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

      mockFetchQuestionsData.mockRejectedValueOnce(new Error('Network error'));

      const useQuestionsData = createUseQuestionsData(mockFetchQuestionsData);
      const { result } = renderHook(() => useQuestionsData());

      await act(async () => {
        await result.current.fetchQuestionsData();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao carregar dados de questões');
      expect(result.current.data).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should handle validation error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const invalidResponse = {
        message: 'Success',
        data: {
          totalQuestions: 'invalid',
        },
      };

      mockFetchQuestionsData.mockResolvedValueOnce(
        invalidResponse as unknown as QuestionsDataApiResponse
      );

      const useQuestionsData = createUseQuestionsData(mockFetchQuestionsData);
      const { result } = renderHook(() => useQuestionsData());

      await act(async () => {
        await result.current.fetchQuestionsData();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao validar dados de questões');

      consoleErrorSpy.mockRestore();
    });

    it('should pass filters to API function', async () => {
      mockFetchQuestionsData.mockResolvedValueOnce(validApiResponse);

      const useQuestionsData = createUseQuestionsData(mockFetchQuestionsData);
      const { result } = renderHook(() => useQuestionsData());

      const filters: QuestionsDataFilters = {
        period: '6_MONTHS',
        subjectId: '123e4567-e89b-12d3-a456-426614174000',
        classId: '123e4567-e89b-12d3-a456-426614174001',
      };

      await act(async () => {
        await result.current.fetchQuestionsData(filters);
      });

      expect(mockFetchQuestionsData).toHaveBeenCalledWith(filters);
    });

    it('should clear error on new fetch', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetchQuestionsData.mockRejectedValueOnce(new Error('Network error'));

      const useQuestionsData = createUseQuestionsData(mockFetchQuestionsData);
      const { result } = renderHook(() => useQuestionsData());

      // First fetch - should fail
      await act(async () => {
        await result.current.fetchQuestionsData();
      });

      expect(result.current.error).toBe('Erro ao carregar dados de questões');

      // Second fetch - should clear error
      mockFetchQuestionsData.mockResolvedValueOnce(validApiResponse);

      await act(async () => {
        await result.current.fetchQuestionsData();
      });

      expect(result.current.error).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should reset state to initial values', async () => {
      mockFetchQuestionsData.mockResolvedValueOnce(validApiResponse);

      const useQuestionsData = createUseQuestionsData(mockFetchQuestionsData);
      const { result } = renderHook(() => useQuestionsData());

      // Fetch data first
      await act(async () => {
        await result.current.fetchQuestionsData();
      });

      expect(result.current.data).not.toBeNull();

      // Reset state
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle response with null trend', async () => {
      const responseWithNullTrend: QuestionsDataApiResponse = {
        message: 'Success',
        data: {
          totalQuestions: 50,
          correctQuestions: 30,
          incorrectQuestions: 15,
          blankQuestions: 5,
          correctPercentage: 60,
          incorrectPercentage: 30,
          blankPercentage: 10,
          trend: null,
        },
      };

      mockFetchQuestionsData.mockResolvedValueOnce(responseWithNullTrend);

      const useQuestionsData = createUseQuestionsData(mockFetchQuestionsData);
      const { result } = renderHook(() => useQuestionsData());

      await act(async () => {
        await result.current.fetchQuestionsData();
      });

      expect(result.current.data?.trend).toBeNull();
    });
  });

  describe('createQuestionsDataHook', () => {
    it('should be an alias for createUseQuestionsData', () => {
      expect(createQuestionsDataHook).toBe(createUseQuestionsData);
    });

    it('should create a functional hook', () => {
      const mockFetch = jest.fn().mockResolvedValue({
        message: 'Success',
        data: {
          totalQuestions: 0,
          correctQuestions: 0,
          incorrectQuestions: 0,
          blankQuestions: 0,
          correctPercentage: 0,
          incorrectPercentage: 0,
          blankPercentage: 0,
          trend: null,
        },
      });

      const useHook = createQuestionsDataHook(mockFetch);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchQuestionsData).toBeInstanceOf(Function);
      expect(result.current.reset).toBeInstanceOf(Function);
      expect(result.current.data).toBeNull();
    });
  });
});
