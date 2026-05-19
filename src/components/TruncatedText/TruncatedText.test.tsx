import { fireEvent, render, screen } from '@testing-library/react';
import { TruncatedText } from './TruncatedText';

/**
 * Hover the tooltip trigger so the portal tooltip mounts.
 */
const hoverTrigger = (container: HTMLElement): void => {
  const trigger = container.querySelector('.inline-flex') as HTMLElement;
  fireEvent.mouseEnter(trigger);
};

describe('TruncatedText', () => {
  it('renders the text content', () => {
    const { container } = render(<TruncatedText>Matemática</TruncatedText>);
    const text = container.querySelector('span.truncate');
    expect(text).toHaveTextContent('Matemática');
  });

  it('renders the tooltip on hover when children is a string', () => {
    const { container } = render(
      <TruncatedText>Linguagens, Códigos e suas Tecnologias</TruncatedText>
    );

    hoverTrigger(container);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Linguagens, Códigos e suas Tecnologias');
  });

  it('renders the tooltip on hover even when text is short', () => {
    const { container } = render(<TruncatedText>História</TruncatedText>);
    hoverTrigger(container);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('História');
  });

  it('does not render the tooltip until hover (portal mode)', () => {
    render(<TruncatedText>Texto</TruncatedText>);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('uses tooltipContent prop when provided', () => {
    const { container } = render(
      <TruncatedText tooltipContent="Conteúdo customizado">
        Truncado
      </TruncatedText>
    );
    hoverTrigger(container);

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Conteúdo customizado'
    );
  });

  it('applies size, weight and color classes', () => {
    const { container } = render(
      <TruncatedText size="sm" weight="bold" color="text-text-500">
        Conteúdo
      </TruncatedText>
    );

    const text = container.querySelector('.truncate');
    expect(text?.className).toContain('text-sm');
    expect(text?.className).toContain('font-bold');
    expect(text?.className).toContain('text-text-500');
    expect(text?.className).toContain('truncate');
  });

  it('renders with the polymorphic `as` element', () => {
    const { container } = render(
      <TruncatedText as="p">Parágrafo</TruncatedText>
    );
    expect(container.querySelector('p.truncate')).toBeInTheDocument();
  });

  it('disables the tooltip when children is not a string and no tooltipContent given', () => {
    const { container } = render(
      <TruncatedText>
        <span data-testid="nested">Conteúdo aninhado</span>
      </TruncatedText>
    );
    // No string content to fall back to, no override → tooltip disabled,
    // so the children render directly without any inline-flex wrapper to hover.
    expect(container.querySelector('.inline-flex')).not.toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.getByTestId('nested')).toBeInTheDocument();
  });

  it('applies wrapperClassName to the tooltip wrapper', () => {
    const { container } = render(
      <TruncatedText wrapperClassName="custom-wrapper">Truncado</TruncatedText>
    );
    expect(container.querySelector('.custom-wrapper')).toBeInTheDocument();
  });
});
