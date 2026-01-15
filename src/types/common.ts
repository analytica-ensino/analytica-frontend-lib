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
}

/**
 * Generic display status for UI components
 * Used for Badge and status display in tables
 */
export enum GenericDisplayStatus {
  ATIVA = 'ATIVA',
  VENCIDA = 'VENCIDA',
  CONCLUIDA = 'CONCLUÍDA',
}

/**
 * Badge action types for status visualization
 * Maps to Badge component action prop
 */
export enum BadgeActionType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
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
  };
  return statusMap[apiStatus];
};
