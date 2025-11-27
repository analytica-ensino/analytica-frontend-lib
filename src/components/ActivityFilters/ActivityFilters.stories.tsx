import type { Story } from '@ladle/react';
import { useState } from 'react';
import { ActivityFilters } from './ActivityFilters';
import type {
  ActivityFiltersData,
  Bank,
  KnowledgeArea,
  KnowledgeItem,
  KnowledgeStructureState,
} from './ActivityFilters';
import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';

// Mock data padrão
const mockBanks: Bank[] = [
  { examInstitution: 'ENEM', id: 'enem' },
  { examInstitution: 'FUVEST', id: 'fuvest' },
  { examInstitution: 'UNICAMP', id: 'unicamp' },
  { examInstitution: 'VUNESP', id: 'vunesp' },
  { examInstitution: 'UFPR', id: 'ufpr' },
  { examInstitution: 'UEL', id: 'uel' },
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

  const handleFiltersChange = (newFilters: ActivityFiltersData) => {
    setFilters(newFilters);
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
          knowledgeAreas={mockKnowledgeAreas}
          knowledgeStructure={defaultKnowledgeStructure}
          knowledgeCategories={knowledgeCategories}
          // Handlers
          handleCategoriesChange={handleCategoriesChange}
          selectedKnowledgeSummary={selectedKnowledgeSummary}
          enableSummary={true}
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
