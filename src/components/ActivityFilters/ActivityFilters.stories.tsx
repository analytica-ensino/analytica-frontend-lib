import type { Story } from '@ladle/react';
import { useState, useCallback } from 'react';
import { ActivityFilters, ActivityFiltersPopover } from './ActivityFilters';
import type {
  ActivityFiltersData,
  Bank,
  BankYear,
  KnowledgeArea,
  KnowledgeItem,
} from '../../types/activityFilters';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';

// Mock apiClient used in stories to simulate API responses
const mockApiClient = {
  get: async (url: string) => {
    if (url === '/questions/exam-institutions') {
      return {
        data: {
          data: mockBanks.flatMap((bank, index) => {
            const years = mockBankYears.filter((y) => y.bankId === bank.id);
            return years.map((year, yearIdx) => ({
              questionBankName: bank.examInstitution,
              questionBankYearId: `${index}-${yearIdx}`,
              year: year.name,
              questionsCount: 100,
            }));
          }),
        },
      };
    }

    if (url === '/knowledge/subjects') {
      return { data: { data: mockKnowledgeAreas } };
    }
    // question types: empty when no institutionId
    return { data: { data: { questionTypes: [] } } };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: async (url: string, body: any) => {
    if (url === '/knowledge/topics') {
      const subjectIds: string[] = body.subjectIds || [];
      const filteredTopics = mockTopics.filter(() =>
        subjectIds.length > 0 ? true : true
      );
      return { data: { data: filteredTopics } };
    }

    if (url === '/knowledge/subtopics') {
      const topicIds: string[] = body.topicIds || [];
      const filteredSubtopics = mockSubtopics.filter(() =>
        topicIds.length > 0 ? true : true
      );
      return { data: { data: filteredSubtopics } };
    }

    if (url === '/knowledge/contents') {
      const subtopicIds: string[] = body.subtopicIds || [];
      const filteredContents = mockContents.filter(() =>
        subtopicIds.length > 0 ? true : true
      );
      return { data: { data: filteredContents } };
    }

    return { data: { data: [] } };
  },
};

// Mock data padrão
const mockBanks: Bank[] = [
  { examInstitution: 'ENEM', id: 'enem', name: 'ENEM' },
  { examInstitution: 'FUVEST', id: 'fuvest', name: 'FUVEST' },
  { examInstitution: 'UNICAMP', id: 'unicamp', name: 'UNICAMP' },
  { examInstitution: 'VUNESP', id: 'vunesp', name: 'VUNESP' },
  { examInstitution: 'UFPR', id: 'ufpr', name: 'UFPR' },
  { examInstitution: 'UEL', id: 'uel', name: 'UEL' },
];

const mockBankYears: BankYear[] = [
  { id: 'year-2023-enem', name: '2023', bankId: 'enem' },
  { id: 'year-2022-enem', name: '2022', bankId: 'enem' },
  { id: 'year-2021-enem', name: '2021', bankId: 'enem' },
  { id: 'year-2020-enem', name: '2020', bankId: 'enem' },
  { id: 'year-2023-fuvest', name: '2023', bankId: 'fuvest' },
  { id: 'year-2022-fuvest', name: '2022', bankId: 'fuvest' },
  { id: 'year-2021-fuvest', name: '2021', bankId: 'fuvest' },
  { id: 'year-2023-unicamp', name: '2023', bankId: 'unicamp' },
  { id: 'year-2022-unicamp', name: '2022', bankId: 'unicamp' },
];

const mockKnowledgeAreas: KnowledgeArea[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    color: '#0066b8',
    icon: 'MathOperations',
  },
  {
    id: 'portugues',
    name: 'Português',
    color: '#00a651',
    icon: 'ChatPT',
  },
  {
    id: 'fisica',
    name: 'Física',
    color: '#8b4513',
    icon: 'Atom',
  },
  {
    id: 'quimica',
    name: 'Química',
    color: '#ff6600',
    icon: 'Flask',
  },
  {
    id: 'biologia',
    name: 'Biologia',
    color: '#00a651',
    icon: 'Microscope',
  },
  {
    id: 'historia',
    name: 'História',
    color: '#8b4513',
    icon: 'Scroll',
  },
];

