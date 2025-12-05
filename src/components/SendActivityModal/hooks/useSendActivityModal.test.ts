import { act, renderHook } from '@testing-library/react';
import { useSendActivityModalStore } from './useSendActivityModal';
import {
  RecipientHierarchy,
  StudentRecipient,
  ClassData,
  SchoolYearData,
  SchoolData,
} from '../types';

const mockStudent1: StudentRecipient = {
  studentId: 'student-1',
  userInstitutionId: 'ui-1',
  name: 'Student 1',
};

const mockStudent2: StudentRecipient = {
  studentId: 'student-2',
  userInstitutionId: 'ui-2',
  name: 'Student 2',
};

const mockStudent3: StudentRecipient = {
  studentId: 'student-3',
  userInstitutionId: 'ui-3',
  name: 'Student 3',
};

const mockClass1: ClassData = {
  id: 'class-1',
  name: 'Class 1',
  students: [mockStudent1, mockStudent2],
};

const mockClass2: ClassData = {
  id: 'class-2',
  name: 'Class 2',
  students: [mockStudent3],
};

const mockSchoolYear: SchoolYearData = {
  id: 'year-1',
  name: '2025',
  classes: [mockClass1, mockClass2],
};

const mockSchool: SchoolData = {
  id: 'school-1',
  name: 'School 1',
  schoolYears: [mockSchoolYear],
};

const mockRecipients: RecipientHierarchy = {
  schools: [mockSchool],
};

