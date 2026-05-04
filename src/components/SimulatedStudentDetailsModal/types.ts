import type { BaseApiClient } from '../../types/api';

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
export enum SimulatedPerformanceTagVariant {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
}

/**
 * Tag config for display
 */
export interface SimulatedPerformanceTagConfig {
  label: string;
  variant: SimulatedPerformanceTagVariant;
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
    variant: SimulatedPerformanceTagVariant.SUCCESS,
  },
  [SimulatedPerformanceTag.ABOVE_AVERAGE]: {
    label: 'Acima da média',
    variant: SimulatedPerformanceTagVariant.INFO,
  },
  [SimulatedPerformanceTag.BELOW_AVERAGE]: {
    label: 'Abaixo da média',
    variant: SimulatedPerformanceTagVariant.WARNING,
  },
  [SimulatedPerformanceTag.ATTENTION_POINT]: {
    label: 'Ponto de atenção',
    variant: SimulatedPerformanceTagVariant.ERROR,
  },
};

/**
 * Badge action enum for performance status indicators
 */
export enum PerformanceBadgeAction {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * Map performance tag to Badge action type
 */
export const PERFORMANCE_TAG_TO_BADGE_ACTION: Record<
  SimulatedPerformanceTag,
  PerformanceBadgeAction
> = {
  [SimulatedPerformanceTag.HIGHLIGHT]: PerformanceBadgeAction.SUCCESS,
  [SimulatedPerformanceTag.ABOVE_AVERAGE]: PerformanceBadgeAction.INFO,
  [SimulatedPerformanceTag.BELOW_AVERAGE]: PerformanceBadgeAction.WARNING,
  [SimulatedPerformanceTag.ATTENTION_POINT]: PerformanceBadgeAction.ERROR,
};

/**
 * Simulation type used in reports
 */
export enum ReportSimulationType {
  ENEM_1 = 'enem-1',
  ENEM_2 = 'enem-2',
  ESSAYS = 'essays',
}

/**
 * Backward-compatible simulation type alias
 */
export type SimulationType = `${ReportSimulationType}`;

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
    case ReportSimulationType.ENEM_1:
      return {
        types: ['SIMULADO'],
        subtypes: ['ENEM_PROVA_1'],
      };
    case ReportSimulationType.ENEM_2:
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
 * Hook state
 */
export interface UseSimulatedStudentDetailsState {
  data: StudentDetailsData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseSimulatedStudentDetailsReturn extends UseSimulatedStudentDetailsState {
  fetchDetails: (params: StudentDetailsParams) => Promise<void>;
  reset: () => void;
}

/**
 * Modal props
 */
export interface SimulatedStudentDetailsModalProps {
  readonly api: BaseApiClient;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly simulationType: SimulationType;
  readonly userInstitutionId: string | null;
  readonly studentName?: string;
  readonly period: string;
}
