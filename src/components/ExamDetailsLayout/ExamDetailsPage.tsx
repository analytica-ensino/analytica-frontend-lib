import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BaseApiClient } from '../../types/api';
import type { TableParams } from '../TableProvider/TableProvider';
import type {
  StudentActivityCorrectionData,
  QuestionsAnswersByStudentResponse,
} from '../../utils/studentActivityCorrection';
import { convertApiResponseToCorrectionData } from '../../utils/studentActivityCorrection';
import CorrectActivityModal from '../CorrectActivityModal/CorrectActivityModal';
import { AnswerSheetPreview } from '../ExamPageLayout/GabaritoPreview';
import {
  AnswerSheetsBatchPreview,
  type AnswerSheetData,
} from '../ExamPageLayout/GabaritosBatchPreview';
import { ExamDetailsHeader } from './ExamDetailsHeader';
import { ExamStatsCards } from './ExamStatsCards';
import { ExamStudentsTable } from './ExamStudentsTable';
import type {
  ExamStudentTableItem,
  ExamDetailsData,
  ExamDetailsPagination,
} from '../../types/examDetails';
import { createUseQuestionsList } from '../../hooks/useQuestionsList';
import {
  useQuestionsPdfPrint,
  QuestionsPdfContent,
} from '../QuestionsPdfGenerator/QuestionsPdfGenerator';
import type { PreviewQuestion } from '../ActivityPreview/ActivityPreview';
import type { Question } from '../../types/questions';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { SkeletonCard } from '../Skeleton/Skeleton';
import Text from '../Text/Text';

/**
 * Interface for single student answer sheet API response
 */
interface AnswerSheetResponse {
  data: {
    student: { id: string; name: string };
    activity: { id: string; title: string; totalQuestions: number };
    qrCodeUrl: string;
    schoolClass: string | null;
  };
}

/**
 * Interface for batch answer sheets API response
 */
interface BatchAnswerSheetsResponse {
  data: {
    exam: { id: string; title: string; totalQuestions: number };
    students: Array<{
      student: { id: string; name: string };
      qrCodeUrl: string;
      schoolClass: string | null;
    }>;
  };
}

/**
 * Interface for student correction API response
 */
interface StudentCorrectionResponse {
  data: QuestionsAnswersByStudentResponse['data'] & {
    studentId: string;
    studentName: string;
    observation: string | null;
    attachment: string | null;
    answerSheetImageUrl: string | null;
  };
}

/**
 * Props for the ExamDetailsPage component
 */
export interface ExamDetailsPageProps {
  /** Exam ID to display details for */
  examId: string;
  /** Institution ID for API calls */
  institutionId: string;
  /** API client instance */
  apiClient: BaseApiClient;
  /** Exam data fetched from API */
  examData: ExamDetailsData | null;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Pagination data */
  pagination: ExamDetailsPagination;
  /** Function to fetch exam details */
  fetchExamDetails: (
    examId: string,
    params: { page: number; limit: number }
  ) => void;
  /** Callback when back button is clicked */
  onBack: () => void;
  /** Number of students per page (default: 10) */
  studentsPerPage?: number;
}

/**
 * Loading skeleton for exam details
 */
const ExamDetailsSkeleton = () => (
  <div className="flex flex-col gap-6 p-6">
    <SkeletonCard className="h-24" />
    <SkeletonCard className="h-32" />
    <SkeletonCard className="h-64" />
  </div>
);

/**
 * Error state component
 */
const ExamDetailsError = ({
  error,
  onBack,
}: {
  error: string;
  onBack: () => void;
}) => (
  <div className="flex flex-col items-center justify-center gap-4 p-6 min-h-[400px]">
    <Text size="lg" color="secondary">
      {error}
    </Text>
    <button
      onClick={onBack}
      className="text-primary-500 hover:text-primary-600 underline"
    >
      Voltar para provas
    </button>
  </div>
);

/**
 * Reusable Exam Details Page component
 *
 * Displays exam information, statistics, and student results.
 * Includes PDF download, answer sheet generation, and correction modal.
 */
