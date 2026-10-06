import { UserIcon } from '@phosphor-icons/react';
import Text from '../../Text/Text';
import { TruncatedText } from '../../TruncatedText/TruncatedText';
import Button from '../../Button/Button';
import Badge from '../../Badge/Badge';
import ProgressBar from '../../ProgressBar/ProgressBar';
import Table, {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  useTableSort,
} from '../../Table/Table';
import { getStudentStatusBadgeAction } from '../../../types/recommendedLessons';
import type { DisplayStudent, LessonDetailsLabels } from '../types';

/**
 * Props for StudentsTable component
 */
interface StudentsTableProps {
  /** List of students to display */
  students: DisplayStudent[];
  /** Callback when correct activity is clicked */
  onCorrectActivity?: (studentId: string) => void;
  /** Labels for the component */
  labels: LessonDetailsLabels;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * Students table component
 * Displays students with their status, completion, and duration
 */
export const StudentsTable = ({
  students,
  onCorrectActivity,
  labels,
  emptyMessage = 'Nenhum aluno encontrado',
}: StudentsTableProps) => {
  const { sortedData, sortColumn, sortDirection, handleSort } =
    useTableSort<DisplayStudent>(students);

  return (
    <div className="bg-background rounded-xl border border-border-50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              sortable
              sortDirection={sortColumn === 'name' ? sortDirection : undefined}
              onSort={() => handleSort('name')}
            >
              {labels.studentColumn}
            </TableHead>
            <TableHead
              sortable
              sortDirection={
                sortColumn === 'status' ? sortDirection : undefined
              }
              onSort={() => handleSort('status')}
            >
              {labels.statusColumn}
            </TableHead>
            <TableHead
              sortable
              sortDirection={
                sortColumn === 'completionPercentage'
                  ? sortDirection
                  : undefined
              }
              onSort={() => handleSort('completionPercentage')}
            >
              {labels.completionColumn}
            </TableHead>
            <TableHead>{labels.durationColumn}</TableHead>
            {/* Cabeçalho sem texto visível (design), mas com nome para o leitor
                de tela: coluna sem nome é anunciada como vazia. */}
            <TableHead className="w-[160px]">
              <Text as="span" className="sr-only">
                Ações
              </Text>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <Text size="sm" className="text-text-500">
                  {emptyMessage}
                </Text>
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="max-w-[220px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Text
                      as="span"
                      className="size-8 rounded-full bg-background-100 flex items-center justify-center shrink-0"
                    >
                      <UserIcon
                        size={16}
                        className="text-text-500"
                        aria-hidden="true"
                      />
                    </Text>
                    <TruncatedText size="sm" color="text-text-950">
                      {student.name}
                    </TruncatedText>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="solid"
                    action={getStudentStatusBadgeAction(student.status)}
                    size="small"
                  >
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    {/* O percentual visível sai da árvore de acessibilidade: a
                        barra já o anuncia junto com o nome do aluno, e sem isso
                        o valor seria lido duas vezes. */}
                    <Text
                      size="sm"
                      className="text-primary-700 font-medium"
                      aria-hidden="true"
                    >
                      {student.completionPercentage}%
                    </Text>
                    <ProgressBar
                      value={student.completionPercentage}
                      size="small"
                      variant="blue"
                      className="w-full max-w-[100px]"
                      accessibleLabel={`Conclusão de ${student.name}: ${student.completionPercentage}%`}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Text size="sm" className="text-text-700">
                    {student.duration ?? '-'}
                  </Text>
                </TableCell>
                <TableCell>
                  {onCorrectActivity && (
                    <Button
                      variant="outline"
                      size="extra-small"
                      onClick={() => onCorrectActivity(student.id)}
                      // Todas as linhas têm o mesmo botão: o nome do aluno no
                      // nome acessível diz de quem é cada um fora da tabela.
                      aria-label={`${labels.correctActivity} de ${student.name}`}
                    >
                      {labels.correctActivity}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentsTable;
