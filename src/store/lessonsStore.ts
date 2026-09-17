import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEYS } from '../utils/keys';
import type { LessonProgress, LessonDetails } from '../types/lessonsCatalog';
import { useAuthStore } from './authStore';

/**
 * Interface defining the lessons state
 */
interface LessonsState {
  // State
  currentLesson: LessonDetails | null;
  lessons: LessonDetails[];
  lessonsProgress: Record<string, LessonProgress>;
  lastWatchedTimestamps: Record<string, number>;
  currentTopicId: string | null;
  ownerUserId: string | null;

  // Actions
  setCurrentLesson: (lesson: LessonDetails | null) => void;
  setLessons: (lessons: LessonDetails[]) => void;
  updateLessonProgress: (lessonId: string, progress: LessonProgress) => void;
  updateLessonDuration: (lessonId: string, duration: number) => void;
  updateTimestamp: (lessonId: string, timestamp: number) => void;
  markLessonComplete: (lessonId: string) => void;
  getNextLesson: () => LessonDetails | null;
  getPreviousLesson: () => LessonDetails | null;
  getLastWatchedLesson: () => LessonDetails | null;
  setCurrentTopicId: (topicId: string | null) => void;
  clearLessonsData: () => void;
}

/**
 * Zustand store holding a student's lesson progress, persisted to
 * localStorage.
 *
 * Only the student portal writes here — the teacher/manager preview never
 * touches it, because those profiles have no progress of their own.
 *
 * @returns {LessonsState} The lessons state store
 */
