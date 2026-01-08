import type { TableParams } from '../../TableProvider/TableProvider';
import type { GoalModelFilters } from '../../../types/recommendedLessons';

/**
 * Check if param is a non-empty array
 * @param param - Parameter to check
 * @returns True if param is a non-empty string array
 */
const isNonEmptyArray = (param: unknown): param is string[] =>
  Array.isArray(param) && param.length > 0;

/**
 * Build goal models filters from table params
 * Converts TableProvider parameters to API filter format
 * @param params - Table parameters from TableProvider
 * @returns Goal model filters for API request
 */
export const buildGoalModelsFiltersFromParams = (
  params: TableParams
): GoalModelFilters => {
  const filters: GoalModelFilters = {
    page: params.page,
    limit: params.limit,
  };

  if (params.search) {
    filters.search = params.search;
  }

  // Subject filter (single selection)
  if (isNonEmptyArray(params.subject)) {
    filters.subjectId = params.subject[0];
  }

  return filters;
};
