import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import {
  createUseActivityModels,
  createActivityModelsHook,
  transformModelToTableItem,
  handleModelFetchError,
  activityModelsApiResponseSchema,
  DEFAULT_MODELS_PAGINATION,
} from './useActivityModels';
import { ActivityDraftType } from '../types/activitiesHistory';
import type {
  ActivityModelResponse,
  ActivityModelsApiResponse,
  ActivityModelFilters,
} from '../types/activitiesHistory';

describe('useActivityModels', () => {
  describe('DEFAULT_MODELS_PAGINATION', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_MODELS_PAGINATION).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('transformModelToTableItem', () => {
    const baseModel: ActivityModelResponse = {
      id: 'model-123',
      type: ActivityDraftType.MODELO,
      title: 'Test Model',
      creatorUserInstitutionId: 'creator-1',
      subjectId: 'subject-1',
      filters: {
        questionTypes: ['multiple_choice'],
        subjects: ['math'],
      },
      createdAt: '2024-06-01T10:00:00Z',
      updatedAt: '2024-06-15T14:30:00Z',
    };

    const subjectsMap = new Map([
      ['subject-1', 'Matemática'],
      ['subject-2', 'Português'],
    ]);

    it('should transform model correctly with all fields', () => {
      const result = transformModelToTableItem(baseModel, subjectsMap);

      expect(result.id).toBe('model-123');
      expect(result.title).toBe('Test Model');
      expect(result.savedAt).toBe('01/06/2024');
      expect(result.subject).toEqual({
        id: 'subject-1',
        name: 'Matemática',
        icon: 'BookOpen',
        color: '#6B7280',
      });
      expect(result.subjectId).toBe('subject-1');
    });

    it('should handle null title', () => {
      const model: ActivityModelResponse = {
        ...baseModel,
        title: null,
      };

      const result = transformModelToTableItem(model, subjectsMap);
      expect(result.title).toBe('Sem título');
    });

    it('should handle null subjectId', () => {
      const model: ActivityModelResponse = {
        ...baseModel,
        subjectId: null,
      };

      const result = transformModelToTableItem(model, subjectsMap);
      expect(result.subject).toBeNull();
      expect(result.subjectId).toBeNull();
    });

    it('should handle missing subject in subjectsMap', () => {
      const model: ActivityModelResponse = {
        ...baseModel,
        subjectId: 'unknown-subject',
      };

      const result = transformModelToTableItem(model, subjectsMap);
      expect(result.subject).toBeNull();
    });

    it('should handle undefined subjectsMap', () => {
      const result = transformModelToTableItem(baseModel, undefined);
      expect(result.subject).toBeNull();
    });

    it('should handle empty subjectsMap', () => {
      const result = transformModelToTableItem(baseModel, new Map());
      expect(result.subject).toBeNull();
    });

    it('should format date correctly', () => {
      const model: ActivityModelResponse = {
        ...baseModel,
        createdAt: '2024-12-25T08:00:00Z',
      };

      const result = transformModelToTableItem(model, subjectsMap);
      expect(result.savedAt).toBe('25/12/2024');
    });
  });

  describe('handleModelFetchError', () => {
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
          path: ['data', 'activityDrafts'],
          message: 'Expected string, received number',
        },
      ]);

      const result = handleModelFetchError(zodError);
      expect(result).toBe('Erro ao validar dados de modelos de atividades');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for other errors', () => {
      const genericError = new Error('Network error');
      const result = handleModelFetchError(genericError);
      expect(result).toBe('Erro ao carregar modelos de atividades');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for unknown error types', () => {
      const result = handleModelFetchError('string error');
      expect(result).toBe('Erro ao carregar modelos de atividades');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('activityModelsApiResponseSchema', () => {
    it('should validate a valid API response', () => {
      const validResponse = {
        message: 'Success',
        data: {
          activityDrafts: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              type: ActivityDraftType.MODELO,
              title: 'Test Model',
              creatorUserInstitutionId: '123e4567-e89b-12d3-a456-426614174001',
              subjectId: '123e4567-e89b-12d3-a456-426614174002',
              filters: {
                questionTypes: ['multiple_choice'],
                subjects: ['math'],
              },
              createdAt: '2024-06-01T10:00:00Z',
              updatedAt: '2024-06-15T14:30:00Z',
            },
          ],
          total: 1,
        },
      };

      const result = activityModelsApiResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate response with nullable fields', () => {
      const responseWithNulls = {
        message: 'Success',
        data: {
          activityDrafts: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              type: ActivityDraftType.MODELO,
              title: null,
              creatorUserInstitutionId: null,
              subjectId: null,
              filters: null,
              createdAt: '2024-06-01T10:00:00Z',
              updatedAt: '2024-06-15T14:30:00Z',
            },
          ],
          total: 1,
        },
      };

      const result =
        activityModelsApiResponseSchema.safeParse(responseWithNulls);
      expect(result.success).toBe(true);
    });

    it('should reject invalid model id format', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          activityDrafts: [
            {
              id: 'not-a-uuid',
              type: ActivityDraftType.MODELO,
              title: 'Test',
              creatorUserInstitutionId: null,
              subjectId: null,
              filters: null,
              createdAt: '2024-06-01T10:00:00Z',
              updatedAt: '2024-06-15T14:30:00Z',
            },
          ],
          total: 1,
        },
      };

      const result = activityModelsApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject missing total field', () => {
      const missingTotal = {
        message: 'Success',
        data: {
          activityDrafts: [],
        },
      };

      const result = activityModelsApiResponseSchema.safeParse(missingTotal);
      expect(result.success).toBe(false);
    });

    it('should reject invalid type value', () => {
      const invalidType = {
        message: 'Success',
        data: {
          activityDrafts: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              type: 'INVALID_TYPE',
              title: 'Test',
              creatorUserInstitutionId: null,
              subjectId: null,
              filters: null,
              createdAt: '2024-06-01T10:00:00Z',
              updatedAt: '2024-06-15T14:30:00Z',
            },
          ],
          total: 1,
        },
      };

      const result = activityModelsApiResponseSchema.safeParse(invalidType);
      expect(result.success).toBe(false);
    });
  });

  describe('createUseActivityModels', () => {
    const mockFetchActivityModels = jest.fn<
      Promise<ActivityModelsApiResponse>,
      [ActivityModelFilters?]
    >();

    const mockDeleteActivityModel = jest.fn<Promise<void>, [string]>();

    const validApiResponse: ActivityModelsApiResponse = {
      message: 'Success',
      data: {
        activityDrafts: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            type: ActivityDraftType.MODELO,
            title: 'Test Model',
            creatorUserInstitutionId: '123e4567-e89b-12d3-a456-426614174001',
            subjectId: '123e4567-e89b-12d3-a456-426614174002',
            filters: null,
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
      const useActivityModels = createUseActivityModels(
        mockFetchActivityModels,
        mockDeleteActivityModel
      );
      const { result } = renderHook(() => useActivityModels());

      expect(result.current.models).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual(DEFAULT_MODELS_PAGINATION);
      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
    });

    it('should fetch models successfully', async () => {
      mockFetchActivityModels.mockResolvedValueOnce(validApiResponse);

      const useActivityModels = createUseActivityModels(
        mockFetchActivityModels,
        mockDeleteActivityModel
      );
      const { result } = renderHook(() => useActivityModels());

      await act(async () => {
        await result.current.fetchModels({ page: 1, limit: 10 }, subjectsMap);
      });

      expect(mockFetchActivityModels).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result.current.models).toHaveLength(1);
      expect(result.current.models[0].title).toBe('Test Model');
      expect(result.current.models[0].subject).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Matemática',
        icon: 'BookOpen',
        color: '#6B7280',
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should calculate pagination correctly', async () => {
      const responseWith25Items: ActivityModelsApiResponse = {
        message: 'Success',
        data: {
          activityDrafts: [],
          total: 25,
        },
      };

      mockFetchActivityModels.mockResolvedValueOnce(responseWith25Items);

      const useActivityModels = createUseActivityModels(
        mockFetchActivityModels,
        mockDeleteActivityModel
      );
      const { result } = renderHook(() => useActivityModels());

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
      mockFetchActivityModels.mockResolvedValueOnce(validApiResponse);

      const useActivityModels = createUseActivityModels(
        mockFetchActivityModels,
        mockDeleteActivityModel
      );
      const { result } = renderHook(() => useActivityModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.limit).toBe(10);
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: ActivityModelsApiResponse) => void;
      const promise = new Promise<ActivityModelsApiResponse>((resolve) => {
        resolvePromise = resolve;
      });

      mockFetchActivityModels.mockReturnValueOnce(promise);

      const useActivityModels = createUseActivityModels(
        mockFetchActivityModels,
        mockDeleteActivityModel
      );
      const { result } = renderHook(() => useActivityModels());

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

      mockFetchActivityModels.mockRejectedValueOnce(new Error('Network error'));

      const useActivityModels = createUseActivityModels(
        mockFetchActivityModels,
        mockDeleteActivityModel
      );
      const { result } = renderHook(() => useActivityModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao carregar modelos de atividades'
      );
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
          activityDrafts: 'invalid',
          total: 1,
        },
      };

      mockFetchActivityModels.mockResolvedValueOnce(
        invalidResponse as unknown as ActivityModelsApiResponse
      );

      const useActivityModels = createUseActivityModels(
        mockFetchActivityModels,
        mockDeleteActivityModel
      );
      const { result } = renderHook(() => useActivityModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao validar dados de modelos de atividades'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should delete model successfully', async () => {
      mockDeleteActivityModel.mockResolvedValueOnce(undefined);

      const useActivityModels = createUseActivityModels(
        mockFetchActivityModels,
        mockDeleteActivityModel
      );
      const { result } = renderHook(() => useActivityModels());

      let deleteResult: boolean = false;
      await act(async () => {
        deleteResult = await result.current.deleteModel('model-id');
      });

      expect(deleteResult).toBe(true);
      expect(mockDeleteActivityModel).toHaveBeenCalledWith('model-id');
    });

    it('should return false on delete failure', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockDeleteActivityModel.mockRejectedValueOnce(new Error('Delete failed'));

      const useActivityModels = createUseActivityModels(
        mockFetchActivityModels,
        mockDeleteActivityModel
      );
      const { result } = renderHook(() => useActivityModels());

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

      mockFetchActivityModels.mockRejectedValueOnce(new Error('Network error'));

      const useActivityModels = createUseActivityModels(
        mockFetchActivityModels,
        mockDeleteActivityModel
      );
      const { result } = renderHook(() => useActivityModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.error).toBe(
        'Erro ao carregar modelos de atividades'
      );

      mockFetchActivityModels.mockResolvedValueOnce(validApiResponse);

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.error).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createActivityModelsHook', () => {
    it('should be an alias for createUseActivityModels', () => {
      expect(createActivityModelsHook).toBe(createUseActivityModels);
    });

    it('should create a functional hook', () => {
      const mockFetch = jest.fn().mockResolvedValue({
        message: 'Success',
        data: { activityDrafts: [], total: 0 },
      });
      const mockDelete = jest.fn().mockResolvedValue(undefined);

      const useHook = createActivityModelsHook(mockFetch, mockDelete);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
      expect(result.current.models).toEqual([]);
    });
  });
});
