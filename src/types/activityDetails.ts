/**
 * Activity Details Types
 * Types and helper functions for activity details components
 */

/**
 * Student activity status enum
 */
export const STUDENT_ACTIVITY_STATUS = {
  CONCLUIDO: 'CONCLUIDO',
  AGUARDANDO_CORRECAO: 'AGUARDANDO_CORRECAO',
  AGUARDANDO_RESPOSTA: 'AGUARDANDO_RESPOSTA',
  NAO_ENTREGUE: 'NAO_ENTREGUE',
} as const;

export type StudentActivityStatus =
  (typeof STUDENT_ACTIVITY_STATUS)[keyof typeof STUDENT_ACTIVITY_STATUS];

/**
 * Student data interface
 */
export interface ActivityStudentData {
  studentId: string;
  studentName: string;
  answeredAt: string | null;
  timeSpent: number;
  score: number | null;
  status: StudentActivityStatus;
}

/**
 * Pagination interface
 */
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * General statistics interface
 */
export interface GeneralStats {
  averageScore: number;
  completionPercentage: number;
}

/**
 * Question statistics interface
 */
export interface QuestionStats {
  mostCorrect: number[];
  mostIncorrect: number[];
  notAnswered: number[];
}

/**
 * Activity metadata interface
 */
export interface ActivityMetadata {
  id: string;
  title: string;
  startDate: string | null;
  finalDate: string | null;
  schoolName: string;
  year: string;
  subjectName: string;
  className: string;
}

/**
 * Activity details data interface
 */
export interface ActivityDetailsData {
  activity: ActivityMetadata;
  students: ActivityStudentData[];
  pagination: Pagination;
  generalStats: GeneralStats;
  questionStats: QuestionStats;
}

/**
 * Activity details query params interface
 */
export interface ActivityDetailsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'score' | 'answeredAt';
  sortOrder?: 'asc' | 'desc';
  status?: StudentActivityStatus;
}

/**
 * Activity student table item interface
 */
export interface ActivityStudentTableItem extends Record<string, unknown> {
  id: string;
  studentId: string;
  studentName: string;
  status: StudentActivityStatus;
  answeredAt: string | null;
  timeSpent: number;
  score: number | null;
}

/**
 * Status badge configuration interface
 */
export interface StatusBadgeConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

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

/**
 * Activity availability status enum
 * Used to determine if an activity is available based on start/end dates
 */
export const ACTIVITY_AVAILABILITY = {
  DISPONIVEL: 'DISPONIVEL',
  NAO_INICIADA: 'NAO_INICIADA',
  EXPIRADA: 'EXPIRADA',
} as const;

export type ActivityAvailability =
  (typeof ACTIVITY_AVAILABILITY)[keyof typeof ACTIVITY_AVAILABILITY];
