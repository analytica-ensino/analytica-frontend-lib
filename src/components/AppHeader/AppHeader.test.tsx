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
  getDeviceType: jest.fn((): DeviceType => 'desktop'),
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

  it('does not render calendar trigger when showCalendar is false', () => {
    render(<AppHeader {...baseProps()} />);
    // Each icon trigger contributes 2 buttons (DropdownMenuTrigger > IconButton).
    // Without calendar: notification + profile = 4 buttons total.
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('renders calendar trigger when showCalendar is true', () => {
    render(
      <AppHeader
        {...baseProps({
          showCalendar: true,
          calendarContent: <div data-testid="calendar-body">cal</div>,
        })}
      />
    );
    // Calendar + notification + profile = 6 buttons total (2 per icon).
    expect(screen.getAllByRole('button')).toHaveLength(6);
  });

  it('wraps the calendar in an lg:hidden container (visible only below 1024px)', () => {
    const { container } = render(
      <AppHeader
        {...baseProps({
          showCalendar: true,
          calendarContent: <div data-testid="calendar-body">cal</div>,
        })}
      />
    );
    const wrapper = container.querySelector('.lg\\:hidden');
    expect(wrapper).toBeInTheDocument();
    // The wrapper holds the calendar trigger button
    expect(wrapper?.querySelector('button')).toBeTruthy();
  });

  it('opens profile dropdown and displays user information', () => {
    render(<AppHeader {...baseProps()} />);
    const triggers = screen.getAllByRole('button');
    fireEvent.click(triggers.at(-1)!);
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
    fireEvent.click(triggers.at(-1)!);
    expect(screen.getByText('Maria')).toBeInTheDocument();
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
  });

  it('renders ProfileMenuInfo when showProfileInfo is true', () => {
    render(<AppHeader {...baseProps({ showProfileInfo: true })} />);
    const triggers = screen.getAllByRole('button');
    fireEvent.click(triggers.at(-1)!);
    expect(screen.getByText('Escola X')).toBeInTheDocument();
    expect(screen.getByText('3A')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('does not render ProfileMenuInfo when showProfileInfo is false', () => {
    render(<AppHeader {...baseProps()} />);
    const triggers = screen.getAllByRole('button');
    fireEvent.click(triggers.at(-1)!);
    expect(screen.queryByText('Escola X')).not.toBeInTheDocument();
  });

  it('triggers onNavigateToMyData when "Meus dados" is clicked', () => {
    const onNavigateToMyData = jest.fn();
    render(<AppHeader {...baseProps({ onNavigateToMyData })} />);
    const triggers = screen.getAllByRole('button');
    fireEvent.click(triggers.at(-1)!);
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

  it('does not render the tutorial button by default', () => {
    render(<AppHeader {...baseProps()} />);
    expect(screen.queryByText('Tutoriais')).not.toBeInTheDocument();
  });

  it('does not render the tutorial button when tutorial.visible is false', () => {
    render(
      <AppHeader
        {...baseProps({ tutorial: { visible: false, onClick: jest.fn() } })}
      />
    );
    expect(screen.queryByText('Tutoriais')).not.toBeInTheDocument();
  });

  it('renders the tutorial button with the default label when visible', () => {
    render(
      <AppHeader
        {...baseProps({ tutorial: { visible: true, onClick: jest.fn() } })}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Tutoriais' })
    ).toBeInTheDocument();
  });

  it('renders a custom tutorial label when provided', () => {
    render(
      <AppHeader
        {...baseProps({
          tutorial: { visible: true, label: 'Tutorial', onClick: jest.fn() },
        })}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Tutorial' })
    ).toBeInTheDocument();
  });

  // Regression: `text-*` inverts with the color mode while the header
  // background (`bg-primary-800`) does not, which erased the button in dark
  // mode. `primary` is the designed foreground of `primary-800` in every theme.
  it('styles the tutorial button with the on-primary foreground token', () => {
    render(
      <AppHeader
        {...baseProps({ tutorial: { visible: true, onClick: jest.fn() } })}
      />
    );
    const button = screen.getByRole('button', { name: 'Tutoriais' });
    expect(button).toHaveClass('text-primary', 'border-primary');
    expect(button).not.toHaveClass('text-text', 'border-text');
  });

  it('calls tutorial.onClick when the tutorial button is clicked', () => {
    const onClick = jest.fn();
    render(
      <AppHeader {...baseProps({ tutorial: { visible: true, onClick } })} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tutoriais' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // Regression: the tutorial pill widened the header enough to overflow narrow
  // viewports, because an <img> resolves `min-width:auto` to its intrinsic
  // width and refuses to shrink, pushing the actions off-screen.
  it('lets the logo shrink and keeps the actions from being squashed', () => {
    render(
      <AppHeader
        {...baseProps({ tutorial: { visible: true, onClick: jest.fn() } })}
      />
    );
    const logo = screen.getByAltText('Logo');
    expect(logo).toHaveClass('min-w-0', 'shrink');

    const section = logo.parentElement?.querySelector('section');
    expect(section).toHaveClass('shrink-0');
    // A gap on the row guarantees the logo never touches the tutorial pill.
    expect(logo.parentElement).toHaveClass('gap-3');
  });
});
