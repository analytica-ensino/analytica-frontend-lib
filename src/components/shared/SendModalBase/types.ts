import type { CategoryConfig } from '../../CheckBoxGroup/CheckBoxGroup';

// Re-export types from CheckboxGroup for easier imports
export type { CategoryConfig, Item } from '../../CheckBoxGroup/CheckBoxGroup';

/**
 * Student recipient data structure
 */
export interface StudentRecipient {
  /** Student ID */
  studentId: string;
  /** User institution ID */
  userInstitutionId: string;
}

/**
 * Base form data structure for date/time fields
 * Both SendLessonModal and SendActivityModal use this base
 */
export interface BaseDateTimeFormData {
  /** Start date in YYYY-MM-DD format */
  startDate: string;
  /** Start time in HH:MM format */
  startTime: string;
  /** End date in YYYY-MM-DD format */
  finalDate: string;
  /** End time in HH:MM format */
  finalTime: string;
}

/**
 * Base form data structure with students
 */
export interface BaseFormDataWithStudents extends BaseDateTimeFormData {
  /** Array of students to send to */
  students: StudentRecipient[];
}

/**
 * Base step validation errors for date/time fields
 */
export interface BaseDateTimeErrors {
  /** Start date error message */
  startDate?: string;
  /** Start time error message */
  startTime?: string;
  /** Final date error message */
  finalDate?: string;
  /** Final time error message */
  finalTime?: string;
}

/**
 * Base step validation errors with students
 */
export interface BaseStepErrors extends BaseDateTimeErrors {
  /** Students error message */
  students?: string;
}

/**
 * Step state for stepper
 */
export type StepState = 'pending' | 'current' | 'completed';

/**
 * Step configuration
 */
export interface StepConfig {
  /** Step label */
  label: string;
  /** Step state */
  state: StepState;
}

/**
 * Step definition for configuration
 */
export interface StepDefinition {
  /** Step identifier */
  id: string;
  /** Step label */
  label: string;
}

/**
 * Configuration for entity-specific text and behavior
 */
export interface SendModalConfig {
  /** Entity name for messages (e.g., "aula", "atividade") */
  entityName: string;
  /** Entity name for messages with article (e.g., "a aula", "a atividade") */
  entityNameWithArticle: string;
  /** data-testid attribute */
  testId: string;
  /** Modal title */
  title: string;
  /** Step definitions */
  steps: StepDefinition[];
  /** Maximum number of steps */
  maxSteps: number;
  /** Step number for recipient selection */
  recipientStepNumber: number;
  /** Step number for deadline configuration */
  deadlineStepNumber: number;
}

/**
 * Base store interface for SendModal stores
 * Generic type T represents the specific form data type
 * Generic type E represents the specific errors type
 */
export interface BaseSendModalStore<T, E> {
  /** Form data */
  formData: Partial<T>;
  /** Set form data */
  setFormData: (data: Partial<T>) => void;

  /** Current step number */
  currentStep: number;
  /** Array of completed step numbers */
  completedSteps: number[];
  /** Go to a specific step */
  goToStep: (step: number) => void;
  /** Go to next step (validates current step first) */
  nextStep: () => boolean;
  /** Go to previous step */
  previousStep: () => void;

  /** Validation errors */
  errors: E;
  /** Set errors */
  setErrors: (errors: E) => void;
  /** Validate current step */
  validateCurrentStep: () => boolean;
  /** Validate all steps */
  validateAllSteps: () => boolean;

  /** Categories state managed by CheckboxGroup */
  categories: CategoryConfig[];
  /** Update categories (called by CheckboxGroup) */
  setCategories: (categories: CategoryConfig[]) => void;

  /** Reset store to initial state */
  reset: () => void;
}

/**
 * Base modal props shared by both SendLessonModal and SendActivityModal
 */
export interface BaseSendModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Recipient categories configuration (same format as CheckboxGroup) */
  categories: CategoryConfig[];
  /** Callback when categories change (optional - for controlled state) */
  onCategoriesChange?: (categories: CategoryConfig[]) => void;
  /** Loading state for submit button */
  isLoading?: boolean;
  /** Callback when submission fails (optional - if not provided, error propagates) */
  onError?: (error: unknown) => void;
}

/**
 * Date/time change handler type
 */
export type DateTimeChangeHandler = (value: string) => void;

/**
 * Categories change handler type
 */
export type CategoriesChangeHandler = (categories: CategoryConfig[]) => void;
