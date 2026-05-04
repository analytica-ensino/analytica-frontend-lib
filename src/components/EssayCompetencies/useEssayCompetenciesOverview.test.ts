import { renderHook, act } from '@testing-library/react';
import { useEssayCompetenciesOverview } from './useEssayCompetenciesOverview';
import type {
  EssayCompetenciesOverviewApiResponse,
  EssayCompetenciesOverviewData,
  EssayCompetenciesOverviewParams,
  EssayCompetencyOverviewItem,
} from './types';
import type { BaseApiClient } from '../../types/api';

/**
 * Create mock competency items (5 ENEM competencies)
 */
function createMockCompetencies(): EssayCompetencyOverviewItem[] {
  const names = [
    'Domínio da modalidade escrita formal da língua portuguesa',
    'Compreender a proposta de redação e aplicar conceitos',
    'Selecionar, relacionar, organizar e interpretar informações',
    'Demonstrar conhecimento dos mecanismos linguísticos',
    'Elaborar proposta de intervenção para o problema abordado',
  ];

  return names.map((name, i) => ({
    competencyNumber: i + 1,
    name,
    essaysCount: 20 + i * 5,
    studentsCount: 15 + i * 3,
    averageScore: 120 + i * 10,
    averagePercentage: 60 + i * 5,
  }));
}

/**
 * Create mock overview data
 */
function createMockData(): EssayCompetenciesOverviewData {
  return {
    competencies: createMockCompetencies(),
    totalEssays: 100,
    totalStudents: 50,
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

describe('useEssayCompetenciesOverview', () => {
  let mockApi: jest.Mocked<BaseApiClient>;

  beforeEach(() => {
    mockApi = createMockApi();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with null data, loading false, and no error', () => {
      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide fetchOverview and reset functions', () => {
      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      expect(typeof result.current.fetchOverview).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('fetchOverview', () => {
    it('should set loading to true when fetching', async () => {
      mockApi.post.mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      act(() => {
        result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(true);
    });

    it('should fetch data successfully', async () => {
      const mockData = createMockData();
      const response: EssayCompetenciesOverviewApiResponse = {
        message: 'Success',
        data: mockData,
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should call API with correct endpoint', async () => {
      const response: EssayCompetenciesOverviewApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/competencies-overview',
        expect.any(Object)
      );
    });

    it('should pass all parameters to API', async () => {
      const response: EssayCompetenciesOverviewApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      const params: EssayCompetenciesOverviewParams = {
        period: '3_MONTHS',
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1', 'class-2'],
      };

      await act(async () => {
        await result.current.fetchOverview(params);
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/competencies-overview',
        {
          period: '3_MONTHS',
          schoolIds: ['school-1', 'school-2'],
          schoolYearIds: ['year-1'],
          classIds: ['class-1', 'class-2'],
        }
      );
    });

    it('should use default values for optional parameters', async () => {
      const response: EssayCompetenciesOverviewApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/competencies-overview',
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

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Network error');
    });

    it('should handle API error with non-Error throw', async () => {
      mockApi.post.mockRejectedValueOnce('Something went wrong');

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(
        'Não foi possível carregar o resumo das competências'
      );
    });

    it('should clear previous error on new fetch', async () => {
      // First call fails
      mockApi.post.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(result.current.error).toBe('First error');

      // Second call succeeds
      const response: EssayCompetenciesOverviewApiResponse = {
        message: 'Success',
        data: createMockData(),
      };
      mockApi.post.mockResolvedValueOnce({ data: response });

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).not.toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const response: EssayCompetenciesOverviewApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      // Fetch data first
      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(result.current.data).not.toBeNull();

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should clear error state', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Some error'));

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('data structure', () => {
    it('should return all 5 ENEM competencies', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.competencies).toHaveLength(5);
      expect(result.current.data?.competencies[0].competencyNumber).toBe(1);
      expect(result.current.data?.competencies[4].competencyNumber).toBe(5);
    });

    it('should return correct competency structure', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.competencies[0]).toMatchObject({
        competencyNumber: expect.any(Number),
        name: expect.any(String),
        essaysCount: expect.any(Number),
        studentsCount: expect.any(Number),
        averageScore: expect.any(Number),
        averagePercentage: expect.any(Number),
      });
    });

    it('should return totals', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.totalEssays).toBe(100);
      expect(result.current.data?.totalStudents).toBe(50);
    });
  });

  describe('different periods', () => {
    it('should fetch data for different periods', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValue({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      // Fetch with 1 month
      await act(async () => {
        await result.current.fetchOverview({ period: '1_MONTH' });
      });

      expect(mockApi.post).toHaveBeenLastCalledWith(
        '/performance/simulated/essays/competencies-overview',
        expect.objectContaining({ period: '1_MONTH' })
      );

      // Fetch with 6 months
      await act(async () => {
        await result.current.fetchOverview({ period: '6_MONTHS' });
      });

      expect(mockApi.post).toHaveBeenLastCalledWith(
        '/performance/simulated/essays/competencies-overview',
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

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '1_MONTH',
          schoolIds: ['school-1', 'school-2', 'school-3'],
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/competencies-overview',
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

      const { result } = renderHook(() =>
        useEssayCompetenciesOverview(mockApi)
      );

      await act(async () => {
        await result.current.fetchOverview({
          period: '3_MONTHS',
          schoolIds: ['school-1'],
          schoolYearIds: ['year-2024'],
          classIds: ['class-A', 'class-B'],
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/competencies-overview',
        {
          period: '3_MONTHS',
          schoolIds: ['school-1'],
          schoolYearIds: ['year-2024'],
          classIds: ['class-A', 'class-B'],
        }
      );
    });
  });
});
