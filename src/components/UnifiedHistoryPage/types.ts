import type {
  ActivityCategory,
  ActivityRoutesInput,
  TypeRoutes,
} from '../TypeSelector/TypeSelector.types';
import type { ActivityTableItem } from '../../types/activitiesHistory';
import type { ExamTableItem } from '../../types/examsHistory';
import type { TableParams } from '../TableProvider/TableProvider';
import type { PaginationData } from '../../types/pagination';
import type { BaseApiClient } from '../../types/api';

/**
 * User data type for filter options
 */
export interface UserData {
  userInstitutions?: Array<{
    school?: { id: string; name: string } | null;
    schoolYear?: { id: string; name: string } | null;
    class?: { id: string; name: string } | null;
  }>;
  subTeacherTopicClasses?: Array<{
    subject?: { id: string; name: string } | null;
    class?: { id: string; name: string } | null;
  }>;
}

/**
 * API filter options
 */
export interface ApiFilterOptions {
  schools: Array<{ id: string; name: string }>;
  schoolYears: Array<{ id: string; name: string }>;
  classes: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
}

/**
 * Props for UnifiedHistoryPage component
 */
interface UnifiedHistoryPageBaseProps {
  /** Data to display in table */
  data: ActivityTableItem[] | ExamTableItem[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Pagination data */
  pagination: PaginationData;
  /** API filter options */
  apiFilterOptions: ApiFilterOptions;
  /** Fetch function to call when params change */
  onParamsChange: (params: TableParams) => void;
  /** User data for filter options (optional) */
  userData?: UserData | null;
  /** Image for empty state */
  activityImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Include creator type filter (for managers/gestors) */
  includeCreatorFilter?: boolean;
  /**
   * Logged user id. When provided together with `apiClient` (and category is
   * ATIVIDADE or PRESENCIAL), enables the owner-only delete/edit actions on
   * activities created by this user (row.creatorId === currentUserId).
   */
  currentUserId?: string | null;
  /**
   * API client used to delete an activity (DELETE /activities/:id). Required to
   * enable the delete action; pairs with `currentUserId`.
   */
  apiClient?: BaseApiClient;
}

/**
 * Props for UnifiedHistoryPage.
 *
 * Discriminated by category so a PRESENCIAL page cannot be rendered without its
 * routes: without them, tab, create and row navigation would silently fall back
 * to the ATIVIDADE URLs.
 */
export type UnifiedHistoryPageProps = UnifiedHistoryPageBaseProps &
  (
    | {
        activityCategory: ActivityCategory;
        /**
         * Routes configuration. ATIVIDADE and PROVA are required; passing
         * PRESENCIAL is what adds it to the type selector.
         */
        routes: ActivityRoutesInput;
      }
    | {
        activityCategory: 'PRESENCIAL';
        routes: ActivityRoutesInput & { PRESENCIAL: TypeRoutes };
      }
  );
