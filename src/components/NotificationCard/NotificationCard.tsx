import { DotsThreeVertical, Bell } from 'phosphor-react';
import { MouseEvent, ReactNode, useState, useEffect } from 'react';
import { cn } from '../../utils/utils';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import { SkeletonCard } from '../Skeleton/Skeleton';
import IconButton from '../IconButton/IconButton';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import { useMobile } from '../../hooks/useMobile';
import type {
  Notification,
  NotificationGroup,
  NotificationEntityType,
} from '../../types/notifications';
import { formatTimeAgo } from '../../store/notificationStore';

// Extended notification item for component usage with time string
export interface NotificationItem extends Omit<Notification, 'createdAt'> {
  time: string;
  createdAt: string | Date;
}

// Base props shared across all modes
interface BaseNotificationProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Empty state image path
   */
  emptyStateImage?: string;
  /**
   * Empty state title
   */
  emptyStateTitle?: string;
  /**
   * Empty state description
   */
  emptyStateDescription?: string;
}

// Single notification card mode
interface SingleNotificationCardMode extends BaseNotificationProps {
  /**
   * Component mode - single card
   */
  mode: 'single';
  /**
   * The notification title
   */
  title: string;
  /**
   * The notification message content
   */
  message: string;
  /**
   * Time displayed (e.g., "Há 3h", "12 Fev")
   */
  time: string;
  /**
   * Whether the notification has been read
   */
  isRead: boolean;
  /**
   * Callback when user marks notification as read
   */
  onMarkAsRead: () => void;
  /**
   * Callback when user deletes notification
   */
  onDelete: () => void;
  /**
   * Optional callback for navigation action
   */
  onNavigate?: () => void;
  /**
   * Label for the action button (only shown if onNavigate is provided)
   */
  actionLabel?: string;
}

// List mode
interface NotificationListMode extends BaseNotificationProps {
  /**
   * Component mode - list
   */
  mode: 'list';
  /**
   * Array of notifications for list mode
   */
  notifications?: NotificationItem[];
  /**
   * Array of grouped notifications
   */
  groupedNotifications?: NotificationGroup[];
  /**
   * Loading state for list mode
   */
  loading?: boolean;
  /**
   * Error state for list mode
   */
  error?: string | null;
  /**
   * Callback for retry when error occurs
   */
  onRetry?: () => void;
  /**
   * Callback when user marks a notification as read in list mode
   */
  onMarkAsReadById?: (id: string) => void;
  /**
   * Callback when user deletes a notification in list mode
   */
  onDeleteById?: (id: string) => void;
  /**
   * Callback when user navigates from a notification in list mode
   */
  onNavigateById?: (
    entityType?: NotificationEntityType,
    entityId?: string
  ) => void;
  /**
   * Function to get action label for a notification
   */
  getActionLabel?: (entityType?: NotificationEntityType) => string | undefined;
  /**
   * Custom empty state component
   */
  renderEmpty?: () => ReactNode;
}

// NotificationCenter mode
interface NotificationCenterMode extends BaseNotificationProps {
  /**
   * Component mode - center
   */
  mode: 'center';
  /**
   * Array of grouped notifications
   */
  groupedNotifications?: NotificationGroup[];
  /**
   * Loading state for center mode
   */
  loading?: boolean;
  /**
   * Error state for center mode
   */
  error?: string | null;
  /**
   * Callback for retry when error occurs
   */
  onRetry?: () => void;
  /**
   * Whether center mode is currently active (controls dropdown/modal visibility)
   */
  isActive?: boolean;
  /**
   * Callback when center mode is toggled
   */
  onToggleActive?: () => void;
  /**
   * Number of unread notifications for badge display
   */
  unreadCount?: number;
  /**
   * Callback when all notifications should be marked as read
   */
  onMarkAllAsRead?: () => void;
  /**
   * Callback to fetch notifications (called when center opens)
   */
  onFetchNotifications?: () => void;
  /**
   * Callback when user marks a notification as read in center mode
   */
  onMarkAsReadById?: (id: string) => void;
  /**
   * Callback when user deletes a notification in center mode
   */
  onDeleteById?: (id: string) => void;
  /**
   * Callback when user navigates from a notification in center mode
   */
  onNavigateById?: (
    entityType?: NotificationEntityType,
    entityId?: string
  ) => void;
  /**
   * Function to get action label for a notification
   */
  getActionLabel?: (entityType?: NotificationEntityType) => string | undefined;
}

