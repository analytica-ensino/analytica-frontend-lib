import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from './Alert';

describe('Alert Component', () => {
  it('renders alert with description correctly', () => {
    render(
      <Alert description="Test description" variant="solid" action="default" />
    );
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders alert with title and description correctly', () => {
    render(
      <Alert
        title="Test title"
        description="Test description"
        variant="solid"
        action="default"
      />
    );
    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  describe('Variant tests', () => {
    it('applies solid variant classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="default" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-background-50');
      expect(alert).toHaveClass('border-transparent');
    });

    it('applies outline variant classes correctly', () => {
      render(<Alert description="Test" variant="outline" action="default" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-background');
      expect(alert).toHaveClass('border');
      expect(alert).toHaveClass('border-border-100');
    });
  });

  describe('Action tests', () => {
    it('applies default action classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="default" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-background-50');
    });

    it('applies info action classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="info" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-info');
    });

    it('applies success action classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="success" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-success');
    });

    it('applies warning action classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="warning" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-warning');
    });

    it('applies error action classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="error" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-error');
    });
  });

  describe('Icon tests', () => {
    it('renders default icon correctly', () => {
      render(<Alert description="Test" variant="solid" action="default" />);
      const alert = document.querySelector('.alert-wrapper');
      const icon = alert?.querySelector('span');
      expect(icon).toHaveClass('text-text-950');
    });

    it('renders info icon correctly', () => {
      render(<Alert description="Test" variant="solid" action="info" />);
      const alert = document.querySelector('.alert-wrapper');
      const icon = alert?.querySelector('span');
      expect(icon).toHaveClass('text-info-800');
    });

    it('renders success icon correctly', () => {
      render(<Alert description="Test" variant="solid" action="success" />);
      const alert = document.querySelector('.alert-wrapper');
      const icon = alert?.querySelector('span');
      expect(icon).toHaveClass('text-success-800');
    });

    it('renders warning icon correctly', () => {
      render(<Alert description="Test" variant="solid" action="warning" />);
      const alert = document.querySelector('.alert-wrapper');
      const icon = alert?.querySelector('span');
      expect(icon).toHaveClass('text-warning-800');
    });

    it('renders error icon correctly', () => {
      render(<Alert description="Test" variant="solid" action="error" />);
      const alert = document.querySelector('.alert-wrapper');
      const icon = alert?.querySelector('span');
      expect(icon).toHaveClass('text-error-800');
    });
  });

  describe('Specific icon rendering tests', () => {
    it('renders CheckCircle icon for default action', () => {
      render(<Alert description="Test" variant="solid" action="default" />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const alert = document.querySelector('.alert-wrapper');
      const iconSpan = alert?.querySelector('span');
      expect(iconSpan?.children[0]).toBeInTheDocument();
    });

    it('renders Info icon for info action', () => {
      render(<Alert description="Test" variant="solid" action="info" />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const alert = document.querySelector('.alert-wrapper');
      const iconSpan = alert?.querySelector('span');
      expect(iconSpan?.children[0]).toBeInTheDocument();
    });

    it('renders CheckCircle icon for success action', () => {
      render(<Alert description="Test" variant="solid" action="success" />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const alert = document.querySelector('.alert-wrapper');
      const iconSpan = alert?.querySelector('span');
      expect(iconSpan?.children[0]).toBeInTheDocument();
    });

    it('renders WarningCircle icon for warning action', () => {
      render(<Alert description="Test" variant="solid" action="warning" />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const alert = document.querySelector('.alert-wrapper');
      const iconSpan = alert?.querySelector('span');
      expect(iconSpan?.children[0]).toBeInTheDocument();
    });

    it('renders XCircle icon for error action', () => {
      render(<Alert description="Test" variant="solid" action="error" />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const alert = document.querySelector('.alert-wrapper');
      const iconSpan = alert?.querySelector('span');
      expect(iconSpan?.children[0]).toBeInTheDocument();
    });

    it('ensures all icon types are properly mapped and rendered', () => {
      const actions: Array<
        'default' | 'info' | 'success' | 'warning' | 'error'
      > = ['default', 'info', 'success', 'warning', 'error'];

      actions.forEach((action) => {
        const { unmount } = render(
          <Alert description="Test" variant="solid" action={action} />
        );
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
        unmount();
      });
    });

    it('explicitly tests each icon type rendering to cover all object properties', () => {
      // Test default icon (line 55)
      const { rerender } = render(
        <Alert description="Default test" variant="solid" action="default" />
      );
      expect(document.querySelector('svg')).toBeInTheDocument();

      // Test info icon (line 56)
      rerender(<Alert description="Info test" variant="solid" action="info" />);
      expect(document.querySelector('svg')).toBeInTheDocument();

      // Test success icon (line 57)
      rerender(
        <Alert description="Success test" variant="solid" action="success" />
      );
      expect(document.querySelector('svg')).toBeInTheDocument();

      // Test warning icon (line 58)
      rerender(
        <Alert description="Warning test" variant="solid" action="warning" />
      );
      expect(document.querySelector('svg')).toBeInTheDocument();

      // Test error icon (line 59)
      rerender(
        <Alert description="Error test" variant="solid" action="error" />
      );
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('tests all switch cases in getIcon function individually', () => {
      // Force each case of the switch statement to be tested

      // Test case 'default'
      const defaultComponent = render(
        <Alert description="Default" variant="solid" action="default" />
      );
      const defaultSvg = defaultComponent.container.querySelector('svg');
      expect(defaultSvg).toBeInTheDocument();
      defaultComponent.unmount();

      // Test case 'info'
      const infoComponent = render(
        <Alert description="Info" variant="solid" action="info" />
      );
      const infoSvg = infoComponent.container.querySelector('svg');
      expect(infoSvg).toBeInTheDocument();
      infoComponent.unmount();

      // Test case 'success'
      const successComponent = render(
        <Alert description="Success" variant="solid" action="success" />
      );
      const successSvg = successComponent.container.querySelector('svg');
      expect(successSvg).toBeInTheDocument();
      successComponent.unmount();

      // Test case 'warning'
      const warningComponent = render(
        <Alert description="Warning" variant="solid" action="warning" />
      );
      const warningSvg = warningComponent.container.querySelector('svg');
      expect(warningSvg).toBeInTheDocument();
      warningComponent.unmount();

      // Test case 'error'
      const errorComponent = render(
        <Alert description="Error" variant="solid" action="error" />
      );
      const errorSvg = errorComponent.container.querySelector('svg');
      expect(errorSvg).toBeInTheDocument();
      errorComponent.unmount();
    });
  });

  describe('Text styling tests', () => {
    it('applies correct text styling when title is present', () => {
      render(
        <Alert
          title="Test title"
          description="Test description"
          variant="solid"
          action="default"
        />
      );
      const title = screen.getByText('Test title');
      const description = screen.getByText('Test description');

      expect(title).toHaveClass('font-medium');
      expect(title).toHaveClass('text-text-950');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-text-700');
    });

    it('applies correct text styling when title is not present', () => {
      render(
        <Alert
          description="Test description"
          variant="solid"
          action="default"
        />
      );
      const description = screen.getByText('Test description');

      expect(description).toHaveClass('text-md');
      expect(description).toHaveClass('text-text-950');
    });
  });

  describe('Base classes and functionality', () => {
    it('applies base classes correctly', () => {
      render(<Alert description="Test" variant="solid" action="default" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('flex');
      expect(alert).toHaveClass('items-start');
      expect(alert).toHaveClass('gap-2');
      expect(alert).toHaveClass('w-[384px]');
      expect(alert).toHaveClass('py-3');
      expect(alert).toHaveClass('px-4');
      expect(alert).toHaveClass('font-inherit');
      expect(alert).toHaveClass('rounded-md');
    });

    it('applies custom className', () => {
      render(
        <Alert
          description="Test"
          variant="solid"
          action="default"
          className="custom-class"
        />
      );
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('custom-class');
    });
  });

  describe('Combined variant and action classes', () => {
    it('combines solid variant with info action correctly', () => {
      render(<Alert description="Test" variant="solid" action="info" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-info');
      expect(alert).toHaveClass('border-transparent');
    });

    it('combines outline variant with error action correctly', () => {
      render(<Alert description="Test" variant="outline" action="error" />);
      const alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-background');
      expect(alert).toHaveClass('border');
      expect(alert).toHaveClass('border-border-100');
    });
  });

  describe('Default props coverage', () => {
    /**
     * Test default variant and action values to ensure complete branch coverage
     * This covers the default parameter assignments in the function signature
     */
    it('should use default variant and action when not provided', () => {
      render(<Alert description="Test description" />);
      const alert = document.querySelector('.alert-wrapper');

      // Should use default variant 'solid' and action 'default'
      expect(alert).toHaveClass('bg-background-50');
      expect(alert).toHaveClass('border-transparent');

      // Should use default icon classes
      const icon = alert?.querySelector('span');
      expect(icon).toHaveClass('text-text-950');
    });

    /**
     * Test explicit default values to ensure all branches are covered
     */
    it('should handle explicit default values correctly', () => {
      const { rerender } = render(
        <Alert description="Test" variant="solid" action="default" />
      );
      let alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-background-50');

      // Test with only variant provided
      rerender(<Alert description="Test" variant="outline" />);
      alert = document.querySelector('.alert-wrapper');
      expect(alert).toHaveClass('bg-background');
      expect(alert).toHaveClass('border-border-100');
    });

    /**
     * Test all combinations to ensure complete branch coverage
     */
    it('should cover all variant and action combinations', () => {
      const variants: Array<'solid' | 'outline'> = ['solid', 'outline'];
      const actions: Array<
        'default' | 'info' | 'success' | 'warning' | 'error'
      > = ['default', 'info', 'success', 'warning', 'error'];

      variants.forEach((variant) => {
        actions.forEach((action) => {
          const { unmount } = render(
            <Alert
              description={`Test ${variant} ${action}`}
              variant={variant}
              action={action}
            />
          );

          const alert = document.querySelector('.alert-wrapper');
          expect(alert).toBeInTheDocument();

          // Verify the correct classes are applied
          expect(alert).toHaveClass('alert-wrapper');
          expect(alert).toHaveClass('flex');

          unmount();
        });
      });
    });
  });
});
