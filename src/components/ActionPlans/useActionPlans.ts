import { useCallback, useEffect, useRef, useState } from 'react';
import type { BaseApiClient } from '../../types/api';
import type {
  ActionPlan,
  ActionPlanApiResponse,
  ActionPlanAssignee,
  ActionPlanEvent,
  ActionPlanFilterOptions,
  ActionPlanListTab,
  ActionPlanPage,
  ActionPlanPagination,
  ActionPlanStatus,
  ActionPlanSummary,
  CreateActionPlanData,
  UpdateActionPlanData,
} from '../../types/actionPlans';

const EMPTY_PAGINATION: ActionPlanPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

/**
 * Change a plan's status, with the reason.
 *
 * @param apiClient - The host's API client
 * @param planId - The plan
 * @param status - The new status
 * @param comment - The reason, if any
 * @returns The plan as it is now
 */
export const changeActionPlanStatus = async (
  apiClient: BaseApiClient,
  planId: string,
  status: ActionPlanStatus,
  comment?: string
): Promise<ActionPlan> => {
  const response = await apiClient.patch<ActionPlanApiResponse<ActionPlan>>(
    `/action-plans/${planId}/status`,
    { status, ...(comment?.trim() && { comment: comment.trim() }) }
  );
  return response.data.data;
};

/**
 * Create a plan.
 *
 * @param apiClient - The host's API client
 * @param data - The plan, with its origin
 * @returns The new plan
 */
export const createActionPlan = async (
  apiClient: BaseApiClient,
  data: CreateActionPlanData
): Promise<ActionPlan> => {
  const response = await apiClient.post<ActionPlanApiResponse<ActionPlan>>(
    '/action-plans',
    data
  );
  return response.data.data;
};

/**
 * Edit a plan's title, description or deadline.
 *
 * @param apiClient - The host's API client
 * @param planId - The plan
 * @param data - The fields that change
 * @returns The plan as it is now
 */
export const updateActionPlan = async (
  apiClient: BaseApiClient,
  planId: string,
  data: UpdateActionPlanData
): Promise<ActionPlan> => {
  const response = await apiClient.patch<ActionPlanApiResponse<ActionPlan>>(
    `/action-plans/${planId}`,
    data
  );
  return response.data.data;
};

/**
 * Hand a plan to another responsible.
 *
 * @param apiClient - The host's API client
 * @param planId - The plan
 * @param responsibleUserInstitutionId - The new responsible
 * @returns The plan as it is now
 */
export const changeActionPlanResponsible = async (
  apiClient: BaseApiClient,
  planId: string,
  responsibleUserInstitutionId: string
): Promise<ActionPlan> => {
  const response = await apiClient.patch<ActionPlanApiResponse<ActionPlan>>(
    `/action-plans/${planId}/responsible`,
    { responsibleUserInstitutionId }
  );
  return response.data.data;
};

/**
 * The list's pages. Only the last request asked for lands: a slow page never
 * overwrites a newer one.
 *
 * @param apiClient - The host's API client
 * @returns The page, its state, `fetchPage` (with the list's params) and
 * `reload` (the last params again)
 */
export const useActionPlanList = (apiClient: BaseApiClient) => {
  const [items, setItems] = useState<ActionPlanSummary[]>([]);
  const [pagination, setPagination] =
    useState<ActionPlanPagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestRef = useRef(0);
  const lastParamsRef = useRef<Record<string, unknown> | null>(null);

  const fetchPage = useCallback(
    async (params: Record<string, unknown>) => {
      const request = ++requestRef.current;
      lastParamsRef.current = params;
      setLoading(true);
      setError(false);
      try {
        const response = await apiClient.get<
          ActionPlanApiResponse<ActionPlanPage>
        >('/action-plans', { params });
        if (request !== requestRef.current) return;
        setItems(response.data.data.items);
        setPagination(response.data.data.pagination);
      } catch {
        if (request === requestRef.current) setError(true);
      } finally {
        if (request === requestRef.current) setLoading(false);
      }
    },
    [apiClient]
  );

  const reload = useCallback(async () => {
    if (lastParamsRef.current) await fetchPage(lastParamsRef.current);
  }, [fetchPage]);

  return { items, pagination, loading, error, fetchPage, reload };
};

