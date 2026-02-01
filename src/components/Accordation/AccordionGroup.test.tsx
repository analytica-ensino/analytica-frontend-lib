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

  describe('Nested AccordionGroups', () => {
    it('should allow independent control of nested AccordionGroups', () => {
      render(
        <AccordionGroup type="single" data-testid="outer-group">
          <CardAccordation trigger="Activity 1" value="activity-1">
            <AccordionGroup type="multiple" data-testid="inner-group">
              <CardAccordation trigger="Question 1" value="question-1">
                Question 1 Content
              </CardAccordation>
              <CardAccordation trigger="Question 2" value="question-2">
                Question 2 Content
              </CardAccordation>
            </AccordionGroup>
          </CardAccordation>
          <CardAccordation trigger="Activity 2" value="activity-2">
            Activity 2 Content
          </CardAccordation>
        </AccordionGroup>
      );

      const activity1Button = screen.getByText('Activity 1').closest('button')!;
      const activity2Button = screen.getByText('Activity 2').closest('button')!;

      // Open activity 1
      fireEvent.click(activity1Button);
      expect(activity1Button).toHaveAttribute('aria-expanded', 'true');

      // Now the questions should be visible
      const question1Button = screen.getByText('Question 1').closest('button')!;
      const question2Button = screen.getByText('Question 2').closest('button')!;

      // Open question 1 - should NOT close activity 1
      fireEvent.click(question1Button);
      expect(question1Button).toHaveAttribute('aria-expanded', 'true');
      expect(activity1Button).toHaveAttribute('aria-expanded', 'true');

      // Open question 2 - should keep question 1 open (multiple mode)
      fireEvent.click(question2Button);
      expect(question1Button).toHaveAttribute('aria-expanded', 'true');
      expect(question2Button).toHaveAttribute('aria-expanded', 'true');
      expect(activity1Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should not affect parent accordion when clicking nested accordion', () => {
      render(
        <AccordionGroup type="single">
          <CardAccordation trigger="Parent 1" value="parent-1">
            <AccordionGroup type="single">
              <CardAccordation trigger="Child 1" value="child-1">
                Child 1 Content
              </CardAccordation>
              <CardAccordation trigger="Child 2" value="child-2">
                Child 2 Content
              </CardAccordation>
            </AccordionGroup>
          </CardAccordation>
          <CardAccordation trigger="Parent 2" value="parent-2">
            Parent 2 Content
          </CardAccordation>
        </AccordionGroup>
      );

      const parent1Button = screen.getByText('Parent 1').closest('button')!;

      // Open parent 1
      fireEvent.click(parent1Button);
      expect(parent1Button).toHaveAttribute('aria-expanded', 'true');

      // Now click child accordions
      const child1Button = screen.getByText('Child 1').closest('button')!;
      const child2Button = screen.getByText('Child 2').closest('button')!;

      // Open child 1 - parent should stay open
      fireEvent.click(child1Button);
      expect(child1Button).toHaveAttribute('aria-expanded', 'true');
      expect(parent1Button).toHaveAttribute('aria-expanded', 'true');

      // Open child 2 - child 1 should close (single mode), parent should stay open
      fireEvent.click(child2Button);
      expect(child1Button).toHaveAttribute('aria-expanded', 'false');
      expect(child2Button).toHaveAttribute('aria-expanded', 'true');
      expect(parent1Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should handle deeply nested AccordionGroups independently', () => {
      render(
        <AccordionGroup type="single">
          <CardAccordation trigger="Level 1" value="level-1">
            <AccordionGroup type="single">
              <CardAccordation trigger="Level 2" value="level-2">
                <AccordionGroup type="multiple">
                  <CardAccordation trigger="Level 3A" value="level-3a">
                    Level 3A Content
                  </CardAccordation>
                  <CardAccordation trigger="Level 3B" value="level-3b">
                    Level 3B Content
                  </CardAccordation>
                </AccordionGroup>
              </CardAccordation>
            </AccordionGroup>
          </CardAccordation>
        </AccordionGroup>
      );

      // Open all levels
      const level1Button = screen.getByText('Level 1').closest('button')!;
      fireEvent.click(level1Button);
      expect(level1Button).toHaveAttribute('aria-expanded', 'true');

      const level2Button = screen.getByText('Level 2').closest('button')!;
      fireEvent.click(level2Button);
      expect(level2Button).toHaveAttribute('aria-expanded', 'true');
      expect(level1Button).toHaveAttribute('aria-expanded', 'true');

      const level3aButton = screen.getByText('Level 3A').closest('button')!;
      const level3bButton = screen.getByText('Level 3B').closest('button')!;

      // Open both level 3 items (multiple mode)
      fireEvent.click(level3aButton);
      fireEvent.click(level3bButton);

      // All should be expanded
      expect(level3aButton).toHaveAttribute('aria-expanded', 'true');
      expect(level3bButton).toHaveAttribute('aria-expanded', 'true');
      expect(level2Button).toHaveAttribute('aria-expanded', 'true');
      expect(level1Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should maintain separate onValueChange handlers for nested groups', () => {
      const outerOnValueChange = jest.fn();
      const innerOnValueChange = jest.fn();

      render(
        <AccordionGroup type="single" onValueChange={outerOnValueChange}>
          <CardAccordation trigger="Outer 1" value="outer-1">
            <AccordionGroup type="multiple" onValueChange={innerOnValueChange}>
              <CardAccordation trigger="Inner 1" value="inner-1">
                Inner 1 Content
              </CardAccordation>
            </AccordionGroup>
          </CardAccordation>
        </AccordionGroup>
      );

      const outer1Button = screen.getByText('Outer 1').closest('button')!;

      // Click outer accordion
      fireEvent.click(outer1Button);
      expect(outerOnValueChange).toHaveBeenCalledWith('outer-1');
      expect(innerOnValueChange).not.toHaveBeenCalled();

      // Click inner accordion
      const inner1Button = screen.getByText('Inner 1').closest('button')!;
      fireEvent.click(inner1Button);
      expect(innerOnValueChange).toHaveBeenCalledWith(['inner-1']);
      // Outer should not be called again
      expect(outerOnValueChange).toHaveBeenCalledTimes(1);
    });
  });
});
