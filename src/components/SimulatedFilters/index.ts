// Main component
export { SimulatedFiltersModal } from './SimulatedFiltersModal';
export { default } from './SimulatedFiltersModal';

// Sub-components
export { StudentsFilterSection } from './StudentsFilterSection';

// Hooks
export { useUserAccessData, useStudentsFilter } from './hooks';

// Types
export type {
  // Main types
  SimulatedFilters,
  SimulatedFiltersModalProps,

  // Data item types
  SchoolItem,
  SchoolYearItem,
  ClassItem,
  StudentFilterItem,
  StudentGroup,

  // API response types
  UserAccessDataApiResponse,
  StudentsFilterApiResponse,
  StudentsFilterParams,

  // Hook types
  UseUserAccessDataState,
  UseUserAccessDataReturn,
  UseStudentsFilterState,
  UseStudentsFilterReturn,

  // Component props
  StudentsFilterSectionProps,
} from './types';
