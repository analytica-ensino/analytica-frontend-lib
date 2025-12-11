import { useCallback, useEffect, useState, useRef, ChangeEvent } from 'react';
import {
  CaretLeftIcon,
  ArrowRightIcon,
  PaperPlaneTiltIcon,
  WarningCircleIcon,
  CalendarBlankIcon,
} from '@phosphor-icons/react';
import DropdownMenu, {
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '../DropdownMenu/DropdownMenu';
import Calendar from '../Calendar/Calendar';
import Modal from '../Modal/Modal';
import Stepper from '../Stepper/Stepper';
import Button from '../Button/Button';
import Chips from '../Chips/Chips';
import Input from '../Input/Input';
import TextArea from '../TextArea/TextArea';
import Text from '../Text/Text';
import { RadioGroup, RadioGroupItem } from '../Radio/Radio';
import { CheckboxGroup } from '../CheckBoxGroup/CheckBoxGroup';
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

/**
 * Helper to format Date object to YYYY-MM-DD string
 */
const formatDateToInput = (dateObj: Date): string => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SendActivityModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories: initialCategories,
  onCategoriesChange,
  isLoading = false,
}: SendActivityModalProps) => {
  const store = useSendActivityModalStore();
  const reset = useSendActivityModalStore((state) => state.reset);
  const setCategories = useSendActivityModalStore(
    (state) => state.setCategories
  );
  const storeCategories = useSendActivityModalStore(
    (state) => state.categories
  );

  // Calendar dropdown state
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isFinalCalendarOpen, setIsFinalCalendarOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    undefined
  );
  const [selectedFinalDate, setSelectedFinalDate] = useState<Date | undefined>(
    undefined
  );

  // Refs for dropdown triggers (used for portal positioning)
  const startTriggerRef = useRef<HTMLButtonElement>(null);
  const finalTriggerRef = useRef<HTMLButtonElement>(null);

  /**
   * Initialize categories when modal opens
   */
  useEffect(() => {
    if (isOpen && initialCategories.length > 0) {
      // Only initialize if store categories are empty
      if (storeCategories.length === 0) {
        setCategories(initialCategories);
      }
    }
  }, [isOpen, initialCategories, storeCategories.length, setCategories]);

  /**
   * Reset store when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      reset();
      setIsStartCalendarOpen(false);
      setIsFinalCalendarOpen(false);
      setSelectedStartDate(undefined);
      setSelectedFinalDate(undefined);
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
   * Handle start datetime change (from datetime-local input)
   */
  const handleStartDateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value?.includes('T')) {
        const [date, time] = value.split('T');
        store.setFormData({ startDate: date, startTime: time });
      } else if (value) {
        store.setFormData({ startDate: value });
      } else {
        store.setFormData({ startDate: '', startTime: '00:00' });
      }
    },
    [store]
  );

  /**
   * Handle start time change (from time input inside dropdown)
   */
  const handleStartTimeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      store.setFormData({ startTime: e.target.value });
    },
    [store]
  );

  /**
   * Handle final datetime change (from datetime-local input)
   */
  const handleFinalDateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value?.includes('T')) {
        const [date, time] = value.split('T');
        store.setFormData({ finalDate: date, finalTime: time });
      } else if (value) {
        store.setFormData({ finalDate: value });
      } else {
        store.setFormData({ finalDate: '', finalTime: '23:59' });
      }
    },
    [store]
  );

  /**
   * Handle final time change (from time input inside dropdown)
   */
  const handleFinalTimeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      store.setFormData({ finalTime: e.target.value });
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
   * Handle start date selection from calendar
   */
  const handleStartDateSelect = useCallback(
    (dateObj: Date) => {
      setSelectedStartDate(dateObj);
      store.setFormData({ startDate: formatDateToInput(dateObj) });
    },
    [store]
  );

  /**
   * Handle final date selection from calendar
   */
  const handleFinalDateSelect = useCallback(
    (dateObj: Date) => {
      setSelectedFinalDate(dateObj);
      store.setFormData({ finalDate: formatDateToInput(dateObj) });
    },
    [store]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    const isValid = store.validateAllSteps();
    if (!isValid) return;

    const formData = store.formData as SendActivityFormData;
    await onSubmit(formData);
  }, [store, onSubmit]);

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
        {/* Start DateTime */}
        <DropdownMenu
          open={isStartCalendarOpen}
          onOpenChange={setIsStartCalendarOpen}
        >
          <DropdownMenuTrigger className="w-full" ref={startTriggerRef}>
            <Input
              label="Iniciar em*"
              type="datetime-local"
              placeholder="00/00/0000"
              value={
                store.formData.startDate
                  ? `${store.formData.startDate}T${store.formData.startTime || '00:00'}`
                  : ''
              }
              onChange={handleStartDateChange}
              variant="rounded"
              errorMessage={store.errors.startDate}
              data-testid="start-datetime-input"
              iconRight={<CalendarBlankIcon size={14} />}
              className="[&::-webkit-calendar-picker-indicator]:hidden"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="p-0 z-[100]"
            portal
            triggerRef={startTriggerRef}
          >
            <Calendar
              variant="selection"
              selectedDate={selectedStartDate}
              onDateSelect={handleStartDateSelect}
              showActivities={false}
            />
            <div className="p-3 border-t border-border-200">
              <Input
                label="Hora"
                type="time"
                value={store.formData.startTime || '00:00'}
                onChange={handleStartTimeChange}
                variant="rounded"
                data-testid="start-time-input"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Final DateTime */}
        <DropdownMenu
          open={isFinalCalendarOpen}
          onOpenChange={setIsFinalCalendarOpen}
        >
          <DropdownMenuTrigger className="w-full" ref={finalTriggerRef}>
            <Input
              label="Finalizar até*"
              type="datetime-local"
              placeholder="00/00/0000"
              value={
                store.formData.finalDate
                  ? `${store.formData.finalDate}T${store.formData.finalTime || '23:59'}`
                  : ''
              }
              onChange={handleFinalDateChange}
              variant="rounded"
              errorMessage={store.errors.finalDate}
              data-testid="final-datetime-input"
              iconRight={<CalendarBlankIcon size={14} />}
              className="[&::-webkit-calendar-picker-indicator]:hidden"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="p-0 z-[100]"
            portal
            triggerRef={finalTriggerRef}
          >
            <Calendar
              variant="selection"
              selectedDate={selectedFinalDate}
              onDateSelect={handleFinalDateSelect}
              showActivities={false}
            />
            <div className="p-3 border-t border-border-200">
              <Input
                label="Hora"
                type="time"
                value={store.formData.finalTime || '23:59'}
                onChange={handleFinalTimeChange}
                variant="rounded"
                data-testid="final-time-input"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
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
            <RadioGroupItem value="yes" />
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
            <RadioGroupItem value="no" />
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
