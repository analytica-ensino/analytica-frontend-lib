import { useLessonsStore } from './lessonsStore';
import { KEYS } from '../utils/keys';
import type { LessonDetails } from '../types/lessonsCatalog';

function lesson(
  id: string,
  overrides: Partial<LessonDetails> = {}
): LessonDetails {
  return {
    id,
    title: `Aula ${id}`,
    videoUrl: `https://cdn.test/${id}.mp4`,
    videoDuration: 0,
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    contentId: `content-${id}`,
    questionnaire: null,
    boardImages: [],
    ...overrides,
  };
}

function progress(id: string, overrides = {}) {
  return {
    lessonId: id,
    watchedSeconds: 0,
    totalSeconds: 0,
    completed: false,
    progressPercentage: 0,
    ...overrides,
  };
}

describe('useLessonsStore', () => {
  beforeEach(() => {
    useLessonsStore.getState().clearLessonsData();
  });

  it('holds the current lesson and the topic list', () => {
    const store = useLessonsStore.getState();
    store.setLessons([lesson('a'), lesson('b')]);
    store.setCurrentLesson(lesson('a'));

    expect(useLessonsStore.getState().lessons).toHaveLength(2);
    expect(useLessonsStore.getState().currentLesson?.id).toBe('a');
  });

  it('stores progress per lesson', () => {
    useLessonsStore
      .getState()
      .updateLessonProgress('a', progress('a', { progressPercentage: 42 }));

    expect(
      useLessonsStore.getState().lessonsProgress.a.progressPercentage
    ).toBe(42);
  });

  it('marks a lesson complete and stamps the completion time', () => {
    const store = useLessonsStore.getState();
    store.updateLessonProgress('a', progress('a'));
    store.markLessonComplete('a');

    const stored = useLessonsStore.getState().lessonsProgress.a;
    expect(stored.completed).toBe(true);
    expect(stored.completedAt).toBeDefined();
  });

  describe('updateLessonDuration', () => {
    it('writes the duration onto the lesson, the current lesson and the progress', () => {
      const store = useLessonsStore.getState();
      store.setLessons([lesson('a'), lesson('b')]);
      store.setCurrentLesson(lesson('a'));
      store.updateLessonProgress('a', progress('a', { watchedSeconds: 10 }));

      store.updateLessonDuration('a', 600);

      const state = useLessonsStore.getState();
      expect(state.lessons[0].videoDuration).toBe(600);
      expect(state.lessons[1].videoDuration).toBe(0);
      expect(state.currentLesson?.videoDuration).toBe(600);
      expect(state.lessonsProgress.a.totalSeconds).toBe(600);
      // An existing entry keeps the seconds already watched.
      expect(state.lessonsProgress.a.watchedSeconds).toBe(10);
    });

    it('creates a progress entry when none exists yet', () => {
      useLessonsStore.getState().updateLessonDuration('a', 300);

      expect(useLessonsStore.getState().lessonsProgress.a).toMatchObject({
        lessonId: 'a',
        totalSeconds: 300,
        watchedSeconds: 0,
        completed: false,
      });
    });
  });

  it('keeps the last watched timestamp per lesson', () => {
    useLessonsStore.getState().updateTimestamp('a', 120);
    expect(useLessonsStore.getState().lastWatchedTimestamps.a).toBe(120);
  });

  it('persists the resume position across a reload', () => {
    useLessonsStore.getState().updateTimestamp('a', 120);

    // The page feeds this to the player as `initialTime`, and the player takes
    // any finite value >= 0 as authoritative. Dropping it from the persisted
    // slice means a literal 0 after a reload, which shadows the player's own
    // saved position and restarts the lesson from the beginning.
    const persisted = JSON.parse(
      localStorage.getItem(KEYS.LESSONS_STORAGE) ?? '{}'
    );
    expect(persisted.state.lastWatchedTimestamps).toEqual({ a: 120 });
  });

  describe('sequence navigation', () => {
    beforeEach(() => {
      const store = useLessonsStore.getState();
      store.setLessons([lesson('a'), lesson('b'), lesson('c')]);
    });

    it('walks forwards and backwards', () => {
      useLessonsStore.getState().setCurrentLesson(lesson('b'));

      expect(useLessonsStore.getState().getNextLesson()?.id).toBe('c');
      expect(useLessonsStore.getState().getPreviousLesson()?.id).toBe('a');
    });

    it('stops at the ends', () => {
      useLessonsStore.getState().setCurrentLesson(lesson('c'));
      expect(useLessonsStore.getState().getNextLesson()).toBeNull();

      useLessonsStore.getState().setCurrentLesson(lesson('a'));
      expect(useLessonsStore.getState().getPreviousLesson()).toBeNull();
    });

    it('returns null without a current lesson', () => {
      expect(useLessonsStore.getState().getNextLesson()).toBeNull();
      expect(useLessonsStore.getState().getPreviousLesson()).toBeNull();
    });

    it('returns null when the current lesson is not in the list', () => {
      useLessonsStore.getState().setCurrentLesson(lesson('zzz'));
      expect(useLessonsStore.getState().getNextLesson()).toBeNull();
    });
  });

  describe('getLastWatchedLesson', () => {
    it('returns null when there are no lessons', () => {
      expect(useLessonsStore.getState().getLastWatchedLesson()).toBeNull();
    });

    it('picks the most recently watched incomplete lesson', () => {
      const store = useLessonsStore.getState();
      store.setLessons([lesson('a'), lesson('b'), lesson('c')]);
      store.updateLessonProgress(
        'a',
        progress('a', { lastWatchedAt: '2026-01-01T00:00:00.000Z' })
      );
      store.updateLessonProgress(
        'b',
        progress('b', { lastWatchedAt: '2026-02-01T00:00:00.000Z' })
      );

      expect(useLessonsStore.getState().getLastWatchedLesson()?.id).toBe('b');
    });

    it('falls back to the first incomplete lesson', () => {
      const store = useLessonsStore.getState();
      store.setLessons([lesson('a'), lesson('b')]);
      store.updateLessonProgress('a', progress('a', { completed: true }));

      expect(useLessonsStore.getState().getLastWatchedLesson()?.id).toBe('b');
    });

    it('falls back to the first lesson when everything is complete', () => {
      const store = useLessonsStore.getState();
      store.setLessons([lesson('a'), lesson('b')]);
      store.updateLessonProgress('a', progress('a', { completed: true }));
      store.updateLessonProgress('b', progress('b', { completed: true }));

      expect(useLessonsStore.getState().getLastWatchedLesson()?.id).toBe('a');
    });
  });

  it('tracks the current topic', () => {
    useLessonsStore.getState().setCurrentTopicId('subtopic-1');
    expect(useLessonsStore.getState().currentTopicId).toBe('subtopic-1');
  });

  it('clears everything, including the owner', () => {
    const store = useLessonsStore.getState();
    store.setLessons([lesson('a')]);
    store.setCurrentLesson(lesson('a'));
    store.updateLessonProgress('a', progress('a'));
    store.updateTimestamp('a', 10);
    store.setCurrentTopicId('subtopic-1');

    store.clearLessonsData();

    expect(useLessonsStore.getState()).toMatchObject({
      currentLesson: null,
      lessons: [],
      lessonsProgress: {},
      lastWatchedTimestamps: {},
      currentTopicId: null,
      ownerUserId: null,
    });
  });
});
