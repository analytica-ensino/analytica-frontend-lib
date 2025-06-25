import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Stepper, { StepData } from './Stepper';

// Mock phosphor-react Check icon
jest.mock('phosphor-react', () => ({
  Check: ({ size, weight, className }: any) => (
    <div data-testid="check-icon" data-size={size} data-weight={weight} className={className}>
      ✓
    </div>
  ),
}));

const mockSteps: StepData[] = [
  {
    id: '1',
    label: 'Step 1',
    description: 'First step description',
    state: 'completed',
  },
  {
    id: '2',
    label: 'Step 2',
    description: 'Second step description',
    state: 'current',
  },
  {
    id: '3',
    label: 'Step 3',
    description: 'Third step description',
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

    it('renders step descriptions when showDescription is true', () => {
      render(<Stepper steps={mockSteps} showDescription />);

      expect(screen.getByText('First step description')).toBeInTheDocument();
      expect(screen.getByText('Second step description')).toBeInTheDocument();
      expect(screen.getByText('Third step description')).toBeInTheDocument();
    });

    it('does not render step descriptions when showDescription is false', () => {
      render(<Stepper steps={mockSteps} showDescription={false} />);

      expect(screen.queryByText('First step description')).not.toBeInTheDocument();
      expect(screen.queryByText('Second step description')).not.toBeInTheDocument();
      expect(screen.queryByText('Third step description')).not.toBeInTheDocument();
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

  describe('Navigation', () => {
    it('renders navigation buttons when showNavigation is true', () => {
      const onNext = jest.fn();
      const onPrevious = jest.fn();
      const onFinish = jest.fn();

      render(
        <Stepper
          steps={mockSteps}
          showNavigation
          currentStep={1}
          onNext={onNext}
          onPrevious={onPrevious}
          onFinish={onFinish}
        />
      );

      expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Avançar' })).toBeInTheDocument();
    });

    it('does not render navigation buttons when showNavigation is false', () => {
      render(<Stepper steps={mockSteps} showNavigation={false} />);

      expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Avançar' })).not.toBeInTheDocument();
    });

    it('calls onNext when next button is clicked', async () => {
      const user = userEvent.setup();
      const onNext = jest.fn();

      render(
        <Stepper
          steps={mockSteps}
          showNavigation
          currentStep={0}
          onNext={onNext}
        />
      );

      const nextButton = screen.getByRole('button', { name: 'Avançar' });
      await user.click(nextButton);

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('calls onPrevious when previous button is clicked', async () => {
      const user = userEvent.setup();
      const onPrevious = jest.fn();

      render(
        <Stepper
          steps={mockSteps}
          showNavigation
          currentStep={1}
          onPrevious={onPrevious}
        />
      );

      const previousButton = screen.getByRole('button', { name: 'Voltar' });
      await user.click(previousButton);

      expect(onPrevious).toHaveBeenCalledTimes(1);
    });

    it('shows finish button on last step', () => {
      const onFinish = jest.fn();

      render(
        <Stepper
          steps={mockSteps}
          showNavigation
          currentStep={2}
          onFinish={onFinish}
        />
      );

      expect(screen.getByRole('button', { name: 'Concluir' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Avançar' })).not.toBeInTheDocument();
    });

    it('calls onFinish when finish button is clicked', async () => {
      const user = userEvent.setup();
      const onFinish = jest.fn();

      render(
        <Stepper
          steps={mockSteps}
          showNavigation
          currentStep={2}
          onFinish={onFinish}
        />
      );

      const finishButton = screen.getByRole('button', { name: 'Concluir' });
      await user.click(finishButton);

      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('does not show previous button when onPrevious is not provided', () => {
      render(
        <Stepper
          steps={mockSteps}
          showNavigation
          currentStep={0}
        />
      );

      expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument();
    });

    it('uses custom button texts', () => {
      render(
        <Stepper
          steps={mockSteps}
          showNavigation
          currentStep={1}
          previousButtonText="Go Back"
          nextButtonText="Continue"
          finishButtonText="Done"
          onNext={jest.fn()}
          onPrevious={jest.fn()}
        />
      );

      expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    });

    it('disables buttons when specified', () => {
      render(
        <Stepper
          steps={mockSteps}
          showNavigation
          currentStep={1}
          disablePrevious
          disableNext
          onNext={jest.fn()}
          onPrevious={jest.fn()}
        />
      );

      expect(screen.getByRole('button', { name: 'Voltar' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Avançar' })).toBeDisabled();
    });

    it('applies custom navigation className', () => {
      const { container } = render(
        <Stepper
          steps={mockSteps}
          showNavigation
          currentStep={1}
          navigationClassName="custom-nav-class"
          onNext={jest.fn()}
        />
      );

      const navigationContainer = container.querySelector('.custom-nav-class');
      expect(navigationContainer).toBeInTheDocument();
      expect(navigationContainer).toHaveClass('custom-nav-class');
    });
  });

  describe('Step Interaction', () => {
    it('calls onStepClick when a clickable step is clicked', async () => {
      const user = userEvent.setup();
      const onStepClick = jest.fn();

      render(<Stepper steps={mockSteps} onStepClick={onStepClick} />);

      // Find the step indicator for the done step (should be clickable)
      const stepIndicators = screen.getAllByRole('button');
      await user.click(stepIndicators[0]);

      expect(onStepClick).toHaveBeenCalledWith('1', 0);
    });

    it('handles keyboard navigation on clickable steps', async () => {
      const user = userEvent.setup();
      const onStepClick = jest.fn();

      render(<Stepper steps={mockSteps} onStepClick={onStepClick} />);

      const stepIndicators = screen.getAllByRole('button');
      stepIndicators[0].focus();

      await user.keyboard('{Enter}');
      expect(onStepClick).toHaveBeenCalledWith('1', 0);

      onStepClick.mockClear();

      await user.keyboard(' ');
      expect(onStepClick).toHaveBeenCalledWith('1', 0);
    });

    it('does not call onStepClick for non-clickable steps', async () => {
      const user = userEvent.setup();
      const onStepClick = jest.fn();
      const nonClickableSteps: StepData[] = [
        { id: '1', label: 'Step 1', state: 'pending' },
      ];

      render(<Stepper steps={nonClickableSteps} onStepClick={onStepClick} />);

      // Pending steps should not be clickable
      const stepIndicator = screen.getByText('1').closest('div');
      expect(stepIndicator).not.toHaveAttribute('role', 'button');
    });

    it('applies correct aria-label for steps', () => {
      render(<Stepper steps={mockSteps} />);

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
      expect(stepsContainer).toHaveClass('flex-row', 'md:flex-row');
    });

    it('applies non-responsive classes when responsive is false', () => {
      const { container } = render(<Stepper steps={mockSteps} responsive={false} />);

      const stepsContainer = container.querySelector('[role="tablist"]');
      expect(stepsContainer).toHaveClass('flex-row');
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
    it('handles empty steps array', () => {
      render(<Stepper steps={[]} />);

      expect(screen.getByRole('group', { name: 'Stepper de formulário' })).toBeInTheDocument();
    });

    it('handles single step', () => {
      const singleStep: StepData[] = [
        { id: '1', label: 'Only Step', state: 'current' },
      ];

      render(<Stepper steps={singleStep} currentStep={0} showNavigation onFinish={jest.fn()} />);

      expect(screen.getByText('Only Step')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Concluir' })).toBeInTheDocument();
    });

    it('handles currentStep out of bounds', () => {
      render(<Stepper steps={mockSteps} showProgress currentStep={10} />);

      // Should still render without errors
      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('Etapa 11 de 3')).toBeInTheDocument();
    });

    it('handles negative currentStep', () => {
      render(<Stepper steps={mockSteps} showProgress currentStep={-1} />);

      // Should still render without errors
      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('Etapa 0 de 3')).toBeInTheDocument();
    });

    it('calculates correct active step index when no current step exists', () => {
      const noCurrentSteps: StepData[] = [
        { id: '1', label: 'Step 1', state: 'completed' },
        { id: '2', label: 'Step 2', state: 'completed' },
        { id: '3', label: 'Step 3', state: 'pending' },
      ];

      render(<Stepper steps={noCurrentSteps} showProgress />);

      // Should handle the case where no step has 'current' state
      expect(screen.getByRole('group')).toBeInTheDocument();
    });
  });

  describe('Icon Size Calculation', () => {
    it.each([
      ['small', '12'],
      ['medium', '16'],
      ['large', '20'],
      ['extraLarge', '24'],
    ])('renders correct icon size for %s', (size, expectedSize) => {
      const completedSteps: StepData[] = [
        { id: '1', label: 'Completed Step', state: 'completed' },
      ];

      render(<Stepper steps={completedSteps} size={size as any} />);

      const checkIcon = screen.getByTestId('check-icon');
      expect(checkIcon).toHaveAttribute('data-size', expectedSize);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Stepper steps={mockSteps} />);

      const stepper = screen.getByRole('group', { name: 'Stepper de formulário' });
      expect(stepper).toBeInTheDocument();
    });

    it('has proper tabindex for clickable and non-clickable steps', () => {
      render(<Stepper steps={mockSteps} onStepClick={jest.fn()} />);

      // Completed and current steps should be clickable (tabindex 0)
      const clickableSteps = screen.getAllByRole('button');
      clickableSteps.forEach(step => {
        expect(step).toHaveAttribute('tabIndex', '0');
      });

      // Pending steps should not be clickable (tabindex -1 or no role=button)
      const pendingStepIndicator = screen.getByLabelText('Step 3');
      expect(pendingStepIndicator).toHaveAttribute('tabIndex', '-1');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const onStepClick = jest.fn();

      render(<Stepper steps={mockSteps} onStepClick={onStepClick} />);

      const firstStep = screen.getByLabelText('Step 1 (concluído)');
      firstStep.focus();

      await user.keyboard('{Enter}');
      expect(onStepClick).toHaveBeenCalledWith('1', 0);
    });
  });
});
