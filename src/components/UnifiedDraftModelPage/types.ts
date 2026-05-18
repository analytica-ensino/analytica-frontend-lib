import type { ActivityCategory, TypeRoutes } from '../../types/activities';

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
 * Props for UnifiedDraftModelPage component
 */
export interface UnifiedDraftModelPageProps {
  /** Type of page: drafts or models */
  type: 'drafts' | 'models';
  /** Activity category: ATIVIDADE or PROVA */
  activityCategory: ActivityCategory;
  /** User data for filter options (optional) */
  userData?: UserData | null;
  /** Image for empty state */
  activityImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Routes configuration */
  routes: TypeRoutes;
}
