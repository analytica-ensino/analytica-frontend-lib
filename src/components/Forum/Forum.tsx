import { useState, useEffect, useCallback } from 'react';
import {
  CaretLeftIcon,
  ChatCircleTextIcon,
  CheckIcon,
  DotsThreeVerticalIcon,
  ImageIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Input from '../Input/Input';
import TextArea from '../TextArea/TextArea';
import Modal from '../Modal/Modal';
import Radio from '../Radio/Radio';
import DropdownMenu, {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../DropdownMenu/DropdownMenu';
import { RichEditor } from '../RichEditor/RichEditor';
import ImageUpload from '../ImageUpload/ImageUpload';
import { SkeletonList, SkeletonCard } from '../Skeleton/Skeleton';
import { stripHtml, sanitizeHtmlForDisplay } from '../HtmlMathRenderer';
import { cn } from '../../utils/utils';
import type { ForumApiClient, ForumTopic, ForumReply } from '../../types/forum';
import { PROFILE_ROLES } from '../../types/chat';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function formatForumDate(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getDate();
  const month = MONTHS_PT[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} • ${hours}:${minutes}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

function formatReplyCount(count: number): string {
  if (count === 1) return '1 resposta';
  return `${count} respostas`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface AuthorAvatarProps {
  readonly name: string;
  readonly photoUrl: string | null;
}

function AuthorAvatar({ name, photoUrl }: AuthorAvatarProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
      <Text size="xs" weight="semibold" color="text-white">
        {getInitials(name)}
      </Text>
    </div>
  );
}

interface AuthorMetaProps {
  readonly authorName: string;
  readonly authorPhoto: string | null;
  readonly createdAt: string;
}

function AuthorMeta({ authorName, authorPhoto, createdAt }: AuthorMetaProps) {
  return (
    <div className="flex items-center gap-2">
      <AuthorAvatar name={authorName} photoUrl={authorPhoto} />
      <div className="flex items-center gap-1">
        <Text size="xs" weight="semibold" color="text-primary-700">
          Postado por {authorName}
        </Text>
        <Text size="xs" color="text-text-600">
          • {formatForumDate(createdAt)}
        </Text>
      </div>
    </div>
  );
}

interface PostActionsMenuProps {
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

function PostActionsMenu({ onEdit, onDelete }: PostActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Abrir ações do post"
        className="p-1 rounded hover:bg-background-100 transition-colors shrink-0"
      >
        <DotsThreeVerticalIcon size={20} className="text-text-600" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          iconLeft={<PencilSimpleIcon size={16} />}
          onClick={onEdit}
        >
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem iconLeft={<TrashIcon size={16} />} onClick={onDelete}>
          Deletar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface PostContentModalProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly submitLabel: string;
  readonly content: string;
  readonly imageUrl: string | undefined;
  readonly isSubmitting: boolean;
  readonly onContentChange: (value: string) => void;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly onUploadImage?: (file: File) => Promise<string>;
  readonly onImageUploaded: (url: string) => void;
  readonly maxLength: number;
  /** Use RichEditor with toolbar instead of plain TextArea */
  readonly richText?: boolean;
  /** Show "Este fórum vale nota no boletim?" question (professor only) */
  readonly showGradeQuestion?: boolean;
  readonly countsForGrade?: boolean;
  readonly onCountsForGradeChange?: (value: boolean) => void;
}

function PostContentModal({
  isOpen,
  title,
  submitLabel,
  content,
  imageUrl,
  isSubmitting,
  onContentChange,
  onClose,
  onSubmit,
  onUploadImage,
  onImageUploaded,
  maxLength,
  richText = false,
  showGradeQuestion = false,
  countsForGrade,
  onCountsForGradeChange,
}: PostContentModalProps) {
  const handleImageSelect = useCallback(
    async (file: File) => {
      if (!onUploadImage) return;
      try {
        const url = await onUploadImage(file);
        onImageUploaded(url);
      } catch {
        // silently fail — consuming app should handle upload errors
      }
    },
    [onUploadImage, onImageUploaded]
  );

  // Determine if content is effectively empty or exceeds the limit
  const plainTextContent = richText ? stripHtml(content) : content;
  const isContentEmpty = !plainTextContent.trim();
  const exceedsMaxLength = plainTextContent.trim().length > maxLength;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            action="secondary"
            size="medium"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            action="primary"
            size="medium"
            disabled={isContentEmpty || exceedsMaxLength || isSubmitting}
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {richText ? (
          // key forces remount (and thus reset) whenever the modal opens/closes
          <RichEditor
            key={String(isOpen)}
            content={content}
            onChange={(data) => onContentChange(data.html)}
            placeholder="Escreva o conteúdo do seu post aqui."
          />
        ) : (
          <TextArea
            placeholder="Escreva o conteúdo do seu post aqui."
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            autoResize
            minHeight={120}
            maxLength={maxLength}
          />
        )}

        <ImageUpload
          variant="compact"
          onFileSelect={handleImageSelect}
          onRemoveFile={() => onImageUploaded('')}
          buttonIcon={<ImageIcon size={16} />}
        />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Preview da imagem"
            className="max-h-40 rounded-lg object-contain"
          />
        )}

        {showGradeQuestion && (
          <div className="flex flex-col gap-2">
            <Text size="sm" weight="medium">
              Este fórum vale nota no boletim?
            </Text>
            <div className="flex items-center gap-4">
              <Radio
                name="countsForGrade"
                value="yes"
                label="Sim"
                size="small"
                checked={countsForGrade === true}
                onChange={() => onCountsForGradeChange?.(true)}
              />
              <Radio
                name="countsForGrade"
                value="no"
                label="Não"
                size="small"
                checked={countsForGrade === false}
                onChange={() => onCountsForGradeChange?.(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function TopicListSkeleton() {
  return (
    <SkeletonList
      items={3}
      showAvatar
      showTitle
      showDescription
      lines={2}
    />
  );
}

function TopicDetailSkeleton() {
  return (
    <SkeletonCard
      showAvatar
      showTitle
      showDescription
      showActions={false}
      lines={2}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export type ForumProps = {
  /** API client with forum CRUD methods */
  readonly apiClient: ForumApiClient;
  /** Current user's userInstitutionId — used to identify own posts */
  readonly currentUserId: string;
  /** User role — enables professor-specific features (e.g. grade question on create) */
  readonly userRole?: PROFILE_ROLES.STUDENT | PROFILE_ROLES.TEACHER;
  /** Forum page title */
  readonly title?: string;
  /** Forum page subtitle */
  readonly subtitle?: string;
  /** Callback to upload an image file and return its hosted URL */
  readonly onUploadImage?: (file: File) => Promise<string>;
  /**
   * Callback to evaluate a reply (teacher only).
   * If provided, an "Avaliar" button appears on each reply when the topic counts for grade.
   */
  readonly onEvaluateReply?: (replyId: string, grade: number) => Promise<void>;
  /** Additional CSS classes */
  readonly className?: string;
};

export function Forum({
  apiClient,
  currentUserId,
  userRole = PROFILE_ROLES.STUDENT,
  title = 'Fórum',
  subtitle = 'Espaço para troca de conhecimento',
  onUploadImage,
  onEvaluateReply,
  className,
}: ForumProps) {
  const isTeacher = userRole === PROFILE_ROLES.TEACHER;
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create post modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createContent, setCreateContent] = useState('');
  const [createImageUrl, setCreateImageUrl] = useState<string | undefined>();
  const [createCountsForGrade, setCreateCountsForGrade] = useState<
    boolean | undefined
  >();

  // Reply modal state
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyImageUrl, setReplyImageUrl] = useState<string | undefined>();

  // Edit topic modal state
  const [editingTopic, setEditingTopic] = useState<ForumTopic | null>(null);
  const [editTopicContent, setEditTopicContent] = useState('');
  const [editTopicImageUrl, setEditTopicImageUrl] = useState<
    string | undefined
  >();

  // Edit reply modal state
  const [editingReply, setEditingReply] = useState<ForumReply | null>(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const [editReplyImageUrl, setEditReplyImageUrl] = useState<
    string | undefined
  >();

  // Evaluate reply modal state (teacher only)
  const [evaluatingReplyId, setEvaluatingReplyId] = useState<string | null>(
    null
  );
  const [gradeValue, setGradeValue] = useState<number | null>(null);
  const [isEditingGrade, setIsEditingGrade] = useState(false);

  // Delete confirmation state
  const [pendingDelete, setPendingDelete] = useState<
    { type: 'topic'; id: string } | { type: 'reply'; id: string } | null
  >(null);

  const fetchTopics = useCallback(async () => {
    setIsLoadingTopics(true);
    try {
      const response = await apiClient.getTopics({ limit: 50 });
      setTopics(response.topics);
    } finally {
      setIsLoadingTopics(false);
    }
  }, [apiClient]);

  const fetchTopic = useCallback(
    async (topicId: string) => {
      setIsLoadingTopic(true);
      try {
        const response = await apiClient.getTopic(topicId);
        setSelectedTopic(response.topic);
        setReplies(response.replies);
      } finally {
        setIsLoadingTopic(false);
      }
    },
    [apiClient]
  );

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleTopicClick = useCallback(
    (topic: ForumTopic) => {
      setSelectedTopic(topic);
      setView('detail');
      fetchTopic(topic.id);
    },
    [fetchTopic]
  );

  const handleBack = useCallback(() => {
    setView('list');
    setSelectedTopic(null);
    setReplies([]);
    fetchTopics();
  }, [fetchTopics]);

  // Create topic
  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setCreateContent('');
    setCreateImageUrl(undefined);
    setCreateCountsForGrade(undefined);
  }, []);

  const handleCreateTopic = useCallback(async () => {
    if (!createContent.trim()) return;
    setIsSubmitting(true);
    try {
      await apiClient.createTopic({
        content: createContent.trim(),
        ...(createImageUrl && { imageUrl: createImageUrl }),
        ...(isTeacher &&
          createCountsForGrade !== undefined && {
            countsForGrade: createCountsForGrade,
          }),
      });
      handleCloseCreateModal();
      await fetchTopics();
    } finally {
      setIsSubmitting(false);
    }
  }, [
    apiClient,
    createContent,
    createImageUrl,
    createCountsForGrade,
    isTeacher,
    handleCloseCreateModal,
    fetchTopics,
  ]);

  // Edit topic
  const handleOpenEditTopic = useCallback((topic: ForumTopic) => {
    setEditingTopic(topic);
    setEditTopicContent(topic.content);
    setEditTopicImageUrl(topic.imageUrl ?? undefined);
  }, []);

  const handleCloseEditTopic = useCallback(() => {
    setEditingTopic(null);
    setEditTopicContent('');
    setEditTopicImageUrl(undefined);
  }, []);

  const handleEditTopic = useCallback(async () => {
    if (!editingTopic || !editTopicContent.trim()) return;
    setIsSubmitting(true);
    try {
      await apiClient.updateTopic(editingTopic.id, {
        content: editTopicContent.trim(),
        imageUrl: editTopicImageUrl ?? null,
      });
      handleCloseEditTopic();
      if (view === 'list') {
        await fetchTopics();
      } else {
        await fetchTopic(editingTopic.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    apiClient,
    editingTopic,
    editTopicContent,
    editTopicImageUrl,
    handleCloseEditTopic,
    view,
    fetchTopics,
    fetchTopic,
  ]);

  const handleDeleteTopic = useCallback(
    async (topicId: string) => {
      setIsSubmitting(true);
      try {
        await apiClient.deleteTopic(topicId);
        if (view === 'detail') {
          handleBack();
        } else {
          await fetchTopics();
        }
      } finally {
        setIsSubmitting(false);
        setPendingDelete(null);
      }
    },
    [apiClient, view, handleBack, fetchTopics]
  );

  // Reply
  const handleCloseReplyModal = useCallback(() => {
    setIsReplyModalOpen(false);
    setReplyContent('');
    setReplyImageUrl(undefined);
  }, []);

  const handleCreateReply = useCallback(async () => {
    if (!selectedTopic || !replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await apiClient.createReply(selectedTopic.id, {
        content: replyContent.trim(),
        ...(replyImageUrl && { imageUrl: replyImageUrl }),
      });
      handleCloseReplyModal();
      await fetchTopic(selectedTopic.id);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    apiClient,
    selectedTopic,
    replyContent,
    replyImageUrl,
    handleCloseReplyModal,
    fetchTopic,
  ]);

  // Edit reply
  const handleOpenEditReply = useCallback((reply: ForumReply) => {
    setEditingReply(reply);
    setEditReplyContent(reply.content);
    setEditReplyImageUrl(reply.imageUrl ?? undefined);
  }, []);

  const handleCloseEditReply = useCallback(() => {
    setEditingReply(null);
    setEditReplyContent('');
    setEditReplyImageUrl(undefined);
  }, []);

  const handleEditReply = useCallback(async () => {
    if (!editingReply || !editReplyContent.trim() || !selectedTopic) return;
    setIsSubmitting(true);
    try {
      await apiClient.updateReply(editingReply.id, {
        content: editReplyContent.trim(),
        imageUrl: editReplyImageUrl ?? null,
      });
      handleCloseEditReply();
      await fetchTopic(selectedTopic.id);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    apiClient,
    editingReply,
    editReplyContent,
    editReplyImageUrl,
    handleCloseEditReply,
    selectedTopic,
    fetchTopic,
  ]);

  const handleDeleteReply = useCallback(
    async (replyId: string) => {
      if (!selectedTopic) return;
      setIsSubmitting(true);
      try {
        await apiClient.deleteReply(replyId);
        await fetchTopic(selectedTopic.id);
      } finally {
        setIsSubmitting(false);
        setPendingDelete(null);
      }
    },
    [apiClient, selectedTopic, fetchTopic]
  );

  const handleCloseEvaluateModal = useCallback(() => {
    setEvaluatingReplyId(null);
    setGradeValue(null);
    setIsEditingGrade(false);
  }, []);

  const handleOpenEvaluate = useCallback((reply: ForumReply) => {
    setEvaluatingReplyId(reply.id);
    setGradeValue(null);
    setIsEditingGrade(false);
  }, []);

  const handleOpenEditGrade = useCallback((reply: ForumReply) => {
    setEvaluatingReplyId(reply.id);
    setGradeValue(reply.grade ?? null);
    setIsEditingGrade(true);
  }, []);

  const isValidGrade =
    gradeValue !== null &&
    Number.isInteger(gradeValue) &&
    gradeValue >= 0 &&
    gradeValue <= 10;

  const handleSubmitEvaluation = useCallback(async () => {
    if (!evaluatingReplyId || !isValidGrade || !onEvaluateReply) return;
    setIsSubmitting(true);
    try {
      await onEvaluateReply(evaluatingReplyId, gradeValue);
      // Optimistically update grade in local state
      setReplies((prev) =>
        prev.map((r) =>
          r.id === evaluatingReplyId ? { ...r, grade: gradeValue } : r
        )
      );
      handleCloseEvaluateModal();
    } finally {
      setIsSubmitting(false);
    }
  }, [
    evaluatingReplyId,
    gradeValue,
    isValidGrade,
    onEvaluateReply,
    handleCloseEvaluateModal,
  ]);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'topic') {
      await handleDeleteTopic(pendingDelete.id);
    } else {
      await handleDeleteReply(pendingDelete.id);
    }
  }, [pendingDelete, handleDeleteTopic, handleDeleteReply]);

  /* ---- Extracted render blocks (avoids nested ternaries — SonarQube) ---- */

  const topicListContent = (() => {
    if (isLoadingTopics) return <TopicListSkeleton />;

    if (topics.length === 0) {
      return (
        <div className="flex items-center justify-center py-16 border border-border-200 rounded-lg">
          <Text size="md" color="text-text-500">
            Nenhum tópico ainda. Seja o primeiro a criar um post!
          </Text>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex items-start bg-white border border-border-100 rounded-lg pt-4 pr-2 pb-4 pl-2 shadow-sm"
          >
            {/* Clickable content area */}
            <button
              type="button"
              className="flex flex-col gap-3 flex-1 min-w-0 text-left hover:opacity-90 transition-opacity"
              onClick={() => handleTopicClick(topic)}
            >
              <AuthorMeta
                authorName={topic.authorName}
                authorPhoto={topic.authorPhoto}
                createdAt={topic.createdAt}
              />
              <Text size="sm" className="leading-normal line-clamp-3 ml-10">
                {stripHtml(topic.content)}
              </Text>
              <div className="flex items-center gap-1 text-text-600 ml-10">
                <ChatCircleTextIcon size={16} />
                <Text size="xs">
                  {formatReplyCount(topic.replyCount)}
                </Text>
              </div>
            </button>

            {/* Actions menu — only for own posts */}
            {topic.userInstitutionId === currentUserId && (
              <PostActionsMenu
                onEdit={() => handleOpenEditTopic(topic)}
                onDelete={() =>
                  setPendingDelete({ type: 'topic', id: topic.id })
                }
              />
            )}
          </div>
        ))}
      </div>
    );
  })();

  const topicDetailContent = (() => {
    if (isLoadingTopic) return <TopicDetailSkeleton />;

    if (!selectedTopic) return null;

    return (
      <>
        {/* Original post */}
        <div className="flex items-start gap-2">
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <AuthorMeta
              authorName={selectedTopic.authorName}
              authorPhoto={selectedTopic.authorPhoto}
              createdAt={selectedTopic.createdAt}
            />
            <div
              className="text-sm text-text-950 leading-normal ml-10 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtmlForDisplay(selectedTopic.content),
              }}
            />
            {selectedTopic.imageUrl && (
              <img
                src={selectedTopic.imageUrl}
                alt="Imagem do post"
                className="ml-10 max-w-lg rounded-lg"
              />
            )}
          </div>
          {selectedTopic.userInstitutionId === currentUserId && (
            <PostActionsMenu
              onEdit={() => handleOpenEditTopic(selectedTopic)}
              onDelete={() =>
                setPendingDelete({ type: 'topic', id: selectedTopic.id })
              }
            />
          )}
        </div>

        {/* Replies header */}
        <div className="flex items-center justify-between">
          <Text size="sm" color="text-text-600">
            {formatReplyCount(selectedTopic.replyCount)}
          </Text>
          <Button
            variant="solid"
            action="primary"
            size="medium"
            onClick={() => setIsReplyModalOpen(true)}
          >
            Responder
          </Button>
        </div>

        {/* Replies list */}
        {replies.length > 0 && (
          <div className="flex flex-col divide-y divide-border-200">
            {replies.map((reply) => (
              <div key={reply.id} className="flex items-start gap-2 py-4">
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                  <AuthorMeta
                    authorName={reply.authorName}
                    authorPhoto={reply.authorPhoto}
                    createdAt={reply.createdAt}
                  />
                  <div
                    className="text-sm text-text-950 leading-normal ml-10 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtmlForDisplay(reply.content),
                    }}
                  />
                  {reply.imageUrl && (
                    <img
                      src={reply.imageUrl}
                      alt="Imagem da resposta"
                      className="ml-10 max-w-lg rounded-lg"
                    />
                  )}
                  {isTeacher &&
                    selectedTopic?.countsForGrade &&
                    onEvaluateReply &&
                    (reply.grade == null ? (
                      /* Not yet graded — show Avaliar button */
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-text-600 text-sm hover:text-text-950 transition-colors w-fit ml-10"
                        onClick={() => handleOpenEvaluate(reply)}
                      >
                        <CheckIcon size={16} />
                        Avaliar
                      </button>
                    ) : (
                      /* Grade already set — teacher sees it with edit pencil */
                      <div className="flex items-center gap-1.5 ml-10">
                        <Text size="sm" color="text-text-600">
                          Nota {reply.grade}
                        </Text>
                        <button
                          type="button"
                          className="text-text-600 hover:text-text-950 transition-colors"
                          onClick={() => handleOpenEditGrade(reply)}
                        >
                          <PencilSimpleIcon size={14} />
                        </button>
                      </div>
                    ))}
                  {!isTeacher &&
                    reply.grade != null &&
                    reply.userInstitutionId === currentUserId &&
                    selectedTopic?.countsForGrade && (
                      <Text size="sm" color="text-text-600" className="ml-10">
                        Nota {reply.grade}
                      </Text>
                    )}
                </div>
                {reply.userInstitutionId === currentUserId && (
                  <PostActionsMenu
                    onEdit={() => handleOpenEditReply(reply)}
                    onDelete={() =>
                      setPendingDelete({ type: 'reply', id: reply.id })
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </>
    );
  })();

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {view === 'list' ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <Text as="h1" size="2xl" weight="bold" color="text-text-950">
              {title}
            </Text>
            <Button
              variant="solid"
              action="primary"
              size="medium"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Criar post
            </Button>
          </div>

          {/* Subtitle + topic list */}
          <div className="flex flex-col gap-3">
            <Text as="h2" size="lg" weight="semibold" color="text-text-950">
              {subtitle}
            </Text>

            {topicListContent}
          </div>
        </>
      ) : (
        /* Detail view */
        <>
          <button
            type="button"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
            onClick={handleBack}
          >
            <CaretLeftIcon size={24} className="text-text-950" />
            <Text size="2xl" weight="bold">
              Voltar
            </Text>
          </button>

          {topicDetailContent}
        </>
      )}

      {/* Create post modal */}
      <PostContentModal
        isOpen={isCreateModalOpen}
        title="Criar post"
        submitLabel="Criar post"
        content={createContent}
        imageUrl={createImageUrl}
        isSubmitting={isSubmitting}
        onContentChange={setCreateContent}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateTopic}
        onUploadImage={onUploadImage}
        onImageUploaded={setCreateImageUrl}
        maxLength={10000}
        richText
        showGradeQuestion={isTeacher}
        countsForGrade={createCountsForGrade}
        onCountsForGradeChange={setCreateCountsForGrade}
      />

      {/* Reply modal */}
      <PostContentModal
        isOpen={isReplyModalOpen}
        title="Responder"
        submitLabel="Responder"
        content={replyContent}
        imageUrl={replyImageUrl}
        isSubmitting={isSubmitting}
        onContentChange={setReplyContent}
        onClose={handleCloseReplyModal}
        onSubmit={handleCreateReply}
        onUploadImage={onUploadImage}
        onImageUploaded={setReplyImageUrl}
        maxLength={5000}
        richText
      />

      {/* Edit topic modal */}
      <PostContentModal
        isOpen={!!editingTopic}
        title="Editar"
        submitLabel="Salvar"
        content={editTopicContent}
        imageUrl={editTopicImageUrl}
        isSubmitting={isSubmitting}
        onContentChange={setEditTopicContent}
        onClose={handleCloseEditTopic}
        onSubmit={handleEditTopic}
        onUploadImage={onUploadImage}
        onImageUploaded={setEditTopicImageUrl}
        maxLength={10000}
        richText
      />

      {/* Edit reply modal */}
      <PostContentModal
        isOpen={!!editingReply}
        title="Editar"
        submitLabel="Salvar"
        content={editReplyContent}
        imageUrl={editReplyImageUrl}
        isSubmitting={isSubmitting}
        onContentChange={setEditReplyContent}
        onClose={handleCloseEditReply}
        onSubmit={handleEditReply}
        onUploadImage={onUploadImage}
        onImageUploaded={setEditReplyImageUrl}
        maxLength={5000}
        richText
      />

      {/* Evaluate / edit grade modal (teacher only) */}
      <Modal
        isOpen={!!evaluatingReplyId}
        onClose={handleCloseEvaluateModal}
        title={
          isEditingGrade
            ? 'Edite a nota da atividade'
            : 'Defina a nota da atividade'
        }
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              action="secondary"
              size="medium"
              onClick={handleCloseEvaluateModal}
            >
              Cancelar
            </Button>
            <Button
              variant="solid"
              action="primary"
              size="medium"
              disabled={!isValidGrade || isSubmitting}
              onClick={handleSubmitEvaluation}
            >
              {isEditingGrade ? 'Salvar' : 'Avaliar'}
            </Button>
          </div>
        }
      >
        <Input
          type="number"
          min={0}
          max={10}
          step={1}
          placeholder="Nota (0-10)"
          value={gradeValue ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            const parsed = Number(val);
            setGradeValue(val === '' || Number.isNaN(parsed) ? null : parsed);
          }}
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Deseja deletar post?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              action="secondary"
              size="medium"
              onClick={() => setPendingDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="solid"
              action="negative"
              size="medium"
              disabled={isSubmitting}
              onClick={handleConfirmDelete}
            >
              Deletar
            </Button>
          </div>
        }
      >
        <Text size="md" color="text-text-600">
          Essa ação é permanente e não poderá ser desfeita.
        </Text>
      </Modal>
    </div>
  );
}

export default Forum;
