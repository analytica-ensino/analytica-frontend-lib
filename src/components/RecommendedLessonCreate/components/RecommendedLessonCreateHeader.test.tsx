import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RecommendedLessonCreateHeader } from './RecommendedLessonCreateHeader';
import { GoalDraftType } from '../RecommendedLessonCreate.types';
import type { RecommendedLessonData } from '../RecommendedLessonCreate.types';

// Mock the components
jest.mock('../../..', () => ({
  Button: ({
    children,
    onClick,
    size,
    iconLeft,
    disabled,
    variant,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    size?: string;
    iconLeft?: React.ReactNode;
    disabled?: boolean;
    variant?: string;
    'aria-label'?: string;
    'data-testid'?: string;
  }) => (
    <button
      onClick={onClick}
      data-size={size}
      data-variant={variant}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid={dataTestId}
    >
      {iconLeft}
      {children}
    </button>
  ),
  Text: ({
    children,
    size,
    weight,
  }: {
    children: React.ReactNode;
    size?: string;
    weight?: string;
  }) => (
    <span data-testid="text" data-size={size} data-weight={weight}>
      {children}
    </span>
  ),
}));

// Mock phosphor-react icons
jest.mock('phosphor-react', () => ({
  CaretLeft: ({ size }: { size: number }) => (
    <svg data-testid="caret-left-icon" data-size={size} />
  ),
  PaperPlaneTilt: () => <svg data-testid="paper-plane-icon" />,
}));

