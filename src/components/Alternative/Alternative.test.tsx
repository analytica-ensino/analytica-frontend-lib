import { render, screen, fireEvent } from '@testing-library/react';
import { AlternativesList } from './Alternative';

const mockAlternatives = [
  { value: 'a', label: 'Alternativa A' },
  { value: 'b', label: 'Alternativa B', status: 'correct' as const },
  { value: 'c', label: 'Alternativa C', status: 'incorrect' as const },
  { value: 'd', label: 'Alternativa D', disabled: true },
];

describe('AlternativesList', () => {
  it('should render all alternatives', () => {
    render(<AlternativesList alternatives={mockAlternatives} />);

    expect(screen.getByText('Alternativa A')).toBeInTheDocument();
    expect(screen.getByText('Alternativa B')).toBeInTheDocument();
    expect(screen.getByText('Alternativa C')).toBeInTheDocument();
    expect(screen.getByText('Alternativa D')).toBeInTheDocument();
  });

  it('should handle value change in interactive mode', () => {
    const onValueChange = jest.fn();
    render(
      <AlternativesList
        alternatives={mockAlternatives}
        onValueChange={onValueChange}
      />
    );

    const radioA = screen.getByRole('radio', { name: /alternativa a/i });
    fireEvent.click(radioA);

    expect(onValueChange).toHaveBeenCalledWith('a');
  });

  it('should render status badges correctly', () => {
    render(<AlternativesList alternatives={mockAlternatives} />);

    expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
  });

  it('should render in readonly mode', () => {
    render(
      <AlternativesList
        mode="readonly"
        selectedValue="a"
        alternatives={mockAlternatives}
      />
    );

    // No modo readonly, não deve haver radios funcionais
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('should show selected alternative in readonly mode', () => {
    render(
      <AlternativesList
        mode="readonly"
        selectedValue="b"
        alternatives={mockAlternatives}
      />
    );

    // Deve mostrar a alternativa correta com badge
    expect(screen.getByText('Resposta correta')).toBeInTheDocument();
  });

  it('should handle disabled alternatives', () => {
    render(<AlternativesList alternatives={mockAlternatives} />);

    const radioD = screen.getByRole('radio', { name: /alternativa d/i });
    expect(radioD).toBeDisabled();
  });

  it('should render detailed layout', () => {
    const detailedAlternatives = [
      {
        value: 'a',
        label: 'Alternativa A',
        description: 'Descrição da alternativa A',
      },
    ];

    render(
      <AlternativesList alternatives={detailedAlternatives} layout="detailed" />
    );

    expect(screen.getByText('Descrição da alternativa A')).toBeInTheDocument();
  });

  it('should render compact layout', () => {
    render(
      <AlternativesList alternatives={mockAlternatives} layout="compact" />
    );

    // Verifica se renderizou sem erros
    expect(screen.getByText('Alternativa A')).toBeInTheDocument();
  });

  it('should handle controlled mode', () => {
    const onValueChange = jest.fn();
    render(
      <AlternativesList
        alternatives={mockAlternatives}
        value="b"
        onValueChange={onValueChange}
      />
    );

    const radioA = screen.getByRole('radio', { name: /alternativa a/i });
    fireEvent.click(radioA);

    expect(onValueChange).toHaveBeenCalledWith('a');
  });

  it('should handle disabled state for whole component', () => {
    render(
      <AlternativesList alternatives={mockAlternatives} disabled={true} />
    );

    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it('should show incorrect badge when user selected wrong answer in readonly mode', () => {
    render(
      <AlternativesList
        mode="readonly"
        selectedValue="a" // Usuário selecionou A
        alternatives={[
          { value: 'a', label: 'Alternativa A' }, // Selecionada (incorreta)
          { value: 'b', label: 'Alternativa B', status: 'correct' }, // Correta
        ]}
      />
    );

    expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
  });

  it('should show only correct badge when user selected correct answer in readonly mode', () => {
    render(
      <AlternativesList
        mode="readonly"
        selectedValue="b" // Usuário selecionou B (correta)
        alternatives={[
          { value: 'a', label: 'Alternativa A' },
          { value: 'b', label: 'Alternativa B', status: 'correct' }, // Selecionada e correta
        ]}
      />
    );

    expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    expect(screen.queryByText('Resposta incorreta')).not.toBeInTheDocument();
  });
});
