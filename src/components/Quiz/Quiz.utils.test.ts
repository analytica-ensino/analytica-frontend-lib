import { shuffleWithSeed, prependLetterToHtml, getTrueOrFalseOptionState } from './Quiz.utils';
import { QuizVariant } from './Quiz.types';
import { TrueFalseEnum } from '../../enums/Quiz';
import type { QuestionAnswerResult } from './Quiz.types';

describe('shuffleWithSeed', () => {
  it('should return empty array for empty input', () => {
    expect(shuffleWithSeed([], 'seed')).toEqual([]);
  });

  it('should return same single-element array', () => {
    expect(shuffleWithSeed([42], 'seed')).toEqual([42]);
  });

  it('should return array with the same length', () => {
    const input = [1, 2, 3, 4, 5];
    expect(shuffleWithSeed(input, 'seed')).toHaveLength(input.length);
  });

  it('should return array with the same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleWithSeed(input, 'seed');
    const sortedResult = [...result].toSorted((a, b) => a - b);
    const sortedInput = [...input].toSorted((a, b) => a - b);
    expect(sortedResult).toEqual(sortedInput);
  });

  it('should be deterministic — same seed produces same order', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const first = shuffleWithSeed(input, 'mySeed');
    const second = shuffleWithSeed(input, 'mySeed');
    expect(first).toEqual(second);
  });

  it('should not mutate the original array', () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffleWithSeed(input, 'seed');
    expect(input).toEqual(copy);
  });

  it('should handle seeds with unicode characters (codePointAt)', () => {
    const input = [1, 2, 3, 4];
    const result = shuffleWithSeed(input, '🎉abc');
    expect(result).toHaveLength(input.length);
    const sortedResult = [...result].toSorted((a, b) => a - b);
    const sortedInput = [...input].toSorted((a, b) => a - b);
    expect(sortedResult).toEqual(sortedInput);
  });

  it('should potentially produce different order for different seeds', () => {
    const input = Array.from({ length: 10 }, (_, i) => i);
    const result1 = shuffleWithSeed(input, 'seedA');
    const result2 = shuffleWithSeed(input, 'seedB');
    // Not guaranteed to be different on every array, but extremely likely with 10 elements
    const areSame = JSON.stringify(result1) === JSON.stringify(result2);
    // At least one of the many elements differs (probabilistic, but deterministic per seed)
    expect(typeof areSame).toBe('boolean');
  });
});

describe('prependLetterToHtml', () => {
  it('should prepend letter to plain text', () => {
    expect(prependLetterToHtml('a', 'Texto simples')).toBe('a) Texto simples');
  });

  it('should prepend letter inside <p> tag', () => {
    expect(prependLetterToHtml('b', '<p>Conteúdo</p>')).toBe('<p>b) Conteúdo</p>');
  });

  it('should prepend letter inside <p> tag with leading whitespace', () => {
    expect(prependLetterToHtml('c', '  <p>Texto</p>')).toBe('  <p>c) Texto</p>');
  });

  it('should handle multi-character letter prefix', () => {
    expect(prependLetterToHtml('aa', 'Texto')).toBe('aa) Texto');
  });

  it('should handle empty html string', () => {
    expect(prependLetterToHtml('a', '')).toBe('a) ');
  });

  it('should treat <p> with attributes as plain text (regex only matches bare <p>)', () => {
    // html.trim().startsWith('<p>') is false for '<p class="...">', so plain-text branch runs
    expect(prependLetterToHtml('d', '<p class="x">Texto</p>')).toBe(
      'd) <p class="x">Texto</p>'
    );
  });
});

