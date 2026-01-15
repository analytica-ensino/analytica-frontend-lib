import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import type {
  LessonDetailsData,
  RecommendedClassMetadata,
  RecommendedClassDetailsData,
  RecommendedClassBreakdown,
  RecommendedClassApiResponse,
  RecommendedClassDetailsApiResponse,
  RecommendedClassHistoryApiResponse,
} from '../types/recommendedLessons';

// ============================================
// Zod Schemas for API Response Validation
// ============================================

/**
 * Schema for subject in lesson
 */
const goalLessonSubjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
});

/**
 * Schema for lesson content/subtopic/topic
 */
const lessonContentSchema = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * Schema for lesson in goal
 */
const goalLessonSchema = z.object({
  id: z.string(),
  content: lessonContentSchema,
  subtopic: lessonContentSchema,
  topic: lessonContentSchema,
  subject: goalLessonSubjectSchema,
});

/**
 * Schema for lesson progress
 */
const goalLessonProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  lessonId: z.string(),
  progress: z.number(),
  lesson: goalLessonSchema,
});

/**
 * Schema for lesson goal item
 */
const goalLessonRecommendedClassItemSchema = z.object({
  recommendedClassId: z.string(),
  supLessonsProgressId: z.string(),
  supLessonsProgress: goalLessonProgressSchema,
});

/**
 * Schema for goal metadata from /goals/{id}
 */
const goalMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDate: z.string(),
  finalDate: z.string(),
  progress: z.number(),
  lessons: z.array(goalLessonRecommendedClassItemSchema),
});

/**
 * Schema for /goals/{id} API response
 */
export const goalApiResponseSchema = z.object({
  message: z.string(),
  data: goalMetadataSchema,
});

/**
 * Schema for student in details
 */
const goalDetailStudentSchema = z.object({
  userInstitutionId: z.string(),
  userId: z.string(),
  name: z.string(),
  progress: z.number(),
  completedAt: z.string().nullable(),
  avgScore: z.number().nullable(),
  daysToComplete: z.number().nullable(),
});

/**
 * Schema for aggregated stats
 */
const goalDetailAggregatedSchema = z.object({
  completionPercentage: z.number(),
  avgScore: z.number().nullable(),
});

/**
 * Schema for content performance item
 */
const goalDetailContentPerformanceItemSchema = z
  .object({
    contentId: z.string(),
    contentName: z.string(),
    rate: z.number(),
  })
  .nullable();

/**
 * Schema for content performance
 */
const goalDetailContentPerformanceSchema = z.object({
  best: goalDetailContentPerformanceItemSchema,
  worst: goalDetailContentPerformanceItemSchema,
});

/**
 * Schema for details data from /goals/{id}/details
 */
const goalDetailsDataSchema = z.object({
  students: z.array(goalDetailStudentSchema),
  aggregated: goalDetailAggregatedSchema,
  contentPerformance: goalDetailContentPerformanceSchema,
});

/**
 * Schema for /goals/{id}/details API response
 */
export const goalDetailsApiResponseSchema = z.object({
  message: z.string(),
  data: goalDetailsDataSchema,
});

/**
 * Schema for breakdown item from history
 */
const goalBreakdownSchema = z.object({
  classId: z.string().uuid(),
  className: z.string(),
  schoolId: z.string(),
  schoolName: z.string(),
  studentCount: z.number(),
  completedCount: z.number(),
});

/**
 * Schema for history goal item (partial, only what we need)
 */
const historyRecommendedClassItemSchema = z.object({
  recommendedClass: z.object({ id: z.string().uuid() }),
  breakdown: z.array(goalBreakdownSchema),
});

/**
 * Schema for history API response (partial)
 */
export const historyApiResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    recommendedClass: z.array(historyRecommendedClassItemSchema),
    total: z.number(),
  }),
});

// ============================================
// Hook Types
// ============================================

/**
 * Hook state interface
 */
