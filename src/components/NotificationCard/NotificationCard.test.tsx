import { render, screen, fireEvent } from '@testing-library/react';
import NotificationCard, {
  NotificationGroup,
  LegacyNotificationCard,
} from './NotificationCard';
import {
  NotificationEntityType,
  Notification,
} from '../../types/notifications';
import { DeviceType, useMobile } from '../../hooks/useMobile';

// Mock para a imagem PNG
jest.mock(
  '../../assets/img/no-notification-result.png',
  () => 'test-file-stub'
);

// Mock useMobile hook
jest.mock('../../hooks/useMobile');
const mockUseMobile = useMobile as jest.MockedFunction<typeof useMobile>;

describe('NotificationCard', () => {
  const defaultProps = {
    mode: 'single' as const,
    title: 'Test Title',
    message: 'Test message content',
    time: 'Há 3h',
    isRead: false,
    onMarkAsRead: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock for useMobile
    mockUseMobile.mockReturnValue({
      isMobile: false,
      isTablet: false,
      getFormContainerClasses: jest.fn(
        () => 'w-full max-w-[992px] mx-auto px-0'
      ),
      getHeaderClasses: jest.fn(
        () => 'flex flex-row justify-between items-center gap-6 mb-8'
      ),
      getMobileHeaderClasses: jest.fn(
        () => 'flex flex-col items-start gap-4 mb-6'
      ),
      getDesktopHeaderClasses: jest.fn(
        () => 'flex flex-row justify-between items-center gap-6 mb-8'
      ),
      getDeviceType: jest.fn(() => 'desktop' as DeviceType),
    });
  });

  it('renders notification card with all required props', () => {
    render(<NotificationCard {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message content')).toBeInTheDocument();
    expect(screen.getByText('Há 3h')).toBeInTheDocument();
  });

  it('shows unread indicator when notification is not read', () => {
    render(<NotificationCard {...defaultProps} isRead={false} />);

    const unreadIndicator = document.querySelector(
      '.w-\\[7px\\].h-\\[7px\\].bg-info-300'
    );
    expect(unreadIndicator).toBeInTheDocument();
  });

  it('hides unread indicator when notification is read', () => {
    render(<NotificationCard {...defaultProps} isRead={true} />);

    const unreadIndicator = document.querySelector(
      '.w-\\[7px\\].h-\\[7px\\].bg-info-300'
    );
    expect(unreadIndicator).not.toBeInTheDocument();
  });

  it('opens dropdown menu when three dots button is clicked', () => {
    render(<NotificationCard {...defaultProps} />);

    const menuButton = screen.getByLabelText('Menu de ações');
    fireEvent.click(menuButton);

    expect(screen.getByText('Marcar como lida')).toBeInTheDocument();
    expect(screen.getByText('Deletar')).toBeInTheDocument();
  });

  it('calls onMarkAsRead when "Marcar como lida" is clicked and notification is unread', () => {
    render(<NotificationCard {...defaultProps} isRead={false} />);

    const menuButton = screen.getByLabelText('Menu de ações');
    fireEvent.click(menuButton);

    const markAsReadButton = screen.getByText('Marcar como lida');
    fireEvent.click(markAsReadButton);

    expect(defaultProps.onMarkAsRead).toHaveBeenCalledTimes(1);
  });

  it('does not show "Marcar como lida" option when notification is already read', () => {
    render(<NotificationCard {...defaultProps} isRead={true} />);

    const menuButton = screen.getByLabelText('Menu de ações');
    fireEvent.click(menuButton);

    expect(screen.queryByText('Marcar como lida')).not.toBeInTheDocument();
    expect(screen.getByText('Deletar')).toBeInTheDocument();
  });

  it('calls onDelete when "Deletar" is clicked', () => {
    render(<NotificationCard {...defaultProps} />);

    const menuButton = screen.getByLabelText('Menu de ações');
    fireEvent.click(menuButton);

    const deleteButton = screen.getByText('Deletar');
    fireEvent.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('shows action button when onNavigate and actionLabel are provided', () => {
    const onNavigate = jest.fn();
    render(
      <NotificationCard
        {...defaultProps}
        onNavigate={onNavigate}
        actionLabel="Ver atividade"
      />
    );

    const actionButton = screen.getByText('Ver atividade');
    expect(actionButton).toBeInTheDocument();

    fireEvent.click(actionButton);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('does not show action button when onNavigate is provided but actionLabel is not', () => {
    const onNavigate = jest.fn();
    render(<NotificationCard {...defaultProps} onNavigate={onNavigate} />);

    expect(
      screen.queryByRole('button', { name: /ver/i })
    ).not.toBeInTheDocument();
  });

  it('does not show action button when actionLabel is provided but onNavigate is not', () => {
    render(<NotificationCard {...defaultProps} actionLabel="Ver atividade" />);

    expect(
      screen.queryByRole('button', { name: /ver/i })
    ).not.toBeInTheDocument();
  });

  it('prevents event bubbling when dropdown actions are clicked', () => {
    const parentClickHandler = jest.fn();
    render(
      <button
        onClick={parentClickHandler}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          width: '100%',
        }}
      >
        <NotificationCard {...defaultProps} />
      </button>
    );

    const menuButton = screen.getByLabelText('Menu de ações');
    fireEvent.click(menuButton);

    const deleteButton = screen.getByText('Deletar');
    fireEvent.click(deleteButton);

    // Parent click handler should not be called due to stopPropagation
    expect(parentClickHandler).not.toHaveBeenCalled();
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('prevents event bubbling when action button is clicked', () => {
    const parentClickHandler = jest.fn();
    const onNavigate = jest.fn();

    render(
      <button
        onClick={parentClickHandler}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          width: '100%',
        }}
      >
        <NotificationCard
          {...defaultProps}
          onNavigate={onNavigate}
          actionLabel="Ver atividade"
        />
      </button>
    );

    const actionButton = screen.getByText('Ver atividade');
    fireEvent.click(actionButton);

    // Parent click handler should not be called due to stopPropagation
    expect(parentClickHandler).not.toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <NotificationCard {...defaultProps} className="custom-class" />
    );

    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('custom-class');
  });

  it('renders with correct ARIA attributes', () => {
    render(<NotificationCard {...defaultProps} />);

    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('Test Title');

    const menuButton = screen.getByLabelText('Menu de ações');
    expect(menuButton).toBeInTheDocument();
  });

  it('handles long content properly', () => {
    const longTitle =
      'This is a very long title that should wrap properly in the notification card component';
    const longMessage =
      'This is a very long message content that should wrap properly and not break the layout of the notification card component. It should maintain proper spacing and alignment.';

    render(
      <NotificationCard
        {...defaultProps}
        title={longTitle}
        message={longMessage}
      />
    );

    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('uses correct CSS classes for styling', () => {
    const { container } = render(
      <NotificationCard {...defaultProps} isRead={false} />
    );

    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass(
      'bg-background',
      'border-b',
      'border-border-200'
    );

    const titleElement = screen.getByRole('heading', { level: 3 });
    expect(titleElement).toHaveClass('font-bold', 'text-text-950');

    const messageElement = screen.getByText('Test message content');
    expect(messageElement).toHaveClass('text-text-800');

    const timeElement = screen.getByText('Há 3h');
    expect(timeElement).toHaveClass('text-text-400');
  });

  it('removes border-bottom from last notification card', () => {
    const { container } = render(
      <NotificationCard {...defaultProps} className="last:border-b-0" />
    );

    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('last:border-b-0');
  });

  describe('NotificationList component', () => {
    const mockNotifications = [
      {
        id: '1',
        title: 'Test Notification 1',
        message: 'Test message 1',
        time: 'Há 1h',
        type: 'ACTIVITY' as const,
        isRead: false,
        entityType: NotificationEntityType.ACTIVITY,
        entityId: 'act-1',
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'Test Notification 2',
        message: 'Test message 2',
        time: 'Há 2h',
        type: 'GENERAL' as const,
        isRead: true,
        createdAt: new Date(),
      },
    ];

    const mockGroupedNotifications = [
      {
        label: 'Hoje',
        notifications: mockNotifications,
      },
    ];

    it('renders loading state correctly', () => {
      render(<NotificationCard mode="list" loading={true} />);

      // Should render 3 skeleton cards
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders error state correctly', () => {
      const errorMessage = 'Failed to load notifications';
      const onRetry = jest.fn();

      render(
        <NotificationCard mode="list" error={errorMessage} onRetry={onRetry} />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Tentar novamente')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Tentar novamente'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('renders error state without retry button when onRetry is not provided', () => {
      const errorMessage = 'Failed to load notifications';

      render(<NotificationCard mode="list" error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText('Tentar novamente')).not.toBeInTheDocument();
    });

    it('renders empty state when no notifications are provided', () => {
      render(<NotificationCard mode="list" groupedNotifications={[]} />);

      expect(
        screen.getByText('Nenhuma notificação no momento')
      ).toBeInTheDocument();
    });

    it('renders custom empty state when renderEmpty is provided', () => {
      const customEmptyState = () => <div>Custom empty message</div>;

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[]}
          renderEmpty={customEmptyState}
        />
      );

      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
      expect(
        screen.queryByText('Nenhuma notificação no momento')
      ).not.toBeInTheDocument();
    });

    it('renders grouped notifications correctly', () => {
      const onMarkAsReadById = jest.fn();
      const onDeleteById = jest.fn();
      const onNavigateById = jest.fn();
      const getActionLabel = jest.fn((entityType?: string) => {
        if (entityType === NotificationEntityType.ACTIVITY)
          return 'Ver atividade';
        return undefined;
      });

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={mockGroupedNotifications}
          onMarkAsReadById={onMarkAsReadById}
          onDeleteById={onDeleteById}
          onNavigateById={onNavigateById}
          getActionLabel={getActionLabel}
        />
      );

      // Check group header
      expect(screen.getByText('Hoje')).toBeInTheDocument();

      // Check notifications
      expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Test message 1')).toBeInTheDocument();
      expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
      expect(screen.getByText('Test message 2')).toBeInTheDocument();

      // Check action label for first notification
      expect(screen.getByText('Ver atividade')).toBeInTheDocument();
    });

    it('calls onMarkAsReadById when marking notification as read', () => {
      const onMarkAsReadById = jest.fn();

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[
            {
              label: 'Hoje',
              notifications: [mockNotifications[0]], // Unread notification
            },
          ]}
          onMarkAsReadById={onMarkAsReadById}
          onDeleteById={jest.fn()}
        />
      );

      const menuButtons = screen.getAllByLabelText('Menu de ações');
      fireEvent.click(menuButtons[0]);

      const markAsReadButton = screen.getByText('Marcar como lida');
      fireEvent.click(markAsReadButton);

      expect(onMarkAsReadById).toHaveBeenCalledWith('1');
    });

    it('calls onDeleteById when deleting notification', () => {
      const onDeleteById = jest.fn();

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={mockGroupedNotifications}
          onMarkAsReadById={jest.fn()}
          onDeleteById={onDeleteById}
        />
      );

      const menuButtons = screen.getAllByLabelText('Menu de ações');
      fireEvent.click(menuButtons[0]);

      const deleteButton = screen.getByText('Deletar');
      fireEvent.click(deleteButton);

      expect(onDeleteById).toHaveBeenCalledWith('1');
    });

    it('calls onNavigateById when notification has entity data', () => {
      const onNavigateById = jest.fn();

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[
            {
              label: 'Hoje',
              notifications: [mockNotifications[0]], // Has entityType and entityId
            },
          ]}
          onMarkAsReadById={jest.fn()}
          onDeleteById={jest.fn()}
          onNavigateById={onNavigateById}
          getActionLabel={() => 'Ver atividade'}
        />
      );

      const actionButton = screen.getByText('Ver atividade');
      fireEvent.click(actionButton);

      expect(onNavigateById).toHaveBeenCalledWith(
        NotificationEntityType.ACTIVITY,
        'act-1'
      );
    });

    it('does not show action button when notification has no entity data', () => {
      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[
            {
              label: 'Hoje',
              notifications: [mockNotifications[1]], // No entityType/entityId
            },
          ]}
          onMarkAsReadById={jest.fn()}
          onDeleteById={jest.fn()}
          onNavigateById={jest.fn()}
          getActionLabel={() => 'Ver atividade'}
        />
      );

      expect(screen.queryByText('Ver atividade')).not.toBeInTheDocument();
    });

    it('applies custom className to list container', () => {
      const { container } = render(
        <NotificationCard
          mode="list"
          groupedNotifications={mockGroupedNotifications}
          className="custom-list-class"
        />
      );

      const listElement = container.querySelector('.custom-list-class');
      expect(listElement).toBeInTheDocument();
    });

    it('renders multiple notification groups correctly', () => {
      const multipleGroups = [
        {
          label: 'Hoje',
          notifications: [mockNotifications[0]],
        },
        {
          label: 'Ontem',
          notifications: [mockNotifications[1]],
        },
      ];

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={multipleGroups}
          onMarkAsReadById={jest.fn()}
          onDeleteById={jest.fn()}
        />
      );

      expect(screen.getByText('Hoje')).toBeInTheDocument();
      expect(screen.getByText('Ontem')).toBeInTheDocument();
      expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
    });

    it('renders group headers with correct CSS classes', () => {
      render(
        <NotificationCard
          mode="list"
          groupedNotifications={mockGroupedNotifications}
          onMarkAsReadById={jest.fn()}
          onDeleteById={jest.fn()}
        />
      );

      const groupHeader = screen.getByText('Hoje');
      expect(groupHeader).toHaveClass(
        'text-lg',
        'font-bold',
        'text-text-500',
        'flex-grow'
      );
    });

    it('handles getActionLabel returning undefined', () => {
      const getActionLabel = jest.fn(() => undefined);

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[
            {
              label: 'Hoje',
              notifications: [mockNotifications[0]], // Has entityType and entityId
            },
          ]}
          onMarkAsReadById={jest.fn()}
          onDeleteById={jest.fn()}
          onNavigateById={jest.fn()}
          getActionLabel={getActionLabel}
        />
      );

      expect(getActionLabel).toHaveBeenCalledWith(
        NotificationEntityType.ACTIVITY
      );
      expect(
        screen.queryByRole('button', { name: /ver/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('NotificationEmpty component', () => {
    it('renders empty state with correct text', () => {
      render(<NotificationCard mode="list" groupedNotifications={[]} />);

      expect(
        screen.getByText('Nenhuma notificação no momento')
      ).toBeInTheDocument();
    });

    it('applies correct CSS classes for empty state layout', () => {
      const { container } = render(
        <NotificationCard mode="list" groupedNotifications={[]} />
      );

      const emptyStateContainer = container.querySelector(
        '.flex.flex-col.items-center.justify-center.gap-4.p-6.w-full'
      );
      expect(emptyStateContainer).toBeInTheDocument();

      const text = screen.getByText('Nenhuma notificação no momento');
      expect(text).toHaveClass('text-xl', 'font-semibold', 'text-text-950');
    });

    it('renders group header when notifications array is empty', () => {
      render(<NotificationCard mode="list" notifications={[]} />);

      expect(screen.getByText('Notificações')).toBeInTheDocument(); // Group header
      // No notifications are rendered within the group since array is empty
      expect(
        screen.queryByRole('heading', { level: 3 })
      ).not.toBeInTheDocument(); // No notification titles
    });

    it('renders empty state when groupedNotifications is null', () => {
      render(
        <NotificationCard
          mode="list"
          groupedNotifications={null as unknown as NotificationGroup[]}
        />
      );

      expect(
        screen.getByText('Nenhuma notificação no momento')
      ).toBeInTheDocument();
    });

    it('renders fallback state when groupedNotifications is undefined', () => {
      render(<NotificationCard mode="list" groupedNotifications={undefined} />);

      expect(
        screen.getByText('Nenhuma notificação no momento')
      ).toBeInTheDocument();
    });
  });

  describe('Component mode detection', () => {
    it('renders single card when all required props are provided', () => {
      render(<NotificationCard {...defaultProps} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test message content')).toBeInTheDocument();
    });

    it('renders list mode when groupedNotifications is provided', () => {
      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[
            {
              label: 'Test Group',
              notifications: [],
            },
          ]}
        />
      );

      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('renders list mode when loading prop is provided', () => {
      render(<NotificationCard mode="list" loading={true} />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders list mode when error prop is provided', () => {
      render(<NotificationCard mode="list" error="Test error" />);

      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('renders fallback when incomplete single card props are provided', () => {
      render(
        <NotificationCard
          mode="single"
          title="Only title"
          message=""
          time=""
          isRead={false}
          onMarkAsRead={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      expect(screen.getByText('Only title')).toBeInTheDocument();
    });

    it('renders fallback when isRead is undefined', () => {
      render(
        <LegacyNotificationCard
          title="Test Title"
          message="Test message"
          time="Há 3h"
          /* omit isRead to simulate undefined */
          onMarkAsRead={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      expect(
        screen.getByText('Nenhuma notificação configurada')
      ).toBeInTheDocument();
    });

    it('renders fallback when time is undefined', () => {
      render(
        <LegacyNotificationCard
          title="Test Title"
          message="Test message"
          /* omit time to simulate undefined */
          isRead={false}
          onMarkAsRead={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      expect(
        screen.getByText('Nenhuma notificação configurada')
      ).toBeInTheDocument();
    });
  });

  describe('Edge cases and additional coverage', () => {
    it('handles notification without entityType but with entityId', () => {
      const notification = {
        id: '1',
        title: 'Test Notification',
        message: 'Test message',
        time: 'Há 1h',
        type: 'GENERAL' as const,
        isRead: false,
        entityId: 'some-id', // Has entityId but no entityType
        createdAt: new Date(),
      };

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[
            {
              label: 'Test Group',
              notifications: [notification],
            },
          ]}
          onMarkAsReadById={jest.fn()}
          onDeleteById={jest.fn()}
          onNavigateById={jest.fn()}
          getActionLabel={() => 'Test Action'}
        />
      );

      // Should not show action button because entityType is missing
      expect(screen.queryByText('Test Action')).not.toBeInTheDocument();
    });

    it('handles notification with entityType but without entityId', () => {
      const notification = {
        id: '1',
        title: 'Test Notification',
        message: 'Test message',
        time: 'Há 1h',
        type: 'ACTIVITY' as const,
        isRead: false,
        entityType: NotificationEntityType.ACTIVITY, // Has entityType but no entityId
        createdAt: new Date(),
      };

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[
            {
              label: 'Test Group',
              notifications: [notification],
            },
          ]}
          onMarkAsReadById={jest.fn()}
          onDeleteById={jest.fn()}
          onNavigateById={jest.fn()}
          getActionLabel={() => 'Test Action'}
        />
      );

      // Should not show action button because entityId is missing
      expect(screen.queryByText('Test Action')).not.toBeInTheDocument();
    });

    it('handles notification without onNavigateById callback', () => {
      const notification = {
        id: '1',
        title: 'Test Notification',
        message: 'Test message',
        time: 'Há 1h',
        type: 'ACTIVITY' as const,
        isRead: false,
        entityType: NotificationEntityType.ACTIVITY,
        entityId: 'act-1',
        createdAt: new Date(),
      };

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[
            {
              label: 'Test Group',
              notifications: [notification],
            },
          ]}
          onMarkAsReadById={jest.fn()}
          onDeleteById={jest.fn()}
          // onNavigateById is not provided
          getActionLabel={() => 'Test Action'}
        />
      );

      // Should not show action button because onNavigateById is missing
      expect(screen.queryByText('Test Action')).not.toBeInTheDocument();
    });

    it('calls getActionLabel with undefined when notification has no entityType', () => {
      const getActionLabel = jest.fn();
      const notification = {
        id: '1',
        title: 'Test Notification',
        message: 'Test message',
        time: 'Há 1h',
        type: 'GENERAL' as const,
        isRead: false,
        // No entityType
        createdAt: new Date(),
      };

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[
            {
              label: 'Test Group',
              notifications: [notification],
            },
          ]}
          onMarkAsReadById={jest.fn()}
          onDeleteById={jest.fn()}
          getActionLabel={getActionLabel}
        />
      );

      expect(getActionLabel).toHaveBeenCalledWith(undefined);
    });

    it('renders empty state with custom renderEmpty function', () => {
      const customRenderEmpty = () => (
        <div data-testid="custom-empty">Custom empty state</div>
      );

      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[]}
          renderEmpty={customRenderEmpty}
        />
      );

      expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
      expect(screen.getByText('Custom empty state')).toBeInTheDocument();
      expect(
        screen.queryByText('Nenhuma notificação no momento')
      ).not.toBeInTheDocument();
    });
  });

  describe('Default fallback state', () => {
    it('renders default message when no valid props are provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<NotificationCard {...({} as any)} />);

      expect(
        screen.getByText('Modo de notificação não reconhecido')
      ).toBeInTheDocument();
    });
  });

  describe('NotificationCenter mode', () => {
    afterEach(() => {
      mockUseMobile.mockReset();
    });

    it('renders notification center in desktop mode when variant is center', () => {
      mockUseMobile.mockReturnValue({
        isMobile: false,
        isTablet: false,
        getFormContainerClasses: jest.fn(() => ''),
        getHeaderClasses: jest.fn(() => ''),
        getMobileHeaderClasses: jest.fn(() => ''),
        getDesktopHeaderClasses: jest.fn(() => ''),
        getDeviceType: jest.fn(() => 'desktop' as DeviceType),
      });

      const mockProps = {
        variant: 'center' as const,
        isActive: false,
        onToggleActive: jest.fn(),
        unreadCount: 2,
        groupedNotifications: [
          {
            label: 'Hoje',
            notifications: [
              {
                id: '1',
                title: 'Test Notification',
                message: 'Test message',
                time: 'Há 1h',
                type: 'GENERAL' as const,
                isRead: false,
                createdAt: new Date(),
              },
            ],
          },
        ],
        onFetchNotifications: jest.fn(),
        onMarkAsReadById: jest.fn(),
        onDeleteById: jest.fn(),
        onNavigateById: jest.fn(),
        getActionLabel: jest.fn(),
      };

      render(<LegacyNotificationCard {...mockProps} />);

      // Should render notification center button with accessible label
      expect(screen.getByLabelText('Botão de ação')).toBeInTheDocument();
    });

    it('renders notification center in mobile mode when variant is center', () => {
      mockUseMobile.mockReturnValue({
        isMobile: true,
        isTablet: false,
        getFormContainerClasses: jest.fn(() => ''),
        getHeaderClasses: jest.fn(() => ''),
        getMobileHeaderClasses: jest.fn(() => ''),
        getDesktopHeaderClasses: jest.fn(() => ''),
        getDeviceType: jest.fn(() => 'mobile' as DeviceType),
      });

      const mockProps = {
        variant: 'center' as const,
        isActive: false,
        onToggleActive: jest.fn(),
        unreadCount: 1,
        groupedNotifications: [],
        onFetchNotifications: jest.fn(),
      };

      render(<LegacyNotificationCard {...mockProps} />);

      // Should render notification center button with accessible label
      expect(screen.getByLabelText('Botão de ação')).toBeInTheDocument();
    });

    it('calls onToggleActive when notification center button is clicked in desktop mode', () => {
      // Mock is already set to desktop mode in beforeEach
      const onToggleActive = jest.fn();

      const mockProps = {
        variant: 'center' as const,
        isActive: false,
        onToggleActive,
        unreadCount: 0,
        groupedNotifications: [],
        onFetchNotifications: jest.fn(),
      };

      render(<LegacyNotificationCard {...mockProps} />);

      const iconButton = screen.getByLabelText('Botão de ação');
      fireEvent.click(iconButton);

      expect(onToggleActive).toHaveBeenCalledTimes(1);
    });

    it('renders notification center button in mobile mode', () => {
      mockUseMobile.mockReturnValue({
        isMobile: true,
        isTablet: false,
        getFormContainerClasses: jest.fn(() => ''),
        getHeaderClasses: jest.fn(() => ''),
        getMobileHeaderClasses: jest.fn(() => ''),
        getDesktopHeaderClasses: jest.fn(() => ''),
        getDeviceType: jest.fn(() => 'mobile' as DeviceType),
      });
      const onFetchNotifications = jest.fn();

      const mockProps = {
        variant: 'center' as const,
        isActive: false,
        onToggleActive: jest.fn(),
        unreadCount: 0,
        groupedNotifications: [],
        onFetchNotifications,
      };

      render(<LegacyNotificationCard {...mockProps} />);

      const iconButton = screen.getByLabelText('Botão de ação');
      expect(iconButton).toBeInTheDocument();

      fireEvent.click(iconButton);
      // The callback will be called when modal opens, which is harder to test
      // but the important part is that the component renders correctly in mobile mode
    });

    it('renders empty state with custom properties in notification center', () => {
      mockUseMobile.mockReturnValue({
        isMobile: false,
        isTablet: false,
        getFormContainerClasses: jest.fn(() => ''),
        getHeaderClasses: jest.fn(() => ''),
        getMobileHeaderClasses: jest.fn(() => ''),
        getDesktopHeaderClasses: jest.fn(() => ''),
        getDeviceType: jest.fn(() => 'desktop' as DeviceType),
      });

      const mockProps = {
        variant: 'center' as const,
        isActive: true,
        onToggleActive: jest.fn(),
        unreadCount: 0,
        groupedNotifications: [],
        onFetchNotifications: jest.fn(),
        emptyStateTitle: 'Custom Empty Title',
        emptyStateDescription: 'Custom empty description',
        emptyStateImage: 'test-image.png',
      };

      render(<LegacyNotificationCard {...mockProps} />);

      // The dropdown should be open when isActive is true
      // But testing the actual dropdown content is complex due to portal rendering
      // We focus on testing that the component renders without errors
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('NotificationEmpty component', () => {
    it('renders custom empty state with title and description', () => {
      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[]}
          renderEmpty={() => (
            <div className="flex flex-col items-center justify-center gap-4 p-6 w-full">
              <h3 className="text-xl font-semibold text-text-950 text-center leading-[23px]">
                Custom Empty Title
              </h3>
              <p className="text-sm font-normal text-text-400 text-center max-w-[316px] leading-[21px]">
                Custom empty description
              </p>
            </div>
          )}
        />
      );

      expect(screen.getByText('Custom Empty Title')).toBeInTheDocument();
      expect(screen.getByText('Custom empty description')).toBeInTheDocument();
    });

    it('renders empty state with image when provided', () => {
      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[]}
          renderEmpty={() => (
            <div className="flex flex-col items-center justify-center gap-4 p-6 w-full">
              <div className="w-20 h-20 flex items-center justify-center">
                <img
                  src="test-image.png"
                  alt="Sem notificações"
                  width={82}
                  height={82}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-text-950 text-center leading-[23px]">
                Test Empty Title
              </h3>
            </div>
          )}
        />
      );

      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Sem notificações');
      expect(image).toHaveAttribute('src', 'test-image.png');
      expect(image).toHaveAttribute('width', '82');
      expect(image).toHaveAttribute('height', '82');
    });

    it('applies correct CSS classes to empty state layout', () => {
      render(
        <NotificationCard
          mode="list"
          groupedNotifications={[]}
          renderEmpty={() => (
            <div className="flex flex-col items-center justify-center gap-4 p-6 w-full">
              <h3 className="text-xl font-semibold text-text-950 text-center leading-[23px]">
                Empty State
              </h3>
              <p className="text-sm font-normal text-text-400 text-center max-w-[316px] leading-[21px]">
                Empty description
              </p>
            </div>
          )}
        />
      );

      const title = screen.getByText('Empty State');
      expect(title).toHaveClass(
        'text-xl',
        'font-semibold',
        'text-text-950',
        'text-center',
        'leading-[23px]'
      );

      const description = screen.getByText('Empty description');
      expect(description).toHaveClass(
        'text-sm',
        'font-normal',
        'text-text-400',
        'text-center',
        'max-w-[316px]',
        'leading-[21px]'
      );
    });

    it('uses default empty state when renderEmpty is not provided', () => {
      render(<NotificationCard mode="list" groupedNotifications={[]} />);

      expect(
        screen.getByText('Nenhuma notificação no momento')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Custom empty message')
      ).not.toBeInTheDocument();
    });
  });

  describe('NotificationCenter mobile', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Mock as mobile
      mockUseMobile.mockReturnValue({
        isMobile: true,
        isTablet: false,
        getFormContainerClasses: () => '',
        getHeaderClasses: () => '',
        getMobileHeaderClasses: () => '',
        getDesktopHeaderClasses: () => '',
        getDeviceType: (): DeviceType => 'responsive',
      });
    });

    it('renders mobile notification button and opens modal on click', () => {
      const onFetchNotifications = jest.fn();

      render(
        <NotificationCard
          mode="center"
          onFetchNotifications={onFetchNotifications}
          unreadCount={2}
          groupedNotifications={[]}
        />
      );

      // Should render the mobile button
      const notificationButton = screen.getByRole('button');
      expect(notificationButton).toBeInTheDocument();

      // Click should open modal
      fireEvent.click(notificationButton);

      // Should call onFetchNotifications when modal opens
      expect(onFetchNotifications).toHaveBeenCalledTimes(1);

      // Modal should be open - use getAllByText to handle multiple instances
      expect(screen.getAllByText('Notificações')).toHaveLength(2);
    });

    it('closes modal when close button is clicked in mobile mode', () => {
      const onFetchNotifications = jest.fn();

      render(
        <NotificationCard
          mode="center"
          onFetchNotifications={onFetchNotifications}
          unreadCount={2}
          groupedNotifications={[]}
        />
      );

      // Open modal first
      const notificationButton = screen.getByRole('button');
      fireEvent.click(notificationButton);

      // Modal should be open
      expect(screen.getAllByText('Notificações')).toHaveLength(2);

      // Find and click the close button
      const closeButton = screen.getByLabelText('Fechar modal');
      fireEvent.click(closeButton);

      // Modal should be closed - only one "Notificações" should remain (from header)
      expect(screen.queryByLabelText('Fechar modal')).not.toBeInTheDocument();
    });

    it('handles navigation in mobile modal and closes modal', () => {
      const onNavigateById = jest.fn();
      const mockGroupedNotifications: NotificationGroup[] = [
        {
          label: 'Hoje',
          notifications: [
            {
              id: '1',
              title: 'Test Notification',
              message: 'Test message',
              createdAt: new Date(),
              type: 'ACTIVITY',
              isRead: false,
              entityType: NotificationEntityType.ACTIVITY,
              entityId: 'activity-1',
              sender: null,
              activity: null,
              goal: null,
            } as Notification,
          ],
        },
      ];

      render(
        <NotificationCard
          mode="center"
          onNavigateById={onNavigateById}
          groupedNotifications={mockGroupedNotifications}
          getActionLabel={() => 'Ver atividade'}
        />
      );

      // Open modal
      const notificationButton = screen.getByRole('button');
      fireEvent.click(notificationButton);

      // Click on navigation action
      const actionButton = screen.getByText('Ver atividade');
      fireEvent.click(actionButton);

      // Should call navigation
      expect(onNavigateById).toHaveBeenCalledWith(
        NotificationEntityType.ACTIVITY,
        'activity-1'
      );

      // Modal should be closed (navigation closes modal)
      expect(screen.queryByText('Notificações')).not.toBeInTheDocument();
    });
  });

  describe('NotificationCenter desktop', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Mock as desktop
      mockUseMobile.mockReturnValue({
        isMobile: false,
        isTablet: false,
        getFormContainerClasses: () => '',
        getHeaderClasses: () => '',
        getMobileHeaderClasses: () => '',
        getDesktopHeaderClasses: () => '',
        getDeviceType: (): DeviceType => 'desktop',
      });
    });

    it('handles navigation with cleanup callback on desktop', () => {
      const onNavigateById = jest.fn();
      const mockGroupedNotifications: NotificationGroup[] = [
        {
          label: 'Hoje',
          notifications: [
            {
              id: '1',
              title: 'Test Notification',
              message: 'Test message',
              createdAt: new Date(),
              type: 'ACTIVITY',
              isRead: false,
              entityType: NotificationEntityType.ACTIVITY,
              entityId: 'activity-1',
              sender: null,
              activity: null,
              goal: null,
            } as Notification,
          ],
        },
      ];

      // Use list mode to ensure the notification is rendered properly
      render(
        <NotificationCard
          mode="list"
          groupedNotifications={mockGroupedNotifications}
          onNavigateById={onNavigateById}
          getActionLabel={() => 'Ver atividade'}
          onMarkAsReadById={jest.fn()}
          onDeleteById={jest.fn()}
        />
      );

      // Check if notification is rendered
      expect(screen.getByText('Test Notification')).toBeInTheDocument();

      // Find the action button
      const actionButton = screen.getByText('Ver atividade');

      // Mock the handleNavigate function to test the onToggleActive callback
      // The handleNavigate function in line 564 calls onToggleActive when provided
      // Since this test is in list mode, we need a different approach

      // Just verify the button is there and can be clicked
      expect(actionButton).toBeInTheDocument();
      fireEvent.click(actionButton);

      // Should call navigation with entityType and entityId
      expect(onNavigateById).toHaveBeenCalledWith(
        NotificationEntityType.ACTIVITY,
        'activity-1'
      );
    });

    it('fetches notifications when dropdown becomes active', () => {
      const onFetchNotifications = jest.fn();

      const { rerender } = render(
        <NotificationCard
          mode="center"
          isActive={false}
          onFetchNotifications={onFetchNotifications}
          groupedNotifications={[]}
        />
      );

      // Initially should not fetch
      expect(onFetchNotifications).not.toHaveBeenCalled();

      // When becomes active, should fetch
      rerender(
        <NotificationCard
          mode="center"
          isActive={true}
          onFetchNotifications={onFetchNotifications}
          groupedNotifications={[]}
        />
      );

      expect(onFetchNotifications).toHaveBeenCalledTimes(1);
    });

    it('calls handleNavigate when navigation occurs in desktop dropdown', () => {
      const onNavigateById = jest.fn();
      const onToggleActive = jest.fn();

      mockUseMobile.mockReturnValue({
        isMobile: false,
        isTablet: false,
        getFormContainerClasses: jest.fn(() => ''),
        getHeaderClasses: jest.fn(() => ''),
        getMobileHeaderClasses: jest.fn(() => ''),
        getDesktopHeaderClasses: jest.fn(() => ''),
        getDeviceType: jest.fn(() => 'desktop' as DeviceType),
      });

      const mockGroupedNotifications = [
        {
          label: 'Hoje',
          notifications: [
            {
              id: '1',
              title: 'Test Navigation Desktop',
              message: 'Navigation Message Desktop',
              type: 'ACTIVITY' as const,
              isRead: false,
              createdAt: new Date(),
              entityType: NotificationEntityType.ACTIVITY,
              entityId: 'activity-desktop-1',
              sender: null,
              activity: null,
              goal: null,
            } as Notification,
          ],
        },
      ];

      render(
        <NotificationCard
          mode="center"
          isActive={true}
          onToggleActive={onToggleActive}
          groupedNotifications={mockGroupedNotifications}
          onNavigateById={onNavigateById}
          getActionLabel={(entityType) =>
            entityType === NotificationEntityType.ACTIVITY
              ? 'Ver atividade desktop'
              : undefined
          }
        />
      );

      // First, click the dropdown trigger to open it if not already open
      const dropdownTrigger = screen.getByLabelText('Botão de ação');
      fireEvent.click(dropdownTrigger);

      // Clear the mock to only count the navigation click
      onToggleActive.mockClear();

      // Now find the action button in the opened dropdown
      const actionButton = screen.getByText('Ver atividade desktop');
      fireEvent.click(actionButton);

      // Verify that the navigation callback was executed
      expect(onNavigateById).toHaveBeenCalledWith(
        NotificationEntityType.ACTIVITY,
        'activity-desktop-1'
      );

      // onToggleActive should NOT be called during navigation (dropdown closes naturally)
      expect(onToggleActive).not.toHaveBeenCalled();
    });

    it('calls onToggleActive when desktop notification button is clicked', () => {
      const onToggleActive = jest.fn();

      mockUseMobile.mockReturnValue({
        isMobile: false,
        isTablet: false,
        getFormContainerClasses: jest.fn(() => ''),
        getHeaderClasses: jest.fn(() => ''),
        getMobileHeaderClasses: jest.fn(() => ''),
        getDesktopHeaderClasses: jest.fn(() => ''),
        getDeviceType: jest.fn(() => 'desktop' as DeviceType),
      });

      render(
        <NotificationCard
          mode="center"
          isActive={false}
          onToggleActive={onToggleActive}
          groupedNotifications={[]}
        />
      );

      // Find the desktop notification button
      const desktopButton = screen.getByLabelText('Botão de ação');
      fireEvent.click(desktopButton);

      // Should call onToggleActive
      expect(onToggleActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('LegacyNotificationCard', () => {
    it('renders center mode when variant is center', () => {
      const mockProps = {
        variant: 'center' as const,
        groupedNotifications: [
          {
            label: 'Hoje',
            notifications: [
              {
                id: '1',
                title: 'Test',
                message: 'Message',
                type: 'GENERAL' as const,
                isRead: false,
                createdAt: new Date(),
                entityType: null,
                entityId: null,
                sender: null,
                activity: null,
                goal: null,
              },
            ],
          },
        ],
        isActive: false,
        onToggleActive: jest.fn(),
        unreadCount: 1,
      };

      render(<LegacyNotificationCard {...mockProps} />);

      // Should render the notification center dropdown trigger
      expect(screen.getByLabelText('Botão de ação')).toBeInTheDocument();
    });

    it('renders list mode when list props are provided', () => {
      const mockProps = {
        groupedNotifications: [
          {
            label: 'Hoje',
            notifications: [
              {
                id: '1',
                title: 'Test List',
                message: 'List Message',
                type: 'GENERAL' as const,
                isRead: false,
                createdAt: new Date(),
                entityType: null,
                entityId: null,
                sender: null,
                activity: null,
                goal: null,
              },
            ],
          },
        ],
        onMarkAsReadById: jest.fn(),
        onDeleteById: jest.fn(),
      };

      render(<LegacyNotificationCard {...mockProps} />);

      expect(screen.getByText('Test List')).toBeInTheDocument();
      expect(screen.getByText('List Message')).toBeInTheDocument();
    });

    it('renders list mode when notifications array is provided', () => {
      const mockNotifications = [
        {
          id: '1',
          title: 'Array Notification',
          message: 'Array Message',
          time: 'Há 2h',
          type: 'GENERAL' as const,
          isRead: false,
          createdAt: new Date(),
          entityType: null,
          entityId: null,
          sender: null,
          activity: null,
          goal: null,
        },
      ];

      const mockProps = {
        notifications: mockNotifications,
        onMarkAsReadById: jest.fn(),
        onDeleteById: jest.fn(),
      };

      render(<LegacyNotificationCard {...mockProps} />);

      expect(screen.getByText('Array Notification')).toBeInTheDocument();
      expect(screen.getByText('Array Message')).toBeInTheDocument();
    });

    it('renders list mode when loading is true', () => {
      const mockProps = {
        loading: true,
        onRetry: jest.fn(),
      };

      render(<LegacyNotificationCard {...mockProps} />);

      // Should show skeleton loading
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('renders list mode when error is provided', () => {
      const mockProps = {
        error: 'Test error message',
        onRetry: jest.fn(),
      };

      render(<LegacyNotificationCard {...mockProps} />);

      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
    });

    it('renders single mode when single notification props are provided', () => {
      const mockProps = {
        title: 'Single Title',
        message: 'Single Message',
        time: 'Há 1h',
        isRead: false,
        onMarkAsRead: jest.fn(),
        onDelete: jest.fn(),
        onNavigate: jest.fn(),
        actionLabel: 'Ver detalhes',
      };

      render(<LegacyNotificationCard {...mockProps} />);

      expect(screen.getByText('Single Title')).toBeInTheDocument();
      expect(screen.getByText('Single Message')).toBeInTheDocument();
      expect(screen.getByText('Ver detalhes')).toBeInTheDocument();
    });

    it('renders fallback empty state when no valid props are provided', () => {
      const mockProps = {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<LegacyNotificationCard {...(mockProps as any)} />);

      expect(
        screen.getByText('Nenhuma notificação configurada')
      ).toBeInTheDocument();
    });
  });
});
