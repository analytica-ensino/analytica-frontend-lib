import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AddActivityOptionModal } from './AddActivityOptionModal';
import type { ActivityOption } from './AddActivityOptionModal';

// Mock Modal component
jest.mock('../../../index', () => ({
  Modal: ({
    isOpen,
    onClose,
    title,
    size,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    size: string;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-size">{size}</div>
        <div data-testid="modal-content">{children}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
  Text: ({
    children,
    size,
    className,
  }: {
    children: React.ReactNode;
    size: string;
    className?: string;
  }) => (
    <span data-testid="text" data-size={size} className={className}>
      {children}
    </span>
  ),
  SelectionButton: ({
    icon,
    label,
    selected,
    onClick,
    disabled,
    className,
  }: {
    icon: React.ReactNode;
    label: string;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button
      data-testid={`selection-button-${label}`}
      data-selected={selected}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      <span data-testid="button-icon">{icon}</span>
      <span data-testid="button-label">{label}</span>
    </button>
  ),
}));

describe('AddActivityOptionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSelectOption: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<AddActivityOptionModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<AddActivityOptionModal {...defaultProps} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should render with correct title', () => {
      render(<AddActivityOptionModal {...defaultProps} />);

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Selecione uma opção'
      );
    });

    it('should render with correct size', () => {
      render(<AddActivityOptionModal {...defaultProps} />);

      expect(screen.getByTestId('modal-size')).toHaveTextContent('sm');
    });

    it('should render instruction text', () => {
      render(<AddActivityOptionModal {...defaultProps} />);

      expect(screen.getByTestId('text')).toHaveTextContent(
        'Como deseja adicionar a atividade?'
      );
    });

    it('should render text with correct size', () => {
      render(<AddActivityOptionModal {...defaultProps} />);

      const text = screen.getByTestId('text');
      expect(text).toHaveAttribute('data-size', 'md');
    });

    it('should render text with correct className', () => {
      render(<AddActivityOptionModal {...defaultProps} />);

      const text = screen.getByTestId('text');
      expect(text).toHaveClass('text-text-800');
    });
  });

  describe('selection buttons', () => {
    it('should render choose model button', () => {
      render(<AddActivityOptionModal {...defaultProps} />);

      expect(
        screen.getByTestId('selection-button-Escolher modelo de atividade')
      ).toBeInTheDocument();
    });

    it('should render create new button', () => {
      render(<AddActivityOptionModal {...defaultProps} />);

      expect(
        screen.getByTestId('selection-button-Criar nova atividade')
      ).toBeInTheDocument();
    });

    it('should render both buttons as not selected', () => {
      render(<AddActivityOptionModal {...defaultProps} />);

      const chooseModelButton = screen.getByTestId(
        'selection-button-Escolher modelo de atividade'
      );
      const createNewButton = screen.getByTestId(
        'selection-button-Criar nova atividade'
      );

      expect(chooseModelButton).toHaveAttribute('data-selected', 'false');
      expect(createNewButton).toHaveAttribute('data-selected', 'false');
    });

    it('should render choose model button with correct className', () => {
      render(<AddActivityOptionModal {...defaultProps} />);

      const chooseModelButton = screen.getByTestId(
        'selection-button-Escolher modelo de atividade'
      );

      expect(chooseModelButton).toHaveClass('w-full');
    });

    it('should render create new button with correct className', () => {
      render(<AddActivityOptionModal {...defaultProps} />);

      const createNewButton = screen.getByTestId(
        'selection-button-Criar nova atividade'
      );

      expect(createNewButton).toHaveClass('w-full');
    });
  });

  describe('interactions', () => {
    it('should call onSelectOption with "choose-model" when choose model button is clicked', () => {
      const onSelectOption = jest.fn();
      render(
        <AddActivityOptionModal
          {...defaultProps}
          onSelectOption={onSelectOption}
        />
      );

      const chooseModelButton = screen.getByTestId(
        'selection-button-Escolher modelo de atividade'
      );
      fireEvent.click(chooseModelButton);

      expect(onSelectOption).toHaveBeenCalledTimes(1);
      expect(onSelectOption).toHaveBeenCalledWith('choose-model');
    });

    it('should call onSelectOption with "create-new" when create new button is clicked', () => {
      const onSelectOption = jest.fn();
      render(
        <AddActivityOptionModal
          {...defaultProps}
          onSelectOption={onSelectOption}
        />
      );

      const createNewButton = screen.getByTestId(
        'selection-button-Criar nova atividade'
      );
      fireEvent.click(createNewButton);

      expect(onSelectOption).toHaveBeenCalledTimes(1);
      expect(onSelectOption).toHaveBeenCalledWith('create-new');
    });

    it('should call onClose when modal close is triggered', () => {
      const onClose = jest.fn();
      render(<AddActivityOptionModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onSelectOption when modal is closed without selection', () => {
      const onSelectOption = jest.fn();
      const onClose = jest.fn();

      render(
        <AddActivityOptionModal
          {...defaultProps}
          onSelectOption={onSelectOption}
          onClose={onClose}
        />
      );

      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onSelectOption).not.toHaveBeenCalled();
    });
  });

  describe('multiple interactions', () => {
    it('should allow clicking choose model button multiple times', () => {
      const onSelectOption = jest.fn();
      render(
        <AddActivityOptionModal
          {...defaultProps}
          onSelectOption={onSelectOption}
        />
      );

      const chooseModelButton = screen.getByTestId(
        'selection-button-Escolher modelo de atividade'
      );

      fireEvent.click(chooseModelButton);
      fireEvent.click(chooseModelButton);

      expect(onSelectOption).toHaveBeenCalledTimes(2);
      expect(onSelectOption).toHaveBeenNthCalledWith(1, 'choose-model');
      expect(onSelectOption).toHaveBeenNthCalledWith(2, 'choose-model');
    });

    it('should allow clicking create new button multiple times', () => {
      const onSelectOption = jest.fn();
      render(
        <AddActivityOptionModal
          {...defaultProps}
          onSelectOption={onSelectOption}
        />
      );

      const createNewButton = screen.getByTestId(
        'selection-button-Criar nova atividade'
      );

      fireEvent.click(createNewButton);
      fireEvent.click(createNewButton);

      expect(onSelectOption).toHaveBeenCalledTimes(2);
      expect(onSelectOption).toHaveBeenNthCalledWith(1, 'create-new');
      expect(onSelectOption).toHaveBeenNthCalledWith(2, 'create-new');
    });

    it('should allow clicking both buttons in sequence', () => {
      const onSelectOption = jest.fn();
      render(
        <AddActivityOptionModal
          {...defaultProps}
          onSelectOption={onSelectOption}
        />
      );

      const chooseModelButton = screen.getByTestId(
        'selection-button-Escolher modelo de atividade'
      );
      const createNewButton = screen.getByTestId(
        'selection-button-Criar nova atividade'
      );

      fireEvent.click(chooseModelButton);
      fireEvent.click(createNewButton);

      expect(onSelectOption).toHaveBeenCalledTimes(2);
      expect(onSelectOption).toHaveBeenNthCalledWith(1, 'choose-model');
      expect(onSelectOption).toHaveBeenNthCalledWith(2, 'create-new');
    });
  });

  describe('modal state changes', () => {
    it('should show modal when isOpen changes from false to true', () => {
      const { rerender } = render(
        <AddActivityOptionModal {...defaultProps} isOpen={false} />
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      rerender(<AddActivityOptionModal {...defaultProps} isOpen={true} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should hide modal when isOpen changes from true to false', () => {
      const { rerender } = render(
        <AddActivityOptionModal {...defaultProps} isOpen={true} />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();

      rerender(<AddActivityOptionModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  describe('type safety', () => {
    it('should accept valid ActivityOption types', () => {
      const onSelectOption = jest.fn<void, [ActivityOption]>();

      render(
        <AddActivityOptionModal
          {...defaultProps}
          onSelectOption={onSelectOption}
        />
      );

      const chooseModelButton = screen.getByTestId(
        'selection-button-Escolher modelo de atividade'
      );
      fireEvent.click(chooseModelButton);

      expect(onSelectOption).toHaveBeenCalledWith('choose-model');
    });
  });
});
