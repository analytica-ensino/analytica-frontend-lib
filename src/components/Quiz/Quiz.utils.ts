import type { QuestionAnswerResult, TrueOrFalseOptionState } from './Quiz.types';

/**
 * Shuffle array using a seed for consistent ordering per question
 * Uses Fisher-Yates shuffle with seeded random for deterministic results
 */
export const shuffleWithSeed = <T,>(array: T[], seed: string): T[] => {
  const shuffled = [...array];
  // Simple hash function to convert string seed to number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Fisher-Yates shuffle with seeded random
  const seededRandom = (max: number) => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash % max;
  };
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = seededRandom(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Helper to prepend letter to HTML content (handles <p> tags)
 * @example prependLetterToHtml('a', '<p>Text</p>') => '<p>a) Text</p>'
 * @example prependLetterToHtml('a', 'Text') => 'a) Text'
 */
export const prependLetterToHtml = (letter: string, html: string): string => {
  if (html.trim().startsWith('<p>')) {
    return html.replace(/^(\s*<p>)/, `$1${letter}) `);
  }
  return `${letter}) ${html}`;
};

/**
 * Compute state for a true/false option
 * Handles both interactive (default) and result modes
 */
export const getTrueOrFalseOptionState = (
  optionId: string,
  variant: string,
  currentQuestionResult: QuestionAnswerResult | null | undefined,
  localAnswers: Record<string, string>
): TrueOrFalseOptionState => {
  // Get whether the statement is TRUE or FALSE from persisted result
  const gabaritoOption = currentQuestionResult?.options?.find(
    (op) => op.id === optionId
  );
  const isStatementTrue =
    variant === 'result' ? (gabaritoOption?.isCorrect ?? false) : false;

  // Get student's selection from selectedOptions
  const studentSelection =
    variant === 'result'
      ? currentQuestionResult?.selectedOptions?.find(
          (op) => op.optionId === optionId
        )
      : undefined;

  // Determine if answered and what was marked
  const hasAnswered =
    variant === 'result'
      ? studentSelection !== undefined
      : !!localAnswers[optionId];

  const studentMarkedTrue =
    variant === 'result'
      ? (studentSelection?.isCorrect ?? false)
      : localAnswers[optionId] === 'V';

  // Compute display values
  const studentAnswer =
    variant === 'result'
      ? hasAnswered
        ? studentMarkedTrue
          ? 'V'
          : 'F'
        : '-'
      : localAnswers[optionId] || '-';

  const correctAnswer = isStatementTrue ? 'V' : 'F';
  const isStudentCorrect = hasAnswered && studentMarkedTrue === isStatementTrue;
  const variantCorrect = isStudentCorrect ? 'correct' : 'incorrect';

  return {
    isStatementTrue,
    hasAnswered,
    studentMarkedTrue,
    studentAnswer,
    correctAnswer,
    isStudentCorrect,
    variantCorrect,
  };
};
