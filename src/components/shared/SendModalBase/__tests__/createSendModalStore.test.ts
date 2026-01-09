import { act, renderHook } from '@testing-library/react';
import { createSendModalStore } from '../createSendModalStore';
import type { CategoryConfig } from '../types';

interface TestFormData {
  students?: Array<{ studentId: string; userInstitutionId: string }>;
  startDate?: string;
  startTime?: string;
  finalDate?: string;
  finalTime?: string;
  customField?: string;
}

interface TestErrors extends Record<string, string | undefined> {
  students?: string;
  startDate?: string;
  finalDate?: string;
  customField?: string;
}

const createTestStore = (
  validateStepFn?: (step: number, formData: Partial<TestFormData>) => TestErrors
) => {
  const validateStep =
    validateStepFn ||
    ((step: number, formData: Partial<TestFormData>): TestErrors => {
      const errors: TestErrors = {};
      if (step === 1 && !formData.students?.length) {
        errors.students = 'Selecione ao menos um aluno';
      }
      if (step === 2) {
        if (!formData.startDate) {
          errors.startDate = 'Data inicial obrigatória';
        }
        if (!formData.finalDate) {
          errors.finalDate = 'Data final obrigatória';
        }
      }
      return errors;
    });

  return createSendModalStore<TestFormData, TestErrors>({
    maxSteps: 2,
    initialFormData: {},
    validateStep,
    recipientStepNumber: 1,
  });
};

const mockCategories: CategoryConfig[] = [
  {
    key: 'students',
    label: 'Turma A',
    selectedIds: ['student-1'],
    itens: [
      {
        id: 'student-1',
        name: 'Aluno 1',
        studentId: 'student-1',
        userInstitutionId: 'ui-1',
      },
      {
        id: 'student-2',
        name: 'Aluno 2',
        studentId: 'student-2',
        userInstitutionId: 'ui-2',
      },
    ],
  },
];

