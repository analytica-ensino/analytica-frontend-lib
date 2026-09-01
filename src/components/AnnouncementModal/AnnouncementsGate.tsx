import { useMemo } from 'react';
import AnnouncementModal from './AnnouncementModal';
import { createUseAnnouncements } from '../../hooks/useAnnouncements';
import type { AnnouncementsApiClient } from '../../types/announcements';

/**
 * Props for {@link AnnouncementsGate}
 */
export type AnnouncementsGateProps = {
  /** Authenticated API client of the host app */
  apiClient: AnnouncementsApiClient;
  /**
   * Id of the logged-in user. Scopes the "already seen" storage, so two people
   * sharing a browser do not hide each other's announcements. Pass null/undefined
   * while unauthenticated and nothing is fetched.
   */
  userId?: string | null;
};

/**
 * Drop-in announcements gate for the authenticated app shell.
 *
 * Mount it once inside the logged-in layout and it takes care of everything:
 * fetching the announcements for this user's institution and profile, skipping
 * the ones already dismissed (localStorage), and showing the rest one after
 * another until the queue is empty.
 *
 * Identical in the student, teacher and manager apps — the only difference is
 * the API client each one injects.
 *
 * @example
 * ```tsx
 * <AnnouncementsGate apiClient={api} userId={user?.id} />
 * ```
 */
const AnnouncementsGate = ({ apiClient, userId }: AnnouncementsGateProps) => {
  // The hook factory closes over the client, so it must not be recreated on
  // every render — that would reset the fetch guard and refetch in a loop.
  const useAnnouncements = useMemo(
    () => createUseAnnouncements(apiClient),
    [apiClient]
  );

  const { current, pending, dismissCurrent } = useAnnouncements(userId);

  if (!current) return null;

  return (
    <AnnouncementModal
      announcement={current}
      isOpen
      onClose={dismissCurrent}
      remainingCount={pending.length - 1}
    />
  );
};

export default AnnouncementsGate;
