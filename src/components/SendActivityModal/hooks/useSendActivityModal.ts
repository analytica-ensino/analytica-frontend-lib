import { create } from 'zustand';
import { SendActivityFormData, StepErrors, CategoryConfig } from '../types';
import { validateStep } from '../validation';

/**
 * Store interface for SendActivityModal
 */
export interface SendActivityModalStore {
  /** Form data */
  formData: Partial<SendActivityFormData>;
  /** Set form data */
  setFormData: (data: Partial<SendActivityFormData>) => void;

  /** Current step (1, 2, or 3) */
  currentStep: number;
  /** Completed steps */
  completedSteps: number[];
  /** Go to a specific step */
  goToStep: (step: number) => void;
  /** Go to next step (validates current step first) */
  nextStep: () => boolean;
  /** Go to previous step */
  previousStep: () => void;

  /** Validation errors */
  errors: StepErrors;
  /** Set errors */
  setErrors: (errors: StepErrors) => void;
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

const initialState = {
  formData: {
    canRetry: false,
    startTime: '00:00',
    finalTime: '23:59',
  } as Partial<SendActivityFormData>,
  currentStep: 1,
  completedSteps: [] as number[],
  errors: {} as StepErrors,
  categories: [] as CategoryConfig[],
};

/**
 * Helper to extract selected students from the students category
 */
function extractStudentsFromCategories(
  categories: CategoryConfig[]
): Array<{ studentId: string; userInstitutionId: string }> {
  // Find the students category (first matching by key 'students', 'alunos', or 'student')
  const studentsCategory = categories.find(
    (cat) =>
      cat.key === 'students' || cat.key === 'alunos' || cat.key === 'student'
  );

  if (!studentsCategory?.selectedIds || !studentsCategory.itens) {
    return [];
  }

  return studentsCategory.selectedIds
    .map((id) => {
      const student = studentsCategory.itens?.find((item) => item.id === id);
      if (student) {
        const rawStudentId = student.studentId;
        const rawUserInstId = student.userInstitutionId;
        const rawInstId = student.institutionId;

        // Extract studentId with type guard
        const studentId =
          typeof rawStudentId === 'string' || typeof rawStudentId === 'number'
            ? String(rawStudentId)
            : student.id;
        let userInstitutionId = '';
        if (
          typeof rawUserInstId === 'string' ||
          typeof rawUserInstId === 'number'
        ) {
          userInstitutionId = String(rawUserInstId);
        } else if (
          typeof rawInstId === 'string' ||
          typeof rawInstId === 'number'
        ) {
          userInstitutionId = String(rawInstId);
        }

        // Filter out entries without valid userInstitutionId
        if (!userInstitutionId) {
          return null;
        }

        return { studentId, userInstitutionId };
      }
      return null;
    })
    .filter(
      (s): s is { studentId: string; userInstitutionId: string } => s !== null
    );
}

/**
 * Creates the SendActivityModal store
 */
export const useSendActivityModalStore = create<SendActivityModalStore>(
  (set, get) => ({
    ...initialState,

    setFormData: (data) => {
      set((state) => ({
        formData: { ...state.formData, ...data },
      }));
    },

    goToStep: (step) => {
      if (step >= 1 && step <= 3) {
        set({ currentStep: step, errors: {} });
      }
    },

    nextStep: () => {
      const state = get();
      const isValid = state.validateCurrentStep();

      if (isValid && state.currentStep < 3) {
        set((prev) => ({
          currentStep: prev.currentStep + 1,
          completedSteps: prev.completedSteps.includes(prev.currentStep)
            ? prev.completedSteps
            : [...prev.completedSteps, prev.currentStep],
          errors: {},
        }));
        return true;
      }

      return isValid;
    },

    previousStep: () => {
      const state = get();
      if (state.currentStep > 1) {
        set({ currentStep: state.currentStep - 1, errors: {} });
      }
    },

    setErrors: (errors) => {
      set({ errors });
    },

    validateCurrentStep: () => {
      const state = get();
      // For step 2, extract students from categories to ensure auto-selection is considered
      let formDataToValidate = state.formData;
      let updatedFormData = state.formData;
      if (state.currentStep === 2 && state.categories.length > 0) {
        const students = extractStudentsFromCategories(state.categories);
        formDataToValidate = { ...state.formData, students };
        updatedFormData = formDataToValidate;
      }
      const errors = validateStep(state.currentStep, formDataToValidate);
      set({ formData: updatedFormData, errors });
      return Object.keys(errors).length === 0;
    },

    validateAllSteps: () => {
      const state = get();
      // Extract students from categories for step 2 validation
      let formDataForStep2 = state.formData;
      if (state.categories.length > 0) {
        const students = extractStudentsFromCategories(state.categories);
        formDataForStep2 = { ...state.formData, students };
      }
      const errors1 = validateStep(1, state.formData);
      const errors2 = validateStep(2, formDataForStep2);
      const errors3 = validateStep(3, state.formData);
      const allErrors = { ...errors1, ...errors2, ...errors3 };
      set({ errors: allErrors });
      return Object.keys(allErrors).length === 0;
    },

    setCategories: (categories) => {
      // Extract students from categories and update formData
      const students = extractStudentsFromCategories(categories);
      set((state) => ({
        categories,
        formData: { ...state.formData, students },
      }));
    },

    reset: () => {
      set({
        ...initialState,
        categories: [],
      });
    },
  })
);

/**
 * Hook to use the SendActivityModal store
 */
export function useSendActivityModal() {
  return useSendActivityModalStore();
}
