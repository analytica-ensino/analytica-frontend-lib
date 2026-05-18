import type { ActivityCategory, TypeRoutes } from '../../types/activities';

/**
 * User data type for filter options
 * Apps can pass their own user data structure
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
 * Props for UnifiedHistoryPage component
 */
export interface UnifiedHistoryPageProps {
  /** Activity category: ATIVIDADE or PROVA */
  activityCategory: ActivityCategory;
  /** User data for filter options (optional) */
  userData?: UserData | null;
  /** Image for empty state */
  activityImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Include creator type filter (for managers/gestors) */
  includeCreatorFilter?: boolean;
  /** Routes configuration */
  routes: TypeRoutes;
}
