import Text from '../Text/Text';
import { Check } from 'phosphor-react';
import { cn } from '../../utils/utils';

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
  /** Current state of the step */
  state: StepState;
}

/**
 * Size configurations - Following design system pattern from CSS specifications
 * Small size based on exact CSS: width 58px, height 38px, gap 8px
 */
const SIZE_CLASSES = {
  small: {
    container: 'gap-2', // 8px gap as specified in CSS
    stepWidth: 'w-[58px]', // exact 58px from CSS
    stepHeight: 'h-[38px]', // exact 38px from CSS
    indicator: 'w-5 h-5', // 20px as specified
    progressBar: 'h-0.5', // 2px as specified
    indicatorTextSize: '2xs', // 10px as specified
    labelTextSize: 'xs', // 12px as specified
    iconSize: 'w-3 h-3', // 12px
  },
  medium: {
    container: 'gap-3', // 12px (8px + 4px progression)
    stepWidth: 'w-[110px]', // 110px (increased from 90px to fit "Endereço Residencial")
    stepHeight: 'h-[48px]', // 48px (increased from 46px for better proportion)
    indicator: 'w-6 h-6', // 24px (20px + 4px progression)
    progressBar: 'h-0.5', // 2px maintained for consistency
    indicatorTextSize: '2xs', // 10px maintained for readability
    labelTextSize: 'xs', // 12px maintained
    iconSize: 'w-3.5 h-3.5', // 14px
  },
  large: {
    container: 'gap-4', // 16px (12px + 4px progression)
    stepWidth: 'w-[160px]', // 160px (increased from 140px to fit "Endereço Residencial")
    stepHeight: 'h-[58px]', // 58px (increased from 54px for better proportion)
    indicator: 'w-7 h-7', // 28px (24px + 4px progression)
    progressBar: 'h-1', // 4px (increased for better visibility)
    indicatorTextSize: 'xs', // 12px (increased for larger size)
    labelTextSize: 'sm', // 14px (increased for larger size)
    iconSize: 'w-4 h-4', // 16px
  },
  extraLarge: {
    container: 'gap-5', // 20px (16px + 4px progression)
    stepWidth: 'w-[200px]', // 200px (increased from 180px to ensure "Endereço Residencial" fits)
    stepHeight: 'h-[68px]', // 68px (increased from 62px for better proportion)
    indicator: 'w-8 h-8', // 32px (28px + 4px progression)
    progressBar: 'h-1', // 4px maintained
    indicatorTextSize: 'xs', // 12px maintained for readability
    labelTextSize: 'sm', // 14px maintained
    iconSize: 'w-[18px] h-[18px]', // 18px
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
    indicatorText: 'text-white', // Branco para contraste com background cinza
    label: 'text-text-400', // #A3A3A3
  },
  current: {
    progressBar: 'bg-primary-800', // #1C61B2 usando classe Tailwind padrão
    indicator: 'bg-primary-800', // #1C61B2 usando classe Tailwind padrão
    indicatorText: 'text-white', // Branco usando classe Tailwind padrão
    label: 'text-primary-800', // #1C61B2 usando classe Tailwind padrão
  },
  completed: {
    progressBar: 'bg-primary-400', // #48A0E8 para barra quando checked (completed)
    indicator: 'bg-primary-400', // #48A0E8 para corresponder à barra de progresso
    indicatorText: 'text-white', // Branco usando classe Tailwind padrão
    label: 'text-primary-400', // #48A0E8 para corresponder à barra de progresso
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
  className?: string;
}

/**
 * Individual Step component - Based on exact design specifications
 * Layout: flex-column with progress bar at top, then icon+label row
 * Fully responsive for mobile, tablets, and laptops
 */
export const Step = ({
  step,
  index,
  size: _size,
  sizeClasses,
  stateClasses,
  isLast: _isLast,
  className = '',
}: StepProps) => {
  const stepNumber = index + 1;
  const isCompleted = step.state === 'completed';

  // Generate accessible aria-label based on step state
  const getAriaLabel = () => {
    let suffix = '';
    if (step.state === 'completed') {
      suffix = ' (concluído)';
    } else if (step.state === 'current') {
      suffix = ' (atual)';
    }
    return `${step.label}${suffix}`;
  };

  return (
    <div
      className={`
        flex flex-col justify-center items-center pb-2 gap-2
        ${sizeClasses.stepWidth} ${sizeClasses.stepHeight}
        flex-none flex-grow
        ${className}
        sm:max-w-[100px] md:max-w-[120px] lg:max-w-none xl:max-w-none
        sm:min-h-[40px] md:min-h-[45px] lg:min-h-none
        overflow-visible
      `}
    >
      {/* Progress Bar - Full width at top with responsive scaling */}
      <div
        className={`
          w-full ${sizeClasses.progressBar} ${stateClasses.progressBar}
          rounded-sm flex-none
        `}
      />

      {/* Step Content Container - Responsive layout for all devices, no vertical scroll */}
      <div
        className={`
          flex flex-col sm:flex-row items-center
          gap-1 sm:gap-2 w-full sm:w-auto
          h-auto sm:h-5 flex-none
          overflow-visible
        `}
      >
        {/* Step Indicator Circle with responsive sizing */}
        <div
          className={`
            ${sizeClasses.indicator} ${stateClasses.indicator}
            rounded-full flex items-center justify-center relative
            flex-none transition-all duration-300 ease-out
          `}
          aria-label={getAriaLabel()}
        >
          {isCompleted ? (
            <Check
              weight="bold"
              className={`
                ${stateClasses.indicatorText}
                w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5
              `}
            />
          ) : (
            <Text
              size={sizeClasses.indicatorTextSize as '2xs' | 'xs' | 'sm'}
              weight="medium"
              color=""
              className={cn(stateClasses.indicatorText, 'leading-none')}
            >
              {stepNumber}
            </Text>
          )}
        </div>

        {/* Step Label with full responsive text sizing, no vertical overflow */}
        <Text
          size={sizeClasses.labelTextSize as '2xs' | 'xs' | 'sm' | 'md'}
          weight="medium"
          color=""
          className={cn(
            stateClasses.label,
            'leading-tight flex-none text-center sm:text-left break-words px-1 sm:px-0 max-w-full whitespace-normal'
          )}
        >
          {step.label}
        </Text>
      </div>
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
  /** Additional CSS classes */
  className?: string;
  /** Step container CSS classes */
  stepClassName?: string;
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
  return steps.map((step, index) => {
    let stepState: StepState;

    if (index < currentStep) {
      stepState = 'completed';
    } else if (index === currentStep) {
      stepState = 'current';
    } else {
      stepState = 'pending';
    }

    return {
      ...step,
      state: stepState,
    };
  });
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
 * Fully responsive for mobile, tablets, and laptops.
 *
 * Design specifications:
 * - Based on exact CSS specifications from Figma design
 * - Fully responsive: mobile (320px+) -> tablets (640px+) -> laptops (1024px+)
 * - Progressive sizing with responsive breakpoints that adapt to device type
 * - Consistent gaps that scale with screen size and device capabilities
 * - Consistent color scheme: pending (gray), current (dark blue), completed (light blue)
 * - Responsive design with overflow scroll on smaller devices
 * - Optimized text sizing and layout for each device category
 *
 * @example
 * ```tsx
 * // Basic stepper - automatically responsive for all devices
 * <Stepper steps={steps} currentStep={1} />
 *
 * // Custom styling with full responsive behavior
 * <Stepper steps={steps} size="medium" showProgress responsive />
 * ```
 */
const Stepper = ({
  steps: initialSteps,
  size = 'medium',
  currentStep,
  className = '',
  stepClassName = '',
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

  return (
    <fieldset
      className={cn(
        'flex flex-col gap-4 sm:gap-5 md:gap-6',
        className,
        'border-0 p-0 m-0'
      )}
    >
      <legend className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
        Stepper de formulário
      </legend>
      {/* Progress indicator with responsive text */}
      {showProgress && currentStep !== undefined && (
        <Text
          size="sm"
          weight="medium"
          className="text-text-600 text-center sm:text-left text-xs sm:text-sm"
        >
          {getProgressText(currentStep, steps.length, progressText)}
        </Text>
      )}

      {/* Stepper container - Fully responsive for all devices with horizontal scroll only */}
      <div
        className={cn(
          'flex items-center',
          sizeClasses.container,
          responsive
            ? 'flex-row overflow-x-auto overflow-y-hidden scrollbar-hide justify-start sm:justify-center md:justify-center lg:justify-center'
            : 'flex-row justify-center',
          'px-2 sm:px-4 md:px-6 lg:px-0 max-w-full min-w-0 gap-2 sm:gap-3 md:gap-4 lg:gap-4'
        )}
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
              className={stepClassName}
            />
          );
        })}
      </div>
    </fieldset>
  );
};

export default Stepper;
