import { useCallback, useEffect, useRef } from 'react';
import {
  CaretLeftIcon,
  ArrowRightIcon,
  PaperPlaneTiltIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import Modal from '../Modal/Modal';
import Stepper from '../Stepper/Stepper';
import Button from '../Button/Button';
import Text from '../Text/Text';
import { CheckboxGroup } from '../CheckBoxGroup/CheckBoxGroup';
import DateTimeInput from '../DateTimeInput/DateTimeInput';
import { useSendLessonModalStore } from './hooks/useSendLessonModal';
import {
  SendLessonModalProps,
  SendLessonFormData,
  CategoryConfig,
} from './types';
import { cn } from '../../utils/utils';

/**
 * Stepper steps configuration
 */
const STEPPER_STEPS = [
  { id: 'recipient', label: 'Destinatário', state: 'pending' as const },
  { id: 'deadline', label: 'Prazo', state: 'pending' as const },
];

/**
 * SendLessonModal component for sending lessons to students
 *
 * A multi-step modal with 2 steps:
 * 1. Recipient - Select students from hierarchical structure using CheckboxGroup
 * 2. Deadline - Set start/end dates
 */
const SendLessonModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories: initialCategories,
  onCategoriesChange,
  isLoading = false,
  onError,
  modelTitle,
}: SendLessonModalProps) => {
  const store = useSendLessonModalStore();
  const reset = useSendLessonModalStore((state) => state.reset);
  const setCategories = useSendLessonModalStore((state) => state.setCategories);
  const storeCategories = useSendLessonModalStore((state) => state.categories);

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
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    const isValid = store.validateAllSteps();
    if (!isValid) return;

    try {
      const formData = store.formData as SendLessonFormData;
      await onSubmit(formData);
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error('Falha ao enviar aula:', error);
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
   * Render Step 1 - Recipient using CheckboxGroup
   */
  const renderRecipientStep = () => {
    // Use store categories if available, otherwise use initial categories
    const categoriesToRender =
      storeCategories.length > 0 ? storeCategories : initialCategories;

    return (
      <div className="flex flex-col gap-4">
        <Text size="sm" weight="medium" color="text-text-700">
          Para quem você vai enviar a aula?
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
   * Render Step 2 - Deadline
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
    </div>
  );

  /**
   * Render current step content
   */
  const renderStepContent = () => {
    switch (store.currentStep) {
      case 1:
        return renderRecipientStep();
      case 2:
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

        {store.currentStep < 2 ? (
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
            {isLoading ? 'Enviando...' : 'Enviar aula'}
          </Button>
        )}
      </div>
    </div>
  );

  const modalTitle = modelTitle ? `Enviar aula: ${modelTitle}` : 'Enviar aula';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
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

export default SendLessonModal;
