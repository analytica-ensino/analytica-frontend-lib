import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';

// Re-export types from CheckboxGroup for easier imports
export type { CategoryConfig, Item } from '../CheckBoxGroup/CheckBoxGroup';

/**
 * Activity subtype matching backend SIMULATION_SUBTYPE
 */
export type ActivitySubtype = 'TAREFA' | 'TRABALHO' | 'PROVA';

/**
 * Activity type options for UI selection
 */
export const ACTIVITY_TYPE_OPTIONS: ReadonlyArray<{
  value: ActivitySubtype;
  label: string;
}> = [
  { value: 'TAREFA', label: 'Tarefa' },
  { value: 'TRABALHO', label: 'Trabalho' },
  { value: 'PROVA', label: 'Prova' },
] as const;

/**
 * Form data structure for sending activity
 */
export interface SendActivityFormData {
  /** Activity subtype (Step 1) */
  subtype: ActivitySubtype;
  /** Activity title (Step 1) */
  title: string;
  /** Notification message (Step 1) */
  notification?: string;
  /** Array of students to send activity to (Step 2) */
  students: Array<{
    studentId: string;
    userInstitutionId: string;
  }>;
  /** Start date in YYYY-MM-DD format (Step 3) */
  startDate: string;
  /** Start time in HH:MM format (Step 3) */
  startTime: string;
  /** End date in YYYY-MM-DD format (Step 3) */
  finalDate: string;
  /** End time in HH:MM format (Step 3) */
  finalTime: string;
  /** Allow retry flag (Step 3) */
  canRetry: boolean;
}

/**
 * Modal props
 */
export interface SendActivityModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when activity is submitted */
  onSubmit: (data: SendActivityFormData) => Promise<void>;
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
 * Step validation errors
 */
export interface StepErrors {
  subtype?: string;
  title?: string;
  students?: string;
  startDate?: string;
  startTime?: string;
  finalDate?: string;
  finalTime?: string;
}

/**
 * Step state for stepper
 */
export type StepState = 'pending' | 'current' | 'completed';

/**
 * Step configuration
 */
export interface StepConfig {
  label: string;
  state: StepState;
}
