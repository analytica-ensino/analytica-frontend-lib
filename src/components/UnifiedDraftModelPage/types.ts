import type {
  ActivityCategory,
  ActivityRoutesInput,
  TypeRoutes,
} from '../TypeSelector/TypeSelector.types';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';
import type { PaginationData } from '../../types/pagination';

/**
 * User data type for filter options
 */
export interface UserData {
  subTeacherTopicClasses?: Array<{
    subject?: { id: string; name: string };
  }>;
}

/**
 * Props for UnifiedDraftModelPage component
 */
interface UnifiedDraftModelPageBaseProps {
  /** Type of page: drafts or models */
  type: 'drafts' | 'models';
  /** Data to display in table */
  data: ActivityModelTableItem[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Pagination data */
  pagination: PaginationData;
  /** Delete function */
  onDelete: (id: string) => Promise<void> | Promise<boolean>;
  /** Send function (optional) */
  onSend?: (row: ActivityModelTableItem) => void;
  /** Fetch function to call when params change */
  onParamsChange: (params: {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
  }) => void;
  /** User data for filter options (optional) */
  userData?: UserData | null;
  /** Image for empty state */
  activityImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
}

/**
 * Props for UnifiedDraftModelPage.
 *
 * Discriminated by category so a PRESENCIAL page cannot be rendered without its
 * routes: without them, tab, create and row navigation would silently fall back
 * to the ATIVIDADE URLs.
 */
export type UnifiedDraftModelPageProps = UnifiedDraftModelPageBaseProps &
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
