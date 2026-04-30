/**
 * Performance tag for simulated exams
 */
export enum SimulatedPerformanceTag {
  HIGHLIGHT = 'HIGHLIGHT',
  ABOVE_AVERAGE = 'ABOVE_AVERAGE',
  BELOW_AVERAGE = 'BELOW_AVERAGE',
  ATTENTION_POINT = 'ATTENTION_POINT',
}

/**
 * Tag config for display
 */
export interface SimulatedPerformanceTagConfig {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info';
}

/**
 * Map performance to tag config
 */
export const SIMULATED_PERFORMANCE_TAG_CONFIG: Record<
  SimulatedPerformanceTag,
  SimulatedPerformanceTagConfig
> = {
  [SimulatedPerformanceTag.HIGHLIGHT]: {
    label: 'Destaque da turma',
    variant: 'success',
  },
  [SimulatedPerformanceTag.ABOVE_AVERAGE]: {
    label: 'Acima da média',
    variant: 'info',
  },
  [SimulatedPerformanceTag.BELOW_AVERAGE]: {
    label: 'Abaixo da média',
    variant: 'warning',
  },
  [SimulatedPerformanceTag.ATTENTION_POINT]: {
    label: 'Ponto de atenção',
    variant: 'error',
  },
};

/**
 * Simulation type
 */
export type SimulationType = 'enem-1' | 'enem-2' | 'essays';

/**
 * Student info for details modal
 */
export interface StudentDetailsInfo {
  studentId: string;
  institutionId: string;
  name: string;
  school: string;
  schoolYear: string;
  class: string;
  average: number;
  performance: SimulatedPerformanceTag;
}

/**
 * Subject performance item (level 1)
 */
export interface SubjectPerformanceItem {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  questionsCount: number;
  performance: {
    correct: number;
    incorrect: number;
    correctPercentage: number;
  };
}

/**
 * Content performance item (level 2)
 */
export interface StudentContentPerformanceItem {
  contentId: string;
  contentName: string;
  bnccCode: string | null;
  questionsCount: number;
  performance: {
    correct: number;
    incorrect: number;
    correctPercentage: number;
  };
}

/**
 * Response data when subjectId is null (list of subjects)
 */
export interface StudentSubjectsData {
  student: StudentDetailsInfo;
  subjects: SubjectPerformanceItem[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Response data when subjectId is provided (list of contents)
 */
export interface StudentContentsData {
  student: StudentDetailsInfo;
  subject: {
    id: string;
    name: string;
  };
  contents: StudentContentPerformanceItem[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Union type for student details response
 */
export type StudentDetailsData = StudentSubjectsData | StudentContentsData;

/**
 * Type guard to check if data is StudentSubjectsData
 */
export function isStudentSubjectsData(
  data: StudentDetailsData
): data is StudentSubjectsData {
  return 'subjects' in data;
}

/**
 * Type guard to check if data is StudentContentsData
 */
export function isStudentContentsData(
  data: StudentDetailsData
): data is StudentContentsData {
  return 'contents' in data;
}

/**
 * Activity filters for endpoint
 */
export interface ActivityFilters {
  types?: string[];
  subtypes?: string[];
  statuses?: string[];
}

/**
 * Convert SimulationType to ActivityFilters
 */
export function simulationTypeToActivityFilters(
  simulationType: SimulationType
): ActivityFilters {
  switch (simulationType) {
    case 'enem-1':
      return {
        types: ['SIMULADO'],
        subtypes: ['ENEM_PROVA_1'],
      };
    case 'enem-2':
      return {
        types: ['SIMULADO'],
        subtypes: ['ENEM_PROVA_2'],
      };
    default:
      return {};
  }
}

/**
 * Parameters for fetching student details
 */
export interface StudentDetailsParams {
  simulationType: SimulationType;
  userInstitutionId: string;
  period: string;
  subjectId?: string | null;
  page?: number;
  limit?: number;
}

/**
 * API response structure
 */
export interface StudentDetailsApiResponse {
  message: string;
  data: StudentDetailsData;
}

/**
 * API client interface
 */
export interface StudentDetailsApiClient {
  post: <T>(url: string, data?: unknown) => Promise<{ data: T }>;
}

/**
 * Hook state
 */
export interface UseSimuladosStudentDetailsState {
  data: StudentDetailsData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseSimuladosStudentDetailsReturn extends UseSimuladosStudentDetailsState {
  fetchDetails: (params: StudentDetailsParams) => Promise<void>;
  reset: () => void;
}

/**
 * Modal props
 */
export interface SimuladosStudentDetailsModalProps {
  readonly api: StudentDetailsApiClient;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly simulationType: SimulationType;
  readonly userInstitutionId: string | null;
  readonly studentName?: string;
  readonly period: string;
  readonly labels?: SimuladosStudentDetailsLabels;
}

/**
 * Customizable labels
 */
export interface SimuladosStudentDetailsLabels {
  loading?: string;
  noData?: string;
  noSubjects?: string;
  noContents?: string;
  backButton?: string;
  questions?: string;
  of?: string;
}
