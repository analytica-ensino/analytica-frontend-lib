import {
  ANSWER_STATUS,
  QUESTION_DIFFICULTY,
  QUESTION_TYPE,
  type Question,
  type QuestionResult,
} from '../../components/Quiz/useQuizStore';
import type { CorrectionQuestionData } from './types';
import { findBestAndWorstSubtopics } from './subtopics';

/** One answered question of `subtopic`, with the status the modal reads. */
const makeQuestion = (
  questionNumber: number,
  subtopic: { id: string; name: string } | null,
  answerStatus: ANSWER_STATUS
): CorrectionQuestionData => {
  const question = {
    id: `q-${questionNumber}`,
    statement: `Questão ${questionNumber}`,
    questionType: QUESTION_TYPE.ALTERNATIVA,
    difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
    description: '',
    examBoard: null,
    examYear: null,
    solutionExplanation: null,
    additionalContent: null,
    answer: null,
    answerStatus,
    options: [],
    knowledgeMatrix: [
      {
        areaKnowledge: { id: 'area-1', name: 'Área' },
        subject: { id: 'sub-1', name: 'Matemática', color: '', icon: '' },
        topic: { id: 'topic-1', name: 'Tema' },
        subtopic: subtopic ?? { id: '', name: '' },
        content: { id: 'content-1', name: 'Conteúdo' },
      },
    ],
    correctOptionIds: [],
  } as unknown as Question;

  const result = {
    id: `a-${questionNumber}`,
    questionId: question.id,
    answer: null,
    selectedOptions: [],
    answerStatus,
    statement: question.statement,
    additionalContent: null,
    questionType: QUESTION_TYPE.ALTERNATIVA,
    difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
    solutionExplanation: null,
    correctOption: '',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    options: [],
    knowledgeMatrix: [],
    teacherFeedback: null,
    attachment: null,
    score: null,
    gradedAt: null,
    gradedBy: null,
  } as unknown as QuestionResult['answers'][number];

  return { question, result, questionNumber };
};

const cinematica = { id: 'st-1', name: 'Cinemática' };
const optica = { id: 'st-2', name: 'Óptica' };

describe('findBestAndWorstSubtopics', () => {
  it('returns nothing when there are no questions', () => {
    expect(findBestAndWorstSubtopics([])).toEqual({ best: null, worst: null });
  });

  it('ranks the subtemas by hit rate', () => {
    const result = findBestAndWorstSubtopics([
      makeQuestion(1, cinematica, ANSWER_STATUS.RESPOSTA_CORRETA),
      makeQuestion(2, cinematica, ANSWER_STATUS.RESPOSTA_CORRETA),
      makeQuestion(3, optica, ANSWER_STATUS.RESPOSTA_CORRETA),
      makeQuestion(4, optica, ANSWER_STATUS.RESPOSTA_INCORRETA),
    ]);

    expect(result).toEqual({
      best: { contentName: 'Cinemática' },
      worst: { contentName: 'Óptica' },
    });
  });

  // A single subtema is either a result or a gap, never both — the same rule
  // the report applies when a cut has one topic.
  it('names a lone subtema above the threshold as the best result only', () => {
    expect(
      findBestAndWorstSubtopics([
        makeQuestion(1, cinematica, ANSWER_STATUS.RESPOSTA_CORRETA),
        makeQuestion(2, cinematica, ANSWER_STATUS.RESPOSTA_INCORRETA),
      ])
    ).toEqual({ best: { contentName: 'Cinemática' }, worst: null });
  });

  it('names a lone subtema below the threshold as the difficulty only', () => {
    expect(
      findBestAndWorstSubtopics([
        makeQuestion(1, cinematica, ANSWER_STATUS.RESPOSTA_INCORRETA),
        makeQuestion(2, cinematica, ANSWER_STATUS.RESPOSTA_INCORRETA),
      ])
    ).toEqual({ best: null, worst: { contentName: 'Cinemática' } });
  });

  // A tie keeps the order of the activity, so the first subtema asked is the
  // one named as the best result.
  it('keeps the order of the activity on a tie', () => {
    expect(
      findBestAndWorstSubtopics([
        makeQuestion(1, optica, ANSWER_STATUS.RESPOSTA_CORRETA),
        makeQuestion(2, cinematica, ANSWER_STATUS.RESPOSTA_CORRETA),
      ])
    ).toEqual({
      best: { contentName: 'Óptica' },
      worst: { contentName: 'Cinemática' },
    });
  });

  it('ignores questions outside the knowledge matrix', () => {
    expect(
      findBestAndWorstSubtopics([
        makeQuestion(1, null, ANSWER_STATUS.RESPOSTA_CORRETA),
      ])
    ).toEqual({ best: null, worst: null });
  });

  // Blank and ungraded questions say nothing about the subtema; counting them
  // as misses would name a difficulty the student never attempted.
  it.each([
    ['blank', ANSWER_STATUS.NAO_RESPONDIDO],
    ['pending', ANSWER_STATUS.PENDENTE_AVALIACAO],
  ])('ignores %s questions', (_name, answerStatus) => {
    expect(
      findBestAndWorstSubtopics([makeQuestion(1, cinematica, answerStatus)])
    ).toEqual({ best: null, worst: null });
  });
});
