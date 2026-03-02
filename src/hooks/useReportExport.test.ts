import { renderHook, act } from '@testing-library/react';
import { createUseReportExport } from './useReportExport';
import type {
  UseReportExportApiClient,
  UseReportExportParams,
  AccessUserRow,
  PerformanceStudentRow,
  PerformanceProfessionalRow,
} from '../types/report';

jest.mock('../utils/exportExcel', () => ({
  downloadExcel: jest.fn(),
}));

jest.mock('../utils/reportExcelSheets', () => ({
  buildAccessSheets: jest.fn(),
  buildPerformanceSheets: jest.fn(),
}));

jest.mock('../utils/exportPdf', () => ({
  printReportAsPdf: jest.fn(),
}));

jest.mock('../types/chat', () => ({
  PROFILE_ROLES: {
    STUDENT: 'STUDENT',
    TEACHER: 'TEACHER',
    UNIT_MANAGER: 'UNIT_MANAGER',
    REGIONAL_MANAGER: 'REGIONAL_MANAGER',
  },
}));

import { downloadExcel } from '../utils/exportExcel';
import {
  buildAccessSheets,
  buildPerformanceSheets,
} from '../utils/reportExcelSheets';
import { printReportAsPdf } from '../utils/exportPdf';

const mockDownloadExcel = jest.mocked(downloadExcel);
const mockBuildAccessSheets = jest.mocked(buildAccessSheets);
const mockBuildPerformanceSheets = jest.mocked(buildPerformanceSheets);
const mockPrintReportAsPdf = jest.mocked(printReportAsPdf);

const mockPost = jest.fn();
const mockApi: UseReportExportApiClient = { post: mockPost };

const period = '1_YEAR' as UseReportExportParams['period'];
const studentRole = 'STUDENT' as UseReportExportParams['profileTab'];
const teacherRole = 'TEACHER' as UseReportExportParams['profileTab'];

const baseFilters = {
  schoolGroupIds: ['sg1'],
  allSchoolGroupsSelected: false,
  schoolIds: ['s1'],
};

const mockSheets = [{ name: 'Sheet1', headers: ['A'], rows: [['a']] }];

/** Build default params for the access report type. */
function buildAccessParams(
  overrides?: Partial<UseReportExportParams>
): UseReportExportParams {
  return {
    reportType: 'acesso',
    period,
    profileTab: studentRole,
    filters: baseFilters,
    isUnitManager: false,
    accessSummaryData: null,
    accessChartData: null,
    accessMapData: [],
    ...overrides,
  };
}

/** Build default params for the performance report type. */
function buildPerformanceParams(
  overrides?: Partial<UseReportExportParams>
): UseReportExportParams {
  return {
    reportType: 'performance',
    period,
    profileTab: studentRole,
    filters: baseFilters,
    isUnitManager: false,
    accessSummaryData: null,
    accessChartData: null,
    accessMapData: [],
    ...overrides,
  };
}

