import { render, screen, fireEvent } from '@testing-library/react';
import NotificationCard from './NotificationCard';

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
});
