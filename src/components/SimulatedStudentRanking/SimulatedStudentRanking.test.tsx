import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  SimulatedRankingCard,
  SimulatedStudentRanking,
} from './SimulatedStudentRanking';
import { formatScore } from './utils';
import { ScoreType } from '../../types/common';

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
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders each card as an ordered list with the position spelled out', () => {
    render(
      <SimulatedStudentRanking
        highlightStudents={highlightStudents}
        attentionStudents={attentionStudents}
      />
    );

    const lists = screen.getAllByRole('list');
    expect(lists).toHaveLength(2);
    expect(lists[0].tagName).toBe('OL');
    const items = within(lists[0]).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Posição 1:')).toHaveClass('sr-only');
    expect(within(items[0]).getByText('1')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    expect(within(items[0]).getByText('Média:')).toHaveClass('sr-only');
  });

  it('uses the userInstitutionId as the row key when present', () => {
    render(
      <SimulatedRankingCard
        title="Com id"
        variant="attention"
        students={[
          { position: 1, name: 'Bia', average: 50, userInstitutionId: 'ui-1' },
        ]}
        icon={null}
      />
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
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
