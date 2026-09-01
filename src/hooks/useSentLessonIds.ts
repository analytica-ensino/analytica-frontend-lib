import { useEffect, useRef, useState } from 'react';
import type { BaseApiClient } from '../types/api';

/**
 * Response shape of GET /recommended-class/my-sent-lesson-ids
 */
interface SentLessonIdsResponse {
  message: string;
  data: {
    lessonIds: string[];
  };
}

const SENT_LESSON_IDS_ENDPOINT = '/recommended-class/my-sent-lesson-ids';

/**
 * Loads the lessons the logged user has already sent to their students.
 *
 * Backs the "Já enviada" tag on the lesson bank. The set is fetched once on
 * mount and never refetched: it only changes when the user sends a recommended
 * class, which navigates away from the builder.
 *
 * Failures are swallowed on purpose — the tag is supplementary information, so
 * an unavailable endpoint must leave the lesson bank fully usable instead of
 * surfacing an error.
 *
 * @param apiClient - HTTP client used to reach the API
 * @returns Set with the IDs of the lessons already sent by the user
 */
export const useSentLessonIds = (apiClient: BaseApiClient): Set<string> => {
  const [sentLessonIds, setSentLessonIds] = useState<Set<string>>(
    () => new Set()
  );
  const apiClientRef = useRef(apiClient);
  apiClientRef.current = apiClient;

  useEffect(() => {
    let isActive = true;

    const fetchSentLessonIds = async () => {
      try {
        const response = await apiClientRef.current.get<SentLessonIdsResponse>(
          SENT_LESSON_IDS_ENDPOINT
        );

        if (!isActive) return;

        setSentLessonIds(new Set(response.data?.data?.lessonIds ?? []));
      } catch {
        // Supplementary data: the set is only ever populated on success, so
        // leaving it empty is enough to let the bank render without the tag.
      }
    };

    fetchSentLessonIds();

    return () => {
      isActive = false;
    };
  }, []);

  return sentLessonIds;
};
