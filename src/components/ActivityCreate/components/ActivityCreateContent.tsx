import {
  ActivityFilters,
  ActivityFiltersPopover,
  ActivityPreview,
  Button,
  SkeletonText,
  QUESTION_TYPE,
  Divider,
} from '../../..';
import { FunnelIcon } from '@phosphor-icons/react/dist/csr/Funnel';
import Menu, { MenuContent, MenuItem } from '../../Menu/Menu';
import { ActivityListQuestions } from '../../ActivityListQuestions/ActivityListQuestions';
import type {
  ActivityFiltersData,
  BaseApiClient,
  PreviewQuestion,
  QuestionActivity as Question,
} from '../../..';

interface LoadingSkeletonProps {
  className?: string;
}

/**
 * Loading skeleton for activity preview
 */
export const LoadingSkeleton = ({ className }: LoadingSkeletonProps) => (
  <div className={`flex flex-col gap-4 p-4 ${className || ''}`}>
    <div className="flex flex-col gap-2">
      <SkeletonText lines={1} width={200} />
      <SkeletonText lines={1} width={150} />
    </div>
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded">
          <SkeletonText lines={2} />
        </div>
      ))}
    </div>
  </div>
);

interface SmallScreenLayoutProps {
  apiClient: BaseApiClient;
  institutionId: string;
  isDark: boolean;
  selectedView: 'questions' | 'preview';
  onViewChange: (view: 'questions' | 'preview') => void;
  initialFiltersData: ActivityFiltersData | null;
  onFiltersChange: (filters: ActivityFiltersData) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onAddQuestion: (question: Question) => void;
  addedQuestionIds: string[];
  enableExamMode: boolean;
  isInPersonExam: boolean;
  loadingInitialQuestions: boolean;
  questions: PreviewQuestion[];
  onRemoveAll: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onReorder: (questions: PreviewQuestion[]) => void;
  filtersKey?: number;
  /**
   * Scopes the question bank to one institution. Only needed by a SUPER_ADMIN
   * (no institution in the session) building an exam for a given institution;
   * see `ActivityListQuestions.institutionId`.
   */
  questionsInstitutionId?: string;
}

/**
 * Small screen layout for activity creation (<= 1200px)
 */
export const SmallScreenLayout = ({
  apiClient,
  institutionId,
  isDark,
  selectedView,
  onViewChange,
  initialFiltersData,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  onAddQuestion,
  addedQuestionIds,
  enableExamMode,
  isInPersonExam,
  loadingInitialQuestions,
  questions,
  onRemoveAll,
  onRemoveQuestion,
  onReorder,
  filtersKey = 0,
  questionsInstitutionId,
}: SmallScreenLayoutProps) => (
  <div className="flex flex-col w-full flex-1 overflow-hidden gap-5 min-h-0">
    {/*
      Filters and Menu Row — the trigger and the tabs always share this line.
      Neither shrinks; instead the trigger drops its label below 520px and
      becomes the funnel icon alone, which is what buys back the room.
    */}
    <div className="flex flex-row items-center justify-between gap-2 flex-shrink-0 min-[520px]:gap-4">
      <div className="flex-shrink-0">
        <ActivityFiltersPopover
          key={filtersKey}
          apiClient={apiClient}
          institutionId={institutionId}
          onFiltersChange={onFiltersChange}
          initialFilters={initialFiltersData || undefined}
          triggerLabel="Filtro de questões"
          triggerIcon={<FunnelIcon size={20} />}
          collapseTriggerLabel
          onApplyFilters={onApplyFilters}
          onClearFilters={onClearFilters}
          allowedQuestionTypes={
            isInPersonExam ? [QUESTION_TYPE.ALTERNATIVA] : undefined
          }
        />
      </div>
      {/*
        Must not shrink: the breadcrumb Menu applies `flex-wrap` to its own
        items (Menu.tsx:170), so squeezing this box makes the two tabs stack
        into a second line instead of the row staying intact.
      */}
      <div className="flex-shrink-0">
        <Menu
          defaultValue="questions"
          value={selectedView}
          onValueChange={(value) =>
            onViewChange(value as 'questions' | 'preview')
          }
          variant="breadcrumb"
        >
          <MenuContent variant="breadcrumb">
            <MenuItem value="questions" variant="breadcrumb">
              Banco de questões
            </MenuItem>
            <MenuItem value="preview" variant="breadcrumb">
              {enableExamMode ? 'Prévia da prova' : 'Prévia da atividade'}
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>

    {/* Content Area - Single Column */}
    <div className="flex-1 min-w-0 relative">
      {selectedView === 'questions' ? (
        <div className="absolute inset-0 overflow-hidden">
          <ActivityListQuestions
            apiClient={apiClient}
            onAddQuestion={onAddQuestion}
            addedQuestionIds={addedQuestionIds}
            enableExamMode={enableExamMode}
            institutionId={questionsInstitutionId}
          />
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden">
          {loadingInitialQuestions ? (
            <LoadingSkeleton />
          ) : (
            <ActivityPreview
              questions={questions}
              onRemoveAll={onRemoveAll}
              onRemoveQuestion={onRemoveQuestion}
              onReorder={onReorder}
              isDark={isDark}
              className="h-full overflow-y-auto"
            />
          )}
        </div>
      )}
    </div>
  </div>
);

