import { act, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KnowledgeAreaSection } from './KnowledgeAreaSection';
import type {
  EnemMomentAreaPerformance,
  EnemMomentQuestionsView,
  EnemMomentSubjectRow,
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
): EnemMomentSubjectRow => ({
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
): EnemMomentAreaPerformance => ({
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
const data: EnemMomentQuestionsView = {
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

function renderSection(
  overrides: Partial<{
    data: EnemMomentQuestionsView | null;
    loading: boolean;
    error: string | null;
  }> = {}
) {
  return render(
    <KnowledgeAreaSection
      questions={{ data, loading: false, error: null, ...overrides }}
    />
  );
}

/** Total | corretas | incorretas | em branco, as the bars draw them. */
const barValues = () =>
  ['total', 'corretas', 'incorretas', 'emBranco']
    .map((key) =>
      screen
        .getByTestId(`questions-bar-${key}`)
        .getAttribute('aria-label')!
        .replace(/^.*: /, '')
    )
    .join('|');

/** The "Nota média" card: its value, then its label. */
const scoreCard = () => screen.getByText('Nota média').parentElement!;

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

describe('KnowledgeAreaSection', () => {
  beforeEach(() => {
    // The table keeps its sort in the URL: start each test from a clean one.
    globalThis.history.replaceState({}, '', '/');
  });

  it('opens with its heading and the "Dados de questões" card', () => {
    renderSection();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Desempenho por área de conhecimento',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Dados de questões' })
    ).toBeInTheDocument();
  });

  it('draws the API’s totals on every area, not the sum of the rows', () => {
    renderSection();

    expect(barValues()).toBe('380|210|152|18');
  });

  it('shows the score derived from the hit rate, not the corrected one', () => {
    renderSection();

    expect(scoreCard()).toHaveTextContent('5,5Nota média');
  });

  it('lists the first componentes in the order the API sent', () => {
    renderSection();

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
    renderSection();

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
    expect(within(cells[6]).getByRole('progressbar')).toHaveAttribute(
      'value',
      '60'
    );
  });

  it('shows every componente behind "Mostrar todos", and folds back', () => {
    renderSection();

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
    renderSection();

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
    renderSection();

    sortBy('Componente curricular');

    expect(firstColumn()).toEqual([
      'Espanhol',
      'História',
      'Inglês',
      'Língua Portuguesa',
    ]);
  });

  it('goes back to the API’s order when the sort is dropped', () => {
    renderSection();

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
    renderSection();

    search('hist');
    expect(firstColumn()).toEqual(['História']);

    search('humanas');
    expect(firstColumn()).toEqual(['História']);
  });

  it('narrows the bars, the score and the table to the area picked, with the area’s own counts', () => {
    renderSection();

    pickArea('Linguagens, Códigos e suas Tecnologias');

    // The area's row, not the 300 its componentes add up to.
    expect(barValues()).toBe('290|185|95|10');
    expect(scoreCard()).toHaveTextContent('6,4Nota média');
    expect(
      screen.getByText('4 componentes curriculares totais')
    ).toBeInTheDocument();
    expect(firstColumn()).not.toContain('História');
  });

  it('marks the score of an area nobody answered', () => {
    renderSection({
      data: {
        ...data,
        areas: [{ ...data.areas[0], averageScore: null }, data.areas[1]],
      },
    });

    pickArea('Ciências Humanas e suas Tecnologias');

    expect(scoreCard()).toHaveTextContent('—Nota média');
    expect(
      screen.getByText('1 componente curricular total')
    ).toBeInTheDocument();
  });

  it('lists the areas the API sends, in pt-BR order', () => {
    renderSection();

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
    renderSection({
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
    renderSection();

    pickArea('Ciências Humanas e suas Tecnologias');
    pickArea('Todas as áreas do conhecimento');

    expect(barValues()).toBe('380|210|152|18');
    expect(scoreCard()).toHaveTextContent('5,5Nota média');
  });

  it('falls back to every area when the one picked leaves the cut', () => {
    const { rerender } = renderSection();
    pickArea('Ciências Humanas e suas Tecnologias');
    expect(barValues()).toBe('100|30|60|10');

    rerender(
      <KnowledgeAreaSection
        questions={{
          data: { ...data, areas: [data.areas[1]] },
          loading: false,
          error: null,
        }}
      />
    );

    expect(barValues()).toBe('380|210|152|18');
  });

  it('marks the overall score while nobody answered', () => {
    renderSection({
      data: { ...data, totals: { ...data.totals, averageScore: null } },
    });

    expect(scoreCard()).toHaveTextContent('—Nota média');
  });

  it('shows a skeleton while it loads', () => {
    const { container } = renderSection({ data: null, loading: true });

    expect(container.querySelector('.min-h-\\[560px\\]')).toBeInTheDocument();
    expect(screen.queryByText('Dados de questões')).not.toBeInTheDocument();
  });

  it('shows the error when it fails', () => {
    renderSection({ data: null, error: 'Erro ao carregar.' });

    expect(screen.getByText('Erro ao carregar.')).toBeInTheDocument();
  });
});
