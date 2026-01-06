/**
 * Send Activity Types
 *
 * Types for the useSendActivity hook that handles
 * sending activities to students with API injection pattern.
 */

import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import type {
  SendActivityFormData,
  SendActivityModalInitialData,
} from '../components/SendActivityModal/types';

/**
 * Recipient item for category selection
 * Extends Item type with index signature for CheckboxGroup compatibility
 */
export interface RecipientItem {
  id: string;
  name: string;
  escolaId?: string;
  serieId?: string;
  turmaId?: string;
  studentId?: string;
  userInstitutionId?: string;
  institutionId?: string;
  [key: string]: unknown;
}

/**
 * Categories data from API for recipient selection
 */
export interface SendActivityCategoriesData {
  schools: RecipientItem[];
  schoolYears: RecipientItem[];
  classes: RecipientItem[];
  students: RecipientItem[];
}

/**
 * Payload for creating an activity
 */
export interface CreateActivityPayload {
  title: string;
  subjectId: string | null;
  questionIds: string[];
  subtype: string;
  notification?: string;
  startDate: string;
  finalDate: string;
  canRetry: boolean;
}

/**
 * Student payload for sending activity
 */
export interface StudentPayload {
  studentId: string;
  userInstitutionId: string;
}

/**
 * Model/Draft item for the modal
 */
export interface ActivityModelItem {
  id: string;
  title: string;
  subjectId: string | null;
}

/**
 * Configuration for the useSendActivity hook
 * Following the API injection pattern (like ActivityDetails)
 */
export interface UseSendActivityConfig {
  /**
   * Function to fetch categories for recipient selection
   * Must return schools, schoolYears, classes, and students
   */
  fetchCategories: () => Promise<SendActivityCategoriesData>;

  /**
   * Function to create an activity
   * @param data - Activity creation payload
   * @returns Promise with created activity id
   */
  createActivity: (data: CreateActivityPayload) => Promise<{ id: string }>;

  /**
   * Function to send activity to students
   * @param activityId - Created activity ID
   * @param students - Array of student data
   */
  sendToStudents: (
    activityId: string,
    students: StudentPayload[]
  ) => Promise<void>;

  /**
   * Function to fetch question IDs from a model/draft
   * @param modelId - Model or draft ID
   * @returns Promise with question IDs array or null
   */
  fetchQuestionIds: (modelId: string) => Promise<string[] | null>;

  /**
   * Callback when activity is sent successfully
   * @param message - Success message
   */
  onSuccess?: (message: string) => void;

  /**
   * Callback when an error occurs
   * @param message - Error message
   */
  onError?: (message: string) => void;
}

/**
 * Return type for the useSendActivity hook
 */
export interface UseSendActivityReturn {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Open the modal with a selected model */
  openModal: (model: ActivityModelItem) => void;
  /** Close the modal */
  closeModal: () => void;
  /** Currently selected model */
  selectedModel: ActivityModelItem | null;
  /** Initial data for pre-filling the modal */
  initialData: SendActivityModalInitialData | undefined;
  /** Categories for recipient selection */
  categories: CategoryConfig[];
  /** Handler for categories change */
  onCategoriesChange: (categories: CategoryConfig[]) => void;
  /** Whether the submit is loading */
  isLoading: boolean;
  /** Whether categories are being loaded */
  isCategoriesLoading: boolean;
  /** Handle form submission */
  handleSubmit: (data: SendActivityFormData) => Promise<void>;
}
