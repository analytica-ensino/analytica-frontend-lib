import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Text,
  Chips,
  Radio,
  IconRender,
  getSubjectColorWithOpacity,
  useTheme,
  CheckboxGroup,
  type CategoryConfig,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  QUESTION_TYPE,
} from '../..';
import { questionTypeLabels } from '../../types/questionTypes';
import type {
  ActivityFiltersData,
  Bank,
  KnowledgeArea,
  KnowledgeStructureState,
} from '../../types/activityFilters';
import {
  getSelectedIdsFromCategories,
  toggleArrayItem,
  toggleSingleValue,
} from '../../utils/activityFilters';

const questionTypes = [
  QUESTION_TYPE.ALTERNATIVA,
  QUESTION_TYPE.VERDADEIRO_FALSO,
  QUESTION_TYPE.DISSERTATIVA,
  QUESTION_TYPE.IMAGEM,
  QUESTION_TYPE.MULTIPLA_ESCOLHA,
  QUESTION_TYPE.LIGAR_PONTOS,
  QUESTION_TYPE.PREENCHER,
];

interface QuestionTypeFilterProps {
  selectedTypes: QUESTION_TYPE[];
  onToggleType: (type: QUESTION_TYPE) => void;
}

const QuestionTypeFilter = ({
  selectedTypes,
  onToggleType,
}: QuestionTypeFilterProps) => {
  return (
    <div>
      <Text size="sm" weight="bold" className="mb-3 block">
        Tipo de questão
      </Text>
      <div className="grid grid-cols-2 gap-2">
        {questionTypes.map((questionType) => (
          <Chips
            key={questionType}
            selected={selectedTypes.includes(questionType)}
            onClick={() => onToggleType(questionType)}
          >
            {questionTypeLabels[questionType]}
          </Chips>
        ))}
      </div>
    </div>
  );
};

// BanksFilter Component
interface BanksFilterProps {
  banks: Bank[];
  selectedBanks: string[];
  onToggleBank: (bankName: string) => void;
  loading?: boolean;
  error?: string | null;
}

const BanksFilter = ({
  banks,
  selectedBanks,
  onToggleBank,
  loading = false,
  error = null,
}: BanksFilterProps) => {
  if (loading) {
    return (
      <Text size="sm" className="text-text-600">
        Carregando bancas...
      </Text>
    );
  }

  if (error) {
    return (
      <Text size="sm" className="text-text-600">
        {error}
      </Text>
    );
  }

  if (banks.length === 0) {
    return (
      <Text size="sm" className="text-text-600">
        Nenhuma banca encontrada
      </Text>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {banks.map((bank: Bank) => (
        <Chips
          key={bank.examInstitution}
          selected={selectedBanks.includes(bank.examInstitution)}
          onClick={() => onToggleBank(bank.examInstitution)}
        >
          {bank.examInstitution}
        </Chips>
      ))}
    </div>
  );
};

// SubjectsFilter Component
interface SubjectsFilterProps {
  knowledgeAreas: KnowledgeArea[];
  selectedSubject: string | null;
  onSubjectChange: (subjectId: string) => void;
  loading?: boolean;
  error?: string | null;
}

const SubjectsFilter = ({
  knowledgeAreas,
  selectedSubject,
  onSubjectChange,
  loading = false,
  error = null,
}: SubjectsFilterProps) => {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <Text size="sm" className="text-text-600">
        Carregando matérias...
      </Text>
    );
  }

  if (error) {
    return (
      <Text size="sm" className="text-text-600">
        {error}
      </Text>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {knowledgeAreas.map((area: KnowledgeArea) => (
        <Radio
          key={area.id}
          value={area.id}
          checked={selectedSubject === area.id}
          onChange={() => onSubjectChange(area.id)}
          label={
            <div className="flex items-center gap-2 w-full min-w-0">
              <span
                className="size-4 rounded-sm flex items-center justify-center shrink-0 text-text-950"
                style={{
                  backgroundColor: getSubjectColorWithOpacity(
                    area.color,
                    isDark
                  ),
                }}
              >
                <IconRender
                  iconName={area.icon || 'BookOpen'}
                  size={14}
                  color="currentColor"
                />
              </span>
              <span className="truncate flex-1">{area.name}</span>
            </div>
          }
        />
      ))}
    </div>
  );
};

// KnowledgeSummary Component
interface KnowledgeSummaryProps {
  knowledgeStructure: KnowledgeStructureState;
  selectedKnowledgeSummary: {
    topics: string[];
    subtopics: string[];
    contents: string[];
  };
}

