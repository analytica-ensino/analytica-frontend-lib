import { useState, useCallback } from 'react';
import { z } from 'zod';

/**
 * Period tabs configuration matching the Figma design
 */
export const PERIOD_TABS = [
  { value: '7_DAYS', label: '7 dias' },
  { value: '1_MONTH', label: '1 mês' },
  { value: '3_MONTHS', label: '3 meses' },
  { value: '6_MONTHS', label: '6 meses' },
  { value: '1_YEAR', label: '1 ano' },
] as const;

/**
 * Period filter options for students highlight (derived from PERIOD_TABS)
 */
export type StudentsHighlightPeriod = (typeof PERIOD_TABS)[number]['value'];

/**
 * Type filter options for students highlight
 */
export type StudentsHighlightType = 'ACTIVITIES' | 'LESSON_CONTENT';

/**
 * Trend direction for student performance
 */
export type TrendDirection = 'up' | 'down' | 'stable';

/**
 * Filters for students highlight API request
 */
export interface StudentsHighlightFilters {
  type?: StudentsHighlightType;
  period?: StudentsHighlightPeriod;
  subjectId?: string;
  schoolYearId?: string;
  classId?: string;
  schoolId?: string;
}

/**
 * Student highlight item from API response
 */
export interface StudentHighlightApiItem {
  id: string;
  name: string;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  trend: number | null;
  trendDirection: TrendDirection | null;
}

/**
 * API response structure for students highlight endpoint
 */
export interface StudentsHighlightApiResponse {
  message: string;
  data: {
    topStudents: StudentHighlightApiItem[];
    bottomStudents: StudentHighlightApiItem[];
  };
}

/**
 * Transformed student item for UI display
 */
export interface StudentHighlightItem {
  /** Student ID */
  id: string;
  /** Student position in the ranking */
  position: number;
  /** Student name */
  name: string;
  /** Performance percentage (0-100) */
  percentage: number;
  /** Correct answers count */
  correctAnswers: number;
  /** Incorrect answers count */
  incorrectAnswers: number;
  /** Total questions answered */
  totalQuestions: number;
  /** Trend value (percentage change) */
  trend: number | null;
  /** Trend direction */
  trendDirection: TrendDirection | null;
}

/**
 * Zod schema for trend direction
 */
const trendDirectionSchema = z.enum(['up', 'down', 'stable']).nullable();

/**
 * Zod schema for student highlight item validation
 */
const studentHighlightItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  correctAnswers: z.number().min(0),
  incorrectAnswers: z.number().min(0),
  totalQuestions: z.number().min(0),
  trend: z.number().nullable(),
  trendDirection: trendDirectionSchema,
});

/**
 * Zod schema for students highlight API response validation
 */
export const studentsHighlightApiResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    topStudents: z.array(studentHighlightItemSchema),
    bottomStudents: z.array(studentHighlightItemSchema),
  }),
});

/**
 * Hook state interface
 */
export interface UseStudentsHighlightState {
  topStudents: StudentHighlightItem[];
  bottomStudents: StudentHighlightItem[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseStudentsHighlightReturn extends UseStudentsHighlightState {
  fetchStudentsHighlight: (filters?: StudentsHighlightFilters) => Promise<void>;
  reset: () => void;
}

/**
 * Calculate performance percentage based on correct answers and total questions
 * @param correctAnswers - Number of correct answers
 * @param totalQuestions - Total number of questions
 * @returns Performance percentage (0-100)
 */
export const calculatePerformancePercentage = (
  correctAnswers: number,
  totalQuestions: number
): number => {
  if (totalQuestions === 0) {
    return 0;
  }
  return Math.round((correctAnswers / totalQuestions) * 100);
};

/**
 * Transform API student item to UI display format
 * @param item - Student item from API response
 * @param position - Position in the ranking (1-based)
 * @returns Transformed student item for UI
 */
export const transformStudentHighlightItem = (
  item: StudentHighlightApiItem,
  position: number
): StudentHighlightItem => ({
  id: item.id,
  position,
  name: item.name,
  percentage: calculatePerformancePercentage(
    item.correctAnswers,
    item.totalQuestions
  ),
  correctAnswers: item.correctAnswers,
  incorrectAnswers: item.incorrectAnswers,
  totalQuestions: item.totalQuestions,
  trend: item.trend,
  trendDirection: item.trendDirection,
});

/**
 * Handle errors during students highlight fetch
 * @param error - Error object
 * @returns Error message for UI display
 */
export const handleStudentsHighlightFetchError = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    console.error('Erro ao validar dados de destaque de estudantes:', error);
    return 'Erro ao validar dados de destaque de estudantes';
  }

  console.error('Erro ao carregar destaque de estudantes:', error);
  return 'Erro ao carregar destaque de estudantes';
};

/**
 * Initial state for the hook
 */
const initialState: UseStudentsHighlightState = {
  topStudents: [],
  bottomStudents: [],
  loading: false,
  error: null,
};

/**
 * Factory function to create useStudentsHighlight hook
 *
 * @param fetchStudentsHighlightApi - Function to fetch students highlight from API
 * @returns Hook for managing students highlight data
 *
 * @example
 * ```tsx
 * // In your app setup
 * const fetchStudentsHighlightApi = async (filters) => {
 *   const response = await api.get('/performance/students-highlight', { params: filters });
 *   return response.data;
 * };
 *
 * const useStudentsHighlight = createUseStudentsHighlight(fetchStudentsHighlightApi);
 *
 * // In your component
 * const { topStudents, bottomStudents, loading, error, fetchStudentsHighlight } = useStudentsHighlight();
 *
 * useEffect(() => {
 *   fetchStudentsHighlight({ period: '1_MONTH' });
 * }, []);
 * ```
 */
export const createUseStudentsHighlight = (
  fetchStudentsHighlightApi: (
    filters?: StudentsHighlightFilters
  ) => Promise<StudentsHighlightApiResponse>
) => {
  return (): UseStudentsHighlightReturn => {
    const [state, setState] = useState<UseStudentsHighlightState>(initialState);

    /**
     * Fetch students highlight from API
     * @param filters - Optional filters for period, subject, class, etc.
     */
    const fetchStudentsHighlight = useCallback(
      async (filters?: StudentsHighlightFilters) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
          // Fetch data from API
          const responseData = await fetchStudentsHighlightApi(filters);

          // Validate response with Zod
          const validatedData =
            studentsHighlightApiResponseSchema.parse(responseData);

          // Transform students to UI format with positions
          const topStudents = validatedData.data.topStudents.map(
            (student, index) =>
              transformStudentHighlightItem(student, index + 1)
          );

          const bottomStudents = validatedData.data.bottomStudents.map(
            (student, index) =>
              transformStudentHighlightItem(student, index + 1)
          );

          // Update state with validated and transformed data
          setState({
            topStudents,
            bottomStudents,
            loading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = handleStudentsHighlightFetchError(error);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        }
      },
      [fetchStudentsHighlightApi]
    );

    /**
     * Reset state to initial values
     */
    const reset = useCallback(() => {
      setState(initialState);
    }, []);

    return {
      ...state,
      fetchStudentsHighlight,
      reset,
    };
  };
};

/**
 * Alias for createUseStudentsHighlight
 */
export const createStudentsHighlightHook = createUseStudentsHighlight;
