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
 * Student recipient structure matching backend SendActivityToStudentsBody
 */
export interface StudentRecipient {
  /** User ID from users table */
  studentId: string;
  /** SupUserInstitution ID */
  userInstitutionId: string;
  /** Display name */
  name: string;
}

/**
 * Class/Turma with students
 */
export interface ClassData {
  id: string;
  name: string;
  shift?: string;
  students: StudentRecipient[];
}

/**
 * SchoolYear/Série with classes
 */
export interface SchoolYearData {
  id: string;
  name: string;
  classes: ClassData[];
}

/**
 * School with school years
 */
export interface SchoolData {
  id: string;
  name: string;
  schoolYears: SchoolYearData[];
}

/**
 * Props for recipient data hierarchy
 */
export interface RecipientHierarchy {
  schools: SchoolData[];
}

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
  /** Recipient hierarchy data */
  recipients: RecipientHierarchy;
  /** Loading state for submit button */
  isLoading?: boolean;
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
