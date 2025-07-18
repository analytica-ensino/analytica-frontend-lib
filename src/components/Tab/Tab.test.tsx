import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tab, { TabItem } from './Tab';

describe('Tab', () => {
  const mockTabs: TabItem[] = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3' },
  ];

  const mockTabsWithMobileLabels: TabItem[] = [
    { id: 'create', label: 'Criar Simulado', mobileLabel: 'Criar' },
    { id: 'history', label: 'Histórico', mobileLabel: 'Histórico' },
  ];

  const mockTabsWithDisabled: TabItem[] = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2', disabled: true },
    { id: 'tab3', label: 'Tab 3' },
  ];

  const defaultProps = {
    tabs: mockTabs,
    activeTab: 'tab1',
    onTabChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render all tabs', () => {
      render(<Tab {...defaultProps} />);

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('should have correct ARIA attributes', () => {
      render(<Tab {...defaultProps} />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);

      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    });

    it('should show active indicator for active tab', () => {
      render(<Tab {...defaultProps} />);

      const activeIndicator = screen.getByTestId('active-indicator');
      expect(activeIndicator).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Tab
          {...defaultProps}
          className="custom-class"
          data-testid="tab-container"
        />
      );

      const container = screen.getByTestId('tab-container');
      expect(container).toHaveClass('custom-class');
    });

    it('should forward ref correctly', () => {
      const ref = jest.fn();
      render(<Tab {...defaultProps} ref={ref} />);

      expect(ref).toHaveBeenCalled();
    });

    it('should have correct data-testid for each tab', () => {
      render(<Tab {...defaultProps} />);

      expect(screen.getByTestId('tab-tab1')).toBeInTheDocument();
      expect(screen.getByTestId('tab-tab2')).toBeInTheDocument();
      expect(screen.getByTestId('tab-tab3')).toBeInTheDocument();
    });
  });

  describe('Tab Interaction', () => {
    it('should call onTabChange when tab is clicked', () => {
      const onTabChange = jest.fn();
      render(<Tab {...defaultProps} onTabChange={onTabChange} />);

      fireEvent.click(screen.getByTestId('tab-tab2'));
      expect(onTabChange).toHaveBeenCalledWith('tab2');
    });

    it('should call onTabChange when active tab is clicked', () => {
      const onTabChange = jest.fn();
      render(<Tab {...defaultProps} onTabChange={onTabChange} />);

      fireEvent.click(screen.getByTestId('tab-tab1'));
      expect(onTabChange).toHaveBeenCalledWith('tab1');
    });

    it('should handle Enter key press', () => {
      const onTabChange = jest.fn();
      render(<Tab {...defaultProps} onTabChange={onTabChange} />);

      const tab2 = screen.getByTestId('tab-tab2');
      fireEvent.keyDown(tab2, { key: 'Enter' });
      expect(onTabChange).toHaveBeenCalledWith('tab2');
    });

    it('should handle Space key press', () => {
      const onTabChange = jest.fn();
      render(<Tab {...defaultProps} onTabChange={onTabChange} />);

      const tab2 = screen.getByTestId('tab-tab2');
      fireEvent.keyDown(tab2, { key: ' ' });
      expect(onTabChange).toHaveBeenCalledWith('tab2');
    });

    it('should handle ArrowRight key navigation', () => {
      const onTabChange = jest.fn();
      render(<Tab {...defaultProps} onTabChange={onTabChange} />);

      const tab1 = screen.getByTestId('tab-tab1');
      fireEvent.keyDown(tab1, { key: 'ArrowRight' });
      expect(onTabChange).toHaveBeenCalledWith('tab2');
    });

    it('should handle ArrowLeft key navigation', () => {
      const onTabChange = jest.fn();
      render(
        <Tab {...defaultProps} activeTab="tab2" onTabChange={onTabChange} />
      );

      const tab2 = screen.getByTestId('tab-tab2');
      fireEvent.keyDown(tab2, { key: 'ArrowLeft' });
      expect(onTabChange).toHaveBeenCalledWith('tab1');
    });

    it('should wrap around with ArrowRight on last tab', () => {
      const onTabChange = jest.fn();
      render(
        <Tab {...defaultProps} activeTab="tab3" onTabChange={onTabChange} />
      );

      const tab3 = screen.getByTestId('tab-tab3');
      fireEvent.keyDown(tab3, { key: 'ArrowRight' });
      expect(onTabChange).toHaveBeenCalledWith('tab1');
    });

    it('should wrap around with ArrowLeft on first tab', () => {
      const onTabChange = jest.fn();
      render(<Tab {...defaultProps} onTabChange={onTabChange} />);

      const tab1 = screen.getByTestId('tab-tab1');
      fireEvent.keyDown(tab1, { key: 'ArrowLeft' });
      expect(onTabChange).toHaveBeenCalledWith('tab3');
    });

    it('should not handle other keys', () => {
      const onTabChange = jest.fn();
      render(<Tab {...defaultProps} onTabChange={onTabChange} />);

      const tab1 = screen.getByTestId('tab-tab1');
      fireEvent.keyDown(tab1, { key: 'a' });
      expect(onTabChange).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should render disabled tabs correctly', () => {
      render(<Tab {...defaultProps} tabs={mockTabsWithDisabled} />);

      const disabledTab = screen.getByTestId('tab-tab2');
      expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
      expect(disabledTab).toBeDisabled();
      expect(disabledTab).toHaveClass(
        'text-text-400',
        'cursor-not-allowed',
        'opacity-50'
      );
    });

    it('should not call onTabChange when disabled tab is clicked', () => {
      const onTabChange = jest.fn();
      render(
        <Tab
          {...defaultProps}
          tabs={mockTabsWithDisabled}
          onTabChange={onTabChange}
        />
      );

      const disabledTab = screen.getByTestId('tab-tab2');
      fireEvent.click(disabledTab);
      expect(onTabChange).not.toHaveBeenCalled();
    });

    it('should skip disabled tabs with keyboard navigation', () => {
      const onTabChange = jest.fn();
      render(
        <Tab
          {...defaultProps}
          tabs={mockTabsWithDisabled}
          onTabChange={onTabChange}
        />
      );

      const tab1 = screen.getByTestId('tab-tab1');
      fireEvent.keyDown(tab1, { key: 'ArrowRight' });
      expect(onTabChange).toHaveBeenCalledWith('tab3'); // Should skip disabled tab2
    });

    it('should skip disabled tabs with ArrowLeft navigation', () => {
      const onTabChange = jest.fn();
      render(
        <Tab
          {...defaultProps}
          tabs={mockTabsWithDisabled}
          activeTab="tab3"
          onTabChange={onTabChange}
        />
      );

      const tab3 = screen.getByTestId('tab-tab3');
      fireEvent.keyDown(tab3, { key: 'ArrowLeft' });
      expect(onTabChange).toHaveBeenCalledWith('tab1'); // Should skip disabled tab2
    });

    it('should handle case where all other tabs are disabled', () => {
      const allDisabledExceptCurrent: TabItem[] = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2', disabled: true },
        { id: 'tab3', label: 'Tab 3', disabled: true },
      ];
      const onTabChange = jest.fn();
      render(
        <Tab
          {...defaultProps}
          tabs={allDisabledExceptCurrent}
          onTabChange={onTabChange}
        />
      );

      const tab1 = screen.getByTestId('tab-tab1');
      fireEvent.keyDown(tab1, { key: 'ArrowRight' });
      expect(onTabChange).not.toHaveBeenCalled();
    });

    it('should handle navigation with disabled tabs at the beginning when going left', () => {
      const tabsWithDisabledFirst: TabItem[] = [
        { id: 'tab1', label: 'Tab 1', disabled: true },
        { id: 'tab2', label: 'Tab 2', disabled: true },
        { id: 'tab3', label: 'Tab 3' },
      ];
      const onTabChange = jest.fn();
      render(
        <Tab
          {...defaultProps}
          tabs={tabsWithDisabledFirst}
          activeTab="tab3"
          onTabChange={onTabChange}
        />
      );

      const tab3 = screen.getByTestId('tab-tab3');
      fireEvent.keyDown(tab3, { key: 'ArrowLeft' });
      // Should wrap around and stay on tab3 since tab1 and tab2 are disabled
      expect(onTabChange).not.toHaveBeenCalled();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size classes', () => {
      render(
        <Tab {...defaultProps} size="small" data-testid="tab-container" />
      );

      const container = screen.getByTestId('tab-container');
      expect(container).toHaveClass('h-10', 'gap-1');

      const firstTab = screen.getByTestId('tab-tab1');
      expect(firstTab).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('should apply medium size classes (default)', () => {
      render(<Tab {...defaultProps} data-testid="tab-container" />);

      const container = screen.getByTestId('tab-container');
      expect(container).toHaveClass('h-12', 'gap-2');

      const firstTab = screen.getByTestId('tab-tab1');
      expect(firstTab).toHaveClass('px-4', 'py-4', 'text-sm');
    });

    it('should apply large size classes', () => {
      render(
        <Tab {...defaultProps} size="large" data-testid="tab-container" />
      );

      const container = screen.getByTestId('tab-container');
      expect(container).toHaveClass('h-14', 'gap-2');

      const firstTab = screen.getByTestId('tab-tab1');
      expect(firstTab).toHaveClass('px-6', 'py-4', 'text-base');
    });

    it('should show correct indicator height for each size', () => {
      const { rerender } = render(<Tab {...defaultProps} size="small" />);
      let indicator = screen.getByTestId('active-indicator');
      expect(indicator).toHaveClass('h-0.5');

      rerender(<Tab {...defaultProps} size="medium" />);
      indicator = screen.getByTestId('active-indicator');
      expect(indicator).toHaveClass('h-1');

      rerender(<Tab {...defaultProps} size="large" />);
      indicator = screen.getByTestId('active-indicator');
      expect(indicator).toHaveClass('h-1');
    });
  });

  describe('Responsive Behavior', () => {
    it('should show mobile labels when responsive and mobileLabel is provided', () => {
      render(
        <Tab
          {...defaultProps}
          tabs={mockTabsWithMobileLabels}
          responsive={true}
        />
      );

      // Should show both mobile and desktop versions in the DOM
      expect(screen.getByText('Criar')).toBeInTheDocument();
      expect(screen.getByText('Criar Simulado')).toBeInTheDocument();
      expect(screen.getAllByText('Histórico')).toHaveLength(2); // Both mobile and desktop
    });

    it('should show only main label when no mobileLabel is provided', () => {
      render(<Tab {...defaultProps} responsive={true} />);

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('should show only main label when responsive is false', () => {
      render(
        <Tab
          {...defaultProps}
          tabs={mockTabsWithMobileLabels}
          responsive={false}
        />
      );

      expect(screen.getByText('Criar Simulado')).toBeInTheDocument();
      expect(screen.getByText('Histórico')).toBeInTheDocument();
      expect(screen.queryByText('Criar')).not.toBeInTheDocument();
    });

    it('should apply responsive width classes for 2 tabs', () => {
      render(
        <Tab
          {...defaultProps}
          tabs={mockTabsWithMobileLabels}
          responsive={true}
          data-testid="tab-container"
        />
      );

      const container = screen.getByTestId('tab-container');
      expect(container).toHaveClass('w-[240px]', 'sm:w-[416px]');

      const firstTab = screen.getByTestId('tab-create');
      expect(firstTab).toHaveClass('w-[115px]', 'sm:w-[204px]');
    });

    it('should apply different width classes for 3 tabs', () => {
      render(<Tab {...defaultProps} responsive={true} />);

      const firstTab = screen.getByTestId('tab-tab1');
      expect(firstTab).toHaveClass('w-[100px]', 'sm:w-[160px]');
    });

    it('should apply different width classes for 4 tabs', () => {
      const fourTabs: TabItem[] = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
        { id: 'tab3', label: 'Tab 3' },
        { id: 'tab4', label: 'Tab 4' },
      ];
      render(<Tab {...defaultProps} tabs={fourTabs} responsive={true} />);

      const firstTab = screen.getByTestId('tab-tab1');
      expect(firstTab).toHaveClass('w-[80px]', 'sm:w-[140px]');
    });

    it('should apply different width classes for 5 tabs', () => {
      const fiveTabs: TabItem[] = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
        { id: 'tab3', label: 'Tab 3' },
        { id: 'tab4', label: 'Tab 4' },
        { id: 'tab5', label: 'Tab 5' },
      ];
      render(<Tab {...defaultProps} tabs={fiveTabs} responsive={true} />);

      const firstTab = screen.getByTestId('tab-tab1');
      expect(firstTab).toHaveClass('w-[70px]', 'sm:w-[120px]');
    });

    it('should apply flex-1 width class for more than 5 tabs', () => {
      const sixTabs: TabItem[] = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
        { id: 'tab3', label: 'Tab 3' },
        { id: 'tab4', label: 'Tab 4' },
        { id: 'tab5', label: 'Tab 5' },
        { id: 'tab6', label: 'Tab 6' },
      ];
      render(<Tab {...defaultProps} tabs={sixTabs} responsive={true} />);

      const firstTab = screen.getByTestId('tab-tab1');
      expect(firstTab).toHaveClass('flex-1');
    });

    it('should apply flex-1 width class when responsive is false', () => {
      render(<Tab {...defaultProps} responsive={false} />);

      const firstTab = screen.getByTestId('tab-tab1');
      expect(firstTab).toHaveClass('flex-1');
    });

    it('should apply w-full for container when responsive is false', () => {
      render(
        <Tab {...defaultProps} responsive={false} data-testid="tab-container" />
      );

      const container = screen.getByTestId('tab-container');
      expect(container).toHaveClass('w-full');
    });

    it('should apply w-full for container when more than 2 tabs', () => {
      render(
        <Tab {...defaultProps} responsive={true} data-testid="tab-container" />
      );

      const container = screen.getByTestId('tab-container');
      expect(container).toHaveClass('w-full');
    });
  });

  describe('Focus Management', () => {
    it('should set correct tabIndex for active and inactive tabs', () => {
      render(<Tab {...defaultProps} />);

      const activeTab = screen.getByTestId('tab-tab1');
      const inactiveTab1 = screen.getByTestId('tab-tab2');
      const inactiveTab2 = screen.getByTestId('tab-tab3');

      expect(activeTab).toHaveAttribute('tabindex', '0');
      expect(inactiveTab1).toHaveAttribute('tabindex', '-1');
      expect(inactiveTab2).toHaveAttribute('tabindex', '-1');
    });

    it('should update tabIndex when active tab changes', () => {
      const { rerender } = render(<Tab {...defaultProps} />);

      let activeTab = screen.getByTestId('tab-tab1');
      let inactiveTab = screen.getByTestId('tab-tab2');

      expect(activeTab).toHaveAttribute('tabindex', '0');
      expect(inactiveTab).toHaveAttribute('tabindex', '-1');

      rerender(<Tab {...defaultProps} activeTab="tab2" />);

      activeTab = screen.getByTestId('tab-tab1');
      inactiveTab = screen.getByTestId('tab-tab2');

      expect(activeTab).toHaveAttribute('tabindex', '-1');
      expect(inactiveTab).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Hover and Focus States', () => {
    it('should apply hover classes to non-active, non-disabled tabs', () => {
      render(<Tab {...defaultProps} />);

      const inactiveTab = screen.getByTestId('tab-tab2');
      expect(inactiveTab).toHaveClass(
        'hover:text-text-800',
        'hover:bg-background-50'
      );
    });

    it('should apply focus-visible classes', () => {
      render(<Tab {...defaultProps} />);

      const tab = screen.getByTestId('tab-tab1');
      expect(tab).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-primary-500'
      );
    });

    it('should not apply hover classes to active tab', () => {
      render(<Tab {...defaultProps} />);

      const activeTab = screen.getByTestId('tab-tab1');
      expect(activeTab).toHaveClass('text-text-950');
      expect(activeTab).not.toHaveClass('hover:text-text-800');
    });

    it('should not apply hover classes to disabled tab', () => {
      render(<Tab {...defaultProps} tabs={mockTabsWithDisabled} />);

      const disabledTab = screen.getByTestId('tab-tab2');
      expect(disabledTab).not.toHaveClass('hover:text-text-800');
      expect(disabledTab).not.toHaveClass('hover:bg-background-50');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tabs array', () => {
      render(<Tab {...defaultProps} tabs={[]} />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
      expect(screen.queryAllByRole('tab')).toHaveLength(0);
    });

    it('should handle activeTab that does not exist in tabs', () => {
      render(<Tab {...defaultProps} activeTab="nonexistent" />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected', 'false');
      });

      expect(screen.queryByTestId('active-indicator')).not.toBeInTheDocument();
    });

    it('should handle single tab', () => {
      const singleTab: TabItem[] = [{ id: 'only', label: 'Only Tab' }];
      render(<Tab {...defaultProps} tabs={singleTab} activeTab="only" />);

      expect(screen.getByText('Only Tab')).toBeInTheDocument();
      expect(screen.getByTestId('active-indicator')).toBeInTheDocument();
    });

    it('should call tab change handlers for keyboard events', () => {
      const onTabChange = jest.fn();
      render(<Tab {...defaultProps} onTabChange={onTabChange} />);

      const tab2 = screen.getByTestId('tab-tab2');
      const tab1 = screen.getByTestId('tab-tab1');

      // Test Enter key
      fireEvent.keyDown(tab2, { key: 'Enter' });
      expect(onTabChange).toHaveBeenCalledWith('tab2');

      onTabChange.mockClear();

      // Test Space key
      fireEvent.keyDown(tab2, { key: ' ' });
      expect(onTabChange).toHaveBeenCalledWith('tab2');

      onTabChange.mockClear();

      // Test Arrow keys work for navigation
      fireEvent.keyDown(tab1, { key: 'ArrowRight' });
      expect(onTabChange).toHaveBeenCalledWith('tab2');

      onTabChange.mockClear();

      fireEvent.keyDown(tab1, { key: 'ArrowLeft' });
      expect(onTabChange).toHaveBeenCalledWith('tab3');
    });
  });
});
