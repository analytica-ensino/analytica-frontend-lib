import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Radio from '../Radio/Radio';
import IconRender from '../IconRender/IconRender';
import { useTheme } from '../../hooks/useTheme';
import {
  CheckboxGroup,
  type CategoryConfig,
} from '../CheckBoxGroup/CheckBoxGroup';
import { getSubjectColorWithOpacity } from '../../utils/utils';
import type { BaseApiClient } from '../../types/api';
import { createUseActivityFiltersData } from '../../hooks/useActivityFiltersData';
import type {
  KnowledgeArea,
  KnowledgeStructureState,
} from '../../types/activityFilters';
import type { LessonFiltersData } from '../../types/lessonFilters';
import {
  getSelectedIdsFromCategories,
  toggleSingleValue,
} from '../../utils/activityFilters';
import { areLessonFiltersEqual } from '../../utils/lessonFilters';

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
  const hasAppliedKnowledgeInitialFiltersRef = useRef(false);
  const hasRequestedTopicsRef = useRef(false);
  const hasRequestedSubtopicsRef = useRef(false);
  const hasRequestedContentsRef = useRef(false);
  const hasAppliedTopicsRef = useRef(false);
  const hasAppliedSubtopicsRef = useRef(false);
  const hasAppliedContentsRef = useRef(false);
  const knowledgeCategoriesRef = useRef<CategoryConfig[]>([]);

  useEffect(() => {
    knowledgeCategoriesRef.current = knowledgeCategories;
  }, [knowledgeCategories]);

  useEffect(() => {
    hasAppliedBasicInitialFiltersRef.current = false;
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

    if (initialFilters.subjectIds && initialFilters.subjectIds.length > 0) {
      setSelectedSubject(initialFilters.subjectIds[0]);
    }

    hasAppliedBasicInitialFiltersRef.current = true;
  }, [initialFilters]);

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

          <FilterActions
            onClearFilters={onClearFilters}
            onApplyFilters={onApplyFilters}
          />
        </section>
      </div>
    </div>
  );
};
