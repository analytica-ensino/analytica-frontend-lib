import { act, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KnowledgePerformanceCard } from './KnowledgePerformanceCard';
import type {
  KnowledgeAreaPerformance,
  KnowledgePerformanceData,
  KnowledgeSubjectRow,
} from './types';

const AREAS = {
  lc: 'Linguagens, Códigos e suas Tecnologias',
  ch: 'Ciências Humanas e suas Tecnologias',
};

const subject = (
  name: string,
  areaId: keyof typeof AREAS,
  answered: number,
  correct: number,
  blank: number
): KnowledgeSubjectRow => ({
  subjectId: `id-${name}`,
  subjectName: name,
  areaKnowledgeId: areaId,
  areaKnowledgeName: AREAS[areaId],
  color: '#000000',
  icon: 'BookOpen',
  answered,
  correct,
  incorrect: answered - correct - blank,
  blank,
  correctPercentage: Math.round((correct / answered) * 1000) / 10,
});

const area = (
  areaId: keyof typeof AREAS,
  answered: number,
  correct: number,
  incorrect: number,
  blank: number,
  averageScore: number | null
): KnowledgeAreaPerformance => ({
  areaKnowledgeId: areaId,
  areaKnowledgeName: AREAS[areaId],
  answered,
  correct,
  incorrect,
  blank,
  correctPercentage: Math.round((correct / answered) * 1000) / 10,
  averageScore,
});

// The totals count a question mapped to two componentes once: they are not
// the sum of the rows.
const data: KnowledgePerformanceData = {
  totals: {
    answered: 380,
    correct: 210,
    incorrect: 152,
    blank: 18,
    correctPercentage: 55.3,
    incorrectPercentage: 40,
    blankPercentage: 4.7,
    averageScore: 5.5,
  },
  // Worst first, as the API sends them. Linguagens counts 290, not the 300 its
  // componentes add up to: a question in two of them counts once here.
  areas: [area('ch', 100, 30, 60, 10, 3), area('lc', 290, 185, 95, 10, 6.4)],
  subjects: [
    subject('Língua Portuguesa', 'lc', 100, 60, 5),
    subject('Literatura', 'lc', 100, 70, 5),
    subject('Inglês', 'lc', 50, 20, 0),
    subject('Espanhol', 'lc', 50, 40, 0),
    subject('História', 'ch', 100, 30, 10),
  ],
};

function renderCard(
  overrides: Partial<{ data: KnowledgePerformanceData; title: string }> = {}
) {
  return render(<KnowledgePerformanceCard data={data} {...overrides} />);
}

/** Total | corretas | incorretas | em branco, as the bars draw them. */
const barValues = () =>
  // The legend cards carry each bar's count (the bars themselves are drawn
  // inside an image described by these cards).
  Array.from(screen.getByTestId('questions-legend').children)
    .map((card) => card.children[1].textContent)
    .join('|');

/** The "Nota média" card: its label (`dt`), then its value (`dd`). */
const scoreCard = () => screen.getByText('Nota média').closest('dl')!;

const bodyRows = () =>
  within(screen.getByRole('table')).getAllByRole('row').slice(1);

const firstColumn = () =>
  bodyRows().map((row) => within(row).getAllByRole('cell')[0].textContent);

const pickArea = (name: string) => {
  fireEvent.click(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name }));
};

const sortBy = (column: string) =>
  fireEvent.click(
    within(
      screen.getByRole('columnheader', { name: new RegExp(column) })
    ).getByRole('button')
  );

function search(value: string) {
  jest.useFakeTimers();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value } });
  act(() => {
    jest.advanceTimersByTime(300);
  });
  jest.useRealTimers();
}

