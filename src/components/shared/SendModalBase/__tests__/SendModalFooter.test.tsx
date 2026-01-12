import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SendModalFooter } from '../components/SendModalFooter';

describe('SendModalFooter', () => {
  const defaultProps = {
    currentStep: 1,
    maxSteps: 2,
    isLoading: false,
    onCancel: jest.fn(),
    onPreviousStep: jest.fn(),
    onNextStep: jest.fn(),
    onSubmit: jest.fn(),
    entityName: 'aula',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cancel button', () => {
    it('should always render cancel button', () => {
      render(<SendModalFooter {...defaultProps} />);
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<SendModalFooter {...defaultProps} />);
      fireEvent.click(screen.getByText('Cancelar'));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Previous button', () => {
    it('should not render previous button on first step', () => {
      render(<SendModalFooter {...defaultProps} currentStep={1} />);
      expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
    });

    it('should render previous button when not on first step', () => {
      render(<SendModalFooter {...defaultProps} currentStep={2} />);
      expect(screen.getByText('Anterior')).toBeInTheDocument();
    });

    it('should call onPreviousStep when previous button is clicked', () => {
      render(<SendModalFooter {...defaultProps} currentStep={2} />);
      fireEvent.click(screen.getByText('Anterior'));
      expect(defaultProps.onPreviousStep).toHaveBeenCalledTimes(1);
    });
  });

  describe('Next button', () => {
    it('should render next button when not on last step', () => {
      render(
        <SendModalFooter {...defaultProps} currentStep={1} maxSteps={2} />
      );
      expect(screen.getByText('Próximo')).toBeInTheDocument();
    });

    it('should not render next button on last step', () => {
      render(
        <SendModalFooter {...defaultProps} currentStep={2} maxSteps={2} />
      );
      expect(screen.queryByText('Próximo')).not.toBeInTheDocument();
    });

    it('should call onNextStep when next button is clicked', () => {
      render(
        <SendModalFooter {...defaultProps} currentStep={1} maxSteps={2} />
      );
      fireEvent.click(screen.getByText('Próximo'));
      expect(defaultProps.onNextStep).toHaveBeenCalledTimes(1);
    });
  });

  describe('Submit button', () => {
    it('should render submit button on last step', () => {
      render(
        <SendModalFooter {...defaultProps} currentStep={2} maxSteps={2} />
      );
      expect(screen.getByText('Enviar aula')).toBeInTheDocument();
    });

    it('should not render submit button when not on last step', () => {
      render(
        <SendModalFooter {...defaultProps} currentStep={1} maxSteps={2} />
      );
      expect(screen.queryByText('Enviar aula')).not.toBeInTheDocument();
    });

    it('should call onSubmit when submit button is clicked', () => {
      render(
        <SendModalFooter {...defaultProps} currentStep={2} maxSteps={2} />
      );
      fireEvent.click(screen.getByText('Enviar aula'));
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    });

    it('should show loading text when isLoading is true', () => {
      render(
        <SendModalFooter
          {...defaultProps}
          currentStep={2}
          maxSteps={2}
          isLoading={true}
        />
      );
      expect(screen.getByText('Enviando...')).toBeInTheDocument();
      expect(screen.queryByText('Enviar aula')).not.toBeInTheDocument();
    });

    it('should disable submit button when isLoading is true', () => {
      render(
        <SendModalFooter
          {...defaultProps}
          currentStep={2}
          maxSteps={2}
          isLoading={true}
        />
      );
      expect(screen.getByText('Enviando...')).toBeDisabled();
    });

    it('should render entity name in submit button', () => {
      render(
        <SendModalFooter
          {...defaultProps}
          currentStep={3}
          maxSteps={3}
          entityName="atividade"
        />
      );
      expect(screen.getByText('Enviar atividade')).toBeInTheDocument();
    });
  });

  describe('testIdPrefix', () => {
    it('should render with testIdPrefix when provided', () => {
      render(
        <SendModalFooter
          {...defaultProps}
          currentStep={2}
          maxSteps={2}
          testIdPrefix="lesson"
        />
      );
      expect(screen.getByTestId('lesson-footer')).toBeInTheDocument();
      expect(screen.getByTestId('lesson-cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('lesson-previous-button')).toBeInTheDocument();
      expect(screen.getByTestId('lesson-submit-button')).toBeInTheDocument();
    });

    it('should render next button with testId when provided', () => {
      render(
        <SendModalFooter
          {...defaultProps}
          currentStep={1}
          maxSteps={2}
          testIdPrefix="lesson"
        />
      );
      expect(screen.getByTestId('lesson-next-button')).toBeInTheDocument();
    });
  });

  describe('3-step modal', () => {
    it('should work correctly with 3 steps', () => {
      const { rerender } = render(
        <SendModalFooter {...defaultProps} currentStep={1} maxSteps={3} />
      );
      expect(screen.getByText('Próximo')).toBeInTheDocument();
      expect(screen.queryByText('Anterior')).not.toBeInTheDocument();

      rerender(
        <SendModalFooter {...defaultProps} currentStep={2} maxSteps={3} />
      );
      expect(screen.getByText('Próximo')).toBeInTheDocument();
      expect(screen.getByText('Anterior')).toBeInTheDocument();

      rerender(
        <SendModalFooter {...defaultProps} currentStep={3} maxSteps={3} />
      );
      expect(screen.queryByText('Próximo')).not.toBeInTheDocument();
      expect(screen.getByText('Anterior')).toBeInTheDocument();
      expect(screen.getByText('Enviar aula')).toBeInTheDocument();
    });
  });
});
