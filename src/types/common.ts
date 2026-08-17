/**
 * Common Type Definitions
 * Shared types used across multiple features (activities, recommendedClass, etc.)
 */

/**
 * Generic API status for activities and recommendedClass
 * Used by backend endpoints for status filtering
 */
export enum GenericApiStatus {
  A_VENCER = 'A_VENCER',
  VENCIDA = 'VENCIDA',
  CONCLUIDA = 'CONCLUIDA',
  /**
   * Prova com data de início no futuro. Chega aqui porque a atividade
   * presencial é uma prova, e prova tem esse estado a mais no backend.
   */
  AGENDADA = 'AGENDADA',
}

/**
 * Generic display status for UI components
 * Used for Badge and status display in tables
 */
export enum GenericDisplayStatus {
  ATIVA = 'ATIVA',
  VENCIDA = 'VENCIDA',
  CONCLUIDA = 'CONCLUÍDA',
  AGENDADA = 'AGENDADA',
}

/**
 * Badge action types for status visualization
 * Maps to Badge component action prop
 */
export enum BadgeActionType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
}

/**
 * Get badge action based on display status
 * @param status - Display status value
 * @returns Badge action type for styling
 */
export const getStatusBadgeAction = (
  status: GenericDisplayStatus
): BadgeActionType => {
  const actionMap: Record<GenericDisplayStatus, BadgeActionType> = {
    [GenericDisplayStatus.CONCLUIDA]: BadgeActionType.SUCCESS,
    [GenericDisplayStatus.ATIVA]: BadgeActionType.WARNING,
    [GenericDisplayStatus.VENCIDA]: BadgeActionType.ERROR,
    [GenericDisplayStatus.AGENDADA]: BadgeActionType.INFO,
  };
  return actionMap[status] ?? BadgeActionType.WARNING;
};

/**
 * Map API status to display status
 * @param apiStatus - Status from backend API
 * @returns Formatted status for UI display
 */
export const mapApiStatusToDisplay = (
  apiStatus: GenericApiStatus
): GenericDisplayStatus => {
  const statusMap: Record<GenericApiStatus, GenericDisplayStatus> = {
    [GenericApiStatus.A_VENCER]: GenericDisplayStatus.ATIVA,
    [GenericApiStatus.VENCIDA]: GenericDisplayStatus.VENCIDA,
    [GenericApiStatus.CONCLUIDA]: GenericDisplayStatus.CONCLUIDA,
    [GenericApiStatus.AGENDADA]: GenericDisplayStatus.AGENDADA,
  };
  // Um status que este mapa não conhece não pode virar badge vazio: a coluna
  // imprime o valor cru, então o rótulo sumiria da tela sem erro nenhum.
  return statusMap[apiStatus] ?? GenericDisplayStatus.ATIVA;
};

/**
 * Report period enum for time-based filters
 * Shared across map data, questions data, and students highlight
 */
export enum REPORT_PERIOD {
  SEVEN_DAYS = '7_DAYS',
  ONE_MONTH = '1_MONTH',
  THREE_MONTHS = '3_MONTHS',
  SIX_MONTHS = '6_MONTHS',
  ONE_YEAR = '1_YEAR',
}

/**
 * Variant selector shared by all report modals (PerformanceReportModal, AccessReportModal, etc.).
 * Drives which data shape and content layout to render.
 */
export enum REPORT_MODAL_VARIANT {
  STUDENT = 'student',
  PROFESSIONAL = 'professional',
}

/**
 * Score display type for simulated exams
 * - PERCENTAGE: 0-100 scale with % symbol
 * - TRI: 0-1000 scale (TRI - Teoria de Resposta ao Item)
 */
export enum ScoreType {
  PERCENTAGE = 'percentage',
  TRI = 'tri',
}
