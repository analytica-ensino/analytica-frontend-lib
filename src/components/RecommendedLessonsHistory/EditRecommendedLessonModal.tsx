import type { ChangeEvent, FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { FloppyDisk as FloppyDiskIcon } from 'phosphor-react';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Text from '../Text/Text';
import DeadlineStep from '../shared/SendModalBase/components/DeadlineStep';
import { useDateTimeHandlers } from '../shared/SendModalBase/hooks/useDateTimeHandlers';
import { validateDeadlineStep } from '../SendActivityModal/validation';
import type {
  SendActivityFormData,
  StepErrors,
} from '../SendActivityModal/types';
import useToastStore from '../Toast/utils/ToastStore';
import { buildISODateTime } from '../ActivityCreate/ActivityCreate.utils';
import type {
  RecommendedClassData,
  UpdateRecommendedClassData,
} from '../../types/recommendedLessons';

/** Fields edited by the quick-edit modal */
type EditFormData = Partial<
  Pick<
    SendActivityFormData,
    'title' | 'startDate' | 'startTime' | 'finalDate' | 'finalTime'
  >
>;

/**
 * Props for the "Editar aula recomendada" modal.
 */
export interface EditRecommendedLessonModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Id of the recommended class being edited */
  recommendedClassId?: string;
  /** Loads the current recommended class data to pre-fill the form */
  fetchById: (id: string) => Promise<RecommendedClassData>;
  /** Persists the edited title and dates */
  onUpdate: (id: string, data: UpdateRecommendedClassData) => Promise<void>;
  /** Close the modal without saving */
  onClose: () => void;
  /** Fired after a successful save (consumer reloads the list + closes) */
  onSaved: () => void;
}

const TITLE_REQUIRED =
  'Campo obrigatório! Por favor, preencha este campo para continuar.';

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

/**
 * Quick-edit modal for a recommended class, limited to the editable fields the
 * product allows: title and the start/deadline dates. Loads via the injected
 * `fetchById` and saves via the injected `onUpdate` (PATCH /recommended-class/:id).
 * @returns the edit modal element
 */
export const EditRecommendedLessonModal: FC<
  EditRecommendedLessonModalProps
> = ({ isOpen, recommendedClassId, fetchById, onUpdate, onClose, onSaved }) => {
  const addToast = useToastStore((state) => state.addToast);

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

  // Load and pre-fill the recommended class when the modal opens
  useEffect(() => {
    if (!isOpen || !recommendedClassId) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      setErrors({});
      try {
        const data = await fetchById(recommendedClassId);
        if (!active) return;
        const start = splitDateTime(data.startDate);
        const final = splitDateTime(data.finalDate);
        setFormData({
          title: data.title ?? '',
          startDate: start.date,
          startTime: start.time || '00:00',
          finalDate: final.date,
          finalTime: final.time || '23:59',
        });
      } catch {
        if (!active) return;
        addToast({
          title: 'Erro ao carregar aula recomendada',
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
  }, [isOpen, recommendedClassId, fetchById, addToast, onClose]);

  const handleTitleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      updateFormData({ title: e.target.value }),
    [updateFormData]
  );

  const handleSubmit = useCallback(async () => {
    if (!recommendedClassId) return;

    const validationErrors: StepErrors = validateDeadlineStep(formData);
    if (!formData.title || formData.title.trim().length === 0) {
      validationErrors.title = TITLE_REQUIRED;
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      await onUpdate(recommendedClassId, {
        title: formData.title?.trim(),
        startDate: buildISODateTime(
          formData.startDate ?? '',
          formData.startTime || '00:00'
        ),
        finalDate: buildISODateTime(
          formData.finalDate ?? '',
          formData.finalTime || '23:59'
        ),
      });
      addToast({
        title: 'Aula recomendada atualizada com sucesso',
        action: 'success',
        position: 'top-right',
      });
      onSaved();
    } catch {
      addToast({
        title: 'Erro ao atualizar aula recomendada',
        action: 'warning',
        position: 'top-right',
      });
    } finally {
      setSaving(false);
    }
  }, [recommendedClassId, formData, onUpdate, addToast, onSaved]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar aula recomendada"
      size="md"
      contentClassName="flex flex-col gap-8 sm:gap-10 max-h-[70vh] overflow-y-auto"
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 w-full">
          <Button
            variant="link"
            action="primary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            action="primary"
            onClick={handleSubmit}
            disabled={saving || loading}
            iconLeft={<FloppyDiskIcon size={16} />}
            className="w-full sm:w-auto"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      }
    >
      {loading ? (
        <Text size="sm" className="text-text-600">
          Carregando...
        </Text>
      ) : (
        <div className="flex flex-col gap-6">
          <Input
            label="Título"
            placeholder="Digite o título da aula"
            value={formData.title || ''}
            onChange={handleTitleChange}
            variant="rounded"
            required
            errorMessage={errors.title}
          />

          <DeadlineStep
            startDate={formData.startDate ?? ''}
            startTime={formData.startTime ?? ''}
            finalDate={formData.finalDate ?? ''}
            finalTime={formData.finalTime ?? ''}
            onStartDateChange={dateHandlers.handleStartDateChange}
            onStartTimeChange={dateHandlers.handleStartTimeChange}
            onFinalDateChange={dateHandlers.handleFinalDateChange}
            onFinalTimeChange={dateHandlers.handleFinalTimeChange}
            errors={{
              startDate: errors.startDate,
              startTime: errors.startTime,
              finalDate: errors.finalDate,
              finalTime: errors.finalTime,
            }}
          />
        </div>
      )}
    </Modal>
  );
};

export default EditRecommendedLessonModal;
