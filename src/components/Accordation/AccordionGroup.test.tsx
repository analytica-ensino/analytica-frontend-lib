import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccordionGroup } from './AccordionGroup';
import { CardAccordation } from './Accordation';

describe('AccordionGroup', () => {
  describe('Single mode', () => {
    it('should render all accordion items', () => {
      render(
        <AccordionGroup type="single">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
          <CardAccordation trigger="Item 3" value="item-3">
            Content 3
          </CardAccordation>
        </AccordionGroup>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should only allow one accordion to be open at a time', () => {
      render(
        <AccordionGroup type="single">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
          <CardAccordation trigger="Item 3" value="item-3">
            Content 3
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;

      // Open first item
      fireEvent.click(item1Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'false');

      // Open second item - first should close
      fireEvent.click(item2Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'false');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should support defaultValue prop', () => {
      render(
        <AccordionGroup type="single" defaultValue="item-2">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;

      expect(item1Button).toHaveAttribute('aria-expanded', 'false');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should support controlled mode with value prop', () => {
      const onValueChange = jest.fn();
      const { rerender } = render(
        <AccordionGroup
          type="single"
          value="item-1"
          onValueChange={onValueChange}
        >
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;

      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'false');

      // Click second item
      fireEvent.click(item2Button);
      expect(onValueChange).toHaveBeenCalledWith('item-2');

      // Update controlled value
      rerender(
        <AccordionGroup
          type="single"
          value="item-2"
          onValueChange={onValueChange}
        >
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      expect(item1Button).toHaveAttribute('aria-expanded', 'false');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should allow closing current item when collapsible is true', () => {
      render(
        <AccordionGroup type="single" collapsible={true}>
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
        </AccordionGroup>
      );

      const button = screen.getByText('Item 1').closest('button')!;

      // Open item
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Close item
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not allow closing current item when collapsible is false', () => {
      render(
        <AccordionGroup type="single" collapsible={false} defaultValue="item-1">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
        </AccordionGroup>
      );

      const button = screen.getByText('Item 1').closest('button')!;

      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Try to close item
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should call onValueChange when accordion is toggled', () => {
      const onValueChange = jest.fn();

      render(
        <AccordionGroup type="single" onValueChange={onValueChange}>
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;

      fireEvent.click(item1Button);
      expect(onValueChange).toHaveBeenCalledWith('item-1');
    });
  });

  describe('Multiple mode', () => {
    it('should allow multiple accordions to be open at the same time', () => {
      render(
        <AccordionGroup type="multiple">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
          <CardAccordation trigger="Item 3" value="item-3">
            Content 3
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;
      const item3Button = screen.getByText('Item 3').closest('button')!;

      // Open first item
      fireEvent.click(item1Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'true');

      // Open second item - first should remain open
      fireEvent.click(item2Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');

      // Open third item - both should remain open
      fireEvent.click(item3Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');
      expect(item3Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should support defaultValue array prop', () => {
      render(
        <AccordionGroup type="multiple" defaultValue={['item-1', 'item-3']}>
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
          <CardAccordation trigger="Item 3" value="item-3">
            Content 3
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;
      const item3Button = screen.getByText('Item 3').closest('button')!;

      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'false');
      expect(item3Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should support controlled mode with array value', () => {
      const onValueChange = jest.fn();
      const { rerender } = render(
        <AccordionGroup
          type="multiple"
          value={['item-1']}
          onValueChange={onValueChange}
        >
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;

      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'false');

      // Click second item to add it
      fireEvent.click(item2Button);
      expect(onValueChange).toHaveBeenCalledWith(['item-1', 'item-2']);

      // Update controlled value
      rerender(
        <AccordionGroup
          type="multiple"
          value={['item-1', 'item-2']}
          onValueChange={onValueChange}
        >
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should allow closing individual items', () => {
      render(
        <AccordionGroup type="multiple" defaultValue={['item-1', 'item-2']}>
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;

      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');

      // Close first item
      fireEvent.click(item1Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'false');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should call onValueChange with array when accordion is toggled', () => {
      const onValueChange = jest.fn();

      render(
        <AccordionGroup type="multiple" onValueChange={onValueChange}>
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;

      // Open first item
      fireEvent.click(item1Button);
      expect(onValueChange).toHaveBeenCalledWith(['item-1']);

      // Open second item
      fireEvent.click(item2Button);
      expect(onValueChange).toHaveBeenCalledWith(['item-1', 'item-2']);
    });
  });

  describe('Auto-generated values', () => {
    it('should auto-generate values when not provided', () => {
      const onValueChange = jest.fn();

      render(
        <AccordionGroup type="single" onValueChange={onValueChange}>
          <CardAccordation trigger="Item 1">Content 1</CardAccordation>
          <CardAccordation trigger="Item 2">Content 2</CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;

      fireEvent.click(item1Button);
      expect(onValueChange).toHaveBeenCalledWith('accordion-item-0');
    });
  });

  describe('Individual accordion callbacks', () => {
    it('should preserve individual accordion onToggleExpanded callbacks', () => {
      const onToggle1 = jest.fn();
      const onToggle2 = jest.fn();

      render(
        <AccordionGroup type="single">
          <CardAccordation
            trigger="Item 1"
            value="item-1"
            onToggleExpanded={onToggle1}
          >
            Content 1
          </CardAccordation>
          <CardAccordation
            trigger="Item 2"
            value="item-2"
            onToggleExpanded={onToggle2}
          >
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;

      fireEvent.click(item1Button);
      expect(onToggle1).toHaveBeenCalledWith(true);
      expect(onToggle2).not.toHaveBeenCalled();

      fireEvent.click(item2Button);
      // Note: onToggle1 is not called when item is closed automatically in single mode
      expect(onToggle1).toHaveBeenCalledTimes(1);
      expect(onToggle2).toHaveBeenCalledWith(true);
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', () => {
      render(
        <AccordionGroup type="single">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;

      // Test Enter key
      fireEvent.keyDown(item1Button, { key: 'Enter' });
      expect(item1Button).toHaveAttribute('aria-expanded', 'true');

      // Test Space key
      fireEvent.keyDown(item1Button, { key: ' ' });
      expect(item1Button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to wrapper', () => {
      const { container } = render(
        <AccordionGroup type="single" className="custom-class">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
        </AccordionGroup>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Nested structure with divs', () => {
    it('should work with divs between AccordionGroup and CardAccordation', () => {
      render(
        <AccordionGroup type="single">
          <div className="section">
            <h3>Section 1</h3>
            <CardAccordation trigger="Item 1" value="item-1">
              Content 1
            </CardAccordation>
            <CardAccordation trigger="Item 2" value="item-2">
              Content 2
            </CardAccordation>
          </div>
          <div className="section">
            <h3>Section 2</h3>
            <CardAccordation trigger="Item 3" value="item-3">
              Content 3
            </CardAccordation>
          </div>
        </AccordionGroup>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });

    it('should maintain single mode behavior with nested divs', () => {
      render(
        <AccordionGroup type="single">
          <div className="wrapper">
            <CardAccordation trigger="Item 1" value="item-1">
              Content 1
            </CardAccordation>
          </div>
          <div className="wrapper">
            <CardAccordation trigger="Item 2" value="item-2">
              Content 2
            </CardAccordation>
          </div>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;

      // Open first item
      fireEvent.click(item1Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'false');

      // Open second item - first should close
      fireEvent.click(item2Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'false');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should work with deeply nested structure', () => {
      render(
        <AccordionGroup type="multiple">
          <div>
            <div>
              <div>
                <CardAccordation trigger="Deep Item 1" value="deep-1">
                  Deep Content 1
                </CardAccordation>
              </div>
            </div>
            <CardAccordation trigger="Item 2" value="item-2">
              Content 2
            </CardAccordation>
          </div>
        </AccordionGroup>
      );

      const deepItem1Button = screen
        .getByText('Deep Item 1')
        .closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;

      // Both should be able to open in multiple mode
      fireEvent.click(deepItem1Button);
      fireEvent.click(item2Button);

      expect(deepItem1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Dynamic prop changes', () => {
    it('should update store when type changes from single to multiple', () => {
      const { rerender } = render(
        <AccordionGroup type="single">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;

      // Open first item in single mode
      fireEvent.click(item1Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'true');

      // Change to multiple mode
      rerender(
        <AccordionGroup type="multiple">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
        </AccordionGroup>
      );

      // In multiple mode, both can be open
      fireEvent.click(item2Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should enforce single mode behavior when type changes from multiple to single', async () => {
      const { rerender } = render(
        <AccordionGroup type="multiple" defaultValue={['item-1', 'item-2']}>
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
          <CardAccordation trigger="Item 3" value="item-3">
            Content 3
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;
      const item2Button = screen.getByText('Item 2').closest('button')!;
      const item3Button = screen.getByText('Item 3').closest('button')!;

      // Both should be open in multiple mode
      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
      expect(item2Button).toHaveAttribute('aria-expanded', 'true');

      // Change to single mode
      rerender(
        <AccordionGroup type="single">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
          <CardAccordation trigger="Item 2" value="item-2">
            Content 2
          </CardAccordation>
          <CardAccordation trigger="Item 3" value="item-3">
            Content 3
          </CardAccordation>
        </AccordionGroup>
      );

      // In single mode, clicking a new item should close others
      fireEvent.click(item3Button);

      await waitFor(() => {
        expect(item3Button).toHaveAttribute('aria-expanded', 'true');
      });

      // Other items should be closed
      expect(item1Button).toHaveAttribute('aria-expanded', 'false');
      expect(item2Button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update collapsible behavior when prop changes', () => {
      const { rerender } = render(
        <AccordionGroup type="single" collapsible={true} defaultValue="item-1">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
        </AccordionGroup>
      );

      const item1Button = screen.getByText('Item 1').closest('button')!;

      expect(item1Button).toHaveAttribute('aria-expanded', 'true');

      // Should be able to close when collapsible=true
      fireEvent.click(item1Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'false');

      // Change to collapsible=false
      rerender(
        <AccordionGroup type="single" collapsible={false} defaultValue="item-1">
          <CardAccordation trigger="Item 1" value="item-1">
            Content 1
          </CardAccordation>
        </AccordionGroup>
      );

      // Open it again
      fireEvent.click(item1Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'true');

      // Now should NOT be able to close when collapsible=false
      fireEvent.click(item1Button);
      expect(item1Button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
