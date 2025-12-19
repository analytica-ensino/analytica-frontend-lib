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
  initialFilters?: ActivityFiltersData | null;
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
  initialFilters = null,
  // Question types
  allowedQuestionTypes,
  // Action buttons
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

    if (initialFilters.knowledgeIds && initialFilters.knowledgeIds.length > 0) {
      setSelectedSubject(initialFilters.knowledgeIds[0]);
    }

    hasAppliedBasicInitialFiltersRef.current = true;
  }, [initialFilters]);

  useEffect(() => {
    if (!initialFilters || hasAppliedBankInitialFiltersRef.current) {
      return;
    }

    const bankIds = initialFilters.bankIds || [];
    const yearIds = initialFilters.yearIds || [];

    if (bankIds.length === 0 && yearIds.length === 0) {
      hasAppliedBankInitialFiltersRef.current = true;
      return;
    }

    if (bankCategories.length === 0) {
      return;
    }

    const yearCategory = bankCategories.find(
      (category) => category.key === 'ano'
    );
    const yearItens = Array.isArray(yearCategory?.itens)
      ? yearCategory!.itens
      : [];

    const derivedYearIds =
      yearIds.length > 0
        ? yearIds
        : yearItens
            .filter(
              (item) =>
                item &&
                typeof item.id === 'string' &&
                // bankId pode não existir em todos os itens, por isso a verificação
                typeof (item as { bankId?: unknown }).bankId === 'string' &&
                bankIds.includes((item as { bankId?: string }).bankId as string)
            )
            .map((item) => item.id);

    const hasBankMatches =
      bankIds.length === 0 ||
      bankCategories.some(
        (category) =>
          category.key === 'banca' &&
          (category.itens ?? []).some((item) => bankIds.includes(item.id))
      );
    const hasYearMatches =
      derivedYearIds.length === 0 ||
      bankCategories.some(
        (category) =>
          category.key === 'ano' &&
          (category.itens ?? []).some((item) =>
            derivedYearIds.includes(item.id)
          )
      );

    if (!hasBankMatches || !hasYearMatches) {
      return;
    }

    setBankCategories((prevCategories) =>
      prevCategories.map((category) => {
        if (category.key === 'banca') {
          const itens = category.itens ?? [];
          const selectedIds = itens
            .filter((item) => bankIds.includes(item.id))
            .map((item) => item.id);
          return { ...category, selectedIds };
        }
        if (category.key === 'ano') {
          const itens = category.itens ?? [];
          const selectedIds = itens
            .filter((item) => derivedYearIds.includes(item.id))
            .map((item) => item.id);
          return { ...category, selectedIds };
        }
        return category;
      })
    );

    hasAppliedBankInitialFiltersRef.current = true;
  }, [initialFilters, bankCategories]);

  useEffect(() => {
    if (!initialFilters) {
      return;
    }

    const subjectIds = initialFilters.knowledgeIds || [];
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
    if (!initialFilters || hasAppliedKnowledgeInitialFiltersRef.current) {
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

    if (knowledgeCategories.length === 0 || !handleCategoriesChange) {
      return;
    }

    let changed = false;

    const updatedCategories = knowledgeCategories.map((category) => {
      if (
        category.key === 'tema' &&
        topicIds.length > 0 &&
        !hasAppliedTopicsRef.current
      ) {
        const selectedIds = (category.itens || [])
          .filter((item) => topicIds.includes(item.id))
          .map((item) => item.id);
        if (selectedIds.length > 0) {
          changed = true;
          hasAppliedTopicsRef.current = true;
          return { ...category, selectedIds };
        }
      }
      if (
        category.key === 'subtema' &&
        subtopicIds.length > 0 &&
        !hasAppliedSubtopicsRef.current
      ) {
        const selectedIds = (category.itens || [])
          .filter((item) => subtopicIds.includes(item.id))
          .map((item) => item.id);
        if (selectedIds.length > 0) {
          changed = true;
          hasAppliedSubtopicsRef.current = true;
          return { ...category, selectedIds };
        }
      }
      if (
        category.key === 'assunto' &&
        contentIds.length > 0 &&
        !hasAppliedContentsRef.current
      ) {
        const selectedIds = (category.itens || [])
          .filter((item) => contentIds.includes(item.id))
          .map((item) => item.id);
        if (selectedIds.length > 0) {
          changed = true;
          hasAppliedContentsRef.current = true;
          return { ...category, selectedIds };
        }
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
      questionTypes && questionTypes.length > 0
        ? questionTypes
        : questionTypesFallback;

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

  // Store previous filters to compare and avoid unnecessary updates
  const prevFiltersRef = useRef<ActivityFiltersData | null>(null);

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

    // Only call onFiltersChange if filters actually changed
    if (!areFiltersEqual(prevFiltersRef.current, filters)) {
      prevFiltersRef.current = filters;
      onFiltersChangeRef.current(filters);
    }
  }, [
    selectedQuestionTypes,
    selectedSubjects,
    knowledgeCategories,
    bankCategories,
    // getSelectedKnowledgeIds and getSelectedBankIds are stable callbacks
    // that depend on knowledgeCategories and bankCategories, which are already in deps
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
