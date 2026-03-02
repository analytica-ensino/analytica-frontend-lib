/**
 * useReportExport Hook Factory
 *
 * Factory function to create a hook for downloading reports (PDF and Excel).
 * Follows the dependency-injection pattern used across the library.
 */

import { useState, useCallback } from 'react';
import { PROFILE_ROLES } from '../types/chat';
import type {
  AccessUserRow,
  AccessUsersPagination,
  PerformanceStudentRow,
  PerformanceProfessionalRow,
  UseReportExportApiClient,
  UseReportExportParams,
  UseReportExportReturn,
} from '../types/report';
import type {
  PerformanceStudentData,
  PerformanceDefaultData,
} from '../components/PerformanceReport/PerformanceReport';
import type {
  QuestionsVariantData,
  ContentVariantData,
} from '../components/PerformanceQuestionsData/PerformanceQuestionsData';
import type { PerformanceRankingData } from '../components/PerformanceRanking/PerformanceRanking';
import { downloadExcel } from '../utils/exportExcel';
import {
  buildAccessSheets,
  buildPerformanceSheets,
} from '../utils/reportExcelSheets';
import { printReportAsPdf } from '../utils/exportPdf';

/** Page size for export pagination (backend max is 100) */
const EXPORT_PAGE_SIZE = 100;

/**
 * Fetch all access users with paginated requests for Excel export.
 * Fetches page 1 first, then remaining pages in parallel.
 */
async function fetchAllAccessUsers(
  api: UseReportExportApiClient,
  params: UseReportExportParams
): Promise<AccessUserRow[]> {
  const baseBody = {
    period: params.period,
    targetProfile: params.profileTab,
    schoolGroupIds: params.filters.schoolGroupIds,
    schoolIds: params.filters.schoolIds,
  };

  const firstPage = await api.post<{
    message: string;
    data: {
      users: AccessUserRow[];
      pagination: AccessUsersPagination;
    };
  }>('/access-report/access/users', {
    ...baseBody,
    limit: EXPORT_PAGE_SIZE,
    page: 1,
  });

  const { users, pagination } = firstPage.data.data;

  if (pagination.totalPages <= 1) return users;

  const remainingPages = Array.from(
    { length: pagination.totalPages - 1 },
    (_, i) => i + 2
  );

  const results = await Promise.all(
    remainingPages.map((page) =>
      api.post<{
        message: string;
        data: {
          users: AccessUserRow[];
          pagination: AccessUsersPagination;
        };
      }>('/access-report/access/users', {
        ...baseBody,
        limit: EXPORT_PAGE_SIZE,
        page,
      })
    )
  );

  return [users, ...results.map((r) => r.data.data.users)].flat();
}

/**
 * Fetch all performance users with paginated requests.
 * Fetches page 1 first, then remaining pages in parallel.
 */
async function fetchAllPerformanceUsers(
  api: UseReportExportApiClient,
  requestBody: Record<string, unknown>,
  isStudent: boolean
): Promise<(PerformanceStudentRow | PerformanceProfessionalRow)[]> {
  const firstPage = await api.post<{
    message: string;
    data: {
      students?: PerformanceStudentRow[];
      professionals?: PerformanceProfessionalRow[];
      total: number;
      page: number;
      limit: number;
    };
  }>('/performance/users-table', {
    ...requestBody,
    limit: EXPORT_PAGE_SIZE,
    page: 1,
  });

  const { total } = firstPage.data.data;
  const firstUsers = isStudent
    ? (firstPage.data.data.students ?? [])
    : (firstPage.data.data.professionals ?? []);

  const totalPages = Math.ceil(total / EXPORT_PAGE_SIZE);

  if (totalPages <= 1) return firstUsers;

  const remainingPages = Array.from(
    { length: totalPages - 1 },
    (_, i) => i + 2
  );

  const results = await Promise.all(
    remainingPages.map((page) =>
      api.post<{
        message: string;
        data: {
          students?: PerformanceStudentRow[];
          professionals?: PerformanceProfessionalRow[];
          total: number;
          page: number;
          limit: number;
        };
      }>('/performance/users-table', {
        ...requestBody,
        limit: EXPORT_PAGE_SIZE,
        page,
      })
    )
  );

  const remainingUsers = results.map((r) =>
    isStudent ? (r.data.data.students ?? []) : (r.data.data.professionals ?? [])
  );

  return [firstUsers, ...remainingUsers].flat();
}

