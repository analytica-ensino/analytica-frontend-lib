import type { ApiLessonData, LessonDetails } from '../types/lessonsCatalog';

/**
 * Fallback label for lessons whose podcast was uploaded without a title.
 */
export const DEFAULT_PODCAST_TITLE = 'Podcast';

/**
 * Map a lesson as returned by the API into the shape the lesson page renders.
 *
 * @param apiLesson - Raw lesson from `/lesson/by-subtopic/:id` or `/lesson/:id`
 * @param index - Position in the list, used as the display order (the API does
 * not return one)
 * @returns The lesson in the internal format
 *
 * @example
 * ```typescript
 * const lessons = response.data.map(mapApiLessonToLessonDetails);
 * ```
 */
export function mapApiLessonToLessonDetails(
  apiLesson: ApiLessonData,
  index: number
): LessonDetails {
  return {
    id: apiLesson.id,
    contentId: apiLesson.contentId,
    title: apiLesson.videoTitle,
    description: apiLesson.content.name,
    bnccCode: apiLesson.content.bnccCode,
    videoUrl: apiLesson.urlVideo,
    videoDuration: 0, // Duration not provided by API, will be set when video loads
    thumbnailUrl: apiLesson.urlCover,
    order: index + 1, // Use index as order since API doesn't provide order
    createdAt: apiLesson.createdAt,
    updatedAt: apiLesson.updatedAt,
    // Preserve download URLs for DownloadButton
    urlDoc: apiLesson.urlDoc,
    urlInitialFrame: apiLesson.urlInitialFrame,
    urlFinalFrame: apiLesson.urlFinalFrame,
    urlPodCast: apiLesson.urlPodCast,
    // Only the audio URL decides whether the lesson has a podcast, mirroring
    // the backend, which counts the `audio` criterion whenever `urlPodCast` is
    // filled. Requiring a title here hid the player on lessons with an untitled
    // podcast, so the criterion could never be satisfied and those lessons were
    // stuck below 100% for good.
    podcast: apiLesson.urlPodCast
      ? {
          id: `${apiLesson.id}-podcast`,
          title: apiLesson.podCastTitle || DEFAULT_PODCAST_TITLE,
          audioUrl: apiLesson.urlPodCast,
          duration: 0, // Duration not provided
        }
      : undefined,
    quiz: undefined, // Quiz data not provided in this API
    questionnaire: apiLesson.questionnaire,
    boardImages: [
      ...(apiLesson.urlInitialFrame
        ? [
            {
              id: `${apiLesson.id}-initial`,
              imageUrl: apiLesson.urlInitialFrame,
              title: 'Quadro Inicial',
              order: 1,
            },
          ]
        : []),
      ...(apiLesson.urlFinalFrame
        ? [
            {
              id: `${apiLesson.id}-final`,
              imageUrl: apiLesson.urlFinalFrame,
              title: 'Quadro Final',
              order: 2,
            },
          ]
        : []),
    ],
    // Progress is absent for teachers and managers; the optional chaining keeps
    // the mapping total for every profile.
    progress: {
      lessonId: apiLesson.id,
      watchedSeconds: apiLesson.progress?.timeSpent
        ? apiLesson.progress.timeSpent * 60
        : 0, // Convert minutes to seconds
      totalSeconds: 0, // Will be updated when video loads
      completed: apiLesson.progress?.video || false,
      lastWatchedAt: apiLesson.progress?.lastInteraction || undefined,
      completedAt: apiLesson.progress?.video
        ? apiLesson.progress.updatedAt
        : undefined,
      progressPercentage: apiLesson.progress?.progress || 0,
    },
    subtitleUrl: apiLesson.urlSubtitle || undefined,
  };
}
