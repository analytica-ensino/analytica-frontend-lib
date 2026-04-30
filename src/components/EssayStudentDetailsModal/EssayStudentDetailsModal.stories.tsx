import type { Story } from '@ladle/react';
import { useState } from 'react';
import { EssayStudentDetailsModal } from './EssayStudentDetailsModal';
import Button from '../Button/Button';
import {
  SimulatedPerformanceTag,
  type EssayStudentDetailsApiResponse,
  type EssayStudentDetailsData,
  type EssayCompetencyPerformance,
} from './types';
import type { BaseApiClient } from '../../types/api';
import { Period } from '../PeriodSelector';
import Text from '../Text/Text';

// ============================================================================
// MOCK DATA CONSTANTS
// ============================================================================

/** Essay score configuration (ENEM scale: 0-200 per competency) */
const ESSAY_SCORE = {
  MAX: 200,
  DEFAULT_BASE: 120,
  INCREMENT_PER_COMPETENCY: 10,
  RANDOM_VARIATION: 20,
} as const;

/** Total max score (5 competencies * 200 each) */
const TOTAL_MAX_SCORE = 1000;

/** Base scores for each performance level */
const PERFORMANCE_BASE_SCORES: Record<SimulatedPerformanceTag, number> = {
  [SimulatedPerformanceTag.HIGHLIGHT]: 160,
  [SimulatedPerformanceTag.ABOVE_AVERAGE]: 130,
  [SimulatedPerformanceTag.BELOW_AVERAGE]: 90,
  [SimulatedPerformanceTag.ATTENTION_POINT]: 60,
};

/** Essays count range for random generation */
const ESSAYS_COUNT = {
  MIN: 1,
  MAX: 5,
} as const;

/** API delay configuration (ms) */
const API_DELAY = {
  DEFAULT: 500,
  SLOW: 3000,
} as const;

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock competencies (5 ENEM competencies)
 */
function generateMockCompetencies(
  baseScore: number = ESSAY_SCORE.DEFAULT_BASE
): EssayCompetencyPerformance[] {
  const names = [
    'Domínio da modalidade escrita formal da língua portuguesa',
    'Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento',
    'Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos',
    'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação',
    'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos',
  ];

  return names.map((name, i) => {
    const score = Math.min(
      ESSAY_SCORE.MAX,
      baseScore +
        i * ESSAY_SCORE.INCREMENT_PER_COMPETENCY +
        Math.random() * ESSAY_SCORE.RANDOM_VARIATION
    );
    return {
      number: i + 1,
      name,
      averageScore: score,
      averagePercentage: (score / ESSAY_SCORE.MAX) * 100,
      essaysCount:
        Math.floor(Math.random() * ESSAYS_COUNT.MAX) + ESSAYS_COUNT.MIN,
    };
  });
}

/**
 * Generate mock student details data
 */
function generateMockData(
  studentName: string = 'Maria Silva',
  performance: SimulatedPerformanceTag = SimulatedPerformanceTag.ABOVE_AVERAGE,
  essaysCount: number = ESSAYS_COUNT.MAX
): EssayStudentDetailsData {
  const competencies = generateMockCompetencies(
    PERFORMANCE_BASE_SCORES[performance]
  );

  const overallAverage = competencies.reduce(
    (sum, c) => sum + c.averageScore,
    0
  );
  const overallPercentage = (overallAverage / TOTAL_MAX_SCORE) * 100;

  return {
    student: {
      id: 'student-1',
      name: studentName,
      school: 'Colégio Santa Maria',
      schoolYear: '2024',
      class: '3A',
    },
    overallAverage,
    overallPercentage,
    performance,
    essaysCount,
    competencies,
  };
}

// ============================================================================
// MOCK API FACTORIES
// ============================================================================

/**
 * Create a mock API that returns data successfully
 */
function createSuccessApi(
  studentName: string = 'Maria Silva',
  performance: SimulatedPerformanceTag = SimulatedPerformanceTag.ABOVE_AVERAGE,
  delay: number = API_DELAY.DEFAULT
): BaseApiClient {
  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      const response: EssayStudentDetailsApiResponse = {
        message: 'Success',
        data: generateMockData(studentName, performance),
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
function createErrorApi(delay: number = API_DELAY.DEFAULT): BaseApiClient {
  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));
      throw new Error('Erro ao carregar detalhes do estudante');
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
function createSlowApi(studentName: string = 'Maria Silva'): BaseApiClient {
  return createSuccessApi(
    studentName,
    SimulatedPerformanceTag.ABOVE_AVERAGE,
    API_DELAY.SLOW
  );
}

/**
 * Create a mock API that returns empty competencies
 */
function createEmptyCompetenciesApi(
  delay: number = API_DELAY.DEFAULT
): BaseApiClient {
  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      const data = generateMockData();
      data.competencies = [];

      const response: EssayStudentDetailsApiResponse = {
        message: 'Success',
        data,
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

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default story - Modal with data (Above Average)
 */
export const Default: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSuccessApi();

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Estudante Acima da Média
      </Button>
      <EssayStudentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInstitutionId="user-inst-1"
        studentName="Maria Silva"
        period={Period.ONE_MONTH}
      />
    </>
  );
};

/**
 * Highlight student
 */
export const HighlightStudent: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSuccessApi(
    'João Pedro Almeida',
    SimulatedPerformanceTag.HIGHLIGHT
  );

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Estudante Destaque
      </Button>
      <EssayStudentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInstitutionId="user-inst-2"
        studentName="João Pedro Almeida"
        period={Period.ONE_MONTH}
      />
    </>
  );
};

