import { renderHook, act, waitFor } from '@testing-library/react';
import {
  createUseExamModels,
  createExamModelsHook,
  transformModelToTableItem,
  DEFAULT_EXAM_MODELS_PAGINATION,
} from './useExamModels';
import { ExamDraftType, ExamActivityCategory } from '../types/examDrafts';
import type { ExamModelResponse } from '../types/examDrafts';
import type { BaseApiClient } from '../types/api';

// Mock dayjs
jest.mock('dayjs', () => {
  const actual = jest.requireActual('dayjs');
  return Object.assign((date?: string | Date) => {
    if (date) return actual(date);
    return actual('2024-06-15');
  }, actual);
});

describe('useExamModels', () => {
  describe('DEFAULT_EXAM_MODELS_PAGINATION', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_EXAM_MODELS_PAGINATION).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('transformModelToTableItem', () => {
    it('should transform model with all fields', () => {
      const model: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: ExamDraftType.MODELO,
        activityType: ExamActivityCategory.PROVA,
        title: 'Math Model',
        creatorUserInstitutionId: null,
        subjectId: 'subject-1',
        subject: { id: 'subject-1', name: 'Mathematics' },
        filters: null,
        updatedAt: '2024-06-15T10:30:00.000Z',
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformModelToTableItem(model);

      expect(result.id).toBe(model.id);
      expect(result.title).toBe('Math Model');
      expect(result.savedAt).toBe('15/06/2024');
      expect(result.subject).toBe('Mathematics');
      expect(result.subjectId).toBe('subject-1');
    });

    it('should handle null title', () => {
      const model: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: ExamDraftType.MODELO,
        activityType: ExamActivityCategory.PROVA,
        title: null,
        creatorUserInstitutionId: null,
        subjectId: 'subject-1',
        subject: { id: 'subject-1', name: 'Mathematics' },
        filters: null,
        updatedAt: '2024-06-15T10:30:00.000Z',
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformModelToTableItem(model);

      expect(result.title).toBe('Sem titulo');
    });

    it('should handle empty title', () => {
      const model: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: ExamDraftType.MODELO,
        activityType: ExamActivityCategory.PROVA,
        title: '',
        creatorUserInstitutionId: null,
        subjectId: 'subject-1',
        subject: { id: 'subject-1', name: 'Mathematics' },
        filters: null,
        updatedAt: '2024-06-15T10:30:00.000Z',
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformModelToTableItem(model);

      expect(result.title).toBe('Sem titulo');
    });

    it('should handle null updatedAt', () => {
      const model: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: ExamDraftType.MODELO,
        activityType: ExamActivityCategory.PROVA,
        title: 'Math Model',
        creatorUserInstitutionId: null,
        subjectId: 'subject-1',
        subject: { id: 'subject-1', name: 'Mathematics' },
        filters: null,
        updatedAt: null as unknown as string,
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformModelToTableItem(model);

      expect(result.savedAt).toBe('-');
    });

    it('should handle null subject', () => {
      const model: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: ExamDraftType.MODELO,
        activityType: ExamActivityCategory.PROVA,
        title: 'Math Model',
        creatorUserInstitutionId: null,
        subjectId: 'subject-1',
        subject: null,
        filters: null,
        updatedAt: '2024-06-15T10:30:00.000Z',
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformModelToTableItem(model);

      expect(result.subject).toBe('-');
    });

    it('should handle undefined subject name', () => {
      const model: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: ExamDraftType.MODELO,
        activityType: ExamActivityCategory.PROVA,
        title: 'Math Model',
        creatorUserInstitutionId: null,
        subjectId: 'subject-1',
        subject: { id: 'subject-1', name: undefined as unknown as string },
        filters: null,
        updatedAt: '2024-06-15T10:30:00.000Z',
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformModelToTableItem(model);

      expect(result.subject).toBe('-');
    });
  });

  describe('createUseExamModels', () => {
    const createMockApiClient = (): jest.Mocked<BaseApiClient> => ({
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    });

    const validModelsResponse = {
      data: {
        message: 'Success',
        data: {
          activityDrafts: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Math Model',
              subjectId: 'subject-1',
              subject: { id: 'subject-1', name: 'Mathematics' },
              updatedAt: '2024-06-15T10:30:00.000Z',
              createdAt: '2024-06-01T10:00:00.000Z',
            },
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              title: 'Physics Model',
              subjectId: 'subject-2',
              subject: { id: 'subject-2', name: 'Physics' },
              updatedAt: '2024-06-14T10:30:00.000Z',
              createdAt: '2024-06-01T10:00:00.000Z',
            },
          ],
          total: 2,
        },
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return initial state', () => {
      const mockApiClient = createMockApiClient();
      const useExamModels = createUseExamModels(mockApiClient);
      const { result } = renderHook(() => useExamModels());

      expect(result.current.models).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual(DEFAULT_EXAM_MODELS_PAGINATION);
      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
    });

    it('should fetch models successfully', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validModelsResponse);

      const useExamModels = createUseExamModels(mockApiClient);
      const { result } = renderHook(() => useExamModels());

      await act(async () => {
        await result.current.fetchModels({ page: 1, limit: 10 });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activity-drafts', {
        params: {
          type: ExamDraftType.MODELO,
          activityType: 'PROVA',
          page: 1,
          limit: 10,
        },
      });
      expect(result.current.models).toHaveLength(2);
      expect(result.current.models[0].title).toBe('Math Model');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should fetch models without filters', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validModelsResponse);

      const useExamModels = createUseExamModels(mockApiClient);
      const { result } = renderHook(() => useExamModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activity-drafts', {
        params: {
          type: ExamDraftType.MODELO,
          activityType: 'PROVA',
        },
      });
    });

    it('should exclude null and undefined filter values', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validModelsResponse);

      const useExamModels = createUseExamModels(mockApiClient);
      const { result } = renderHook(() => useExamModels());

      await act(async () => {
        await result.current.fetchModels({
          page: 1,
          limit: 10,
          search: undefined,
          subjectId: null as unknown as string,
        });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activity-drafts', {
        params: {
          type: ExamDraftType.MODELO,
          activityType: 'PROVA',
          page: 1,
          limit: 10,
        },
      });
    });

    it('should set loading state while fetching', async () => {
      const mockApiClient = createMockApiClient();
      let resolvePromise: (value: unknown) => void;

      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockApiClient.get.mockReturnValueOnce(promise as never);

      const useExamModels = createUseExamModels(mockApiClient);
      const { result } = renderHook(() => useExamModels());

      act(() => {
        result.current.fetchModels();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolvePromise!(validModelsResponse);
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const useExamModels = createUseExamModels(mockApiClient);
      const { result } = renderHook(() => useExamModels());

      await act(async () => {
        await result.current.fetchModels();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao carregar modelos de provas');
      expect(result.current.models).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('should delete model successfully', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.delete.mockResolvedValueOnce({
        data: { message: 'Deleted' },
      });

      const useExamModels = createUseExamModels(mockApiClient);
      const { result } = renderHook(() => useExamModels());

      await act(async () => {
        await result.current.deleteModel('model-123');
      });

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/activity-drafts/model-123'
      );
    });

    it('should calculate totalPages correctly', async () => {
      const mockApiClient = createMockApiClient();

      const responseWithMany = {
        data: {
          message: 'Success',
          data: {
            activityDrafts: Array.from({ length: 10 }, (_, i) => ({
              id: `model-${i}`,
              title: `Model ${i}`,
              subjectId: 'subject-1',
              subject: { id: 'subject-1', name: 'Math' },
              updatedAt: '2024-06-15T10:30:00.000Z',
              createdAt: '2024-06-01T10:00:00.000Z',
            })),
            total: 25,
          },
        },
      };

      mockApiClient.get.mockResolvedValueOnce(responseWithMany);

      const useExamModels = createUseExamModels(mockApiClient);
      const { result } = renderHook(() => useExamModels());

      await act(async () => {
        await result.current.fetchModels({ page: 1, limit: 10 });
      });

      expect(result.current.pagination.totalPages).toBe(3); // 25 / 10 = 2.5, Math.ceil = 3
    });

    it('should use default limit when not provided', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validModelsResponse);

      const useExamModels = createUseExamModels(mockApiClient);
      const { result } = renderHook(() => useExamModels());

      await act(async () => {
        await result.current.fetchModels({ page: 2 });
      });

      expect(result.current.pagination.limit).toBe(10);
      expect(result.current.pagination.page).toBe(2);
    });

    it('should filter out null and undefined values from params', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validModelsResponse);

      const useExamModels = createUseExamModels(mockApiClient);
      const { result } = renderHook(() => useExamModels());

      await act(async () => {
        await result.current.fetchModels({
          page: 1,
          limit: undefined,
          search: null as unknown as string,
        });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activity-drafts', {
        params: {
          type: ExamDraftType.MODELO,
          activityType: 'PROVA',
          page: 1,
        },
      });
    });
  });

  describe('createExamModelsHook', () => {
    it('should be an alias for createUseExamModels', () => {
      expect(createExamModelsHook).toBe(createUseExamModels);
    });

    it('should create a functional hook', () => {
      const mockApiClient: BaseApiClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useHook = createExamModelsHook(mockApiClient);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchModels).toBeInstanceOf(Function);
      expect(result.current.deleteModel).toBeInstanceOf(Function);
      expect(result.current.models).toEqual([]);
    });
  });
});
