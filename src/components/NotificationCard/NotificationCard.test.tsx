import { render, screen, fireEvent } from '@testing-library/react';
import NotificationCard, { NotificationGroup } from './NotificationCard';

// Mock para a imagem PNG
jest.mock(
  '../../assets/img/no-notification-result.png',
  () => 'test-file-stub'
);

describe('NotificationCard', () => {
  const defaultProps = {
    title: 'Test Title',
    message: 'Test message content',
    time: 'Há 3h',
    isRead: false,
    onMarkAsRead: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
      <div onClick={parentClickHandler}>
        <NotificationCard {...defaultProps} />
      </div>
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
      <div onClick={parentClickHandler}>
        <NotificationCard
          {...defaultProps}
          onNavigate={onNavigate}
          actionLabel="Ver atividade"
        />
      </div>
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
        isRead: false,
        entityType: 'activity',
        entityId: 'act-1',
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'Test Notification 2',
        message: 'Test message 2',
        time: 'Há 2h',
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
      render(<NotificationCard loading={true} />);

      // Should render 3 skeleton cards
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders error state correctly', () => {
      const errorMessage = 'Failed to load notifications';
      const onRetry = jest.fn();

      render(<NotificationCard error={errorMessage} onRetry={onRetry} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Tentar novamente')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Tentar novamente'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('renders error state without retry button when onRetry is not provided', () => {
      const errorMessage = 'Failed to load notifications';

      render(<NotificationCard error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText('Tentar novamente')).not.toBeInTheDocument();
    });

    it('renders empty state when no notifications are provided', () => {
      render(<NotificationCard groupedNotifications={[]} />);

      expect(
        screen.getByText('Nenhuma notificação no momento')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Você está em dia com todas as novidades/)
      ).toBeInTheDocument();
      expect(screen.getByAltText('Sem notificações')).toBeInTheDocument();
    });

    it('renders custom empty state when renderEmpty is provided', () => {
      const customEmptyState = () => <div>Custom empty message</div>;

      render(
        <NotificationCard
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
        if (entityType === 'activity') return 'Ver atividade';
        return undefined;
      });

      render(
        <NotificationCard
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

      expect(onNavigateById).toHaveBeenCalledWith('activity', 'act-1');
    });

    it('does not show action button when notification has no entity data', () => {
      render(
        <NotificationCard
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

      expect(getActionLabel).toHaveBeenCalledWith('activity');
      expect(
        screen.queryByRole('button', { name: /ver/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('NotificationEmpty component', () => {
    it('renders empty state with correct image and text', () => {
      render(<NotificationCard groupedNotifications={[]} />);

      const image = screen.getByAltText('Sem notificações');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('width', '82');
      expect(image).toHaveAttribute('height', '82');
      expect(image).toHaveClass('object-contain');

      expect(
        screen.getByText('Nenhuma notificação no momento')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Você está em dia com todas as novidades/)
      ).toBeInTheDocument();
    });

    it('applies correct CSS classes for empty state layout', () => {
      const { container } = render(
        <NotificationCard groupedNotifications={[]} />
      );

      const emptyStateContainer = container.querySelector(
        '.flex.flex-col.items-center.justify-center.gap-4.p-6.w-full'
      );
      expect(emptyStateContainer).toBeInTheDocument();

      const imageContainer = container.querySelector(
        '.w-20.h-20.flex.items-center.justify-center'
      );
      expect(imageContainer).toBeInTheDocument();

      const title = screen.getByText('Nenhuma notificação no momento');
      expect(title).toHaveClass(
        'text-xl',
        'font-semibold',
        'text-text-950',
        'text-center',
        'leading-[23px]'
      );

      const description = screen.getByText(
        /Você está em dia com todas as novidades/
      );
      expect(description).toHaveClass(
        'text-sm',
        'font-normal',
        'text-text-400',
        'text-center',
        'max-w-[316px]',
        'leading-[21px]'
      );
    });

    it('renders group header when notifications array is empty', () => {
      render(<NotificationCard notifications={[]} />);

      expect(screen.getByText('Notificações')).toBeInTheDocument(); // Group header
      // No notifications are rendered within the group since array is empty
      expect(
        screen.queryByRole('heading', { level: 3 })
      ).not.toBeInTheDocument(); // No notification titles
    });

    it('renders empty state when groupedNotifications is null', () => {
      render(
        <NotificationCard
          groupedNotifications={null as unknown as NotificationGroup[]}
        />
      );

      expect(
        screen.getByText('Nenhuma notificação no momento')
      ).toBeInTheDocument();
    });

    it('renders fallback state when groupedNotifications is undefined', () => {
      render(<NotificationCard groupedNotifications={undefined} />);

      expect(
        screen.getByText('Nenhuma notificação configurada')
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
      render(<NotificationCard loading={true} />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders list mode when error prop is provided', () => {
      render(<NotificationCard error="Test error" />);

      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('renders fallback when incomplete single card props are provided', () => {
      render(
        <NotificationCard
          title="Only title"
          // Missing required props
        />
      );

      expect(
        screen.getByText('Nenhuma notificação configurada')
      ).toBeInTheDocument();
    });

    it('renders fallback when isRead is undefined', () => {
      render(
        <NotificationCard
          title="Test Title"
          message="Test message"
          time="Há 3h"
          // isRead is undefined
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
        <NotificationCard
          title="Test Title"
          message="Test message"
          // time is undefined
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
        isRead: false,
        entityId: 'some-id', // Has entityId but no entityType
        createdAt: new Date(),
      };

      render(
        <NotificationCard
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
        isRead: false,
        entityType: 'activity', // Has entityType but no entityId
        createdAt: new Date(),
      };

      render(
        <NotificationCard
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
        isRead: false,
        entityType: 'activity',
        entityId: 'act-1',
        createdAt: new Date(),
      };

      render(
        <NotificationCard
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
        isRead: false,
        // No entityType
        createdAt: new Date(),
      };

      render(
        <NotificationCard
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
      render(<NotificationCard />);

      expect(
        screen.getByText('Nenhuma notificação configurada')
      ).toBeInTheDocument();
    });
  });
});
