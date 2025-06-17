import { render, screen } from '@testing-library/react';
import Text from './Text';

describe('Text Component', () => {
  it('renders text content correctly', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders as paragraph by default', () => {
    render(<Text data-testid="text">Hello World</Text>);
    const textElement = screen.getByTestId('text');
    expect(textElement.tagName).toBe('P');
  });

  it('renders with different HTML tags', () => {
    render(
      <Text as="h1" data-testid="heading">
        Hello World
      </Text>
    );
    const headingElement = screen.getByTestId('heading');
    expect(headingElement.tagName).toBe('H1');
  });

  it('applies default classes correctly', () => {
    render(<Text data-testid="text">Hello World</Text>);
    const textElement = screen.getByTestId('text');
    expect(textElement).toHaveClass('font-primary');
    expect(textElement).toHaveClass('text-md');
    expect(textElement).toHaveClass('font-normal');
    expect(textElement).toHaveClass('text-text-950');
  });

  describe('Size variants', () => {
    it('applies 2xs size class', () => {
      render(
        <Text size="2xs" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-2xs');
    });

    it('applies xs size class', () => {
      render(
        <Text size="xs" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-xs');
    });

    it('applies sm size class', () => {
      render(
        <Text size="sm" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-sm');
    });

    it('applies md size class (default)', () => {
      render(
        <Text size="md" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-md');
    });

    it('applies lg size class', () => {
      render(
        <Text size="lg" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-lg');
    });

    it('applies xl size class', () => {
      render(
        <Text size="xl" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-xl');
    });

    it('applies 2xl size class', () => {
      render(
        <Text size="2xl" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-2xl');
    });

    it('applies 3xl size class', () => {
      render(
        <Text size="3xl" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-3xl');
    });

    it('applies 4xl size class', () => {
      render(
        <Text size="4xl" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-4xl');
    });

    it('applies 5xl size class', () => {
      render(
        <Text size="5xl" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-5xl');
    });

    it('applies 6xl size class', () => {
      render(
        <Text size="6xl" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-6xl');
    });

    it('applies default md size class when size prop is not provided', () => {
      render(<Text data-testid="text">Hello World</Text>);
      expect(screen.getByTestId('text')).toHaveClass('text-md');
    });

    it('applies default md size class when invalid size is provided', () => {
      render(
        <Text
          size={
            'invalid' as
              | '2xs'
              | 'xs'
              | 'sm'
              | 'md'
              | 'lg'
              | 'xl'
              | '2xl'
              | '3xl'
              | '4xl'
              | '5xl'
              | '6xl'
          }
          data-testid="text"
        >
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-md');
    });

    it('combines size class with other classes correctly', () => {
      render(
        <Text size="lg" weight="bold" color="text-info-800" data-testid="text">
          Hello World
        </Text>
      );
      const element = screen.getByTestId('text');
      expect(element).toHaveClass('text-lg');
      expect(element).toHaveClass('font-bold');
      expect(element).toHaveClass('text-info-800');
    });
  });

  describe('Weight variants', () => {
    it('applies hairline weight class', () => {
      render(
        <Text weight="hairline" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('font-hairline');
    });

    it('applies light weight class', () => {
      render(
        <Text weight="light" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('font-light');
    });

    it('applies normal weight class (default)', () => {
      render(
        <Text weight="normal" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('font-normal');
    });

    it('applies medium weight class', () => {
      render(
        <Text weight="medium" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('font-medium');
    });

    it('applies semibold weight class', () => {
      render(
        <Text weight="semibold" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('font-semibold');
    });

    it('applies bold weight class', () => {
      render(
        <Text weight="bold" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('font-bold');
    });

    it('applies extrabold weight class', () => {
      render(
        <Text weight="extrabold" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('font-extrabold');
    });

    it('applies black weight class', () => {
      render(
        <Text weight="black" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('font-black');
    });

    it('applies default normal weight class when weight prop is not provided', () => {
      render(<Text data-testid="text">Hello World</Text>);
      expect(screen.getByTestId('text')).toHaveClass('font-normal');
    });

    it('applies default normal weight class when invalid weight is provided', () => {
      render(
        <Text
          weight={
            'invalid' as
              | 'hairline'
              | 'light'
              | 'normal'
              | 'medium'
              | 'semibold'
              | 'bold'
              | 'extrabold'
              | 'black'
          }
          data-testid="text"
        >
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('font-normal');
    });

    it('combines weight class with other classes correctly', () => {
      render(
        <Text weight="bold" size="lg" color="text-info-800" data-testid="text">
          Hello World
        </Text>
      );
      const element = screen.getByTestId('text');
      expect(element).toHaveClass('font-bold');
      expect(element).toHaveClass('text-lg');
      expect(element).toHaveClass('text-info-800');
    });
  });

  describe('Color variants', () => {
    it('applies default black color class when color prop is not provided', () => {
      render(<Text data-testid="text">Hello World</Text>);
      expect(screen.getByTestId('text')).toHaveClass('text-text-950');
    });

    it('applies custom color class', () => {
      render(
        <Text color="text-info-800" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text')).toHaveClass('text-info-800');
    });
  });

  describe('HTML tag variants', () => {
    it('renders as span when specified', () => {
      render(
        <Text as="span" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text').tagName).toBe('SPAN');
    });

    it('renders as div when specified', () => {
      render(
        <Text as="div" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text').tagName).toBe('DIV');
    });

    it('renders as h1 when specified', () => {
      render(
        <Text as="h1" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text').tagName).toBe('H1');
    });

    it('renders as h2 when specified', () => {
      render(
        <Text as="h2" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text').tagName).toBe('H2');
    });

    it('renders as h3 when specified', () => {
      render(
        <Text as="h3" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text').tagName).toBe('H3');
    });

    it('renders as h4 when specified', () => {
      render(
        <Text as="h4" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text').tagName).toBe('H4');
    });

    it('renders as h5 when specified', () => {
      render(
        <Text as="h5" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text').tagName).toBe('H5');
    });

    it('renders as h6 when specified', () => {
      render(
        <Text as="h6" data-testid="text">
          Hello World
        </Text>
      );
      expect(screen.getByTestId('text').tagName).toBe('H6');
    });
  });

  it('applies custom className correctly', () => {
    render(
      <Text className="custom-class" data-testid="text">
        Hello World
      </Text>
    );
    expect(screen.getByTestId('text')).toHaveClass('custom-class');
  });

  it('passes through HTML attributes correctly', () => {
    render(
      <Text id="test-id" data-testid="text">
        Hello World
      </Text>
    );
    expect(screen.getByTestId('text')).toHaveAttribute('id', 'test-id');
  });

  it('combines multiple props correctly', () => {
    render(
      <Text
        as="h2"
        size="xl"
        weight="bold"
        color="text-info-800"
        className="custom-class"
        data-testid="text"
      >
        Hello World
      </Text>
    );

    const textElement = screen.getByTestId('text');
    expect(textElement.tagName).toBe('H2');
    expect(textElement).toHaveClass('font-primary');
    expect(textElement).toHaveClass('text-xl');
    expect(textElement).toHaveClass('font-bold');
    expect(textElement).toHaveClass('text-info-800');
    expect(textElement).toHaveClass('custom-class');
  });
});
