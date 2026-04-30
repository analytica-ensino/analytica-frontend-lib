import type React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GeneralOverviewSection } from './GeneralOverviewSection';
import type {
  GeneralOverviewData,
  AreaKnowledgePerformance,
  EssayPerformance,
} from './types';

// Mock IconRender component
jest.mock('../IconRender/IconRender', () => ({
  __esModule: true,
  default: ({ iconName }: { iconName: string }) => (
    <span data-testid={`icon-${iconName}`}>{iconName}</span>
  ),
}));

/**
 * Create mock areas (4 knowledge areas)
 */
function createMockAreas(): AreaKnowledgePerformance[] {
  return [
    {
      id: 'area-1',
      name: 'Linguagens',
      urlCover: null,
      icon: 'book',
      color: '#3B82F6',
      percentage: 68.5,
      questionsTotal: 100,
      questionsCorrect: 68,
    },
    {
      id: 'area-2',
      name: 'Humanas',
      urlCover: null,
      icon: 'globe',
      color: '#F59E0B',
      percentage: 72.3,
      questionsTotal: 80,
      questionsCorrect: 58,
    },
    {
      id: 'area-3',
      name: 'Natureza',
      urlCover: null,
      icon: 'leaf',
      color: '#22C55E',
      percentage: 65.0,
      questionsTotal: 90,
      questionsCorrect: 58,
    },
    {
      id: 'area-4',
      name: 'Matemática',
      urlCover: null,
      icon: 'calculator',
      color: '#8B5CF6',
      percentage: 70.8,
      questionsTotal: 85,
      questionsCorrect: 60,
    },
  ];
}

/**
 * Create mock essay performance
 */
function createMockEssay(): EssayPerformance {
  return {
    name: 'Redação',
    color: '#F43F5E',
    icon: 'article',
    percentage: 75.5,
    totalEssays: 50,
    totalStudents: 30,
  };
}

/**
 * Create mock general overview data
 */
function createMockData(includeEssay = true): GeneralOverviewData {
  return {
    overallPercentage: 69.2,
    totalQuestions: 355,
    totalCorrect: 244,
    areas: createMockAreas(),
    essay: includeEssay ? createMockEssay() : undefined,
  };
}

describe('GeneralOverviewSection', () => {
  describe('Loading state', () => {
    it('renders loading skeleton', () => {
      render(<GeneralOverviewSection data={null} loading={true} />);

      expect(screen.getByText('Geral')).toBeInTheDocument();
    });

    it('renders 5 skeleton cards when loading', () => {
      const { container } = render(
        <GeneralOverviewSection data={null} loading={true} />
      );

      // Should have exactly 5 skeleton elements
      const skeletons = container.querySelectorAll('.bg-background-50');
      expect(skeletons.length).toBe(5);
    });
  });

  describe('Error state', () => {
    it('renders error message', () => {
      render(
        <GeneralOverviewSection data={null} error="Erro ao carregar dados" />
      );

      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    });

    it('renders error with error styling', () => {
      const { container } = render(
        <GeneralOverviewSection data={null} error="Erro ao carregar dados" />
      );

      const errorContainer = container.querySelector('.bg-error-50');
      expect(errorContainer).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders nothing when no data and not loading', () => {
      const { container } = render(<GeneralOverviewSection data={null} />);

      // Component returns null, so container should have no content
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Data rendering - percentage mode', () => {
    it('renders title "Geral"', () => {
      render(<GeneralOverviewSection data={createMockData()} />);

      expect(screen.getByText('Geral')).toBeInTheDocument();
    });

    it('renders description text', () => {
      render(<GeneralOverviewSection data={createMockData()} />);

      expect(
        screen.getByText(/Dados que mostram a proficiência/)
      ).toBeInTheDocument();
    });

    it('renders overall percentage', () => {
      render(<GeneralOverviewSection data={createMockData()} />);

      expect(screen.getByText('69,2%')).toBeInTheDocument();
    });

    it('renders all 4 area cards', () => {
      render(<GeneralOverviewSection data={createMockData()} />);

      expect(screen.getByText('Linguagens')).toBeInTheDocument();
      expect(screen.getByText('Humanas')).toBeInTheDocument();
      expect(screen.getByText('Natureza')).toBeInTheDocument();
      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });

    it('renders area percentages', () => {
      render(<GeneralOverviewSection data={createMockData()} />);

      expect(screen.getByText('68,5%')).toBeInTheDocument();
      expect(screen.getByText('72,3%')).toBeInTheDocument();
      expect(screen.getByText('65,0%')).toBeInTheDocument();
      expect(screen.getByText('70,8%')).toBeInTheDocument();
    });

    it('renders essay card when essay data exists', () => {
      render(<GeneralOverviewSection data={createMockData(true)} />);

      expect(screen.getByText('Redação')).toBeInTheDocument();
      expect(screen.getByText('75,5%')).toBeInTheDocument();
    });

    it('does not render essay card when essay data is missing', () => {
      render(<GeneralOverviewSection data={createMockData(false)} />);

      expect(screen.queryByText('Redação')).not.toBeInTheDocument();
    });

    it('renders area icons', () => {
      render(<GeneralOverviewSection data={createMockData()} />);

      expect(screen.getByTestId('icon-book')).toBeInTheDocument();
      expect(screen.getByTestId('icon-globe')).toBeInTheDocument();
      expect(screen.getByTestId('icon-leaf')).toBeInTheDocument();
      expect(screen.getByTestId('icon-calculator')).toBeInTheDocument();
    });

    it('renders essay icon (article)', () => {
      render(<GeneralOverviewSection data={createMockData(true)} />);

      expect(screen.getByTestId('icon-article')).toBeInTheDocument();
    });
  });

  describe('Data rendering - TRI mode', () => {
    it('renders overall score as TRI', () => {
      render(
        <GeneralOverviewSection data={createMockData()} scoreType="tri" />
      );

      // 69.2 should be rounded to 69 (appears twice: overall and Linguagens 68.5 rounded)
      const scores69 = screen.getAllByText('69');
      expect(scores69.length).toBeGreaterThanOrEqual(1);
    });

    it('renders area scores as TRI', () => {
      render(
        <GeneralOverviewSection data={createMockData()} scoreType="tri" />
      );

      // Area percentages as TRI (rounded integers)
      // 69 appears twice (overall 69.2 and Linguagens 68.5)
      expect(screen.getAllByText('69').length).toBe(2);
      expect(screen.getByText('72')).toBeInTheDocument();
      expect(screen.getByText('65')).toBeInTheDocument();
      expect(screen.getByText('71')).toBeInTheDocument(); // 70.8 rounded
    });

    it('essay always shows percentage even in TRI mode', () => {
      render(
        <GeneralOverviewSection data={createMockData(true)} scoreType="tri" />
      );

      // Essay should still show percentage
      expect(screen.getByText('75,5%')).toBeInTheDocument();
    });
  });

  describe('Empty areas', () => {
    it('does not render area section when areas is empty and no essay', () => {
      const data: GeneralOverviewData = {
        overallPercentage: 69.2,
        totalQuestions: 0,
        totalCorrect: 0,
        areas: [],
        essay: undefined,
      };

      const { container } = render(<GeneralOverviewSection data={data} />);

      // Should still render the main container but no area cards
      expect(screen.getByText('Geral')).toBeInTheDocument();
      expect(container.querySelectorAll('.flex-1.min-w-0').length).toBe(0);
    });
  });
});
