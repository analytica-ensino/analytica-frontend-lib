/**
 * Types of the "Dados gerais de questões" card.
 *
 * The bars come from the questions-data endpoint of the report the card sits
 * in, and the subtema table from
 * `POST /performance/simulated/activities/subtopics-performance`. Both are
 * fetched by the consuming app, which knows its own filter shape.
 */

/** Answer counts of the whole cut, as the four bars show them. */
export interface ActivitiesQuestionsData {
  totalAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  blankAnswers: number;
}

/**
 * One subtema row of the subtopics-performance endpoint.
 *
 * `total` counts every answer given on the subtema's questions, and
 * `correct + incorrect + blank` adds up to it — the endpoint counts the blanks
 * by answer status instead of leaving them to be derived by subtraction.
 *
 * `correctPercentage` is over that same total, blanks included, which is what
 * makes the table agree with the percentages the legend cards print.
 *
 * `topic` is the tema the subtema hangs from. It is never null: the knowledge
 * matrix requires a subtema to belong to a tema.
 */
export interface SubtopicPerformanceItem {
  subtopicId: string;
  subtopicName: string;
  topic: { id: string; name: string };
  total: number;
  correct: number;
  incorrect: number;
  blank: number;
  correctPercentage: number;
}
