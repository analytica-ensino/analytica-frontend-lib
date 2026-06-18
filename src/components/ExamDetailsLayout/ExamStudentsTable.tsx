import { useMemo } from 'react';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import Text from '../Text/Text';
import Button from '../Button/Button';
import TableProvider from '../TableProvider/TableProvider';
import type { TableParams } from '../TableProvider/TableProvider';
import type {
  ExamStudentTableItem,
  ExamDetailsPagination,
} from '../../types/examDetails';
import { createExamStudentsTableColumns } from './examStudentsTableConfig';

export interface ExamStudentsTableProps {
  students: ExamStudentTableItem[];
  loading: boolean;
  pagination: ExamDetailsPagination;
  onParamsChange: (params: TableParams) => void;
  onDownloadAnswerSheet: (studentId: string) => void;
  onViewAnswers: (studentId: string) => void;
  onDownloadAllAnswerSheets: () => void;
  loadingStudentId: string | null;
  batchLoading: boolean;
  /** Custom title for the section */
  title?: string;
  /** Custom label for the download all button */
  downloadAllLabel?: string;
  /** Custom loading label for the download all button */
  downloadAllLoadingLabel?: string;
  /** Custom item label for pagination */
  itemLabel?: string;
}

/**
 * Students results table component for exam details
 * Uses TableProvider from analytica-frontend-lib with server-side pagination
 */
export const ExamStudentsTable = ({
  students,
  loading,
  pagination,
  onParamsChange,
  onDownloadAnswerSheet,
  onViewAnswers,
  onDownloadAllAnswerSheets,
  loadingStudentId,
  batchLoading,
  title = 'Resultados por aluno',
  downloadAllLabel = 'Baixar todos os gabaritos',
  downloadAllLoadingLabel = 'Carregando...',
  itemLabel = 'alunos',
}: ExamStudentsTableProps) => {
  const columns = useMemo(
    () =>
      createExamStudentsTableColumns(
        onDownloadAnswerSheet,
        onViewAnswers,
        loadingStudentId
      ),
    [onDownloadAnswerSheet, onViewAnswers, loadingStudentId]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header with title and download all button */}
      <div className="flex justify-between items-center">
        <Text as="h2" size="lg" weight="semibold">
          {title}
        </Text>
        <Button
          action="primary"
          onClick={onDownloadAllAnswerSheets}
          iconLeft={<DownloadSimpleIcon size={18} />}
          disabled={batchLoading}
        >
          {batchLoading ? downloadAllLoadingLabel : downloadAllLabel}
        </Button>
      </div>

      {/* Table using TableProvider with pagination */}
      <TableProvider
        data={students}
        headers={columns}
        loading={loading}
        variant="borderless"
        enableSearch={false}
        enableFilters={false}
        enableTableSort={true}
        enablePagination={true}
        enableRowClick={false}
        paginationConfig={{
          itemLabel,
          defaultItemsPerPage: 10,
          totalItems: pagination.total,
          totalPages: pagination.totalPages,
        }}
        onParamsChange={onParamsChange}
        containerClassName="bg-background rounded-xl p-6"
      />
    </div>
  );
};

export default ExamStudentsTable;
