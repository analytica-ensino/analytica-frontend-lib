import { act, renderHook } from '@testing-library/react';
import {
  useSendLessonModalStore,
  useSendLessonModal,
} from './useSendLessonModal';
import { CategoryConfig, Item } from '../types';

/**
 * Mock categories for testing
 */
const mockCategories: CategoryConfig[] = [
  {
    key: 'students',
    label: 'Turmas',
    itens: [
      {
        id: 'class-1',
        name: 'Turma A',
        userInstitutionId: 'ui-1',
      },
      {
        id: 'class-2',
        name: 'Turma B',
        userInstitutionId: 'ui-2',
      },
    ],
    selectedIds: [],
  },
];

describe('useSendLessonModalStore', () => {
  beforeEach(() => {
    const store = useSendLessonModalStore.getState();
    store.reset();
  });

  describe('initial state', () => {
    it('should have default initial state', () => {
      const store = useSendLessonModalStore.getState();

      expect(store.currentStep).toBe(1);
      expect(store.completedSteps).toEqual([]);
      expect(store.errors).toEqual({});
      expect(store.categories).toEqual([]);
      expect(store.formData.startTime).toBe('00:00');
      expect(store.formData.finalTime).toBe('23:59');
    });
  });

  describe('setFormData', () => {
    it('should update form data', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setFormData({ startDate: '2024-01-01' });
      });

      expect(useSendLessonModalStore.getState().formData.startDate).toBe(
        '2024-01-01'
      );
    });

    it('should merge with existing form data', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setFormData({ startDate: '2024-01-01' });
        store.setFormData({ finalDate: '2024-12-31' });
      });

      const newState = useSendLessonModalStore.getState();
      expect(newState.formData.startDate).toBe('2024-01-01');
      expect(newState.formData.finalDate).toBe('2024-12-31');
    });
  });

  describe('navigation', () => {
    it('should go to step 2 when goToStep is called with 2', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.goToStep(2);
      });

      expect(useSendLessonModalStore.getState().currentStep).toBe(2);
    });

    it('should not go to invalid step', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.goToStep(5);
      });

      expect(useSendLessonModalStore.getState().currentStep).toBe(1);
    });

    it('should not go to step below 1', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.goToStep(0);
      });

      expect(useSendLessonModalStore.getState().currentStep).toBe(1);
    });

    it('should go to previous step', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.goToStep(2);
        store.previousStep();
      });

      expect(useSendLessonModalStore.getState().currentStep).toBe(1);
    });

    it('should not go below step 1', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.previousStep();
      });

      expect(useSendLessonModalStore.getState().currentStep).toBe(1);
    });

    it('should clear errors when changing step', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setErrors({ students: 'Error' });
        store.goToStep(2);
      });

      expect(useSendLessonModalStore.getState().errors).toEqual({});
    });
  });

  describe('validation', () => {
    it('should return false for invalid step 1 (missing title)', () => {
      const store = useSendLessonModalStore.getState();

      let isValid = false;
      act(() => {
        isValid = store.validateCurrentStep();
      });

      expect(isValid).toBe(false);
      expect(useSendLessonModalStore.getState().errors.title).toBeDefined();
    });

    it('should return true for valid step 1', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setFormData({
          title: 'Aula de Matemática',
        });
      });

      let isValid = false;
      act(() => {
        isValid = store.validateCurrentStep();
      });

      expect(isValid).toBe(true);
      expect(useSendLessonModalStore.getState().errors).toEqual({});
    });

    it('should return false for invalid step 2 (missing students)', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setFormData({
          title: 'Aula de Matemática',
        });
        store.goToStep(2);
      });

      let isValid = false;
      act(() => {
        isValid = store.validateCurrentStep();
      });

      expect(isValid).toBe(false);
      expect(useSendLessonModalStore.getState().errors.students).toBeDefined();
    });

    it('should extract students from categories when validating step 2', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithSelection = [...mockCategories];
      categoriesWithSelection[0] = {
        ...categoriesWithSelection[0],
        selectedIds: ['class-1'],
      };

      act(() => {
        store.setFormData({
          title: 'Aula de Matemática',
        });
        store.setCategories(categoriesWithSelection);
        store.goToStep(2);
      });

      let isValid = false;
      act(() => {
        isValid = store.validateCurrentStep();
      });

      expect(isValid).toBe(true);
      expect(useSendLessonModalStore.getState().formData.students).toEqual([
        { studentId: 'class-1', userInstitutionId: 'ui-1' },
      ]);
    });

    it('should return false for invalid step 3 (missing dates)', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.goToStep(3);
      });

      let isValid = false;
      act(() => {
        isValid = store.validateCurrentStep();
      });

      expect(isValid).toBe(false);
      expect(useSendLessonModalStore.getState().errors.startDate).toBeDefined();
      expect(useSendLessonModalStore.getState().errors.finalDate).toBeDefined();
    });

    it('should return true for valid step 3', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.goToStep(3);
        store.setFormData({
          startDate: '2024-01-01',
          finalDate: '2024-12-31',
        });
      });

      let isValid = false;
      act(() => {
        isValid = store.validateCurrentStep();
      });

      expect(isValid).toBe(true);
    });

    it('should validate all steps', () => {
      const store = useSendLessonModalStore.getState();

      let isValid = false;
      act(() => {
        isValid = store.validateAllSteps();
      });

      expect(isValid).toBe(false);
      expect(useSendLessonModalStore.getState().errors).not.toEqual({});
    });

    it('should return true when all steps are valid', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithSelection = [...mockCategories];
      categoriesWithSelection[0] = {
        ...categoriesWithSelection[0],
        selectedIds: ['class-1'],
      };

      act(() => {
        store.setCategories(categoriesWithSelection);
        store.setFormData({
          title: 'Aula de Matemática',
          startDate: '2024-01-01',
          finalDate: '2024-12-31',
        });
      });

      let isValid = false;
      act(() => {
        isValid = store.validateAllSteps();
      });

      expect(isValid).toBe(true);
    });
  });

  describe('nextStep', () => {
    it('should advance to next step when valid', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setFormData({
          title: 'Aula de Matemática',
        });
      });

      let result = false;
      act(() => {
        result = store.nextStep();
      });

      expect(result).toBe(true);
      expect(useSendLessonModalStore.getState().currentStep).toBe(2);
      expect(useSendLessonModalStore.getState().completedSteps).toContain(1);
    });

    it('should not advance when invalid', () => {
      const store = useSendLessonModalStore.getState();

      let result = false;
      act(() => {
        result = store.nextStep();
      });

      expect(result).toBe(false);
      expect(useSendLessonModalStore.getState().currentStep).toBe(1);
    });

    it('should not advance beyond step 3', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setFormData({
          title: 'Aula de Matemática',
        });
        store.nextStep(); // Step 1 -> 2
        store.setFormData({
          students: [{ studentId: 'ui1', userInstitutionId: 'ui1' }],
        });
        store.nextStep(); // Step 2 -> 3
        store.setFormData({
          startDate: '2024-01-01',
          finalDate: '2024-12-31',
        });
      });

      act(() => {
        store.nextStep();
      });

      // Should stay on step 3
      expect(useSendLessonModalStore.getState().currentStep).toBe(3);
    });

    it('should not duplicate completed steps', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setFormData({
          title: 'Aula de Matemática',
        });
      });

      act(() => {
        store.nextStep();
        store.previousStep();
        store.nextStep();
      });

      const state = useSendLessonModalStore.getState();
      expect(state.completedSteps.filter((s) => s === 1).length).toBe(1);
    });
  });

  describe('categories', () => {
    it('should set categories', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setCategories(mockCategories);
      });

      expect(useSendLessonModalStore.getState().categories).toEqual(
        mockCategories
      );
    });

    it('should extract students from categories with selectedIds', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithSelection = [...mockCategories];
      categoriesWithSelection[0] = {
        ...categoriesWithSelection[0],
        selectedIds: ['class-1'],
      };

      act(() => {
        store.setCategories(categoriesWithSelection);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.formData.students).toEqual([
        { studentId: 'class-1', userInstitutionId: 'ui-1' },
      ]);
    });

    it('should extract multiple students from categories', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithSelection = [...mockCategories];
      categoriesWithSelection[0] = {
        ...categoriesWithSelection[0],
        selectedIds: ['class-1', 'class-2'],
      };

      act(() => {
        store.setCategories(categoriesWithSelection);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.formData.students).toHaveLength(2);
    });

    it('should handle empty categories', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setCategories([]);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.categories).toEqual([]);
      expect(state.formData.students).toEqual([]);
    });

    it('should handle categories without students category', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithoutStudents: CategoryConfig[] = [
        {
          key: 'escola',
          label: 'Escola',
          itens: [{ id: 'school-1', name: 'Escola Teste' }],
          selectedIds: ['school-1'],
        },
      ];

      act(() => {
        store.setCategories(categoriesWithoutStudents);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.formData.students).toEqual([]);
    });

    it('should use item.id as studentId when studentId is not defined', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithoutStudentId: CategoryConfig[] = [
        {
          key: 'students',
          label: 'Turmas',
          itens: [
            {
              id: 'item-1',
              name: 'Item 1',
              userInstitutionId: 'ui-1',
            },
          ],
          selectedIds: ['item-1'],
        },
      ];

      act(() => {
        store.setCategories(categoriesWithoutStudentId);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.formData.students).toEqual([
        { studentId: 'item-1', userInstitutionId: 'ui-1' },
      ]);
    });

    it('should use institutionId when userInstitutionId is not defined', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithInstitutionId: CategoryConfig[] = [
        {
          key: 'students',
          label: 'Turmas',
          itens: [
            {
              id: 'item-1',
              name: 'Item 1',
              institutionId: 'inst-1',
            },
          ],
          selectedIds: ['item-1'],
        },
      ];

      act(() => {
        store.setCategories(categoriesWithInstitutionId);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.formData.students).toEqual([
        { studentId: 'item-1', userInstitutionId: 'inst-1' },
      ]);
    });

    it('should filter out entries without valid userInstitutionId', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithInvalidItem: CategoryConfig[] = [
        {
          key: 'students',
          label: 'Turmas',
          itens: [
            {
              id: 'item-1',
              name: 'Item 1',
              // No userInstitutionId or institutionId
            },
            {
              id: 'item-2',
              name: 'Item 2',
              userInstitutionId: 'ui-2',
            },
          ],
          selectedIds: ['item-1', 'item-2'],
        },
      ];

      act(() => {
        store.setCategories(categoriesWithInvalidItem);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.formData.students).toEqual([
        { studentId: 'item-2', userInstitutionId: 'ui-2' },
      ]);
    });

    it('should not extract students from categories with alunos key (only "students" is valid)', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithAlunosKey: CategoryConfig[] = [
        {
          key: 'alunos',
          label: 'Alunos',
          itens: [
            {
              id: 'student-1',
              name: 'Aluno 1',
              studentId: 'student-1',
              userInstitutionId: 'ui-1',
            },
          ],
          selectedIds: ['student-1'],
        },
      ];

      act(() => {
        store.setCategories(categoriesWithAlunosKey);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.formData.students).toEqual([]);
    });

    it('should not extract students from categories with student key (only "students" is valid)', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithStudentKey: CategoryConfig[] = [
        {
          key: 'student',
          label: 'Student',
          itens: [
            {
              id: 'student-1',
              name: 'Student 1',
              studentId: 'student-1',
              userInstitutionId: 'ui-1',
            },
          ],
          selectedIds: ['student-1'],
        },
      ];

      act(() => {
        store.setCategories(categoriesWithStudentKey);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.formData.students).toEqual([]);
    });

    it('should handle numeric studentId values', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithNumericId: CategoryConfig[] = [
        {
          key: 'students',
          label: 'Turmas',
          itens: [
            {
              id: 'item-1',
              name: 'Item 1',
              studentId: 123,
              userInstitutionId: 456,
            } as unknown as Item,
          ],
          selectedIds: ['item-1'],
        },
      ];

      act(() => {
        store.setCategories(categoriesWithNumericId);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.formData.students).toEqual([
        { studentId: '123', userInstitutionId: '456' },
      ]);
    });

    it('should return empty when itens is undefined', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithoutItens: CategoryConfig[] = [
        {
          key: 'students',
          label: 'Turmas',
          selectedIds: ['class-1'],
        } as CategoryConfig,
      ];

      act(() => {
        store.setCategories(categoriesWithoutItens);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.formData.students).toEqual([]);
    });

    it('should return empty when selectedIds is undefined', () => {
      const store = useSendLessonModalStore.getState();

      const categoriesWithoutSelectedIds: CategoryConfig[] = [
        {
          key: 'students',
          label: 'Turmas',
          itens: [
            {
              id: 'class-1',
              name: 'Turma A',
              studentId: 'student-1',
              userInstitutionId: 'ui-1',
            },
          ],
        } as CategoryConfig,
      ];

      act(() => {
        store.setCategories(categoriesWithoutSelectedIds);
      });

      const state = useSendLessonModalStore.getState();
      expect(state.formData.students).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setFormData({ startDate: '2024-01-01', finalDate: '2024-12-31' });
        store.goToStep(2);
        store.setCategories(mockCategories);
        store.reset();
      });

      const state = useSendLessonModalStore.getState();
      expect(state.currentStep).toBe(1);
      expect(state.formData.startDate).toBeUndefined();
      expect(state.categories).toEqual([]);
      expect(state.completedSteps).toEqual([]);
    });
  });

  describe('setErrors', () => {
    it('should set errors', () => {
      const store = useSendLessonModalStore.getState();

      act(() => {
        store.setErrors({ students: 'Students is required' });
      });

      expect(useSendLessonModalStore.getState().errors.students).toBe(
        'Students is required'
      );
    });
  });
});

describe('useSendLessonModal hook', () => {
  beforeEach(() => {
    const store = useSendLessonModalStore.getState();
    store.reset();
  });

  it('should return store state and actions', () => {
    const { result } = renderHook(() => useSendLessonModal());

    expect(result.current.currentStep).toBe(1);
    expect(result.current.formData).toBeDefined();
    expect(result.current.setFormData).toBeDefined();
    expect(result.current.nextStep).toBeDefined();
    expect(result.current.previousStep).toBeDefined();
    expect(result.current.goToStep).toBeDefined();
    expect(result.current.reset).toBeDefined();
    expect(result.current.setCategories).toBeDefined();
  });

  it('should update state when actions are called', () => {
    const { result } = renderHook(() => useSendLessonModal());

    act(() => {
      result.current.setFormData({ startDate: '2024-01-01' });
    });

    expect(result.current.formData.startDate).toBe('2024-01-01');
  });
});
