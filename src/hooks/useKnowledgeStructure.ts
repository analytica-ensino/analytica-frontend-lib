import { useState, useEffect, useCallback, useMemo } from 'react';
import type { BaseApiClient } from '../types/api';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import type {
  KnowledgeItem,
  KnowledgeStructureState,
} from '../types/activityFilters';

/**
 * API response format for knowledge endpoints
 */
interface KnowledgeApiResponse {
  message: string;
  data: Array<{ id: string; name: string }>;
}

/**
 * Return type for the useKnowledgeStructure hook
 */
export interface UseKnowledgeStructureReturn {
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
  loadSubtopics: (topicIds: string[]) => Promise<void>;
  loadContents: (subtopicIds: string[]) => Promise<void>;
}

/**
 * Create a knowledge structure hook with API client injection
 * This hook manages topics, subtopics, and contents for filtering
 *
 * @param apiClient - API client instance for knowledge structure
 * @returns Hook factory that accepts selectedSubjects
 *
 * @example
 * // In your app setup
 * import { createUseKnowledgeStructure } from 'analytica-frontend-lib';
 * import api from './services/api';
 *
 * export const useKnowledgeStructure = createUseKnowledgeStructure(api);
 *
 * // Then use in components
 * const { knowledgeStructure, loadTopics } = useKnowledgeStructure(['subject-id']);
 */
export const createUseKnowledgeStructure = (apiClient: BaseApiClient) => {
  return (selectedSubjects: string[]): UseKnowledgeStructureReturn => {
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
      async (topicIds: string[]) => {
        if (topicIds.length === 0) {
          setKnowledgeStructure((prev) => ({
            ...prev,
            subtopics: [],
            contents: [],
          }));
          return;
        }

        setKnowledgeStructure((prev) => ({ ...prev, loading: true }));

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
      if (selectedSubjects.length > 0) {
        loadTopics(selectedSubjects);
      } else {
        setKnowledgeStructure({
          topics: [],
          subtopics: [],
          contents: [],
          loading: false,
          error: null,
        });
        setKnowledgeCategories([]);
      }
    }, [selectedSubjects, loadTopics]);

    /**
     * Handle CheckboxGroup category changes
     */
    const handleCategoriesChange = useCallback(
      (updatedCategories: CategoryConfig[]) => {
        // Get current selected IDs before updating
        const currentTemaCategory = knowledgeCategories.find(
          (c) => c.key === 'tema'
        );
        const currentSubtemaCategory = knowledgeCategories.find(
          (c) => c.key === 'subtema'
        );
        const currentSelectedTopicIds = currentTemaCategory?.selectedIds || [];
        const currentSelectedSubtopicIds =
          currentSubtemaCategory?.selectedIds || [];

        setKnowledgeCategories(updatedCategories);

        const temaCategory = updatedCategories.find((c) => c.key === 'tema');
        const selectedTopicIds = temaCategory?.selectedIds || [];

        const subtemaCategory = updatedCategories.find(
          (c) => c.key === 'subtema'
        );
        const selectedSubtopicIds = subtemaCategory?.selectedIds || [];

        const topicIdsChanged =
          currentSelectedTopicIds.length !== selectedTopicIds.length ||
          currentSelectedTopicIds.some(
            (id: string) => !selectedTopicIds.includes(id)
          ) ||
          selectedTopicIds.some(
            (id: string) => !currentSelectedTopicIds.includes(id)
          );

        if (topicIdsChanged) {
          if (selectedTopicIds.length > 0) {
            loadSubtopics(selectedTopicIds);
          } else {
            loadSubtopics([]);
          }
        }

        const subtopicIdsChanged =
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
      if (
        selectedSubjects.length === 0 ||
        knowledgeStructure.topics.length === 0
      ) {
        setKnowledgeCategories([]);
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

      setKnowledgeCategories((prev) => {
        if (prev.length === 0) {
          return categories;
        }

        return categories.map((category) => {
          const prevCategory = prev.find((c) => c.key === category.key);
          if (!prevCategory) {
            return category;
          }

          const prevItemIds = new Set(
            (prevCategory.itens || []).map((item: { id: string }) => item.id)
          );
          const currentItemIds = new Set(
            (category.itens || []).map((item: { id: string }) => item.id)
          );
          const itemsChanged =
            prevItemIds.size !== currentItemIds.size ||
            Array.from(currentItemIds as Set<string>).some(
              (id: string) => !prevItemIds.has(id)
            );

          if (!itemsChanged) {
            return prevCategory;
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
      });
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

      const selectedTopics = (temaCategory?.selectedIds || [])
        .map((id: string) => {
          const topic = knowledgeStructure.topics.find((t) => t.id === id);
          return topic ? topic.name : null;
        })
        .filter((name: string | null) => name !== null) as string[];

      const selectedSubtopics = (subtemaCategory?.selectedIds || [])
        .map((id: string) => {
          const subtopic = knowledgeStructure.subtopics.find(
            (s) => s.id === id
          );
          return subtopic ? subtopic.name : null;
        })
        .filter((name: string | null) => name !== null) as string[];

      const selectedContents = (assuntoCategory?.selectedIds || [])
        .map((id: string) => {
          const content = knowledgeStructure.contents.find((c) => c.id === id);
          return content ? content.name : null;
        })
        .filter((name: string | null) => name !== null) as string[];

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

    return {
      knowledgeStructure,
      knowledgeCategories,
      handleCategoriesChange,
      selectedKnowledgeSummary,
      enableSummary,
      loadTopics,
      loadSubtopics,
      loadContents,
    };
  };
};

/**
 * Create a pre-configured knowledge structure hook
 * This is a convenience function that returns a hook ready to use
 *
 * @param apiClient - API client instance for knowledge structure
 * @returns Pre-configured useKnowledgeStructure hook
 *
 * @example
 * // In your app setup
 * import { createKnowledgeStructureHook } from 'analytica-frontend-lib';
 * import api from './services/api';
 *
 * export const useKnowledgeStructure = createKnowledgeStructureHook(api);
 *
 * // Then use directly in components
 * const { knowledgeStructure, loadTopics } = useKnowledgeStructure(['subject-id']);
 */
export const createKnowledgeStructureHook = (apiClient: BaseApiClient) => {
  return createUseKnowledgeStructure(apiClient);
};

