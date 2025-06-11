import { render, screen } from '@testing-library/react';
import { Text } from './Text';

describe('Text Component - Polymorphic Type Safety', () => {
  it('renders as different HTML elements with correct attributes', () => {
    // Test anchor element with href
    render(
      <Text as="a" href="/test" target="_blank" data-testid="link">
        Link Text
      </Text>
    );
    const linkElement = screen.getByTestId('link');
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveAttribute('href', '/test');
    expect(linkElement).toHaveAttribute('target', '_blank');

    // Test button element with onClick
    const handleClick = jest.fn();
    render(
      <Text as="button" onClick={handleClick} disabled data-testid="button">
        Button Text
      </Text>
    );
    const buttonElement = screen.getByTestId('button');
    expect(buttonElement.tagName).toBe('BUTTON');
    expect(buttonElement).toBeDisabled();

    // Test input element with type and placeholder (void element - no children)
    render(
      <Text
        as="input"
        type="text"
        placeholder="Enter text"
        data-testid="input"
      />
    );
    const inputElement = screen.getByTestId('input');
    expect(inputElement.tagName).toBe('INPUT');
    expect(inputElement).toHaveAttribute('type', 'text');
    expect(inputElement).toHaveAttribute('placeholder', 'Enter text');
  });

  it('preserves text component props alongside element-specific props', () => {
    render(
      <Text
        as="a"
        href="/test"
        size="xl"
        weight="bold"
        color="white"
        className="custom-class"
        data-testid="styled-link"
      >
        Styled Link
      </Text>
    );

    const element = screen.getByTestId('styled-link');
    expect(element.tagName).toBe('A');
    expect(element).toHaveAttribute('href', '/test');
    expect(element).toHaveClass('font-primary');
    expect(element).toHaveClass('text-xl');
    expect(element).toHaveClass('font-bold');
    expect(element).toHaveClass('text-text');
    expect(element).toHaveClass('custom-class');
  });

  it('defaults to paragraph when no as prop is provided', () => {
    render(<Text data-testid="default-element">Default Text</Text>);

    const element = screen.getByTestId('default-element');
    expect(element.tagName).toBe('P');
  });

  it('works with form elements and their specific attributes', () => {
    render(
      <Text as="label" htmlFor="test-input" data-testid="label">
        Label Text
      </Text>
    );

    const labelElement = screen.getByTestId('label');
    expect(labelElement.tagName).toBe('LABEL');
    expect(labelElement).toHaveAttribute('for', 'test-input');
  });

  it('works with semantic HTML elements', () => {
    render(
      <Text as="article" role="main" data-testid="article">
        Article Content
      </Text>
    );

    const articleElement = screen.getByTestId('article');
    expect(articleElement.tagName).toBe('ARTICLE');
    expect(articleElement).toHaveAttribute('role', 'main');
  });
});
