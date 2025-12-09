import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { BaseApiClient } from '../types/api';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import type {
  KnowledgeItem,
  KnowledgeStructureState,
  Bank,
  BankYear,
  KnowledgeArea,
} from '../types/activityFilters';
import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';

// ============================================================================
// API Response Types
// ============================================================================

/**
 * API response format for knowledge endpoints
 */
interface KnowledgeApiResponse {
  message: string;
  data: Array<{ id: string; name: string }>;
}

/**
 * API response for vestibular banks endpoint
 */
interface VestibularBankItem {
  questionBankName: string;
  questionBankYearId: string;
  year: string;
  questionsCount: number;
}

interface VestibularBanksApiResponse {
  message: string;
  data: VestibularBankItem[];
}

/**
 * API response for knowledge areas (subjects) endpoint
 */
interface KnowledgeAreasApiResponse {
  message: string;
  data: KnowledgeArea[];
}

/**
 * API response for question types endpoint
 */
interface QuestionTypesApiResponse {
  message: string;
  data: {
    questionTypes: string[];
    isFiltered: boolean;
  };
}

// ============================================================================
// Internal State Types
// ============================================================================

interface VestibularBanksState {
  banks: Bank[];
  bankYears: BankYear[];
  loading: boolean;
  error: string | null;
}

interface KnowledgeAreasState {
  knowledgeAreas: KnowledgeArea[];
  loading: boolean;
  error: string | null;
}

