/**
 * Activity Details Utilities
 * Helper functions for activity details components
 */

import dayjs from 'dayjs';
import type {
  StudentActivityStatus,
  StatusBadgeConfig,
} from '../types/activityDetails';
import { STUDENT_ACTIVITY_STATUS } from '../types/activityDetails';

/**
 * Get status badge configuration
 * @param status - Student activity status
 * @returns Status badge configuration with label and colors
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
    [STUDENT_ACTIVITY_STATUS.AWAITING_ANSWER_SHEET]: {
      label: 'Aguardando Gabarito',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-700',
    },
    [STUDENT_ACTIVITY_STATUS.ANSWER_SHEET_RECEIVED]: {
      label: 'Gabarito Recebido',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-800',
    },
  };

  return (
    configs[status] ?? {
      label: status,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
    }
  );
};

/**
 * Format time spent in seconds to HH:MM:SS
 * @param seconds - Time in seconds
 * @returns Formatted time string in HH:MM:SS format
 */
export const formatTimeSpent = (seconds: number): string => {
  const totalSeconds = Math.floor(Math.abs(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Format question numbers to display
 * @param numbers - Array of question numbers (1-indexed from API)
 * @returns Formatted string with question numbers (padded)
 */
export const formatQuestionNumbers = (numbers: number[]): string => {
  if (numbers.length === 0) return '-';

  return numbers.map((n) => String(n).padStart(2, '0')).join(', ');
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

/**
 * Format an ACTIVITY date (start/deadline) to Brazilian DD/MM/YYYY in LOCAL
 * time. Activity dates are stored in local-time terms — a deadline "ends on
 * day X" is persisted as 23:59 local (e.g. 02:59Z of day X+1). Formatting in
 * UTC (see formatDateToBrazilian) would show the day after for such values,
 * disagreeing with the calendar dots and the activities list. Use this for
 * activity start/final dates so all three stay on the same local day.
 *
 * NOTE: this is intentionally separate from formatDateToBrazilian, which is
 * also used for lesson dates stored as UTC midnight ('2024-01-01T00:00:00Z')
 * where the UTC day is the intended one.
 * @param dateString - ISO date string
 * @returns Formatted date string (DD/MM/YYYY) in local time
 */
export const formatActivityDateToBrazilian = (dateString: string): string => {
  return dayjs(dateString).format('DD/MM/YYYY');
};
