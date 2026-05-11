import { useCallback, useEffect, useRef, ChangeEvent, useMemo } from 'react';
import Modal from '../Modal/Modal';
import Stepper from '../Stepper/Stepper';
import Chips from '../Chips/Chips';
import Input from '../Input/Input';
import TextArea from '../TextArea/TextArea';
import Text from '../Text/Text';
import { RadioGroup, RadioGroupItem } from '../Radio/Radio';
import DateTimeInput from '../DateTimeInput/DateTimeInput';
import { useSendActivityModalStore } from './hooks/useSendActivityModal';
import {
  SendActivityModalProps,
  SendActivityModalInitialData,
  ActivitySubtype,
  ActivityMode,
  SendActivityFormData,
  ACTIVITY_TYPE_OPTIONS,
  ACTIVITY_MODE_OPTIONS,
  CategoryConfig,
} from './types';
import {
  RecipientStep,
  DeadlineStep,
  SendModalFooter,
  SendModalError,
  useDateTimeHandlers,
  useCategoryInitialization,
  useCategorySync,
} from '../shared/SendModalBase';

/**
 * Stepper steps configuration for activity mode
 */
const ACTIVITY_STEPPER_STEPS = [
  { id: 'activity', label: 'Atividade', state: 'pending' as const },
  { id: 'recipient', label: 'Destinatário', state: 'pending' as const },
  { id: 'deadline', label: 'Prazo', state: 'pending' as const },
];

/**
 * Stepper steps configuration for exam mode
 */
const EXAM_STEPPER_STEPS = [
  { id: 'exam', label: 'Prova', state: 'pending' as const },
  { id: 'recipient', label: 'Destinatário', state: 'pending' as const },
  { id: 'deadline', label: 'Prazo', state: 'pending' as const },
];

/**
 * Modal configuration constants
 */
