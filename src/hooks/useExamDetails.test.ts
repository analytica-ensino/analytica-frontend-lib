import { renderHook, act, waitFor } from '@testing-library/react';
import {
  createUseExamDetails,
  createExamDetailsHook,
  transformStudent,
  mapBackendStatusToFrontend,
  handleExamDetailsFetchError,
  DEFAULT_EXAM_DETAILS_PAGINATION,
} from './useExamDetails';
import { StudentAnswerStatus } from '../types/examDetails';
import type { BaseApiClient } from '../types/api';

// Mock dayjs
jest.mock('dayjs', () => {
  const actual = jest.requireActual('dayjs');
  return Object.assign((date?: string | Date) => {
    if (date) return actual(date);
    return actual('2024-06-15');
  }, actual);
});

describe('useExamDetails', () => {
  describe('DEFAULT_EXAM_DETAILS_PAGINATION', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_EXAM_DETAILS_PAGINATION).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('mapBackendStatusToFrontend', () => {
    it('should map CONCLUIDO to ANSWER_SHEET_RECEIVED', () => {
      const result = mapBackendStatusToFrontend('CONCLUIDO' as never);
      expect(result).toBe(StudentAnswerStatus.ANSWER_SHEET_RECEIVED);
    });

    it('should map AGUARDANDO_CORRECAO to ANSWER_SHEET_RECEIVED', () => {
      const result = mapBackendStatusToFrontend('AGUARDANDO_CORRECAO' as never);
      expect(result).toBe(StudentAnswerStatus.ANSWER_SHEET_RECEIVED);
    });

    it('should map AGUARDANDO_RESPOSTA to AWAITING_ANSWER_SHEET', () => {
      const result = mapBackendStatusToFrontend('AGUARDANDO_RESPOSTA' as never);
      expect(result).toBe(StudentAnswerStatus.AWAITING_ANSWER_SHEET);
    });

    it('should map NAO_ENTREGUE to AWAITING_ANSWER_SHEET', () => {
      const result = mapBackendStatusToFrontend('NAO_ENTREGUE' as never);
      expect(result).toBe(StudentAnswerStatus.AWAITING_ANSWER_SHEET);
    });
  });

  describe('transformStudent', () => {
    it('should transform student with all fields', () => {
      const student = {
        studentId: '123e4567-e89b-12d3-a456-426614174000',
        studentName: 'John Doe',
        answeredAt: '2024-06-15T10:30:00.000Z',
        timeSpent: 3600,
        score: 8.5,
        status: 'CONCLUIDO' as const,
      };

      const result = transformStudent(student as never);

      expect(result.id).toBe(student.studentId);
      expect(result.studentId).toBe(student.studentId);
      expect(result.studentName).toBe('John Doe');
      expect(result.status).toBe(StudentAnswerStatus.ANSWER_SHEET_RECEIVED);
      expect(result.answerReceivedAt).toBe('15 Jun 2024');
      expect(result.score).toBe(8.5);
    });

    it('should handle null answeredAt', () => {
      const student = {
        studentId: '123e4567-e89b-12d3-a456-426614174000',
        studentName: 'John Doe',
        answeredAt: null,
        timeSpent: 0,
        score: null,
        status: 'AGUARDANDO_RESPOSTA' as const,
      };

      const result = transformStudent(student as never);

      expect(result.answerReceivedAt).toBeNull();
      expect(result.score).toBeNull();
      expect(result.status).toBe(StudentAnswerStatus.AWAITING_ANSWER_SHEET);
    });
  });

  describe('handleExamDetailsFetchError', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should return generic message for errors', () => {
      const genericError = new Error('Network error');
      const result = handleExamDetailsFetchError(genericError);
      expect(result).toBe('Erro ao carregar detalhes da prova');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return generic message for unknown error types', () => {
      const result = handleExamDetailsFetchError('string error');
      expect(result).toBe('Erro ao carregar detalhes da prova');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('createUseExamDetails', () => {
    const createMockApiClient = (): jest.Mocked<BaseApiClient> => ({
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    });

    const validExamInfoResponse = {
      data: {
        message: 'Success',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Math Exam',
          startDate: '2024-06-15',
          createdAt: '2024-06-01T10:00:00.000Z',
        },
      },
    };

    const validExamDetailsResponse = {
      data: {
        message: 'Success',
        data: {
          students: [
            {
              studentId: '123e4567-e89b-12d3-a456-426614174001',
              studentName: 'John Doe',
              answeredAt: '2024-06-15T10:30:00.000Z',
              timeSpent: 3600,
              score: 8.5,
              status: 'CONCLUIDO',
            },
          ],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
          generalStats: { averageScore: 8.5, completionPercentage: 100 },
          questionStats: {
            mostCorrect: [1],
            mostIncorrect: [2],
            notAnswered: [],
          },
          breakdown: [
            {
              school: {
                id: '123e4567-e89b-12d3-a456-426614174020',
                name: 'School A',
              },
              schoolYear: {
                id: '123e4567-e89b-12d3-a456-426614174021',
                name: '2024',
              },
              class: {
                id: '123e4567-e89b-12d3-a456-426614174022',
                name: 'Class A',
              },
              totalStudents: 30,
              answeredStudents: 25,
              completionPercentage: 83.3,
            },
          ],
        },
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return initial state', () => {
      const mockApiClient = createMockApiClient();
      const useExamDetails = createUseExamDetails(mockApiClient);
      const { result } = renderHook(() => useExamDetails());

      expect(result.current.examData).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual(
        DEFAULT_EXAM_DETAILS_PAGINATION
      );
      expect(result.current.fetchExamDetails).toBeInstanceOf(Function);
    });

    it('should fetch exam details successfully', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get
        .mockResolvedValueOnce(validExamInfoResponse)
        .mockResolvedValueOnce(validExamDetailsResponse);

      const useExamDetails = createUseExamDetails(mockApiClient);
      const { result } = renderHook(() => useExamDetails());

      await act(async () => {
        await result.current.fetchExamDetails('exam-123', {
          page: 1,
          limit: 10,
        });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activities/exam-123/quiz'
      );
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activities/exam-123/details',
        {
          params: { page: 1, limit: 10 },
        }
      );
      expect(result.current.examData).not.toBeNull();
      expect(result.current.examData?.title).toBe('Math Exam');
      expect(result.current.examData?.students).toHaveLength(1);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch exam details without filters', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get
        .mockResolvedValueOnce(validExamInfoResponse)
        .mockResolvedValueOnce(validExamDetailsResponse);

      const useExamDetails = createUseExamDetails(mockApiClient);
      const { result } = renderHook(() => useExamDetails());

      await act(async () => {
        await result.current.fetchExamDetails('exam-123');
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activities/exam-123/details',
        {
          params: {},
        }
      );
    });

    it('should exclude null and undefined filter values', async () => {
      const mockApiClient = createMockApiClient();
      mockApiClient.get
        .mockResolvedValueOnce(validExamInfoResponse)
        .mockResolvedValueOnce(validExamDetailsResponse);

      const useExamDetails = createUseExamDetails(mockApiClient);
      const { result } = renderHook(() => useExamDetails());

      await act(async () => {
        await result.current.fetchExamDetails('exam-123', {
          page: 1,
          limit: 10,
          sortBy: undefined,
          status: null as unknown as string,
        });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activities/exam-123/details',
        {
          params: {
            page: 1,
            limit: 10,
          },
        }
      );
    });

    it('should set loading state while fetching', async () => {
      const mockApiClient = createMockApiClient();
      let resolveInfo: (value: unknown) => void;
      let resolveDetails: (value: unknown) => void;

      const infoPromise = new Promise((resolve) => {
        resolveInfo = resolve;
      });
      const detailsPromise = new Promise((resolve) => {
        resolveDetails = resolve;
      });

      mockApiClient.get
        .mockReturnValueOnce(infoPromise as never)
        .mockReturnValueOnce(detailsPromise as never);

      const useExamDetails = createUseExamDetails(mockApiClient);
      const { result } = renderHook(() => useExamDetails());

      act(() => {
        result.current.fetchExamDetails('exam-123');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolveInfo!(validExamInfoResponse);
        resolveDetails!(validExamDetailsResponse);
        await Promise.all([infoPromise, detailsPromise]);
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockApiClient = createMockApiClient();
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const useExamDetails = createUseExamDetails(mockApiClient);
      const { result } = renderHook(() => useExamDetails());

      await act(async () => {
        await result.current.fetchExamDetails('exam-123');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao carregar detalhes da prova');
      expect(result.current.examData).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should handle invalid response data', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockApiClient = createMockApiClient();

      const invalidResponse = {
        data: {
          message: 'Success',
          data: {
            id: 'invalid-uuid',
            title: 'Math Exam',
            startDate: null,
            createdAt: '2024-06-01',
          },
        },
      };

      mockApiClient.get.mockResolvedValueOnce(invalidResponse);

      const useExamDetails = createUseExamDetails(mockApiClient);
      const { result } = renderHook(() => useExamDetails());

      await act(async () => {
        await result.current.fetchExamDetails('exam-123');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Erro ao carregar detalhes da prova');

      consoleErrorSpy.mockRestore();
    });

    it('should handle response with null startDate in exam info', async () => {
      const mockApiClient = createMockApiClient();

      const infoWithNullDate = {
        data: {
          message: 'Success',
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Math Exam',
            startDate: null,
            createdAt: '2024-06-01T10:00:00.000Z',
          },
        },
      };

      mockApiClient.get
        .mockResolvedValueOnce(infoWithNullDate)
        .mockResolvedValueOnce(validExamDetailsResponse);

      const useExamDetails = createUseExamDetails(mockApiClient);
      const { result } = renderHook(() => useExamDetails());

      await act(async () => {
        await result.current.fetchExamDetails('exam-123');
      });

      expect(result.current.examData?.startDate).toBe('-');
    });

    it('should handle empty breakdown arrays', async () => {
      const mockApiClient = createMockApiClient();

      const responseWithEmptyBreakdown = {
        data: {
          message: 'Success',
          data: {
            students: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
            generalStats: { averageScore: 0, completionPercentage: 0 },
            questionStats: {
              mostCorrect: [],
              mostIncorrect: [],
              notAnswered: [],
            },
            breakdown: [],
          },
        },
      };

      mockApiClient.get
        .mockResolvedValueOnce(validExamInfoResponse)
        .mockResolvedValueOnce(responseWithEmptyBreakdown);

      const useExamDetails = createUseExamDetails(mockApiClient);
      const { result } = renderHook(() => useExamDetails());

      await act(async () => {
        await result.current.fetchExamDetails('exam-123');
      });

      expect(result.current.examData?.school).toBe('-');
      expect(result.current.examData?.className).toBe('-');
    });

    it('should handle multiple schools and classes in breakdown', async () => {
      const mockApiClient = createMockApiClient();

      const responseWithMultipleBreakdown = {
        data: {
          message: 'Success',
          data: {
            students: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
            generalStats: { averageScore: 0, completionPercentage: 0 },
            questionStats: {
              mostCorrect: [],
              mostIncorrect: [],
              notAnswered: [],
            },
            breakdown: [
              {
                school: {
                  id: '123e4567-e89b-12d3-a456-426614174010',
                  name: 'School A',
                },
                schoolYear: null,
                class: {
                  id: '123e4567-e89b-12d3-a456-426614174011',
                  name: 'Class A',
                },
                totalStudents: 10,
                answeredStudents: 5,
                completionPercentage: 50,
              },
              {
                school: {
                  id: '123e4567-e89b-12d3-a456-426614174012',
                  name: 'School B',
                },
                schoolYear: null,
                class: {
                  id: '123e4567-e89b-12d3-a456-426614174013',
                  name: 'Class B',
                },
                totalStudents: 15,
                answeredStudents: 10,
                completionPercentage: 66.6,
              },
            ],
          },
        },
      };

      mockApiClient.get
        .mockResolvedValueOnce(validExamInfoResponse)
        .mockResolvedValueOnce(responseWithMultipleBreakdown);

      const useExamDetails = createUseExamDetails(mockApiClient);
      const { result } = renderHook(() => useExamDetails());

      await act(async () => {
        await result.current.fetchExamDetails('exam-123');
      });

      expect(result.current.examData?.school).toBe('School A, School B');
      expect(result.current.examData?.className).toBe('Class A, Class B');
    });

    it('should handle breakdown with null school and class', async () => {
      const mockApiClient = createMockApiClient();

      const responseWithNullBreakdownFields = {
        data: {
          message: 'Success',
          data: {
            students: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
            generalStats: { averageScore: 0, completionPercentage: 0 },
            questionStats: {
              mostCorrect: [],
              mostIncorrect: [],
              notAnswered: [],
            },
            breakdown: [
              {
                school: null,
                schoolYear: null,
                class: null,
                totalStudents: 10,
                answeredStudents: 5,
                completionPercentage: 50,
              },
            ],
          },
        },
      };

      mockApiClient.get
        .mockResolvedValueOnce(validExamInfoResponse)
        .mockResolvedValueOnce(responseWithNullBreakdownFields);

      const useExamDetails = createUseExamDetails(mockApiClient);
      const { result } = renderHook(() => useExamDetails());

      await act(async () => {
        await result.current.fetchExamDetails('exam-123');
      });

      expect(result.current.examData?.school).toBe('-');
      expect(result.current.examData?.className).toBe('-');
    });
  });

  describe('createExamDetailsHook', () => {
    it('should be an alias for createUseExamDetails', () => {
      expect(createExamDetailsHook).toBe(createUseExamDetails);
    });

    it('should create a functional hook', () => {
      const mockApiClient: BaseApiClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useHook = createExamDetailsHook(mockApiClient);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchExamDetails).toBeInstanceOf(Function);
      expect(result.current.examData).toBeNull();
    });
  });
});