/**
 * Fetch all performance data for Excel export (summary, questions, ranking, users).
 */
async function fetchAllPerformanceData(
  api: UseReportExportApiClient,
  params: UseReportExportParams
) {
  const requestBody = {
    period: params.period,
    targetProfile: params.profileTab,
    schoolGroupIds: params.filters.schoolGroupIds,
    schoolIds: params.filters.schoolIds,
    allSchoolGroupsSelected: params.filters.allSchoolGroupsSelected,
  };

  const isStudent = params.profileTab === PROFILE_ROLES.STUDENT;

  const [summaryRes, questionsRes, rankingRes, users] = await Promise.all([
    api.post<{
      message: string;
      data: PerformanceStudentData | PerformanceDefaultData;
    }>('/performance/report', requestBody),

    api.post<{
      message: string;
      data: QuestionsVariantData | ContentVariantData;
    }>('/access-report/performance/questions', requestBody),

    api.post<{
      message: string;
      data: {
        groupedBy: 'state' | 'municipality' | 'class';
        highlighted: unknown[];
        needsAttention: unknown[];
      };
    }>('/performance/ranking', requestBody),

    fetchAllPerformanceUsers(api, requestBody, isStudent),
  ]);

  return {
    summaryData: summaryRes.data.data,
    questionsData: questionsRes.data.data,
    rankingData: rankingRes.data.data as PerformanceRankingData,
    users,
  };
}

/**
 * Configuration for createUseReportExport factory
 */
export interface UseReportExportConfig {
  /** API client for making requests */
  api: UseReportExportApiClient;
}

/**
 * Factory function to create a useReportExport hook.
 *
 * @param config - Configuration object containing the API client
 * @returns Hook function that returns PDF and Excel download functionality
 *
 * @example
 * ```tsx
 * // In your app setup
 * const useReportExport = createUseReportExport({ api: useApi() });
 *
 * // In your component
 * const { isDownloading, error, downloadPdf, downloadExcelFile } = useReportExport(params);
 * ```
 */
export const createUseReportExport = (
  config: UseReportExportConfig
): ((params: UseReportExportParams) => UseReportExportReturn) => {
  const { api } = config;

  return (params: UseReportExportParams): UseReportExportReturn => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Download report as PDF using browser print dialog
     */
    const downloadPdf = useCallback(() => {
      printReportAsPdf();
    }, []);

    /**
     * Download report as Excel with all data (paginated fetching)
     */
    const downloadExcelFile = useCallback(async () => {
      setIsDownloading(true);
      setError(null);

      try {
        if (params.reportType === 'acesso') {
          const allUsers = await fetchAllAccessUsers(api, params);

          const sheets = buildAccessSheets(
            params.accessSummaryData,
            params.accessMapData,
            params.accessChartData,
            allUsers,
            params.profileTab,
            params.isUnitManager
          );

          downloadExcel('relatorio-acesso', sheets);
        } else {
          const perfData = await fetchAllPerformanceData(api, params);

          const sheets = buildPerformanceSheets(
            perfData.summaryData,
            perfData.questionsData,
            perfData.rankingData,
            perfData.users,
            params.profileTab
          );

          downloadExcel('relatorio-desempenho', sheets);
        }
      } catch {
        setError('Erro ao gerar arquivo Excel. Tente novamente.');
      } finally {
        setIsDownloading(false);
      }
    }, [params]);

    return {
      isDownloading,
      error,
      downloadPdf,
      downloadExcelFile,
    };
  };
};
