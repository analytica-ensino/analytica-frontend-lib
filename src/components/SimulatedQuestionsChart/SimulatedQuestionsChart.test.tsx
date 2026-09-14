import { render, screen, fireEvent, within } from '@testing-library/react';
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
