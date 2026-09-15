/**
 * Types of the "Dados gerais de questões" card.
 *
 * The bars come from `POST /access-report/activities/questions-data` and the
 * subtema table from `POST /performance/simulated/activities/contents-performance`.
 * Both are fetched by the consuming app, which knows its own filter shape.
 */

/** Answer counts of the whole cut, as the four bars show them. */
export interface ActivitiesQuestionsData {
  totalAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  blankAnswers: number;
}

/**
 * One subtema (content) row of the contents-performance endpoint.
 *
 * `questionsCount` is the number of answers given on the content's questions;
 * `performance.correct` and `performance.incorrect` split it, and what neither
 * covers was left blank. `topic` is the tema the content hangs from, null when
 * it sits outside the knowledge hierarchy.
 */
export interface SimulatedContentItem {
  contentId: string;
  contentName: string;
  bnccCode: string | null;
  subject: { id: string; name: string };
  topic: { id: string; name: string } | null;
  simulatedExamsCount: number;
  questionsCount: number;
  studentsCount: number;
  performance: {
    correct: number;
    incorrect: number;
    correctPercentage: number;
  };
}
