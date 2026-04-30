import type { Story } from '@ladle/react';
import { EssayCompetenciesTable } from './EssayCompetenciesTable';
import type {
  EssayCompetenciesOverviewApiResponse,
  EssayCompetenciesOverviewData,
  EssayCompetenceDetailsApiResponse,
  EssayCompetenceDetailsData,
  EssayCompetenceStudentItem,
} from './types';
import { SimulatedPerformanceTag } from './types';
import type { BaseApiClient } from '../../types/api';
import { Period } from '../PeriodSelector';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock competencies overview data
 */
function generateMockOverviewData(): EssayCompetenciesOverviewData {
  const competencyNames = [
    'Domínio da modalidade escrita formal da língua portuguesa',
    'Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento',
    'Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos',
    'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação',
    'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos',
  ];

  const competencies = competencyNames.map((name, index) => ({
    competencyNumber: index + 1,
    name,
    essaysCount: Math.floor(Math.random() * 200) + 50,
    studentsCount: Math.floor(Math.random() * 80) + 20,
    averageScore: Math.floor(Math.random() * 120) + 80,
    averagePercentage: Math.floor(Math.random() * 60) + 40,
  }));

  return {
    competencies,
    totalEssays: competencies.reduce((sum, c) => sum + c.essaysCount, 0),
    totalStudents: Math.max(...competencies.map((c) => c.studentsCount)),
  };
}

/**
 * Generate mock students for details modal
 */
function generateMockStudents(count: number): EssayCompetenceStudentItem[] {
  const firstNames = [
    'Maria',
    'João',
    'Ana',
    'Pedro',
    'Carla',
    'Lucas',
    'Beatriz',
    'Gabriel',
    'Fernanda',
    'Rafael',
  ];
  const lastNames = [
    'Silva',
    'Santos',
    'Oliveira',
    'Souza',
    'Pereira',
    'Costa',
    'Ferreira',
    'Almeida',
    'Nascimento',
    'Lima',
  ];
  const schools = [
    'Colégio Santa Maria',
    'Escola Municipal João Paulo II',
    'Instituto Educacional Horizonte',
  ];
  const classes = ['3A', '3B', '3C', '2A', '2B'];

  return Array.from({ length: count }, (_, i) => {
    const score = 40 + Math.random() * 160;
    const percentage = (score / 200) * 100;
    let performance: SimulatedPerformanceTag;

    if (percentage >= 80) performance = SimulatedPerformanceTag.HIGHLIGHT;
    else if (percentage >= 60)
      performance = SimulatedPerformanceTag.ABOVE_AVERAGE;
    else if (percentage >= 40)
      performance = SimulatedPerformanceTag.BELOW_AVERAGE;
    else performance = SimulatedPerformanceTag.ATTENTION_POINT;

    return {
      studentId: `student-${i + 1}`,
      userInstitutionId: `user-inst-${i + 1}`,
      name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      school: schools[i % schools.length],
      schoolYear: '2024',
      class: classes[i % classes.length],
      averageScore: score,
      averagePercentage: percentage,
      performance,
      essaysCount: Math.floor(Math.random() * 5) + 1,
    };
  });
}

/**
 * Generate mock competence details data
 */
function generateMockDetailsData(
  competenceNumber: number,
  page: number = 1,
  limit: number = 20,
  totalStudents: number = 25
): EssayCompetenceDetailsData {
  const competenceNames = [
    'Domínio da modalidade escrita formal da língua portuguesa',
    'Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento',
    'Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos',
    'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação',
    'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos',
  ];

  const studentsInPage = Math.min(limit, totalStudents - (page - 1) * limit);

  return {
    competence: {
      number: competenceNumber,
      name:
        competenceNames[competenceNumber - 1] ||
        `Competência ${competenceNumber}`,
    },
    classAverage: 120 + Math.random() * 60,
    classAveragePercentage: 60 + Math.random() * 30,
    totalEssays: totalStudents * 2,
    totalStudents,
    counters: {
      highlight: Math.floor(totalStudents * 0.15),
      aboveAverage: Math.floor(totalStudents * 0.35),
      belowAverage: Math.floor(totalStudents * 0.3),
      attentionPoint: Math.floor(totalStudents * 0.2),
    },
    students: {
      data: generateMockStudents(studentsInPage),
      page,
      limit,
      total: totalStudents,
    },
  };
}

