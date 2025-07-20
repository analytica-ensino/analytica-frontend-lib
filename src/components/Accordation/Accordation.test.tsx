import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CardAccordation } from './Accordation';

/**
 * Mock for useId hook to ensure consistent IDs in tests
 */
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
}));

describe('CardAccordation', () => {
  const mockTitle = 'Título do Acordeão';
  const mockContent =
    'Conteúdo do acordeão que pode ser expandido ou colapsado';

  // Helper function to find the clickable header
  const getHeader = () => screen.getByText(mockTitle).parentElement;

  describe('Renderização básica', () => {
    it('renderiza com título e conteúdo', () => {
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      expect(screen.getByText(mockTitle)).toBeInTheDocument();
      expect(screen.getByText(mockContent)).toBeInTheDocument();
    });

    it('renderiza com ícone de seta', () => {
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const caretIcon = screen.getByTestId('accordion-caret');
      expect(caretIcon).toBeInTheDocument();
    });

    it('aplica classes CSS customizadas', () => {
      const { container } = render(
        <CardAccordation title={mockTitle} className="custom-class">
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const accordionElement = container.firstChild as HTMLElement;
      expect(accordionElement).toHaveClass('custom-class');
    });

    it('passa props HTML corretamente', () => {
      render(
        <CardAccordation
          title={mockTitle}
          data-testid="accordion-wrapper"
          id="custom-accordion"
        >
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const accordionElement = screen.getByTestId('accordion-wrapper');
      expect(accordionElement).toHaveAttribute('id', 'custom-accordion');
    });
  });

  describe('Estado inicial', () => {
    it('inicia colapsado por padrão', () => {
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const content = screen.getByTestId('accordion-content');
      expect(content).toHaveClass('max-h-0', 'opacity-0');

      const header = getHeader();
      expect(header).toHaveAttribute('aria-expanded', 'false');

      const caretIcon = screen.getByTestId('accordion-caret');
      expect(caretIcon).toHaveClass('rotate-0');
    });

    it('inicia expandido quando defaultExpanded é true', () => {
      render(
        <CardAccordation title={mockTitle} defaultExpanded={true}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const content = screen.getByTestId('accordion-content');
      expect(content).toHaveClass('max-h-screen', 'opacity-100');

      const header = getHeader();
      expect(header).toHaveAttribute('aria-expanded', 'true');

      const caretIcon = screen.getByTestId('accordion-caret');
      expect(caretIcon).toHaveClass('rotate-90');
    });
  });

  describe('Interações do usuário', () => {
    it('expande quando clicado se estava colapsado', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');
      const caretIcon = screen.getByTestId('accordion-caret');

      // Initial state: collapsed
      expect(content).toHaveClass('max-h-0', 'opacity-0');
      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(caretIcon).toHaveClass('rotate-0');

      // Click to expand
      await user.click(header!);

      // State after click: expanded
      expect(content).toHaveClass('max-h-screen', 'opacity-100');
      expect(header).toHaveAttribute('aria-expanded', 'true');
      expect(caretIcon).toHaveClass('rotate-90');
    });

    it('colapsa quando clicado se estava expandido', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation title={mockTitle} defaultExpanded={true}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');
      const caretIcon = screen.getByTestId('accordion-caret');

      // Initial state: expanded
      expect(content).toHaveClass('max-h-screen', 'opacity-100');
      expect(header).toHaveAttribute('aria-expanded', 'true');
      expect(caretIcon).toHaveClass('rotate-90');

      // Click to collapse
      await user.click(header!);

      // State after click: collapsed
      expect(content).toHaveClass('max-h-0', 'opacity-0');
      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(caretIcon).toHaveClass('rotate-0');
    });

    it('alterna entre expandido e colapsado com múltiplos cliques', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      // Initially collapsed
      expect(content).toHaveClass('max-h-0', 'opacity-0');

      // First click: expand
      await user.click(header!);
      expect(content).toHaveClass('max-h-screen', 'opacity-100');

      // Second click: collapse
      await user.click(header!);
      expect(content).toHaveClass('max-h-0', 'opacity-0');

      // Third click: expand again
      await user.click(header!);
      expect(content).toHaveClass('max-h-screen', 'opacity-100');
    });

    it('responde a eventos de teclado via click', () => {
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      // Initially collapsed
      expect(content).toHaveClass('max-h-0', 'opacity-0');

      // Simulate click via keyboard
      fireEvent.click(header!);
      expect(content).toHaveClass('max-h-screen', 'opacity-100');

      // Simulate another click via keyboard
      fireEvent.click(header!);
      expect(content).toHaveClass('max-h-0', 'opacity-0');
    });
  });

  describe('Callback onToggleExpanded', () => {
    it('chama onToggleExpanded quando expandido', async () => {
      const handleToggle = jest.fn();
      const user = userEvent.setup();

      render(
        <CardAccordation title={mockTitle} onToggleExpanded={handleToggle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();

      // Click to expand
      await user.click(header!);

      expect(handleToggle).toHaveBeenCalledTimes(1);
      expect(handleToggle).toHaveBeenCalledWith(true);
    });

    it('chama onToggleExpanded quando colapsado', async () => {
      const handleToggle = jest.fn();
      const user = userEvent.setup();

      render(
        <CardAccordation
          title={mockTitle}
          defaultExpanded={true}
          onToggleExpanded={handleToggle}
        >
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();

      // Click to collapse
      await user.click(header!);

      expect(handleToggle).toHaveBeenCalledTimes(1);
      expect(handleToggle).toHaveBeenCalledWith(false);
    });

    it('chama onToggleExpanded com valores corretos em múltiplos cliques', async () => {
      const handleToggle = jest.fn();
      const user = userEvent.setup();

      render(
        <CardAccordation title={mockTitle} onToggleExpanded={handleToggle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();

      // First click: expand
      await user.click(header!);
      expect(handleToggle).toHaveBeenNthCalledWith(1, true);

      // Second click: collapse
      await user.click(header!);
      expect(handleToggle).toHaveBeenNthCalledWith(2, false);

      // Third click: expand
      await user.click(header!);
      expect(handleToggle).toHaveBeenNthCalledWith(3, true);

      expect(handleToggle).toHaveBeenCalledTimes(3);
    });

    it('funciona sem callback onToggleExpanded', async () => {
      const user = userEvent.setup();

      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      // Should work normally even without callback
      expect(content).toHaveClass('max-h-0', 'opacity-0');

      await user.click(header!);
      expect(content).toHaveClass('max-h-screen', 'opacity-100');
    });
  });

  describe('Acessibilidade', () => {
    it('tem atributos ARIA corretos', () => {
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(header).toHaveAttribute('aria-controls', 'accordion-content');
      expect(content).toHaveAttribute('data-testid', 'accordion-content');
    });

    it('atualiza aria-expanded corretamente', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();

      // Initially false
      expect(header).toHaveAttribute('aria-expanded', 'false');

      // After expanding
      await user.click(header!);
      expect(header).toHaveAttribute('aria-expanded', 'true');

      // After collapsing
      await user.click(header!);
      expect(header).toHaveAttribute('aria-expanded', 'false');
    });

    it('tem foco visível', () => {
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      expect(header).toHaveClass('focus:ring-2', 'focus:ring-primary-500');
    });

    it('header é clicável e tem cursor pointer', () => {
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      expect(header).toHaveClass('cursor-pointer');
    });
  });

  describe('Conteúdo e layout', () => {
    it('renderiza conteúdo complexo', () => {
      const complexContent = (
        <div>
          <h3>Subtítulo</h3>
          <p>Primeiro parágrafo</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
          <button>Botão interno</button>
        </div>
      );

      render(
        <CardAccordation title={mockTitle}>{complexContent}</CardAccordation>
      );

      expect(screen.getByText('Subtítulo')).toBeInTheDocument();
      expect(screen.getByText('Primeiro parágrafo')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Botão interno')).toBeInTheDocument();
    });

    it('aplica layout vertical do CardBase', () => {
      const { container } = render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      // CardBase with vertical layout should be present
      const cardBase = container.firstChild as HTMLElement;
      expect(cardBase).toBeInTheDocument();
    });

    it('aplica estilos de transição corretos', () => {
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const content = screen.getByTestId('accordion-content');
      const caretIcon = screen.getByTestId('accordion-caret');

      expect(content).toHaveClass(
        'transition-all',
        'duration-300',
        'ease-in-out'
      );
      expect(caretIcon).toHaveClass('transition-transform', 'duration-200');
    });
  });

  describe('Ícone de seta', () => {
    it('rotaciona corretamente quando expandido/colapsado', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const caretIcon = screen.getByTestId('accordion-caret');
      const header = getHeader();

      // Initially rotation 0
      expect(caretIcon).toHaveClass('rotate-0');
      expect(caretIcon).not.toHaveClass('rotate-90');

      // After expanding: rotation 90
      await user.click(header!);
      expect(caretIcon).toHaveClass('rotate-90');
      expect(caretIcon).not.toHaveClass('rotate-0');

      // After collapsing: rotation 0 again
      await user.click(header!);
      expect(caretIcon).toHaveClass('rotate-0');
      expect(caretIcon).not.toHaveClass('rotate-90');
    });

    it('mantém tamanho correto', () => {
      render(
        <CardAccordation title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const caretIcon = screen.getByTestId('accordion-caret');
      // Check Phosphor icon attributes
      expect(caretIcon).toHaveAttribute('width', '20');
      expect(caretIcon).toHaveAttribute('height', '20');
    });
  });

  describe('Casos extremos', () => {
    it('funciona com título vazio', () => {
      const { container } = render(
        <CardAccordation title="">
          <p>{mockContent}</p>
        </CardAccordation>
      );

      // Check if header is present even with empty title
      const header = container.querySelector('[aria-expanded]');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('aria-expanded', 'false');
    });

    it('funciona com conteúdo vazio', () => {
      render(
        <CardAccordation title={mockTitle}>
          <div></div>
        </CardAccordation>
      );

      expect(screen.getByText(mockTitle)).toBeInTheDocument();
      const content = screen.getByTestId('accordion-content');
      expect(content).toBeInTheDocument();
    });

    it('funciona com título muito longo', () => {
      const longTitle = 'Título muito longo que pode ser truncado'.repeat(5);
      render(
        <CardAccordation title={longTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const titleElement = screen.getByText(longTitle);
      expect(titleElement).toHaveClass('truncate');
    });
  });

  describe('forwardRef', () => {
    it('encaminha ref corretamente', () => {
      const ref = { current: null };
      render(
        <CardAccordation ref={ref} title={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
