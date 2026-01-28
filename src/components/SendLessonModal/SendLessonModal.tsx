import { useCallback, useEffect, useRef, ChangeEvent } from 'react';
import Modal from '../Modal/Modal';
import Stepper from '../Stepper/Stepper';
import Input from '../Input/Input';
import TextArea from '../TextArea/TextArea';
import { useSendLessonModalStore } from './hooks/useSendLessonModal';
import {
  SendLessonModalProps,
  SendLessonFormData,
  CategoryConfig,
} from './types';
import { calculateFormattedItemsForAutoSelection } from '../CheckBoxGroup/CheckBoxGroup.helpers';
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
  { id: 'lesson', label: 'Aula', state: 'pending' as const },
  { id: 'recipient', label: 'Destinatário', state: 'pending' as const },
  { id: 'deadline', label: 'Prazo', state: 'pending' as const },
];

/**
 * Modal configuration constants
 */
const MAX_STEPS = 3;
const ENTITY_NAME = 'aula';
const ENTITY_NAME_WITH_ARTICLE = 'a aula';

/**
 * SendLessonModal component for sending lessons to students
 *
 * A multi-step modal with 3 steps:
 * 1. Lesson - Enter title and optional notification message
 * 2. Recipient - Select students from hierarchical structure using CheckboxGroup
 * 3. Deadline - Set start/end dates
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
   * Apply the same "single visible option" auto-selection behavior that the CheckboxGroup
   * applies internally, but during initialization.
   *
   * This fixes the scenario where the first category (e.g. Escola) is rendered in compact
   * mode (single item) and therefore has no UI affordance to manually select it, leaving
   * dependent categories disabled.
   */
  const applyChainedAutoSelection = useCallback(
    (categories: CategoryConfig[]): CategoryConfig[] => {
      let current = categories;
      let safety = 0;
      let changed = true;

      while (changed && safety < categories.length + 2) {
        safety += 1;
        changed = false;

        const next = current.map((category) => {
          const filteredItems = calculateFormattedItemsForAutoSelection(
            category,
            current
          );

          const hasNoSelection =
            !category.selectedIds || category.selectedIds.length === 0;

          if (filteredItems.length === 1 && hasNoSelection) {
            changed = true;
            return { ...category, selectedIds: [filteredItems[0].id] };
          }

          return category;
        });

        current = next;
      }

      return current;
    },
    []
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
      const autoSelectedCategories =
        applyChainedAutoSelection(initialCategories);
      setCategories(autoSelectedCategories);
      // Trigger onCategoriesChange to allow parent to fetch students if needed
      // This is important when auto-selection happens (e.g., single school/series/class)
      if (onCategoriesChange) {
        onCategoriesChange(autoSelectedCategories);
      }
      categoriesInitialized.current = true;
    }
  }, [
    isOpen,
    initialCategories,
    setCategories,
    applyChainedAutoSelection,
    onCategoriesChange,
  ]);

  /**
   * Sync categories from parent when they change (e.g., after fetching students)
   * This ensures the store is updated when parent updates categories
   */
  useEffect(() => {
    if (
      isOpen &&
      initialCategories.length > 0 &&
      categoriesInitialized.current
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
  }, [isOpen, initialCategories, storeCategories, setCategories]);

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
   * Render Step 1 - Lesson (unique to SendLessonModal)
   */
  const renderLessonStep = () => (
    <div className="flex flex-col gap-6">
      {/* Title Input */}
      <Input
        label="Título"
        placeholder="Digite o título da aula"
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
   * Render current step content
   */
  const renderStepContent = () => {
    // Use store categories if available, otherwise use initial categories
    const categoriesToRender =
      storeCategories.length > 0 ? storeCategories : initialCategories;

    switch (store.currentStep) {
      case 1:
        return renderLessonStep();
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
    : 'Enviar aula recomendada';

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
