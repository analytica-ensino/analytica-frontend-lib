import type { ScoreType } from '../GeneralOverviewSection/types';
import type { SimulationType } from '../SimuladosStudentDetailsModal/types';

/**
 * Content item from simulated contents performance API
 */
export interface SimulatedContentItem {
  contentId: string;
  contentName: string;
  bnccCode: string | null;
  subject: {
    id: string;
    name: string;
  };
  simulatedExamsCount: number;
  questionsCount: number;
  studentsCount: number;
  performance: {
    correct: number;
    incorrect: number;
    correctPercentage: number;
  };
}

/**
 * Paginated response for contents performance
 */
export interface ContentsPerformanceData {
  data: SimulatedContentItem[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Parameters for fetching contents performance
 */
export interface SimulatedContentsParams {
  simulationType: SimulationType;
  period?: string;
  subjectId?: string | null;
  areaKnowledgeId?: string | null;
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  scoreType?: ScoreType;
}

/**
 * API response wrapper
 */
export interface ContentsPerformanceApiResponse {
  message: string;
  data: ContentsPerformanceData;
}

/**
 * API client interface
 */
export interface SimulatedContentsApiClient {
  post: <T>(url: string, data?: unknown) => Promise<{ data: T }>;
}

/**
 * Hook state
 */
export interface UseSimulatedContentsState {
  data: ContentsPerformanceData | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseSimulatedContentsReturn extends UseSimulatedContentsState {
  fetchContents: (params: SimulatedContentsParams, refresh?: boolean) => Promise<void>;
  reset: () => void;
}
