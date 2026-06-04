import { useState, useCallback, useEffect } from 'react';
import Modal from '../../Modal/Modal';
import Text from '../../Text/Text';
import Button from '../../Button/Button';
import Badge from '../../Badge/Badge';
import Alert from '../../Alert/Alert';
import VideoPlayer from '../../VideoPlayer/VideoPlayer';
import { CardAudio } from '../../Card/Card';
import Whiteboard from '../../Whiteboard/Whiteboard';
import { CardAccordation } from '../../Accordation';
import { CardBase } from '../../Card/Card';
import { Skeleton, SkeletonRounded } from '../../Skeleton/Skeleton';
import type { LessonDetailsData } from '../../../types/recommendedLessons';
import type { RecommendedClassLessonsItem } from '../../../types/recommendedLessons';
import type { Lesson } from '../../../types/lessons';
import type { BaseApiClient } from '../../../types/api';
import type { WhiteboardImage } from '../../Whiteboard/Whiteboard';
import {
  GenericDisplayStatus,
  getStatusBadgeAction,
} from '../../../types/common';
import { formatDate } from '../utils/lessonDetailsUtils';
import { cn, getSubjectColorWithOpacity } from '../../../utils/utils';
import { useTheme } from '../../../hooks/useTheme';

/**
 * Props for RecommendedLessonViewModal component
 */
export interface RecommendedLessonViewModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Lesson details data */
  data: LessonDetailsData;
  /** API client for fetching full lesson data */
  apiClient?: BaseApiClient;
}

/**
 * Derive display status from recommended class dates and progress
 */
const deriveRecommendedClassStatus = (
  startDate: string | null,
  finalDate: string | null,
  progress: number
): GenericDisplayStatus => {
  // If progress is 100%, it's completed
  if (progress >= 100) return GenericDisplayStatus.CONCLUIDA;

  // Check if deadline has passed
  if (finalDate) {
    const deadline = new Date(finalDate);
    if (deadline < new Date()) {
      return GenericDisplayStatus.VENCIDA;
    }
  }

  // Otherwise it's active
  return GenericDisplayStatus.ATIVA;
};

/**
 * Loading skeleton for lesson content
 */
const LessonContentSkeleton = () => (
  <div className="flex flex-col gap-4 p-4">
    <SkeletonRounded height={200} className="w-full" />
    <Skeleton variant="text" width="80%" height={20} />
    <SkeletonRounded height={60} className="w-full" />
  </div>
);

/**
 * Lesson content component that fetches and displays full lesson data
 */
