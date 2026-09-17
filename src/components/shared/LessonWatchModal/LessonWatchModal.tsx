import React, { type RefObject } from 'react';
import { Button, Modal, Text, Alert } from '../../../index';
import type { Lesson } from '../../../types/lessons';
import type { WhiteboardImage } from '../../Whiteboard/Whiteboard';
import {
  LessonVideoSection,
  LessonPodcastSection,
  LessonBoardImagesSection,
} from '../LessonMediaSections';

export interface LessonWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLesson: Lesson | null;
  userId?: string;
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

type VideoSectionProps = Omit<
  LessonWatchModalProps,
  'isOpen' | 'onClose' | 'selectedLesson' | 'footer' | 'title'
> & { lesson: Lesson };

/**
 * Renders video section with player, podcast, and board images.
 *
 * Resolves the lesson-shaped accessors into plain data and hands it to the
 * shared LessonMediaSections, so the modal and the lesson page render the same
 * player, podcast and whiteboards.
 */
const VideoSection = ({
  lesson,
  userId,
  getVideoData,
  getInitialTimestampValue,
  handleVideoTimeUpdate,
  handleVideoCompleteCallback,
  getPodcastData,
  onPodcastEnded,
  getBoardImages,
  getBoardImageRef,
}: VideoSectionProps) => {
  const boardImages: WhiteboardImage[] = getBoardImages(lesson);

  return (
    <LessonVideoSection
      video={getVideoData(lesson)}
      initialTime={getInitialTimestampValue(lesson.id)}
      onTimeUpdate={handleVideoTimeUpdate}
      onVideoComplete={handleVideoCompleteCallback}
      storageKey={`lesson-${lesson.id}`}
      userId={userId}
    >
      <div className="flex flex-col gap-4">
        <Alert
          action="info"
          variant="solid"
          description="Cada aula inclui questionários automáticos para o aluno praticar o conteúdo."
          className="w-full"
        />
        <LessonPodcastSection
          podcast={getPodcastData(lesson)}
          onEnded={onPodcastEnded}
        />
        <LessonBoardImagesSection
          images={boardImages}
          getImageRef={getBoardImageRef}
        />
      </div>
    </LessonVideoSection>
  );
};

/**
 * Modal component for watching lessons with video, podcast, and board images
 */
export const LessonWatchModal = ({
  isOpen,
  onClose,
  selectedLesson,
  userId,
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
            userId={userId}
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
