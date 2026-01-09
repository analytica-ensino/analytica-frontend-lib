import { create } from 'zustand';
import { SendLessonFormData, StepErrors, CategoryConfig } from '../types';
import { validateStep } from '../validation';
import { extractStudentsFromCategories } from '../../../utils/extractStudentsFromCategories';

/**
 * Store interface for SendLessonModal
 */
export interface SendLessonModalStore {
  /** Form data */
  formData: Partial<SendLessonFormData>;
  /** Set form data */
  setFormData: (data: Partial<SendLessonFormData>) => void;

  /** Current step (1 or 2) */
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
    startTime: '00:00',
    finalTime: '23:59',
  } as Partial<SendLessonFormData>,
  currentStep: 1,
  completedSteps: [] as number[],
  errors: {} as StepErrors,
  categories: [] as CategoryConfig[],
};

/**
 * Creates the SendLessonModal store
 */
export const useSendLessonModalStore = create<SendLessonModalStore>(
  (set, get) => ({
    ...initialState,

    setFormData: (data) => {
      set((state) => ({
        formData: { ...state.formData, ...data },
      }));
    },

    goToStep: (step) => {
      if (step >= 1 && step <= 2) {
        set({ currentStep: step, errors: {} });
      }
    },

    nextStep: () => {
      const state = get();
      const isValid = state.validateCurrentStep();

      if (isValid && state.currentStep < 2) {
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
      // For step 1, extract students from categories
      let formDataToValidate = state.formData;
      let updatedFormData = state.formData;
      if (state.currentStep === 1 && state.categories.length > 0) {
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
      // Extract students from categories for step 1 validation
      let formDataForStep1 = state.formData;
      if (state.categories.length > 0) {
        const students = extractStudentsFromCategories(state.categories);
        formDataForStep1 = { ...state.formData, students };
      }
      const errors1 = validateStep(1, formDataForStep1);
      const errors2 = validateStep(2, state.formData);
      const allErrors = { ...errors1, ...errors2 };
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
 * Hook to use the SendLessonModal store
 */
export function useSendLessonModal() {
  return useSendLessonModalStore();
}
