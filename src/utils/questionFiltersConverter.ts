import type { ActivityFiltersData } from '../types/activityFilters';
import type { QuestionsFilterBody } from '../types/questions';
import { NO_SUBJECT_FILTER } from '../components/ActivityFilters/ActivityFilters';

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
  // Check if "Sem matéria" filter is selected
  const hasNoSubjectFilter = filters.subjectIds.includes(NO_SUBJECT_FILTER);
  const subjectIds = filters.subjectIds.filter(
    (id) => id !== NO_SUBJECT_FILTER
  );

  return {
    questionType: filters.types,
    questionBankYearId: filters.yearIds.map((yearId) => yearId.slice(0, 36)),
    subjectId: hasNoSubjectFilter ? undefined : subjectIds,
    topicId: hasNoSubjectFilter ? undefined : filters.topicIds,
    subtopicId: hasNoSubjectFilter ? undefined : filters.subtopicIds,
    contentId: hasNoSubjectFilter ? undefined : filters.contentIds,
    noSubject: hasNoSubjectFilter || undefined,
  };
};
