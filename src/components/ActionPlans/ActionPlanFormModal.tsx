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
  /** Whether this app has the screen of an origin link (AE-3367) */
  canOpenOrigin?: (link: string) => boolean;
}

/** Editing a plan: its fields start filled; the origin never changes. */
interface EditProps extends ActionPlanFormModalBaseProps {
  mode: 'edit';
  plan: ActionPlan;
}

/**
 * Creating a plan from a report or the assistant (AE-3367): the origin is
 * the snapshot of that screen. Without `schoolId` the plan takes the
 * responsible's school: a teacher is the responsible, and a manager picks
 * them among the teachers and unit managers of their schools.
 */
interface CreateProps extends ActionPlanFormModalBaseProps {
  mode: 'create';
  origin: ActionPlanOrigin;
  schoolId?: string;
  /** The title the form starts with, which the person may change */
  suggestedTitle?: string;
}

export type ActionPlanFormModalProps = EditProps | CreateProps;

interface FormErrors {
  title?: string;
  responsible?: string;
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
  const {
    apiClient,
    isManager,
    onClose,
    onSaved,
    onOpenOrigin,
    canOpenOrigin,
  } = props;
  const plan = props.mode === 'edit' ? props.plan : null;
  const origin = props.mode === 'edit' ? props.plan.origin : props.origin;
  const schoolId =
    props.mode === 'edit' ? props.plan.school.id : props.schoolId;

  const addToast = useToastStore((state) => state.addToast);
  const [title, setTitle] = useState(
    props.mode === 'edit' ? props.plan.title : (props.suggestedTitle ?? '')
  );
  const [description, setDescription] = useState(plan?.description ?? '');
  const [deadline, setDeadline] = useState(plan?.deadline ?? '');
  const [responsibleId, setResponsibleId] = useState(
    plan?.responsible?.userInstitutionId ?? ''
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // With no school in view the manager picks the person, and the plan goes
  // to that person's school, so the picker names it and must be filled
  const schoolFromResponsible = isManager && !schoolId;
  const assignees = useActionPlanAssignees(apiClient, {
    enabled: isManager,
    schoolId,
  });

  // The current responsible stays selectable even outside the first page
  const responsibleOptions = useMemo(() => {
    const options = assignees.assignees.map((person) => ({
      value: person.userInstitutionId,
      label:
        schoolFromResponsible && person.school
          ? `${person.name} · ${person.school.name}`
          : person.name,
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
  }, [assignees.assignees, plan?.responsible, schoolFromResponsible]);

  const validate = (): FormErrors => {
    const found: FormErrors = {};
    if (!title.trim()) found.title = 'Informe o título do plano';
    if (schoolFromResponsible && !responsibleId) {
      found.responsible = 'Escolha o responsável';
    }
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
      isManager &&
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
          ...(isManager &&
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
        {isManager && (
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
            errorMessage={errors.responsible}
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
            canOpenOrigin={canOpenOrigin}
            layout="row"
          />
        </div>
      </div>
    </Modal>
  );
};
