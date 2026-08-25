import type { ReactNode } from 'react';
import { ANSWER_STATUS } from '../../../components/Quiz/useQuizStore';
import type { QuestionRendererProps } from '../types';
import { getStatusStyles } from '../../../components/Quiz/QuizContent';
import { prependLetterToHtml } from '../../../components/Quiz/Quiz.utils';
import { HtmlMathRenderer } from '../../../components/HtmlMathRenderer';
import Text from '../../../components/Text/Text';
import { OptionStatus } from '../../../enums/Options';
import { cn } from '../../../utils/utils';
import { stripHtmlTags } from '../../stringUtils';
import { getStatusBadge } from '../components';

/** One matching pair, already normalized for rendering. */
interface MatchingPair {
  id: string;
  /** Left-hand item; may contain HTML and LaTeX */
  leftItem: string;
  /** What the student matched to it. Null when left blank. */
  studentValue: string | null;
  /** Answer key for this pair. Null when the question carries none. */
  correctValue: string | null;
}

/**
 * Normalize a value before comparing it, the same way the backend does.
 *
 * `evaluateMatchingAnswers` grades with `trim().toLowerCase()`, so comparing the
 * raw strings here could mark a pair red that the backend counted as correct.
 */
const normalizeValue = (value: string): string => value.trim().toLowerCase();

/**
 * Read the student's picks out of the raw `answer` column.
 *
 * Submissions exist in two shapes: the canonical array the backend persists and
 * an older map keyed by option id. `answer` is free text, so a malformed value
 * must degrade to "nothing answered" rather than break the correction screen.
 *
 * @param answer - Raw `answer` value from the student's submission
 * @returns Map of option id to the value the student picked
 */
const parseLegacyAnswer = (answer: string | null): Map<string, string> => {
  const picks = new Map<string, string>();
  if (!answer) return picks;

  try {
    const parsed: unknown = JSON.parse(answer);

    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        const { optionId, selectedValue } = (entry ?? {}) as {
          optionId?: unknown;
          selectedValue?: unknown;
        };
        if (typeof optionId === 'string' && typeof selectedValue === 'string') {
          picks.set(optionId, selectedValue);
        }
      }
      return picks;
    }

    if (parsed !== null && typeof parsed === 'object') {
      for (const [optionId, selectedValue] of Object.entries(parsed)) {
        if (typeof selectedValue === 'string') {
          picks.set(optionId, selectedValue);
        }
      }
    }
  } catch {
    // Malformed JSON means the answer is unreadable, not that the screen fails.
  }

  return picks;
};

/**
 * Render a connect-the-dots (RELACIONAR) question.
 *
 * Each option row is one pair: `option` holds the left-hand item and
 * `correctValue` its correct match. The student's picks arrive in
 * `matchingAnswers`, keyed by option id.
 *
 * Replaces a placeholder that rendered the words "não implementado" and ignored
 * both `question` and `result`, which left the teacher writing a comment on a
 * question whose answer was never shown.
 *
 * Returns content without wrapper (for accordion use).
 *
 * @param props - Question renderer props
 * @returns JSX element
 */
export const renderQuestionConnectDots = ({
  question,
  result,
}: QuestionRendererProps): ReactNode => {
  const options = question?.options || [];

  const picks =
    result?.matchingAnswers && result.matchingAnswers.length > 0
      ? new Map(
          result.matchingAnswers.map((match) => [
            match.optionId,
            match.selectedValue,
          ])
        )
      : parseLegacyAnswer(result?.answer ?? null);

  const pairs: MatchingPair[] = options.map((option) => ({
    id: option.id,
    leftItem: option.option,
    studentValue: picks.get(option.id) ?? null,
    correctValue: option.correctValue ?? null,
  }));

  const shouldShowStatus =
    result?.answerStatus !== ANSWER_STATUS.PENDENTE_AVALIACAO &&
    result?.answerStatus !== ANSWER_STATUS.NAO_RESPONDIDO;

  // 97 = 'a' in ASCII
  const getLetterByIndex = (index: number) => String.fromCodePoint(97 + index);

  if (pairs.length === 0) {
    return (
      <div className="pt-2">
        <Text size="sm" className="text-text-500 italic">
          Nenhuma opção de relacionamento disponível
        </Text>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="flex flex-col gap-3.5">
        {pairs.map((pair, index) => {
          const hasAnswerKey = pair.correctValue !== null;
          const hasAnswered = pair.studentValue !== null;

          const isStudentCorrect =
            hasAnswerKey &&
            hasAnswered &&
            normalizeValue(pair.studentValue as string) ===
              normalizeValue(pair.correctValue as string);

          // Correctness is only shown once the answer key is known AND the
          // answer is no longer pending.
          const canShowCorrectness = shouldShowStatus && hasAnswerKey;
          const variantCorrect = isStudentCorrect
            ? OptionStatus.CORRECT
            : OptionStatus.INCORRECT;

          return (
            <section
              key={pair.id || `pair-${index}`}
              className="flex flex-col gap-2"
            >
              <div
                className={cn(
                  'grid grid-cols-[1fr_auto] items-center gap-4 p-2 rounded-md border',
                  canShowCorrectness && hasAnswered
                    ? getStatusStyles(variantCorrect)
                    : ''
                )}
              >
                <HtmlMathRenderer
                  content={prependLetterToHtml(
                    getLetterByIndex(index),
                    pair.leftItem
                  )}
                  className="text-text-900 text-sm"
                />

                {canShowCorrectness && hasAnswered && (
                  <div className="flex-shrink-0">
                    {getStatusBadge(variantCorrect)}
                  </div>
                )}
              </div>

              {canShowCorrectness && (
                <span className="flex flex-row gap-2 items-center flex-wrap">
                  {hasAnswered ? (
                    <>
                      <Text size="2xs" weight="normal" color="text-text-800">
                        Resposta selecionada:{' '}
                        {stripHtmlTags(pair.studentValue as string)}
                      </Text>
                      {!isStudentCorrect && (
                        <Text size="2xs" weight="normal" color="text-text-800">
                          | Resposta correta:{' '}
                          {stripHtmlTags(pair.correctValue as string)}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text size="2xs" weight="normal" color="text-text-800">
                      Não respondida | Resposta correta:{' '}
                      {stripHtmlTags(pair.correctValue as string)}
                    </Text>
                  )}
                </span>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
