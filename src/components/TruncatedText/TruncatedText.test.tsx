import type { ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
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

describe('TruncatedText — foco só quando cortado', () => {
  const setSizes = (scrollWidth: number, clientWidth: number) => {
    jest
      .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
      .mockReturnValue(scrollWidth);
    jest
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockReturnValue(clientWidth);
  };

  afterEach(() => jest.restoreAllMocks());

  it('fica fora da ordem do Tab quando o texto cabe', () => {
    setSizes(100, 100);
    render(<TruncatedText>História</TruncatedText>);

    expect(screen.getByText('História')).not.toHaveAttribute('tabindex');
  });

  it('entra na ordem do Tab quando o texto está cortado', () => {
    setSizes(300, 100);
    render(
      <TruncatedText>Linguagens, Códigos e suas Tecnologias</TruncatedText>
    );

    expect(
      screen.getByText('Linguagens, Códigos e suas Tecnologias')
    ).toHaveAttribute('tabindex', '0');
  });

  it('não vira parada de foco sem conteúdo de tooltip', () => {
    setSizes(300, 100);
    render(
      <TruncatedText>
        <b>sem texto</b>
      </TruncatedText>
    );

    expect(screen.getByText('sem texto').parentElement).not.toHaveAttribute(
      'tabindex'
    );
  });

  it('remeasures when the element resizes', () => {
    const observe = jest.fn();
    const disconnect = jest.fn();
    let callback: () => void = () => undefined;
    const original = globalThis.ResizeObserver;
    globalThis.ResizeObserver = jest.fn((cb: () => void) => {
      callback = cb;
      return { observe, disconnect, unobserve: jest.fn() };
    }) as unknown as typeof ResizeObserver;

    setSizes(100, 100);
    const { unmount } = render(<TruncatedText>Texto</TruncatedText>);
    expect(observe).toHaveBeenCalled();
    expect(screen.getByText('Texto')).not.toHaveAttribute('tabindex');

    setSizes(300, 100);
    act(() => callback());
    expect(screen.getByText('Texto')).toHaveAttribute('tabindex', '0');

    unmount();
    expect(disconnect).toHaveBeenCalled();
    globalThis.ResizeObserver = original;
  });

  it('não quebra quando o elemento `as` não repassa a ref', () => {
    const Plain = ({ children }: { children?: ReactNode }) => (
      <em>{children}</em>
    );
    render(<TruncatedText as={Plain}>Sem ref</TruncatedText>);

    expect(screen.getByText('Sem ref')).not.toHaveAttribute('tabindex');
  });
});
