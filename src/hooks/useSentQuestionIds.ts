import { useEffect, useRef, useState } from 'react';
import type { BaseApiClient } from '../types/api';

/**
 * Response shape of GET /activities/my-sent-question-ids
 */
interface SentQuestionIdsResponse {
  message: string;
  data: {
    questionIds: string[];
  };
}

const SENT_QUESTION_IDS_ENDPOINT = '/activities/my-sent-question-ids';

/**
 * Loads the questions the logged user has already sent to their students.
 *
 * Backs the "Já enviada" tag on the question bank. The set is fetched once on
 * mount and never refetched: it only changes when the user sends an activity,
 * which navigates away from the builder.
 *
 * Failures are swallowed on purpose — the tag is supplementary information, so
 * an unavailable endpoint must leave the question bank fully usable instead of
 * surfacing an error.
 *
 * @param apiClient - HTTP client used to reach the API
 * @returns Set with the IDs of the questions already sent by the user
 */
export const useSentQuestionIds = (apiClient: BaseApiClient): Set<string> => {
  const [sentQuestionIds, setSentQuestionIds] = useState<Set<string>>(
    () => new Set()
  );
  // Pinned at mount and deliberately never refreshed: the effect below runs
  // once, so a later client would never be read anyway — and reassigning during
  // render would let a discarded render leak an uncommitted client into the ref.
  const apiClientRef = useRef(apiClient);

  useEffect(() => {
    let isActive = true;

    const fetchSentQuestionIds = async () => {
      try {
        const response =
          await apiClientRef.current.get<SentQuestionIdsResponse>(
            SENT_QUESTION_IDS_ENDPOINT
          );

        if (!isActive) return;

        setSentQuestionIds(new Set(response.data?.data?.questionIds ?? []));
      } catch {
        // Supplementary data: the set is only ever populated on success, so
        // leaving it empty is enough to let the bank render without the tag.
      }
    };

    fetchSentQuestionIds();

    return () => {
      isActive = false;
    };
  }, []);

  return sentQuestionIds;
};
