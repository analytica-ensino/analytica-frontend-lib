import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  const mockImage = '/test-image.png';

  describe('Basic Rendering', () => {
    it('should render with required props only', () => {
      render(<EmptyState image={mockImage} />);

      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute('src', mockImage);
      expect(screen.getByRole('img')).toHaveAttribute(
        'alt',
        'Nenhum dado disponível'
      );
    });

    it('should render default title when title prop is not provided', () => {
      render(<EmptyState image={mockImage} />);

      expect(screen.getByText('Nenhum dado disponível')).toBeInTheDocument();
    });

    it('should render default description when description prop is not provided', () => {
      render(<EmptyState image={mockImage} />);

      expect(
        screen.getByText('Não há dados para exibir no momento.')
      ).toBeInTheDocument();
    });

    it('should render custom title when provided', () => {
      const customTitle = 'Custom Empty Title';
      render(<EmptyState image={mockImage} title={customTitle} />);

      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(
        screen.queryByText('Nenhum dado disponível')
      ).not.toBeInTheDocument();
    });

    it('should render custom description when provided', () => {
      const customDescription = 'Custom empty description text';
      render(<EmptyState image={mockImage} description={customDescription} />);

      expect(screen.getByText(customDescription)).toBeInTheDocument();
      expect(
        screen.queryByText('Não há dados para exibir no momento.')
      ).not.toBeInTheDocument();
    });

    it('should render image with custom alt text from title', () => {
      const customTitle = 'Custom Title';
      render(<EmptyState image={mockImage} title={customTitle} />);

      expect(screen.getByRole('img')).toHaveAttribute('alt', customTitle);
    });
  });

  describe('Button Rendering', () => {
    it('should not render button when buttonText is not provided', () => {
      render(<EmptyState image={mockImage} onButtonClick={vi.fn()} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not render button when onButtonClick is not provided', () => {
      render(<EmptyState image={mockImage} buttonText="Click me" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render button when both buttonText and onButtonClick are provided', () => {
      const buttonText = 'Create Activity';
      render(
        <EmptyState
          image={mockImage}
          buttonText={buttonText}
          onButtonClick={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: buttonText })
      ).toBeInTheDocument();
    });

    it('should call onButtonClick when button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <EmptyState
          image={mockImage}
          buttonText="Click me"
          onButtonClick={handleClick}
        />
      );

      const button = screen.getByRole('button', { name: 'Click me' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render button with icon when buttonIcon is provided', () => {
      const IconComponent = () => <span data-testid="custom-icon">Icon</span>;

      render(
        <EmptyState
          image={mockImage}
          buttonText="Create"
          buttonIcon={<IconComponent />}
          onButtonClick={vi.fn()}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Button Variants and Actions', () => {
    it('should render button with default variant (solid)', () => {
      render(
        <EmptyState
          image={mockImage}
          buttonText="Click me"
          onButtonClick={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('analytica-button-solid');
    });

    it('should render button with outline variant when specified', () => {
      render(
        <EmptyState
          image={mockImage}
          buttonText="Click me"
          buttonVariant="outline"
          onButtonClick={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('analytica-button-outline');
    });

    it('should render button with default action (primary)', () => {
      render(
        <EmptyState
          image={mockImage}
          buttonText="Click me"
          onButtonClick={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('analytica-button-primary');
    });

    it('should render button with positive action when specified', () => {
      render(
        <EmptyState
          image={mockImage}
          buttonText="Click me"
          buttonAction="positive"
          onButtonClick={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('analytica-button-positive');
    });

    it('should render button with custom variant and action', () => {
      render(
        <EmptyState
          image={mockImage}
          buttonText="Click me"
          buttonVariant="outline"
          buttonAction="negative"
          onButtonClick={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('analytica-button-outline');
      expect(button.className).toContain('analytica-button-negative');
    });
  });

  describe('Layout and Structure', () => {
    it('should render with horizontal layout (flex-row)', () => {
      const { container } = render(<EmptyState image={mockImage} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'flex-row');
    });

    it('should render image container with fixed dimensions', () => {
      render(<EmptyState image={mockImage} />);

      const img = screen.getByRole('img');
      const imgContainer = img.parentElement;

      expect(imgContainer).toHaveClass('w-72', 'h-72', 'flex-shrink-0');
    });

    it('should render with minimum height', () => {
      const { container } = render(<EmptyState image={mockImage} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('min-h-96');
    });

    it('should render with maximum width', () => {
      const { container } = render(<EmptyState image={mockImage} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('max-w-4xl');
    });
  });

  describe('Complete Props', () => {
    it('should render all props correctly', () => {
      const props = {
        image: mockImage,
        title: 'Complete Title',
        description: 'Complete Description',
        buttonText: 'Complete Button',
        buttonIcon: <span data-testid="icon">+</span>,
        onButtonClick: vi.fn(),
        buttonVariant: 'outline' as const,
        buttonAction: 'positive' as const,
      };

      render(<EmptyState {...props} />);

      expect(screen.getByRole('img')).toHaveAttribute('src', mockImage);
      expect(screen.getByText(props.title)).toBeInTheDocument();
      expect(screen.getByText(props.description)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: props.buttonText })
      ).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading role for title', () => {
      const customTitle = 'Accessible Title';
      render(<EmptyState image={mockImage} title={customTitle} />);

      const heading = screen.getByRole('heading', { name: customTitle });
      expect(heading).toBeInTheDocument();
    });

    it('should have descriptive alt text for image', () => {
      const customTitle = 'Activity State';
      render(<EmptyState image={mockImage} title={customTitle} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', customTitle);
    });

    it('should render button with proper text content', () => {
      const buttonText = 'Create New Item';
      render(
        <EmptyState
          image={mockImage}
          buttonText={buttonText}
          onButtonClick={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: buttonText })
      ).toBeInTheDocument();
    });
  });
});
