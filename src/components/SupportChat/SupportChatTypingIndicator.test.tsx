import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportChatTypingIndicator from './SupportChatTypingIndicator';

describe('SupportChatTypingIndicator', () => {
  it('renders the caption with the name of who is typing', () => {
    render(<SupportChatTypingIndicator name="Beatriz" />);

    expect(screen.getByText('Beatriz está digitando…')).toBeInTheDocument();
  });

  it('is a polite live status region', () => {
    render(<SupportChatTypingIndicator name="Beatriz" />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Beatriz está digitando…');
  });

  it('renders three decorative bouncing dots that respect reduced motion', () => {
    render(<SupportChatTypingIndicator name="Beatriz" />);

    expect(screen.getByTestId('support-chat-typing-bubble')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    const dots = screen.getAllByTestId('support-chat-typing-dot');
    expect(dots).toHaveLength(3);
    dots.forEach((dot) => {
      expect(dot).toHaveClass('animate-bounce', 'motion-reduce:animate-none');
    });
  });

  it('forwards className to the root', () => {
    render(<SupportChatTypingIndicator name="Beatriz" className="custom" />);

    expect(screen.getByRole('status')).toHaveClass('custom');
  });
});
