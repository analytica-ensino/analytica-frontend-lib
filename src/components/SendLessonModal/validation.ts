import { SendLessonFormData, StepErrors } from './types';

/**
 * Validates Step 1 - Recipient (students selection)
 */
function validateRecipientStep(
  formData: Partial<SendLessonFormData>
): StepErrors {
  const errors: StepErrors = {};

  if (!formData.students || formData.students.length === 0) {
    errors.students = 'Selecione pelo menos um destinatário';
  }

  return errors;
}

/**
 * Validates Step 2 - Deadline (dates)
 */
function validateDeadlineStep(
  formData: Partial<SendLessonFormData>
): StepErrors {
  const errors: StepErrors = {};

  if (!formData.startDate) {
    errors.startDate = 'Data de início é obrigatória';
  }

  if (!formData.finalDate) {
    errors.finalDate = 'Data final é obrigatória';
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
      errors.finalDate = 'A data final deve ser posterior à data de início';
    }
  }

  return errors;
}

/**
 * Validates a specific step
 * @param step - Step number (1 or 2)
 * @param formData - Current form data
 * @returns Validation errors for the step
 */
export function validateStep(
  step: number,
  formData: Partial<SendLessonFormData>
): StepErrors {
  switch (step) {
    case 1:
      return validateRecipientStep(formData);
    case 2:
      return validateDeadlineStep(formData);
    default:
      return {};
  }
}
