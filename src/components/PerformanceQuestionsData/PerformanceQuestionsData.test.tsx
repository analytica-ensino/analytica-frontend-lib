import { render, screen } from '@testing-library/react';
import {
  PerformanceQuestionsData,
  PerformanceQuestionsVariant,
} from './PerformanceQuestionsData';
import type {
  QuestionsVariantData,
  ContentVariantData,
  PerformanceFilterConfig,
} from './PerformanceQuestionsData';

const mockQuestionsData: QuestionsVariantData = {
  total: 100,
  correct: 60,
  incorrect: 30,
  blank: 10,
};

const mockMaterialData: ContentVariantData = {
  total: 37,
  totalActivities: 25,
  totalRecommendedLessons: 12,
};

const mockSubjectFilter: PerformanceFilterConfig = {
  options: [
    { value: 'all', label: 'Todos componentes' },
    { value: 'math', label: 'Matemática' },
  ],
  value: 'all',
  onChange: jest.fn(),
  placeholder: 'Todos componentes',
};

const mockActivityTypeFilter: PerformanceFilterConfig = {
  options: [
    { value: 'all', label: 'Todos' },
    { value: 'ATIVIDADE', label: 'Atividades' },
  ],
  value: 'all',
  onChange: jest.fn(),
  placeholder: 'Todos',
};