describe('useSendActivityModalStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSendActivityModalStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      expect(result.current.currentStep).toBe(1);
      expect(result.current.completedSteps).toEqual([]);
      expect(result.current.errors).toEqual({});
      expect(result.current.selectedStudentIds.size).toBe(0);
      expect(result.current.formData.canRetry).toBe(false);
    });
  });

  describe('setFormData', () => {
    it('should update form data', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.setFormData({ title: 'Test Title' });
      });

      expect(result.current.formData.title).toBe('Test Title');
    });

    it('should merge with existing form data', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.setFormData({ title: 'Test Title' });
        result.current.setFormData({ subtype: 'TAREFA' });
      });

      expect(result.current.formData.title).toBe('Test Title');
      expect(result.current.formData.subtype).toBe('TAREFA');
    });
  });

  describe('step navigation', () => {
    it('should go to a specific step', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.goToStep(2);
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should not go to invalid step', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.goToStep(0);
      });

      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.goToStep(4);
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should clear errors when changing step', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.setErrors({ title: 'Error' });
        result.current.goToStep(2);
      });

      expect(result.current.errors).toEqual({});
    });

    it('should go to previous step', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.goToStep(3);
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should not go below step 1', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(1);
    });
  });

  describe('nextStep', () => {
    it('should not advance if validation fails', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        const advanced = result.current.nextStep();
        expect(advanced).toBe(false);
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.errors.subtype).toBeDefined();
      expect(result.current.errors.title).toBeDefined();
    });

    it('should advance if validation passes', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.setFormData({ subtype: 'TAREFA', title: 'Test' });
      });

      act(() => {
        const advanced = result.current.nextStep();
        expect(advanced).toBe(true);
      });

      expect(result.current.currentStep).toBe(2);
      expect(result.current.completedSteps).toContain(1);
    });

    it('should not advance past step 3', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.setFormData({
          subtype: 'TAREFA',
          title: 'Test',
          students: [{ studentId: '1', userInstitutionId: '1' }],
          startDate: new Date(),
          finalDate: new Date(),
        });
        result.current.goToStep(3);
      });

      act(() => {
        const advanced = result.current.nextStep();
        expect(advanced).toBe(true);
      });

      expect(result.current.currentStep).toBe(3);
    });
  });

  describe('validateCurrentStep', () => {
    it('should validate step 1', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        const isValid = result.current.validateCurrentStep();
        expect(isValid).toBe(false);
      });

      expect(result.current.errors.subtype).toBeDefined();
    });

    it('should return true for valid step', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.setFormData({ subtype: 'PROVA', title: 'Test' });
      });

      act(() => {
        const isValid = result.current.validateCurrentStep();
        expect(isValid).toBe(true);
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('student selection', () => {
    it('should toggle a single student', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.toggleStudent(mockStudent1);
      });

      expect(result.current.selectedStudentIds.size).toBe(1);
      expect(result.current.formData.students).toHaveLength(1);
      expect(result.current.formData.students?.[0].studentId).toBe(
        mockStudent1.studentId
      );

      act(() => {
        result.current.toggleStudent(mockStudent1);
      });

      expect(result.current.selectedStudentIds.size).toBe(0);
      expect(result.current.formData.students).toHaveLength(0);
    });

    it('should toggle all students in a class', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.toggleClass(mockClass1);
      });

      expect(result.current.selectedStudentIds.size).toBe(2);
      expect(result.current.formData.students).toHaveLength(2);

      act(() => {
        result.current.toggleClass(mockClass1);
      });

      expect(result.current.selectedStudentIds.size).toBe(0);
    });

    it('should toggle all students in a school year', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.toggleSchoolYear(mockSchoolYear);
      });

      expect(result.current.selectedStudentIds.size).toBe(3);

      act(() => {
        result.current.toggleSchoolYear(mockSchoolYear);
      });

      expect(result.current.selectedStudentIds.size).toBe(0);
    });

    it('should toggle all students in a school', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.toggleSchool(mockSchool);
      });

      expect(result.current.selectedStudentIds.size).toBe(3);

      act(() => {
        result.current.toggleSchool(mockSchool);
      });

      expect(result.current.selectedStudentIds.size).toBe(0);
    });

    it('should select all students', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.selectAllStudents(mockRecipients);
      });

      expect(result.current.selectedStudentIds.size).toBe(3);
      expect(result.current.formData.students).toHaveLength(3);
    });

    it('should clear all selections', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.selectAllStudents(mockRecipients);
        result.current.clearSelection();
      });

      expect(result.current.selectedStudentIds.size).toBe(0);
      expect(result.current.formData.students).toHaveLength(0);
    });
  });

  describe('selection checks', () => {
    it('should check if student is selected', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.toggleStudent(mockStudent1);
      });

      expect(result.current.isStudentSelected(mockStudent1.studentId)).toBe(
        true
      );
      expect(result.current.isStudentSelected(mockStudent2.studentId)).toBe(
        false
      );
    });

    it('should check if class is selected', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      expect(result.current.isClassSelected(mockClass1)).toBe(false);

      act(() => {
        result.current.toggleClass(mockClass1);
      });

      expect(result.current.isClassSelected(mockClass1)).toBe(true);
      expect(result.current.isClassSelected(mockClass2)).toBe(false);
    });

    it('should check if school year is selected', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      expect(result.current.isSchoolYearSelected(mockSchoolYear)).toBe(false);

      act(() => {
        result.current.toggleSchoolYear(mockSchoolYear);
      });

      expect(result.current.isSchoolYearSelected(mockSchoolYear)).toBe(true);
    });

    it('should check if school is selected', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      expect(result.current.isSchoolSelected(mockSchool)).toBe(false);

      act(() => {
        result.current.toggleSchool(mockSchool);
      });

      expect(result.current.isSchoolSelected(mockSchool)).toBe(true);
    });

    it('should check if all students are selected', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      expect(result.current.areAllStudentsSelected(mockRecipients)).toBe(false);

      act(() => {
        result.current.selectAllStudents(mockRecipients);
      });

      expect(result.current.areAllStudentsSelected(mockRecipients)).toBe(true);
    });

    it('should return false for empty class', () => {
      const { result } = renderHook(() => useSendActivityModalStore());
      const emptyClass: ClassData = {
        id: 'empty',
        name: 'Empty',
        students: [],
      };

      expect(result.current.isClassSelected(emptyClass)).toBe(false);
    });

    it('should return false for empty school year', () => {
      const { result } = renderHook(() => useSendActivityModalStore());
      const emptySchoolYear: SchoolYearData = {
        id: 'empty',
        name: 'Empty',
        classes: [],
      };

      expect(result.current.isSchoolYearSelected(emptySchoolYear)).toBe(false);
    });

    it('should return false for empty school', () => {
      const { result } = renderHook(() => useSendActivityModalStore());
      const emptySchool: SchoolData = {
        id: 'empty',
        name: 'Empty',
        schoolYears: [],
      };

      expect(result.current.isSchoolSelected(emptySchool)).toBe(false);
    });

    it('should return false for empty recipients', () => {
      const { result } = renderHook(() => useSendActivityModalStore());
      const emptyRecipients: RecipientHierarchy = { schools: [] };

      expect(result.current.areAllStudentsSelected(emptyRecipients)).toBe(
        false
      );
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useSendActivityModalStore());

      act(() => {
        result.current.setFormData({ title: 'Test', subtype: 'TAREFA' });
        result.current.goToStep(2);
        result.current.toggleStudent(mockStudent1);
        result.current.setErrors({ title: 'Error' });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.completedSteps).toEqual([]);
      expect(result.current.errors).toEqual({});
      expect(result.current.selectedStudentIds.size).toBe(0);
      expect(result.current.formData.title).toBeUndefined();
    });
  });
});