const mockTopics: KnowledgeItem[] = [
  { id: 'tema-1', name: 'Álgebra' },
  { id: 'tema-2', name: 'Geometria' },
  { id: 'tema-3', name: 'Trigonometria' },
];

const mockSubtopics: KnowledgeItem[] = [
  { id: 'subtema-1', name: 'Equações do 1º grau', parentId: 'tema-1' },
  { id: 'subtema-2', name: 'Equações do 2º grau', parentId: 'tema-1' },
  { id: 'subtema-3', name: 'Triângulos', parentId: 'tema-2' },
  { id: 'subtema-4', name: 'Círculos', parentId: 'tema-2' },
];

const mockContents: KnowledgeItem[] = [
  {
    id: 'assunto-1',
    name: 'Resolução de equações lineares',
    parentId: 'subtema-1',
  },
  {
    id: 'assunto-2',
    name: 'Sistemas de equações',
    parentId: 'subtema-1',
  },
  {
    id: 'assunto-3',
    name: 'Fórmula de Bhaskara',
    parentId: 'subtema-2',
  },
];

/**
 * Showcase principal: ActivityFilters com dados padrão
 */
export const AllActivityFilters: Story = () => {
  const [filters, setFilters] = useState<ActivityFiltersData>({
    types: [],
    bankIds: [],
    yearIds: [],
    knowledgeIds: [],
    topicIds: [],
    subtopicIds: [],
    contentIds: [],
  });

  const handleFiltersChange = useCallback((newFilters: ActivityFiltersData) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = () => {
    setFilters({
      types: [],
      bankIds: [],
      yearIds: [],
      knowledgeIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    });
    console.log('Filtros limpos');
  };

  const handleApplyFilters = () => {
    console.log('Aplicando filtros:', filters);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Activity Filters</h2>
      <p className="text-text-700">
        Componente completo de filtros para questões com suporte a tipos de
        questão, bancas, matérias e estrutura de conhecimento hierárquica
      </p>

      <div className="flex flex-row gap-8">
        <ActivityFilters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiClient={mockApiClient as any}
          onFiltersChange={handleFiltersChange}
          variant="default"
          // Question types
          allowedQuestionTypes={[
            QUESTION_TYPE.ALTERNATIVA,
            QUESTION_TYPE.DISSERTATIVA,
            QUESTION_TYPE.IMAGEM,
          ]}
          // Action buttons
          onClearFilters={handleClearFilters}
          onApplyFilters={handleApplyFilters}
        />

        <div className="flex-1 p-4 bg-background-50 rounded-lg">
          <h3 className="font-bold text-xl text-text-900 mb-4">
            Filtros Selecionados
          </h3>
          <pre className="text-sm text-text-700 overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

/**
 * Showcase: ActivityFiltersPopover com dados padrão
 */
export const AllActivityFiltersPopover: Story = () => {
  const [filters, setFilters] = useState<ActivityFiltersData>({
    types: [],
    bankIds: [],
    yearIds: [],
    knowledgeIds: [],
    topicIds: [],
    subtopicIds: [],
    contentIds: [],
  });

  const handleFiltersChange = useCallback((newFilters: ActivityFiltersData) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = () => {
    setFilters({
      types: [],
      bankIds: [],
      yearIds: [],
      knowledgeIds: [],
      topicIds: [],
      subtopicIds: [],
      contentIds: [],
    });
    console.log('Filtros limpos');
  };

  const handleApplyFilters = () => {
    console.log('Aplicando filtros:', filters);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Activity Filters Popover
      </h2>
      <p className="text-text-700">
        Componente ActivityFilters envolvido em um DropdownMenu/Popover,
        acionado por um botão
      </p>

      <div className="flex flex-row gap-8 items-start">
        <div className="flex flex-col gap-4">
          <ActivityFiltersPopover
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiClient={mockApiClient as any}
            onFiltersChange={handleFiltersChange}
            triggerLabel="Filtro de questões"
            // Action buttons
            onClearFilters={handleClearFilters}
            onApplyFilters={handleApplyFilters}
          />
        </div>

        <div className="flex-1 p-4 bg-background-50 rounded-lg">
          <h3 className="font-bold text-xl text-text-900 mb-4">
            Filtros Selecionados
          </h3>
          <pre className="text-sm text-text-700 overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
