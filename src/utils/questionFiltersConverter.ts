import type { ActivityFiltersData } from '../types/activityFilters';
import type { QuestionsFilterBody } from '../types/questions';
import { isAllSubjectsSelected } from './activityFilters';

/**
 * Converts ActivityFiltersData to QuestionsFilterBody format
 * Maps all filter fields from the activity filters format to the questions API format
 *
 * @param filters - ActivityFiltersData to convert
 * @returns QuestionsFilterBody compatible with the questions API
 */
export const convertActivityFiltersToQuestionsFilter = (
  filters: ActivityFiltersData
): QuestionsFilterBody => {
  // "Todas as matérias" searches across every accessible subject, expressed to
  // the backend as an empty subject filter.
  const subjectId = isAllSubjectsSelected(filters.subjectIds)
    ? []
    : filters.subjectIds;

  return {
    questionType: filters.types,
    questionBankYearId: filters.yearIds.map((yearId) => yearId.slice(0, 36)),
    subjectId,
    topicId: filters.topicIds,
    subtopicId: filters.subtopicIds,
    contentId: filters.contentIds,
  };
};
