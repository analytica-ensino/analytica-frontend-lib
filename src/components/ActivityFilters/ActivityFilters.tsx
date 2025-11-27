import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Text,
  type CategoryConfig,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  QUESTION_TYPE,
} from '../..';
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
import { QuestionTypeFilter } from './QuestionTypeFilter';
import { BanksFilter } from './BanksFilter';
import { SubjectsFilter } from './SubjectsFilter';
import { KnowledgeStructureFilter } from './KnowledgeStructureFilter';
import { FilterActions } from './FilterActions';

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
