import { useCallback, useEffect, useRef, ChangeEvent } from 'react';
import Modal from '../Modal/Modal';
import Stepper from '../Stepper/Stepper';
import Chips from '../Chips/Chips';
import Input from '../Input/Input';
import TextArea from '../TextArea/TextArea';
import Text from '../Text/Text';
import { RadioGroup, RadioGroupItem } from '../Radio/Radio';
import { useSendActivityModalStore } from './hooks/useSendActivityModal';
import {
  SendActivityModalProps,
  SendActivityModalInitialData,
  ActivitySubtype,
  SendActivityFormData,
  ACTIVITY_TYPE_OPTIONS,
  CategoryConfig,
} from './types';
import {
  RecipientStep,
  DeadlineStep,
  SendModalFooter,
  SendModalError,
  useDateTimeHandlers,
  useCategoryInitialization,
} from '../shared/SendModalBase';

/**
 * Stepper steps configuration
 */
const STEPPER_STEPS = [
  { id: 'activity', label: 'Atividade', state: 'pending' as const },
  { id: 'recipient', label: 'Destinatário', state: 'pending' as const },
  { id: 'deadline', label: 'Prazo', state: 'pending' as const },
];

/**
 * Modal configuration constants
 */
const MAX_STEPS = 3;
const ENTITY_NAME = 'atividade';
const ENTITY_NAME_WITH_ARTICLE = 'a atividade';

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
  initialData,
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
   * Track the previous initialData reference to detect changes
   */
  const prevInitialDataRef = useRef<SendActivityModalInitialData | undefined>(
    undefined
  );

  /**
   * Initialize categories with auto-selection when modal opens
   */
  useCategoryInitialization({
    isOpen,
    initialCategories,
    setCategories,
    onCategoriesChange,
  });

  /**
   * Get categoriesInitialized ref from hook
   */
  const { categoriesInitializedRef } = useCategoryInitialization({
    isOpen,
    initialCategories,
    setCategories,
    onCategoriesChange,
  });

  /**
   * Sync categories from parent when they change (e.g., after fetching students)
   * This ensures the store is updated when parent updates categories
   */
  useEffect(() => {
    if (
      isOpen &&
      initialCategories.length > 0 &&
      categoriesInitializedRef.current
    ) {
      // Only sync if categories have students (indicates they were fetched)
      const studentsCategory = initialCategories.find(
        (c) => c.key === 'students'
      );
      const storeStudentsCategory = storeCategories.find(
        (c) => c.key === 'students'
      );

      // If parent has students but store doesn't, or vice versa, sync
      const parentHasStudents =
        studentsCategory?.itens && studentsCategory.itens.length > 0;
      const storeHasStudents =
        storeStudentsCategory?.itens && storeStudentsCategory.itens.length > 0;

      if (parentHasStudents !== storeHasStudents || parentHasStudents) {
        // Update store with parent categories to sync students
        setCategories(initialCategories);
      }
    }
  }, [
    isOpen,
    initialCategories,
    storeCategories,
    setCategories,
    categoriesInitializedRef,
  ]);

  /**
   * Apply initial data when modal opens with new data
   */
  useEffect(() => {
    if (isOpen && initialData && prevInitialDataRef.current !== initialData) {
      store.setFormData({
        title: initialData.title ?? '',
        subtype: initialData.subtype ?? 'TAREFA',
        notification: initialData.notification ?? '',
      });
      prevInitialDataRef.current = initialData;
    }
  }, [isOpen, initialData, store]);

  /**
   * Reset store when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      reset();
      prevInitialDataRef.current = undefined;
    }
  }, [isOpen, reset]);

  /**
   * Date/time change handlers from shared hook
   */
  const {
    handleStartDateChange,
    handleStartTimeChange,
    handleFinalDateChange,
    handleFinalTimeChange,
  } = useDateTimeHandlers({ setFormData: store.setFormData });

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
   * Render Step 1 - Activity (unique to SendActivityModal)
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
        <SendModalError error={store.errors.subtype} />
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
   * Render retry option for deadline step
   */
  const renderRetryOption = () => (
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
  );

  /**
   * Render current step content
   */
  const renderStepContent = () => {
    // Use store categories if available, otherwise use initial categories
    const categoriesToRender =
      storeCategories.length > 0 ? storeCategories : initialCategories;

    switch (store.currentStep) {
      case 1:
        return renderActivityStep();
      case 2:
        return (
          <RecipientStep
            categories={categoriesToRender}
            onCategoriesChange={handleCategoriesChange}
            entityNameWithArticle={ENTITY_NAME_WITH_ARTICLE}
            studentsError={store.errors.students}
          />
        );
      case 3:
        return (
          <DeadlineStep
            startDate={store.formData.startDate || ''}
            startTime={store.formData.startTime || ''}
            finalDate={store.formData.finalDate || ''}
            finalTime={store.formData.finalTime || ''}
            onStartDateChange={handleStartDateChange}
            onStartTimeChange={handleStartTimeChange}
            onFinalDateChange={handleFinalDateChange}
            onFinalTimeChange={handleFinalTimeChange}
            errors={{
              startDate: store.errors.startDate,
              finalDate: store.errors.finalDate,
            }}
          >
            {renderRetryOption()}
          </DeadlineStep>
        );
      default:
        return null;
    }
  };

  /**
   * Render footer with navigation buttons
   */
  const renderFooter = () => (
    <SendModalFooter
      currentStep={store.currentStep}
      maxSteps={MAX_STEPS}
      isLoading={isLoading}
      onCancel={handleCancel}
      onPreviousStep={store.previousStep}
      onNextStep={() => store.nextStep()}
      onSubmit={handleSubmit}
      entityName={ENTITY_NAME}
    />
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