export interface UseRecommendedLessonDetailsState {
  data: LessonDetailsData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseRecommendedLessonDetailsReturn
  extends UseRecommendedLessonDetailsState {
  refetch: () => Promise<void>;
}

/**
 * API client interface for fetching lesson details
 */
export interface LessonDetailsApiClient {
  /** Fetch goal metadata from /goals/{id} */
  fetchRecommendedClass: (id: string) => Promise<RecommendedClassApiResponse>;
  /** Fetch goal details from /goals/{id}/details */
  fetchRecommendedClassDetails: (
    id: string
  ) => Promise<RecommendedClassDetailsApiResponse>;
  /** Optional: Fetch breakdown from /recommended-class/history */
  fetchBreakdown?: (id: string) => Promise<RecommendedClassHistoryApiResponse>;
}

// ============================================
// Error Handling
// ============================================

/**
 * Handle errors during lesson details fetch
 * @param error - Error object
 * @returns Error message for UI display
 */
export const handleLessonDetailsFetchError = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    console.error('Erro ao validar dados dos detalhes da aula:', error);
    return 'Erro ao validar dados dos detalhes da aula';
  }

  console.error('Erro ao carregar detalhes da aula:', error);
  return 'Erro ao carregar detalhes da aula';
};

// ============================================
// Hook Factory
// ============================================

/**
 * Factory function to create useRecommendedLessonDetails hook
 *
 * @param apiClient - Object containing API fetch functions
 * @returns Hook for managing recommended lesson details
 *
 * @example
 * ```tsx
 * // In your app setup
 * const apiClient = {
 *   fetchRecommendedClass: async (id) => {
 *     const response = await api.get(`/goals/${id}`);
 *     return response.data;
 *   },
 *   fetchRecommendedClassDetails: async (id) => {
 *     const response = await api.get(`/goals/${id}/details`);
 *     return response.data;
 *   },
 *   fetchBreakdown: async (id) => {
 *     const response = await api.get(`/recommended-class/history?search=${id}&limit=1`);
 *     return response.data;
 *   },
 * };
 *
 * const useRecommendedClassDetails = createUseRecommendedLessonDetails(apiClient);
 *
 * // In your component
 * const { data, loading, error, refetch } = useRecommendedClassDetails('goal-id-123');
 * ```
 */
export const createUseRecommendedLessonDetails = (
  apiClient: LessonDetailsApiClient
) => {
  return (lessonId: string | undefined): UseRecommendedLessonDetailsReturn => {
    const [state, setState] = useState<UseRecommendedLessonDetailsState>({
      data: null,
      loading: true,
      error: null,
    });

    /**
     * Fetch lesson details from multiple API endpoints
     */
    const fetchLessonDetails = useCallback(async () => {
      if (!lessonId) {
        setState({
          data: null,
          loading: false,
          error: 'ID da aula não encontrado',
        });
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Fetch goal metadata and details in parallel
        // Breakdown is optional
        const promises: [
          Promise<RecommendedClassApiResponse>,
          Promise<RecommendedClassDetailsApiResponse>,
          Promise<RecommendedClassHistoryApiResponse | null>,
        ] = [
          apiClient.fetchRecommendedClass(lessonId),
          apiClient.fetchRecommendedClassDetails(lessonId),
          apiClient.fetchBreakdown
            ? apiClient.fetchBreakdown(lessonId)
            : Promise.resolve(null),
        ];

        const [goalResponse, detailsResponse, historyResponse] =
          await Promise.all(promises);

        // Validate responses with Zod
        const validatedRecommendedClass =
          goalApiResponseSchema.parse(goalResponse);
        const validatedDetails =
          goalDetailsApiResponseSchema.parse(detailsResponse);

        // Extract and validate breakdown if available
        let breakdown: RecommendedClassBreakdown | undefined;
        if (historyResponse) {
          const validatedHistory =
            historyApiResponseSchema.parse(historyResponse);
          const historyItem = validatedHistory.data.recommendedClass.find(
            (g) => g.recommendedClass.id === lessonId
          );
          breakdown = historyItem?.breakdown[0];
        }

        // Combine data
        const lessonData: LessonDetailsData = {
          recommendedClass:
            validatedRecommendedClass.data as RecommendedClassMetadata,
          details: validatedDetails.data as RecommendedClassDetailsData,
          breakdown,
        };

        setState({
          data: lessonData,
          loading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = handleLessonDetailsFetchError(error);
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
      }
    }, [lessonId]);

    // Fetch on mount and when lessonId changes
    useEffect(() => {
      fetchLessonDetails();
    }, [fetchLessonDetails]);

    return {
      ...state,
      refetch: fetchLessonDetails,
    };
  };
};

/**
 * Alias for createUseRecommendedLessonDetails
 */
export const createRecommendedLessonDetailsHook =
  createUseRecommendedLessonDetails;
