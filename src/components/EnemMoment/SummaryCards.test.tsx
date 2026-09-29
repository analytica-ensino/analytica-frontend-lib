import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  EnemMomentSummaryCards,
  buildEnemMomentUnitSummaryCards,
} from './SummaryCards';
import type { EnemMomentSummary } from './types';
import type { TimeCardData } from '../TimeReport/TimeReport';

const school: EnemMomentSummary = {
  exams: [],
  examsCount: 2,
  examsWithParticipation: 2,
  totalSchools: 1,
  municipalitiesCount: 1,
  totalClasses: 134,
  totalStudents: 420,
  schoolsWithParticipation: 1,
  schoolsWithoutParticipation: 0,
  schoolParticipationPercentage: 100,
  participatingStudents: 300,
  studentsWithoutParticipation: 120,
  studentParticipationPercentage: 71.4,
  totalParticipations: 500,
  averageScore: 6.2,
  firstAnsweredAt: null,
  lastAnsweredAt: null,
};

const flattenUnit = (data: EnemMomentSummary) =>
  buildEnemMomentUnitSummaryCards(data).map(
    (card) => `${card.label}|${card.value}|${String(card.footer)}`
  );

describe('buildEnemMomentUnitSummaryCards', () => {
  it('builds the four cards of the unit, all counting students', () => {
    expect(flattenUnit(school)).toEqual([
      'TOTAL DE ESTUDANTES|420|1 escola • 134 turmas',
      'REALIZARAM O SIMULADO|300|de 420 estudantes',
      '% DE REALIZAÇÃO|71,4%|120 ainda não realizaram',
      'ESTUDANTES SEM REALIZAR O SIMULADO|120|não realizaram',
    ]);
  });

  it('gives each card its id and an icon', () => {
    const cards = buildEnemMomentUnitSummaryCards(school);

    expect(cards.map((card) => card.id)).toEqual([
      'totalStudents',
      'participatingStudents',
      'studentParticipationPercentage',
      'studentsWithoutParticipation',
    ]);
    expect(cards.every((card) => card.icon)).toBe(true);
  });

  it('writes the singular and the plural forms', () => {
    expect(
      flattenUnit({ ...school, totalClasses: 1, totalStudents: 1 }).slice(0, 2)
    ).toEqual([
      'TOTAL DE ESTUDANTES|1|1 escola • 1 turma',
      'REALIZARAM O SIMULADO|300|de 1 estudante',
    ]);
    expect(flattenUnit({ ...school, totalSchools: 2 })[0]).toBe(
      'TOTAL DE ESTUDANTES|420|2 escolas • 134 turmas'
    );
  });

  it('writes the counts with pt-BR separators', () => {
    expect(
      flattenUnit({
        ...school,
        totalStudents: 16778,
        studentsWithoutParticipation: 12000,
      })
    ).toEqual([
      'TOTAL DE ESTUDANTES|16.778|1 escola • 134 turmas',
      'REALIZARAM O SIMULADO|300|de 16.778 estudantes',
      '% DE REALIZAÇÃO|71,4%|12.000 ainda não realizaram',
      'ESTUDANTES SEM REALIZAR O SIMULADO|12.000|não realizaram',
    ]);
  });

  it('marks a rate there is nothing to divide by', () => {
    expect(
      buildEnemMomentUnitSummaryCards({
        ...school,
        studentParticipationPercentage: null,
      })[2].value
    ).toBe('—');
  });
});

describe('EnemMomentSummaryCards', () => {
  it('draws the cards it builds from the summary, with no tab strip', () => {
    render(
      <EnemMomentSummaryCards
        summary={{ data: school, loading: false, error: null }}
        buildCards={buildEnemMomentUnitSummaryCards}
      />
    );

    const total = screen.getByTestId('time-card-totalStudents');
    expect(within(total).getByText('TOTAL DE ESTUDANTES')).toBeInTheDocument();
    expect(within(total).getByText('420')).toBeInTheDocument();
    expect(
      within(total).getByText('1 escola • 134 turmas')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByTestId('time-card-studentParticipationPercentage')
      ).getByText('71,4%')
    ).toBeInTheDocument();
    expect(screen.getAllByTestId(/^time-card-/)).toHaveLength(4);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('takes the cards the app builds — the network’s or the unit’s', () => {
    const buildCards = jest.fn(
      (_summary: EnemMomentSummary): TimeCardData[] => [
        {
          id: 'schools',
          label: 'TOTAL DE ESCOLAS',
          value: '16.778',
          icon: <svg />,
        },
      ]
    );
    render(
      <EnemMomentSummaryCards
        summary={{ data: school, loading: false, error: null }}
        buildCards={buildCards}
      />
    );

    expect(buildCards).toHaveBeenCalledWith(school);
    expect(screen.getByText('TOTAL DE ESCOLAS')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^time-card-/)).toHaveLength(1);
  });

  it('draws no card before the first answer', () => {
    const buildCards = jest.fn(buildEnemMomentUnitSummaryCards);
    render(
      <EnemMomentSummaryCards
        summary={{ data: null, loading: false, error: null }}
        buildCards={buildCards}
      />
    );

    expect(buildCards).not.toHaveBeenCalled();
    expect(screen.queryAllByTestId(/^time-card-/)).toHaveLength(0);
  });

  it('shows a skeleton of the row while it loads', () => {
    const { container } = render(
      <EnemMomentSummaryCards
        summary={{ data: null, loading: true, error: null }}
        buildCards={buildEnemMomentUnitSummaryCards}
      />
    );

    expect(container.querySelector('.min-h-\\[140px\\]')).toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows the error when it fails', () => {
    render(
      <EnemMomentSummaryCards
        summary={{ data: null, loading: false, error: 'Erro ao carregar.' }}
        buildCards={buildEnemMomentUnitSummaryCards}
      />
    );

    expect(screen.getByText('Erro ao carregar.')).toBeInTheDocument();
  });
});
