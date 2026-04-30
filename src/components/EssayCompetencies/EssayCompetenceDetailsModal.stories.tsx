import type { Story } from '@ladle/react';
import { useState } from 'react';
import { EssayCompetenceDetailsModal } from './EssayCompetenceDetailsModal';
import Button from '../Button/Button';
import {
  SimulatedPerformanceTag,
  type EssayCompetenceStudentItem,
  type EssayCompetenceDetailsApiResponse,
  type EssayCompetenceDetailsData,
} from './types';
import type { BaseApiClient } from '../../types/api';
import { Period } from '../PeriodSelector';
import Text from '../Text/Text';

// ============================================================================
// MOCK DATA CONSTANTS
// ============================================================================

/** Page size for pagination */
const PAGE_SIZE = 20;

/** Essay score configuration */
const ESSAY_SCORE = {
  MIN: 40,
  MAX: 200,
  RANGE: 160, // MAX - MIN
} as const;

/** Performance thresholds (percentage) */
const PERFORMANCE_THRESHOLDS = {
  HIGHLIGHT: 80,
  ABOVE_AVERAGE: 60,
  BELOW_AVERAGE: 40,
} as const;

/** Mock class average ranges */
const CLASS_AVERAGE = {
  SCORE_BASE: 120,
  SCORE_RANGE: 60,
  PERCENTAGE_BASE: 60,
  PERCENTAGE_RANGE: 30,
} as const;

/** Distribution percentages for performance counters */
const COUNTER_DISTRIBUTION = {
  HIGHLIGHT: 0.15,
  ABOVE_AVERAGE: 0.35,
  BELOW_AVERAGE: 0.3,
  ATTENTION_POINT: 0.2,
} as const;

/** Essays per student multiplier */
const ESSAYS_PER_STUDENT = 2;

/** Max essays count per student for random generation */
const MAX_ESSAYS_COUNT = 5;

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock student items
 */
function generateMockStudents(
  count: number,
  page: number = 1
): EssayCompetenceStudentItem[] {
  const schools = [
    'Colégio Santa Maria',
    'Escola Municipal João Paulo II',
    'Instituto Educacional Horizonte',
    'Colégio Estadual Dom Pedro',
  ];

  const classes = ['3A', '3B', '3C', '2A', '2B'];

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
    'Juliana',
    'Thiago',
    'Amanda',
    'Bruno',
    'Patricia',
    'Diego',
    'Camila',
    'Felipe',
    'Larissa',
    'Rodrigo',
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
    'Araujo',
    'Ribeiro',
    'Gomes',
    'Martins',
    'Rocha',
  ];

  return Array.from({ length: count }, (_, i) => {
    const globalIndex = (page - 1) * PAGE_SIZE + i;
    const score = ESSAY_SCORE.MIN + Math.random() * ESSAY_SCORE.RANGE;
    const percentage = (score / ESSAY_SCORE.MAX) * 100;
    let performance: SimulatedPerformanceTag;

    if (percentage >= PERFORMANCE_THRESHOLDS.HIGHLIGHT)
      performance = SimulatedPerformanceTag.HIGHLIGHT;
    else if (percentage >= PERFORMANCE_THRESHOLDS.ABOVE_AVERAGE)
      performance = SimulatedPerformanceTag.ABOVE_AVERAGE;
    else if (percentage >= PERFORMANCE_THRESHOLDS.BELOW_AVERAGE)
      performance = SimulatedPerformanceTag.BELOW_AVERAGE;
    else performance = SimulatedPerformanceTag.ATTENTION_POINT;

    return {
      studentId: `student-${globalIndex + 1}`,
      userInstitutionId: `user-inst-${globalIndex + 1}`,
      name: `${firstNames[globalIndex % firstNames.length]} ${lastNames[globalIndex % lastNames.length]}`,
      school: schools[globalIndex % schools.length],
      schoolYear: '2024',
      class: classes[globalIndex % classes.length],
      averageScore: score,
      averagePercentage: percentage,
      performance,
      essaysCount: Math.floor(Math.random() * MAX_ESSAYS_COUNT) + 1,
    };
  });
}

/**
 * Generate mock competence details data
 */
