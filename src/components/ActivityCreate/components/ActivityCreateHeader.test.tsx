import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityCreateHeader } from './ActivityCreateHeader';
import { ActivityType } from '../ActivityCreate.types';

// Mock phosphor-react icons
jest.mock('phosphor-react', () => ({
  CaretLeft: () => <span data-testid="caret-left-icon">←</span>,
  PaperPlaneTilt: () => <span data-testid="paper-plane-icon">→</span>,
}));

// Mock Button component
jest.mock('../../..', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    'data-testid': testId,
    'aria-label': ariaLabel,
  }: {
    children: unknown;
    onClick?: () => void;
    disabled?: boolean;
    'data-testid'?: string;
    'aria-label'?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {children as string}
    </button>
  ),
  Text: ({
    children,
    size,
    weight,
  }: {
    children: unknown;
    size?: string;
    weight?: string;
  }) => (
    <span data-size={size} data-weight={weight}>
      {children as string}
    </span>
  ),
}));

describe('ActivityCreateHeader', () => {
  const defaultProps = {
    activityType: ActivityType.RASCUNHO,
    lastSavedAt: null,
    isSaving: false,
    questionsCount: 0,
    onSaveModel: jest.fn(),
    onSendActivity: jest.fn(),
    onBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create activity title when no activity is provided', () => {
    render(<ActivityCreateHeader {...defaultProps} />);

    expect(screen.getByText('Criar atividade')).toBeInTheDocument();
  });

  it('should render edit activity title when activity is provided', () => {
    const activity = {
      id: '1',
      type: ActivityType.RASCUNHO,
      title: 'Test Activity',
      subjectId: 'subject-1',
      filters: {},
      questionIds: [],
    };

    render(<ActivityCreateHeader {...defaultProps} activity={activity} />);

    expect(screen.getByText('Editar atividade')).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    render(<ActivityCreateHeader {...defaultProps} />);

    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('should call onSaveModel when save button is clicked', () => {
    render(<ActivityCreateHeader {...defaultProps} />);

    const saveButton = screen.getByText('Salvar modelo');
    fireEvent.click(saveButton);

    expect(defaultProps.onSaveModel).toHaveBeenCalled();
  });

  it('should call onSendActivity when send button is clicked', () => {
    render(<ActivityCreateHeader {...defaultProps} questionsCount={5} />);

    const sendButton = screen.getByText('Enviar atividade');
    fireEvent.click(sendButton);

    expect(defaultProps.onSendActivity).toHaveBeenCalled();
  });

  it('should disable send button when questionsCount is 0', () => {
    render(<ActivityCreateHeader {...defaultProps} questionsCount={0} />);

    const sendButton = screen.getByText('Enviar atividade').closest('button');
    expect(sendButton).toBeDisabled();
  });

  it('should show saving status when isSaving is true', () => {
    render(<ActivityCreateHeader {...defaultProps} isSaving={true} />);

    expect(screen.getByText('Salvando...')).toBeInTheDocument();
  });

  it('should show no draft saved when not saving and no lastSavedAt', () => {
    render(
      <ActivityCreateHeader
        {...defaultProps}
        isSaving={false}
        lastSavedAt={null}
      />
    );

    expect(screen.getByText('Nenhum rascunho salvo')).toBeInTheDocument();
  });

  it('should show last saved time when lastSavedAt is provided', () => {
    const lastSavedAt = new Date('2024-06-15T10:30:00');

    render(
      <ActivityCreateHeader {...defaultProps} lastSavedAt={lastSavedAt} />
    );

    expect(screen.getByText(/salvo às 10:30/)).toBeInTheDocument();
  });

  it('should render description text', () => {
    render(<ActivityCreateHeader {...defaultProps} />);

    expect(
      screen.getByText(
        'Crie uma atividade customizada adicionando questões manualmente ou automaticamente.'
      )
    ).toBeInTheDocument();
  });

  it('should work without onBack callback', () => {
    const propsWithoutOnBack = {
      ...defaultProps,
      onBack: undefined,
    };

    render(<ActivityCreateHeader {...propsWithoutOnBack} />);

    const backButton = screen.getByTestId('back-button');
    expect(() => fireEvent.click(backButton)).not.toThrow();
  });
});
