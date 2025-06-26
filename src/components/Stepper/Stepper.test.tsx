import { render, screen } from '@testing-library/react';
import Stepper, { StepData, Step } from './Stepper';

// Mock phosphor-react Check icon
jest.mock('phosphor-react', () => ({
  Check: ({ weight, className }: { weight?: string; className?: string }) => (
    <div data-testid="check-icon" data-weight={weight} className={className}>
      ✓
    </div>
  ),
}));

const mockSteps: StepData[] = [
  {
    id: '1',
    label: 'Step 1',
    state: 'completed',
  },
  {
    id: '2',
    label: 'Step 2',
    state: 'current',
  },
  {
    id: '3',
    label: 'Step 3',
    state: 'pending',
  },
];

describe('Stepper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders stepper with steps', () => {
      render(<Stepper steps={mockSteps} />);

      expect(screen.getByRole('group', { name: 'Stepper de formulário' })).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <Stepper steps={mockSteps} className="custom-stepper-class" />
      );

      expect(container.firstChild).toHaveClass('custom-stepper-class');
    });
  });

  describe('Size Variants', () => {
    it.each(['small', 'medium', 'large', 'extraLarge'] as const)(
      'renders %s size correctly',
      (size) => {
        render(<Stepper steps={mockSteps} size={size} />);

        // Check if steps are rendered (size classes are applied internally)
        expect(screen.getByText('Step 1')).toBeInTheDocument();
        expect(screen.getByText('Step 2')).toBeInTheDocument();
        expect(screen.getByText('Step 3')).toBeInTheDocument();
      }
    );

    it('defaults to medium size when no size is provided', () => {
      render(<Stepper steps={mockSteps} />);

      // Since medium is the default, this should render without errors
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });
  });

  describe('Step States', () => {
    it('renders completed state with check icon', () => {
      const completedSteps: StepData[] = [
        { id: '1', label: 'Completed Step', state: 'completed' },
      ];

      render(<Stepper steps={completedSteps} />);

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('renders current state with step number', () => {
      const currentSteps: StepData[] = [
        { id: '1', label: 'Current Step', state: 'current' },
      ];

      render(<Stepper steps={currentSteps} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders pending state with step number', () => {
      const pendingSteps: StepData[] = [
        { id: '1', label: 'Pending Step', state: 'pending' },
      ];

      render(<Stepper steps={pendingSteps} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Progress Indicator', () => {
    it('shows progress indicator when showProgress is true', () => {
      render(<Stepper steps={mockSteps} showProgress currentStep={1} />);

      expect(screen.getByText('Etapa 2 de 3')).toBeInTheDocument();
    });

    it('does not show progress indicator when showProgress is false', () => {
      render(<Stepper steps={mockSteps} showProgress={false} currentStep={1} />);

      expect(screen.queryByText('Etapa 2 de 3')).not.toBeInTheDocument();
    });

    it('shows custom progress text when provided', () => {
      render(
        <Stepper
          steps={mockSteps}
          showProgress
          currentStep={1}
          progressText="Custom Progress Text"
        />
      );

      expect(screen.getByText('Custom Progress Text')).toBeInTheDocument();
    });

    it('handles progress calculation correctly', () => {
      render(<Stepper steps={mockSteps} showProgress currentStep={0} />);
      expect(screen.getByText('Etapa 1 de 3')).toBeInTheDocument();

      render(<Stepper steps={mockSteps} showProgress currentStep={2} />);
      expect(screen.getByText('Etapa 3 de 3')).toBeInTheDocument();
    });
  });

  describe('Current Step Calculation', () => {
    it('calculates step states when currentStep is provided', () => {
      render(<Stepper steps={mockSteps} currentStep={1} />);

      // Step 0 should be completed, step 1 should be current, step 2 should be pending
      const checkIcon = screen.getByTestId('check-icon');
      expect(checkIcon).toBeInTheDocument();
    });

    it('uses provided step states when currentStep is not provided', () => {
      render(<Stepper steps={mockSteps} />);

      // Should use the states from mockSteps
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });

  describe('Step Accessibility', () => {
    it('applies correct aria-label for steps', () => {
      render(<Stepper steps={mockSteps} />);

      const completedStep = screen.getByLabelText('Step 1 (concluído)');
      const currentStep = screen.getByLabelText('Step 2 (atual)');
      const pendingStep = screen.getByLabelText('Step 3');

      expect(completedStep).toBeInTheDocument();
      expect(currentStep).toBeInTheDocument();
      expect(pendingStep).toBeInTheDocument();
    });

    it('renders all steps as non-interactive elements', () => {
      render(<Stepper steps={mockSteps} />);

      // No steps should be clickable (no button role)
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);

      // All step indicators should have appropriate aria-labels for accessibility
      const completedStep = screen.getByLabelText('Step 1 (concluído)');
      const currentStep = screen.getByLabelText('Step 2 (atual)');
      const pendingStep = screen.getByLabelText('Step 3');

      expect(completedStep).toBeInTheDocument();
      expect(currentStep).toBeInTheDocument();
      expect(pendingStep).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes when responsive is true', () => {
      const { container } = render(<Stepper steps={mockSteps} responsive />);

      const stepsContainer = container.querySelector('[role="tablist"]');
      expect(stepsContainer).toHaveClass('flex-row');
      expect(stepsContainer).toHaveClass('overflow-x-auto');
    });

    it('applies non-responsive classes when responsive is false', () => {
      const { container } = render(<Stepper steps={mockSteps} responsive={false} />);

      const stepsContainer = container.querySelector('[role="tablist"]');
      expect(stepsContainer).toHaveClass('flex-row');
      expect(stepsContainer).toHaveClass('justify-center');
    });
  });

  describe('Progress Bar Connections', () => {
    it('renders progress bars for each step', () => {
      const { container } = render(<Stepper steps={mockSteps} />);

      // Each step should have its own progress bar
      const progressBars = container.querySelectorAll('.h-0\\.5');
      expect(progressBars).toHaveLength(3); // Each step has its own progress bar
    });

    it('renders progress bar for single step', () => {
      const singleStep: StepData[] = [
        { id: '1', label: 'Only Step', state: 'current' },
      ];

      const { container } = render(<Stepper steps={singleStep} />);

      const progressBars = container.querySelectorAll('.h-0\\.5');
      expect(progressBars).toHaveLength(1);
    });
  });

  describe('Custom Styling', () => {
    it('applies custom stepClassName to steps', () => {
      const { container } = render(<Stepper steps={mockSteps} stepClassName="custom-step-class" />);

      // Check if custom class is applied to step containers (the outermost step div)
      const stepContainers = container.querySelectorAll('.custom-step-class');
      expect(stepContainers).toHaveLength(3); // Should have 3 steps with custom class
    });
  });

  describe('Edge Cases', () => {
    it('handles single step', () => {
      const singleStep: StepData[] = [
        { id: '1', label: 'Only Step', state: 'current' },
      ];

      render(<Stepper steps={singleStep} currentStep={0} />);

      expect(screen.getByText('Only Step')).toBeInTheDocument();
    });

    it('handles currentStep out of bounds', () => {
      // Should not crash when currentStep is out of bounds
      render(<Stepper steps={mockSteps} currentStep={10} />);
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });

    it('handles empty steps array', () => {
      const { container } = render(<Stepper steps={[]} />);
      const stepsContainer = container.querySelector('[role="tablist"]');
      expect(stepsContainer?.children).toHaveLength(0);
    });

    it('handles default parameter values being used', () => {
      // This specifically tests the internal Step component with undefined parameters
      // to trigger the default value branches

      // Test by calling Stepper without passing stepClassName explicitly
      const { container } = render(
        <Stepper
          steps={mockSteps.slice(0, 1)}
        />
      );

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Icon Size Calculation', () => {
    it.each([
      { size: 'small' as const },
      { size: 'medium' as const },
      { size: 'large' as const },
      { size: 'extraLarge' as const },
    ])('renders correct icon for $size size', ({ size }) => {
      const completedSteps: StepData[] = [
        { id: '1', label: 'Completed Step', state: 'completed' },
      ];

      render(<Stepper steps={completedSteps} size={size} />);

      const checkIcon = screen.getByTestId('check-icon');
      expect(checkIcon).toBeInTheDocument();
      // Just verify the icon is rendered correctly, size classes are applied via CSS
      expect(checkIcon).toHaveAttribute('data-weight', 'bold');
    });
  });

  describe('Step Component Direct Tests', () => {
    it('renders Step component with default className parameter', () => {
      // This test specifically covers the default className = '' branch
      const mockStep: StepData = {
        id: '1',
        label: 'Test Step',
        state: 'current',
      };

      const sizeClasses = {
        container: 'gap-3' as const,
        stepWidth: 'w-[110px]' as const,
        stepHeight: 'h-[48px]' as const,
        indicator: 'w-6 h-6' as const,
        progressBar: 'h-0.5' as const,
        indicatorTextSize: '2xs' as const,
        labelTextSize: 'xs' as const,
        iconSize: 'w-3.5 h-3.5' as const,
      };

      const stateClasses = {
        progressBar: 'bg-primary-800' as const,
        indicator: 'bg-primary-800' as const,
        indicatorText: 'text-white' as const,
        label: 'text-primary-800' as const,
      };

      // Render Step component directly without className prop to trigger default value
      render(
        <Step
          step={mockStep}
          index={0}
          size="medium"
          sizeClasses={sizeClasses}
          stateClasses={stateClasses}
          isLast={false}
          // className is intentionally omitted to trigger default parameter value
        />
      );

      expect(screen.getByText('Test Step')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});
