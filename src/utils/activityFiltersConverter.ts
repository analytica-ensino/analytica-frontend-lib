import type { ActivityFiltersData } from '../types/activityFilters';
import type { QuestionsFilterBody } from '../types/questions';

/**
 * Extracts questionBankYearId from the combined ID format
 * The ID format is: {questionBankYearId}-{questionBankName}
 * UUID format: 8-4-4-4-12 (36 chars total)
 */
const extractQuestionBankYearId = (combinedId: string): string | null => {
  if (combinedId.length < 36) {
    return null;
  }
  const uuid = combinedId.substring(0, 36);
  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid) ? uuid : null;
};

/**
 * Converts ActivityFiltersData from the library format to QuestionsFilterBody for API
 * @param filters - Filters from ActivityFilters component
 * @param defaultPage - Default page number
 * @param defaultPageSize - Default page size per page
 * @returns QuestionsFilterBody formatted for API request
 */
export const convertActivityFiltersToQuestionsFilter = (
  filters: ActivityFiltersData | null,
  defaultPage: number = 1,
  defaultPageSize: number = 10
): QuestionsFilterBody => {
  if (!filters) {
    return {
      page: defaultPage,
      pageSize: defaultPageSize,
    };
  }

  const result: QuestionsFilterBody = {
    page: defaultPage,
    pageSize: defaultPageSize,
  };

  // Convert question types (ActivityFiltersData uses 'types' property)
  if (filters.types && filters.types.length > 0) {
    result.types = filters.types;
  }

  // Convert bank IDs
  if (filters.bankIds && filters.bankIds.length > 0) {
    result.bankIds = filters.bankIds;
  }

  // Convert bank year IDs - extract UUID from combined format
  // ActivityFiltersData uses 'yearIds' property (not 'bankYearIds')
  if (filters.yearIds && filters.yearIds.length > 0) {
    const extractedIds = filters.yearIds
      .map((id: string) => extractQuestionBankYearId(id))
      .filter((id): id is string => id !== null);
    if (extractedIds.length > 0) {
      result.yearIds = extractedIds;
    }
  }

  // Convert knowledge structure IDs
  // ActivityFiltersData has separate arrays for each level
  if (filters.knowledgeIds && filters.knowledgeIds.length > 0) {
    result.knowledgeIds = filters.knowledgeIds;
  }

  if (filters.topicIds && filters.topicIds.length > 0) {
    result.topicIds = filters.topicIds;
  }

  if (filters.subtopicIds && filters.subtopicIds.length > 0) {
    result.subtopicIds = filters.subtopicIds;
  }

  if (filters.contentIds && filters.contentIds.length > 0) {
    result.contentIds = filters.contentIds;
  }

  // Remove undefined fields and empty arrays to avoid sending empty values
  return Object.fromEntries(
    Object.entries(result).filter(([_, value]) => {
      if (value === undefined) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  ) as QuestionsFilterBody;
};



