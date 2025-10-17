import type { AlertData, CategoryConfig, StepConfig } from './types';

/**
 * Valida o step de mensagem
 */
export const validateMessageStep = (formData: AlertData): boolean | string => {
  if (!formData.title?.trim()) return 'Título é obrigatório';
  if (!formData.message?.trim()) return 'Mensagem é obrigatória';
  return true;
};

/**
 * Valida o step de destinatários
 */
export const validateRecipientsStep = (
  categories: CategoryConfig[]
): boolean | string => {
  if (categories.length === 0) return 'Nenhuma categoria configurada';
  const lastCategory = categories[categories.length - 1];
  if (!lastCategory.selectedIds?.length) return 'Selecione destinatários';
  return true;
};

/**
 * Valida o step de data
 */
export const validateDateStep = (formData: AlertData): boolean | string => {
  if (!formData.sendToday && !formData.date) return 'Data é obrigatória';
  return true;
};

/**
 * Verifica se pode finalizar o formulário
 */
export const canFinish = (
  formData: AlertData,
  categories: CategoryConfig[]
): boolean => {
  return (
    validateMessageStep(formData) === true &&
    validateRecipientsStep(categories) === true &&
    validateDateStep(formData) === true
  );
};

/**
 * Verifica se o step atual é válido
 */
export const isCurrentStepValid = (
  currentStep: number,
  formData: AlertData,
  categories: CategoryConfig[],
  customSteps?: StepConfig[]
): boolean => {
  let isValid = false;
  switch (currentStep) {
    case 0:
      isValid = validateMessageStep(formData) === true;
      break;
    case 1:
      isValid = validateRecipientsStep(categories) === true;
      break;
    case 2:
      isValid = validateDateStep(formData) === true;
      break;
    case 3:
      isValid = true;
      break;
    default: {
      const currentStepConfig = customSteps?.[currentStep];
      isValid = currentStepConfig?.validate
        ? currentStepConfig.validate(formData) === true
        : true;
    }
  }

  return isValid;
};

/**
 * Valida e avança para o próximo step
 */
export const handleNext = (
  currentStep: number,
  steps: StepConfig[],
  formData: AlertData,
  categories: CategoryConfig[],
  customSteps?: StepConfig[],
  completedSteps: number[] = [],
  setCompletedSteps?: (steps: number[]) => void,
  setCurrentStep?: (step: number) => void
): { success: boolean; error?: string } => {
  if (currentStep < steps.length - 1) {
    let validation: boolean | string = true;

    switch (currentStep) {
      case 0:
        validation = validateMessageStep(formData);
        break;
      case 1:
        validation = validateRecipientsStep(categories);
        break;
      case 2:
        validation = validateDateStep(formData);
        break;
      case 3:
        validation = true;
        break;
      default: {
        const currentStepConfig = customSteps?.[currentStep];
        validation = currentStepConfig?.validate
          ? currentStepConfig.validate(formData)
          : true;
      }
    }

    if (validation !== true) {
      console.error('Validação falhou:', validation);
      const errorMessage =
        typeof validation === 'string'
          ? validation
          : 'Preencha todos os campos obrigatórios';

      return { success: false, error: errorMessage };
    }

    if (setCompletedSteps && !completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (setCurrentStep) {
      setCurrentStep(currentStep + 1);
    }

    return { success: true };
  }

  return { success: false, error: 'Já está no último step' };
};
