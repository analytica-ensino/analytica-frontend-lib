import type { BaseApiClient } from '../types/api';
import type {
  ActionPlan,
  ActionPlanEvent,
  ActionPlanSummary,
} from '../types/actionPlans';

/** A plan of the list, with the given fields. */
export const summary = (
  overrides: Partial<ActionPlanSummary> = {}
): ActionPlanSummary => ({
  id: 'plan-1',
  title: 'Melhorar os simulados',
  status: 'NOT_STARTED',
  deadline: '2026-05-12',
  late: false,
  school: { id: 'school-a', name: 'Escola Estadual João da Silva' },
  responsible: { userInstitutionId: 'ui-teacher', name: 'Ana Souza' },
  createdBy: { userInstitutionId: 'ui-manager', name: 'Carlos Silva' },
  completedAt: null,
  createdAt: '2026-05-01T12:00:00.000Z',
  updatedAt: '2026-05-01T12:00:00.000Z',
  ...overrides,
});

/** A plan opened, with the given fields. */
export const fullPlan = (overrides: Partial<ActionPlan> = {}): ActionPlan => ({
  ...summary(),
  description: 'Revisar os simulados com as turmas',
  origin: {
    type: 'REPORT',
    report: 'Simulados',
    filters: ['Período do último ano', 'Todas as turmas'],
    indicator: null,
    value: null,
    queriedAt: '2026-05-01T13:00:00.000Z',
    link: '/relatorios?relatorio=simulados',
    sources: [],
  },
  ...overrides,
});

/** One history entry, with the given fields. */
export const historyEvent = (
  overrides: Partial<ActionPlanEvent> = {}
): ActionPlanEvent => ({
  id: 'event-1',
  type: 'CREATED',
  field: null,
  fromValue: null,
  toValue: null,
  fromName: null,
  toName: null,
  comment: null,
  actor: { userInstitutionId: 'ui-manager', name: 'Carlos Silva' },
  createdAt: '2026-05-01T12:00:00.000Z',
  ...overrides,
});

type Answer =
  | unknown
  | ((config?: { params?: Record<string, unknown> }) => unknown);

/**
 * An API client answering each GET path with `{ data: { data } }` (the
 * backend's envelope), and the writes with the given plan.
 *
 * @param answers - Data by GET path; a function receives the request config
 * @returns The client, its methods as jest mocks
 */
export const fakeApi = (answers: Record<string, Answer>) => {
  const wrap = (data: unknown) => ({ data: { message: 'ok', data } });
  const api = {
    get: jest.fn(
      async (url: string, config?: { params?: Record<string, unknown> }) => {
        if (!(url in answers)) throw new Error(`Unexpected GET ${url}`);
        const answer = answers[url];
        return wrap(typeof answer === 'function' ? answer(config) : answer);
      }
    ),
    post: jest.fn(async () => wrap(fullPlan())),
    patch: jest.fn(async () => wrap(fullPlan())),
    delete: jest.fn(async () => wrap(null)),
  };
  return api as typeof api & BaseApiClient;
};

/** A request error the way Axios throws it. */
export const apiError = (status: number, message?: string) =>
  Object.assign(new Error('Request failed'), {
    response: { status, data: message ? { message } : {} },
  });
