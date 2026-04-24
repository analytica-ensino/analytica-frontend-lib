import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ChatbotFab from './ChatbotFab';

describe('ChatbotFab', () => {
  it('renders an accessible button with the default label', () => {
    render(<ChatbotFab onClick={() => undefined} />);
    const btn = screen.getByRole('button', {
      name: /abrir assistente de estudos/i,
    });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('uses the "close" label when isOpen is true', () => {
    render(<ChatbotFab onClick={() => undefined} isOpen />);
    const btn = screen.getByRole('button', { name: /fechar assistente/i });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onClick when pressed', async () => {
    const onClick = jest.fn();
    render(<ChatbotFab onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render the badge when unreadCount is 0', () => {
    render(<ChatbotFab onClick={() => undefined} unreadCount={0} />);
    expect(screen.queryByTestId('chatbot-fab-badge')).not.toBeInTheDocument();
  });

  it('renders the unread badge with the given count', () => {
    render(<ChatbotFab onClick={() => undefined} unreadCount={3} />);
    expect(screen.getByTestId('chatbot-fab-badge')).toHaveTextContent('3');
  });

  it('caps the badge at "9+" when unreadCount > 9', () => {
    render(<ChatbotFab onClick={() => undefined} unreadCount={42} />);
    expect(screen.getByTestId('chatbot-fab-badge')).toHaveTextContent('9+');
  });

  it('announces the unread count to assistive tech via aria-live', () => {
    render(<ChatbotFab onClick={() => undefined} unreadCount={3} />);
    const badge = screen.getByTestId('chatbot-fab-badge');
    expect(badge).toHaveAttribute('aria-live', 'polite');
    expect(badge).toHaveAttribute('aria-label', '3 mensagens não lidas');
  });

  it('uses singular noun when unreadCount is 1', () => {
    render(<ChatbotFab onClick={() => undefined} unreadCount={1} />);
    expect(screen.getByTestId('chatbot-fab-badge')).toHaveAttribute(
      'aria-label',
      '1 mensagem não lida'
    );
  });

  it('includes the unread count in the button aria-label when present', () => {
    render(<ChatbotFab onClick={() => undefined} unreadCount={2} />);
    const btn = screen.getByRole('button', {
      name: /abrir assistente.*2 mensagens não lidas/i,
    });
    expect(btn).toBeInTheDocument();
  });

  it('forwards className', () => {
    render(<ChatbotFab onClick={() => undefined} className="custom-class" />);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
