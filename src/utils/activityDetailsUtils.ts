/**
 * Activity Details Utilities
 * Helper functions for activity details components
 */

import type {
  StudentActivityStatus,
  StatusBadgeConfig,
} from '../types/activityDetails';
import { STUDENT_ACTIVITY_STATUS } from '../types/activityDetails';

/**
 * Get status badge configuration
 * @param status - Student activity status
 * @returns Status badge configuration object
 */
export const getStatusBadgeConfig = (
  status: StudentActivityStatus
): StatusBadgeConfig => {
  const configs: Record<StudentActivityStatus, StatusBadgeConfig> = {
    [STUDENT_ACTIVITY_STATUS.CONCLUIDO]: {
      label: 'Concluído',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
    },
    [STUDENT_ACTIVITY_STATUS.AGUARDANDO_CORRECAO]: {
      label: 'Aguardando Correção',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
    },
    [STUDENT_ACTIVITY_STATUS.AGUARDANDO_RESPOSTA]: {
      label: 'Aguardando Resposta',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
    },
    [STUDENT_ACTIVITY_STATUS.NAO_ENTREGUE]: {
      label: 'Não Entregue',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
    },
  };

  return configs[status];
};

/**
 * Format time spent in seconds to HH:MM:SS
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export const formatTimeSpent = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Format question numbers to display
 * @param numbers - Array of question numbers (0-indexed)
 * @returns Formatted string of question numbers
 */
export const formatQuestionNumbers = (numbers: number[]): string => {
  if (numbers.length === 0) return '-';
  return numbers.map((n) => String(n + 1).padStart(2, '0')).join(', ');
};

/**
 * Format date string to Brazilian format (DD/MM/YYYY)
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDateToBrazilian = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};
