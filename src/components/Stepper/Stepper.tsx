// ReactNode removed as it's not used in this component
import Text from '../Text/Text';
import { Check } from 'phosphor-react';

/**
 * Stepper size variants
 */
type StepperSize = 'small' | 'medium' | 'large' | 'extraLarge';

/**
 * Step state variants
 */
type StepState = 'pending' | 'current' | 'completed';

/**
 * Individual step data interface
 */
export interface StepData {
  /** Unique identifier for the step */
  id: string;
  /** Label text for the step */
  label: string;
  /** Optional description for the step */
  description?: string;
  /** Current state of the step */
  state: StepState;
}

/**
 * Size configurations - Based on exact design specifications
 * Medium size matches the design: width: 157px, height: 38px
 */
const SIZE_CLASSES = {
  small: {
    container: 'gap-1',
    stepWidth: 'w-32', // 128px
    stepHeight: 'h-8', // 32px
    indicator: 'w-4 h-4', // 16px
    progressBar: 'h-0.5', // 2px
    indicatorTextSize: '2xs', // 10px
    labelTextSize: '2xs', // 10px
  },
  medium: {
    container: 'gap-1', // 4px
    stepWidth: 'w-[157px]', // exact 157px as in design
    stepHeight: 'h-[38px]', // exact 38px as in design
    indicator: 'w-5 h-5', // 20px
    progressBar: 'h-0.5', // 2px
    indicatorTextSize: '2xs', // 10px
    labelTextSize: 'xs', // 12px
  },
  large: {
    container: 'gap-2',
    stepWidth: 'w-48', // 192px
    stepHeight: 'h-12', // 48px
    indicator: 'w-6 h-6', // 24px
    progressBar: 'h-0.5', // 2px
    indicatorTextSize: 'xs', // 12px
    labelTextSize: 'sm', // 14px
  },
  extraLarge: {
    container: 'gap-3',
    stepWidth: 'w-56', // 224px
    stepHeight: 'h-14', // 56px
    indicator: 'w-8 h-8', // 32px
    progressBar: 'h-1', // 4px
    indicatorTextSize: 'sm', // 14px
    labelTextSize: 'md', // 16px
  },
} as const;

/**
 * State configurations using exact colors from CSS specs
 * pending: #A3A3A3 = text-400 (etapa ainda não iniciada)
 * current: #1C61B2 = primary-800 (etapa atual sendo preenchida) - baseado no CSS fornecido
 * completed: #1C61B2 = primary-800 (etapa concluída)
 * text color: #FEFEFF = text
 */
const STATE_CLASSES = {
  pending: {
    progressBar: 'bg-text-400', // #A3A3A3
    indicator: 'bg-text-400', // #A3A3A3
    indicatorText: 'text-white', // Branco usando classe Tailwind padrão
    label: 'text-text-400', // #A3A3A3
    description: 'text-text-400',
  },
  current: {
    progressBar: 'bg-primary-800', // #1C61B2 usando classe Tailwind padrão
    indicator: 'bg-primary-800', // #1C61B2 usando classe Tailwind padrão
    indicatorText: 'text-white', // Branco usando classe Tailwind padrão
    label: 'text-primary-800', // #1C61B2 usando classe Tailwind padrão
    description: 'text-text-600',
  },
  completed: {
    progressBar: 'bg-primary-800', // #1C61B2 usando classe Tailwind padrão
    indicator: 'bg-primary-800', // #1C61B2 usando classe Tailwind padrão
    indicatorText: 'text-white', // Branco usando classe Tailwind padrão
    label: 'text-primary-800', // #1C61B2 usando classe Tailwind padrão
    description: 'text-text-600',
  },
} as const;

/**
 * Type for size classes
 */
type SizeClassType = (typeof SIZE_CLASSES)[keyof typeof SIZE_CLASSES];

/**
 * Type for state classes
 */
type StateClassType = (typeof STATE_CLASSES)[keyof typeof STATE_CLASSES];

/**
 * Props for individual step component
 */
interface StepProps {
  step: StepData;
  index: number;
  size: StepperSize;
  sizeClasses: SizeClassType;
  stateClasses: StateClassType;
  isLast: boolean;
  onStepClick?: (stepId: string, index: number) => void;
  showDescription?: boolean;
  className?: string;
}

/**
 * Individual Step component - Based on exact design specifications
 * Layout: flex-column with progress bar at top, then icon+label row
 */
