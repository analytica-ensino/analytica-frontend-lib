import { validateStep } from './validation';
import { SendLessonFormData } from './types';

describe('SendLessonModal validation', () => {
  describe('validateStep - Step 1 (Recipient)', () => {
    it('should return error when students is undefined', () => {
      const formData: Partial<SendLessonFormData> = {};
      const errors = validateStep(1, formData);

      expect(errors.students).toBe('Selecione pelo menos um destinatário');
    });

    it('should return error when students array is empty', () => {
      const formData: Partial<SendLessonFormData> = {
        students: [],
      };
      const errors = validateStep(1, formData);

      expect(errors.students).toBe('Selecione pelo menos um destinatário');
    });

    it('should not return error when students are selected', () => {
      const formData: Partial<SendLessonFormData> = {
        students: [{ studentId: '1', userInstitutionId: '1' }],
      };
      const errors = validateStep(1, formData);

      expect(errors.students).toBeUndefined();
    });
  });

  describe('validateStep - Step 2 (Deadline)', () => {
    it('should return error when startDate is missing', () => {
      const formData: Partial<SendLessonFormData> = {
        finalDate: '2024-12-31',
      };
      const errors = validateStep(2, formData);

      expect(errors.startDate).toBe('Data de início é obrigatória');
    });

    it('should return error when finalDate is missing', () => {
      const formData: Partial<SendLessonFormData> = {
        startDate: '2024-01-01',
      };
      const errors = validateStep(2, formData);

      expect(errors.finalDate).toBe('Data final é obrigatória');
    });

    it('should return error when both dates are missing', () => {
      const formData: Partial<SendLessonFormData> = {};
      const errors = validateStep(2, formData);

      expect(errors.startDate).toBe('Data de início é obrigatória');
      expect(errors.finalDate).toBe('Data final é obrigatória');
    });

    it('should return error when finalDate is before startDate', () => {
      const formData: Partial<SendLessonFormData> = {
        startDate: '2024-12-31',
        startTime: '10:00',
        finalDate: '2024-01-01',
        finalTime: '10:00',
      };
      const errors = validateStep(2, formData);

      expect(errors.finalDate).toBe(
        'A data final deve ser posterior à data de início'
      );
    });

    it('should return error when finalDate equals startDate with same time', () => {
      const formData: Partial<SendLessonFormData> = {
        startDate: '2024-06-15',
        startTime: '10:00',
        finalDate: '2024-06-15',
        finalTime: '10:00',
      };
      const errors = validateStep(2, formData);

      expect(errors.finalDate).toBe(
        'A data final deve ser posterior à data de início'
      );
    });

    it('should not return error when finalDate is after startDate', () => {
      const formData: Partial<SendLessonFormData> = {
        startDate: '2024-01-01',
        startTime: '00:00',
        finalDate: '2024-12-31',
        finalTime: '23:59',
      };
      const errors = validateStep(2, formData);

      expect(errors.startDate).toBeUndefined();
      expect(errors.finalDate).toBeUndefined();
    });

    it('should use default times when times are not provided', () => {
      const formData: Partial<SendLessonFormData> = {
        startDate: '2024-01-01',
        finalDate: '2024-12-31',
      };
      const errors = validateStep(2, formData);

      expect(errors.startDate).toBeUndefined();
      expect(errors.finalDate).toBeUndefined();
    });
  });

  describe('validateStep - Invalid step', () => {
    it('should return empty errors for invalid step number', () => {
      const formData: Partial<SendLessonFormData> = {};
      const errors = validateStep(0, formData);

      expect(errors).toEqual({});
    });

    it('should return empty errors for step 3', () => {
      const formData: Partial<SendLessonFormData> = {};
      const errors = validateStep(3, formData);

      expect(errors).toEqual({});
    });

    it('should return empty errors for negative step', () => {
      const formData: Partial<SendLessonFormData> = {};
      const errors = validateStep(-1, formData);

      expect(errors).toEqual({});
    });
  });
});
