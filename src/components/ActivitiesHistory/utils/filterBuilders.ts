import { GenericApiStatus } from '../../../types/common';
import type {
  ActivityHistoryFilters,
  ActivityModelFilters,
} from '../../../types/activitiesHistory';
import type { TableParams } from '../../TableProvider/TableProvider';

/**
 * Check if param is a non-empty array
 * @param param - Parameter to check
 * @returns True if param is a non-empty array
 */
export const isNonEmptyArray = (param: unknown): param is string[] =>
  Array.isArray(param) && param.length > 0;

/**
 * Check if a value is a valid GenericApiStatus enum value
 * @param value - Value to validate
 * @returns True if value is a valid GenericApiStatus
 */
export const isValidApiStatus = (value: string): value is GenericApiStatus =>
  Object.values(GenericApiStatus).includes(value as GenericApiStatus);

/**
 * Build activity history filters from table params
 * @param params - Table parameters from TableProvider
 * @returns Activity history filters for API call
 */
export const buildHistoryFiltersFromParams = (
  params: TableParams
): ActivityHistoryFilters => {
  const filters: ActivityHistoryFilters = {
    page: params.page,
    limit: params.limit,
  };

  if (params.search) {
    filters.search = params.search;
  }

  // Status filter (single selection) - with runtime validation
  if (isNonEmptyArray(params.status) && isValidApiStatus(params.status[0])) {
    filters.status = params.status[0];
  }

  // School filter
  if (isNonEmptyArray(params.school)) {
    filters.schoolId = params.school[0];
  }

  // Subject filter
  if (isNonEmptyArray(params.subject)) {
    filters.subjectId = params.subject[0];
  }

  return filters;
};

/**
 * Build activity models filters from table params
 * @param params - Table parameters from TableProvider
 * @returns Activity model filters for API call
 */
export const buildModelsFiltersFromParams = (
  params: TableParams
): ActivityModelFilters => {
  const filters: ActivityModelFilters = {
    page: params.page,
    limit: params.limit,
  };

  if (params.search) {
    filters.search = params.search;
  }

  // Subject filter
  if (isNonEmptyArray(params.subject)) {
    filters.subjectId = params.subject[0];
  }

  return filters;
};