export const useLessonsStore = create<LessonsState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLesson: null,
      lessons: [],
      lessonsProgress: {},
      lastWatchedTimestamps: {},
      currentTopicId: null,
      ownerUserId: null,

      /**
       * Set the current lesson being viewed
       * @param {LessonDetails | null} lesson - The lesson to set as current
       * @returns {void}
       */
      setCurrentLesson: (lesson: LessonDetails | null): void => {
        set({ currentLesson: lesson });
      },

      /**
       * Set the list of lessons for the current topic
       * @param {LessonDetails[]} lessons - Array of lessons
       * @returns {void}
       */
      setLessons: (lessons: LessonDetails[]): void => {
        set({ lessons });
      },

      /**
       * Update progress for a specific lesson
       * @param {string} lessonId - The lesson ID
       * @param {LessonProgress} progress - The progress data
       * @returns {void}
       */
      updateLessonProgress: (
        lessonId: string,
        progress: LessonProgress
      ): void => {
        set((state) => ({
          lessonsProgress: {
            ...state.lessonsProgress,
            [lessonId]: progress,
          },
        }));
      },

      /**
       * Update the duration of a lesson when video metadata is loaded
       * @param {string} lessonId - The lesson ID
       * @param {number} duration - The video duration in seconds
       * @returns {void}
       */
      updateLessonDuration: (lessonId: string, duration: number): void => {
        set((state) => ({
          lessons: state.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, videoDuration: duration }
              : lesson
          ),
          currentLesson:
            state.currentLesson?.id === lessonId
              ? { ...state.currentLesson, videoDuration: duration }
              : state.currentLesson,
          lessonsProgress: {
            ...state.lessonsProgress,
            [lessonId]: state.lessonsProgress[lessonId]
              ? {
                  ...state.lessonsProgress[lessonId],
                  totalSeconds: duration,
                }
              : {
                  lessonId,
                  watchedSeconds: 0,
                  totalSeconds: duration,
                  completed: false,
                  lastWatchedAt: new Date().toISOString(),
                  progressPercentage: 0,
                },
          },
        }));
      },

      /**
       * Update the last watched timestamp for a lesson
       * @param {string} lessonId - The lesson ID
       * @param {number} timestamp - The timestamp in seconds
       * @returns {void}
       */
      updateTimestamp: (lessonId: string, timestamp: number): void => {
        set((state) => ({
          lastWatchedTimestamps: {
            ...state.lastWatchedTimestamps,
            [lessonId]: timestamp,
          },
        }));
      },

      /**
       * Mark a lesson as completed
       * @param {string} lessonId - The lesson ID to mark as complete
       * @returns {void}
       */
      markLessonComplete: (lessonId: string): void => {
        set((state) => ({
          lessonsProgress: {
            ...state.lessonsProgress,
            [lessonId]: {
              ...state.lessonsProgress[lessonId],
              completed: true,
              completedAt: new Date().toISOString(),
            },
          },
        }));
      },

      /**
       * Get the next lesson in the sequence
       * @returns {LessonDetails | null} The next lesson or null
       */
      getNextLesson: (): LessonDetails | null => {
        const { currentLesson, lessons } = get();
        if (!currentLesson || lessons.length === 0) return null;

        const currentIndex = lessons.findIndex(
          (l) => l.id === currentLesson.id
        );
        if (currentIndex === -1 || currentIndex === lessons.length - 1)
          return null;

        return lessons[currentIndex + 1];
      },

      /**
       * Get the previous lesson in the sequence
       * @returns {LessonDetails | null} The previous lesson or null
       */
      getPreviousLesson: (): LessonDetails | null => {
        const { currentLesson, lessons } = get();
        if (!currentLesson || lessons.length === 0) return null;

        const currentIndex = lessons.findIndex(
          (l) => l.id === currentLesson.id
        );
        if (currentIndex <= 0) return null;

        return lessons[currentIndex - 1];
      },

      /**
       * Get the last watched lesson or the first incomplete lesson
       * @returns {LessonDetails | null} The lesson to resume or null
       */
      getLastWatchedLesson: (): LessonDetails | null => {
        const { lessons, lessonsProgress } = get();
        if (lessons.length === 0) return null;

        // Find the most recently watched incomplete lesson
        let lastWatched: LessonDetails | null = null;
        let lastWatchedTime: string | null = null;

        for (const lesson of lessons) {
          const progress = lessonsProgress[lesson.id];
          if (progress && !progress.completed && progress.lastWatchedAt) {
            if (!lastWatchedTime || progress.lastWatchedAt > lastWatchedTime) {
              lastWatched = lesson;
              lastWatchedTime = progress.lastWatchedAt;
            }
          }
        }

        // If no incomplete lesson was watched, return the first incomplete lesson
        lastWatched ??=
          lessons.find((lesson) => {
            const progress = lessonsProgress[lesson.id];
            return !progress?.completed;
          }) ?? null;

        // If all lessons are complete, return the first lesson
        return lastWatched || lessons[0];
      },

      /**
       * Set the current topic ID
       * @param {string | null} topicId - The topic ID
       * @returns {void}
       */
      setCurrentTopicId: (topicId: string | null): void => {
        set({ currentTopicId: topicId });
      },

      /**
       * Clear all lessons data (useful when switching topics)
       * @returns {void}
       */
      clearLessonsData: (): void => {
        set({
          currentLesson: null,
          lessons: [],
          lessonsProgress: {},
          lastWatchedTimestamps: {},
          currentTopicId: null,
          ownerUserId: null,
        });
      },
    }),
    {
      name: KEYS.LESSONS_STORAGE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lessonsProgress: state.lessonsProgress,
        // lastWatchedTimestamps removed from persist to improve performance
        currentTopicId: state.currentTopicId,
        ownerUserId: state.ownerUserId,
      }),
      onRehydrateStorage: () => (rehydrated) => {
        if (!rehydrated) return;
        const currentUserId = useAuthStore.getState().user?.id ?? null;
        if (
          rehydrated.ownerUserId &&
          rehydrated.ownerUserId !== currentUserId
        ) {
          useLessonsStore.getState().clearLessonsData();
        }
      },
    }
  )
);

// Clear lessons whenever a different user logs in (same-tab user switch)
let _lastUserId: string | null = useAuthStore.getState().user?.id ?? null;
useAuthStore.subscribe((state) => {
  const nextId = state.user?.id ?? null;
  if (nextId !== _lastUserId) {
    useLessonsStore.getState().clearLessonsData();
    if (nextId) {
      useLessonsStore.setState({ ownerUserId: nextId });
    }
    _lastUserId = nextId;
  }
});
