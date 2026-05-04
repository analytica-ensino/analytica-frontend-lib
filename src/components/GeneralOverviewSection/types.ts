// Import ScoreType enum from common types
import { ScoreType } from '../../types/common';

/**
 * Performance data for a knowledge area
 */
export interface AreaKnowledgePerformance {
  id: string;
  name: string;
  urlCover: string | null;
  /** Icon identifier from backend */
  icon: string;
  /** Hex color from backend (e.g., "#4B0082") */
  color: string;
  percentage: number;
  questionsTotal: number;
  questionsCorrect: number;
}

/**
 * Performance data for essays (Redação)
 */
export interface EssayPerformance {
  name: string;
  /** Hex color from backend (e.g., "#F43F5E") */
  color: string;
  /** Icon identifier from backend */
  icon: string;
  percentage: number;
  totalEssays: number;
  totalStudents: number;
}

/**
 * Main general overview data structure
 */
export interface GeneralOverviewData {
  overallPercentage: number;
  totalQuestions: number;
  totalCorrect: number;
  areas: AreaKnowledgePerformance[];
  essay?: EssayPerformance;
}

/**
 * Subject item with icon and color info
 * Used to determine area card styling
 */
export interface SubjectItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  areaKnowledgeId: string;
}

/**
 * Request parameters for general overview
 */
export interface GeneralOverviewParams {
  period: string;
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
  studentsIds?: string[];
  scoreType?: ScoreType;
}

/**
 * API response structure
 */
export interface GeneralOverviewApiResponse {
  message: string;
  data: GeneralOverviewData;
}

/**
 * Hook internal state
 */
export interface UseGeneralOverviewState {
  data: GeneralOverviewData | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseGeneralOverviewReturn extends UseGeneralOverviewState {
  fetchOverview: (
    params: GeneralOverviewParams,
    refresh?: boolean
  ) => Promise<void>;
  reset: () => void;
}

/**
 * Props for GeneralOverviewSection component
 */
export interface GeneralOverviewSectionProps {
  /** Overview data to display */
  data: GeneralOverviewData | null;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Score display type (percentage or TRI) */
  scoreType?: ScoreType;
}

/**
 * Labels for GeneralOverviewSection
 */
export interface GeneralOverviewLabels {
  title?: string;
  description?: string;
  loadingText?: string;
  errorText?: string;
}
