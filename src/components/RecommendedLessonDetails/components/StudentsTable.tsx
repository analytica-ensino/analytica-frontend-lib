import { useCallback } from 'react';
import { UserIcon } from '@phosphor-icons/react';
import Text from '../../Text/Text';
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
import {
  StudentLessonStatus,
  getStudentStatusBadgeAction,
} from '../../../types/recommendedLessons';
import type { DisplayStudent, LessonDetailsLabels } from '../types';

/**
 * Props for StudentsTable component
 */
interface StudentsTableProps {
  /** List of students to display */
  students: DisplayStudent[];
  /** Callback when view performance button is clicked */
  onViewPerformance?: (studentId: string) => void;
  /** Labels for the component */
  labels: LessonDetailsLabels;
}

/**
 * Students table component
 * Displays students with their status, completion, and duration
 */
export const StudentsTable = ({
  students,
  onViewPerformance,
  labels,
}: StudentsTableProps) => {
  const { sortedData, sortColumn, sortDirection, handleSort } =
    useTableSort<DisplayStudent>(students);

  const canViewPerformance = useCallback((student: DisplayStudent) => {
    return (
      student.status === StudentLessonStatus.CONCLUIDO ||
      student.status === StudentLessonStatus.NAO_FINALIZADO
    );
  }, []);

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
            <TableHead className="w-[140px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Text
                    as="span"
                    className="size-8 rounded-full bg-background-100 flex items-center justify-center"
                  >
                    <UserIcon size={16} className="text-text-500" />
                  </Text>
                  <Text size="sm" className="text-text-950">
                    {student.name}
                  </Text>
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
                  <Text size="sm" className="text-primary-700 font-medium">
                    {student.completionPercentage}%
                  </Text>
                  <ProgressBar
                    value={student.completionPercentage}
                    size="small"
                    variant="blue"
                    className="w-full max-w-[100px]"
                  />
                </div>
              </TableCell>
              <TableCell>
                <Text size="sm" className="text-text-700">
                  {student.duration ?? '-'}
                </Text>
              </TableCell>
              <TableCell>
                {canViewPerformance(student) ? (
                  <Button
                    variant="outline"
                    size="extra-small"
                    onClick={() => onViewPerformance?.(student.id)}
                  >
                    {labels.viewPerformance}
                  </Button>
                ) : (
                  <Button variant="outline" size="extra-small" disabled>
                    {labels.viewPerformance}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentsTable;
