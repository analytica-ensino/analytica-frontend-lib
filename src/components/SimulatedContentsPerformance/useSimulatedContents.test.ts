import { renderHook, act } from '@testing-library/react';
import { useSimulatedContents } from './useSimulatedContents';
import type {
  ContentsPerformanceApiResponse,
  ContentsPerformanceData,
  SimulatedContentsParams,
} from './types';
import type { BaseApiClient } from '../../types/api';

function createMockData(): ContentsPerformanceData {
  return {
    data: [
      {
        contentId: 'content-1',
        contentName: 'Leitura e interpretação',
        bnccCode: 'EM13LP01',
        subject: { id: 'subject-1', name: 'Linguagens' },
        simulatedExamsCount: 6,
        questionsCount: 12,
        studentsCount: 24,
        performance: {
          correct: 180,
          incorrect: 60,
          correctPercentage: 75,
        },
      },
    ],
    page: 1,
    limit: 10,
    total: 1,
  };
}

function createMockApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

describe('useSimulatedContents', () => {
  let mockApi: jest.Mocked<BaseApiClient>;

  beforeEach(() => {
    mockApi = createMockApi();
    jest.clearAllMocks();
  });

  it('starts with the expected initial state', () => {
    const { result } = renderHook(() => useSimulatedContents(mockApi));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.fetchContents).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('sets loading=true on first load', () => {
    mockApi.post.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useSimulatedContents(mockApi));

    act(() => {
      result.current.fetchContents({
        simulationType: 'enem-1',
        period: '1_MONTH',
      });
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('fetches data successfully', async () => {
    const mockData = createMockData();
    const response: ContentsPerformanceApiResponse = {
      message: 'Success',
      data: mockData,
    };
    mockApi.post.mockResolvedValueOnce({ data: response });

    const { result } = renderHook(() => useSimulatedContents(mockApi));

    await act(async () => {
      await result.current.fetchContents({
        simulationType: 'enem-1',
        period: '1_MONTH',
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(mockData);
  });

  it('builds endpoint with query params and scoreType', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { message: 'Success', data: createMockData() },
    });

    const { result } = renderHook(() => useSimulatedContents(mockApi));

    await act(async () => {
      await result.current.fetchContents({
        simulationType: 'enem-2',
        period: '3_MONTHS',
        scoreType: 'tri',
      });
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      '/performance/simulated/activities/contents-performance?types=SIMULADO&subtypes=ENEM_PROVA_2&scoreType=tri',
      expect.any(Object)
    );
  });

  it('sends payload with defaults and all params', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { message: 'Success', data: createMockData() },
    });

    const { result } = renderHook(() => useSimulatedContents(mockApi));

    const params: SimulatedContentsParams = {
      simulationType: 'enem-1',
      period: '6_MONTHS',
      subjectId: 'subject-1',
      areaKnowledgeId: 'area-1',
      schoolIds: ['school-1'],
      schoolYearIds: ['year-1'],
      classIds: ['class-1'],
      orderBy: 'correct',
      order: 'desc',
    };

    await act(async () => {
      await result.current.fetchContents(params);
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      '/performance/simulated/activities/contents-performance?types=SIMULADO&subtypes=ENEM_PROVA_1',
      {
        period: '6_MONTHS',
        subjectId: 'subject-1',
        areaKnowledgeId: 'area-1',
        schoolIds: ['school-1'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1'],
        studentsIds: undefined,
        page: 1,
        limit: 10,
        orderBy: 'correct',
        order: 'desc',
      }
    );
  });

  it('maps "all" filters to undefined in payload', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { message: 'Success', data: createMockData() },
    });

    const { result } = renderHook(() => useSimulatedContents(mockApi));

    await act(async () => {
      await result.current.fetchContents({
        simulationType: 'enem-1',
        subjectId: 'all',
        areaKnowledgeId: 'all',
      });
    });

    expect(mockApi.post).toHaveBeenCalledWith(expect.any(String), {
      period: undefined,
      subjectId: undefined,
      areaKnowledgeId: undefined,
      schoolIds: undefined,
      schoolYearIds: undefined,
      classIds: undefined,
      page: 1,
      limit: 10,
      orderBy: 'correctPercentage',
      order: 'asc',
    });
  });

  it('returns null data and skips API for essays simulation', async () => {
    const { result } = renderHook(() => useSimulatedContents(mockApi));

    await act(async () => {
      await result.current.fetchContents({
        simulationType: 'essays',
        period: '1_MONTH',
      });
    });

    expect(mockApi.post).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('handles error with Error instance', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useSimulatedContents(mockApi));

    await act(async () => {
      await result.current.fetchContents({
        simulationType: 'enem-1',
      });
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('handles non-Error throw with fallback message', async () => {
    mockApi.post.mockRejectedValueOnce('Unknown');
    const { result } = renderHook(() => useSimulatedContents(mockApi));

    await act(async () => {
      await result.current.fetchContents({
        simulationType: 'enem-1',
      });
    });

    expect(result.current.error).toBe('Erro ao carregar dados de habilidades');
  });

  it('uses refreshing state after first successful load', async () => {
    mockApi.post
      .mockResolvedValueOnce({
        data: { message: 'Success', data: createMockData() },
      })
      .mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useSimulatedContents(mockApi));

    await act(async () => {
      await result.current.fetchContents({ simulationType: 'enem-1' });
    });

    act(() => {
      result.current.fetchContents({ simulationType: 'enem-1' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
  });

  it('reset clears all state and restores first-load behavior', async () => {
    mockApi.post.mockResolvedValue({
      data: { message: 'Success', data: createMockData() },
    });

    const { result } = renderHook(() => useSimulatedContents(mockApi));

    await act(async () => {
      await result.current.fetchContents({ simulationType: 'enem-1' });
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.error).toBeNull();

    mockApi.post.mockReturnValueOnce(new Promise(() => {}));
    act(() => {
      result.current.fetchContents({ simulationType: 'enem-1' });
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.isRefreshing).toBe(false);
  });
});
