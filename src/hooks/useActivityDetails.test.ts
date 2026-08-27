import { renderHook, act } from '@testing-library/react';
import { useActivityDetails, withDerivedSubjects } from './useActivityDetails';
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
    type: 'ATIVIDADE',
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
          additionalContent: null,
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
      signedUrl: 'https://s3.amazonaws.com/bucket/signed',
      publicUrl: 'https://s3.amazonaws.com/public/file-key-123',
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
        activity: { ...mockQuizResponse.data, subjects: [] },
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

    describe('presencial results', () => {
      const presencialQuiz = {
        message: 'Success',
        data: {
          ...mockActivityMetadata,
          type: 'ATIVIDADE',
          subtype: 'PROVA',
          isDigital: false,
          essayThemeId: 'theme-1',
        },
      } as QuizResponse;

      /** One sheet in hand, one still out. */
      const examResults = {
        message: 'Success',
        data: {
          requiresEssay: true,
          students: [
            {
              studentId: 'student-1',
              studentName: 'João Silva',
              answerSheetStatus: 'RECEBIDO',
              answerSheetReceivedAt: '2024-01-16T10:30:00Z',
              essayStatus: 'RECEBIDO',
              essayReceivedAt: '2024-01-16T11:00:00Z',
              score: 8.5,
              essayScore: 920,
            },
            {
              studentId: 'student-2',
              studentName: 'Maria Souza',
              answerSheetStatus: 'AGUARDANDO',
              answerSheetReceivedAt: null,
              essayStatus: 'AGUARDANDO',
              essayReceivedAt: null,
              score: null,
              essayScore: null,
            },
          ],
          pagination: {
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          generalStats: { averageScore: 8.5, completionPercentage: 50 },
          questionStats: {
            mostCorrect: [1, 2],
            mostIncorrect: [3],
            notAnswered: [4],
          },
        },
      };

      const mockPresencial = () =>
        (mockApiClient.get as jest.Mock)
          .mockResolvedValueOnce({ data: mockDetailsApiResponse })
          .mockResolvedValueOnce({ data: presencialQuiz })
          .mockResolvedValueOnce({ data: examResults });

      it('reads the results of the exam instead of the activity details', async () => {
        mockPresencial();

        const { result } = renderHook(() => useActivityDetails(mockApiClient));
        const details =
          await result.current.fetchActivityDetails('activity-123');

        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/exams/activity-123/results',
          { params: {} }
        );
        expect(details.requiresEssay).toBe(true);
        expect(details.pagination.total).toBe(2);
        expect(details.questionStats.mostIncorrect).toEqual([3]);
      });

      it('carries the delivery of both sheets, with their dates and grades', async () => {
        mockPresencial();

        const { result } = renderHook(() => useActivityDetails(mockApiClient));
        const details =
          await result.current.fetchActivityDetails('activity-123');

        expect(details.students[0]).toMatchObject({
          studentId: 'student-1',
          answerSheetStatus: 'RECEBIDO',
          // The "Gabarito recebido em" column reads `answeredAt`.
          answeredAt: '2024-01-16T10:30:00Z',
          essayStatus: 'RECEBIDO',
          essayReceivedAt: '2024-01-16T11:00:00Z',
          score: 8.5,
          essayScore: 920,
        });
        expect(details.students[1]).toMatchObject({
          studentId: 'student-2',
          answerSheetStatus: 'AGUARDANDO',
          answeredAt: null,
          essayStatus: 'AGUARDANDO',
          essayReceivedAt: null,
          score: null,
          essayScore: null,
        });
      });

      // A received sheet stays awaiting correction — the gabarito flow never
      // writes `graded_at` — and that is what opens the correction modal.
      it('states the status the correction modal still reads', async () => {
        mockPresencial();

        const { result } = renderHook(() => useActivityDetails(mockApiClient));
        const details =
          await result.current.fetchActivityDetails('activity-123');

        expect(details.students[0].status).toBe(
          STUDENT_ACTIVITY_STATUS.AGUARDANDO_CORRECAO
        );
        expect(details.students[1].status).toBe(
          STUDENT_ACTIVITY_STATUS.AGUARDANDO_RESPOSTA
        );
      });

      it('forwards pagination and sorting to the results route', async () => {
        mockPresencial();

        const { result } = renderHook(() => useActivityDetails(mockApiClient));
        await result.current.fetchActivityDetails('activity-123', {
          page: 2,
          limit: 25,
          sortBy: 'score',
          sortOrder: 'desc',
        });

        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/exams/activity-123/results',
          { params: { page: 2, limit: 25, sortBy: 'score', sortOrder: 'desc' } }
        );
      });

      it.each([
        ['a digital exam', { isDigital: true, subtype: 'PROVA' }],
        ['an in-person activity that is not an exam', { isDigital: false }],
      ])('does not read the exam results for %s', async (_label, overrides) => {
        (mockApiClient.get as jest.Mock)
          .mockResolvedValueOnce({ data: mockDetailsApiResponse })
          .mockResolvedValueOnce({
            data: {
              message: 'Success',
              data: {
                ...mockActivityMetadata,
                essayThemeId: 'theme-1',
                ...overrides,
              },
            },
          });

        const { result } = renderHook(() => useActivityDetails(mockApiClient));
        await result.current.fetchActivityDetails('activity-123');

        expect(mockApiClient.get).not.toHaveBeenCalledWith(
          '/exams/activity-123/results',
          expect.anything()
        );
      });

      // The results route is the only source for this screen: falling back to
      // the details response would show delivery states nobody reported.
      it('propagates a failure of the results route', async () => {
        (mockApiClient.get as jest.Mock)
          .mockResolvedValueOnce({ data: mockDetailsApiResponse })
          .mockResolvedValueOnce({ data: presencialQuiz })
          .mockRejectedValueOnce(new Error('500'));

        const { result } = renderHook(() => useActivityDetails(mockApiClient));

        await expect(
          result.current.fetchActivityDetails('activity-123')
        ).rejects.toThrow('500');
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

  describe('fetchStudentFeedback', () => {
    it('should fetch student feedback successfully', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            feedback: {
              teacherFeedback: 'Ótimo trabalho!',
              attachment: 'https://s3.amazonaws.com/bucket/file.pdf',
            },
          },
        },
      });

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const feedback = await result.current.fetchStudentFeedback(
        'activity-123',
        'student-1'
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/feedback'
      );
      expect(feedback).toEqual({
        teacherFeedback: 'Ótimo trabalho!',
        attachment: 'https://s3.amazonaws.com/bucket/file.pdf',
      });
    });

    it('should propagate error when API fails', async () => {
      const errorMessage = 'Feedback not found';
      const mockError = new Error(errorMessage);
      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      let caughtError: Error | null = null;
      await act(async () => {
        try {
          await result.current.fetchStudentFeedback(
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

  describe('safeFetchStudentFeedback', () => {
    it('should return feedback data on success', async () => {
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            feedback: {
              teacherFeedback: 'Ótimo trabalho!',
              attachment: 'https://s3.amazonaws.com/bucket/file.pdf',
            },
          },
        },
      });

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const feedback = await result.current.safeFetchStudentFeedback(
        'activity-123',
        'student-1'
      );

      expect(feedback).toEqual({
        teacherFeedback: 'Ótimo trabalho!',
        attachment: 'https://s3.amazonaws.com/bucket/file.pdf',
      });
    });

    it('should return null and log warn when API fails', async () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const mockError = new Error('Feedback not found');
      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const feedback = await result.current.safeFetchStudentFeedback(
        'activity-123',
        'student-1'
      );

      expect(feedback).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to fetch student feedback:',
        mockError
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('submitObservation', () => {
    it('should submit observation without file successfully', async () => {
      (mockApiClient.patch as jest.Mock).mockResolvedValueOnce({});

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const returnValue = await result.current.submitObservation(
        'activity-123',
        'student-1',
        'Great work!',
        null,
        null
      );

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/feedback',
        {
          teacherFeedback: 'Great work!',
          attachment: null,
        }
      );
      expect(mockApiClient.patch).toHaveBeenCalledTimes(1);
      expect(returnValue).toBeNull();
    });

    it('should submit observation with file successfully', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockPresignedUrlResponse,
      });
      (mockApiClient.patch as jest.Mock).mockResolvedValueOnce({});

      // eslint-disable-next-line no-undef
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      } as Response);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const returnValue = await result.current.submitObservation(
        'activity-123',
        'student-1',
        'Great work!',
        mockFile,
        null
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/user/get-pre-signed-url',
        {
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
          fileSize: mockFile.size,
        }
      );

      // eslint-disable-next-line no-undef
      expect(global.fetch).toHaveBeenCalledWith(
        'https://s3.amazonaws.com/bucket/signed',
        {
          method: 'PUT',
          body: mockFile,
          headers: { 'Content-Type': 'application/pdf' },
        }
      );

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/feedback',
        {
          teacherFeedback: 'Great work!',
          attachment: 'https://s3.amazonaws.com/public/file-key-123',
        }
      );
      expect(returnValue).toBe('https://s3.amazonaws.com/public/file-key-123');
    });

    it('should handle presigned URL fetch failure', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      const errorMessage = 'Failed to get presigned URL';
      const mockError = new Error(errorMessage);
      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      await expect(
        result.current.submitObservation(
          'activity-123',
          'student-1',
          'Great work!',
          mockFile,
          null
        )
      ).rejects.toThrow(errorMessage);
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

      await expect(
        result.current.submitObservation(
          'activity-123',
          'student-1',
          'Great work!',
          mockFile,
          null
        )
      ).rejects.toThrow(errorMessage);
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

      await expect(
        result.current.submitObservation(
          'activity-123',
          'student-1',
          'Great work!',
          mockFile,
          null
        )
      ).rejects.toThrow('Falha ao fazer upload do arquivo');
    });

    it('should use publicUrl from presigned response as attachment', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            signedUrl: 'https://s3.amazonaws.com/bucket/signed-url',
            publicUrl: 'https://cdn.example.com/file-key-123',
          },
        },
      });
      (mockApiClient.patch as jest.Mock).mockResolvedValueOnce({});

      // eslint-disable-next-line no-undef
      global.fetch = jest.fn().mockResolvedValueOnce({ ok: true } as Response);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const returnValue = await result.current.submitObservation(
        'activity-123',
        'student-1',
        'Great work!',
        mockFile,
        null
      );

      expect(returnValue).toBe('https://cdn.example.com/file-key-123');
    });

    it('should upload file with PUT method to signedUrl', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            signedUrl: 'https://s3.amazonaws.com/bucket/signed-put-url',
            publicUrl: 'https://cdn.example.com/file-key-123',
          },
        },
      });
      (mockApiClient.patch as jest.Mock).mockResolvedValueOnce({});

      // eslint-disable-next-line no-undef
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      } as Response);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      await result.current.submitObservation(
        'activity-123',
        'student-1',
        'Great work!',
        mockFile,
        null
      );

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/feedback',
        {
          teacherFeedback: 'Great work!',
          attachment: 'https://cdn.example.com/file-key-123',
        }
      );
    });

    it('should handle observation submission failure', async () => {
      const errorMessage = 'Failed to submit observation';
      const mockError = new Error(errorMessage);
      (mockApiClient.patch as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      await expect(
        result.current.submitObservation(
          'activity-123',
          'student-1',
          'Great work!',
          null,
          null
        )
      ).rejects.toThrow(errorMessage);
    });

    it('should preserve existingAttachment when no new file is provided', async () => {
      (mockApiClient.patch as jest.Mock).mockResolvedValueOnce({});

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const returnValue = await result.current.submitObservation(
        'activity-123',
        'student-1',
        'Great work!',
        null,
        'https://example.com/old.pdf'
      );

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/feedback',
        {
          teacherFeedback: 'Great work!',
          attachment: 'https://example.com/old.pdf',
        }
      );
      expect(returnValue).toBe('https://example.com/old.pdf');
    });

    it('should override existingAttachment when new file is uploaded', async () => {
      const mockFile = new File(['test content'], 'new.pdf', {
        type: 'application/pdf',
      });

      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockPresignedUrlResponse,
      });
      (mockApiClient.patch as jest.Mock).mockResolvedValueOnce({});

      // eslint-disable-next-line no-undef
      global.fetch = jest.fn().mockResolvedValueOnce({ ok: true } as Response);

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const returnValue = await result.current.submitObservation(
        'activity-123',
        'student-1',
        'Great work!',
        mockFile,
        'https://example.com/old.pdf'
      );

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/feedback',
        {
          teacherFeedback: 'Great work!',
          attachment: mockPresignedUrlResponse.data.publicUrl,
        }
      );
      expect(returnValue).toBe(mockPresignedUrlResponse.data.publicUrl);
    });

    it('should send null attachment when no file and no existingAttachment', async () => {
      (mockApiClient.patch as jest.Mock).mockResolvedValueOnce({});

      const { result } = renderHook(() => useActivityDetails(mockApiClient));

      const returnValue = await result.current.submitObservation(
        'activity-123',
        'student-1',
        'Great work!',
        null,
        null
      );

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/activities/activity-123/students/student-1/feedback',
        {
          teacherFeedback: 'Great work!',
          attachment: null,
        }
      );
      expect(returnValue).toBeNull();
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

      await expect(
        result.current.submitQuestionCorrection(
          'activity-123',
          'student-1',
          payload
        )
      ).rejects.toThrow(errorMessage);
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
        fetchStudentFeedback: result.current.fetchStudentFeedback,
        safeFetchStudentFeedback: result.current.safeFetchStudentFeedback,
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
      expect(result.current.fetchStudentFeedback).toBe(
        firstRender.fetchStudentFeedback
      );
      expect(result.current.safeFetchStudentFeedback).toBe(
        firstRender.safeFetchStudentFeedback
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

describe('withDerivedSubjects', () => {
  const activity = (questions: unknown[]) =>
    ({
      id: 'act-1',
      title: 'Atividade',
      startDate: null,
      finalDate: null,
      schoolName: 'Escola',
      year: '2026',
      className: 'A',
      questions,
    }) as never;

  it('should return undefined for a missing activity', () => {
    expect(withDerivedSubjects(undefined)).toBeUndefined();
  });

  it('should return an empty list when the activity has no questions', () => {
    expect(withDerivedSubjects(activity([]))?.subjects).toEqual([]);
  });

  it('should collect the distinct subjects of the questions, sorted', () => {
    const result = withDerivedSubjects(
      activity([
        { knowledgeMatrix: [{ subject: { id: 'f', name: 'Física' } }] },
        { knowledgeMatrix: [{ subject: { id: 'b', name: 'Biologia' } }] },
        { knowledgeMatrix: [{ subject: { id: 'b', name: 'Biologia' } }] },
      ])
    );

    expect(result?.subjects).toEqual(['Biologia', 'Física']);
  });

  it('should read every entry of a question knowledge matrix', () => {
    const result = withDerivedSubjects(
      activity([
        {
          knowledgeMatrix: [
            { subject: { id: 'b', name: 'Biologia' } },
            { subject: { id: 'q', name: 'Química' } },
          ],
        },
      ])
    );

    expect(result?.subjects).toEqual(['Biologia', 'Química']);
  });

  it('should skip questions without a knowledge matrix', () => {
    const result = withDerivedSubjects(
      activity([
        {},
        { knowledgeMatrix: [] },
        { knowledgeMatrix: [{ subject: null }] },
        { knowledgeMatrix: [{ subject: { id: 'b', name: 'Biologia' } }] },
      ])
    );

    expect(result?.subjects).toEqual(['Biologia']);
  });

  it('should sort using the pt-BR collation', () => {
    const result = withDerivedSubjects(
      activity([
        { knowledgeMatrix: [{ subject: { id: 'e', name: 'Espanhol' } }] },
        {
          knowledgeMatrix: [{ subject: { id: 'ef', name: 'Educação Física' } }],
        },
      ])
    );

    expect(result?.subjects).toEqual(['Educação Física', 'Espanhol']);
  });
});
