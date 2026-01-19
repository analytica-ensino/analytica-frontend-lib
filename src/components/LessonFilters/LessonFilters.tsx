import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Text from '../Text/Text';
import type { BaseApiClient } from '../../types/api';
import { createUseActivityFiltersData } from '../../hooks/useActivityFiltersData';
import type { LessonFiltersData } from '../../types/lessonFilters';
import {
  getSelectedIdsFromCategories,
  toggleSingleValue,
} from '../../utils/activityFilters';
import { areLessonFiltersEqual } from '../../utils/lessonFilters';
import {
  SubjectsFilter,
  KnowledgeStructureFilter,
  FilterActions,
} from '../ActivityFilters/components';
import {
  useInitialFiltersLoader,
  useKnowledgeStructureInitialFilters,
} from '../ActivityFilters/utils';

export interface LessonFiltersProps {
  apiClient: BaseApiClient;
  onFiltersChange: (filters: LessonFiltersData) => void;
  variant?: 'default' | 'popover';
  institutionId?: string | null;
  initialFilters?: LessonFiltersData | null;
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
}

/**
 * LessonFilters component for filtering lessons
 * Manages subjects and knowledge structure selections
 */
export const LessonFilters = ({
  apiClient,
  onFiltersChange,
  variant = 'default',
  institutionId = null,
  initialFilters = null,
  onClearFilters,
  onApplyFilters,
}: LessonFiltersProps) => {
  const useActivityFiltersData = createUseActivityFiltersData(apiClient);

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const {
    knowledgeAreas,
    loadingSubjects,
    subjectsError,
    knowledgeStructure,
    knowledgeCategories,
    handleCategoriesChange,
    loadKnowledgeAreas,
    loadTopics,
    loadSubtopics,
    loadContents,
  } = useActivityFiltersData({
    selectedSubjects: selectedSubject ? [selectedSubject] : [],
    institutionId,
  });

  const hasAppliedBasicInitialFiltersRef = useRef(false);

  // Use shared hook for loading topics/subtopics/contents
  useInitialFiltersLoader({
    initialFilters,
    loadTopics,
    loadSubtopics,
    loadContents,
  });

  // Use shared hook for knowledge structure initial filters
  useKnowledgeStructureInitialFilters({
    initialFilters,
    knowledgeCategories,
    handleCategoriesChange,
  });

  useEffect(() => {
    hasAppliedBasicInitialFiltersRef.current = false;
  }, [initialFilters]);

  useEffect(() => {
    if (!initialFilters || hasAppliedBasicInitialFiltersRef.current) {
      return;
    }

    if (initialFilters.subjectIds && initialFilters.subjectIds.length > 0) {
      setSelectedSubject(initialFilters.subjectIds[0]);
    }

    hasAppliedBasicInitialFiltersRef.current = true;
  }, [initialFilters]);

  useEffect(() => {
    if (loadKnowledgeAreas) {
      loadKnowledgeAreas();
    }
  }, [loadKnowledgeAreas, institutionId]);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(toggleSingleValue(selectedSubject, subjectId));
  };

  const selectedSubjects = useMemo(
    () => (selectedSubject ? [selectedSubject] : []),
    [selectedSubject]
  );

  const getSelectedKnowledgeIds = useCallback(() => {
    return getSelectedIdsFromCategories(knowledgeCategories, {
      topicIds: 'tema',
      subtopicIds: 'subtema',
      contentIds: 'assunto',
    });
  }, [knowledgeCategories]);

  const onFiltersChangeRef = useRef(onFiltersChange);
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  const prevFiltersRef = useRef<LessonFiltersData | null>(null);

  useEffect(() => {
    const knowledgeIds = getSelectedKnowledgeIds();
    const filters: LessonFiltersData = {
      subjectIds: selectedSubjects,
      topicIds: knowledgeIds.topicIds,
      subtopicIds: knowledgeIds.subtopicIds,
      contentIds: knowledgeIds.contentIds,
    };

    if (!areLessonFiltersEqual(prevFiltersRef.current, filters)) {
      prevFiltersRef.current = filters;
      onFiltersChangeRef.current(filters);
    }
  }, [selectedSubjects, knowledgeCategories, getSelectedKnowledgeIds]);

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
            Filtro de aulas
          </Text>
        </section>
      )}

      <div className={contentClassName}>
        <section className="flex flex-col gap-4">
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

          <KnowledgeStructureFilter
            knowledgeStructure={knowledgeStructure}
            knowledgeCategories={knowledgeCategories}
            handleCategoriesChange={handleCategoriesChange}
          />

          {variant === 'popover' && (
            <FilterActions
              onClearFilters={onClearFilters}
              onApplyFilters={onApplyFilters}
            />
          )}
        </section>
      </div>
    </div>
  );
};
