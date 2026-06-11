import { act, renderHook } from '@testing-library/react';
import { useAggregatedOverview } from './useAggregatedOverview';
import type {
  StudentsOnlyOverviewData,
  ClassesOverviewData,
  MunicipalitiesOverviewData,
  StudentsOverviewApiResponse,
  ClassesOverviewApiResponse,
  MunicipalitiesOverviewApiResponse,
} from './types';
import { ScoreType } from '../../types/common';
import { SimulatedPerformanceTag } from '../SimulatedStudentDetailsModal/types';
import type { BaseApiClient } from '../../types/api';

function createMockApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

function createMockStudentsData(): StudentsOnlyOverviewData {
  return {
    classAverage: 71.5,
    totalStudents: 3,
    counters: {
      highlight: 1,
      aboveAverage: 1,
      belowAverage: 1,
      attentionPoint: 0,
    },
    topHighlights: [
      {
        studentId: 'student-1',
        institutionId: 'inst-1',
        userInstitutionId: 'user-inst-1',
        name: 'Maria',
        school: 'Escola A',
        schoolYear: '3 ano',
        class: 'A',
        average: 85.3,
        performance: SimulatedPerformanceTag.HIGHLIGHT,
      },
    ],
    topDifficulties: [
      {
        studentId: 'student-2',
        institutionId: 'inst-1',
        userInstitutionId: 'user-inst-2',
        name: 'Joao',
        school: 'Escola A',
        schoolYear: '3 ano',
        class: 'A',
        average: 41.9,
        performance: SimulatedPerformanceTag.BELOW_AVERAGE,
      },
    ],
  };
}

function createMockClassesData(): ClassesOverviewData {
  return {
    classAverage: 68,
    totalClasses: 2,
    totalStudents: 50,
    counters: {
      highlight: 1,
      aboveAverage: 0,
      belowAverage: 1,
      attentionPoint: 0,
    },
    topHighlights: [
      {
        classId: 'class-1',
        className: 'Turma A',
        schoolName: 'Escola 1',
        schoolYearName: '2024',
        shift: 'morning',
        studentCount: 25,
        average: 80,
        performance: SimulatedPerformanceTag.HIGHLIGHT,
      },
    ],
    topDifficulties: [
      {
        classId: 'class-2',
        className: 'Turma B',
        schoolName: 'Escola 1',
        schoolYearName: '2024',
        shift: 'afternoon',
        studentCount: 25,
        average: 56,
        performance: SimulatedPerformanceTag.BELOW_AVERAGE,
      },
    ],
  };
}

function createMockMunicipalitiesData(): MunicipalitiesOverviewData {
  return {
    classAverage: 74.3,
    totalMunicipalities: 2,
    totalSchools: 15,
    totalStudents: 700,
    counters: {
      highlight: 1,
      aboveAverage: 1,
      belowAverage: 0,
      attentionPoint: 0,
    },
    topHighlights: [
      {
        municipality: 'Curitiba',
        state: 'PR',
        schoolCount: 10,
        studentCount: 500,
        average: 80,
        performance: SimulatedPerformanceTag.HIGHLIGHT,
      },
    ],
    topDifficulties: [
      {
        municipality: 'Londrina',
        state: 'PR',
        schoolCount: 5,
        studentCount: 200,
        average: 60,
        performance: SimulatedPerformanceTag.BELOW_AVERAGE,
      },
    ],
  };
}