const LessonContent = ({
  lessonId,
  apiClient,
  cachedLessons,
  onLessonLoaded,
}: {
  lessonId: string;
  apiClient?: BaseApiClient;
  cachedLessons: Record<string, Lesson>;
  onLessonLoaded: (lessonId: string, lesson: Lesson) => void;
}) => {
  const [loading, setLoading] = useState(!cachedLessons[lessonId]);
  const [error, setError] = useState<string | null>(null);

  const lesson = cachedLessons[lessonId];

  useEffect(() => {
    if (lesson || !apiClient) return;

    const fetchLesson = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<{ data: Lesson }>(
          `/lesson/${lessonId}`
        );
        onLessonLoaded(lessonId, response.data.data);
      } catch {
        setError('Erro ao carregar dados da aula');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, apiClient, lesson, onLessonLoaded]);

  if (loading) {
    return <LessonContentSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4">
        <Text size="sm" className="text-error-700">
          {error}
        </Text>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-4">
        <Text size="sm" className="text-text-500">
          Dados da aula não disponíveis
        </Text>
      </div>
    );
  }

  const hasVideo = Boolean(lesson.urlVideo);
  const hasPodcast = Boolean(lesson.urlPodCast);
  const boardImages: WhiteboardImage[] = [];

  if (lesson.urlInitialFrame) {
    boardImages.push({ id: 'initial', imageUrl: lesson.urlInitialFrame });
  }
  if (lesson.urlFinalFrame) {
    boardImages.push({ id: 'final', imageUrl: lesson.urlFinalFrame });
  }

  const hasBoards = boardImages.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {hasVideo ? (
        <VideoPlayer
          src={lesson.urlVideo!}
          poster={lesson.urlCover}
          subtitles={lesson.urlSubtitle}
          className="w-full rounded-lg"
        />
      ) : (
        <div className="p-4 bg-background-50 rounded-lg">
          <Text size="sm" className="text-text-500">
            Vídeo não disponível para esta aula.
          </Text>
        </div>
      )}

      <Alert
        action="info"
        variant="solid"
        description="Cada aula inclui questionários automáticos para o aluno praticar o conteúdo."
        className="w-full"
      />

      {hasPodcast && (
        <div className="w-full">
          <Text size="md" weight="bold" className="pb-2">
            Podcast
          </Text>
          <CardAudio
            src={lesson.urlPodCast!}
            title={lesson.podCastTitle || 'Podcast da aula'}
          />
        </div>
      )}

      {hasBoards && (
        <div className="w-full">
          <Text size="md" weight="bold" className="pb-2">
            Quadros da aula
          </Text>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {boardImages.map((image) => (
              <div
                key={image.id}
                className="flex flex-row rounded-xl bg-background-50"
              >
                <Whiteboard
                  images={[image]}
                  showDownload={true}
                  imagesPerRow={2}
                  className="gap-4 w-full items-center border-border-50"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Single lesson accordion item with colored header
 */
const LessonAccordionItem = ({
  lessonItem,
  apiClient,
  cachedLessons,
  onLessonLoaded,
}: {
  lessonItem: RecommendedClassLessonsItem;
  apiClient?: BaseApiClient;
  cachedLessons: Record<string, Lesson>;
  onLessonLoaded: (lessonId: string, lesson: Lesson) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark } = useTheme();
  const lesson = lessonItem.supLessonsProgress.lesson;
  const lessonId = lesson.id;
  const subjectColor = lesson.subject?.color;

  const trigger = (
    <div className="flex flex-col gap-1 py-3">
      <Text size="xs" className="text-text-500">
        {lesson.topic.name} • {lesson.subtopic.name} • {lesson.content.name}
      </Text>
      <Text size="md" weight="medium" className="text-text-950">
        {lesson.content.name || lesson.videoTitle}
      </Text>
    </div>
  );

  return (
    <div className="rounded-xl overflow-hidden border border-border-100">
      {/* Colored header bar */}
      <div
        className={cn(
          'px-4 py-2',
          subjectColor?.startsWith('bg-') && subjectColor
        )}
        style={
          subjectColor && !subjectColor.startsWith('bg-')
            ? {
                backgroundColor: getSubjectColorWithOpacity(
                  subjectColor,
                  isDark
                ),
              }
            : undefined
        }
      >
        <Text size="xs" weight="medium" className="text-text-700">
          {lesson.subject?.name}
        </Text>
      </div>

      <CardAccordation
        trigger={trigger}
        expanded={isExpanded}
        onToggleExpanded={setIsExpanded}
        value={lessonId}
        contentClassName="p-0"
        className="border-0 rounded-none"
      >
        {isExpanded && (
          <LessonContent
            lessonId={lessonId}
            apiClient={apiClient}
            cachedLessons={cachedLessons}
            onLessonLoaded={onLessonLoaded}
          />
        )}
      </CardAccordation>
    </div>
  );
};

/**
 * Modal component for viewing all lessons in a recommended class
 * Shows header with metadata and expandable accordion list of lessons
 */
export const RecommendedLessonViewModal = ({
  isOpen,
  onClose,
  data,
  apiClient,
}: RecommendedLessonViewModalProps) => {
  const [cachedLessons, setCachedLessons] = useState<Record<string, Lesson>>(
    {}
  );

  const handleLessonLoaded = useCallback((lessonId: string, lesson: Lesson) => {
    setCachedLessons((prev) => ({ ...prev, [lessonId]: lesson }));
  }, []);

  // Reset cache when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCachedLessons({});
    }
  }, [isOpen]);

  const { recommendedClass } = data;
  const lessons = recommendedClass.lessons || [];

  const status = deriveRecommendedClassStatus(
    recommendedClass.startDate,
    recommendedClass.finalDate,
    recommendedClass.progress
  );
  const badgeAction = getStatusBadgeAction(status);

  const footer = (
    <div className="flex justify-end">
      <Button variant="outline" onClick={onClose}>
        Fechar
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ver Aula"
      size="lg"
      footer={footer}
      contentClassName="max-h-[70vh] overflow-y-auto"
    >
      <div className="flex flex-col gap-6">
        {/* Header Card */}
        <CardBase layout="vertical" padding="medium" className="bg-background">
          <div className="flex flex-col gap-2">
            <Text as="h2" size="lg" weight="bold" className="text-text-950">
              {recommendedClass.title}
            </Text>
            <div className="flex flex-wrap items-center gap-2">
              <Text size="sm" className="text-text-600">
                Início: {formatDate(recommendedClass.startDate)}
              </Text>
              <Text size="sm" className="text-text-400">
                •
              </Text>
              <Text size="sm" className="text-text-600">
                Prazo: {formatDate(recommendedClass.finalDate)}
              </Text>
              <Text size="sm" className="text-text-400">
                •
              </Text>
              <Badge action={badgeAction} size="small">
                {status}
              </Badge>
            </div>
          </div>
        </CardBase>

        {/* Lessons Section */}
        <div className="flex flex-col gap-4">
          <Text as="h3" size="lg" weight="bold" className="text-text-950">
            Aulas
          </Text>

          {lessons.length === 0 ? (
            <div className="p-4 bg-background-50 rounded-lg">
              <Text size="sm" className="text-text-500">
                Nenhuma aula encontrada.
              </Text>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {lessons.map((lessonItem) => (
                <LessonAccordionItem
                  key={lessonItem.supLessonsProgress.lesson.id}
                  lessonItem={lessonItem}
                  apiClient={apiClient}
                  cachedLessons={cachedLessons}
                  onLessonLoaded={handleLessonLoaded}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RecommendedLessonViewModal;
