import { useEffect, useState, type ReactNode } from 'react';
import {
  FileIcon,
  FilePdfIcon,
  FileVideoIcon,
  XIcon,
} from '@phosphor-icons/react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import {
  SUPPORT_CHAT_ATTACHMENT_RULES,
  SUPPORT_CHAT_MAX_ATTACHMENTS,
  type SupportChatAttachment,
} from '../../types/supportChat';

/** Value of the `accept` attribute of the file picker */
export const SUPPORT_CHAT_ACCEPT = Object.keys(
  SUPPORT_CHAT_ATTACHMENT_RULES
).join(',');

const isImage = (mimeType?: string) => Boolean(mimeType?.startsWith('image/'));
const isVideo = (mimeType?: string) => Boolean(mimeType?.startsWith('video/'));

const formatSize = (bytes: number) => `${Math.round(bytes / (1024 * 1024))} MB`;

/**
 * Keep the files the backend accepts (type, size and count) and say why the
 * others were left out.
 * @param current - Files already picked
 * @param picked - Files just chosen
 * @returns The accepted files and the last problem found, if any
 */
export const pickAttachments = (current: File[], picked: File[]) => {
  const accepted = [...current];
  let problem: string | null = null;
  for (const file of picked) {
    const maxBytes = SUPPORT_CHAT_ATTACHMENT_RULES[file.type];
    if (!maxBytes) {
      problem =
        'Envie imagens (JPG, PNG, GIF, WEBP), PDF ou vídeo (MP4, WEBM, MOV)';
    } else if (file.size > maxBytes) {
      problem = `${file.name} passa de ${formatSize(maxBytes)}`;
    } else if (accepted.length >= SUPPORT_CHAT_MAX_ATTACHMENTS) {
      problem = `Máximo de ${SUPPORT_CHAT_MAX_ATTACHMENTS} arquivos por mensagem`;
    } else {
      accepted.push(file);
    }
  }
  return { accepted, problem };
};

const FileTypeIcon = ({ mimeType }: { mimeType?: string }) => {
  if (mimeType === 'application/pdf') return <FilePdfIcon size={18} />;
  if (isVideo(mimeType)) return <FileVideoIcon size={18} />;
  return <FileIcon size={18} />;
};

/** Files of a message: images and videos inline, other files as links */
export const AttachmentList = ({
  items,
}: {
  items: SupportChatAttachment[];
}) => (
  <div className="flex flex-wrap gap-2 first:mt-0 mt-1">
    {items.map((item) => {
      if (isImage(item.mimeType)) {
        return (
          <a key={item.id} href={item.url} target="_blank" rel="noreferrer">
            <img
              src={item.url}
              alt={item.fileName}
              className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
            />
          </a>
        );
      }
      if (isVideo(item.mimeType)) {
        return (
          <video
            key={item.id}
            src={item.url}
            controls
            preload="metadata"
            aria-label={item.fileName}
            className="max-w-[240px] max-h-[200px] rounded-lg bg-black"
          />
        );
      }
      return (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 underline"
        >
          <FileTypeIcon mimeType={item.mimeType} />
          <Text as="span" size="sm" color="">
            {item.fileName}
          </Text>
        </a>
      );
    })}
  </div>
);

/** A file picked but not sent yet: thumbnail for images, name for the rest */
export const PendingAttachment = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) => {
  const image = isImage(file.type);
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!image) return undefined;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, image]);

  return (
    <div className="relative">
      {image ? (
        url && (
          <img
            src={url}
            alt={file.name}
            className="w-14 h-14 rounded-lg object-cover border border-border-100"
          />
        )
      ) : (
        <div className="flex h-14 max-w-[160px] items-center gap-1 rounded-lg border border-border-100 px-2 text-text-700">
          <FileTypeIcon mimeType={file.type} />
          <Text as="span" size="xs" className="truncate">
            {file.name}
          </Text>
        </div>
      )}
      <Button
        variant="raw"
        aria-label={`Remover ${file.name}`}
        onClick={onRemove}
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-text-700 text-white flex items-center justify-center"
      >
        <XIcon size={12} />
      </Button>
    </div>
  );
};

/** http(s) addresses inside a message */
const URL_PATTERN = /https?:\/\/[^\s<>"]+/g;

/** Punctuation that ends a sentence, not the address */
const TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;

/** A FAQ article page: `/artigo/<uuid>` */
const ARTICLE_PATH =
  /\/artigo\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

/**
 * Message text with its addresses as links. A link to a FAQ article opens in
 * the chat (when `onOpenArticle` is given); the others open a new tab.
 */
export const MessageText = ({
  text,
  onOpenArticle,
}: {
  text: string;
  onOpenArticle?: (articleId: string) => void;
}) => {
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const raw = match[0];
    const url = raw.replace(TRAILING_PUNCTUATION, '');
    const start = match.index ?? 0;
    if (start > cursor) parts.push(text.slice(cursor, start));

    const articleId = onOpenArticle ? ARTICLE_PATH.exec(url)?.[1] : undefined;
    parts.push(
      <a
        key={`${start}-${url}`}
        href={url}
        target="_blank"
        rel="noreferrer"
        className="underline break-all"
        onClick={
          articleId
            ? (event) => {
                event.preventDefault();
                onOpenArticle?.(articleId);
              }
            : undefined
        }
      >
        {url}
      </a>
    );
    cursor = start + url.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));

  return (
    <Text size="sm" color="" className="whitespace-pre-wrap">
      {parts}
    </Text>
  );
};
