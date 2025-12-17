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
    types: filters.types.length > 0 ? filters.types : undefined,
    bankIds: filters.bankIds.length > 0 ? filters.bankIds : undefined,
    yearIds: filters.yearIds.length > 0 ? filters.yearIds : undefined,
    knowledgeIds:
      filters.knowledgeIds.length > 0 ? filters.knowledgeIds : undefined,
    topicIds: filters.topicIds.length > 0 ? filters.topicIds : undefined,
    subtopicIds:
      filters.subtopicIds.length > 0 ? filters.subtopicIds : undefined,
    contentIds: filters.contentIds.length > 0 ? filters.contentIds : undefined,
  };
};
