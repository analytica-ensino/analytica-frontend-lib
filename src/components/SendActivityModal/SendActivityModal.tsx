import { useCallback, useEffect, ChangeEvent } from 'react';
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
import CheckBox from '../CheckBox/CheckBox';
import Text from '../Text/Text';
import { RadioGroup, RadioGroupItem } from '../Radio/Radio';
import { CardAccordation, AccordionGroup } from '../Accordation';
import { DatePickerInput } from '../DatePickerInput';
import { useSendActivityModalStore } from './hooks/useSendActivityModal';
import {
  SendActivityModalProps,
  ActivitySubtype,
  SendActivityFormData,
  ACTIVITY_TYPE_OPTIONS,
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
 * 2. Recipient - Select students from hierarchical structure
 * 3. Deadline - Set start/end dates and retry option
 */
const SendActivityModal = ({
  isOpen,
  onClose,
  onSubmit,
  recipients,
  isLoading = false,
}: SendActivityModalProps) => {
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
   * Check if recipients have a single path (one school, one year, one class)
   */
  const hasSinglePath = useCallback(() => {
    return (
      recipients.schools.length === 1 &&
      recipients.schools[0].schoolYears.length === 1 &&
      recipients.schools[0].schoolYears[0].classes.length === 1
    );
  }, [recipients]);

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
   * Render simple recipient list when professor has single school/year/class
   */
  const renderSimpleRecipientList = () => {
    const school = recipients.schools[0];
    const schoolYear = school.schoolYears[0];
    const classData = schoolYear.classes[0];
    const students = classData.students;

    const allSelected =
      students.length > 0 && students.every((s) => store.isStudentSelected(s));
    const someSelected = students.some((s) => store.isStudentSelected(s));

    return (
      <div className="flex flex-col pt-6">
        <Text size="sm" weight="medium" color="text-text-700">
          Para quem você vai enviar a atividade?
        </Text>

        <div className="overflow-hidden">
          {/* Select all row */}
          <div className="py-3 sm:py-3.5 px-4 sm:px-6 border-b border-border-200">
            <CheckBox
              label="Todos os alunos"
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={() => {
                students.forEach((student) => {
                  const isSelected = store.isStudentSelected(student);
                  if (
                    (allSelected && isSelected) ||
                    (!allSelected && !isSelected)
                  ) {
                    store.toggleStudent(student);
                  }
                });
              }}
              size="small"
            />
          </div>

          {/* Student list */}
          <div
            className={cn(
              'px-4 sm:px-6 py-3 sm:py-4 max-h-[180px] sm:max-h-[200px] overflow-y-auto',
              'scrollbar-thin scrollbar-thumb-border-300 scrollbar-track-transparent'
            )}
          >
            <div className="flex flex-col gap-2">
              {students.map((student) => (
                <CheckBox
                  key={`${student.studentId}-${student.userInstitutionId}`}
                  label={student.name}
                  checked={store.isStudentSelected(student)}
                  onChange={() => store.toggleStudent(student)}
                  size="small"
                />
              ))}
            </div>
          </div>
        </div>

        {renderError(store.errors.students)}
      </div>
    );
  };

  /**
   * Render Step 2 - Recipient with flat accordion structure
   */
  const renderRecipientStep = () => {
    // Simple list for single path (one school, one year, one class)
    if (hasSinglePath()) {
      return renderSimpleRecipientList();
    }

    // Complete hierarchy for multiple options
    return (
      <div className="flex flex-col gap-4">
        <Text size="sm" weight="medium" color="text-text-700">
          Para quem você vai enviar a atividade?
        </Text>

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
              className="border-0 border-b border-border-200 bg-transparent rounded-none"
              triggerClassName="py-3 sm:py-3.5 px-4 sm:px-6"
              contentClassName="px-4 sm:px-6 pt-3 pb-2"
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
                      const isSelected = store.isSchoolFilterSelected(
                        school.id
                      );
                      if (
                        (allSelected && isSelected) ||
                        (!allSelected && !isSelected)
                      ) {
                        store.toggleSchoolFilter(school.id);
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
                'border-0 border-b border-border-200 bg-transparent rounded-none',
                !hasSelectedSchools && 'opacity-40'
              )}
              triggerClassName="py-3 sm:py-3.5 px-4 sm:px-6"
              contentClassName="px-4 sm:px-6 pt-3 pb-2"
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
                      const isSelected = store.isSchoolYearFilterSelected(
                        schoolYear.id
                      );
                      if (
                        (allSelected && isSelected) ||
                        (!allSelected && !isSelected)
                      ) {
                        store.toggleSchoolYearFilter(schoolYear.id);
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
                  <Text size="sm" color="text-text-500" className="italic">
                    Selecione uma escola primeiro
                  </Text>
                )}
              </div>
            </CardAccordation>

            {/* Turma Accordion */}
            <CardAccordation
              value="turma"
              className={cn(
                'border-0 border-b border-border-200 bg-transparent rounded-none',
                !hasSelectedSchoolYears && 'opacity-40'
              )}
              triggerClassName="py-3 sm:py-3.5 px-4 sm:px-6"
              contentClassName="px-4 sm:px-6 pt-3 pb-2"
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
                      const isSelected = store.isClassFilterSelected(
                        classData.id
                      );
                      if (
                        (allSelected && isSelected) ||
                        (!allSelected && !isSelected)
                      ) {
                        store.toggleClassFilter(classData.id);
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
                  <Text size="sm" color="text-text-500" className="italic">
                    Selecione uma série primeiro
                  </Text>
                )}
              </div>
            </CardAccordation>

            {/* Alunos Accordion */}
            <CardAccordation
              value="alunos"
              className={cn(
                'border-0 border-b border-border-200 bg-transparent rounded-none',
                !hasSelectedClasses && 'opacity-40'
              )}
              triggerClassName="py-3 sm:py-3.5 px-4 sm:px-6"
              contentClassName="px-4 sm:px-6 pt-3 pb-2"
              trigger={
                <CheckBox
                  label="Alunos"
                  checked={
                    hasSelectedClasses &&
                    getAvailableStudents().length > 0 &&
                    getAvailableStudents().every((s) =>
                      store.isStudentSelected(s)
                    )
                  }
                  indeterminate={
                    hasSelectedClasses &&
                    getAvailableStudents().some((s) =>
                      store.isStudentSelected(s)
                    ) &&
                    !getAvailableStudents().every((s) =>
                      store.isStudentSelected(s)
                    )
                  }
                  onChange={(e) => {
                    e.stopPropagation();
                    if (!hasSelectedClasses) return;
                    const allSelected = getAvailableStudents().every((s) =>
                      store.isStudentSelected(s)
                    );
                    getAvailableStudents().forEach((student) => {
                      const isSelected = store.isStudentSelected(student);
                      if (
                        (allSelected && isSelected) ||
                        (!allSelected && !isSelected)
                      ) {
                        store.toggleStudent(student);
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
                    checked={store.isStudentSelected(student)}
                    onChange={() => store.toggleStudent(student)}
                    size="small"
                  />
                ))}
                {getAvailableStudents().length === 0 && (
                  <Text size="sm" color="text-text-500" className="italic">
                    Selecione uma turma primeiro
                  </Text>
                )}
              </div>
            </CardAccordation>
          </AccordionGroup>
        </div>

        {renderError(store.errors.students)}
      </div>
    );
  };

  /**
   * Render Step 3 - Deadline
   */
  const renderDeadlineStep = () => (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Start Date */}
      <DatePickerInput
        label="Iniciar em*"
        value={store.formData.startDate}
        onChange={handleStartDateChange}
        error={store.errors.startDate}
        showTime
        testId="start-date-picker"
      />

      {/* Final Date */}
      <DatePickerInput
        label="Finalizar até*"
        value={store.formData.finalDate}
        onChange={handleFinalDateChange}
        error={store.errors.finalDate}
        showTime
        testId="final-date-picker"
      />

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
      contentClassName="flex flex-col gap-4 sm:gap-6 max-h-[70vh] overflow-y-auto"
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
