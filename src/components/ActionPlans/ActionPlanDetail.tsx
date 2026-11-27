import { useState, type ReactNode } from 'react';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple';
import { UserCircleIcon } from '@phosphor-icons/react/dist/csr/UserCircle';
import Text from '../Text/Text';
import IconButton from '../IconButton/IconButton';
import Divider from '../Divider/Divider';
import { cn } from '../../utils/utils';
import type { BaseApiClient } from '../../types/api';
import {
  ACTION_PLAN_STATUS,
  type ActionPlan,
  type ActionPlanPerson,
} from '../../types/actionPlans';
import { formatFullDate } from './actionPlans.utils';
import { ActionPlanLateBadge, ActionPlanStatusBadge } from './ActionPlanBadges';
import { ActionPlanOriginBox } from './ActionPlanOriginBox';
import { ActionPlanHistory } from './ActionPlanHistory';
import { ActionPlanStatusModal } from './ActionPlanStatusModal';
import { ActionPlanFormModal } from './ActionPlanFormModal';
import { useActionPlan } from './useActionPlans';

export interface ActionPlanDetailProps {
  /** The host's API client */
  apiClient: BaseApiClient;
  planId: string;
  /** The caller's enrollment: the creator is the one who cancels */
  userInstitutionId: string;
  /** Managers pick the responsible in the edit form */
  isManager: boolean;
  /** Back to the list, on the tab the plan was opened from */
  onBack: () => void;
  /** Opens the screen the plan came from ("Ver origem") */
  onOpenOrigin?: (link: string) => void;
  /** Whether this app has the screen of an origin link (AE-3367) */
  canOpenOrigin?: (link: string) => boolean;
  className?: string;
}

const Info = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-1">
    <Text as="dt" size="md" weight="bold" className="text-text-950">
      {label}
    </Text>
    <dd className="flex min-w-0 items-center gap-2 text-sm text-text-800">
      {children}
    </dd>
  </div>
);

const Person = ({ person }: { person: ActionPlanPerson | null }) => (
  <>
    <UserCircleIcon
      size={20}
      weight="fill"
      aria-hidden="true"
      className="shrink-0 text-primary-300"
    />
    <span className="truncate">{person?.name ?? 'Usuário removido'}</span>
  </>
);

/**
 * Whether the caller cancels the plan or takes it back from canceled: its
 * creator, or a manager of its school when the creator is gone. The backend
 * has the last word.
 */
const canCancelPlan = (
  plan: ActionPlan,
  userInstitutionId: string,
  isManager: boolean
) =>
  plan.createdBy
    ? plan.createdBy.userInstitutionId === userInstitutionId
    : isManager;

/**
 * The detail of an action plan (AE-3366): its status, origin, description,
 * deadline, people and history. The status changes in "Editar status"; the
 * title, description, deadline and (managers) responsible in "Editar plano
 * de ação". Each change refreshes the plan and its history.
 */
export const ActionPlanDetail = ({
  apiClient,
  planId,
  userInstitutionId,
  isManager,
  onBack,
  onOpenOrigin,
  canOpenOrigin,
  className,
}: Readonly<ActionPlanDetailProps>) => {
  const { plan, history, loading, notFound, error, setPlan, reloadHistory } =
    useActionPlan(apiClient, planId);
  const [editing, setEditing] = useState<'status' | 'plan' | null>(null);

  const handleSaved = (saved: ActionPlan) => {
    setPlan(saved);
    setEditing(null);
    reloadHistory();
  };

  const header = (
    <div className="flex items-center gap-3">
      <IconButton
        icon={<ArrowLeftIcon size={20} />}
        aria-label="Voltar para os planos de ação"
        onClick={onBack}
      />
      <Text
        as="h1"
        size="xl"
        weight="bold"
        className="min-w-0 break-words text-text-950"
      >
        {plan?.title ?? 'Plano de ação'}
      </Text>
    </div>
  );

  if (loading || notFound || error || !plan) {
    let message = 'Carregando...';
    if (notFound) message = 'Plano de ação não encontrado.';
    else if (error) message = 'Não foi possível carregar o plano de ação.';
    return (
      <div className={cn('flex w-full flex-col gap-6', className)}>
        {header}
        <div className="rounded-xl bg-background p-10 text-center">
          <Text as="p" role="status" size="md" className="text-text-700">
            {message}
          </Text>
        </div>
      </div>
    );
  }

  const canCancel = canCancelPlan(plan, userInstitutionId, isManager);
  // A canceled plan leaves CANCELED only by whoever cancels it
  const canChangeStatus =
    plan.status !== ACTION_PLAN_STATUS.CANCELED || canCancel;

  return (
    <div
      className={cn('flex w-full flex-col gap-6', className)}
      data-testid="action-plan-detail"
    >
      {header}

      <div className="flex flex-col overflow-hidden rounded-xl border border-border-100 bg-background lg:flex-row">
        <aside className="flex flex-col gap-6 border-b border-border-100 p-6 lg:w-[360px] lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3">
            <Text as="h2" size="lg" weight="bold" className="text-text-950">
              Status
            </Text>
            <div className="flex items-center gap-2">
              <ActionPlanStatusBadge status={plan.status} />
              {canChangeStatus && (
                <IconButton
                  icon={<PencilSimpleIcon size={16} />}
                  aria-label="Editar status"
                  onClick={() => setEditing('status')}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Text as="h2" size="lg" weight="bold" className="text-text-950">
              Origem
            </Text>
            <ActionPlanOriginBox
              origin={plan.origin}
              onOpenOrigin={onOpenOrigin}
              canOpenOrigin={canOpenOrigin}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6 p-6">
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Text as="h2" size="lg" weight="bold" className="text-text-950">
                Sobre o plano
              </Text>
              <IconButton
                icon={<PencilSimpleIcon size={16} />}
                aria-label="Editar plano de ação"
                onClick={() => setEditing('plan')}
              />
            </div>
            <Text
              size="sm"
              className="whitespace-pre-line break-words text-text-800"
            >
              {plan.description || 'Sem descrição.'}
            </Text>
          </section>

          <Divider />

          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Info label="Prazo">
              {formatFullDate(plan.deadline)}
              {plan.late && <ActionPlanLateBadge />}
            </Info>
            <Info label="Responsável">
              <Person person={plan.responsible} />
            </Info>
            <Info label="Escola">{plan.school.name}</Info>
            <Info label="Criado por">
              <Person person={plan.createdBy} />
            </Info>
          </dl>

          <Divider />

          <ActionPlanHistory events={history} />
        </div>
      </div>

      {editing === 'status' && (
        <ActionPlanStatusModal
          apiClient={apiClient}
          plan={plan}
          canCancel={canCancel}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {editing === 'plan' && (
        <ActionPlanFormModal
          mode="edit"
          apiClient={apiClient}
          plan={plan}
          isManager={isManager}
          onOpenOrigin={onOpenOrigin}
          canOpenOrigin={canOpenOrigin}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default ActionPlanDetail;
