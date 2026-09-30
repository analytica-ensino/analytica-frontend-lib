import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ExamCardsRow,
  LanguageCard,
  ParticipationCard,
  ScoreBandChart,
  TimeCard,
  schools,
  showsLanguageCard,
  students,
} from './ExamCards';
import type { EnemMomentExamData } from './types';

const bands = (counts: number[]) =>
  counts.map((count, index) => ({
    label: `${index * 2} a ${index * 2 + 2}`,
    count,
  }));

const examData: EnemMomentExamData = {
  studentScoreBands: bands([10, 40, 80, 50, 20]),
  schoolScoreBands: bands([1, 3, 5, 2, 1]),
  language: { ingles: 9056, espanhol: 9410, withoutChoice: 0 },
  time: {
    averageTotalSeconds: 4800,
    averageSecondsPerQuestion: 89,
    durationSeconds: 12600,
  },
  studentPerformanceBands: [],
  studentsWithoutScore: 0,
};

const noTimes: EnemMomentExamData['time'] = {
  averageTotalSeconds: null,
  averageSecondsPerQuestion: null,
  durationSeconds: null,
};

const participation = { participated: 9056, notParticipated: 9410 };

/** The card a heading of level 3 opens. */
const cardOf = (title: string) =>
  screen
    .getByRole('heading', { level: 3, name: title })
    .closest('.rounded-xl')!;

/** The row grid the cards sit in. */
const rowOf = (title: string) =>
  screen.getByRole('heading', { level: 3, name: title }).closest('.grid')!;

describe('students / schools', () => {
  it('count in pt-BR, singular and plural', () => {
    expect(students(1)).toBe('1 estudante');
    expect(students(18466)).toBe('18.466 estudantes');
    expect(schools(1)).toBe('1 escola');
    expect(schools(12)).toBe('12 escolas');
  });
});

describe('showsLanguageCard', () => {
  const picked = { ingles: 30, espanhol: 70, withoutChoice: 0 };
  const none = { ingles: 0, espanhol: 0, withoutChoice: 100 };

  it('follows the exams of the cut once they are known', () => {
    expect(showsLanguageCard(true, none)).toBe(true);
    expect(showsLanguageCard(false, picked)).toBe(false);
  });

  it('while the exams are not known, shows it if somebody picked a language', () => {
    expect(showsLanguageCard(null, picked)).toBe(true);
    expect(showsLanguageCard(null, { ...none, espanhol: 1 })).toBe(true);
    expect(showsLanguageCard(null, none)).toBe(false);
  });
});

