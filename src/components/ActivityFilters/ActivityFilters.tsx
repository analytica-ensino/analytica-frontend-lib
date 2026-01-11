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
import { useQuestionFiltersStore } from '../../store/questionFiltersStore';
import { questionTypeLabels } from '../../types/questionTypes';
import type {
  ActivityFiltersData,
  Bank,
  BankYear,
  KnowledgeArea,
  KnowledgeStructureState,
} from '../../types/activityFilters';
import {
  getSelectedIdsFromCategories,
  toggleArrayItem,
  toggleSingleValue,
  areFiltersEqual,
} from '../../utils/activityFilters';

const questionTypesFallback = [
  QUESTION_TYPE.ALTERNATIVA,
  QUESTION_TYPE.VERDADEIRO_FALSO,
  QUESTION_TYPE.DISSERTATIVA,
  QUESTION_TYPE.IMAGEM,
  QUESTION_TYPE.MULTIPLA_ESCOLHA,
  QUESTION_TYPE.LIGAR_PONTOS,
  QUESTION_TYPE.PREENCHER,
];

/**
 * Type guard to check if an item has a valid bankId
 * @param item - The item to validate
 * @param bankIds - Array of valid bank IDs to check against
 * @returns True if item has valid id and bankId that matches bankIds
 */
const isValidBankYearItem = (
  item: unknown,
  bankIds: string[]
): item is { id: string; bankId: string } => {
  return (
    !!item &&
    typeof (item as { id?: unknown }).id === 'string' &&
    typeof (item as { bankId?: unknown }).bankId === 'string' &&
    bankIds.includes((item as { bankId: string }).bankId)
  );
};

/**
 * Derives year IDs from bank IDs when explicit year IDs are not provided
 * @param yearItens - Array of year items to filter
 * @param bankIds - Array of bank IDs to filter by
 * @param explicitYearIds - Explicitly provided year IDs (takes precedence)
 * @returns Array of year IDs
 */
const deriveYearIdsFromBankIds = (
  yearItens: unknown[],
  bankIds: string[],
  explicitYearIds: string[]
): string[] => {
  if (explicitYearIds.length > 0) {
    return explicitYearIds;
  }
  return yearItens
    .filter((item) => isValidBankYearItem(item, bankIds))
    .map((item) => item.id);
};

/**
 * Checks if bank matches exist in the provided categories
 * @param bankIds - Array of bank IDs to check
 * @param bankCategories - Array of category configurations
 * @returns True if bankIds is empty or matches are found
 */
const hasBankMatches = (
  bankIds: string[],
  bankCategories: CategoryConfig[]
): boolean => {
  if (bankIds.length === 0) {
    return true;
  }
  return bankCategories.some(
    (category) =>
      category.key === 'banca' &&
      (category.itens ?? []).some((item) => bankIds.includes(item.id))
  );
};

/**
 * Checks if year matches exist in the provided categories
 * @param derivedYearIds - Array of year IDs to check
 * @param bankCategories - Array of category configurations
 * @returns True if derivedYearIds is empty or matches are found
 */
const hasYearMatches = (
  derivedYearIds: string[],
  bankCategories: CategoryConfig[]
): boolean => {
  if (derivedYearIds.length === 0) {
    return true;
  }
  return bankCategories.some(
    (category) =>
      category.key === 'ano' &&
      (category.itens ?? []).some((item) => derivedYearIds.includes(item.id))
  );
};

/**
 * Updates a bank category with selected IDs based on provided bank IDs
 * @param category - The category configuration to update
 * @param bankIds - Array of bank IDs to select
 * @returns Updated category with selectedIds
 */
const updateBankCategory = (
  category: CategoryConfig,
  bankIds: string[]
): CategoryConfig => {
  const itens = category.itens ?? [];
  const selectedIds = itens
    .filter((item) => bankIds.includes(item.id))
    .map((item) => item.id);
  return { ...category, selectedIds };
};

