import {
  mapApiLessonToLessonDetails,
  DEFAULT_PODCAST_TITLE,
} from './lessonsCatalog';
import type { ApiLessonData } from '../types/lessonsCatalog';

function apiLesson(overrides: Partial<ApiLessonData> = {}): ApiLessonData {
  return {
    id: 'lesson-1',
    areaKnowledgeId: 'area-1',
    subjectId: 'subject-1',
    topicId: 'topic-1',
    subtopicId: 'subtopic-1',
    contentId: 'content-1',
    urlVideo: 'https://cdn.test/v.mp4',
    urlPodCast: '',
    urlCover: 'https://cdn.test/c.png',
    urlInitialFrame: '',
    urlFinalFrame: '',
    urlDoc: '',
    urlSubtitle: '',
    videoTitle: 'Aula de DNA',
    podCastTitle: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    questionnaire: null,
    areaKnowledge: { id: 'area-1', name: 'Ciências' },
    subject: { id: 'subject-1', name: 'Biologia', color: '#0f0', icon: 'Dna' },
    topic: { id: 'topic-1', name: 'Genética' },
    subtopic: { id: 'subtopic-1', name: 'DNA' },
    content: { id: 'content-1', name: 'Estrutura do DNA', bnccCode: 'EM13CNT' },
    ...overrides,
  };
}

describe('mapApiLessonToLessonDetails', () => {
  it('maps the core fields and derives the display order from the index', () => {
    const lesson = mapApiLessonToLessonDetails(apiLesson(), 2);

    expect(lesson).toMatchObject({
      id: 'lesson-1',
      contentId: 'content-1',
      title: 'Aula de DNA',
      description: 'Estrutura do DNA',
      bnccCode: 'EM13CNT',
      videoUrl: 'https://cdn.test/v.mp4',
      thumbnailUrl: 'https://cdn.test/c.png',
      order: 3,
    });
  });

  it('builds a podcast whenever there is an audio URL', () => {
    const lesson = mapApiLessonToLessonDetails(
      apiLesson({
        urlPodCast: 'https://cdn.test/p.mp3',
        podCastTitle: 'Episódio 1',
      }),
      0
    );

    expect(lesson.podcast).toEqual({
      id: 'lesson-1-podcast',
      title: 'Episódio 1',
      audioUrl: 'https://cdn.test/p.mp3',
      duration: 0,
    });
  });

  it('names an untitled podcast rather than hiding it', () => {
    // The backend counts the `audio` criterion from urlPodCast alone. Requiring
    // a title here once hid the player, so the criterion could never be met and
    // those lessons were stuck below 100% for good.
    const lesson = mapApiLessonToLessonDetails(
      apiLesson({ urlPodCast: 'https://cdn.test/p.mp3', podCastTitle: '' }),
      0
    );

    expect(lesson.podcast?.title).toBe(DEFAULT_PODCAST_TITLE);
  });

  it('omits the podcast when there is no audio URL', () => {
    expect(mapApiLessonToLessonDetails(apiLesson(), 0).podcast).toBeUndefined();
  });

  it('builds the board images from the frame URLs, in order', () => {
    const lesson = mapApiLessonToLessonDetails(
      apiLesson({
        urlInitialFrame: 'https://cdn.test/i.png',
        urlFinalFrame: 'https://cdn.test/f.png',
      }),
      0
    );

    expect(lesson.boardImages).toEqual([
      {
        id: 'lesson-1-initial',
        imageUrl: 'https://cdn.test/i.png',
        title: 'Quadro Inicial',
        order: 1,
      },
      {
        id: 'lesson-1-final',
        imageUrl: 'https://cdn.test/f.png',
        title: 'Quadro Final',
        order: 2,
      },
    ]);
  });

  it('returns no board images when neither frame exists', () => {
    expect(mapApiLessonToLessonDetails(apiLesson(), 0).boardImages).toEqual([]);
  });

  it('converts the reported time spent from minutes to seconds', () => {
    const lesson = mapApiLessonToLessonDetails(
      apiLesson({
        progress: {
          id: 'p-1',
          userId: 'u-1',
          lessonId: 'lesson-1',
          progress: 80,
          video: true,
          audio: false,
          initialFrame: false,
          finalFrame: false,
          lessonDoc: false,
          coin: null,
          scoreCoin: null,
          timeSpent: 3,
          lastInteraction: '2026-01-03T00:00:00.000Z',
          contentDownloaded: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      }),
      0
    );

    expect(lesson.progress).toEqual({
      lessonId: 'lesson-1',
      watchedSeconds: 180,
      totalSeconds: 0,
      completed: true,
      lastWatchedAt: '2026-01-03T00:00:00.000Z',
      completedAt: '2026-01-02T00:00:00.000Z',
      progressPercentage: 80,
    });
  });

  it('maps a lesson that carries no progress at all', () => {
    // Teachers and managers get lessons without a progress row; the mapping
    // must stay total instead of throwing.
    const lesson = mapApiLessonToLessonDetails(apiLesson(), 0);

    expect(lesson.progress).toEqual({
      lessonId: 'lesson-1',
      watchedSeconds: 0,
      totalSeconds: 0,
      completed: false,
      lastWatchedAt: undefined,
      completedAt: undefined,
      progressPercentage: 0,
    });
  });

  it('leaves the subtitle undefined when the URL is empty', () => {
    expect(
      mapApiLessonToLessonDetails(apiLesson({ urlSubtitle: '' }), 0).subtitleUrl
    ).toBeUndefined();
    expect(
      mapApiLessonToLessonDetails(
        apiLesson({ urlSubtitle: 'https://cdn.test/s.vtt' }),
        0
      ).subtitleUrl
    ).toBe('https://cdn.test/s.vtt');
  });
});
