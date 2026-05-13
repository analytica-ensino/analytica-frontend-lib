import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import {
  createUseExamsHistory,
  createExamsHistoryHook,
  transformExamToTableItem,
  handleExamFetchError,
  extractExamFilterOptions,
  mergeExamFilterOptions,
  examsHistoryApiResponseSchema,
  DEFAULT_EXAMS_PAGINATION,
  DEFAULT_EXAM_FILTER_OPTIONS,
} from './useExamsHistory';
import { ExamStatus, ExamDisplayStatus } from '../types/examsHistory';
import type {
  ExamHistoryResponse,
  ExamFilterOption,
} from '../types/examsHistory';
import type { BaseApiClient } from '../types/api';

// Mock dayjs
jest.mock('dayjs', () => {
  const actual = jest.requireActual('dayjs');
  return Object.assign((date?: string | Date) => {
    if (date) return actual(date);
    return actual('2024-06-15');
  }, actual);
});

describe('useExamsHistory', () => {
  describe('DEFAULT_EXAMS_PAGINATION', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_EXAMS_PAGINATION).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('DEFAULT_EXAM_FILTER_OPTIONS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_EXAM_FILTER_OPTIONS).toEqual({
        schools: [],
        classes: [],
        subjects: [],
        schoolYears: [],
      });
    });
  });

  describe('transformExamToTableItem', () => {
    const baseExam: ExamHistoryResponse = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Math Exam',
      startDate: '2024-06-15',
      status: ExamStatus.AGENDADA,
      completionPercentage: 75,
      questionCount: 20,
      createdAt: '2024-06-01T10:00:00.000Z',
      subject: {
        id: 'subject-1',
        name: 'Mathematics',
        areaKnowledgeId: 'area-1',
      },
      creator: { id: 'creator-1', name: 'Prof. Maria' },
      totalStudents: 30,
      answeredStudents: 25,
      breakdown: [
        {
          school: { id: 'school-1', name: 'School A' },
          schoolYear: { id: 'year-1', name: '2024' },
          class: { id: 'class-1', name: 'Class A' },
          totalStudents: 30,
          answeredStudents: 25,
          completionPercentage: 83.3,
        },
      ],
    };

    it('should transform exam with all fields', () => {
      const result = transformExamToTableItem(baseExam);

      expect(result.id).toBe(baseExam.id);
      expect(result.title).toBe('Math Exam');
      expect(result.startDate).toBe('15/06/2024');
      expect(result.school).toBe('School A');
      expect(result.class).toBe('Class A');
      expect(result.status).toBe(ExamDisplayStatus.AGENDADA);
      expect(result.questionCount).toBe(20);
      expect(result.createdAt).toBe('01/06/2024');
      expect(result.completionPercentage).toBe(75);
    });

    it('should handle null startDate', () => {
      const exam: ExamHistoryResponse = {
        ...baseExam,
        startDate: null,
      };

      const result = transformExamToTableItem(exam);
      expect(result.startDate).toBe('-');
    });

    it('should handle empty breakdown array', () => {
      const exam: ExamHistoryResponse = {
        ...baseExam,
        breakdown: [],
      };

      const result = transformExamToTableItem(exam);
      expect(result.school).toBe('-');
      expect(result.class).toBe('-');
    });

    it('should handle undefined breakdown', () => {
      const exam: ExamHistoryResponse = {
        ...baseExam,
        breakdown: undefined,
      };

      const result = transformExamToTableItem(exam);
      expect(result.school).toBe('-');
      expect(result.class).toBe('-');
    });

    it('should handle null school in breakdown', () => {
      const exam: ExamHistoryResponse = {
        ...baseExam,
        breakdown: [
          {
            school: null,
            schoolYear: { id: 'year-1', name: '2024' },
            class: { id: 'class-1', name: 'Class A' },
            totalStudents: 30,
            answeredStudents: 25,
            completionPercentage: 83.3,
          },
        ],
      };

      const result = transformExamToTableItem(exam);
      expect(result.school).toBe('-');
    });

    it('should handle null class in breakdown', () => {
      const exam: ExamHistoryResponse = {
        ...baseExam,
        breakdown: [
          {
            school: { id: 'school-1', name: 'School A' },
            schoolYear: { id: 'year-1', name: '2024' },
            class: null,
            totalStudents: 30,
            answeredStudents: 25,
            completionPercentage: 83.3,
          },
        ],
      };

      const result = transformExamToTableItem(exam);
      expect(result.class).toBe('-');
    });

    it('should map AGENDADA status to Agendada', () => {
      const exam: ExamHistoryResponse = {
        ...baseExam,
        status: ExamStatus.AGENDADA,
      };

      const result = transformExamToTableItem(exam);
      expect(result.status).toBe(ExamDisplayStatus.AGENDADA);
    });

    it('should map EM_ANDAMENTO status to Em andamento', () => {
      const exam: ExamHistoryResponse = {
        ...baseExam,
        status: ExamStatus.EM_ANDAMENTO,
      };

      const result = transformExamToTableItem(exam);
      expect(result.status).toBe(ExamDisplayStatus.EM_ANDAMENTO);
    });

    it('should map FINALIZADA status to Finalizada', () => {
      const exam: ExamHistoryResponse = {
        ...baseExam,
        status: ExamStatus.FINALIZADA,
      };

      const result = transformExamToTableItem(exam);
      expect(result.status).toBe(ExamDisplayStatus.FINALIZADA);
    });

    it('should map CANCELADA status to Cancelada', () => {
      const exam: ExamHistoryResponse = {
        ...baseExam,
        status: ExamStatus.CANCELADA,
      };

      const result = transformExamToTableItem(exam);
      expect(result.status).toBe(ExamDisplayStatus.CANCELADA);
    });
  });

  describe('handleExamFetchError', () => {
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
          path: ['data', 'activities'],
          message: 'Expected string, received number',
        },
      ]);

      const result = handleExamFetchError(zodError);
      expect(result).toBe('Erro ao validar dados de historico de provas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for other errors', () => {
      const genericError = new Error('Network error');
      const result = handleExamFetchError(genericError);
      expect(result).toBe('Erro ao carregar historico de provas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for unknown error types', () => {
      const result = handleExamFetchError('string error');
      expect(result).toBe('Erro ao carregar historico de provas');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('extractExamFilterOptions', () => {
    it('should extract filter options from exams', () => {
      const exams: ExamHistoryResponse[] = [
        {
          id: 'exam-1',
          title: 'Exam 1',
          startDate: '2024-06-15',
          status: ExamStatus.AGENDADA,
          completionPercentage: 75,
          questionCount: 20,
          createdAt: '2024-06-01',
          subject: { id: 'subject-1', name: 'Math', areaKnowledgeId: 'area-1' },
          creator: null,
          breakdown: [
            {
              school: { id: 'school-1', name: 'School A' },
              schoolYear: { id: 'year-1', name: '2024' },
              class: { id: 'class-1', name: 'Class A' },
              totalStudents: 10,
              answeredStudents: 5,
              completionPercentage: 50,
            },
          ],
        },
      ];

      const result = extractExamFilterOptions(exams);

      expect(result.schools).toHaveLength(1);
      expect(result.schools[0]).toEqual({ id: 'school-1', name: 'School A' });
      expect(result.classes).toHaveLength(1);
      expect(result.classes[0]).toEqual({ id: 'class-1', name: 'Class A' });
      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0]).toEqual({ id: 'subject-1', name: 'Math' });
      expect(result.schoolYears).toHaveLength(1);
      expect(result.schoolYears[0]).toEqual({ id: 'year-1', name: '2024' });
    });

    it('should deduplicate filter options', () => {
      const exams: ExamHistoryResponse[] = [
        {
          id: 'exam-1',
          title: 'Exam 1',
          startDate: '2024-06-15',
          status: ExamStatus.AGENDADA,
          completionPercentage: 75,
          questionCount: 20,
          createdAt: '2024-06-01',
          subject: { id: 'subject-1', name: 'Math', areaKnowledgeId: 'area-1' },
          creator: null,
          breakdown: [
            {
              school: { id: 'school-1', name: 'School A' },
              schoolYear: null,
              class: null,
              totalStudents: 10,
              answeredStudents: 5,
              completionPercentage: 50,
            },
          ],
        },
        {
          id: 'exam-2',
          title: 'Exam 2',
          startDate: '2024-06-16',
          status: ExamStatus.AGENDADA,
          completionPercentage: 80,
          questionCount: 25,
          createdAt: '2024-06-02',
          subject: { id: 'subject-1', name: 'Math', areaKnowledgeId: 'area-1' },
          creator: null,
          breakdown: [
            {
              school: { id: 'school-1', name: 'School A' },
              schoolYear: null,
              class: null,
              totalStudents: 10,
              answeredStudents: 5,
              completionPercentage: 50,
            },
          ],
        },
      ];

      const result = extractExamFilterOptions(exams);

      expect(result.schools).toHaveLength(1);
      expect(result.subjects).toHaveLength(1);
    });

    it('should sort filter options alphabetically', () => {
      const exams: ExamHistoryResponse[] = [
        {
          id: 'exam-1',
          title: 'Exam 1',
          startDate: null,
          status: ExamStatus.AGENDADA,
          completionPercentage: 75,
          questionCount: 20,
          createdAt: '2024-06-01',
          subject: {
            id: 'subject-2',
            name: 'Zology',
            areaKnowledgeId: 'area-1',
          },
          creator: null,
          breakdown: [
            {
              school: { id: 'school-2', name: 'Zebra School' },
              schoolYear: null,
              class: null,
              totalStudents: 10,
              answeredStudents: 5,
              completionPercentage: 50,
            },
          ],
        },
        {
          id: 'exam-2',
          title: 'Exam 2',
          startDate: null,
          status: ExamStatus.AGENDADA,
          completionPercentage: 80,
          questionCount: 25,
          createdAt: '2024-06-02',
          subject: {
            id: 'subject-1',
            name: 'Arithmetic',
            areaKnowledgeId: 'area-1',
          },
          creator: null,
          breakdown: [
            {
              school: { id: 'school-1', name: 'Alpha School' },
              schoolYear: null,
              class: null,
              totalStudents: 10,
              answeredStudents: 5,
              completionPercentage: 50,
            },
          ],
        },
      ];

      const result = extractExamFilterOptions(exams);

      expect(result.schools[0].name).toBe('Alpha School');
      expect(result.schools[1].name).toBe('Zebra School');
      expect(result.subjects[0].name).toBe('Arithmetic');
      expect(result.subjects[1].name).toBe('Zology');
    });

    it('should handle null subject', () => {
      const exams: ExamHistoryResponse[] = [
        {
          id: 'exam-1',
          title: 'Exam 1',
          startDate: null,
          status: ExamStatus.AGENDADA,
          completionPercentage: 75,
          questionCount: 20,
          createdAt: '2024-06-01',
          subject: null,
          creator: null,
          breakdown: [],
        },
      ];

      const result = extractExamFilterOptions(exams);

      expect(result.subjects).toHaveLength(0);
    });

    it('should handle empty breakdown array', () => {
      const exams: ExamHistoryResponse[] = [
        {
          id: 'exam-1',
          title: 'Exam 1',
          startDate: null,
          status: ExamStatus.AGENDADA,
          completionPercentage: 75,
          questionCount: 20,
          createdAt: '2024-06-01',
          subject: null,
          creator: null,
          breakdown: [],
        },
      ];

      const result = extractExamFilterOptions(exams);

      expect(result.schools).toHaveLength(0);
      expect(result.classes).toHaveLength(0);
      expect(result.schoolYears).toHaveLength(0);
    });

    it('should handle undefined breakdown', () => {
      const exams: ExamHistoryResponse[] = [
        {
          id: 'exam-1',
          title: 'Exam 1',
          startDate: null,
          status: ExamStatus.AGENDADA,
          completionPercentage: 75,
          questionCount: 20,
          createdAt: '2024-06-01',
          subject: null,
          creator: null,
          breakdown: undefined,
        },
      ];

      const result = extractExamFilterOptions(exams);

      expect(result.schools).toHaveLength(0);
      expect(result.classes).toHaveLength(0);
    });

    it('should skip breakdown items with missing id or name', () => {
      const exams: ExamHistoryResponse[] = [
        {
          id: 'exam-1',
          title: 'Exam 1',
          startDate: null,
          status: ExamStatus.AGENDADA,
          completionPercentage: 75,
          questionCount: 20,
          createdAt: '2024-06-01',
          subject: null,
          creator: null,
          breakdown: [
            {
              school: { id: 'school-1', name: '' } as never, // name is empty
              class: { id: '', name: 'Class A' } as never, // id is empty
              schoolYear: { id: 'year-1' } as never, // name is missing
              totalStudents: 10,
              answeredStudents: 5,
              completionPercentage: 50,
            },
          ],
        },
      ];

      const result = extractExamFilterOptions(exams);

      // All should be excluded due to missing or empty id/name
      expect(result.schools).toHaveLength(0);
      expect(result.classes).toHaveLength(0);
      expect(result.schoolYears).toHaveLength(0);
    });
  });

  describe('mergeExamFilterOptions', () => {
    it('should merge two arrays of filter options', () => {
      const base: ExamFilterOption[] = [{ id: '1', name: 'Option A' }];
      const extra: ExamFilterOption[] = [{ id: '2', name: 'Option B' }];

      const result = mergeExamFilterOptions(base, extra);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Option A');
      expect(result[1].name).toBe('Option B');
    });

    it('should deduplicate by id', () => {
      const base: ExamFilterOption[] = [{ id: '1', name: 'Option A' }];
      const extra: ExamFilterOption[] = [
        { id: '1', name: 'Option A Duplicate' },
        { id: '2', name: 'Option B' },
      ];

      const result = mergeExamFilterOptions(base, extra);

      expect(result).toHaveLength(2);
      expect(result.find((o) => o.id === '1')?.name).toBe('Option A');
    });

    it('should return base array when extra is empty', () => {
      const base: ExamFilterOption[] = [{ id: '1', name: 'Option A' }];
      const extra: ExamFilterOption[] = [];

      const result = mergeExamFilterOptions(base, extra);

      expect(result).toBe(base);
    });

    it('should return base array when extra has no new items', () => {
      const base: ExamFilterOption[] = [
        { id: '1', name: 'Option A' },
        { id: '2', name: 'Option B' },
      ];
      const extra: ExamFilterOption[] = [
        { id: '1', name: 'Option A' },
        { id: '2', name: 'Option B' },
      ];

      const result = mergeExamFilterOptions(base, extra);

      expect(result).toBe(base);
    });

    it('should sort merged results alphabetically', () => {
      const base: ExamFilterOption[] = [{ id: '1', name: 'Zebra' }];
      const extra: ExamFilterOption[] = [{ id: '2', name: 'Alpha' }];

      const result = mergeExamFilterOptions(base, extra);

      expect(result[0].name).toBe('Alpha');
      expect(result[1].name).toBe('Zebra');
    });
  });

  describe('examsHistoryApiResponseSchema', () => {
    it('should validate a valid API response', () => {
      const validResponse = {
        message: 'Success',
        data: {
          activities: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Math Exam',
              startDate: '2024-06-15',
              status: ExamStatus.AGENDADA,
              completionPercentage: 75,
              questionCount: 20,
              createdAt: '2024-06-01T10:00:00.000Z',
              subject: {
                id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Mathematics',
                areaKnowledgeId: '123e4567-e89b-12d3-a456-426614174002',
              },
              creator: { id: 'creator-1', name: 'Prof. Maria' },
              breakdown: [],
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      };

      const result = examsHistoryApiResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should filter out activities with invalid id format', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          activities: [
            {
              id: 'not-a-uuid',
              title: 'Math Exam',
              startDate: null,
              status: ExamStatus.AGENDADA,
              completionPercentage: 75,
              questionCount: 20,
              createdAt: '2024-06-01',
              subject: null,
            },
          ],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
      };

      const result = examsHistoryApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.activities).toHaveLength(0);
      }
    });

    it('should filter out activities with invalid status', () => {
      const invalidResponse = {
        message: 'Success',
        data: {
          activities: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Math Exam',
              startDate: null,
              status: 'INVALID_STATUS',
              completionPercentage: 75,
              questionCount: 20,
              createdAt: '2024-06-01',
              subject: null,
            },
          ],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
      };

      const result = examsHistoryApiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.activities).toHaveLength(0);
      }
    });

    it('should reject missing required fields', () => {
      const missingFields = {
        message: 'Success',
        data: {
          activities: [],
          // missing pagination
        },
      };

      const result = examsHistoryApiResponseSchema.safeParse(missingFields);
      expect(result.success).toBe(false);
    });
  });

  describe('createUseExamsHistory', () => {
    const createMockApiClient = (): jest.Mocked<BaseApiClient> => ({
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    });

    const validExamsResponse = {
      data: {
        message: 'Success',
        data: {
          activities: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Math Exam',
              startDate: '2024-06-15',
              status: ExamStatus.AGENDADA,
              completionPercentage: 75,
              questionCount: 20,
              createdAt: '2024-06-01T10:00:00.000Z',
              subject: {
                id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Mathematics',
                areaKnowledgeId: '123e4567-e89b-12d3-a456-426614174002',
              },
              creator: { id: 'creator-1', name: 'Prof. Maria' },
              breakdown: [
                {
                  school: { id: 'school-1', name: 'School A' },
                  schoolYear: { id: 'year-1', name: '2024' },
                  class: { id: 'class-1', name: 'Class A' },
                  totalStudents: 30,
                  answeredStudents: 25,
                  completionPercentage: 83.3,
                },
              ],
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return initial state', () => {
      const mockApiClient = createMockApiClient();
      const useExamsHistory = createUseExamsHistory(mockApiClient);
      const { result } = renderHook(() => useExamsHistory());

      expect(result.current.exams).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual(DEFAULT_EXAMS_PAGINATION);
      expect(result.current.apiFilterOptions).toEqual(
        DEFAULT_EXAM_FILTER_OPTIONS
      );
      expect(result.current.fetchExams).toBeInstanceOf(Function);
    });

    it('should fetch exams successfully', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validExamsResponse);

      const useExamsHistory = createUseExamsHistory(mockApiClient);
      const { result } = renderHook(() => useExamsHistory());

      await act(async () => {
        await result.current.fetchExams({ page: 1, limit: 10 });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activities/history', {
        params: { type: 'PROVA', page: 1, limit: 10 },
      });
      expect(result.current.exams).toHaveLength(1);
      expect(result.current.exams[0].title).toBe('Math Exam');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should fetch exams without filters', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validExamsResponse);

      const useExamsHistory = createUseExamsHistory(mockApiClient);
      const { result } = renderHook(() => useExamsHistory());

      await act(async () => {
        await result.current.fetchExams();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activities/history', {
        params: { type: 'PROVA' },
      });
    });

    it('should set loading state while fetching', async () => {
      const mockApiClient = createMockApiClient();
      let resolvePromise: (value: unknown) => void;

      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockApiClient.get.mockReturnValueOnce(promise as never);

      const useExamsHistory = createUseExamsHistory(mockApiClient);
      const { result } = renderHook(() => useExamsHistory());

      act(() => {
        result.current.fetchExams();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolvePromise!(validExamsResponse);
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const useExamsHistory = createUseExamsHistory(mockApiClient);
      const { result } = renderHook(() => useExamsHistory());

      await act(async () => {
        await result.current.fetchExams();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao carregar historico de provas');
      expect(result.current.exams).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('should handle validation error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockApiClient = createMockApiClient();

      const invalidResponse = {
        data: {
          message: 'Success',
          data: {
            activities: 'invalid', // Should be an array
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        },
      };

      mockApiClient.get.mockResolvedValueOnce(invalidResponse);

      const useExamsHistory = createUseExamsHistory(mockApiClient);
      const { result } = renderHook(() => useExamsHistory());

      await act(async () => {
        await result.current.fetchExams();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao validar dados de historico de provas'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should extract and merge filter options from response', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validExamsResponse);

      const useExamsHistory = createUseExamsHistory(mockApiClient);
      const { result } = renderHook(() => useExamsHistory());

      await act(async () => {
        await result.current.fetchExams();
      });

      expect(result.current.apiFilterOptions.schools).toHaveLength(1);
      expect(result.current.apiFilterOptions.schools[0].name).toBe('School A');
      expect(result.current.apiFilterOptions.classes).toHaveLength(1);
      expect(result.current.apiFilterOptions.classes[0].name).toBe('Class A');
      expect(result.current.apiFilterOptions.subjects).toHaveLength(1);
      expect(result.current.apiFilterOptions.subjects[0].name).toBe(
        'Mathematics'
      );
      expect(result.current.apiFilterOptions.schoolYears).toHaveLength(1);
      expect(result.current.apiFilterOptions.schoolYears[0].name).toBe('2024');
    });

    it('should accumulate filter options across multiple fetches', async () => {
      const mockApiClient = createMockApiClient();

      const firstResponse = {
        data: {
          message: 'Success',
          data: {
            activities: [
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Math Exam',
                startDate: '2024-06-15',
                status: ExamStatus.AGENDADA,
                completionPercentage: 75,
                questionCount: 20,
                createdAt: '2024-06-01T10:00:00.000Z',
                subject: {
                  id: '123e4567-e89b-12d3-a456-426614174001',
                  name: 'Mathematics',
                  areaKnowledgeId: '123e4567-e89b-12d3-a456-426614174002',
                },
                creator: null,
                breakdown: [
                  {
                    school: { id: 'school-1', name: 'School A' },
                    schoolYear: null,
                    class: null,
                    totalStudents: 10,
                    answeredStudents: 5,
                    completionPercentage: 50,
                  },
                ],
              },
            ],
            pagination: { total: 2, page: 1, limit: 1, totalPages: 2 },
          },
        },
      };

      const secondResponse = {
        data: {
          message: 'Success',
          data: {
            activities: [
              {
                id: '123e4567-e89b-12d3-a456-426614174003',
                title: 'Physics Exam',
                startDate: '2024-06-16',
                status: ExamStatus.AGENDADA,
                completionPercentage: 80,
                questionCount: 25,
                createdAt: '2024-06-02T10:00:00.000Z',
                subject: {
                  id: '123e4567-e89b-12d3-a456-426614174004',
                  name: 'Physics',
                  areaKnowledgeId: '123e4567-e89b-12d3-a456-426614174005',
                },
                creator: null,
                breakdown: [
                  {
                    school: { id: 'school-2', name: 'School B' },
                    schoolYear: null,
                    class: null,
                    totalStudents: 15,
                    answeredStudents: 10,
                    completionPercentage: 66.6,
                  },
                ],
              },
            ],
            pagination: { total: 2, page: 2, limit: 1, totalPages: 2 },
          },
        },
      };

      mockApiClient.get
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      const useExamsHistory = createUseExamsHistory(mockApiClient);
      const { result } = renderHook(() => useExamsHistory());

      // First fetch
      await act(async () => {
        await result.current.fetchExams({ page: 1, limit: 1 });
      });

      expect(result.current.apiFilterOptions.schools).toHaveLength(1);
      expect(result.current.apiFilterOptions.subjects).toHaveLength(1);

      // Second fetch
      await act(async () => {
        await result.current.fetchExams({ page: 2, limit: 1 });
      });

      expect(result.current.apiFilterOptions.schools).toHaveLength(2);
      expect(result.current.apiFilterOptions.subjects).toHaveLength(2);
    });

    it('should filter out null and undefined values from params', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockResolvedValueOnce(validExamsResponse);

      const useExamsHistory = createUseExamsHistory(mockApiClient);
      const { result } = renderHook(() => useExamsHistory());

      await act(async () => {
        await result.current.fetchExams({
          page: 1,
          limit: undefined,
          search: null as unknown as string,
        });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activities/history', {
        params: {
          type: 'PROVA',
          page: 1,
        },
      });
    });
  });

  describe('createExamsHistoryHook', () => {
    it('should be an alias for createUseExamsHistory', () => {
      expect(createExamsHistoryHook).toBe(createUseExamsHistory);
    });

    it('should create a functional hook', () => {
      const mockApiClient: BaseApiClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useHook = createExamsHistoryHook(mockApiClient);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchExams).toBeInstanceOf(Function);
      expect(result.current.exams).toEqual([]);
    });
  });
});
