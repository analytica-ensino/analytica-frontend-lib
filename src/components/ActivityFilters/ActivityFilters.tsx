import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import type { BaseApiClient } from '../../types/api';
import { createUseActivityFiltersData } from '../../hooks/useActivityFiltersData';
import { questionTypeLabels } from '../../types/questionTypes';
import type {
  ActivityFiltersData,
  Bank,
  BankYear,
  KnowledgeArea,
  KnowledgeStructureState,
} from '../../types/activityFilters';
import { getSelectedIdsFromCategories, toggleArrayItem, toggleSingleValue } from '../../utils/activityFilters';

const questionTypesFallback = [
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
  allowedQuestionTypes?: QUESTION_TYPE[];
}

const QuestionTypeFilter = ({
  selectedTypes,
  onToggleType,
  allowedQuestionTypes,
}: QuestionTypeFilterProps) => {
  const availableQuestionTypes = allowedQuestionTypes || questionTypesFallback;

  return (
    <div>
      <Text size="sm" weight="bold" className="mb-3 block">
        Tipo de questão
      </Text>
      <div className="grid grid-cols-2 gap-2">
        {availableQuestionTypes.map((questionType) => (
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

// BanksAndYearsFilter Component
interface BanksAndYearsFilterProps {
  banks: Bank[];
  bankYears: BankYear[];
  bankCategories: CategoryConfig[];
  onBankCategoriesChange: (updatedCategories: CategoryConfig[]) => void;
  loading?: boolean;
  error?: string | null;
}

const BanksAndYearsFilter = ({
  banks,
  bankYears,
  bankCategories,
  onBankCategoriesChange,
  loading = false,
  error = null,
}: BanksAndYearsFilterProps) => {
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

  if (banks.length === 0 && bankYears.length === 0) {
    return (
      <Text size="sm" className="text-text-600">
        Nenhuma banca encontrada
      </Text>
    );
  }

  if (bankCategories.length > 0) {
    return (
      <CheckboxGroup
        categories={bankCategories}
        onCategoriesChange={onBankCategoriesChange}
        compactSingleItem={true}
        showSingleItem={true}
      />
    );
  }

  return null;
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

// KnowledgeStructureFilter Component
interface KnowledgeStructureFilterProps {
  knowledgeStructure: KnowledgeStructureState;
  knowledgeCategories: CategoryConfig[];
  handleCategoriesChange?: (updatedCategories: CategoryConfig[]) => void;
}

const KnowledgeStructureFilter = ({
  knowledgeStructure,
  knowledgeCategories,
  handleCategoriesChange,
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
          compactSingleItem={false}
          showSingleItem={true}
        />
      )}
      {!knowledgeStructure.loading &&
        knowledgeCategories.length === 0 &&
        knowledgeStructure.topics.length === 0 && (
          <Text size="sm" className="text-text-600">
            Nenhum tema disponível para as matérias selecionadas
          </Text>
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
  apiClient: BaseApiClient;
  onFiltersChange: (filters: ActivityFiltersData) => void;
  variant?: 'default' | 'popover';
  institutionId?: string | null;
  // Question types
  allowedQuestionTypes?: QUESTION_TYPE[];
  // Action buttons
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
}

/**
 * ActivityFilters component for filtering questions
 * Manages question types, banks, subjects, and knowledge structure selections
 */
export const ActivityFilters = ({
  apiClient,
  onFiltersChange,
  variant = 'default',
  institutionId = null,
  // Question types
  allowedQuestionTypes,
  // Action buttons
  onClearFilters,
  onApplyFilters,
}: ActivityFiltersProps) => {
  const useActivityFiltersData = useMemo(
    () => createUseActivityFiltersData(apiClient),
    [apiClient]
  );

  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<
    QUESTION_TYPE[]
  >([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const {
    banks,
    bankYears,
    loadingBanks,
    banksError,
    knowledgeAreas,
    loadingSubjects,
    subjectsError,
    knowledgeStructure,
    knowledgeCategories,
    handleCategoriesChange,
    loadBanks,
    loadKnowledgeAreas,
    loadQuestionTypes,
    questionTypes,
    loadingQuestionTypes,
    questionTypesError,
    loadTopics,
    loadSubtopics,
    loadContents,
  } = useActivityFiltersData({
    selectedSubjects: selectedSubject ? [selectedSubject] : [],
    institutionId,
  });

  const prevAllowedQuestionTypesRef = useRef<string | null>(null);

  useEffect(() => {
    if (!allowedQuestionTypes || allowedQuestionTypes.length === 0) {
      prevAllowedQuestionTypesRef.current = null;
      return;
    }

    // Sort using a compare function to preserve original order as much as possible
    const currentKey = allowedQuestionTypes
      .slice()
      .sort((a, b) => {
        return a === b
          ? 0
          : allowedQuestionTypes.indexOf(a) - allowedQuestionTypes.indexOf(b);
      })
      .join(',');
    const prevKey = prevAllowedQuestionTypesRef.current;

    if (currentKey === prevKey) {
      return;
    }

    prevAllowedQuestionTypesRef.current = currentKey;

    setSelectedQuestionTypes((prev) => {
      const filtered = prev.filter((type) =>
        allowedQuestionTypes.includes(type)
      );
      if (filtered.length !== prev.length) {
        return filtered;
      }
      const prevSet = new Set(prev);
      const filteredSet = new Set(filtered);
      if (prevSet.size !== filteredSet.size) {
        return filtered;
      }
      for (const item of prevSet) {
        if (!filteredSet.has(item)) {
          return filtered;
        }
      }
      return prev;
    });
  }, [allowedQuestionTypes]);

  // Bank categories state
  const [bankCategories, setBankCategories] = useState<CategoryConfig[]>([]);

  // Convert single subject to array for compatibility
  const selectedSubjects = useMemo(
    () => (selectedSubject ? [selectedSubject] : []),
    [selectedSubject]
  );

  const toggleQuestionType = (questionType: QUESTION_TYPE) => {
    setSelectedQuestionTypes((prev) => toggleArrayItem(prev, questionType));
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(toggleSingleValue(selectedSubject, subjectId));
  };

  const handleBankCategoriesChange = (updatedCategories: CategoryConfig[]) => {
    setBankCategories(updatedCategories);
  };

  // Update bank categories when banks or bankYears change
  useEffect(() => {
    setBankCategories((prevCategories) => {
      const bankCategory: CategoryConfig = {
        key: 'banca',
        label: 'Banca',
        itens: banks.map((bank) => ({
          id: bank.id,
          name: bank.name || bank.examInstitution,
        })),
        selectedIds:
          prevCategories.find((c) => c.key === 'banca')?.selectedIds || [],
      };

      const yearCategory: CategoryConfig = {
        key: 'ano',
        label: 'Ano',
        dependsOn: ['banca'],
        itens: bankYears.map((year) => ({
          id: year.id,
          name: year.name,
          bankId: year.bankId,
        })),
        filteredBy: [{ key: 'banca', internalField: 'bankId' }],
        selectedIds:
          prevCategories.find((c) => c.key === 'ano')?.selectedIds || [],
      };

      return [bankCategory, yearCategory];
    });
  }, [banks, bankYears]);

  // Load banks, knowledge areas and question types on component mount/institution change
  useEffect(() => {
    if (loadBanks) {
      loadBanks();
    }
    if (loadKnowledgeAreas) {
      loadKnowledgeAreas();
    }
    if (loadQuestionTypes) {
      loadQuestionTypes();
    }
  }, [loadBanks, loadKnowledgeAreas, loadQuestionTypes, institutionId]);

  const availableQuestionTypes = useMemo(() => {
    const source =
      questionTypes && questionTypes.length > 0 ? questionTypes : questionTypesFallback;

    if (!allowedQuestionTypes || allowedQuestionTypes.length === 0) {
      return source;
    }

    return source.filter((type) => allowedQuestionTypes.includes(type));
  }, [questionTypes, allowedQuestionTypes]);

  // Extract selected IDs from knowledge categories
  const getSelectedKnowledgeIds = useCallback(() => {
    return getSelectedIdsFromCategories(knowledgeCategories, {
      topicIds: 'tema',
      subtopicIds: 'subtema',
      contentIds: 'assunto',
    });
  }, [knowledgeCategories]);

  // Extract selected IDs from bank categories
  const getSelectedBankIds = useCallback(() => {
    return getSelectedIdsFromCategories(bankCategories, {
      bankIds: 'banca',
      yearIds: 'ano',
    });
  }, [bankCategories]);

  // Use ref to store onFiltersChange to avoid infinite loops
  const onFiltersChangeRef = useRef(onFiltersChange);
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  // Notify parent component when filters change
  useEffect(() => {
    const knowledgeIds = getSelectedKnowledgeIds();
    const bankIds = getSelectedBankIds();
    const filters: ActivityFiltersData = {
      types: selectedQuestionTypes,
      bankIds: bankIds.bankIds || [],
      yearIds: bankIds.yearIds || [],
      knowledgeIds: selectedSubjects,
      topicIds: knowledgeIds.topicIds,
      subtopicIds: knowledgeIds.subtopicIds,
      contentIds: knowledgeIds.contentIds,
    };
    onFiltersChangeRef.current(filters);
  }, [
    selectedQuestionTypes,
    selectedSubjects,
    knowledgeCategories,
    bankCategories,
    getSelectedKnowledgeIds,
    getSelectedBankIds,
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
            allowedQuestionTypes={availableQuestionTypes}
          />
          {loadingQuestionTypes && (
            <Text size="sm" className="text-text-600" data-testid="question-types-loading">
              Carregando tipos de questão...
            </Text>
          )}
          {questionTypesError && (
            <Text size="sm" className="text-error-500" data-testid="question-types-error">
              {questionTypesError}
            </Text>
          )}

          <div>
            <Text size="sm" weight="bold" className="mb-3 block">
              Banca de vestibular
            </Text>
            <BanksAndYearsFilter
              banks={banks}
              bankYears={bankYears}
              bankCategories={bankCategories}
              onBankCategoriesChange={handleBankCategoriesChange}
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
