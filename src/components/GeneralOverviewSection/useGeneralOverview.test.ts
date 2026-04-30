import { renderHook, act } from '@testing-library/react';
import { useGeneralOverview } from './useGeneralOverview';
import type {
  GeneralOverviewApiResponse,
  GeneralOverviewData,
  GeneralOverviewParams,
  AreaKnowledgePerformance,
  EssayPerformance,
} from './types';
import type { BaseApiClient } from '../../types/api';

/**
 * Create mock areas (4 knowledge areas)
 */
function createMockAreas(): AreaKnowledgePerformance[] {
  return [
    {
      id: 'area-1',
      name: 'Linguagens',
      urlCover: null,
      icon: 'book',
      color: '#3B82F6',
      percentage: 68.5,
      questionsTotal: 100,
      questionsCorrect: 68,
    },
    {
      id: 'area-2',
      name: 'Humanas',
      urlCover: null,
      icon: 'globe',
      color: '#F59E0B',
      percentage: 72.3,
      questionsTotal: 80,
      questionsCorrect: 58,
    },
    {
      id: 'area-3',
      name: 'Natureza',
      urlCover: null,
      icon: 'leaf',
      color: '#22C55E',
      percentage: 65.0,
      questionsTotal: 90,
      questionsCorrect: 58,
    },
    {
      id: 'area-4',
      name: 'Matemática',
      urlCover: null,
      icon: 'calculator',
      color: '#8B5CF6',
      percentage: 70.8,
      questionsTotal: 85,
      questionsCorrect: 60,
    },
  ];
}

/**
 * Create mock essay performance
 */
function createMockEssay(): EssayPerformance {
  return {
    name: 'Redação',
    percentage: 75.5,
    totalEssays: 50,
    totalStudents: 30,
  };
}

/**
 * Create mock general overview data
 */
function createMockData(): GeneralOverviewData {
  return {
    overallPercentage: 69.2,
    totalQuestions: 355,
    totalCorrect: 244,
    areas: createMockAreas(),
    essay: createMockEssay(),
  };
}

/**
 * Create mock API client
 */
function createMockApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

