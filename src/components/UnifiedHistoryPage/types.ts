import type {
  ActivityCategory,
  TypeRoutes,
} from '../TypeSelector/TypeSelector.types';
import type { ActivityTableItem } from '../../types/activitiesHistory';
import type { ExamTableItem } from '../../types/examsHistory';
import type { TableParams } from '../TableProvider/TableProvider';

/**
 * User data type for filter options
 */
export interface UserData {
  userInstitutions?: Array<{
    school?: { id: string; name: string };
    schoolYear?: { id: string; name: string };
    class?: { id: string; name: string };
  }>;
  subTeacherTopicClasses?: Array<{
    subject?: { id: string; name: string };
    class?: { id: string; name: string };
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
 * Pagination data
 */
export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Props for UnifiedHistoryPage component
 */
export interface UnifiedHistoryPageProps {
  /** Activity category: ATIVIDADE or PROVA */
  activityCategory: ActivityCategory;
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
  /** Routes configuration for both ATIVIDADE and PROVA */
  routes: Record<ActivityCategory, TypeRoutes>;
}