/**
 * Updates a year category with selected IDs based on provided year IDs
 * @param category - The category configuration to update
 * @param derivedYearIds - Array of year IDs to select
 * @returns Updated category with selectedIds
 */
const updateYearCategory = (
  category: CategoryConfig,
  derivedYearIds: string[]
): CategoryConfig => {
  const itens = category.itens ?? [];
  const selectedIds = itens
    .filter((item) => derivedYearIds.includes(item.id))
    .map((item) => item.id);
  return { ...category, selectedIds };
};

/**
 * Updates bank categories with initial filter selections
 * @param prevCategories - Previous category configurations
 * @param bankIds - Array of bank IDs to select
 * @param derivedYearIds - Array of year IDs to select
 * @returns Updated array of category configurations
 */
const updateBankCategoriesWithInitialFilters = (
  prevCategories: CategoryConfig[],
  bankIds: string[],
  derivedYearIds: string[]
): CategoryConfig[] => {
  return prevCategories.map((category) => {
    if (category.key === 'banca') {
      return updateBankCategory(category, bankIds);
    }
    if (category.key === 'ano') {
      return updateYearCategory(category, derivedYearIds);
    }
    return category;
  });
};

/**
 * Gets selected IDs for a knowledge category based on filter IDs
 * @param category - The category configuration
 * @param filterIds - Array of IDs to filter by
 * @returns Array of selected item IDs
 */
const getSelectedIdsForKnowledgeCategory = (
  category: CategoryConfig,
  filterIds: string[]
): string[] => {
  return (category.itens || [])
    .filter((item) => filterIds.includes(item.id))
    .map((item) => item.id);
};

/**
 * Updates a knowledge category with topic filter selections
 * @param category - The category configuration to update
 * @param topicIds - Array of topic IDs to select
 * @param hasAppliedTopicsRef - Ref to track if topics have been applied
 * @returns Object with updated category and changed flag
 */
const updateTopicCategory = (
  category: CategoryConfig,
  topicIds: string[],
  hasAppliedTopicsRef: { current: boolean }
): { category: CategoryConfig; changed: boolean } => {
  const selectedIds = getSelectedIdsForKnowledgeCategory(category, topicIds);
  if (selectedIds.length > 0) {
    hasAppliedTopicsRef.current = true;
    return { category: { ...category, selectedIds }, changed: true };
  }
  return { category, changed: false };
};

/**
 * Updates a knowledge category with subtopic filter selections
 * @param category - The category configuration to update
 * @param subtopicIds - Array of subtopic IDs to select
 * @param hasAppliedSubtopicsRef - Ref to track if subtopics have been applied
 * @returns Object with updated category and changed flag
 */
const updateSubtopicCategory = (
  category: CategoryConfig,
  subtopicIds: string[],
  hasAppliedSubtopicsRef: { current: boolean }
): { category: CategoryConfig; changed: boolean } => {
  const selectedIds = getSelectedIdsForKnowledgeCategory(category, subtopicIds);
  if (selectedIds.length > 0) {
    hasAppliedSubtopicsRef.current = true;
    return { category: { ...category, selectedIds }, changed: true };
  }
  return { category, changed: false };
};

/**
 * Updates a knowledge category with content filter selections
 * @param category - The category configuration to update
 * @param contentIds - Array of content IDs to select
 * @param hasAppliedContentsRef - Ref to track if contents have been applied
 * @returns Object with updated category and changed flag
 */
const updateContentCategory = (
  category: CategoryConfig,
  contentIds: string[],
  hasAppliedContentsRef: { current: boolean }
): { category: CategoryConfig; changed: boolean } => {
  const selectedIds = getSelectedIdsForKnowledgeCategory(category, contentIds);
  if (selectedIds.length > 0) {
    hasAppliedContentsRef.current = true;
    return { category: { ...category, selectedIds }, changed: true };
  }
  return { category, changed: false };
};

