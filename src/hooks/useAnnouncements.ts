import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ActiveAnnouncementsResponse,
  Announcement,
  AnnouncementsApiClient,
} from '../types/announcements';
import {
  getSeenAnnouncementIds,
  markAnnouncementSeen,
  pruneSeenAnnouncementIds,
} from '../utils/announcements';

/**
 * Hook return type
 */
export interface UseAnnouncementsReturn {
  /** Announcements still unseen by this user, newest first */
  pending: Announcement[];
  /** The one currently on screen, or null when the queue is empty */
  current: Announcement | null;
  loading: boolean;
  /** Dismiss the current announcement and advance to the next one */
  dismissCurrent: () => void;
}

/**
 * Endpoint serving the announcements of the caller's institution + profile.
 */
const ACTIVE_ANNOUNCEMENTS_URL = '/announcements/active';

/**
 * Create the announcements hook bound to an app's API client.
 *
 * Mirrors `createUseNotifications`: each app injects its own authenticated
 * client, so the lib stays free of app-specific HTTP configuration.
 *
 * The hook fetches once per mount (i.e. once per login session in the app
 * shell), filters out what this user already dismissed — that state lives in
 * localStorage, never on the server — and hands the rest over as a queue.
 *
 * @param apiClient - Authenticated API client
 * @returns A hook taking the logged-in user id
 *
 * @example
 * ```typescript
 * const useAnnouncements = createUseAnnouncements(api);
 * const { current, dismissCurrent } = useAnnouncements(user?.id);
 * ```
 */
export const createUseAnnouncements = (apiClient: AnnouncementsApiClient) => {
  return (userId?: string | null): UseAnnouncementsReturn => {
    const [pending, setPending] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);

    /**
     * Guards against a second fetch for the same user — React 18 StrictMode
     * mounts effects twice in development, and this endpoint is hit by every
     * user on every login.
     */
    const fetchedForUserRef = useRef<string | null>(null);

    /**
     * Sequence of the latest request. Signing out and back in as someone else
     * fires a second fetch while the first is still in flight; without this the
     * slower response would win and hand the new user announcements scoped to
     * the previous user's institution and profile.
     */
    const requestIdRef = useRef(0);

    const fetchAnnouncements = useCallback(
      async (currentUserId: string) => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        // Drop the previous user's queue up front: signing in as someone else in
        // the same tab would otherwise flash their announcement until the new
        // response lands.
        setPending([]);
        setLoading(true);

        try {
          const response = await apiClient.get<ActiveAnnouncementsResponse>(
            ACTIVE_ANNOUNCEMENTS_URL
          );

          // A response that lost the race belongs to a user who is no longer
          // logged in — it must not touch the state or their stored ids.
          if (requestIdRef.current !== requestId) return;

          const announcements = response?.data?.data?.announcements ?? [];
          const activeIds = announcements.map(
            (announcement) => announcement.id
          );

          // Forget ids the server no longer returns, so the stored list cannot
          // grow without bound.
          pruneSeenAnnouncementIds(currentUserId, activeIds);

          const seen = getSeenAnnouncementIds(currentUserId);
          setPending(
            announcements.filter(
              (announcement) => !seen.includes(announcement.id)
            )
          );
        } catch {
          // A failed fetch must never block the app the user just logged into.
          if (requestIdRef.current === requestId) {
            setPending([]);
          }
        } finally {
          // `finally` runs even for the stale-response early return above, so
          // the loading flag has to be guarded too.
          if (requestIdRef.current === requestId) {
            setLoading(false);
          }
        }
      },
      [apiClient]
    );

    useEffect(() => {
      if (!userId) {
        fetchedForUserRef.current = null;
        setPending([]);
        return;
      }

      if (fetchedForUserRef.current === userId) return;

      fetchedForUserRef.current = userId;
      void fetchAnnouncements(userId);
    }, [userId, fetchAnnouncements]);

    const dismissCurrent = useCallback(() => {
      setPending((queue) => {
        const [head, ...rest] = queue;

        if (head && userId) {
          markAnnouncementSeen(userId, head.id);
        }

        return rest;
      });
    }, [userId]);

    return {
      pending,
      current: pending[0] ?? null,
      loading,
      dismissCurrent,
    };
  };
};