const Step = ({
  step,
  index,
  size,
  sizeClasses,
  stateClasses,
  isLast: _isLast,
  onStepClick,
  showDescription = true,
  className = '',
}: StepProps) => {
  const stepNumber = index + 1;
  const isCompleted = step.state === 'completed';
  const isClickable =
    onStepClick && (step.state === 'completed' || step.state === 'current');

  const handleStepClick = () => {
    if (isClickable) {
      onStepClick(step.id, index);
    }
  };

  return (
    <div
      className={`
        flex flex-col justify-center items-center pb-2 gap-2
        ${sizeClasses.stepWidth} ${sizeClasses.stepHeight}
        flex-none flex-grow
        ${className}
      `}
    >
      {/* Progress Bar - Full width at top (157px x 2px) */}
      <div
        className={`
          w-full ${sizeClasses.progressBar} ${stateClasses.progressBar}
          rounded-sm flex-none
        `}
      />

      {/* Step Content Container - Icon + Label horizontal (58px x 20px) */}
      <div className="flex flex-row items-center gap-2 w-auto h-5 flex-none">
        {/* Step Indicator Circle (20px x 20px) */}
        <div
          className={`
            ${sizeClasses.indicator} ${stateClasses.indicator}
            rounded-full flex items-center justify-center relative
            flex-none transition-all duration-300 ease-out
            ${isClickable ? 'cursor-pointer hover:shadow-soft-shadow-2' : ''}
          `}
          onClick={handleStepClick}
          role={isClickable ? 'button' : 'presentation'}
          tabIndex={isClickable ? 0 : -1}
          onKeyDown={(e) => {
            if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleStepClick();
            }
          }}
          aria-label={`${step.label}${step.state === 'completed' ? ' (concluído)' : step.state === 'current' ? ' (atual)' : ''}`}
        >
          {isCompleted ? (
            <Check
              size={
                size === 'small'
                  ? 12
                  : size === 'medium'
                    ? 16
                    : size === 'large'
                      ? 20
                      : 24
              }
              weight="bold"
              className={stateClasses.indicatorText}
            />
          ) : (
            <Text
              size={sizeClasses.indicatorTextSize as '2xs' | 'xs' | 'sm'}
              weight="medium"
              color="text-white"
              className="leading-none"
            >
              {stepNumber}
            </Text>
          )}
        </div>

        {/* Step Label (xs, 12px, medium weight) */}
        <Text
          size={sizeClasses.labelTextSize as '2xs' | 'xs' | 'sm' | 'md'}
          weight="medium"
          className={`${stateClasses.label} leading-none flex-none`}
        >
          {step.label}
        </Text>
      </div>

      {/* Step Description (optional) */}
      {showDescription && step.description && (
        <Text
          size="2xs"
          weight="normal"
          className={`${stateClasses.description} text-center leading-tight mt-1`}
        >
          {step.description}
        </Text>
      )}
    </div>
  );
};

/**
 * Stepper component props interface
 */
export type StepperProps = {
  /** Array of step data */
  steps: StepData[];
  /** Size variant of the stepper */
  size?: StepperSize;
  /** Current active step index */
  currentStep?: number;
  /** Callback when a step is clicked */
  onStepClick?: (stepId: string, index: number) => void;
  /** Show step descriptions */
  showDescription?: boolean;
  /** Navigation buttons configuration */
  showNavigation?: boolean;
  /** Previous button text */
  previousButtonText?: string;
  /** Next button text */
  nextButtonText?: string;
  /** Finish button text */
  finishButtonText?: string;
  /** Callback for previous button */
  onPrevious?: () => void;
  /** Callback for next button */
  onNext?: () => void;
  /** Callback for finish button */
  onFinish?: () => void;
  /** Disable previous button */
  disablePrevious?: boolean;
  /** Disable next button */
  disableNext?: boolean;
  /** Disable finish button */
  disableFinish?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Step container CSS classes */
  stepClassName?: string;
  /** Navigation container CSS classes */
  navigationClassName?: string;
  /** Progress indicator (e.g., "Etapa 2 de 4") */
  showProgress?: boolean;
  /** Custom progress text */
  progressText?: string;
  /** Make stepper responsive (vertical on mobile) */
  responsive?: boolean;
};

/**
 * Helper function to calculate step states based on current step
 */
const calculateStepStates = (
  steps: StepData[],
  currentStep: number
): StepData[] => {
  return steps.map((step, index) => ({
    ...step,
    state:
      index < currentStep
        ? 'completed'
        : index === currentStep
          ? 'current'
          : 'pending',
  }));
};

/**
 * Helper function to get progress text
 */
