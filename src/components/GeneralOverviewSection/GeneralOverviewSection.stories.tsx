import type { Story } from '@ladle/react';
import { GeneralOverviewSection } from './GeneralOverviewSection';
import {
  ScoreType,
  type GeneralOverviewData,
  type AreaKnowledgePerformance,
  type EssayPerformance,
} from './types';
import Text from '../Text/Text';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock areas with realistic ENEM knowledge areas
 */
function generateMockAreas(): AreaKnowledgePerformance[] {
  return [
    {
      id: 'area-linguagens',
      name: 'Linguagens',
      urlCover: null,
      icon: 'book',
      color: '#3B82F6',
      percentage: 68.5,
      questionsTotal: 45,
      questionsCorrect: 31,
    },
    {
      id: 'area-humanas',
      name: 'Ciências Humanas',
      urlCover: null,
      icon: 'globe',
      color: '#F59E0B',
      percentage: 72.3,
      questionsTotal: 45,
      questionsCorrect: 33,
    },
    {
      id: 'area-natureza',
      name: 'Ciências da Natureza',
      urlCover: null,
      icon: 'leaf',
      color: '#22C55E',
      percentage: 65.0,
      questionsTotal: 45,
      questionsCorrect: 29,
    },
    {
      id: 'area-matematica',
      name: 'Matemática',
      urlCover: null,
      icon: 'calculator',
      color: '#8B5CF6',
      percentage: 70.8,
      questionsTotal: 45,
      questionsCorrect: 32,
    },
  ];
}

/**
 * Generate mock essay performance
 */
function generateMockEssay(): EssayPerformance {
  return {
    name: 'Redação',
    color: '#F43F5E',
    icon: 'article',
    percentage: 75.5,
    totalEssays: 120,
    totalStudents: 85,
  };
}

/**
 * Generate complete mock data
 */
function generateMockData(
  includeEssay = true,
  overallPercentage = 69.2
): GeneralOverviewData {
  return {
    overallPercentage,
    totalQuestions: 180,
    totalCorrect: 125,
    areas: generateMockAreas(),
    essay: includeEssay ? generateMockEssay() : undefined,
  };
}

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default - With all areas and essay (percentage mode)
 */
export const Default: Story = () => (
  <div className="max-w-4xl">
    <GeneralOverviewSection data={generateMockData()} />
  </div>
);

/**
 * TRI Score Mode
 */
export const TriScoreMode: Story = () => (
  <div className="max-w-4xl">
    <GeneralOverviewSection data={generateMockData()} scoreType={ScoreType.TRI} />
  </div>
);

/**
 * Without Essay
 */
export const WithoutEssay: Story = () => (
  <div className="max-w-4xl">
    <GeneralOverviewSection data={generateMockData(false)} />
  </div>
);

/**
 * High Performance
 */
export const HighPerformance: Story = () => {
  const data: GeneralOverviewData = {
    overallPercentage: 92.5,
    totalQuestions: 180,
    totalCorrect: 167,
    areas: [
      {
        id: 'area-linguagens',
        name: 'Linguagens',
        urlCover: null,
        icon: 'book',
        color: '#3B82F6',
        percentage: 95.2,
        questionsTotal: 45,
        questionsCorrect: 43,
      },
      {
        id: 'area-humanas',
        name: 'Ciências Humanas',
        urlCover: null,
        icon: 'globe',
        color: '#F59E0B',
        percentage: 91.1,
        questionsTotal: 45,
        questionsCorrect: 41,
      },
      {
        id: 'area-natureza',
        name: 'Ciências da Natureza',
        urlCover: null,
        icon: 'leaf',
        color: '#22C55E',
        percentage: 88.9,
        questionsTotal: 45,
        questionsCorrect: 40,
      },
      {
        id: 'area-matematica',
        name: 'Matemática',
        urlCover: null,
        icon: 'calculator',
        color: '#8B5CF6',
        percentage: 95.5,
        questionsTotal: 45,
        questionsCorrect: 43,
      },
    ],
    essay: {
      name: 'Redação',
      color: '#F43F5E',
      icon: 'article',
      percentage: 90.0,
      totalEssays: 50,
      totalStudents: 30,
    },
  };

  return (
    <div className="max-w-4xl">
      <GeneralOverviewSection data={data} />
    </div>
  );
};

/**
 * Low Performance
 */
