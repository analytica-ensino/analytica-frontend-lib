import { SendActivityFormData, StepErrors } from './types';

/**
 * Error messages for validation
 */
export const ERROR_MESSAGES = {
  SUBTYPE_REQUIRED:
    'Campo obrigatório! Por favor, selecione uma opção para continuar.',
  TITLE_REQUIRED:
    'Campo obrigatório! Por favor, preencha este campo para continuar.',
  STUDENTS_REQUIRED:
    'Campo obrigatório! Por favor, selecione pelo menos um aluno para continuar.',
  START_DATE_REQUIRED:
    'Campo obrigatório! Por favor, preencha este campo para continuar.',
  FINAL_DATE_REQUIRED:
    'Campo obrigatório! Por favor, preencha este campo para continuar.',
  FINAL_DATE_INVALID: 'A data final deve ser maior ou igual à data inicial.',
} as const;

/**
 * Validates the activity step (Step 1)
 * @param data - Partial form data
 * @returns StepErrors object with any validation errors
 */
export function validateActivityStep(
  data: Partial<SendActivityFormData>
): StepErrors {
  const errors: StepErrors = {};

  if (!data.subtype) {
    errors.subtype = ERROR_MESSAGES.SUBTYPE_REQUIRED;
  }

  if (!data.title?.trim()) {
    errors.title = ERROR_MESSAGES.TITLE_REQUIRED;
  }

  return errors;
}

/**
 * Validates the recipient step (Step 2)
 * @param data - Partial form data
 * @returns StepErrors object with any validation errors
 */
export function validateRecipientStep(
  data: Partial<SendActivityFormData>
): StepErrors {
  const errors: StepErrors = {};

  if (!data.students || data.students.length === 0) {
    errors.students = ERROR_MESSAGES.STUDENTS_REQUIRED;
  }

  return errors;
}

/**
 * Validates the deadline step (Step 3)
 * @param data - Partial form data
 * @returns StepErrors object with any validation errors
 */
export function validateDeadlineStep(
  data: Partial<SendActivityFormData>
): StepErrors {
  const errors: StepErrors = {};

  if (!data.startDate) {
    errors.startDate = ERROR_MESSAGES.START_DATE_REQUIRED;
  }

  if (!data.finalDate) {
    errors.finalDate = ERROR_MESSAGES.FINAL_DATE_REQUIRED;
  }

  if (data.startDate && data.finalDate && data.finalDate < data.startDate) {
    errors.finalDate = ERROR_MESSAGES.FINAL_DATE_INVALID;
  }

  return errors;
}

/**
 * Validates a specific step
 * @param step - Step number (1, 2, or 3)
 * @param data - Partial form data
 * @returns StepErrors object with any validation errors
 */
export function validateStep(
  step: number,
  data: Partial<SendActivityFormData>
): StepErrors {
  switch (step) {
    case 1:
      return validateActivityStep(data);
    case 2:
      return validateRecipientStep(data);
    case 3:
      return validateDeadlineStep(data);
    default:
      return {};
  }
}

/**
 * Checks if a specific step is valid
 * @param step - Step number (1, 2, or 3)
 * @param data - Partial form data
 * @returns true if the step is valid
 */
export function isStepValid(
  step: number,
  data: Partial<SendActivityFormData>
): boolean {
  const errors = validateStep(step, data);
  return Object.keys(errors).length === 0;
}

/**
 * Checks if all steps are valid (form can be submitted)
 * @param data - Partial form data
 * @returns true if all steps are valid
 */
export function isFormValid(data: Partial<SendActivityFormData>): boolean {
  return isStepValid(1, data) && isStepValid(2, data) && isStepValid(3, data);
}
