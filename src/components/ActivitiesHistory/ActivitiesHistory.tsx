import { useState } from 'react';
import Text from '../Text/Text';
import { Menu, MenuItem, MenuContent } from '../Menu/Menu';
import { HistoryTab } from './tabs/HistoryTab';
import { ModelsTab } from './tabs/ModelsTab';
import { DraftsTab } from './tabs/DraftsTab';
import type { SubjectEnum } from '../../enums/SubjectEnum';
import type {
  ActivityTableItem,
  ActivityHistoryFilters,
  ActivitiesHistoryApiResponse,
  ActivityUserFilterData,
  ActivityModelTableItem,
  ActivityModelFilters,
  ActivityModelsApiResponse,
} from '../../types/activitiesHistory';

/**
 * Enum for page tabs
 */
enum PageTab {
  HISTORY = 'history',
  DRAFTS = 'drafts',
  MODELS = 'models',
}

/**
 * Page titles based on active tab
 */
const PAGE_TITLES: Record<PageTab, string> = {
  [PageTab.HISTORY]: 'Histórico de atividades',
  [PageTab.DRAFTS]: 'Rascunhos',
  [PageTab.MODELS]: 'Modelos de atividades',
};

/**
 * Props for the ActivitiesHistory component
 */
export interface ActivitiesHistoryProps {
  /** Function to fetch activities history from API */
  fetchActivitiesHistory: (
    filters?: ActivityHistoryFilters
  ) => Promise<ActivitiesHistoryApiResponse>;
  /** Function to fetch activity models from API */
  fetchActivityModels: (
    filters?: ActivityModelFilters
  ) => Promise<ActivityModelsApiResponse>;
  /** Function to delete an activity model */
  deleteActivityModel: (id: string) => Promise<void>;
  /** Callback when create activity button is clicked */
  onCreateActivity: () => void;
  /** Callback when create model button is clicked */
  onCreateModel: () => void;
  /** Callback when a history row is clicked */
  onRowClick: (row: ActivityTableItem) => void;
  /** Callback when send activity button is clicked on a model */
  onSendActivity?: (model: ActivityModelTableItem) => void;
  /** Callback when edit model button is clicked */
  onEditModel?: (model: ActivityModelTableItem) => void;
  /** Image for empty state */
  emptyStateImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
  /** User data for populating filter options */
  userFilterData?: ActivityUserFilterData;
  /**
   * Map of subject IDs to names for models display.
   * IMPORTANT: This Map should be memoized with useMemo in the parent component
   * to avoid unnecessary re-fetches when the MODELS tab is active.
   * @example
   * const subjectsMap = useMemo(() => {
   *   const map = new Map();
   *   subjects.forEach(s => map.set(s.id, s.name));
   *   return map;
   * }, [subjects]);
   */
  subjectsMap?: Map<string, string>;
}

/**
 * ActivitiesHistory component
 * Displays activities history with tabs for history, drafts, and models.
 * Each tab is an independent component that manages its own state and data fetching.
 */
export const ActivitiesHistory = ({
  fetchActivitiesHistory,
  fetchActivityModels,
  deleteActivityModel,
  onCreateActivity,
  onCreateModel,
  onRowClick,
  onSendActivity,
  onEditModel,
  emptyStateImage,
  noSearchImage,
  mapSubjectNameToEnum,
  userFilterData,
  subjectsMap,
}: ActivitiesHistoryProps) => {
  const [activeTab, setActiveTab] = useState<PageTab>(PageTab.HISTORY);

  return (
    <div
      data-testid="activities-history"
      className="flex flex-col w-full h-auto relative justify-center items-center mb-5 overflow-hidden"
    >
      {/* Background decoration */}
      <span className="absolute top-0 left-0 h-[150px] w-full z-0" />

      {/* Main container */}
      <div className="flex flex-col w-full h-full max-w-[1350px] mx-auto z-10 lg:px-0 px-4 pt-4 sm:pt-0">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row w-full mb-6 items-start sm:items-center sm:justify-between gap-0 sm:gap-4">
          {/* Page Title */}
          <Text
            as="h1"
            weight="bold"
            className="leading-[28px] tracking-[0.2px] text-xl lg:text-2xl"
          >
            {PAGE_TITLES[activeTab]}
          </Text>

          {/* Tabs Menu */}
          <div className="flex-shrink-0 lg:w-auto self-center sm:self-auto">
            <Menu
              defaultValue={PageTab.HISTORY}
              value={activeTab}
              onValueChange={(value: string) => setActiveTab(value as PageTab)}
              variant="menu2"
              className="bg-transparent shadow-none px-0"
            >
              <MenuContent
                variant="menu2"
                className="w-full lg:w-auto max-w-full min-w-0"
              >
                <MenuItem
                  variant="menu2"
                  value={PageTab.HISTORY}
                  data-testid="menu-item-history"
                  className="whitespace-nowrap flex-1 lg:flex-none"
                >
                  Histórico
                </MenuItem>
                <MenuItem
                  variant="menu2"
                  value={PageTab.DRAFTS}
                  data-testid="menu-item-drafts"
                  className="whitespace-nowrap flex-1 lg:flex-none"
                >
                  Rascunhos
                </MenuItem>
                <MenuItem
                  variant="menu2"
                  value={PageTab.MODELS}
                  data-testid="menu-item-models"
                  className="whitespace-nowrap flex-1 lg:flex-none"
                >
                  Modelos
                </MenuItem>
              </MenuContent>
            </Menu>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col items-center w-full min-h-0 flex-1">
          {activeTab === PageTab.HISTORY && (
            <HistoryTab
              fetchActivitiesHistory={fetchActivitiesHistory}
              onCreateActivity={onCreateActivity}
              onRowClick={onRowClick}
              emptyStateImage={emptyStateImage}
              noSearchImage={noSearchImage}
              mapSubjectNameToEnum={mapSubjectNameToEnum}
              userFilterData={userFilterData}
            />
          )}

          {activeTab === PageTab.DRAFTS && <DraftsTab />}

          {activeTab === PageTab.MODELS && (
            <ModelsTab
              fetchActivityModels={fetchActivityModels}
              deleteActivityModel={deleteActivityModel}
              onCreateModel={onCreateModel}
              onSendActivity={onSendActivity}
              onEditModel={onEditModel}
              emptyStateImage={emptyStateImage}
              noSearchImage={noSearchImage}
              mapSubjectNameToEnum={mapSubjectNameToEnum}
              userFilterData={userFilterData}
              subjectsMap={subjectsMap}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesHistory;
