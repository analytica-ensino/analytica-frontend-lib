import { useEffect, useMemo } from 'react';
import {
  useQuizStore,
  DraftApiClient,
  DraftAnswerItem,
  SaveDraftPayload,
} from '../components/Quiz/useQuizStore';

/**
 * API client interface that the hook accepts
 * Compatible with axios-like clients
 */
export interface ApiClient {
  post: <T = unknown>(url: string, data?: unknown) => Promise<{ data: T }>;
  get: <T = unknown>(url: string) => Promise<{ data: T }>;
}

/**
 * Options for the useDraftAutoSave hook
 */
export interface UseDraftAutoSaveOptions {
  /** The API client (axios instance or similar) */
  apiClient: ApiClient;
  /** Whether draft auto-save is enabled (typically true for ATIVIDADE, false for SIMULADO) */
  enabled: boolean;
  /** Optional: custom endpoint pattern. Default: '/activities/{activityId}/draft' */
  endpoint?: string;
}

/**
 * Hook that sets up automatic draft saving for the quiz.
 *
 * Features:
 * - Saves draft when navigating between questions (Avançar/Voltar)
 * - Saves draft when page visibility changes (tab switch, minimize)
 * - Loads and applies existing drafts when quiz starts
 *
 * @example
 * ```tsx
 * // In your QuizWrapper component:
 * useDraftAutoSave({
 *   apiClient: api, // your axios instance
 *   enabled: quizType === QUIZ_TYPE.ATIVIDADE,
 * });
 * ```
 */
export function useDraftAutoSave({
  apiClient,
  enabled,
  endpoint = '/activities/{activityId}/draft',
}: UseDraftAutoSaveOptions): void {
  const { setDraftApiClient, saveDraft } = useQuizStore();

  // Create draft API client
  const draftApiClient: DraftApiClient = useMemo(
    () => ({
      saveDraft: async (activityId: string, payload: SaveDraftPayload) => {
        const url = endpoint.replace('{activityId}', activityId);
        await apiClient.post(url, payload);
        return { success: true };
      },
      loadDraft: async (activityId: string) => {
        const url = endpoint.replace('{activityId}', activityId);
        const response = await apiClient.get<{
          data?: { hasDraft: boolean; answers: DraftAnswerItem[] };
        }>(url);
        const data = response.data?.data;
        return data
          ? {
              hasDraft: data.hasDraft,
              answers: data.answers || [],
            }
          : null;
      },
    }),
    [apiClient, endpoint]
  );

  // Configure draft API client based on enabled state
  useEffect(() => {
    if (enabled) {
      setDraftApiClient(draftApiClient);
    } else {
      setDraftApiClient(null);
    }

    return () => {
      setDraftApiClient(null);
    };
  }, [enabled, draftApiClient, setDraftApiClient]);

  // Save draft when page visibility changes
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveDraft();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, saveDraft]);
}
