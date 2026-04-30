import { renderHook, act } from '@testing-library/react';
import { useSimulatedContentDetails } from './useSimulatedContentDetails';
import type {
  ContentDetailsApiClient,
  ContentDetailsApiResponse,
  ContentDetailsData,
  ContentDetailsParams,
} from './types';

function createMockData(): ContentDetailsData {
  return {
    content: {
      id: 'content-1',
      name: 'Leitura e interpretação',
      bnccCode: 'EM13LP01',
      subject: {
        id: 'subject-1',
        name: 'Linguagens',
      },
      questionsCount: 18,
      studentsCount: 12,
    },
    counters: {
      aboveAverage: 4,
      atAverage: 5,
      belowAverage: 3,
    },
    students: {
      data: [
        {
          studentId: 'student-1',
          institutionId: 'inst-1',
          userInstitutionId: 'user-inst-1',
          name: 'Maria Silva',
          school: 'Escola A',
          schoolYear: '3',
          class: 'A',
          average: 75,
          performance: 75,
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
    },
  };
}

function createMockApi(): jest.Mocked<ContentDetailsApiClient> {
  return {
    post: jest.fn(),
  };
}

describe('useSimulatedContentDetails', () => {
  let mockApi: jest.Mocked<ContentDetailsApiClient>;

  beforeEach(() => {
    mockApi = createMockApi();
    jest.clearAllMocks();
  });

  it('starts with initial state', () => {
    const { result } = renderHook(() => useSimulatedContentDetails(mockApi));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.fetchDetails).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('sets loading to true while fetching', () => {
    mockApi.post.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useSimulatedContentDetails(mockApi));

    act(() => {
      result.current.fetchDetails({
        activityFilters: { types: ['SIMULADO'] },
        contentId: 'content-1',
        period: '1_MONTH',
      });
    });

    expect(result.current.loading).toBe(true);
  });

  it('fetches data successfully', async () => {
    const mockData = createMockData();
    const response: ContentDetailsApiResponse = {
      message: 'Success',
      data: mockData,
    };
    mockApi.post.mockResolvedValueOnce({ data: response });

    const { result } = renderHook(() => useSimulatedContentDetails(mockApi));

    await act(async () => {
      await result.current.fetchDetails({
        activityFilters: { types: ['SIMULADO'] },
        contentId: 'content-1',
        period: '1_MONTH',
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('builds endpoint with activity filter query params', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { message: 'Success', data: createMockData() },
    });
    const { result } = renderHook(() => useSimulatedContentDetails(mockApi));

    await act(async () => {
      await result.current.fetchDetails({
        activityFilters: {
          types: ['SIMULADO'],
          subtypes: ['ENEM_PROVA_1'],
          statuses: ['CONCLUIDA'],
        },
        contentId: 'content-1',
        period: '1_MONTH',
      });
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      '/performance/simulated/activities/content-details?types=SIMULADO&subtypes=ENEM_PROVA_1&statuses=CONCLUIDA',
      expect.any(Object)
    );
  });

  it('sends request body with defaults and explicit params', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { message: 'Success', data: createMockData() },
    });
    const { result } = renderHook(() => useSimulatedContentDetails(mockApi));

    const params: ContentDetailsParams = {
      activityFilters: { types: ['SIMULADO'] },
      contentId: 'content-1',
      period: '3_MONTHS',
      schoolIds: ['school-1'],
      schoolYearIds: ['year-1'],
      classIds: ['class-1'],
      orderBy: 'average',
      order: 'desc',
    };

    await act(async () => {
      await result.current.fetchDetails(params);
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      '/performance/simulated/activities/content-details?types=SIMULADO',
      {
        contentId: 'content-1',
        period: '3_MONTHS',
        schoolIds: ['school-1'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1'],
        page: 1,
        limit: 20,
        orderBy: 'average',
        order: 'desc',
      }
    );
  });

  it('overrides default page and limit when provided', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { message: 'Success', data: createMockData() },
    });
    const { result } = renderHook(() => useSimulatedContentDetails(mockApi));

    await act(async () => {
      await result.current.fetchDetails({
        activityFilters: {},
        contentId: 'content-1',
        period: '1_MONTH',
        page: 4,
        limit: 50,
      });
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      '/performance/simulated/activities/content-details',
      expect.objectContaining({
        page: 4,
        limit: 50,
      })
    );
  });

  it('handles API error with Error instance', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useSimulatedContentDetails(mockApi));

    await act(async () => {
      await result.current.fetchDetails({
        activityFilters: {},
        contentId: 'content-1',
        period: '1_MONTH',
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('handles API error with non-Error throw', async () => {
    mockApi.post.mockRejectedValueOnce('Unexpected');
    const { result } = renderHook(() => useSimulatedContentDetails(mockApi));

    await act(async () => {
      await result.current.fetchDetails({
        activityFilters: {},
        contentId: 'content-1',
        period: '1_MONTH',
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      'Não foi possível carregar os detalhes da habilidade'
    );
  });

  it('clears previous error on a successful refetch', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('First error'));
    const { result } = renderHook(() => useSimulatedContentDetails(mockApi));

    await act(async () => {
      await result.current.fetchDetails({
        activityFilters: {},
        contentId: 'content-1',
        period: '1_MONTH',
      });
    });
    expect(result.current.error).toBe('First error');

    mockApi.post.mockResolvedValueOnce({
      data: { message: 'Success', data: createMockData() },
    });

    await act(async () => {
      await result.current.fetchDetails({
        activityFilters: {},
        contentId: 'content-1',
        period: '1_MONTH',
      });
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).not.toBeNull();
  });

  it('reset clears data, loading and error', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { message: 'Success', data: createMockData() },
    });
    const { result } = renderHook(() => useSimulatedContentDetails(mockApi));

    await act(async () => {
      await result.current.fetchDetails({
        activityFilters: {},
        contentId: 'content-1',
        period: '1_MONTH',
      });
    });
    expect(result.current.data).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
