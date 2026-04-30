import type { ActivityFilters } from '../SimuladosStudentDetailsModal/types';

/**
 * Content info for details modal
 */
export interface ContentDetailsInfo {
  id: string;
  name: string;
  bnccCode: string | null;
  subject: {
    id: string;
    name: string;
  };
  questionsCount: number;
  studentsCount: number;
}

/**
 * Performance counters for content details
 */
export interface ContentPerformanceCounters {
  aboveAverage: number;
  atAverage: number;
  belowAverage: number;
}

/**
 * Student item in content details list
 */
export interface ContentStudentItem {
  studentId: string;
  institutionId: string;
  userInstitutionId: string;
  name: string;
  school: string;
  schoolYear: string;
  class: string;
  average: number;
  performance: number;
}

/**
 * Paginated students for content details
 */
export interface ContentStudentsPaginated {
  data: ContentStudentItem[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Complete content details data
 */
export interface ContentDetailsData {
  content: ContentDetailsInfo;
  counters: ContentPerformanceCounters;
  students: ContentStudentsPaginated;
}

/**
 * Parameters for fetching content details
 */
export interface ContentDetailsParams {
  activityFilters: ActivityFilters;
  contentId: string;
  period: string;
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
  studentsIds?: string[];
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * API response structure
 */
export interface ContentDetailsApiResponse {
  message: string;
  data: ContentDetailsData;
}

/**
 * API client interface
 */
export interface ContentDetailsApiClient {
  post: <T>(url: string, data?: unknown) => Promise<{ data: T }>;
}

/**
 * Hook state
 */
export interface UseSimulatedContentDetailsState {
  data: ContentDetailsData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseSimulatedContentDetailsReturn extends UseSimulatedContentDetailsState {
  fetchDetails: (params: ContentDetailsParams) => Promise<void>;
  reset: () => void;
}

/**
 * Modal props
 */
export interface SimuladosContentDetailsModalProps {
  readonly api: ContentDetailsApiClient;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly activityFilters: ActivityFilters;
  readonly contentId: string | null;
  readonly contentName?: string;
  readonly period: string;
  readonly filters?: {
    schoolIds?: string[];
    schoolYearIds?: string[];
    classIds?: string[];
  };
  readonly labels?: SimuladosContentDetailsLabels;
}

/**
 * Customizable labels
 */
export interface SimuladosContentDetailsLabels {
  title?: string;
  loading?: string;
  noData?: string;
  noStudents?: string;
  questions?: string;
  students?: string;
  aboveAverage?: string;
  atAverage?: string;
  belowAverage?: string;
}

// Re-export ActivityFilters for convenience
export type { ActivityFilters } from '../SimuladosStudentDetailsModal/types';
