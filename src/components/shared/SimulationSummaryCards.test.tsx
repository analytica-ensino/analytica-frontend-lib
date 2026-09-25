import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ContentCards,
  EMPTY_STAT_VALUE,
  SimulationStatCard,
  SimulationStatCards,
} from './SimulationSummaryCards';

describe('SimulationStatCard', () => {
  it('shows its icon, label and value', () => {
    render(
      <SimulationStatCard
        tone="grade"
        icon={<span data-testid="icon" />}
        label="Nota 1"
        value="9,5"
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Nota 1')).toBeInTheDocument();
    expect(screen.getByText('9,5')).toHaveClass('text-warning-600');
  });

  it('paints each tone with its own family', () => {
    const { container } = render(
      <SimulationStatCard
        tone="incorrect"
        icon={null}
        label="Nº de questões incorretas"
        value="10"
      />
    );

    expect(container.firstChild).toHaveClass('bg-error-100');
    expect(screen.getByText('10')).toHaveClass('text-error-700');
  });
});

describe('SimulationStatCards', () => {
  it('leaves the grade card out when no score came', () => {
    render(
      <SimulationStatCards
        score={undefined}
        correct={1}
        incorrect={2}
        blank={3}
      />
    );

    expect(screen.queryByText('Nota média')).not.toBeInTheDocument();
    expect(screen.getByText('Nº de questões em branco')).toBeInTheDocument();
  });
});

describe('ContentCards', () => {
  it('names the best and the hardest subtema', () => {
    render(
      <ContentCards
        best={{ contentName: 'Cinemática' }}
        worst={{ contentName: 'Óptica' }}
      />
    );

    expect(
      screen.getByText('Subtema com melhor resultado')
    ).toBeInTheDocument();
    expect(screen.getByText('Cinemática')).toBeInTheDocument();
    expect(
      screen.getByText('Subtema com maior dificuldade')
    ).toBeInTheDocument();
    expect(screen.getByText('Óptica')).toBeInTheDocument();
  });

  it('marks a subtema the cut has none of', () => {
    render(<ContentCards best={null} worst={null} />);

    expect(screen.getAllByText(EMPTY_STAT_VALUE)).toHaveLength(2);
  });
});