export const LowPerformance: Story = () => {
  const data: GeneralOverviewData = {
    overallPercentage: 42.3,
    totalQuestions: 180,
    totalCorrect: 76,
    areas: [
      {
        id: 'area-linguagens',
        name: 'Linguagens',
        urlCover: null,
        icon: 'book',
        color: '#3B82F6',
        percentage: 38.5,
        questionsTotal: 45,
        questionsCorrect: 17,
      },
      {
        id: 'area-humanas',
        name: 'Ciências Humanas',
        urlCover: null,
        icon: 'globe',
        color: '#F59E0B',
        percentage: 45.2,
        questionsTotal: 45,
        questionsCorrect: 20,
      },
      {
        id: 'area-natureza',
        name: 'Ciências da Natureza',
        urlCover: null,
        icon: 'leaf',
        color: '#22C55E',
        percentage: 40.0,
        questionsTotal: 45,
        questionsCorrect: 18,
      },
      {
        id: 'area-matematica',
        name: 'Matemática',
        urlCover: null,
        icon: 'calculator',
        color: '#8B5CF6',
        percentage: 46.7,
        questionsTotal: 45,
        questionsCorrect: 21,
      },
    ],
    essay: {
      name: 'Redação',
      color: '#F43F5E',
      icon: 'article',
      percentage: 35.0,
      totalEssays: 30,
      totalStudents: 20,
    },
  };

  return (
    <div className="max-w-4xl">
      <GeneralOverviewSection data={data} />
    </div>
  );
};

/**
 * Loading State
 */
export const LoadingState: Story = () => (
  <div className="max-w-4xl">
    <GeneralOverviewSection data={null} loading={true} />
  </div>
);

/**
 * Error State
 */
export const ErrorState: Story = () => (
  <div className="max-w-4xl">
    <GeneralOverviewSection
      data={null}
      error="Erro ao carregar dados de desempenho. Tente novamente."
    />
  </div>
);

/**
 * No Data (Empty)
 */
export const NoData: Story = () => (
  <div className="max-w-4xl">
    <GeneralOverviewSection data={null} />
    <Text size="sm" className="mt-4 text-text-500">
      Componente retorna null quando não há dados e não está carregando.
    </Text>
  </div>
);

/**
 * Only Areas (No Essay)
 */
export const OnlyAreas: Story = () => (
  <div className="max-w-4xl">
    <GeneralOverviewSection data={generateMockData(false)} />
  </div>
);

/**
 * Custom Colors from API
 */
export const CustomColors: Story = () => {
  const data: GeneralOverviewData = {
    overallPercentage: 75.0,
    totalQuestions: 180,
    totalCorrect: 135,
    areas: [
      {
        id: 'area-1',
        name: 'Área Personalizada 1',
        urlCover: null,
        icon: 'shapes',
        color: '#E11D48',
        percentage: 78.0,
        questionsTotal: 45,
        questionsCorrect: 35,
      },
      {
        id: 'area-2',
        name: 'Área Personalizada 2',
        urlCover: null,
        icon: 'shapes',
        color: '#0EA5E9',
        percentage: 72.0,
        questionsTotal: 45,
        questionsCorrect: 32,
      },
      {
        id: 'area-3',
        name: 'Área Personalizada 3',
        urlCover: null,
        icon: 'shapes',
        color: '#84CC16',
        percentage: 75.0,
        questionsTotal: 45,
        questionsCorrect: 34,
      },
      {
        id: 'area-4',
        name: 'Área Personalizada 4',
        urlCover: null,
        icon: 'shapes',
        color: '#F97316',
        percentage: 74.0,
        questionsTotal: 45,
        questionsCorrect: 33,
      },
    ],
    essay: generateMockEssay(),
  };

  return (
    <div className="max-w-4xl">
      <GeneralOverviewSection data={data} />
    </div>
  );
};

/**
 * All Score Types Comparison
 */
export const ScoreTypesComparison: Story = () => (
  <div className="max-w-4xl space-y-8">
    <div>
      <Text size="lg" weight="bold" className="mb-2 text-text-950">
        Modo Porcentagem (padrão)
      </Text>
      <GeneralOverviewSection
        data={generateMockData()}
        scoreType={ScoreType.PERCENTAGE}
      />
    </div>
    <div>
      <Text size="lg" weight="bold" className="mb-2 text-text-950">
        Modo TRI
      </Text>
      <GeneralOverviewSection data={generateMockData()} scoreType={ScoreType.TRI} />
    </div>
  </div>
);
