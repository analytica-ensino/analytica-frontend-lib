import type {
  Question,
  QuestionResult,
} from '../../components/Quiz/useQuizStore';
import type { ImagePoint } from '../../components/shared/ImageAnswerView';

/**
 * Fallback radius, in image percentage points, used when the payload does not
 * carry the backend's tolerance.
 *
 * The backend is the authority — it grades with its own value and now sends it
 * as `imageTolerance`. This only covers older payloads, and matches the value
 * the backend has always used.
 */
export const DEFAULT_IMAGE_TOLERANCE = 10;

/**
 * Read the answer key point of an IMAGEM question.
 *
 * The key lives in the question's single option, whose text is the JSON
 * `{"x": number, "y": number}` in percentage points of the image.
 *
 * @param options - The question's options
 * @returns The correct point, or null when there is no usable key
 *
 * @example
 * ```typescript
 * parseImageCorrectPoint([{ id: 'o1', option: '{"x":50,"y":30}' }]); // { x: 50, y: 30 }
 * ```
 */
export const parseImageCorrectPoint = (
  options: Question['options'] | undefined
): ImagePoint | null => {
  const first = options?.[0];
  if (!first?.option) {
    return null;
  }

  try {
    const parsed = JSON.parse(first.option);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * Read where the student clicked on an IMAGEM question.
 *
 * Prefers the structured `imageAnswer` the backend sends. Falls back to parsing
 * `answer`, which older payloads and the draft flow still use, in either the
 * `{x, y}` or `{coordinateX, coordinateY}` shape.
 *
 * @param result - The student's answer for the question
 * @returns The clicked point in percentage points (0-100), or null
 *
 * @example
 * ```typescript
 * parseImageStudentPoint({ imageAnswer: { coordinateX: 52, coordinateY: 28 } }); // { x: 52, y: 28 }
 * ```
 */
export const parseImageStudentPoint = (
  result: QuestionResult['answers'][number] | null | undefined
): ImagePoint | null => {
  if (!result) {
    return null;
  }

  if (result.imageAnswer) {
    const { coordinateX, coordinateY } = result.imageAnswer;
    if (typeof coordinateX === 'number' && typeof coordinateY === 'number') {
      return { x: coordinateX, y: coordinateY };
    }
  }

  if (!result.answer) {
    return null;
  }

  try {
    const parsed = JSON.parse(result.answer);
    const x =
      typeof parsed?.coordinateX === 'number' ? parsed.coordinateX : parsed?.x;
    const y =
      typeof parsed?.coordinateY === 'number' ? parsed.coordinateY : parsed?.y;
    if (typeof x === 'number' && typeof y === 'number') {
      return { x, y };
    }
  } catch {
    return null;
  }

  return null;
};