describe('createSendModalStore', () => {
  describe('initial state', () => {
    it('should create store with initial state', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      expect(result.current.formData).toEqual({});
      expect(result.current.currentStep).toBe(1);
      expect(result.current.completedSteps).toEqual([]);
      expect(result.current.errors).toEqual({});
      expect(result.current.categories).toEqual([]);
    });

    it('should accept custom initial form data', () => {
      const useStore = createSendModalStore<TestFormData, TestErrors>({
        maxSteps: 2,
        initialFormData: { customField: 'initial value' },
        validateStep: () => ({}),
        recipientStepNumber: 1,
      });
      const { result } = renderHook(() => useStore());

      expect(result.current.formData).toEqual({ customField: 'initial value' });
    });
  });

  describe('setFormData', () => {
    it('should update form data', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setFormData({ startDate: '2024-01-15' });
      });

      expect(result.current.formData.startDate).toBe('2024-01-15');
    });

    it('should merge form data without overwriting existing fields', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setFormData({ startDate: '2024-01-15' });
        result.current.setFormData({ finalDate: '2024-01-20' });
      });

      expect(result.current.formData.startDate).toBe('2024-01-15');
      expect(result.current.formData.finalDate).toBe('2024-01-20');
    });
  });

  describe('goToStep', () => {
    it('should navigate to valid step', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.goToStep(2);
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should clear errors when navigating', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setErrors({ students: 'Error' });
        result.current.goToStep(2);
      });

      expect(result.current.errors).toEqual({});
    });

    it('should not navigate below step 1', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.goToStep(0);
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should not navigate above maxSteps', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.goToStep(5);
      });

      expect(result.current.currentStep).toBe(1);
    });
  });

  describe('nextStep', () => {
    it('should advance to next step when validation passes', () => {
      const useStore = createTestStore(() => ({}));
      const { result } = renderHook(() => useStore());

      let success = false;
      act(() => {
        success = result.current.nextStep();
      });

      expect(success).toBe(true);
      expect(result.current.currentStep).toBe(2);
    });

    it('should add current step to completedSteps', () => {
      const useStore = createTestStore(() => ({}));
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.completedSteps).toContain(1);
    });

    it('should not duplicate step in completedSteps', () => {
      const useStore = createTestStore(() => ({}));
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.nextStep();
        result.current.previousStep();
        result.current.nextStep();
      });

      const step1Count = result.current.completedSteps.filter(
        (s) => s === 1
      ).length;
      expect(step1Count).toBe(1);
    });

    it('should not advance when validation fails', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      let success = false;
      act(() => {
        success = result.current.nextStep();
      });

      expect(success).toBe(false);
      expect(result.current.currentStep).toBe(1);
      expect(result.current.errors.students).toBe(
        'Selecione ao menos um aluno'
      );
    });

    it('should not advance past maxSteps', () => {
      const useStore = createTestStore(() => ({}));
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.goToStep(2);
      });

      let success = false;
      act(() => {
        success = result.current.nextStep();
      });

      expect(success).toBe(true);
      expect(result.current.currentStep).toBe(2);
    });

    it('should clear errors when advancing', () => {
      const useStore = createTestStore(() => ({}));
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setErrors({ students: 'Previous error' });
        result.current.nextStep();
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('previousStep', () => {
    it('should go to previous step', () => {
      const useStore = createTestStore(() => ({}));
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.nextStep();
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should clear errors when going back', () => {
      const useStore = createTestStore(() => ({}));
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.nextStep();
        result.current.setErrors({ startDate: 'Error' });
        result.current.previousStep();
      });

      expect(result.current.errors).toEqual({});
    });

    it('should not go below step 1', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(1);
    });
  });

  describe('setErrors', () => {
    it('should set errors', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setErrors({ students: 'Error message' });
      });

      expect(result.current.errors.students).toBe('Error message');
    });

    it('should replace all errors', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setErrors({ students: 'Error 1' });
        result.current.setErrors({ startDate: 'Error 2' });
      });

      expect(result.current.errors.students).toBeUndefined();
      expect(result.current.errors.startDate).toBe('Error 2');
    });
  });

  describe('validateCurrentStep', () => {
    it('should return true when step is valid', () => {
      const useStore = createTestStore(() => ({}));
      const { result } = renderHook(() => useStore());

      let isValid = false;
      act(() => {
        isValid = result.current.validateCurrentStep();
      });

      expect(isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });

    it('should return false and set errors when step is invalid', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      let isValid = true;
      act(() => {
        isValid = result.current.validateCurrentStep();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.students).toBe(
        'Selecione ao menos um aluno'
      );
    });

    it('should extract students from categories for recipient step', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCategories(mockCategories);
      });

      act(() => {
        result.current.validateCurrentStep();
      });

      expect(result.current.formData.students).toHaveLength(1);
      expect(result.current.formData.students?.[0].studentId).toBe('student-1');
    });
  });

  describe('validateAllSteps', () => {
    it('should return true when all steps are valid', () => {
      const useStore = createSendModalStore<TestFormData, TestErrors>({
        maxSteps: 2,
        initialFormData: {
          students: [{ studentId: 's1', userInstitutionId: 'ui1' }],
          startDate: '2024-01-15',
          finalDate: '2024-01-20',
        },
        validateStep: () => ({}),
        recipientStepNumber: 1,
      });
      const { result } = renderHook(() => useStore());

      let isValid = false;
      act(() => {
        isValid = result.current.validateAllSteps();
      });

      expect(isValid).toBe(true);
    });

    it('should return false and set errors when any step is invalid', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      let isValid = true;
      act(() => {
        isValid = result.current.validateAllSteps();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.students).toBe(
        'Selecione ao menos um aluno'
      );
      expect(result.current.errors.startDate).toBe('Data inicial obrigatória');
      expect(result.current.errors.finalDate).toBe('Data final obrigatória');
    });

    it('should use categories to extract students for validation', () => {
      const validateStep = jest.fn(() => ({}));
      const useStore = createTestStore(validateStep);
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCategories(mockCategories);
      });

      act(() => {
        result.current.validateAllSteps();
      });

      expect(validateStep).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          students: expect.arrayContaining([
            expect.objectContaining({ studentId: 'student-1' }),
          ]),
        })
      );
    });

    it('should persist students to formData after validation', () => {
      const useStore = createTestStore(() => ({}));
      const { result } = renderHook(() => useStore());

      // Initially formData.students should be undefined
      expect(result.current.formData.students).toBeUndefined();

      // Set categories with selected students
      act(() => {
        result.current.setCategories(mockCategories);
      });

      // Reset formData to simulate a fresh state before validateAllSteps
      act(() => {
        result.current.setFormData({ students: undefined });
      });

      // Call validateAllSteps
      act(() => {
        result.current.validateAllSteps();
      });

      // formData.students should be persisted with extracted students
      expect(result.current.formData.students).toHaveLength(1);
      expect(result.current.formData.students?.[0]).toEqual({
        studentId: 'student-1',
        userInstitutionId: 'ui-1',
      });
    });
  });

  describe('setCategories', () => {
    it('should update categories', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCategories(mockCategories);
      });

      expect(result.current.categories).toEqual(mockCategories);
    });

    it('should extract students from categories and update formData', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCategories(mockCategories);
      });

      expect(result.current.formData.students).toHaveLength(1);
      expect(result.current.formData.students?.[0]).toEqual({
        studentId: 'student-1',
        userInstitutionId: 'ui-1',
      });
    });

    it('should handle empty categories', () => {
      const useStore = createTestStore();
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setCategories([]);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.formData.students).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const useStore = createTestStore(() => ({}));
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setFormData({ startDate: '2024-01-15' });
        result.current.nextStep();
        result.current.setCategories(mockCategories);
        result.current.setErrors({ startDate: 'Error' });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.formData).toEqual({});
      expect(result.current.currentStep).toBe(1);
      expect(result.current.completedSteps).toEqual([]);
      expect(result.current.errors).toEqual({});
      expect(result.current.categories).toEqual([]);
    });
  });

  describe('3-step modal configuration', () => {
    it('should work with 3 steps', () => {
      const useStore = createSendModalStore<TestFormData, TestErrors>({
        maxSteps: 3,
        initialFormData: {},
        validateStep: () => ({}),
        recipientStepNumber: 2,
      });
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.nextStep();
        result.current.nextStep();
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(3);
      expect(result.current.completedSteps).toEqual([1, 2]);
    });
  });
});
