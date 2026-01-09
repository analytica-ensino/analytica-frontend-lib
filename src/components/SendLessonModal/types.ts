import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';

// Re-export types from CheckboxGroup for easier imports
export type { CategoryConfig, Item } from '../CheckBoxGroup/CheckBoxGroup';

/**
 * Form data structure for sending lesson
 */
export interface SendLessonFormData {
  /** Array of students to send lesson to (Step 1) */
  students: Array<{
    studentId: string;
    userInstitutionId: string;
  }>;
  /** Start date in YYYY-MM-DD format (Step 2) */
  startDate: string;
  /** Start time in HH:MM format (Step 2) */
  startTime: string;
  /** End date in YYYY-MM-DD format (Step 2) */
  finalDate: string;
  /** End time in HH:MM format (Step 2) */
  finalTime: string;
}

/**
 * Lesson info for display in modal
 */
export interface LessonInfo {
  /** Lesson ID */
  id: string;
  /** Lesson title */
  title: string;
}

/**
 * Modal props
 */
export interface SendLessonModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when lesson is submitted */
  onSubmit: (data: SendLessonFormData) => Promise<void>;
  /** Recipient categories configuration (same format as CheckboxGroup) */
  categories: CategoryConfig[];
  /** Callback when categories change (optional - for controlled state) */
  onCategoriesChange?: (categories: CategoryConfig[]) => void;
  /** Loading state for submit button */
  isLoading?: boolean;
  /** Callback when submission fails (optional - if not provided, error propagates) */
  onError?: (error: unknown) => void;
  /** Modal title for display */
  modalTitle?: string;
  /** Lessons in the model */
  modelLessons?: LessonInfo[];
}

/**
 * Step validation errors
 */
export interface StepErrors {
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
