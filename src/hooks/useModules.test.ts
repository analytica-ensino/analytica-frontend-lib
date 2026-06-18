import { renderHook } from '@testing-library/react';
import { useModules } from './useModules';
import { useModulesStore } from '../store/modulesStore';

// Mock the modulesStore (must also provide DEFAULT_SIMULATIONS and DEFAULT_PERFORMANCE_GRAPHS,
// which useModules imports as defensive fallbacks for nested configs).
jest.mock('../store/modulesStore', () => ({
  useModulesStore: jest.fn(),
  DEFAULT_SIMULATIONS: {
    enabled: true,
    enem: 'ENABLED',
    prova: 'ENABLED',
    simuladao: 'ENABLED',
    vestibular: 'ENABLED',
  },
  DEFAULT_PERFORMANCE_GRAPHS: {
    aulas: true,
    acessos: true,
    simulados: true,
    atividades: true,
    questoes: true,
    ranking: true,
  },
  DEFAULT_REPORTS: {
    simulatedReports: true,
    activitiesReports: true,
    lessonsReports: true,
    essayReports: true,
  },
  DEFAULT_SIMULATED_SCORE: {
    tri: true,
    absoluto: true,
  },
}));

const mockUseModulesStore = useModulesStore as jest.MockedFunction<
  typeof useModulesStore
>;

