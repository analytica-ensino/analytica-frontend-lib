/**
 * Activity Types
 *
 * General activity types used across applications.
 * For history-specific types, see activitiesHistory.ts
 * For drafts and models types, see activitiesHistory.ts
 */

/**
 * Activity status types for activities
 */
export enum ActivityStatus {
  MODELO = 'MODELO',
  NAO_INICIADA = 'NAO_INICIADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
}

/**
 * Activity filter types for activity list
 */
export enum ActivityFilter {
  NEAR = 'NEAR',
  CONCLUDED = 'CONCLUDED',
}

/**
 * Calendar activity status types
 */
export enum CalendarActivityStatus {
  NEAR_DEADLINE = 'near-deadline',
  OVERDUE = 'overdue',
  IN_DEADLINE = 'in-deadline',
}

/**
 * Activity data interface
 */
export interface Activity {
  id: string;
  title: string;
  status: ActivityStatus;
  finalDate?: string;
  createdAt: string;
  type: string;
}

/**
 * Calendar activity data interface
 */
export interface CalendarActivity {
  id: string;
  status: CalendarActivityStatus;
  title?: string;
}

/**
 * Activity response from backend API
 */
export interface ActivityResponse {
  id: string;
  creatorUserId: string | null;
  createdBySys: boolean;
  title: string;
  type: string;
  subtype: string | null;
  difficulty: string | null;
  notification: string | null;
  status: string;
  startDate: string | null;
  finalDate: string | null;
  canRetry: boolean;
  subjectId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Calendar activities API response
 */
export interface CalendarActivitiesResponse {
  message: string;
  data: {
    nextActivities: ActivityResponse[];
    pastActivities: ActivityResponse[];
  };
}