interface QuestionTypeFilterProps {
  selectedTypes: QUESTION_TYPE[];
  onToggleType: (type: QUESTION_TYPE) => void;
  allowedQuestionTypes?: QUESTION_TYPE[];
}

/**
 * QuestionTypeFilter component for selecting question types
 * @param props - Component props
 * @returns JSX element
 */
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

interface BanksAndYearsFilterProps {
  banks: Bank[];
  bankYears: BankYear[];
  bankCategories: CategoryConfig[];
  onBankCategoriesChange: (updatedCategories: CategoryConfig[]) => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * BanksAndYearsFilter component for selecting banks and years
 * @param props - Component props
 * @returns JSX element
 */
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

interface SubjectsFilterProps {
  knowledgeAreas: KnowledgeArea[];
  selectedSubject: string | null;
  onSubjectChange: (subjectId: string) => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * SubjectsFilter component for selecting subjects/knowledge areas
 * @param props - Component props
 * @returns JSX element
 */
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

interface KnowledgeStructureFilterProps {
  knowledgeStructure: KnowledgeStructureState;
  knowledgeCategories: CategoryConfig[];
  handleCategoriesChange?: (updatedCategories: CategoryConfig[]) => void;
}

/**
 * KnowledgeStructureFilter component for selecting topics, subtopics, and contents
 * @param props - Component props
 * @returns JSX element
 */
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

interface FilterActionsProps {
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
}

/**
 * FilterActions component for clear and apply filter buttons
 * @param props - Component props
 * @returns JSX element or null if no actions provided
 */
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

export interface ActivityFiltersProps {
  apiClient: BaseApiClient;
  onFiltersChange: (filters: ActivityFiltersData) => void;
  variant?: 'default' | 'popover';
  institutionId?: string | null;
  initialFilters?: ActivityFiltersData | null;
  allowedQuestionTypes?: QUESTION_TYPE[];
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
  initialFilters = null,
  allowedQuestionTypes,
  onClearFilters,
  onApplyFilters,
}: ActivityFiltersProps) => {
  const useActivityFiltersData = createUseActivityFiltersData(apiClient);

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
    loadTopics,
    loadSubtopics,
    loadContents,
    questionTypes,
    loadingQuestionTypes,
    questionTypesError,
  } = useActivityFiltersData({
    selectedSubjects: selectedSubject ? [selectedSubject] : [],
    institutionId,
  });

  const prevAllowedQuestionTypesRef = useRef<string | null>(null);
  const hasAppliedBasicInitialFiltersRef = useRef(false);
  const hasAppliedBankInitialFiltersRef = useRef(false);
  const hasAppliedKnowledgeInitialFiltersRef = useRef(false);
  const hasRequestedTopicsRef = useRef(false);
  const hasRequestedSubtopicsRef = useRef(false);
  const hasRequestedContentsRef = useRef(false);
  const hasAppliedTopicsRef = useRef(false);
  const hasAppliedSubtopicsRef = useRef(false);
  const hasAppliedContentsRef = useRef(false);
  const bankCategoriesRef = useRef<CategoryConfig[]>([]);
  const knowledgeCategoriesRef = useRef<CategoryConfig[]>([]);

