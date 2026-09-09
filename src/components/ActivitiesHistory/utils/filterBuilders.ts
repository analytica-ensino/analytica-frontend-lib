import { GenericApiStatus } from '../../../types/common';
import type {
  ActivityHistoryFilters,
  ActivityModelFilters,
} from '../../../types/activitiesHistory';
import type { TableParams } from '../../TableProvider/TableProvider';

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

  // Multi-select filters are forwarded as the raw id lists the modal produced:
  // buildActivityHistoryBody renames them to the keys the endpoint reads.
  // Keeping only `params.x[0]` here is what made a two-subject selection answer
  // with one subject.
  if (Array.isArray(params.status) && params.status.length > 0) {
    filters.status = params.status.filter(isValidApiStatus);
  }

  if (Array.isArray(params.school) && params.school.length > 0) {
    filters.school = params.school;
  }

  // Subject filter. An activity matches when it covers any of the selected
  // subjects, so the whole selection travels — not just its first entry.
  if (Array.isArray(params.subject) && params.subject.length > 0) {
    filters.subject = params.subject;
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

  // Every selected subject goes out, comma-separated — the wire format
  // `/activity-drafts` parses.
  if (Array.isArray(params.subject) && params.subject.length > 0) {
    filters.subjectIds = params.subject.join(',');
  }

  return filters;
};