const getProgressText = (
  currentStep: number,
  totalSteps: number,
  customText?: string
): string => {
  if (customText) return customText;
  return `Etapa ${currentStep + 1} de ${totalSteps}`;
};

/**
 * Stepper component for Analytica Ensino platforms
 *
 * A progress stepper component that displays a sequence of steps with different states.
 * Follows the exact design specifications with proper spacing, colors, and layout.
 *
 * Design specifications:
 * - Container: flex-row, gap-4px, width: 479px, height: 38px
 * - Each step: flex-col, width: 157px, height: 38px
 * - Progress bar: width: 157px, height: 2px, border-radius: 2px
 * - Indicator: 20x20px circle with 16.25px inner circle
 * - Text: 10px (2xs) in circle, 12px (xs) for label
 * - Colors: #1C61B2 (primary-800) for active, #A3A3A3 (text-400) for inactive
 *
 * @example
 * ```tsx
 * // Basic stepper
 * <Stepper steps={steps} currentStep={1} />
 *
 * // With navigation
 * <Stepper
 *   steps={steps}
 *   currentStep={1}
 *   showNavigation
 *   onNext={() => setCurrentStep(prev => prev + 1)}
 *   onPrevious={() => setCurrentStep(prev => prev - 1)}
 * />
 *
 * // Custom styling
 * <Stepper steps={steps} size="large" showProgress />
 * ```
 */
const Stepper = ({
  steps: initialSteps,
  size = 'medium',
  currentStep,
  onStepClick,
  showDescription = true,
  showNavigation = false,
  previousButtonText = 'Voltar',
  nextButtonText = 'Avançar',
  finishButtonText = 'Concluir',
  onPrevious,
  onNext,
  onFinish,
  disablePrevious = false,
  disableNext = false,
  disableFinish = false,
  className = '',
  stepClassName = '',
  navigationClassName = '',
  showProgress = false,
  progressText,
  responsive = true,
}: StepperProps) => {
  const sizeClasses = SIZE_CLASSES[size];

  // Calculate steps with states if currentStep is provided
  const steps =
    currentStep !== undefined
      ? calculateStepStates(initialSteps, currentStep)
      : initialSteps;

  const isLastStep =
    currentStep !== undefined && currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div
      className={`flex flex-col gap-6 ${className}`}
      role="group"
      aria-label="Stepper de formulário"
    >
      {/* Progress indicator */}
      {showProgress && currentStep !== undefined && (
        <Text size="sm" weight="medium" className="text-text-600">
          {getProgressText(currentStep, steps.length, progressText)}
        </Text>
      )}

      {/* Stepper container - Based on design: flex-row, gap-4px */}
      <div
        className={`
          flex flex-row items-center
          ${sizeClasses.container}
          ${responsive ? 'flex-row md:flex-row' : 'flex-row'}
        `}
        role="tablist"
        aria-label="Progress steps"
      >
        {steps.map((step, index) => {
          const stateClasses = STATE_CLASSES[step.state];

          return (
            <Step
              key={step.id}
              step={step}
              index={index}
              size={size}
              sizeClasses={sizeClasses}
              stateClasses={stateClasses}
              isLast={index === steps.length - 1}
              onStepClick={onStepClick}
              showDescription={showDescription}
              className={stepClassName}
            />
          );
        })}
      </div>

      {/* Navigation buttons */}
      {showNavigation && (
        <div className={`flex gap-4 justify-between ${navigationClassName}`}>
          {!isFirstStep && (
            <Text
              as="button"
              size="sm"
              weight="medium"
              onClick={onPrevious}
              disabled={disablePrevious}
              className={`
                px-4 py-2 rounded-lg border border-primary-800 text-primary-800
                hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200 cursor-pointer flex-none
              `}
            >
              {previousButtonText}
            </Text>
          )}

          <div className="flex-grow" />

          {isLastStep ? (
            <Text
              as="button"
              size="sm"
              weight="medium"
              onClick={onFinish}
              disabled={disableFinish}
              className={`
                px-4 py-2 rounded-lg bg-success-500 text-text border-0
                hover:bg-success-600 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200 cursor-pointer flex-none
              `}
            >
              {finishButtonText}
            </Text>
          ) : (
            <Text
              as="button"
              size="sm"
              weight="medium"
              onClick={onNext}
              disabled={disableNext}
              className={`
                px-4 py-2 rounded-lg bg-primary-800 text-text border-0
                hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200 cursor-pointer flex-none
              `}
            >
              {nextButtonText}
            </Text>
          )}
        </div>
      )}
    </div>
  );
};

export default Stepper;
