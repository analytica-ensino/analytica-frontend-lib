import React, { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ModuleProtectedRoute } from './ModuleProtectedRoute';
import { useModules, type UseModulesReturn } from '../hooks/useModules';
import {
  DEFAULT_MODULES,
  DEFAULT_SIMULATIONS,
  DEFAULT_PERFORMANCE_GRAPHS,
  DEFAULT_REPORTS,
  DEFAULT_SIMULATED_SCORE,
} from '../types/modulesConfig';

// Mock the useModules hook
jest.mock('../hooks/useModules', () => ({
  useModules: jest.fn(),
}));

const mockUseModules = useModules as jest.MockedFunction<typeof useModules>;

// Helper to render with router
const renderWithRouter = (
  ui: ReactElement,
  { initialEntries = ['/test'] } = {}
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/test" element={ui} />
        <Route path="/painel" element={<div>Painel Page</div>} />
        <Route
          path="/custom-redirect"
          element={<div>Custom Redirect Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
};

// Create a complete mock return value for useModules
const createMockModulesReturn = (
  overrides: Partial<UseModulesReturn> = {}
): UseModulesReturn => ({
  modules: DEFAULT_MODULES,
  loading: false,
  hasSimulator: true,
  hasEssay: true,
  hasForum: true,
  hasSupport: true,
  hasChat: true,
  hasRecommendedLessons: true,
  hasActivities: true,
  hasQuestionBanks: true,
  hasComparator: true,
  hasPerformance: true,
  hasDashboard: true,
  hasLessons: true,
  hasTutorial: false,
  tutorialUrl: '',
  hasExams: true,
  hasSimulations: true,
  simulations: DEFAULT_SIMULATIONS,
  hasPerformanceAulas: true,
  hasPerformanceAcessos: true,
  hasPerformanceSimulados: true,
  hasPerformanceAtividades: true,
  hasPerformanceQuestoes: true,
  hasPerformanceRanking: true,
  performanceGraphs: DEFAULT_PERFORMANCE_GRAPHS,
  hasSimulatedReports: true,
  hasSimulatedGenericReports: false,
  hasActivitiesReports: true,
  hasQuestionnairesReports: false,
  hasLessonsReports: true,
  hasEssayReports: true,
  reports: DEFAULT_REPORTS,
  hasSimulatedScoreTri: false,
  hasSimulatedScoreAbsoluto: false,
  simulatedScore: DEFAULT_SIMULATED_SCORE,
  ...overrides,
});

describe('ModuleProtectedRoute', () => {
  const defaultModules = DEFAULT_MODULES;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when loading', () => {
    it('should render nothing while loading', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({ loading: true })
      );

      const { container } = renderWithRouter(
        <ModuleProtectedRoute module="simulator">
          <div>Protected Content</div>
        </ModuleProtectedRoute>
      );

      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('when module is enabled', () => {
    it('should render children when simulator module is enabled', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({
          modules: { ...defaultModules, simulator: true },
          hasSimulator: true,
        })
      );

      renderWithRouter(
        <ModuleProtectedRoute module="simulator">
          <div>Simulator Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.getByText('Simulator Content')).toBeInTheDocument();
    });

    it('should render children when essay module is enabled', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({
          modules: { ...defaultModules, essay: true },
          hasEssay: true,
        })
      );

      renderWithRouter(
        <ModuleProtectedRoute module="essay">
          <div>Essay Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.getByText('Essay Content')).toBeInTheDocument();
    });

    it('should render children when forum module is enabled', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({
          modules: { ...defaultModules, forum: true },
          hasForum: true,
        })
      );

      renderWithRouter(
        <ModuleProtectedRoute module="forum">
          <div>Forum Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.getByText('Forum Content')).toBeInTheDocument();
    });

    it('should render children when support module is enabled', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({
          modules: { ...defaultModules, support: true },
          hasSupport: true,
        })
      );

      renderWithRouter(
        <ModuleProtectedRoute module="support">
          <div>Support Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.getByText('Support Content')).toBeInTheDocument();
    });
  });

  describe('when module is disabled', () => {
    it('should redirect to /painel when simulator module is disabled', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({
          modules: { ...defaultModules, simulator: false },
          hasSimulator: false,
        })
      );

      renderWithRouter(
        <ModuleProtectedRoute module="simulator">
          <div>Simulator Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.queryByText('Simulator Content')).not.toBeInTheDocument();
      expect(screen.getByText('Painel Page')).toBeInTheDocument();
    });

    it('should redirect to /painel when essay module is disabled', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({
          modules: { ...defaultModules, essay: false },
          hasEssay: false,
        })
      );

      renderWithRouter(
        <ModuleProtectedRoute module="essay">
          <div>Essay Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.queryByText('Essay Content')).not.toBeInTheDocument();
      expect(screen.getByText('Painel Page')).toBeInTheDocument();
    });

    it('should redirect to /painel when forum module is disabled', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({
          modules: { ...defaultModules, forum: false },
          hasForum: false,
        })
      );

      renderWithRouter(
        <ModuleProtectedRoute module="forum">
          <div>Forum Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.queryByText('Forum Content')).not.toBeInTheDocument();
      expect(screen.getByText('Painel Page')).toBeInTheDocument();
    });

    it('should redirect to /painel when support module is disabled', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({
          modules: { ...defaultModules, support: false },
          hasSupport: false,
        })
      );

      renderWithRouter(
        <ModuleProtectedRoute module="support">
          <div>Support Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.queryByText('Support Content')).not.toBeInTheDocument();
      expect(screen.getByText('Painel Page')).toBeInTheDocument();
    });
  });

  describe('custom redirectTo', () => {
    it('should redirect to custom path when module is disabled', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({
          modules: { ...defaultModules, simulator: false },
          hasSimulator: false,
        })
      );

      renderWithRouter(
        <ModuleProtectedRoute module="simulator" redirectTo="/custom-redirect">
          <div>Simulator Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.queryByText('Simulator Content')).not.toBeInTheDocument();
      expect(screen.getByText('Custom Redirect Page')).toBeInTheDocument();
    });

    it('should use default /painel when redirectTo is not specified', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({
          modules: { ...defaultModules, essay: false },
          hasEssay: false,
        })
      );

      renderWithRouter(
        <ModuleProtectedRoute module="essay">
          <div>Essay Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.getByText('Painel Page')).toBeInTheDocument();
    });
  });

  describe('complex children', () => {
    it('should render complex children components when module is enabled', () => {
      mockUseModules.mockReturnValue(createMockModulesReturn());

      const ComplexChild = () => (
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      );

      renderWithRouter(
        <ModuleProtectedRoute module="simulator">
          <ComplexChild />
        </ModuleProtectedRoute>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Action' })
      ).toBeInTheDocument();
    });

    it('should render multiple children when module is enabled', () => {
      mockUseModules.mockReturnValue(createMockModulesReturn());

      renderWithRouter(
        <ModuleProtectedRoute module="forum">
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ModuleProtectedRoute>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('enabled prop (derived gates)', () => {
    it('should render children when enabled is true', () => {
      mockUseModules.mockReturnValue(createMockModulesReturn());

      renderWithRouter(
        <ModuleProtectedRoute enabled={true}>
          <div>Simulados Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.getByText('Simulados Content')).toBeInTheDocument();
    });

    it('should redirect when enabled is false', () => {
      mockUseModules.mockReturnValue(createMockModulesReturn());

      renderWithRouter(
        <ModuleProtectedRoute enabled={false}>
          <div>Simulados Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.queryByText('Simulados Content')).not.toBeInTheDocument();
      expect(screen.getByText('Painel Page')).toBeInTheDocument();
    });

    it('should prefer enabled over the module key when both are provided', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({
          modules: { ...defaultModules, simulator: true },
          hasSimulator: true,
        })
      );

      renderWithRouter(
        <ModuleProtectedRoute module="simulator" enabled={false}>
          <div>Simulados Content</div>
        </ModuleProtectedRoute>
      );

      // enabled=false wins even though simulator module is true
      expect(screen.queryByText('Simulados Content')).not.toBeInTheDocument();
      expect(screen.getByText('Painel Page')).toBeInTheDocument();
    });

    it('should render nothing while loading even when enabled is true', () => {
      mockUseModules.mockReturnValue(
        createMockModulesReturn({ loading: true })
      );

      const { container } = renderWithRouter(
        <ModuleProtectedRoute enabled={true}>
          <div>Simulados Content</div>
        </ModuleProtectedRoute>
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('should fail closed (redirect) when neither module nor enabled is provided', () => {
      mockUseModules.mockReturnValue(createMockModulesReturn());

      renderWithRouter(
        // @ts-expect-error — the prop types require a gate; this verifies the
        // defensive runtime fallback redirects rather than failing open.
        <ModuleProtectedRoute>
          <div>Ungated Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.queryByText('Ungated Content')).not.toBeInTheDocument();
      expect(screen.getByText('Painel Page')).toBeInTheDocument();
    });
  });
});
