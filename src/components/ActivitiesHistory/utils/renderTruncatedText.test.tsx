import { render, screen } from '@testing-library/react';
import { renderTruncatedText } from './renderTruncatedText';

describe('renderTruncatedText', () => {
  it('should render string value correctly', () => {
    render(<>{renderTruncatedText('Test Text')}</>);
    expect(screen.getByText('Test Text')).toBeInTheDocument();
  });

  it('should render empty string for non-string values', () => {
    const { container } = render(<>{renderTruncatedText(123)}</>);
    expect(container.textContent).toBe('');
  });

  it('should render empty string for null', () => {
    const { container } = render(<>{renderTruncatedText(null)}</>);
    expect(container.textContent).toBe('');
  });

  it('should render empty string for undefined', () => {
    const { container } = render(<>{renderTruncatedText(undefined)}</>);
    expect(container.textContent).toBe('');
  });

  it('should have title attribute with the text', () => {
    render(<>{renderTruncatedText('Long Text')}</>);
    const element = screen.getByText('Long Text');
    expect(element).toHaveAttribute('title', 'Long Text');
  });
});
