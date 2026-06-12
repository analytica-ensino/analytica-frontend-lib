import {
  useModulesStore,
  DEFAULT_SIMULATIONS,
  type ModulesConfig,
  type SimulationsConfig,
} from '../store/modulesStore';

export interface UseModulesReturn {
  modules: ModulesConfig;
  loading: boolean;
  hasSimulator: boolean;
  hasEssay: boolean;
  hasForum: boolean;
  hasSupport: boolean;
  hasSimulatedReports: boolean;
  hasActivitiesReports: boolean;
  hasLessonsReports: boolean;
  hasExams: boolean;
  /** Whether TRI score type is available in simulated reports */
  hasSimulatedScoreTri: boolean;
  /** Whether ABSOLUTO score type is available in simulated reports */
  hasSimulatedScoreAbsoluto: boolean;
  /** Simulados module config (master toggle + per-type visibility) */
  simulations: SimulationsConfig;
  /** Whether the Simulados module is enabled (master toggle) */
  hasSimulations: boolean;
}

/**
 * Hook to access modules configuration
 * Provides both the raw modules object and convenience boolean helpers
 *
 * @returns {UseModulesReturn} Modules state with helper properties
 *
 * @example
 * ```tsx
 * const { hasEssay, hasForum, hasSupport, hasSimulator } = useModules();
 *
 * return (
 *   <>
 *     {hasEssay && <EssayMenuItem />}
 *     {hasForum && <ForumMenuItem />}
 *   </>
 * );
 * ```
 */
export const useModules = (): UseModulesReturn => {
  const { modules, loading } = useModulesStore();

  // Defensive fallback: older persisted state or partial mocks may omit it.
  const simulations = modules.simulations ?? DEFAULT_SIMULATIONS;

  return {
    modules,
    loading,
    hasSimulator: modules.simulator,
    hasEssay: modules.essay,
    hasForum: modules.forum,
    hasSupport: modules.support,
    hasSimulatedReports: modules.simulatedReports,
    hasActivitiesReports: modules.activitiesReports,
    hasLessonsReports: modules.lessonsReports,
    hasExams: modules.exams,
    hasSimulatedScoreTri: modules.simulatedScoreTri,
    hasSimulatedScoreAbsoluto: modules.simulatedScoreAbsoluto,
    simulations,
    hasSimulations: simulations.enabled,
  };
};
