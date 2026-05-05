import { useState, useCallback } from 'react';
import type {
  ComparisonType,
  ComparatorTabType,
  ComparatorData,
  KnowledgeAreaData,
  CurricularComponentData,
  CompetencyData,
  NationalAverageData,
  ComparatorApiClient,
  KnowledgeAreasApiItem,
  CurricularComponentsApiItem,
  CompetenciesApiItem,
  NationalAveragesApiItem,
  UseComparatorReturn,
} from '../types/comparator';

// Transform backend response to frontend format
function transformKnowledgeAreas(
  apiData: KnowledgeAreasApiItem[]
): KnowledgeAreaData[] {
  if (apiData.length === 0) return [];

  const areaNames = apiData[0]?.areas.map((a) => a.name) ?? [];

  return areaNames.map((areaName) => ({
    area: areaName,
    values: apiData.map((item) => {
      const area = item.areas.find((a) => a.name === areaName);
      return {
        itemId: item.itemId,
        percentage: area?.percentage ?? 0,
      };
    }),
  }));
}

function transformCurricularComponents(
  apiData: CurricularComponentsApiItem[]
): CurricularComponentData[] {
  if (apiData.length === 0) return [];

  const subjectNames = apiData[0]?.subjects.map((s) => s.name) ?? [];

  return subjectNames.map((subjectName) => ({
    component: subjectName,
    values: apiData.map((item) => {
      const subject = item.subjects.find((s) => s.name === subjectName);
      return {
        itemId: item.itemId,
        percentage: subject?.percentage ?? 0,
      };
    }),
  }));
}

function transformCompetencies(
  apiData: CompetenciesApiItem[]
): CompetencyData[] {
  if (apiData.length === 0) return [];

  return [1, 2, 3, 4, 5].map((num) => ({
    competency: `Competência ${num}`,
    values: apiData.map((item) => {
      const comp = item.competencies.find((c) => c.competencyNumber === num);
      return {
        itemId: item.itemId,
        percentage: comp?.averagePercentage ?? 0,
      };
    }),
  }));
}

function transformNationalAverages(
  apiData: NationalAveragesApiItem[]
): NationalAverageData[] {
  return apiData.map((item) => {
    const findArea = (name: string) =>
      item.areas.find((a) => a.name.toLowerCase().includes(name.toLowerCase()));

    const languages = findArea('linguagens');
    const humanities = findArea('humanas');
    const essay = findArea('redação') ?? findArea('essay');
    const naturalSciences = findArea('natureza');
    const mathematics = findArea('matemática');

    return {
      itemId: item.itemId,
      itemName: item.itemName,
      simulatedProficiency: item.overallTriScore,
      publicAverage: item.publicSchoolAverage,
      privateAverage: item.privateSchoolAverage,
      details: {
        languages: languages?.triScore ?? 0,
        humanities: humanities?.triScore ?? 0,
        essay: essay?.triScore ?? 0,
        naturalSciences: naturalSciences?.triScore ?? 0,
        mathematics: mathematics?.triScore ?? 0,
      },
      status: item.status,
    };
  });
}

// API endpoints mapping
const TAB_ENDPOINTS: Record<ComparatorTabType, string> = {
  'knowledge-areas': '/comparator/knowledge-areas',
  'curricular-components': '/comparator/curricular-components',
  competencies: '/comparator/competencies',
  'national-averages': '/comparator/national-averages',
};

export interface UseComparatorConfig {
  apiClient: ComparatorApiClient;
  endpoints?: Partial<Record<ComparatorTabType, string>>;
  defaultPeriod?: string;
}

export function createUseComparator(config: UseComparatorConfig) {
  const { apiClient, endpoints = {}, defaultPeriod = '1_MONTH' } = config;

  const resolvedEndpoints = { ...TAB_ENDPOINTS, ...endpoints };

  return function useComparator(): UseComparatorReturn {
    const [data, setData] = useState<ComparatorData>({
      knowledgeAreas: [],
      curricularComponents: [],
      competencies: [],
      nationalAverages: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(
      async (
        ids: string[],
        type: ComparisonType,
        tab: ComparatorTabType,
        _itemNames?: Map<string, string>
      ) => {
        setLoading(true);
        setError(null);

        try {
          const endpoint = resolvedEndpoints[tab];
          const body =
            type === 'school'
              ? { schoolIds: ids, period: defaultPeriod }
              : { schoolYearIds: ids, period: defaultPeriod };

          const response = await apiClient.post(endpoint, body);
          const apiData = response.data.data;

          setData((prev) => {
            const newData: ComparatorData = { ...prev };

            switch (tab) {
              case 'knowledge-areas':
                newData.knowledgeAreas = transformKnowledgeAreas(
                  apiData as KnowledgeAreasApiItem[]
                );
                break;
              case 'curricular-components':
                newData.curricularComponents = transformCurricularComponents(
                  apiData as CurricularComponentsApiItem[]
                );
                break;
              case 'competencies':
                newData.competencies = transformCompetencies(
                  apiData as CompetenciesApiItem[]
                );
                break;
              case 'national-averages':
                newData.nationalAverages = transformNationalAverages(
                  apiData as NationalAveragesApiItem[]
                );
                break;
            }

            return newData;
          });
        } catch (err) {
          console.error('Error fetching comparator data:', err);
          setError('Erro ao carregar dados de comparação');
        } finally {
          setLoading(false);
        }
      },
      []
    );

    return { data, loading, error, fetchData };
  };
}

// Convenience function to create the hook
export function createComparatorHook(config: UseComparatorConfig) {
  return createUseComparator(config);
}
