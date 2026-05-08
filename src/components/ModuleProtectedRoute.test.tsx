import React, { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ModuleProtectedRoute } from './ModuleProtectedRoute';
import { useModules } from '../hooks/useModules';

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

describe('ModuleProtectedRoute', () => {
  const defaultModules = {
    simulator: true,
    essay: true,
    forum: true,
    support: true,
    simulatedReports: true,
    activitiesReports: true,
    lessonsReports: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when loading', () => {
    it('should render nothing while loading', () => {
      mockUseModules.mockReturnValue({
        modules: defaultModules,
        loading: true,
        hasSimulator: true,
        hasEssay: true,
        hasForum: true,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

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
      mockUseModules.mockReturnValue({
        modules: { ...defaultModules, simulator: true },
        loading: false,
        hasSimulator: true,
        hasEssay: true,
        hasForum: true,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

      renderWithRouter(
        <ModuleProtectedRoute module="simulator">
          <div>Simulator Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.getByText('Simulator Content')).toBeInTheDocument();
    });

    it('should render children when essay module is enabled', () => {
      mockUseModules.mockReturnValue({
        modules: { ...defaultModules, essay: true },
        loading: false,
        hasSimulator: true,
        hasEssay: true,
        hasForum: true,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

      renderWithRouter(
        <ModuleProtectedRoute module="essay">
          <div>Essay Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.getByText('Essay Content')).toBeInTheDocument();
    });

    it('should render children when forum module is enabled', () => {
      mockUseModules.mockReturnValue({
        modules: { ...defaultModules, forum: true },
        loading: false,
        hasSimulator: true,
        hasEssay: true,
        hasForum: true,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

      renderWithRouter(
        <ModuleProtectedRoute module="forum">
          <div>Forum Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.getByText('Forum Content')).toBeInTheDocument();
    });

    it('should render children when support module is enabled', () => {
      mockUseModules.mockReturnValue({
        modules: { ...defaultModules, support: true },
        loading: false,
        hasSimulator: true,
        hasEssay: true,
        hasForum: true,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

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
      mockUseModules.mockReturnValue({
        modules: { ...defaultModules, simulator: false },
        loading: false,
        hasSimulator: false,
        hasEssay: true,
        hasForum: true,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

      renderWithRouter(
        <ModuleProtectedRoute module="simulator">
          <div>Simulator Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.queryByText('Simulator Content')).not.toBeInTheDocument();
      expect(screen.getByText('Painel Page')).toBeInTheDocument();
    });

    it('should redirect to /painel when essay module is disabled', () => {
      mockUseModules.mockReturnValue({
        modules: { ...defaultModules, essay: false },
        loading: false,
        hasSimulator: true,
        hasEssay: false,
        hasForum: true,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

      renderWithRouter(
        <ModuleProtectedRoute module="essay">
          <div>Essay Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.queryByText('Essay Content')).not.toBeInTheDocument();
      expect(screen.getByText('Painel Page')).toBeInTheDocument();
    });

    it('should redirect to /painel when forum module is disabled', () => {
      mockUseModules.mockReturnValue({
        modules: { ...defaultModules, forum: false },
        loading: false,
        hasSimulator: true,
        hasEssay: true,
        hasForum: false,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

      renderWithRouter(
        <ModuleProtectedRoute module="forum">
          <div>Forum Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.queryByText('Forum Content')).not.toBeInTheDocument();
      expect(screen.getByText('Painel Page')).toBeInTheDocument();
    });

    it('should redirect to /painel when support module is disabled', () => {
      mockUseModules.mockReturnValue({
        modules: { ...defaultModules, support: false },
        loading: false,
        hasSimulator: true,
        hasEssay: true,
        hasForum: true,
        hasSupport: false,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

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
      mockUseModules.mockReturnValue({
        modules: { ...defaultModules, simulator: false },
        loading: false,
        hasSimulator: false,
        hasEssay: true,
        hasForum: true,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

      renderWithRouter(
        <ModuleProtectedRoute module="simulator" redirectTo="/custom-redirect">
          <div>Simulator Content</div>
        </ModuleProtectedRoute>
      );

      expect(screen.queryByText('Simulator Content')).not.toBeInTheDocument();
      expect(screen.getByText('Custom Redirect Page')).toBeInTheDocument();
    });

    it('should use default /painel when redirectTo is not specified', () => {
      mockUseModules.mockReturnValue({
        modules: { ...defaultModules, essay: false },
        loading: false,
        hasSimulator: true,
        hasEssay: false,
        hasForum: true,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

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
      mockUseModules.mockReturnValue({
        modules: defaultModules,
        loading: false,
        hasSimulator: true,
        hasEssay: true,
        hasForum: true,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

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
      mockUseModules.mockReturnValue({
        modules: defaultModules,
        loading: false,
        hasSimulator: true,
        hasEssay: true,
        hasForum: true,
        hasSupport: true,
        hasSimulatedReports: true,
        hasActivitiesReports: true,
        hasLessonsReports: true,
      });

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
});
