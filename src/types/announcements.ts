import type { BaseApiClient } from './api';

/**
 * A global announcement created by a SUPER_ADMIN in the backoffice and shown as
 * a modal right after login.
 *
 * Distinct from `Notification` (the bell icon): announcements are not per-user
 * rows, they are a single record targeting an institution + profile audience,
 * and "already seen" lives in the client, not on the server.
 */
export interface Announcement {
  id: string;
  title: string;
  /** Body text. Null when the announcement is only a video. */
  message: string | null;
  /** YouTube URL to embed. Null when the announcement is text only. */
  videoUrl: string | null;
  /** Optional call-to-action link, always opened in a new tab. */
  linkUrl: string | null;
  /** Label for the call-to-action button. Falls back to a default when absent. */
  linkLabel: string | null;
  createdAt: string | null;
}

/**
 * Response shape of `GET /announcements/active`.
 */
export interface ActiveAnnouncementsResponse {
  message: string;
  data: {
    announcements: Announcement[];
  };
}

/**
 * The only HTTP verb the announcements feature needs.
 */
export type AnnouncementsApiClient = Pick<BaseApiClient, 'get'>;

/**
 * One segment of an announcement message: either plain text or a URL that must
 * render as a clickable link.
 */
export interface AnnouncementTextPart {
  text: string;
  isLink: boolean;
}
