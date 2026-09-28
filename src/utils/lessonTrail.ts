import type { Lesson } from '../types/lessons';

/**
 * Builds the lesson trail (area › subject › topic › subtopic › content),
 * keeping only the levels that have a name.
 *
 * @param lesson - Lesson whose hierarchy will be read
 * @returns Ordered list of non-empty level names
 */
export const buildLessonTrail = (
  lesson: Pick<
    Lesson,
    'areaKnowledge' | 'subject' | 'topic' | 'subtopic' | 'content'
  >
): string[] =>
  [
    lesson.areaKnowledge?.name,
    lesson.subject?.name,
    lesson.topic?.name,
    lesson.subtopic?.name,
    lesson.content?.name,
  ].filter((name): name is string => Boolean(name?.trim()));
