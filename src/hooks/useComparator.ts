import { useState, useCallback } from 'react';
import {
  ComparatorTabValue,
  type ComparisonType,
  type ComparatorTabType,
  type ComparatorData,
  type KnowledgeAreaData,
  type CurricularComponentData,
  type CompetencyData,
  type NationalAverageData,
  type ComparatorApiClient,
  type KnowledgeAreasApiItem,
  type CurricularComponentsApiItem,
  type CompetenciesApiItem,
  type NationalAveragesApiItem,
  type UseComparatorReturn,
} from '../types/comparator';
import { Period } from '@/components/PeriodSelector';

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

  const competencyNumbers = apiData[0].competencies
    .map((c) => c.competencyNumber)
    .sort((a, b) => a - b);

  return competencyNumbers.map((num) => ({
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

// Unified comparator endpoint
const COMPARATOR_ENDPOINT = '/comparator';

export interface UseComparatorConfig {
  apiClient: ComparatorApiClient;
  endpoint?: string;
  defaultPeriod?: string;
}

export function createUseComparator(config: UseComparatorConfig) {
  const {
    apiClient,
    endpoint = COMPARATOR_ENDPOINT,
    defaultPeriod = Period.ONE_MONTH,
  } = config;

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
      async (ids: string[], type: ComparisonType, tab: ComparatorTabType) => {
        setLoading(true);
        setError(null);

        try {
          const body =
            type === 'school'
              ? { type: tab, schoolIds: ids, period: defaultPeriod }
              : { type: tab, schoolYearIds: ids, period: defaultPeriod };

          const response = await apiClient.post(endpoint, body);
          const apiData = response.data.data;

          setData((prev) => {
            const newData: ComparatorData = { ...prev };

            switch (tab) {
              case ComparatorTabValue.KNOWLEDGE_AREAS:
                newData.knowledgeAreas = transformKnowledgeAreas(
                  apiData as KnowledgeAreasApiItem[]
                );
                break;
              case ComparatorTabValue.CURRICULAR_COMPONENTS:
                newData.curricularComponents = transformCurricularComponents(
                  apiData as CurricularComponentsApiItem[]
                );
                break;
              case ComparatorTabValue.COMPETENCIES:
                newData.competencies = transformCompetencies(
                  apiData as CompetenciesApiItem[]
                );
                break;
              case ComparatorTabValue.NATIONAL_AVERAGES:
                newData.nationalAverages = transformNationalAverages(
                  apiData as NationalAveragesApiItem[]
                );
                break;
            }

            return newData;
          });
        } catch (err) {
          console.error('Erro ao buscar dados do comparador:', err);
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
