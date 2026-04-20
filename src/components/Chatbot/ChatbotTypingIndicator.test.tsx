import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatbotTypingIndicator from './ChatbotTypingIndicator';

describe('ChatbotTypingIndicator', () => {
  it('renders with a status role and aria label', () => {
    render(<ChatbotTypingIndicator />);
    const el = screen.getByRole('status', { name: /assistente digitando/i });
    expect(el).toBeInTheDocument();
  });

  it('renders three animated dots', () => {
    const { container } = render(<ChatbotTypingIndicator />);
    const dots = container.querySelectorAll('span.animate-bounce');
    expect(dots).toHaveLength(3);
  });

  it('forwards className', () => {
    render(<ChatbotTypingIndicator className="custom" />);
    expect(screen.getByRole('status')).toHaveClass('custom');
  });
});
