import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import {
  createUseStudentsHighlight,
  createStudentsHighlightHook,
  calculatePerformancePercentage,
  transformStudentHighlightItem,
  handleStudentsHighlightFetchError,
  studentsHighlightApiResponseSchema,
} from './useStudentsHighlight';
import type {
  StudentHighlightApiItem,
  StudentsHighlightApiResponse,
  StudentsHighlightFilters,
} from './useStudentsHighlight';

describe('useStudentsHighlight', () => {
  describe('calculatePerformancePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePerformancePercentage(80, 100)).toBe(80);
      expect(calculatePerformancePercentage(3, 4)).toBe(75);
      expect(calculatePerformancePercentage(10, 10)).toBe(100);
    });

    it('should return 0 when totalQuestions is 0', () => {
      expect(calculatePerformancePercentage(0, 0)).toBe(0);
      expect(calculatePerformancePercentage(5, 0)).toBe(0);
    });

    it('should round the percentage', () => {
      expect(calculatePerformancePercentage(1, 3)).toBe(33);
      expect(calculatePerformancePercentage(2, 3)).toBe(67);
    });
  });

  describe('transformStudentHighlightItem', () => {
    const baseApiItem: StudentHighlightApiItem = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Valentina Ribeiro',
      correctAnswers: 90,
      incorrectAnswers: 10,
      totalQuestions: 100,
      trend: 5.2,
      trendDirection: 'up',
    };

    it('should transform student item correctly', () => {
      const result = transformStudentHighlightItem(baseApiItem, 1);

      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.position).toBe(1);
      expect(result.name).toBe('Valentina Ribeiro');
      expect(result.percentage).toBe(90);
      expect(result.correctAnswers).toBe(90);
      expect(result.incorrectAnswers).toBe(10);
      expect(result.totalQuestions).toBe(100);
      expect(result.trend).toBe(5.2);
      expect(result.trendDirection).toBe('up');
    });

    it('should calculate percentage from correct and total', () => {
      const item: StudentHighlightApiItem = {
        ...baseApiItem,
        correctAnswers: 75,
        totalQuestions: 100,
      };

      const result = transformStudentHighlightItem(item, 2);
      expect(result.percentage).toBe(75);
    });

    it('should handle null trend values', () => {
      const item: StudentHighlightApiItem = {
        ...baseApiItem,
        trend: null,
        trendDirection: null,
      };

      const result = transformStudentHighlightItem(item, 3);
      expect(result.trend).toBeNull();
      expect(result.trendDirection).toBeNull();
    });

    it('should handle zero total questions', () => {
      const item: StudentHighlightApiItem = {
        ...baseApiItem,
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalQuestions: 0,
      };

      const result = transformStudentHighlightItem(item, 1);
      expect(result.percentage).toBe(0);
    });

    it('should set position correctly for different positions', () => {
      expect(transformStudentHighlightItem(baseApiItem, 1).position).toBe(1);
      expect(transformStudentHighlightItem(baseApiItem, 2).position).toBe(2);
      expect(transformStudentHighlightItem(baseApiItem, 3).position).toBe(3);
    });
  });

  describe('handleStudentsHighlightFetchError', () => {
    it('should return specific message for Zod errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['data', 'topStudents'],
          message: 'Expected string, received number',
        },
      ]);

      const result = handleStudentsHighlightFetchError(zodError);
      expect(result).toBe('Erro ao validar dados de destaque de estudantes');

      consoleErrorSpy.mockRestore();
    });

    it('should return generic message for other errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const genericError = new Error('Network error');
      const result = handleStudentsHighlightFetchError(genericError);
      expect(result).toBe('Erro ao carregar destaque de estudantes');

      consoleErrorSpy.mockRestore();
    });

    it('should return generic message for unknown error types', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = handleStudentsHighlightFetchError('string error');
      expect(result).toBe('Erro ao carregar destaque de estudantes');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('studentsHighlightApiResponseSchema', () => {
    it('should validate a valid API response', () => {
      const validResponse = {
        message: 'Success',
        data: {
          topStudents: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Valentina Ribeiro',
              correctAnswers: 90,
              incorrectAnswers: 10,
              totalQuestions: 100,
              trend: 5.2,
              trendDirection: 'up',
            },
          ],
          bottomStudents: [
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              name: 'Ricardo Silva',
              correctAnswers: 40,
              incorrectAnswers: 60,
              totalQuestions: 100,
              trend: -3.1,
              trendDirection: 'down',
            },
          ],
        },
      };

      const result =
        studentsHighlightApiResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate response with null trend values', () => {
      const responseWithNulls = {
        message: 'Success',
        data: {
          topStudents: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Student',
              correctAnswers: 80,
              incorrectAnswers: 20,
              totalQuestions: 100,
              trend: null,
              trendDirection: null,
            },
          ],
          bottomStudents: [],
        },
      };

      const result =
        studentsHighlightApiResponseSchema.safeParse(responseWithNulls);
      expect(result.success).toBe(true);
    });

    it('should validate response with stable trend', () => {
      const responseWithStable = {
        message: 'Success',
        data: {
          topStudents: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Student',
              correctAnswers: 80,
              incorrectAnswers: 20,
              totalQuestions: 100,
              trend: 0,
              trendDirection: 'stable',
            },
          ],
          bottomStudents: [],
        },
      };

      const result =
        studentsHighlightApiResponseSchema.safeParse(responseWithStable);
      expect(result.success).toBe(true);
    });

    it('should validate empty arrays', () => {
      const emptyResponse = {
        message: 'Success',
        data: {
          topStudents: [],
          bottomStudents: [],
        },
      };

      const result =
        studentsHighlightApiResponseSchema.safeParse(emptyResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid student id format', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          topStudents: [
            {
              id: 'not-a-uuid',
              name: 'Student',
              correctAnswers: 80,
              incorrectAnswers: 20,
              totalQuestions: 100,
              trend: null,
              trendDirection: null,
            },
          ],
          bottomStudents: [],
        },
      };

      const result =
        studentsHighlightApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject invalid trend direction', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          topStudents: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Student',
              correctAnswers: 80,
              incorrectAnswers: 20,
              totalQuestions: 100,
              trend: 5,
              trendDirection: 'invalid',
            },
          ],
          bottomStudents: [],
        },
      };

      const result =
        studentsHighlightApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject negative correctAnswers', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          topStudents: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Student',
              correctAnswers: -10,
              incorrectAnswers: 20,
              totalQuestions: 100,
              trend: null,
              trendDirection: null,
            },
          ],
          bottomStudents: [],
        },
      };

      const result =
        studentsHighlightApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const missingFields = {
        message: 'Success',
        data: {
          topStudents: [],
          // missing bottomStudents
        },
      };

      const result =
        studentsHighlightApiResponseSchema.safeParse(missingFields);
      expect(result.success).toBe(false);
    });
  });

  describe('createUseStudentsHighlight', () => {
    const mockFetchStudentsHighlight = jest.fn<
      Promise<StudentsHighlightApiResponse>,
      [StudentsHighlightFilters?]
    >();

    const validApiResponse: StudentsHighlightApiResponse = {
      message: 'Success',
      data: {
        topStudents: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Valentina Ribeiro',
            correctAnswers: 95,
            incorrectAnswers: 5,
            totalQuestions: 100,
            trend: 5.2,
            trendDirection: 'up',
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Lucas Almeida',
            correctAnswers: 90,
            incorrectAnswers: 10,
            totalQuestions: 100,
            trend: 3.1,
            trendDirection: 'up',
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Fernanda Costa',
            correctAnswers: 88,
            incorrectAnswers: 12,
            totalQuestions: 100,
            trend: 2.0,
            trendDirection: 'stable',
          },
        ],
        bottomStudents: [
          {
            id: '123e4567-e89b-12d3-a456-426614174003',
            name: 'Ricardo Silva',
            correctAnswers: 40,
            incorrectAnswers: 60,
            totalQuestions: 100,
            trend: -5.0,
            trendDirection: 'down',
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174004',
            name: 'Juliana Santos',
            correctAnswers: 45,
            incorrectAnswers: 55,
            totalQuestions: 100,
            trend: -3.2,
            trendDirection: 'down',
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174005',
            name: 'Gabriel Oliveira',
            correctAnswers: 50,
            incorrectAnswers: 50,
            totalQuestions: 100,
            trend: null,
            trendDirection: null,
          },
        ],
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return initial state', () => {
      const useStudentsHighlight = createUseStudentsHighlight(
        mockFetchStudentsHighlight
      );
      const { result } = renderHook(() => useStudentsHighlight());

      expect(result.current.topStudents).toEqual([]);
      expect(result.current.bottomStudents).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.fetchStudentsHighlight).toBeInstanceOf(Function);
      expect(result.current.reset).toBeInstanceOf(Function);
    });

    it('should fetch students highlight successfully', async () => {
      mockFetchStudentsHighlight.mockResolvedValueOnce(validApiResponse);

      const useStudentsHighlight = createUseStudentsHighlight(
        mockFetchStudentsHighlight
      );
      const { result } = renderHook(() => useStudentsHighlight());

      await act(async () => {
        await result.current.fetchStudentsHighlight({ period: '30_DAYS' });
      });

      expect(mockFetchStudentsHighlight).toHaveBeenCalledWith({
        period: '30_DAYS',
      });
      expect(result.current.topStudents).toHaveLength(3);
      expect(result.current.bottomStudents).toHaveLength(3);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should transform students with correct positions', async () => {
      mockFetchStudentsHighlight.mockResolvedValueOnce(validApiResponse);

      const useStudentsHighlight = createUseStudentsHighlight(
        mockFetchStudentsHighlight
      );
      const { result } = renderHook(() => useStudentsHighlight());

      await act(async () => {
        await result.current.fetchStudentsHighlight();
      });

      // Check top students positions
      expect(result.current.topStudents[0].position).toBe(1);
      expect(result.current.topStudents[0].name).toBe('Valentina Ribeiro');
      expect(result.current.topStudents[0].percentage).toBe(95);

      expect(result.current.topStudents[1].position).toBe(2);
      expect(result.current.topStudents[1].name).toBe('Lucas Almeida');
      expect(result.current.topStudents[1].percentage).toBe(90);

      expect(result.current.topStudents[2].position).toBe(3);
      expect(result.current.topStudents[2].name).toBe('Fernanda Costa');
      expect(result.current.topStudents[2].percentage).toBe(88);

      // Check bottom students positions
      expect(result.current.bottomStudents[0].position).toBe(1);
      expect(result.current.bottomStudents[0].name).toBe('Ricardo Silva');
      expect(result.current.bottomStudents[0].percentage).toBe(40);

      expect(result.current.bottomStudents[1].position).toBe(2);
      expect(result.current.bottomStudents[2].position).toBe(3);
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: StudentsHighlightApiResponse) => void;
      const promise = new Promise<StudentsHighlightApiResponse>((resolve) => {
        resolvePromise = resolve;
      });

      mockFetchStudentsHighlight.mockReturnValueOnce(promise);

      const useStudentsHighlight = createUseStudentsHighlight(
        mockFetchStudentsHighlight
      );
      const { result } = renderHook(() => useStudentsHighlight());

      act(() => {
        result.current.fetchStudentsHighlight();
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

      mockFetchStudentsHighlight.mockRejectedValueOnce(
        new Error('Network error')
      );

      const useStudentsHighlight = createUseStudentsHighlight(
        mockFetchStudentsHighlight
      );
      const { result } = renderHook(() => useStudentsHighlight());

      await act(async () => {
        await result.current.fetchStudentsHighlight();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao carregar destaque de estudantes'
      );
      expect(result.current.topStudents).toEqual([]);
      expect(result.current.bottomStudents).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('should handle validation error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const invalidResponse = {
        message: 'Success',
        data: {
          topStudents: 'invalid',
          bottomStudents: [],
        },
      };

      mockFetchStudentsHighlight.mockResolvedValueOnce(
        invalidResponse as unknown as StudentsHighlightApiResponse
      );

      const useStudentsHighlight = createUseStudentsHighlight(
        mockFetchStudentsHighlight
      );
      const { result } = renderHook(() => useStudentsHighlight());

      await act(async () => {
        await result.current.fetchStudentsHighlight();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao validar dados de destaque de estudantes'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should pass filters to API function', async () => {
      mockFetchStudentsHighlight.mockResolvedValueOnce(validApiResponse);

      const useStudentsHighlight = createUseStudentsHighlight(
        mockFetchStudentsHighlight
      );
      const { result } = renderHook(() => useStudentsHighlight());

      const filters: StudentsHighlightFilters = {
        type: 'ACTIVITIES',
        period: '6_MONTHS',
        subjectId: '123e4567-e89b-12d3-a456-426614174000',
        classId: '123e4567-e89b-12d3-a456-426614174001',
      };

      await act(async () => {
        await result.current.fetchStudentsHighlight(filters);
      });

      expect(mockFetchStudentsHighlight).toHaveBeenCalledWith(filters);
    });

    it('should clear error on new fetch', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetchStudentsHighlight.mockRejectedValueOnce(
        new Error('Network error')
      );

      const useStudentsHighlight = createUseStudentsHighlight(
        mockFetchStudentsHighlight
      );
      const { result } = renderHook(() => useStudentsHighlight());

      // First fetch - should fail
      await act(async () => {
        await result.current.fetchStudentsHighlight();
      });

      expect(result.current.error).toBe(
        'Erro ao carregar destaque de estudantes'
      );

      // Second fetch - should clear error
      mockFetchStudentsHighlight.mockResolvedValueOnce(validApiResponse);

      await act(async () => {
        await result.current.fetchStudentsHighlight();
      });

      expect(result.current.error).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should reset state to initial values', async () => {
      mockFetchStudentsHighlight.mockResolvedValueOnce(validApiResponse);

      const useStudentsHighlight = createUseStudentsHighlight(
        mockFetchStudentsHighlight
      );
      const { result } = renderHook(() => useStudentsHighlight());

      // Fetch data first
      await act(async () => {
        await result.current.fetchStudentsHighlight();
      });

      expect(result.current.topStudents).toHaveLength(3);
      expect(result.current.bottomStudents).toHaveLength(3);

      // Reset state
      act(() => {
        result.current.reset();
      });

      expect(result.current.topStudents).toEqual([]);
      expect(result.current.bottomStudents).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle empty response arrays', async () => {
      const emptyResponse: StudentsHighlightApiResponse = {
        message: 'Success',
        data: {
          topStudents: [],
          bottomStudents: [],
        },
      };

      mockFetchStudentsHighlight.mockResolvedValueOnce(emptyResponse);

      const useStudentsHighlight = createUseStudentsHighlight(
        mockFetchStudentsHighlight
      );
      const { result } = renderHook(() => useStudentsHighlight());

      await act(async () => {
        await result.current.fetchStudentsHighlight();
      });

      expect(result.current.topStudents).toEqual([]);
      expect(result.current.bottomStudents).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('createStudentsHighlightHook', () => {
    it('should be an alias for createUseStudentsHighlight', () => {
      expect(createStudentsHighlightHook).toBe(createUseStudentsHighlight);
    });

    it('should create a functional hook', () => {
      const mockFetch = jest.fn().mockResolvedValue({
        message: 'Success',
        data: { topStudents: [], bottomStudents: [] },
      });

      const useHook = createStudentsHighlightHook(mockFetch);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchStudentsHighlight).toBeInstanceOf(Function);
      expect(result.current.reset).toBeInstanceOf(Function);
      expect(result.current.topStudents).toEqual([]);
      expect(result.current.bottomStudents).toEqual([]);
    });
  });
});
