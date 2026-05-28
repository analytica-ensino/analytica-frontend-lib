import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { CaretRight, User } from 'phosphor-react';

import { BrandingLogo } from '../BrandingLogo/BrandingLogo';
import CalendarCard from '../CalendarCard/CalendarCard';
import IconButton from '../IconButton/IconButton';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ProfileMenuFooter,
  ProfileMenuHeader,
  ProfileMenuInfo,
  ProfileMenuSection,
  ProfileToggleTheme,
} from '../DropdownMenu/DropdownMenu';
import NotificationCard, {
  type NotificationGroup,
} from '../NotificationCard/NotificationCard';
import { PageContainer } from '../PageContainer/PageContainer';
import Text from '../Text/Text';
import { UserIcon } from '../UserIcon/UserIcon';
import { useMobile } from '../../hooks/useMobile';
import { syncDropdownState } from '../../utils/dropdown';
import { NotificationEntityType } from '../../types/notifications';

/**
 * Subset of session info consumed by the application header.
 * Each property is optional so the consumer can pass whatever it has.
 */
export interface AppHeaderSessionInfo {
  userName?: string;
  email?: string;
  urlProfilePicture?: string;
  schoolName?: string;
  className?: string;
  schoolYearName?: string;
}

/**
 * Minimal user shape needed to fill the profile dropdown header.
 */
export interface AppHeaderUser {
  name?: string;
  email?: string;
}

/**
 * Notifications data + callbacks the AppHeader forwards to NotificationCard.
 * Built by the consumer (usually via `createNotificationsHook(api)`).
 */
export interface AppHeaderNotifications {
  unreadCount: number;
  loading: boolean;
  error: string | null;
  groupedNotifications: NotificationGroup[];
  refreshNotifications: () => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  fetchNotifications: () => void;
  getActionLabel: (entityType?: NotificationEntityType) => string | undefined;
}

export interface AppHeaderProps {
  /** Authenticated user (fallback when sessionInfo doesn't carry name/email). */
  user?: AppHeaderUser;
  /** Session metadata used to render profile name, email, photo and school info. */
  sessionInfo?: AppHeaderSessionInfo;
  /** Notifications wiring (state + callbacks). */
  notifications: AppHeaderNotifications;
  /** Show the calendar widget in the header. */
  showCalendar?: boolean;
  /** Content rendered inside the calendar (dropdown on tablet/desktop, modal on mobile). */
  calendarContent?: ReactNode;
  /**
   * Optional controlled open state for the calendar.
   * When provided, the consumer is the source of truth; useful for closing
   * the calendar programmatically (e.g. on route change).
   */
  calendarOpen?: boolean;
  /** Fired whenever the calendar open state changes. */
  onCalendarOpenChange?: (open: boolean) => void;
  /** Show school/class/year inside the profile dropdown. */
  showProfileInfo?: boolean;
  /** Optional fallback image for the notifications empty state. */
  emptyNotificationsImage?: string;
  /** Empty-state title for notifications dropdown. */
  emptyNotificationsTitle?: string;
  /** Empty-state description for notifications dropdown. */
  emptyNotificationsDescription?: string;
  /** Callback fired when the user activates logout. */
  onLogout: () => void;
  /** Callback fired when the user activates the "My data" menu item. */
  onNavigateToMyData: () => void;
  /** Callback fired when the user clicks on a notification with entity info. */
  onNavigateByNotification?: (
    entityType?: NotificationEntityType,
    entityId?: string
  ) => void;
}

const DEFAULT_EMPTY_TITLE = 'Nenhuma notificação no momento';
const DEFAULT_EMPTY_DESCRIPTION =
  'Você está em dia com todas as novidades. Volte depois para conferir atualizações!';

/**
 * Application header shared across the analytica frontends.
 *
 * Renders the institution logo, optional calendar dropdown (mobile/tablet),
 * notifications center and a profile menu. Width is constrained by
 * `<PageContainer>` so it always aligns with the rest of the page content.
 */
