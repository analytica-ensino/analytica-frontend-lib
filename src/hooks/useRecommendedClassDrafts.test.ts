import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import {
  createUseRecommendedClassDrafts,
  createRecommendedClassDraftsHook,
  handleRecommendedClassDraftFetchError,
  DEFAULT_GOAL_DRAFTS_PAGINATION,
} from './useRecommendedClassDrafts';
import { RecommendedClassDraftType } from '../types/recommendedLessons';
import type {
  RecommendedClassModelsApiResponse,
  RecommendedClassModelFilters,
} from '../types/recommendedLessons';

describe('useRecommendedClassDrafts', () => {
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

  describe('handleRecommendedClassDraftFetchError', () => {
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

      const result = handleRecommendedClassDraftFetchError(zodError);
      expect(result).toBe('Erro ao validar dados de rascunhos de aulas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for other errors', () => {
      const genericError = new Error('Network error');
      const result = handleRecommendedClassDraftFetchError(genericError);
      expect(result).toBe('Erro ao carregar rascunhos de aulas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for unknown error types', () => {
      const result = handleRecommendedClassDraftFetchError('string error');
      expect(result).toBe('Erro ao carregar rascunhos de aulas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('createUseRecommendedClassDrafts', () => {
    const mockFetchRecommendedClassDrafts = jest.fn<
      Promise<RecommendedClassModelsApiResponse>,
      [RecommendedClassModelFilters?]
    >();

    const mockDeleteRecommendedClassDraft = jest.fn<Promise<void>, [string]>();

    const validApiResponse: RecommendedClassModelsApiResponse = {
      message: 'Success',
      data: {
        drafts: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            type: RecommendedClassDraftType.RASCUNHO,
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
      const useRecommendedClassDrafts = createUseRecommendedClassDrafts(
        mockFetchRecommendedClassDrafts,
        mockDeleteRecommendedClassDraft
      );
      const { result } = renderHook(() => useRecommendedClassDrafts());

      expect(result.current.models).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual(DEFAULT_GOAL_DRAFTS_PAGINATION);
      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
    });

    it('should fetch drafts successfully', async () => {
      mockFetchRecommendedClassDrafts.mockResolvedValueOnce(validApiResponse);

      const useRecommendedClassDrafts = createUseRecommendedClassDrafts(
        mockFetchRecommendedClassDrafts,
        mockDeleteRecommendedClassDraft
      );
      const { result } = renderHook(() => useRecommendedClassDrafts());

      await act(async () => {
        await result.current.fetchModels({ page: 1, limit: 10 }, subjectsMap);
      });

      expect(mockFetchRecommendedClassDrafts).toHaveBeenCalledWith({
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
      const responseWith25Items: RecommendedClassModelsApiResponse = {
        message: 'Success',
        data: {
          drafts: [],
          total: 25,
        },
      };

      mockFetchRecommendedClassDrafts.mockResolvedValueOnce(
        responseWith25Items
      );

      const useRecommendedClassDrafts = createUseRecommendedClassDrafts(
        mockFetchRecommendedClassDrafts,
        mockDeleteRecommendedClassDraft
      );
      const { result } = renderHook(() => useRecommendedClassDrafts());

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
      mockFetchRecommendedClassDrafts.mockResolvedValueOnce(validApiResponse);

      const useRecommendedClassDrafts = createUseRecommendedClassDrafts(
        mockFetchRecommendedClassDrafts,
        mockDeleteRecommendedClassDraft
      );
      const { result } = renderHook(() => useRecommendedClassDrafts());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.limit).toBe(10);
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: RecommendedClassModelsApiResponse) => void;
      const promise = new Promise<RecommendedClassModelsApiResponse>(
        (resolve) => {
          resolvePromise = resolve;
        }
      );

      mockFetchRecommendedClassDrafts.mockReturnValueOnce(promise);

      const useRecommendedClassDrafts = createUseRecommendedClassDrafts(
        mockFetchRecommendedClassDrafts,
        mockDeleteRecommendedClassDraft
      );
      const { result } = renderHook(() => useRecommendedClassDrafts());

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

      mockFetchRecommendedClassDrafts.mockRejectedValueOnce(
        new Error('Network error')
      );

      const useRecommendedClassDrafts = createUseRecommendedClassDrafts(
        mockFetchRecommendedClassDrafts,
        mockDeleteRecommendedClassDraft
      );
      const { result } = renderHook(() => useRecommendedClassDrafts());

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

      mockFetchRecommendedClassDrafts.mockResolvedValueOnce(
        invalidResponse as unknown as RecommendedClassModelsApiResponse
      );

      const useRecommendedClassDrafts = createUseRecommendedClassDrafts(
        mockFetchRecommendedClassDrafts,
        mockDeleteRecommendedClassDraft
      );
      const { result } = renderHook(() => useRecommendedClassDrafts());

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
      mockDeleteRecommendedClassDraft.mockResolvedValueOnce(undefined);

      const useRecommendedClassDrafts = createUseRecommendedClassDrafts(
        mockFetchRecommendedClassDrafts,
        mockDeleteRecommendedClassDraft
      );
      const { result } = renderHook(() => useRecommendedClassDrafts());

      let deleteResult: boolean = false;
      await act(async () => {
        deleteResult = await result.current.deleteModel('draft-id');
      });

      expect(deleteResult).toBe(true);
      expect(mockDeleteRecommendedClassDraft).toHaveBeenCalledWith('draft-id');
    });

    it('should return false on delete failure', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockDeleteRecommendedClassDraft.mockRejectedValueOnce(
        new Error('Delete failed')
      );

      const useRecommendedClassDrafts = createUseRecommendedClassDrafts(
        mockFetchRecommendedClassDrafts,
        mockDeleteRecommendedClassDraft
      );
      const { result } = renderHook(() => useRecommendedClassDrafts());

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

      mockFetchRecommendedClassDrafts.mockRejectedValueOnce(
        new Error('Network error')
      );

      const useRecommendedClassDrafts = createUseRecommendedClassDrafts(
        mockFetchRecommendedClassDrafts,
        mockDeleteRecommendedClassDraft
      );
      const { result } = renderHook(() => useRecommendedClassDrafts());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.error).toBe('Erro ao carregar rascunhos de aulas');

      mockFetchRecommendedClassDrafts.mockResolvedValueOnce(validApiResponse);

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.error).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createRecommendedClassDraftsHook', () => {
    it('should be an alias for createUseRecommendedClassDrafts', () => {
      expect(createRecommendedClassDraftsHook).toBe(
        createUseRecommendedClassDrafts
      );
    });

    it('should create a functional hook', () => {
      const mockFetch = jest.fn().mockResolvedValue({
        message: 'Success',
        data: { drafts: [], total: 0 },
      });
      const mockDelete = jest.fn().mockResolvedValue(undefined);

      const useHook = createRecommendedClassDraftsHook(mockFetch, mockDelete);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
      expect(result.current.models).toEqual([]);
    });
  });
});
