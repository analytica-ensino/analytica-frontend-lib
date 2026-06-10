import type {
  SimulatedPerformanceTag,
  SimulationType,
} from '../SimulatedStudentDetailsModal/types';

import { ScoreType } from '../../types/common';

/**
 * Aggregation types for overview
 */
export type OverviewAggregationType = 'students' | 'classes' | 'municipalities';

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
 * Class item in classes overview (for UNIT_MANAGER)
 */
export interface ClassOverviewItem {
  classId: string;
  className: string;
  schoolName: string;
  schoolYearName: string;
  shift: string | null;
  studentCount: number;
  average: number;
  performance: SimulatedPerformanceTag;
}

/**
 * Municipality item in municipalities overview (for REGIONAL_MANAGER)
 */
export interface MunicipalityOverviewItem {
  municipality: string;
  state: string;
  schoolCount: number;
  studentCount: number;
  average: number;
  performance: SimulatedPerformanceTag;
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
 * Complete overview data for simulated exams (with students list)
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
 * Students-only overview data (without students list)
 */
export interface StudentsOnlyOverviewData {
  classAverage: number;
  totalStudents: number;
  counters: SimulatedPerformanceCounters;
  topHighlights: SimulatedStudentItem[];
  topDifficulties: SimulatedStudentItem[];
}

/**
 * Classes overview data (for UNIT_MANAGER)
 */
export interface ClassesOverviewData {
  classAverage: number;
  totalClasses: number;
  totalStudents: number;
  counters: SimulatedPerformanceCounters;
  topHighlights: ClassOverviewItem[];
  topDifficulties: ClassOverviewItem[];
}

/**
 * Municipalities overview data (for REGIONAL_MANAGER)
 */
export interface MunicipalitiesOverviewData {
  classAverage: number;
  totalMunicipalities: number;
  totalSchools: number;
  totalStudents: number;
  counters: SimulatedPerformanceCounters;
  topHighlights: MunicipalityOverviewItem[];
  topDifficulties: MunicipalityOverviewItem[];
}

/**
 * Union type for aggregated overview data
 */
export type AggregatedOverviewData =
  | StudentsOnlyOverviewData
  | ClassesOverviewData
  | MunicipalitiesOverviewData;

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

// ============================================================================
// AGGREGATED OVERVIEW TYPES (for separate routes)
// ============================================================================

/**
 * Parameters for fetching aggregated overview (without pagination)
 */
export interface AggregatedOverviewParams {
  aggregationType: OverviewAggregationType;
  simulationType: SimulationType;
  period: string;
  subjectId?: string;
  areaKnowledgeId?: string;
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
  studentsIds?: string[];
  scoreType?: ScoreType;
}

/**
 * API response for students overview
 */
export interface StudentsOverviewApiResponse {
  message: string;
  data: StudentsOnlyOverviewData;
}

/**
 * API response for classes overview
 */
export interface ClassesOverviewApiResponse {
  message: string;
  data: ClassesOverviewData;
}

/**
 * API response for municipalities overview
 */
export interface MunicipalitiesOverviewApiResponse {
  message: string;
  data: MunicipalitiesOverviewData;
}

/**
 * Hook state for aggregated overview
 */
export interface UseAggregatedOverviewState {
  data: AggregatedOverviewData | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

/**
 * Hook return type for aggregated overview
 */
export interface UseAggregatedOverviewReturn extends UseAggregatedOverviewState {
  fetchOverview: (
    params: AggregatedOverviewParams,
    refresh?: boolean
  ) => Promise<void>;
  reset: () => void;
}
