// Reuse types from SimulatedStudentDetailsModal
import {
  SimulatedPerformanceTag,
  simulationTypeToActivityFilters,
  type SimulationType,
  type ActivityFilters,
} from '../SimulatedStudentDetailsModal/types';
export { SimulatedPerformanceTag, simulationTypeToActivityFilters };
export type { SimulationType, ActivityFilters };

import { ScoreType } from '../../types/common';

/**
 * Individual student item in simulated exams overview
 */
export interface SimulatedStudentItem {
  studentId: string;
  institutionId: string;
  userInstitutionId: string;
  name: string;
  school: string;
  schoolYear: string;
  class: string;
  average: number;
  performance: SimulatedPerformanceTag;
  [key: string]: unknown;
}

/**
 * Performance counters by category
 */
export interface SimulatedPerformanceCounters {
  highlight: number;
  aboveAverage: number;
  belowAverage: number;
  attentionPoint: number;
}

/**
 * Paginated students data
 */
export interface SimulatedStudentsPaginated {
  data: SimulatedStudentItem[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Complete overview data for simulated exams
 */
export interface SimulatedOverviewData {
  classAverage: number;
  totalStudents: number;
  counters: SimulatedPerformanceCounters;
  topHighlights: SimulatedStudentItem[];
  topDifficulties: SimulatedStudentItem[];
  students: SimulatedStudentsPaginated;
}

/**
 * Parameters for fetching simulated overview
 */
export interface SimulatedOverviewParams {
  simulationType: SimulationType;
  period: string;
  subjectId?: string;
  areaKnowledgeId?: string;
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
  studentsIds?: string[];
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  scoreType?: ScoreType;
}

/**
 * API response structure
 */
export interface SimulatedOverviewApiResponse {
  message: string;
  data: SimulatedOverviewData;
}

/**
 * Hook state
 */
export interface UseSimulatedOverviewState {
  data: SimulatedOverviewData | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseSimulatedOverviewReturn extends UseSimulatedOverviewState {
  fetchOverview: (
    params: SimulatedOverviewParams,
    refresh?: boolean
  ) => Promise<void>;
  reset: () => void;
}
