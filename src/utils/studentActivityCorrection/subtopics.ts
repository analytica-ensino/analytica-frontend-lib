import type { SimulationContentSummary } from '../../components/shared/SimulationSummaryCards';
import { QUESTION_STATUS } from './constants';
import type { CorrectionQuestionData } from './types';
import { getQuestionStatusFromData } from './utils';

/**
 * Hit rate above which a lone subtema reads as a result rather than a gap.
 *
 * The same 50% the report's `findBestAndWorstTopics` uses, so a student's
 * correction modal and their row in the Desempenho report never disagree on
 * which side of the line one subtema falls.
 */
const PERFORMANCE_THRESHOLD = 50;

/** Running tally of one subtema across the student's answers. */
interface SubtopicTally {
  name: string;
  answered: number;
  correct: number;
}

/**
 * The subtema a question belongs to, or null when it hangs outside the
 * knowledge matrix (the API sends `{ id: '', name: '' }` for those).
 */
function getSubtopic(
  questionData: CorrectionQuestionData
): { id: string; name: string } | null {
  const subtopic = questionData.question.knowledgeMatrix?.[0]?.subtopic;
  return subtopic?.id && subtopic.name ? subtopic : null;
}

/**
 * Best and worst subtema of one student's answers to an activity.
 *
 * The correction endpoint answers question by question, so the two cards are
 * derived here rather than sent: answers are grouped by the subtema of their
 * knowledge matrix and ranked by hit rate.
 *
 * Only answered questions count. A blank or still-ungraded question says
 * nothing about the subtema, and counting it as a miss would name a "maior
 * dificuldade" the student never attempted.
 *
 * @param questions - The student's questions, as the modal lists them
 * @returns The best and the worst subtema; either is null when there is none
 *
 * @example
 * ```typescript
 * findBestAndWorstSubtopics(questions);
 * // { best: { contentName: 'Cinemática' }, worst: { contentName: 'Óptica' } }
 * ```
 */
export function findBestAndWorstSubtopics(
  questions: readonly CorrectionQuestionData[]
): {
  best: SimulationContentSummary | null;
  worst: SimulationContentSummary | null;
} {
  const tallies = new Map<string, SubtopicTally>();

  for (const questionData of questions) {
    const subtopic = getSubtopic(questionData);
    if (!subtopic) continue;

    const status = getQuestionStatusFromData(questionData);
    if (
      status !== QUESTION_STATUS.CORRETA &&
      status !== QUESTION_STATUS.INCORRETA
    ) {
      continue;
    }

    const tally = tallies.get(subtopic.id) ?? {
      name: subtopic.name,
      answered: 0,
      correct: 0,
    };
    tally.answered += 1;
    if (status === QUESTION_STATUS.CORRETA) tally.correct += 1;
    tallies.set(subtopic.id, tally);
  }

  // Ties keep the order the questions came in, which is the order of the
  // activity — `sort` is stable, so no extra key is needed for that.
  const ranked = [...tallies.values()]
    .map((tally) => ({
      contentName: tally.name,
      rate: (tally.correct / tally.answered) * 100,
    }))
    .sort((a, b) => b.rate - a.rate);

  if (ranked.length === 0) return { best: null, worst: null };

  if (ranked.length === 1) {
    const [only] = ranked;
    const summary = { contentName: only.contentName };
    return only.rate >= PERFORMANCE_THRESHOLD
      ? { best: summary, worst: null }
      : { best: null, worst: summary };
  }

  // The list is sorted by hit rate and has at least two entries by this point,
  // so the ends of it are the two cards.
  const [best] = ranked;
  const [worst] = ranked.slice(-1);

  return {
    best: { contentName: best.contentName },
    worst: { contentName: worst.contentName },
  };
}
