import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppHeader, AppHeaderProps } from './AppHeader';
import { DeviceType, useMobile } from '../../hooks/useMobile';

jest.mock(
  '../../assets/img/no-notification-result.png',
  () => 'test-file-stub'
);
jest.mock('../../hooks/useMobile');
jest.mock('../../hooks/useBrandingLogo', () => ({
  useBrandingLogo: () => 'data:image/png;base64,stub',
  BrandingLogoVariant: { main: 'main', internal: 'internal' },
}));

const mockUseMobile = useMobile as jest.MockedFunction<typeof useMobile>;

/**
 * Factory helper to create useMobile mock with consistent shape
 */
const makeUseMobileMock = (
  overrides?: Partial<ReturnType<typeof useMobile>>
) => ({
  isMobile: false,
  isTablet: false,
  isSmallMobile: false,
  isExtraSmallMobile: false,
  isUltraSmallMobile: false,
  isTinyMobile: false,
  getFormContainerClasses: jest.fn(() => 'w-full max-w-[992px] mx-auto px-0'),
  getHeaderClasses: jest.fn(
    () => 'flex flex-row justify-between items-center gap-6 mb-8'
  ),
  getMobileHeaderClasses: jest.fn(() => 'flex flex-col items-start gap-4 mb-6'),
  getDesktopHeaderClasses: jest.fn(
    () => 'flex flex-row justify-between items-center gap-6 mb-8'
  ),
  getVideoContainerClasses: jest.fn(() => 'aspect-video'),
  getDeviceType: jest.fn(() => 'desktop' as DeviceType),
  ...overrides,
});

const makeNotifications = (): AppHeaderProps['notifications'] => ({
  unreadCount: 0,
  loading: false,
  error: null,
  groupedNotifications: [],
  refreshNotifications: jest.fn(),
  markAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  fetchNotifications: jest.fn(),
  getActionLabel: jest.fn(() => undefined),
});

const baseProps = (overrides?: Partial<AppHeaderProps>): AppHeaderProps => ({
  user: { name: 'Maria', email: 'maria@example.com' },
  sessionInfo: {
    userName: 'Maria Session',
    email: 'maria.session@example.com',
    schoolName: 'Escola X',
    className: '3A',
    schoolYearName: '2026',
  },
  notifications: makeNotifications(),
  onLogout: jest.fn(),
  onNavigateToMyData: jest.fn(),
  onNavigateByNotification: jest.fn(),
  ...overrides,
});

describe('AppHeader', () => {
  beforeEach(() => {
    mockUseMobile.mockReturnValue(makeUseMobileMock());
  });

  it('renders branding logo and at least notification + profile triggers', () => {
    render(<AppHeader {...baseProps()} />);
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    // notification trigger + profile trigger (no calendar by default)
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
  });

  it('does not render calendar dropdown when showCalendar is false', () => {
    render(<AppHeader {...baseProps()} />);
    expect(
      document.querySelector('[data-component="AppHeader"] .lg\\:hidden')
    ).toBeNull();
  });

  it('renders calendar dropdown when showCalendar is true', () => {
    render(
      <AppHeader
        {...baseProps({
          showCalendar: true,
          calendarContent: <div data-testid="calendar-body">cal</div>,
        })}
      />
    );
    expect(
      document.querySelector('[data-component="AppHeader"] .lg\\:hidden')
    ).not.toBeNull();
  });

  it('opens profile dropdown and displays user information', () => {
    render(<AppHeader {...baseProps()} />);
    const triggers = screen.getAllByRole('button');
    fireEvent.click(triggers[triggers.length - 1]);
    expect(screen.getByText('Maria Session')).toBeInTheDocument();
    expect(screen.getByText('maria.session@example.com')).toBeInTheDocument();
  });

  it('falls back to user.name/email when sessionInfo lacks them', () => {
    render(
      <AppHeader
        {...baseProps({
          sessionInfo: { schoolName: '', className: '', schoolYearName: '' },
        })}
      />
    );
    const triggers = screen.getAllByRole('button');
    fireEvent.click(triggers[triggers.length - 1]);
    expect(screen.getByText('Maria')).toBeInTheDocument();
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
  });

  it('renders ProfileMenuInfo when showProfileInfo is true', () => {
    render(<AppHeader {...baseProps({ showProfileInfo: true })} />);
    const triggers = screen.getAllByRole('button');
    fireEvent.click(triggers[triggers.length - 1]);
    expect(screen.getByText('Escola X')).toBeInTheDocument();
    expect(screen.getByText('3A')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('does not render ProfileMenuInfo when showProfileInfo is false', () => {
    render(<AppHeader {...baseProps()} />);
    const triggers = screen.getAllByRole('button');
    fireEvent.click(triggers[triggers.length - 1]);
    expect(screen.queryByText('Escola X')).not.toBeInTheDocument();
  });

  it('triggers onNavigateToMyData when "Meus dados" is clicked', () => {
    const onNavigateToMyData = jest.fn();
    render(<AppHeader {...baseProps({ onNavigateToMyData })} />);
    const triggers = screen.getAllByRole('button');
    fireEvent.click(triggers[triggers.length - 1]);
    fireEvent.click(screen.getByText('Meus dados'));
    expect(onNavigateToMyData).toHaveBeenCalledTimes(1);
  });

  it('registers and removes a keydown listener for Escape', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    const { unmount } = render(<AppHeader {...baseProps()} />);
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('Escape key handler does not throw when invoked', () => {
    render(<AppHeader {...baseProps()} />);
    expect(() => fireEvent.keyDown(document, { key: 'Escape' })).not.toThrow();
  });

  it('applies compact spacing and smaller logo when isMobile', () => {
    mockUseMobile.mockReturnValue(
      makeUseMobileMock({ isMobile: true, isTablet: true })
    );
    render(<AppHeader {...baseProps()} />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toHaveClass('h-8');
    const section = logo.parentElement?.querySelector('section');
    expect(section).toHaveClass('gap-2');
  });

  it('applies desktop spacing and larger logo when not mobile', () => {
    render(<AppHeader {...baseProps()} />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toHaveClass('h-10');
    const section = logo.parentElement?.querySelector('section');
    expect(section).toHaveClass('gap-3');
  });

  it('uses default empty-state texts for notifications when not overridden', () => {
    // Smoke test: just ensure prop passes through without throwing
    render(
      <AppHeader
        {...baseProps({
          emptyNotificationsTitle: undefined,
          emptyNotificationsDescription: undefined,
        })}
      />
    );
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });
});
