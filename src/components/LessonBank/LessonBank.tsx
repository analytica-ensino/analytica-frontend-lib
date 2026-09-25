import { useState } from 'react';
import { BookIcon } from '@phosphor-icons/react/dist/csr/Book';
import { ChalkboardTeacherIcon } from '@phosphor-icons/react/dist/csr/ChalkboardTeacher';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import {
  Badge,
  Button,
  Text,
  SkeletonText,
  BaseApiClient,
  EmptyState,
  Input,
  Modal,
} from '../..';
import { cn } from '../../utils/utils';
import type { Lesson } from '../../types/lessons';
import { useLessonBank, type LessonFilters } from './hooks/useLessonBank';
import Video from '../../assets/icons/subjects/Video';
import { LessonWatchModal } from '../shared/LessonWatchModal';
import { ToastNotification } from '../shared/ToastNotification/ToastNotification';
import { useToastNotification } from '../shared/ToastNotification/useToastNotification';
import Activities from '../../assets/icons/Activities';
import { useSentLessonIds } from '../../hooks/useSentLessonIds';

interface LessonBankProps {
  apiClient: BaseApiClient;
  onAddLesson?: (lesson: Lesson) => void;
  addedLessonIds?: string[];
  className?: string;
  isFromTrailRoute?: boolean;
  lessonId?: string;
  userId?: string;
  getInitialTimestamp?: (lessonId: string) => number;
  onVideoTimeUpdate?: (lessonId: string, time: number) => void;
  onVideoComplete?: (lessonId: string) => void;
  onPodcastEnded?: (lessonId: string) => void | Promise<void>;
  filters?: LessonFilters;
  /**
   * `default` keeps the plain column used by the wide layouts; `card` renders
   * the white rounded card used by the compact (<= 1024px) layout.
   */
  variant?: 'default' | 'card';
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
  userId,
  getInitialTimestamp,
  onVideoTimeUpdate,
  onVideoComplete,
  onPodcastEnded,
  filters,
  variant = 'default',
}: LessonBankProps) => {
  // Toast notifications
  const { toastState, showSuccess, showError, hideToast } =
    useToastNotification();
  const [isAutoAddModalOpen, setIsAutoAddModalOpen] = useState(false);
  const [autoAddCount, setAutoAddCount] = useState(1);
  const [isAutoAdding, setIsAutoAdding] = useState(false);
  const isCard = variant === 'card';
  const sentLessonIds = useSentLessonIds(apiClient);

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
    fetchRandomLessons,
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

  const handleAddWithToast = (lesson: Lesson) => {
    handleAddToLesson(lesson);
    showSuccess('Aula adicionada à aula recomendada');
  };

  const handleAddFromModalWithToast = () => {
    handleAddToLessonFromModal();
    showSuccess('Aula adicionada à aula recomendada');
  };

  /**
   * Close the auto add modal and reset its count
   */
  const handleCloseAutoAddModal = () => {
    setIsAutoAddModalOpen(false);
    setAutoAddCount(1);
  };

  /**
   * Add random lessons matching the current filters to the recommended lesson
   */
  const handleAddAutomatically = async () => {
    if (autoAddCount <= 0) return;

    setIsAutoAdding(true);
    try {
      const randomLessons = await fetchRandomLessons(autoAddCount);
      randomLessons.forEach((lesson) => onAddLesson?.(lesson));
      handleCloseAutoAddModal();

      if (randomLessons.length === 0) {
        showError('Nenhuma aula disponível para adicionar');
        return;
      }
      showSuccess(
        randomLessons.length === 1
          ? '1 aula adicionada à aula recomendada'
          : `${randomLessons.length} aulas adicionadas à aula recomendada`
      );
    } catch (err) {
      console.error('Erro ao adicionar aulas automaticamente:', err);
      showError('Erro ao adicionar aulas automaticamente');
    } finally {
      setIsAutoAdding(false);
    }
  };

  /**
   * Handle the auto add count input, accepting only positive integers
   * @param inputValue - Raw input value
   */
  const handleAutoAddCountChange = (inputValue: string) => {
    if (inputValue === '') {
      setAutoAddCount(0);
      return;
    }
    const numValue = Number.parseInt(inputValue, 10);
    if (!Number.isNaN(numValue) && numValue > 0) {
      setAutoAddCount(numValue);
    }
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
        <EmptyState
          image={<Activities />}
          title="Nenhum resultado encontrado"
          description="Utilize o filtro ao lado para encontrar aulas."
          size="compact"
        />
      );
    }

    return (
      <>
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex flex-col gap-3 p-4 border border-border-200 rounded-lg bg-background"
          >
            <div className="flex flex-row items-center gap-2">
              <Text size="md" weight="medium" className="text-text-950">
                {lesson.content?.name ||
                  lesson.videoTitle ||
                  lesson.title ||
                  'Aula sem título'}
              </Text>

              {sentLessonIds.has(lesson.id) && (
                <Badge variant="solid" action="info" size="small">
                  Já enviada
                </Badge>
              )}
            </div>

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
                onClick={() => handleAddWithToast(lesson)}
                className="flex-1"
                iconLeft={<PlusIcon size={16} />}
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

  const isEmpty = !loading && !error && filteredLessons.length === 0;

  const statusText = loading
    ? 'Carregando...'
    : `${totalLessons} ${uniqueLesson()} total`;

  return (
    <div
      data-testid="lesson-bank"
      data-variant={variant}
      className={cn(
        'w-full flex flex-col overflow-hidden h-full min-h-0',
        isCard
          ? 'p-6 max-[376px]:p-4 gap-6 bg-background rounded-xl'
          : 'p-4 gap-2',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col flex-shrink-0',
          isCard ? 'gap-4' : 'gap-2'
        )}
      >
        <section className="flex flex-row items-center gap-2 text-text-950">
          {isCard ? (
            <ChalkboardTeacherIcon size={24} />
          ) : (
            <BookIcon size={24} />
          )}
          <Text size={isCard ? 'xl' : 'lg'} weight="bold">
            {isCard ? 'Banco de aulas' : 'Banco de Aulas'}
          </Text>
        </section>

        <section className="flex flex-row flex-wrap justify-between items-center gap-4">
          <Text
            size="sm"
            className={cn(
              isCard
                ? 'text-text-700 bg-background-50 rounded-sm px-2 py-1 whitespace-nowrap'
                : 'text-text-800'
            )}
          >
            {statusText}
          </Text>

          <Button
            size="small"
            onClick={() => setIsAutoAddModalOpen(true)}
            disabled={totalLessons === 0}
            className="whitespace-nowrap"
          >
            Adicionar automaticamente
          </Button>
        </section>
      </div>

      <div
        className={cn(
          'flex flex-col gap-3 overflow-auto flex-1 min-h-0',
          isCard && 'p-6 border border-dashed border-border-300 rounded-lg',
          isCard && isEmpty && 'justify-center'
        )}
      >
        {renderLessonsContent()}
      </div>

      <Modal
        isOpen={isAutoAddModalOpen}
        onClose={handleCloseAutoAddModal}
        title="Adicionar automaticamente"
        size="md"
        hideCloseButton={true}
        contentClassName="p-0"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCloseAutoAddModal}>
              Cancelar
            </Button>
            <Button
              variant="solid"
              onClick={handleAddAutomatically}
              disabled={autoAddCount <= 0 || isAutoAdding}
            >
              Adicionar
            </Button>
          </div>
        }
      >
        <div className="px-6 py-6 flex flex-col gap-4">
          <Text size="sm" className="text-text-600">
            Defina a quantidade de aulas que você quer que o sistema adicione
            automaticamente na sua aula recomendada
          </Text>
          <Input
            type="number"
            min={1}
            value={autoAddCount > 0 ? autoAddCount : ''}
            onChange={(e) => handleAutoAddCountChange(e.target.value)}
            placeholder="Insira o número"
            variant="outlined"
            aria-label="Quantidade de aulas"
          />
        </div>
      </Modal>

      <LessonWatchModal
        isOpen={isWatchModalOpen}
        onClose={handleCloseModal}
        selectedLesson={selectedLesson}
        title={
          selectedLesson?.content?.name ||
          selectedLesson?.videoTitle ||
          selectedLesson?.content?.bnccCode ||
          selectedLesson?.title ||
          'Assistir Aula'
        }
        userId={userId}
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
            <Button variant="solid" onClick={handleAddFromModalWithToast}>
              Adicionar à aula
            </Button>
          </div>
        }
      />

      {/* Toast Notification */}
      <ToastNotification
        isOpen={toastState.isOpen}
        onClose={hideToast}
        title={toastState.title}
        description={toastState.description}
        action={toastState.action}
      />
    </div>
  );
};

export type { LessonBankProps };
export type { LessonFilters } from './hooks/useLessonBank';