  useEffect(() => {
    if (!allowedQuestionTypes || allowedQuestionTypes.length === 0) {
      prevAllowedQuestionTypesRef.current = null;
      return;
    }

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

  const [bankCategories, setBankCategories] = useState<CategoryConfig[]>([]);

  useEffect(() => {
    bankCategoriesRef.current = bankCategories;
  }, [bankCategories]);

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

  useEffect(() => {
    knowledgeCategoriesRef.current = knowledgeCategories;
  }, [knowledgeCategories]);

  useEffect(() => {
    hasAppliedBasicInitialFiltersRef.current = false;
    hasAppliedBankInitialFiltersRef.current = false;
    hasAppliedKnowledgeInitialFiltersRef.current = false;
    hasRequestedTopicsRef.current = false;
    hasRequestedSubtopicsRef.current = false;
    hasRequestedContentsRef.current = false;
    hasAppliedTopicsRef.current = false;
    hasAppliedSubtopicsRef.current = false;
    hasAppliedContentsRef.current = false;
  }, [initialFilters]);

  useEffect(() => {
    if (!initialFilters || hasAppliedBasicInitialFiltersRef.current) {
      return;
    }

    if (initialFilters.types && initialFilters.types.length > 0) {
      setSelectedQuestionTypes(initialFilters.types);
    }

    if (initialFilters.subjectIds && initialFilters.subjectIds.length > 0) {
      setSelectedSubject(initialFilters.subjectIds[0]);
    }

    hasAppliedBasicInitialFiltersRef.current = true;
  }, [initialFilters]);

  useEffect(() => {
    if (
      !initialFilters ||
      hasAppliedBankInitialFiltersRef.current ||
      bankCategoriesRef.current.length === 0
    ) {
      return;
    }

    const bankIds = initialFilters.bankIds || [];
    const yearIds = initialFilters.yearIds || [];

    if (bankIds.length === 0 && yearIds.length === 0) {
      hasAppliedBankInitialFiltersRef.current = true;
      return;
    }

    const currentBankCategories = bankCategoriesRef.current;
    const yearCategory = currentBankCategories.find(
      (category) => category.key === 'ano'
    );
    const yearItens = Array.isArray(yearCategory?.itens)
      ? yearCategory.itens
      : [];

    const derivedYearIds = deriveYearIdsFromBankIds(
      yearItens,
      bankIds,
      yearIds
    );

    if (
      !hasBankMatches(bankIds, currentBankCategories) ||
      !hasYearMatches(derivedYearIds, currentBankCategories)
    ) {
      return;
    }

    setBankCategories((prevCategories) =>
      updateBankCategoriesWithInitialFilters(
        prevCategories,
        bankIds,
        derivedYearIds
      )
    );

    hasAppliedBankInitialFiltersRef.current = true;
  }, [initialFilters, bankCategories]);

  useEffect(() => {
    if (!initialFilters) {
      return;
    }

    const subjectIds = initialFilters.subjectIds || [];
    const topicIds = initialFilters.topicIds || [];
    const subtopicIds = initialFilters.subtopicIds || [];

    if (subjectIds.length > 0 && !hasRequestedTopicsRef.current) {
      if (loadTopics) {
        loadTopics(subjectIds);
      }
      hasRequestedTopicsRef.current = true;
    }

    if (topicIds.length > 0 && !hasRequestedSubtopicsRef.current) {
      if (loadSubtopics) {
        loadSubtopics(topicIds);
      }
      hasRequestedSubtopicsRef.current = true;
    }

    if (subtopicIds.length > 0 && !hasRequestedContentsRef.current) {
      if (loadContents) {
        loadContents(subtopicIds);
      }
      hasRequestedContentsRef.current = true;
    }
  }, [initialFilters, loadTopics, loadSubtopics, loadContents]);

  useEffect(() => {
    if (
      !initialFilters ||
      hasAppliedKnowledgeInitialFiltersRef.current ||
      knowledgeCategoriesRef.current.length === 0 ||
      !handleCategoriesChange
    ) {
      return;
    }

    const topicIds = initialFilters.topicIds || [];
    const subtopicIds = initialFilters.subtopicIds || [];
    const contentIds = initialFilters.contentIds || [];

    const hasKnowledgeSelections =
      topicIds.length > 0 || subtopicIds.length > 0 || contentIds.length > 0;

    if (!hasKnowledgeSelections) {
      hasAppliedKnowledgeInitialFiltersRef.current = true;
      return;
    }

    const currentKnowledgeCategories = knowledgeCategoriesRef.current;
    let changed = false;

    const updatedCategories = currentKnowledgeCategories.map((category) => {
      if (
        category.key === 'tema' &&
        topicIds.length > 0 &&
        !hasAppliedTopicsRef.current
      ) {
        const result = updateTopicCategory(
          category,
          topicIds,
          hasAppliedTopicsRef
        );
        if (result.changed) {
          changed = true;
        }
        return result.category;
      }
      if (
        category.key === 'subtema' &&
        subtopicIds.length > 0 &&
        !hasAppliedSubtopicsRef.current
      ) {
        const result = updateSubtopicCategory(
          category,
          subtopicIds,
          hasAppliedSubtopicsRef
        );
        if (result.changed) {
          changed = true;
        }
        return result.category;
      }
      if (
        category.key === 'assunto' &&
        contentIds.length > 0 &&
        !hasAppliedContentsRef.current
      ) {
        const result = updateContentCategory(
          category,
          contentIds,
          hasAppliedContentsRef
        );
        if (result.changed) {
          changed = true;
        }
        return result.category;
      }
      return category;
    });

    if (changed) {
      handleCategoriesChange(updatedCategories);
    }

    if (
      (topicIds.length === 0 || hasAppliedTopicsRef.current) &&
      (subtopicIds.length === 0 || hasAppliedSubtopicsRef.current) &&
      (contentIds.length === 0 || hasAppliedContentsRef.current)
    ) {
      hasAppliedKnowledgeInitialFiltersRef.current = true;
    }
  }, [initialFilters, knowledgeCategories, handleCategoriesChange]);

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
      questionTypes && questionTypes.length > 0
        ? questionTypes
        : questionTypesFallback;

    if (!allowedQuestionTypes || allowedQuestionTypes.length === 0) {
      return source;
    }

    return source.filter((type) => allowedQuestionTypes.includes(type));
  }, [questionTypes, allowedQuestionTypes]);

