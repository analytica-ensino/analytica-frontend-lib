import { z } from 'zod';
import { createFetchErrorHandler } from './hookErrorHandler';

describe('hookErrorHandler', () => {
  describe('createFetchErrorHandler', () => {
    const validationMessage = 'Erro ao validar dados';
    const genericMessage = 'Erro ao carregar dados';

    let handleError: (error: unknown) => string;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      handleError = createFetchErrorHandler(validationMessage, genericMessage);
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should return a function', () => {
      expect(typeof handleError).toBe('function');
    });

    it('should return validation error message for Zod errors', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['field'],
          message: 'Expected string, received number',
        },
      ]);

      const result = handleError(zodError);

      expect(result).toBe(validationMessage);
      expect(consoleErrorSpy).toHaveBeenCalledWith(validationMessage, zodError);
    });

    it('should return generic error message for Error instances', () => {
      const error = new Error('Network error');

      const result = handleError(error);

      expect(result).toBe(genericMessage);
      expect(consoleErrorSpy).toHaveBeenCalledWith(genericMessage, error);
    });

    it('should return generic error message for string errors', () => {
      const error = 'Something went wrong';

      const result = handleError(error);

      expect(result).toBe(genericMessage);
      expect(consoleErrorSpy).toHaveBeenCalledWith(genericMessage, error);
    });

    it('should return generic error message for unknown error types', () => {
      const error = { custom: 'error' };

      const result = handleError(error);

      expect(result).toBe(genericMessage);
      expect(consoleErrorSpy).toHaveBeenCalledWith(genericMessage, error);
    });

    it('should return generic error message for null', () => {
      const result = handleError(null);

      expect(result).toBe(genericMessage);
      expect(consoleErrorSpy).toHaveBeenCalledWith(genericMessage, null);
    });

    it('should return generic error message for undefined', () => {
      const result = handleError(undefined);

      expect(result).toBe(genericMessage);
      expect(consoleErrorSpy).toHaveBeenCalledWith(genericMessage, undefined);
    });

    it('should use custom messages provided', () => {
      const customValidation = 'Custom validation error';
      const customGeneric = 'Custom generic error';
      const customHandler = createFetchErrorHandler(
        customValidation,
        customGeneric
      );

      const zodError = new z.ZodError([
        {
          code: 'custom',
          path: [],
          message: 'Custom error',
        },
      ]);

      expect(customHandler(zodError)).toBe(customValidation);
      expect(customHandler(new Error())).toBe(customGeneric);
    });
  });
});
