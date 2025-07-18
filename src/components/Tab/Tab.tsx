import { forwardRef, HTMLAttributes, KeyboardEvent } from 'react';

/**
 * Individual tab item interface
 */
export interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Label text for the tab */
  label: string;
  /** Alternative label for mobile (optional) */
  mobileLabel?: string;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

/**
 * Tab component props interface
 */
export interface TabProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Array of tab items */
  tabs: TabItem[];
  /** Currently active tab ID */
  activeTab: string;
  /** Callback when tab changes */
  onTabChange: (tabId: string) => void;
  /** Size variant of the tabs */
  size?: 'small' | 'medium' | 'large';
  /** Whether to enable responsive behavior */
  responsive?: boolean;
}

/**
 * Size configuration lookup table
 */
const TAB_SIZE_CLASSES = {
  small: {
    container: 'h-10 gap-1',
    tab: 'px-3 py-2 text-sm',
    indicator: 'h-0.5',
  },
  medium: {
    container: 'h-12 gap-2',
    tab: 'px-4 py-4 text-sm',
    indicator: 'h-1',
  },
  large: {
    container: 'h-14 gap-2',
    tab: 'px-6 py-4 text-base',
    indicator: 'h-1',
  },
} as const;

/**
 * Responsive width classes for tabs
 */
const RESPONSIVE_WIDTH_CLASSES = {
  twoTabs: 'w-[115px] sm:w-[204px]',
  threeTabs: 'w-[100px] sm:w-[160px]',
  fourTabs: 'w-[80px] sm:w-[140px]',
  fiveTabs: 'w-[70px] sm:w-[120px]',
  default: 'flex-1',
} as const;

/**
 * Tab component following the established architecture patterns
 */
const Tab = forwardRef<HTMLDivElement, TabProps>(
  (
    {
      tabs,
      activeTab,
      onTabChange,
      size = 'medium',
      responsive = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeClasses = TAB_SIZE_CLASSES[size];

    /**
     * Get responsive width class based on number of tabs
     */
    const getResponsiveWidthClass = (tabCount: number): string => {
      if (!responsive) return RESPONSIVE_WIDTH_CLASSES.default;

      switch (tabCount) {
        case 2:
          return RESPONSIVE_WIDTH_CLASSES.twoTabs;
        case 3:
          return RESPONSIVE_WIDTH_CLASSES.threeTabs;
        case 4:
          return RESPONSIVE_WIDTH_CLASSES.fourTabs;
        case 5:
          return RESPONSIVE_WIDTH_CLASSES.fiveTabs;
        default:
          return RESPONSIVE_WIDTH_CLASSES.default;
      }
    };

    /**
     * Handle tab click
     */
    const handleTabClick = (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab && !tab.disabled) {
        onTabChange(tabId);
      }
    };

    /**
     * Wrap index around array bounds
     */
    const wrapAroundIndex = (index: number, maxLength: number): number => {
      if (index < 0) return maxLength - 1;
      if (index >= maxLength) return 0;
      return index;
    };

    /**
     * Find next valid (non-disabled) tab index
     */
    const findNextValidTab = (
      startIndex: number,
      direction: number
    ): number => {
      let nextIndex = wrapAroundIndex(startIndex + direction, tabs.length);
      let attempts = 0;

      while (tabs[nextIndex]?.disabled && attempts < tabs.length) {
        nextIndex = wrapAroundIndex(nextIndex + direction, tabs.length);
        attempts++;
      }

      return nextIndex;
    };

    /**
     * Handle arrow key navigation
     */
    const handleArrowNavigation = (direction: number): void => {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      const nextIndex = findNextValidTab(currentIndex, direction);

      if (!tabs[nextIndex]?.disabled && nextIndex !== currentIndex) {
        handleTabClick(tabs[nextIndex].id);
      }
    };

    /**
     * Handle keyboard navigation
     */
    const handleKeyDown = (
      event: KeyboardEvent<HTMLButtonElement>,
      tabId: string
    ) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleTabClick(tabId);
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        handleArrowNavigation(direction);
      }
    };

    /**
     * Get tab text and interaction classes based on state
     */
    const getTabClassNames = (
      isDisabled: boolean,
      isActive: boolean
    ): string => {
      if (isDisabled) {
        return 'text-text-400 cursor-not-allowed opacity-50';
      }

      if (isActive) {
        return 'text-text-950';
      }

      return 'text-text-700 hover:text-text-800';
    };

    const tabWidthClass = getResponsiveWidthClass(tabs.length);
    const containerWidth =
      responsive && tabs.length <= 2 ? 'w-[240px] sm:w-[416px]' : 'w-full';

    return (
      <div
        ref={ref}
        className={`flex flex-row items-start ${sizeClasses.container} ${containerWidth} ${className}`}
        role="tablist"
        {...props}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const isDisabled = Boolean(tab.disabled);
          const tabClassNames = getTabClassNames(isDisabled, isActive);

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              tabIndex={isActive ? 0 : -1}
              className={`
                relative flex flex-row justify-center items-center gap-2 rounded transition-colors isolate
                ${sizeClasses.tab}
                ${tabWidthClass}
                ${tabClassNames}
                ${!isDisabled && !isActive ? 'hover:bg-background-50' : ''}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
              `}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              disabled={isDisabled}
              data-testid={`tab-${tab.id}`}
            >
              <span className="font-bold leading-4 tracking-[0.2px] truncate">
                {responsive && tab.mobileLabel ? (
                  <>
                    <span className="sm:hidden">{tab.mobileLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </>
                ) : (
                  tab.label
                )}
              </span>
              {isActive && (
                <div
                  className={`absolute bottom-0 left-2 right-2 bg-primary-700 rounded-lg z-[2] ${sizeClasses.indicator}`}
                  data-testid="active-indicator"
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

Tab.displayName = 'Tab';

export default Tab;