// ============================================================================
// MOCK API FACTORIES
// ============================================================================

/**
 * Create a mock API that returns data successfully
 */
function createSuccessApi(delay: number = 500): BaseApiClient {
  const overviewData = generateMockOverviewData();

  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(
      url: string,
      data?: unknown
    ): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Handle overview endpoint
      if (url.includes('competencies/overview')) {
        const response: EssayCompetenciesOverviewApiResponse = {
          message: 'Success',
          data: overviewData,
        };
        return { data: response as T };
      }

      // Handle details endpoint
      if (url.includes('competencies/details')) {
        const params = data as {
          competenceNumber: number;
          page?: number;
          limit?: number;
        };
        const response: EssayCompetenceDetailsApiResponse = {
          message: 'Success',
          data: generateMockDetailsData(
            params.competenceNumber,
            params.page || 1,
            params.limit || 20,
            30
          ),
        };
        return { data: response as T };
      }

      throw new Error('Unknown endpoint');
    },
    patch: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    delete: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
  };
}

/**
 * Create a mock API that returns an error
 */
function createErrorApi(delay: number = 500): BaseApiClient {
  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));
      throw new Error('Erro ao carregar dados das competências');
    },
    patch: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    delete: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
  };
}

/**
 * Create a mock API with slow loading
 */
function createSlowApi(): BaseApiClient {
  return createSuccessApi(3000);
}

/**
 * Create a mock API that returns empty data
 */
function createEmptyApi(delay: number = 500): BaseApiClient {
  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(url: string): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (url.includes('competencies/overview')) {
        const response: EssayCompetenciesOverviewApiResponse = {
          message: 'Success',
          data: {
            competencies: [],
            totalEssays: 0,
            totalStudents: 0,
          },
        };
        return { data: response as T };
      }

      throw new Error('Unknown endpoint');
    },
    patch: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    delete: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
  };
}

/**
 * Create a mock API with high performance data
 */
function createHighPerformanceApi(delay: number = 500): BaseApiClient {
  const overviewData: EssayCompetenciesOverviewData = {
    competencies: [
      {
        competencyNumber: 1,
        name: 'Domínio da modalidade escrita formal',
        essaysCount: 200,
        studentsCount: 50,
        averageScore: 180,
        averagePercentage: 90,
      },
      {
        competencyNumber: 2,
        name: 'Compreender a proposta de redação',
        essaysCount: 200,
        studentsCount: 50,
        averageScore: 170,
        averagePercentage: 85,
      },
      {
        competencyNumber: 3,
        name: 'Selecionar, relacionar, organizar informações',
        essaysCount: 200,
        studentsCount: 50,
        averageScore: 160,
        averagePercentage: 80,
      },
      {
        competencyNumber: 4,
        name: 'Demonstrar conhecimento dos mecanismos linguísticos',
        essaysCount: 200,
        studentsCount: 50,
        averageScore: 150,
        averagePercentage: 75,
      },
      {
        competencyNumber: 5,
        name: 'Elaborar proposta de intervenção',
        essaysCount: 200,
        studentsCount: 50,
        averageScore: 155,
        averagePercentage: 77,
      },
    ],
    totalEssays: 200,
    totalStudents: 50,
  };

  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(
      url: string,
      data?: unknown
    ): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (url.includes('competencies/overview')) {
        const response: EssayCompetenciesOverviewApiResponse = {
          message: 'Success',
          data: overviewData,
        };
        return { data: response as T };
      }

      if (url.includes('competencies/details')) {
        const params = data as {
          competenceNumber: number;
          page?: number;
          limit?: number;
        };
        const response: EssayCompetenceDetailsApiResponse = {
          message: 'Success',
          data: generateMockDetailsData(
            params.competenceNumber,
            params.page || 1,
            params.limit || 20,
            50
          ),
        };
        return { data: response as T };
      }

      throw new Error('Unknown endpoint');
    },
    patch: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    delete: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
  };
}

/**
 * Create a mock API with low performance data
 */
