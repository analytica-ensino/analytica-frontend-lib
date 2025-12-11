import { useCallback, useEffect, useRef, ChangeEvent } from 'react';
import {
  CaretLeftIcon,
  ArrowRightIcon,
  PaperPlaneTiltIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import Modal from '../Modal/Modal';
import Stepper from '../Stepper/Stepper';
import Button from '../Button/Button';
import Chips from '../Chips/Chips';
import Input from '../Input/Input';
import TextArea from '../TextArea/TextArea';
import Text from '../Text/Text';
import { RadioGroup, RadioGroupItem } from '../Radio/Radio';
import { CheckboxGroup } from '../CheckBoxGroup/CheckBoxGroup';
import DateTimeInput from '../DateTimeInput/DateTimeInput';
import { useSendActivityModalStore } from './hooks/useSendActivityModal';
import {
  SendActivityModalProps,
  ActivitySubtype,
  SendActivityFormData,
  ACTIVITY_TYPE_OPTIONS,
  CategoryConfig,
} from './types';
import { cn } from '../../utils/utils';

/**
 * Stepper steps configuration
 */
const STEPPER_STEPS = [
  { id: 'activity', label: 'Atividade', state: 'pending' as const },
  { id: 'recipient', label: 'Destinatário', state: 'pending' as const },
  { id: 'deadline', label: 'Prazo', state: 'pending' as const },
];

/**
 * SendActivityModal component for sending activities to students
 *
 * A multi-step modal with 3 steps:
 * 1. Activity - Select type, title, and optional notification message
 * 2. Recipient - Select students from hierarchical structure using CheckboxGroup
 * 3. Deadline - Set start/end dates and retry option
 */
const SendActivityModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories: initialCategories,
  onCategoriesChange,
  isLoading = false,
  onError,
}: SendActivityModalProps) => {
  const store = useSendActivityModalStore();
  const reset = useSendActivityModalStore((state) => state.reset);
  const setCategories = useSendActivityModalStore(
    (state) => state.setCategories
  );
  const storeCategories = useSendActivityModalStore(
    (state) => state.categories
  );

  /**
   * Track if categories have been initialized for this modal session
   */
  const categoriesInitialized = useRef(false);

  /**
   * Initialize categories when modal opens
   */
  useEffect(() => {
    if (
      isOpen &&
      initialCategories.length > 0 &&
      !categoriesInitialized.current
    ) {
      setCategories(initialCategories);
      categoriesInitialized.current = true;
    }
  }, [isOpen, initialCategories, setCategories]);

  /**
   * Reset store and initialization flag when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      reset();
      categoriesInitialized.current = false;
    }
  }, [isOpen, reset]);

  /**
   * Handle categories change from CheckboxGroup
   */
  const handleCategoriesChange = useCallback(
    (updatedCategories: CategoryConfig[]) => {
      setCategories(updatedCategories);
      onCategoriesChange?.(updatedCategories);
    },
    [setCategories, onCategoriesChange]
  );

  /**
   * Handle activity type selection
   */
  const handleActivityTypeSelect = useCallback(
    (subtype: ActivitySubtype) => {
      store.setFormData({ subtype });
    },
    [store]
  );

  /**
   * Handle title change
   */
  const handleTitleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      store.setFormData({ title: e.target.value });
    },
    [store]
  );

  /**
   * Handle notification message change
   */
  const handleNotificationChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      store.setFormData({ notification: e.target.value });
    },
    [store]
  );

  /**
   * Handle start date change
   */
  const handleStartDateChange = useCallback(
    (date: string) => {
      store.setFormData({ startDate: date });
    },
    [store]
  );

  /**
   * Handle start time change
   */
  const handleStartTimeChange = useCallback(
    (time: string) => {
      store.setFormData({ startTime: time });
    },
    [store]
  );

  /**
   * Handle final date change
   */
  const handleFinalDateChange = useCallback(
    (date: string) => {
      store.setFormData({ finalDate: date });
    },
    [store]
  );

  /**
   * Handle final time change
   */
  const handleFinalTimeChange = useCallback(
    (time: string) => {
      store.setFormData({ finalTime: time });
    },
    [store]
  );

  /**
   * Handle retry option change
   */
  const handleRetryChange = useCallback(
    (value: string) => {
      store.setFormData({ canRetry: value === 'yes' });
    },
    [store]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    const isValid = store.validateAllSteps();
    if (!isValid) return;

    try {
      const formData = store.formData as SendActivityFormData;
      await onSubmit(formData);
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error('Falha ao enviar atividade:', error);
      }
    }
  }, [store, onSubmit, onError]);

  /**
   * Handle cancel button click
   */
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  /**
   * Render error message helper
   */
  const renderError = (error?: string) => {
    if (!error) return null;
    return (
      <Text
        as="p"
        size="sm"
        color="text-error-600"
        className="flex items-center gap-1 mt-1"
      >
        <WarningCircleIcon size={16} />
        {error}
      </Text>
    );
  };

  /**
   * Render Step 1 - Activity
   */
  const renderActivityStep = () => (
    <div className="flex flex-col gap-6">
      {/* Activity Type Selection */}
      <div>
        <Text size="sm" weight="medium" color="text-text-700" className="mb-3">
          Tipo de atividade*
        </Text>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPE_OPTIONS.map((type) => (
            <Chips
              key={type.value}
              selected={store.formData.subtype === type.value}
              onClick={() => handleActivityTypeSelect(type.value)}
            >
              {type.label}
            </Chips>
          ))}
        </div>
        {renderError(store.errors.subtype)}
      </div>

      {/* Title Input */}
      <Input
        label="Título"
        placeholder="Digite o título da atividade"
        value={store.formData.title || ''}
        onChange={handleTitleChange}
        variant="rounded"
        required
        errorMessage={store.errors.title}
      />

      {/* Notification Message */}
      <TextArea
        label="Mensagem da notificação"
        placeholder="Digite uma mensagem para a notificação (opcional)"
        value={store.formData.notification || ''}
        onChange={handleNotificationChange}
      />
    </div>
  );

  /**
   * Render Step 2 - Recipient using CheckboxGroup
   */
  const renderRecipientStep = () => {
    // Use store categories if available, otherwise use initial categories
    const categoriesToRender =
      storeCategories.length > 0 ? storeCategories : initialCategories;

    return (
      <div className="flex flex-col gap-4">
        <Text size="sm" weight="medium" color="text-text-700">
          Para quem você vai enviar a atividade?
        </Text>

        <div
          className={cn(
            'max-h-[300px] overflow-y-auto',
            'scrollbar-thin scrollbar-thumb-border-300 scrollbar-track-transparent'
          )}
        >
          <CheckboxGroup
            categories={categoriesToRender}
            onCategoriesChange={handleCategoriesChange}
            compactSingleItem={true}
            showDivider={true}
          />
        </div>

        {renderError(store.errors.students)}
      </div>
    );
  };

  /**
   * Render Step 3 - Deadline
   */
  const renderDeadlineStep = () => (
    <div className="flex flex-col gap-4 sm:gap-6 pt-6">
      {/* Date/Time Row - Side by Side */}
      <div className="grid grid-cols-2 gap-2">
        <DateTimeInput
          label="Iniciar em*"
          date={store.formData.startDate || ''}
          time={store.formData.startTime || ''}
          onDateChange={handleStartDateChange}
          onTimeChange={handleStartTimeChange}
          errorMessage={store.errors.startDate}
          defaultTime="00:00"
          testId="start-datetime"
          className="w-full"
        />

        <DateTimeInput
          label="Finalizar até*"
          date={store.formData.finalDate || ''}
          time={store.formData.finalTime || ''}
          onDateChange={handleFinalDateChange}
          onTimeChange={handleFinalTimeChange}
          errorMessage={store.errors.finalDate}
          defaultTime="23:59"
          testId="final-datetime"
          className="w-full"
        />
      </div>

      {/* Retry Option */}
      <div>
        <Text size="sm" weight="medium" color="text-text-700" className="mb-3">
          Permitir refazer?
        </Text>
        <RadioGroup
          value={store.formData.canRetry ? 'yes' : 'no'}
          onValueChange={handleRetryChange}
          className="flex flex-row gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="yes" id="radio-item-yes" />
            <Text
              as="label"
              size="sm"
              color="text-text-700"
              className="cursor-pointer"
              htmlFor="radio-item-yes"
            >
              Sim
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="no" id="radio-item-no" />
            <Text
              as="label"
              size="sm"
              color="text-text-700"
              className="cursor-pointer"
              htmlFor="radio-item-no"
            >
              Não
            </Text>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  /**
   * Render current step content
   */
  const renderStepContent = () => {
    switch (store.currentStep) {
      case 1:
        return renderActivityStep();
      case 2:
        return renderRecipientStep();
      case 3:
        return renderDeadlineStep();
      default:
        return null;
    }
  };

  /**
   * Render footer buttons
   */
  const renderFooter = () => (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 w-full">
      <Button
        variant="link"
        action="primary"
        onClick={handleCancel}
        className="w-full sm:w-auto"
      >
        Cancelar
      </Button>

      <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {store.currentStep > 1 && (
          <Button
            variant="outline"
            action="primary"
            onClick={store.previousStep}
            iconLeft={<CaretLeftIcon size={16} />}
            className="w-full sm:w-auto"
          >
            Anterior
          </Button>
        )}

        {store.currentStep < 3 ? (
          <Button
            variant="solid"
            action="primary"
            onClick={() => store.nextStep()}
            iconRight={<ArrowRightIcon size={16} />}
            className="w-full sm:w-auto"
          >
            Próximo
          </Button>
        ) : (
          <Button
            variant="solid"
            action="primary"
            onClick={handleSubmit}
            disabled={isLoading}
            iconLeft={<PaperPlaneTiltIcon size={16} />}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Enviando...' : 'Enviar atividade'}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar atividade"
      size="md"
      footer={renderFooter()}
      contentClassName="flex flex-col gap-8 sm:gap-10 max-h-[70vh] overflow-y-auto"
    >
      {/* Stepper */}
      <Stepper
        steps={STEPPER_STEPS}
        currentStep={store.currentStep - 1}
        size="small"
      />

      {/* Step Content */}
      {renderStepContent()}
    </Modal>
  );
};

export default SendActivityModal;
