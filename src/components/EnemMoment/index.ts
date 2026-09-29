/**
 * The "Simulados Momento ENEM" report's sections — shared by the gestor
 * (Gestor NRE, Gestor Geral, Gestor de Unidade) and the professor, who fetch
 * the data and hand it in. The student's modal is in its own entry,
 * `enem-moment-student-modal`: it carries KaTeX.
 */
export type * from './types';
export * from './utils';
export * from './constants';
export { SectionContent } from './SectionContent';
export {
  ENEM_MOMENT_PERFORMANCE_LABELS,
  ENEM_MOMENT_PERFORMANCE_ORDER,
  EnemMomentPerformanceBadge,
  EnemMomentTierBadge,
  ParticipationBadge,
  readableTextColor,
  type EnemMomentStudentParticipation,
} from './PerformanceBadge';
export {
  ExamCardsRow,
  LanguageCard,
  ParticipationCard,
  ScoreBandChart,
  TimeCard,
  schools,
  showsLanguageCard,
  students,
} from './ExamCards';
export { UnitExamDataSection } from './UnitExamDataSection';
export { DailyEvolutionSection } from './DailyEvolutionSection';
export { KnowledgeAreaSection } from './KnowledgeAreaSection';
export {
  EMPTY_RANKING_TEXT,
  EnemMomentRankingCard,
  RANKING_ROWS,
  ScoreBadge,
  UnitStudentRankings,
  type EnemMomentRankedStudent,
} from './RankingCards';
export {
  EnemMomentSummaryCards,
  buildEnemMomentUnitSummaryCards,
} from './SummaryCards';
export { MomentTabs, type EnemMomentTab } from './MomentTabs';
export { EnemMomentHeaderFilters } from './HeaderFilters';
export {
  ToneTile,
  answerTiles,
  numberedExamScores,
  scoreText,
  type ToneTileData,
} from './ToneTiles';
export {
  StudentsTableSection,
  createStudentColumns,
  participationOf,
  toStudentsTableQuery,
  tookAnyExam,
  type EnemMomentStudentsTableQuery,
  type StudentStatusColumn,
} from './StudentsTable';
export { classOptionLabel, listFilter, pickedValue } from './tableFilters';
export {
  PerformanceDistributionSection,
  toPerformanceCounters,
} from './PerformanceDistributionSection';
