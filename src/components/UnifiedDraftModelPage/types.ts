import type {
  ActivityCategory,
  TypeRoutes,
} from '../TypeSelector/TypeSelector.types';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';

/**
 * User data type for filter options
 */
export interface UserData {
  subTeacherTopicClasses?: Array<{
    subject?: { id: string; name: string };
  }>;
}

/**
 * Pagination data
 */
export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Props for UnifiedDraftModelPage component
 */
export interface UnifiedDraftModelPageProps {
  /** Type of page: drafts or models */
  type: 'drafts' | 'models';
  /** Activity category: ATIVIDADE or PROVA */
  activityCategory: ActivityCategory;
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
  /** Routes configuration for both ATIVIDADE and PROVA */
  routes: Record<ActivityCategory, TypeRoutes>;
}
