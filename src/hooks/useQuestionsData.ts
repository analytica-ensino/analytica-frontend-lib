import { useState, useCallback } from 'react';
import { z } from 'zod';

/**
 * Period filter options for questions data
 */
export type QuestionsDataPeriod = '7_DAYS' | '30_DAYS' | '6_MONTHS' | '1_YEAR';

/**
 * Trend direction for questions data
 */
export type QuestionsDataTrendDirection = 'up' | 'down' | 'stable';

/**
 * Filters for questions data API request
 */
export interface QuestionsDataFilters {
  period?: QuestionsDataPeriod;
  subjectId?: string;
  schoolYearId?: string;
  classId?: string;
  schoolId?: string;
}

/**
 * Trend information from API response
 */
export interface QuestionsDataTrend {
  totalQuestions: number;
  correctPercentage: number;
  direction: QuestionsDataTrendDirection;
}

/**
 * API response data structure
 */
export interface QuestionsDataApiData {
  totalQuestions: number;
  correctQuestions: number;
  incorrectQuestions: number;
  blankQuestions: number;
  correctPercentage: number;
  incorrectPercentage: number;
  blankPercentage: number;
  trend: QuestionsDataTrend | null;
}

/**
 * API response structure for questions data endpoint
 */
export interface QuestionsDataApiResponse {
  message: string;
  data: QuestionsDataApiData;
}

/**
 * Transformed data for UI display.
 * Extends the basic QuestionsDataItem from component with additional API fields.
 * Can be passed directly to QuestionsData component (extra fields are ignored).
 */
export interface QuestionsDataHookResult {
  /** Total number of questions answered */
  total: number;
  /** Number of correct answers */
  corretas: number;
  /** Number of incorrect answers */
  incorretas: number;
  /** Number of blank (unanswered) questions */
  emBranco: number;
  /** Percentage of correct answers */
  correctPercentage: number;
  /** Percentage of incorrect answers */
  incorrectPercentage: number;
  /** Percentage of blank answers */
  blankPercentage: number;
  /** Trend information */
  trend: QuestionsDataTrend | null;
}

/**
 * Zod schema for trend direction
 */
const trendDirectionSchema = z.enum(['up', 'down', 'stable']);

/**
 * Zod schema for trend object
 */
const trendSchema = z
  .object({
    totalQuestions: z.number(),
    correctPercentage: z.number(),
    direction: trendDirectionSchema,
  })
  .nullable();

/**
 * Zod schema for questions data API response validation
 */
export const questionsDataApiResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    totalQuestions: z.number().min(0),
    correctQuestions: z.number().min(0),
    incorrectQuestions: z.number().min(0),
    blankQuestions: z.number().min(0),
    correctPercentage: z.number().min(0).max(100),
    incorrectPercentage: z.number().min(0).max(100),
    blankPercentage: z.number().min(0).max(100),
    trend: trendSchema,
  }),
});

/**
 * Hook state interface
 */
export interface UseQuestionsDataState {
  data: QuestionsDataHookResult | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseQuestionsDataReturn extends UseQuestionsDataState {
  fetchQuestionsData: (filters?: QuestionsDataFilters) => Promise<void>;
  reset: () => void;
}

/**
 * Transform API response data to component format
 * @param apiData - Data from API response
 * @returns Transformed data for QuestionsData component
 */
export const transformQuestionsData = (
  apiData: QuestionsDataApiData
): QuestionsDataHookResult => ({
  total: apiData.totalQuestions,
  corretas: apiData.correctQuestions,
  incorretas: apiData.incorrectQuestions,
  emBranco: apiData.blankQuestions,
  correctPercentage: apiData.correctPercentage,
  incorrectPercentage: apiData.incorrectPercentage,
  blankPercentage: apiData.blankPercentage,
  trend: apiData.trend,
});

/**
 * Handle errors during questions data fetch
 * @param error - Error object
 * @returns Error message for UI display
 */
export const handleQuestionsDataFetchError = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    console.error('Erro ao validar dados de questões:', error);
    return 'Erro ao validar dados de questões';
  }

  console.error('Erro ao carregar dados de questões:', error);
  return 'Erro ao carregar dados de questões';
};

/**
 * Initial state for the hook
 */
const initialState: UseQuestionsDataState = {
  data: null,
  loading: false,
  error: null,
};

/**
 * Factory function to create useQuestionsData hook
 *
 * @param fetchQuestionsDataApi - Function to fetch questions data from API
 * @returns Hook for managing questions data
 *
 * @example
 * ```tsx
 * // In your app setup
 * const fetchQuestionsDataApi = async (filters) => {
 *   const response = await api.get('/performance/questions-data', { params: filters });
 *   return response.data;
 * };
 *
 * const useQuestionsData = createUseQuestionsData(fetchQuestionsDataApi);
 *
 * // In your component
 * const { data, loading, error, fetchQuestionsData } = useQuestionsData();
 *
 * useEffect(() => {
 *   fetchQuestionsData({ period: '30_DAYS' });
 * }, []);
 *
 * if (loading) return <Skeleton />;
 * if (!data) return null;
 *
 * return <QuestionsData data={data} />;
 * ```
 */
export const createUseQuestionsData = (
  fetchQuestionsDataApi: (
    filters?: QuestionsDataFilters
  ) => Promise<QuestionsDataApiResponse>
) => {
  return (): UseQuestionsDataReturn => {
    const [state, setState] = useState<UseQuestionsDataState>(initialState);

    /**
     * Fetch questions data from API
     * @param filters - Optional filters for period, subject, class, etc.
     */
    const fetchQuestionsData = useCallback(
      async (filters?: QuestionsDataFilters) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
          // Fetch data from API
          const responseData = await fetchQuestionsDataApi(filters);

          // Validate response with Zod
          const validatedData =
            questionsDataApiResponseSchema.parse(responseData);

          // Transform data to component format
          const transformedData = transformQuestionsData(validatedData.data);

          // Update state with validated and transformed data
          setState({
            data: transformedData,
            loading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = handleQuestionsDataFetchError(error);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        }
      },
      [fetchQuestionsDataApi]
    );

    /**
     * Reset state to initial values
     */
    const reset = useCallback(() => {
      setState(initialState);
    }, []);

    return {
      ...state,
      fetchQuestionsData,
      reset,
    };
  };
};

/**
 * Alias for createUseQuestionsData
 */
export const createQuestionsDataHook = createUseQuestionsData;