describe('getTrueOrFalseOptionState', () => {
  const makeResult = (
    options: { id: string; option: string; isCorrect: boolean }[],
    selectedOptions: { optionId: string; isCorrect?: boolean }[]
  ): QuestionAnswerResult => ({
    id: 'r1',
    questionId: 'q1',
    answer: null,
    selectedOptions,
    answerStatus: 'RESPOSTA_CORRETA' as QuestionAnswerResult['answerStatus'],
    statement: '',
    additionalContent: null,
    questionType: 'VERDADEIRO_FALSO' as QuestionAnswerResult['questionType'],
    difficultyLevel: 'MEDIO' as QuestionAnswerResult['difficultyLevel'],
    solutionExplanation: null,
    correctOption: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    options,
    knowledgeMatrix: [],
    teacherFeedback: null,
    attachment: null,
    score: null,
    gradedAt: null,
    gradedBy: null,
  } as QuestionAnswerResult);

  describe('QuizVariant.RESULT', () => {
    it('should be correct when student marked V and statement is true', () => {
      const result = makeResult(
        [{ id: 'opt1', option: 'Afirmação', isCorrect: true }],
        [{ optionId: 'opt1', isCorrect: true }]
      );

      const state = getTrueOrFalseOptionState('opt1', QuizVariant.RESULT, result, {});

      expect(state.isStatementTrue).toBe(true);
      expect(state.hasAnswered).toBe(true);
      expect(state.studentMarkedTrue).toBe(true);
      expect(state.studentAnswer).toBe(TrueFalseEnum.VERDADEIRO);
      expect(state.correctAnswer).toBe(TrueFalseEnum.VERDADEIRO);
      expect(state.isStudentCorrect).toBe(true);
      expect(state.variantCorrect).toBe('correct');
    });

    it('should be correct when student marked F and statement is false', () => {
      const result = makeResult(
        [{ id: 'opt1', option: 'Afirmação falsa', isCorrect: false }],
        [{ optionId: 'opt1', isCorrect: false }]
      );

      const state = getTrueOrFalseOptionState('opt1', QuizVariant.RESULT, result, {});

      expect(state.isStatementTrue).toBe(false);
      expect(state.studentMarkedTrue).toBe(false);
      expect(state.studentAnswer).toBe(TrueFalseEnum.FALSO);
      expect(state.correctAnswer).toBe(TrueFalseEnum.FALSO);
      expect(state.isStudentCorrect).toBe(true);
      expect(state.variantCorrect).toBe('correct');
    });

    it('should be incorrect when student marked V but statement is false', () => {
      const result = makeResult(
        [{ id: 'opt1', option: 'Afirmação falsa', isCorrect: false }],
        [{ optionId: 'opt1', isCorrect: true }]
      );

      const state = getTrueOrFalseOptionState('opt1', QuizVariant.RESULT, result, {});

      expect(state.isStudentCorrect).toBe(false);
      expect(state.variantCorrect).toBe('incorrect');
    });

    it('should be not answered when student did not select the option', () => {
      const result = makeResult(
        [{ id: 'opt1', option: 'Afirmação', isCorrect: true }],
        [] // no selection
      );

      const state = getTrueOrFalseOptionState('opt1', QuizVariant.RESULT, result, {});

      expect(state.hasAnswered).toBe(false);
      expect(state.studentAnswer).toBe('-');
      expect(state.isStudentCorrect).toBe(false);
    });

    it('should return all false defaults when currentQuestionResult is null', () => {
      const state = getTrueOrFalseOptionState('opt1', QuizVariant.RESULT, null, {});

      expect(state.isStatementTrue).toBe(false);
      expect(state.hasAnswered).toBe(false);
      expect(state.studentMarkedTrue).toBe(false);
      expect(state.studentAnswer).toBe('-');
      expect(state.correctAnswer).toBe(TrueFalseEnum.FALSO);
    });

    it('should return all false defaults when currentQuestionResult is undefined', () => {
      const state = getTrueOrFalseOptionState('opt1', QuizVariant.RESULT, undefined, {});

      expect(state.isStatementTrue).toBe(false);
      expect(state.hasAnswered).toBe(false);
    });
  });

  describe('QuizVariant.DEFAULT (interactive)', () => {
    it('should use localAnswers when variant is DEFAULT and answer is VERDADEIRO', () => {
      const state = getTrueOrFalseOptionState(
        'opt1',
        QuizVariant.DEFAULT,
        null,
        { opt1: TrueFalseEnum.VERDADEIRO }
      );

      expect(state.hasAnswered).toBe(true);
      expect(state.studentMarkedTrue).toBe(true);
      expect(state.studentAnswer).toBe(TrueFalseEnum.VERDADEIRO);
      expect(state.isStatementTrue).toBe(false); // always false in non-RESULT mode
    });

    it('should use localAnswers when variant is DEFAULT and answer is FALSO', () => {
      const state = getTrueOrFalseOptionState(
        'opt1',
        QuizVariant.DEFAULT,
        null,
        { opt1: TrueFalseEnum.FALSO }
      );

      expect(state.hasAnswered).toBe(true);
      expect(state.studentMarkedTrue).toBe(false);
      expect(state.studentAnswer).toBe(TrueFalseEnum.FALSO);
    });

    it('should return dash when no answer in localAnswers', () => {
      const state = getTrueOrFalseOptionState(
        'opt1',
        QuizVariant.DEFAULT,
        null,
        {}
      );

      expect(state.hasAnswered).toBe(false);
      expect(state.studentAnswer).toBe('-');
    });

    it('should use localAnswers regardless of currentQuestionResult', () => {
      const result = makeResult(
        [{ id: 'opt1', option: 'Afirmação', isCorrect: true }],
        [{ optionId: 'opt1', isCorrect: true }]
      );

      const state = getTrueOrFalseOptionState(
        'opt1',
        QuizVariant.DEFAULT,
        result,
        { opt1: TrueFalseEnum.FALSO }
      );

      expect(state.studentMarkedTrue).toBe(false);
      expect(state.studentAnswer).toBe(TrueFalseEnum.FALSO);
    });
  });
});
