import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { EnemClassroomStudentResult } from '../../types/enemClassroom';
import {
  ABOVE_AVERAGE_MESSAGE,
  BELOW_AVERAGE_MESSAGE,
  EnemClassroomResultHits,
  EnemClassroomResultSubjects,
  EnemClassroomResultSummary,
} from './index';

const result: EnemClassroomStudentResult = {
  activityId: 'act-1',
  examId: 'exam-1',
  title: 'Simulado Momento Enem',
  language: 'ESPANHOL',
  answeredAt: '2026-09-21T16:00:00.000Z',
  elapsedSeconds: 12600,
  finalScore: 8,
  cohortAverageScore: 6.4,
  aboveAverage: true,
  answered: 90,
  correct: 45,
  incorrect: 40,
  blank: 5,
  correctPercentage: 50,
  bestSubject: {
    subjectId: 'bio',
    subjectName: 'Biologia',
    correctPercentage: 80,
  },
  worstSubject: {
    subjectId: 'fis',
    subjectName: 'Física',
    correctPercentage: 20,
  },
  areas: [
    {
      areaKnowledgeId: 'area-ling',
      areaKnowledgeName: 'Linguagens, Códigos e suas Tecnologias',
      answered: 45,
      correct: 30,
      incorrect: 12,
      correctPercentage: 66.7,
    },
    {
      areaKnowledgeId: 'area-nat',
      areaKnowledgeName: 'Ciências da Natureza e suas Tecnologias',
      answered: 45,
      correct: 15,
      incorrect: 28,
      correctPercentage: null,
    },
  ],
  subjects: [
    {
      subjectId: 'bio',
      subjectName: 'Biologia',
      areaKnowledgeId: 'area-nat',
      areaKnowledgeName: 'Ciências da Natureza e suas Tecnologias',
      answered: 10,
      correct: 8,
      incorrect: 2,
      correctPercentage: 80,
    },
    {
      subjectId: 'outside-trail',
      subjectName: 'Sociologia',
      areaKnowledgeId: 'area-hum',
      areaKnowledgeName: 'Ciências Humanas e suas Tecnologias',
      answered: 5,
      correct: 1,
      incorrect: 4,
      correctPercentage: 20,
    },
  ],
  difficulties: [
    { level: 'FACIL', answered: 30, correct: 28 },
    { level: 'MEDIO', answered: 30, correct: 12 },
    { level: 'DIFICIL', answered: 0, correct: 0 },
  ],
};

const subjectStyles = [{ id: 'bio', icon: 'Microscope', color: '#00FF00' }];

describe('EnemClassroomResultSummary', () => {
  const renderSummary = (overrides: Partial<EnemClassroomStudentResult> = {}) =>
    render(
      <EnemClassroomResultSummary
        result={{ ...result, ...overrides }}
        subjectStyles={subjectStyles}
      />
    );

  it('shows the score with one decimal, the pt-BR way, out of 10', () => {
    renderSummary();

    expect(screen.getByText('8,0')).toBeInTheDocument();
    expect(screen.getByText('de 10')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Nota final: 8,0 de 10/ })
    ).toBeInTheDocument();
  });

  it('draws no ring before there is a score', () => {
    renderSummary({ finalScore: null });

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Biologia')).toBeInTheDocument();
  });

  it('says above or below the average as the API decided', () => {
    const { unmount } = renderSummary();
    expect(screen.getByText(ABOVE_AVERAGE_MESSAGE)).toBeInTheDocument();
    unmount();

    renderSummary({ aboveAverage: false });
    expect(screen.getByText(BELOW_AVERAGE_MESSAGE)).toBeInTheDocument();
  });

  it('says nothing about the average before there is one', () => {
    renderSummary({ aboveAverage: null });

    expect(screen.queryByText(ABOVE_AVERAGE_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(BELOW_AVERAGE_MESSAGE)).not.toBeInTheDocument();
  });

  it('names the best and the weakest component, in a region of its own', () => {
    renderSummary();
    const summary = screen.getByRole('region', { name: 'Resumo geral' });

    expect(within(summary).getByText('Melhor desempenho')).toBeInTheDocument();
    expect(within(summary).getByText('Biologia')).toBeInTheDocument();
    expect(within(summary).getByText('Área para melhorar')).toBeInTheDocument();
    expect(within(summary).getByText('Física')).toBeInTheDocument();
  });

  it('marks a missing highlight instead of inventing one', () => {
    renderSummary({ bestSubject: null, worstSubject: null });

    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('colours the chip of a component with its colour, a neutral one otherwise', () => {
    renderSummary();

    const chipOf = (name: string) =>
      screen.getByText(name).previousElementSibling as HTMLElement;
    expect(chipOf('Biologia')).toHaveStyle({ backgroundColor: '#00FF004d' });
    expect(chipOf('Física')).toHaveStyle({ backgroundColor: '#B7DFFF4d' });
  });

  it('draws each area with its hits and misses, and 0% without a rate', () => {
    renderSummary();

    expect(
      screen.getByText('Linguagens, Códigos e suas Tecnologias')
    ).toBeInTheDocument();
    expect(screen.getByText('30 acertos / 12 erros')).toBeInTheDocument();
    expect(screen.getByText('15 acertos / 28 erros')).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        'Ciências da Natureza e suas Tecnologias: 0% de acertos'
      )
    ).toBeInTheDocument();
  });

  it('leaves the areas out when there are none', () => {
    renderSummary({ areas: [] });

    expect(
      screen.queryByText('Desempenho por área do conhecimento')
    ).not.toBeInTheDocument();
  });
});

