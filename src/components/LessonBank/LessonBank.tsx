import { Book, Plus } from 'phosphor-react';
import {
  Button,
  Modal,
  Text,
  SkeletonText,
  BaseApiClient,
  VideoPlayer,
  Alert,
  CardAudio,
  Whiteboard,
} from '../..';
import type { Lesson } from '../../types/lessons';
import type { WhiteboardImage } from '../Whiteboard/Whiteboard';
import { useLessonBank, type LessonFilters } from './hooks/useLessonBank';
import Video from '@/assets/icons/subjects/Video';

interface LessonBankProps {
  apiClient: BaseApiClient;
  onAddLesson?: (lesson: Lesson) => void;
  addedLessonIds?: string[];
  className?: string;
  isFromTrailRoute?: boolean;
  lessonId?: string;
  getInitialTimestamp?: (lessonId: string) => number;
  onVideoTimeUpdate?: (lessonId: string, time: number) => void;
  onVideoComplete?: (lessonId: string) => void;
  onPodcastEnded?: (lessonId: string) => void | Promise<void>;
  filters?: LessonFilters;
}

/**
 * Component that displays the list of lessons from the API
 * Fetches and displays lessons with infinite scroll
 */
export const LessonBank = ({
  apiClient,
  onAddLesson,
  addedLessonIds = [],
  className,
  isFromTrailRoute = false,
  lessonId,
  getInitialTimestamp,
  onVideoTimeUpdate,
  onVideoComplete,
  onPodcastEnded,
  filters,
}: LessonBankProps) => {
  const {
    loading,
    loadingMore,
    error,
    selectedLesson,
    isWatchModalOpen,
    filteredLessons,
    totalLessons,
    pagination,
    observerTarget,
    handleWatch,
    handleAddToLesson,
    handleAddToLessonFromModal,
    handleCloseModal,
    getVideoData,
    getPodcastData,
    getBoardImages,
    getBoardImageRef,
    getInitialTimestampValue,
    handleVideoTimeUpdate,
    handleVideoCompleteCallback,
    handlePodcastEnded,
    uniqueLesson,
  } = useLessonBank({
    apiClient,
    filters,
    addedLessonIds,
    onAddLesson,
    isFromTrailRoute,
    lessonId,
    getInitialTimestamp,
    onVideoTimeUpdate,
    onVideoComplete,
    onPodcastEnded,
  });

  /**
   * Renders podcast section if available
   */
  const PodcastSection = ({ lesson }: { lesson: Lesson }) => {
    const podcastData = getPodcastData(lesson);
    if (!podcastData.src) {
      return null;
    }
    return (
      <div className="w-full">
        <Text size="md" weight="bold" className="pb-2">
          {podcastData.title}
        </Text>
        <CardAudio
          src={podcastData.src}
          title={podcastData.title}
          onEnded={handlePodcastEnded}
        />
      </div>
    );
  };

  /**
   * Renders board images section if available
   */
  const BoardImagesSection = ({ lesson }: { lesson: Lesson }) => {
    const boardImages: WhiteboardImage[] = getBoardImages(lesson);
    if (boardImages.length === 0) {
      return null;
    }
    return (
      <div className="w-full">
        <Text size="md" weight="bold" className="pb-2">
          Quadros da aula
        </Text>
        <div className="flex flex-wrap gap-4">
          {boardImages.map((image: WhiteboardImage, index: number) => (
            <div
              key={image.id || `board-image-${index}`}
              ref={getBoardImageRef(index, boardImages.length)}
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
    );
  };

  /**
   * Renders video section with player, podcast, and board images
   */
  const VideoSection = ({ lesson }: { lesson: Lesson }) => {
    const videoData = getVideoData(lesson);
    if (!videoData.src) {
      return (
        <div className="px-6 py-6 flex flex-col gap-4">
          <Text size="md" className="text-text-600">
            Vídeo não disponível para esta aula.
          </Text>
        </div>
      );
    }

    return (
      <>
        <VideoPlayer
          src={videoData.src}
          poster={videoData.poster || undefined}
          subtitles={videoData.subtitles || undefined}
          onTimeUpdate={handleVideoTimeUpdate}
          onVideoComplete={handleVideoCompleteCallback}
          initialTime={getInitialTimestampValue(lesson.id)}
          className="w-full h-full object-cover rounded-b-xl"
          autoSave={true}
          storageKey={`lesson-${lesson.id}`}
        />
        <div className="flex flex-col gap-4">
          <Alert
            action="info"
            variant="solid"
            description="Cada aula inclui questionários automáticos para o aluno praticar o conteúdo."
            className="w-full"
          />
          <PodcastSection lesson={lesson} />
          <BoardImagesSection lesson={lesson} />
        </div>
      </>
    );
  };

  /**
   * Renders the appropriate content based on loading, error, and lessons state
   */
  const renderLessonsContent = () => {
    if (loading && filteredLessons.length === 0) {
      return (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded">
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <Text size="md" className="text-text-600">
            Erro ao carregar aulas: {error}
          </Text>
        </div>
      );
    }

    if (filteredLessons.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <Text size="md" className="text-text-600">
            Nenhuma aula encontrada.
          </Text>
        </div>
      );
    }

    return (
      <>
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex flex-col gap-3 p-4 border border-border-200 rounded-lg bg-background"
          >
            <Text size="md" weight="medium" className="text-text-950">
              {lesson.title}
            </Text>

            <div className="flex gap-2">
              <Button
                variant="outline"
                action="secondary"
                size="small"
                onClick={() => handleWatch(lesson)}
                className="flex-1"
                iconLeft={<Video size={16} color="currentColor" />}
              >
                Assistir
              </Button>
              <Button
                variant="outline"
                action="primary"
                size="small"
                onClick={() => handleAddToLesson(lesson)}
                className="flex-1"
                iconLeft={<Plus />}
              >
                Adicionar à aula
              </Button>
            </div>
          </div>
        ))}
        {pagination?.hasNext && (
          <div ref={observerTarget} className="h-4 w-full">
            {loadingMore && (
              <div className="flex flex-col gap-2 py-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 border rounded">
                    <SkeletonText lines={2} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className={`w-full flex flex-col p-4 gap-2 overflow-hidden h-full min-h-0 ${className || ''}`}
    >
      <div className="flex flex-col gap-2 flex-shrink-0">
        <section className="flex flex-row items-center gap-2 text-text-950">
          <Book size={24} />
          <Text size="lg" weight="bold">
            Banco de Aulas
          </Text>
        </section>

        <section className="flex flex-row justify-between items-center">
          <Text size="sm" className="text-text-800">
            {loading
              ? 'Carregando...'
              : `${totalLessons} ${uniqueLesson()} total`}
          </Text>
        </section>
      </div>

      <div className="flex flex-col gap-3 overflow-auto flex-1 min-h-0">
        {renderLessonsContent()}
      </div>

      <Modal
        isOpen={isWatchModalOpen}
        onClose={handleCloseModal}
        title={selectedLesson?.title || 'Assistir Aula'}
        size="lg"
        hideCloseButton={true}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="solid" onClick={handleAddToLessonFromModal}>
              Adicionar à aula
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {selectedLesson ? (
            <VideoSection lesson={selectedLesson} />
          ) : (
            <div className="px-6 py-6 flex flex-col gap-4">
              <Text size="md" className="text-text-600">
                Carregando...
              </Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export type { LessonBankProps };
export type { LessonFilters } from './hooks/useLessonBank';
