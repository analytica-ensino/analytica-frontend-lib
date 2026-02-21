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
  const getHeader = () => screen.getByRole('button');

  describe('Basic rendering', () => {
    it('renders with trigger and content', () => {
      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      expect(screen.getByText(mockTitle)).toBeInTheDocument();
      expect(screen.getByText(mockContent)).toBeInTheDocument();
    });

    it('renders with arrow icon', () => {
      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const caretIcon = screen.getByTestId('accordion-caret');
      expect(caretIcon).toBeInTheDocument();
    });

    it('applies custom CSS classes', () => {
      const { container } = render(
        <CardAccordation trigger={mockTitle} className="custom-class">
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const accordionElement = container.firstChild as HTMLElement;
      expect(accordionElement).toHaveClass('custom-class');
    });

    it('passes HTML props correctly', () => {
      render(
        <CardAccordation
          trigger={mockTitle}
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

  describe('Initial state', () => {
    it('starts collapsed by default', () => {
      render(
        <CardAccordation trigger={mockTitle}>
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

    it('starts expanded when defaultExpanded is true', () => {
      render(
        <CardAccordation trigger={mockTitle} defaultExpanded={true}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const content = screen.getByTestId('accordion-content');
      expect(content).toHaveClass('opacity-100');

      const header = getHeader();
      expect(header).toHaveAttribute('aria-expanded', 'true');

      const caretIcon = screen.getByTestId('accordion-caret');
      expect(caretIcon).toHaveClass('rotate-90');
    });
  });

  describe('User interactions', () => {
    it('expands when clicked if it was collapsed', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation trigger={mockTitle}>
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
      expect(content).toHaveClass('opacity-100');
      expect(header).toHaveAttribute('aria-expanded', 'true');
      expect(caretIcon).toHaveClass('rotate-90');
    });

    it('collapses when clicked if it was expanded', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation trigger={mockTitle} defaultExpanded={true}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');
      const caretIcon = screen.getByTestId('accordion-caret');

      // Initial state: expanded
      expect(content).toHaveClass('opacity-100');
      expect(header).toHaveAttribute('aria-expanded', 'true');
      expect(caretIcon).toHaveClass('rotate-90');

      // Click to collapse
      await user.click(header!);

      // State after click: collapsed
      expect(content).toHaveClass('max-h-0', 'opacity-0');
      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(caretIcon).toHaveClass('rotate-0');
    });

    it('toggles between expanded and collapsed with multiple clicks', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      // Initially collapsed
      expect(content).toHaveClass('max-h-0', 'opacity-0');

      // First click: expand
      await user.click(header!);
      expect(content).toHaveClass('opacity-100');

      // Second click: collapse
      await user.click(header!);
      expect(content).toHaveClass('max-h-0', 'opacity-0');

      // Third click: expand again
      await user.click(header!);
      expect(content).toHaveClass('opacity-100');
    });

    it('responds to keyboard events via click', () => {
      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      // Initially collapsed
      expect(content).toHaveClass('max-h-0', 'opacity-0');

      // Simulate Enter key press
      fireEvent.keyDown(header!, { key: 'Enter', code: 'Enter' });
      expect(content).toHaveClass('opacity-100');

      // Simulate Space key press
      fireEvent.keyDown(header!, { key: ' ', code: 'Space' });
      expect(content).toHaveClass('max-h-0', 'opacity-0');
    });
  });

  describe('onToggleExpanded callback', () => {
    it('calls onToggleExpanded when expanded', async () => {
      const handleToggle = jest.fn();
      const user = userEvent.setup();

      render(
        <CardAccordation trigger={mockTitle} onToggleExpanded={handleToggle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      await user.click(header!);

      expect(handleToggle).toHaveBeenCalledWith(true);
    });

    it('calls onToggleExpanded when collapsed', async () => {
      const handleToggle = jest.fn();
      const user = userEvent.setup();

      render(
        <CardAccordation
          trigger={mockTitle}
          defaultExpanded={true}
          onToggleExpanded={handleToggle}
        >
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      await user.click(header!);

      expect(handleToggle).toHaveBeenCalledWith(false);
    });

    it('calls onToggleExpanded with correct values on multiple clicks', async () => {
      const handleToggle = jest.fn();
      const user = userEvent.setup();

      render(
        <CardAccordation trigger={mockTitle} onToggleExpanded={handleToggle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();

      // First click: expand
      await user.click(header!);
      expect(handleToggle).toHaveBeenLastCalledWith(true);

      // Second click: collapse
      await user.click(header!);
      expect(handleToggle).toHaveBeenLastCalledWith(false);

      // Third click: expand again
      await user.click(header!);
      expect(handleToggle).toHaveBeenLastCalledWith(true);
    });

    it('works without onToggleExpanded callback', async () => {
      const user = userEvent.setup();

      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      // Should not throw error when clicking without callback
      await user.click(header!);
      expect(content).toHaveClass('opacity-100');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(
        <CardAccordation trigger={mockTitle} value="test-value">
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      expect(header).toHaveAttribute('aria-expanded', 'false');

      // Verify aria-controls points to content ID
      const ariaControls = header?.getAttribute('aria-controls');
      const contentId = content.getAttribute('id');
      expect(ariaControls).toBe(contentId);
      expect(ariaControls).toBeTruthy();

      // When value is provided, IDs should be semantic
      expect(header).toHaveAttribute('id', 'accordion-header-test-value');
      expect(content).toHaveAttribute('id', 'accordion-content-test-value');
      expect(header).toHaveAttribute('data-value', 'test-value');
      expect(content).toHaveAttribute('data-value', 'test-value');

      // Verify content is a section element (implicitly has role="region")
      expect(content.tagName).toBe('SECTION');
      expect(content).toHaveAttribute('aria-labelledby', header?.id);
    });

    it('generates IDs when value is not provided', () => {
      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      // Verify IDs exist (generated by React)
      expect(header).toHaveAttribute('id');
      expect(content).toHaveAttribute('id');

      // Verify aria-controls points to content ID
      const ariaControls = header?.getAttribute('aria-controls');
      const contentId = content.getAttribute('id');
      expect(ariaControls).toBe(contentId);

      // Verify relationships
      expect(content.tagName).toBe('SECTION');
      expect(content).toHaveAttribute('aria-labelledby', header?.id);
    });

    it('updates aria-expanded correctly', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();

      // Initially collapsed
      expect(header).toHaveAttribute('aria-expanded', 'false');

      // Click to expand
      await user.click(header!);
      expect(header).toHaveAttribute('aria-expanded', 'true');

      // Click to collapse
      await user.click(header!);
      expect(header).toHaveAttribute('aria-expanded', 'false');
    });

    it('has visible focus', () => {
      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      expect(header).toHaveClass(
        'focus:outline-none',
        'focus:border-2',
        'focus:border-primary-950'
      );
    });

    it('header is clickable and has pointer cursor', () => {
      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      expect(header).toHaveClass('cursor-pointer');
    });
  });

  describe('Arrow icon', () => {
    it('rotates correctly when expanded/collapsed', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const caretIcon = screen.getByTestId('accordion-caret');

      // Initially collapsed: no rotation
      expect(caretIcon).toHaveClass('rotate-0');
      expect(caretIcon).not.toHaveClass('rotate-90');

      // Click to expand: rotate 90 degrees
      await user.click(getHeader()!);
      expect(caretIcon).toHaveClass('rotate-90');
      expect(caretIcon).not.toHaveClass('rotate-0');

      // Click to collapse: back to no rotation
      await user.click(getHeader()!);
      expect(caretIcon).toHaveClass('rotate-0');
      expect(caretIcon).not.toHaveClass('rotate-90');
    });

    it('has correct transition classes', () => {
      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const caretIcon = screen.getByTestId('accordion-caret');
      expect(caretIcon).toHaveClass('transition-transform', 'duration-200');
    });
  });

  describe('Complex content', () => {
    it('handles complex nested content', () => {
      const complexContent = (
        <div>
          <h3>Seção 1</h3>
          <p>Conteúdo da seção 1</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
          <h3>Seção 2</h3>
          <p>Conteúdo da seção 2</p>
        </div>
      );

      render(
        <CardAccordation trigger={mockTitle}>{complexContent}</CardAccordation>
      );

      expect(screen.getByText('Seção 1')).toBeInTheDocument();
      expect(screen.getByText('Seção 2')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('handles multiple accordions on the same page', () => {
      render(
        <div>
          <CardAccordation trigger="Accordion 1">
            <p>Content 1</p>
          </CardAccordation>
          <CardAccordation trigger="Accordion 2">
            <p>Content 2</p>
          </CardAccordation>
        </div>
      );

      expect(screen.getByText('Accordion 1')).toBeInTheDocument();
      expect(screen.getByText('Accordion 2')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('works with empty content', () => {
      render(
        <CardAccordation trigger={mockTitle}>
          <div />
        </CardAccordation>
      );

      expect(screen.getByText(mockTitle)).toBeInTheDocument();
      const content = screen.getByTestId('accordion-content');
      expect(content).toBeInTheDocument();
    });

    it('works with very long title', () => {
      const longTitle =
        'Título muito longo que pode ser truncadoTítulo muito longo que pode ser truncadoTítulo muito longo que pode ser truncadoTítulo muito longo que pode ser truncadoTítulo muito longo que pode ser truncado';

      render(
        <CardAccordation trigger={longTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const titleElement = screen.getByText(longTitle);
      expect(titleElement).toBeInTheDocument();
    });

    it('handles rapid clicking', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();

      // Rapid clicks should not break the component
      await user.click(header!);
      await user.click(header!);
      await user.click(header!);
      await user.click(header!);

      // Should still be in a valid state
      const content = screen.getByTestId('accordion-content');
      expect(content).toBeInTheDocument();
    });

    it('works with forwardRef', () => {
      const ref = jest.fn();
      render(
        <CardAccordation ref={ref} trigger={mockTitle}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Disabled state', () => {
    it('should render with disabled attribute when disabled prop is true', () => {
      render(
        <CardAccordation trigger={mockTitle} disabled={true}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      expect(header).toBeDisabled();
      expect(header).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not expand when clicked if disabled', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation trigger={mockTitle} disabled={true}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(content).toHaveClass('max-h-0', 'opacity-0');

      await user.click(header!);

      // Should remain collapsed
      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(content).toHaveClass('max-h-0', 'opacity-0');
    });

    it('should not call onToggleExpanded when disabled', async () => {
      const onToggle = jest.fn();
      const user = userEvent.setup();

      render(
        <CardAccordation
          trigger={mockTitle}
          disabled={true}
          onToggleExpanded={onToggle}
        >
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      await user.click(header!);

      expect(onToggle).not.toHaveBeenCalled();
    });

    it('should not respond to keyboard events when disabled', () => {
      render(
        <CardAccordation trigger={mockTitle} disabled={true}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      // Try Enter key
      fireEvent.keyDown(header!, { key: 'Enter' });
      expect(content).toHaveClass('max-h-0', 'opacity-0');

      // Try Space key
      fireEvent.keyDown(header!, { key: ' ' });
      expect(content).toHaveClass('max-h-0', 'opacity-0');
    });

    it('should have disabled visual styles', () => {
      render(
        <CardAccordation trigger={mockTitle} disabled={true}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      expect(header).toHaveClass('cursor-not-allowed', 'text-text-400');
    });

    it('should work normally when disabled is false', async () => {
      const user = userEvent.setup();
      render(
        <CardAccordation trigger={mockTitle} disabled={false}>
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      expect(header).not.toBeDisabled();

      await user.click(header!);
      expect(content).toHaveClass('opacity-100');
    });

    it('should disable an already expanded accordion', () => {
      render(
        <CardAccordation
          trigger={mockTitle}
          defaultExpanded={true}
          disabled={true}
        >
          <p>{mockContent}</p>
        </CardAccordation>
      );

      const header = getHeader();
      const content = screen.getByTestId('accordion-content');

      // Should be expanded but disabled
      expect(header).toBeDisabled();
      expect(header).toHaveAttribute('aria-expanded', 'true');
      expect(content).toHaveClass('opacity-100');
    });
  });
});
