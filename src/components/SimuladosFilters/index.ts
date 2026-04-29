// Main component
export { SimuladosFiltersModal } from './SimuladosFiltersModal';
export { default } from './SimuladosFiltersModal';

// Sub-components
export { StudentsFilterSection } from './StudentsFilterSection';

// Hooks
export { useUserAccessData, useStudentsFilter } from './hooks';

// Types
export type {
  // Main types
  SimuladosFilters,
  SimuladosFiltersModalProps,
  SimuladosFiltersLabels,
  ApiClient,

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
