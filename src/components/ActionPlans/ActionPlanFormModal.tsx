import { useMemo, useState } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import TextArea from '../TextArea/TextArea';
import Text from '../Text/Text';
import DateTimeInput from '../DateTimeInput/DateTimeInput';
import SearchSelect from '../SearchSelect/SearchSelect';
import useToastStore from '../Toast/utils/ToastStore';
import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import type { BaseApiClient } from '../../types/api';
import {
  ACTION_PLAN_LIMITS,
  type ActionPlan,
  type ActionPlanOrigin,
  type UpdateActionPlanData,
} from '../../types/actionPlans';
import { todayInSaoPaulo } from './actionPlans.utils';
import { ActionPlanOriginBox } from './ActionPlanOriginBox';
import {
  changeActionPlanResponsible,
  createActionPlan,
  updateActionPlan,
  useActionPlanAssignees,
} from './useActionPlans';

interface ActionPlanFormModalBaseProps {
  apiClient: BaseApiClient;
  /**
   * A manager picks the responsible among who reaches the plan's school; a
   * teacher is always the responsible, so the field is not shown.
   */
  isManager: boolean;
  onClose: () => void;
  /** The plan as it was created or saved */
  onSaved: (plan: ActionPlan) => void;
  /** Opens the screen the plan came from ("Ver origem") */
  onOpenOrigin?: (link: string) => void;
}

/** Editing a plan: its fields start filled; the origin never changes. */
interface EditProps extends ActionPlanFormModalBaseProps {
  mode: 'edit';
  plan: ActionPlan;
}

/**
 * Creating a plan from a report or the assistant (AE-3367): the origin is
 * the snapshot of that screen. Without `schoolId` the plan takes the
 * responsible's school, and a manager's responsible field is not shown.
 */
interface CreateProps extends ActionPlanFormModalBaseProps {
  mode: 'create';
  origin: ActionPlanOrigin;
  schoolId?: string;
}

export type ActionPlanFormModalProps = EditProps | CreateProps;

interface FormErrors {
  title?: string;
  deadline?: string;
}

/**
 * The plan form, for "Criar plano de ação" and "Editar plano de ação":
 * title, description, responsible (managers), deadline and the read-only
 * origin.
 */
export const ActionPlanFormModal = (
  props: Readonly<ActionPlanFormModalProps>
) => {
  const { apiClient, isManager, onClose, onSaved, onOpenOrigin } = props;
  const plan = props.mode === 'edit' ? props.plan : null;
  const origin = props.mode === 'edit' ? props.plan.origin : props.origin;
  const schoolId =
    props.mode === 'edit' ? props.plan.school.id : props.schoolId;

  const addToast = useToastStore((state) => state.addToast);
  const [title, setTitle] = useState(plan?.title ?? '');
  const [description, setDescription] = useState(plan?.description ?? '');
  const [deadline, setDeadline] = useState(plan?.deadline ?? '');
  const [responsibleId, setResponsibleId] = useState(
    plan?.responsible?.userInstitutionId ?? ''
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const showResponsible = isManager && Boolean(schoolId);
  const assignees = useActionPlanAssignees(
    apiClient,
    showResponsible ? schoolId : undefined
  );

  // The current responsible stays selectable even outside the first page
  const responsibleOptions = useMemo(() => {
    const options = assignees.assignees.map((person) => ({
      value: person.userInstitutionId,
      label: person.name,
    }));
    const current = plan?.responsible;
    if (
      current &&
      !options.some((o) => o.value === current.userInstitutionId)
    ) {
      options.unshift({
        value: current.userInstitutionId,
        label: current.name,
      });
    }
    return options;
  }, [assignees.assignees, plan?.responsible]);

  const validate = (): FormErrors => {
    const found: FormErrors = {};
    if (!title.trim()) found.title = 'Informe o título do plano';
    if (!deadline) {
      found.deadline = 'Informe o prazo';
    } else if (deadline !== plan?.deadline && deadline < todayInSaoPaulo()) {
      // A late plan keeps its past deadline while other fields change
      found.deadline = 'O prazo não pode ser antes de hoje';
    }
    return found;
  };

  const saveEdit = async (current: ActionPlan): Promise<ActionPlan> => {
    const changes: UpdateActionPlanData = {};
    if (title.trim() !== current.title) changes.title = title.trim();
    if ((description.trim() || null) !== (current.description ?? null)) {
      changes.description = description.trim() || null;
    }
    if (deadline !== current.deadline) changes.deadline = deadline;

    let saved = current;
    if (Object.keys(changes).length > 0) {
      saved = await updateActionPlan(apiClient, current.id, changes);
    }
    if (
      showResponsible &&
      responsibleId &&
      responsibleId !== current.responsible?.userInstitutionId
    ) {
      saved = await changeActionPlanResponsible(
        apiClient,
        current.id,
        responsibleId
      );
    }
    return saved;
  };

  const handleSubmit = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      if (plan) {
        const saved = await saveEdit(plan);
        addToast({ title: 'Plano de ação atualizado', action: 'success' });
        onSaved(saved);
      } else {
        const created = await createActionPlan(apiClient, {
          title: title.trim(),
          description: description.trim() || null,
          deadline,
          origin,
          ...(showResponsible &&
            responsibleId && { responsibleUserInstitutionId: responsibleId }),
          ...(schoolId && { schoolId }),
        });
        addToast({
          title: 'Plano de ação criado!',
          description: 'Acesse a área de planos de ação para visualizar',
          action: 'success',
        });
        onSaved(created);
      }
    } catch (error) {
      addToast({
        title: plan
          ? 'Não foi possível salvar o plano'
          : 'Não foi possível criar o plano',
        description: getApiErrorMessage(error),
        action: 'warning',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title={plan ? 'Editar plano de ação' : 'Criar plano de ação'}
      footer={
        <>
          <Button
            variant="link"
            size="small"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button size="small" onClick={handleSubmit} disabled={saving}>
            {plan ? 'Salvar' : 'Criar plano'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Título"
          variant="rounded"
          placeholder="Insira o título do plano"
          maxLength={ACTION_PLAN_LIMITS.TITLE}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          errorMessage={errors.title}
          data-testid="action-plan-title-input"
        />
        <TextArea
          label="Descrição"
          rows={4}
          placeholder="Insira a descrição do plano"
          maxLength={ACTION_PLAN_LIMITS.DESCRIPTION}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {showResponsible && (
          <SearchSelect
            label="Responsável"
            placeholder="Selecione o responsável"
            searchPlaceholder="Buscar pelo nome"
            options={responsibleOptions}
            value={responsibleId}
            onValueChange={setResponsibleId}
            onSearch={assignees.search}
            loading={assignees.loading}
            filterLocally={false}
            variant="rounded"
            emptyText="Ninguém encontrado"
          />
        )}
        <DateTimeInput
          label="Prazo"
          showTime={false}
          date={deadline}
          onDateChange={setDeadline}
          errorMessage={errors.deadline}
          testId="action-plan-deadline"
        />
        <div className="flex flex-col gap-2">
          <Text size="sm" weight="bold" className="text-text-950">
            Origem
          </Text>
          <ActionPlanOriginBox
            origin={origin}
            onOpenOrigin={onOpenOrigin}
            layout="row"
          />
        </div>
      </div>
    </Modal>
  );
};
