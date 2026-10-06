import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ContentCards,
  EMPTY_STAT_VALUE,
  SimulationCardShell,
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

describe('SimulationStatCard accessibility', () => {
  it('pairs label and value in a description list, label first', () => {
    const { container } = render(
      <SimulationStatCard
        tone="correct"
        icon={<span data-testid="icon" />}
        label="Nº de questões corretas"
        value="12"
      />
    );

    expect((container.firstChild as HTMLElement).tagName).toBe('DL');
    const term = screen.getByRole('term');
    const definition = screen.getByRole('definition');
    expect(term).toHaveTextContent('Nº de questões corretas');
    expect(definition).toHaveTextContent('12');
    expect(
      term.compareDocumentPosition(definition) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    // Icon circle is decorative
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('reads an empty value as "sem dados" and hides the dash', () => {
    render(
      <SimulationStatCard
        tone="blank"
        icon={null}
        label="Nº de questões em branco"
        value={EMPTY_STAT_VALUE}
      />
    );

    expect(screen.getByText(EMPTY_STAT_VALUE)).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    expect(screen.getByText('sem dados')).toHaveClass('sr-only');
  });
});

describe('SimulationCardShell', () => {
  it('keeps only phrasing content in the trigger and hides the redundant bar', () => {
    const { container } = render(
      <SimulationCardShell
        value="sim-1"
        title="Simulado 1"
        meta="Duração: 00:10:00"
        correct={3}
        totalQuestions={5}
        expanded={false}
        onToggle={jest.fn()}
      >
        <div>conteúdo</div>
      </SimulationCardShell>
    );

    expect(screen.getByText('3 de 5 corretas').tagName).toBe('SPAN');
    expect(screen.getByText('Simulado 1').tagName).toBe('SPAN');
    expect(screen.getByText('Duração: 00:10:00').tagName).toBe('SPAN');
    expect(container.querySelector('progress')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('omits the meta line when it is empty', () => {
    render(
      <SimulationCardShell
        value="sim-2"
        title="Simulado 2"
        meta=""
        correct={0}
        totalQuestions={5}
        expanded={false}
        onToggle={jest.fn()}
      >
        <div />
      </SimulationCardShell>
    );

    expect(screen.getByText('0 de 5 corretas')).toBeInTheDocument();
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
    expect(screen.getAllByText('sem dados')).toHaveLength(2);
  });
});