/**
 * Below average student
 */
export const BelowAverageStudent: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSuccessApi(
    'Ana Carolina Santos',
    SimulatedPerformanceTag.BELOW_AVERAGE
  );

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Estudante Abaixo da Média
      </Button>
      <EssayStudentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInstitutionId="user-inst-3"
        studentName="Ana Carolina Santos"
        period={Period.ONE_MONTH}
      />
    </>
  );
};

/**
 * Attention point student
 */
export const AttentionPointStudent: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSuccessApi(
    'Pedro Henrique Lima',
    SimulatedPerformanceTag.ATTENTION_POINT
  );

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Ponto de Atenção
      </Button>
      <EssayStudentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInstitutionId="user-inst-4"
        studentName="Pedro Henrique Lima"
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
  const api = createSlowApi('Fernanda Costa');

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal (Carregamento Lento)
      </Button>
      <EssayStudentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInstitutionId="user-inst-5"
        studentName="Fernanda Costa"
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
      <EssayStudentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInstitutionId="user-inst-6"
        studentName="Lucas Oliveira"
        period={Period.ONE_MONTH}
      />
    </>
  );
};

/**
 * Empty competencies
 */
export const EmptyCompetencies: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createEmptyCompetenciesApi();

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal (Sem Competências)
      </Button>
      <EssayStudentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInstitutionId="user-inst-7"
        studentName="Beatriz Ferreira"
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
  const api = createSuccessApi();

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button onClick={() => setIsOpen(true)}>
          Abrir Modal (Com Filtros)
        </Button>
        <Text size="sm" color="text-text-500">
          Filtrado por: Escola ABC, Turma 3A, Período 3 meses
        </Text>
      </div>
      <EssayStudentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInstitutionId="user-inst-8"
        studentName="Rafael Martins"
        period={Period.THREE_MONTHS}
        schoolIds={['school-1']}
        classIds={['class-1']}
      />
    </>
  );
};

/**
 * Custom labels
 */
export const CustomLabels: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSuccessApi();

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal (Labels Customizados)
      </Button>
      <EssayStudentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInstitutionId="user-inst-9"
        studentName="Camila Rodrigues"
        period={Period.ONE_MONTH}
        labels={{
          competencies: 'Habilidades de Redação ENEM',
          essays: 'textos escritos',
        }}
      />
    </>
  );
};

/**
 * All performance levels showcase
 */
export const AllPerformanceLevels: Story = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const students = [
    {
      id: 'highlight',
      name: 'Ana Destaque',
      performance: SimulatedPerformanceTag.HIGHLIGHT,
      label: 'Destaque',
    },
    {
      id: 'above',
      name: 'Bruno Acima',
      performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
      label: 'Acima da Média',
    },
    {
      id: 'below',
      name: 'Carla Abaixo',
      performance: SimulatedPerformanceTag.BELOW_AVERAGE,
      label: 'Abaixo da Média',
    },
    {
      id: 'attention',
      name: 'Diego Atenção',
      performance: SimulatedPerformanceTag.ATTENTION_POINT,
      label: 'Ponto de Atenção',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-xl text-text-900">
        Todos os Níveis de Desempenho
      </h2>
      <Text size="sm" color="text-text-500">
        Clique em um estudante para ver os detalhes
      </Text>
      <div className="flex flex-wrap gap-3">
        {students.map((student) => (
          <Button
            key={student.id}
            variant="outline"
            onClick={() => setOpenModal(student.id)}
          >
            {student.label}: {student.name}
          </Button>
        ))}
      </div>
      {students.map((student) => (
        <EssayStudentDetailsModal
          key={student.id}
          api={createSuccessApi(student.name, student.performance)}
          isOpen={openModal === student.id}
          onClose={() => setOpenModal(null)}
          userInstitutionId={student.id}
          studentName={student.name}
          period={Period.ONE_MONTH}
        />
      ))}
    </div>
  );
};
