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
   * Get all school years from schools with filter selected
   */
  const getAvailableSchoolYears = useCallback(() => {
    const filteredSchools = recipients.schools.filter((school) =>
      store.isSchoolFilterSelected(school.id)
    );
    return filteredSchools.flatMap((school) => school.schoolYears);
  }, [recipients.schools, store]);

  /**
   * Get all classes from school years with filter selected
   */
  const getAvailableClasses = useCallback(() => {
    const availableSchoolYears = getAvailableSchoolYears();
    const filteredSchoolYears = availableSchoolYears.filter((schoolYear) =>
      store.isSchoolYearFilterSelected(schoolYear.id)
    );
    return filteredSchoolYears.flatMap((schoolYear) => schoolYear.classes);
  }, [getAvailableSchoolYears, store]);

  /**
   * Get all students from classes with filter selected
   */
  const getAvailableStudents = useCallback(() => {
    const availableClasses = getAvailableClasses();
    const filteredClasses = availableClasses.filter((classData) =>
      store.isClassFilterSelected(classData.id)
    );
    return filteredClasses.flatMap((classData) => classData.students);
  }, [getAvailableClasses, store]);

  /**
   * Check if any school filter is selected
   */
  const hasSelectedSchools = recipients.schools.some((school) =>
    store.isSchoolFilterSelected(school.id)
  );

  /**
   * Check if any school year filter is selected
   */
  const hasSelectedSchoolYears = getAvailableSchoolYears().some((schoolYear) =>
    store.isSchoolYearFilterSelected(schoolYear.id)
  );

  /**
   * Check if any class filter is selected
   */
  const hasSelectedClasses = getAvailableClasses().some((classData) =>
    store.isClassFilterSelected(classData.id)
  );

  /**
   * Render Step 2 - Recipient with flat accordion structure
   */
  const renderRecipientStep = () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-text-700">
        Para quem você vai enviar a atividade?
      </p>

      {/* Flat accordion structure */}
      <div
        className={cn(
          'max-h-[300px] overflow-y-auto',
          'scrollbar-thin scrollbar-thumb-border-300 scrollbar-track-transparent'
        )}
      >
        <AccordionGroup type="multiple" className="flex flex-col">
          {/* Escola Accordion */}
          <CardAccordation
            value="escola"
            className="border-b border-border-200"
            triggerClassName="py-3.5 px-6"
            contentClassName="px-6 pt-3 pb-2"
            trigger={
              <CheckBox
                label="Escola"
                checked={
                  recipients.schools.length > 0 &&
                  recipients.schools.every((school) =>
                    store.isSchoolFilterSelected(school.id)
                  )
                }
                indeterminate={
                  recipients.schools.some((school) =>
                    store.isSchoolFilterSelected(school.id)
                  ) &&
                  !recipients.schools.every((school) =>
                    store.isSchoolFilterSelected(school.id)
                  )
                }
                onChange={(e) => {
                  e.stopPropagation();
                  const allSelected = recipients.schools.every((school) =>
                    store.isSchoolFilterSelected(school.id)
                  );
                  recipients.schools.forEach((school) => {
                    if (allSelected) {
                      if (store.isSchoolFilterSelected(school.id)) {
                        store.toggleSchoolFilter(school.id);
                      }
                    } else {
                      if (!store.isSchoolFilterSelected(school.id)) {
                        store.toggleSchoolFilter(school.id);
                      }
                    }
                  });
                }}
                size="small"
              />
            }
          >
            <div className="pl-4 flex flex-col gap-2">
              {recipients.schools.map((school) => (
                <CheckBox
                  key={school.id}
                  label={school.name}
                  checked={store.isSchoolFilterSelected(school.id)}
                  onChange={() => store.toggleSchoolFilter(school.id)}
                  size="small"
                />
              ))}
            </div>
          </CardAccordation>

          {/* Série Accordion */}
          <CardAccordation
            value="serie"
            className={cn(
              'border-b border-border-200',
              !hasSelectedSchools && 'opacity-40'
            )}
            triggerClassName="py-3.5 px-6"
            contentClassName="px-6 pt-3 pb-2"
            trigger={
              <CheckBox
                label="Série"
                checked={
                  hasSelectedSchools &&
                  getAvailableSchoolYears().length > 0 &&
                  getAvailableSchoolYears().every((sy) =>
                    store.isSchoolYearFilterSelected(sy.id)
                  )
                }
                indeterminate={
                  hasSelectedSchools &&
                  getAvailableSchoolYears().some((sy) =>
                    store.isSchoolYearFilterSelected(sy.id)
                  ) &&
                  !getAvailableSchoolYears().every((sy) =>
                    store.isSchoolYearFilterSelected(sy.id)
                  )
                }
                onChange={(e) => {
                  e.stopPropagation();
                  if (!hasSelectedSchools) return;
                  const allSelected = getAvailableSchoolYears().every((sy) =>
                    store.isSchoolYearFilterSelected(sy.id)
                  );
                  getAvailableSchoolYears().forEach((schoolYear) => {
                    if (allSelected) {
                      if (store.isSchoolYearFilterSelected(schoolYear.id)) {
                        store.toggleSchoolYearFilter(schoolYear.id);
                      }
                    } else {
                      if (!store.isSchoolYearFilterSelected(schoolYear.id)) {
                        store.toggleSchoolYearFilter(schoolYear.id);
                      }
                    }
                  });
                }}
                size="small"
                disabled={!hasSelectedSchools}
              />
            }
          >
            <div className="pl-4 flex flex-col gap-2">
              {getAvailableSchoolYears().map((schoolYear) => (
                <CheckBox
                  key={schoolYear.id}
                  label={schoolYear.name}
                  checked={store.isSchoolYearFilterSelected(schoolYear.id)}
                  onChange={() => store.toggleSchoolYearFilter(schoolYear.id)}
                  size="small"
                />
              ))}
              {getAvailableSchoolYears().length === 0 && (
                <p className="text-sm text-text-500 italic">
                  Selecione uma escola primeiro
                </p>
              )}
            </div>
          </CardAccordation>

          {/* Turma Accordion */}
          <CardAccordation
            value="turma"
            className={cn(
              'border-b border-border-200',
              !hasSelectedSchoolYears && 'opacity-40'
            )}
            triggerClassName="py-3.5 px-6"
            contentClassName="px-6 pt-3 pb-2"
            trigger={
              <CheckBox
                label="Turma"
                checked={
                  hasSelectedSchoolYears &&
                  getAvailableClasses().length > 0 &&
                  getAvailableClasses().every((c) =>
                    store.isClassFilterSelected(c.id)
                  )
                }
                indeterminate={
                  hasSelectedSchoolYears &&
                  getAvailableClasses().some((c) =>
                    store.isClassFilterSelected(c.id)
                  ) &&
                  !getAvailableClasses().every((c) =>
                    store.isClassFilterSelected(c.id)
                  )
                }
                onChange={(e) => {
                  e.stopPropagation();
                  if (!hasSelectedSchoolYears) return;
                  const allSelected = getAvailableClasses().every((c) =>
                    store.isClassFilterSelected(c.id)
                  );
                  getAvailableClasses().forEach((classData) => {
                    if (allSelected) {
                      if (store.isClassFilterSelected(classData.id)) {
                        store.toggleClassFilter(classData.id);
                      }
                    } else {
                      if (!store.isClassFilterSelected(classData.id)) {
                        store.toggleClassFilter(classData.id);
                      }
                    }
                  });
                }}
                size="small"
                disabled={!hasSelectedSchoolYears}
              />
            }
          >
            <div className="pl-4 flex flex-col gap-2">
              {getAvailableClasses().map((classData) => (
                <CheckBox
                  key={classData.id}
                  label={classData.name}
                  checked={store.isClassFilterSelected(classData.id)}
                  onChange={() => store.toggleClassFilter(classData.id)}
                  size="small"
                />
              ))}
              {getAvailableClasses().length === 0 && (
                <p className="text-sm text-text-500 italic">
                  Selecione uma série primeiro
                </p>
              )}
            </div>
          </CardAccordation>

          {/* Alunos Accordion */}
          <CardAccordation
            value="alunos"
            className={cn(
              'border-b border-border-200',
              !hasSelectedClasses && 'opacity-40'
            )}
            triggerClassName="py-3.5 px-6"
            contentClassName="px-6 pt-3 pb-2"
            trigger={
              <CheckBox
                label="Alunos"
                checked={
                  hasSelectedClasses &&
                  getAvailableStudents().length > 0 &&
                  getAvailableStudents().every((s) =>
                    store.isStudentSelected(s.studentId)
                  )
                }
                indeterminate={
                  hasSelectedClasses &&
                  getAvailableStudents().some((s) =>
                    store.isStudentSelected(s.studentId)
                  ) &&
                  !getAvailableStudents().every((s) =>
                    store.isStudentSelected(s.studentId)
                  )
                }
                onChange={(e) => {
                  e.stopPropagation();
                  if (!hasSelectedClasses) return;
                  const allSelected = getAvailableStudents().every((s) =>
                    store.isStudentSelected(s.studentId)
                  );
                  getAvailableStudents().forEach((student) => {
                    if (allSelected) {
                      if (store.isStudentSelected(student.studentId)) {
                        store.toggleStudent(student);
                      }
                    } else {
                      if (!store.isStudentSelected(student.studentId)) {
                        store.toggleStudent(student);
                      }
                    }
                  });
                }}
                size="small"
                disabled={!hasSelectedClasses}
              />
            }
          >
            <div className="pl-4 flex flex-col gap-2">
              {getAvailableStudents().map((student) => (
                <CheckBox
                  key={`${student.studentId}-${student.userInstitutionId}`}
                  label={student.name}
                  checked={store.isStudentSelected(student.studentId)}
                  onChange={() => store.toggleStudent(student)}
                  size="small"
                />
              ))}
              {getAvailableStudents().length === 0 && (
                <p className="text-sm text-text-500 italic">
                  Selecione uma turma primeiro
                </p>
              )}
            </div>
          </CardAccordation>
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
