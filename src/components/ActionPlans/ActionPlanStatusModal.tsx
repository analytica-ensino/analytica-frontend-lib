import { useState } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import TextArea from '../TextArea/TextArea';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import useToastStore from '../Toast/utils/ToastStore';
import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import type { BaseApiClient } from '../../types/api';
import {
  ACTION_PLAN_LIMITS,
  ACTION_PLAN_STATUS,
  ACTION_PLAN_STATUSES,
  type ActionPlan,
  type ActionPlanStatus,
} from '../../types/actionPlans';
import { ACTION_PLAN_STATUS_LABELS } from './actionPlans.utils';
import { changeActionPlanStatus } from './useActionPlans';

export interface ActionPlanStatusModalProps {
  apiClient: BaseApiClient;
  plan: Pick<ActionPlan, 'id' | 'status'>;
  /**
   * Whether "Cancelado" is offered: only the plan's creator cancels it (the
   * backend refuses anyone else).
   */
  canCancel: boolean;
  onClose: () => void;
  /** The plan as the change left it */
  onSaved: (plan: ActionPlan) => void;
}

/**
 * "Editar status": the new status of a plan and, optionally, the reason,
 * which goes to its history.
 */
export const ActionPlanStatusModal = ({
  apiClient,
  plan,
  canCancel,
  onClose,
  onSaved,
}: Readonly<ActionPlanStatusModalProps>) => {
  const addToast = useToastStore((state) => state.addToast);
  const [status, setStatus] = useState<ActionPlanStatus>(plan.status);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const options = ACTION_PLAN_STATUSES.filter(
    (option) =>
      option !== ACTION_PLAN_STATUS.CANCELED ||
      canCancel ||
      plan.status === ACTION_PLAN_STATUS.CANCELED
  );

  const handleSave = async () => {
    if (status === plan.status) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      const saved = await changeActionPlanStatus(
        apiClient,
        plan.id,
        status,
        comment
      );
      addToast({ title: 'Status alterado', action: 'success' });
      onSaved(saved);
    } catch (error) {
      addToast({
        title: 'Não foi possível alterar o status',
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
      size="md"
      title="Editar status"
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
          <Button size="small" onClick={handleSave} disabled={saving}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Select
          size="medium"
          label="Status"
          value={status}
          onValueChange={(value) => setStatus(value as ActionPlanStatus)}
        >
          <SelectTrigger
            aria-label="Status"
            data-testid="action-plan-status-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {ACTION_PLAN_STATUS_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TextArea
          label="Comentário"
          rows={4}
          maxLength={ACTION_PLAN_LIMITS.COMMENT}
          placeholder="Insira o motivo da alteração"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </div>
    </Modal>
  );
};
