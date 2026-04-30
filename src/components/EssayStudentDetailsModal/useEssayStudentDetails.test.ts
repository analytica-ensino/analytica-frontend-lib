import { renderHook, act } from '@testing-library/react';
import { useEssayStudentDetails } from './useEssayStudentDetails';
import type {
  EssayStudentDetailsApiResponse,
  EssayStudentDetailsData,
  EssayStudentDetailsParams,
  EssayCompetencyPerformance,
} from './types';
import { SimulatedPerformanceTag } from './types';
import type { BaseApiClient } from '../../types/api';

/**
 * Create mock competencies (5 ENEM competencies)
 */
function createMockCompetencies(): EssayCompetencyPerformance[] {
  const names = [
    'Domínio da modalidade escrita formal da língua portuguesa',
    'Compreender a proposta de redação e aplicar conceitos',
    'Selecionar, relacionar, organizar e interpretar informações',
    'Demonstrar conhecimento dos mecanismos linguísticos',
    'Elaborar proposta de intervenção para o problema abordado',
  ];

  return names.map((name, i) => ({
    number: i + 1,
    name,
    averageScore: 120 + i * 15,
    averagePercentage: 60 + i * 8,
    essaysCount: 3,
  }));
}

/**
 * Create mock student details data
 */
function createMockData(): EssayStudentDetailsData {
  return {
    student: {
      id: 'student-1',
      name: 'Maria Silva',
      school: 'Colégio Santa Maria',
      schoolYear: '2024',
      class: '3A',
    },
    overallAverage: 720,
    overallPercentage: 72,
    performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
    essaysCount: 5,
    competencies: createMockCompetencies(),
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

describe('useEssayStudentDetails', () => {
  let mockApi: jest.Mocked<BaseApiClient>;

  beforeEach(() => {
    mockApi = createMockApi();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with null data, loading false, and no error', () => {
      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide fetchDetails and reset functions', () => {
      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      expect(typeof result.current.fetchDetails).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('fetchDetails', () => {
    it('should set loading to true when fetching', async () => {
      mockApi.post.mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      act(() => {
        result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(true);
    });

    it('should fetch data successfully', async () => {
      const mockData = createMockData();
      const response: EssayStudentDetailsApiResponse = {
        message: 'Success',
        data: mockData,
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should call API with correct endpoint', async () => {
      const response: EssayStudentDetailsApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/student-details',
        expect.any(Object)
      );
    });

    it('should pass all parameters to API', async () => {
      const response: EssayStudentDetailsApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      const params: EssayStudentDetailsParams = {
        userInstitutionId: 'user-inst-1',
        period: '3_MONTHS',
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1', 'class-2'],
      };

      await act(async () => {
        await result.current.fetchDetails(params);
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/student-details',
        {
          userInstitutionId: 'user-inst-1',
          period: '3_MONTHS',
          schoolIds: ['school-1', 'school-2'],
          schoolYearIds: ['year-1'],
          classIds: ['class-1', 'class-2'],
        }
      );
    });

    it('should use default empty arrays for optional parameters', async () => {
      const response: EssayStudentDetailsApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/student-details',
        {
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
          schoolIds: [],
          schoolYearIds: [],
          classIds: [],
        }
      );
    });

    it('should handle API error with Error instance', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Network error');
    });

    it('should handle API error with non-Error throw', async () => {
      mockApi.post.mockRejectedValueOnce('Something went wrong');

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(
        'Não foi possível carregar os detalhes do estudante'
      );
    });

    it('should clear previous error on new fetch', async () => {
      // First call fails
      mockApi.post.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.error).toBe('First error');

      // Second call succeeds
      const response: EssayStudentDetailsApiResponse = {
        message: 'Success',
        data: createMockData(),
      };
      mockApi.post.mockResolvedValueOnce({ data: response });

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).not.toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const response: EssayStudentDetailsApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      // Fetch data first
      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
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

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
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
    it('should return student info', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.student).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        school: expect.any(String),
        schoolYear: expect.any(String),
        class: expect.any(String),
      });
    });

    it('should return all 5 ENEM competencies', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.competencies).toHaveLength(5);
      expect(result.current.data?.competencies[0].number).toBe(1);
      expect(result.current.data?.competencies[4].number).toBe(5);
    });

    it('should return correct competency structure', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.competencies[0]).toMatchObject({
        number: expect.any(Number),
        name: expect.any(String),
        averageScore: expect.any(Number),
        averagePercentage: expect.any(Number),
        essaysCount: expect.any(Number),
      });
    });

    it('should return overall average and percentage', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.overallAverage).toBe(720);
      expect(result.current.data?.overallPercentage).toBe(72);
    });

    it('should return performance tag', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.performance).toBe(
        SimulatedPerformanceTag.ABOVE_AVERAGE
      );
    });

    it('should return essays count', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.essaysCount).toBe(5);
    });
  });

  describe('different periods', () => {
    it('should fetch data for different periods', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValue({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      // Fetch with 1 month
      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
        });
      });

      expect(mockApi.post).toHaveBeenLastCalledWith(
        '/performance/simulated/essays/student-details',
        expect.objectContaining({ period: '1_MONTH' })
      );

      // Fetch with 6 months
      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '6_MONTHS',
        });
      });

      expect(mockApi.post).toHaveBeenLastCalledWith(
        '/performance/simulated/essays/student-details',
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

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '1_MONTH',
          schoolIds: ['school-1', 'school-2', 'school-3'],
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/student-details',
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

      const { result } = renderHook(() => useEssayStudentDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          userInstitutionId: 'user-inst-1',
          period: '3_MONTHS',
          schoolIds: ['school-1'],
          schoolYearIds: ['year-2024'],
          classIds: ['class-A', 'class-B'],
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/student-details',
        {
          userInstitutionId: 'user-inst-1',
          period: '3_MONTHS',
          schoolIds: ['school-1'],
          schoolYearIds: ['year-2024'],
          classIds: ['class-A', 'class-B'],
        }
      );
    });
  });
});
