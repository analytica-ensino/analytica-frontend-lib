import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExamStatsCards, formatQuestions } from './ExamStatsCards';

describe('ExamStatsCards', () => {
  const defaultProps = {
    averageScore: 7.5,
    mostCorrectQuestions: [1, 3, 5],
    mostIncorrectQuestions: [2, 4],
    unansweredQuestions: [6],
  };

  describe('formatQuestions utility', () => {
    it('returns dash for empty array', () => {
      expect(formatQuestions([])).toBe('-');
    });

    it('formats single question with zero padding', () => {
      expect(formatQuestions([1])).toBe('01');
      expect(formatQuestions([10])).toBe('10');
    });

    it('formats two questions with "e" separator', () => {
      expect(formatQuestions([1, 2])).toBe('01 e 02');
    });

    it('formats multiple questions with commas and "e" for last', () => {
      expect(formatQuestions([1, 2, 3])).toBe('01, 02 e 03');
      expect(formatQuestions([1, 2, 3, 4, 5])).toBe('01, 02, 03, 04 e 05');
    });
  });

  describe('rendering', () => {
    it('renders with default title', () => {
      render(<ExamStatsCards {...defaultProps} />);
      expect(screen.getByText('Resultados da atividade')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<ExamStatsCards {...defaultProps} title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders average score card', () => {
      render(<ExamStatsCards {...defaultProps} />);
      expect(screen.getByText('Média da Turma')).toBeInTheDocument();
      expect(screen.getByText('7.5')).toBeInTheDocument();
    });

    it('renders most correct questions card', () => {
      render(<ExamStatsCards {...defaultProps} />);
      expect(screen.getByText('Questões com mais acertos')).toBeInTheDocument();
      expect(screen.getByText('01, 03 e 05')).toBeInTheDocument();
    });

    it('renders most incorrect questions card', () => {
      render(<ExamStatsCards {...defaultProps} />);
      expect(screen.getByText('Questões com mais erros')).toBeInTheDocument();
      expect(screen.getByText('02 e 04')).toBeInTheDocument();
    });

    it('renders unanswered questions card', () => {
      render(<ExamStatsCards {...defaultProps} />);
      expect(screen.getByText('Questões não respondidas')).toBeInTheDocument();
      expect(screen.getByText('06')).toBeInTheDocument();
    });

    it('renders dash when no questions in category', () => {
      render(
        <ExamStatsCards
          {...defaultProps}
          mostCorrectQuestions={[]}
          mostIncorrectQuestions={[]}
          unansweredQuestions={[]}
        />
      );
      const dashes = screen.getAllByText('-');
      expect(dashes).toHaveLength(3);
    });

    it('formats average score with one decimal', () => {
      render(<ExamStatsCards {...defaultProps} averageScore={8.333} />);
      expect(screen.getByText('8.3')).toBeInTheDocument();
    });

    it('renders all four stat cards', () => {
      const { container } = render(<ExamStatsCards {...defaultProps} />);
      const cards = container.querySelectorAll('.rounded-xl');
      expect(cards).toHaveLength(4);
    });
  });
});
