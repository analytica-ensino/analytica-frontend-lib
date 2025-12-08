import type { Story } from '@ladle/react';
import { useState, useCallback } from 'react';
import { ActivityFilters, ActivityFiltersPopover } from './ActivityFilters';
import type {
  ActivityFiltersData,
  Bank,
  BankYear,
  KnowledgeArea,
  KnowledgeItem,
  KnowledgeStructureState,
} from '../../types/activityFilters';
import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';

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

const defaultKnowledgeCategories: CategoryConfig[] = [
  {
    key: 'tema',
    label: 'Tema',
    itens: mockTopics.map((t) => ({ id: t.id, name: t.name })),
    selectedIds: [],
  },
  {
    key: 'subtema',
    label: 'Subtema',
    dependsOn: ['tema'],
    itens: mockSubtopics.map((st) => ({
      id: st.id,
      name: st.name,
      temaId: (st.parentId as string) || '',
    })),
    filteredBy: [{ key: 'tema', internalField: 'temaId' }],
    selectedIds: [],
  },
  {
    key: 'assunto',
    label: 'Assunto',
    dependsOn: ['tema', 'subtema'],
    itens: mockContents.map((c) => ({
      id: c.id,
      name: c.name,
      subtemaId: (c.parentId as string) || '',
    })),
    filteredBy: [{ key: 'subtema', internalField: 'subtemaId' }],
    selectedIds: [],
  },
];

const defaultKnowledgeStructure: KnowledgeStructureState = {
  topics: mockTopics,
  subtopics: mockSubtopics,
  contents: mockContents,
  loading: false,
  error: null,
};

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

  const [knowledgeCategories, setKnowledgeCategories] = useState<
    CategoryConfig[]
  >(defaultKnowledgeCategories);

  const [selectedKnowledgeSummary, setSelectedKnowledgeSummary] = useState({
    topics: [] as string[],
    subtopics: [] as string[],
    contents: [] as string[],
  });

  const handleCategoriesChange = (updatedCategories: CategoryConfig[]) => {
    setKnowledgeCategories(updatedCategories);

    // Update summary
    const temaCategory = updatedCategories.find((c) => c.key === 'tema');
    const subtemaCategory = updatedCategories.find((c) => c.key === 'subtema');
    const assuntoCategory = updatedCategories.find((c) => c.key === 'assunto');

    const selectedTopicIds = temaCategory?.selectedIds || [];
    const selectedSubtopicIds = subtemaCategory?.selectedIds || [];
    const selectedContentIds = assuntoCategory?.selectedIds || [];

    // Update summary
    setSelectedKnowledgeSummary({
      topics:
        temaCategory?.itens
          ?.filter((item) => selectedTopicIds.includes(item.id))
          .map((item) => item.name) || [],
      subtopics:
        subtemaCategory?.itens
          ?.filter((item) => selectedSubtopicIds.includes(item.id))
          .map((item) => item.name) || [],
      contents:
        assuntoCategory?.itens
          ?.filter((item) => selectedContentIds.includes(item.id))
          .map((item) => item.name) || [],
    });
  };

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
    setKnowledgeCategories(defaultKnowledgeCategories);
    setSelectedKnowledgeSummary({
      topics: [],
      subtopics: [],
      contents: [],
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
          onFiltersChange={handleFiltersChange}
          variant="default"
          // Data
          banks={mockBanks}
          bankYears={mockBankYears}
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={defaultKnowledgeStructure}
          knowledgeCategories={knowledgeCategories}
          // Question types
          allowedQuestionTypes={[
            QUESTION_TYPE.ALTERNATIVA,
            QUESTION_TYPE.DISSERTATIVA,
            QUESTION_TYPE.IMAGEM,
          ]}
          // Handlers
          handleCategoriesChange={handleCategoriesChange}
          selectedKnowledgeSummary={selectedKnowledgeSummary}
          enableSummary={true}
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

  const [knowledgeCategories, setKnowledgeCategories] = useState<
    CategoryConfig[]
  >(defaultKnowledgeCategories);

  const [selectedKnowledgeSummary, setSelectedKnowledgeSummary] = useState({
    topics: [] as string[],
    subtopics: [] as string[],
    contents: [] as string[],
  });

  const handleCategoriesChange = (updatedCategories: CategoryConfig[]) => {
    setKnowledgeCategories(updatedCategories);

    // Update summary
    const temaCategory = updatedCategories.find((c) => c.key === 'tema');
    const subtemaCategory = updatedCategories.find((c) => c.key === 'subtema');
    const assuntoCategory = updatedCategories.find((c) => c.key === 'assunto');

    const selectedTopicIds = temaCategory?.selectedIds || [];
    const selectedSubtopicIds = subtemaCategory?.selectedIds || [];
    const selectedContentIds = assuntoCategory?.selectedIds || [];

    // Update summary
    setSelectedKnowledgeSummary({
      topics:
        temaCategory?.itens
          ?.filter((item) => selectedTopicIds.includes(item.id))
          .map((item) => item.name) || [],
      subtopics:
        subtemaCategory?.itens
          ?.filter((item) => selectedSubtopicIds.includes(item.id))
          .map((item) => item.name) || [],
      contents:
        assuntoCategory?.itens
          ?.filter((item) => selectedContentIds.includes(item.id))
          .map((item) => item.name) || [],
    });
  };

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
    setKnowledgeCategories(defaultKnowledgeCategories);
    setSelectedKnowledgeSummary({
      topics: [],
      subtopics: [],
      contents: [],
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
            onFiltersChange={handleFiltersChange}
            triggerLabel="Filtro de questões"
            // Data
            banks={mockBanks}
            knowledgeAreas={mockKnowledgeAreas}
            knowledgeStructure={defaultKnowledgeStructure}
            knowledgeCategories={knowledgeCategories}
            // Handlers
            handleCategoriesChange={handleCategoriesChange}
            selectedKnowledgeSummary={selectedKnowledgeSummary}
            enableSummary={true}
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
