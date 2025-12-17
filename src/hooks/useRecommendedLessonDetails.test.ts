import { renderHook, waitFor, act } from '@testing-library/react';
import { z } from 'zod';
import {
  createUseRecommendedLessonDetails,
  createRecommendedLessonDetailsHook,
  handleLessonDetailsFetchError,
  goalApiResponseSchema,
  goalDetailsApiResponseSchema,
  historyApiResponseSchema,
} from './useRecommendedLessonDetails';
import type {
  GoalApiResponse,
  GoalDetailsApiResponse,
  GoalsHistoryApiResponse,
} from '../types/recommendedLessons';
import type { LessonDetailsApiClient } from './useRecommendedLessonDetails';

describe('useRecommendedLessonDetails', () => {
  // Mock API responses
  const mockGoalResponse: GoalApiResponse = {
    message: 'Success',
    data: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Aula de Matemática',
      startDate: '2024-06-01',
      finalDate: '2024-12-31',
      progress: 50,
      lessonsGoals: [
        {
          goalId: '123e4567-e89b-12d3-a456-426614174000',
          supLessonsProgressId: 'progress-1',
          supLessonsProgress: {
            id: 'progress-1',
            userId: 'user-1',
            lessonId: 'lesson-1',
            progress: 50,
            lesson: {
              id: 'lesson-1',
              content: { id: 'content-1', name: 'Frações' },
              subtopic: { id: 'subtopic-1', name: 'Números' },
              topic: { id: 'topic-1', name: 'Matemática Básica' },
              subject: {
                id: 'subject-1',
                name: 'Matemática',
                color: '#4CAF50',
                icon: 'math',
              },
            },
          },
        },
      ],
    },
  };

  const mockDetailsResponse: GoalDetailsApiResponse = {
    message: 'Success',
    data: {
      students: [
        {
          userInstitutionId: 'user-inst-1',
          userId: 'user-1',
          name: 'João Silva',
          progress: 100,
          completedAt: '2024-07-01T10:00:00Z',
          avgScore: 85,
          daysToComplete: 5,
        },
        {
          userInstitutionId: 'user-inst-2',
          userId: 'user-2',
          name: 'Maria Santos',
          progress: 50,
          completedAt: null,
          avgScore: null,
          daysToComplete: null,
        },
      ],
      aggregated: {
        completionPercentage: 75,
        avgScore: 85,
      },
      contentPerformance: {
        best: {
          contentId: 'content-1',
          contentName: 'Frações',
          rate: 95,
        },
        worst: {
          contentId: 'content-2',
          contentName: 'Decimais',
          rate: 65,
        },
      },
    },
  };

  const mockHistoryResponse: GoalsHistoryApiResponse = {
    message: 'Success',
    data: {
      goals: [
        {
          goal: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Aula de Matemática',
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

  describe('handleLessonDetailsFetchError', () => {
    it('should return specific message for Zod errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['data', 'students'],
          message: 'Expected string, received number',
        },
      ]);

      const result = handleLessonDetailsFetchError(zodError);
      expect(result).toBe('Erro ao validar dados dos detalhes da aula');

      consoleErrorSpy.mockRestore();
    });

    it('should return generic message for other errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const genericError = new Error('Network error');
      const result = handleLessonDetailsFetchError(genericError);
      expect(result).toBe('Erro ao carregar detalhes da aula');

      consoleErrorSpy.mockRestore();
    });

    it('should return generic message for unknown error types', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = handleLessonDetailsFetchError('string error');
      expect(result).toBe('Erro ao carregar detalhes da aula');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('goalApiResponseSchema', () => {
    it('should validate a valid goal API response', () => {
      const result = goalApiResponseSchema.safeParse(mockGoalResponse);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          id: '123',
          // missing other required fields
        },
      };

      const result = goalApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('goalDetailsApiResponseSchema', () => {
    it('should validate a valid details API response', () => {
      const result =
        goalDetailsApiResponseSchema.safeParse(mockDetailsResponse);
      expect(result.success).toBe(true);
    });

    it('should validate response with null content performance', () => {
      const responseWithNulls = {
        message: 'Success',
        data: {
          students: [],
          aggregated: {
            completionPercentage: 0,
            avgScore: null,
          },
          contentPerformance: {
            best: null,
            worst: null,
          },
        },
      };

      const result = goalDetailsApiResponseSchema.safeParse(responseWithNulls);
      expect(result.success).toBe(true);
    });

    it('should reject invalid student data', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          students: [
            {
              userInstitutionId: 'user-inst-1',
              // missing required fields
            },
          ],
          aggregated: {
            completionPercentage: 0,
            avgScore: null,
          },
          contentPerformance: {
            best: null,
            worst: null,
          },
        },
      };

      const result = goalDetailsApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('historyApiResponseSchema', () => {
    it('should validate a valid history API response', () => {
      const result = historyApiResponseSchema.safeParse(mockHistoryResponse);
      expect(result.success).toBe(true);
    });

    it('should validate empty goals array', () => {
      const emptyResponse = {
        message: 'Success',
        data: {
          goals: [],
          total: 0,
        },
      };

      const result = historyApiResponseSchema.safeParse(emptyResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid goal id format', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          goals: [
            {
              goal: { id: 'not-a-uuid' },
              breakdown: [],
            },
          ],
          total: 1,
        },
      };

      const result = historyApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('createUseRecommendedLessonDetails', () => {
    const LESSON_ID = '123e4567-e89b-12d3-a456-426614174000';

    const createMockApiClient = (): LessonDetailsApiClient => ({
      fetchGoal: jest.fn(),
      fetchGoalDetails: jest.fn(),
      fetchBreakdown: jest.fn(),
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return initial loading state', () => {
      const mockClient = createMockApiClient();
      (mockClient.fetchGoal as jest.Mock).mockReturnValue(
        new Promise(() => {})
      );
      (mockClient.fetchGoalDetails as jest.Mock).mockReturnValue(
        new Promise(() => {})
      );
      (mockClient.fetchBreakdown as jest.Mock).mockReturnValue(
        new Promise(() => {})
      );

      const useDetails = createUseRecommendedLessonDetails(mockClient);
      const { result } = renderHook(() => useDetails(LESSON_ID));

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.refetch).toBeInstanceOf(Function);
    });

    it('should fetch data successfully', async () => {
      const mockClient = createMockApiClient();
      (mockClient.fetchGoal as jest.Mock).mockResolvedValue(mockGoalResponse);
      (mockClient.fetchGoalDetails as jest.Mock).mockResolvedValue(
        mockDetailsResponse
      );
      (mockClient.fetchBreakdown as jest.Mock).mockResolvedValue(
        mockHistoryResponse
      );

      const useDetails = createUseRecommendedLessonDetails(mockClient);
      const { result } = renderHook(() => useDetails(LESSON_ID));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).not.toBeNull();
      expect(result.current.data?.goal.title).toBe('Aula de Matemática');
      expect(result.current.data?.details.students).toHaveLength(2);
      expect(result.current.data?.breakdown?.className).toBe('Turma A');
      expect(result.current.error).toBeNull();

      expect(mockClient.fetchGoal).toHaveBeenCalledWith(LESSON_ID);
      expect(mockClient.fetchGoalDetails).toHaveBeenCalledWith(LESSON_ID);
      expect(mockClient.fetchBreakdown).toHaveBeenCalledWith(LESSON_ID);
    });

    it('should work without fetchBreakdown', async () => {
      const mockClient: LessonDetailsApiClient = {
        fetchGoal: jest.fn().mockResolvedValue(mockGoalResponse),
        fetchGoalDetails: jest.fn().mockResolvedValue(mockDetailsResponse),
        // No fetchBreakdown
      };

      const useDetails = createUseRecommendedLessonDetails(mockClient);
      const { result } = renderHook(() => useDetails(LESSON_ID));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).not.toBeNull();
      expect(result.current.data?.goal.title).toBe('Aula de Matemática');
      expect(result.current.data?.breakdown).toBeUndefined();
      expect(result.current.error).toBeNull();
    });

    it('should handle missing lessonId', async () => {
      const mockClient = createMockApiClient();

      const useDetails = createUseRecommendedLessonDetails(mockClient);
      const { result } = renderHook(() => useDetails(undefined));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('ID da aula não encontrado');
      expect(mockClient.fetchGoal).not.toHaveBeenCalled();
    });

    it('should handle fetch error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockClient = createMockApiClient();
      (mockClient.fetchGoal as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );
      (mockClient.fetchGoalDetails as jest.Mock).mockResolvedValue(
        mockDetailsResponse
      );

      const useDetails = createUseRecommendedLessonDetails(mockClient);
      const { result } = renderHook(() => useDetails(LESSON_ID));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Erro ao carregar detalhes da aula');

      consoleErrorSpy.mockRestore();
    });

    it('should handle validation error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockClient = createMockApiClient();
      (mockClient.fetchGoal as jest.Mock).mockResolvedValue({
        message: 'Success',
        data: { invalid: 'data' },
      });
      (mockClient.fetchGoalDetails as jest.Mock).mockResolvedValue(
        mockDetailsResponse
      );

      const useDetails = createUseRecommendedLessonDetails(mockClient);
      const { result } = renderHook(() => useDetails(LESSON_ID));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(
        'Erro ao validar dados dos detalhes da aula'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should refetch data when lessonId changes', async () => {
      const SECOND_LESSON_ID = '223e4567-e89b-12d3-a456-426614174001';

      const mockClient = createMockApiClient();
      (mockClient.fetchGoal as jest.Mock).mockResolvedValue(mockGoalResponse);
      (mockClient.fetchGoalDetails as jest.Mock).mockResolvedValue(
        mockDetailsResponse
      );
      (mockClient.fetchBreakdown as jest.Mock).mockResolvedValue(
        mockHistoryResponse
      );

      const useDetails = createUseRecommendedLessonDetails(mockClient);
      const { result, rerender } = renderHook(({ id }) => useDetails(id), {
        initialProps: { id: LESSON_ID },
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockClient.fetchGoal).toHaveBeenCalledWith(LESSON_ID);

      // Change lessonId
      rerender({ id: SECOND_LESSON_ID });

      await waitFor(() => {
        expect(mockClient.fetchGoal).toHaveBeenCalledWith(SECOND_LESSON_ID);
      });
    });

    it('should allow manual refetch', async () => {
      const mockClient = createMockApiClient();
      (mockClient.fetchGoal as jest.Mock).mockResolvedValue(mockGoalResponse);
      (mockClient.fetchGoalDetails as jest.Mock).mockResolvedValue(
        mockDetailsResponse
      );
      (mockClient.fetchBreakdown as jest.Mock).mockResolvedValue(
        mockHistoryResponse
      );

      const useDetails = createUseRecommendedLessonDetails(mockClient);
      const { result } = renderHook(() => useDetails(LESSON_ID));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockClient.fetchGoal).toHaveBeenCalledTimes(1);

      // Manual refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockClient.fetchGoal).toHaveBeenCalledTimes(2);
    });

    it('should handle breakdown not found in history', async () => {
      const DIFFERENT_ID = '999e4567-e89b-12d3-a456-426614174999';

      const mockClient = createMockApiClient();
      (mockClient.fetchGoal as jest.Mock).mockResolvedValue(mockGoalResponse);
      (mockClient.fetchGoalDetails as jest.Mock).mockResolvedValue(
        mockDetailsResponse
      );
      (mockClient.fetchBreakdown as jest.Mock).mockResolvedValue({
        message: 'Success',
        data: {
          goals: [
            {
              goal: { id: DIFFERENT_ID },
              breakdown: [
                {
                  classId: '123e4567-e89b-12d3-a456-426614174003',
                  className: 'Turma B',
                  schoolId: 'school-1',
                  schoolName: 'Escola',
                  studentCount: 20,
                  completedCount: 10,
                },
              ],
            },
          ],
          total: 1,
        },
      });

      const useDetails = createUseRecommendedLessonDetails(mockClient);
      const { result } = renderHook(() => useDetails(LESSON_ID));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).not.toBeNull();
      expect(result.current.data?.breakdown).toBeUndefined();
    });
  });

  describe('createRecommendedLessonDetailsHook', () => {
    it('should be an alias for createUseRecommendedLessonDetails', () => {
      expect(createRecommendedLessonDetailsHook).toBe(
        createUseRecommendedLessonDetails
      );
    });

    it('should create a functional hook', async () => {
      const LESSON_ID = '123e4567-e89b-12d3-a456-426614174000';

      const mockClient: LessonDetailsApiClient = {
        fetchGoal: jest.fn().mockResolvedValue(mockGoalResponse),
        fetchGoalDetails: jest.fn().mockResolvedValue(mockDetailsResponse),
      };

      const useHook = createRecommendedLessonDetailsHook(mockClient);
      const { result } = renderHook(() => useHook(LESSON_ID));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.refetch).toBeInstanceOf(Function);
      expect(result.current.data).not.toBeNull();
    });
  });
});
