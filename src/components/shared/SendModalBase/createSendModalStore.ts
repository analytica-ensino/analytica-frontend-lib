import { create } from 'zustand';
import type { CategoryConfig, BaseSendModalStore } from './types';
import { extractStudentsFromCategories } from '../../../utils/extractStudentsFromCategories';

/**
 * Configuration for creating a SendModal store
 */
export interface CreateSendModalStoreConfig<T, E> {
  /** Maximum number of steps */
  maxSteps: number;
  /** Initial form data */
  initialFormData: Partial<T>;
  /** Function to validate a specific step */
  validateStep: (step: number, formData: Partial<T>) => E;
  /** Step number where recipients (students) are selected */
  recipientStepNumber: number;
}

/**
 * Creates a Zustand store for SendModal with shared logic
 * @param config - Store configuration
 * @returns A Zustand store hook
 */
export function createSendModalStore<
  T extends {
    students?: Array<{ studentId: string; userInstitutionId: string }>;
  },
  E extends Record<string, string | undefined>,
>(config: CreateSendModalStoreConfig<T, E>) {
  const { maxSteps, initialFormData, validateStep, recipientStepNumber } =
    config;

  const initialState = {
    formData: initialFormData,
    currentStep: 1,
    completedSteps: [] as number[],
    errors: {} as E,
    categories: [] as CategoryConfig[],
  };

  return create<BaseSendModalStore<T, E>>((set, get) => ({
    ...initialState,

    setFormData: (data) => {
      set((state) => ({
        formData: { ...state.formData, ...data },
      }));
    },

    goToStep: (step) => {
      if (step >= 1 && step <= maxSteps) {
        set({ currentStep: step, errors: {} as E });
      }
    },

    nextStep: () => {
      const state = get();
      const isValid = state.validateCurrentStep();

      if (isValid && state.currentStep < maxSteps) {
        set((prev) => ({
          currentStep: prev.currentStep + 1,
          completedSteps: prev.completedSteps.includes(prev.currentStep)
            ? prev.completedSteps
            : [...prev.completedSteps, prev.currentStep],
          errors: {} as E,
        }));
        return true;
      }

      return isValid;
    },

    previousStep: () => {
      const state = get();
      if (state.currentStep > 1) {
        set({ currentStep: state.currentStep - 1, errors: {} as E });
      }
    },

    setErrors: (errors) => {
      set({ errors });
    },

    validateCurrentStep: () => {
      const state = get();
      let formDataToValidate = state.formData;
      let updatedFormData = state.formData;

      // For recipient step, extract students from categories
      if (
        state.currentStep === recipientStepNumber &&
        state.categories.length > 0
      ) {
        const students = extractStudentsFromCategories(state.categories);
        formDataToValidate = { ...state.formData, students } as Partial<T>;
        updatedFormData = formDataToValidate;
      }

      const errors = validateStep(state.currentStep, formDataToValidate);
      set({ formData: updatedFormData, errors });
      return Object.keys(errors).length === 0;
    },

    validateAllSteps: () => {
      const state = get();

      // Extract students from categories for recipient step validation
      let formDataForRecipient = state.formData;
      if (state.categories.length > 0) {
        const students = extractStudentsFromCategories(state.categories);
        formDataForRecipient = { ...state.formData, students } as Partial<T>;
      }

      // Validate all steps and collect errors
      const allErrors: E = {} as E;
      for (let step = 1; step <= maxSteps; step++) {
        const formDataToValidate =
          step === recipientStepNumber ? formDataForRecipient : state.formData;
        const stepErrors = validateStep(step, formDataToValidate);
        Object.assign(allErrors, stepErrors);
      }

      set({ formData: formDataForRecipient, errors: allErrors });
      return Object.keys(allErrors).length === 0;
    },

    setCategories: (categories) => {
      // Extract students from categories and update formData
      const students = extractStudentsFromCategories(categories);
      set((state) => ({
        categories,
        formData: { ...state.formData, students } as Partial<T>,
      }));
    },

    reset: () => {
      set({
        ...initialState,
        categories: [],
      });
    },
  }));
}
