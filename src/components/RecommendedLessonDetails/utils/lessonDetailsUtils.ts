import type { GoalDetailStudent } from '../../../types/recommendedLessons';
import {
  deriveStudentStatus,
  formatDaysToComplete,
} from '../../../types/recommendedLessons';
import type { DisplayStudent } from '../types';

/**
 * Format date string to display format (DD/MM/YYYY)
 * @param dateString - ISO date string or null
 * @returns Formatted date string or placeholder
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Transform API student data to display format
 * @param student - Student data from API
 * @param deadline - Goal deadline to determine NAO_FINALIZADO status
 * @returns Transformed student for table display
 */
export const transformStudentForDisplay = (
  student: GoalDetailStudent,
  deadline?: string | null
): DisplayStudent => ({
  id: student.userInstitutionId,
  name: student.name,
  status: deriveStudentStatus(student.progress, student.completedAt, deadline),
  completionPercentage: student.progress,
  duration: formatDaysToComplete(student.daysToComplete),
});
