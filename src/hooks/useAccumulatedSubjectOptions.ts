import { useEffect, useState } from 'react';
import type {
  ActivityFilterOption,
  ActivityModelTableItem,
} from '../types/activitiesHistory';
import { mergeFilterOptions } from '../utils/filterHelpers';

/**
 * Extract the unique subjects present in a page of rows.
 * @param data - Rows currently displayed in the table
 * @returns Deduplicated subject options
 */
const extractSubjectOptions = (
  data: ActivityModelTableItem[]
): ActivityFilterOption[] => {
  const subjects = new Map<string, ActivityFilterOption>();

  for (const item of data) {
    const name = item.subject?.name;
    if (
      item.subjectId &&
      name &&
      name !== '-' &&
      !subjects.has(item.subjectId)
    ) {
      subjects.set(item.subjectId, { id: item.subjectId, name });
    }
  }

  return Array.from(subjects.values());
};

/**
 * Accumulate the subject filter options discovered across fetches.
 *
 * Pages that derive their filter options from the rows they display would
 * otherwise offer a list that changes on every navigation — and collapses to a
 * single entry once a subject filter is applied, leaving no way to switch
 * subjects. Accumulating keeps the list growing only, the same approach
 * useActivitiesHistory takes for the history pages.
 *
 * The accumulated list lives for as long as the page stays mounted.
 *
 * @param data - Rows currently displayed in the table
 * @returns Every subject option seen so far, sorted by name
 */
export const useAccumulatedSubjectOptions = (
  data: ActivityModelTableItem[]
): ActivityFilterOption[] => {
  const [options, setOptions] = useState<ActivityFilterOption[]>([]);

  useEffect(() => {
    // mergeFilterOptions returns `prev` itself when nothing is new, so React
    // bails out of the re-render instead of looping.
    setOptions((prev) => mergeFilterOptions(prev, extractSubjectOptions(data)));
  }, [data]);

  return options;
};
