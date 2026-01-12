import { useEffect, useRef } from 'react';

export interface InitialFiltersLoaderParams {
  initialFilters: {
    subjectIds?: string[];
    topicIds?: string[];
    subtopicIds?: string[];
  } | null;
  loadTopics?: (subjectIds: string[]) => void;
  loadSubtopics?: (topicIds: string[]) => void;
  loadContents?: (subtopicIds: string[]) => void;
}

/**
 * Hook to handle loading of topics, subtopics, and contents based on initialFilters
 * @param params - Parameters for the loader
 */
export const useInitialFiltersLoader = ({
  initialFilters,
  loadTopics,
  loadSubtopics,
  loadContents,
}: InitialFiltersLoaderParams) => {
  const hasRequestedTopicsRef = useRef(false);
  const hasRequestedSubtopicsRef = useRef(false);
  const hasRequestedContentsRef = useRef(false);

  useEffect(() => {
    if (!initialFilters) {
      return;
    }

    const subjectIds = initialFilters.subjectIds || [];
    const topicIds = initialFilters.topicIds || [];
    const subtopicIds = initialFilters.subtopicIds || [];

    if (subjectIds.length > 0 && !hasRequestedTopicsRef.current) {
      if (loadTopics) {
        loadTopics(subjectIds);
      }
      hasRequestedTopicsRef.current = true;
    }

    if (topicIds.length > 0 && !hasRequestedSubtopicsRef.current) {
      if (loadSubtopics) {
        loadSubtopics(topicIds);
      }
      hasRequestedSubtopicsRef.current = true;
    }

    if (subtopicIds.length > 0 && !hasRequestedContentsRef.current) {
      if (loadContents) {
        loadContents(subtopicIds);
      }
      hasRequestedContentsRef.current = true;
    }
  }, [initialFilters, loadTopics, loadSubtopics, loadContents]);

  // Reset refs when initialFilters changes
  useEffect(() => {
    hasRequestedTopicsRef.current = false;
    hasRequestedSubtopicsRef.current = false;
    hasRequestedContentsRef.current = false;
  }, [initialFilters]);

  return {
    hasRequestedTopicsRef,
    hasRequestedSubtopicsRef,
    hasRequestedContentsRef,
  };
};
