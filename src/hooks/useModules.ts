import { useModulesStore } from '../store/modulesStore';
import {
  DEFAULT_SIMULATIONS,
  DEFAULT_PERFORMANCE_GRAPHS,
  DEFAULT_REPORTS,
  DEFAULT_SIMULATED_SCORE,
  type ModulesConfig,
  type SimulationsConfig,
  type PerformanceGraphsConfig,
  type ReportsConfig,
  type SimulatedScoreConfig,
} from '../types/modulesConfig';

export interface UseModulesReturn {
  modules: ModulesConfig;
  loading: boolean;

  // Core modules
  hasSimulator: boolean;
  hasEssay: boolean;
  hasForum: boolean;
  hasSupport: boolean;
  hasChat: boolean;
  hasRecommendedLessons: boolean;
  hasActivities: boolean;
  hasQuestionBanks: boolean;
  hasComparator: boolean;
  hasPerformance: boolean;
  hasDashboard: boolean;
  hasLessons: boolean;

  // Tutorial menu link (true only when enabled AND tutorialUrl is non-empty)
  hasTutorial: boolean;
  tutorialUrl: string;

  // Reading-fluency mode (institution-wide; switches the app to the
  // fluency-only experience). Off by default.
  hasReadingFluency: boolean;

  // Exams
  hasExams: boolean;

  // Simulations
  hasSimulations: boolean;
  simulations: SimulationsConfig;

  // Performance graphs
  hasPerformanceAulas: boolean;
  hasPerformanceAcessos: boolean;
  hasPerformanceSimulados: boolean;
  hasPerformanceAtividades: boolean;
  hasPerformanceQuestoes: boolean;
  hasPerformanceRanking: boolean;
  performanceGraphs: PerformanceGraphsConfig;

  // Reports
  hasSimulatedReports: boolean;
  hasSimulatedGenericReports: boolean;
  hasActivitiesReports: boolean;
  hasQuestionnairesReports: boolean;
  hasLessonsReports: boolean;
  hasEssayReports: boolean;
  reports: ReportsConfig;

  // Score types
  hasSimulatedScoreTri: boolean;
  hasSimulatedScoreAbsoluto: boolean;
  simulatedScore: SimulatedScoreConfig;
}

/**
 * Hook to access modules configuration
 * Provides both the raw modules object and convenience boolean helpers
 *
 * @returns {UseModulesReturn} Modules state with helper properties
 *
 * @example
 * ```tsx
 * const {
 *   hasEssay,
 *   hasForum,
 *   hasSupport,
 *   hasSimulator,
 *   hasPerformanceAulas,
 *   hasExams,
 * } = useModules();
 *
 * return (
 *   <>
 *     {hasEssay && <EssayMenuItem />}
 *     {hasForum && <ForumMenuItem />}
 *     {hasPerformanceAulas && <AulasGraph />}
 *   </>
 * );
 * ```
 */
export const useModules = (): UseModulesReturn => {
  const { modules, loading } = useModulesStore();

  // Defensive fallbacks for nested objects - handles older persisted state
  const simulations = modules.simulations ?? DEFAULT_SIMULATIONS;
  const performanceGraphs =
    modules.performanceGraphs ?? DEFAULT_PERFORMANCE_GRAPHS;
  const reports = modules.reports ?? DEFAULT_REPORTS;
  const simulatedScore = modules.simulatedScore ?? DEFAULT_SIMULATED_SCORE;
  const tutorialUrl = (modules.tutorialUrl ?? '').trim();

  return {
    modules,
    loading,

    // Core modules
    hasSimulator: modules.simulator ?? true,
    hasEssay: modules.essay ?? true,
    hasForum: modules.forum ?? true,
    hasSupport: modules.support ?? true,
    hasChat: modules.chat ?? true,
    hasRecommendedLessons: modules.recommendedLessons ?? true,
    hasActivities: modules.activities ?? true,
    hasQuestionBanks: modules.questionBanks ?? true,
    hasComparator: modules.comparator ?? true,
    hasPerformance: modules.performance ?? true,
    hasDashboard: modules.dashboard ?? true,
    hasLessons: modules.lessons ?? true,

    // Tutorial: only show the menu link when enabled AND a url is configured
    hasTutorial: (modules.tutorial ?? false) && tutorialUrl.length > 0,
    tutorialUrl,

    // Reading-fluency mode (opt-in per institution, defaults off)
    hasReadingFluency: modules.readingFluency ?? false,

    // Exams (simple boolean, with backwards compatibility for old object format)
    hasExams:
      typeof modules.exams === 'object'
        ? ((modules.exams as { enabled?: boolean }).enabled ?? true)
        : (modules.exams ?? true),

    // Simulations
    hasSimulations: simulations.enabled,
    simulations,

    // Performance graphs
    hasPerformanceAulas: performanceGraphs.aulas ?? true,
    hasPerformanceAcessos: performanceGraphs.acessos ?? true,
    hasPerformanceSimulados: performanceGraphs.simulados ?? true,
    hasPerformanceAtividades: performanceGraphs.atividades ?? true,
    hasPerformanceQuestoes: performanceGraphs.questoes ?? true,
    hasPerformanceRanking: performanceGraphs.ranking ?? true,
    performanceGraphs,

    // Reports (support both nested and flat for backwards compatibility)
    hasSimulatedReports:
      reports.simulatedReports ?? modules.simulatedReports ?? true,
    hasSimulatedGenericReports:
      reports.simulatedGenericReports ??
      modules.simulatedGenericReports ??
      false,
    hasActivitiesReports:
      reports.activitiesReports ?? modules.activitiesReports ?? true,
    hasQuestionnairesReports:
      reports.questionnairesReports ?? modules.questionnairesReports ?? false,
    hasLessonsReports: reports.lessonsReports ?? modules.lessonsReports ?? true,
    hasEssayReports: reports.essayReports ?? true,
    reports,

    // Score types (support both nested and flat for backwards compatibility)
    hasSimulatedScoreTri:
      simulatedScore.tri ?? modules.simulatedScoreTri ?? false,
    hasSimulatedScoreAbsoluto:
      simulatedScore.absoluto ?? modules.simulatedScoreAbsoluto ?? false,
    simulatedScore,
  };
};
