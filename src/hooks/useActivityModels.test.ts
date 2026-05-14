import { renderHook, act, waitFor } from '@testing-library/react';
import {
  createUseActivityModels,
  createActivityModelsHook,
  transformModelToTableItem,
  DEFAULT_MODELS_PAGINATION,
} from './useActivityModels';
import { ActivityDraftType } from '../types/activitiesHistory';
import type {
  ActivityModelResponse,
  ActivityModelsApiResponse,
} from '../types/activitiesHistory';
import type { BaseApiClient } from '../types/api';

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

  describe('createUseActivityModels', () => {
    const createMockApiClient = (): jest.Mocked<BaseApiClient> => ({
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    });

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

    let mockApiClient: jest.Mocked<BaseApiClient>;

    beforeEach(() => {
      jest.clearAllMocks();
      mockApiClient = createMockApiClient();
    });

    it('should return initial state', () => {
      const useActivityModels = createUseActivityModels(mockApiClient);
      const { result } = renderHook(() => useActivityModels());

      expect(result.current.models).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual(DEFAULT_MODELS_PAGINATION);
      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
    });

    it('should fetch models successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: validApiResponse });

      const useActivityModels = createUseActivityModels(mockApiClient);
      const { result } = renderHook(() => useActivityModels());

      await act(async () => {
        await result.current.fetchModels({ page: 1, limit: 10 }, subjectsMap);
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activity-drafts', {
        params: expect.objectContaining({
          page: 1,
          limit: 10,
          type: ActivityDraftType.MODELO,
        }),
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

      mockApiClient.get.mockResolvedValueOnce({ data: responseWith25Items });

      const useActivityModels = createUseActivityModels(mockApiClient);
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
      mockApiClient.get.mockResolvedValueOnce({ data: validApiResponse });

      const useActivityModels = createUseActivityModels(mockApiClient);
      const { result } = renderHook(() => useActivityModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.limit).toBe(10);
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: { data: ActivityModelsApiResponse }) => void;
      const promise = new Promise<{ data: ActivityModelsApiResponse }>(
        (resolve) => {
          resolvePromise = resolve;
        }
      );

      mockApiClient.get.mockReturnValueOnce(promise);

      const useActivityModels = createUseActivityModels(mockApiClient);
      const { result } = renderHook(() => useActivityModels());

      act(() => {
        result.current.fetchModels();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolvePromise!({ data: validApiResponse });
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const useActivityModels = createUseActivityModels(mockApiClient);
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

    it('should delete model successfully', async () => {
      mockApiClient.delete.mockResolvedValueOnce({ data: {} });

      const useActivityModels = createUseActivityModels(mockApiClient);
      const { result } = renderHook(() => useActivityModels());

      let deleteResult: boolean = false;
      await act(async () => {
        deleteResult = await result.current.deleteModel('model-id');
      });

      expect(deleteResult).toBe(true);
      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/activity-drafts/model-id'
      );
    });

    it('should return false on delete failure', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockApiClient.delete.mockRejectedValueOnce(new Error('Delete failed'));

      const useActivityModels = createUseActivityModels(mockApiClient);
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

      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const useActivityModels = createUseActivityModels(mockApiClient);
      const { result } = renderHook(() => useActivityModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.error).toBe(
        'Erro ao carregar modelos de atividades'
      );

      mockApiClient.get.mockResolvedValueOnce({ data: validApiResponse });

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.error).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should pass activityCategory to API params', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: validApiResponse });

      const useActivityModels = createUseActivityModels(mockApiClient, {
        activityCategory: 'PROVA',
      });
      const { result } = renderHook(() => useActivityModels());

      await act(async () => {
        await result.current.fetchModels({ page: 1, limit: 10 });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activity-drafts', {
        params: expect.objectContaining({
          activityType: 'PROVA',
        }),
      });
    });
  });

  describe('createActivityModelsHook', () => {
    it('should be an alias for createUseActivityModels', () => {
      expect(createActivityModelsHook).toBe(createUseActivityModels);
    });

    it('should create a functional hook', () => {
      const mockApiClient: BaseApiClient = {
        get: jest.fn().mockResolvedValue({
          data: {
            message: 'Success',
            data: { activityDrafts: [], total: 0 },
          },
        }),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn().mockResolvedValue({ data: {} }),
      };

      const useHook = createActivityModelsHook(mockApiClient);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
      expect(result.current.models).toEqual([]);
    });
  });
});