describe('useGeneralOverview', () => {
  let mockApi: jest.Mocked<BaseApiClient>;
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    mockApi = createMockApi();
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('initial state', () => {
    it('should start with null data, loading false, and no error', () => {
      const { result } = renderHook(() => useGeneralOverview(mockApi));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide fetchOverview and reset functions', () => {
      const { result } = renderHook(() => useGeneralOverview(mockApi));

      expect(typeof result.current.fetchOverview).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('fetchOverview', () => {
    it('should set loading to true when fetching', async () => {
      mockApi.post.mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      act(() => {
        result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.isRefreshing).toBe(false);
    });

    it('should set isRefreshing to true when refresh is true', async () => {
      mockApi.post.mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      act(() => {
        result.current.fetchOverview({ period: '1_MONTH' }, true);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.isRefreshing).toBe(true);
    });

    it('should fetch data successfully', async () => {
      const mockData = createMockData();
      const response: GeneralOverviewApiResponse = {
        message: 'Success',
        data: mockData,
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should call API with correct endpoint for percentage scoreType', async () => {
      const response: GeneralOverviewApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
          scoreType: 'percentage',
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/general-overview',
        expect.any(Object)
      );
    });

    it('should add scoreType query param for TRI', async () => {
      const response: GeneralOverviewApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
          scoreType: 'tri',
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/general-overview?scoreType=tri',
        expect.any(Object)
      );
    });

    it('should pass all parameters to API body', async () => {
      const response: GeneralOverviewApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      const params: GeneralOverviewParams = {
        period: '3_MONTHS',
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1', 'class-2'],
      };

      await act(async () => {
        await result.current.fetchOverview(params);
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/general-overview',
        {
          period: '3_MONTHS',
          schoolIds: ['school-1', 'school-2'],
          schoolYearIds: ['year-1'],
          classIds: ['class-1', 'class-2'],
        }
      );
    });

    it('should use default empty arrays for optional parameters', async () => {
      const response: GeneralOverviewApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/general-overview',
        {
          period: '1_MONTH',
          schoolIds: [],
          schoolYearIds: [],
          classIds: [],
        }
      );
    });

    it('should handle API error with Error instance', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Network error');
    });

    it('should handle API error with non-Error throw', async () => {
      mockApi.post.mockRejectedValueOnce('Something went wrong');

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(
        'Erro ao carregar dados gerais de desempenho'
      );
    });

    it('should clear previous error on new fetch', async () => {
      // First call fails
      mockApi.post.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.error).toBe('First error');

      // Second call succeeds
      const response: GeneralOverviewApiResponse = {
        message: 'Success',
        data: createMockData(),
      };
      mockApi.post.mockResolvedValueOnce({ data: response });

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).not.toBeNull();
    });

    it('should log error to console on failure', async () => {
      const error = new Error('Test error');
      mockApi.post.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching general overview:',
        error
      );
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const response: GeneralOverviewApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      // Fetch data first
      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.data).not.toBeNull();

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should clear error state', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Some error'));

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('data structure', () => {
    it('should return overall percentage and totals', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.data?.overallPercentage).toBe(69.2);
      expect(result.current.data?.totalQuestions).toBe(355);
      expect(result.current.data?.totalCorrect).toBe(244);
    });

    it('should return all 4 knowledge areas', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.data?.areas).toHaveLength(4);
      expect(result.current.data?.areas[0].name).toBe('Linguagens');
      expect(result.current.data?.areas[3].name).toBe('Matemática');
    });

    it('should return correct area structure', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.data?.areas[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        percentage: expect.any(Number),
        questionsTotal: expect.any(Number),
        questionsCorrect: expect.any(Number),
      });
    });

    it('should return essay data', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(result.current.data?.essay).toMatchObject({
        name: 'Redação',
        percentage: 75.5,
        totalEssays: 50,
        totalStudents: 30,
      });
    });
  });

  describe('different periods', () => {
    it('should fetch data for different periods', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValue({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      // Fetch with 1 month
      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(mockApi.post).toHaveBeenLastCalledWith(
        '/performance/simulated/general-overview',
        expect.objectContaining({ period: '1_MONTH' })
      );

      // Fetch with 6 months
      await act(async () => {
        await result.current.fetchOverview({ period: '6_MONTHS' });
      });

      expect(mockApi.post).toHaveBeenLastCalledWith(
        '/performance/simulated/general-overview',
        expect.objectContaining({ period: '6_MONTHS' })
      );
    });
  });

  describe('filter combinations', () => {
    it('should handle multiple schools filter', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
          schoolIds: ['school-1', 'school-2', 'school-3'],
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/general-overview',
        expect.objectContaining({
          schoolIds: ['school-1', 'school-2', 'school-3'],
        })
      );
    });

    it('should handle all filters combined', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      await act(async () => {
        await result.current.fetchOverview({
          period: '3_MONTHS',
          schoolIds: ['school-1'],
          schoolYearIds: ['year-2024'],
          classIds: ['class-A', 'class-B'],
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/general-overview',
        {
          period: '3_MONTHS',
          schoolIds: ['school-1'],
          schoolYearIds: ['year-2024'],
          classIds: ['class-A', 'class-B'],
        }
      );
    });
  });

  describe('refresh behavior', () => {
    it('should not set loading when refreshing', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValue({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useGeneralOverview(mockApi));

      // First fetch
      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      // Start refresh - check state during refresh
      mockApi.post.mockReturnValue(new Promise(() => {})); // Never resolves

      act(() => {
        result.current.fetchOverview({ period: '1_MONTH' }, true);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.isRefreshing).toBe(true);
      expect(result.current.data).not.toBeNull(); // Data should still be present
    });
  });
});
