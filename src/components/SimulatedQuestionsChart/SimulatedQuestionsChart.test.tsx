import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { SimulatedQuestionsChart } from './SimulatedQuestionsChart';

const data = {
  totalAnswered: 20,
  correctAnswers: 15,
  incorrectAnswers: 5,
  blankAnswers: 0,
};

const bar = (key: string) => screen.getByTestId(`questions-bar-${key}`);

describe('SimulatedQuestionsChart', () => {
  // The card reads left to right: bars first, then the legend cards with the
  // long labels and each metric's share of the total.
  it('renders the legend after the bars, with the long labels', () => {
    render(<SimulatedQuestionsChart data={data} />);

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
    render(<SimulatedQuestionsChart data={data} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.queryByText('Respondidas')).not.toBeInTheDocument();
    expect(bar('total')).toHaveAttribute('aria-label', 'Total: 20');
  });

  it('paints the blank bar with the design grey', () => {
    render(<SimulatedQuestionsChart data={data} />);

    expect(bar('emBranco').className).toContain('bg-background-200');
    expect(bar('total').className).toContain('bg-info-600');
  });

  it('draws one bar per metric, scaled to the Y axis', () => {
    render(<SimulatedQuestionsChart data={data} />);

    // 20 answered rounds the axis up to 20, so the total bar fills the 235px
    // plot area and the others take their share of it.
    expect(bar('total').style.height).toBe('235px');
    expect(bar('corretas').style.height).toBe('176.25px');
    expect(bar('incorretas').style.height).toBe('58.75px');
  });

  // The whole reason this chart exists instead of the lib's: the published
  // QuestionsData shows the number nowhere, on hover or otherwise.
  it('reveals the value on hover and hides it again', () => {
    render(<SimulatedQuestionsChart data={data} />);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(bar('corretas').parentElement as HTMLElement);

    expect(screen.getByRole('tooltip')).toHaveTextContent('15');

    fireEvent.mouseLeave(bar('corretas').parentElement as HTMLElement);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows the value of whichever bar is hovered', () => {
    render(<SimulatedQuestionsChart data={data} />);

    fireEvent.mouseEnter(bar('incorretas').parentElement as HTMLElement);

    expect(screen.getByRole('tooltip')).toHaveTextContent('5');
  });

  // Same dimming rule as the "Simulados realizados por período" chart.
  it('dims the bars that are not hovered', () => {
    render(<SimulatedQuestionsChart data={data} />);

    expect(bar('total').style.opacity).toBe('1');

    fireEvent.mouseEnter(bar('corretas').parentElement as HTMLElement);

    expect(bar('corretas').style.opacity).toBe('1');
    expect(bar('total').style.opacity).toBe('0.5');
  });

  // A zero bar has no height, so a tooltip would float at the chart floor
  // pointing at nothing.
  it('does not offer a tooltip for a metric with no questions', () => {
    render(<SimulatedQuestionsChart data={data} />);

    fireEvent.mouseEnter(bar('emBranco').parentElement as HTMLElement);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('keeps an empty chart from dividing by zero', () => {
    render(
      <SimulatedQuestionsChart
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

/** One subtema row of the contents-performance payload. */
const content = (
  id: string,
  name: string,
  correct: number,
  incorrect: number,
  topic: { id: string; name: string } | null = { id: 't-1', name: 'Mecânica' }
) => ({
  contentId: id,
  contentName: name,
  bnccCode: null,
  subject: { id: 's-1', name: 'Física' },
  topic,
  simulatedExamsCount: 1,
  questionsCount: correct + incorrect + 1,
  studentsCount: 3,
  performance: {
    correct,
    incorrect,
    correctPercentage: Math.round((correct / (correct + incorrect + 1)) * 100),
  },
});

const contents = [
  content('c-1', 'Cinemática', 8, 1),
  content('c-2', 'Dinâmica', 6, 3),
  content('c-3', 'Óptica', 4, 5),
  content('c-4', 'Ondas', 2, 7),
  content('c-5', 'Termologia', 1, 8, { id: 't-2', name: 'Termodinâmica' }),
];

describe('SimulatedQuestionsChart — subtemas', () => {
  it('hides the subtema table while no componente curricular is selected', () => {
    render(<SimulatedQuestionsChart data={data} />);

    expect(
      screen.queryByText('Desempenho por subtema')
    ).not.toBeInTheDocument();
  });

  it('lists the subtemas of the selected subject with their counts', () => {
    render(<SimulatedQuestionsChart data={data} contents={contents} />);

    expect(screen.getByText('Desempenho por subtema')).toBeInTheDocument();
    expect(screen.getByText('5 subtemas totais')).toBeInTheDocument();
    // Sorted by hit rate ascending, so the weakest subtema leads and the
    // strongest is the one the four-row collapse leaves out.
    expect(screen.getByText('Termologia')).toBeInTheDocument();
    expect(screen.getByText('Ondas')).toBeInTheDocument();
    expect(screen.queryByText('Cinemática')).not.toBeInTheDocument();
  });

  it('collapses to four rows behind "Mostrar todos"', () => {
    render(<SimulatedQuestionsChart data={data} contents={contents} />);

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
      <SimulatedQuestionsChart data={data} contents={contents.slice(0, 3)} />
    );

    expect(screen.queryByText(/Mostrar todos/)).not.toBeInTheDocument();
    expect(screen.getByText('3 subtemas totais')).toBeInTheDocument();
  });

  it('filters the subtemas by the search term', async () => {
    render(<SimulatedQuestionsChart data={data} contents={contents} />);

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
    render(<SimulatedQuestionsChart data={data} contents={contents} />);

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
      <SimulatedQuestionsChart data={data} contents={[]} contentsLoading />
    );

    expect(
      screen.queryByText('Desempenho por subtema')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('questions-bar-total')).toBeInTheDocument();
  });

  it('shows the subtema error instead of the table', () => {
    render(
      <SimulatedQuestionsChart
        data={data}
        contents={[]}
        contentsError="Erro ao carregar os subtemas"
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
    render(<SimulatedQuestionsChart data={data} contents={contents} />);

    expect(screen.getByText('Todos os temas')).toBeInTheDocument();
  });

  it('offers no tema select when no subtema carries a tema', () => {
    render(
      <SimulatedQuestionsChart
        data={data}
        contents={[content('c-9', 'Avulso', 3, 2, null)]}
      />
    );

    expect(screen.queryByText('Todos os temas')).not.toBeInTheDocument();
  });

  it('accepts a custom card title', () => {
    render(
      <SimulatedQuestionsChart data={data} title="Questões do simulado" />
    );

    expect(screen.getByText('Questões do simulado')).toBeInTheDocument();
  });
});