describe('ScoreBandChart', () => {
  it('draws one bar per band, in the color handed, with the total under the title', () => {
    render(
      <ScoreBandChart
        title="Estudantes por faixa de nota"
        bands={examData.studentScoreBands}
        formatTotal={students}
        barColor="bg-info-500"
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Estudantes por faixa de nota' })
    ).toBeInTheDocument();
    expect(screen.getByText('200 estudantes')).toBeInTheDocument();
    expect(
      screen
        .getAllByTestId(/^bar-/)
        .map((bar) => bar.getAttribute('aria-label'))
    ).toEqual([
      '0 a 2: 10',
      '2 a 4: 40',
      '4 a 6: 80',
      '6 a 8: 50',
      '8 a 10: 20',
    ]);
    expect(screen.getByTestId('bar-4 a 6')).toHaveClass('bg-info-500');
  });

  it('totals with the formatter it is handed', () => {
    render(
      <ScoreBandChart
        title="Escolas por faixa de média"
        bands={examData.schoolScoreBands}
        formatTotal={schools}
        barColor="bg-info-700"
      />
    );

    expect(screen.getByText('12 escolas')).toBeInTheDocument();
    expect(screen.getByTestId('bar-0 a 2')).toHaveClass('bg-info-700');
  });

  it('draws no bar for an empty band, keeping its label', () => {
    render(
      <ScoreBandChart
        title="Estudantes por faixa de nota"
        bands={bands([0, 3])}
        formatTotal={students}
        barColor="bg-info-500"
      />
    );

    expect(screen.getByText('3 estudantes')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-0 a 2')).not.toBeInTheDocument();
    expect(screen.getByTestId('label-0 a 2')).toBeInTheDocument();
  });
});

describe('LanguageCard', () => {
  it('splits the foreign language with shares, in the colors of the pie', () => {
    const { container } = render(<LanguageCard language={examData.language} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Idioma' })
    ).toBeInTheDocument();
    expect(screen.getByText('Escolheram Inglês')).toBeInTheDocument();
    expect(screen.getByText('9.056 estudantes (49%)')).toBeInTheDocument();
    expect(screen.getByText('Escolheram Espanhol')).toBeInTheDocument();
    expect(screen.getByText('9.410 estudantes (51%)')).toBeInTheDocument();
    expect(screen.getByText('18.466 estudantes')).toBeInTheDocument();

    expect(
      container.querySelector('path[fill="var(--color-info-300)"]')
    ).not.toBeNull();
    expect(
      container.querySelector('path[fill="var(--color-indicator-positive)"]')
    ).not.toBeNull();
  });

  it('says so when nobody took the exam', () => {
    render(
      <LanguageCard language={{ ingles: 0, espanhol: 0, withoutChoice: 0 }} />
    );

    expect(screen.getByText('Ninguém fez a prova')).toBeInTheDocument();
  });
});

describe('ParticipationCard', () => {
  it('splits the students by participation, with shares and the total', () => {
    const { container } = render(
      <ParticipationCard participation={participation} />
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Participação' })
    ).toBeInTheDocument();
    expect(screen.getByText('Participou')).toBeInTheDocument();
    expect(screen.getByText('Não participou')).toBeInTheDocument();
    expect(screen.getByText('9.056 estudantes (49%)')).toBeInTheDocument();
    expect(screen.getByText('9.410 estudantes (51%)')).toBeInTheDocument();
    expect(screen.getByText('18.466 estudantes')).toBeInTheDocument();

    expect(
      container.querySelector('path[fill="var(--color-success-200)"]')
    ).not.toBeNull();
    expect(
      container.querySelector('path[fill="var(--color-indicator-primary)"]')
    ).not.toBeNull();
  });

  it('writes its shares in white with a shadow: black would vanish on the dark slice', () => {
    const { container } = render(
      <ParticipationCard participation={participation} />
    );

    const labels = Array.from(container.querySelectorAll('svg text'));
    expect(labels.map((label) => label.textContent)).toEqual(['49%', '51%']);
    for (const label of labels) {
      expect(label).toHaveAttribute('fill', 'var(--color-text)');
    }
  });

  it('says so when the cut has nobody', () => {
    render(
      <ParticipationCard
        participation={{ participated: 0, notParticipated: 0 }}
      />
    );

    expect(
      screen.getByText('Nenhum estudante neste recorte')
    ).toBeInTheDocument();
  });
});

describe('TimeCard', () => {
  it('shows the three times, formatted', () => {
    render(<TimeCard time={examData.time} examDurationSeconds={null} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Tempo' })
    ).toBeInTheDocument();
    expect(screen.getByText('1h 20min')).toBeInTheDocument();
    expect(screen.getByText('Tempo médio de prova')).toBeInTheDocument();
    expect(screen.getByText('1min 29s')).toBeInTheDocument();
    expect(screen.getByText('Tempo médio por questão')).toBeInTheDocument();
    expect(screen.getByText('3h 30min')).toBeInTheDocument();
    expect(screen.getByText('Duração da prova')).toBeInTheDocument();
  });

  it('marks a time the API could not give', () => {
    render(<TimeCard time={noTimes} examDurationSeconds={null} />);

    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('takes the exams’ own duration while nobody took them', () => {
    render(<TimeCard time={noTimes} examDurationSeconds={19800} />);

    expect(screen.getByText('5h 30min')).toBeInTheDocument();
  });

  it('keeps the duration of the exam data when it has one', () => {
    render(<TimeCard time={examData.time} examDurationSeconds={19800} />);

    expect(screen.getByText('3h 30min')).toBeInTheDocument();
    expect(screen.queryByText('5h 30min')).not.toBeInTheDocument();
  });

  it('stacks the times beside other cards', () => {
    render(<TimeCard time={examData.time} examDurationSeconds={null} />);

    const card = cardOf('Tempo');
    expect(card).not.toHaveClass('lg:col-span-2');
    expect(card.querySelector('.grid')).not.toHaveClass('md:grid-cols-3');
  });

  it('takes the whole row, times side by side, when alone on it', () => {
    render(
      <TimeCard time={examData.time} examDurationSeconds={null} fullWidth />
    );

    const card = cardOf('Tempo');
    expect(card).toHaveClass('lg:col-span-2');
    expect(card.querySelector('.grid')).toHaveClass('md:grid-cols-3');
  });
});

describe('ExamCardsRow', () => {
  const renderRow = (
    hasLanguageChoice: boolean | null,
    data: EnemMomentExamData = examData
  ) =>
    render(
      <ExamCardsRow
        participation={participation}
        examData={data}
        hasLanguageChoice={hasLanguageChoice}
        examDurationSeconds={null}
      />
    );

  it('lays Participação, Idioma and Tempo side by side', () => {
    renderRow(true);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Participação' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Idioma' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Tempo' })
    ).toBeInTheDocument();
    expect(rowOf('Participação')).toHaveClass('lg:grid-cols-3');
  });

  it('drops Idioma when the cut has no day 1, the other two sharing the row', () => {
    renderRow(false);

    expect(
      screen.queryByRole('heading', { level: 3, name: 'Idioma' })
    ).not.toBeInTheDocument();
    expect(rowOf('Participação')).toHaveClass('lg:grid-cols-2');
    // Tempo keeps its stacked tiles: it is not alone on the row.
    expect(cardOf('Tempo')).not.toHaveClass('lg:col-span-2');
  });

  it('while the exams are not known, shows Idioma if somebody picked a language', () => {
    const { unmount } = renderRow(null);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Idioma' })
    ).toBeInTheDocument();
    unmount();

    renderRow(null, {
      ...examData,
      language: { ingles: 0, espanhol: 0, withoutChoice: 100 },
    });
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Idioma' })
    ).not.toBeInTheDocument();
  });

  it('hands Tempo the exams’ duration', () => {
    render(
      <ExamCardsRow
        participation={participation}
        examData={{ ...examData, time: noTimes }}
        hasLanguageChoice={false}
        examDurationSeconds={18000}
      />
    );

    expect(screen.getByText('5h')).toBeInTheDocument();
  });
});
