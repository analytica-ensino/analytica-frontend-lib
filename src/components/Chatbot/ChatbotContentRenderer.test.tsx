import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatbotContentRenderer from './ChatbotContentRenderer';

describe('ChatbotContentRenderer', () => {
  it('renders markdown bold as <strong>', () => {
    render(<ChatbotContentRenderer content="Isto é **muito importante**." />);
    expect(screen.getByText(/muito importante/i).tagName).toBe('STRONG');
  });

  it('renders bullet lists from markdown', () => {
    render(
      <ChatbotContentRenderer
        content={'Tópicos:\n- primeiro\n- segundo\n- terceiro'}
      />
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('primeiro');
  });

  it('delegates to HtmlMathRenderer when content contains LaTeX', () => {
    const { container } = render(
      <ChatbotContentRenderer content="Fórmula: $a^2 + b^2 = c^2$" />
    );
    // KaTeX renders inside .katex spans; the markdown path would not.
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });

  it('escapes raw HTML by default', () => {
    const { container } = render(
      <ChatbotContentRenderer content={'<script>alert(1)</script> normal'} />
    );
    // react-markdown escapes, so <script> appears as plain text in the DOM
    expect(screen.getByText(/alert\(1\)/)).toBeInTheDocument();
    // No actual <script> element should be rendered inside the component
    expect(container.querySelector('script')).toBeNull();
  });

  it('does not misdetect currency as math', () => {
    const { container } = render(
      <ChatbotContentRenderer content="Comprei por $20 e o livro $ 5." />
    );
    // Currency is plain markdown, not math — no KaTeX block should render.
    expect(container.querySelector('.katex')).toBeNull();
  });
});
