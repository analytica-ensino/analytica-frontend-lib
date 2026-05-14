import type { MouseEvent } from 'react';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import {
  StudentAnswerStatus,
  StudentAnswerDisplayStatus,
  type ExamStudentTableItem,
} from '../../types/examDetails';

/**
 * Map status to badge action type
 */
export const getExamStudentStatusBadgeAction = (
  status: StudentAnswerStatus
): 'warning' | 'success' => {
  switch (status) {
    case StudentAnswerStatus.ANSWER_SHEET_RECEIVED:
      return 'success';
    case StudentAnswerStatus.AWAITING_ANSWER_SHEET:
    default:
      return 'warning';
  }
};

/**
 * Map status to display text
 */
export const getExamStudentStatusDisplayText = (
  status: StudentAnswerStatus
): string => {
  switch (status) {
    case StudentAnswerStatus.ANSWER_SHEET_RECEIVED:
      return StudentAnswerDisplayStatus.ANSWER_SHEET_RECEIVED;
    case StudentAnswerStatus.AWAITING_ANSWER_SHEET:
    default:
      return StudentAnswerDisplayStatus.AWAITING_ANSWER_SHEET;
  }
};

/**
 * Create column configuration for exam students table
 * Requires callbacks to be passed for action buttons
 * @param onDownloadAnswerSheet - Callback for downloading answer sheet
 * @param onViewAnswers - Callback for viewing student answers
 * @param loadingStudentId - ID of the student whose gabarito is being loaded
 */
export const createExamStudentsTableColumns = (
  onDownloadAnswerSheet: (studentId: string) => void,
  onViewAnswers: (studentId: string) => void,
  loadingStudentId: string | null
): ColumnConfig<ExamStudentTableItem>[] => [
  {
    key: 'studentName',
    label: 'Aluno',
    sortable: true,
    render: (_value: unknown, row: ExamStudentTableItem) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-warning-200 flex items-center justify-center">
          <span className="text-sm font-bold text-warning-700">
            {row.studentName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm">{row.studentName}</span>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: unknown) => {
      const status = value as StudentAnswerStatus;
      return (
        <Badge
          variant="solid"
          action={getExamStudentStatusBadgeAction(status)}
          size="small"
        >
          {getExamStudentStatusDisplayText(status)}
        </Badge>
      );
    },
  },
  {
    key: 'answerReceivedAt',
    label: 'Gabarito recebido em',
    sortable: true,
    render: (value: unknown) => (
      <span className="text-sm">{(value as string) || '-'}</span>
    ),
  },
  {
    key: 'score',
    label: 'Nota',
    sortable: true,
    render: (value: unknown) => (
      <span className="text-sm">
        {value === null ? '-' : (value as number).toFixed(1)}
      </span>
    ),
  },
  {
    key: 'downloadAnswerSheet',
    label: 'Gabarito',
    sortable: false,
    render: (_value: unknown, row: ExamStudentTableItem) => {
      const isLoading = loadingStudentId === row.studentId;
      return (
        <Button
          variant="outline"
          action="primary"
          size="small"
          disabled={isLoading}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onDownloadAnswerSheet(row.studentId);
          }}
        >
          {isLoading ? 'Carregando...' : 'Baixar gabarito'}
        </Button>
      );
    },
  },
  {
    key: 'viewAnswers',
    label: 'Resultado',
    sortable: false,
    render: (_value: unknown, row: ExamStudentTableItem) => {
      const hasResponse =
        row.status === StudentAnswerStatus.ANSWER_SHEET_RECEIVED;
      return (
        <Button
          variant="outline"
          action="primary"
          size="small"
          disabled={!hasResponse}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onViewAnswers(row.studentId);
          }}
        >
          Ver respostas
        </Button>
      );
    },
  },
];
