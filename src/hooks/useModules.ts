import { useModulesStore, type ModulesConfig } from '../store/modulesStore';

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
  };
};
