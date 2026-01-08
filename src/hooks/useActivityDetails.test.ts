import { renderHook, act } from '@testing-library/react';
import { useActivityDetails } from './useActivityDetails';
import type { BaseApiClient } from '../types/api';
import type {
  ActivityDetailsData,
  ActivityDetailsApiResponse,
  QuizResponse,
  PresignedUrlResponse,
  ActivityMetadata,
} from '../types/activityDetails';
import type {
  QuestionsAnswersByStudentResponse,
  SaveQuestionCorrectionPayload,
} from '../utils/studentActivityCorrection';
import {
  STUDENT_ACTIVITY_STATUS,
  type ActivityStudentData,
} from '../types/activityDetails';
import {
  ANSWER_STATUS,
  QUESTION_TYPE,
  QUESTION_DIFFICULTY,
} from '../components/Quiz/useQuizStore';

describe('useActivityDetails', () => {
  const mockApiClient: BaseApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const mockActivityMetadata: ActivityMetadata = {
    id: 'activity-123',
    title: 'Prova de Matemática',
    startDate: '2024-01-15',
    finalDate: '2024-01-20',
    schoolName: 'Escola Teste',
    year: '2024',
    subjectName: 'Matemática',
    className: '9º Ano A',
  };

  const mockStudents: ActivityStudentData[] = [
    {
      studentId: 'student-1',
      studentName: 'João Silva',
      answeredAt: '2024-01-16T10:30:00Z',
      timeSpent: 3600,
      score: 8.5,
      status: STUDENT_ACTIVITY_STATUS.CONCLUIDO,
    },
  ];

  const mockActivityDetailsData: ActivityDetailsData = {
    activity: mockActivityMetadata,
    students: mockStudents,
    pagination: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    generalStats: {
      averageScore: 8.5,
      completionPercentage: 100,
    },
    questionStats: {
      mostCorrect: [0, 1],
      mostIncorrect: [2],
      notAnswered: [],
    },
  };

  const mockDetailsApiResponse: ActivityDetailsApiResponse = {
    message: 'Success',
    data: {
      students: mockStudents,
      pagination: mockActivityDetailsData.pagination,
      generalStats: mockActivityDetailsData.generalStats,
      questionStats: mockActivityDetailsData.questionStats,
    },
  };

  const mockQuizResponse: QuizResponse = {
    message: 'Success',
    data: {
      ...mockActivityMetadata,
      type: 'ATIVIDADE',
    },
  };

  const mockStudentCorrectionResponse: QuestionsAnswersByStudentResponse = {
    data: {
      answers: [
        {
          id: 'answer-1',
          questionId: 'question-1',
          answer: null,
          selectedOptions: [{ optionId: 'option-1' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          statement: 'Questão 1',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation: null,
          correctOption: 'option-1',
          createdAt: '2024-01-16T10:30:00Z',
          updatedAt: '2024-01-16T10:30:00Z',
          knowledgeMatrix: [],
          teacherFeedback: null,
          attachment: null,
          score: null,
          gradedAt: null,
          gradedBy: null,
          options: [],
        },
      ],
      statistics: {
        totalAnswered: 1,
        correctAnswers: 1,
        incorrectAnswers: 0,
        pendingAnswers: 0,
        score: 10,
        timeSpent: 3600,
      },
    },
  };

  const mockPresignedUrlResponse: PresignedUrlResponse = {
    data: {
      url: 'https://s3.amazonaws.com/bucket/',
      fields: {
        key: 'file-key-123',
        'Content-Type': 'application/pdf',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchActivityDetails', () => {
    it('should fetch activity details successfully', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockDetailsApiResponse })
        .mockResolvedValueOnce({ data: mockQuizResponse });

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const activityDetails =
        await result.current.fetchActivityDetails('activity-123');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activities/activity-123/details',
        { params: {} }
      );
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activities/activity-123/quiz'
      );
      expect(activityDetails).toEqual({
        ...mockDetailsApiResponse.data,
        activity: mockQuizResponse.data,
      });
    });

    it('should fetch activity details with query parameters', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockDetailsApiResponse })
        .mockResolvedValueOnce({ data: mockQuizResponse });

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      await result.current.fetchActivityDetails('activity-123', {
        page: 2,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
        status: 'CONCLUIDO',
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activities/activity-123/details',
        {
          params: {
            page: 2,
            limit: 20,
            sortBy: 'name',
            sortOrder: 'asc',
            status: 'CONCLUIDO',
          },
        }
      );
    });

    it('should handle quiz fetch failure gracefully', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockDetailsApiResponse })
        .mockRejectedValueOnce(new Error('Quiz not found'));

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const activityDetails =
        await result.current.fetchActivityDetails('activity-123');

      expect(activityDetails).toEqual({
        ...mockDetailsApiResponse.data,
        activity: undefined,
      });
    });

    it('should handle details fetch failure', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const errorMessage = 'Activity not found';
      const mockError = new Error(errorMessage);
      // Mock both get calls - first one fails, second one is never called but needs to be mocked
      (mockApiClient.get as jest.Mock)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({ data: mockQuizResponse });

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      let caughtError: Error | null = null;
      await act(async () => {
        try {
          await result.current.fetchActivityDetails('activity-123');
        } catch (error) {
          caughtError = error as Error;
        }
      });

      expect(caughtError).toBeInstanceOf(Error);
      expect((caughtError as unknown as Error).message).toBe(errorMessage);

      consoleErrorSpy.mockRestore();
    });

    it('should build query params correctly with partial params', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockDetailsApiResponse })
        .mockResolvedValueOnce({ data: mockQuizResponse });

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      await result.current.fetchActivityDetails('activity-123', {
        page: 1,
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activities/activity-123/details',
        {
          params: {
            page: 1,
          },
        }
      );
    });
  });

  describe('fetchStudentCorrection', () => {
    it('should fetch student correction successfully', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockStudentCorrectionResponse,
      });

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const correction = await result.current.fetchStudentCorrection(
        'activity-123',
        'student-1'
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/questions/activity/activity-123/user/student-1/answers'
      );
      expect(correction).toEqual(mockStudentCorrectionResponse);
    });

    it('should handle fetch student correction failure', async () => {
      const errorMessage = 'Student not found';
      const mockError = new Error(errorMessage);
      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      let caughtError: Error | null = null;
      await act(async () => {
        try {
          await result.current.fetchStudentCorrection(
            'activity-123',
            'student-1'
          );
        } catch (error) {
          caughtError = error as Error;
        }
      });

      expect(caughtError).toBeInstanceOf(Error);
      expect((caughtError as unknown as Error).message).toBe(errorMessage);
    });
  });

  describe('submitObservation', () => {
    it('should submit observation without file successfully', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({});

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      await result.current.submitObservation(
        'activity-123',
        'student-1',
        'Great work!',
        null
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/feedback/observation',
        {
          observation: 'Great work!',
          attachmentUrl: null,
        }
      );
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    it('should submit observation with file successfully', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      (mockApiClient.post as jest.Mock)
        .mockResolvedValueOnce({ data: mockPresignedUrlResponse })
        .mockResolvedValueOnce({});

      // eslint-disable-next-line no-undef
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      } as Response);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      await result.current.submitObservation(
        'activity-123',
        'student-1',
        'Great work!',
        mockFile
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/user/get-pre-signed-url',
        {
          fileName: 'test.pdf',
          fileType: 'application/pdf',
          fileSize: mockFile.size,
        }
      );

      // eslint-disable-next-line no-undef
      expect(global.fetch).toHaveBeenCalledWith(
        'https://s3.amazonaws.com/bucket/',
        {
          method: 'POST',
          body: expect.any(FormData),
        }
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/feedback/observation',
        {
          observation: 'Great work!',
          attachmentUrl: 'https://s3.amazonaws.com/bucket/file-key-123',
        }
      );
    });

    it('should handle presigned URL fetch failure', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      const errorMessage = 'Failed to get presigned URL';
      const mockError = new Error(errorMessage);
      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      let caughtError: Error | null = null;
      await act(async () => {
        try {
          await result.current.submitObservation(
            'activity-123',
            'student-1',
            'Great work!',
            mockFile
          );
        } catch (error) {
          caughtError = error as Error;
        }
      });

      expect(caughtError).toBeInstanceOf(Error);
      expect((caughtError as unknown as Error).message).toBe(errorMessage);
    });

    it('should handle file upload failure', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockPresignedUrlResponse,
      });

      const errorMessage = 'Upload failed';
      // eslint-disable-next-line no-undef
      global.fetch = jest.fn().mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      let caughtError: Error | null = null;
      await act(async () => {
        try {
          await result.current.submitObservation(
            'activity-123',
            'student-1',
            'Great work!',
            mockFile
          );
        } catch (error) {
          caughtError = error as Error;
        }
      });

      expect(caughtError).toBeInstanceOf(Error);
      expect((caughtError as unknown as Error).message).toBe(errorMessage);
    });

    it('should handle file upload response not ok', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockPresignedUrlResponse,
      });

      // eslint-disable-next-line no-undef
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      let caughtError: Error | null = null;
      await act(async () => {
        try {
          await result.current.submitObservation(
            'activity-123',
            'student-1',
            'Great work!',
            mockFile
          );
        } catch (error) {
          caughtError = error as Error;
        }
      });

      expect(caughtError).toBeInstanceOf(Error);
      expect((caughtError as unknown as Error).message).toBe(
        'Falha ao fazer upload do arquivo'
      );
    });

    it('should normalize URL construction correctly', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      const presignedResponseWithTrailingSlash = {
        data: {
          url: 'https://s3.amazonaws.com/bucket/',
          fields: {
            key: '/file-key-123',
          },
        },
      };

      (mockApiClient.post as jest.Mock)
        .mockResolvedValueOnce({ data: presignedResponseWithTrailingSlash })
        .mockResolvedValueOnce({});

      // eslint-disable-next-line no-undef
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      } as Response);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      await result.current.submitObservation(
        'activity-123',
        'student-1',
        'Great work!',
        mockFile
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/feedback/observation',
        {
          observation: 'Great work!',
          attachmentUrl: 'https://s3.amazonaws.com/bucket/file-key-123',
        }
      );
    });

    it('should handle observation submission failure', async () => {
      const errorMessage = 'Failed to submit observation';
      const mockError = new Error(errorMessage);
      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      let caughtError: Error | null = null;
      await act(async () => {
        try {
          await result.current.submitObservation(
            'activity-123',
            'student-1',
            'Great work!',
            null
          );
        } catch (error) {
          caughtError = error as Error;
        }
      });

      expect(caughtError).toBeInstanceOf(Error);
      expect((caughtError as unknown as Error).message).toBe(errorMessage);
    });
  });

  describe('submitQuestionCorrection', () => {
    it('should submit question correction successfully', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({});

      const payload: SaveQuestionCorrectionPayload = {
        questionId: 'question-1',
        isCorrect: true,
        score: 10,
        teacherFeedback: 'Excellent answer!',
      };

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      await result.current.submitQuestionCorrection(
        'activity-123',
        'student-1',
        payload
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/questions/correction',
        payload
      );
    });

    it('should submit question correction with null values', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({});

      const payload: SaveQuestionCorrectionPayload = {
        questionId: 'question-1',
        isCorrect: null,
        score: null,
        teacherFeedback: null,
      };

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      await result.current.submitQuestionCorrection(
        'activity-123',
        'student-1',
        payload
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/questions/correction',
        payload
      );
    });

    it('should handle question correction submission failure', async () => {
      const errorMessage = 'Failed to submit correction';
      const mockError = new Error(errorMessage);
      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const payload: SaveQuestionCorrectionPayload = {
        questionId: 'question-1',
        isCorrect: true,
      };

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      let caughtError: Error | null = null;
      await act(async () => {
        try {
          await result.current.submitQuestionCorrection(
            'activity-123',
            'student-1',
            payload
          );
        } catch (error) {
          caughtError = error as Error;
        }
      });

      expect(caughtError).toBeInstanceOf(Error);
      expect((caughtError as unknown as Error).message).toBe(errorMessage);
    });
  });

  describe('Hook memoization', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() =>
        useActivityDetails(mockApiClient)
      );

      const firstRender = {
        fetchActivityDetails: result.current.fetchActivityDetails,
        fetchStudentCorrection: result.current.fetchStudentCorrection,
        submitObservation: result.current.submitObservation,
        submitQuestionCorrection: result.current.submitQuestionCorrection,
      };

      rerender();

      expect(result.current.fetchActivityDetails).toBe(
        firstRender.fetchActivityDetails
      );
      expect(result.current.fetchStudentCorrection).toBe(
        firstRender.fetchStudentCorrection
      );
      expect(result.current.submitObservation).toBe(
        firstRender.submitObservation
      );
      expect(result.current.submitQuestionCorrection).toBe(
        firstRender.submitQuestionCorrection
      );
    });

    it('should update functions when apiClient changes', () => {
      const newApiClient: BaseApiClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const { result, rerender } = renderHook(
        ({ client }) => useActivityDetails(client),
        {
          initialProps: { client: mockApiClient },
        }
      );

      const firstRender = result.current.fetchActivityDetails;

      rerender({ client: newApiClient });

      expect(result.current.fetchActivityDetails).not.toBe(firstRender);
    });
  });
});
