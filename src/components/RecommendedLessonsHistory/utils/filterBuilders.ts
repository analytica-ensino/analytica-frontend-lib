import type { TableParams } from '../../TableProvider/TableProvider';
import type { RecommendedClassModelFilters } from '../../../types/recommendedLessons';

/**
 * Build recommendedClass models filters from table params
 * Converts TableProvider parameters to API filter format
 * @param params - Table parameters from TableProvider
 * @returns RecommendedClass model filters for API request
 */
export const buildRecommendedClassModelsFiltersFromParams = (
  params: TableParams
): RecommendedClassModelFilters => {
  const filters: RecommendedClassModelFilters = {
    page: params.page,
    limit: params.limit,
  };

  if (params.search) {
    filters.search = params.search;
  }

  // Subject filter (single selection)
  if (Array.isArray(params.subject) && params.subject.length > 0) {
    filters.subjectId = params.subject[0];
  }

  return filters;
};