interface QuestionTypesState {
  questionTypes: QUESTION_TYPE[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// Hook Configuration
// ============================================================================

/**
 * Configuration options for the useActivityFiltersData hook
 */
export interface UseActivityFiltersDataOptions {
  /**
   * Selected subjects for loading knowledge structure
   */
  selectedSubjects: string[];
  /**
   * Institution ID for loading question types (optional)
   */
  institutionId?: string | null;
}

// ============================================================================
// Return Type
// ============================================================================

/**
 * Return type for the useActivityFiltersData hook
 */
export interface UseActivityFiltersDataReturn {
  // Vestibular Banks
  banks: Bank[];
  bankYears: BankYear[];
  loadingBanks: boolean;
  banksError: string | null;
  loadBanks: () => Promise<void>;

  // Knowledge Areas (Subjects)
  knowledgeAreas: KnowledgeArea[];
  loadingSubjects: boolean;
  subjectsError: string | null;
  loadKnowledgeAreas: () => Promise<void>;

  // Knowledge Structure (Topics, Subtopics, Contents)
  knowledgeStructure: KnowledgeStructureState;
  knowledgeCategories: CategoryConfig[];
  handleCategoriesChange: (updatedCategories: CategoryConfig[]) => void;
  selectedKnowledgeSummary: {
    topics: string[];
    subtopics: string[];
    contents: string[];
  };
  enableSummary: boolean;
  loadTopics: (subjectIds: string[]) => Promise<void>;
  loadSubtopics: (
    topicIds: string[],
    options?: { forceApi?: boolean }
  ) => Promise<void>;
  loadContents: (subtopicIds: string[]) => Promise<void>;

  // Question Types
  questionTypes: QUESTION_TYPE[];
  loadingQuestionTypes: boolean;
  questionTypesError: string | null;
  loadQuestionTypes: () => Promise<void>;
}

// ============================================================================
// Question Type Mapping
// ============================================================================

/**
 * Maps API question type strings to QUESTION_TYPE enum values
 */
const mapQuestionTypeToEnum = (type: string): QUESTION_TYPE | null => {
  const upperType = type.toUpperCase();

  const typeMap: Record<string, QUESTION_TYPE> = {
    ALTERNATIVA: QUESTION_TYPE.ALTERNATIVA,
    DISSERTATIVA: QUESTION_TYPE.DISSERTATIVA,
    MULTIPLA_ESCOLHA: QUESTION_TYPE.MULTIPLA_ESCOLHA,
    VERDADEIRO_FALSO: QUESTION_TYPE.VERDADEIRO_FALSO,
    IMAGEM: QUESTION_TYPE.IMAGEM,
    LIGAR_PONTOS: QUESTION_TYPE.LIGAR_PONTOS,
    PREENCHER: QUESTION_TYPE.PREENCHER,
  };

  return typeMap[upperType] || null;
};

// ============================================================================
// Helpers
// ============================================================================

const areCategoriesSame = (
  prev: CategoryConfig[],
  current: CategoryConfig[]
): boolean => {
  if (prev.length !== current.length) return false;

  return current.every((category) => {
    const prevCategory = prev.find((c) => c.key === category.key);
    if (!prevCategory) return false;

    const prevIds = (prevCategory.itens || []).map(
      (item: { id: string }) => item.id
    );
    const currentIds = (category.itens || []).map(
      (item: { id: string }) => item.id
    );

    if (prevIds.length !== currentIds.length) return false;
    return currentIds.every((id) => prevIds.includes(id));
  });
};

const mergeCategoriesWithSelection = (
  prev: CategoryConfig[],
  current: CategoryConfig[]
): CategoryConfig[] => {
  return current.map((category) => {
    const prevCategory = prev.find((c) => c.key === category.key);
    if (!prevCategory) {
      return category;
    }

    const validSelectedIds = (prevCategory.selectedIds || []).filter(
      (id: string) =>
        category.itens?.some((item: { id: string }) => item.id === id)
    );

    return {
      ...category,
      selectedIds: validSelectedIds,
    };
  });
};

const mapSelectedNames = (ids: string[], items: KnowledgeItem[]): string[] => {
  return ids
    .map((id: string) => {
      const item = items.find((t) => t.id === id);
      return item ? item.name : null;
    })
    .filter((name): name is string => name !== null);
};

// ============================================================================
// Main Hook Implementation
// ============================================================================

const useActivityFiltersDataImpl = (
  apiClient: BaseApiClient,
  options: UseActivityFiltersDataOptions
): UseActivityFiltersDataReturn => {
  const { selectedSubjects, institutionId } = options;

  // ========================================================================
  // Vestibular Banks State
  // ========================================================================

  const [banksState, setBanksState] = useState<VestibularBanksState>({
    banks: [],
    bankYears: [],
    loading: false,
    error: null,
  });

  /**
   * Load vestibular banks from API
   */
  const loadBanks = useCallback(async () => {
    setBanksState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.get<VestibularBanksApiResponse>(
        '/questions/exam-institutions'
      );

      // Group banks by questionBankName and collect unique years
      const banksMap = new Map<
        string,
        Bank & { years: string[]; questionsCount: number }
      >();
      const bankYearsArray: BankYear[] = [];

      for (const item of response.data.data) {
        if (!item.questionBankName) continue;

        const existingBank = banksMap.get(item.questionBankName);

        if (existingBank) {
          if (!existingBank.years.includes(item.year)) {
            existingBank.years.push(item.year);
          }
          existingBank.questionsCount += item.questionsCount;
        } else {
          banksMap.set(item.questionBankName, {
            id: item.questionBankName,
            name: item.questionBankName,
            examInstitution: item.questionBankName,
            years: [item.year],
            questionsCount: item.questionsCount,
          });
        }

        // Add bank year with format: {questionBankYearId}-{questionBankName}
        bankYearsArray.push({
          id: `${item.questionBankYearId}-${item.questionBankName}`,
          name: item.year,
          bankId: item.questionBankName,
        });
      }

      const banks: Bank[] = Array.from(banksMap.values()).map((bank) => ({
        id: bank.id,
        name: bank.name,
        examInstitution: bank.examInstitution,
      }));

      setBanksState({
        banks,
        bankYears: bankYearsArray,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading vestibular banks:', error);
      setBanksState((prev) => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar bancas de vestibular',
      }));
    }
  }, [apiClient]);

  // ========================================================================
  // Knowledge Areas (Subjects) State
  // ========================================================================

  const [areasState, setAreasState] = useState<KnowledgeAreasState>({
    knowledgeAreas: [],
    loading: false,
    error: null,
  });

  /**
   * Load knowledge areas from API
   */
  const loadKnowledgeAreas = useCallback(async () => {
    setAreasState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.get<KnowledgeAreasApiResponse>(
        '/knowledge/subjects'
      );

      setAreasState({
        knowledgeAreas: response.data.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading knowledge areas:', error);
      setAreasState((prev) => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar áreas de conhecimento',
      }));
    }
  }, [apiClient]);

