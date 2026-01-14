import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import {
  createUseGoalDrafts,
  createGoalDraftsHook,
  handleGoalDraftFetchError,
  DEFAULT_GOAL_DRAFTS_PAGINATION,
} from './useGoalDrafts';
import { GoalDraftType } from '../types/recommendedLessons';
import type {
  GoalModelsApiResponse,
  GoalModelFilters,
} from '../types/recommendedLessons';

describe('useGoalDrafts', () => {
  describe('DEFAULT_GOAL_DRAFTS_PAGINATION', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_GOAL_DRAFTS_PAGINATION).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('handleGoalDraftFetchError', () => {
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

      const result = handleGoalDraftFetchError(zodError);
      expect(result).toBe('Erro ao validar dados de rascunhos de aulas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for other errors', () => {
      const genericError = new Error('Network error');
      const result = handleGoalDraftFetchError(genericError);
      expect(result).toBe('Erro ao carregar rascunhos de aulas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for unknown error types', () => {
      const result = handleGoalDraftFetchError('string error');
      expect(result).toBe('Erro ao carregar rascunhos de aulas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('createUseGoalDrafts', () => {
    const mockFetchGoalDrafts = jest.fn<
      Promise<GoalModelsApiResponse>,
      [GoalModelFilters?]
    >();

    const mockDeleteGoalDraft = jest.fn<Promise<void>, [string]>();

    const validApiResponse: GoalModelsApiResponse = {
      message: 'Success',
      data: {
        drafts: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            type: GoalDraftType.RASCUNHO,
            title: 'Test Draft',
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
      const useGoalDrafts = createUseGoalDrafts(
        mockFetchGoalDrafts,
        mockDeleteGoalDraft
      );
      const { result } = renderHook(() => useGoalDrafts());

      expect(result.current.models).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual(DEFAULT_GOAL_DRAFTS_PAGINATION);
      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
    });

    it('should fetch drafts successfully', async () => {
      mockFetchGoalDrafts.mockResolvedValueOnce(validApiResponse);

      const useGoalDrafts = createUseGoalDrafts(
        mockFetchGoalDrafts,
        mockDeleteGoalDraft
      );
      const { result } = renderHook(() => useGoalDrafts());

      await act(async () => {
        await result.current.fetchModels({ page: 1, limit: 10 }, subjectsMap);
      });

      expect(mockFetchGoalDrafts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(result.current.models).toHaveLength(1);
      expect(result.current.models[0].title).toBe('Test Draft');
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

      mockFetchGoalDrafts.mockResolvedValueOnce(responseWith25Items);

      const useGoalDrafts = createUseGoalDrafts(
        mockFetchGoalDrafts,
        mockDeleteGoalDraft
      );
      const { result } = renderHook(() => useGoalDrafts());

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
      mockFetchGoalDrafts.mockResolvedValueOnce(validApiResponse);

      const useGoalDrafts = createUseGoalDrafts(
        mockFetchGoalDrafts,
        mockDeleteGoalDraft
      );
      const { result } = renderHook(() => useGoalDrafts());

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

      mockFetchGoalDrafts.mockReturnValueOnce(promise);

      const useGoalDrafts = createUseGoalDrafts(
        mockFetchGoalDrafts,
        mockDeleteGoalDraft
      );
      const { result } = renderHook(() => useGoalDrafts());

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

      mockFetchGoalDrafts.mockRejectedValueOnce(new Error('Network error'));

      const useGoalDrafts = createUseGoalDrafts(
        mockFetchGoalDrafts,
        mockDeleteGoalDraft
      );
      const { result } = renderHook(() => useGoalDrafts());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao carregar rascunhos de aulas');
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

      mockFetchGoalDrafts.mockResolvedValueOnce(
        invalidResponse as unknown as GoalModelsApiResponse
      );

      const useGoalDrafts = createUseGoalDrafts(
        mockFetchGoalDrafts,
        mockDeleteGoalDraft
      );
      const { result } = renderHook(() => useGoalDrafts());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao validar dados de rascunhos de aulas'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should delete draft successfully', async () => {
      mockDeleteGoalDraft.mockResolvedValueOnce(undefined);

      const useGoalDrafts = createUseGoalDrafts(
        mockFetchGoalDrafts,
        mockDeleteGoalDraft
      );
      const { result } = renderHook(() => useGoalDrafts());

      let deleteResult: boolean = false;
      await act(async () => {
        deleteResult = await result.current.deleteModel('draft-id');
      });

      expect(deleteResult).toBe(true);
      expect(mockDeleteGoalDraft).toHaveBeenCalledWith('draft-id');
    });

    it('should return false on delete failure', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockDeleteGoalDraft.mockRejectedValueOnce(new Error('Delete failed'));

      const useGoalDrafts = createUseGoalDrafts(
        mockFetchGoalDrafts,
        mockDeleteGoalDraft
      );
      const { result } = renderHook(() => useGoalDrafts());

      let deleteResult: boolean = true;
      await act(async () => {
        deleteResult = await result.current.deleteModel('draft-id');
      });

      expect(deleteResult).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should clear error on new fetch', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetchGoalDrafts.mockRejectedValueOnce(new Error('Network error'));

      const useGoalDrafts = createUseGoalDrafts(
        mockFetchGoalDrafts,
        mockDeleteGoalDraft
      );
      const { result } = renderHook(() => useGoalDrafts());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.error).toBe('Erro ao carregar rascunhos de aulas');

      mockFetchGoalDrafts.mockResolvedValueOnce(validApiResponse);

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.error).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createGoalDraftsHook', () => {
    it('should be an alias for createUseGoalDrafts', () => {
      expect(createGoalDraftsHook).toBe(createUseGoalDrafts);
    });

    it('should create a functional hook', () => {
      const mockFetch = jest.fn().mockResolvedValue({
        message: 'Success',
        data: { drafts: [], total: 0 },
      });
      const mockDelete = jest.fn().mockResolvedValue(undefined);

      const useHook = createGoalDraftsHook(mockFetch, mockDelete);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
      expect(result.current.models).toEqual([]);
    });
  });
});