export const ExamDetailsPage = ({
  examId,
  institutionId,
  apiClient,
  examData,
  loading,
  error,
  pagination,
  fetchExamDetails,
  onBack,
  studentsPerPage = 10,
}: ExamDetailsPageProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Answer sheet preview states
  const [showAnswerSheetPreview, setShowAnswerSheetPreview] = useState(false);
  const [answerSheetPreviewData, setAnswerSheetPreviewData] =
    useState<AnswerSheetData | null>(null);
  const [showBatchAnswerSheetPreview, setShowBatchAnswerSheetPreview] =
    useState(false);
  const [batchAnswerSheetsData, setBatchAnswerSheetsData] = useState<
    AnswerSheetData[]
  >([]);

  // Loading states for answer sheet downloads
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [batchAnswerSheetLoading, setBatchAnswerSheetLoading] = useState(false);

  // Correction modal states
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionData, setCorrectionData] =
    useState<StudentActivityCorrectionData | null>(null);
  const [answerSheetImageUrl, setAnswerSheetImageUrl] = useState<string | null>(
    null
  );
  // Exam PDF download states
  const [examQuestions, setExamQuestions] = useState<PreviewQuestion[]>([]);
  const [isLoadingExamPdf, setIsLoadingExamPdf] = useState(false);
  const [shouldPrintExam, setShouldPrintExam] = useState(false);

  // Hook factory for fetching questions
  const hookFactoryRef = useRef<ReturnType<
    typeof createUseQuestionsList
  > | null>(null);
  hookFactoryRef.current ??= createUseQuestionsList(apiClient);
  const { fetchQuestionsByIds } = hookFactoryRef.current();

  // PDF print hook
  const { contentRef: examPdfRef, handlePrint: handlePrintExam } =
    useQuestionsPdfPrint(examQuestions);

  /**
   * Transform Question to PreviewQuestion format
   */
  const transformQuestionToPreview = useCallback(
    (question: Question): PreviewQuestion => {
      return {
        id: question.id,
        questionType: question.questionType,
        enunciado: question.statement,
        question: question.options
          ? {
              options: question.options.map((opt) => ({
                id: opt.id,
                option: opt.option,
              })),
              correctOptionIds: question.options
                .filter((opt) => opt.isCorrect)
                .map((opt) => opt.id),
            }
          : undefined,
      };
    },
    []
  );

  /**
   * Effect to trigger print when examQuestions are loaded and shouldPrintExam is true
   */
  useEffect(() => {
    if (
      shouldPrintExam &&
      examQuestions.length > 0 &&
      examPdfRef.current &&
      handlePrintExam
    ) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        handlePrintExam();
        setShouldPrintExam(false);
        setIsLoadingExamPdf(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldPrintExam, examQuestions.length, examPdfRef, handlePrintExam]);

  /**
   * Fetch exam details on mount and when page changes
   */
  useEffect(() => {
    if (examId) {
      fetchExamDetails(examId, { page: currentPage, limit: studentsPerPage });
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [examId, currentPage, fetchExamDetails, isInitialLoad, studentsPerPage]);

  /**
   * Handle table params change (pagination)
   */
  const handleParamsChange = useCallback((params: TableParams) => {
    if (params.page) {
      setCurrentPage(params.page);
    }
  }, []);

  /**
   * Transform students data for TableProvider
   */
  const studentsTableData: ExamStudentTableItem[] = useMemo(
    () =>
      examData?.students.map((student) => ({
        ...student,
      })) ?? [],
    [examData?.students]
  );

  /**
   * Download exam PDF
   * Fetches the exam questions and generates a printable PDF
   */
  const handleDownloadExam = useCallback(async () => {
    if (!examId || isLoadingExamPdf) return;

    setIsLoadingExamPdf(true);

    try {
      // Try to fetch questions from quiz endpoint first
      let questions: Question[] = [];

      try {
        const quizResponse = await apiClient.get<{
          data: { questions?: Question[]; questionIds?: string[] };
        }>(`/activities/${examId}/quiz`);

        if (quizResponse.data.data.questions) {
          questions = quizResponse.data.data.questions;
        } else if (quizResponse.data.data.questionIds) {
          questions = await fetchQuestionsByIds(
            quizResponse.data.data.questionIds
          );
        }
      } catch {
        // If quiz endpoint fails, try activity endpoint
        const activityResponse = await apiClient.get<{
          data: { questions?: Question[]; questionIds?: string[] };
        }>(`/activities/${examId}`);

        if (activityResponse.data.data.questions) {
          questions = activityResponse.data.data.questions;
        } else if (activityResponse.data.data.questionIds) {
          questions = await fetchQuestionsByIds(
            activityResponse.data.data.questionIds
          );
        }
      }

      if (questions.length === 0) {
        console.error('Nenhuma questão encontrada para esta prova');
        setIsLoadingExamPdf(false);
        return;
      }

      // Transform questions to PreviewQuestion format
      const previewQuestions = questions.map(transformQuestionToPreview);
      setExamQuestions(previewQuestions);
      setShouldPrintExam(true);
    } catch (err) {
      console.error('Erro ao baixar prova:', err);
      setIsLoadingExamPdf(false);
    }
  }, [
    examId,
    isLoadingExamPdf,
    apiClient,
    fetchQuestionsByIds,
    transformQuestionToPreview,
  ]);

  /**
   * Download student's answer sheet
   * Fetches the answer sheet data and displays the AnswerSheetPreview component
   */
  const handleDownloadAnswerSheet = useCallback(
    async (studentId: string) => {
      if (!examId || !institutionId) return;

      setLoadingStudentId(studentId);

      try {
        const studentFrontendUrl = globalThis.location.origin;

        const response = await apiClient.get<AnswerSheetResponse>(
          `/activities/${examId}/answer-sheet/${studentId}`,
          { params: { studentFrontendUrl, institutionId } }
        );

        const { student, activity, qrCodeUrl, schoolClass } =
          response.data.data;
        const [school, className] = schoolClass?.split(' - ') || ['', ''];

        setAnswerSheetPreviewData({
          studentName: student.name,
          qrCodeUrl,
          totalQuestions: activity.totalQuestions,
          examTitle: examData?.title,
          schoolName: school || undefined,
          className: className || undefined,
        });
        setShowAnswerSheetPreview(true);
      } catch (err) {
        console.error('Erro ao gerar gabarito:', err);
      } finally {
        setLoadingStudentId(null);
      }
    },
    [examId, institutionId, apiClient, examData?.title]
  );

  /**
   * View student's answers
   * Fetches correction data and opens the correction modal
   */
  const handleViewAnswers = useCallback(
    async (studentId: string) => {
      if (!examId) return;

      try {
        const response = await apiClient.get<StudentCorrectionResponse>(
          `/exams/${examId}/students/${studentId}/correction`
        );

        const data = response.data.data;

        // Use the library's converter to transform API response
        const transformedData = convertApiResponseToCorrectionData(
          { data: { answers: data.answers, statistics: data.statistics } },
          data.studentId,
          data.studentName,
          data.observation ?? undefined,
          data.attachment ?? undefined
        );

        setCorrectionData(transformedData);
        setAnswerSheetImageUrl(data.answerSheetImageUrl);
        setShowCorrectionModal(true);
      } catch (err) {
        console.error('Erro ao buscar dados de correção:', err);
      }
    },
    [examId, apiClient]
  );

  /**
   * Close correction modal and reset state
   */
  const handleCloseCorrectionModal = useCallback(() => {
    setShowCorrectionModal(false);
    setCorrectionData(null);
    setAnswerSheetImageUrl(null);
  }, []);

  /**
   * Open scanned answer sheet in new tab
   */
  const handleViewScannedAnswerSheet = useCallback(() => {
    if (answerSheetImageUrl) {
      globalThis.open(answerSheetImageUrl, '_blank');
    }
  }, [answerSheetImageUrl]);

  /**
   * Download all answer sheets for all students
   * Fetches batch answer sheet data and displays AnswerSheetsBatchPreview component
   */
  const handleDownloadAllAnswerSheets = useCallback(async () => {
    if (!examId || !institutionId) return;

    setBatchAnswerSheetLoading(true);

    try {
      const studentFrontendUrl = globalThis.location.origin;

      const response = await apiClient.get<BatchAnswerSheetsResponse>(
        `/exams/${examId}/answer-sheets`,
        { params: { studentFrontendUrl, institutionId } }
      );

      const { exam, students } = response.data.data;

      const answerSheets: AnswerSheetData[] = students.map((s) => {
        const [school, className] = s.schoolClass?.split(' - ') || ['', ''];
        return {
          studentName: s.student.name,
          qrCodeUrl: s.qrCodeUrl,
          totalQuestions: exam.totalQuestions,
          examTitle: exam.title,
          schoolName: school || undefined,
          className: className || undefined,
        };
      });

      setBatchAnswerSheetsData(answerSheets);
      setShowBatchAnswerSheetPreview(true);
    } catch (err) {
      console.error('Erro ao gerar gabaritos:', err);
    } finally {
      setBatchAnswerSheetLoading(false);
    }
  }, [examId, institutionId, apiClient]);

  // Only show skeleton on initial load
  if (isInitialLoad && loading) {
    return <ExamDetailsSkeleton />;
  }

  if (error || !examData) {
    return (
      <ExamDetailsError
        error={error || 'Prova não encontrada'}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <ExamDetailsHeader
        examTitle={examData.title}
        examDate={examData.startDate}
        school={examData.school}
        className={examData.className}
        createdAt={examData.createdAt}
        onBack={onBack}
        onDownloadExam={handleDownloadExam}
      />

      <ExamStatsCards
        averageScore={examData.stats.averageScore}
        mostCorrectQuestions={examData.stats.mostCorrectQuestions}
        mostIncorrectQuestions={examData.stats.mostIncorrectQuestions}
        unansweredQuestions={examData.stats.unansweredQuestions}
      />

      <ExamStudentsTable
        students={studentsTableData}
        loading={loading}
        pagination={pagination}
        onParamsChange={handleParamsChange}
        onDownloadAnswerSheet={handleDownloadAnswerSheet}
        onViewAnswers={handleViewAnswers}
        onDownloadAllAnswerSheets={handleDownloadAllAnswerSheets}
        loadingStudentId={loadingStudentId}
        batchLoading={batchAnswerSheetLoading}
      />

      {/* Hidden Answer Sheet Preview for printing - single student */}
      {showAnswerSheetPreview && answerSheetPreviewData && (
        <div style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}>
          <AnswerSheetPreview
            studentName={answerSheetPreviewData.studentName}
            qrCodeUrl={answerSheetPreviewData.qrCodeUrl}
            totalQuestions={answerSheetPreviewData.totalQuestions}
            examTitle={answerSheetPreviewData.examTitle}
            schoolName={answerSheetPreviewData.schoolName}
            className={answerSheetPreviewData.className}
            onComplete={() => {
              setShowAnswerSheetPreview(false);
              setAnswerSheetPreviewData(null);
            }}
          />
        </div>
      )}

      {/* Hidden Batch Answer Sheets Preview for printing - all students */}
      {showBatchAnswerSheetPreview && batchAnswerSheetsData.length > 0 && (
        <div style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}>
          <AnswerSheetsBatchPreview
            answerSheets={batchAnswerSheetsData}
            onComplete={() => {
              setShowBatchAnswerSheetPreview(false);
              setBatchAnswerSheetsData([]);
            }}
          />
        </div>
      )}

      {/* Hidden Exam PDF content for printing */}
      <div style={{ display: 'none' }}>
        <QuestionsPdfContent ref={examPdfRef} questions={examQuestions} />
      </div>

      {/* Exam Correction Modal - uses library component with scanned answer sheet support */}
      <CorrectActivityModal
        isOpen={showCorrectionModal}
        onClose={handleCloseCorrectionModal}
        data={correctionData}
        isViewOnly={true}
        answerSheetImageUrl={answerSheetImageUrl}
        onViewScannedAnswerSheet={handleViewScannedAnswerSheet}
      />
    </div>
  );
};

export default ExamDetailsPage;
