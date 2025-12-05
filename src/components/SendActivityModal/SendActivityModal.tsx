import React, { useCallback, useEffect } from 'react';
import {
  CaretLeft,
  ArrowRight,
  PaperPlaneTilt,
  WarningCircle,
} from '@phosphor-icons/react';
import Modal from '../Modal/Modal';
import Stepper from '../Stepper/Stepper';
import Button from '../Button/Button';
import Chips from '../Chips/Chips';
import Input from '../Input/Input';
import TextArea from '../TextArea/TextArea';
import CheckBox from '../CheckBox/CheckBox';
import { RadioGroup, RadioGroupItem } from '../Radio/Radio';
import { CardAccordation, AccordionGroup } from '../Accordation';
import { DatePickerInput } from '../DatePickerInput';
import { useSendActivityModalStore } from './hooks/useSendActivityModal';
import {
  SendActivityModalProps,
  ActivitySubtype,
  ClassData,
  SchoolYearData,
  SchoolData,
  SendActivityFormData,
} from './types';
import { cn } from '../../utils/utils';

/**
 * Activity type options for step 1
 */
const ACTIVITY_TYPES: Array<{ value: ActivitySubtype; label: string }> = [
  { value: 'TAREFA', label: 'Tarefa' },
  { value: 'TRABALHO', label: 'Trabalho' },
  { value: 'PROVA', label: 'Prova' },
];

/**
 * SendActivityModal component for sending activities to students
 *
 * A multi-step modal with 3 steps:
 * 1. Activity - Select type, title, and optional notification message
 * 2. Recipient - Select students from hierarchical structure
 * 3. Deadline - Set start/end dates and retry option
 */
