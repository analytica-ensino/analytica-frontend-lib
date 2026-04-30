// Reuse SimulatedPerformanceTag from SimulatedStudentDetailsModal
import {
  SimulatedPerformanceTag,
  SIMULATED_PERFORMANCE_TAG_CONFIG,
} from '../SimulatedStudentDetailsModal/types';
export { SimulatedPerformanceTag, SIMULATED_PERFORMANCE_TAG_CONFIG };

/**
 * Essay competency performance item
 * Represents a single competency (1-5) with its average score
 */
export interface EssayCompetencyPerformance {
  number: number;
  name: string;
  averageScore: number; // 0-200
  averagePercentage: number; // 0-100
  essaysCount: number;
}

/**
 * Essay student info for details modal
 */
export interface EssayStudentInfo {
  id: string;
  name: string;
  school: string;
  schoolYear: string;
  class: string;
}

/**
 * Essay student details data
 */
export interface EssayStudentDetailsData {
  student: EssayStudentInfo;
  overallAverage: number; // 0-1000
  overallPercentage: number; // 0-100
  performance: SimulatedPerformanceTag;
  essaysCount: number;
  competencies: EssayCompetencyPerformance[];
}

/**
 * Parameters for fetching essay student details
 */
export interface EssayStudentDetailsParams {
  userInstitutionId: string;
  period: string;
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
}

/**
 * API response structure
 */
export interface EssayStudentDetailsApiResponse {
  message: string;
  data: EssayStudentDetailsData;
}

/**
 * API client interface for dependency injection
 */
export interface EssayStudentDetailsApiClient {
  post: <T>(url: string, data?: unknown) => Promise<{ data: T }>;
}

/**
 * Hook state
 */
export interface UseEssayStudentDetailsState {
  data: EssayStudentDetailsData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseEssayStudentDetailsReturn extends UseEssayStudentDetailsState {
  fetchDetails: (params: EssayStudentDetailsParams) => Promise<void>;
  reset: () => void;
}

/**
 * Modal labels for internationalization
 */
export interface EssayStudentDetailsLabels {
  loading?: string;
  noData?: string;
  competencies?: string;
  noCompetencies?: string;
  essays?: string;
}

/**
 * Props for EssayStudentDetailsModal component
 */
export interface EssayStudentDetailsModalProps {
  /** API client for making requests */
  readonly api: EssayStudentDetailsApiClient;
  /** Whether modal is open */
  readonly isOpen: boolean;
  /** Close callback */
  readonly onClose: () => void;
  /** User institution ID to fetch details for */
  readonly userInstitutionId: string | null;
  /** Student name for title */
  readonly studentName?: string;
  /** Period filter */
  readonly period: string;
  /** School IDs filter */
  readonly schoolIds?: string[];
  /** School year IDs filter */
  readonly schoolYearIds?: string[];
  /** Class IDs filter */
  readonly classIds?: string[];
  /** Custom labels */
  readonly labels?: EssayStudentDetailsLabels;
}
