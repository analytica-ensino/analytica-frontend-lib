import type { Story } from '@ladle/react';
import { useState, useCallback } from 'react';
import { LessonPreview, type PreviewLesson } from './LessonPreview';
import { useTheme } from '@/index';
import type { Lesson } from '../../types/lessons';
import type { WhiteboardImage } from '../Whiteboard/Whiteboard';

/**
 * Mock lessons data with video, podcast and board images information
 */
const mockLessons: (Lesson & {
  videoSrc?: string;
  videoPoster?: string;
  videoSubtitles?: string;
  podcastSrc?: string;
  podcastTitle?: string;
  boardImages?: WhiteboardImage[];
})[] = [
  {
    id: 'lesson-1',
    title: 'Introdução à Álgebra Linear',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Introdução+à+Álgebra+Linear',
    videoSubtitles:
      'data:text/vtt;charset=utf-8,WEBVTT%0A%0A00%3A00%3A00.000%20--%3E%2000%3A00%3A05.000%0AIntrodução%20à%20Álgebra%20Linear%0A%0A00%3A00%3A05.000%20--%3E%2000%3A00%3A10.000%0ANeste%20vídeo%20vamos%20aprender%20os%20conceitos%20básicos.',
    podcastSrc: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    podcastTitle: 'Podcast: Introdução à Álgebra Linear',
    boardImages: [
      {
        id: 'board-1-1',
        imageUrl: 'https://picsum.photos/seed/board1/450/180',
        title: 'Quadro 1 - Introdução',
      },
      {
        id: 'board-1-2',
        imageUrl: 'https://picsum.photos/seed/board2/450/180',
        title: 'Quadro 2 - Conceitos Básicos',
      },
      {
        id: 'board-1-3',
        imageUrl: 'https://picsum.photos/seed/board3/450/180',
        title: 'Quadro 3 - Exemplos Práticos',
      },
    ],
  },
  {
    id: 'lesson-2',
    title: 'Fotossíntese: Processo e Importância',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/00A651/FFFFFF?text=Fotossíntese',
    podcastSrc: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    podcastTitle: 'Podcast: Fotossíntese e seus Processos',
    boardImages: [
      {
        id: 'board-2-1',
        imageUrl: 'https://picsum.photos/seed/board4/450/180',
        title: 'Quadro 1 - Processo de Fotossíntese',
      },
      {
        id: 'board-2-2',
        imageUrl: 'https://picsum.photos/seed/board5/450/180',
        title: 'Quadro 2 - Estrutura das Folhas',
      },
    ],
  },
  {
    id: 'lesson-3',
    title: 'Revolução Francesa e seus Impactos',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/6366F1/FFFFFF?text=Revolução+Francesa',
  },
  {
    id: 'lesson-4',
    title: 'Equações do Segundo Grau',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Equações+do+Segundo+Grau',
  },
];

export const Default: Story = () => {
  const { isDark } = useTheme();

  const lessons: PreviewLesson[] = [
    {
      id: 'lesson-1',
      title: 'Introdução à Álgebra Linear',
    },
    {
      id: 'lesson-2',
      title: 'Fotossíntese: Processo e Importância',
    },
    {
      id: 'lesson-3',
      title: 'Revolução Francesa e seus Impactos',
    },
  ];

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        onRemoveAll={() => console.log('Remover tudo')}
        isDark={isDark}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const WithVideoPlayer: Story = () => {
  const { isDark } = useTheme();

  const lessons: PreviewLesson[] = mockLessons.slice(0, 3);

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        onRemoveAll={() => console.log('Remover tudo')}
        isDark={isDark}
        onVideoTimeUpdate={(lessonId, time) =>
          console.log(`Lesson ${lessonId} time: ${time}`)
        }
        onVideoComplete={(lessonId) =>
          console.log(`Lesson ${lessonId} completed`)
        }
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const WithVideoPlayerAndPodcast: Story = () => {
  const { isDark } = useTheme();

  const lessons: PreviewLesson[] = [
    mockLessons[0], // Has video, podcast, and board images
    mockLessons[1], // Has video, podcast, and board images
  ];

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        onRemoveAll={() => console.log('Remover tudo')}
        isDark={isDark}
        onPodcastEnded={async (lessonId) => {
          console.log(`Podcast ended for lesson ${lessonId}`);
        }}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const WithReorder: Story = () => {
  const { isDark } = useTheme();

  const initialLessons: PreviewLesson[] = mockLessons.slice(0, 4);

  const [lessons, setLessons] =
    useState<PreviewLesson[]>(initialLessons);

  const handleReorder = useCallback((ordered: PreviewLesson[]) => {
    setLessons(ordered);
    console.log('Reordered:', ordered.map(({ id, position }) => ({ id, position })));
  }, []);

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        onRemoveAll={() => console.log('Remover tudo')}
        onReorder={handleReorder}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
        isDark={isDark}
      />
    </div>
  );
};

export const WithRemoveLesson: Story = () => {
  const { isDark } = useTheme();

  const initialLessons: PreviewLesson[] = mockLessons.slice(0, 4);

  const [lessons, setLessons] =
    useState<PreviewLesson[]>(initialLessons);

  const handleRemoveLesson = useCallback((lessonId: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    console.log('Removed lesson:', lessonId);
  }, []);

  const handleRemoveAll = useCallback(() => {
    setLessons([]);
    console.log('Removed all lessons');
  }, []);

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        onRemoveLesson={handleRemoveLesson}
        onRemoveAll={handleRemoveAll}
        isDark={isDark}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const SingleLesson: Story = () => {
  const { isDark } = useTheme();

  const lessons: PreviewLesson[] = [mockLessons[0]];

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        onRemoveAll={() => console.log('Remover tudo')}
        isDark={isDark}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const Empty: Story = () => {
  const { isDark } = useTheme();

  return (
    <div className="p-6">
      <LessonPreview
        lessons={[]}
        onRemoveAll={() => console.log('Remover tudo')}
        isDark={isDark}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const CustomTitle: Story = () => {
  const { isDark } = useTheme();

  const lessons: PreviewLesson[] = mockLessons.slice(0, 3);

  return (
    <div className="p-6">
      <LessonPreview
        title="Aulas Selecionadas"
        lessons={lessons}
        onRemoveAll={() => console.log('Remover tudo')}
        isDark={isDark}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const WithCallbacks: Story = () => {
  const { isDark } = useTheme();

  const lessons: PreviewLesson[] = mockLessons.slice(0, 2);

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        onRemoveAll={() => console.log('Remover tudo')}
        isDark={isDark}
        onVideoTimeUpdate={(lessonId, time) =>
          console.log(`Video time update: ${lessonId} at ${time}s`)
        }
        onVideoComplete={(lessonId) =>
          console.log(`Video completed: ${lessonId}`)
        }
        onPodcastEnded={async (lessonId) => {
          console.log(`Podcast ended: ${lessonId}`);
        }}
        getInitialTimestamp={(lessonId) => {
          console.log(`Getting initial timestamp for: ${lessonId}`);
          return 0;
        }}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

