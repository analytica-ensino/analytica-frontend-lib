/**
 * Visibility state of a single module/feature.
 * - ENABLED: shown and functional
 * - COMING_SOON: shown but disabled, with an "Em breve" badge
 * - HIDDEN: not shown at all
 */
export type FeatureVisibility = 'ENABLED' | 'COMING_SOON' | 'HIDDEN';

/**
 * Per-institution configuration of the Simulados module.
 * `enabled` is the master toggle (gates the whole module/menu); the remaining
 * keys map 1:1 to each simulado type's `backgroundColor` (the card catalog).
 */
export interface SimulationsConfig {
  enabled: boolean;
  enem: FeatureVisibility;
  prova: FeatureVisibility;
  simuladao: FeatureVisibility;
  vestibular: FeatureVisibility;
}

/**
 * Configuration for Provas (Exams) module
 * Simple boolean - true means exams are enabled
 */
export type ExamsConfig = boolean;

/**
 * Configuration for Performance screen graphs
 */
export interface PerformanceGraphsConfig {
  aulas: boolean; // Lessons graph
  acessos: boolean; // Access graph
  simulados: boolean; // Simulations graph
  atividades: boolean; // Activities graph
  questoes: boolean; // Questions graph
  ranking: boolean; // Ranking graph
}

/**
 * Configuration for Reports
 */
export interface ReportsConfig {
  simulatedReports: boolean;
  activitiesReports: boolean;
  lessonsReports: boolean;
  essayReports: boolean;
}

/**
 * Score display options for simulations
 */
export interface SimulatedScoreConfig {
  tri: boolean;
  absoluto: boolean;
}

/**
 * Default simulados configuration - module on, all types enabled
 */
export const DEFAULT_SIMULATIONS: SimulationsConfig = {
  enabled: true,
  enem: 'ENABLED',
  prova: 'ENABLED',
  simuladao: 'ENABLED',
  vestibular: 'ENABLED',
};

/**
 * Default exams configuration
 */
export const DEFAULT_EXAMS: ExamsConfig = true;

/**
 * Default performance graphs configuration
 */
export const DEFAULT_PERFORMANCE_GRAPHS: PerformanceGraphsConfig = {
  aulas: true,
  acessos: true,
  simulados: true,
  atividades: true,
  questoes: true,
  ranking: true,
};

/**
 * Default reports configuration
 */
export const DEFAULT_REPORTS: ReportsConfig = {
  simulatedReports: true,
  activitiesReports: true,
  lessonsReports: true,
  essayReports: true,
};

/**
 * Default simulated score configuration
 */
export const DEFAULT_SIMULATED_SCORE: SimulatedScoreConfig = {
  tri: true,
  absoluto: true,
};

/**
 * Complete modules configuration interface
 * All modules that can be controlled via feature flags
 */
export interface ModulesConfig {
  // Core modules
  simulator: boolean;
  essay: boolean;
  forum: boolean;
  support: boolean;
  chat: boolean;
  recommendedLessons: boolean;
  activities: boolean;
  questionBanks: boolean;
  comparator: boolean;
  performance: boolean;
  dashboard: boolean;
  lessons: boolean;

  // Nested configurations
  exams: ExamsConfig;
  simulations: SimulationsConfig;
  performanceGraphs: PerformanceGraphsConfig;
  reports: ReportsConfig;
  simulatedScore: SimulatedScoreConfig;

  // Legacy flat fields (for backwards compatibility)
  simulatedReports: boolean;
  activitiesReports: boolean;
  lessonsReports: boolean;
  essayReports: boolean;
  simulatedScoreTri: boolean;
  simulatedScoreAbsoluto: boolean;
}

/**
 * Default modules configuration - all enabled (permissive default pattern)
 */
export const DEFAULT_MODULES: ModulesConfig = {
  // Core modules
  simulator: true,
  essay: true,
  forum: true,
  support: true,
  chat: true,
  recommendedLessons: true,
  activities: true,
  questionBanks: true,
  comparator: true,
  performance: true,
  dashboard: true,
  lessons: true,

  // Nested configurations
  exams: DEFAULT_EXAMS,
  simulations: DEFAULT_SIMULATIONS,
  performanceGraphs: DEFAULT_PERFORMANCE_GRAPHS,
  reports: DEFAULT_REPORTS,
  simulatedScore: DEFAULT_SIMULATED_SCORE,

  // Legacy flat fields (for backwards compatibility)
  simulatedReports: true,
  activitiesReports: true,
  lessonsReports: true,
  essayReports: true,
  simulatedScoreTri: true,
  simulatedScoreAbsoluto: true,
};

/**
 * Deep merge a partial config onto defaults.
 * Handles nested objects (simulations, performanceGraphs, reports, simulatedScore).
 */
export const mergeModulesConfig = (
  version?: Partial<ModulesConfig> | null
): ModulesConfig => {
  const v = version ?? {};
  return {
    ...DEFAULT_MODULES,
    ...v,
    // exams is now a simple boolean, use default if not provided
    exams: v.exams ?? DEFAULT_EXAMS,
    simulations: { ...DEFAULT_SIMULATIONS, ...v.simulations },
    performanceGraphs: {
      ...DEFAULT_PERFORMANCE_GRAPHS,
      ...v.performanceGraphs,
    },
    reports: { ...DEFAULT_REPORTS, ...v.reports },
    simulatedScore: { ...DEFAULT_SIMULATED_SCORE, ...v.simulatedScore },
  };
};
