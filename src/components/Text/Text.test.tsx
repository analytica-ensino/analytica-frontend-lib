import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { Text } from './Text';

describe('Text', () => {
  it('renders the text with children content', () => {
    render(<Text>Test content</Text>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<Text>Test</Text>);
    const textElement = screen.getByText('Test');
    expect(textElement).toHaveClass('font-roboto');
    expect(textElement).toHaveClass('text-base');
    expect(textElement).toHaveClass('font-normal');
    expect(textElement).toHaveClass('text-black');
  });

  it('renders as paragraph by default', () => {
    render(<Text>Test</Text>);
    const textElement = screen.getByText('Test');
    expect(textElement.tagName).toBe('P');
  });

  describe('size variants', () => {
    it('applies xs size classes', () => {
      render(<Text size="xs">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('text-xs');
    });

    it('applies sm size classes', () => {
      render(<Text size="sm">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('text-sm');
    });

    it('applies lg size classes', () => {
      render(<Text size="lg">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('text-lg');
    });

    it('applies xl size classes', () => {
      render(<Text size="xl">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('text-xl');
    });

    it('applies 2xl size classes', () => {
      render(<Text size="2xl">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('text-2xl');
    });

    it('applies 3xl size classes', () => {
      render(<Text size="3xl">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('text-3xl');
    });

    it('applies 4xl size classes', () => {
      render(<Text size="4xl">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('text-4xl');
    });

    it('applies 5xl size classes', () => {
      render(<Text size="5xl">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('text-5xl');
    });
  });

  describe('weight variants', () => {
    it('applies hairline weight classes', () => {
      render(<Text weight="hairline">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('font-hairline');
    });

    it('applies light weight classes', () => {
      render(<Text weight="light">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('font-light');
    });

    it('applies medium weight classes', () => {
      render(<Text weight="medium">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('font-medium');
    });

    it('applies semibold weight classes', () => {
      render(<Text weight="semibold">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('font-semibold');
    });

    it('applies bold weight classes', () => {
      render(<Text weight="bold">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('font-bold');
    });

    it('applies extrabold weight classes', () => {
      render(<Text weight="extrabold">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('font-extrabold');
    });

    it('applies black weight classes', () => {
      render(<Text weight="black">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('font-black');
    });
  });

  describe('color variants', () => {
    it('applies white color classes', () => {
      render(<Text color="white">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('text-white');
    });

    it('applies black color classes by default', () => {
      render(<Text color="black">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement).toHaveClass('text-black');
    });
  });

  describe('HTML element variants', () => {
    it('renders as h1 when specified', () => {
      render(<Text as="h1">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement.tagName).toBe('H1');
    });

    it('renders as h2 when specified', () => {
      render(<Text as="h2">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement.tagName).toBe('H2');
    });

    it('renders as span when specified', () => {
      render(<Text as="span">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement.tagName).toBe('SPAN');
    });

    it('renders as div when specified', () => {
      render(<Text as="div">Test</Text>);
      const textElement = screen.getByText('Test');
      expect(textElement.tagName).toBe('DIV');
    });
  });

  it('applies custom className', () => {
    render(<Text className="custom-class">Test</Text>);
    const textElement = screen.getByText('Test');
    expect(textElement).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <Text id="test-id" data-testid="text-element">
        Test
      </Text>
    );
    const textElement = screen.getByText('Test');
    expect(textElement).toHaveAttribute('id', 'test-id');
    expect(textElement).toHaveAttribute('data-testid', 'text-element');
  });

  it('combines multiple props correctly', () => {
    render(
      <Text
        as="h1"
        size="xl"
        weight="bold"
        color="white"
        className="custom-class"
      >
        Test
      </Text>
    );
    const textElement = screen.getByText('Test');
    expect(textElement.tagName).toBe('H1');
    expect(textElement).toHaveClass('font-roboto');
    expect(textElement).toHaveClass('text-xl');
    expect(textElement).toHaveClass('font-bold');
    expect(textElement).toHaveClass('text-white');
    expect(textElement).toHaveClass('custom-class');
  });
});
