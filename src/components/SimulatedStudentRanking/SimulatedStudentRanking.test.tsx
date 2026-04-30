import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  SimulatedRankingCard,
  SimulatedStudentRanking,
} from './SimulatedStudentRanking';
import { formatScore } from './utils';
import { ScoreType } from './types';

describe('SimulatedStudentRanking', () => {
  const highlightStudents = [
    { position: 1, name: 'Maria', average: 92.4 },
    { position: 2, name: 'Joao', average: 88.1 },
  ];

  const attentionStudents = [
    { position: 1, name: 'Pedro', average: 42.7 },
    { position: 2, name: 'Ana', average: 39.3 },
  ];

  it('renders both cards with default titles', () => {
    render(
      <SimulatedStudentRanking
        highlightStudents={highlightStudents}
        attentionStudents={attentionStudents}
      />
    );

    expect(screen.getByText('Estudantes em destaque')).toBeInTheDocument();
    expect(
      screen.getByText('Estudantes com maior dificuldade')
    ).toBeInTheDocument();
  });

  it('renders custom titles', () => {
    render(
      <SimulatedStudentRanking
        highlightTitle="Top 2"
        attentionTitle="Atencao"
        highlightStudents={highlightStudents}
        attentionStudents={attentionStudents}
      />
    );

    expect(screen.getByText('Top 2')).toBeInTheDocument();
    expect(screen.getByText('Atencao')).toBeInTheDocument();
  });

  it('formats percentage scores with comma and percent symbol', () => {
    render(
      <SimulatedStudentRanking
        highlightStudents={highlightStudents}
        attentionStudents={attentionStudents}
        scoreType={ScoreType.PERCENTAGE}
      />
    );

    expect(screen.getByText('92,4%')).toBeInTheDocument();
    expect(screen.getByText('39,3%')).toBeInTheDocument();
  });

  it('formats tri scores as rounded integers', () => {
    render(
      <SimulatedStudentRanking
        highlightStudents={highlightStudents}
        attentionStudents={attentionStudents}
        scoreType={ScoreType.TRI}
      />
    );

    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('43')).toBeInTheDocument();
  });

  it('shows empty message when card has no students', () => {
    render(
      <SimulatedRankingCard
        title="Sem estudantes"
        variant="highlight"
        students={[]}
        icon={<span>icon</span>}
      />
    );

    expect(screen.getByText('Nenhum estudante encontrado')).toBeInTheDocument();
  });
});

describe('formatScore', () => {
  it('returns rounded value for tri', () => {
    expect(formatScore(711.6, ScoreType.TRI)).toBe('712');
  });

  it('returns localized percentage for percentage type', () => {
    expect(formatScore(71.56, ScoreType.PERCENTAGE)).toBe('71,6%');
  });
});
