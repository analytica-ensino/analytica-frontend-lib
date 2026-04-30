import type { BaseApiClient } from '../../types/api';
import { SimulatedPerformanceTag } from '../SimulatedStudentDetailsModal/types';

export { SimulatedPerformanceTag };

/**
 * Single competency item in overview
 */
export interface EssayCompetencyOverviewItem {
  competencyNumber: number;
  name: string;
  essaysCount: number;
  studentsCount: number;
  averageScore: number;
  averagePercentage: number;
}

/**
 * Essay competencies overview data
 */
export interface EssayCompetenciesOverviewData {
  competencies: EssayCompetencyOverviewItem[];
  totalEssays: number;
  totalStudents: number;
}

/**
 * Parameters for fetching essay competencies overview
 */
export interface EssayCompetenciesOverviewParams {
  period: string;
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
  studentsIds?: string[];
}

/**
 * API response for competencies overview
 */
export interface EssayCompetenciesOverviewApiResponse {
  message: string;
  data: EssayCompetenciesOverviewData;
}

/**
 * Competence info
 */
export interface EssayCompetenceInfo {
  number: number;
  name: string;
}

/**
 * Performance counters for essay competence
 */
export interface EssayCompetenceCounters {
  highlight: number;
  aboveAverage: number;
  belowAverage: number;
  attentionPoint: number;
}

/**
 * Student item in essay competence details
 */
export interface EssayCompetenceStudentItem {
  studentId: string;
  userInstitutionId: string;
  name: string;
  school: string;
  schoolYear: string;
  class: string;
  averageScore: number;
  averagePercentage: number;
  performance: SimulatedPerformanceTag;
  essaysCount: number;
}

/**
 * Paginated students for essay competence details
 */
export interface EssayCompetenceStudentsPaginated {
  data: EssayCompetenceStudentItem[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Essay competence details data
 */
export interface EssayCompetenceDetailsData {
  competence: EssayCompetenceInfo;
  classAverage: number;
  classAveragePercentage: number;
  totalEssays: number;
  totalStudents: number;
  counters: EssayCompetenceCounters;
  students: EssayCompetenceStudentsPaginated;
}

/**
 * Parameters for fetching essay competence details
 */
export interface EssayCompetenceDetailsParams {
  competenceNumber: number;
  period: string;
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * API response for competence details
 */
export interface EssayCompetenceDetailsApiResponse {
  message: string;
  data: EssayCompetenceDetailsData;
}

/**
 * Hook state for overview
 */
export interface UseEssayCompetenciesOverviewState {
  data: EssayCompetenciesOverviewData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook return for overview
 */
export interface UseEssayCompetenciesOverviewReturn extends UseEssayCompetenciesOverviewState {
  fetchOverview: (params: EssayCompetenciesOverviewParams) => Promise<void>;
  reset: () => void;
}

/**
 * Hook state for details
 */
export interface UseEssayCompetenceDetailsState {
  data: EssayCompetenceDetailsData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook return for details
 */
export interface UseEssayCompetenceDetailsReturn extends UseEssayCompetenceDetailsState {
  fetchDetails: (params: EssayCompetenceDetailsParams) => Promise<void>;
  reset: () => void;
}

/**
 * EssayCompetenciesTable props
 */
export interface EssayCompetenciesTableProps {
  readonly api: BaseApiClient;
  readonly period: string;
  readonly schoolIds?: string[];
  readonly schoolYearIds?: string[];
  readonly classIds?: string[];
}

/**
 * EssayCompetenceDetailsModal props
 */
export interface EssayCompetenceDetailsModalProps {
  readonly api: BaseApiClient;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly competenceNumber: number | null;
  readonly competenceName?: string;
  readonly period: string;
  readonly schoolIds?: string[];
  readonly schoolYearIds?: string[];
  readonly classIds?: string[];
}