describe('useModules', () => {
  const defaultModules = {
    simulator: true,
    essay: true,
    forum: true,
    support: true,
    performanceGraphs: {
      aulas: true,
      acessos: true,
      simulados: true,
      atividades: true,
      questoes: true,
      ranking: true,
    },
    reports: {
      simulatedReports: true,
      activitiesReports: true,
      lessonsReports: true,
      essayReports: true,
    },
    simulatedScore: {
      tri: true,
      absoluto: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('return values', () => {
    it('should return modules object', () => {
      mockUseModulesStore.mockReturnValue({
        modules: defaultModules,
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.modules).toEqual(defaultModules);
    });

    it('should return loading state', () => {
      mockUseModulesStore.mockReturnValue({
        modules: defaultModules,
        loading: true,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.loading).toBe(true);
    });

    it('should return hasSimulator helper', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, simulator: true },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulator).toBe(true);
    });

    it('should return hasEssay helper', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, essay: true },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasEssay).toBe(true);
    });

    it('should return hasForum helper', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, forum: true },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasForum).toBe(true);
    });

    it('should return hasSupport helper', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, support: true },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSupport).toBe(true);
    });
  });

  describe('helper boolean values', () => {
    it('should return false for hasSimulator when simulator is disabled', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, simulator: false },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulator).toBe(false);
    });

    it('should return false for hasEssay when essay is disabled', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, essay: false },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasEssay).toBe(false);
    });

    it('should return false for hasForum when forum is disabled', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, forum: false },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasForum).toBe(false);
    });

    it('should return false for hasSupport when support is disabled', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, support: false },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSupport).toBe(false);
    });
  });

  describe('all modules disabled', () => {
    it('should return all helpers as false when all modules are disabled', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          simulator: false,
          essay: false,
          forum: false,
          support: false,
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulator).toBe(false);
      expect(result.current.hasEssay).toBe(false);
      expect(result.current.hasForum).toBe(false);
      expect(result.current.hasSupport).toBe(false);
    });
  });

  describe('mixed module states', () => {
    it('should correctly reflect mixed enabled/disabled states', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          simulator: true,
          essay: false,
          forum: true,
          support: false,
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulator).toBe(true);
      expect(result.current.hasEssay).toBe(false);
      expect(result.current.hasForum).toBe(true);
      expect(result.current.hasSupport).toBe(false);
    });
  });

  describe('loading state combinations', () => {
    it('should return loading true with default modules', () => {
      mockUseModulesStore.mockReturnValue({
        modules: defaultModules,
        loading: true,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.loading).toBe(true);
      expect(result.current.modules).toEqual(defaultModules);
    });

    it('should return loading false with custom modules', () => {
      const customModules = {
        simulator: false,
        essay: true,
        forum: false,
        support: true,
      };

      mockUseModulesStore.mockReturnValue({
        modules: customModules,
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.loading).toBe(false);
      expect(result.current.modules).toEqual(customModules);
    });
  });

  describe('hasExams config (lines 116-119)', () => {
    it('should return hasExams true when exams is boolean true', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, exams: true },
        loading: false,
      });

      const { result } = renderHook(() => useModules());
      expect(result.current.hasExams).toBe(true);
    });

    it('should return hasExams false when exams is boolean false', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, exams: false },
        loading: false,
      });

      const { result } = renderHook(() => useModules());
      expect(result.current.hasExams).toBe(false);
    });

    it('should handle exams as object with enabled property (backwards compat)', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          exams: { enabled: false } as unknown as boolean,
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());
      expect(result.current.hasExams).toBe(false);
    });

    it('should handle exams object with enabled true', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          exams: { enabled: true } as unknown as boolean,
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());
      expect(result.current.hasExams).toBe(true);
    });

    it('should handle exams object without enabled property (defaults to true)', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          exams: {} as unknown as boolean,
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());
      expect(result.current.hasExams).toBe(true);
    });

    it('should default to true when exams is undefined', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, exams: undefined },
        loading: false,
      });

      const { result } = renderHook(() => useModules());
      expect(result.current.hasExams).toBe(true);
    });
  });

  describe('simulations config', () => {
    const fullSimulations = {
      enabled: false,
      enem: 'ENABLED' as const,
      prova: 'COMING_SOON' as const,
      simuladao: 'HIDDEN' as const,
      vestibular: 'ENABLED' as const,
    };

    it('should expose the simulations object and hasSimulations from the store', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, simulations: fullSimulations },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.simulations).toEqual(fullSimulations);
      expect(result.current.hasSimulations).toBe(false);
    });

    it('should fall back to defaults when simulations is missing', () => {
      mockUseModulesStore.mockReturnValue({
        modules: defaultModules, // no `simulations` key
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulations).toBe(true);
      expect(result.current.simulations.enem).toBe('ENABLED');
      expect(result.current.simulations.simuladao).toBe('ENABLED');
    });
  });

  describe('performanceGraphs config (lines 125-132)', () => {
    it('should return all performance graph flags when provided', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          performanceGraphs: {
            aulas: false,
            acessos: true,
            simulados: false,
            atividades: true,
            questoes: false,
            ranking: true,
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasPerformanceAulas).toBe(false);
      expect(result.current.hasPerformanceAcessos).toBe(true);
      expect(result.current.hasPerformanceSimulados).toBe(false);
      expect(result.current.hasPerformanceAtividades).toBe(true);
      expect(result.current.hasPerformanceQuestoes).toBe(false);
      expect(result.current.hasPerformanceRanking).toBe(true);
      expect(result.current.performanceGraphs).toEqual({
        aulas: false,
        acessos: true,
        simulados: false,
        atividades: true,
        questoes: false,
        ranking: true,
      });
    });

    it('should fall back to defaults when performanceGraphs is missing', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {}, // no performanceGraphs
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasPerformanceAulas).toBe(true);
      expect(result.current.hasPerformanceAcessos).toBe(true);
      expect(result.current.hasPerformanceSimulados).toBe(true);
      expect(result.current.hasPerformanceAtividades).toBe(true);
      expect(result.current.hasPerformanceQuestoes).toBe(true);
      expect(result.current.hasPerformanceRanking).toBe(true);
    });

    it('should use nullish coalescing for undefined individual values', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          performanceGraphs: {
            aulas: undefined,
            acessos: false,
            // missing other keys
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      // undefined ?? true = true
      expect(result.current.hasPerformanceAulas).toBe(true);
      expect(result.current.hasPerformanceAcessos).toBe(false);
    });

    it('should handle null values in performanceGraphs (null is nullish, falls back to true)', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          performanceGraphs: {
            aulas: null as unknown as boolean,
            acessos: null as unknown as boolean,
            simulados: true,
            atividades: false,
            questoes: null as unknown as boolean,
            ranking: null as unknown as boolean,
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      // null ?? true = true (null is nullish)
      expect(result.current.hasPerformanceAulas).toBe(true);
      expect(result.current.hasPerformanceAcessos).toBe(true);
      expect(result.current.hasPerformanceSimulados).toBe(true);
      expect(result.current.hasPerformanceAtividades).toBe(false);
      expect(result.current.hasPerformanceQuestoes).toBe(true);
      expect(result.current.hasPerformanceRanking).toBe(true);
    });
  });

  describe('reports config (lines 134-141)', () => {
    it('should return all report flags from nested reports object', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          reports: {
            simulatedReports: false,
            activitiesReports: true,
            lessonsReports: false,
            essayReports: true,
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulatedReports).toBe(false);
      expect(result.current.hasActivitiesReports).toBe(true);
      expect(result.current.hasLessonsReports).toBe(false);
      expect(result.current.hasEssayReports).toBe(true);
      expect(result.current.reports).toEqual({
        simulatedReports: false,
        activitiesReports: true,
        lessonsReports: false,
        essayReports: true,
      });
    });

    it('should fall back to flat modules values when nested reports has undefined values', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          // Flat values (old format) - used as fallback
          simulatedReports: false,
          activitiesReports: false,
          lessonsReports: false,
          // Nested reports with undefined values
          reports: {
            simulatedReports: undefined,
            activitiesReports: undefined,
            lessonsReports: undefined,
            essayReports: true,
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      // Should use flat values when nested values are undefined
      expect(result.current.hasSimulatedReports).toBe(false);
      expect(result.current.hasActivitiesReports).toBe(false);
      expect(result.current.hasLessonsReports).toBe(false);
      expect(result.current.hasEssayReports).toBe(true);
    });

    it('should prefer nested reports values over flat values', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          // Flat values (old format)
          simulatedReports: true,
          activitiesReports: true,
          // Nested reports (new format) - should take precedence
          reports: {
            simulatedReports: false,
            activitiesReports: false,
            lessonsReports: true,
            essayReports: true,
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      // Nested values should win
      expect(result.current.hasSimulatedReports).toBe(false);
      expect(result.current.hasActivitiesReports).toBe(false);
      expect(result.current.hasLessonsReports).toBe(true);
    });

    it('should fall back to defaults when both nested and flat are missing', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {}, // Empty modules
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      // All should default to true
      expect(result.current.hasSimulatedReports).toBe(true);
      expect(result.current.hasActivitiesReports).toBe(true);
      expect(result.current.hasLessonsReports).toBe(true);
      expect(result.current.hasEssayReports).toBe(true);
    });

    it('should handle null values in reports (null is nullish, uses flat fallback)', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          // Flat fallbacks - will be used when nested is null
          simulatedReports: false,
          activitiesReports: true,
          lessonsReports: false,
          reports: {
            simulatedReports: null as unknown as boolean,
            activitiesReports: null as unknown as boolean,
            lessonsReports: null as unknown as boolean,
            essayReports: false,
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      // null ?? flat ?? true - uses flat fallback values
      expect(result.current.hasSimulatedReports).toBe(false);
      expect(result.current.hasActivitiesReports).toBe(true);
      expect(result.current.hasLessonsReports).toBe(false);
      expect(result.current.hasEssayReports).toBe(false);
    });
  });

  describe('simulatedScore config (lines 143-148)', () => {
    it('should return score type flags from nested simulatedScore object', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          simulatedScore: {
            tri: true,
            absoluto: false,
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulatedScoreTri).toBe(true);
      expect(result.current.hasSimulatedScoreAbsoluto).toBe(false);
      expect(result.current.simulatedScore).toEqual({
        tri: true,
        absoluto: false,
      });
    });

    it('should fall back to flat modules values for backwards compatibility', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          // Flat values (old format)
          simulatedScoreTri: true,
          simulatedScoreAbsoluto: true,
          // No nested simulatedScore object
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      // Should use flat values when simulatedScore object is missing
      expect(result.current.hasSimulatedScoreTri).toBe(true);
      expect(result.current.hasSimulatedScoreAbsoluto).toBe(true);
    });

    it('should prefer nested simulatedScore values over flat values', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          // Flat values (old format)
          simulatedScoreTri: true,
          simulatedScoreAbsoluto: true,
          // Nested simulatedScore (new format) - should take precedence
          simulatedScore: {
            tri: false,
            absoluto: false,
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      // Nested values should win
      expect(result.current.hasSimulatedScoreTri).toBe(false);
      expect(result.current.hasSimulatedScoreAbsoluto).toBe(false);
    });

    it('should use DEFAULT_SIMULATED_SCORE when both nested and flat are missing', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {}, // Empty modules
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      // Uses DEFAULT_SIMULATED_SCORE from mock (tri: true, absoluto: true)
      expect(result.current.hasSimulatedScoreTri).toBe(true);
      expect(result.current.hasSimulatedScoreAbsoluto).toBe(true);
    });

    it('should handle partial nested simulatedScore with flat fallback', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          // Flat fallback value
          simulatedScoreAbsoluto: true,
          simulatedScore: {
            tri: false,
            absoluto: undefined, // will fall back to flat value
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulatedScoreTri).toBe(false);
      // absoluto falls back to modules.simulatedScoreAbsoluto which is true
      expect(result.current.hasSimulatedScoreAbsoluto).toBe(true);
    });

    it('should handle null values in simulatedScore (null is nullish, uses flat fallback)', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          simulatedScoreTri: true,
          simulatedScoreAbsoluto: false,
          simulatedScore: {
            tri: null as unknown as boolean,
            absoluto: null as unknown as boolean,
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      // null ?? flat ?? false - uses flat fallback values
      expect(result.current.hasSimulatedScoreTri).toBe(true);
      expect(result.current.hasSimulatedScoreAbsoluto).toBe(false);
    });

    it('should use flat fallback when nested value is undefined and flat is defined', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          simulatedScoreTri: true,
          simulatedScoreAbsoluto: false,
          simulatedScore: {
            tri: undefined,
            absoluto: undefined,
          },
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasSimulatedScoreTri).toBe(true);
      expect(result.current.hasSimulatedScoreAbsoluto).toBe(false);
    });
  });

  describe('tutorial menu link', () => {
    it('hasTutorial is false by default (not configured)', () => {
      mockUseModulesStore.mockReturnValue({
        modules: defaultModules,
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasTutorial).toBe(false);
      expect(result.current.tutorialUrl).toBe('');
    });

    it('hasTutorial is true when enabled and url is non-empty', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          tutorial: true,
          tutorialUrl: 'https://x.com/tutorial',
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasTutorial).toBe(true);
      expect(result.current.tutorialUrl).toBe('https://x.com/tutorial');
    });

    it('hasTutorial is false when enabled but url is blank', () => {
      mockUseModulesStore.mockReturnValue({
        modules: { ...defaultModules, tutorial: true, tutorialUrl: '   ' },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasTutorial).toBe(false);
      expect(result.current.tutorialUrl).toBe('');
    });

    it('hasTutorial is false when url is set but tutorial is disabled', () => {
      mockUseModulesStore.mockReturnValue({
        modules: {
          ...defaultModules,
          tutorial: false,
          tutorialUrl: 'https://x.com/tutorial',
        },
        loading: false,
      });

      const { result } = renderHook(() => useModules());

      expect(result.current.hasTutorial).toBe(false);
    });
  });
});