describe('useAggregatedOverview', () => {
  it('starts with initial state', () => {
    const api = createMockApi();
    const { result } = renderHook(() => useAggregatedOverview(api));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('students aggregation', () => {
    it('calls students endpoint for enem-1', async () => {
      const api = createMockApi();
      const response: StudentsOverviewApiResponse = {
        message: 'ok',
        data: createMockStudentsData(),
      };
      api.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview({
          aggregationType: 'students',
          simulationType: 'enem-1',
          period: '1_MONTH',
        });
      });

      expect(api.post).toHaveBeenCalledWith(
        '/performance/simulated/activities/overview/students?types=SIMULADO',
        {
          period: '1_MONTH',
          subjectId: undefined,
          areaKnowledgeId: undefined,
          schoolIds: undefined,
          schoolYearIds: undefined,
          classIds: undefined,
          studentsIds: undefined,
        }
      );
      expect(result.current.data).toEqual(response.data);
      expect(result.current.error).toBeNull();
    });

    it('calls endpoint with scoreType query param', async () => {
      const api = createMockApi();
      api.post.mockResolvedValueOnce({
        data: { message: 'ok', data: createMockStudentsData() },
      });

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview({
          aggregationType: 'students',
          simulationType: 'enem-2',
          period: '3_MONTHS',
          scoreType: ScoreType.TRI,
        });
      });

      expect(api.post).toHaveBeenCalledWith(
        '/performance/simulated/activities/overview/students?types=SIMULADO&scoreType=tri',
        expect.any(Object)
      );
    });
  });

  describe('classes aggregation', () => {
    it('calls classes endpoint for enem-1', async () => {
      const api = createMockApi();
      const response: ClassesOverviewApiResponse = {
        message: 'ok',
        data: createMockClassesData(),
      };
      api.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview({
          aggregationType: 'classes',
          simulationType: 'enem-1',
          period: '1_MONTH',
        });
      });

      expect(api.post).toHaveBeenCalledWith(
        '/performance/simulated/activities/overview/classes?types=SIMULADO',
        expect.any(Object)
      );
      expect(result.current.data).toEqual(response.data);
    });

    it('returns classes data with correct structure', async () => {
      const api = createMockApi();
      const mockData = createMockClassesData();
      api.post.mockResolvedValueOnce({
        data: { message: 'ok', data: mockData },
      });

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview({
          aggregationType: 'classes',
          simulationType: 'enem-1',
          period: '1_MONTH',
        });
      });

      const data = result.current.data as ClassesOverviewData;
      expect(data.totalClasses).toBe(2);
      expect(data.totalStudents).toBe(50);
      expect(data.topHighlights[0].className).toBe('Turma A');
    });
  });

  describe('municipalities aggregation', () => {
    it('calls municipalities endpoint for enem-1', async () => {
      const api = createMockApi();
      const response: MunicipalitiesOverviewApiResponse = {
        message: 'ok',
        data: createMockMunicipalitiesData(),
      };
      api.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview({
          aggregationType: 'municipalities',
          simulationType: 'enem-1',
          period: '1_MONTH',
        });
      });

      expect(api.post).toHaveBeenCalledWith(
        '/performance/simulated/activities/overview/municipalities?types=SIMULADO',
        expect.any(Object)
      );
      expect(result.current.data).toEqual(response.data);
    });

    it('returns municipalities data with correct structure', async () => {
      const api = createMockApi();
      const mockData = createMockMunicipalitiesData();
      api.post.mockResolvedValueOnce({
        data: { message: 'ok', data: mockData },
      });

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview({
          aggregationType: 'municipalities',
          simulationType: 'enem-1',
          period: '1_MONTH',
        });
      });

      const data = result.current.data as MunicipalitiesOverviewData;
      expect(data.totalMunicipalities).toBe(2);
      expect(data.totalSchools).toBe(15);
      expect(data.topHighlights[0].municipality).toBe('Curitiba');
    });
  });

  describe('essays simulation type', () => {
    it('calls essays endpoint for students aggregation', async () => {
      const api = createMockApi();
      api.post.mockResolvedValueOnce({
        data: { message: 'ok', data: createMockStudentsData() },
      });

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview({
          aggregationType: 'students',
          simulationType: 'essays',
          period: '6_MONTHS',
        });
      });

      expect(api.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/students-overview',
        expect.any(Object)
      );
    });
  });

  describe('loading states', () => {
    it('sets loading to true during fetch', async () => {
      const api = createMockApi();
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      api.post.mockReturnValueOnce(promise as never);

      const { result } = renderHook(() => useAggregatedOverview(api));

      act(() => {
        result.current.fetchOverview({
          aggregationType: 'students',
          simulationType: 'enem-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!({
          data: { message: 'ok', data: createMockStudentsData() },
        });
      });

      expect(result.current.loading).toBe(false);
    });

    it('sets isRefreshing when refresh flag is true', async () => {
      const api = createMockApi();
      api.post.mockResolvedValueOnce({
        data: { message: 'ok', data: createMockStudentsData() },
      });

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview(
          {
            aggregationType: 'students',
            simulationType: 'enem-1',
            period: '1_MONTH',
          },
          true
        );
      });

      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('stores error message when request fails with Error', async () => {
      const api = createMockApi();
      api.post.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview({
          aggregationType: 'students',
          simulationType: 'enem-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.error).toBe('Network error');
    });

    it('stores friendly error when request fails with non-Error', async () => {
      const api = createMockApi();
      api.post.mockRejectedValueOnce('fail');

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview({
          aggregationType: 'students',
          simulationType: 'enem-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.error).toBe(
        'Não foi possível carregar os dados de overview'
      );
    });
  });

  describe('reset', () => {
    it('returns state to initial values', async () => {
      const api = createMockApi();
      api.post.mockResolvedValueOnce({
        data: { message: 'ok', data: createMockStudentsData() },
      });

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview({
          aggregationType: 'students',
          simulationType: 'enem-1',
          period: '1_MONTH',
        });
      });
      expect(result.current.data).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('body params', () => {
    it('passes all filter params in body', async () => {
      const api = createMockApi();
      api.post.mockResolvedValueOnce({
        data: { message: 'ok', data: createMockStudentsData() },
      });

      const { result } = renderHook(() => useAggregatedOverview(api));

      await act(async () => {
        await result.current.fetchOverview({
          aggregationType: 'students',
          simulationType: 'enem-1',
          period: '3_MONTHS',
          subjectId: 'subject-1',
          areaKnowledgeId: 'area-1',
          schoolIds: ['school-1', 'school-2'],
          schoolYearIds: ['year-1'],
          classIds: ['class-1'],
          studentsIds: ['student-1'],
        });
      });

      expect(api.post).toHaveBeenCalledWith(expect.any(String), {
        period: '3_MONTHS',
        subjectId: 'subject-1',
        areaKnowledgeId: 'area-1',
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1'],
        studentsIds: ['student-1'],
      });
    });
  });
});
