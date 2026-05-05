import { renderHook, act, waitFor } from '@testing-library/react';
import { createUseComparator } from './useComparator';
import type {
  ComparatorApiClient,
  KnowledgeAreasApiItem,
  CurricularComponentsApiItem,
  CompetenciesApiItem,
  NationalAveragesApiItem,
} from '../types/comparator';

// Mock API client
const createMockApiClient = (): ComparatorApiClient & {
  mockResolvedValue: (data: unknown) => void;
  mockRejectedValue: (error: Error) => void;
} => {
  let resolveWith: unknown = { data: [] };
  let shouldReject = false;
  let rejectWith: Error = new Error('API Error');

  return {
    post: jest.fn().mockImplementation(() => {
      if (shouldReject) {
        return Promise.reject(rejectWith);
      }
      return Promise.resolve({ data: resolveWith });
    }),
    mockResolvedValue: (data: unknown) => {
      resolveWith = data;
      shouldReject = false;
    },
    mockRejectedValue: (error: Error) => {
      rejectWith = error;
      shouldReject = true;
    },
  };
};

describe('useComparator hook', () => {
  let mockApiClient: ReturnType<typeof createMockApiClient>;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
    jest.clearAllMocks();
  });

  describe('createUseComparator', () => {
    it('should create a hook function', () => {
      const useComparator = createUseComparator({ apiClient: mockApiClient });
      expect(typeof useComparator).toBe('function');
    });

    it('should return initial state', () => {
      const useComparator = createUseComparator({ apiClient: mockApiClient });
      const { result } = renderHook(() => useComparator());

      expect(result.current.data).toEqual({
        knowledgeAreas: [],
        curricularComponents: [],
        competencies: [],
        nationalAverages: [],
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.fetchData).toBe('function');
    });
  });

  describe('fetchData', () => {
    it('should set loading to true while fetching', async () => {
      mockApiClient.mockResolvedValue({ data: [] });
      const useComparator = createUseComparator({ apiClient: mockApiClient });
      const { result } = renderHook(() => useComparator());

      act(() => {
        result.current.fetchData(['id1'], 'school', 'knowledge-areas');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should call API with schoolIds when type is school', async () => {
      mockApiClient.mockResolvedValue({ data: [] });
      const useComparator = createUseComparator({ apiClient: mockApiClient });
      const { result } = renderHook(() => useComparator());

      await act(async () => {
        await result.current.fetchData(
          ['school-1', 'school-2'],
          'school',
          'knowledge-areas'
        );
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/comparator/knowledge-areas',
        { schoolIds: ['school-1', 'school-2'], period: '1_MONTH' }
      );
    });

    it('should call API with schoolYearIds when type is schoolYear', async () => {
      mockApiClient.mockResolvedValue({ data: [] });
      const useComparator = createUseComparator({ apiClient: mockApiClient });
      const { result } = renderHook(() => useComparator());

      await act(async () => {
        await result.current.fetchData(
          ['year-1', 'year-2'],
          'schoolYear',
          'curricular-components'
        );
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/comparator/curricular-components',
        { schoolYearIds: ['year-1', 'year-2'], period: '1_MONTH' }
      );
    });

    it('should use custom period when provided', async () => {
      mockApiClient.mockResolvedValue({ data: [] });
      const useComparator = createUseComparator({
        apiClient: mockApiClient,
        defaultPeriod: '3_MONTHS',
      });
      const { result } = renderHook(() => useComparator());

      await act(async () => {
        await result.current.fetchData(['id1'], 'school', 'knowledge-areas');
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/comparator/knowledge-areas',
        { schoolIds: ['id1'], period: '3_MONTHS' }
      );
    });

    it('should use custom endpoints when provided', async () => {
      mockApiClient.mockResolvedValue({ data: [] });
      const useComparator = createUseComparator({
        apiClient: mockApiClient,
        endpoints: { 'knowledge-areas': '/custom/knowledge-areas' },
      });
      const { result } = renderHook(() => useComparator());

      await act(async () => {
        await result.current.fetchData(['id1'], 'school', 'knowledge-areas');
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/custom/knowledge-areas',
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockApiClient.mockRejectedValue(new Error('Network error'));
      const useComparator = createUseComparator({ apiClient: mockApiClient });
      const { result } = renderHook(() => useComparator());

      await act(async () => {
        await result.current.fetchData(['id1'], 'school', 'knowledge-areas');
      });

      expect(result.current.error).toBe('Erro ao carregar dados de comparação');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('data transformation - knowledge areas', () => {
    it('should transform knowledge areas data correctly', async () => {
      const mockData: KnowledgeAreasApiItem[] = [
        {
          itemId: 'school-1',
          itemName: 'Escola A',
          areas: [
            {
              id: 'area-1',
              name: 'Ciências Humanas',
              icon: null,
              color: null,
              percentage: 75,
              questionsTotal: 10,
              questionsCorrect: 7,
            },
            {
              id: 'area-2',
              name: 'Linguagens',
              icon: null,
              color: null,
              percentage: 80,
              questionsTotal: 10,
              questionsCorrect: 8,
            },
          ],
        },
        {
          itemId: 'school-2',
          itemName: 'Escola B',
          areas: [
            {
              id: 'area-1',
              name: 'Ciências Humanas',
              icon: null,
              color: null,
              percentage: 65,
              questionsTotal: 10,
              questionsCorrect: 6,
            },
            {
              id: 'area-2',
              name: 'Linguagens',
              icon: null,
              color: null,
              percentage: 70,
              questionsTotal: 10,
              questionsCorrect: 7,
            },
          ],
        },
      ];

      mockApiClient.mockResolvedValue({ data: mockData });
      const useComparator = createUseComparator({ apiClient: mockApiClient });
      const { result } = renderHook(() => useComparator());

      await act(async () => {
        await result.current.fetchData(
          ['school-1', 'school-2'],
          'school',
          'knowledge-areas'
        );
      });

      expect(result.current.data.knowledgeAreas).toEqual([
        {
          area: 'Ciências Humanas',
          values: [
            { itemId: 'school-1', percentage: 75 },
            { itemId: 'school-2', percentage: 65 },
          ],
        },
        {
          area: 'Linguagens',
          values: [
            { itemId: 'school-1', percentage: 80 },
            { itemId: 'school-2', percentage: 70 },
          ],
        },
      ]);
    });

    it('should handle empty knowledge areas data', async () => {
      mockApiClient.mockResolvedValue({ data: [] });
      const useComparator = createUseComparator({ apiClient: mockApiClient });
      const { result } = renderHook(() => useComparator());

      await act(async () => {
        await result.current.fetchData(
          ['school-1'],
          'school',
          'knowledge-areas'
        );
      });

      expect(result.current.data.knowledgeAreas).toEqual([]);
    });
  });

  describe('data transformation - curricular components', () => {
    it('should transform curricular components data correctly', async () => {
      const mockData: CurricularComponentsApiItem[] = [
        {
          itemId: 'school-1',
          itemName: 'Escola A',
          subjects: [
            {
              id: 'sub-1',
              name: 'Matemática',
              icon: null,
              color: null,
              percentage: 85,
              questionsTotal: 20,
              questionsCorrect: 17,
            },
          ],
        },
        {
          itemId: 'school-2',
          itemName: 'Escola B',
          subjects: [
            {
              id: 'sub-1',
              name: 'Matemática',
              icon: null,
              color: null,
              percentage: 75,
              questionsTotal: 20,
              questionsCorrect: 15,
            },
          ],
        },
      ];

      mockApiClient.mockResolvedValue({ data: mockData });
      const useComparator = createUseComparator({ apiClient: mockApiClient });
      const { result } = renderHook(() => useComparator());

      await act(async () => {
        await result.current.fetchData(
          ['school-1', 'school-2'],
          'school',
          'curricular-components'
        );
      });

      expect(result.current.data.curricularComponents).toEqual([
        {
          component: 'Matemática',
          values: [
            { itemId: 'school-1', percentage: 85 },
            { itemId: 'school-2', percentage: 75 },
          ],
        },
      ]);
    });
  });

  describe('data transformation - competencies', () => {
    it('should transform competencies data correctly', async () => {
      const mockData: CompetenciesApiItem[] = [
        {
          itemId: 'school-1',
          itemName: 'Escola A',
          competencies: [
            {
              competencyNumber: 1,
              name: 'Competência 1',
              averageScore: 160,
              averagePercentage: 80,
              essaysCount: 50,
              studentsCount: 45,
            },
            {
              competencyNumber: 2,
              name: 'Competência 2',
              averageScore: 140,
              averagePercentage: 70,
              essaysCount: 50,
              studentsCount: 45,
            },
          ],
          totalEssays: 50,
          totalStudents: 45,
        },
      ];

      mockApiClient.mockResolvedValue({ data: mockData });
      const useComparator = createUseComparator({ apiClient: mockApiClient });
      const { result } = renderHook(() => useComparator());

      await act(async () => {
        await result.current.fetchData(['school-1'], 'school', 'competencies');
      });

      expect(result.current.data.competencies).toHaveLength(5);
      expect(result.current.data.competencies[0]).toEqual({
        competency: 'Competência 1',
        values: [{ itemId: 'school-1', percentage: 80 }],
      });
      expect(result.current.data.competencies[1]).toEqual({
        competency: 'Competência 2',
        values: [{ itemId: 'school-1', percentage: 70 }],
      });
      // Competencies 3-5 should have 0 percentage since they weren't in the response
      expect(result.current.data.competencies[2].values[0].percentage).toBe(0);
    });
  });

  describe('data transformation - national averages', () => {
    it('should transform national averages data correctly', async () => {
      const mockData: NationalAveragesApiItem[] = [
        {
          itemId: 'school-1',
          itemName: 'Escola A',
          overallTriScore: 650,
          areas: [
            {
              id: 'area-1',
              name: 'Linguagens, Códigos e suas Tecnologias',
              triScore: 620,
              questionsTotal: 45,
              questionsCorrect: 30,
            },
            {
              id: 'area-2',
              name: 'Ciências Humanas e Sociais Aplicadas',
              triScore: 680,
              questionsTotal: 45,
              questionsCorrect: 35,
            },
            {
              id: 'area-3',
              name: 'Ciências da Natureza e suas Tecnologias',
              triScore: 600,
              questionsTotal: 45,
              questionsCorrect: 28,
            },
            {
              id: 'area-4',
              name: 'Matemática e suas Tecnologias',
              triScore: 700,
              questionsTotal: 45,
              questionsCorrect: 38,
            },
          ],
          publicSchoolAverage: 500,
          privateSchoolAverage: 600,
          status: 'above',
        },
      ];

      mockApiClient.mockResolvedValue({ data: mockData });
      const useComparator = createUseComparator({ apiClient: mockApiClient });
      const { result } = renderHook(() => useComparator());

      await act(async () => {
        await result.current.fetchData(
          ['school-1'],
          'school',
          'national-averages'
        );
      });

      expect(result.current.data.nationalAverages).toHaveLength(1);
      expect(result.current.data.nationalAverages[0]).toEqual({
        itemId: 'school-1',
        itemName: 'Escola A',
        simulatedProficiency: 650,
        publicAverage: 500,
        privateAverage: 600,
        details: {
          languages: 620,
          humanities: 680,
          essay: 0,
          naturalSciences: 600,
          mathematics: 700,
        },
        status: 'above',
      });
    });
  });

  describe('endpoint mapping', () => {
    it.each([
      ['knowledge-areas', '/comparator/knowledge-areas'],
      ['curricular-components', '/comparator/curricular-components'],
      ['competencies', '/comparator/competencies'],
      ['national-averages', '/comparator/national-averages'],
    ] as const)(
      'should call correct endpoint for tab %s',
      async (tab, expectedEndpoint) => {
        mockApiClient.mockResolvedValue({ data: [] });
        const useComparator = createUseComparator({ apiClient: mockApiClient });
        const { result } = renderHook(() => useComparator());

        await act(async () => {
          await result.current.fetchData(['id1'], 'school', tab);
        });

        expect(mockApiClient.post).toHaveBeenCalledWith(
          expectedEndpoint,
          expect.any(Object)
        );
      }
    );
  });
});
