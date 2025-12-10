import { create } from 'zustand';
import {
  SendActivityFormData,
  StepErrors,
  StudentRecipient,
  ClassData,
  SchoolYearData,
  SchoolData,
  RecipientHierarchy,
} from '../types';
import { validateStep } from '../validation';

/**
 * Helper to get all students from a class
 */
function getStudentsFromClass(classData: ClassData): StudentRecipient[] {
  return classData.students;
}

/**
 * Helper to get all students from a school year
 */
function getStudentsFromSchoolYear(
  schoolYear: SchoolYearData
): StudentRecipient[] {
  return schoolYear.classes.flatMap(getStudentsFromClass);
}

/**
 * Helper to get all students from a school
 */
function getStudentsFromSchool(school: SchoolData): StudentRecipient[] {
  return school.schoolYears.flatMap(getStudentsFromSchoolYear);
}

/**
 * Helper to get all students from the hierarchy
 */
function getAllStudents(recipients: RecipientHierarchy): StudentRecipient[] {
  return recipients.schools.flatMap(getStudentsFromSchool);
}

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

  /** Selected student IDs for quick lookup */
  selectedStudentIds: Set<string>;
  /** Toggle a single student */
  toggleStudent: (student: StudentRecipient) => void;
  /** Toggle all students in a class */
  toggleClass: (classData: ClassData) => void;
  /** Toggle all students in a school year */
  toggleSchoolYear: (schoolYear: SchoolYearData) => void;
  /** Toggle all students in a school */
  toggleSchool: (school: SchoolData) => void;
  /** Select all students */
  selectAllStudents: (recipients: RecipientHierarchy) => void;
  /** Clear all selections */
  clearSelection: () => void;

  /** Check if a student is selected */
  isStudentSelected: (student: StudentRecipient) => boolean;
  /** Check if all students in a class are selected */
  isClassSelected: (classData: ClassData) => boolean;
  /** Check if all students in a school year are selected */
  isSchoolYearSelected: (schoolYear: SchoolYearData) => boolean;
  /** Check if all students in a school are selected */
  isSchoolSelected: (school: SchoolData) => boolean;
  /** Check if all students are selected */
  areAllStudentsSelected: (recipients: RecipientHierarchy) => boolean;

  /** Selected school IDs for filtering (independent of student selection) */
  selectedSchoolIds: Set<string>;
  /** Selected school year IDs for filtering */
  selectedSchoolYearIds: Set<string>;
  /** Selected class IDs for filtering */
  selectedClassIds: Set<string>;

  /** Toggle school filter selection */
  toggleSchoolFilter: (schoolId: string) => void;
  /** Toggle school year filter selection */
  toggleSchoolYearFilter: (schoolYearId: string) => void;
  /** Toggle class filter selection */
  toggleClassFilter: (classId: string) => void;

  /** Check if a school filter is selected */
  isSchoolFilterSelected: (schoolId: string) => boolean;
  /** Check if a school year filter is selected */
  isSchoolYearFilterSelected: (schoolYearId: string) => boolean;
  /** Check if a class filter is selected */
  isClassFilterSelected: (classId: string) => boolean;

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
  selectedStudentIds: new Set<string>(),
  selectedSchoolIds: new Set<string>(),
  selectedSchoolYearIds: new Set<string>(),
  selectedClassIds: new Set<string>(),
};

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
      const errors = validateStep(state.currentStep, state.formData);
      set({ errors });
      return Object.keys(errors).length === 0;
    },

    validateAllSteps: () => {
      const state = get();
      const errors1 = validateStep(1, state.formData);
      const errors2 = validateStep(2, state.formData);
      const errors3 = validateStep(3, state.formData);
      const allErrors = { ...errors1, ...errors2, ...errors3 };
      set({ errors: allErrors });
      return Object.keys(allErrors).length === 0;
    },

    toggleStudent: (student) => {
      set((state) => {
        const newSet = new Set(state.selectedStudentIds);
        const key = `${student.studentId}:::${student.userInstitutionId}`;

        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }

        const students = Array.from(newSet).map((k) => {
          const [studentId, userInstitutionId] = k.split(':::');
          return { studentId, userInstitutionId };
        });

        return {
          selectedStudentIds: newSet,
          formData: { ...state.formData, students },
        };
      });
    },

    toggleClass: (classData) => {
      set((state) => {
        const newSet = new Set(state.selectedStudentIds);
        const classStudents = getStudentsFromClass(classData);
        const allSelected = classStudents.every((s) =>
          newSet.has(`${s.studentId}:::${s.userInstitutionId}`)
        );

        if (allSelected) {
          classStudents.forEach((s) => {
            newSet.delete(`${s.studentId}:::${s.userInstitutionId}`);
          });
        } else {
          classStudents.forEach((s) => {
            newSet.add(`${s.studentId}:::${s.userInstitutionId}`);
          });
        }

        const students = Array.from(newSet).map((k) => {
          const [studentId, userInstitutionId] = k.split(':::');
          return { studentId, userInstitutionId };
        });

        return {
          selectedStudentIds: newSet,
          formData: { ...state.formData, students },
        };
      });
    },

    toggleSchoolYear: (schoolYear) => {
      set((state) => {
        const newSet = new Set(state.selectedStudentIds);
        const yearStudents = getStudentsFromSchoolYear(schoolYear);
        const allSelected = yearStudents.every((s) =>
          newSet.has(`${s.studentId}:::${s.userInstitutionId}`)
        );

        if (allSelected) {
          yearStudents.forEach((s) => {
            newSet.delete(`${s.studentId}:::${s.userInstitutionId}`);
          });
        } else {
          yearStudents.forEach((s) => {
            newSet.add(`${s.studentId}:::${s.userInstitutionId}`);
          });
        }

        const students = Array.from(newSet).map((k) => {
          const [studentId, userInstitutionId] = k.split(':::');
          return { studentId, userInstitutionId };
        });

        return {
          selectedStudentIds: newSet,
          formData: { ...state.formData, students },
        };
      });
    },

    toggleSchool: (school) => {
      set((state) => {
        const newSet = new Set(state.selectedStudentIds);
        const schoolStudents = getStudentsFromSchool(school);
        const allSelected = schoolStudents.every((s) =>
          newSet.has(`${s.studentId}:::${s.userInstitutionId}`)
        );

        if (allSelected) {
          schoolStudents.forEach((s) => {
            newSet.delete(`${s.studentId}:::${s.userInstitutionId}`);
          });
        } else {
          schoolStudents.forEach((s) => {
            newSet.add(`${s.studentId}:::${s.userInstitutionId}`);
          });
        }

        const students = Array.from(newSet).map((k) => {
          const [studentId, userInstitutionId] = k.split(':::');
          return { studentId, userInstitutionId };
        });

        return {
          selectedStudentIds: newSet,
          formData: { ...state.formData, students },
        };
      });
    },

    selectAllStudents: (recipients) => {
      const allStudents = getAllStudents(recipients);
      const newSet = new Set(
        allStudents.map((s) => `${s.studentId}:::${s.userInstitutionId}`)
      );
      const students = allStudents.map((s) => ({
        studentId: s.studentId,
        userInstitutionId: s.userInstitutionId,
      }));

      set((state) => ({
        selectedStudentIds: newSet,
        formData: { ...state.formData, students },
      }));
    },

    clearSelection: () => {
      set((state) => ({
        selectedStudentIds: new Set<string>(),
        formData: { ...state.formData, students: [] },
      }));
    },

    isStudentSelected: (student) => {
      const state = get();
      return state.selectedStudentIds.has(
        `${student.studentId}:::${student.userInstitutionId}`
      );
    },

    isClassSelected: (classData) => {
      const state = get();
      const classStudents = getStudentsFromClass(classData);
      return (
        classStudents.length > 0 &&
        classStudents.every((s) =>
          state.selectedStudentIds.has(
            `${s.studentId}:::${s.userInstitutionId}`
          )
        )
      );
    },

    isSchoolYearSelected: (schoolYear) => {
      const state = get();
      const yearStudents = getStudentsFromSchoolYear(schoolYear);
      return (
        yearStudents.length > 0 &&
        yearStudents.every((s) =>
          state.selectedStudentIds.has(
            `${s.studentId}:::${s.userInstitutionId}`
          )
        )
      );
    },

    isSchoolSelected: (school) => {
      const state = get();
      const schoolStudents = getStudentsFromSchool(school);
      return (
        schoolStudents.length > 0 &&
        schoolStudents.every((s) =>
          state.selectedStudentIds.has(
            `${s.studentId}:::${s.userInstitutionId}`
          )
        )
      );
    },

    areAllStudentsSelected: (recipients) => {
      const state = get();
      const allStudents = getAllStudents(recipients);
      return (
        allStudents.length > 0 &&
        allStudents.every((s) =>
          state.selectedStudentIds.has(
            `${s.studentId}:::${s.userInstitutionId}`
          )
        )
      );
    },

    toggleSchoolFilter: (schoolId) => {
      set((state) => {
        const newSet = new Set(state.selectedSchoolIds);
        if (newSet.has(schoolId)) {
          newSet.delete(schoolId);
        } else {
          newSet.add(schoolId);
        }
        return { selectedSchoolIds: newSet };
      });
    },

    toggleSchoolYearFilter: (schoolYearId) => {
      set((state) => {
        const newSet = new Set(state.selectedSchoolYearIds);
        if (newSet.has(schoolYearId)) {
          newSet.delete(schoolYearId);
        } else {
          newSet.add(schoolYearId);
        }
        return { selectedSchoolYearIds: newSet };
      });
    },

    toggleClassFilter: (classId) => {
      set((state) => {
        const newSet = new Set(state.selectedClassIds);
        if (newSet.has(classId)) {
          newSet.delete(classId);
        } else {
          newSet.add(classId);
        }
        return { selectedClassIds: newSet };
      });
    },

    isSchoolFilterSelected: (schoolId) => {
      return get().selectedSchoolIds.has(schoolId);
    },

    isSchoolYearFilterSelected: (schoolYearId) => {
      return get().selectedSchoolYearIds.has(schoolYearId);
    },

    isClassFilterSelected: (classId) => {
      return get().selectedClassIds.has(classId);
    },

    reset: () => {
      set({
        ...initialState,
        selectedStudentIds: new Set<string>(),
        selectedSchoolIds: new Set<string>(),
        selectedSchoolYearIds: new Set<string>(),
        selectedClassIds: new Set<string>(),
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
