import { z } from 'zod';
import { ActivitySubtype, SendActivityFormData, StepErrors } from './types';

/**
 * Error messages for validation
 */
export const ERROR_MESSAGES = {
  SUBTYPE_REQUIRED:
    'Campo obrigatório! Por favor, selecione uma opção para continuar.',
  MODE_REQUIRED:
    'Campo obrigatório! Por favor, selecione o modo de prova para continuar.',
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
 * Zod schema for activity step (Step 1)
 */
export const activityStepSchema = z.object({
  subtype: z.enum(
    [ActivitySubtype.TAREFA, ActivitySubtype.TRABALHO, ActivitySubtype.PROVA],
    { error: () => ERROR_MESSAGES.SUBTYPE_REQUIRED }
  ),
  title: z
    .string({ error: () => ERROR_MESSAGES.TITLE_REQUIRED })
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: ERROR_MESSAGES.TITLE_REQUIRED,
    }),
  notification: z.string().optional(),
});

/**
 * Zod schema for recipient step (Step 2)
 */
export const recipientStepSchema = z.object({
  students: z
    .array(
      z.object({
        studentId: z.string(),
        userInstitutionId: z.string(),
      }),
      {
        error: () => ERROR_MESSAGES.STUDENTS_REQUIRED,
      }
    )
    .min(1, ERROR_MESSAGES.STUDENTS_REQUIRED),
});

/**
 * Regex patterns for date and time validation
 */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

/**
 * Zod schema for deadline step (Step 3) - base validation
 */
const deadlineStepBaseSchema = z.object({
  startDate: z
    .string({
      error: () => ERROR_MESSAGES.START_DATE_REQUIRED,
    })
    .min(1, ERROR_MESSAGES.START_DATE_REQUIRED)
    .regex(DATE_REGEX, ERROR_MESSAGES.START_DATE_REQUIRED),
  startTime: z.string().regex(TIME_REGEX).default('00:00'),
  finalDate: z
    .string({
      error: () => ERROR_MESSAGES.FINAL_DATE_REQUIRED,
    })
    .min(1, ERROR_MESSAGES.FINAL_DATE_REQUIRED)
    .regex(DATE_REGEX, ERROR_MESSAGES.FINAL_DATE_REQUIRED),
  finalTime: z.string().regex(TIME_REGEX).default('23:59'),
  canRetry: z.boolean().default(false),
});

/**
 * Zod schema for deadline step with date comparison refinement
 */
export const deadlineStepSchema = deadlineStepBaseSchema.refine(
  (data) => {
    const start = new Date(`${data.startDate}T${data.startTime}`);
    const end = new Date(`${data.finalDate}T${data.finalTime}`);
    return end >= start;
  },
  { message: ERROR_MESSAGES.FINAL_DATE_INVALID, path: ['finalDate'] }
);

/**
 * Type inference from Zod schemas
 */
export type ActivityStepData = z.infer<typeof activityStepSchema>;
export type RecipientStepData = z.infer<typeof recipientStepSchema>;
export type DeadlineStepData = z.infer<typeof deadlineStepSchema>;

/**
 * Validates the activity step (Step 1) using Zod
 * @param data - Partial form data
 * @param options - Validation options
 * @param options.enableExamMode - When true, only validates title (exam mode has simplified form)
 * @returns StepErrors object with any validation errors
 */
export function validateActivityStep(
  data: Partial<SendActivityFormData>,
  options?: { enableExamMode?: boolean }
): StepErrors {
  const errors: StepErrors = {};

  // In exam mode, only validate title
  if (options?.enableExamMode) {
    if (!data.title || data.title.trim().length === 0) {
      errors.title = ERROR_MESSAGES.TITLE_REQUIRED;
    }
    return errors;
  }

  // Activity mode: full validation
  const result = activityStepSchema.safeParse({
    subtype: data.subtype,
    title: data.title,
    notification: data.notification,
  });

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof StepErrors;
      if (field === 'subtype' || field === 'title') {
        errors[field] = issue.message;
      }
    });
  }

  if (
    options?.enableExamMode &&
    data.subtype === ActivitySubtype.PROVA &&
    !data.mode
  ) {
    errors.mode = ERROR_MESSAGES.MODE_REQUIRED;
  }

  return errors;
}

/**
 * Validates the recipient step (Step 2) using Zod
 * @param data - Partial form data
 * @returns StepErrors object with any validation errors
 */
export function validateRecipientStep(
  data: Partial<SendActivityFormData>
): StepErrors {
  const errors: StepErrors = {};

  const result = recipientStepSchema.safeParse({
    students: data.students ?? [],
  });

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      if (issue.path[0] === 'students') {
        errors.students = issue.message;
      }
    });
  }

  return errors;
}

/**
 * Validates the deadline step (Step 3) using Zod
 * @param data - Partial form data
 * @param options - Validation options
 * @param options.enableExamMode - When true, only validates startDate (exam date)
 * @returns StepErrors object with any validation errors
 */
export function validateDeadlineStep(
  data: Partial<SendActivityFormData>,
  options?: { enableExamMode?: boolean }
): StepErrors {
  const errors: StepErrors = {};

  // In exam mode, only validate startDate (exam date)
  if (options?.enableExamMode) {
    if (!data.startDate) {
      errors.startDate = ERROR_MESSAGES.START_DATE_REQUIRED;
    }
    return errors;
  }

  // Activity mode: full validation
  // First validate individual fields
  if (!data.startDate) {
    errors.startDate = ERROR_MESSAGES.START_DATE_REQUIRED;
  }

  if (!data.finalDate) {
    errors.finalDate = ERROR_MESSAGES.FINAL_DATE_REQUIRED;
  }

  // If both dates exist, validate with the full schema (including refinement)
  if (data.startDate && data.finalDate) {
    const result = deadlineStepSchema.safeParse({
      startDate: data.startDate,
      startTime: data.startTime ?? '00:00',
      finalDate: data.finalDate,
      finalTime: data.finalTime ?? '23:59',
      canRetry: data.canRetry ?? false,
    });

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof StepErrors;
        if (field === 'startDate' || field === 'finalDate') {
          errors[field] = issue.message;
        }
      });
    }
  }

  return errors;
}

/**
 * Validates a specific step
 * @param step - Step number (1, 2, or 3)
 * @param data - Partial form data
 * @param options - Validation options passed to step validators
 * @returns StepErrors object with any validation errors
 */
export function validateStep(
  step: number,
  data: Partial<SendActivityFormData>,
  options?: { enableExamMode?: boolean }
): StepErrors {
  switch (step) {
    case 1:
      return validateActivityStep(data, options);
    case 2:
      return validateRecipientStep(data);
    case 3:
      return validateDeadlineStep(data, options);
    default:
      return {};
  }
}

/**
 * Checks if a specific step is valid
 * @param step - Step number (1, 2, or 3)
 * @param data - Partial form data
 * @param options - Validation options
 * @returns true if the step is valid
 */
export function isStepValid(
  step: number,
  data: Partial<SendActivityFormData>,
  options?: { enableExamMode?: boolean }
): boolean {
  const errors = validateStep(step, data, options);
  return Object.keys(errors).length === 0;
}

/**
 * Checks if all steps are valid (form can be submitted)
 * @param data - Partial form data
 * @param options - Validation options
 * @returns true if all steps are valid
 */
export function isFormValid(
  data: Partial<SendActivityFormData>,
  options?: { enableExamMode?: boolean }
): boolean {
  return (
    isStepValid(1, data, options) &&
    isStepValid(2, data) &&
    isStepValid(3, data, options)
  );
}
