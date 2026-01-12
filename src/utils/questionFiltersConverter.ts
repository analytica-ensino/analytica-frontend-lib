import type { ActivityFiltersData } from '../types/activityFilters';
import type { QuestionsFilterBody } from '../types/questions';

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
  return {
    questionType: filters.types,
    questionBankYearId: filters.yearIds.map((yearId) => yearId.slice(0, 36)),
    subjectId: filters.subjectIds,
    topicId: filters.topicIds,
    subtopicId: filters.subtopicIds,
    contentId: filters.contentIds,
  };
};
