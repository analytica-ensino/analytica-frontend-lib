import type { AlertData, CategoryConfig, StepConfig } from './types';

/**
 * Parâmetros para a função handleNext
 */
interface HandleNextParams {
  currentStep: number;
  steps: StepConfig[];
  formData: AlertData;
  categories: CategoryConfig[];
  customSteps?: StepConfig[];
  completedSteps?: number[];
  setCompletedSteps?: (steps: number[]) => void;
  setCurrentStep?: (step: number) => void;
}

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
  const lastCategory = categories.at(-1);
  if (!lastCategory?.selectedIds?.length) return 'Selecione destinatários';
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
 * Valida o step atual
 */
export const validateCurrentStep = (
  currentStep: number,
  formData: AlertData,
  categories: CategoryConfig[],
  customSteps?: StepConfig[]
): boolean | string => {
  switch (currentStep) {
    case 0:
      return validateMessageStep(formData);
    case 1:
      return validateRecipientsStep(categories);
    case 2:
      return validateDateStep(formData);
    case 3:
      return true;
    default: {
      const currentStepConfig = customSteps?.[currentStep - 4]; // Ajusta para o índice correto dos custom steps
      return currentStepConfig?.validate
        ? currentStepConfig.validate(formData)
        : true;
    }
  }
};

/**
 * Avança para o próximo step
 */
export const advanceToNextStep = (
  currentStep: number,
  completedSteps: number[],
  setCompletedSteps?: (steps: number[]) => void,
  setCurrentStep?: (step: number) => void
): void => {
  if (setCompletedSteps && !completedSteps.includes(currentStep)) {
    setCompletedSteps([...completedSteps, currentStep]);
  }

  if (setCurrentStep) {
    setCurrentStep(currentStep + 1);
  }
};

/**
 * Valida e avança para o próximo step
 */
export const handleNext = ({
  currentStep,
  steps,
  formData,
  categories,
  customSteps,
  completedSteps = [],
  setCompletedSteps,
  setCurrentStep,
}: HandleNextParams): { success: boolean; error?: string } => {
  if (currentStep >= steps.length - 1) {
    return { success: false, error: 'Já está no último step' };
  }

  const validation = validateCurrentStep(
    currentStep,
    formData,
    categories,
    customSteps
  );

  if (validation !== true) {
    console.error('Validação falhou:', validation);
    const errorMessage =
      typeof validation === 'string'
        ? validation
        : 'Preencha todos os campos obrigatórios';

    return { success: false, error: errorMessage };
  }

  advanceToNextStep(
    currentStep,
    completedSteps,
    setCompletedSteps,
    setCurrentStep
  );
  return { success: true };
};
