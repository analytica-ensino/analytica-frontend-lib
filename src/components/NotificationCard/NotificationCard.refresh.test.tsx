import { render, screen, act } from '@testing-library/react';
import NotificationCard, { NotificationGroup } from './NotificationCard';
import { NotificationEntityType } from '../../types/notifications';
import { DeviceType, useMobile } from '../../hooks/useMobile';

jest.mock(
  '../../assets/img/no-notification-result.png',
  () => 'test-file-stub'
);

jest.mock('../../hooks/useMobile');
const mockUseMobile = useMobile as jest.MockedFunction<typeof useMobile>;

const makeUseMobileMock = (
  overrides?: Partial<ReturnType<typeof useMobile>>
): ReturnType<typeof useMobile> => ({
  isMobile: false,
  isTablet: false,
  isSmallMobile: false,
  isExtraSmallMobile: false,
  isUltraSmallMobile: false,
  isTinyMobile: false,
  getFormContainerClasses: jest.fn(() => ''),
  getHeaderClasses: jest.fn(() => ''),
  getMobileHeaderClasses: jest.fn(() => ''),
  getDesktopHeaderClasses: jest.fn(() => ''),
  getVideoContainerClasses: jest.fn(() => ''),
  getDeviceType: jest.fn(() => 'desktop' as DeviceType),
  ...overrides,
});

const mockGroupedNotifications: NotificationGroup[] = [
  {
    label: 'Hoje',
    notifications: [
      {
        id: '1',
        title: 'Test Notification 1',
        message: 'Test message 1',
        type: 'ACTIVITY' as const,
        isRead: false,
        entityType: NotificationEntityType.ACTIVITY,
        entityId: 'act-1',
        createdAt: new Date(),
      },
    ],
  },
];

describe('NotificationCenter auto-refresh (polling)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseMobile.mockReturnValue(makeUseMobileMock());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('polls onFetchNotifications while the center is open', () => {
    const onFetchNotifications = jest.fn();
    render(
      <NotificationCard
        mode="center"
        isActive
        groupedNotifications={mockGroupedNotifications}
        onFetchNotifications={onFetchNotifications}
        refreshIntervalMs={1000}
      />
    );

    // Initial fetch on open
    expect(onFetchNotifications).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onFetchNotifications).toHaveBeenCalledTimes(2);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onFetchNotifications).toHaveBeenCalledTimes(3);
  });

  it('does not poll while the center is closed', () => {
    const onFetchNotifications = jest.fn();
    render(
      <NotificationCard
        mode="center"
        isActive={false}
        groupedNotifications={mockGroupedNotifications}
        onFetchNotifications={onFetchNotifications}
        refreshIntervalMs={1000}
      />
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(onFetchNotifications).not.toHaveBeenCalled();
  });

  it('stops polling when the center closes', () => {
    const onFetchNotifications = jest.fn();
    const { rerender } = render(
      <NotificationCard
        mode="center"
        isActive
        groupedNotifications={mockGroupedNotifications}
        onFetchNotifications={onFetchNotifications}
        refreshIntervalMs={1000}
      />
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onFetchNotifications).toHaveBeenCalledTimes(2);

    rerender(
      <NotificationCard
        mode="center"
        isActive={false}
        groupedNotifications={mockGroupedNotifications}
        onFetchNotifications={onFetchNotifications}
        refreshIntervalMs={1000}
      />
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    // No further calls after closing
    expect(onFetchNotifications).toHaveBeenCalledTimes(2);
  });

  it('does not poll when refreshIntervalMs is 0', () => {
    const onFetchNotifications = jest.fn();
    render(
      <NotificationCard
        mode="center"
        isActive
        groupedNotifications={mockGroupedNotifications}
        onFetchNotifications={onFetchNotifications}
        refreshIntervalMs={0}
      />
    );

    // Only the initial open fetch
    expect(onFetchNotifications).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(60000);
    });
    expect(onFetchNotifications).toHaveBeenCalledTimes(1);
  });
});

describe('NotificationList loading gate (no skeleton flash on refresh)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMobile.mockReturnValue(makeUseMobileMock());
  });

  it('shows the skeleton only when loading with no notifications yet', () => {
    render(<NotificationCard mode="list" loading groupedNotifications={[]} />);
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
  });

  it('keeps the list visible (no skeleton) when refreshing with items', () => {
    render(
      <NotificationCard
        mode="list"
        loading
        groupedNotifications={mockGroupedNotifications}
      />
    );

    expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
    expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
  });
});