describe('EnemClassroomResultHits', () => {
  it('shows the hits of the student block, with the time', () => {
    render(<EnemClassroomResultHits result={result} />);
    const hits = screen.getByRole('region', { name: 'Desempenho por acertos' });

    expect(within(hits).getByText('45 de 90')).toBeInTheDocument();
    expect(within(hits).getByText('3h30')).toBeInTheDocument();
    expect(
      within(hits).getByLabelText(
        '45 de 90 questões corretas. Tempo de prova: 3 horas e 30 minutos.'
      )
    ).toBeInTheDocument();
  });

  it('draws one bar per difficulty, in the API order', () => {
    render(<EnemClassroomResultHits result={result} />);

    expect(screen.getByText('Fáceis')).toBeInTheDocument();
    expect(screen.getByText('Médias')).toBeInTheDocument();
    expect(screen.getByText('Difíceis')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Questões fáceis: 28 de 30 corretas.')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Questões difíceis: nenhuma questão.')
    ).toBeInTheDocument();
  });

  it('shows no clock without a submission time', () => {
    render(
      <EnemClassroomResultHits result={{ ...result, elapsedSeconds: null }} />
    );

    expect(screen.queryByText('3h30')).not.toBeInTheDocument();
    expect(
      screen.getByLabelText('45 de 90 questões corretas.')
    ).toBeInTheDocument();
  });
});

describe('EnemClassroomResultSubjects', () => {
  it('lists each component with its hits and misses, opening nothing', () => {
    render(
      <EnemClassroomResultSubjects
        subjects={result.subjects}
        subjectStyles={subjectStyles}
      />
    );
    const list = screen.getByRole('region', { name: 'Componente curricular' });

    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText('8 Corretas')).toBeInTheDocument();
    expect(within(list).getByText('2 Incorretas')).toBeInTheDocument();
    expect(within(list).queryByRole('button')).not.toBeInTheDocument();
  });

  it('paints a component with its colour, and a neutral one otherwise', () => {
    render(
      <EnemClassroomResultSubjects
        subjects={result.subjects}
        subjectStyles={subjectStyles}
      />
    );
    const tiles = screen
      .getByRole('region', { name: 'Componente curricular' })
      .querySelectorAll('li [style]');

    expect(tiles[0]).toHaveStyle({ backgroundColor: '#00FF004d' });
    expect(tiles[1]).toHaveStyle({ backgroundColor: '#B7DFFF4d' });
  });

  it('draws nothing without components', () => {
    const { container } = render(
      <EnemClassroomResultSubjects subjects={[]} subjectStyles={[]} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
