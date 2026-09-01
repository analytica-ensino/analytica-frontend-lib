import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Text from '../Text/Text';
import {
  getYouTubeEmbedUrl,
  getYouTubeVideoId,
  isYouTubeUrl,
} from '../Modal/utils/videoUtils';
import { splitTextWithLinks } from '../../utils/announcements';
import type { Announcement } from '../../types/announcements';

/**
 * Default label for the call-to-action button when the backoffice left it blank.
 */
const DEFAULT_LINK_LABEL = 'Saiba mais';

/**
 * Props for {@link AnnouncementMessage}
 */
type AnnouncementMessageProps = {
  /** Raw message text, possibly containing bare URLs */
  text: string;
};

/**
 * Renders an announcement message with any bare URL turned into a link.
 *
 * Links open in a new tab with `noopener noreferrer`, so the announcement can
 * never reach back into the app through `window.opener`. Rendering React nodes
 * (rather than injecting HTML) keeps backoffice-authored text inert.
 *
 * @param text - Raw message text
 * @returns The message, with clickable links
 */
export const AnnouncementMessage = ({ text }: AnnouncementMessageProps) => {
  const parts = splitTextWithLinks(text);

  return (
    <Text
      size="sm"
      className="text-text-700 whitespace-pre-line break-words leading-6"
    >
      {parts.map((part, index) =>
        part.isLink ? (
          <a
            // Segments have no stable id of their own; the index is the position
            // in an immutable split of the same string.
            key={`${part.text}-${index}`}
            href={part.text}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-700 underline break-all hover:text-primary-800"
          >
            {part.text}
          </a>
        ) : (
          <span key={`${part.text}-${index}`}>{part.text}</span>
        )
      )}
    </Text>
  );
};

/**
 * Props for {@link AnnouncementModal}
 */
export type AnnouncementModalProps = {
  /** Announcement to display */
  announcement: Announcement;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when the user dismisses this announcement */
  onClose: () => void;
  /**
   * How many announcements are still queued behind this one. Drives the button
   * label ("Próxima" vs "Entendi") and the "1 de 3" counter.
   */
  remainingCount?: number;
};

/**
 * Modal that shows one global announcement right after login.
 *
 * Handles the three content combinations the backoffice can produce: a YouTube
 * video alone, a message alone, or both — plus an optional call-to-action link.
 * The video is embedded through the same `videoUtils` the rest of the lib uses,
 * so an unembeddable URL degrades to a link instead of a blank iframe.
 *
 * @example
 * ```tsx
 * <AnnouncementModal
 *   announcement={announcement}
 *   isOpen
 *   onClose={dismissCurrent}
 *   remainingCount={2}
 * />
 * ```
 */
const AnnouncementModal = ({
  announcement,
  isOpen,
  onClose,
  remainingCount = 0,
}: AnnouncementModalProps) => {
  if (!isOpen) return null;

  const { title, message, videoUrl, linkUrl, linkLabel } = announcement;

  const embeddableVideoId =
    videoUrl && isYouTubeUrl(videoUrl) ? getYouTubeVideoId(videoUrl) : null;

  const hasMoreAnnouncements = remainingCount > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          {hasMoreAnnouncements ? (
            <Text size="xs" className="text-text-500">
              {`Restam ${remainingCount}`}
            </Text>
          ) : (
            <span />
          )}
          <Button variant="solid" action="primary" onClick={onClose}>
            {hasMoreAnnouncements ? 'Próxima' : 'Entendi'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {embeddableVideoId && (
          <iframe
            src={getYouTubeEmbedUrl(embeddableVideoId)}
            className="w-full aspect-video rounded-lg"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={`Vídeo: ${title}`}
          />
        )}

        {/* A video URL the embed cannot handle still has to be reachable */}
        {videoUrl && !embeddableVideoId && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-700 underline break-all hover:text-primary-800"
          >
            Assistir ao vídeo
          </a>
        )}

        {message && <AnnouncementMessage text={message} />}

        {linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start rounded-md border border-primary-950 bg-primary-950 px-4 py-2 text-sm font-medium text-text hover:bg-primary-800 hover:border-primary-800"
          >
            {linkLabel || DEFAULT_LINK_LABEL}
          </a>
        )}
      </div>
    </Modal>
  );
};

export default AnnouncementModal;
