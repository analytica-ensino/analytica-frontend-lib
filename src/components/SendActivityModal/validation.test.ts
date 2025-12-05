import {
  validateActivityStep,
  validateRecipientStep,
  validateDeadlineStep,
  validateStep,
  isStepValid,
  isFormValid,
  ERROR_MESSAGES,
} from './validation';
import { SendActivityFormData } from './types';

describe('validation', () => {
  describe('validateActivityStep', () => {
    it('should return error when subtype is missing', () => {
      const data: Partial<SendActivityFormData> = {};
      const errors = validateActivityStep(data);

      expect(errors.subtype).toBe(ERROR_MESSAGES.SUBTYPE_REQUIRED);
    });

    it('should return error when title is missing', () => {
      const data: Partial<SendActivityFormData> = { subtype: 'TAREFA' };
      const errors = validateActivityStep(data);

      expect(errors.title).toBe(ERROR_MESSAGES.TITLE_REQUIRED);
    });

    it('should return error when title is empty string', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: 'TAREFA',
        title: '',
      };
      const errors = validateActivityStep(data);

      expect(errors.title).toBe(ERROR_MESSAGES.TITLE_REQUIRED);
    });

    it('should return error when title is only whitespace', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: 'TAREFA',
        title: '   ',
      };
      const errors = validateActivityStep(data);

      expect(errors.title).toBe(ERROR_MESSAGES.TITLE_REQUIRED);
    });

    it('should return no errors when subtype and title are valid', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: 'TAREFA',
        title: 'Test Activity',
      };
      const errors = validateActivityStep(data);

      expect(errors).toEqual({});
    });

    it('should return multiple errors when both fields are missing', () => {
      const data: Partial<SendActivityFormData> = {};
      const errors = validateActivityStep(data);

      expect(errors.subtype).toBe(ERROR_MESSAGES.SUBTYPE_REQUIRED);
      expect(errors.title).toBe(ERROR_MESSAGES.TITLE_REQUIRED);
    });
  });

  describe('validateRecipientStep', () => {
    it('should return error when students array is missing', () => {
      const data: Partial<SendActivityFormData> = {};
      const errors = validateRecipientStep(data);

      expect(errors.students).toBe(ERROR_MESSAGES.STUDENTS_REQUIRED);
    });

    it('should return error when students array is empty', () => {
      const data: Partial<SendActivityFormData> = { students: [] };
      const errors = validateRecipientStep(data);

      expect(errors.students).toBe(ERROR_MESSAGES.STUDENTS_REQUIRED);
    });

    it('should return no errors when students array has items', () => {
      const data: Partial<SendActivityFormData> = {
        students: [{ studentId: '1', userInstitutionId: '1' }],
      };
      const errors = validateRecipientStep(data);

      expect(errors).toEqual({});
    });
  });

  describe('validateDeadlineStep', () => {
    it('should return error when startDate is missing', () => {
      const data: Partial<SendActivityFormData> = {};
      const errors = validateDeadlineStep(data);

      expect(errors.startDate).toBe(ERROR_MESSAGES.START_DATE_REQUIRED);
    });

    it('should return error when finalDate is missing', () => {
      const data: Partial<SendActivityFormData> = {
        startDate: new Date('2025-01-01'),
      };
      const errors = validateDeadlineStep(data);

      expect(errors.finalDate).toBe(ERROR_MESSAGES.FINAL_DATE_REQUIRED);
    });

    it('should return error when finalDate is before startDate', () => {
      const data: Partial<SendActivityFormData> = {
        startDate: new Date('2025-01-15'),
        finalDate: new Date('2025-01-10'),
      };
      const errors = validateDeadlineStep(data);

      expect(errors.finalDate).toBe(ERROR_MESSAGES.FINAL_DATE_INVALID);
    });

    it('should return no errors when dates are valid and finalDate equals startDate', () => {
      const date = new Date('2025-01-15');
      const data: Partial<SendActivityFormData> = {
        startDate: date,
        finalDate: date,
      };
      const errors = validateDeadlineStep(data);

      expect(errors).toEqual({});
    });

    it('should return no errors when finalDate is after startDate', () => {
      const data: Partial<SendActivityFormData> = {
        startDate: new Date('2025-01-10'),
        finalDate: new Date('2025-01-15'),
      };
      const errors = validateDeadlineStep(data);

      expect(errors).toEqual({});
    });

    it('should return multiple errors when both dates are missing', () => {
      const data: Partial<SendActivityFormData> = {};
      const errors = validateDeadlineStep(data);

      expect(errors.startDate).toBe(ERROR_MESSAGES.START_DATE_REQUIRED);
      expect(errors.finalDate).toBe(ERROR_MESSAGES.FINAL_DATE_REQUIRED);
    });
  });

  describe('validateStep', () => {
    it('should validate step 1 correctly', () => {
      const data: Partial<SendActivityFormData> = {};
      const errors = validateStep(1, data);

      expect(errors.subtype).toBe(ERROR_MESSAGES.SUBTYPE_REQUIRED);
      expect(errors.title).toBe(ERROR_MESSAGES.TITLE_REQUIRED);
    });

    it('should validate step 2 correctly', () => {
      const data: Partial<SendActivityFormData> = {};
      const errors = validateStep(2, data);

      expect(errors.students).toBe(ERROR_MESSAGES.STUDENTS_REQUIRED);
    });

    it('should validate step 3 correctly', () => {
      const data: Partial<SendActivityFormData> = {};
      const errors = validateStep(3, data);

      expect(errors.startDate).toBe(ERROR_MESSAGES.START_DATE_REQUIRED);
      expect(errors.finalDate).toBe(ERROR_MESSAGES.FINAL_DATE_REQUIRED);
    });

    it('should return empty errors for unknown step', () => {
      const data: Partial<SendActivityFormData> = {};
      const errors = validateStep(4, data);

      expect(errors).toEqual({});
    });
  });

  describe('isStepValid', () => {
    it('should return false for invalid step 1', () => {
      const data: Partial<SendActivityFormData> = {};
      expect(isStepValid(1, data)).toBe(false);
    });

    it('should return true for valid step 1', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: 'TRABALHO',
        title: 'Test',
      };
      expect(isStepValid(1, data)).toBe(true);
    });

    it('should return false for invalid step 2', () => {
      const data: Partial<SendActivityFormData> = { students: [] };
      expect(isStepValid(2, data)).toBe(false);
    });

    it('should return true for valid step 2', () => {
      const data: Partial<SendActivityFormData> = {
        students: [{ studentId: '1', userInstitutionId: '1' }],
      };
      expect(isStepValid(2, data)).toBe(true);
    });

    it('should return false for invalid step 3', () => {
      const data: Partial<SendActivityFormData> = {};
      expect(isStepValid(3, data)).toBe(false);
    });

    it('should return true for valid step 3', () => {
      const data: Partial<SendActivityFormData> = {
        startDate: new Date('2025-01-01'),
        finalDate: new Date('2025-01-15'),
      };
      expect(isStepValid(3, data)).toBe(true);
    });

    it('should return true for unknown step', () => {
      const data: Partial<SendActivityFormData> = {};
      expect(isStepValid(99, data)).toBe(true);
    });
  });

  describe('isFormValid', () => {
    it('should return false when step 1 is invalid', () => {
      const data: Partial<SendActivityFormData> = {
        students: [{ studentId: '1', userInstitutionId: '1' }],
        startDate: new Date('2025-01-01'),
        finalDate: new Date('2025-01-15'),
      };
      expect(isFormValid(data)).toBe(false);
    });

    it('should return false when step 2 is invalid', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: 'PROVA',
        title: 'Test',
        students: [],
        startDate: new Date('2025-01-01'),
        finalDate: new Date('2025-01-15'),
      };
      expect(isFormValid(data)).toBe(false);
    });

    it('should return false when step 3 is invalid', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: 'PROVA',
        title: 'Test',
        students: [{ studentId: '1', userInstitutionId: '1' }],
      };
      expect(isFormValid(data)).toBe(false);
    });

    it('should return true when all steps are valid', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: 'PROVA',
        title: 'Test Activity',
        students: [{ studentId: '1', userInstitutionId: '1' }],
        startDate: new Date('2025-01-01'),
        finalDate: new Date('2025-01-15'),
        canRetry: true,
      };
      expect(isFormValid(data)).toBe(true);
    });
  });
});
