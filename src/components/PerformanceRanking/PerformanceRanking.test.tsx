import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PerformanceRanking,
  type PerformanceRankingData,
} from './PerformanceRanking';

const mockStateData: PerformanceRankingData = {
  groupedBy: 'state',
  highlighted: [
    { position: 1, name: 'SP', count: 150, percentage: 85, trend: 'up' },
    { position: 2, name: 'RJ', count: 120, percentage: 78, trend: 'down' },
    { position: 3, name: 'MG', count: 100, percentage: 72, trend: null },
  ],
  needsAttention: [
    { position: 1, name: 'BA', count: 30, percentage: 25, trend: 'down' },
    { position: 2, name: 'PE', count: 35, percentage: 28, trend: null },
    { position: 3, name: 'CE', count: 40, percentage: 32, trend: 'up' },
  ],
};

const mockClassData: PerformanceRankingData = {
  groupedBy: 'class',
  highlighted: [
    {
      position: 1,
      name: 'Turma A',
      count: 45,
      percentage: 90,
      trend: 'up',
      shift: 'Manhã',
      grade: '9º Ano',
    },
    {
      position: 2,
      name: 'Turma B',
      count: 40,
      percentage: 85,
      trend: 'up',
      shift: 'Tarde',
      grade: '8º Ano',
    },
    {
      position: 3,
      name: 'Turma C',
      count: 38,
      percentage: 80,
      trend: null,
      shift: 'Manhã',
      grade: '7º Ano',
    },
  ],
  needsAttention: [
    {
      position: 1,
      name: 'Turma F',
      count: 10,
      percentage: 20,
      trend: 'down',
      shift: 'Noite',
      grade: '9º Ano',
    },
    {
      position: 2,
      name: 'Turma E',
      count: 12,
      percentage: 25,
      trend: 'down',
      shift: 'Tarde',
      grade: '6º Ano',
    },
    {
      position: 3,
      name: 'Turma D',
      count: 15,
      percentage: 30,
      trend: null,
      shift: 'Manhã',
      grade: '8º Ano',
    },
  ],
};

