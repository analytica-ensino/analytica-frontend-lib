import { act, renderHook } from '@testing-library/react';
import {
  useSendActivityModalStore,
  useSendActivityModal,
} from './useSendActivityModal';
import { CategoryConfig } from '../types';

/**
 * Mock categories for testing
 */
const mockCategories: CategoryConfig[] = [
  {
    key: 'escola',
    label: 'Escola',
    itens: [{ id: 'school-1', name: 'Escola Teste' }],
    selectedIds: [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
    itens: [{ id: 'year-1', name: '2025', schoolId: 'school-1' }],
    selectedIds: [],
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['serie'],
    filteredBy: [{ key: 'serie', internalField: 'yearId' }],
    itens: [{ id: 'class-1', name: 'Turma A', yearId: 'year-1' }],
    selectedIds: [],
  },
  {
    key: 'students',
    label: 'Alunos',
    dependsOn: ['turma'],
    filteredBy: [{ key: 'turma', internalField: 'classId' }],
    itens: [
      {
        id: 'student-1',
        name: 'Aluno 1',
        classId: 'class-1',
        studentId: 'student-1',
        userInstitutionId: 'ui-1',
      },
      {
        id: 'student-2',
        name: 'Aluno 2',
        classId: 'class-1',
        studentId: 'student-2',
        userInstitutionId: 'ui-2',
      },
    ],
    selectedIds: [],
  },
];

describe('useSendActivityModalStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useSendActivityModalStore.getState();
    store.reset();
  });

  describe('initial state', () => {
    it('should have default initial state', () => {
      const store = useSendActivityModalStore.getState();

      expect(store.currentStep).toBe(1);
      expect(store.completedSteps).toEqual([]);
      expect(store.errors).toEqual({});
      expect(store.categories).toEqual([]);
      expect(store.formData.canRetry).toBe(false);
      expect(store.formData.startTime).toBe('00:00');
      expect(store.formData.finalTime).toBe('23:59');
    });
  });

  describe('setFormData', () => {
    it('should update form data', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setFormData({ title: 'Test Activity' });
      });

      expect(useSendActivityModalStore.getState().formData.title).toBe(
        'Test Activity'
      );
    });

    it('should merge with existing form data', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setFormData({ title: 'Test Activity' });
        store.setFormData({ subtype: 'TAREFA' });
      });

      const newState = useSendActivityModalStore.getState();
      expect(newState.formData.title).toBe('Test Activity');
      expect(newState.formData.subtype).toBe('TAREFA');
    });
  });

  describe('navigation', () => {
    it('should go to step 2 when goToStep is called with 2', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.goToStep(2);
      });

      expect(useSendActivityModalStore.getState().currentStep).toBe(2);
    });

    it('should not go to invalid step', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.goToStep(5);
      });

      expect(useSendActivityModalStore.getState().currentStep).toBe(1);
    });

    it('should not go to step below 1', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.goToStep(0);
      });

      expect(useSendActivityModalStore.getState().currentStep).toBe(1);
    });

    it('should go to previous step', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.goToStep(2);
        store.previousStep();
      });

      expect(useSendActivityModalStore.getState().currentStep).toBe(1);
    });

    it('should not go below step 1', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.previousStep();
      });

      expect(useSendActivityModalStore.getState().currentStep).toBe(1);
    });

    it('should clear errors when changing step', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setErrors({ title: 'Error' });
        store.goToStep(2);
      });

      expect(useSendActivityModalStore.getState().errors).toEqual({});
    });
  });

  describe('validation', () => {
    it('should return false for invalid step 1 (missing subtype)', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setFormData({ title: 'Test' });
      });

      let isValid = false;
      act(() => {
        isValid = store.validateCurrentStep();
      });

      expect(isValid).toBe(false);
      expect(useSendActivityModalStore.getState().errors.subtype).toBeDefined();
    });

    it('should return false for invalid step 1 (missing title)', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setFormData({ subtype: 'TAREFA' });
      });

      let isValid = false;
      act(() => {
        isValid = store.validateCurrentStep();
      });

      expect(isValid).toBe(false);
      expect(useSendActivityModalStore.getState().errors.title).toBeDefined();
    });

    it('should return true for valid step 1', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setFormData({ subtype: 'TAREFA', title: 'Test Activity' });
      });

      let isValid = false;
      act(() => {
        isValid = store.validateCurrentStep();
      });

      expect(isValid).toBe(true);
      expect(useSendActivityModalStore.getState().errors).toEqual({});
    });

    it('should validate all steps', () => {
      const store = useSendActivityModalStore.getState();

      let isValid = false;
      act(() => {
        isValid = store.validateAllSteps();
      });

      expect(isValid).toBe(false);
      expect(useSendActivityModalStore.getState().errors).not.toEqual({});
    });
  });

  describe('nextStep', () => {
    it('should advance to next step when valid', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setFormData({ subtype: 'TAREFA', title: 'Test Activity' });
      });

      let result = false;
      act(() => {
        result = store.nextStep();
      });

      expect(result).toBe(true);
      expect(useSendActivityModalStore.getState().currentStep).toBe(2);
      expect(useSendActivityModalStore.getState().completedSteps).toContain(1);
    });

    it('should not advance when invalid', () => {
      const store = useSendActivityModalStore.getState();

      let result = false;
      act(() => {
        result = store.nextStep();
      });

      expect(result).toBe(false);
      expect(useSendActivityModalStore.getState().currentStep).toBe(1);
    });

    it('should not advance beyond step 3', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.goToStep(3);
        store.setFormData({
          subtype: 'TAREFA',
          title: 'Test',
          students: [{ studentId: 's1', userInstitutionId: 'ui1' }],
          startDate: '2025-01-20',
          finalDate: '2025-01-25',
        });
      });

      act(() => {
        store.nextStep();
      });

      // Should stay on step 3
      expect(useSendActivityModalStore.getState().currentStep).toBe(3);
    });

    it('should not duplicate completed steps', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setFormData({ subtype: 'TAREFA', title: 'Test Activity' });
      });

      act(() => {
        store.nextStep();
        store.previousStep();
        store.nextStep();
      });

      const state = useSendActivityModalStore.getState();
      expect(state.completedSteps.filter((s) => s === 1).length).toBe(1);
    });
  });

  describe('categories', () => {
    it('should set categories', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setCategories(mockCategories);
      });

      expect(useSendActivityModalStore.getState().categories).toEqual(
        mockCategories
      );
    });

    it('should extract students from categories with selectedIds', () => {
      const store = useSendActivityModalStore.getState();

      const categoriesWithSelection = [...mockCategories];
      categoriesWithSelection[3] = {
        ...categoriesWithSelection[3],
        selectedIds: ['student-1'],
      };

      act(() => {
        store.setCategories(categoriesWithSelection);
      });

      const state = useSendActivityModalStore.getState();
      expect(state.formData.students).toEqual([
        { studentId: 'student-1', userInstitutionId: 'ui-1' },
      ]);
    });

    it('should extract multiple students from categories', () => {
      const store = useSendActivityModalStore.getState();

      const categoriesWithSelection = [...mockCategories];
      categoriesWithSelection[3] = {
        ...categoriesWithSelection[3],
        selectedIds: ['student-1', 'student-2'],
      };

      act(() => {
        store.setCategories(categoriesWithSelection);
      });

      const state = useSendActivityModalStore.getState();
      expect(state.formData.students).toHaveLength(2);
    });

    it('should handle empty categories', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setCategories([]);
      });

      const state = useSendActivityModalStore.getState();
      expect(state.categories).toEqual([]);
      expect(state.formData.students).toEqual([]);
    });

    it('should handle categories without students category', () => {
      const store = useSendActivityModalStore.getState();

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

      const state = useSendActivityModalStore.getState();
      expect(state.formData.students).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setFormData({ title: 'Test', subtype: 'TAREFA' });
        store.goToStep(2);
        store.setCategories(mockCategories);
        store.reset();
      });

      const state = useSendActivityModalStore.getState();
      expect(state.currentStep).toBe(1);
      expect(state.formData.title).toBeUndefined();
      expect(state.categories).toEqual([]);
      expect(state.completedSteps).toEqual([]);
    });
  });

  describe('setErrors', () => {
    it('should set errors', () => {
      const store = useSendActivityModalStore.getState();

      act(() => {
        store.setErrors({ title: 'Title is required' });
      });

      expect(useSendActivityModalStore.getState().errors.title).toBe(
        'Title is required'
      );
    });
  });
});

describe('useSendActivityModal hook', () => {
  beforeEach(() => {
    const store = useSendActivityModalStore.getState();
    store.reset();
  });

  it('should return store state and actions', () => {
    const { result } = renderHook(() => useSendActivityModal());

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
    const { result } = renderHook(() => useSendActivityModal());

    act(() => {
      result.current.setFormData({ title: 'Test Activity' });
    });

    expect(result.current.formData.title).toBe('Test Activity');
  });
});
