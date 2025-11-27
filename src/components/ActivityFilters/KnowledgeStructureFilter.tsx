import { Text, CheckboxGroup } from '../..';
import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';
import type { KnowledgeStructureState } from '../../types/activityFilters';
import { KnowledgeSummary } from './KnowledgeSummary';

export interface KnowledgeStructureFilterProps {
  knowledgeStructure: KnowledgeStructureState;
  knowledgeCategories: CategoryConfig[];
  handleCategoriesChange?: (updatedCategories: CategoryConfig[]) => void;
  selectedKnowledgeSummary?: {
    topics: string[];
    subtopics: string[];
    contents: string[];
  };
  enableSummary?: boolean;
}

export const KnowledgeStructureFilter = ({
  knowledgeStructure,
  knowledgeCategories,
  handleCategoriesChange,
  selectedKnowledgeSummary = {
    topics: [],
    subtopics: [],
    contents: [],
  },
  enableSummary = false,
}: KnowledgeStructureFilterProps) => {
  return (
    <div className="mt-4">
      <Text size="sm" weight="bold" className="mb-3 block">
        Tema, Subtema e Assunto
      </Text>
      {knowledgeStructure.loading && (
        <Text size="sm" className="text-text-600 mb-3">
          Carregando estrutura de conhecimento...
        </Text>
      )}
      {knowledgeStructure.error && (
        <Text size="sm" className="mb-3 text-error-500">
          {knowledgeStructure.error}
        </Text>
      )}
      {knowledgeCategories.length > 0 && handleCategoriesChange && (
        <CheckboxGroup
          categories={knowledgeCategories}
          onCategoriesChange={handleCategoriesChange}
        />
      )}
      {!knowledgeStructure.loading &&
        knowledgeCategories.length === 0 &&
        knowledgeStructure.topics.length === 0 && (
          <Text size="sm" className="text-text-600">
            Nenhum tema disponível para as matérias selecionadas
          </Text>
        )}

      {enableSummary && (
        <KnowledgeSummary
          knowledgeStructure={knowledgeStructure}
          selectedKnowledgeSummary={selectedKnowledgeSummary}
        />
      )}
    </div>
  );
};