const MAX_STEPS = 3;

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
  enableExamMode = false,
  isInPersonExam = false,
}: SendActivityModalProps) => {
  const store = useSendActivityModalStore();
  const reset = useSendActivityModalStore((state) => state.reset);
  const setFormData = useSendActivityModalStore((state) => state.setFormData);
  const setCategories = useSendActivityModalStore(
    (state) => state.setCategories
  );
  const storeCategories = useSendActivityModalStore(
    (state) => state.categories
  );

  /**
   * Dynamic configuration based on exam mode
   */
  const isExamMode = enableExamMode || isInPersonExam;
  const stepperSteps = isExamMode ? EXAM_STEPPER_STEPS : ACTIVITY_STEPPER_STEPS;
  const modalTitle = isExamMode ? 'Enviar prova' : 'Enviar atividade';
  const entityName = isExamMode ? 'prova' : 'atividade';
  const entityNameWithArticle = isExamMode ? 'a prova' : 'a atividade';

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
   */
  useCategorySync({
    isOpen,
    initialCategories,
    storeCategories,
    setCategories,
    categoriesInitializedRef,
  });

  /**
   * Apply initial data when modal opens with new data
   */
  useEffect(() => {
    if (isOpen && initialData && prevInitialDataRef.current !== initialData) {
      setFormData({
        title: initialData.title ?? '',
        subtype: initialData.subtype ?? ActivitySubtype.TAREFA,
        notification: initialData.notification ?? '',
      });
      prevInitialDataRef.current = initialData;
    }
  }, [isOpen, initialData, setFormData]);

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
   * Auto-set subtype for exam mode (enableExamMode without isInPersonExam)
   */
  useEffect(() => {
    if (isOpen && enableExamMode && !isInPersonExam) {
      setFormData({
        subtype: ActivitySubtype.PROVA,
      });
    }
  }, [isOpen, enableExamMode, isInPersonExam, setFormData]);

  /**
   * Auto-set subtype and mode for in-person exam
   */
  useEffect(() => {
    if (isOpen && isInPersonExam) {
      setFormData({
        subtype: ActivitySubtype.PROVA,
        mode: ActivityMode.PRESENCIAL,
        canRetry: false,
      });
    }
  }, [isOpen, isInPersonExam, setFormData]);

  /**
   * Date/time change handlers from shared hook
   */
  const {
    handleStartDateChange,
    handleStartTimeChange,
    handleFinalDateChange,
    handleFinalTimeChange,
  } = useDateTimeHandlers({ setFormData });

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
   * Clears mode when switching away from PROVA
   */
  const handleActivityTypeSelect = useCallback(
    (subtype: ActivitySubtype) => {
      const update: Partial<SendActivityFormData> =
        subtype !== ActivitySubtype.PROVA
          ? { subtype, mode: undefined }
          : { subtype };
      setFormData(update);
    },
    [setFormData]
  );

  /**
   * Handle prova mode selection (Online / Presencial)
   */
  const handleModeSelect = useCallback(
    (mode: ActivityMode) => {
      const update: Partial<SendActivityFormData> =
        mode === ActivityMode.PRESENCIAL ? { mode, canRetry: false } : { mode };
      setFormData(update);
    },
    [setFormData]
  );

  /**
   * Handle title change
   */
  const handleTitleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFormData({ title: e.target.value });
    },
    [setFormData]
  );

  /**
   * Handle notification message change
   */
  const handleNotificationChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setFormData({ notification: e.target.value });
    },
    [setFormData]
  );

  /**
   * Handle retry option change
   */
  const handleRetryChange = useCallback(
    (value: string) => {
      setFormData({ canRetry: value === 'yes' });
    },
    [setFormData]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    // For in-person exams, always validate as exam mode since mode is auto-set
    const isValid = store.validateAllSteps(enableExamMode || isInPersonExam);
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
  }, [store, onSubmit, onError, enableExamMode, isInPersonExam]);

  /**
   * Handle cancel button click
   */
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  /**
   * Render Step 1 - Activity/Exam (unique to SendActivityModal)
   * In exam mode: only shows title input
   * In activity mode: shows type selection, title, and notification
   */
  const renderActivityStep = () => {
    // Exam mode: simplified step with only title
    if (isExamMode) {
      return (
        <div className="flex flex-col gap-6">
          <Input
            label="Título"
            placeholder="Digite o título da prova"
            value={store.formData.title || ''}
            onChange={handleTitleChange}
            variant="rounded"
            required
            errorMessage={store.errors.title}
          />
        </div>
      );
    }

    // Activity mode: full form
    return (
      <div className="flex flex-col gap-6">
        {/* Activity Type Selection - hidden for in-person exams (auto-set to PROVA) */}
        {!isInPersonExam && (
          <div>
            <Text
              size="sm"
              weight="medium"
              color="text-text-700"
              className="mb-3"
            >
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
        )}

        {/* In-person exam indicator */}
        {isInPersonExam && (
          <div>
            <Text
              size="sm"
              weight="medium"
              color="text-text-700"
              className="mb-3"
            >
              Tipo de atividade
            </Text>
            <Chips selected disabled>
              Prova Presencial
            </Chips>
          </div>
        )}

        {/* Prova Mode Selection — only visible when enableExamMode and subtype is PROVA and NOT in-person exam */}
        {enableExamMode &&
          !isInPersonExam &&
          store.formData.subtype === ActivitySubtype.PROVA && (
            <div>
              <Text
                size="sm"
                weight="medium"
                color="text-text-700"
                className="mb-3"
              >
                Modo de prova*
              </Text>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_MODE_OPTIONS.map((modeOption) => (
                  <Chips
                    key={modeOption.value}
                    selected={store.formData.mode === modeOption.value}
                    onClick={() => handleModeSelect(modeOption.value)}
                  >
                    {modeOption.label}
                  </Chips>
                ))}
              </div>
              <SendModalError error={store.errors.mode} />
            </div>
          )}

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
  };

  /**
   * Render retry option for deadline step
   * Hidden for in-person exams since retry is always disabled
   */
  const renderRetryOption = () => {
    if (
      isInPersonExam ||
      (enableExamMode && store.formData.mode === ActivityMode.PRESENCIAL)
    ) {
      return null;
    }

    return (
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
  };

  /**
   * Render simplified deadline step for exam mode
   * Only shows "Data da prova" field
   */
  const renderExamDeadlineStep = () => (
    <div className="flex flex-col gap-4 sm:gap-6 pt-6">
      <DateTimeInput
        label="Data da prova*"
        date={store.formData.startDate || ''}
        time={store.formData.startTime || ''}
        onDateChange={handleStartDateChange}
        onTimeChange={handleStartTimeChange}
        errorMessage={store.errors.startDate}
        defaultTime="08:00"
        testId="exam-datetime"
        className="w-full max-w-xs"
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
        return renderActivityStep();
      case 2:
        return (
          <RecipientStep
            categories={categoriesToRender}
            onCategoriesChange={handleCategoriesChange}
            entityNameWithArticle={entityNameWithArticle}
            studentsError={store.errors.students}
          />
        );
      case 3:
        // Exam mode: simplified deadline with only exam date
        if (isExamMode) {
          return renderExamDeadlineStep();
        }
        // Activity mode: full deadline with start/end dates and retry option
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
      onNextStep={() => store.nextStep(isExamMode)}
      onSubmit={handleSubmit}
      entityName={entityName}
    />
  );

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
        steps={stepperSteps}
        currentStep={store.currentStep - 1}
        size="small"
      />

      {/* Step Content */}
      {renderStepContent()}
    </Modal>
  );
};

export default SendActivityModal;