// Union type for all modes
export type NotificationCardProps =
  | SingleNotificationCardMode
  | NotificationListMode
  | NotificationCenterMode;

// Legacy interface for backward compatibility
export interface LegacyNotificationCardProps extends BaseNotificationProps {
  // Single notification mode props
  title?: string;
  message?: string;
  time?: string;
  isRead?: boolean;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
  onNavigate?: () => void;
  actionLabel?: string;

  // List mode props
  notifications?: NotificationItem[];
  groupedNotifications?: NotificationGroup[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onMarkAsReadById?: (id: string) => void;
  onDeleteById?: (id: string) => void;
  onNavigateById?: (
    entityType?: NotificationEntityType,
    entityId?: string
  ) => void;
  getActionLabel?: (entityType?: NotificationEntityType) => string | undefined;
  renderEmpty?: () => ReactNode;

  // NotificationCenter mode props
  variant?: 'card' | 'center';
  isActive?: boolean;
  onToggleActive?: () => void;
  unreadCount?: number;
  onMarkAllAsRead?: () => void;
  onFetchNotifications?: () => void;
}

/**
 * Empty state component for notifications
 */
const NotificationEmpty = ({
  emptyStateImage,
  emptyStateTitle = 'Nenhuma notificação no momento',
  emptyStateDescription = 'Você está em dia com todas as novidades. Volte depois para conferir atualizações!',
}: {
  emptyStateImage?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 w-full">
      {/* Notification Icon */}
      {emptyStateImage && (
        <div className="w-20 h-20 flex items-center justify-center">
          <img
            src={emptyStateImage}
            alt="Sem notificações"
            width={82}
            height={82}
            className="object-contain"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-semibold text-text-950 text-center leading-[23px]">
        {emptyStateTitle}
      </h3>

      {/* Description */}
      <p className="text-sm font-normal text-text-400 text-center max-w-[316px] leading-[21px]">
        {emptyStateDescription}
      </p>
    </div>
  );
};

/**
 * Notification header component
 */
const NotificationHeader = ({
  unreadCount,
  variant = 'modal',
}: {
  unreadCount: number;
  variant?: 'modal' | 'dropdown';
}) => {
  return (
    <div className="flex items-center justify-between">
      {variant === 'modal' ? (
        <Text size="sm" weight="bold" className="text-text-950">
          Notificações
        </Text>
      ) : (
        <h3 className="text-sm font-semibold text-text-950">Notificações</h3>
      )}
      {unreadCount > 0 && (
        <span className="px-2 py-1 bg-info-100 text-info-700 text-xs rounded-full">
          {unreadCount} não lidas
        </span>
      )}
    </div>
  );
};

/**
 * Single notification card component
 */
const SingleNotificationCard = ({
  title,
  message,
  time,
  isRead,
  onMarkAsRead,
  onDelete,
  onNavigate,
  actionLabel,
  className,
}: {
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onNavigate?: () => void;
  actionLabel?: string;
  className?: string;
}) => {
  const handleMarkAsRead = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isRead) {
      onMarkAsRead();
    }
  };

  const handleDelete = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  const handleNavigate = (e: MouseEvent) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col justify-center items-start p-4 gap-2 w-full bg-background border-b border-border-200',
        'last:border-b-0',
        className
      )}
    >
      {/* Header with unread indicator and actions menu */}
      <div className="flex items-center gap-2 w-full">
        {/* Unread indicator */}
        {!isRead && (
          <div className="w-[7px] h-[7px] bg-info-300 rounded-full flex-shrink-0" />
        )}

        {/* Title */}
        <h3 className="font-bold text-sm leading-4 text-text-950 flex-grow">
          {title}
        </h3>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex-shrink-0 inline-flex items-center justify-center font-medium bg-transparent text-text-950 cursor-pointer hover:bg-info-50 w-6 h-6 rounded-lg"
            aria-label="Menu de ações"
          >
            <DotsThreeVertical size={24} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            {!isRead && (
              <DropdownMenuItem
                onClick={handleMarkAsRead}
                className="text-text-950"
              >
                Marcar como lida
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDelete} className="text-error-600">
              Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Message */}
      <p className="text-sm leading-[21px] text-text-800 w-full">{message}</p>

      {/* Time and action button */}
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-medium text-text-400">{time}</span>

        {onNavigate && actionLabel && (
          <button
            type="button"
            onClick={handleNavigate}
            className="text-sm font-medium text-info-600 hover:text-info-700 cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Notification list component for displaying grouped notifications
 */
const NotificationList = ({
  groupedNotifications = [],
  loading = false,
  error = null,
  onRetry,
  onMarkAsReadById,
  onDeleteById,
  onNavigateById,
  getActionLabel,
  renderEmpty,
  className,
}: {
  groupedNotifications?: NotificationGroup[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onMarkAsReadById?: (id: string) => void;
  onDeleteById?: (id: string) => void;
  onNavigateById?: (
    entityType?: NotificationEntityType,
    entityId?: string
  ) => void;
  getActionLabel?: (entityType?: NotificationEntityType) => string | undefined;
  renderEmpty?: () => ReactNode;
  className?: string;
}) => {
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 w-full">
        <p className="text-sm text-error-600">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-sm text-info-600 hover:text-info-700"
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-0 w-full">
        {['skeleton-first', 'skeleton-second', 'skeleton-third'].map(
          (skeletonId) => (
            <SkeletonCard
              key={skeletonId}
              className="p-4 border-b border-border-200"
            />
          )
        )}
      </div>
    );
  }

  // Empty state
  if (!groupedNotifications || groupedNotifications.length === 0) {
    return renderEmpty ? (
      <div className="w-full">{renderEmpty()}</div>
    ) : (
      <NotificationEmpty />
    );
  }

  return (
    <div className={cn('flex flex-col gap-0 w-full', className)}>
      {groupedNotifications.map((group, idx) => (
        <div key={`${group.label}-${idx}`} className="flex flex-col">
          {/* Group header */}
          <div className="flex items-end px-4 py-6 pb-4">
            <h4 className="text-lg font-bold text-text-500 flex-grow">
              {group.label}
            </h4>
          </div>

          {/* Notifications in group */}
          {group.notifications.map((notification) => (
            <SingleNotificationCard
              key={notification.id}
              title={notification.title}
              message={notification.message}
              time={
                (notification as Partial<NotificationItem>).time ??
                formatTimeAgo(new Date(notification.createdAt))
              }
              isRead={notification.isRead}
              onMarkAsRead={() => onMarkAsReadById?.(notification.id)}
              onDelete={() => onDeleteById?.(notification.id)}
              onNavigate={
                notification.entityType &&
                notification.entityId &&
                onNavigateById
                  ? () =>
                      onNavigateById(
                        notification.entityType ?? undefined,
                        notification.entityId ?? undefined
                      )
                  : undefined
              }
              actionLabel={getActionLabel?.(
                notification.entityType ?? undefined
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Internal props type for NotificationCenter (without mode)
type NotificationCenterProps = Omit<NotificationCenterMode, 'mode'>;

/**
 * NotificationCenter component for modal/dropdown mode
 */
const NotificationCenter = ({
  isActive,
  onToggleActive,
  unreadCount = 0,
  groupedNotifications = [],
  loading = false,
  error = null,
  onRetry,
  onMarkAsReadById,
  onDeleteById,
  onNavigateById,
  getActionLabel,
  onFetchNotifications,
  onMarkAllAsRead,
  emptyStateImage,
  emptyStateTitle,
  emptyStateDescription,
  className,
}: NotificationCenterProps) => {
  const { isMobile } = useMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle mobile click
  const handleMobileClick = () => {
    setIsModalOpen(true);
    onFetchNotifications?.();
  };

  // Handle desktop click
  const handleDesktopClick = () => {
    onToggleActive?.();
  };

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isActive) {
      onFetchNotifications?.();
    }
  }, [isActive, onFetchNotifications]);

  // Handle navigation with cleanup
  const handleNavigate = (
    entityType?: NotificationEntityType,
    entityId?: string,
    onCleanup?: () => void
  ) => {
    onCleanup?.();
    onNavigateById?.(entityType, entityId);
  };

  const renderEmptyState = () => (
    <NotificationEmpty
      emptyStateImage={emptyStateImage}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
    />
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          active={isModalOpen}
          onClick={handleMobileClick}
          icon={<Bell size={24} className="text-primary" />}
          className={className}
        />
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Notificações"
          size="md"
          hideCloseButton={false}
          closeOnBackdropClick={true}
          closeOnEscape={true}
        >
          <div className="flex flex-col h-full max-h-[80vh]">
            <div className="px-0 pb-3 border-b border-border-200">
              <div className="flex items-center justify-between">
                <NotificationHeader unreadCount={unreadCount} variant="modal" />
                {unreadCount > 0 && onMarkAllAsRead && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="text-sm font-medium text-info-600 hover:text-info-700 cursor-pointer"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NotificationList
                groupedNotifications={groupedNotifications}
                loading={loading}
                error={error}
                onRetry={onRetry}
                onMarkAsReadById={onMarkAsReadById}
                onDeleteById={onDeleteById}
                onNavigateById={(entityType, entityId) =>
                  handleNavigate(entityType, entityId, () =>
                    setIsModalOpen(false)
                  )
                }
                getActionLabel={getActionLabel}
                renderEmpty={renderEmptyState}
              />
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-primary cursor-pointer">
        <IconButton
          active={isActive}
          onClick={handleDesktopClick}
          icon={
            <Bell
              size={24}
              className={isActive ? 'text-primary-950' : 'text-primary'}
            />
          }
          className={className}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[320px] max-w-[400px] max-h-[500px] overflow-hidden"
        side="bottom"
        align="end"
      >
        <div className="flex flex-col">
          <div className="px-4 py-3 border-b border-border-200">
            <div className="flex items-center justify-between">
              <NotificationHeader
                unreadCount={unreadCount}
                variant="dropdown"
              />
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-sm font-medium text-info-600 hover:text-info-700 cursor-pointer"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[350px] overflow-y-auto">
            <NotificationList
              groupedNotifications={groupedNotifications}
              loading={loading}
              error={error}
              onRetry={onRetry}
              onMarkAsReadById={onMarkAsReadById}
              onDeleteById={onDeleteById}
              onNavigateById={(entityType, entityId) =>
                handleNavigate(entityType, entityId, onToggleActive)
              }
              getActionLabel={getActionLabel}
              renderEmpty={renderEmptyState}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * NotificationCard component - can display single notification, list of notifications, or center mode
 *
 * @param props - The notification card properties
 * @returns JSX element representing the notification card, list, or center
 */
const NotificationCard = (props: NotificationCardProps) => {
  // Use mode discriminator to determine which component to render
  switch (props.mode) {
    case 'single':
      return (
        <SingleNotificationCard
          title={props.title}
          message={props.message}
          time={props.time}
          isRead={props.isRead}
          onMarkAsRead={props.onMarkAsRead}
          onDelete={props.onDelete}
          onNavigate={props.onNavigate}
          actionLabel={props.actionLabel}
          className={props.className}
        />
      );

    case 'list':
      return (
        <NotificationList
          groupedNotifications={
            props.groupedNotifications ??
            (props.notifications
              ? [
                  {
                    label: 'Notificações',
                    notifications: props.notifications as Notification[],
                  },
                ]
              : [])
          }
          loading={props.loading}
          error={props.error}
          onRetry={props.onRetry}
          onMarkAsReadById={props.onMarkAsReadById}
          onDeleteById={props.onDeleteById}
          onNavigateById={props.onNavigateById}
          getActionLabel={props.getActionLabel}
          renderEmpty={props.renderEmpty}
          className={props.className}
        />
      );

    case 'center':
      return <NotificationCenter {...props} />;

    default:
      // This should never happen with proper typing, but provides a fallback
      return (
        <div className="flex flex-col items-center gap-4 p-6 w-full">
          <p className="text-sm text-text-600">
            Modo de notificação não reconhecido
          </p>
        </div>
      );
  }
};

/**
 * Legacy NotificationCard component for backward compatibility
 * Automatically detects mode based on provided props
 */
export const LegacyNotificationCard = (props: LegacyNotificationCardProps) => {
  // If variant is center, render NotificationCenter
  if (props.variant === 'center') {
    const centerProps: NotificationCenterMode = {
      mode: 'center',
      ...props,
    };
    return <NotificationCenter {...centerProps} />;
  }

  // If we have list-related props, render list mode
  if (
    props.groupedNotifications !== undefined ||
    props.notifications !== undefined ||
    props.loading ||
    props.error
  ) {
    return (
      <NotificationList
        groupedNotifications={
          props.groupedNotifications ??
          (props.notifications
            ? [
                {
                  label: 'Notificações',
                  notifications: props.notifications as Notification[],
                },
              ]
            : [])
        }
        loading={props.loading}
        error={props.error}
        onRetry={props.onRetry}
        onMarkAsReadById={props.onMarkAsReadById}
        onDeleteById={props.onDeleteById}
        onNavigateById={props.onNavigateById}
        getActionLabel={props.getActionLabel}
        renderEmpty={props.renderEmpty}
        className={props.className}
      />
    );
  }

  // If we have single notification props, render single card mode
  if (
    props.title !== undefined &&
    props.message !== undefined &&
    props.time !== undefined &&
    props.isRead !== undefined &&
    props.onMarkAsRead &&
    props.onDelete
  ) {
    const singleProps: SingleNotificationCardMode = {
      mode: 'single',
      title: props.title,
      message: props.message,
      time: props.time,
      isRead: props.isRead,
      onMarkAsRead: props.onMarkAsRead,
      onDelete: props.onDelete,
      onNavigate: props.onNavigate,
      actionLabel: props.actionLabel,
      className: props.className,
      emptyStateImage: props.emptyStateImage,
      emptyStateTitle: props.emptyStateTitle,
      emptyStateDescription: props.emptyStateDescription,
    };
    return (
      <SingleNotificationCard
        title={singleProps.title}
        message={singleProps.message}
        time={singleProps.time}
        isRead={singleProps.isRead}
        onMarkAsRead={singleProps.onMarkAsRead}
        onDelete={singleProps.onDelete}
        onNavigate={singleProps.onNavigate}
        actionLabel={singleProps.actionLabel}
        className={singleProps.className}
      />
    );
  }

  // Default empty state if no valid props provided
  return (
    <div className="flex flex-col items-center gap-4 p-6 w-full">
      <p className="text-sm text-text-600">Nenhuma notificação configurada</p>
    </div>
  );
};

export default NotificationCard;
export type { NotificationGroup };
