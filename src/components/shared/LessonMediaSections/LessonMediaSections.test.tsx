import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  LessonVideoSection,
  LessonPodcastSection,
  LessonBoardImagesSection,
} from './LessonMediaSections';

/**
 * VideoPlayer is a large component with its own suite; here we only care about
 * the props LessonVideoSection forwards, so it is reduced to a probe that
 * exposes them as data attributes.
 */
jest.mock('../../../index', () => {
  const actual = jest.requireActual('../../../index');
  return {
    ...actual,
    VideoPlayer: (props: Record<string, unknown>) => (
      <div
        data-testid="video-player"
        data-src={String(props.src)}
        data-autosave={String(props.autoSave)}
        data-storage-key={String(props.storageKey)}
        data-initial-time={String(props.initialTime)}
      />
    ),
  };
});

describe('LessonVideoSection', () => {
  const video = { src: 'https://cdn.test/video.mp4', poster: 'p.png' };

  it('should render the player and its children', () => {
    render(
      <LessonVideoSection video={video}>
        <p>conteúdo extra</p>
      </LessonVideoSection>
    );

    expect(screen.getByTestId('video-player')).toHaveAttribute(
      'data-src',
      'https://cdn.test/video.mp4'
    );
    expect(screen.getByText('conteúdo extra')).toBeInTheDocument();
  });

  it('should render the empty message and no children when there is no video', () => {
    render(
      <LessonVideoSection video={{ src: '' }}>
        <p>conteúdo extra</p>
      </LessonVideoSection>
    );

    expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
    expect(
      screen.getByText('Vídeo não disponível para esta aula.')
    ).toBeInTheDocument();
    // The podcast/whiteboards that live in children belong to the video block,
    // so they must not appear on their own.
    expect(screen.queryByText('conteúdo extra')).not.toBeInTheDocument();
  });

  it('should accept a custom empty message', () => {
    render(
      <LessonVideoSection video={{ src: '' }} emptyMessage="Sem vídeo aqui" />
    );
    expect(screen.getByText('Sem vídeo aqui')).toBeInTheDocument();
  });

  it('should persist progress and resume by default', () => {
    render(
      <LessonVideoSection
        video={video}
        initialTime={42}
        storageKey="lesson-1"
      />
    );

    const player = screen.getByTestId('video-player');
    expect(player).toHaveAttribute('data-autosave', 'true');
    expect(player).toHaveAttribute('data-storage-key', 'lesson-1');
    expect(player).toHaveAttribute('data-initial-time', '42');
  });

  it('should neither save nor resume when persistProgress is false', () => {
    render(
      <LessonVideoSection
        video={video}
        initialTime={42}
        storageKey="lesson-1"
        persistProgress={false}
      />
    );

    const player = screen.getByTestId('video-player');
    // A preview viewer is not "watching" the lesson: nothing is remembered and
    // playback always starts from the beginning.
    expect(player).toHaveAttribute('data-autosave', 'false');
    expect(player).toHaveAttribute('data-initial-time', '0');
  });
});

describe('LessonPodcastSection', () => {
  it('should render the podcast title', () => {
    render(
      <LessonPodcastSection
        podcast={{ src: 'https://cdn.test/a.mp3', title: 'Podcast da aula' }}
      />
    );

    expect(screen.getByText('Podcast da aula')).toBeInTheDocument();
  });

  it('should render nothing when there is no podcast', () => {
    const { container } = render(<LessonPodcastSection podcast={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when the podcast has no src', () => {
    const { container } = render(
      <LessonPodcastSection podcast={{ src: '', title: 'Vazio' }} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when podcast is omitted', () => {
    const { container } = render(<LessonPodcastSection />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('LessonBoardImagesSection', () => {
  const images = [
    {
      id: 'board-1',
      imageUrl: 'https://cdn.test/1.png',
      title: 'Quadro inicial',
    },
    {
      id: 'board-2',
      imageUrl: 'https://cdn.test/2.png',
      title: 'Quadro final',
    },
  ];

  it('should render the default title and one block per image', () => {
    render(<LessonBoardImagesSection images={images} />);

    expect(screen.getByText('Quadros da aula')).toBeInTheDocument();
    expect(screen.getByAltText('Quadro inicial')).toBeInTheDocument();
    expect(screen.getByAltText('Quadro final')).toBeInTheDocument();
  });

  it('should accept a custom title', () => {
    render(<LessonBoardImagesSection images={images} title="Lousas" />);
    expect(screen.getByText('Lousas')).toBeInTheDocument();
  });

  it('should render nothing when there are no images', () => {
    const { container } = render(<LessonBoardImagesSection images={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when images is omitted', () => {
    const { container } = render(<LessonBoardImagesSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should ask for a ref per image with its index and the total', () => {
    const getImageRef = jest.fn(() => createRef<HTMLDivElement>());

    render(
      <LessonBoardImagesSection images={images} getImageRef={getImageRef} />
    );

    expect(getImageRef).toHaveBeenCalledWith(0, 2);
    expect(getImageRef).toHaveBeenCalledWith(1, 2);
  });

  it('should render without a ref factory', () => {
    render(<LessonBoardImagesSection images={images} />);
    expect(screen.getByText('Quadros da aula')).toBeInTheDocument();
  });

  describe('onImageClick', () => {
    it('should report the board that was clicked, with its position', () => {
      const onImageClick = jest.fn();
      render(
        <LessonBoardImagesSection images={images} onImageClick={onImageClick} />
      );

      fireEvent.click(screen.getByAltText('Quadro final'));

      expect(onImageClick).toHaveBeenCalledWith(images[1], 1, 2);
    });

    it('should never nest a button inside another button', () => {
      const { container } = render(
        <LessonBoardImagesSection images={images} onImageClick={jest.fn()} />
      );

      // Whiteboard renders its own zoom and download buttons. Wrapping them in
      // an outer button is invalid HTML and makes them unreachable.
      expect(container.querySelector('button button')).toBeNull();
    });

    it('should keep the download control reachable', () => {
      render(
        <LessonBoardImagesSection images={images} onImageClick={jest.fn()} />
      );

      expect(
        screen.getByRole('button', { name: 'Download Quadro final' })
      ).toBeInTheDocument();
    });
  });
});
