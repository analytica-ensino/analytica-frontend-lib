import type { Story } from '@ladle/react';
import { useState } from 'react';
import { EssayStudentDetailsModal } from './EssayStudentDetailsModal';
import Button from '../Button/Button';
import {
  SimulatedPerformanceTag,
  type EssayStudentDetailsApiClient,
  type EssayStudentDetailsApiResponse,
  type EssayStudentDetailsData,
  type EssayCompetencyPerformance,
} from './types';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock competencies (5 ENEM competencies)
 */
function generateMockCompetencies(
  baseScore: number = 120
): EssayCompetencyPerformance[] {
  const names = [
    'Domínio da modalidade escrita formal da língua portuguesa',
    'Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento',
    'Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos',
    'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação',
    'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos',
  ];

  return names.map((name, i) => {
    const score = Math.min(200, baseScore + i * 10 + Math.random() * 20);
    return {
      number: i + 1,
      name,
      averageScore: score,
      averagePercentage: (score / 200) * 100,
      essaysCount: Math.floor(Math.random() * 5) + 1,
    };
  });
}

/**
 * Generate mock student details data
 */
function generateMockData(
  studentName: string = 'Maria Silva',
  performance: SimulatedPerformanceTag = SimulatedPerformanceTag.ABOVE_AVERAGE,
  essaysCount: number = 5
): EssayStudentDetailsData {
  const competencies = generateMockCompetencies(
    performance === SimulatedPerformanceTag.HIGHLIGHT
      ? 160
      : performance === SimulatedPerformanceTag.ABOVE_AVERAGE
        ? 130
        : performance === SimulatedPerformanceTag.BELOW_AVERAGE
          ? 90
          : 60
  );

  const overallAverage = competencies.reduce(
    (sum, c) => sum + c.averageScore,
    0
  );
  const overallPercentage = (overallAverage / 1000) * 100;

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
  delay: number = 500
): EssayStudentDetailsApiClient {
  return {
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      const response: EssayStudentDetailsApiResponse = {
        message: 'Success',
        data: generateMockData(studentName, performance),
      };

      return { data: response as T };
    },
  };
}

/**
 * Create a mock API that returns an error
 */
function createErrorApi(delay: number = 500): EssayStudentDetailsApiClient {
  return {
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));
      throw new Error('Erro ao carregar detalhes do estudante');
    },
  };
}

/**
 * Create a mock API with slow loading
 */
function createSlowApi(
  studentName: string = 'Maria Silva'
): EssayStudentDetailsApiClient {
  return createSuccessApi(
    studentName,
    SimulatedPerformanceTag.ABOVE_AVERAGE,
    3000
  );
}

/**
 * Create a mock API that returns empty competencies
 */
function createEmptyCompetenciesApi(
  delay: number = 500
): EssayStudentDetailsApiClient {
  return {
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
        period="1_MONTH"
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
        period="1_MONTH"
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
        period="1_MONTH"
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
        period="1_MONTH"
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
        period="1_MONTH"
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
        period="1_MONTH"
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
        period="1_MONTH"
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
        <p className="text-sm text-text-500">
          Filtrado por: Escola ABC, Turma 3A, Período 3 meses
        </p>
      </div>
      <EssayStudentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userInstitutionId="user-inst-8"
        studentName="Rafael Martins"
        period="3_MONTHS"
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
        period="1_MONTH"
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
      <p className="text-text-500">
        Clique em um estudante para ver os detalhes
      </p>
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
          period="1_MONTH"
        />
      ))}
    </div>
  );
};
