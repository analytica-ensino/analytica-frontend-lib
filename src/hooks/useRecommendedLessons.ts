import { useState, useCallback } from 'react';
import { z } from 'zod';
import dayjs from 'dayjs';
import { RecommendedClassDisplayStatus } from '../types/recommendedLessons';
import type {
  RecommendedClassHistoryItem,
  RecommendedClassTableItem,
  RecommendedClassHistoryApiResponse,
  RecommendedClassHistoryFilters,
  RecommendedClassHistoryPagination,
} from '../types/recommendedLessons';

/**
 * Zod schema for recommendedClass history API response validation
 * Based on /recommended-class/history endpoint
 */
const recommendedClassSubjectSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
  })
  .nullable();

const recommendedClassCreatorSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
  })
  .nullable();

const recommendedClassStatsSchema = z.object({
  totalStudents: z.number(),
  completedCount: z.number(),
  completionPercentage: z.number(),
});

const recommendedClassBreakdownSchema = z.object({
  classId: z.string().uuid(),
  className: z.string(),
  schoolId: z.string(),
  schoolName: z.string(),
  studentCount: z.number(),
  completedCount: z.number(),
});

const recommendedClassDataSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  startDate: z.string().nullable(),
  finalDate: z.string().nullable(),
  createdAt: z.string(),
  progress: z.number(),
  totalLessons: z.number(),
});

const recommendedClassHistoryItemSchema = z.object({
  recommendedClass: recommendedClassDataSchema,
  subject: recommendedClassSubjectSchema,
  creator: recommendedClassCreatorSchema,
  stats: recommendedClassStatsSchema,
  breakdown: z.array(recommendedClassBreakdownSchema),
});

export const recommendedClasssHistoryApiResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    recommendedClass: z.array(recommendedClassHistoryItemSchema),
    total: z.number(),
  }),
});

/**
 * Hook state interface
 */
export interface UseRecommendedLessonsHistoryState {
  recommendedClass: RecommendedClassTableItem[];
  loading: boolean;
  error: string | null;
  pagination: RecommendedClassHistoryPagination;
}

/**
 * Hook return type
 */
export interface UseRecommendedLessonsHistoryReturn
  extends UseRecommendedLessonsHistoryState {
  fetchRecommendedClass: (
    filters?: RecommendedClassHistoryFilters
  ) => Promise<void>;
}

/**
 * Determine status based on dates and completion
 * @param finalDate - RecommendedClass final date
 * @param completionPercentage - Completion percentage
 * @returns Display status for UI
 */
export const determineRecommendedClassStatus = (
  finalDate: string | null,
  completionPercentage: number
): RecommendedClassDisplayStatus => {
  if (completionPercentage === 100) {
    return RecommendedClassDisplayStatus.CONCLUIDA;
  }

  if (finalDate) {
    const now = dayjs();
    const deadline = dayjs(finalDate);
    if (deadline.isBefore(now)) {
      return RecommendedClassDisplayStatus.VENCIDA;
    }
  }

  return RecommendedClassDisplayStatus.ATIVA;
};

/**
 * Transform API response to table item format
 * @param item - RecommendedClass history item from API response
 * @returns Formatted recommendedClass for table display
 */
export const transformRecommendedClassToTableItem = (
  item: RecommendedClassHistoryItem
): RecommendedClassTableItem => {
  // Get first breakdown for school/class info (or aggregate)
  const firstBreakdown = item.breakdown[0];
  const schoolName = firstBreakdown?.schoolName || '-';
  const className = firstBreakdown?.className || '-';

  // If multiple classes, show count
  const classDisplay =
    item.breakdown.length > 1 ? `${item.breakdown.length} turmas` : className;

  return {
    id: item.recommendedClass.id,
    startDate: item.recommendedClass.startDate
      ? dayjs(item.recommendedClass.startDate).format('DD/MM')
      : '-',
    deadline: item.recommendedClass.finalDate
      ? dayjs(item.recommendedClass.finalDate).format('DD/MM')
      : '-',
    title: item.recommendedClass.title,
    school: schoolName,
    year: '-', // API doesn't provide year directly
    subject: item.subject?.name || '-',
    class: classDisplay,
    status: determineRecommendedClassStatus(
      item.recommendedClass.finalDate,
      item.stats.completionPercentage
    ),
    completionPercentage: item.stats.completionPercentage,
  };
};

/**
 * Handle errors during recommendedClass fetch
 * @param error - Error object
 * @returns Error message for UI display
 */
export const handleRecommendedClassFetchError = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    console.error('Erro ao validar dados de histórico de aulas:', error);
    return 'Erro ao validar dados de histórico de aulas';
  }

  console.error('Erro ao carregar histórico de aulas:', error);
  return 'Erro ao carregar histórico de aulas';
};

/**
 * Factory function to create useRecommendedLessonsHistory hook
 *
 * @param fetchRecommendedClassHistory - Function to fetch recommendedClasss from API
 * @returns Hook for managing recommended lessons history
 *
 * @example
 * ```tsx
 * // In your app setup
 * const fetchRecommendedClassHistory = async (filters) => {
 *   const response = await api.get('/recommended-class/history', { params: filters });
 *   return response.data;
 * };
 *
 * const useRecommendedClassHistory = createUseRecommendedLessonsHistory(fetchRecommendedClassHistory);
 *
 * // In your component
 * const { recommendedClasss, loading, error, pagination, fetchRecommendedClass } = useRecommendedClassHistory();
 * ```
 */
export const createUseRecommendedLessonsHistory = (
  fetchRecommendedClassHistory: (
    filters?: RecommendedClassHistoryFilters
  ) => Promise<RecommendedClassHistoryApiResponse>
) => {
  return (): UseRecommendedLessonsHistoryReturn => {
    const [state, setState] = useState<UseRecommendedLessonsHistoryState>({
      recommendedClass: [],
      loading: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });

    /**
     * Fetch recommendedClasss history from API
     * @param filters - Optional filters for pagination, search, sorting, etc.
     */
    const fetchRecommendedClass = useCallback(
      async (filters?: RecommendedClassHistoryFilters) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
          // Fetch data from API
          const responseData = await fetchRecommendedClassHistory(filters);

          // Validate response with Zod
          const validatedData =
            recommendedClasssHistoryApiResponseSchema.parse(responseData);

          // Transform recommendedClasss to table format
          const tableItems = validatedData.data.recommendedClass.map(
            transformRecommendedClassToTableItem
          );

          // Calculate pagination from total
          const page = filters?.page || 1;
          const limit = filters?.limit || 10;
          const total = validatedData.data.total;
          const totalPages = Math.ceil(total / limit);

          // Update state with validated and transformed data
          setState({
            recommendedClass: tableItems,
            loading: false,
            error: null,
            pagination: {
              total,
              page,
              limit,
              totalPages,
            },
          });
        } catch (error) {
          const errorMessage = handleRecommendedClassFetchError(error);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        }
      },
      [fetchRecommendedClassHistory]
    );

    return {
      ...state,
      fetchRecommendedClass,
    };
  };
};

/**
 * Alias for createUseRecommendedLessonsHistory
 */
export const createRecommendedLessonsHistoryHook =
  createUseRecommendedLessonsHistory;
