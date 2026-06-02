import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';
import { renderTextCell } from '../../utils/renderTextCell';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import { CaretRight } from 'phosphor-react';
import type { ExamTableItem } from '../../types/examsHistory';
import { ExamDisplayStatus } from '../../types/examsHistory';

/**
 * Badge action type for exam status
 */
type ExamBadgeAction = 'info' | 'success' | 'warning' | 'error';

/**
 * Get badge action based on exam status
 *
 * @param status - Exam display status
 * @returns Badge action type
 */
export const getExamStatusBadgeAction = (
  status: ExamDisplayStatus
): ExamBadgeAction => {
  const actionMap: Record<ExamDisplayStatus, ExamBadgeAction> = {
    [ExamDisplayStatus.AGENDADA]: 'info',
    [ExamDisplayStatus.EM_ANDAMENTO]: 'warning',
    [ExamDisplayStatus.FINALIZADA]: 'success',
    [ExamDisplayStatus.CANCELADA]: 'error',
  };
  return actionMap[status] || 'info';
};

/**
 * Column configuration for exams table
 *
 * Columns:
 * - startDate: Data da prova (inicio)
 * - title: Titulo
 * - school: Escola
 * - class: Turma
 * - status: Status (Agendada, Em andamento, Finalizada, Cancelada)
 * - questionCount: Questoes
 * - createdAt: Criada em
 * - completionPercentage: Conclusao
 */
export const examsTableColumns: ColumnConfig<ExamTableItem>[] = [
  {
    key: 'startDate',
    label: 'Data da Prova',
    sortable: true,
  },
  {
    key: 'title',
    label: 'Título',
    sortable: true,
    className: 'max-w-[200px] truncate',
    render: renderTextCell,
  },
  {
    key: 'school',
    label: 'Escola',
    sortable: true,
    className: 'max-w-[150px] truncate',
    render: renderTextCell,
  },
  {
    key: 'class',
    label: 'Turma',
    sortable: true,
    className: 'max-w-[120px]',
    render: renderTextCell,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: unknown) => {
      const status = value as ExamDisplayStatus;
      return (
        <Badge
          variant="solid"
          action={getExamStatusBadgeAction(status)}
          size="small"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    key: 'questionCount',
    label: 'Questões',
    sortable: true,
    className: 'text-center',
  },
  {
    key: 'createdAt',
    label: 'Criada em',
    sortable: true,
  },
  {
    key: 'completionPercentage',
    label: 'Conclusão',
    sortable: true,
    render: (value: unknown) => {
      const numValue = Number(value);
      const safeValue = Number.isFinite(numValue)
        ? Math.max(0, Math.min(100, numValue))
        : 0;
      return (
        <ProgressBar
          value={safeValue}
          variant="blue"
          size="medium"
          layout="compact"
          showPercentage={true}
          compactWidth="w-[100px]"
        />
      );
    },
  },
  {
    key: 'navigation',
    label: '',
    sortable: false,
    className: 'w-12',
    render: () => (
      <div className="flex justify-center">
        <CaretRight size={20} className="text-text-600" />
      </div>
    ),
  },
];
