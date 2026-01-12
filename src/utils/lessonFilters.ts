import type { LessonFiltersData } from '../types/lessonFilters';
import { arraysEqual } from './arraysEqual';

/**
 * Compares two LessonFiltersData objects for equality (order-independent)
 * @param filters1 - First filters object
 * @param filters2 - Second filters object
 * @returns True if filters are equal
 */
export function areLessonFiltersEqual(
  filters1: LessonFiltersData | null,
  filters2: LessonFiltersData | null
): boolean {
  if (filters1 === filters2) return true;
  if (!filters1 || !filters2) return false;

  return (
    arraysEqual(filters1.subjectIds, filters2.subjectIds) &&
    arraysEqual(filters1.topicIds, filters2.topicIds) &&
    arraysEqual(filters1.subtopicIds, filters2.subtopicIds) &&
    arraysEqual(filters1.contentIds, filters2.contentIds)
  );
}
