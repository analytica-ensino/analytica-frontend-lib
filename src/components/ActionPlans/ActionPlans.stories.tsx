import { useMemo, useState } from 'react';
import type { Story } from '@ladle/react';
import { ActionPlanList } from './ActionPlanList';
import { ActionPlanDetail } from './ActionPlanDetail';
import type { BaseApiClient } from '../../types/api';
import type {
  ActionPlan,
  ActionPlanEvent,
  ActionPlanListTab,
  ActionPlanStatus,
} from '../../types/actionPlans';

export default {
  title: 'ActionPlans',
};

const SCHOOLS = [
  { id: 'school-a', name: 'Escola Estadual Professor João da Silva' },
  { id: 'school-b', name: 'Colégio Estadual Monteiro Lobato' },
];
const PEOPLE = [
  { userInstitutionId: 'ui-me', name: 'Ana Maria' },
  { userInstitutionId: 'ui-carlos', name: 'Carlos Almeida' },
  { userInstitutionId: 'ui-elisha', name: 'Elisha Souza' },
];
const STATUSES: ActionPlanStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'DONE',
  'CANCELED',
];

const makePlans = (): ActionPlan[] =>
  Array.from({ length: 12 }, (_, index) => ({
    id: `plan-${index + 1}`,
    title: `Plano ${index + 1}: reforçar frações com o 6º ano`,
    description:
      'Revisar os conteúdos com menor taxa de acerto nos simulados e acompanhar as turmas por quatro semanas.',
    status: STATUSES[index % 4],
    deadline: `2026-${String((index % 12) + 1).padStart(2, '0')}-12`,
    late: index % 4 < 2 && index < 6,
    school: SCHOOLS[index % 2],
    responsible: PEOPLE[index % 3],
    createdBy: index % 2 ? PEOPLE[1] : PEOPLE[0],
    completedAt: null,
    createdAt: '2026-05-01T12:00:00.000Z',
    updatedAt: '2026-05-01T12:00:00.000Z',
    origin: {
      type: 'REPORT',
      report: 'Simulados',
      filters: ['Período do último ano', 'todas as turmas', 'todas as séries'],
      indicator: null,
      value: null,
      queriedAt: new Date().toISOString(),
      link: '/relatorios?relatorio=simulados',
      sources: [],
    },
  }));

const HISTORY: ActionPlanEvent[] = [
  {
    id: 'event-1',
    type: 'CREATED',
    field: null,
    fromValue: null,
    toValue: null,
    fromName: null,
    toName: null,
    comment: null,
    actor: PEOPLE[1],
    createdAt: '2025-05-08T14:30:00.000Z',
  },
  {
    id: 'event-2',
    type: 'STATUS_CHANGED',
    field: null,
    fromValue: 'NOT_STARTED',
    toValue: 'IN_PROGRESS',
    fromName: null,
    toName: null,
    comment: 'Início das atividades',
    actor: PEOPLE[1],
    createdAt: '2025-05-14T12:32:00.000Z',
  },
];

/** An in-memory backend for the stories. */
const useFakeApi = (empty = false): BaseApiClient =>
  useMemo(() => {
    const plans = empty ? [] : makePlans();
    const wrap = <T,>(data: unknown) =>
      Promise.resolve({ data: { message: 'ok', data } as T });
    const findPlan = (url: string) =>
      plans.find((plan) => url.includes(`/${plan.id}`)) ?? plans[0];
    return {
      get: <T,>(url: string, config?: { params?: Record<string, unknown> }) => {
        if (url === '/action-plans/filter-options') {
          return wrap<T>({ schools: SCHOOLS, responsibles: PEOPLE });
        }
        if (url === '/action-plans/assignees') return wrap<T>(PEOPLE);
        if (url.endsWith('/history')) return wrap<T>(HISTORY);
        if (url === '/action-plans') {
          const params = config?.params ?? {};
          const page = Number(params.page ?? 1);
          const limit = Number(params.limit ?? 10);
          const items = plans.slice((page - 1) * limit, page * limit);
          return wrap<T>({
            items,
            pagination: {
              page,
              limit,
              total: plans.length,
              totalPages: Math.ceil(plans.length / limit),
              hasNext: page * limit < plans.length,
              hasPrev: page > 1,
            },
          });
        }
        return wrap<T>(findPlan(url));
      },
      post: <T,>() => wrap<T>(plans[0]),
      patch: <T,>(url: string, body?: object) => {
        const plan = findPlan(url);
        Object.assign(plan, body);
        return wrap<T>(plan);
      },
      delete: <T,>() => wrap<T>(null),
    };
  }, [empty]);

export const List: Story<{ isManager: boolean }> = ({ isManager }) => {
  const apiClient = useFakeApi();
  const [tab, setTab] = useState<ActionPlanListTab>('responsible');
  return (
    <div className="bg-background-50 p-6">
      <ActionPlanList
        apiClient={apiClient}
        isManager={isManager}
        tab={tab}
        onTabChange={setTab}
        onOpenPlan={(id) => console.info('open', id)}
      />
    </div>
  );
};
List.args = { isManager: true };

export const EmptyList: Story = () => {
  const apiClient = useFakeApi(true);
  const [tab, setTab] = useState<ActionPlanListTab>('responsible');
  return (
    <div className="bg-background-50 p-6">
      <ActionPlanList
        apiClient={apiClient}
        isManager={false}
        tab={tab}
        onTabChange={setTab}
        onOpenPlan={() => undefined}
      />
    </div>
  );
};

export const Detail: Story<{ isManager: boolean }> = ({ isManager }) => {
  const apiClient = useFakeApi();
  return (
    <div className="bg-background-50 p-6">
      <ActionPlanDetail
        apiClient={apiClient}
        planId="plan-2"
        userInstitutionId="ui-carlos"
        isManager={isManager}
        onBack={() => console.info('back')}
        onOpenOrigin={(link) => console.info('origin', link)}
      />
    </div>
  );
};
Detail.args = { isManager: true };
