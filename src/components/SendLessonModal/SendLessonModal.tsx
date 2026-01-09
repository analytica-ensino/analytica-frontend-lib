import { useCallback, useEffect, useRef } from 'react';
import Modal from '../Modal/Modal';
import Stepper from '../Stepper/Stepper';
import { useSendLessonModalStore } from './hooks/useSendLessonModal';
import {
  SendLessonModalProps,
  SendLessonFormData,
  CategoryConfig,
} from './types';
import {
  RecipientStep,
  DeadlineStep,
  SendModalFooter,
  useDateTimeHandlers,
} from '../shared/SendModalBase';

/**
 * Stepper steps configuration
 */
const STEPPER_STEPS = [
  { id: 'recipient', label: 'Destinatário', state: 'pending' as const },
  { id: 'deadline', label: 'Prazo', state: 'pending' as const },
];

/**
 * Modal configuration constants
 */
const MAX_STEPS = 2;
const ENTITY_NAME = 'aula';
const ENTITY_NAME_WITH_ARTICLE = 'a aula';

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
  modalTitle: modalTitleProp,
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
   * Render current step content
   */
  const renderStepContent = () => {
    // Use store categories if available, otherwise use initial categories
    const categoriesToRender =
      storeCategories.length > 0 ? storeCategories : initialCategories;

    switch (store.currentStep) {
      case 1:
        return (
          <RecipientStep
            categories={categoriesToRender}
            onCategoriesChange={handleCategoriesChange}
            entityNameWithArticle={ENTITY_NAME_WITH_ARTICLE}
            studentsError={store.errors.students}
          />
        );
      case 2:
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
          />
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

  const modalTitle = modalTitleProp
    ? `Enviar aula: ${modalTitleProp}`
    : 'Enviar aula';

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
