import { SendLessonFormData, StepErrors } from './types';

/**
 * Error messages for validation
 */
export const ERROR_MESSAGES = {
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
 * Validates Step 1 - Lesson (title and notification)
 */
function validateLessonStep(formData: Partial<SendLessonFormData>): StepErrors {
  const errors: StepErrors = {};

  if (!formData.title || formData.title.trim().length === 0) {
    errors.title = ERROR_MESSAGES.TITLE_REQUIRED;
  }

  return errors;
}

/**
 * Validates Step 2 - Recipient (students selection)
 */
function validateRecipientStep(
  formData: Partial<SendLessonFormData>
): StepErrors {
  const errors: StepErrors = {};

  if (!formData.students || formData.students.length === 0) {
    errors.students = ERROR_MESSAGES.STUDENTS_REQUIRED;
  }

  return errors;
}

/**
 * Validates Step 3 - Deadline (dates)
 */
function validateDeadlineStep(
  formData: Partial<SendLessonFormData>
): StepErrors {
  const errors: StepErrors = {};

  if (!formData.startDate) {
    errors.startDate = ERROR_MESSAGES.START_DATE_REQUIRED;
  }

  if (!formData.finalDate) {
    errors.finalDate = ERROR_MESSAGES.FINAL_DATE_REQUIRED;
  }

  // Validate date range
  if (formData.startDate && formData.finalDate) {
    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime || '00:00'}`
    );
    const finalDateTime = new Date(
      `${formData.finalDate}T${formData.finalTime || '23:59'}`
    );

    if (finalDateTime <= startDateTime) {
      errors.finalDate = ERROR_MESSAGES.FINAL_DATE_INVALID;
    }
  }

  return errors;
}

/**
 * Validates a specific step
 * @param step - Step number (1, 2, or 3)
 * @param formData - Current form data
 * @returns Validation errors for the step
 */
export function validateStep(
  step: number,
  formData: Partial<SendLessonFormData>
): StepErrors {
  switch (step) {
    case 1:
      return validateLessonStep(formData);
    case 2:
      return validateRecipientStep(formData);
    case 3:
      return validateDeadlineStep(formData);
    default:
      return {};
  }
}
