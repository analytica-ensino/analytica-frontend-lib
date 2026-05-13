import { renderHook, act, waitFor } from '@testing-library/react';
import {
  createUseExamDrafts,
  createExamDraftsHook,
  transformDraftToTableItem,
  DEFAULT_EXAM_DRAFTS_PAGINATION,
} from './useExamDrafts';
import { ExamDraftType } from '../types/examDrafts';
import type { ExamModelResponse } from '../types/examDrafts';
import type { BaseApiClient } from '../types/api';

// Mock dayjs
jest.mock('dayjs', () => {
  const actual = jest.requireActual('dayjs');
  return Object.assign(
    (date?: string | Date) => {
      if (date) return actual(date);
      return actual('2024-06-15');
    },
    actual
  );
});

describe('useExamDrafts', () => {
  describe('DEFAULT_EXAM_DRAFTS_PAGINATION', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_EXAM_DRAFTS_PAGINATION).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('transformDraftToTableItem', () => {
    it('should transform draft with all fields', () => {
      const draft: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Math Draft',
        subjectId: 'subject-1',
        subject: { id: 'subject-1', name: 'Mathematics' },
        updatedAt: '2024-06-15T10:30:00.000Z',
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformDraftToTableItem(draft);

      expect(result.id).toBe(draft.id);
      expect(result.title).toBe('Math Draft');
      expect(result.savedAt).toBe('15/06/2024');
      expect(result.subject).toBe('Mathematics');
      expect(result.subjectId).toBe('subject-1');
    });

    it('should handle null title', () => {
      const draft: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: null as unknown as string,
        subjectId: 'subject-1',
        subject: { id: 'subject-1', name: 'Mathematics' },
        updatedAt: '2024-06-15T10:30:00.000Z',
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformDraftToTableItem(draft);

      expect(result.title).toBe('Sem titulo');
    });

    it('should handle empty title', () => {
      const draft: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: '',
        subjectId: 'subject-1',
        subject: { id: 'subject-1', name: 'Mathematics' },
        updatedAt: '2024-06-15T10:30:00.000Z',
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformDraftToTableItem(draft);

      expect(result.title).toBe('Sem titulo');
    });

    it('should handle null updatedAt', () => {
      const draft: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Math Draft',
        subjectId: 'subject-1',
        subject: { id: 'subject-1', name: 'Mathematics' },
        updatedAt: null as unknown as string,
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformDraftToTableItem(draft);

      expect(result.savedAt).toBe('-');
    });

    it('should handle null subject', () => {
      const draft: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Math Draft',
        subjectId: 'subject-1',
        subject: null as unknown as { id: string; name: string },
        updatedAt: '2024-06-15T10:30:00.000Z',
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformDraftToTableItem(draft);

      expect(result.subject).toBe('-');
    });

    it('should handle undefined subject name', () => {
      const draft: ExamModelResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Math Draft',
        subjectId: 'subject-1',
        subject: { id: 'subject-1', name: undefined as unknown as string },
        updatedAt: '2024-06-15T10:30:00.000Z',
        createdAt: '2024-06-01T10:00:00.000Z',
      };

      const result = transformDraftToTableItem(draft);

      expect(result.subject).toBe('-');
    });
  });

  describe('createUseExamDrafts', () => {
    const createMockApiClient = (): jest.Mocked<BaseApiClient> => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    });

    const validDraftsResponse = {
      data: {
        message: 'Success',
        data: {
          activityDrafts: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Math Draft',
              subjectId: 'subject-1',
              subject: { id: 'subject-1', name: 'Mathematics' },
              updatedAt: '2024-06-15T10:30:00.000Z',
              createdAt: '2024-06-01T10:00:00.000Z',
            },
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              title: 'Physics Draft',
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
      const useExamDrafts = createUseExamDrafts(mockApiClient);
      const { result } = renderHook(() => useExamDrafts());

      expect(result.current.drafts).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual(DEFAULT_EXAM_DRAFTS_PAGINATION);
      expect(result.current.fetchDrafts).toBeInstanceOf(Function);
      expect(result.current.deleteDraft).toBeInstanceOf(Function);
    });

    it('should fetch drafts successfully', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validDraftsResponse);

      const useExamDrafts = createUseExamDrafts(mockApiClient);
      const { result } = renderHook(() => useExamDrafts());

      await act(async () => {
        await result.current.fetchDrafts({ page: 1, limit: 10 });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activity-drafts', {
        params: {
          type: ExamDraftType.RASCUNHO,
          activityType: 'PROVA',
          page: 1,
          limit: 10,
        },
      });
      expect(result.current.drafts).toHaveLength(2);
      expect(result.current.drafts[0].title).toBe('Math Draft');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should fetch drafts without filters', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validDraftsResponse);

      const useExamDrafts = createUseExamDrafts(mockApiClient);
      const { result } = renderHook(() => useExamDrafts());

      await act(async () => {
        await result.current.fetchDrafts();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activity-drafts', {
        params: {
          type: ExamDraftType.RASCUNHO,
          activityType: 'PROVA',
        },
      });
    });

    it('should exclude null and undefined filter values', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validDraftsResponse);

      const useExamDrafts = createUseExamDrafts(mockApiClient);
      const { result } = renderHook(() => useExamDrafts());

      await act(async () => {
        await result.current.fetchDrafts({
          page: 1,
          limit: 10,
          search: undefined,
          orderBy: null as unknown as string,
        });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activity-drafts', {
        params: {
          type: ExamDraftType.RASCUNHO,
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

      const useExamDrafts = createUseExamDrafts(mockApiClient);
      const { result } = renderHook(() => useExamDrafts());

      act(() => {
        result.current.fetchDrafts();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolvePromise!(validDraftsResponse);
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const useExamDrafts = createUseExamDrafts(mockApiClient);
      const { result } = renderHook(() => useExamDrafts());

      await act(async () => {
        await result.current.fetchDrafts();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao carregar rascunhos de provas');
      expect(result.current.drafts).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('should delete draft successfully', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } });

      const useExamDrafts = createUseExamDrafts(mockApiClient);
      const { result } = renderHook(() => useExamDrafts());

      await act(async () => {
        await result.current.deleteDraft('draft-123');
      });

      expect(mockApiClient.delete).toHaveBeenCalledWith('/activity-drafts/draft-123');
    });

    it('should calculate totalPages correctly', async () => {
      const mockApiClient = createMockApiClient();

      const responseWithMany = {
        data: {
          message: 'Success',
          data: {
            activityDrafts: Array.from({ length: 10 }, (_, i) => ({
              id: `draft-${i}`,
              title: `Draft ${i}`,
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

      const useExamDrafts = createUseExamDrafts(mockApiClient);
      const { result } = renderHook(() => useExamDrafts());

      await act(async () => {
        await result.current.fetchDrafts({ page: 1, limit: 10 });
      });

      expect(result.current.pagination.totalPages).toBe(3); // 25 / 10 = 2.5, Math.ceil = 3
    });

    it('should use default limit when not provided', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validDraftsResponse);

      const useExamDrafts = createUseExamDrafts(mockApiClient);
      const { result } = renderHook(() => useExamDrafts());

      await act(async () => {
        await result.current.fetchDrafts({ page: 2 });
      });

      expect(result.current.pagination.limit).toBe(10);
      expect(result.current.pagination.page).toBe(2);
    });

    it('should filter out null and undefined values from params', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validDraftsResponse);

      const useExamDrafts = createUseExamDrafts(mockApiClient);
      const { result } = renderHook(() => useExamDrafts());

      await act(async () => {
        await result.current.fetchDrafts({
          page: 1,
          limit: undefined,
          search: null as unknown as string,
        });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activity-drafts', {
        params: {
          type: ExamDraftType.RASCUNHO,
          activityType: 'PROVA',
          page: 1,
        },
      });
    });
  });

  describe('createExamDraftsHook', () => {
    it('should be an alias for createUseExamDrafts', () => {
      expect(createExamDraftsHook).toBe(createUseExamDrafts);
    });

    it('should create a functional hook', () => {
      const mockApiClient: BaseApiClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useHook = createExamDraftsHook(mockApiClient);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchDrafts).toBeInstanceOf(Function);
      expect(result.current.deleteDraft).toBeInstanceOf(Function);
      expect(result.current.drafts).toEqual([]);
    });
  });
});