  // ========================================================================
  // Question Types State
  // ========================================================================

  const [questionTypesState, setQuestionTypesState] =
    useState<QuestionTypesState>({
      questionTypes: [],
      loading: false,
      error: null,
    });

  /**
   * Load question types from API
   */
  const loadQuestionTypes = useCallback(async () => {
    if (!institutionId) {
      setQuestionTypesState((prev) => ({
        ...prev,
        questionTypes: [],
        loading: false,
        error: null,
      }));
      return;
    }

    setQuestionTypesState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await apiClient.get<QuestionTypesApiResponse>(
        `/institutions/${institutionId}/question-types`
      );

      const mappedTypes = response.data.data.questionTypes
        .map(mapQuestionTypeToEnum)
        .filter((type): type is QUESTION_TYPE => type !== null);

      setQuestionTypesState({
        questionTypes: mappedTypes,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading question types:', error);
      setQuestionTypesState((prev) => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar tipos de questões',
      }));
    }
  }, [apiClient, institutionId]);

  // ========================================================================
  // Knowledge Structure State (Topics, Subtopics, Contents)
  // ========================================================================

  const [knowledgeStructure, setKnowledgeStructure] =
    useState<KnowledgeStructureState>({
      topics: [],
      subtopics: [],
      contents: [],
      loading: false,
      error: null,
    });

  const [knowledgeCategories, setKnowledgeCategories] = useState<
    CategoryConfig[]
  >([]);

  const previousSubjectsRef = useRef<string[] | null>(null);

  /**
   * Load topics for given subject IDs
   */
  const loadTopics = useCallback(
    async (subjectIds: string[]) => {
      if (subjectIds.length === 0) {
        setKnowledgeStructure({
          topics: [],
          subtopics: [],
          contents: [],
          loading: false,
          error: null,
        });
        setKnowledgeCategories([]);
        return;
      }

      setKnowledgeStructure((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const response = await apiClient.post<KnowledgeApiResponse>(
          '/knowledge/topics',
          { subjectIds }
        );

        const topics: KnowledgeItem[] = response.data.data.map((topic) => ({
          id: topic.id,
          name: topic.name,
        }));

        setKnowledgeStructure((prev) => ({
          ...prev,
          topics,
          subtopics: [],
          contents: [],
          loading: false,
          error: null,
        }));
      } catch (error) {
        console.error('Erro ao carregar temas:', error);
        setKnowledgeStructure((prev) => ({
          ...prev,
          topics: [],
          subtopics: [],
          contents: [],
          loading: false,
          error: 'Erro ao carregar temas',
        }));
      }
    },
    [apiClient]
  );

  /**
   * Load subtopics for given topic IDs
   */
  const loadSubtopics = useCallback(
    async (topicIds: string[], options: { forceApi?: boolean } = {}) => {
      const { forceApi = false } = options;

      if (topicIds.length === 0 && !forceApi) {
        setKnowledgeStructure((prev) => ({
          ...prev,
          subtopics: [],
          contents: [],
          loading: false,
          error: null,
        }));
        return;
      }

      setKnowledgeStructure((prev) => ({
        ...prev,
        loading: topicIds.length > 0,
        error: null,
      }));

      try {
        const response = await apiClient.post<KnowledgeApiResponse>(
          '/knowledge/subtopics',
          { topicIds }
        );

        const subtopicsMap = new Map<string, KnowledgeItem>();
        for (const subtopic of response.data.data) {
          if (!subtopicsMap.has(subtopic.id)) {
            subtopicsMap.set(subtopic.id, {
              id: subtopic.id,
              name: subtopic.name,
              topicId: topicIds[0],
            });
          }
        }

        const subtopics = Array.from(subtopicsMap.values());

        setKnowledgeStructure((prev) => ({
          ...prev,
          subtopics,
          contents: [],
          loading: false,
        }));
      } catch (error) {
        console.error('Erro ao carregar subtemas:', error);
        setKnowledgeStructure((prev) => ({
          ...prev,
          subtopics: [],
          contents: [],
          loading: false,
        }));
      }
    },
    [apiClient]
  );

  /**
   * Load contents for given subtopic IDs
   */
  const loadContents = useCallback(
    async (subtopicIds: string[]) => {
      if (subtopicIds.length === 0) {
        setKnowledgeStructure((prev) => ({
          ...prev,
          contents: [],
        }));
        return;
      }

      setKnowledgeStructure((prev) => ({ ...prev, loading: true }));

      try {
        const response = await apiClient.post<KnowledgeApiResponse>(
          '/knowledge/contents',
          { subtopicIds }
        );

        const contentsMap = new Map<string, KnowledgeItem>();
        for (const content of response.data.data) {
          if (!contentsMap.has(content.id)) {
            contentsMap.set(content.id, {
              id: content.id,
              name: content.name,
              subtopicId: subtopicIds[0],
            });
          }
        }

        const contents = Array.from(contentsMap.values());

        setKnowledgeStructure((prev) => ({
          ...prev,
          contents,
          loading: false,
        }));
      } catch (error) {
        console.error('Erro ao carregar conteúdos:', error);
        setKnowledgeStructure((prev) => ({
          ...prev,
          contents: [],
          loading: false,
        }));
      }
    },
    [apiClient]
  );

  /**
   * Load topics when subjects change
   */
  useEffect(() => {
    const previousSubjects = previousSubjectsRef.current;
    const subjectsChanged =
      !previousSubjects ||
      previousSubjects.length !== selectedSubjects.length ||
      selectedSubjects.some((id, index) => id !== previousSubjects[index]);

    if (!subjectsChanged) return;

    previousSubjectsRef.current = selectedSubjects;

    if (selectedSubjects.length > 0) {
      loadTopics(selectedSubjects);
      return;
    }

    setKnowledgeStructure({
      topics: [],
      subtopics: [],
      contents: [],
      loading: false,
      error: null,
    });
    setKnowledgeCategories([]);
  }, [selectedSubjects, loadTopics]);

  /**
   * Handle CheckboxGroup category changes
   */
  const handleCategoriesChange = useCallback(
    (updatedCategories: CategoryConfig[]) => {
      const isFirstChange = knowledgeCategories.length === 0;
      const currentTemaCategory = knowledgeCategories.find(
        (c) => c.key === 'tema'
      );
      const currentSubtemaCategory = knowledgeCategories.find(
        (c) => c.key === 'subtema'
      );
      const currentSelectedTopicIds = currentTemaCategory?.selectedIds || [];
      const currentSelectedSubtopicIds =
        currentSubtemaCategory?.selectedIds || [];

      const temaCategory = updatedCategories.find((c) => c.key === 'tema');
      const selectedTopicIds = temaCategory?.selectedIds || [];

      const subtemaCategory = updatedCategories.find(
        (c) => c.key === 'subtema'
      );
      const selectedSubtopicIds = subtemaCategory?.selectedIds || [];

      setKnowledgeCategories(updatedCategories);

      const topicIdsChanged =
        isFirstChange ||
        currentSelectedTopicIds.length !== selectedTopicIds.length ||
        currentSelectedTopicIds.some(
          (id: string) => !selectedTopicIds.includes(id)
        ) ||
        selectedTopicIds.some(
          (id: string) => !currentSelectedTopicIds.includes(id)
        );

      if (topicIdsChanged) {
        loadSubtopics(selectedTopicIds, {
          forceApi: selectedTopicIds.length === 0,
        });
      }

      const subtopicIdsChanged =
        isFirstChange ||
        currentSelectedSubtopicIds.length !== selectedSubtopicIds.length ||
        currentSelectedSubtopicIds.some(
          (id: string) => !selectedSubtopicIds.includes(id)
        ) ||
        selectedSubtopicIds.some(
          (id: string) => !currentSelectedSubtopicIds.includes(id)
        );

      if (subtopicIdsChanged) {
        if (selectedSubtopicIds.length > 0) {
          loadContents(selectedSubtopicIds);
        } else {
          loadContents([]);
        }
      }
    },
    [knowledgeCategories, loadSubtopics, loadContents]
  );

  /**
   * Update knowledge categories when structure changes
   */
  useEffect(() => {
    if (knowledgeStructure.topics.length === 0) {
      setKnowledgeCategories((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        return [];
      });
      return;
    }

    const categories: CategoryConfig[] = [
      {
        key: 'tema',
        label: 'Tema',
        dependsOn: [],
        itens: knowledgeStructure.topics,
        selectedIds: [],
      },
      {
        key: 'subtema',
        label: 'Subtema',
        dependsOn: ['tema'],
        itens: knowledgeStructure.subtopics,
        filteredBy: [{ key: 'tema', internalField: 'topicId' }],
        selectedIds: [],
      },
      {
        key: 'assunto',
        label: 'Assunto',
        dependsOn: ['subtema'],
        itens: knowledgeStructure.contents,
        filteredBy: [{ key: 'subtema', internalField: 'subtopicId' }],
        selectedIds: [],
      },
    ];

    setKnowledgeCategories((prev) =>
      areCategoriesSame(prev, categories)
        ? prev
        : mergeCategoriesWithSelection(prev, categories)
    );
  }, [
    selectedSubjects,
    knowledgeStructure.topics,
    knowledgeStructure.subtopics,
    knowledgeStructure.contents,
  ]);

  /**
   * Get summary of selected knowledge items
   */
  const selectedKnowledgeSummary = useMemo(() => {
    const temaCategory = knowledgeCategories.find((c) => c.key === 'tema');
    const subtemaCategory = knowledgeCategories.find(
      (c) => c.key === 'subtema'
    );
    const assuntoCategory = knowledgeCategories.find(
      (c) => c.key === 'assunto'
    );

    const selectedTopics = mapSelectedNames(
      temaCategory?.selectedIds || [],
      knowledgeStructure.topics
    );

    const selectedSubtopics = mapSelectedNames(
      subtemaCategory?.selectedIds || [],
      knowledgeStructure.subtopics
    );

    const selectedContents = mapSelectedNames(
      assuntoCategory?.selectedIds || [],
      knowledgeStructure.contents
    );

    return {
      topics: selectedTopics,
      subtopics: selectedSubtopics,
      contents: selectedContents,
    };
  }, [knowledgeCategories, knowledgeStructure]);

  /**
   * Check if summary should be enabled (single item scenarios)
   */
  const enableSummary = useMemo(() => {
    return (
      knowledgeStructure.topics.length === 1 ||
      knowledgeStructure.subtopics.length === 1 ||
      knowledgeStructure.contents.length === 1
    );
  }, [knowledgeStructure]);

  // ========================================================================
  // Return
  // ========================================================================

  return {
    // Vestibular Banks
    banks: banksState.banks,
    bankYears: banksState.bankYears,
    loadingBanks: banksState.loading,
    banksError: banksState.error,
    loadBanks,

    // Knowledge Areas
    knowledgeAreas: areasState.knowledgeAreas,
    loadingSubjects: areasState.loading,
    subjectsError: areasState.error,
    loadKnowledgeAreas,

    // Knowledge Structure
    knowledgeStructure,
    knowledgeCategories,
    handleCategoriesChange,
    selectedKnowledgeSummary,
    enableSummary,
    loadTopics,
    loadSubtopics,
    loadContents,

    // Question Types
    questionTypes: questionTypesState.questionTypes,
    loadingQuestionTypes: questionTypesState.loading,
    questionTypesError: questionTypesState.error,
    loadQuestionTypes,
  };
};

/**
 * Create an activity filters data hook with API client injection.
 * @param apiClient - API client instance
 */
export const createUseActivityFiltersData = (apiClient: BaseApiClient) => {
  return (
    options: UseActivityFiltersDataOptions
  ): UseActivityFiltersDataReturn =>
    useActivityFiltersDataImpl(apiClient, options);
};

/**
 * Create a pre-configured activity filters data hook
 * This is a convenience function that returns a hook ready to use
 *
 * @param apiClient - API client instance
 * @returns Pre-configured useActivityFiltersData hook
 *
 * @example
 * // In your app setup
 * import { createActivityFiltersDataHook } from 'analytica-frontend-lib';
 * import api from './services/api';
 *
 * export const useActivityFiltersData = createActivityFiltersDataHook(api);
 *
 * // Then use directly in components
 * const { banks, knowledgeAreas, loadBanks } = useActivityFiltersData({
 *   selectedSubjects: [],
 *   institutionId: 'institution-id',
 * });
 */
export const createActivityFiltersDataHook = (apiClient: BaseApiClient) => {
  return createUseActivityFiltersData(apiClient);
};
