import type { ChangeEvent, FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CaretLeft as CaretLeftIcon,
  ArrowRight as ArrowRightIcon,
  FloppyDisk as FloppyDiskIcon,
} from 'phosphor-react';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import TextArea from '../TextArea/TextArea';
import Button from '../Button/Button';
import Text from '../Text/Text';
import Chips from '../Chips/Chips';
import Stepper from '../Stepper/Stepper';
import type { StepData } from '../Stepper/Stepper';
import DeadlineStep from '../shared/SendModalBase/components/DeadlineStep';
import { SendModalError } from '../shared/SendModalBase/components/SendModalError';
import { useDateTimeHandlers } from '../shared/SendModalBase/hooks/useDateTimeHandlers';
import {
  ACTIVITY_TYPE_OPTIONS,
  ActivitySubtype,
} from '../SendActivityModal/types';
import type {
  SendActivityFormData,
  StepErrors,
} from '../SendActivityModal/types';
import {
  validateActivityStep,
  validateDeadlineStep,
} from '../SendActivityModal/validation';
import useToastStore from '../Toast/utils/ToastStore';
import { buildISODateTime } from '../ActivityCreate/ActivityCreate.utils';
import type { BaseApiClient } from '../../types/api';

/** Fields edited by the quick-edit modal (subset of the send-activity form) */
type EditFormData = Partial<
  Pick<
    SendActivityFormData,
    | 'subtype'
    | 'title'
    | 'notification'
    | 'startDate'
    | 'startTime'
    | 'finalDate'
    | 'finalTime'
  >
>;

/** Subset of the activity payload loaded to pre-fill the form */
interface EditableActivity {
  subtype: string | null;
  title: string;
  notification: string | null;
  startDate: string | null;
  finalDate: string | null;
}

/**
 * Props for the "Editar atividade" modal.
 */
interface EditActivityModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Id of the published activity being edited */
  activityId?: string;
  /** API client used to load (GET /activities/:id/quiz) and save (PATCH /activities/:id) */
  apiClient?: BaseApiClient;
  /** Close the modal without saving */
  onClose: () => void;
  /** Fired after a successful save (consumer reloads the list + closes) */
  onSaved: () => void;
}

const MAX_STEPS = 2;

const STEPPER_STEPS: StepData[] = [
  { id: 'activity', label: 'Atividade', state: 'pending' },
  { id: 'deadline', label: 'Prazo', state: 'pending' },
];

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * Split an ISO datetime into the local `date` (YYYY-MM-DD) + `time` (HH:MM)
 * pair expected by `DateTimeInput`. Mirrors the local interpretation used by
 * `buildISODateTime` so the round-trip is stable.
 */
const splitDateTime = (iso?: string | null): { date: string; time: string } => {
  if (!iso) return { date: '', time: '' };
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: '', time: '' };
  return {
    date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`,
    time: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`,
  };
};

/** Coerce a backend subtype string into the local enum, if valid */
const toSubtype = (value?: string | null): ActivitySubtype | undefined =>
  (Object.values(ActivitySubtype) as string[]).includes(value ?? '')
    ? (value as ActivitySubtype)
    : undefined;

/** Build the `PATCH /activities/:id` body from the edited form fields */
export const buildEditPayload = (formData: EditFormData) => ({
  subtype: formData.subtype,
  title: (formData.title ?? '').trim(),
  notification: (formData.notification ?? '').trim() || null,
  startDate: buildISODateTime(
    formData.startDate ?? '',
    formData.startTime || '00:00'
  ),
  finalDate: buildISODateTime(
    formData.finalDate ?? '',
    formData.finalTime || '23:59'
  ),
});

/**
 * Step 1 body: activity type chips + title + notification (mirrors SendActivityModal).
 * @returns the activity step element
 */
