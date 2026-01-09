import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import {
  createUseGoalModels,
  createGoalModelsHook,
  transformGoalModelToTableItem,
  handleGoalModelFetchError,
  goalModelsApiResponseSchema,
  DEFAULT_GOAL_MODELS_PAGINATION,
} from './useGoalModels';
import { GoalDraftType } from '../types/recommendedLessons';
import type {
  GoalModelResponse,
  GoalModelsApiResponse,
  GoalModelFilters,
} from '../types/recommendedLessons';

describe('useGoalModels', () => {
  describe('DEFAULT_GOAL_MODELS_PAGINATION', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_GOAL_MODELS_PAGINATION).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('transformGoalModelToTableItem', () => {
    const baseModel: GoalModelResponse = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: GoalDraftType.MODELO,
      title: 'Test Model',
      description: 'Test description',
      creatorUserInstitutionId: '123e4567-e89b-12d3-a456-426614174001',
      subjectId: '123e4567-e89b-12d3-a456-426614174002',
      startDate: '2024-06-01T10:00:00Z',
      finalDate: '2024-06-15T14:30:00Z',
      createdAt: '2024-06-01T10:00:00Z',
      updatedAt: '2024-06-15T14:30:00Z',
    };

    const subjectsMap = new Map([
      ['123e4567-e89b-12d3-a456-426614174002', 'Matemática'],
      ['subject-2', 'Português'],
    ]);

    it('should transform model correctly with all fields', () => {
      const result = transformGoalModelToTableItem(baseModel, subjectsMap);

      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.title).toBe('Test Model');
      expect(result.savedAt).toBe('01/06/2024');
      expect(result.subject).toBe('Matemática');
      expect(result.subjectId).toBe('123e4567-e89b-12d3-a456-426614174002');
    });

    it('should handle null title', () => {
      const model: GoalModelResponse = {
        ...baseModel,
        title: null as unknown as string,
      };

      const result = transformGoalModelToTableItem(model, subjectsMap);
      expect(result.title).toBe('Sem título');
    });

    it('should handle empty title', () => {
      const model: GoalModelResponse = {
        ...baseModel,
        title: '',
      };

      const result = transformGoalModelToTableItem(model, subjectsMap);
      expect(result.title).toBe('Sem título');
    });

    it('should handle null subjectId', () => {
      const model: GoalModelResponse = {
        ...baseModel,
        subjectId: null,
      };

      const result = transformGoalModelToTableItem(model, subjectsMap);
      expect(result.subject).toBe('');
      expect(result.subjectId).toBeNull();
    });

    it('should handle missing subject in subjectsMap', () => {
      const model: GoalModelResponse = {
        ...baseModel,
        subjectId: 'unknown-subject',
      };

      const result = transformGoalModelToTableItem(model, subjectsMap);
      expect(result.subject).toBe('');
    });

    it('should handle undefined subjectsMap', () => {
      const result = transformGoalModelToTableItem(baseModel, undefined);
      expect(result.subject).toBe('');
    });

    it('should handle empty subjectsMap', () => {
      const result = transformGoalModelToTableItem(baseModel, new Map());
      expect(result.subject).toBe('');
    });

    it('should format date correctly', () => {
      const model: GoalModelResponse = {
        ...baseModel,
        createdAt: '2024-12-25T08:00:00Z',
      };

      const result = transformGoalModelToTableItem(model, subjectsMap);
      expect(result.savedAt).toBe('25/12/2024');
    });
  });

  describe('handleGoalModelFetchError', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should return specific message for Zod errors', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['data', 'drafts'],
          message: 'Expected string, received number',
        },
      ]);

      const result = handleGoalModelFetchError(zodError);
      expect(result).toBe('Erro ao validar dados de modelos de aulas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for other errors', () => {
      const genericError = new Error('Network error');
      const result = handleGoalModelFetchError(genericError);
      expect(result).toBe('Erro ao carregar modelos de aulas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for unknown error types', () => {
      const result = handleGoalModelFetchError('string error');
      expect(result).toBe('Erro ao carregar modelos de aulas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('goalModelsApiResponseSchema', () => {
    it('should validate a valid API response', () => {
      const validResponse = {
        message: 'Success',
        data: {
          drafts: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              type: GoalDraftType.MODELO,
              title: 'Test Model',
              description: 'Test description',
              creatorUserInstitutionId: '123e4567-e89b-12d3-a456-426614174001',
              subjectId: '123e4567-e89b-12d3-a456-426614174002',
              startDate: '2024-06-01T10:00:00Z',
              finalDate: '2024-06-15T14:30:00Z',
              createdAt: '2024-06-01T10:00:00Z',
              updatedAt: '2024-06-15T14:30:00Z',
            },
          ],
          total: 1,
        },
      };

      const result = goalModelsApiResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate response with nullable fields', () => {
      const responseWithNulls = {
        message: 'Success',
        data: {
          drafts: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              type: GoalDraftType.MODELO,
              title: 'Test',
              description: null,
              creatorUserInstitutionId: '123e4567-e89b-12d3-a456-426614174001',
              subjectId: null,
              startDate: null,
              finalDate: null,
              createdAt: '2024-06-01T10:00:00Z',
              updatedAt: '2024-06-15T14:30:00Z',
            },
          ],
          total: 1,
        },
      };

      const result = goalModelsApiResponseSchema.safeParse(responseWithNulls);
      expect(result.success).toBe(true);
    });

    it('should reject invalid model id format', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          drafts: [
            {
              id: 'not-a-uuid',
              type: GoalDraftType.MODELO,
              title: 'Test',
              description: null,
              creatorUserInstitutionId: '123e4567-e89b-12d3-a456-426614174001',
              subjectId: null,
              startDate: null,
              finalDate: null,
              createdAt: '2024-06-01T10:00:00Z',
              updatedAt: '2024-06-15T14:30:00Z',
            },
          ],
          total: 1,
        },
      };

      const result = goalModelsApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject missing total field', () => {
      const missingTotal = {
        message: 'Success',
        data: {
          drafts: [],
        },
      };

      const result = goalModelsApiResponseSchema.safeParse(missingTotal);
      expect(result.success).toBe(false);
    });

    it('should reject invalid type value', () => {
      const invalidType = {
        message: 'Success',
        data: {
          drafts: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              type: 'INVALID_TYPE',
              title: 'Test',
              description: null,
              creatorUserInstitutionId: '123e4567-e89b-12d3-a456-426614174001',
              subjectId: null,
              startDate: null,
              finalDate: null,
              createdAt: '2024-06-01T10:00:00Z',
              updatedAt: '2024-06-15T14:30:00Z',
            },
          ],
          total: 1,
        },
      };

      const result = goalModelsApiResponseSchema.safeParse(invalidType);
      expect(result.success).toBe(false);
    });
  });

  describe('createUseGoalModels', () => {
    const mockFetchGoalModels = jest.fn<
      Promise<GoalModelsApiResponse>,
      [GoalModelFilters?]
    >();

    const mockDeleteGoalModel = jest.fn<Promise<void>, [string]>();

    const validApiResponse: GoalModelsApiResponse = {
      message: 'Success',
      data: {
        drafts: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            type: GoalDraftType.MODELO,
            title: 'Test Model',
            description: 'Test description',
            creatorUserInstitutionId: '123e4567-e89b-12d3-a456-426614174001',
            subjectId: '123e4567-e89b-12d3-a456-426614174002',
            startDate: '2024-06-01T10:00:00Z',
            finalDate: '2024-06-15T14:30:00Z',
            createdAt: '2024-06-01T10:00:00Z',
            updatedAt: '2024-06-15T14:30:00Z',
          },
        ],
        total: 1,
      },
    };

    const subjectsMap = new Map([
      ['123e4567-e89b-12d3-a456-426614174002', 'Matemática'],
    ]);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return initial state', () => {
      const useGoalModels = createUseGoalModels(
        mockFetchGoalModels,
        mockDeleteGoalModel
      );
      const { result } = renderHook(() => useGoalModels());

      expect(result.current.models).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual(DEFAULT_GOAL_MODELS_PAGINATION);
      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
    });

    it('should fetch models successfully', async () => {
      mockFetchGoalModels.mockResolvedValueOnce(validApiResponse);

      const useGoalModels = createUseGoalModels(
        mockFetchGoalModels,
        mockDeleteGoalModel
      );
      const { result } = renderHook(() => useGoalModels());

      await act(async () => {
        await result.current.fetchModels({ page: 1, limit: 10 }, subjectsMap);
      });

      expect(mockFetchGoalModels).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result.current.models).toHaveLength(1);
      expect(result.current.models[0].title).toBe('Test Model');
      expect(result.current.models[0].subject).toBe('Matemática');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should calculate pagination correctly', async () => {
      const responseWith25Items: GoalModelsApiResponse = {
        message: 'Success',
        data: {
          drafts: [],
          total: 25,
        },
      };

      mockFetchGoalModels.mockResolvedValueOnce(responseWith25Items);

      const useGoalModels = createUseGoalModels(
        mockFetchGoalModels,
        mockDeleteGoalModel
      );
      const { result } = renderHook(() => useGoalModels());

      await act(async () => {
        await result.current.fetchModels({ page: 2, limit: 10 });
      });

      expect(result.current.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });

    it('should use default pagination values when not provided', async () => {
      mockFetchGoalModels.mockResolvedValueOnce(validApiResponse);

      const useGoalModels = createUseGoalModels(
        mockFetchGoalModels,
        mockDeleteGoalModel
      );
      const { result } = renderHook(() => useGoalModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.limit).toBe(10);
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: GoalModelsApiResponse) => void;
      const promise = new Promise<GoalModelsApiResponse>((resolve) => {
        resolvePromise = resolve;
      });

      mockFetchGoalModels.mockReturnValueOnce(promise);

      const useGoalModels = createUseGoalModels(
        mockFetchGoalModels,
        mockDeleteGoalModel
      );
      const { result } = renderHook(() => useGoalModels());

      act(() => {
        result.current.fetchModels();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolvePromise!(validApiResponse);
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetchGoalModels.mockRejectedValueOnce(new Error('Network error'));

      const useGoalModels = createUseGoalModels(
        mockFetchGoalModels,
        mockDeleteGoalModel
      );
      const { result } = renderHook(() => useGoalModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao carregar modelos de aulas');
      expect(result.current.models).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('should handle validation error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const invalidResponse = {
        message: 'Success',
        data: {
          drafts: 'invalid',
          total: 1,
        },
      };

      mockFetchGoalModels.mockResolvedValueOnce(
        invalidResponse as unknown as GoalModelsApiResponse
      );

      const useGoalModels = createUseGoalModels(
        mockFetchGoalModels,
        mockDeleteGoalModel
      );
      const { result } = renderHook(() => useGoalModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao validar dados de modelos de aulas'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should delete model successfully', async () => {
      mockDeleteGoalModel.mockResolvedValueOnce(undefined);

      const useGoalModels = createUseGoalModels(
        mockFetchGoalModels,
        mockDeleteGoalModel
      );
      const { result } = renderHook(() => useGoalModels());

      let deleteResult: boolean = false;
      await act(async () => {
        deleteResult = await result.current.deleteModel('model-id');
      });

      expect(deleteResult).toBe(true);
      expect(mockDeleteGoalModel).toHaveBeenCalledWith('model-id');
    });

    it('should return false on delete failure', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockDeleteGoalModel.mockRejectedValueOnce(new Error('Delete failed'));

      const useGoalModels = createUseGoalModels(
        mockFetchGoalModels,
        mockDeleteGoalModel
      );
      const { result } = renderHook(() => useGoalModels());

      let deleteResult: boolean = true;
      await act(async () => {
        deleteResult = await result.current.deleteModel('model-id');
      });

      expect(deleteResult).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should clear error on new fetch', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetchGoalModels.mockRejectedValueOnce(new Error('Network error'));

      const useGoalModels = createUseGoalModels(
        mockFetchGoalModels,
        mockDeleteGoalModel
      );
      const { result } = renderHook(() => useGoalModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.error).toBe('Erro ao carregar modelos de aulas');

      mockFetchGoalModels.mockResolvedValueOnce(validApiResponse);

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.error).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createGoalModelsHook', () => {
    it('should be an alias for createUseGoalModels', () => {
      expect(createGoalModelsHook).toBe(createUseGoalModels);
    });

    it('should create a functional hook', () => {
      const mockFetch = jest.fn().mockResolvedValue({
        message: 'Success',
        data: { drafts: [], total: 0 },
      });
      const mockDelete = jest.fn().mockResolvedValue(undefined);

      const useHook = createGoalModelsHook(mockFetch, mockDelete);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
      expect(result.current.models).toEqual([]);
    });
  });
});
