import type { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  LessonWatchModal,
  type LessonWatchModalProps,
} from './LessonWatchModal';
import type { Lesson } from '../../../types/lessons';

/**
 * The media sections have their own suite; here they are reduced to probes
 * that expose the data the modal resolves from the lesson accessors.
 */
jest.mock('../LessonMediaSections', () => ({
  LessonVideoSection: ({
    video,
    storageKey,
    initialTime,
    children,
  }: {
    video: { src: string };
    storageKey?: string;
    initialTime?: number;
    children?: ReactNode;
  }) => (
    <div
      data-testid="video-section"
      data-src={video.src}
      data-storage-key={storageKey}
      data-initial-time={String(initialTime)}
    >
      {children}
    </div>
  ),
  LessonPodcastSection: ({ podcast }: { podcast: { title: string } }) => (
    <div data-testid="podcast-section">{podcast.title}</div>
  ),
  LessonBoardImagesSection: ({ images }: { images: unknown[] }) => (
    <div data-testid="board-section" data-count={images.length} />
  ),
}));

const lesson: Lesson = { id: 'lesson-1', title: 'Frações' };

/**
 * Builds the modal props with mocked accessors, allowing overrides per test.
 */
const buildProps = (
  overrides: Partial<LessonWatchModalProps> = {}
): LessonWatchModalProps => ({
  isOpen: true,
  onClose: jest.fn(),
  selectedLesson: lesson,
  getVideoData: jest.fn(() => ({ src: 'https://cdn.test/video.mp4' })),
  getInitialTimestampValue: jest.fn(() => 42),
  handleVideoTimeUpdate: jest.fn(),
  handleVideoCompleteCallback: jest.fn(),
  getPodcastData: jest.fn(() => ({ src: 'p.mp3', title: 'Podcast X' })),
  onPodcastEnded: jest.fn(),
  getBoardImages: jest.fn(() => [{ id: 'b1', imageUrl: 'b1.png' }]),
  getBoardImageRef: jest.fn(() => null),
  ...overrides,
});

describe('LessonWatchModal', () => {
  it('should render the lesson media sections', () => {
    render(<LessonWatchModal {...buildProps()} />);

    const video = screen.getByTestId('video-section');
    expect(video).toHaveAttribute('data-src', 'https://cdn.test/video.mp4');
    expect(video).toHaveAttribute('data-storage-key', 'lesson-lesson-1');
    expect(video).toHaveAttribute('data-initial-time', '42');
    expect(screen.getByText('Podcast X')).toBeInTheDocument();
    expect(screen.getByTestId('board-section')).toHaveAttribute(
      'data-count',
      '1'
    );
  });

  it('should close when clicking the default "Continuar planejando a aula" button', () => {
    const props = buildProps();
    render(<LessonWatchModal {...props} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Continuar planejando a aula' })
    );

    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Cancelar')).not.toBeInTheDocument();
  });

  it('should render the X close button that calls onClose', () => {
    const props = buildProps();
    render(<LessonWatchModal {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fechar modal' }));

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should render a custom footer instead of the default one', () => {
    render(
      <LessonWatchModal
        {...buildProps({ footer: <button type="button">Custom</button> })}
      />
    );

    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Continuar planejando a aula' })
    ).not.toBeInTheDocument();
  });

  it('should prefer the title prop over the lesson title', () => {
    render(<LessonWatchModal {...buildProps({ title: 'Título custom' })} />);

    expect(screen.getByText('Título custom')).toBeInTheDocument();
  });

  it('should fall back to the lesson title', () => {
    render(<LessonWatchModal {...buildProps()} />);

    expect(screen.getByText('Frações')).toBeInTheDocument();
  });

  it('should show the loading state and default title without a lesson', () => {
    render(<LessonWatchModal {...buildProps({ selectedLesson: null })} />);

    expect(screen.getByText('Assistir Aula')).toBeInTheDocument();
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByTestId('video-section')).not.toBeInTheDocument();
  });
});