describe('RecommendedLessonCreateHeader', () => {
  const defaultProps = {
    draftType: GoalDraftType.RASCUNHO,
    lastSavedAt: null,
    isSaving: false,
    lessonsCount: 0,
    onSaveModel: jest.fn(),
    onSendLesson: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the header component', () => {
      render(<RecommendedLessonCreateHeader {...defaultProps} />);

      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('should render "Criar aula recomendada" when recommendedLesson is not provided', () => {
      render(<RecommendedLessonCreateHeader {...defaultProps} />);

      const textElements = screen.getAllByTestId('text');
      const titleElement = textElements.find((el) =>
        el.textContent?.includes('Criar aula recomendada')
      );
      expect(titleElement).toBeInTheDocument();
    });

    it('should render "Editar aula recomendada" when recommendedLesson is provided', () => {
      const recommendedLesson: RecommendedLessonData = {
        id: 'lesson-1',
        type: GoalDraftType.RASCUNHO,
        title: 'Test Lesson',
        filters: {},
        lessonIds: [],
      };

      render(
        <RecommendedLessonCreateHeader
          {...defaultProps}
          recommendedLesson={recommendedLesson}
        />
      );

      const textElements = screen.getAllByTestId('text');
      const titleElement = textElements.find((el) =>
        el.textContent?.includes('Editar aula recomendada')
      );
      expect(titleElement).toBeInTheDocument();
    });

    it('should render description text', () => {
      render(<RecommendedLessonCreateHeader {...defaultProps} />);

      const textElements = screen.getAllByTestId('text');
      const descriptionElement = textElements.find((el) =>
        el.textContent?.includes(
          'Crie uma aula recomendada customizada adicionando aulas do banco de aulas.'
        )
      );
      expect(descriptionElement).toBeInTheDocument();
    });

    it('should render back button with CaretLeft icon', () => {
      render(<RecommendedLessonCreateHeader {...defaultProps} />);

      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByTestId('caret-left-icon')).toBeInTheDocument();
    });

    it('should render "Salvar modelo" button', () => {
      render(<RecommendedLessonCreateHeader {...defaultProps} />);

      expect(screen.getByText('Salvar modelo')).toBeInTheDocument();
    });

    it('should render "Enviar aula" button with icon', () => {
      render(<RecommendedLessonCreateHeader {...defaultProps} />);

      expect(screen.getByText('Enviar aula')).toBeInTheDocument();
      expect(screen.getByTestId('paper-plane-icon')).toBeInTheDocument();
    });
  });

  describe('save status display', () => {
    it('should show "Nenhum rascunho salvo" when lastSavedAt is null and not saving', () => {
      render(<RecommendedLessonCreateHeader {...defaultProps} />);

      const textElements = screen.getAllByTestId('text');
      const statusElement = textElements.find((el) =>
        el.textContent?.includes('Nenhum rascunho salvo')
      );
      expect(statusElement).toBeInTheDocument();
    });

    it('should show "Salvando..." when isSaving is true', () => {
      render(
        <RecommendedLessonCreateHeader {...defaultProps} isSaving={true} />
      );

      const textElements = screen.getAllByTestId('text');
      const statusElement = textElements.find((el) =>
        el.textContent?.includes('Salvando...')
      );
      expect(statusElement).toBeInTheDocument();
    });

    it('should show save time when lastSavedAt is provided with RASCUNHO type', () => {
      const savedTime = new Date('2024-01-15T14:30:00');

      render(
        <RecommendedLessonCreateHeader
          {...defaultProps}
          lastSavedAt={savedTime}
          draftType={GoalDraftType.RASCUNHO}
        />
      );

      const textElements = screen.getAllByTestId('text');
      const statusElement = textElements.find((el) =>
        el.textContent?.includes('Rascunho salvo às 14:30')
      );
      expect(statusElement).toBeInTheDocument();
    });

    it('should show save time when lastSavedAt is provided with MODELO type', () => {
      const savedTime = new Date('2024-01-15T09:15:00');

      render(
        <RecommendedLessonCreateHeader
          {...defaultProps}
          lastSavedAt={savedTime}
          draftType={GoalDraftType.MODELO}
        />
      );

      const textElements = screen.getAllByTestId('text');
      const statusElement = textElements.find((el) =>
        el.textContent?.includes('Modelo salvo às 09:15')
      );
      expect(statusElement).toBeInTheDocument();
    });

    it('should format time with leading zeros', () => {
      const savedTime = new Date('2024-01-15T08:05:00');

      render(
        <RecommendedLessonCreateHeader
          {...defaultProps}
          lastSavedAt={savedTime}
        />
      );

      const textElements = screen.getAllByTestId('text');
      const statusElement = textElements.find((el) =>
        el.textContent?.includes('08:05')
      );
      expect(statusElement).toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    it('should call onBack when back button is clicked', () => {
      const onBack = jest.fn();
      render(
        <RecommendedLessonCreateHeader {...defaultProps} onBack={onBack} />
      );

      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('should call onSaveModel when "Salvar modelo" button is clicked', () => {
      const onSaveModel = jest.fn();
      render(
        <RecommendedLessonCreateHeader
          {...defaultProps}
          onSaveModel={onSaveModel}
        />
      );

      const saveButton = screen.getByText('Salvar modelo');
      fireEvent.click(saveButton);

      expect(onSaveModel).toHaveBeenCalledTimes(1);
    });

    it('should call onSendLesson when "Enviar aula" button is clicked', () => {
      const onSendLesson = jest.fn();
      render(
        <RecommendedLessonCreateHeader
          {...defaultProps}
          onSendLesson={onSendLesson}
          lessonsCount={1}
        />
      );

      const sendButton = screen.getByText('Enviar aula');
      fireEvent.click(sendButton);

      expect(onSendLesson).toHaveBeenCalledTimes(1);
    });
  });

  describe('send button disabled state', () => {
    it('should disable "Enviar aula" button when lessonsCount is 0', () => {
      render(
        <RecommendedLessonCreateHeader {...defaultProps} lessonsCount={0} />
      );

      const sendButton = screen.getByText('Enviar aula');
      expect(sendButton).toBeDisabled();
    });

    it('should enable "Enviar aula" button when lessonsCount is greater than 0', () => {
      render(
        <RecommendedLessonCreateHeader {...defaultProps} lessonsCount={1} />
      );

      const sendButton = screen.getByText('Enviar aula');
      expect(sendButton).not.toBeDisabled();
    });

    it('should enable "Enviar aula" button when lessonsCount is greater than 1', () => {
      render(
        <RecommendedLessonCreateHeader {...defaultProps} lessonsCount={5} />
      );

      const sendButton = screen.getByText('Enviar aula');
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('draft type labels', () => {
    it('should display "Rascunho" label for RASCUNHO type', () => {
      const savedTime = new Date('2024-01-15T10:00:00');

      render(
        <RecommendedLessonCreateHeader
          {...defaultProps}
          lastSavedAt={savedTime}
          draftType={GoalDraftType.RASCUNHO}
        />
      );

      const textElements = screen.getAllByTestId('text');
      const statusElement = textElements.find((el) =>
        el.textContent?.includes('Rascunho salvo')
      );
      expect(statusElement).toBeInTheDocument();
    });

    it('should display "Modelo" label for MODELO type', () => {
      const savedTime = new Date('2024-01-15T10:00:00');

      render(
        <RecommendedLessonCreateHeader
          {...defaultProps}
          lastSavedAt={savedTime}
          draftType={GoalDraftType.MODELO}
        />
      );

      const textElements = screen.getAllByTestId('text');
      const statusElement = textElements.find((el) =>
        el.textContent?.includes('Modelo salvo')
      );
      expect(statusElement).toBeInTheDocument();
    });
  });

  describe('optional props', () => {
    it('should render without onBack prop', () => {
      render(<RecommendedLessonCreateHeader {...defaultProps} />);

      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeInTheDocument();

      // Click should not throw error
      fireEvent.click(backButton);
    });

    it('should render without recommendedLesson prop', () => {
      render(<RecommendedLessonCreateHeader {...defaultProps} />);

      const textElements = screen.getAllByTestId('text');
      const titleElement = textElements.find((el) =>
        el.textContent?.includes('Criar aula recomendada')
      );
      expect(titleElement).toBeInTheDocument();
    });
  });

  describe('layout structure', () => {
    it('should have proper container classes', () => {
      const { container } = render(
        <RecommendedLessonCreateHeader {...defaultProps} />
      );

      const headerContainer = container.firstChild;
      expect(headerContainer).toHaveClass(
        'w-full',
        'h-[80px]',
        'flex',
        'flex-row',
        'items-center'
      );
    });

    it('should render buttons section with proper gap', () => {
      const { container } = render(
        <RecommendedLessonCreateHeader {...defaultProps} />
      );

      const buttonsSection = container.querySelector('.flex.flex-row.gap-4');
      expect(buttonsSection).toBeInTheDocument();
    });
  });
});
