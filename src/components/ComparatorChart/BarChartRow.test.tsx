import { render, screen, fireEvent } from '@testing-library/react';
import { BarChartRow } from './BarChartRow';
import type { LegendItem } from './Legend';

describe('BarChartRow', () => {
  const defaultItems: LegendItem[] = [
    { id: 'item-1', name: 'Item A', color: '#1E40AF' },
    { id: 'item-2', name: 'Item B', color: '#F59E0B' },
  ];

  const defaultValues = [
    { itemId: 'item-1', percentage: 75 },
    { itemId: 'item-2', percentage: 50 },
  ];

  const defaultProps = {
    label: 'Test Label',
    values: defaultValues,
    items: defaultItems,
  };

  describe('Basic Rendering', () => {
    it('should render the label', () => {
      render(<BarChartRow {...defaultProps} />);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render progress bars for each item', () => {
      const { container } = render(<BarChartRow {...defaultProps} />);

      const progressBars = container.querySelectorAll(
        '.h-full.rounded-full.transition-all'
      );
      expect(progressBars).toHaveLength(2);
    });

    it('should render bars with correct colors', () => {
      const { container } = render(<BarChartRow {...defaultProps} />);

      const progressBars = container.querySelectorAll(
        '.h-full.rounded-full.transition-all'
      );
      expect(progressBars[0]).toHaveStyle({ backgroundColor: '#1E40AF' });
      expect(progressBars[1]).toHaveStyle({ backgroundColor: '#F59E0B' });
    });

    it('should render bars with correct widths based on percentage', () => {
      const { container } = render(<BarChartRow {...defaultProps} />);

      const progressBars = container.querySelectorAll(
        '.h-full.rounded-full.transition-all'
      );
      expect(progressBars[0]).toHaveStyle({ width: '75%' });
      expect(progressBars[1]).toHaveStyle({ width: '50%' });
    });
  });

  describe('Percentage Handling', () => {
    it('should cap width at 100% for percentages over 100', () => {
      const values = [{ itemId: 'item-1', percentage: 150 }];
      const items: LegendItem[] = [
        { id: 'item-1', name: 'Item A', color: '#1E40AF' },
      ];

      const { container } = render(
        <BarChartRow label="Test" values={values} items={items} />
      );

      const progressBar = container.querySelector(
        '.h-full.rounded-full.transition-all'
      );
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should have minimum width for values greater than 0', () => {
      const values = [{ itemId: 'item-1', percentage: 1 }];
      const items: LegendItem[] = [
        { id: 'item-1', name: 'Item A', color: '#1E40AF' },
      ];

      const { container } = render(
        <BarChartRow label="Test" values={values} items={items} />
      );

      const progressBar = container.querySelector(
        '.h-full.rounded-full.transition-all'
      );
      expect(progressBar).toHaveStyle({ minWidth: '8px' });
    });

    it('should have zero minimum width for 0 percentage', () => {
      const values = [{ itemId: 'item-1', percentage: 0 }];
      const items: LegendItem[] = [
        { id: 'item-1', name: 'Item A', color: '#1E40AF' },
      ];

      const { container } = render(
        <BarChartRow label="Test" values={values} items={items} />
      );

      const progressBar = container.querySelector(
        '.h-full.rounded-full.transition-all'
      );
      expect(progressBar).toHaveStyle({ minWidth: '0px' });
    });

    it('should handle missing value for an item gracefully', () => {
      const values = [{ itemId: 'item-1', percentage: 75 }];
      const items: LegendItem[] = [
        { id: 'item-1', name: 'Item A', color: '#1E40AF' },
        { id: 'item-2', name: 'Item B', color: '#F59E0B' },
      ];

      const { container } = render(
        <BarChartRow label="Test" values={values} items={items} />
      );

      const progressBars = container.querySelectorAll(
        '.h-full.rounded-full.transition-all'
      );
      expect(progressBars[0]).toHaveStyle({ width: '75%' });
      expect(progressBars[1]).toHaveStyle({ width: '0%' });
    });
  });

  describe('Tooltip Interaction', () => {
    it('should not show tooltip by default', () => {
      render(<BarChartRow {...defaultProps} />);

      expect(screen.queryByText(/Item A:/)).not.toBeInTheDocument();
    });

    it('should show tooltip on hover', () => {
      const { container } = render(<BarChartRow {...defaultProps} />);

      const barContainers = container.querySelectorAll('.relative.group');
      fireEvent.mouseEnter(barContainers[0]);

      expect(screen.getByText(/Item A: 75\.0%/)).toBeInTheDocument();
    });

    it('should show correct item name and percentage in tooltip', () => {
      const { container } = render(<BarChartRow {...defaultProps} />);

      const barContainers = container.querySelectorAll('.relative.group');
      fireEvent.mouseEnter(barContainers[1]);

      expect(screen.getByText(/Item B: 50\.0%/)).toBeInTheDocument();
    });

    it('should hide tooltip on mouse leave', () => {
      const { container } = render(<BarChartRow {...defaultProps} />);

      const barContainers = container.querySelectorAll('.relative.group');
      fireEvent.mouseEnter(barContainers[0]);

      expect(screen.getByText(/Item A: 75\.0%/)).toBeInTheDocument();

      fireEvent.mouseLeave(barContainers[0]);

      expect(screen.queryByText(/Item A:/)).not.toBeInTheDocument();
    });

    it('should show only one tooltip at a time', () => {
      const { container } = render(<BarChartRow {...defaultProps} />);

      const barContainers = container.querySelectorAll('.relative.group');

      fireEvent.mouseEnter(barContainers[0]);
      expect(screen.getByText(/Item A: 75\.0%/)).toBeInTheDocument();

      fireEvent.mouseEnter(barContainers[1]);
      expect(screen.queryByText(/Item A:/)).not.toBeInTheDocument();
      expect(screen.getByText(/Item B: 50\.0%/)).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have label with fixed width', () => {
      render(<BarChartRow {...defaultProps} />);

      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('w-64', 'shrink-0');
    });

    it('should have flex layout', () => {
      const { container } = render(<BarChartRow {...defaultProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'items-center', 'gap-4');
    });
  });

  describe('Multiple Items', () => {
    it('should render all items in correct order', () => {
      const items: LegendItem[] = [
        { id: 'item-1', name: 'First', color: '#FF0000' },
        { id: 'item-2', name: 'Second', color: '#00FF00' },
        { id: 'item-3', name: 'Third', color: '#0000FF' },
      ];
      const values = [
        { itemId: 'item-1', percentage: 80 },
        { itemId: 'item-2', percentage: 60 },
        { itemId: 'item-3', percentage: 40 },
      ];

      const { container } = render(
        <BarChartRow label="Test" values={values} items={items} />
      );

      const progressBars = container.querySelectorAll(
        '.h-full.rounded-full.transition-all'
      );
      expect(progressBars).toHaveLength(3);
      expect(progressBars[0]).toHaveStyle({ backgroundColor: '#FF0000' });
      expect(progressBars[1]).toHaveStyle({ backgroundColor: '#00FF00' });
      expect(progressBars[2]).toHaveStyle({ backgroundColor: '#0000FF' });
    });
  });

  describe('Hover State Styling', () => {
    it('should apply opacity change when hovered', () => {
      const { container } = render(<BarChartRow {...defaultProps} />);

      const barContainers = container.querySelectorAll('.relative.group');
      const progressBar = barContainers[0].querySelector(
        '.h-full.rounded-full.transition-all'
      );

      fireEvent.mouseEnter(barContainers[0]);

      expect(progressBar).toHaveClass('opacity-90');
    });
  });
});
