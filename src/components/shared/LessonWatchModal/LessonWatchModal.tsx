import React, { type RefObject } from 'react';
import {
  Button,
  Modal,
  Text,
  VideoPlayer,
  Alert,
  CardAudio,
  Whiteboard,
} from '../../../index';
import type { Lesson } from '../../../types/lessons';
import type { WhiteboardImage } from '../../Whiteboard/Whiteboard';

interface PodcastSectionProps {
  lesson: Lesson;
  getPodcastData: (lesson: Lesson | null) => { src: string; title: string };
  onPodcastEnded: () => void;
}

/**
 * Renders podcast section if available
 */
const PodcastSection = ({
  lesson,
  getPodcastData,
  onPodcastEnded,
}: PodcastSectionProps) => {
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
        onEnded={onPodcastEnded}
      />
    </div>
  );
};

interface BoardImagesSectionProps {
  lesson: Lesson;
  getBoardImages: (lesson: Lesson | null) => WhiteboardImage[];
  getBoardImageRef: (
    index: number,
    total: number
  ) => RefObject<HTMLDivElement | null> | null;
}

/**
 * Renders board images section if available
 */
const BoardImagesSection = ({
  lesson,
  getBoardImages,
  getBoardImageRef,
}: BoardImagesSectionProps) => {
  const boardImages: WhiteboardImage[] = getBoardImages(lesson);
  if (boardImages.length === 0) {
    return null;
  }
  return (
    <div className="w-full">
      <Text size="md" weight="bold" className="pb-2">
        Quadros da aula
      </Text>
      <div className="flex flex-wrap items-center justify-center gap-4">
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

interface VideoSectionProps {
  lesson: Lesson;
  getVideoData: (lesson: Lesson | null) => {
    src: string;
    poster?: string;
    subtitles?: string;
  };
  getInitialTimestampValue: (lessonId: string) => number;
  handleVideoTimeUpdate: (time: number) => void;
  handleVideoCompleteCallback: () => void;
  getPodcastData: (lesson: Lesson | null) => { src: string; title: string };
  onPodcastEnded: () => void;
  getBoardImages: (lesson: Lesson | null) => WhiteboardImage[];
  getBoardImageRef: (
    index: number,
    total: number
  ) => RefObject<HTMLDivElement | null> | null;
}

/**
 * Renders video section with player, podcast, and board images
 */
const VideoSection = ({
  lesson,
  getVideoData,
  getInitialTimestampValue,
  handleVideoTimeUpdate,
  handleVideoCompleteCallback,
  getPodcastData,
  onPodcastEnded,
  getBoardImages,
  getBoardImageRef,
}: VideoSectionProps) => {
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
        poster={videoData.poster}
        subtitles={videoData.subtitles}
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
        <PodcastSection
          lesson={lesson}
          getPodcastData={getPodcastData}
          onPodcastEnded={onPodcastEnded}
        />
        <BoardImagesSection
          lesson={lesson}
          getBoardImages={getBoardImages}
          getBoardImageRef={getBoardImageRef}
        />
      </div>
    </>
  );
};

export interface LessonWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLesson: Lesson | null;
  getVideoData: (lesson: Lesson | null) => {
    src: string;
    poster?: string;
    subtitles?: string;
  };
  getInitialTimestampValue: (lessonId: string) => number;
  handleVideoTimeUpdate: (time: number) => void;
  handleVideoCompleteCallback: () => void;
  getPodcastData: (lesson: Lesson | null) => { src: string; title: string };
  onPodcastEnded: () => void;
  getBoardImages: (lesson: Lesson | null) => WhiteboardImage[];
  getBoardImageRef: (
    index: number,
    total: number
  ) => RefObject<HTMLDivElement | null> | null;
  /**
   * Custom footer content. If not provided, defaults to a Cancel button.
   */
  footer?: React.ReactNode;
  /**
   * Modal title. Defaults to selectedLesson?.title || 'Assistir Aula'
   */
  title?: string;
}

/**
 * Modal component for watching lessons with video, podcast, and board images
 */
export const LessonWatchModal = ({
  isOpen,
  onClose,
  selectedLesson,
  getVideoData,
  getInitialTimestampValue,
  handleVideoTimeUpdate,
  handleVideoCompleteCallback,
  getPodcastData,
  onPodcastEnded,
  getBoardImages,
  getBoardImageRef,
  footer,
  title,
}: LessonWatchModalProps) => {
  const defaultFooter = (
    <div className="flex gap-3">
      <Button variant="outline" onClick={onClose}>
        Cancelar
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || selectedLesson?.title || 'Assistir Aula'}
      size="lg"
      hideCloseButton={true}
      footer={footer ?? defaultFooter}
    >
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-auto">
        {selectedLesson ? (
          <VideoSection
            lesson={selectedLesson}
            getVideoData={getVideoData}
            getInitialTimestampValue={getInitialTimestampValue}
            handleVideoTimeUpdate={handleVideoTimeUpdate}
            handleVideoCompleteCallback={handleVideoCompleteCallback}
            getPodcastData={getPodcastData}
            onPodcastEnded={onPodcastEnded}
            getBoardImages={getBoardImages}
            getBoardImageRef={getBoardImageRef}
          />
        ) : (
          <div className="px-6 py-6 flex flex-col gap-4">
            <Text size="md" className="text-text-600">
              Carregando...
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};
