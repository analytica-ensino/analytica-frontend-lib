import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StudentRanking, RankingCard } from './StudentRanking';

describe('StudentRanking', () => {
  const mockHighlightStudents = [
    { position: 1, name: 'Valentina Ribeiro', percentage: 100 },
    { position: 2, name: 'Lucas Almeida', percentage: 100 },
    { position: 3, name: 'Fernanda Costa', percentage: 100 },
  ];

  const mockAttentionStudents = [
    { position: 1, name: 'Ricardo Silva', percentage: 80 },
    { position: 2, name: 'Juliana Santos', percentage: 50 },
    { position: 3, name: 'Gabriel Oliveira', percentage: 40 },
  ];

  describe('StudentRanking Component', () => {
    describe('Rendering', () => {
      it('should render both cards with default titles', () => {
        render(
          <StudentRanking
            highlightStudents={mockHighlightStudents}
            attentionStudents={mockAttentionStudents}
          />
        );

        expect(screen.getByText('Estudantes em destaque')).toBeInTheDocument();
        expect(
          screen.getByText('Estudantes precisando de atenção')
        ).toBeInTheDocument();
      });

      it('should render with custom titles', () => {
        render(
          <StudentRanking
            highlightTitle="Top Performers"
            attentionTitle="Needs Improvement"
            highlightStudents={mockHighlightStudents}
            attentionStudents={mockAttentionStudents}
          />
        );

        expect(screen.getByText('Top Performers')).toBeInTheDocument();
        expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
      });

      it('should render all highlight students', () => {
        render(
          <StudentRanking
            highlightStudents={mockHighlightStudents}
            attentionStudents={mockAttentionStudents}
          />
        );

        expect(screen.getByText('Valentina Ribeiro')).toBeInTheDocument();
        expect(screen.getByText('Lucas Almeida')).toBeInTheDocument();
        expect(screen.getByText('Fernanda Costa')).toBeInTheDocument();
      });

      it('should render all attention students', () => {
        render(
          <StudentRanking
            highlightStudents={mockHighlightStudents}
            attentionStudents={mockAttentionStudents}
          />
        );

        expect(screen.getByText('Ricardo Silva')).toBeInTheDocument();
        expect(screen.getByText('Juliana Santos')).toBeInTheDocument();
        expect(screen.getByText('Gabriel Oliveira')).toBeInTheDocument();
      });

      it('should render percentage values with % symbol', () => {
        render(
          <StudentRanking
            highlightStudents={mockHighlightStudents}
            attentionStudents={mockAttentionStudents}
          />
        );

        expect(screen.getAllByText('100%')).toHaveLength(3);
        expect(screen.getByText('80%')).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();
        expect(screen.getByText('40%')).toBeInTheDocument();
      });

      it('should render position badges', () => {
        const { container } = render(
          <StudentRanking
            highlightStudents={mockHighlightStudents}
            attentionStudents={mockAttentionStudents}
          />
        );

        const positionBadges = container.querySelectorAll('.rounded-full.w-5');
        expect(positionBadges.length).toBeGreaterThanOrEqual(6);
      });

      it('should apply additional className', () => {
        const { container } = render(
          <StudentRanking
            highlightStudents={mockHighlightStudents}
            attentionStudents={mockAttentionStudents}
            className="custom-class"
          />
        );

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass('custom-class');
      });
    });

    describe('Styles', () => {
      it('should have correct layout classes', () => {
        const { container } = render(
          <StudentRanking
            highlightStudents={mockHighlightStudents}
            attentionStudents={mockAttentionStudents}
          />
        );

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass('flex');
        expect(wrapper).toHaveClass('gap-4');
      });

      it('should render highlight cards with gradient green backgrounds by position', () => {
        const { container } = render(
          <StudentRanking
            highlightStudents={mockHighlightStudents}
            attentionStudents={mockAttentionStudents}
          />
        );

        expect(container.querySelector('.bg-success-200')).toBeInTheDocument();
        expect(container.querySelector('.bg-success-100')).toBeInTheDocument();
        expect(
          container.querySelector('.bg-success-background')
        ).toBeInTheDocument();
      });

      it('should render attention cards with gradient red backgrounds by position', () => {
        const { container } = render(
          <StudentRanking
            highlightStudents={mockHighlightStudents}
            attentionStudents={mockAttentionStudents}
          />
        );

        expect(container.querySelector('.bg-error-200')).toBeInTheDocument();
        expect(container.querySelector('.bg-error-100')).toBeInTheDocument();
        expect(
          container.querySelector('.bg-error-background')
        ).toBeInTheDocument();
      });
    });
  });

  describe('RankingCard Component', () => {
    describe('Highlight Variant', () => {
      it('should render with highlight styling', () => {
        const { container } = render(
          <RankingCard
            title="Estudantes em destaque"
            variant="highlight"
            students={mockHighlightStudents}
          />
        );

        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('bg-background');
        expect(card).toHaveClass('border-border-50');
        expect(card).toHaveClass('rounded-xl');
      });

      it('should render trophy icon in header', () => {
        const { container } = render(
          <RankingCard
            title="Estudantes em destaque"
            variant="highlight"
            students={mockHighlightStudents}
          />
        );

        const headerBadge = container.querySelector('.bg-indicator-positive');
        expect(headerBadge).toBeInTheDocument();
      });

      it('should render green student cards with gradient by position', () => {
        const { container } = render(
          <RankingCard
            title="Estudantes em destaque"
            variant="highlight"
            students={mockHighlightStudents}
          />
        );

        expect(container.querySelector('.bg-success-200')).toBeInTheDocument();
        expect(container.querySelector('.bg-success-100')).toBeInTheDocument();
        expect(
          container.querySelector('.bg-success-background')
        ).toBeInTheDocument();
      });

      it('should render green percentage badges', () => {
        const { container } = render(
          <RankingCard
            title="Estudantes em destaque"
            variant="highlight"
            students={mockHighlightStudents}
          />
        );

        const greenBadges = container.querySelectorAll('.bg-success-700');
        expect(greenBadges).toHaveLength(3);
      });
    });

    describe('Attention Variant', () => {
      it('should render with attention styling', () => {
        const { container } = render(
          <RankingCard
            title="Estudantes precisando de atenção"
            variant="attention"
            students={mockAttentionStudents}
          />
        );

        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('bg-background');
        expect(card).toHaveClass('border-border-50');
        expect(card).toHaveClass('rounded-xl');
      });

      it('should render warning icon in header', () => {
        const { container } = render(
          <RankingCard
            title="Estudantes precisando de atenção"
            variant="attention"
            students={mockAttentionStudents}
          />
        );

        const headerBadge = container.querySelector('.bg-indicator-negative');
        expect(headerBadge).toBeInTheDocument();
      });

      it('should render red student cards with gradient by position', () => {
        const { container } = render(
          <RankingCard
            title="Estudantes precisando de atenção"
            variant="attention"
            students={mockAttentionStudents}
          />
        );

        expect(container.querySelector('.bg-error-200')).toBeInTheDocument();
        expect(container.querySelector('.bg-error-100')).toBeInTheDocument();
        expect(
          container.querySelector('.bg-error-background')
        ).toBeInTheDocument();
      });

      it('should render red percentage badges', () => {
        const { container } = render(
          <RankingCard
            title="Estudantes precisando de atenção"
            variant="attention"
            students={mockAttentionStudents}
          />
        );

        const redBadges = container.querySelectorAll('.bg-indicator-negative');
        expect(redBadges.length).toBeGreaterThanOrEqual(3);
      });
    });

    describe('Student Cards', () => {
      it('should render position number in badge', () => {
        render(
          <RankingCard
            title="Test"
            variant="highlight"
            students={[{ position: 1, name: 'Test Student', percentage: 100 }]}
          />
        );

        const positionBadge = screen.getByText('1');
        expect(positionBadge).toBeInTheDocument();
      });

      it('should render student name', () => {
        render(
          <RankingCard
            title="Test"
            variant="highlight"
            students={[
              { position: 1, name: 'Test Student Name', percentage: 100 },
            ]}
          />
        );

        expect(screen.getByText('Test Student Name')).toBeInTheDocument();
      });

      it('should render percentage with % symbol', () => {
        render(
          <RankingCard
            title="Test"
            variant="highlight"
            students={[{ position: 1, name: 'Test', percentage: 85 }]}
          />
        );

        expect(screen.getByText('85%')).toBeInTheDocument();
      });

      it('should truncate long names', () => {
        const { container } = render(
          <RankingCard
            title="Test"
            variant="highlight"
            students={[
              {
                position: 1,
                name: 'Very Long Student Name That Should Be Truncated',
                percentage: 100,
              },
            ]}
          />
        );

        const nameElement = container.querySelector('.truncate');
        expect(nameElement).toBeInTheDocument();
      });
    });

    describe('Icons', () => {
      it('should render TrendUp icon for highlight variant', () => {
        const { container } = render(
          <RankingCard
            title="Test"
            variant="highlight"
            students={[{ position: 1, name: 'Test', percentage: 100 }]}
          />
        );

        const svgElements = container.querySelectorAll('svg');
        expect(svgElements.length).toBeGreaterThanOrEqual(2);
      });

      it('should render TrendDown icon for attention variant', () => {
        const { container } = render(
          <RankingCard
            title="Test"
            variant="attention"
            students={[{ position: 1, name: 'Test', percentage: 40 }]}
          />
        );

        const svgElements = container.querySelectorAll('svg');
        expect(svgElements.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty students array', () => {
        const { container } = render(
          <RankingCard title="Test" variant="highlight" students={[]} />
        );

        expect(screen.getByText('Test')).toBeInTheDocument();
        const studentCards = container.querySelectorAll('.bg-success-200');
        expect(studentCards).toHaveLength(0);
      });

      it('should handle single student', () => {
        render(
          <RankingCard
            title="Test"
            variant="highlight"
            students={[{ position: 1, name: 'Only Student', percentage: 100 }]}
          />
        );

        expect(screen.getByText('Only Student')).toBeInTheDocument();
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      it('should handle five students', () => {
        const fiveStudents = [
          { position: 1, name: 'Student 1', percentage: 100 },
          { position: 2, name: 'Student 2', percentage: 95 },
          { position: 3, name: 'Student 3', percentage: 90 },
          { position: 4, name: 'Student 4', percentage: 85 },
          { position: 5, name: 'Student 5', percentage: 80 },
        ];

        render(
          <RankingCard
            title="Test"
            variant="highlight"
            students={fiveStudents}
          />
        );

        fiveStudents.forEach((student) => {
          expect(screen.getByText(student.name)).toBeInTheDocument();
        });
      });

      it('should handle 0% percentage', () => {
        render(
          <RankingCard
            title="Test"
            variant="attention"
            students={[{ position: 1, name: 'Zero Student', percentage: 0 }]}
          />
        );

        expect(screen.getByText('0%')).toBeInTheDocument();
      });

      it('should apply custom className', () => {
        const { container } = render(
          <RankingCard
            title="Test"
            variant="highlight"
            students={mockHighlightStudents}
            className="my-custom-class"
          />
        );

        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('my-custom-class');
      });
    });
  });

  describe('Accessibility', () => {
    it('should use semantic heading for title', () => {
      render(
        <StudentRanking
          highlightStudents={mockHighlightStudents}
          attentionStudents={mockAttentionStudents}
        />
      );

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(2);
    });

    it('should have readable text content', () => {
      render(
        <StudentRanking
          highlightStudents={mockHighlightStudents}
          attentionStudents={mockAttentionStudents}
        />
      );

      mockHighlightStudents.forEach((student) => {
        expect(screen.getByText(student.name)).toBeVisible();
      });

      mockAttentionStudents.forEach((student) => {
        expect(screen.getByText(student.name)).toBeVisible();
      });
    });
  });
});