export const AppHeader = ({
  user,
  sessionInfo,
  notifications,
  showCalendar = false,
  calendarContent,
  calendarOpen,
  onCalendarOpenChange,
  showProfileInfo = false,
  emptyNotificationsImage,
  emptyNotificationsTitle = DEFAULT_EMPTY_TITLE,
  emptyNotificationsDescription = DEFAULT_EMPTY_DESCRIPTION,
  onLogout,
  onNavigateToMyData,
  onNavigateByNotification,
}: AppHeaderProps) => {
  const { isMobile, isExtraSmallMobile } = useMobile();
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});

  const toggleActive = (buttonId: string) => {
    setActiveStates((prev) => {
      if (prev[buttonId]) {
        return { ...prev, [buttonId]: false };
      }
      return {
        calendar: false,
        notifications: false,
        profile: false,
        [buttonId]: true,
      };
    });
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveStates({});
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  const handleMyDataClick = () => {
    setActiveStates({});
    onNavigateToMyData();
  };

  const displayName = sessionInfo?.userName ?? user?.name ?? 'Usuário';
  const displayEmail = sessionInfo?.email ?? user?.email ?? '';

  const pickResponsiveClass = (
    extraSmall: string,
    mobile: string,
    desktop: string
  ): string => {
    if (isExtraSmallMobile) return extraSmall;
    if (isMobile) return mobile;
    return desktop;
  };
  const profileDropdownWidth = pickResponsiveClass(
    'min-w-[260px]',
    'min-w-[280px]',
    'min-w-[320px]'
  );
  const sectionGap = pickResponsiveClass('gap-1', 'gap-2', 'gap-3');
  const logoHeight = pickResponsiveClass('h-6', 'h-8', 'h-10');

  return (
    <header
      data-component="AppHeader"
      className="bg-primary-800 w-full h-[70px] flex justify-center items-center"
    >
      <PageContainer className="pb-0 justify-center">
        <div className="w-full flex flex-row justify-between items-center">
          <BrandingLogo
            variant="main"
            alt="Logo"
            className={`${logoHeight} object-contain`}
          />
          <section className={`flex flex-row items-center ${sectionGap}`}>
            {showCalendar && (
              <CalendarCard
                content={calendarContent}
                isOpen={calendarOpen ?? activeStates.calendar ?? false}
                onOpenChange={(open: boolean) => {
                  if (open && !activeStates.calendar) {
                    toggleActive('calendar');
                  } else if (!open && activeStates.calendar) {
                    setActiveStates((prev) => ({ ...prev, calendar: false }));
                  }
                  onCalendarOpenChange?.(open);
                }}
              />
            )}

            <NotificationCard
              mode="center"
              isActive={activeStates.notifications}
              onToggleActive={() => toggleActive('notifications')}
              onOpenChange={(open: boolean) => {
                syncDropdownState(
                  open,
                  activeStates.notifications,
                  setActiveStates,
                  'notifications'
                );
              }}
              unreadCount={notifications.unreadCount}
              groupedNotifications={notifications.groupedNotifications}
              loading={notifications.loading}
              error={notifications.error}
              onRetry={notifications.refreshNotifications}
              onMarkAsReadById={notifications.markAsRead}
              onDeleteById={notifications.deleteNotification}
              onNavigateById={(entityType, entityId) => {
                if (entityType && entityId) {
                  onNavigateByNotification?.(entityType, entityId);
                }
              }}
              getActionLabel={notifications.getActionLabel}
              onFetchNotifications={notifications.fetchNotifications}
              emptyStateImage={emptyNotificationsImage}
              emptyStateTitle={emptyNotificationsTitle}
              emptyStateDescription={emptyNotificationsDescription}
            />

            <DropdownMenu
              onOpenChange={(open: boolean) => {
                syncDropdownState(
                  open,
                  activeStates.profile,
                  setActiveStates,
                  'profile'
                );
              }}
            >
              <DropdownMenuTrigger className="text-primary cursor-pointer">
                <IconButton
                  active={activeStates.profile}
                  onClick={() => toggleActive('profile')}
                  icon={
                    <UserIcon
                      size={24}
                      className={activeStates.profile ? 'opacity-80' : ''}
                    />
                  }
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={profileDropdownWidth}
                side="bottom"
                variant="profile"
                align="end"
              >
                <ProfileMenuHeader
                  name={displayName}
                  email={displayEmail}
                  photoUrl={sessionInfo?.urlProfilePicture}
                />

                {showProfileInfo && (
                  <ProfileMenuInfo
                    schoolName={sessionInfo?.schoolName ?? ''}
                    classYearName={sessionInfo?.className ?? ''}
                    schoolYearName={sessionInfo?.schoolYearName ?? ''}
                  />
                )}

                <ProfileMenuSection>
                  <DropdownMenuItem
                    variant="profile"
                    iconLeft={<User />}
                    iconRight={<CaretRight />}
                    onClick={handleMyDataClick}
                  >
                    <Text size="md" color="text-text-700">
                      Meus dados
                    </Text>
                  </DropdownMenuItem>

                  <ProfileToggleTheme />
                </ProfileMenuSection>

                <ProfileMenuFooter onClick={onLogout} />
              </DropdownMenuContent>
            </DropdownMenu>
          </section>
        </div>
      </PageContainer>
    </header>
  );
};

export default AppHeader;
