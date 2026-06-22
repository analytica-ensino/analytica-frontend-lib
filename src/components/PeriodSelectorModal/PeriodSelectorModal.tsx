import { useState, useEffect, useCallback } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import { cn } from '../../utils/utils';
import {
  PERIOD_TABS,
  type StudentsHighlightPeriod,
} from '../../hooks/useStudentsHighlight';

/**
 * Period selection type - either a fixed period or custom date range
 */
export interface PeriodSelection {
  /** Selection type: 'fixed' for predefined periods, 'custom' for date range */
  type: 'fixed' | 'custom';
  /** Selected period when type is 'fixed' */
  period?: StudentsHighlightPeriod;
  /** Start date when type is 'custom' (ISO date string YYYY-MM-DD) */
  startDate?: string;
  /** End date when type is 'custom' (ISO date string YYYY-MM-DD) */
  endDate?: string;
}

/**
 * Default period selection (1 year)
 */
export const DEFAULT_PERIOD_SELECTION: PeriodSelection = {
  type: 'fixed',
  period: '1_YEAR',
};

interface PeriodSelectorModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when period selection is applied */
  onApply: (selection: PeriodSelection) => void;
  /** Current period selection */
  currentSelection?: PeriodSelection;
}

/**
 * Format date to display format (DD/MM/YYYY)
 */
function formatDateDisplay(isoDate: string | undefined): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Parse display date (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
 */
function parseDisplayDate(displayDate: string): string {
  const [day, month, year] = displayDate.split('/');
  if (!day || !month || !year) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Get display label for a period selection
 */
export function getPeriodSelectionLabel(selection: PeriodSelection): string {
  if (selection.type === 'fixed') {
    const tab = PERIOD_TABS.find((t) => t.value === selection.period);
    return tab?.label ?? '1 ano';
  }
  if (selection.startDate && selection.endDate) {
    return `${formatDateDisplay(selection.startDate)} - ${formatDateDisplay(selection.endDate)}`;
  }
  return '1 ano';
}

/**
 * PeriodSelectorModal - Modal for selecting report period
 *
 * Allows selecting either a fixed period (7 days, 1 month, etc.) or
 * a custom date range with start and end dates.
 *
 * @example
 * ```tsx
 * <PeriodSelectorModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onApply={(selection) => setPeriodSelection(selection)}
 *   currentSelection={periodSelection}
 * />
 * ```
 */
export function PeriodSelectorModal({
  isOpen,
  onClose,
  onApply,
  currentSelection = DEFAULT_PERIOD_SELECTION,
}: PeriodSelectorModalProps) {
  // Local state for the form
  const [selectedPeriod, setSelectedPeriod] = useState<
    StudentsHighlightPeriod | ''
  >('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentSelection.type === 'fixed') {
        setSelectedPeriod(currentSelection.period ?? '1_YEAR');
        setStartDate('');
        setEndDate('');
      } else {
        setSelectedPeriod('');
        setStartDate(currentSelection.startDate ?? '');
        setEndDate(currentSelection.endDate ?? '');
      }
      setDateError(null);
    }
  }, [isOpen, currentSelection]);

  // Handle fixed period selection
  const handlePeriodChange = useCallback((value: string) => {
    setSelectedPeriod(value as StudentsHighlightPeriod);
    // Clear custom dates when selecting fixed period
    setStartDate('');
    setEndDate('');
    setDateError(null);
  }, []);

  // Handle custom date changes
  const handleStartDateChange = useCallback((value: string) => {
    setStartDate(value);
    // Clear fixed period when entering custom dates
    setSelectedPeriod('');
    setDateError(null);
  }, []);

  const handleEndDateChange = useCallback((value: string) => {
    setEndDate(value);
    // Clear fixed period when entering custom dates
    setSelectedPeriod('');
    setDateError(null);
  }, []);

  // Validate dates
  const validateDates = useCallback((): boolean => {
    if (!startDate || !endDate) {
      return false;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setDateError('Data final deve ser maior ou igual à data inicial');
      return false;
    }
    return true;
  }, [startDate, endDate]);

  // Handle apply
  const handleApply = useCallback(() => {
    if (selectedPeriod) {
      // Fixed period selected
      onApply({
        type: 'fixed',
        period: selectedPeriod,
      });
      onClose();
    } else if (startDate && endDate) {
      // Custom dates selected
      if (validateDates()) {
        onApply({
          type: 'custom',
          startDate,
          endDate,
        });
        onClose();
      }
    }
  }, [selectedPeriod, startDate, endDate, onApply, onClose, validateDates]);

  // Handle clear
  const handleClear = useCallback(() => {
    onApply(DEFAULT_PERIOD_SELECTION);
    onClose();
  }, [onApply, onClose]);

  // Check if apply button should be enabled
  const canApply = selectedPeriod || (startDate && endDate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar período"
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="link" onClick={handleClear}>
            Limpar filtros
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleApply} disabled={!canApply}>
            Aplicar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Fixed period selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-700">
            Selecionar período fixo
          </label>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um período" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_TABS.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border-200" />
          <span className="text-sm text-text-400">Ou</span>
          <div className="flex-1 h-px bg-border-200" />
        </div>

        {/* Custom date range */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-700">
            Escolher data
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-500">Data inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={cn(
                  'w-full h-10 px-3 rounded-lg border text-sm',
                  'border-border-300 text-text-700',
                  'focus:outline-none focus:ring-2 focus:ring-indicator-info focus:border-transparent',
                  'placeholder:text-text-400'
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-500">Data final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className={cn(
                  'w-full h-10 px-3 rounded-lg border text-sm',
                  'border-border-300 text-text-700',
                  'focus:outline-none focus:ring-2 focus:ring-indicator-info focus:border-transparent',
                  'placeholder:text-text-400'
                )}
              />
            </div>
          </div>
          {dateError && (
            <p className="text-sm text-indicator-error mt-1">{dateError}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default PeriodSelectorModal;
