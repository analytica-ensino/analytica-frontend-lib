import { CORRECTION_SOURCE } from './useQuizStore';

/** The three fields that decide which correction text is on screen. */
export interface CorrectionTextSource {
  teacherFeedback?: string | null;
  aiFeedback?: string | null;
  correctionSource?: CORRECTION_SOURCE | null;
}

/**
 * Which correction text to show for an answer.
 *
 * `correctionSource` is the discriminator, not truthiness of the texts. Only an
 * `IA` correction means the teacher has not written anything yet, and only then
 * does the AI's text stand in. Every other case — reviewed by a teacher, graded
 * by a teacher alone, or a plain comment with no AI involved — shows the
 * teacher's own text.
 *
 * Falling back from `teacherFeedback` to `aiFeedback` on truthiness looks
 * equivalent and is not: the grading endpoint accepts an empty
 * `teacherFeedback` (`z.string().max(2000)`, no minimum), so a teacher who
 * deliberately clears the AI's wording and saves gets `''` persisted. A
 * truthiness fallback treats that as "nothing written" and puts the AI text
 * back on screen — and the next save writes it into the teacher's own column,
 * silently undoing the deletion.
 *
 * @param source - The answer's correction fields
 * @returns The text to display, or an empty string when there is none
 *
 * @example
 * ```typescript
 * resolveCorrectionText({ aiFeedback: 'X', correctionSource: CORRECTION_SOURCE.IA });
 * // 'X' — the teacher has not reviewed it yet
 *
 * resolveCorrectionText({
 *   teacherFeedback: '',
 *   aiFeedback: 'X',
 *   correctionSource: CORRECTION_SOURCE.IA_PROFESSOR,
 * });
 * // '' — the teacher cleared it on purpose, and it stays cleared
 * ```
 */
export const resolveCorrectionText = (source: CorrectionTextSource): string => {
  if (source.correctionSource === CORRECTION_SOURCE.IA) {
    return source.aiFeedback ?? '';
  }

  return source.teacherFeedback ?? '';
};