describe('KnowledgePerformanceCard', () => {
  beforeEach(() => {
    // The table keeps its sort in the URL: start each test from a clean one.
    globalThis.history.replaceState({}, '', '/');
  });

  it('opens as "Dados de questões" unless the report names it otherwise', () => {
    const { unmount } = renderCard();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Dados de questões' })
    ).toBeInTheDocument();
    unmount();

    renderCard({ title: 'Dados gerais de questões' });
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Dados gerais de questões',
      })
    ).toBeInTheDocument();
  });

  it('draws the API’s totals on every area, not the sum of the rows', () => {
    renderCard();

    expect(barValues()).toBe('380|210|152|18');
  });

  it('shows the score derived from the hit rate, not the corrected one', () => {
    renderCard();

    expect(scoreCard()).toHaveTextContent('Nota média5,5');
  });

  it('lists the first componentes in the order the API sent', () => {
    renderCard();

    expect(
      screen.getByText('5 componentes curriculares totais')
    ).toBeInTheDocument();
    expect(firstColumn()).toEqual([
      'Língua Portuguesa',
      'Literatura',
      'Inglês',
      'Espanhol',
    ]);
  });

  it('draws each componente with its chip, area, counts and rate', () => {
    renderCard();

    const cells = within(bodyRows()[0]).getAllByRole('cell');
    expect(cells.map((cell) => cell.textContent)).toEqual([
      'Língua Portuguesa',
      'Linguagens, Códigos e suas Tecnologias',
      '100',
      '60',
      '35',
      '5',
      '60,0%',
    ]);
    expect(
      within(cells[0]).getByLabelText('Língua Portuguesa')
    ).toBeInTheDocument();
    // The bar repeats the written rate, so it is hidden from AT
    expect(
      within(cells[6]).getByRole('progressbar', { hidden: true })
    ).toHaveAttribute('value', '60');
  });

  it('shows every componente behind "Mostrar todos", and folds back', () => {
    renderCard();

    fireEvent.click(
      screen.getByRole('button', {
        name: /Mostrar todos os 5 componentes curriculares/,
      })
    );
    expect(firstColumn()).toHaveLength(5);

    fireEvent.click(screen.getByRole('button', { name: /Mostrar menos/ }));
    expect(firstColumn()).toHaveLength(4);
  });

  it('sorts every componente before folding', () => {
    renderCard();

    sortBy('Taxa de acerto');
    sortBy('Taxa de acerto');

    expect(firstColumn()).toEqual([
      'Espanhol',
      'Literatura',
      'Língua Portuguesa',
      'Inglês',
    ]);
  });

  it('sorts the names in pt-BR order', () => {
    renderCard();

    sortBy('Componente curricular');

    expect(firstColumn()).toEqual([
      'Espanhol',
      'História',
      'Inglês',
      'Língua Portuguesa',
    ]);
  });

  it('goes back to the API’s order when the sort is dropped', () => {
    renderCard();

    sortBy('Corretas');
    sortBy('Corretas');
    sortBy('Corretas');

    expect(firstColumn()).toEqual([
      'Língua Portuguesa',
      'Literatura',
      'Inglês',
      'Espanhol',
    ]);
  });

  it('searches by componente or by area', () => {
    renderCard();

    search('hist');
    expect(firstColumn()).toEqual(['História']);

    search('humanas');
    expect(firstColumn()).toEqual(['História']);
  });

  it('narrows the bars, the score and the table to the area picked, with the area’s own counts', () => {
    renderCard();

    pickArea('Linguagens, Códigos e suas Tecnologias');

    // The area's row, not the 300 its componentes add up to.
    expect(barValues()).toBe('290|185|95|10');
    expect(scoreCard()).toHaveTextContent('Nota média6,4');
    expect(
      screen.getByText('4 componentes curriculares totais')
    ).toBeInTheDocument();
    expect(firstColumn()).not.toContain('História');
  });

  it('marks the score of an area nobody answered', () => {
    renderCard({
      data: {
        ...data,
        areas: [{ ...data.areas[0], averageScore: null }, data.areas[1]],
      },
    });

    pickArea('Ciências Humanas e suas Tecnologias');

    expect(scoreCard()).toHaveTextContent('Nota média—');
    expect(
      screen.getByText('1 componente curricular total')
    ).toBeInTheDocument();
  });

  it('lists the areas the API sends, in pt-BR order', () => {
    renderCard();

    fireEvent.click(screen.getByRole('combobox'));

    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual([
      'Todas as áreas do conhecimento',
      'Ciências Humanas e suas Tecnologias',
      'Linguagens, Códigos e suas Tecnologias',
    ]);
  });

  it('marks the rate of a componente nobody answered, and sorts it below any rate', () => {
    renderCard({
      data: {
        ...data,
        subjects: [
          subject('História', 'ch', 100, 30, 10),
          { ...subject('Artes', 'lc', 1, 0, 0), correctPercentage: null },
          { ...subject('Filosofia', 'ch', 1, 0, 0), correctPercentage: null },
        ],
      },
    });

    expect(within(bodyRows()[1]).getAllByRole('cell')[6].textContent).toBe('—');

    sortBy('Taxa de acerto');
    expect(firstColumn()).toEqual(['Artes', 'Filosofia', 'História']);

    sortBy('Taxa de acerto');
    expect(firstColumn()).toEqual(['História', 'Artes', 'Filosofia']);
  });

  it('goes back to every area', () => {
    renderCard();

    pickArea('Ciências Humanas e suas Tecnologias');
    pickArea('Todas as áreas do conhecimento');

    expect(barValues()).toBe('380|210|152|18');
    expect(scoreCard()).toHaveTextContent('Nota média5,5');
  });

  it('falls back to every area when the one picked leaves the cut', () => {
    const { rerender } = renderCard();
    pickArea('Ciências Humanas e suas Tecnologias');
    expect(barValues()).toBe('100|30|60|10');

    rerender(
      <KnowledgePerformanceCard data={{ ...data, areas: [data.areas[1]] }} />
    );

    expect(barValues()).toBe('380|210|152|18');
  });

  it('marks the overall score while nobody answered', () => {
    renderCard({
      data: { ...data, totals: { ...data.totals, averageScore: null } },
    });

    expect(scoreCard()).toHaveTextContent('Nota média—');
  });

  it('renders an empty cut without an área to pick', () => {
    renderCard({
      data: {
        totals: {
          answered: 0,
          correct: 0,
          incorrect: 0,
          blank: 0,
          correctPercentage: null,
          incorrectPercentage: null,
          blankPercentage: null,
          averageScore: null,
        },
        areas: [],
        subjects: [],
      },
    });

    expect(barValues()).toBe('0|0|0|0');
    expect(scoreCard()).toHaveTextContent('Nota média—');
    expect(
      screen.getByText('0 componentes curriculares totais')
    ).toBeInTheDocument();
  });
});
