import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import { useLessonFiltersStore } from '../../store/lessonFiltersStore';
import type { BaseApiClient } from '../../types/api';
import { createUseActivityFiltersData } from '../../hooks/useActivityFiltersData';
import type { LessonFiltersData } from '../../types/lessonFilters';
import {
  getSelectedIdsFromCategories,
  toggleArrayItem,
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

  // A recommended class may span several subjects — the backend derives them
  // from the subjects of its lessons and activities.
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

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
    // Tema/subtema/assunto hang off a single subject's knowledge tree, so the
    // structure is only loaded while exactly one subject is selected.
    selectedSubjects: selectedSubjectIds.length === 1 ? selectedSubjectIds : [],
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
      setSelectedSubjectIds(initialFilters.subjectIds);
    }

    hasAppliedBasicInitialFiltersRef.current = true;
  }, [initialFilters]);

  useEffect(() => {
    if (loadKnowledgeAreas) {
      loadKnowledgeAreas();
    }
  }, [loadKnowledgeAreas, institutionId]);

  // Whether every available subject is currently selected — drives the
  // "Todos os componentes curriculares" card's checked state.
  const allSubjectsSelected = useMemo(
    () =>
      knowledgeAreas.length > 0 &&
      knowledgeAreas.every((area) => selectedSubjectIds.includes(area.id)),
    [knowledgeAreas, selectedSubjectIds]
  );

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) => toggleArrayItem(prev, subjectId));
  };

  const handleToggleAllSubjects = () => {
    setSelectedSubjectIds(
      allSubjectsSelected ? [] : knowledgeAreas.map((area) => area.id)
    );
  };

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
      subjectIds: selectedSubjectIds,
      topicIds: knowledgeIds.topicIds,
      subtopicIds: knowledgeIds.subtopicIds,
      contentIds: knowledgeIds.contentIds,
    };

    if (!areLessonFiltersEqual(prevFiltersRef.current, filters)) {
      prevFiltersRef.current = filters;
      onFiltersChangeRef.current(filters);
    }
  }, [selectedSubjectIds, knowledgeCategories, getSelectedKnowledgeIds]);

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
                Componente curricular
              </Text>
              {selectedSubjectIds.length > 0 && (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setSelectedSubjectIds([])}
                  size="small"
                >
                  Limpar
                </Button>
              )}
            </div>
            <SubjectsFilter
              knowledgeAreas={knowledgeAreas}
              selectedSubjectIds={selectedSubjectIds}
              onToggleSubject={handleToggleSubject}
              showAllSubjectsOption
              allSubjectsSelected={allSubjectsSelected}
              onToggleAllSubjects={handleToggleAllSubjects}
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

export interface LessonFiltersPopoverProps extends Omit<
  LessonFiltersProps,
  'variant'
> {
  triggerLabel?: string;
  /** Rendered before the trigger label. Required for `collapseTriggerLabel`. */
  triggerIcon?: ReactNode;
  /**
   * Hides the trigger label below 520px, leaving just the icon, so the trigger
   * can share a row with other controls on a phone. `triggerLabel` stays as the
   * button's accessible name.
   */
  collapseTriggerLabel?: boolean;
}

/**
 * LessonFiltersPopover component
 * Wraps LessonFilters in a DropdownMenu triggered by a Button. Closes itself
 * once the filters are applied.
 * @param props - Component props
 * @returns Popover JSX element
 */
export const LessonFiltersPopover = ({
  triggerLabel = 'Filtro de aulas',
  triggerIcon,
  collapseTriggerLabel = false,
  initialFilters,
  onApplyFilters,
  ...lessonFiltersProps
}: LessonFiltersPopoverProps) => {
  const [open, setOpen] = useState(false);
  const appliedFilters = useLessonFiltersStore((state) => state.appliedFilters);

  // Use appliedFilters from store if available, otherwise fall back to initialFilters
  const effectiveInitialFilters = appliedFilters ?? initialFilters;

  const handleApplyFilters = () => {
    onApplyFilters?.();
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {/*
          The icon lives in `children` rather than in `iconLeft` because
          `iconLeft` adds an unconditional `mr-2`, which would leave a dangling
          margin once the label is hidden.
        */}
        <Button
          variant="outline"
          size="small"
          aria-label={triggerLabel}
          className={collapseTriggerLabel ? 'px-3 min-[520px]:px-4' : undefined}
        >
          <span className="flex flex-row items-center gap-2">
            {triggerIcon}
            <span
              className={
                collapseTriggerLabel ? 'hidden min-[520px]:inline' : undefined
              }
            >
              {triggerLabel}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[90vw] max-w-[400px] max-h-[calc(100vh-8rem)] overflow-y-auto p-0"
        align="start"
      >
        <LessonFilters
          variant="popover"
          {...lessonFiltersProps}
          initialFilters={effectiveInitialFilters}
          onApplyFilters={handleApplyFilters}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