const SendActivityModal: React.FC<SendActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  recipients,
  isLoading = false,
}) => {
  const store = useSendActivityModalStore();
  const reset = useSendActivityModalStore((state) => state.reset);

  /**
   * Reset store when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      store.setFormData({ title: e.target.value });
    },
    [store]
  );

  /**
   * Handle notification message change
   */
  const handleNotificationChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      store.setFormData({ notification: e.target.value });
    },
    [store]
  );

  /**
   * Handle start date change
   */
  const handleStartDateChange = useCallback(
    (date: Date) => {
      store.setFormData({ startDate: date });
    },
    [store]
  );

  /**
   * Handle final date change
   */
  const handleFinalDateChange = useCallback(
    (date: Date) => {
      store.setFormData({ finalDate: date });
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
    const isValid = store.validateCurrentStep();
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
      <p className="flex items-center gap-1 text-sm text-error-600 mt-1">
        <WarningCircle size={16} />
        {error}
      </p>
    );
  };

  /**
   * Render Step 1 - Activity
   */
  const renderActivityStep = () => (
    <div className="flex flex-col gap-6">
      {/* Activity Type Selection */}
      <div>
        <p className="text-sm font-medium text-text-700 mb-3">
          Tipo de atividade*
        </p>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPES.map((type) => (
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
   * Render student checkbox
   */
  const renderStudentCheckbox = (student: {
    studentId: string;
    userInstitutionId: string;
    name: string;
  }) => (
    <div
      key={`${student.studentId}-${student.userInstitutionId}`}
      className="py-1"
    >
      <CheckBox
        label={student.name}
        checked={store.isStudentSelected(student.studentId)}
        onChange={() => store.toggleStudent(student)}
        size="small"
      />
    </div>
  );

  /**
   * Render class accordion
   */
  const renderClassAccordion = (classData: ClassData) => (
    <CardAccordation
      key={classData.id}
      value={classData.id}
      className="bg-background rounded-xl"
      trigger={
        <CheckBox
          label={classData.name}
          checked={store.isClassSelected(classData)}
          onChange={(e) => {
            e.stopPropagation();
            store.toggleClass(classData);
          }}
          size="small"
        />
      }
    >
      <div className="pl-4 flex flex-col">
        {classData.students.map(renderStudentCheckbox)}
      </div>
    </CardAccordation>
  );

  /**
   * Render school year accordion
   */
  const renderSchoolYearAccordion = (schoolYear: SchoolYearData) => (
    <CardAccordation
      key={schoolYear.id}
      value={schoolYear.id}
      className="bg-background rounded-xl"
      trigger={
        <CheckBox
          label={schoolYear.name}
          checked={store.isSchoolYearSelected(schoolYear)}
          onChange={(e) => {
            e.stopPropagation();
            store.toggleSchoolYear(schoolYear);
          }}
          size="small"
        />
      }
    >
      <div className="pl-4 flex flex-col gap-2">
        {schoolYear.classes.map(renderClassAccordion)}
      </div>
    </CardAccordation>
  );

  /**
   * Render school accordion
   */
  const renderSchoolAccordion = (school: SchoolData) => (
    <CardAccordation
      key={school.id}
      value={school.id}
      className="bg-background rounded-xl"
      trigger={
        <CheckBox
          label={school.name}
          checked={store.isSchoolSelected(school)}
          onChange={(e) => {
            e.stopPropagation();
            store.toggleSchool(school);
          }}
          size="small"
        />
      }
    >
      <div className="pl-4 flex flex-col gap-2">
        {school.schoolYears.map(renderSchoolYearAccordion)}
      </div>
    </CardAccordation>
  );

  /**
   * Render Step 2 - Recipient
   */
  const renderRecipientStep = () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-text-700">
        Para quem você vai enviar a atividade?
      </p>

      {/* Select All */}
      <div className="border-b border-border-200 pb-3">
        <CheckBox
          label="Todos os alunos"
          checked={store.areAllStudentsSelected(recipients)}
          onChange={() => {
            if (store.areAllStudentsSelected(recipients)) {
              store.clearSelection();
            } else {
              store.selectAllStudents(recipients);
            }
          }}
          size="small"
        />
      </div>

      {/* Recipients Hierarchy */}
      <div
        className={cn(
          'max-h-[300px] overflow-y-auto',
          'scrollbar-thin scrollbar-thumb-border-300 scrollbar-track-transparent'
        )}
      >
        <AccordionGroup type="multiple" className="space-y-2">
          {recipients.schools.map(renderSchoolAccordion)}
        </AccordionGroup>
      </div>

      {renderError(store.errors.students)}

      {/* Selected count */}
      <p className="text-xs text-text-500">
        {store.selectedStudentIds.size} aluno(s) selecionado(s)
      </p>
    </div>
  );

  /**
   * Render Step 3 - Deadline
   */
  const renderDeadlineStep = () => (
    <div className="flex flex-col gap-6">
      {/* Start Date */}
      <DatePickerInput
        label="Iniciar em*"
        value={store.formData.startDate}
        onChange={handleStartDateChange}
        error={store.errors.startDate}
        testId="start-date-picker"
      />

      {/* Final Date */}
      <DatePickerInput
        label="Finalizar até*"
        value={store.formData.finalDate}
        onChange={handleFinalDateChange}
        error={store.errors.finalDate}
        minDate={store.formData.startDate}
        testId="final-date-picker"
      />

      {/* Retry Option */}
      <div>
        <p className="text-sm font-medium text-text-700 mb-3">
          Permitir refazer?
        </p>
        <RadioGroup
          value={store.formData.canRetry ? 'yes' : 'no'}
          onValueChange={handleRetryChange}
          className="flex flex-row gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="yes" />
            <label
              htmlFor="radio-item-yes"
              className="text-sm text-text-700 cursor-pointer"
            >
              Sim
            </label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="no" />
            <label
              htmlFor="radio-item-no"
              className="text-sm text-text-700 cursor-pointer"
            >
              Não
            </label>
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
    <div className="flex items-center justify-between w-full">
      <Button variant="link" action="primary" onClick={handleCancel}>
        Cancelar
      </Button>

      <div className="flex items-center gap-3">
        {store.currentStep > 1 && (
          <Button
            variant="outline"
            action="primary"
            onClick={store.previousStep}
            iconLeft={<CaretLeft size={16} />}
          >
            Anterior
          </Button>
        )}

        {store.currentStep < 3 ? (
          <Button
            variant="solid"
            action="primary"
            onClick={() => store.nextStep()}
            iconRight={<ArrowRight size={16} />}
          >
            Próximo
          </Button>
        ) : (
          <Button
            variant="solid"
            action="primary"
            onClick={handleSubmit}
            disabled={isLoading}
            iconRight={<PaperPlaneTilt size={16} />}
          >
            {isLoading ? 'Enviando...' : 'Enviar atividade'}
          </Button>
        )}
      </div>
    </div>
  );

  /**
   * Stepper steps configuration
   */
  const steps = [
    { id: 'activity', label: 'Atividade', state: 'pending' as const },
    { id: 'recipient', label: 'Destinatário', state: 'pending' as const },
    { id: 'deadline', label: 'Prazo', state: 'pending' as const },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar atividade"
      size="md"
      footer={renderFooter()}
      contentClassName="flex flex-col gap-6"
    >
      {/* Stepper */}
      <Stepper steps={steps} currentStep={store.currentStep - 1} size="small" />

      {/* Step Content */}
      {renderStepContent()}
    </Modal>
  );
};

export default SendActivityModal;
