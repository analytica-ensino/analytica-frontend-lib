/**
 * Types for Simulated Filters Modal
 */

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Simulated filters structure
 */
export interface SimulatedFilters {
  schoolIds: string[];
  schoolYearIds: string[];
  classIds: string[];
  studentsIds: string[];
}

/**
 * Props for SimulatedFiltersModal component
 */
export interface SimulatedFiltersModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when filters are applied */
  onApply: (filters: SimulatedFilters) => void;
  /** Initial filter values */
  initialFilters?: Partial<SimulatedFilters>;
  /** API client instance (axios-like) */
  api: ApiClient;
}

// ============================================================================
// DATA ITEM TYPES
// ============================================================================

/**
 * School item for CheckboxGroup
 */
export interface SchoolItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * School year item for CheckboxGroup (with schoolId for cascading)
 */
export interface SchoolYearItem {
  id: string;
  name: string;
  schoolId: string;
  [key: string]: unknown;
}

/**
 * Class item for CheckboxGroup (with schoolId and schoolYearId for cascading)
 */
export interface ClassItem {
  id: string;
  name: string;
  schoolId: string;
  schoolYearId: string;
  [key: string]: unknown;
}

/**
 * Student filter item
 */
export interface StudentFilterItem {
  /** Student ID (usually userInstitutionId) */
  id: string;
  name: string;
  schoolId: string;
  schoolYearId: string;
  classId: string;
  schoolName: string;
  schoolYearName: string;
  className: string;
}

/**
 * Group of students by school/year/class
 */
export interface StudentGroup {
  key: string;
  label: string;
  students: StudentFilterItem[];
}

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Generic API client interface (axios-like)
 */
export interface ApiClient {
  get: <T>(url: string) => Promise<{ data: T }>;
  post: <T>(url: string, data?: unknown) => Promise<{ data: T }>;
}

/**
 * Raw response from /auth/me endpoint
 */
export interface UserAccessDataApiResponse {
  data: {
    schools: Array<{
      id: string;
      name: string;
      institutionId: string;
    }>;
    schoolYears: Array<{
      id: string;
      name: string;
      schoolId: string;
    }>;
    classes: Array<{
      id: string;
      name: string;
      schoolId: string;
      schoolYearId: string;
    }>;
  };
}

/**
 * Raw response from /students/filters endpoint
 */
export interface StudentsFilterApiResponse {
  data: {
    students: Array<{
      id: string;
      name: string;
      userInstitutionId: string;
      school: { id: string; name: string } | null;
      schoolYear: { id: string; name: string } | null;
      class: { id: string; name: string } | null;
    }>;
  };
}

/**
 * Students filter params
 */
export interface StudentsFilterParams {
  schoolIds?: string[];
  schoolYearIds?: string[];
  classIds?: string[];
}

// ============================================================================
// HOOK TYPES
// ============================================================================

/**
 * State for useUserAccessData hook
 */
export interface UseUserAccessDataState {
  isLoading: boolean;
  error: string | null;
  schools: SchoolItem[];
  schoolYears: SchoolYearItem[];
  classes: ClassItem[];
}

/**
 * Return type for useUserAccessData hook
 */
export interface UseUserAccessDataReturn extends UseUserAccessDataState {
  refetch: () => Promise<void>;
}

/**
 * State for useStudentsFilter hook
 */
export interface UseStudentsFilterState {
  isLoading: boolean;
  error: string | null;
  students: StudentFilterItem[];
  groupedStudents: StudentGroup[];
}

/**
 * Return type for useStudentsFilter hook
 */
export interface UseStudentsFilterReturn extends UseStudentsFilterState {
  fetchStudents: (filters: StudentsFilterParams) => Promise<void>;
  clearStudents: () => void;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Props for StudentsFilterSection component
 */
export interface StudentsFilterSectionProps {
  groupedStudents: StudentGroup[];
  selectedIds: string[];
  searchQuery: string;
  isLoading: boolean;
  hasFilters: boolean;
  onSearchChange: (query: string) => void;
  onSelectionChange: (ids: string[]) => void;
}
