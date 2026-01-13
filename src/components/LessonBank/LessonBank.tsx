import { Book, Plus } from 'phosphor-react';
import { Button, Text, SkeletonText, BaseApiClient } from '../..';
import type { Lesson } from '../../types/lessons';
import { useLessonBank, type LessonFilters } from './hooks/useLessonBank';
import Video from '@/assets/icons/subjects/Video';
import { LessonWatchModal } from '../shared/LessonWatchModal';

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
                iconLeft={<Plus size={16} />}
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

      <LessonWatchModal
        isOpen={isWatchModalOpen}
        onClose={handleCloseModal}
        selectedLesson={selectedLesson}
        getVideoData={getVideoData}
        getInitialTimestampValue={getInitialTimestampValue}
        handleVideoTimeUpdate={handleVideoTimeUpdate}
        handleVideoCompleteCallback={handleVideoCompleteCallback}
        getPodcastData={getPodcastData}
        onPodcastEnded={handlePodcastEnded}
        getBoardImages={getBoardImages}
        getBoardImageRef={getBoardImageRef}
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
      />
    </div>
  );
};

export type { LessonBankProps };
export type { LessonFilters } from './hooks/useLessonBank';
