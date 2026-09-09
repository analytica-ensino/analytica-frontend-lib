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

  // Subject filter: every selected id goes out. The category is multi-select,
  // so keeping only the first is what made a two-subject selection answer with
  // a single subject.
  if (Array.isArray(params.subject) && params.subject.length > 0) {
    filters.subjectIds = params.subject as string[];
  }

  return filters;
};