/** Build a paginated access users API response. */
function buildAccessUsersResponse(
  users: Partial<AccessUserRow>[],
  total: number,
  page: number,
  totalPages: number
) {
  return {
    data: {
      message: 'ok',
      data: {
        users,
        pagination: {
          page,
          limit: 100,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    },
  };
}

/** Build a student performance users response. */
function buildStudentUsersResponse(
  students: Partial<PerformanceStudentRow>[],
  total: number,
  page: number
) {
  return {
    data: {
      message: 'ok',
      data: { students, total, page, limit: 100 },
    },
  };
}

/** Build a professional performance users response. */
function buildProfessionalUsersResponse(
  professionals: Partial<PerformanceProfessionalRow>[],
  total: number,
  page: number
) {
  return {
    data: {
      message: 'ok',
      data: { professionals, total, page, limit: 100 },
    },
  };
}

const mockUser1 = { userId: '1', name: 'User 1', schoolName: 'School A' };
const mockUser2 = { userId: '2', name: 'User 2', schoolName: 'School B' };

const mockSummaryData = { cities: 5 };
const mockQuestionsData = { total: 100 };
const mockRankingData = {
  groupedBy: 'state',
  highlighted: [],
  needsAttention: [],
};

const mockSummaryRes = { data: { message: 'ok', data: mockSummaryData } };
const mockQuestionsRes = { data: { message: 'ok', data: mockQuestionsData } };
const mockRankingRes = { data: { message: 'ok', data: mockRankingData } };

const mockStudent1 = { studentId: 's1', studentName: 'Student 1' };
const mockStudent2 = { studentId: 's2', studentName: 'Student 2' };
const mockProfessional1 = { userId: 'p1', userName: 'Teacher 1' };
const mockProfessional2 = { userId: 'p2', userName: 'Teacher 2' };

describe('createUseReportExport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildAccessSheets.mockReturnValue(mockSheets);
    mockBuildPerformanceSheets.mockReturnValue(mockSheets);
  });

  it('should return initial state', () => {
    const useHook = createUseReportExport({ api: mockApi });
    const { result } = renderHook(() => useHook(buildAccessParams()));

    expect(result.current.isDownloading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.downloadPdf).toBe('function');
    expect(typeof result.current.downloadExcelFile).toBe('function');
  });

  it('should call printReportAsPdf when downloadPdf is invoked', () => {
    const useHook = createUseReportExport({ api: mockApi });
    const { result } = renderHook(() => useHook(buildAccessParams()));

    act(() => {
      result.current.downloadPdf();
    });

    expect(mockPrintReportAsPdf).toHaveBeenCalledTimes(1);
  });

  describe('downloadExcelFile - access report', () => {
    it('should fetch users with paginated request and download excel', async () => {
      const singlePageResponse = buildAccessUsersResponse([mockUser1], 1, 1, 1);
      mockPost.mockResolvedValueOnce(singlePageResponse);

      const params = buildAccessParams();
      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() => useHook(params));

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      expect(mockPost).toHaveBeenCalledWith('/access-report/access/users', {
        period,
        targetProfile: studentRole,
        limit: 100,
        page: 1,
        schoolGroupIds: baseFilters.schoolGroupIds,
        schoolIds: baseFilters.schoolIds,
      });

      expect(mockBuildAccessSheets).toHaveBeenCalledWith(
        null,
        [],
        null,
        singlePageResponse.data.data.users,
        studentRole,
        false
      );

      expect(mockDownloadExcel).toHaveBeenCalledWith(
        'relatorio-acesso',
        mockSheets
      );

      expect(result.current.isDownloading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch multiple pages and concatenate users', async () => {
      const page1Response = buildAccessUsersResponse([mockUser1], 2, 1, 2);
      const page2Response = buildAccessUsersResponse([mockUser2], 2, 2, 2);

      mockPost
        .mockResolvedValueOnce(page1Response)
        .mockResolvedValueOnce(page2Response);

      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() => useHook(buildAccessParams()));

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      expect(mockPost).toHaveBeenCalledTimes(2);
      expect(mockPost).toHaveBeenCalledWith('/access-report/access/users', {
        period,
        targetProfile: studentRole,
        limit: 100,
        page: 1,
        schoolGroupIds: baseFilters.schoolGroupIds,
        schoolIds: baseFilters.schoolIds,
      });
      expect(mockPost).toHaveBeenCalledWith('/access-report/access/users', {
        period,
        targetProfile: studentRole,
        limit: 100,
        page: 2,
        schoolGroupIds: baseFilters.schoolGroupIds,
        schoolIds: baseFilters.schoolIds,
      });

      expect(mockBuildAccessSheets).toHaveBeenCalledWith(
        null,
        [],
        null,
        [mockUser1, mockUser2],
        studentRole,
        false
      );
    });

    it('should set isDownloading to true during download', async () => {
      let resolvePromise: (value: unknown) => void;
      mockPost.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() => useHook(buildAccessParams()));

      act(() => {
        result.current.downloadExcelFile();
      });

      expect(result.current.isDownloading).toBe(true);

      await act(async () => {
        resolvePromise(buildAccessUsersResponse([mockUser1], 1, 1, 1));
      });

      expect(result.current.isDownloading).toBe(false);
    });
  });

  describe('downloadExcelFile - performance report', () => {
    it('should fetch all data and read students for STUDENT profile', async () => {
      const studentUsersRes = buildStudentUsersResponse([mockStudent1], 1, 1);
      mockPost
        .mockResolvedValueOnce(mockSummaryRes)
        .mockResolvedValueOnce(mockQuestionsRes)
        .mockResolvedValueOnce(mockRankingRes)
        .mockResolvedValueOnce(studentUsersRes);

      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() =>
        useHook(buildPerformanceParams({ profileTab: studentRole }))
      );

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      const expectedRequestBody = {
        period,
        targetProfile: studentRole,
        schoolGroupIds: baseFilters.schoolGroupIds,
        schoolIds: baseFilters.schoolIds,
        allSchoolGroupsSelected: baseFilters.allSchoolGroupsSelected,
      };

      expect(mockPost).toHaveBeenCalledWith(
        '/performance/report',
        expectedRequestBody
      );
      expect(mockPost).toHaveBeenCalledWith(
        '/access-report/performance/questions',
        expectedRequestBody
      );
      expect(mockPost).toHaveBeenCalledWith(
        '/performance/ranking',
        expectedRequestBody
      );
      expect(mockPost).toHaveBeenCalledWith('/performance/users-table', {
        ...expectedRequestBody,
        limit: 100,
        page: 1,
      });

      expect(mockBuildPerformanceSheets).toHaveBeenCalledWith(
        mockSummaryData,
        mockQuestionsData,
        mockRankingData,
        studentUsersRes.data.data.students,
        studentRole
      );

      expect(mockDownloadExcel).toHaveBeenCalledWith(
        'relatorio-desempenho',
        mockSheets
      );

      expect(result.current.isDownloading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch multiple pages of student users', async () => {
      const studentPage1 = buildStudentUsersResponse([mockStudent1], 150, 1);
      const studentPage2 = buildStudentUsersResponse([mockStudent2], 150, 2);

      mockPost
        .mockResolvedValueOnce(mockSummaryRes)
        .mockResolvedValueOnce(mockQuestionsRes)
        .mockResolvedValueOnce(mockRankingRes)
        .mockResolvedValueOnce(studentPage1)
        .mockResolvedValueOnce(studentPage2);

      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() =>
        useHook(buildPerformanceParams({ profileTab: studentRole }))
      );

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      expect(mockBuildPerformanceSheets).toHaveBeenCalledWith(
        mockSummaryData,
        mockQuestionsData,
        mockRankingData,
        [mockStudent1, mockStudent2],
        studentRole
      );
    });

    it('should fetch multiple pages of professional users', async () => {
      const profPage1 = buildProfessionalUsersResponse(
        [mockProfessional1],
        150,
        1
      );
      const profPage2 = buildProfessionalUsersResponse(
        [mockProfessional2],
        150,
        2
      );

      mockPost
        .mockResolvedValueOnce(mockSummaryRes)
        .mockResolvedValueOnce(mockQuestionsRes)
        .mockResolvedValueOnce(mockRankingRes)
        .mockResolvedValueOnce(profPage1)
        .mockResolvedValueOnce(profPage2);

      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() =>
        useHook(buildPerformanceParams({ profileTab: teacherRole }))
      );

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      expect(mockBuildPerformanceSheets).toHaveBeenCalledWith(
        mockSummaryData,
        mockQuestionsData,
        mockRankingData,
        [mockProfessional1, mockProfessional2],
        teacherRole
      );
    });

    it('should read professionals for non-STUDENT profile', async () => {
      const professionalUsersRes = buildProfessionalUsersResponse(
        [mockProfessional1],
        1,
        1
      );
      mockPost
        .mockResolvedValueOnce(mockSummaryRes)
        .mockResolvedValueOnce(mockQuestionsRes)
        .mockResolvedValueOnce(mockRankingRes)
        .mockResolvedValueOnce(professionalUsersRes);

      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() =>
        useHook(buildPerformanceParams({ profileTab: teacherRole }))
      );

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      expect(mockBuildPerformanceSheets).toHaveBeenCalledWith(
        mockSummaryData,
        mockQuestionsData,
        mockRankingData,
        professionalUsersRes.data.data.professionals,
        teacherRole
      );

      expect(mockDownloadExcel).toHaveBeenCalledWith(
        'relatorio-desempenho',
        mockSheets
      );
    });
  });

  describe('downloadExcelFile - fallback for undefined fields', () => {
    it('should fallback to empty array when students is undefined in response', async () => {
      const emptyStudentRes = {
        data: { message: 'ok', data: { total: 150, page: 1, limit: 100 } },
      };
      const emptyStudentPage2 = {
        data: { message: 'ok', data: { total: 150, page: 2, limit: 100 } },
      };

      mockPost
        .mockResolvedValueOnce(mockSummaryRes)
        .mockResolvedValueOnce(mockQuestionsRes)
        .mockResolvedValueOnce(mockRankingRes)
        .mockResolvedValueOnce(emptyStudentRes)
        .mockResolvedValueOnce(emptyStudentPage2);

      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() =>
        useHook(buildPerformanceParams({ profileTab: studentRole }))
      );

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      expect(mockBuildPerformanceSheets).toHaveBeenCalledWith(
        mockSummaryData,
        mockQuestionsData,
        mockRankingData,
        [],
        studentRole
      );
    });

    it('should fallback to empty array when professionals is undefined in response', async () => {
      const emptyProfRes = {
        data: { message: 'ok', data: { total: 150, page: 1, limit: 100 } },
      };
      const emptyProfPage2 = {
        data: { message: 'ok', data: { total: 150, page: 2, limit: 100 } },
      };

      mockPost
        .mockResolvedValueOnce(mockSummaryRes)
        .mockResolvedValueOnce(mockQuestionsRes)
        .mockResolvedValueOnce(mockRankingRes)
        .mockResolvedValueOnce(emptyProfRes)
        .mockResolvedValueOnce(emptyProfPage2);

      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() =>
        useHook(buildPerformanceParams({ profileTab: teacherRole }))
      );

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      expect(mockBuildPerformanceSheets).toHaveBeenCalledWith(
        mockSummaryData,
        mockQuestionsData,
        mockRankingData,
        [],
        teacherRole
      );
    });
  });

  describe('error handling', () => {
    it('should set error and reset isDownloading when access export fails', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network error'));

      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() => useHook(buildAccessParams()));

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      expect(result.current.error).toBe(
        'Erro ao gerar arquivo Excel. Tente novamente.'
      );
      expect(result.current.isDownloading).toBe(false);
    });

    it('should set error and reset isDownloading when performance export fails', async () => {
      mockPost.mockRejectedValueOnce(new Error('Server error'));

      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() => useHook(buildPerformanceParams()));

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      expect(result.current.error).toBe(
        'Erro ao gerar arquivo Excel. Tente novamente.'
      );
      expect(result.current.isDownloading).toBe(false);
    });

    it('should clear error on subsequent successful download', async () => {
      mockPost.mockRejectedValueOnce(new Error('fail'));

      const useHook = createUseReportExport({ api: mockApi });
      const { result } = renderHook(() => useHook(buildAccessParams()));

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      expect(result.current.error).toBe(
        'Erro ao gerar arquivo Excel. Tente novamente.'
      );

      mockPost.mockResolvedValueOnce(
        buildAccessUsersResponse([mockUser1], 1, 1, 1)
      );

      await act(async () => {
        await result.current.downloadExcelFile();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isDownloading).toBe(false);
    });
  });
});
