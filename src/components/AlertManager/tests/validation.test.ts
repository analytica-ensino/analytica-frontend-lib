import {
  validateMessageStep,
  validateRecipientsStep,
  validateDateStep,
  canFinish,
  isCurrentStepValid,
  validateCurrentStep,
  advanceToNextStep,
  handleNext,
} from '../validation';
import type { AlertData, CategoryConfig } from '../types';

describe('AlertsManager Validation Functions', () => {
  const mockFormData: AlertData = {
    title: 'Test Title',
    message: 'Test Message',
    date: '2024-01-01',
    time: '10:00',
    sendToday: false,
    recipientCategories: {},
  };

  const mockCategories: CategoryConfig[] = [
    {
      key: 'users',
      label: 'Users',
      itens: [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ],
      selectedIds: ['1'],
    },
  ];

  describe('validateMessageStep', () => {
    it('should return true for valid message data', () => {
      const result = validateMessageStep(mockFormData);
      expect(result).toBe(true);
    });

    it('should return error for empty title', () => {
      const formData = { ...mockFormData, title: '' };
      const result = validateMessageStep(formData);
      expect(result).toBe('Título é obrigatório');
    });

    it('should return error for whitespace-only title', () => {
      const formData = { ...mockFormData, title: '   ' };
      const result = validateMessageStep(formData);
      expect(result).toBe('Título é obrigatório');
    });

    it('should return error for empty message', () => {
      const formData = { ...mockFormData, message: '' };
      const result = validateMessageStep(formData);
      expect(result).toBe('Mensagem é obrigatória');
    });

    it('should return error for whitespace-only message', () => {
      const formData = { ...mockFormData, message: '   ' };
      const result = validateMessageStep(formData);
      expect(result).toBe('Mensagem é obrigatória');
    });

    it('should return error for undefined title', () => {
      const formData = { ...mockFormData, title: undefined };
      const result = validateMessageStep(formData as unknown as AlertData);
      expect(result).toBe('Título é obrigatório');
    });

    it('should return error for undefined message', () => {
      const formData = { ...mockFormData, message: undefined };
      const result = validateMessageStep(formData as unknown as AlertData);
      expect(result).toBe('Mensagem é obrigatória');
    });
  });

  describe('validateRecipientsStep', () => {
    it('should return true for valid categories with selected recipients', () => {
      const result = validateRecipientsStep(mockCategories);
      expect(result).toBe(true);
    });

    it('should return error for empty categories array', () => {
      const result = validateRecipientsStep([]);
      expect(result).toBe('Nenhuma categoria configurada');
    });

    it('should return error for categories with no selected recipients', () => {
      const categoriesWithoutSelection = [
        {
          ...mockCategories[0],
          selectedIds: [],
        },
      ];
      const result = validateRecipientsStep(categoriesWithoutSelection);
      expect(result).toBe('Selecione destinatários');
    });

    it('should return error for categories with undefined selectedIds', () => {
      const categoriesWithoutSelection = [
        {
          ...mockCategories[0],
          selectedIds: undefined,
        },
      ];
      const result = validateRecipientsStep(categoriesWithoutSelection);
      expect(result).toBe('Selecione destinatários');
    });

    it('should return error for categories with null selectedIds', () => {
      const categoriesWithoutSelection = [
        {
          ...mockCategories[0],
          selectedIds: null,
        },
      ];
      const result = validateRecipientsStep(
        categoriesWithoutSelection as unknown as CategoryConfig[]
      );
      expect(result).toBe('Selecione destinatários');
    });
  });

  describe('validateDateStep', () => {
    it('should return true when sendToday is true', () => {
      const formData = { ...mockFormData, sendToday: true, date: '' };
      const result = validateDateStep(formData);
      expect(result).toBe(true);
    });

    it('should return true when date is provided and sendToday is false', () => {
      const formData = {
        ...mockFormData,
        sendToday: false,
        date: '2024-01-01',
      };
      const result = validateDateStep(formData);
      expect(result).toBe(true);
    });

    it('should return error when neither sendToday nor date is provided', () => {
      const formData = { ...mockFormData, sendToday: false, date: '' };
      const result = validateDateStep(formData);
      expect(result).toBe('Data é obrigatória');
    });

    it('should return error when sendToday is false and date is undefined', () => {
      const formData = { ...mockFormData, sendToday: false, date: undefined };
      const result = validateDateStep(formData as unknown as AlertData);
      expect(result).toBe('Data é obrigatória');
    });

    it('should return error when sendToday is false and date is null', () => {
      const formData = { ...mockFormData, sendToday: false, date: null };
      const result = validateDateStep(formData as unknown as AlertData);
      expect(result).toBe('Data é obrigatória');
    });
  });

  describe('canFinish', () => {
    it('should return true when all validations pass', () => {
      const result = canFinish(mockFormData, mockCategories);
      expect(result).toBe(true);
    });

    it('should return false when message validation fails', () => {
      const invalidFormData = { ...mockFormData, title: '' };
      const result = canFinish(invalidFormData, mockCategories);
      expect(result).toBe(false);
    });

    it('should return false when recipients validation fails', () => {
      const invalidCategories = [
        {
          ...mockCategories[0],
          selectedIds: [],
        },
      ];
      const result = canFinish(mockFormData, invalidCategories);
      expect(result).toBe(false);
    });

    it('should return false when date validation fails', () => {
      const invalidFormData = { ...mockFormData, sendToday: false, date: '' };
      const result = canFinish(invalidFormData, mockCategories);
      expect(result).toBe(false);
    });

    it('should return false when multiple validations fail', () => {
      const invalidFormData = {
        ...mockFormData,
        title: '',
        sendToday: false,
        date: '',
      };
      const invalidCategories = [
        {
          ...mockCategories[0],
          selectedIds: [],
        },
      ];
      const result = canFinish(invalidFormData, invalidCategories);
      expect(result).toBe(false);
    });
  });

  describe('isCurrentStepValid', () => {
    it('should return true for valid message step (step 0)', () => {
      const result = isCurrentStepValid(0, mockFormData, mockCategories);
      expect(result).toBe(true);
    });

    it('should return false for invalid message step (step 0)', () => {
      const invalidFormData = { ...mockFormData, title: '' };
      const result = isCurrentStepValid(0, invalidFormData, mockCategories);
      expect(result).toBe(false);
    });

    it('should return true for valid recipients step (step 1)', () => {
      const result = isCurrentStepValid(1, mockFormData, mockCategories);
      expect(result).toBe(true);
    });

    it('should return false for invalid recipients step (step 1)', () => {
      const invalidCategories = [
        {
          ...mockCategories[0],
          selectedIds: [],
        },
      ];
      const result = isCurrentStepValid(1, mockFormData, invalidCategories);
      expect(result).toBe(false);
    });

    it('should return true for valid date step (step 2)', () => {
      const result = isCurrentStepValid(2, mockFormData, mockCategories);
      expect(result).toBe(true);
    });

    it('should return false for invalid date step (step 2)', () => {
      const invalidFormData = { ...mockFormData, sendToday: false, date: '' };
      const result = isCurrentStepValid(2, invalidFormData, mockCategories);
      expect(result).toBe(false);
    });

    it('should return true for preview step (step 3)', () => {
      const result = isCurrentStepValid(3, mockFormData, mockCategories);
      expect(result).toBe(true);
    });

    it('should return true for custom step without validation', () => {
      const customSteps = [{ id: '1', label: 'Custom Step' }];
      const result = isCurrentStepValid(
        4,
        mockFormData,
        mockCategories,
        customSteps
      );
      expect(result).toBe(true);
    });

    it('should return true for custom step with passing validation', () => {
      const customValidate = jest.fn().mockReturnValue(true);
      const customSteps = [
        { id: '1', label: 'Custom Step', validate: customValidate },
      ];
      const result = isCurrentStepValid(
        10,
        mockFormData,
        mockCategories,
        customSteps
      );
      expect(result).toBe(true);
    });

    it('should handle undefined custom steps', () => {
      const result = isCurrentStepValid(
        4,
        mockFormData,
        mockCategories,
        undefined
      );
      expect(result).toBe(true);
    });
  });

  describe('validateCurrentStep', () => {
    it('should validate message step (step 0)', () => {
      const result = validateCurrentStep(0, mockFormData, mockCategories);
      expect(result).toBe(true);
    });

    it('should validate recipients step (step 1)', () => {
      const result = validateCurrentStep(1, mockFormData, mockCategories);
      expect(result).toBe(true);
    });

    it('should validate date step (step 2)', () => {
      const result = validateCurrentStep(2, mockFormData, mockCategories);
      expect(result).toBe(true);
    });

    it('should return true for preview step (step 3)', () => {
      const result = validateCurrentStep(3, mockFormData, mockCategories);
      expect(result).toBe(true);
    });

    it('should validate custom step with validation function', () => {
      const customValidate = jest.fn().mockReturnValue(true);
      const customSteps = [
        { id: '1', label: 'Custom Step', validate: customValidate },
      ];
      const result = validateCurrentStep(
        4, // Step customizado (após os 4 steps padrão)
        mockFormData,
        mockCategories,
        customSteps
      );
      expect(result).toBe(true);
      expect(customValidate).toHaveBeenCalledWith(mockFormData);
    });

    it('should return true for custom step without validation function', () => {
      const customSteps = [{ id: '1', label: 'Custom Step' }];
      const result = validateCurrentStep(
        4, // Step customizado (após os 4 steps padrão)
        mockFormData,
        mockCategories,
        customSteps
      );
      expect(result).toBe(true);
    });

    it('should return error for invalid message step', () => {
      const invalidFormData = { ...mockFormData, title: '' };
      const result = validateCurrentStep(0, invalidFormData, mockCategories);
      expect(result).toBe('Título é obrigatório');
    });

    it('should return error for invalid recipients step', () => {
      const invalidCategories = [
        {
          ...mockCategories[0],
          selectedIds: [],
        },
      ];
      const result = validateCurrentStep(1, mockFormData, invalidCategories);
      expect(result).toBe('Selecione destinatários');
    });

    it('should return error for invalid date step', () => {
      const invalidFormData = { ...mockFormData, sendToday: false, date: '' };
      const result = validateCurrentStep(2, invalidFormData, mockCategories);
      expect(result).toBe('Data é obrigatória');
    });
  });

  describe('advanceToNextStep', () => {
    const mockSetCompletedSteps = jest.fn();
    const mockSetCurrentStep = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should add current step to completed steps if not already completed', () => {
      advanceToNextStep(0, [], mockSetCompletedSteps, mockSetCurrentStep);
      expect(mockSetCompletedSteps).toHaveBeenCalledWith([0]);
      expect(mockSetCurrentStep).toHaveBeenCalledWith(1);
    });

    it('should not add current step to completed steps if already completed', () => {
      advanceToNextStep(0, [0], mockSetCompletedSteps, mockSetCurrentStep);
      expect(mockSetCompletedSteps).not.toHaveBeenCalled();
      expect(mockSetCurrentStep).toHaveBeenCalledWith(1);
    });

    it('should work without setter functions', () => {
      expect(() => {
        advanceToNextStep(0, []);
      }).not.toThrow();
    });

    it('should work with only setCurrentStep', () => {
      advanceToNextStep(0, [], undefined, mockSetCurrentStep);
      expect(mockSetCompletedSteps).not.toHaveBeenCalled();
      expect(mockSetCurrentStep).toHaveBeenCalledWith(1);
    });

    it('should work with only setCompletedSteps', () => {
      advanceToNextStep(0, [], mockSetCompletedSteps, undefined);
      expect(mockSetCompletedSteps).toHaveBeenCalledWith([0]);
      expect(mockSetCurrentStep).not.toHaveBeenCalled();
    });
  });

  describe('handleNext', () => {
    const mockSteps = [
      { id: '1', label: 'Step 1' },
      { id: '2', label: 'Step 2' },
      { id: '3', label: 'Step 3' },
    ];

    const mockSetCompletedSteps = jest.fn();
    const mockSetCurrentStep = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should advance to next step when validation passes', () => {
      const result = handleNext({
        currentStep: 0,
        steps: mockSteps,
        formData: mockFormData,
        categories: mockCategories,
        customSteps: undefined,
        completedSteps: [],
        setCompletedSteps: mockSetCompletedSteps,
        setCurrentStep: mockSetCurrentStep,
      });

      expect(result.success).toBe(true);
      expect(mockSetCompletedSteps).toHaveBeenCalledWith([0]);
      expect(mockSetCurrentStep).toHaveBeenCalledWith(1);
    });

    it('should not advance when validation fails', () => {
      const invalidFormData = { ...mockFormData, title: '' };
      const result = handleNext({
        currentStep: 0,
        steps: mockSteps,
        formData: invalidFormData,
        categories: mockCategories,
        customSteps: undefined,
        completedSteps: [],
        setCompletedSteps: mockSetCompletedSteps,
        setCurrentStep: mockSetCurrentStep,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Título é obrigatório');
      expect(mockSetCompletedSteps).not.toHaveBeenCalled();
      expect(mockSetCurrentStep).not.toHaveBeenCalled();
    });

    it('should not advance when already on last step', () => {
      const result = handleNext({
        currentStep: 2,
        steps: mockSteps,
        formData: mockFormData,
        categories: mockCategories,
        customSteps: undefined,
        completedSteps: [],
        setCompletedSteps: mockSetCompletedSteps,
        setCurrentStep: mockSetCurrentStep,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Já está no último step');
      expect(mockSetCompletedSteps).not.toHaveBeenCalled();
      expect(mockSetCurrentStep).not.toHaveBeenCalled();
    });

    it('should not add to completed steps if already completed', () => {
      const result = handleNext({
        currentStep: 0,
        steps: mockSteps,
        formData: mockFormData,
        categories: mockCategories,
        customSteps: undefined,
        completedSteps: [0], // Already completed
        setCompletedSteps: mockSetCompletedSteps,
        setCurrentStep: mockSetCurrentStep,
      });

      expect(result.success).toBe(true);
      expect(mockSetCompletedSteps).not.toHaveBeenCalled();
      expect(mockSetCurrentStep).toHaveBeenCalledWith(1);
    });

    it('should handle recipients step validation', () => {
      const invalidCategories = [
        {
          ...mockCategories[0],
          selectedIds: [],
        },
      ];

      const result = handleNext({
        currentStep: 1,
        steps: mockSteps,
        formData: mockFormData,
        categories: invalidCategories,
        customSteps: undefined,
        completedSteps: [],
        setCompletedSteps: mockSetCompletedSteps,
        setCurrentStep: mockSetCurrentStep,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Selecione destinatários');
    });

    it('should work without setter functions', () => {
      const result = handleNext({
        currentStep: 0,
        steps: mockSteps,
        formData: mockFormData,
        categories: mockCategories,
      });

      expect(result.success).toBe(true);
    });
  });
});
