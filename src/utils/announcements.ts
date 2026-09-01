import type { AnnouncementTextPart } from '../types/announcements';

/**
 * Prefix of the localStorage key holding the announcements a user has already
 * dismissed.
 *
 * "Seen" is deliberately client-side: with 200k+ users, writing a read receipt
 * per user per announcement would recreate exactly the per-recipient fan-out the
 * bucket design exists to avoid. The trade-off is accepted — a different browser
 * or device shows the announcement again.
 */
export const SEEN_ANNOUNCEMENTS_STORAGE_PREFIX = 'analytica:announcements:seen';

/**
 * Matches http(s) URLs inside a free-text message.
 *
 * Trailing punctuation is excluded so "veja https://x.com." does not produce a
 * link ending in a full stop.
 */
const URL_REGEX = /https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)]/g;

/**
 * Build the storage key for one user.
 *
 * @param userId - Id of the logged-in user
 * @returns The localStorage key holding that user's seen announcements
 */
function buildStorageKey(userId: string): string {
  return `${SEEN_ANNOUNCEMENTS_STORAGE_PREFIX}:${userId}`;
}

/**
 * Read the announcement ids a user has already dismissed.
 *
 * Every access is guarded: localStorage throws outright in some privacy modes,
 * and a corrupted value must degrade to "nothing seen" rather than break login.
 *
 * @param userId - Id of the logged-in user
 * @returns The dismissed announcement ids, or an empty list
 *
 * @example
 * ```typescript
 * getSeenAnnouncementIds('user-1'); // ['ann-1']
 * ```
 */
export function getSeenAnnouncementIds(userId: string): string[] {
  if (!userId) return [];

  try {
    const raw = globalThis.localStorage?.getItem(buildStorageKey(userId));
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

/**
 * Persist the full list of dismissed announcement ids for a user.
 *
 * @param userId - Id of the logged-in user
 * @param ids - Ids to persist
 */
function writeSeenAnnouncementIds(userId: string, ids: string[]): void {
  try {
    globalThis.localStorage?.setItem(
      buildStorageKey(userId),
      JSON.stringify(ids)
    );
  } catch {
    // Storage unavailable (private mode, quota, SSR): the announcement will be
    // shown again next login, which is far better than breaking the session.
  }
}

/**
 * Mark one announcement as seen by a user.
 *
 * @param userId - Id of the logged-in user
 * @param announcementId - Announcement the user dismissed
 *
 * @example
 * ```typescript
 * markAnnouncementSeen('user-1', 'ann-1');
 * ```
 */
export function markAnnouncementSeen(
  userId: string,
  announcementId: string
): void {
  if (!userId || !announcementId) return;

  const seen = getSeenAnnouncementIds(userId);
  if (seen.includes(announcementId)) return;

  writeSeenAnnouncementIds(userId, [...seen, announcementId]);
}

/**
 * Drop remembered ids that the server no longer returns.
 *
 * Without this the list would grow forever. Because the endpoint caps how many
 * announcements it returns, intersecting with the live ids keeps the stored
 * value naturally bounded — and an announcement that is deleted and never comes
 * back stops occupying space.
 *
 * @param userId - Id of the logged-in user
 * @param activeIds - Ids currently returned by the API
 *
 * @example
 * ```typescript
 * pruneSeenAnnouncementIds('user-1', ['ann-2']); // forgets 'ann-1'
 * ```
 */
export function pruneSeenAnnouncementIds(
  userId: string,
  activeIds: string[]
): void {
  if (!userId) return;

  const seen = getSeenAnnouncementIds(userId);
  const pruned = seen.filter((id) => activeIds.includes(id));

  if (pruned.length === seen.length) return;

  writeSeenAnnouncementIds(userId, pruned);
}

/**
 * Split an announcement message into plain-text and link segments.
 *
 * The backoffice writes hyperlinks inline in the message, so the modal has to
 * turn bare URLs into clickable anchors. Returning segments (instead of HTML)
 * keeps the rendering React-side, with no `dangerouslySetInnerHTML`.
 *
 * @param text - Raw announcement message
 * @returns Ordered segments, each flagged as link or plain text
 *
 * @example
 * ```typescript
 * splitTextWithLinks('Veja https://x.com hoje');
 * // [{ text: 'Veja ', isLink: false }, { text: 'https://x.com', isLink: true }, ...]
 * ```
 */
export function splitTextWithLinks(text: string): AnnouncementTextPart[] {
  if (!text) return [];

  const parts: AnnouncementTextPart[] = [];
  let lastIndex = 0;

  // The regex is global; reset it so repeated calls never resume mid-string.
  URL_REGEX.lastIndex = 0;

  let match = URL_REGEX.exec(text);
  while (match !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isLink: false });
    }

    parts.push({ text: match[0], isLink: true });
    lastIndex = match.index + match[0].length;

    match = URL_REGEX.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isLink: false });
  }

  return parts;
}