interface DesktopLayoutProps {
  apiClient: BaseApiClient;
  institutionId: string;
  isDark: boolean;
  initialFiltersData: ActivityFiltersData | null;
  draftFilters: ActivityFiltersData | null;
  onFiltersChange: (filters: ActivityFiltersData) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onAddQuestion: (question: Question) => void;
  addedQuestionIds: string[];
  enableExamMode: boolean;
  isInPersonExam: boolean;
  loadingInitialQuestions: boolean;
  questions: PreviewQuestion[];
  onRemoveAll: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onReorder: (questions: PreviewQuestion[]) => void;
  filtersKey?: number;
  /** See `SmallScreenLayoutProps.questionsInstitutionId`. */
  questionsInstitutionId?: string;
}

/**
 * Desktop layout for activity creation (> 1200px)
 */
export const DesktopLayout = ({
  apiClient,
  institutionId,
  isDark,
  initialFiltersData,
  draftFilters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  onAddQuestion,
  addedQuestionIds,
  enableExamMode,
  isInPersonExam,
  loadingInitialQuestions,
  questions,
  onRemoveAll,
  onRemoveQuestion,
  onReorder,
  filtersKey = 0,
  questionsInstitutionId,
}: DesktopLayoutProps) => (
  <div className="flex flex-row w-full flex-1 overflow-hidden gap-5 min-h-0">
    {/* First Column - Filters */}
    {/*
      overflow-clip (not overflow-hidden): an overflow-hidden box is still a
      scroll container, so when a descendant (accordion/checkbox) receives focus
      while the content transiently overflows, the browser scrolls this box via
      scrollIntoView. With no scrollbar the user can't scroll back and the filter
      appears blank until a zoom forces a reflow. overflow-clip clips identically
      but never becomes scrollable, so the offset can't get stuck.
    */}
    <div className="flex flex-col gap-3 overflow-clip h-full min-h-0 max-h-full relative w-[400px] flex-shrink-0">
      <div className="flex flex-col overflow-y-auto overflow-x-hidden flex-1 min-h-0 max-h-full">
        <ActivityFilters
          key={filtersKey}
          apiClient={apiClient}
          institutionId={institutionId}
          variant={'default'}
          onFiltersChange={onFiltersChange}
          initialFilters={initialFiltersData || undefined}
          allowedQuestionTypes={
            isInPersonExam ? [QUESTION_TYPE.ALTERNATIVA] : undefined
          }
        />
      </div>
      <div className="flex-shrink-0 grid grid-cols-2 gap-2">
        <Button size="medium" variant="link" onClick={onClearFilters}>
          Limpar filtros
        </Button>
        <Button
          size="medium"
          variant="outline"
          onClick={onApplyFilters}
          disabled={!draftFilters}
        >
          Filtrar
        </Button>
      </div>
    </div>

    <Divider orientation="vertical" />

    {/* Second Column - Center, fills remaining space */}
    <div className="flex-1 min-w-0 relative">
      <div className="absolute inset-0 overflow-hidden">
        <ActivityListQuestions
          apiClient={apiClient}
          onAddQuestion={onAddQuestion}
          addedQuestionIds={addedQuestionIds}
          enableExamMode={enableExamMode}
          institutionId={questionsInstitutionId}
        />
      </div>
    </div>

    <Divider orientation="vertical" />

    {/* Third Column - Activity Preview */}
    <div className="w-[400px] flex-shrink-0 overflow-hidden h-full min-h-0">
      {loadingInitialQuestions ? (
        <LoadingSkeleton />
      ) : (
        <ActivityPreview
          questions={questions}
          onRemoveAll={onRemoveAll}
          onRemoveQuestion={onRemoveQuestion}
          onReorder={onReorder}
          isDark={isDark}
          className="h-full overflow-y-auto"
        />
      )}
    </div>
  </div>
);
