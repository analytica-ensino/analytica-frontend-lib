import { render, screen } from '@testing-library/react';
import { KatexMath } from './KatexMath';

// Uses the real `katex` package (renderToString is pure and runs under jsdom).

describe('KatexMath', () => {
  it('renders inline math as a <span> with KaTeX output', () => {
    const { container } = render(<KatexMath math="\frac{1}{2}" />);
    const el = screen.getByTestId('react-katex');
    expect(el.tagName).toBe('SPAN');
    expect(container.querySelector('.katex')).toBeInTheDocument();
    // \frac must actually render as a fraction (the bug was \frac failing)
    expect(container.querySelector('.mfrac')).toBeInTheDocument();
  });

  it('renders display math as a <div>', () => {
    render(<KatexMath math="x^2" displayMode />);
    expect(screen.getByTestId('react-katex').tagName).toBe('DIV');
  });

  it('renders backslash commands (\\cdot, \\left/\\right) without error', () => {
    const onError = jest.fn(() => <span data-testid="err" />);
    const { container } = render(
      <KatexMath
        math="\left(\frac{1}{2}\right) \cdot u"
        renderError={onError}
      />
    );
    expect(onError).not.toHaveBeenCalled();
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });

  it('calls renderError when LaTeX is invalid', () => {
    const onError = jest.fn(() => <span data-testid="err">erro</span>);
    render(<KatexMath math={'\\frac{'} renderError={onError} />);
    expect(onError).toHaveBeenCalled();
    expect(screen.getByTestId('err')).toBeInTheDocument();
  });

  it('renders nothing when LaTeX is invalid and no renderError is given', () => {
    const { container } = render(<KatexMath math={'\\frac{'} />);
    expect(
      container.querySelector('[data-testid="react-katex"]')
    ).not.toBeInTheDocument();
  });
});
