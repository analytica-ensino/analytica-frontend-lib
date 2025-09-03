import { Check, DotsThreeVertical, Trash } from 'phosphor-react';
import { MouseEvent, ReactNode } from 'react';
import { cn } from '../../utils/utils';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import { SkeletonCard } from '../Skeleton/Skeleton';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  entityType?: string;
  entityId?: string;
  createdAt: Date;
}

interface NotificationGroup {
  label: string;
  notifications: NotificationItem[];
}

export interface NotificationCardProps {
  // Single notification mode props
  /**
   * The notification title
   */
  title?: string;
  /**
   * The notification message content
   */
  message?: string;
  /**
   * Time displayed (e.g., "Há 3h", "12 Fev")
   */
  time?: string;
  /**
   * Whether the notification has been read
   */
  isRead?: boolean;
  /**
   * Callback when user marks notification as read
   */
  onMarkAsRead?: () => void;
  /**
   * Callback when user deletes notification
   */
  onDelete?: () => void;
  /**
   * Optional callback for navigation action
   */
  onNavigate?: () => void;
  /**
   * Label for the action button (only shown if onNavigate is provided)
   */
  actionLabel?: string;

  // List mode props
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
  onNavigateById?: (entityType?: string, entityId?: string) => void;
  /**
   * Function to get action label for a notification
   */
  getActionLabel?: (entityType?: string) => string | undefined;
  /**
   * Custom empty state component
   */
  renderEmpty?: () => ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

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
}: Required<
  Pick<
    NotificationCardProps,
    'title' | 'message' | 'time' | 'isRead' | 'onMarkAsRead' | 'onDelete'
  >
> &
  Pick<NotificationCardProps, 'onNavigate' | 'actionLabel' | 'className'>) => {
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
    e.preventDefault();
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
                className="flex items-center gap-2 text-text-950"
              >
                <Check size={16} />
                Marcar como lida
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              className="flex items-center gap-2 text-error-600"
            >
              <Trash size={16} />
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
}: Pick<
  NotificationCardProps,
  | 'groupedNotifications'
  | 'loading'
  | 'error'
  | 'onRetry'
  | 'onMarkAsReadById'
  | 'onDeleteById'
  | 'onNavigateById'
  | 'getActionLabel'
  | 'renderEmpty'
  | 'className'
>) => {
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 w-full">
        <p className="text-sm text-error-600">{error}</p>
        {onRetry && (
          <button
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
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard
            key={index}
            className="p-4 border-b border-border-200"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (!groupedNotifications || groupedNotifications.length === 0) {
    return renderEmpty ? (
      <div className="w-full">{renderEmpty()}</div>
    ) : (
      <div className="flex flex-col items-center gap-4 p-6 w-full">
        <p className="text-sm text-text-600">Nenhuma notificação no momento</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-0 w-full', className)}>
      {groupedNotifications.map((group) => (
        <div key={group.label} className="flex flex-col">
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
              time={notification.time}
              isRead={notification.isRead}
              onMarkAsRead={() => onMarkAsReadById?.(notification.id)}
              onDelete={() => onDeleteById?.(notification.id)}
              onNavigate={
                notification.entityType &&
                notification.entityId &&
                onNavigateById
                  ? () =>
                      onNavigateById(
                        notification.entityType,
                        notification.entityId
                      )
                  : undefined
              }
              actionLabel={getActionLabel?.(notification.entityType)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * NotificationCard component - can display single notification or list of notifications
 *
 * @param props - The notification card properties
 * @returns JSX element representing the notification card or list
 */
const NotificationCard = (props: NotificationCardProps) => {
  // If we have grouped notifications or list-specific props, render list mode
  if (
    props.groupedNotifications !== undefined ||
    props.loading ||
    props.error
  ) {
    return <NotificationList {...props} />;
  }

  // If we have single notification props, render single card mode
  if (
    props.title &&
    props.message &&
    props.time !== undefined &&
    props.isRead !== undefined &&
    props.onMarkAsRead &&
    props.onDelete
  ) {
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
  }

  // Default empty state if no valid props provided
  return (
    <div className="flex flex-col items-center gap-4 p-6 w-full">
      <p className="text-sm text-text-600">Nenhuma notificação configurada</p>
    </div>
  );
};

export default NotificationCard;
export type { NotificationItem, NotificationGroup };
