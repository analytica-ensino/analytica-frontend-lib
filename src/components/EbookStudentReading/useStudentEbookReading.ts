import { useCallback, useEffect, useState } from 'react';
import type { BaseApiClient } from '../../types/api';
import type { EbookStudentReading } from '../../types/ebookAttachment';

export interface UseStudentEbookReadingReturn {
  reading: EbookStudentReading | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
}

/**
 * One student's reading of one ebook
 * (`GET /ebooks/:id/students/:userInstitutionId/reading`): where they stopped
 * and each section with when they saw it. A change of book or student drops
 * what the previous one was still loading.
 *
 * @param apiClient - The host's API client
 * @param ebookId - The book
 * @param userInstitutionId - The student's enrollment
 * @returns The reading once loaded, and whether it failed
 */
export const useStudentEbookReading = (
  apiClient: BaseApiClient,
  ebookId: string,
  userInstitutionId: string
): UseStudentEbookReadingReturn => {
  const [reading, setReading] = useState<EbookStudentReading | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setReading(null);
    setError(false);
    let active = true;
    (async () => {
      try {
        const response = await apiClient.get<{ data: EbookStudentReading }>(
          `/ebooks/${ebookId}/students/${userInstitutionId}/reading`
        );
        if (active) setReading(response.data.data);
      } catch {
        if (active) setError(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [apiClient, ebookId, userInstitutionId, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { reading, loading: !reading && !error, error, retry };
};