function createLowPerformanceApi(delay: number = 500): BaseApiClient {
  const overviewData: EssayCompetenciesOverviewData = {
    competencies: [
      {
        competencyNumber: 1,
        name: 'Domínio da modalidade escrita formal',
        essaysCount: 100,
        studentsCount: 30,
        averageScore: 80,
        averagePercentage: 40,
      },
      {
        competencyNumber: 2,
        name: 'Compreender a proposta de redação',
        essaysCount: 100,
        studentsCount: 30,
        averageScore: 70,
        averagePercentage: 35,
      },
      {
        competencyNumber: 3,
        name: 'Selecionar, relacionar, organizar informações',
        essaysCount: 100,
        studentsCount: 30,
        averageScore: 90,
        averagePercentage: 45,
      },
      {
        competencyNumber: 4,
        name: 'Demonstrar conhecimento dos mecanismos linguísticos',
        essaysCount: 100,
        studentsCount: 30,
        averageScore: 60,
        averagePercentage: 30,
      },
      {
        competencyNumber: 5,
        name: 'Elaborar proposta de intervenção',
        essaysCount: 100,
        studentsCount: 30,
        averageScore: 50,
        averagePercentage: 25,
      },
    ],
    totalEssays: 100,
    totalStudents: 30,
  };

  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(
      url: string,
      data?: unknown
    ): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (url.includes('competencies/overview')) {
        const response: EssayCompetenciesOverviewApiResponse = {
          message: 'Success',
          data: overviewData,
        };
        return { data: response as T };
      }

      if (url.includes('competencies/details')) {
        const params = data as {
          competenceNumber: number;
          page?: number;
          limit?: number;
        };
        const response: EssayCompetenceDetailsApiResponse = {
          message: 'Success',
          data: generateMockDetailsData(
            params.competenceNumber,
            params.page || 1,
            params.limit || 20,
            30
          ),
        };
        return { data: response as T };
      }

      throw new Error('Unknown endpoint');
    },
    patch: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    delete: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
  };
}

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default story - Table with data
 */
export const Default: Story = () => {
  const api = createSuccessApi();

  return (
    <div className="p-4">
      <EssayCompetenciesTable api={api} period={Period.ONE_MONTH} />
    </div>
  );
};

/**
 * Loading state - Slow API
 */
export const LoadingState: Story = () => {
  const api = createSlowApi();

  return (
    <div className="p-4">
      <EssayCompetenciesTable api={api} period={Period.ONE_MONTH} />
    </div>
  );
};

/**
 * Empty state - No competencies
 */
export const EmptyState: Story = () => {
  const api = createEmptyApi();

  return (
    <div className="p-4">
      <EssayCompetenciesTable api={api} period={Period.ONE_MONTH} />
    </div>
  );
};

/**
 * High performance - All competencies above 70%
 */
export const HighPerformance: Story = () => {
  const api = createHighPerformanceApi();

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4 text-text-900">
        Turma com Alto Desempenho
      </h2>
      <EssayCompetenciesTable api={api} period={Period.ONE_MONTH} />
    </div>
  );
};

/**
 * Low performance - All competencies below 50%
 */
export const LowPerformance: Story = () => {
  const api = createLowPerformanceApi();

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4 text-text-900">
        Turma com Baixo Desempenho
      </h2>
      <EssayCompetenciesTable api={api} period={Period.ONE_MONTH} />
    </div>
  );
};

/**
 * With filters
 */
export const WithFilters: Story = () => {
  const api = createSuccessApi();

  return (
    <div className="p-4">
      <div className="mb-4 p-3 bg-background-100 rounded-lg">
        <p className="text-sm text-text-600">
          Filtros aplicados: Escola ABC, Turma 3A, Período: 3 meses
        </p>
      </div>
      <EssayCompetenciesTable
        api={api}
        period={Period.THREE_MONTHS}
        schoolIds={['school-1']}
        classIds={['class-1']}
      />
    </div>
  );
};

/**
 * Error state
 */
export const ErrorState: Story = () => {
  const api = createErrorApi();

  return (
    <div className="p-4">
      <EssayCompetenciesTable api={api} period={Period.ONE_MONTH} />
    </div>
  );
};

/**
 * Interactive - Click on rows to see modal
 */
export const InteractiveWithModal: Story = () => {
  const api = createSuccessApi(300);

  return (
    <div className="p-4">
      <div className="mb-4 p-3 bg-info-50 border border-info-200 rounded-lg">
        <p className="text-sm text-info-700">
          Clique em uma linha da tabela para ver os detalhes da competência
        </p>
      </div>
      <EssayCompetenciesTable api={api} period={Period.ONE_MONTH} />
    </div>
  );
};
