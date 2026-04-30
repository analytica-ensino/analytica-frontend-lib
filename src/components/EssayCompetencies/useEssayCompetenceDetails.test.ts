import { renderHook, waitFor, act } from '@testing-library/react';
import { useEssayCompetenceDetails } from './useEssayCompetenceDetails';
import {
  SimulatedPerformanceTag,
  type EssayCompetenciesApiClient,
  type EssayCompetenceDetailsApiResponse,
  type EssayCompetenceDetailsData,
  type EssayCompetenceDetailsParams,
} from './types';

/**
 * Create mock student items
 */
function createMockStudents(count: number) {
  const performances = [
    SimulatedPerformanceTag.HIGHLIGHT,
    SimulatedPerformanceTag.ABOVE_AVERAGE,
    SimulatedPerformanceTag.BELOW_AVERAGE,
    SimulatedPerformanceTag.ATTENTION_POINT,
  ];

  return Array.from({ length: count }, (_, i) => ({
    studentId: `student-${i + 1}`,
    userInstitutionId: `user-inst-${i + 1}`,
    name: `Estudante ${i + 1}`,
    school: `Escola ${Math.floor(i / 5) + 1}`,
    schoolYear: '2024',
    class: `Turma ${String.fromCharCode(65 + (i % 3))}`,
    averageScore: 100 + i * 10,
    averagePercentage: 50 + i * 5,
    performance: performances[i % performances.length],
    essaysCount: i + 1,
  }));
}

/**
 * Create mock competence details data
 */
function createMockData(
  competenceNumber = 1,
  studentCount = 5,
  page = 1,
  total = 5
): EssayCompetenceDetailsData {
  return {
    competence: {
      number: competenceNumber,
      name: 'Domínio da modalidade escrita formal da língua portuguesa',
    },
    classAverage: 145.5,
    classAveragePercentage: 72.75,
    totalEssays: 25,
    totalStudents: total,
    counters: {
      highlight: 5,
      aboveAverage: 10,
      belowAverage: 7,
      attentionPoint: 3,
    },
    students: {
      data: createMockStudents(studentCount),
      page,
      limit: 10,
      total,
    },
  };
}

/**
 * Create mock API client
 */
function createMockApi(): jest.Mocked<EssayCompetenciesApiClient> {
  return {
    post: jest.fn(),
  };
}

describe('useEssayCompetenceDetails', () => {
  let mockApi: jest.Mocked<EssayCompetenciesApiClient>;

  beforeEach(() => {
    mockApi = createMockApi();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with null data, loading false, and no error', () => {
      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide fetchDetails and reset functions', () => {
      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      expect(typeof result.current.fetchDetails).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('fetchDetails', () => {
    it('should set loading to true when fetching', async () => {
      mockApi.post.mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      act(() => {
        result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(true);
    });

    it('should fetch data successfully', async () => {
      const mockData = createMockData();
      const response: EssayCompetenceDetailsApiResponse = {
        message: 'Success',
        data: mockData,
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should call API with correct endpoint', async () => {
      const response: EssayCompetenceDetailsApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/competence-details',
        expect.any(Object)
      );
    });

    it('should pass all parameters to API', async () => {
      const response: EssayCompetenceDetailsApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      const params: EssayCompetenceDetailsParams = {
        competenceNumber: 2,
        period: '3_MONTHS',
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1'],
        page: 2,
        limit: 20,
        orderBy: 'name',
        order: 'asc',
      };

      await act(async () => {
        await result.current.fetchDetails(params);
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/competence-details',
        {
          competenceNumber: 2,
          period: '3_MONTHS',
          schoolIds: ['school-1', 'school-2'],
          schoolYearIds: ['year-1'],
          classIds: ['class-1'],
          page: 2,
          limit: 20,
          orderBy: 'name',
          order: 'asc',
        }
      );
    });

    it('should use default values for optional parameters', async () => {
      const response: EssayCompetenceDetailsApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/competence-details',
        {
          competenceNumber: 1,
          period: '1_MONTH',
          schoolIds: [],
          schoolYearIds: [],
          classIds: [],
          page: 1,
          limit: 20,
          orderBy: 'averageScore',
          order: 'desc',
        }
      );
    });

    it('should handle API error with Error instance', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Network error');
    });

    it('should handle API error with non-Error throw', async () => {
      mockApi.post.mockRejectedValueOnce('Something went wrong');

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(
        'Não foi possível carregar os detalhes da competência'
      );
    });

    it('should clear previous error on new fetch', async () => {
      // First call fails
      mockApi.post.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
        });
      });

      expect(result.current.error).toBe('First error');

      // Second call succeeds
      const response: EssayCompetenceDetailsApiResponse = {
        message: 'Success',
        data: createMockData(),
      };
      mockApi.post.mockResolvedValueOnce({ data: response });

      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
        });
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).not.toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const response: EssayCompetenceDetailsApiResponse = {
        message: 'Success',
        data: createMockData(),
      };

      mockApi.post.mockResolvedValueOnce({ data: response });

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      // Fetch data first
      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
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

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
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

  describe('pagination', () => {
    it('should fetch different pages', async () => {
      const page1Data = createMockData(1, 10, 1, 25);
      const page2Data = createMockData(1, 10, 2, 25);

      mockApi.post
        .mockResolvedValueOnce({
          data: { message: 'Success', data: page1Data },
        })
        .mockResolvedValueOnce({
          data: { message: 'Success', data: page2Data },
        });

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      // Fetch page 1
      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
          page: 1,
          limit: 10,
        });
      });

      expect(result.current.data?.students.page).toBe(1);

      // Fetch page 2
      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
          page: 2,
          limit: 10,
        });
      });

      expect(result.current.data?.students.page).toBe(2);
    });
  });

  describe('different competencies', () => {
    it('should fetch data for different competence numbers', async () => {
      const comp1Data = createMockData(1);
      const comp2Data = createMockData(2);

      mockApi.post
        .mockResolvedValueOnce({
          data: { message: 'Success', data: comp1Data },
        })
        .mockResolvedValueOnce({
          data: { message: 'Success', data: comp2Data },
        });

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      // Fetch competence 1
      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.competence.number).toBe(1);

      // Fetch competence 2
      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 2,
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.competence.number).toBe(2);
    });
  });

  describe('data structure', () => {
    it('should return correct counters structure', async () => {
      const mockData = createMockData();
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.counters).toEqual({
        highlight: 5,
        aboveAverage: 10,
        belowAverage: 7,
        attentionPoint: 3,
      });
    });

    it('should return correct students structure', async () => {
      const mockData = createMockData(1, 3, 1, 3);
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Success', data: mockData },
      });

      const { result } = renderHook(() => useEssayCompetenceDetails(mockApi));

      await act(async () => {
        await result.current.fetchDetails({
          competenceNumber: 1,
          period: '1_MONTH',
        });
      });

      expect(result.current.data?.students.data).toHaveLength(3);
      expect(result.current.data?.students.data[0]).toMatchObject({
        studentId: expect.any(String),
        userInstitutionId: expect.any(String),
        name: expect.any(String),
        school: expect.any(String),
        schoolYear: expect.any(String),
        class: expect.any(String),
        averageScore: expect.any(Number),
        averagePercentage: expect.any(Number),
        performance: expect.any(String),
        essaysCount: expect.any(Number),
      });
    });
  });
});
