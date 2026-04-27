import {
  validateActivityStep,
  validateRecipientStep,
  validateDeadlineStep,
  validateStep,
  isStepValid,
  isFormValid,
  ERROR_MESSAGES,
} from './validation';
import { ActivityMode, ActivitySubtype, SendActivityFormData } from './types';

describe('validation', () => {
  describe('validateActivityStep', () => {
    it('should return error when subtype is missing', () => {
      const data: Partial<SendActivityFormData> = {};
      const errors = validateActivityStep(data);

      expect(errors.subtype).toBe(ERROR_MESSAGES.SUBTYPE_REQUIRED);
    });

    it('should return error when title is missing', () => {
      const data: Partial<SendActivityFormData> = { subtype: ActivitySubtype.TAREFA };
      const errors = validateActivityStep(data);

      expect(errors.title).toBe(ERROR_MESSAGES.TITLE_REQUIRED);
    });

    it('should return error when title is empty string', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.TAREFA,
        title: '',
      };
      const errors = validateActivityStep(data);

      expect(errors.title).toBe(ERROR_MESSAGES.TITLE_REQUIRED);
    });

    it('should return error when title is only whitespace', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.TAREFA,
        title: '   ',
      };
      const errors = validateActivityStep(data);

      expect(errors.title).toBe(ERROR_MESSAGES.TITLE_REQUIRED);
    });

    it('should return no errors when subtype and title are valid', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.TAREFA,
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

    it('should return mode error when enableExamMode is true, subtype is PROVA, and mode is missing', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.PROVA,
        title: 'Test',
      };
      const errors = validateActivityStep(data, { enableExamMode: true });

      expect(errors.mode).toBe(ERROR_MESSAGES.MODE_REQUIRED);
    });

    it('should not return mode error when enableExamMode is true, subtype is PROVA, and mode is provided', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.PROVA,
        title: 'Test',
        mode: ActivityMode.ONLINE,
      };
      const errors = validateActivityStep(data, { enableExamMode: true });

      expect(errors.mode).toBeUndefined();
    });

    it('should not return mode error when enableExamMode is true but subtype is not PROVA', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.TAREFA,
        title: 'Test',
      };
      const errors = validateActivityStep(data, { enableExamMode: true });

      expect(errors.mode).toBeUndefined();
    });

    it('should not return mode error when enableExamMode is false and subtype is PROVA', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.PROVA,
        title: 'Test',
      };
      const errors = validateActivityStep(data, { enableExamMode: false });

      expect(errors.mode).toBeUndefined();
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
        startDate: '2025-01-01',
        startTime: '00:00',
      };
      const errors = validateDeadlineStep(data);

      expect(errors.finalDate).toBe(ERROR_MESSAGES.FINAL_DATE_REQUIRED);
    });

    it('should return error when finalDate is before startDate', () => {
      const data: Partial<SendActivityFormData> = {
        startDate: '2025-01-15',
        startTime: '00:00',
        finalDate: '2025-01-10',
        finalTime: '23:59',
      };
      const errors = validateDeadlineStep(data);

      expect(errors.finalDate).toBe(ERROR_MESSAGES.FINAL_DATE_INVALID);
    });

    it('should return no errors when dates are valid and finalDate equals startDate', () => {
      const data: Partial<SendActivityFormData> = {
        startDate: '2025-01-15',
        startTime: '00:00',
        finalDate: '2025-01-15',
        finalTime: '23:59',
      };
      const errors = validateDeadlineStep(data);

      expect(errors).toEqual({});
    });

    it('should return no errors when finalDate is after startDate', () => {
      const data: Partial<SendActivityFormData> = {
        startDate: '2025-01-10',
        startTime: '00:00',
        finalDate: '2025-01-15',
        finalTime: '23:59',
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
        subtype: ActivitySubtype.TRABALHO,
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
        startDate: '2025-01-01',
        startTime: '00:00',
        finalDate: '2025-01-15',
        finalTime: '23:59',
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
        startDate: '2025-01-01',
        startTime: '00:00',
        finalDate: '2025-01-15',
        finalTime: '23:59',
      };
      expect(isFormValid(data)).toBe(false);
    });

    it('should return false when step 2 is invalid', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.PROVA,
        title: 'Test',
        students: [],
        startDate: '2025-01-01',
        startTime: '00:00',
        finalDate: '2025-01-15',
        finalTime: '23:59',
      };
      expect(isFormValid(data)).toBe(false);
    });

    it('should return false when step 3 is invalid', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.PROVA,
        title: 'Test',
        students: [{ studentId: '1', userInstitutionId: '1' }],
      };
      expect(isFormValid(data)).toBe(false);
    });

    it('should return true when all steps are valid', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.PROVA,
        title: 'Test Activity',
        students: [{ studentId: '1', userInstitutionId: '1' }],
        startDate: '2025-01-01',
        startTime: '00:00',
        finalDate: '2025-01-15',
        finalTime: '23:59',
        canRetry: true,
      };
      expect(isFormValid(data)).toBe(true);
    });

    it('should return false when enableExamMode is true and mode is missing for PROVA', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.PROVA,
        title: 'Test',
        students: [{ studentId: '1', userInstitutionId: '1' }],
        startDate: '2025-01-01',
        startTime: '00:00',
        finalDate: '2025-01-15',
        finalTime: '23:59',
      };
      expect(isFormValid(data, { enableExamMode: true })).toBe(false);
    });

    it('should return true when enableExamMode is true and mode is provided for PROVA', () => {
      const data: Partial<SendActivityFormData> = {
        subtype: ActivitySubtype.PROVA,
        title: 'Test',
        mode: ActivityMode.PRESENCIAL,
        students: [{ studentId: '1', userInstitutionId: '1' }],
        startDate: '2025-01-01',
        startTime: '00:00',
        finalDate: '2025-01-15',
        finalTime: '23:59',
      };
      expect(isFormValid(data, { enableExamMode: true })).toBe(true);
    });
  });
});
