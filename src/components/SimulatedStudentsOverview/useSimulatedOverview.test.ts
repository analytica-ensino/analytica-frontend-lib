import { act, renderHook } from '@testing-library/react';
import { useSimulatedOverview } from './useSimulatedOverview';
import type {
  SimulatedOverviewApiResponse,
  SimulatedOverviewData,
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

function createMockData(): SimulatedOverviewData {
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
    students: {
      data: [],
      page: 1,
      limit: 10,
      total: 0,
    },
  };
}

describe('useSimulatedOverview', () => {
  it('starts with initial state', () => {
    const api = createMockApi();
    const { result } = renderHook(() => useSimulatedOverview(api));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('calls activities endpoint for enem-1 with default body values', async () => {
    const api = createMockApi();
    const response: SimulatedOverviewApiResponse = {
      message: 'ok',
      data: createMockData(),
    };
    api.post.mockResolvedValueOnce({ data: response });

    const { result } = renderHook(() => useSimulatedOverview(api));

    await act(async () => {
      await result.current.fetchOverview({
        simulationType: 'enem-1',
        period: '1_MONTH',
      });
    });

    expect(api.post).toHaveBeenCalledWith(
      '/performance/simulated/activities/students-overview?types=SIMULADO',
      {
        period: '1_MONTH',
        subjectId: undefined,
        areaKnowledgeId: undefined,
        schoolIds: undefined,
        schoolYearIds: undefined,
        classIds: undefined,
        page: 1,
        limit: 10,
        orderBy: 'name',
        order: 'asc',
      }
    );
    expect(result.current.data).toEqual(response.data);
    expect(result.current.error).toBeNull();
  });

  it('calls activities endpoint for enem-2 with scoreType query param', async () => {
    const api = createMockApi();
    api.post.mockResolvedValueOnce({
      data: { message: 'ok', data: createMockData() },
    });

    const { result } = renderHook(() => useSimulatedOverview(api));

    await act(async () => {
      await result.current.fetchOverview({
        simulationType: 'enem-2',
        period: '3_MONTHS',
        scoreType: ScoreType.TRI,
        page: 2,
        limit: 20,
      });
    });

    expect(api.post).toHaveBeenCalledWith(
      '/performance/simulated/activities/students-overview?types=SIMULADO&scoreType=tri',
      expect.objectContaining({
        page: 2,
        limit: 20,
      })
    );
  });

  it('calls essays endpoint and keeps scoreType out when percentage', async () => {
    const api = createMockApi();
    api.post.mockResolvedValueOnce({
      data: { message: 'ok', data: createMockData() },
    });

    const { result } = renderHook(() => useSimulatedOverview(api));

    await act(async () => {
      await result.current.fetchOverview({
        simulationType: 'essays',
        period: '6_MONTHS',
        scoreType: ScoreType.PERCENTAGE,
      });
    });

    expect(api.post).toHaveBeenCalledWith(
      '/performance/simulated/essays/students-overview',
      expect.any(Object)
    );
  });

  it('sets isRefreshing when refresh flag is true', async () => {
    const api = createMockApi();
    api.post.mockResolvedValueOnce({
      data: { message: 'ok', data: createMockData() },
    });

    const { result } = renderHook(() => useSimulatedOverview(api));

    await act(async () => {
      await result.current.fetchOverview(
        { simulationType: 'enem-1', period: '1_MONTH' },
        true
      );
    });

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('stores friendly error when request fails with non-Error', async () => {
    const api = createMockApi();
    api.post.mockRejectedValueOnce('fail');

    const { result } = renderHook(() => useSimulatedOverview(api));

    await act(async () => {
      await result.current.fetchOverview({
        simulationType: 'enem-1',
        period: '1_MONTH',
      });
    });

    expect(result.current.error).toBe(
      'Não foi possível carregar os dados de simulados'
    );
  });

  it('reset returns state to initial values', async () => {
    const api = createMockApi();
    api.post.mockResolvedValueOnce({
      data: { message: 'ok', data: createMockData() },
    });

    const { result } = renderHook(() => useSimulatedOverview(api));

    await act(async () => {
      await result.current.fetchOverview({
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
