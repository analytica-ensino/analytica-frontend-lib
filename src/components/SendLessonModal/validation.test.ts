import { validateStep } from './validation';
import { SendLessonFormData } from './types';

describe('SendLessonModal validation', () => {
  describe('validateStep - Step 1 (Lesson)', () => {
    it('should return error when title is undefined', () => {
      const formData: Partial<SendLessonFormData> = {};
      const errors = validateStep(1, formData);

      expect(errors.title).toBe(
        'Campo obrigatório! Por favor, preencha este campo para continuar.'
      );
    });

    it('should return error when title is empty string', () => {
      const formData: Partial<SendLessonFormData> = {
        title: '',
      };
      const errors = validateStep(1, formData);

      expect(errors.title).toBe(
        'Campo obrigatório! Por favor, preencha este campo para continuar.'
      );
    });

    it('should return error when title is only whitespace', () => {
      const formData: Partial<SendLessonFormData> = {
        title: '   ',
      };
      const errors = validateStep(1, formData);

      expect(errors.title).toBe(
        'Campo obrigatório! Por favor, preencha este campo para continuar.'
      );
    });

    it('should not return error when title is provided', () => {
      const formData: Partial<SendLessonFormData> = {
        title: 'Aula de Matemática',
      };
      const errors = validateStep(1, formData);

      expect(errors.title).toBeUndefined();
    });

    it('should allow notification to be optional', () => {
      const formData: Partial<SendLessonFormData> = {
        title: 'Aula de Matemática',
        notification: 'Mensagem opcional',
      };
      const errors = validateStep(1, formData);

      expect(errors.title).toBeUndefined();
    });
  });

  describe('validateStep - Step 2 (Recipient)', () => {
    it('should return error when students is undefined', () => {
      const formData: Partial<SendLessonFormData> = {};
      const errors = validateStep(2, formData);

      expect(errors.students).toBe(
        'Campo obrigatório! Por favor, selecione pelo menos um aluno para continuar.'
      );
    });

    it('should return error when students array is empty', () => {
      const formData: Partial<SendLessonFormData> = {
        students: [],
      };
      const errors = validateStep(2, formData);

      expect(errors.students).toBe(
        'Campo obrigatório! Por favor, selecione pelo menos um aluno para continuar.'
      );
    });

    it('should not return error when students are selected', () => {
      const formData: Partial<SendLessonFormData> = {
        students: [{ studentId: '1', userInstitutionId: '1' }],
      };
      const errors = validateStep(2, formData);

      expect(errors.students).toBeUndefined();
    });
  });

  describe('validateStep - Step 3 (Deadline)', () => {
    it('should return error when startDate is missing', () => {
      const formData: Partial<SendLessonFormData> = {
        finalDate: '2024-12-31',
      };
      const errors = validateStep(3, formData);

      expect(errors.startDate).toBe(
        'Campo obrigatório! Por favor, preencha este campo para continuar.'
      );
    });

    it('should return error when finalDate is missing', () => {
      const formData: Partial<SendLessonFormData> = {
        startDate: '2024-01-01',
      };
      const errors = validateStep(3, formData);

      expect(errors.finalDate).toBe(
        'Campo obrigatório! Por favor, preencha este campo para continuar.'
      );
    });

    it('should return error when both dates are missing', () => {
      const formData: Partial<SendLessonFormData> = {};
      const errors = validateStep(3, formData);

      expect(errors.startDate).toBe(
        'Campo obrigatório! Por favor, preencha este campo para continuar.'
      );
      expect(errors.finalDate).toBe(
        'Campo obrigatório! Por favor, preencha este campo para continuar.'
      );
    });

    it('should return error when finalDate is before startDate', () => {
      const formData: Partial<SendLessonFormData> = {
        startDate: '2024-12-31',
        startTime: '10:00',
        finalDate: '2024-01-01',
        finalTime: '10:00',
      };
      const errors = validateStep(3, formData);

      expect(errors.finalDate).toBe(
        'A data final deve ser maior ou igual à data inicial.'
      );
    });

    it('should return error when finalDate equals startDate with same time', () => {
      const formData: Partial<SendLessonFormData> = {
        startDate: '2024-06-15',
        startTime: '10:00',
        finalDate: '2024-06-15',
        finalTime: '10:00',
      };
      const errors = validateStep(3, formData);

      expect(errors.finalDate).toBe(
        'A data final deve ser maior ou igual à data inicial.'
      );
    });

    it('should not return error when finalDate is after startDate', () => {
      const formData: Partial<SendLessonFormData> = {
        startDate: '2024-01-01',
        startTime: '00:00',
        finalDate: '2024-12-31',
        finalTime: '23:59',
      };
      const errors = validateStep(3, formData);

      expect(errors.startDate).toBeUndefined();
      expect(errors.finalDate).toBeUndefined();
    });

    it('should use default times when times are not provided', () => {
      const formData: Partial<SendLessonFormData> = {
        startDate: '2024-01-01',
        finalDate: '2024-12-31',
      };
      const errors = validateStep(3, formData);

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

    it('should return empty errors for step 4', () => {
      const formData: Partial<SendLessonFormData> = {};
      const errors = validateStep(4, formData);

      expect(errors).toEqual({});
    });

    it('should return empty errors for negative step', () => {
      const formData: Partial<SendLessonFormData> = {};
      const errors = validateStep(-1, formData);

      expect(errors).toEqual({});
    });
  });
});
