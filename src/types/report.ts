import type { PROFILE_ROLES } from './chat';
import type { BaseApiClient } from './api';
import type { StudentsHighlightPeriod } from '../hooks/useStudentsHighlight';
import type { TimeReportData } from '../components/TimeReport/TimeReport';
import type { TimeChartData } from '../components/TimeChart/TimeChart';
import type { RegionData } from '../components/ChoroplethMap/ChoroplethMap.types';

/**
 * Single user row from the access report users endpoint
 */
export interface AccessUserRow {
  userId: string;
  name: string;
  schoolName: string;
  totalTime: number;
  totalTimeFormatted: string;
  activitiesTime: number;
  activitiesTimeFormatted: string;
  contentTime: number;
  contentTimeFormatted: string;
  questionnairesTime: number;
  questionnairesTimeFormatted: string;
  simulationsTime: number;
  simulationsTimeFormatted: string;
  totalAccess: number;
  lastAccess: string | null;
  [key: string]: unknown;
}

/**
 * Pagination metadata from the access users endpoint
 */
export interface AccessUsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Student row from the performance users table endpoint
 */
export interface PerformanceStudentRow {
  studentId: string;
  studentName: string;
  schoolName: string;
  className: string;
  schoolYearName: string;
  totalAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  correctPercentage: number;
  performanceTag: string;
  [key: string]: unknown;
}

/**
 * Professional row from the performance users table endpoint
 */
export interface PerformanceProfessionalRow {
  userId: string;
  userName: string;
  schoolName: string;
  total: number;
  activities: number;
  recommendedLessons: number;
  [key: string]: unknown;
}

/**
 * A single Excel cell value
 */
export type ExcelCell = string | number | null;

/**
 * Configuration for a single Excel sheet
 */
export interface SheetConfig {
  name: string;
  headers: string[];
  rows: ExcelCell[][];
}

/**
 * Active report filters (school groups and schools)
 */
export interface ReportFilters {
  schoolGroupIds: string[];
  allSchoolGroupsSelected: boolean;
  schoolIds: string[];
}

/**
 * API client subset required by createUseReportExport (only uses post)
 */
export type UseReportExportApiClient = Pick<BaseApiClient, 'post'>;

/**
 * Parameters for the useReportExport hook
 */
export interface UseReportExportParams {
  reportType: 'acesso' | 'performance';
  period: StudentsHighlightPeriod;
  profileTab: PROFILE_ROLES;
  filters: ReportFilters;
  isUnitManager: boolean;
  accessSummaryData: TimeReportData | null;
  accessChartData: TimeChartData | null;
  accessMapData: RegionData[];
}

/**
 * Return type for the useReportExport hook
 */
export interface UseReportExportReturn {
  isDownloading: boolean;
  error: string | null;
  downloadPdf: () => void;
  downloadExcelFile: () => Promise<void>;
}
