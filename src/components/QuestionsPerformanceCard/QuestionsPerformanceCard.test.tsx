import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { QuestionsPerformanceCard } from './QuestionsPerformanceCard';

const data = {
  totalAnswered: 20,
  correctAnswers: 15,
  incorrectAnswers: 5,
  blankAnswers: 0,
};

const bar = (key: string) => screen.getByTestId(`questions-bar-${key}`);

describe('QuestionsPerformanceCard', () => {
  // The card reads left to right: bars first, then the legend cards with the
  // long labels and each metric's share of the total.
  it('renders the legend after the bars, with the long labels', () => {
    render(<QuestionsPerformanceCard data={data} />);

    const legend = screen.getByTestId('questions-legend');
    for (const label of [
      'Total de questões respondidas',
      'Questões corretas',
      'Questões incorretas',
      'Questões em branco',
    ]) {
      expect(within(legend).getByText(label)).toBeInTheDocument();
    }
    expect(
      legend.compareDocumentPosition(bar('total')) &
        Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy();
  });

  it('labels the first bar "Total"', () => {
    render(<QuestionsPerformanceCard data={data} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.queryByText('Respondidas')).not.toBeInTheDocument();
    expect(bar('total')).toHaveAttribute('aria-label', 'Total: 20');
  });

  it('paints the blank bar with the design grey', () => {
    render(<QuestionsPerformanceCard data={data} />);

    expect(bar('emBranco').className).toContain('bg-background-200');
    expect(bar('total').className).toContain('bg-info-600');
  });

  it('draws one bar per metric, scaled to the Y axis', () => {
    render(<QuestionsPerformanceCard data={data} />);

    // 20 answered rounds the axis up to 20, so the total bar fills the 235px
    // plot area and the others take their share of it.
    expect(bar('total').style.height).toBe('235px');
    expect(bar('corretas').style.height).toBe('176.25px');
    expect(bar('incorretas').style.height).toBe('58.75px');
  });

  // The whole reason this chart exists instead of the lib's: the published
  // QuestionsData shows the number nowhere, on hover or otherwise.
  it('reveals the value on hover and hides it again', () => {
    render(<QuestionsPerformanceCard data={data} />);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(bar('corretas').parentElement as HTMLElement);

    expect(screen.getByRole('tooltip')).toHaveTextContent('15');

    fireEvent.mouseLeave(bar('corretas').parentElement as HTMLElement);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows the value of whichever bar is hovered', () => {
    render(<QuestionsPerformanceCard data={data} />);

    fireEvent.mouseEnter(bar('incorretas').parentElement as HTMLElement);

    expect(screen.getByRole('tooltip')).toHaveTextContent('5');
  });

  // Same dimming rule as the "Simulados realizados por período" chart.
  it('dims the bars that are not hovered', () => {
    render(<QuestionsPerformanceCard data={data} />);

    expect(bar('total').style.opacity).toBe('1');

    fireEvent.mouseEnter(bar('corretas').parentElement as HTMLElement);

    expect(bar('corretas').style.opacity).toBe('1');
    expect(bar('total').style.opacity).toBe('0.5');
  });

  // A zero bar has no height, so a tooltip would float at the chart floor
  // pointing at nothing.
  it('does not offer a tooltip for a metric with no questions', () => {
    render(<QuestionsPerformanceCard data={data} />);

    fireEvent.mouseEnter(bar('emBranco').parentElement as HTMLElement);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('keeps an empty chart from dividing by zero', () => {
    render(
      <QuestionsPerformanceCard
        data={{
          totalAnswered: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          blankAnswers: 0,
        }}
      />
    );

    expect(bar('total').style.height).toBe('0px');
  });
});

/**
 * One subtema row of the subtopics-performance payload.
 *
 * The endpoint counts the blanks instead of leaving them to be derived, and
 * the hit rate is over the total — blanks included — so the card never
 * recomputes either.
 */
const subtopic = (
  id: string,
  name: string,
  correct: number,
  incorrect: number,
  blank = 1,
  topic = { id: 't-1', name: 'Mecânica' }
) => ({
  subtopicId: id,
  subtopicName: name,
  topic,
  total: correct + incorrect + blank,
  correct,
  incorrect,
  blank,
  correctPercentage:
    Math.round((correct / (correct + incorrect + blank)) * 1000) / 10,
});

const subtopics = [
  subtopic('c-1', 'Cinemática', 8, 1),
  subtopic('c-2', 'Dinâmica', 6, 3),
  subtopic('c-3', 'Óptica', 4, 5),
  subtopic('c-4', 'Ondas', 2, 7),
  subtopic('c-5', 'Termologia', 1, 8, 1, { id: 't-2', name: 'Termodinâmica' }),
];

describe('QuestionsPerformanceCard — subtemas', () => {
  it('hides the subtema table while no componente curricular is selected', () => {
    render(<QuestionsPerformanceCard data={data} />);

    expect(
      screen.queryByText('Desempenho por subtema')
    ).not.toBeInTheDocument();
  });

  it('lists the subtemas of the selected subject with their counts', () => {
    render(<QuestionsPerformanceCard data={data} subtopics={subtopics} />);

    expect(screen.getByText('Desempenho por subtema')).toBeInTheDocument();
    expect(screen.getByText('5 subtemas totais')).toBeInTheDocument();
    // Sorted by hit rate ascending, so the weakest subtema leads and the
    // strongest is the one the four-row collapse leaves out.
    expect(screen.getByText('Termologia')).toBeInTheDocument();
    expect(screen.getByText('Ondas')).toBeInTheDocument();
    expect(screen.queryByText('Cinemática')).not.toBeInTheDocument();
  });

  it('collapses to four rows behind "Mostrar todos"', () => {
    render(<QuestionsPerformanceCard data={data} subtopics={subtopics} />);

    const toggle = screen.getByRole('button', {
      name: /Mostrar todos os 5 subtemas/,
    });
    // The fifth row, the best rate of the five, is behind the toggle.
    expect(screen.queryByText('Cinemática')).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.getByText('Cinemática')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Mostrar menos/ }));
    expect(screen.queryByText('Cinemática')).not.toBeInTheDocument();
  });

  it('offers no toggle when the subject has four subtemas or fewer', () => {
    render(
      <QuestionsPerformanceCard data={data} subtopics={subtopics.slice(0, 3)} />
    );

    expect(screen.queryByText(/Mostrar todos/)).not.toBeInTheDocument();
    expect(screen.getByText('3 subtemas totais')).toBeInTheDocument();
  });

  it('filters the subtemas by the search term', async () => {
    render(<QuestionsPerformanceCard data={data} subtopics={subtopics} />);

    fireEvent.change(screen.getByPlaceholderText('Buscar subtema'), {
      target: { value: 'Óptica' },
    });

    // The search box debounces before the term reaches the rows.
    await waitFor(() =>
      expect(screen.queryByText('Termologia')).not.toBeInTheDocument()
    );
    expect(screen.getByText('Óptica')).toBeInTheDocument();
  });

  it('matches a subtema regardless of case', async () => {
    render(<QuestionsPerformanceCard data={data} subtopics={subtopics} />);

    fireEvent.change(screen.getByPlaceholderText('Buscar subtema'), {
      target: { value: 'ONDAS' },
    });

    await waitFor(() =>
      expect(screen.queryByText('Termologia')).not.toBeInTheDocument()
    );
    expect(screen.getByText('Ondas')).toBeInTheDocument();
  });

  it('shows a skeleton while the subtemas are loading', () => {
    render(
      <QuestionsPerformanceCard data={data} subtopics={[]} subtopicsLoading />
    );

    expect(
      screen.queryByText('Desempenho por subtema')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('questions-bar-total')).toBeInTheDocument();
  });

  it('shows the subtema error instead of the table', () => {
    render(
      <QuestionsPerformanceCard
        data={data}
        subtopics={[]}
        subtopicsError="Erro ao carregar os subtemas"
      />
    );

    expect(
      screen.getByText('Erro ao carregar os subtemas')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Desempenho por subtema')
    ).not.toBeInTheDocument();
  });

  it('offers a tema select listing each tema of the subject', () => {
    render(<QuestionsPerformanceCard data={data} subtopics={subtopics} />);

    expect(screen.getByText('Todos os temas')).toBeInTheDocument();
  });

  it('offers no tema select when the subject has no subtema with data', () => {
    render(<QuestionsPerformanceCard data={data} subtopics={[]} />);

    expect(screen.queryByText('Todos os temas')).not.toBeInTheDocument();
  });

  // The bars have no tema cut of their own, so picking one has to re-add the
  // rows it leaves — and the counts only add up because the endpoint sends the
  // blanks instead of leaving them to be derived.
  it('recomputes the bars from the subtemas of the selected tema', () => {
    render(<QuestionsPerformanceCard data={data} subtopics={subtopics} />);

    fireEvent.click(screen.getByText('Todos os temas'));
    fireEvent.click(screen.getByText('Termodinâmica'));

    // Termologia alone: 1 correct, 8 incorrect, 1 blank.
    expect(bar('total')).toHaveAttribute('aria-label', 'Total: 10');
    expect(screen.getByText('Termologia')).toBeInTheDocument();
    expect(screen.queryByText('Ondas')).not.toBeInTheDocument();
  });

  // The mock renames the card once a componente curricular narrows it: the
  // numbers stop being the report's totals and become that subject's.
  it('names the card "Dados gerais de questões" while no subject is selected', () => {
    render(<QuestionsPerformanceCard data={data} />);

    expect(screen.getByText('Dados gerais de questões')).toBeInTheDocument();
  });

  it('drops the "gerais" once a subject is selected', () => {
    render(<QuestionsPerformanceCard data={data} subtopics={subtopics} />);

    expect(screen.getByText('Dados de questões')).toBeInTheDocument();
    expect(
      screen.queryByText('Dados gerais de questões')
    ).not.toBeInTheDocument();
  });

  it('accepts a custom card title', () => {
    render(
      <QuestionsPerformanceCard data={data} title="Questões do simulado" />
    );

    expect(screen.getByText('Questões do simulado')).toBeInTheDocument();
  });
});
