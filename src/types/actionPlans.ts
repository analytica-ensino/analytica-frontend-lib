/**
 * Types of the action plans (AE-3366), as the backend answers them
 * (`/action-plans`, AE-3363).
 */

/** Where a plan stands. "Late" is not a status: the backend computes it. */
export const ACTION_PLAN_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CANCELED: 'CANCELED',
} as const;

export type ActionPlanStatus =
  (typeof ACTION_PLAN_STATUS)[keyof typeof ACTION_PLAN_STATUS];

/** Every status, in the order the screens list them. */
export const ACTION_PLAN_STATUSES: readonly ActionPlanStatus[] = [
  ACTION_PLAN_STATUS.NOT_STARTED,
  ACTION_PLAN_STATUS.IN_PROGRESS,
  ACTION_PLAN_STATUS.DONE,
  ACTION_PLAN_STATUS.CANCELED,
];

/**
 * Whose plans the list shows: the caller's as responsible or the ones they
 * created. The backend also has a managers' `schools` tab, which the Figma
 * does not use.
 */
export const ACTION_PLAN_LIST_TAB = {
  RESPONSIBLE: 'responsible',
  CREATED: 'created',
} as const;

export type ActionPlanListTab =
  (typeof ACTION_PLAN_LIST_TAB)[keyof typeof ACTION_PLAN_LIST_TAB];

/** Columns the list sorts by. */
export const ACTION_PLAN_SORT = {
  DEADLINE: 'deadline',
  SCHOOL: 'school',
  STATUS: 'status',
  RESPONSIBLE: 'responsible',
} as const;

/** What one history entry records. */
export const ACTION_PLAN_EVENT_TYPE = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  RESPONSIBLE_CHANGED: 'RESPONSIBLE_CHANGED',
} as const;

/** The fields an edit changes, as the history names them. */
export const ACTION_PLAN_FIELD = {
  TITLE: 'title',
  DESCRIPTION: 'description',
  DEADLINE: 'deadline',
} as const;

/** Size limits of the texts a plan keeps (same as the backend). */
export const ACTION_PLAN_LIMITS = {
  TITLE: 200,
  DESCRIPTION: 5000,
  COMMENT: 1000,
} as const;

/** What a plan was created from (same values as the backend). */
export const ACTION_PLAN_ORIGIN_TYPE = {
  /** A report of the platform (access, activities, simulados, reading…) */
  REPORT: 'REPORT',
  /** A ranking ("Estudantes com maior dificuldade", say) */
  RANKING: 'RANKING',
  /** One student's result */
  STUDENT_RESULT: 'STUDENT_RESULT',
  /** A school or municipality flagged as needing support */
  SCHOOL_SUPPORT: 'SCHOOL_SUPPORT',
  /** A draft of the AI assistant */
  ASSISTANT: 'ASSISTANT',
} as const;

export type ActionPlanOriginType =
  (typeof ACTION_PLAN_ORIGIN_TYPE)[keyof typeof ACTION_PLAN_ORIGIN_TYPE];

/** Size limits of the origin's texts (same as the backend). */
export const ACTION_PLAN_ORIGIN_LIMITS = {
  REPORT: 120,
  FILTER: 200,
  FILTERS: 20,
  INDICATOR: 200,
  VALUE: 100,
  LINK: 2000,
} as const;

/** A professional of the plan: the enrollment and the person's name. */
export interface ActionPlanPerson {
  userInstitutionId: string;
  name: string;
}

/** The school of a plan. */
export interface ActionPlanSchool {
  id: string;
  name: string;
}

/** Snapshot of the screen a plan was created from. Never changes. */
export interface ActionPlanOrigin {
  type: string;
  /** The report's name, e.g. "Simulados" */
  report: string;
  /** The filters applied on the report, as text */
  filters: string[];
  indicator: string | null;
  value: string | null;
  /** When the data was read (ISO) */
  queriedAt: string;
  /** Relative link back to the report ("/..."), when there is one */
  link: string | null;
  sources: { title: string; link: string | null }[];
}

/** One plan of the list. */
export interface ActionPlanSummary {
  id: string;
  title: string;
  status: ActionPlanStatus;
  /** YYYY-MM-DD */
  deadline: string;
  /** Past the deadline (São Paulo) and still open; computed by the backend */
  late: boolean;
  school: ActionPlanSchool;
  /** Null once the enrollment no longer exists */
  responsible: ActionPlanPerson | null;
  createdBy: ActionPlanPerson | null;
  completedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** One plan opened: the list fields plus the description and the origin. */
export interface ActionPlan extends ActionPlanSummary {
  description: string | null;
  origin: ActionPlanOrigin;
}

/** One history entry. */
export interface ActionPlanEvent {
  id: string;
  /** One of ACTION_PLAN_EVENT_TYPE; later subtasks add their own */
  type: string;
  field: string | null;
  fromValue: string | null;
  toValue: string | null;
  /** Names of the previous and new responsible, on a responsible change */
  fromName: string | null;
  toName: string | null;
  comment: string | null;
  /** Null once the author's enrollment no longer exists */
  actor: ActionPlanPerson | null;
  createdAt: string | null;
}

/** Someone who may be the responsible of a plan of the school. */
export interface ActionPlanAssignee extends ActionPlanPerson {
  profile: string;
  /**
   * The school the plan goes to with them: the one asked for or, asked
   * without one, theirs (AE-3367)
   */
  school?: ActionPlanSchool;
}

/** Options of the "Filtros" modal: what the tab's plans hold. */
export interface ActionPlanFilterOptions {
  schools: ActionPlanSchool[];
  responsibles: ActionPlanPerson[];
}

/** Pagination of the list, as the backend answers it. */
export interface ActionPlanPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** One page of the list. */
export interface ActionPlanPage {
  items: ActionPlanSummary[];
  pagination: ActionPlanPagination;
}

/** The backend's envelope (`{ message, data }`). */
export interface ActionPlanApiResponse<T> {
  message: string;
  data: T;
}

/** Body of `POST /action-plans`. */
export interface CreateActionPlanData {
  title: string;
  description?: string | null;
  /** YYYY-MM-DD, from today on */
  deadline: string;
  origin: ActionPlanOrigin;
  /** The caller when left out */
  responsibleUserInstitutionId?: string;
  /** The responsible's school when left out */
  schoolId?: string;
}

/** Body of `PATCH /action-plans/:id`. */
export interface UpdateActionPlanData {
  title?: string;
  description?: string | null;
  deadline?: string;
}