/**
 * The options of the "Filtros" modal for a tab: the schools and the
 * responsibles its plans hold. Empty while loading or when the request fails
 * (the modal then offers only the status, the deadline and "atrasados").
 *
 * @param apiClient - The host's API client
 * @param tab - The list's tab
 * @returns The options
 */
export const useActionPlanFilterOptions = (
  apiClient: BaseApiClient,
  tab: ActionPlanListTab
): ActionPlanFilterOptions => {
  const [options, setOptions] = useState<ActionPlanFilterOptions>({
    schools: [],
    responsibles: [],
  });

  useEffect(() => {
    let active = true;
    setOptions({ schools: [], responsibles: [] });
    apiClient
      .get<ActionPlanApiResponse<ActionPlanFilterOptions>>(
        '/action-plans/filter-options',
        { params: { tab } }
      )
      .then((response) => {
        if (active) setOptions(response.data.data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [apiClient, tab]);

  return options;
};

/**
 * One plan and its history, refreshed after each change made through it.
 *
 * @param apiClient - The host's API client
 * @param planId - The plan
 * @returns The plan, its history, the loading and error states, `setPlan`
 * (to show a plan a write answered) and `reloadHistory`
 */
export const useActionPlan = (apiClient: BaseApiClient, planId: string) => {
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [history, setHistory] = useState<ActionPlanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  const reloadHistory = useCallback(async () => {
    try {
      const response = await apiClient.get<
        ActionPlanApiResponse<ActionPlanEvent[]>
      >(`/action-plans/${planId}/history`);
      setHistory(response.data.data);
    } catch {
      // The plan still shows; the history keeps what it had
    }
  }, [apiClient, planId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setNotFound(false);
    Promise.all([
      apiClient.get<ActionPlanApiResponse<ActionPlan>>(
        `/action-plans/${planId}`
      ),
      apiClient
        .get<
          ActionPlanApiResponse<ActionPlanEvent[]>
        >(`/action-plans/${planId}/history`)
        .catch(() => null),
    ])
      .then(([planResponse, historyResponse]) => {
        if (!active) return;
        setPlan(planResponse.data.data);
        setHistory(historyResponse?.data.data ?? []);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        const status = (reason as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apiClient, planId]);

  return {
    plan,
    history,
    loading,
    notFound,
    error,
    setPlan,
    reloadHistory,
  };
};

/** What the responsible picker asks for. */
export interface ActionPlanAssigneesQuery {
  /** Off, nothing is asked */
  enabled: boolean;
  /**
   * The plan's school. Left out, the API answers the teachers and unit
   * managers of the caller's schools, each with their school (AE-3367).
   */
  schoolId?: string;
}

/**
 * Who may be the responsible of a plan, searched by name.
 *
 * @param apiClient - The host's API client
 * @param query - Whether to ask, and the plan's school when there is one
 * @returns The people, the loading state and `search`
 */
export const useActionPlanAssignees = (
  apiClient: BaseApiClient,
  { enabled, schoolId }: ActionPlanAssigneesQuery
) => {
  const [assignees, setAssignees] = useState<ActionPlanAssignee[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setLoading(true);
    apiClient
      .get<ActionPlanApiResponse<ActionPlanAssignee[]>>(
        '/action-plans/assignees',
        {
          params: {
            ...(schoolId && { schoolId }),
            ...(query.trim() && { search: query.trim() }),
          },
        }
      )
      .then((response) => {
        if (active) setAssignees(response.data.data);
      })
      .catch(() => {
        if (active) setAssignees([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apiClient, enabled, schoolId, query]);

  return { assignees, loading, search: setQuery };
};
