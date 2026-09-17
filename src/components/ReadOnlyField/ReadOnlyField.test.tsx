import { render, screen } from '@testing-library/react';
import Text from '../Text/Text';
import { ReadOnlyField } from './ReadOnlyField';

const renderInList = () =>
  render(
    <Text as="dl">
      <ReadOnlyField label="Nome" value="João Silva" />
      <ReadOnlyField label="E-mail" value="joao@example.com" />
    </Text>
  );

describe('ReadOnlyField', () => {
  it('renders the label as a term and the value as its definition', () => {
    const { container } = renderInList();

    const terms = Array.from(container.querySelectorAll('dt')).map(
      (el) => el.textContent
    );
    const definitions = Array.from(container.querySelectorAll('dd')).map(
      (el) => el.textContent
    );

    expect(terms).toEqual(['Nome', 'E-mail']);
    expect(definitions).toEqual(['João Silva', 'joao@example.com']);
  });

  // O ponto do componente: o dado deixa de ser um campo de formulário, então
  // não há nada focável nem anunciado como área de edição.
  it('renders no form field and nothing focusable', () => {
    const { container } = renderInList();

    expect(container.querySelector('input')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(container.querySelector('[tabindex]')).not.toBeInTheDocument();
  });

  it('keeps each value next to its own label', () => {
    const { container } = renderInList();

    const email = screen.getByText('E-mail');
    expect(email.tagName).toBe('DT');
    expect(email.nextElementSibling).toHaveTextContent('joao@example.com');
    expect(container.querySelectorAll('dt')).toHaveLength(2);
  });

  it('accepts nodes as label and value', () => {
    render(
      <Text as="dl">
        <ReadOnlyField
          label={<span data-testid="custom-label">Turma</span>}
          value={<span data-testid="custom-value">3A</span>}
        />
      </Text>
    );

    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
    expect(screen.getByTestId('custom-value')).toBeInTheDocument();
  });
});
