import { useEffect, useRef } from 'react';
import type { CategoryConfig } from '../../CheckBoxGroup/CheckBoxGroup';

export interface UseKnowledgeStructureInitialFiltersParams {
  initialFilters: {
    topicIds?: string[];
    subtopicIds?: string[];
    contentIds?: string[];
  } | null;
  knowledgeCategories: CategoryConfig[];
  handleCategoriesChange?: (updatedCategories: CategoryConfig[]) => void;
}

/**
 * Hook to handle applying initial knowledge structure filters (topics, subtopics, contents)
 * @param params - Parameters for the hook
 * @returns Refs to track application state
 */
export const useKnowledgeStructureInitialFilters = ({
  initialFilters,
  knowledgeCategories,
  handleCategoriesChange,
}: UseKnowledgeStructureInitialFiltersParams) => {
  const hasAppliedKnowledgeInitialFiltersRef = useRef(false);
  const hasAppliedTopicsRef = useRef(false);
  const hasAppliedSubtopicsRef = useRef(false);
  const hasAppliedContentsRef = useRef(false);
  const knowledgeCategoriesRef = useRef<CategoryConfig[]>([]);

  useEffect(() => {
    knowledgeCategoriesRef.current = knowledgeCategories;
  }, [knowledgeCategories]);

  useEffect(() => {
    hasAppliedKnowledgeInitialFiltersRef.current = false;
    hasAppliedTopicsRef.current = false;
    hasAppliedSubtopicsRef.current = false;
    hasAppliedContentsRef.current = false;
  }, [initialFilters]);

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
        const selectedIds = (category.itens || [])
          .filter((item) => topicIds.includes(item.id))
          .map((item) => item.id);
        if (selectedIds.length > 0) {
          hasAppliedTopicsRef.current = true;
          changed = true;
          return { ...category, selectedIds };
        }
        return category;
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
          hasAppliedSubtopicsRef.current = true;
          changed = true;
          return { ...category, selectedIds };
        }
        return category;
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
          hasAppliedContentsRef.current = true;
          changed = true;
          return { ...category, selectedIds };
        }
        return category;
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

  return {
    hasAppliedKnowledgeInitialFiltersRef,
    hasAppliedTopicsRef,
    hasAppliedSubtopicsRef,
    hasAppliedContentsRef,
    knowledgeCategoriesRef,
  };
};
