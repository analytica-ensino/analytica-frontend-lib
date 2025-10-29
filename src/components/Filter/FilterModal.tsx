import React from 'react';
import Modal from '../Modal/Modal';
import { CheckboxGroup } from '../CheckBoxGroup/CheckBoxGroup';
import Button from '../Button/Button';
import type { FilterConfig } from './useTableFilter';

export type FilterModalProps = {
  /**
   * Controls modal visibility
   */
  isOpen: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Filter configurations with categories
   */
  filterConfigs: FilterConfig[];

  /**
   * Callback when filters change (temporary, before applying)
   */
  onFiltersChange: (configs: FilterConfig[]) => void;

  /**
   * Callback when "Aplicar" button is clicked
   */
  onApply: () => void;

  /**
   * Callback when "Limpar filtros" button is clicked
   */
  onClear: () => void;

  /**
   * Modal title
   * @default "Filtros"
   */
  title?: string;

  /**
   * Modal size
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Apply button label
   * @default "Aplicar"
   */
  applyLabel?: string;

  /**
   * Clear button label
   * @default "Limpar filtros"
   */
  clearLabel?: string;
};

/**
 * FilterModal component - A modal for table filtering with CheckboxGroup
 *
 * Integrates Modal, CheckboxGroup, and Button components to create a
 * complete filtering interface. Works with useTableFilter hook for URL synchronization.
 *
 * @example
 * ```tsx
 * const { filterConfigs, updateFilters, applyFilters, clearFilters } = useTableFilter(
 *   initialConfigs,
 *   { syncWithUrl: true }
 * );
 *
 * <FilterModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   filterConfigs={filterConfigs}
 *   onFiltersChange={updateFilters}
 *   onApply={() => {
 *     applyFilters();
 *     setIsOpen(false);
 *   }}
 *   onClear={clearFilters}
 * />
 * ```
 */
export const FilterModal = ({
  isOpen,
  onClose,
  filterConfigs,
  onFiltersChange,
  onApply,
  onClear,
  title = 'Filtros',
  size = 'md',
  applyLabel = 'Aplicar',
  clearLabel = 'Limpar filtros',
}: FilterModalProps) => {
  const handleCategoryChange = (
    configIndex: number,
    updatedCategories: (typeof filterConfigs)[0]['categories']
  ) => {
    const newConfigs = [...filterConfigs];
    newConfigs[configIndex] = {
      ...newConfigs[configIndex],
      categories: updatedCategories,
    };
    onFiltersChange(newConfigs);
  };

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <div className="flex gap-3 justify-end w-full">
          <Button variant="outline" onClick={handleClear}>
            {clearLabel}
          </Button>
          <Button onClick={handleApply}>{applyLabel}</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {filterConfigs.map((config, index) => (
          <div key={config.key} className="flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex items-center gap-2 text-text-400 text-sm font-medium uppercase">
              {config.key === 'academic' && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-text-400"
                >
                  <path
                    d="M8 2L2 5.33333L8 8.66667L14 5.33333L8 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 10.6667L8 14L14 10.6667"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 8L8 11.3333L14 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {config.key === 'content' && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-text-400"
                >
                  <path
                    d="M3.33333 2H12.6667C13.403 2 14 2.59695 14 3.33333V12.6667C14 13.403 13.403 14 12.6667 14H3.33333C2.59695 14 2 13.403 2 12.6667V3.33333C2 2.59695 2.59695 2 3.33333 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 6H14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 2V14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span>{config.label}</span>
            </div>

            {/* CheckboxGroup */}
            <CheckboxGroup
              categories={config.categories}
              onCategoriesChange={(updatedCategories) =>
                handleCategoryChange(index, updatedCategories)
              }
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};