  const getSelectedKnowledgeIds = useCallback(() => {
    return getSelectedIdsFromCategories(knowledgeCategories, {
      topicIds: 'tema',
      subtopicIds: 'subtema',
      contentIds: 'assunto',
    });
  }, [knowledgeCategories]);

  const getSelectedBankIds = useCallback(() => {
    return getSelectedIdsFromCategories(bankCategories, {
      bankIds: 'banca',
      yearIds: 'ano',
    });
  }, [bankCategories]);

  const onFiltersChangeRef = useRef(onFiltersChange);
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  const prevFiltersRef = useRef<ActivityFiltersData | null>(null);

  useEffect(() => {
    const knowledgeIds = getSelectedKnowledgeIds();
    const bankIds = getSelectedBankIds();
    const filters: ActivityFiltersData = {
      types: selectedQuestionTypes,
      bankIds: bankIds.bankIds || [],
      yearIds: bankIds.yearIds || [],
      subjectIds: selectedSubjects,
      topicIds: knowledgeIds.topicIds,
      subtopicIds: knowledgeIds.subtopicIds,
      contentIds: knowledgeIds.contentIds,
    };

    if (!areFiltersEqual(prevFiltersRef.current, filters)) {
      prevFiltersRef.current = filters;
      onFiltersChangeRef.current(filters);
    }
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
            <Text
              size="sm"
              className="text-text-600"
              data-testid="question-types-loading"
            >
              Carregando tipos de questão...
            </Text>
          )}
          {questionTypesError && (
            <Text
              size="sm"
              className="text-error-500"
              data-testid="question-types-error"
            >
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
  const appliedFilters = useQuestionFiltersStore(
    (state) => state.appliedFilters
  );

  // Use appliedFilters from store if available, otherwise fall back to initialFilters
  const effectiveInitialFilters =
    appliedFilters || activityFiltersProps.initialFilters || undefined;

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
          initialFilters={effectiveInitialFilters}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
