import type { Story } from '@ladle/react';
import { useState } from 'react';
import { EssayCompetenceDetailsModal } from './EssayCompetenceDetailsModal';
import Button from '../Button/Button';
import {
  SimulatedPerformanceTag,
  type EssayCompetenciesApiClient,
  type EssayCompetenceStudentItem,
  type EssayCompetenceDetailsApiResponse,
  type EssayCompetenceDetailsData,
} from './types';

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
    const globalIndex = (page - 1) * 20 + i;
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
      studentId: `student-${globalIndex + 1}`,
      userInstitutionId: `user-inst-${globalIndex + 1}`,
      name: `${firstNames[globalIndex % firstNames.length]} ${lastNames[globalIndex % lastNames.length]}`,
      school: schools[globalIndex % schools.length],
      schoolYear: '2024',
      class: classes[globalIndex % classes.length],
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
function generateMockData(
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
): EssayCompetenciesApiClient {
  return {
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
          params.limit || 20,
          totalStudents
        ),
      };

      return { data: response as T };
    },
  };
}

/**
 * Create a mock API that returns an error
 */
function createErrorApi(delay: number = 500): EssayCompetenciesApiClient {
  return {
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));
      throw new Error('Erro ao carregar dados da competência');
    },
  };
}

/**
 * Create a mock API that returns empty data
 */
function createEmptyApi(delay: number = 500): EssayCompetenciesApiClient {
  return {
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
            limit: 20,
            total: 0,
          },
        },
      };

      return { data: response as T };
    },
  };
}

/**
 * Create a mock API with slow loading
 */
function createSlowApi(totalStudents: number = 25): EssayCompetenciesApiClient {
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
        period="1_MONTH"
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
        period="1_MONTH"
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
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        competenceNumber={1}
        competenceName="Competência 1"
        period="1_MONTH"
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
        period="1_MONTH"
      />
    </>
  );
};

/**
 * With custom labels
 */
export const CustomLabels: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const api = createSuccessApi();

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal (Labels Customizados)
      </Button>
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        competenceNumber={5}
        competenceName="Competência 5 - Proposta de intervenção"
        period="1_MONTH"
        labels={{
          classAverage: 'Média geral da classe',
          highlight: 'Excelente',
          aboveAverage: 'Bom desempenho',
          belowAverage: 'Precisa melhorar',
          attention: 'Atenção necessária',
          previous: 'Voltar',
          next: 'Avançar',
          page: 'Pág.',
          of: '/',
        }}
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
        <p className="text-sm text-text-500">
          Filtrado por: Escola ABC, Turma 3A
        </p>
      </div>
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        competenceNumber={1}
        competenceName="Competência 1 - Domínio da escrita"
        period="3_MONTHS"
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
        period="1_MONTH"
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
        period="1_MONTH"
      />
    </>
  );
};
