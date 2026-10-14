/**
 * The student's result of a Simulado Momento Enem (the in-classroom ENEM):
 * the sections of the result page, fed by
 * `GET /enem-classroom/activities/:activityId/result`. The app fetches, routes
 * and handles the loading and error states; these draw the result.
 */
export { EnemClassroomResultSummary } from './EnemClassroomResultSummary';
export { EnemClassroomResultHits } from './EnemClassroomResultHits';
export { EnemClassroomResultSubjects } from './EnemClassroomResultSubjects';
export {
  ABOVE_AVERAGE_MESSAGE,
  BELOW_AVERAGE_MESSAGE,
  FALLBACK_SUBJECT_COLOR,
  FALLBACK_SUBJECT_ICON,
  areaVisual,
  formatElapsed,
  spokenElapsed,
  summaryMessage,
  type EnemClassroomAreaVisual,
  type EnemClassroomSubjectStyle,
} from './utils';