describe('PerformanceQuestionsData', () => {
  describe('Rendering - questions variant', () => {
    it('should render with default title for questions variant', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
        />
      );

      expect(screen.getByText('Dados de questões')).toBeInTheDocument();
    });

    it('should render legend items for questions variant', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
        />
      );

      expect(
        screen.getByText('Total de questões respondidas')
      ).toBeInTheDocument();
      expect(screen.getByText('Questões corretas')).toBeInTheDocument();
      expect(screen.getByText('Questões incorretas')).toBeInTheDocument();
      expect(screen.getByText('Questões em branco')).toBeInTheDocument();
    });

    it('should render bar labels for questions variant', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
        />
      );

      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Corretas')).toBeInTheDocument();
      expect(screen.getByText('Incorretas')).toBeInTheDocument();
      expect(screen.getByText('Em branco')).toBeInTheDocument();
    });

    it('should render 4 bars for questions variant', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
        />
      );

      const bars = container.querySelectorAll('.rounded-lg');
      expect(bars).toHaveLength(4);
    });
  });

  describe('Rendering - material variant', () => {
    it('should render with default title for material variant', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.CONTENT}
          data={mockMaterialData}
        />
      );

      expect(
        screen.getByText('Dados de material produzido')
      ).toBeInTheDocument();
    });

    it('should render legend items and bar labels for material variant', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.CONTENT}
          data={mockMaterialData}
        />
      );

      // "Total" appears as both legend and bar label
      const totalElements = screen.getAllByText('Total');
      expect(totalElements).toHaveLength(2);
      // "Atividades" appears as both legend and bar label
      const atividadesElements = screen.getAllByText('Atividades');
      expect(atividadesElements).toHaveLength(2);
      // "Aulas recomendadas" appears as both legend and bar label
      const aulasElements = screen.getAllByText('Aulas recomendadas');
      expect(aulasElements).toHaveLength(2);
    });

    it('should render 3 bars for material variant', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.CONTENT}
          data={mockMaterialData}
        />
      );

      const bars = container.querySelectorAll('.rounded-lg');
      expect(bars).toHaveLength(3);
    });
  });

  describe('Filters', () => {
    it('should render subject filter when provided', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
          subjectFilter={mockSubjectFilter}
        />
      );

      expect(screen.getByText('Todos componentes')).toBeInTheDocument();
    });

    it('should render activity type filter when provided', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
          activityTypeFilter={mockActivityTypeFilter}
        />
      );

      expect(screen.getByText('Todos')).toBeInTheDocument();
    });

    it('should render both filters when provided', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
          subjectFilter={mockSubjectFilter}
          activityTypeFilter={mockActivityTypeFilter}
        />
      );

      expect(screen.getByText('Todos componentes')).toBeInTheDocument();
      expect(screen.getByText('Todos')).toBeInTheDocument();
    });

    it('should render filter icon when provided', () => {
      const MockIcon = () => <svg data-testid="filter-icon" />;
      const filterWithIcon: PerformanceFilterConfig = {
        ...mockSubjectFilter,
        icon: <MockIcon />,
      };

      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
          subjectFilter={filterWithIcon}
        />
      );

      expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
    });

    it('should not render filter icon when not provided', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
          subjectFilter={mockSubjectFilter}
        />
      );

      expect(
        container.querySelector('[data-testid="filter-icon"]')
      ).not.toBeInTheDocument();
    });

    it('should not render filters when not provided', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
        />
      );

      // No select triggers should be rendered
      const buttons = container.querySelectorAll(
        'button[aria-haspopup="listbox"]'
      );
      expect(buttons).toHaveLength(0);
    });
  });

  describe('Y-Axis', () => {
    it('should render Y-axis ticks', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
        />
      );

      // With maxValue of 100, ticks: 100, 75, 50, 25, 0
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should calculate nice tick values for odd numbers', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.CONTENT}
          data={{
            total: 87,
            totalActivities: 50,
            totalRecommendedLessons: 30,
          }}
        />
      );

      // 87 rounds up to 90
      expect(screen.getByText('90')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Bar Heights', () => {
    it('should calculate correct bar heights for questions variant', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
          chartHeight={180}
        />
      );

      const bars = container.querySelectorAll('.rounded-lg');
      const totalBar = bars[0] as HTMLElement;
      const correctBar = bars[1] as HTMLElement;
      const incorrectBar = bars[2] as HTMLElement;

      // Total = 100, max = 100 → 100% → 180px
      expect(totalBar.style.height).toBe('180px');
      // Correct = 60, max = 100 → 60% → 108px
      expect(correctBar.style.height).toBe('108px');
      // Incorrect = 30, max = 100 → 30% → 54px
      expect(incorrectBar.style.height).toBe('54px');
    });

    it('should use custom maxValue for calculations', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
          maxValue={200}
          chartHeight={180}
        />
      );

      const bars = container.querySelectorAll('.rounded-lg');
      const totalBar = bars[0] as HTMLElement;

      // Total = 100, max adjusted to 200 → 50% → 90px
      expect(totalBar.style.height).toBe('90px');
    });

    it('should handle zero total gracefully', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={{ total: 0, correct: 0, incorrect: 0, blank: 0 }}
        />
      );

      const bars = container.querySelectorAll('.rounded-lg');
      bars.forEach((bar) => {
        expect((bar as HTMLElement).style.height).toBe('0px');
      });
    });
  });

  describe('Styles', () => {
    it('should have correct container classes', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-background');
      expect(wrapper).toHaveClass('border-border-50');
      expect(wrapper).toHaveClass('rounded-xl');
    });

    it('should apply additional className', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should render correct bar colors for questions variant', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
        />
      );

      expect(container.querySelector('.bg-info-600')).toBeInTheDocument();
      expect(container.querySelector('.bg-success-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-warning-400')).toBeInTheDocument();
      expect(container.querySelector('.bg-background-300')).toBeInTheDocument();
    });

    it('should render correct bar colors for material variant', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.CONTENT}
          data={mockMaterialData}
        />
      );

      expect(container.querySelector('.bg-info-600')).toBeInTheDocument();
      expect(container.querySelector('.bg-success-700')).toBeInTheDocument();
      expect(container.querySelector('.bg-warning-300')).toBeInTheDocument();
    });

    it('should render legend dots with correct count per variant', () => {
      const { container: questionsContainer } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
        />
      );
      expect(
        questionsContainer.querySelectorAll('.w-2.h-2.rounded-full')
      ).toHaveLength(4);

      const { container: materialContainer } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.CONTENT}
          data={mockMaterialData}
        />
      );
      expect(
        materialContainer.querySelectorAll('.w-2.h-2.rounded-full')
      ).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    it('should use semantic heading for title', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
        />
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Dados de questões');
    });

    it('should have readable legend content', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
        />
      );

      expect(screen.getByText('Total de questões respondidas')).toBeVisible();
      expect(screen.getByText('Questões corretas')).toBeVisible();
      expect(screen.getByText('Questões incorretas')).toBeVisible();
      expect(screen.getByText('Questões em branco')).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('should use custom chart height', () => {
      const { container } = render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={mockQuestionsData}
          chartHeight={200}
        />
      );

      const barContainers = container.querySelectorAll(
        '.flex.items-end.justify-center'
      );
      barContainers.forEach((barContainer) => {
        expect((barContainer as HTMLElement).style.height).toBe('200px');
      });
    });

    it('should handle large numbers', () => {
      render(
        <PerformanceQuestionsData
          variant={PerformanceQuestionsVariant.QUESTIONS}
          data={{
            total: 10000,
            correct: 8000,
            incorrect: 1500,
            blank: 500,
          }}
        />
      );

      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Corretas')).toBeInTheDocument();
    });
  });
});
