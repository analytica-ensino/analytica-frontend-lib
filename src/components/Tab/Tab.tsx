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
     * Handle keyboard navigation
     */
    const handleKeyDown = (
      event: KeyboardEvent<HTMLButtonElement>,
      tabId: string
    ) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleTabClick(tabId);
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        let nextIndex = currentIndex + direction;

        // Wrap around
        if (nextIndex < 0) nextIndex = tabs.length - 1;
        if (nextIndex >= tabs.length) nextIndex = 0;

        // Skip disabled tabs
        let attempts = 0;
        while (tabs[nextIndex]?.disabled && attempts < tabs.length) {
          nextIndex += direction;
          if (nextIndex < 0) nextIndex = tabs.length - 1;
          if (nextIndex >= tabs.length) nextIndex = 0;
          attempts++;
        }

        if (!tabs[nextIndex]?.disabled && nextIndex !== currentIndex) {
          handleTabClick(tabs[nextIndex].id);
        }
      }
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
          const isDisabled = tab.disabled;

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
                ${
                  isDisabled
                    ? 'text-text-400 cursor-not-allowed opacity-50'
                    : isActive
                      ? 'text-text-950'
                      : 'text-text-700 hover:text-text-800'
                }
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