const KnowledgeSummary = ({
  knowledgeStructure,
  selectedKnowledgeSummary,
}: KnowledgeSummaryProps) => {
  return (
    <div className="mt-4 p-3 bg-background-50 rounded-lg border border-border-200">
      <Text size="sm" weight="bold" className="mb-2 block">
        Resumo da seleção
      </Text>
      <div className="flex flex-col gap-2">
        {knowledgeStructure.topics.length === 1 && (
          <div>
            <Text size="xs" weight="medium" className="text-text-600">
              Tema:
            </Text>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedKnowledgeSummary.topics.map((topic: string) => (
                <Chips key={topic} selected>
                  {topic}
                </Chips>
              ))}
            </div>
          </div>
        )}
        {knowledgeStructure.subtopics.length === 1 && (
          <div>
            <Text size="xs" weight="medium" className="text-text-600">
              Subtema:
            </Text>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedKnowledgeSummary.subtopics.map((subtopic: string) => (
                <Chips key={subtopic} selected>
                  {subtopic}
                </Chips>
              ))}
            </div>
          </div>
        )}
        {knowledgeStructure.contents.length === 1 && (
          <div>
            <Text size="xs" weight="medium" className="text-text-600">
              Assunto:
            </Text>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedKnowledgeSummary.contents.map((content) => (
                <Chips key={content} selected>
                  {content}
                </Chips>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// KnowledgeStructureFilter Component
interface KnowledgeStructureFilterProps {
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

const KnowledgeStructureFilter = ({
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

// FilterActions Component
interface FilterActionsProps {
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
}

const FilterActions = ({
  onClearFilters,
  onApplyFilters,
}: FilterActionsProps) => {
  if (!onClearFilters && !onApplyFilters) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2 justify-end mt-4 px-4 pt-4 border-t border-border-200">
      {onClearFilters && (
        <Button variant="link" onClick={onClearFilters} size="small">
          Limpar filtros
        </Button>
      )}
      {onApplyFilters && (
        <Button variant="outline" onClick={onApplyFilters} size="small">
          Filtrar
        </Button>
      )}
    </div>
  );
};

// Main ActivityFilters Component
export interface ActivityFiltersProps {
  onFiltersChange: (filters: ActivityFiltersData) => void;
  variant?: 'default' | 'popover';
  // Data
  banks?: Bank[];
  knowledgeAreas?: KnowledgeArea[];
  knowledgeStructure?: KnowledgeStructureState;
  knowledgeCategories?: CategoryConfig[];
  // Loading states
  loadingBanks?: boolean;
  loadingKnowledge?: boolean;
  loadingSubjects?: boolean;
  // Errors
  banksError?: string | null;
  subjectsError?: string | null;
  // Load functions
  loadBanks?: () => void | Promise<void>;
  loadKnowledge?: () => void | Promise<void>;
  loadTopics?: (subjectIds: string[]) => void | Promise<void>;
  loadSubtopics?: (topicIds: string[]) => void | Promise<void>;
  loadContents?: (subtopicIds: string[]) => void | Promise<void>;
  // Handlers
  handleCategoriesChange?: (updatedCategories: CategoryConfig[]) => void;
  selectedKnowledgeSummary?: {
    topics: string[];
    subtopics: string[];
    contents: string[];
  };
  enableSummary?: boolean;
  // Action buttons
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
}

/**
 * ActivityFilters component for filtering questions
 * Manages question types, banks, subjects, and knowledge structure selections
 */
export const ActivityFilters = ({
  onFiltersChange,
  variant = 'default',
  // Data
  banks = [],
  knowledgeAreas = [],
  knowledgeStructure = {
    topics: [],
    subtopics: [],
    contents: [],
    loading: false,
    error: null,
  },
  knowledgeCategories = [],
  // Loading states
  loadingBanks = false,
  loadingKnowledge: _loadingKnowledge = false,
  loadingSubjects = false,
  // Errors
  banksError = null,
  subjectsError = null,
  // Load functions
  loadBanks,
  loadKnowledge,
  loadTopics,
  loadSubtopics: _loadSubtopics,
  loadContents: _loadContents,
  // Handlers
  handleCategoriesChange,
  selectedKnowledgeSummary = {
    topics: [],
    subtopics: [],
    contents: [],
  },
  enableSummary = false,
  // Action buttons
  onClearFilters,
  onApplyFilters,
}: ActivityFiltersProps) => {
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<
    QUESTION_TYPE[]
  >([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Convert single subject to array for compatibility
  const selectedSubjects = useMemo(
    () => (selectedSubject ? [selectedSubject] : []),
    [selectedSubject]
  );

  const toggleQuestionType = (questionType: QUESTION_TYPE) => {
    setSelectedQuestionTypes((prev) => toggleArrayItem(prev, questionType));
  };

  const toggleBank = (bankName: string) => {
    setSelectedBanks((prev) => toggleArrayItem(prev, bankName));
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(toggleSingleValue(selectedSubject, subjectId));
  };

  // Load banks and knowledge areas on component mount
  useEffect(() => {
    if (loadBanks) {
      loadBanks();
    }
    if (loadKnowledge) {
      loadKnowledge();
    }
  }, [loadBanks, loadKnowledge]);

  // Load topics when subject changes
  useEffect(() => {
    if (selectedSubject && loadTopics) {
      loadTopics([selectedSubject]);
    }
  }, [selectedSubject, loadTopics]);

  // Extract selected IDs from knowledge categories
  const getSelectedKnowledgeIds = useCallback(() => {
    return getSelectedIdsFromCategories(knowledgeCategories, {
      topicIds: 'tema',
      subtopicIds: 'subtema',
      contentIds: 'assunto',
    });
  }, [knowledgeCategories]);

  // Notify parent component when filters change
  useEffect(() => {
    const knowledgeIds = getSelectedKnowledgeIds();
    const filters: ActivityFiltersData = {
      types: selectedQuestionTypes,
      bankIds: selectedBanks,
      knowledgeIds: selectedSubjects,
      topicIds: knowledgeIds.topicIds,
      subtopicIds: knowledgeIds.subtopicIds,
      contentIds: knowledgeIds.contentIds,
    };
    onFiltersChange(filters);
  }, [
    selectedQuestionTypes,
    selectedBanks,
    selectedSubjects,
    knowledgeCategories,
    getSelectedKnowledgeIds,
    onFiltersChange,
  ]);

  const containerClassName =
    variant === 'popover'
      ? 'w-full bg-background'
      : 'w-[400px] flex-shrink-0 p-4 bg-background';

  const contentClassName = variant === 'popover' ? 'p-4' : '';

  return (
    <div className={containerClassName}>
      {variant === 'default' && (
        <section className="flex flex-row items-center gap-2 text-text-950 mb-4">
          <Text size="lg" weight="bold">
            Filtro de questões
          </Text>
        </section>
      )}

      <div className={contentClassName}>
        <section className="flex flex-col gap-4">
          <QuestionTypeFilter
            selectedTypes={selectedQuestionTypes}
            onToggleType={toggleQuestionType}
          />

          <div>
            <Text size="sm" weight="bold" className="mb-3 block">
              Banca de vestibular
            </Text>
            <BanksFilter
              banks={banks}
              selectedBanks={selectedBanks}
              onToggleBank={toggleBank}
              loading={loadingBanks}
              error={banksError}
            />
          </div>

          <div>
            <div className="flex flex-row justify-between items-center mb-3">
              <Text size="sm" weight="bold">
                Matéria
              </Text>
            </div>
            <SubjectsFilter
              knowledgeAreas={knowledgeAreas}
              selectedSubject={selectedSubject}
              onSubjectChange={handleSubjectChange}
              loading={loadingSubjects}
              error={subjectsError}
            />
          </div>

          {selectedSubject && (
            <KnowledgeStructureFilter
              knowledgeStructure={knowledgeStructure}
              knowledgeCategories={knowledgeCategories}
              handleCategoriesChange={handleCategoriesChange}
              selectedKnowledgeSummary={selectedKnowledgeSummary}
              enableSummary={enableSummary}
            />
          )}

          <FilterActions
            onClearFilters={onClearFilters}
            onApplyFilters={onApplyFilters}
          />
        </section>
      </div>
    </div>
  );
};

export interface ActivityFiltersPopoverProps
  extends Omit<ActivityFiltersProps, 'variant' | 'onFiltersChange'> {
  onFiltersChange: (filters: ActivityFiltersData) => void;
  triggerLabel?: string;
}

/**
 * ActivityFiltersPopover component
 * Wraps ActivityFilters in a Popover/DropdownMenu triggered by a Button
 */
export const ActivityFiltersPopover = ({
  onFiltersChange,
  triggerLabel = 'Filtro de questões',
  ...activityFiltersProps
}: ActivityFiltersPopoverProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Button variant="outline">{triggerLabel}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[90vw] max-w-[400px] max-h-[calc(100vh-8rem)] overflow-y-auto p-0"
        align="start"
      >
        <ActivityFilters
          onFiltersChange={onFiltersChange}
          variant="popover"
          {...activityFiltersProps}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
