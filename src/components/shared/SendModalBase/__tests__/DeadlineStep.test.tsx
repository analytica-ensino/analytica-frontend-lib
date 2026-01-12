import React from 'react';
import { render, screen } from '@testing-library/react';
import { DeadlineStep } from '../components/DeadlineStep';

// Mock DateTimeInput
jest.mock('../../../DateTimeInput/DateTimeInput', () => ({
  __esModule: true,
  default: ({
    label,
    date,
    time,
    testId,
    errorMessage,
  }: {
    label: string;
    date: string;
    time: string;
    testId?: string;
    errorMessage?: string;
  }) => (
    <div data-testid={testId}>
      <span data-testid={`${testId}-label`}>{label}</span>
      <span data-testid={`${testId}-date`}>{date}</span>
      <span data-testid={`${testId}-time`}>{time}</span>
      {errorMessage && (
        <span data-testid={`${testId}-error`}>{errorMessage}</span>
      )}
    </div>
  ),
}));

describe('DeadlineStep', () => {
  const defaultProps = {
    startDate: '2024-01-15',
    startTime: '08:00',
    finalDate: '2024-01-20',
    finalTime: '18:00',
    onStartDateChange: jest.fn(),
    onStartTimeChange: jest.fn(),
    onFinalDateChange: jest.fn(),
    onFinalTimeChange: jest.fn(),
    errors: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render start date input with correct values', () => {
    render(<DeadlineStep {...defaultProps} />);
    expect(screen.getByTestId('start-datetime')).toBeInTheDocument();
    expect(screen.getByTestId('start-datetime-label')).toHaveTextContent(
      'Iniciar em*'
    );
    expect(screen.getByTestId('start-datetime-date')).toHaveTextContent(
      '2024-01-15'
    );
    expect(screen.getByTestId('start-datetime-time')).toHaveTextContent(
      '08:00'
    );
  });

  it('should render final date input with correct values', () => {
    render(<DeadlineStep {...defaultProps} />);
    expect(screen.getByTestId('final-datetime')).toBeInTheDocument();
    expect(screen.getByTestId('final-datetime-label')).toHaveTextContent(
      'Finalizar até*'
    );
    expect(screen.getByTestId('final-datetime-date')).toHaveTextContent(
      '2024-01-20'
    );
    expect(screen.getByTestId('final-datetime-time')).toHaveTextContent(
      '18:00'
    );
  });

  it('should render start date error when provided', () => {
    render(
      <DeadlineStep
        {...defaultProps}
        errors={{ startDate: 'Data de início é obrigatória' }}
      />
    );
    expect(screen.getByTestId('start-datetime-error')).toHaveTextContent(
      'Data de início é obrigatória'
    );
  });

  it('should render start time error when provided', () => {
    render(
      <DeadlineStep
        {...defaultProps}
        errors={{ startTime: 'Hora de início é obrigatória' }}
      />
    );
    expect(screen.getByTestId('start-datetime-error')).toHaveTextContent(
      'Hora de início é obrigatória'
    );
  });

  it('should combine start date and time errors', () => {
    render(
      <DeadlineStep
        {...defaultProps}
        errors={{
          startDate: 'Data inválida',
          startTime: 'Hora inválida',
        }}
      />
    );
    expect(screen.getByTestId('start-datetime-error')).toHaveTextContent(
      'Data inválida Hora inválida'
    );
  });

  it('should render final date error when provided', () => {
    render(
      <DeadlineStep
        {...defaultProps}
        errors={{ finalDate: 'Data final deve ser posterior' }}
      />
    );
    expect(screen.getByTestId('final-datetime-error')).toHaveTextContent(
      'Data final deve ser posterior'
    );
  });

  it('should render final time error when provided', () => {
    render(
      <DeadlineStep
        {...defaultProps}
        errors={{ finalTime: 'Hora final é obrigatória' }}
      />
    );
    expect(screen.getByTestId('final-datetime-error')).toHaveTextContent(
      'Hora final é obrigatória'
    );
  });

  it('should combine final date and time errors', () => {
    render(
      <DeadlineStep
        {...defaultProps}
        errors={{
          finalDate: 'Data inválida',
          finalTime: 'Hora inválida',
        }}
      />
    );
    expect(screen.getByTestId('final-datetime-error')).toHaveTextContent(
      'Data inválida Hora inválida'
    );
  });

  it('should render with custom testIdPrefix', () => {
    render(<DeadlineStep {...defaultProps} testIdPrefix="activity" />);
    expect(screen.getByTestId('activity-deadline-step')).toBeInTheDocument();
    expect(screen.getByTestId('activity-start-datetime')).toBeInTheDocument();
    expect(screen.getByTestId('activity-final-datetime')).toBeInTheDocument();
  });

  it('should render children when provided', () => {
    render(
      <DeadlineStep {...defaultProps}>
        <div data-testid="retry-option">Permitir refazer?</div>
      </DeadlineStep>
    );
    expect(screen.getByTestId('retry-option')).toBeInTheDocument();
    expect(screen.getByText('Permitir refazer?')).toBeInTheDocument();
  });

  it('should not render children container when not provided', () => {
    const { container } = render(<DeadlineStep {...defaultProps} />);
    expect(
      container.querySelectorAll('[data-testid="retry-option"]')
    ).toHaveLength(0);
  });

  it('should have grid layout for date inputs', () => {
    const { container } = render(<DeadlineStep {...defaultProps} />);
    const gridContainer = container.querySelector('.grid.grid-cols-2');
    expect(gridContainer).toBeInTheDocument();
  });
});
