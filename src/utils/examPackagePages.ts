import QRCode from 'qrcode';
import type { BaseApiClient } from '../types/api';
import { buildAnswerSheetPage } from './answerSheetHtml';
import { buildEssaySheetPage } from './essaySheetHtml';
import type { ExamAnswerSheetsResponse } from '../types/answerSheet';

/**
 * Builds the pages that ride along with the printed exam: for each student, a
 * folha de redação and their own cartão-resposta (with the QR code that ties
 * the scanned sheet back to them).
 *
 * The questions themselves are rendered by the lib — this only produces what
 * needs app-side data the lib has no access to.
 *
 * @param apiClient - HTTP client used to read the batch answer sheets
 * @param activityId - Exam id
 * @param institutionId - Institution the exam belongs to
 * @returns HTML fragment with every extra page, empty when there are no students
 */
export const buildExamPackagePages = async (
  apiClient: BaseApiClient,
  activityId: string,
  institutionId: string | null | undefined
): Promise<string> => {
  const response = await apiClient.get<ExamAnswerSheetsResponse>(
    `/exams/${activityId}/answer-sheets`,
    {
      params: {
        studentFrontendUrl: globalThis.location.origin,
        institutionId,
      },
    }
  );

  const { exam, students } = response.data.data;

  const pages = await Promise.all(
    students.map(async (entry) => {
      const qrCodeDataUrl = await QRCode.toDataURL(entry.qrCodeUrl, {
        width: 320,
        margin: 1,
      });

      const answerSheet = buildAnswerSheetPage(
        {
          student: entry.student,
          activity: { title: exam.title, totalQuestoes: exam.totalQuestions },
          qrCodeUrl: entry.qrCodeUrl,
          schoolClass: entry.schoolClass,
        },
        qrCodeDataUrl
      );

      return buildEssaySheetPage(exam.title, entry.student.name) + answerSheet;
    })
  );

  return pages.join('');
};