const ActivityStep: FC<{
  formData: EditFormData;
  errors: StepErrors;
  onSubtypeSelect: (value: ActivitySubtype) => void;
  onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onNotificationChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({
  formData,
  errors,
  onSubtypeSelect,
  onTitleChange,
  onNotificationChange,
}) => (
  <div className="flex flex-col gap-6">
    <div>
      <Text size="sm" weight="medium" color="text-text-700" className="mb-3">
        Tipo de atividade*
      </Text>
      <div className="flex flex-wrap gap-2">
        {ACTIVITY_TYPE_OPTIONS.map((type) => (
          <Chips
            key={type.value}
            selected={formData.subtype === type.value}
            onClick={() => onSubtypeSelect(type.value)}
          >
            {type.label}
          </Chips>
        ))}
      </div>
      <SendModalError error={errors.subtype} />
    </div>

    <Input
      label="Título"
      placeholder="Digite o título da atividade"
      value={formData.title || ''}
      onChange={onTitleChange}
      variant="rounded"
      required
      errorMessage={errors.title}
    />

    <TextArea
      label="Mensagem da notificação"
      placeholder="Digite uma mensagem para a notificação (opcional)"
      value={formData.notification || ''}
      onChange={onNotificationChange}
    />
  </div>
);

/**
 * Footer mirroring SendModalFooter, but with a "Salvar alterações" submit.
 * @returns the footer element
 */
const EditModalFooter: FC<{
  currentStep: number;
  isSaving: boolean;
  onCancel: () => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
}> = ({
  currentStep,
  isSaving,
  onCancel,
  onPreviousStep,
  onNextStep,
  onSubmit,
}) => (
  <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 w-full">
    <Button
      variant="link"
      action="primary"
      onClick={onCancel}
      className="w-full sm:w-auto"
    >
      Cancelar
    </Button>

    <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
      {currentStep > 1 && (
        <Button
          variant="outline"
          action="primary"
          onClick={onPreviousStep}
          iconLeft={<CaretLeftIcon size={16} />}
          className="w-full sm:w-auto"
        >
          Anterior
        </Button>
      )}

      {currentStep >= MAX_STEPS ? (
        <Button
          variant="solid"
          action="primary"
          onClick={onSubmit}
          disabled={isSaving}
          iconLeft={<FloppyDiskIcon size={16} />}
          className="w-full sm:w-auto"
        >
          {isSaving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      ) : (
        <Button
          variant="solid"
          action="primary"
          onClick={onNextStep}
          iconRight={<ArrowRightIcon size={16} />}
          className="w-full sm:w-auto"
        >
          Próximo
        </Button>
      )}
    </div>
  </div>
);

/**
 * Quick-edit modal for a published activity, styled as a faithful replica of
 * `SendActivityModal` (Modal + Stepper + step bodies + footer) but limited to
 * the editable fields: type, title, notification, start and deadline dates.
 * Loads via `GET /activities/:id/quiz` and saves via `PATCH /activities/:id`.
 * @returns the edit modal element
 */
export const EditActivityModal: FC<EditActivityModalProps> = ({
  isOpen,
  activityId,
  apiClient,
  onClose,
  onSaved,
}) => {
  const addToast = useToastStore((state) => state.addToast);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EditFormData>({});
  const [errors, setErrors] = useState<StepErrors>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /** Merge a partial into the form and clear any standing validation errors */
  const updateFormData = useCallback((data: EditFormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setErrors({});
  }, []);

  const dateHandlers = useDateTimeHandlers<SendActivityFormData>({
    setFormData: updateFormData,
  });

  // Load and pre-fill the activity when the modal opens
  useEffect(() => {
    if (!isOpen || !activityId || !apiClient) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      setCurrentStep(1);
      setErrors({});
      try {
        const response = await apiClient.get<{ data: EditableActivity }>(
          `/activities/${activityId}/quiz`
        );
        if (!active) return;
        const activity = response.data.data;
        const start = splitDateTime(activity.startDate);
        const final = splitDateTime(activity.finalDate);
        setFormData({
          subtype: toSubtype(activity.subtype),
          title: activity.title ?? '',
          notification: activity.notification ?? '',
          startDate: start.date,
          startTime: start.time || '00:00',
          finalDate: final.date,
          finalTime: final.time || '23:59',
        });
      } catch {
        if (!active) return;
        addToast({
          title: 'Erro ao carregar atividade',
          action: 'warning',
          position: 'top-right',
        });
        onClose();
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isOpen, activityId, apiClient, addToast, onClose]);

  const handleSubtypeSelect = useCallback(
    (value: ActivitySubtype) => updateFormData({ subtype: value }),
    [updateFormData]
  );

  const handleTitleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      updateFormData({ title: e.target.value }),
    [updateFormData]
  );

  const handleNotificationChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) =>
      updateFormData({ notification: e.target.value }),
    [updateFormData]
  );

  const handleNextStep = useCallback(() => {
    const stepErrors = validateActivityStep(formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  }, [formData]);

  const handlePreviousStep = useCallback(() => {
    setErrors({});
    setCurrentStep(1);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!apiClient || !activityId) return;

    // Step 1 was already validated to reach step 2; only re-check the dates.
    const step2Errors = validateDeadlineStep(formData);
    if (Object.keys(step2Errors).length > 0) {
      setErrors(step2Errors);
      return;
    }

    setSaving(true);
    try {
      await apiClient.patch(
        `/activities/${activityId}`,
        buildEditPayload(formData)
      );
      addToast({
        title: 'Atividade atualizada com sucesso',
        action: 'success',
        position: 'top-right',
      });
      onSaved();
    } catch {
      addToast({
        title: 'Erro ao atualizar atividade',
        action: 'warning',
        position: 'top-right',
      });
    } finally {
      setSaving(false);
    }
  }, [apiClient, activityId, formData, addToast, onSaved]);

  const deadlineErrors = useMemo(
    () => ({
      startDate: errors.startDate,
      startTime: errors.startTime,
      finalDate: errors.finalDate,
      finalTime: errors.finalTime,
    }),
    [errors]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar atividade"
      size="md"
      contentClassName="flex flex-col gap-8 sm:gap-10 max-h-[70vh] overflow-y-auto"
      footer={
        <EditModalFooter
          currentStep={currentStep}
          isSaving={saving}
          onCancel={onClose}
          onPreviousStep={handlePreviousStep}
          onNextStep={handleNextStep}
          onSubmit={handleSubmit}
        />
      }
    >
      {loading ? (
        <Text size="sm" className="text-text-600">
          Carregando...
        </Text>
      ) : (
        <>
          <Stepper
            steps={STEPPER_STEPS}
            currentStep={currentStep - 1}
            size="small"
          />

          {currentStep === 1 ? (
            <ActivityStep
              formData={formData}
              errors={errors}
              onSubtypeSelect={handleSubtypeSelect}
              onTitleChange={handleTitleChange}
              onNotificationChange={handleNotificationChange}
            />
          ) : (
            <DeadlineStep
              startDate={formData.startDate ?? ''}
              startTime={formData.startTime ?? ''}
              finalDate={formData.finalDate ?? ''}
              finalTime={formData.finalTime ?? ''}
              onStartDateChange={dateHandlers.handleStartDateChange}
              onStartTimeChange={dateHandlers.handleStartTimeChange}
              onFinalDateChange={dateHandlers.handleFinalDateChange}
              onFinalTimeChange={dateHandlers.handleFinalTimeChange}
              errors={deadlineErrors}
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default EditActivityModal;
