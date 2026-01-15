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
const recommendedClassLessonSubjectSchema = z.object({
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
 * Schema for lesson in recommendedClass
 */
const recommendedClassLessonSchema = z.object({
  id: z.string(),
  content: lessonContentSchema,
  subtopic: lessonContentSchema,
  topic: lessonContentSchema,
  subject: recommendedClassLessonSubjectSchema,
});

/**
 * Schema for lesson progress
 */
const recommendedClassLessonProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  lessonId: z.string(),
  progress: z.number(),
  lesson: recommendedClassLessonSchema,
});

/**
 * Schema for lesson recommendedClass item
 */
const recommendedClassLessonsItemSchema = z.object({
  recommendedClassId: z.string(),
  supLessonsProgressId: z.string(),
  supLessonsProgress: recommendedClassLessonProgressSchema,
});

/**
 * Schema for recommendedClass metadata from /recommendedClass/{id}
 */
const recommendedClassMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDate: z.string(),
  finalDate: z.string(),
  progress: z.number(),
  lessons: z.array(recommendedClassLessonsItemSchema),
});

/**
 * Schema for /recommendedClass/{id} API response
 */
export const recommendedClassApiResponseSchema = z.object({
  message: z.string(),
  data: recommendedClassMetadataSchema,
});

/**
 * Schema for student in details
 */
const recommendedClassDetailStudentSchema = z.object({
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
const recommendedClassDetailAggregatedSchema = z.object({
  completionPercentage: z.number(),
  avgScore: z.number().nullable(),
});

/**
 * Schema for content performance item
 */
const recommendedClassDetailContentPerformanceItemSchema = z
  .object({
    contentId: z.string(),
    contentName: z.string(),
    rate: z.number(),
  })
  .nullable();

/**
 * Schema for content performance
 */
const recommendedClassDetailContentPerformanceSchema = z.object({
  best: recommendedClassDetailContentPerformanceItemSchema,
  worst: recommendedClassDetailContentPerformanceItemSchema,
});

/**
 * Schema for details data from /recommendedClass/{id}/details
 */
const recommendedClassDetailsDataSchema = z.object({
  students: z.array(recommendedClassDetailStudentSchema),
  aggregated: recommendedClassDetailAggregatedSchema,
  contentPerformance: recommendedClassDetailContentPerformanceSchema,
});

/**
 * Schema for /recommendedClass/{id}/details API response
 */
export const recommendedClassDetailsApiResponseSchema = z.object({
  message: z.string(),
  data: recommendedClassDetailsDataSchema,
});

/**
 * Schema for breakdown item from history
 */
const recommendedClassBreakdownSchema = z.object({
  classId: z.string().uuid(),
  className: z.string(),
  schoolId: z.string(),
  schoolName: z.string(),
  studentCount: z.number(),
  completedCount: z.number(),
});

/**
 * Schema for history recommendedClass item (partial, only what we need)
 */
const historyRecommendedClassItemSchema = z.object({
  recommendedClass: z.object({ id: z.string().uuid() }),
  breakdown: z.array(recommendedClassBreakdownSchema),
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
  /** Fetch recommendedClass metadata from /recommendedClass/{id} */
  fetchRecommendedClass: (id: string) => Promise<RecommendedClassApiResponse>;
  /** Fetch recommendedClass details from /recommendedClass/{id}/details */
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
 *     const response = await api.get(`/recommendedClass/${id}`);
 *     return response.data;
 *   },
 *   fetchRecommendedClassDetails: async (id) => {
 *     const response = await api.get(`/recommendedClass/${id}/details`);
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
 * const { data, loading, error, refetch } = useRecommendedClassDetails('recommendedClass-id-123');
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
        // Fetch recommendedClass metadata and details in parallel
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

        const [recommendedClassResponse, detailsResponse, historyResponse] =
          await Promise.all(promises);

        // Validate responses with Zod
        const validatedRecommendedClass =
          recommendedClassApiResponseSchema.parse(recommendedClassResponse);
        const validatedDetails =
          recommendedClassDetailsApiResponseSchema.parse(detailsResponse);

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
