import React from 'react';
import {
  CaretLeft as CaretLeftIcon,
  ArrowRight as ArrowRightIcon,
  PaperPlaneTilt as PaperPlaneTiltIcon,
} from 'phosphor-react';
import Button from '../../../Button/Button';

/**
 * Props for SendModalFooter component
 */
export interface SendModalFooterProps {
  /** Current step number */
  currentStep: number;
  /** Maximum number of steps */
  maxSteps: number;
  /** Whether the submit button is in loading state */
  isLoading: boolean;
  /** Handler for cancel button */
  onCancel: () => void;
  /** Handler for previous step button */
  onPreviousStep: () => void;
  /** Handler for next step button */
  onNextStep: () => void;
  /** Handler for submit button */
  onSubmit: () => void;
  /** Entity name for submit button (e.g., "aula", "atividade") */
  entityName: string;
  /** Optional test ID prefix */
  testIdPrefix?: string;
}

/**
 * Footer component for SendModal with navigation and submit buttons
 * Displays Cancel, Previous, Next/Submit buttons based on current step
 */
export const SendModalFooter: React.FC<SendModalFooterProps> = ({
  currentStep,
  maxSteps,
  isLoading,
  onCancel,
  onPreviousStep,
  onNextStep,
  onSubmit,
  entityName,
  testIdPrefix,
}) => {
  const isLastStep = currentStep >= maxSteps;
  const showPreviousButton = currentStep > 1;

  return (
    <div
      className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 w-full"
      data-testid={testIdPrefix ? `${testIdPrefix}-footer` : undefined}
    >
      <Button
        variant="link"
        action="primary"
        onClick={onCancel}
        className="w-full sm:w-auto"
        data-testid={testIdPrefix ? `${testIdPrefix}-cancel-button` : undefined}
      >
        Cancelar
      </Button>

      <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {showPreviousButton && (
          <Button
            variant="outline"
            action="primary"
            onClick={onPreviousStep}
            iconLeft={<CaretLeftIcon size={16} />}
            className="w-full sm:w-auto"
            data-testid={
              testIdPrefix ? `${testIdPrefix}-previous-button` : undefined
            }
          >
            Anterior
          </Button>
        )}

        {isLastStep ? (
          <Button
            variant="solid"
            action="primary"
            onClick={onSubmit}
            disabled={isLoading}
            iconLeft={<PaperPlaneTiltIcon size={16} />}
            className="w-full sm:w-auto"
            data-testid={
              testIdPrefix ? `${testIdPrefix}-submit-button` : undefined
            }
          >
            {isLoading ? 'Enviando...' : `Enviar ${entityName}`}
          </Button>
        ) : (
          <Button
            variant="solid"
            action="primary"
            onClick={onNextStep}
            iconRight={<ArrowRightIcon size={16} />}
            className="w-full sm:w-auto"
            data-testid={
              testIdPrefix ? `${testIdPrefix}-next-button` : undefined
            }
          >
            Próximo
          </Button>
        )}
      </div>
    </div>
  );
};

export default SendModalFooter;