describe('PerformanceRanking', () => {
  describe('Rendering', () => {
    it('should render both cards with default titles', () => {
      render(<PerformanceRanking data={mockStateData} />);

      expect(screen.getByText('Em destaque')).toBeInTheDocument();
      expect(screen.getByText('Precisando de atenção')).toBeInTheDocument();
    });

    it('should render with custom titles', () => {
      render(
        <PerformanceRanking
          data={mockStateData}
          highlightTitle="Top Regions"
          attentionTitle="Needs Improvement"
        />
      );

      expect(screen.getByText('Top Regions')).toBeInTheDocument();
      expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
    });

    it('should render all highlighted items', () => {
      render(<PerformanceRanking data={mockStateData} />);

      expect(screen.getByText('SP')).toBeInTheDocument();
      expect(screen.getByText('RJ')).toBeInTheDocument();
      expect(screen.getByText('MG')).toBeInTheDocument();
    });

    it('should render all attention items', () => {
      render(<PerformanceRanking data={mockStateData} />);

      expect(screen.getByText('BA')).toBeInTheDocument();
      expect(screen.getByText('PE')).toBeInTheDocument();
      expect(screen.getByText('CE')).toBeInTheDocument();
    });

    it('should render percentage values with % symbol', () => {
      render(<PerformanceRanking data={mockStateData} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('78%')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should render count badges', () => {
      render(<PerformanceRanking data={mockStateData} />);

      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('should render count badges with label when countLabel is provided', () => {
      render(
        <PerformanceRanking data={mockStateData} countLabel="estudantes" />
      );

      expect(screen.getByText('150 estudantes')).toBeInTheDocument();
      expect(screen.getByText('120 estudantes')).toBeInTheDocument();
      expect(screen.getByText('30 estudantes')).toBeInTheDocument();
    });

    it('should render position badges', () => {
      render(<PerformanceRanking data={mockStateData} />);

      const positionBadges = screen.getAllByLabelText(/^Position \d+$/);
      expect(positionBadges).toHaveLength(6);
    });

    it('should apply additional className', () => {
      const { container } = render(
        <PerformanceRanking data={mockStateData} className="custom-class" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Trend Icons', () => {
    it('should render trend icons for all items', () => {
      render(<PerformanceRanking data={mockStateData} />);

      const performanceBadges = screen.getAllByLabelText(/^Performance \d+%$/);
      expect(performanceBadges).toHaveLength(6);
      // Each performance badge contains a trend SVG icon
      performanceBadges.forEach((badge) => {
        expect(badge.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Class Grouping', () => {
    it('should render shift and grade inline with name', () => {
      render(<PerformanceRanking data={mockClassData} />);

      expect(screen.getByText('Turma A (Manhã) (9º Ano)')).toBeInTheDocument();
      expect(screen.getByText('Turma B (Tarde) (8º Ano)')).toBeInTheDocument();
      expect(screen.getByText('Turma C (Manhã) (7º Ano)')).toBeInTheDocument();
    });

    it('should render attention class names with shift and grade', () => {
      render(<PerformanceRanking data={mockClassData} />);

      expect(screen.getByText('Turma F (Noite) (9º Ano)')).toBeInTheDocument();
      expect(screen.getByText('Turma E (Tarde) (6º Ano)')).toBeInTheDocument();
      expect(screen.getByText('Turma D (Manhã) (8º Ano)')).toBeInTheDocument();
    });

    it('should render plain names when shift/grade are absent', () => {
      render(<PerformanceRanking data={mockStateData} />);

      expect(screen.getByText('SP')).toBeInTheDocument();
      expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
    });
  });

  describe('Null Items', () => {
    it('should render placeholder for null items', () => {
      const dataWithNull: PerformanceRankingData = {
        groupedBy: 'state',
        highlighted: [
          {
            position: 1,
            name: 'SP',
            count: 150,
            percentage: 85,
            trend: 'up',
          },
          null,
          null,
        ],
        needsAttention: [
          {
            position: 1,
            name: 'BA',
            count: 30,
            percentage: 25,
            trend: 'down',
          },
          null,
          null,
        ],
      };

      render(<PerformanceRanking data={dataWithNull} />);

      expect(screen.getByText('SP')).toBeInTheDocument();
      expect(screen.getByText('BA')).toBeInTheDocument();
      expect(screen.getAllByText('Sem dados')).toHaveLength(4);
    });

    it('should handle all null items gracefully', () => {
      const allNull: PerformanceRankingData = {
        groupedBy: 'state',
        highlighted: [null, null, null],
        needsAttention: [null, null, null],
      };

      render(<PerformanceRanking data={allNull} />);

      expect(screen.getAllByText('Sem dados')).toHaveLength(6);
    });
  });

  describe('Styles', () => {
    it('should have correct layout classes', () => {
      const { container } = render(<PerformanceRanking data={mockStateData} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('gap-4');
    });

    it('should render highlight cards with gradient green backgrounds', () => {
      const { container } = render(<PerformanceRanking data={mockStateData} />);

      expect(container.querySelector('.bg-success-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-success-100')).toBeInTheDocument();
      expect(
        container.querySelector('.bg-success-background')
      ).toBeInTheDocument();
    });

    it('should render attention cards with gradient red backgrounds', () => {
      const { container } = render(<PerformanceRanking data={mockStateData} />);

      expect(container.querySelector('.bg-error-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-error-100')).toBeInTheDocument();
      expect(
        container.querySelector('.bg-error-background')
      ).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty arrays', () => {
      const emptyData: PerformanceRankingData = {
        groupedBy: 'state',
        highlighted: [],
        needsAttention: [],
      };

      render(<PerformanceRanking data={emptyData} />);

      expect(screen.getByText('Em destaque')).toBeInTheDocument();
      expect(screen.getByText('Precisando de atenção')).toBeInTheDocument();
    });

    it('should handle single item', () => {
      const singleData: PerformanceRankingData = {
        groupedBy: 'municipality',
        highlighted: [
          {
            position: 1,
            name: 'São Paulo',
            count: 150,
            percentage: 85,
            trend: 'up',
          },
        ],
        needsAttention: [
          {
            position: 1,
            name: 'Ribeirão Preto',
            count: 30,
            percentage: 25,
            trend: 'down',
          },
        ],
      };

      render(<PerformanceRanking data={singleData} />);

      expect(screen.getByText('São Paulo')).toBeInTheDocument();
      expect(screen.getByText('Ribeirão Preto')).toBeInTheDocument();
    });

    it('should handle 0% percentage', () => {
      const zeroData: PerformanceRankingData = {
        groupedBy: 'state',
        highlighted: [
          { position: 1, name: 'Test', count: 0, percentage: 0, trend: null },
        ],
        needsAttention: [],
      };

      render(<PerformanceRanking data={zeroData} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByLabelText('Count 0')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic heading for title', () => {
      render(<PerformanceRanking data={mockStateData} />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(2);
    });

    it('should have readable text content', () => {
      render(<PerformanceRanking data={mockStateData} />);

      mockStateData.highlighted.forEach((item) => {
        if (item) {
          expect(screen.getByText(item.name)).toBeVisible();
        }
      });

      mockStateData.needsAttention.forEach((item) => {
        if (item) {
          expect(screen.getByText(item.name)).toBeVisible();
        }
      });
    });
  });
});
