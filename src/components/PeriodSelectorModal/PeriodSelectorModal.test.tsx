import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PeriodSelectorModal,
  DEFAULT_PERIOD_SELECTION,
  getPeriodSelectionLabel,
  type PeriodSelection,
} from './PeriodSelectorModal';

describe('PeriodSelectorModal', () => {
  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByText('Selecionar período')).toBeInTheDocument();
    });

    it('should not render modal content when isOpen is false', () => {
      render(
        <PeriodSelectorModal
          isOpen={false}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      expect(screen.queryByText('Selecionar período')).not.toBeInTheDocument();
    });

    it('should render fixed period selector label', () => {
      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByText('Selecionar período fixo')).toBeInTheDocument();
    });

    it('should render custom date range section', () => {
      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByText('Escolher data')).toBeInTheDocument();
      expect(screen.getByText('Data inicial')).toBeInTheDocument();
      expect(screen.getByText('Data final')).toBeInTheDocument();
    });

    it('should render divider with "Ou" text', () => {
      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByText('Ou')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByText('Aplicar')).toBeInTheDocument();
    });
  });

  describe('Fixed period selection', () => {
    it('should initialize with current fixed period selection', () => {
      const currentSelection: PeriodSelection = {
        type: 'fixed',
        period: '7_DAYS',
      };

      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
          currentSelection={currentSelection}
        />
      );

      expect(screen.getByText('7 dias')).toBeInTheDocument();
    });

    it('should apply button be disabled when no selection is made', () => {
      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
          currentSelection={{ type: 'custom' }}
        />
      );

      const applyButton = screen.getByText('Aplicar');
      expect(applyButton).toBeDisabled();
    });
  });

  describe('Custom date range', () => {
    it('should enable apply button when both dates are filled', () => {
      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
          currentSelection={{
            type: 'custom',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          }}
        />
      );

      const applyButton = screen.getByText('Aplicar');
      expect(applyButton).not.toBeDisabled();
    });

    it('should show error when end date is before start date', () => {
      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
          currentSelection={{
            type: 'custom',
            startDate: '2024-01-31',
            endDate: '2024-01-01',
          }}
        />
      );

      const applyButton = screen.getByText('Aplicar');
      fireEvent.click(applyButton);

      expect(
        screen.getByText('Data final deve ser maior ou igual à data inicial')
      ).toBeInTheDocument();
    });

    it('should call onApply with custom dates when valid', () => {
      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
          currentSelection={{
            type: 'custom',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          }}
        />
      );

      const applyButton = screen.getByText('Aplicar');
      fireEvent.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledWith({
        type: 'custom',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Actions', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      fireEvent.click(screen.getByText('Cancelar'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset to default selection when clear button is clicked', () => {
      render(
        <PeriodSelectorModal
          isOpen={true}
          onClose={mockOnClose}
          onApply={mockOnApply}
          currentSelection={{
            type: 'custom',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          }}
        />
      );

      fireEvent.click(screen.getByText('Limpar filtros'));

      expect(mockOnApply).toHaveBeenCalledWith(DEFAULT_PERIOD_SELECTION);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('getPeriodSelectionLabel', () => {
    it('should return label for fixed period', () => {
      const selection: PeriodSelection = {
        type: 'fixed',
        period: '7_DAYS',
      };

      expect(getPeriodSelectionLabel(selection)).toBe('7 dias');
    });

    it('should return formatted date range for custom period', () => {
      const selection: PeriodSelection = {
        type: 'custom',
        startDate: '2024-01-15',
        endDate: '2024-01-31',
      };

      expect(getPeriodSelectionLabel(selection)).toBe(
        '15/01/2024 - 31/01/2024'
      );
    });

    it('should return default label when fixed period is undefined', () => {
      const selection: PeriodSelection = {
        type: 'fixed',
      };

      expect(getPeriodSelectionLabel(selection)).toBe('1 ano');
    });

    it('should return default label for custom period without dates', () => {
      const selection: PeriodSelection = {
        type: 'custom',
      };

      expect(getPeriodSelectionLabel(selection)).toBe('1 ano');
    });
  });

  describe('DEFAULT_PERIOD_SELECTION', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_PERIOD_SELECTION).toEqual({
        type: 'fixed',
        period: '1_YEAR',
      });
    });
  });
});