function generateMockData(
  competenceNumber: number,
  page: number = 1,
  limit: number = 10,
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
    classAverage:
      CLASS_AVERAGE.SCORE_BASE + Math.random() * CLASS_AVERAGE.SCORE_RANGE,
    classAveragePercentage:
      CLASS_AVERAGE.PERCENTAGE_BASE +
      Math.random() * CLASS_AVERAGE.PERCENTAGE_RANGE,
    totalEssays: totalStudents * ESSAYS_PER_STUDENT,
    totalStudents,
    counters: {
      highlight: Math.floor(totalStudents * COUNTER_DISTRIBUTION.HIGHLIGHT),
      aboveAverage: Math.floor(
        totalStudents * COUNTER_DISTRIBUTION.ABOVE_AVERAGE
      ),
      belowAverage: Math.floor(
        totalStudents * COUNTER_DISTRIBUTION.BELOW_AVERAGE
      ),
      attentionPoint: Math.floor(
        totalStudents * COUNTER_DISTRIBUTION.ATTENTION_POINT
      ),
    },
    students: {
      data: generateMockStudents(studentsInPage, page),
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
function createSuccessApi(
  totalStudents: number = 25,
  delay: number = 500
): BaseApiClient {
  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(
      url: string,
      data?: unknown
    ): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      const params = data as {
        competenceNumber: number;
        page?: number;
        limit?: number;
      };

      const response: EssayCompetenceDetailsApiResponse = {
        message: 'Success',
        data: generateMockData(
          params.competenceNumber,
          params.page || 1,
          params.limit || 10,
          totalStudents
        ),
      };

      return { data: response as T };
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
      throw new Error('Erro ao carregar dados da competência');
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
 * Create a mock API that returns empty data
 */
function createEmptyApi(delay: number = 500): BaseApiClient {
  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(
      url: string,
      data?: unknown
    ): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      const params = data as { competenceNumber: number };

      const response: EssayCompetenceDetailsApiResponse = {
        message: 'Success',
        data: {
          competence: {
            number: params.competenceNumber,
            name: `Competência ${params.competenceNumber}`,
          },
          classAverage: 0,
          classAveragePercentage: 0,
          totalEssays: 0,
          totalStudents: 0,
          counters: {
            highlight: 0,
            aboveAverage: 0,
            belowAverage: 0,
            attentionPoint: 0,
          },
          students: {
            data: [],
            page: 1,
            limit: 10,
            total: 0,
          },
        },
      };

      return { data: response as T };
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
function createSlowApi(totalStudents: number = 25): BaseApiClient {
  return createSuccessApi(totalStudents, 3000);
}

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default story - Modal with data
 */
export const Default: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSuccessApi();

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Competência 1
      </Button>
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        competenceNumber={1}
        competenceName="Competência 1 - Domínio da escrita"
        period={Period.ONE_MONTH}
      />
    </>
  );
};

/**
 * All competencies showcase
 */
export const AllCompetencies: Story = () => {
  const [openModal, setOpenModal] = useState<number | null>(null);
  const api = createSuccessApi(50);

  const competencies = [
    { number: 1, name: 'Competência 1 - Domínio da escrita' },
    { number: 2, name: 'Competência 2 - Compreensão da proposta' },
    { number: 3, name: 'Competência 3 - Seleção de informações' },
    { number: 4, name: 'Competência 4 - Mecanismos linguísticos' },
    { number: 5, name: 'Competência 5 - Proposta de intervenção' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-xl text-text-900">
        Detalhes das Competências de Redação
      </h2>
      <p className="text-text-500">
        Clique em uma competência para ver os detalhes
      </p>
      <div className="flex flex-wrap gap-3">
        {competencies.map((comp) => (
          <Button
            key={comp.number}
            variant="outline"
            onClick={() => setOpenModal(comp.number)}
          >
            {comp.name}
          </Button>
        ))}
      </div>
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={openModal !== null}
        onClose={() => setOpenModal(null)}
        competenceNumber={openModal}
        competenceName={
          openModal
            ? competencies.find((c) => c.number === openModal)?.name
            : undefined
        }
        period={Period.ONE_MONTH}
      />
    </div>
  );
};

/**
 * With pagination - Many students
 */
export const WithPagination: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSuccessApi(85); // 85 students = 5 pages

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal com Paginação (85 estudantes)
      </Button>
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        competenceNumber={3}
        competenceName="Competência 3 - Seleção de informações"
        period={Period.ONE_MONTH}
      />
    </>
  );
};

/**
 * Loading state - Slow API
 */
export const LoadingState: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSlowApi();

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal (Carregamento Lento)
      </Button>
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        competenceNumber={2}
        competenceName="Competência 2 - Compreensão da proposta"
        period={Period.ONE_MONTH}
      />
    </>
  );
};

/**
 * Error state
 */
export const ErrorState: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createErrorApi();

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal (Erro)</Button>
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        competenceNumber={1}
        competenceName="Competência 1"
        period={Period.ONE_MONTH}
      />
    </>
  );
};

/**
 * Empty state - No students
 */
export const EmptyState: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createEmptyApi();

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal (Sem Estudantes)
      </Button>
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        competenceNumber={4}
        competenceName="Competência 4 - Mecanismos linguísticos"
        period={Period.ONE_MONTH}
      />
    </>
  );
};

/**
 * With filters
 */
export const WithFilters: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSuccessApi(30);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button onClick={() => setIsOpen(true)}>
          Abrir Modal (Com Filtros)
        </Button>
        <Text size="sm" color="text-text-500">
          Filtrado por: Escola ABC, Turma 3A
        </Text>
      </div>
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        competenceNumber={1}
        competenceName="Competência 1 - Domínio da escrita"
        period={Period.THREE_MONTHS}
        schoolIds={['school-1']}
        classIds={['class-1']}
      />
    </>
  );
};

/**
 * Few students - Single page
 */
export const FewStudents: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSuccessApi(5);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal (5 Estudantes)
      </Button>
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        competenceNumber={2}
        competenceName="Competência 2 - Compreensão da proposta"
        period={Period.ONE_MONTH}
      />
    </>
  );
};

/**
 * Single student
 */
export const SingleStudent: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSuccessApi(1);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal (1 Estudante)</Button>
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        competenceNumber={1}
        period={Period.ONE_MONTH}
      />
    </>
  );
};
